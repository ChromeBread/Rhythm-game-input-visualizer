let fps = 60;
let greenNumber = 300; // デフォルト300（5秒）
let noteSpeed = greenNumber * 0.016666 / 10; // 秒数
let longNotesEnabled = true;
let buttonAssignments = {
    0: 'a', 1: 's', 2: 'd', 3: 'f', 4: 'g', 5: 'h', 6: 'j', 7: 'k', 8: 'l', 9: ';', 
    10: 'q', 11: 'w', 12: 'e', 13: 'r', 14: 't'
};
let laneColors = {
    scratch: '#000000',
    white: '#808080',
    black: '#000000'
};
let pressedButtons = new Map();
let longNotes = new Map();

// レーン初期化
const lanes = document.querySelectorAll('.lane');
const noteColors = ['white', 'blue', 'white', 'blue', 'white', 'blue', 'white', 'blue', 'white', 'blue', 'white', 'blue', 'white', 'blue', 'red'];

// ボタン割り当てUI生成
function initButtonAssignments() {
    const container = document.getElementById('button-assignments');
    container.innerHTML = '';
    lanes.forEach((lane, index) => {
        const label = document.createElement('label');
        label.textContent = `Lane ${index + 1}: `;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = buttonAssignments[index];
        input.onchange = () => {
            buttonAssignments[index] = input.value;
            saveConfig();
        };
        label.appendChild(input);
        container.appendChild(label);
    });
}

// FPS設定
function setFPS(value) {
    fps = value;
    saveConfig();
}

// 緑数字変更
document.getElementById('green-number').addEventListener('input', (e) => {
    greenNumber = parseInt(e.target.value);
    noteSpeed = greenNumber * 0.016666 / 10;
    document.getElementById('green-slider').value = greenNumber;
    saveConfig();
});
document.getElementById('green-slider').addEventListener('input', (e) => {
    greenNumber = parseInt(e.target.value);
    noteSpeed = greenNumber * 0.016666 / 10;
    document.getElementById('green-number').value = greenNumber;
    saveConfig();
});

// ロングノーツ切り替え
document.getElementById('long-notes').addEventListener('change', (e) => {
    longNotesEnabled = e.target.checked;
    saveConfig();
});

// カラー変更
document.getElementById('scratch-color').addEventListener('input', (e) => {
    laneColors.scratch = e.target.value;
    updateLaneColors();
    saveConfig();
});
document.getElementById('white-key-color').addEventListener('input', (e) => {
    laneColors.white = e.target.value;
    updateLaneColors();
    saveConfig();
});
document.getElementById('black-key-color').addEventListener('input', (e) => {
    laneColors.black = e.target.value;
    updateLaneColors();
    saveConfig();
});

function updateLaneColors() {
    document.querySelectorAll('.scratch').forEach(lane => lane.style.backgroundColor = laneColors.scratch);
    document.querySelectorAll('.key.white').forEach(lane => lane.style.backgroundColor = laneColors.white);
    document.querySelectorAll('.key.black').forEach(lane => lane.style.backgroundColor = laneColors.black);
}

// ノーツ生成
function createNote(laneIndex) {
    const lane = lanes[laneIndex];
    const note = document.createElement('div');
    note.classList.add('note', noteColors[laneIndex]);
    lane.appendChild(note);
    const duration = noteSpeed * 1000; // ms
    note.style.transitionDuration = `${duration}ms`;
    note.style.transform = `translateY(${lane.clientHeight}px)`;
    
    setTimeout(() => {
        note.remove();
    }, duration);
}

// ロングノーツ開始
function startLongNote(laneIndex) {
    if (!longNotesEnabled) return;
    const lane = lanes[laneIndex];
    const note = document.createElement('div');
    note.classList.add('long-note', noteColors[laneIndex]);
    note.style.top = '0';
    lane.appendChild(note);
    longNotes.set(laneIndex, note);
}

// ロングノーツ更新
function updateLongNote(laneIndex) {
    const note = longNotes.get(laneIndex);
    if (note) {
        note.style.height = `${parseFloat(note.style.height || 0) + (600 / fps)}px`;
    }
}

// ロングノーツ終了
function endLongNote(laneIndex) {
    const note = longNotes.get(laneIndex);
    if (note) {
        const duration = noteSpeed * 1000;
        note.style.transition = `transform ${duration}ms linear`;
        note.style.transform = `translateY(${lanes[laneIndex].clientHeight}px)`;
        setTimeout(() => note.remove(), duration);
        longNotes.delete(laneIndex);
    }
}

// キー入力処理
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    for (let i = 0; i < lanes.length; i++) {
        if (buttonAssignments[i] === key && !pressedButtons.has(i)) {
            pressedButtons.set(i, Date.now());
            createNote(i);
            startLongNote(i);
        }
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    for (let i = 0; i < lanes.length; i++) {
        if (buttonAssignments[i] === key) {
            const pressTime = Date.now() - pressedButtons.get(i);
            if (pressTime >= 67) { // 0.067秒
                endLongNote(i);
            }
            pressedButtons.delete(i);
        }
    }
});

// ロングノーツ更新ループ
function update() {
    for (let [laneIndex] of pressedButtons) {
        if (Date.now() - pressedButtons.get(laneIndex) >= 67) {
            updateLongNote(laneIndex);
        }
    }
    setTimeout(update, 1000 / fps);
}

// 設定保存
function saveConfig() {
    const config = {
        fps,
        greenNumber,
        longNotesEnabled,
        buttonAssignments,
        laneColors
    };
    localStorage.setItem('iidx-config', JSON.stringify(config));
}

// 設定読み込み
function loadConfig() {
    const config = JSON.parse(localStorage.getItem('iidx-config'));
    if (config) {
        fps = config.fps || 60;
        greenNumber = config.greenNumber || 300;
        noteSpeed = greenNumber * 0.016666 / 10;
        longNotesEnabled = config.longNotesEnabled !== undefined ? config.longNotesEnabled : true;
        buttonAssignments = config.buttonAssignments || buttonAssignments;
        laneColors = config.laneColors || laneColors;
        document.getElementById('green-number').value = greenNumber;
        document.getElementById('green-slider').value = greenNumber;
        document.getElementById('long-notes').checked = longNotesEnabled;
        document.getElementById('scratch-color').value = laneColors.scratch;
        document.getElementById('white-key-color').value = laneColors.white;
        document.getElementById('black-key-color').value = laneColors.black;
        updateLaneColors();
        initButtonAssignments();
    }
}

// 設定エクスポート
function exportConfig() {
    const config = {
        fps,
        greenNumber,
        longNotesEnabled,
        buttonAssignments,
        laneColors
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'iidx-config.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// 設定インポート
document.getElementById('import-config').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const config = JSON.parse(event.target.result);
            fps = config.fps || 60;
            greenNumber = config.greenNumber || 300;
            noteSpeed = greenNumber * 0.016666 / 10;
            longNotesEnabled = config.longNotesEnabled !== undefined ? config.longNotesEnabled : true;
            buttonAssignments = config.buttonAssignments || buttonAssignments;
            laneColors = config.laneColors || laneColors;
            document.getElementById('green-number').value = greenNumber;
            document.getElementById('green-slider').value = greenNumber;
            document.getElementById('long-notes').checked = longNotesEnabled;
            document.getElementById('scratch-color').value = laneColors.scratch;
            document.getElementById('white-key-color').value = laneColors.white;
            document.getElementById('black-key-color').value = laneColors.black;
            updateLaneColors();
            initButtonAssignments();
            saveConfig();
        };
        reader.readAsText(file);
    }
});

// リセット
function resetConfig() {
    if (confirm('Reset to default settings?')) {
        fps = 60;
        greenNumber = 300;
        noteSpeed = greenNumber * 0.016666 / 10;
        longNotesEnabled = true;
        buttonAssignments = {
            0: 'a', 1: 's', 2: 'd', 3: 'f', 4: 'g', 5: 'h', 6: 'j', 7: 'k', 8: 'l', 9: ';', 
            10: 'q', 11: 'w', 12: 'e', 13: 'r', 14: 't'
        };
        laneColors = {
            scratch: '#000000',
            white: '#808080',
            black: '#000000'
        };
        document.getElementById('green-number').value = greenNumber;
        document.getElementById('green-slider').value = greenNumber;
        document.getElementById('long-notes').checked = longNotesEnabled;
        document.getElementById('scratch-color').value = laneColors.scratch;
        document.getElementById('white-key-color').value = laneColors.white;
        document.getElementById('black-key-color').value = laneColors.black;
        updateLaneColors();
        initButtonAssignments();
        saveConfig();
    }
}

// 初期化
initButtonAssignments();
loadConfig();
update();

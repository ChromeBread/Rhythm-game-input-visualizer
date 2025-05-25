// 初期設定
let fps = 60;
let greenNumber = 300; // デフォルト緑数字
let frameTime = 1000 / fps;
let noteSpeed = (greenNumber * 0.01666) / 10; // 秒数変換
let buttonAssignments = Array(18).fill(null); // 18レーン分のボタン割り当て
let noteStates = Array(18).fill({ active: false, isLong: false, startTime: 0 });
let notes = [];
const laneColors = {
    scratch: '#000000',
    whiteKey: '#808080',
    blackKey: '#000000'
};

// Canvas設定
const canvas = document.getElementById('noteCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Gamepad APIでジョイスティック入力監視
function handleGamepad() {
    const gamepads = navigator.getGamepads();
    gamepads.forEach((gamepad) => {
        if (!gamepad) return;
        gamepad.buttons.forEach((button, index) => {
            const laneIndex = buttonAssignments.indexOf(index);
            if (laneIndex === -1) return;

            if (button.pressed && !noteStates[laneIndex].active) {
                noteStates[laneIndex].active = true;
                noteStates[laneIndex].startTime = Date.now();
                notes.push({
                    lane: laneIndex,
                    y: 0,
                    isLong: false,
                    startTime: Date.now()
                });
            } else if (button.pressed && noteStates[laneIndex].active) {
                const duration = (Date.now() - noteStates[laneIndex].startTime) / 1000;
                if (duration > 0.067) {
                    noteStates[laneIndex].isLong = true;
                }
            } else if (!button.pressed && noteStates[laneIndex].active) {
                noteStates[laneIndex].active = false;
                noteStates[laneIndex].isLong = false;
            }
        });
    });
}

// ノーツ描画
function drawNotes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const laneWidth = canvas.width / 18;
    notes = notes.filter(note => note.y < canvas.height);

    notes.forEach(note => {
        const laneX = note.lane * laneWidth;
        ctx.fillStyle = note.lane < 2 || note.lane >= 16 ? '#FF0000' : (note.lane % 2 ? '#00FFFF' : '#FFFFFF');
        if (note.isLong) {
            const height = (Date.now() - note.startTime) * noteSpeed * canvas.height;
            ctx.fillRect(laneX, note.y, laneWidth, height);
        } else {
            ctx.fillRect(laneX, note.y, laneWidth, 10);
        }
        note.y += noteSpeed * canvas.height / (1000 / frameTime);
    });
}

// アニメーションループ
function animate() {
    handleGamepad();
    drawNotes();
    setTimeout(() => requestAnimationFrame(animate), frameTime);
}
requestAnimationFrame(animate);

// FPS切り替え
function setFPS(value) {
    fps = value;
    frameTime = 1000 / fps;
}

// 緑数字変更
document.getElementById('greenNumber').addEventListener('input', (e) => {
    greenNumber = e.target.value;
    noteSpeed = (greenNumber * 0.01666) / 10;
    document.getElementById('greenNumberInput').value = greenNumber;
});
document.getElementById('greenNumberInput').addEventListener('input', (e) => {
    greenNumber = e.target.value;
    noteSpeed = (greenNumber * 0.01666) / 10;
    document.getElementById('greenNumber').value = greenNumber;
});

// 設定保存
function saveSettings() {
    const settings = {
        laneColors,
        buttonAssignments,
        greenNumber,
        fps
    };
    localStorage.setItem('iidxVisualizerSettings', JSON.stringify(settings));
}

// 設定エクスポート
function exportSettings() {
    const settings = localStorage.getItem('iidxVisualizerSettings');
    const blob = new Blob([settings], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'iidx_settings.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// 設定インポート
document.getElementById('importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        localStorage.setItem('iidxVisualizerSettings', event.target.result);
        loadSettings();
    };
    reader.readAsText(file);
});

// リセット
function resetSettings() {
    if (confirm('設定をリセットしますか？')) {
        localStorage.removeItem('iidxVisualizerSettings');
        location.reload();
    }
}

// 初期ロード
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('iidxVisualizerSettings') || '{}');
    if (settings.laneColors) Object.assign(laneColors, settings.laneColors);
    if (settings.buttonAssignments) buttonAssignments = settings.buttonAssignments;
    if (settings.greenNumber) greenNumber = settings.greenNumber;
    if (settings.fps) setFPS(settings.fps);
}

// レーンカラー変更
document.getElementById('scratchColor').addEventListener('input', (e) => {
    laneColors.scratch = e.target.value;
    document.querySelectorAll('.scratch').forEach(el => el.style.backgroundColor = e.target.value);
});
document.getElementById('whiteKeyColor').addEventListener('input', (e) => {
    laneColors.whiteKey = e.target.value;
    document.querySelectorAll('.key.white').forEach(el => el.style.backgroundColor = e.target.value);
});
document.getElementById('blackKeyColor').addEventListener('input', (e) => {
    laneColors.blackKey = e.target.value;
    document.querySelectorAll('.key.black').forEach(el => el.style.backgroundColor = e.target.value);
});

// ボタン割り当て（簡易実装）
document.querySelectorAll('.lane-label').forEach((input, index) => {
    input.addEventListener('change', () => {
        // ボタン割り当てはGamepad APIのボタンインデックスを入力で指定
        buttonAssignments[index] = parseInt(input.dataset.buttonIndex || '0');
        saveSettings();
    });
});

// 初期化
loadSettings();

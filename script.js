let fps = 60;
let greenNumber = 300;
let noteDuration = (greenNumber * 0.016666) / 10; // 秒数
let buttonAssignments = Array(18).fill().map((_, i) => i); // ボタン0-17をレーン0-17に
let lastPressTimes = Array(18).fill(0);
let activeNotes = Array(18).fill(null); // アクティブなノーツを追跡
const lanes = document.querySelectorAll('.lane');
const notes = document.querySelectorAll('.note');

// フレームレート設定
function setFPS(value) {
    fps = value;
    document.querySelectorAll('#controls button').forEach(btn => {
        btn.disabled = btn.textContent === `${value}fps`;
    });
    updateNoteSpeed();
}

// ノーツ速度更新
function updateNoteSpeed() {
    noteDuration = (greenNumber * 0.016666) / 10;
    lanes.forEach((lane, index) => {
        if (activeNotes[index]) {
            activeNotes[index].style.transitionDuration = `${noteDuration}s`;
        }
    });
}

// 緑数字更新
function updateGreenNumber(value) {
    greenNumber = Math.max(100, Math.min(600, value));
    document.getElementById('green-number').value = greenNumber;
    document.getElementById('green-number-input').value = greenNumber;
    updateNoteSpeed();
    saveSettings();
}

// ボタン割り当てUI生成
function initButtonAssignments() {
    const container = document.getElementById('button-assignments');
    container.innerHTML = '';
    lanes.forEach((_, i) => {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'assignment-input';
        input.value = buttonAssignments[i];
        input.min = 0;
        input.max = 255; // 一般的なジョイスティックボタンの最大値
        input.dataset.lane = i;
        input.addEventListener('change', (e) => {
            buttonAssignments[i] = parseInt(e.target.value);
            saveSettings();
        });
        container.appendChild(input);
    });
}

// ノーツ生成
function createNote(laneIndex) {
    if (activeNotes[laneIndex]) return; // ノーツ重複防止
    const lane = lanes[laneIndex];
    const note = document.createElement('div');
    note.className = 'note';
    note.classList.add(
        laneIndex < 2 || laneIndex >= 16 ? 'scratch' :
        (laneIndex - 2) % 2 === 0 ? 'white' : 'blue'
    );
    note.style.transitionDuration = `${noteDuration}s`;
    lane.appendChild(note);
    activeNotes[laneIndex] = note;
    setTimeout(() => {
        note.style.top = '100%';
        setTimeout(() => {
            if (activeNotes[laneIndex] === note) {
                note.remove();
                activeNotes[laneIndex] = null;
            }
        }, noteDuration * 1000);
    }, 0);
}

// ロングノーツ更新
function updateNoteToLong(laneIndex, duration) {
    if (!activeNotes[laneIndex]) return;
    const note = activeNotes[laneIndex];
    const height = Math.min((duration / noteDuration) * 20, lane.clientHeight);
    note.style.height = `${height}px`;
}

// Gamepad入力処理
function handleGamepad() {
    const gamepads = navigator.getGamepads();
    gamepads.forEach((gamepad) => {
        if (!gamepad) return;
        gamepad.buttons.forEach((button, btnIndex) => {
            const laneIndex = buttonAssignments.indexOf(btnIndex);
            if (laneIndex === -1) return;
            const now = Date.now();
            if (button.pressed && lastPressTimes[laneIndex] === 0) {
                lastPressTimes[laneIndex] = now;
                createNote(laneIndex);
            } else if (!button.pressed && lastPressTimes[laneIndex] !== 0) {
                const pressDuration = (now - lastPressTimes[laneIndex]) / 1000;
                if (pressDuration >= 0.067) {
                    updateNoteToLong(laneIndex, pressDuration);
                }
                lastPressTimes[laneIndex] = 0;
            }
        });
    });
    requestAnimationFrame(handleGamepad);
}

// 設定保存
function saveSettings() {
    const settings = {
        fps,
        greenNumber,
        buttonAssignments,
        scratchColor: document.getElementById('scratch-color').value,
        whiteKeyColor: document.getElementById('white-key-color').value,
        blackKeyColor: document.getElementById('black-key-color').value,
        laneLabels: Array.from(document.querySelectorAll('.lane-label')).map(input => input.value)
    };
    localStorage.setItem('iidx-visualizer-settings', JSON.stringify(settings));
}

// 設定読み込み
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('iidx-visualizer-settings'));
    if (settings) {
        setFPS(settings.fps);
        updateGreenNumber(settings.greenNumber);
        buttonAssignments = settings.buttonAssignments;
        document.getElementById('scratch-color').value = settings.scratchColor;
        document.getElementById('white-key-color').value = settings.whiteKeyColor;
        document.getElementById('black-key-color').value = settings.blackKeyColor;
        document.querySelectorAll('.lane-label').forEach((input, i) => {
            input.value = settings.laneLabels[i] || (i < 2 ? `SCR${i + 1}` : i >= 16 ? `SCR${i - 13}` : `KEY${i - 1}`);
        });
        updateLaneColors();
        initButtonAssignments();
    }
}

// カラー更新
function updateLaneColors() {
    document.querySelectorAll('.scratch').forEach(lane => {
        lane.style.backgroundColor = document.getElementById('scratch-color').value;
    });
    document.querySelectorAll('.key.white').forEach(lane => {
        lane.style.backgroundColor = document.getElementById('white-key-color').value;
    });
    document.querySelectorAll('.key.black').forEach(lane => {
        lane.style.backgroundColor = document.getElementById('black-key-color').value;
    });
}

// エクスポート
function exportSettings() {
    const settings = {
        fps,
        greenNumber,
        buttonAssignments,
        scratchColor: document.getElementById('scratch-color').value,
        whiteKeyColor: document.getElementById('white-key-color').value,
        blackKeyColor: document.getElementById('black-key-color').value,
        laneLabels: Array.from(document.querySelectorAll('.lane-label')).map(input => input.value)
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'iidx-visualizer-settings.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// インポート
function importSettings() {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const settings = JSON.parse(reader.result);
            setFPS(settings.fps);
            updateGreenNumber(settings.greenNumber);
            buttonAssignments = settings.buttonAssignments;
            document.getElementById('scratch-color').value = settings.scratchColor;
            document.getElementById('white-key-color').value = settings.whiteKeyColor;
            document.getElementById('black-key-color').value = settings.blackKeyColor;
            document.querySelectorAll('.lane-label').forEach((input, i) => {
                input.value = settings.laneLabels[i] || (i < 2 ? `SCR${i + 1}` : i >= 16 ? `SCR${i - 13}` : `KEY${i - 1}`);
            });
            updateLaneColors();
            initButtonAssignments();
            saveSettings();
        } catch (e) {
            alert('インポートに失敗しました。ファイル形式を確認してください。');
        }
    };
    reader.readAsText(file);
}

// リセット
function resetSettings() {
    if (confirm('すべての設定をデフォルトにリセットしますか？')) {
        setFPS(60);
        updateGreenNumber(300);
        buttonAssignments = Array(18).fill().map((_, i) => i);
        document.getElementById('scratch-color').value = '#000000';
        document.getElementById('white-key-color').value = '#808080';
        document.getElementById('black-key-color').value = '#000000';
        document.querySelectorAll('.lane-label').forEach((input, i) => {
            input.value = i < 2 ? `SCR${i + 1}` : i >= 16 ? `SCR${i - 13}` : `KEY${i - 1}`;
        });
        updateLaneColors();
        initButtonAssignments();
        saveSettings();
    }
}

// イベントリスナー
document.getElementById('green-number').addEventListener('input', (e) => updateGreenNumber(e.target.value));
document.getElementById('green-number-input').addEventListener('input', (e) => updateGreenNumber(e.target.value));
document.getElementById('scratch-color').addEventListener('change', () => {
    updateLaneColors();
    saveSettings();
});
document.getElementById('white-key-color').addEventListener('change', () => {
    updateLaneColors();
    saveSettings();
});
document.getElementById('black-key-color').addEventListener('change', () => {
    updateLaneColors();
    saveSettings();
});
document.querySelectorAll('.lane-label').forEach(input => {
    input.addEventListener('change', saveSettings);
});

// 初期化
initButtonAssignments();
loadSettings();
requestAnimationFrame(handleGamepad);

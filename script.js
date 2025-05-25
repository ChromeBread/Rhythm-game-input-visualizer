let fps = 60;
let greenNumber = 300; // デフォルト緑数字
let frameTime = 1000 / fps;
let noteSpeed = (600 / (greenNumber * 0.016666 / 10)) / fps; // ピクセル/フレーム
let buttonStates = {};
let longNoteStarts = {};
let buttonAssignments = Array(11).fill().map((_, i) => i); // デフォルト割り当て
let settings = {
    scratchColor: '#000000',
    whiteKeyColor: '#808080',
    blackKeyColor: '#000000',
    scratchNoteColor: '#FF0000',
    whiteNoteColor: '#FFFFFF',
    blueNoteColor: '#00FFFF',
    buttonLabels: ['SCR1', 'SCR2', 'KEY1', 'KEY2', 'KEY3', 'KEY4', 'KEY5', 'KEY6', 'KEY7', 'SCR3', 'SCR4'],
    buttonAssignments: buttonAssignments.slice(),
    greenNumber: 300,
    fps: 60
};

// ローカルストレージから設定を読み込み
function loadSettings() {
    const saved = localStorage.getItem('iidx-visualizer-settings');
    if (saved) {
        settings = JSON.parse(saved);
        applySettings();
    }
}

// 設定を適用
function applySettings() {
    document.querySelectorAll('.scratch').forEach(lane => lane.style.backgroundColor = settings.scratchColor);
    document.querySelectorAll('.white-key').forEach(lane => lane.style.backgroundColor = settings.whiteKeyColor);
    document.querySelectorAll('.black-key').forEach(lane => lane.style.backgroundColor = settings.blackKeyColor);
    document.querySelectorAll('.scratch .note').forEach(note => note.style.backgroundColor = settings.scratchNoteColor);
    document.querySelectorAll('.white-key .note:nth-child(odd)').forEach(note => note.style.backgroundColor = settings.whiteNoteColor);
    document.querySelectorAll('.white-key .note:nth-child(even)').forEach(note => note.style.backgroundColor = settings.blueNoteColor);
    document.querySelectorAll('.black-key .note:nth-child(odd)').forEach(note => note.style.backgroundColor = settings.whiteNoteColor);
    document.querySelectorAll('.black-key .note:nth-child(even)').forEach(note => note.style.backgroundColor = settings.blueNoteColor);
    document.querySelectorAll('.button-input').forEach((input, i) => input.value = settings.buttonLabels[i]);
    buttonAssignments = settings.buttonAssignments.slice();
    greenNumber = settings.greenNumber;
    fps = settings.fps;
    frameTime = 1000 / fps;
    noteSpeed = (600 / (greenNumber * 0.016666 / 10)) / fps;
    document.getElementById('green-number').value = greenNumber;
    document.getElementById('green-number-input').value = greenNumber;
    document.getElementById('scratch-color').value = settings.scratchColor;
    document.getElementById('white-key-color').value = settings.whiteKeyColor;
    document.getElementById('black-key-color').value = settings.blackKeyColor;
    document.getElementById('scratch-note-color').value = settings.scratchNoteColor;
    document.getElementById('white-note-color').value = settings.whiteNoteColor;
    document.getElementById('blue-note-color').value = settings.blueNoteColor;
}

// 設定を保存
function saveSettings() {
    localStorage.setItem('iidx-visualizer-settings', JSON.stringify(settings));
}

// FPS切り替え
function setFPS(value) {
    fps = value;
    frameTime = 1000 / fps;
    noteSpeed = (600 / (greenNumber * 0.016666 / 10)) / fps;
    settings.fps = fps;
    saveSettings();
}

// 緑数字変更
function updateGreenNumber(value) {
    greenNumber = value;
    noteSpeed = (600 / (greenNumber * 0.016666 / 10)) / fps;
    document.getElementById('green-number').value = greenNumber;
    document.getElementById('green-number-input').value = greenNumber;
    settings.greenNumber = greenNumber;
    saveSettings();
}

// 設定エクスポート
function exportSettings() {
    const data = JSON.stringify(settings);
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'iidx-visualizer-settings.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// 設定インポート
document.getElementById('import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                settings = JSON.parse(e.target.result);
                applySettings();
                saveSettings();
            } catch (err) {
                alert('Invalid settings file');
            }
        };
        reader.readAsText(file);
    }
});

// デフォルトリセット
function confirmReset() {
    if (confirm('Reset all settings to default?')) {
        settings = {
            scratchColor: '#000000',
            whiteKeyColor: '#808080',
            blackKeyColor: '#000000',
            scratchNoteColor: '#FF0000',
            whiteNoteColor: '#FFFFFF',
            blueNoteColor: '#00FFFF',
            buttonLabels: ['SCR1', 'SCR2', 'KEY1', 'KEY2', 'KEY3', 'KEY4', 'KEY5', 'KEY6', 'KEY7', 'SCR3', 'SCR4'],
            buttonAssignments: Array(11).fill().map((_, i) => i),
            greenNumber: 300,
            fps: 60
        };
        applySettings();
        saveSettings();
    }
}

// カラー変更
document.getElementById('scratch-color').addEventListener('input', (e) => {
    settings.scratchColor = e.target.value;
    applySettings();
    saveSettings();
});
document.getElementById('white-key-color').addEventListener('input', (e) => {
    settings.whiteKeyColor = e.target.value;
    applySettings();
    saveSettings();
});
document.getElementById('black-key-color').addEventListener('input', (e) => {
    settings.blackKeyColor = e.target.value;
    applySettings();
    saveSettings();
});
document.getElementById('scratch-note-color').addEventListener('input', (e) => {
    settings.scratchNoteColor = e.target.value;
    applySettings();
    saveSettings();
});
document.getElementById('white-note-color').addEventListener('input', (e) => {
    settings.whiteNoteColor = e.target.value;
    applySettings();
    saveSettings();
});
document.getElementById('blue-note-color').addEventListener('input', (e) => {
    settings.blueNoteColor = e.target.value;
    applySettings();
    saveSettings();
});

// ボタンラベル変更
document.querySelectorAll('.button-input').forEach((input, i) => {
    input.addEventListener('input', () => {
        settings.buttonLabels[i] = input.value;
        saveSettings();
    });
});

// 緑数字スライダーと入力
document.getElementById('green-number').addEventListener('input', (e) => {
    updateGreenNumber(parseInt(e.target.value));
});
document.getElementById('green-number-input').addEventListener('input', (e) => {
    updateGreenNumber(parseInt(e.target.value));
});

// ゲームパッド入力処理
function handleGamepad() {
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (!gamepad) continue;

        gamepad.buttons.forEach((button, btnIndex) => {
            const laneIndex = buttonAssignments.indexOf(btnIndex);
            if (laneIndex === -1) return;

            const lane = document.querySelector(`.lane[data-lane="${laneIndex}"] .note-area`);
            const now = performance.now();

            if (button.pressed && !buttonStates[btnIndex]) {
                // ボタン押下開始
                buttonStates[btnIndex] = now;
                longNoteStarts[btnIndex] = now;
                const note = document.createElement('div');
                note.className = 'note';
                note.style.height = '10px';
                note.dataset.start = now;
                lane.appendChild(note);
            } else if (button.pressed && buttonStates[btnIndex]) {
                // ロングノーツ処理
                const duration = now - buttonStates[btnIndex];
                if (duration >= 67) { // 0.067秒以上
                    const note = lane.querySelector(`.note[data-start="${buttonStates[btnIndex]}"]`);
                    if (note) {
                        note.style.height = `${Math.max(10, (duration / 1000) * noteSpeed * fps)}px`;
                    }
                }
            } else if (!button.pressed && buttonStates[btnIndex]) {
                // ボタン離された
                const note = lane.querySelector(`.note[data-start="${buttonStates[btnIndex]}"]`);
                if (note) {
                    note.dataset.fixed = true;
                }
                delete buttonStates[btnIndex];
                delete longNoteStarts[btnIndex];
            }
        });
    }
}

// ノーツアニメーション
function animateNotes() {
    const now = performance.now();
    document.querySelectorAll('.note').forEach(note => {
        if (note.dataset.fixed) {
            let top = parseFloat(note.style.top) || 0;
            top += noteSpeed;
            note.style.top = `${top}px`;
            if (top > 600 shorts) {
                note.remove();
            }
        }
    });
}

// メインループ
function gameLoop() {
    handleGamepad();
    animateNotes();
    requestAnimationFrame(gameLoop);
}

// 初期化
window.addEventListener('gamepadconnected', () => {
    console.log('Gamepad connected');
    gameLoop();
});

window.addEventListener('load', () => {
    loadSettings();
});

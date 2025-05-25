let fps = 60;
let greenNumber = 300;
let noteDuration = (greenNumber * 0.016666) / 10; // 秒数
let buttonAssignments = Array(18).fill().map((_, i) => i); // ボタン0-17をレーン0-17に
let lastPressTimes = Array(18).fill(0);
let activeNotes = Array(18).fill().map(() => []); // レーンごとのノーツリスト
const lanes = document.querySelectorAll('.lane');
const MAX_NOTES_PER_LANE = 10; // パフォーマンスのため最大ノーツ数制限

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
    activeNotes.forEach((notes, laneIndex) => {
        notes.forEach(note => {
            note.style.transitionDuration = `${noteDuration}s`;
            if (note.dataset.isMoving) {
                note.style.top = '100%';
            }
        });
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
    lanes.forEach((lane, i) => {
        const label = lane.querySelector('.lane-label').value;
        const div = document.createElement('div');
        div.innerHTML = `<label>${label}:</label><input type="number" class="assignment-input" value="${buttonAssignments[i]}" min="0" max="255" data-lane="${i}">`;
        container.appendChild(div);
        div.querySelector('input').addEventListener('change', (e) => {
            buttonAssignments[i] = parseInt(e.target.value);
            saveSettings();
        });
    });
}

// ノーツ生成
function createNote(laneIndex) {
    if (activeNotes[laneIndex].length >= MAX_NOTES_PER_LANE) return; // 最大数制限
    const lane = lanes[laneIndex];
    const note = document.createElement('div');
    note.className = 'note';
    note.classList.add(
        laneIndex < 2 || laneIndex >= 16 ? 'scratch' :
        (laneIndex - 2) % 2 === 0 ? 'white' : 'blue'
    );
    note.style.transitionDuration = `${noteDuration}s`;
    lane.appendChild(note);
    activeNotes[laneIndex].push(note);
    
    // ノーツを即座に移動開始
    note.dataset.isMoving = 'true';
    setTimeout(() => {
        note.style.top = '100%';
        setTimeout(() => {
            note.remove();
            activeNotes[laneIndex] = activeNotes[laneIndex].filter(n => n !== note);
        }, noteDuration * 1000);
    }, 0);
}

// ロングノーツ開始
function startLongNote(laneIndex) {
    if (activeNotes[laneIndex].length >= MAX_NOTES_PER_LANE) return;
    const lane = lanes[laneIndex];
    const note = document.createElement('div');
    note.className = 'note';
    note.classList.add(
        laneIndex < 2 || laneIndex >= 16 ? 'scratch' :
        (laneIndex - 2) % 2 === 0 ? 'white' : 'blue'
    );
    note.style.transitionDuration = `${noteDuration}s`;
    note.dataset.startTime = Date.now();
    lane.appendChild(note);
    activeNotes[laneIndex].push(note);
    return note;
}

// ロングノーツ終了
function endLongNote(laneIndex, note) {
    const duration = (Date.now() - parseInt(note.dataset.startTime)) / 1000;
    if (duration < 0.067) {
        // ショートノーツとして処理
        note.dataset.isMoving = 'true';
        note.style.top = '100%';
        setTimeout(() => {
            note.remove();
            activeNotes[laneIndex] = activeNotes[laneIndex].filter(n => n !== note);
        }, noteDuration * 1000);
    } else {
        // ロングノーツ
        const height = Math.min((duration / noteDuration) * 20, lane.clientHeight);
        note.style.height = `${height}px`;
        note.dataset.isMoving = 'true';
        note.style.top = '100%';
        setTimeout(() => {
            note.remove();
            activeNotes[laneIndex] = activeNotes[laneIndex].filter(n => n !== note);
        }, noteDuration * 1000);
    }
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
                const note = startLongNote(laneIndex);
                activeNotes[laneIndex][activeNotes[laneIndex].length - 1] = note;
            } else if (!button.pressed && lastPressTimes[laneIndex] !== 0) {
                const note = activeNotes[laneIndex][activeNotes[laneIndex].length - 1];
                if (note && !note.dataset.isMoving) {
                    endLongNote(laneIndex, note);
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
    input.addEventListener('change', () => {
        initButtonAssignments();
        saveSettings();
    });
});

// 初期化
initButtonAssignments();
loadSettings();
requestAnimationFrame(handleGamepad);

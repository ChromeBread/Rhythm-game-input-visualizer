// 設定のデフォルト値
const defaultSettings = {
  laneColors: [
    '#000000', '#808080', '#000000', '#808080', '#000000', '#808080', '#000000', // 左鍵盤
    '#000000', '#000000', // 左スクラッチ
    '#808080', '#000000', '#808080', '#000000', '#808080', '#000000', '#808080', // 右鍵盤
    '#000000', '#000000'  // 右スクラッチ
  ],
  buttonLabels: [
    'S1', 'K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7',
    'S2', 'S3',
    'K8', 'K9', 'K10', 'K11', 'K12', 'K13', 'K14',
    'S4', 'S5'
  ],
  buttonMappings: [
    'a', 's', 'd', 'f', 'g', 'h', 'j',
    'q', 'w',
    'i', 'o', 'p', '[', ']', '\\', ';',
    '1', '2'
  ],
  greenNumber: 300,
  fps: 60
};

let settings = { ...defaultSettings };
let frameInterval = 1000 / settings.fps;
let noteSpeed = calculateNoteSpeed(settings.greenNumber);

// レーン生成
function createLanes() {
  const lanesContainer = document.getElementById('lanes');
  lanesContainer.innerHTML = '';
  settings.laneColors.forEach((color, index) => {
    const lane = document.createElement('div');
    lane.className = `lane ${index < 7 ? (index % 2 === 0 ? 'white-key' : 'black-key') : index < 9 ? 'scratch' : index % 2 === 0 ? 'white-key' : 'black-key'}`;
    lane.style.backgroundColor = color;
    
    const note = document.createElement('div');
    note.className = `note ${index < 7 ? (index % 2 === 0 ? 'white' : 'blue') : index < 9 ? 'scratch' : (index % 2 === 0 ? 'white' : 'blue')}`;
    lane.appendChild(note);
    
    const label = document.createElement('input');
    label.type = 'text';
    label.className = 'button-label';
    label.value = settings.buttonLabels[index];
    label.onchange = () => {
      settings.buttonLabels[index] = label.value;
      saveSettings();
    };
    
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = color;
    colorInput.onchange = () => {
      settings.laneColors[index] = colorInput.value;
      lane.style.backgroundColor = colorInput.value;
      saveSettings();
    };
    
    lane.appendChild(label);
    lane.appendChild(colorInput);
    lanesContainer.appendChild(lane);
  });
}

// ノーツ速度計算（緑数字に基づく）
function calculateNoteSpeed(greenNumber) {
  return (600 / greenNumber) * (1000 / settings.fps); // ピクセル/フレーム
}

// FPS設定
function setFps(fps) {
  settings.fps = fps;
  frameInterval = 1000 / fps;
  noteSpeed = calculateNoteSpeed(settings.greenNumber);
  saveSettings();
}

// ノーツアニメーション
function animateNotes() {
  const notes = document.querySelectorAll('.note');
  notes.forEach(note => {
    let top = parseFloat(note.style.top || '0');
    if (top < 600) {
      top += noteSpeed;
      note.style.top = `${top}px`;
    } else {
      note.style.top = '0px';
    }
  });
}

// 入力検出
document.addEventListener('keydown', (e) => {
  const index = settings.buttonMappings.indexOf(e.key.toLowerCase());
  if (index !== -1) {
    const note = document.querySelectorAll('.note')[index];
    note.style.top = '0px';
  }
});

// 緑数字変更
const greenNumberSlider = document.getElementById('greenNumber');
const greenNumberInput = document.getElementById('greenNumberInput');
greenNumberSlider.oninput = () => {
  settings.greenNumber = parseInt(greenNumberSlider.value);
  greenNumberInput.value = settings.greenNumber;
  noteSpeed = calculateNoteSpeed(settings.greenNumber);
  saveSettings();
};
greenNumberInput.oninput = () => {
  settings.greenNumber = parseInt(greenNumberInput.value);
  greenNumberSlider.value = settings.greenNumber;
  noteSpeed = calculateNoteSpeed(settings.greenNumber);
  saveSettings();
};

// 設定保存
function saveSettings() {
  localStorage.setItem('iidxSettings', JSON.stringify(settings));
}

// 設定読み込み
function loadSettings() {
  const saved = localStorage.getItem('iidxSettings');
  if (saved) {
    settings = JSON.parse(saved);
    greenNumberSlider.value = settings.greenNumber;
    greenNumberInput.value = settings.greenNumber;
    noteSpeed = calculateNoteSpeed(settings.greenNumber);
  }
  createLanes();
}

// 設定エクスポート
function exportSettings() {
  const data = JSON.stringify(settings);
  const blob = new Blob([data], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'iidx_settings.txt';
  a.click();
  URL.revokeObjectURL(url);
}

// 設定インポート
function importSettings() {
  const file = document.getElementById('importFile').files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      settings = JSON.parse(e.target.result);
      greenNumberSlider.value = settings.greenNumber;
      greenNumberInput.value = settings.greenNumber;
      noteSpeed = calculateNoteSpeed(settings.greenNumber);
      createLanes();
      saveSettings();
    };
    reader.readAsText(file);
  }
}

// リセット
function confirmReset() {
  if (confirm('設定をデフォルトにリセットしますか？')) {
    settings = { ...defaultSettings };
    greenNumberSlider.value = settings.greenNumber;
    greenNumberInput.value = settings.greenNumber;
    noteSpeed = calculateNoteSpeed(settings.greenNumber);
    createLanes();
    saveSettings();
  }
}

// 初期化
loadSettings();
setInterval(animateNotes, frameInterval);

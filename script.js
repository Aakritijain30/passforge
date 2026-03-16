const CHARS = {
  upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower:   'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

const options = {
  upper:   true,
  lower:   true,
  numbers: true,
  symbols: false
};

let currentPassword = '';

const pwText        = document.getElementById('pwText');
const pwDisplay     = document.getElementById('pwDisplay');
const copyBtn       = document.getElementById('copyBtn');
const lengthSlider  = document.getElementById('lengthSlider');
const lenDisplay    = document.getElementById('lenDisplay');
const strengthRow   = document.getElementById('strengthRow');
const strengthLabel = document.getElementById('strengthLabel');
const entropyDisplay = document.getElementById('entropyDisplay');
const footerStatus  = document.getElementById('footerStatus');
const generateBtn   = document.getElementById('generateBtn');

const ICON_COPY = `
  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>`;

const ICON_CHECK = `
  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`;

function toggleOption(key) {
  const activeCount = Object.values(options).filter(Boolean).length;

  if (options[key] && activeCount === 1) return;

  options[key] = !options[key];

  const el = document.getElementById('opt-' + key);
  el.classList.toggle('active', options[key]);
}

function updateLength() {
  lenDisplay.textContent = lengthSlider.value;
}

function randomChar(str) {
  return str[crypto.getRandomValues(new Uint32Array(1))[0] % str.length];
}
function generatePassword() {
  const len = parseInt(lengthSlider.value);

  let pool = '';
  const guaranteed = [];

  for (const [key, active] of Object.entries(options)) {
    if (active) {
      pool += CHARS[key];
      guaranteed.push(randomChar(CHARS[key]));
    }
  }

  if (!pool) return;

  let pw = [...guaranteed];
  const arr = new Uint32Array(len - guaranteed.length);
  crypto.getRandomValues(arr);

  for (let i = 0; i < arr.length; i++) {
    pw.push(pool[arr[i] % pool.length]);
  }

  for (let i = pw.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [pw[i], pw[j]] = [pw[j], pw[i]];
  }

  currentPassword = pw.join('');

  pwText.textContent = currentPassword;
  pwText.classList.remove('password-placeholder', 'flash');
  void pwText.offsetWidth; // trigger reflow for animation restart
  pwText.classList.add('flash');

  updateStrength(currentPassword, pool.length);
  updateEntropy(len, pool.length);

  footerStatus.textContent = 'Generated ✓';
  copyBtn.classList.remove('active');
  copyBtn.innerHTML = ICON_COPY;
}

function updateStrength(pw, poolSize) {
  const entropy = pw.length * Math.log2(poolSize);
  let level = 1;
  let label = 'Weak';

  if (entropy >= 80)      { level = 4; label = 'Excellent'; }
  else if (entropy >= 60) { level = 3; label = 'Strong'; }
  else if (entropy >= 40) { level = 2; label = 'Fair'; }

  strengthRow.className = 'strength-row s' + level;
  strengthLabel.textContent = label;
}

function updateEntropy(len, poolSize) {
  const bits = Math.round(len * Math.log2(poolSize));
  entropyDisplay.innerHTML = `<span>${bits} bits</span>`;
}

async function copyPassword() {
  if (!currentPassword) return;

  try {
    await navigator.clipboard.writeText(currentPassword);

    copyBtn.classList.add('active');
    copyBtn.innerHTML = ICON_CHECK;
    pwDisplay.classList.add('copied');
    footerStatus.textContent = 'Copied!';

    setTimeout(() => {
      copyBtn.classList.remove('active');
      copyBtn.innerHTML = ICON_COPY;
      pwDisplay.classList.remove('copied');
    }, 2000);
  } catch (err) {
    console.error('Copy failed:', err);
  }
}

generateBtn.addEventListener('click', generatePassword);
copyBtn.addEventListener('click', copyPassword);
lengthSlider.addEventListener('input', updateLength);

document.getElementById('opt-upper').addEventListener('click',   () => toggleOption('upper'));
document.getElementById('opt-lower').addEventListener('click',   () => toggleOption('lower'));
document.getElementById('opt-numbers').addEventListener('click', () => toggleOption('numbers'));
document.getElementById('opt-symbols').addEventListener('click', () => toggleOption('symbols'));

window.addEventListener('load', generatePassword);

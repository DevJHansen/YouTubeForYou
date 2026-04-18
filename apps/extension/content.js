const DEFAULT_SETTINGS = {
  blockHomepage: true,
  hideShorts: true,
  hideComments: true,
  hideRecommended: true,
  puzzleBypass: true,
};

let settings = { ...DEFAULT_SETTINGS };

// Apply default hide classes immediately so elements don't flash before storage loads
applySettingClasses();

function applySettingClasses() {
  const html = document.documentElement;
  html.classList.toggle('yt-focus-hide-shorts', !!settings.hideShorts);
  html.classList.toggle('yt-focus-hide-comments', !!settings.hideComments);
  html.classList.toggle('yt-focus-hide-recommended', !!settings.hideRecommended);
}

function shouldBlockHomepage() {
  const path = window.location.pathname;
  return !!settings.blockHomepage && (path === '/' || path === '');
}

function isShortsPage() {
  return window.location.pathname.startsWith('/shorts/');
}

function maybeRedirectShorts() {
  if (settings.hideShorts && isShortsPage()) {
    window.location.replace('https://www.youtube.com/');
    return true;
  }
  return false;
}

function generatePuzzle() {
  const a = 10 + Math.floor(Math.random() * 40);
  const b = 10 + Math.floor(Math.random() * 40);
  return { a, b, answer: a + b };
}

function createOverlay() {
  if (document.getElementById('yt-focus-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'yt-focus-overlay';

  overlay.innerHTML = `
    <div class="yt-focus-container">
      <div class="yt-focus-logo">
        <svg viewBox="0 0 128 128" class="yt-focus-foryou-logo">
          <circle cx="64" cy="64" r="58" fill="none" stroke="#FF0000" stroke-width="6"/>
          <circle cx="64" cy="64" r="46" fill="#FF0000"/>
          <path d="M52 42 L52 86 L88 64 Z" fill="white"/>
        </svg>
      </div>
      <h1 class="yt-focus-title">YouTube, for you.</h1>
      <p class="yt-focus-subtitle">Skip the algorithm and stay focused.</p>
      <form class="yt-focus-search-form" id="yt-focus-search-form">
        <input
          type="text"
          class="yt-focus-search-input"
          id="yt-focus-search-input"
          placeholder="What did you come here to watch?"
          autocomplete="off"
          autofocus
        />
        <button type="submit" class="yt-focus-search-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M20.87,20.17l-5.59-5.59C16.35,13.35,17,11.75,17,10c0-3.87-3.13-7-7-7s-7,3.13-7,7s3.13,7,7,7c1.75,0,3.35-0.65,4.58-1.71l5.59,5.59L20.87,20.17z M10,16c-3.31,0-6-2.69-6-6s2.69-6,6-6s6,2.69,6,6S13.31,16,10,16z"/>
          </svg>
        </button>
      </form>
      <button class="yt-focus-show-page" id="yt-focus-show-page">
        Show homepage anyway
      </button>
      <div class="yt-focus-puzzle" id="yt-focus-puzzle" hidden>
        <p class="yt-focus-puzzle-prompt" id="yt-focus-puzzle-prompt"></p>
        <form class="yt-focus-puzzle-form" id="yt-focus-puzzle-form">
          <input
            type="number"
            class="yt-focus-puzzle-input"
            id="yt-focus-puzzle-input"
            autocomplete="off"
            inputmode="numeric"
          />
          <button type="submit" class="yt-focus-puzzle-submit">Continue</button>
        </form>
      </div>
    </div>
  `;

  document.documentElement.appendChild(overlay);

  const form = document.getElementById('yt-focus-search-form');
  const input = document.getElementById('yt-focus-search-input');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (query) {
      window.location.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    }
  });

  const showPageBtn = document.getElementById('yt-focus-show-page');
  const puzzleEl = document.getElementById('yt-focus-puzzle');
  const puzzlePrompt = document.getElementById('yt-focus-puzzle-prompt');
  const puzzleForm = document.getElementById('yt-focus-puzzle-form');
  const puzzleInput = document.getElementById('yt-focus-puzzle-input');
  let currentPuzzle = null;

  function bypassHomepage() {
    overlay.classList.add('yt-focus-hidden');
    document.body.style.overflow = '';
    sessionStorage.setItem('yt-focus-show-homepage', 'true');
    setPuzzleActive(false);
  }

  function presentPuzzle() {
    currentPuzzle = generatePuzzle();
    puzzlePrompt.textContent = `Solve to continue:  ${currentPuzzle.a} + ${currentPuzzle.b} = ?`;
    puzzleInput.value = '';
    showPageBtn.hidden = true;
    puzzleEl.hidden = false;
    puzzleInput.focus();
    setPuzzleActive(true);
  }

  showPageBtn.addEventListener('click', () => {
    if (settings.puzzleBypass) {
      presentPuzzle();
    } else {
      bypassHomepage();
    }
  });

  puzzleForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const guess = parseInt(puzzleInput.value, 10);
    if (guess === currentPuzzle.answer) {
      bypassHomepage();
    } else {
      puzzleEl.classList.remove('yt-focus-shake');
      void puzzleEl.offsetWidth;
      puzzleEl.classList.add('yt-focus-shake');
      presentPuzzle();
    }
  });

  setTimeout(() => {
    input.focus();
  }, 100);
}

function removeOverlay() {
  const overlay = document.getElementById('yt-focus-overlay');
  if (overlay) {
    overlay.remove();
    setPuzzleActive(false);
  }
}

function setPuzzleActive(active) {
  chrome.storage.local.set({ puzzleActive: !!active });
}

function checkAndBlock() {
  if (maybeRedirectShorts()) return;

  if (sessionStorage.getItem('yt-focus-show-homepage') === 'true') {
    if (!shouldBlockHomepage()) {
      sessionStorage.removeItem('yt-focus-show-homepage');
    }
    removeOverlay();
    return;
  }

  if (shouldBlockHomepage()) {
    createOverlay();
  } else {
    removeOverlay();
  }
}

// Load settings from storage
chrome.storage.sync.get(DEFAULT_SETTINGS).then((data) => {
  settings = { ...DEFAULT_SETTINGS, ...data };
  applySettingClasses();
  checkAndBlock();
});

// Live-update when user toggles settings in the popup
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;
  for (const [key, { newValue }] of Object.entries(changes)) {
    settings[key] = newValue;
  }
  applySettingClasses();
  checkAndBlock();
});

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndBlock);
} else {
  checkAndBlock();
}

// Watch for URL changes (YouTube is a SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    checkAndBlock();
  }
}).observe(document, { subtree: true, childList: true });

window.addEventListener('popstate', checkAndBlock);

// Clear puzzle-active flag when the page is hidden/closed so the popup doesn't stay locked after navigating away
window.addEventListener('pagehide', () => {
  setPuzzleActive(false);
});

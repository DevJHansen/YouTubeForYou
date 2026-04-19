const DEFAULT_SETTINGS = {
  // Free
  blockHomepage: true,
  hideShorts: true,
  hideComments: true,
  hideRecommended: true,
  puzzleBypass: true,
  // Pro toggles
  scheduledFocus: false,
  autoSkipSponsors: false,
  sessionBudgets: false,
  clickbaitWarnings: false,
  analytics: false,
  // Pro config
  focusSchedule: { days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00' },
  sessionBudget: { dailyMinutes: 30 },
};

const DEFAULT_AUTH = null;

let settings = { ...DEFAULT_SETTINGS };
let authSession = DEFAULT_AUTH;

// Apply default hide classes immediately so elements don't flash before storage loads
applySettingClasses();

// --- Focus window helpers ------------------------------------------------

function isInFocusWindow() {
  if (!settings.scheduledFocus) return false;
  const s = settings.focusSchedule || DEFAULT_SETTINGS.focusSchedule;
  const now = new Date();
  const day = now.getDay();
  if (!Array.isArray(s.days) || !s.days.includes(day)) return false;
  const mins = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = (s.start || '09:00').split(':').map(Number);
  const [eh, em] = (s.end || '17:00').split(':').map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  if (endMins <= startMins) {
    // Overnight window e.g. 22:00-06:00
    return mins >= startMins || mins < endMins;
  }
  return mins >= startMins && mins < endMins;
}

function effective(key) {
  // When focus window is active (and user is Pro), force the core blockers on.
  const focusing = isPro() && isInFocusWindow();
  if (focusing && (key === 'blockHomepage' || key === 'hideShorts' || key === 'hideComments' || key === 'hideRecommended')) {
    return true;
  }
  return !!settings[key];
}

function isPro() {
  return !!(authSession && authSession.plan === 'pro');
}

function applySettingClasses() {
  const html = document.documentElement;
  html.classList.toggle('yt-focus-hide-shorts', effective('hideShorts'));
  html.classList.toggle('yt-focus-hide-comments', effective('hideComments'));
  html.classList.toggle('yt-focus-hide-recommended', effective('hideRecommended'));
}

function shouldBlockHomepage() {
  const path = window.location.pathname;
  return effective('blockHomepage') && (path === '/' || path === '');
}

function isShortsPage() {
  return window.location.pathname.startsWith('/shorts/');
}

function isWatchPage() {
  return window.location.pathname === '/watch';
}

function currentVideoId() {
  try {
    const u = new URL(window.location.href);
    return u.searchParams.get('v');
  } catch (e) {
    return null;
  }
}

function maybeRedirectShorts() {
  if (effective('hideShorts') && isShortsPage()) {
    bumpStat('shortsBlocked', 1);
    window.location.replace('https://www.youtube.com/');
    return true;
  }
  return false;
}

// --- Puzzle / homepage overlay (existing behavior) -----------------------

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

// --- Session budget lockout ---------------------------------------------

function ensureLockoutOverlay(minutes) {
  if (document.getElementById('yt-focus-lockout')) return;
  const el = document.createElement('div');
  el.id = 'yt-focus-lockout';
  el.innerHTML = `
    <div class="yt-focus-lockout-card">
      <div class="yt-focus-logo">
        <svg viewBox="0 0 128 128" class="yt-focus-foryou-logo">
          <circle cx="64" cy="64" r="58" fill="none" stroke="#FF0000" stroke-width="6"/>
          <circle cx="64" cy="64" r="46" fill="#FF0000"/>
          <path d="M52 42 L52 86 L88 64 Z" fill="white"/>
        </svg>
      </div>
      <h1 class="yt-focus-title">Daily budget reached</h1>
      <p class="yt-focus-subtitle">You've used your ${minutes} min of YouTube today. Come back tomorrow.</p>
    </div>
  `;
  document.documentElement.appendChild(el);
  // Pause any playing videos
  document.querySelectorAll('video').forEach((v) => {
    try { v.pause(); } catch (e) {}
  });
}

function removeLockoutOverlay() {
  const el = document.getElementById('yt-focus-lockout');
  if (el) el.remove();
}

function checkBudgetLockout(seconds) {
  if (!settings.sessionBudgets || !isPro()) { removeLockoutOverlay(); return false; }
  const minutes = (settings.sessionBudget && settings.sessionBudget.dailyMinutes) || 30;
  if (seconds >= minutes * 60) {
    ensureLockoutOverlay(minutes);
    // Re-pause any videos that appear after lockout (YouTube sometimes restarts them)
    document.querySelectorAll('video').forEach((v) => {
      try { v.pause(); } catch (e) {}
    });
    return true;
  }
  removeLockoutOverlay();
  return false;
}

// --- Watch time + analytics ticker --------------------------------------

function getActiveVideo() {
  // Picks a visible, currently-playing <video>.
  const videos = Array.from(document.querySelectorAll('video'));
  for (const v of videos) {
    if (!v.paused && !v.ended && v.readyState > 2) return v;
  }
  return null;
}

async function watchTimeTick() {
  if (document.visibilityState !== 'visible') return;
  if (!isWatchPage() && !isShortsPage()) return;
  const v = getActiveVideo();
  if (!v) return;

  // 1 second of active playback. Increment counters.
  const isShorts = isShortsPage();
  const updates = {};
  updates[isShorts ? 'secondsWatchedShorts' : 'secondsWatchedLong'] = 1;

  // Update watchTime total for session budgets
  const today = todayKey();
  const wt = (await chrome.storage.local.get({ watchTime: null })).watchTime || { date: today, seconds: 0 };
  const current = wt.date === today ? wt.seconds : 0;
  const nextSeconds = current + 1;
  await chrome.storage.local.set({ watchTime: { date: today, seconds: nextSeconds } });

  // Bump analytics counters
  await bumpStats(updates);

  // Check budget lockout
  checkBudgetLockout(nextSeconds);
}

setInterval(() => {
  watchTimeTick().catch(() => {});
}, 1000);

// Also run on visibility resume so lockout appears immediately.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    chrome.storage.local.get({ watchTime: null }).then((d) => {
      const wt = d.watchTime;
      if (wt && wt.date === todayKey()) checkBudgetLockout(wt.seconds);
    });
  }
});

// --- Analytics helpers ---------------------------------------------------

async function bumpStat(key, amount) {
  return bumpStats({ [key]: amount });
}

async function bumpStats(updates) {
  try {
    const today = todayKey();
    const data = await chrome.storage.local.get({ statsDaily: {} });
    const statsDaily = data.statsDaily || {};
    const bucket = statsDaily[today] || {
      shortsBlocked: 0,
      secondsWatchedLong: 0,
      secondsWatchedShorts: 0,
      sponsorsSkipped: 0,
      clickbaitFlagged: 0,
    };
    for (const [k, v] of Object.entries(updates)) {
      bucket[k] = (bucket[k] || 0) + v;
    }
    statsDaily[today] = bucket;
    await chrome.storage.local.set({ statsDaily });
  } catch (e) {
    // swallow
  }
}

// --- Sponsor skip --------------------------------------------------------

let sponsorSegments = [];
let sponsorVideoId = null;
let sponsorVideoEl = null;
let sponsorTimeUpdateHandler = null;
const SPONSOR_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const SPONSOR_CACHE_MAX = 200;

async function readSponsorCache() {
  const d = await chrome.storage.local.get({ sponsorCache: {} });
  return d.sponsorCache || {};
}

async function writeSponsorCache(cache) {
  await chrome.storage.local.set({ sponsorCache: cache });
}

async function getSponsorSegments(videoId) {
  const cache = await readSponsorCache();
  const entry = cache[videoId];
  if (entry && Date.now() - entry.fetchedAt < SPONSOR_CACHE_TTL_MS) {
    return entry.segments;
  }
  try {
    const resp = await fetch(
      `https://sponsor.ajay.app/api/skipSegments?videoID=${encodeURIComponent(videoId)}&categories=${encodeURIComponent('["sponsor"]')}`
    );
    if (resp.status === 404) {
      // No segments for this video - cache empty list
      cache[videoId] = { segments: [], fetchedAt: Date.now() };
    } else if (resp.ok) {
      const data = await resp.json();
      const segments = Array.isArray(data)
        ? data.filter((s) => s && Array.isArray(s.segment)).map((s) => s.segment)
        : [];
      cache[videoId] = { segments, fetchedAt: Date.now() };
    } else {
      return [];
    }
    // Evict oldest when over cap
    const keys = Object.keys(cache);
    if (keys.length > SPONSOR_CACHE_MAX) {
      keys
        .sort((a, b) => (cache[a].fetchedAt || 0) - (cache[b].fetchedAt || 0))
        .slice(0, keys.length - SPONSOR_CACHE_MAX)
        .forEach((k) => delete cache[k]);
    }
    await writeSponsorCache(cache);
    return cache[videoId].segments;
  } catch (e) {
    return [];
  }
}

function detachSponsorSkip() {
  if (sponsorVideoEl && sponsorTimeUpdateHandler) {
    sponsorVideoEl.removeEventListener('timeupdate', sponsorTimeUpdateHandler);
  }
  sponsorVideoEl = null;
  sponsorTimeUpdateHandler = null;
  sponsorSegments = [];
  sponsorVideoId = null;
}

async function attachSponsorSkip() {
  if (!settings.autoSkipSponsors || !isPro() || !isWatchPage()) {
    detachSponsorSkip();
    return;
  }
  const videoId = currentVideoId();
  if (!videoId || videoId === sponsorVideoId) return;

  detachSponsorSkip();
  sponsorVideoId = videoId;
  sponsorSegments = await getSponsorSegments(videoId);
  if (!sponsorSegments || sponsorSegments.length === 0) return;

  // Wait for video element
  const video = await waitForElement('video', 10000);
  if (!video) return;
  sponsorVideoEl = video;

  sponsorTimeUpdateHandler = () => {
    const t = video.currentTime;
    for (const seg of sponsorSegments) {
      if (t >= seg[0] && t < seg[1]) {
        const skipped = Math.round(seg[1] - seg[0]);
        video.currentTime = seg[1] + 0.2;
        bumpStat('sponsorsSkipped', 1).catch(() => {});
        showToast(`Skipped sponsor · ${skipped}s`);
        break;
      }
    }
  };
  video.addEventListener('timeupdate', sponsorTimeUpdateHandler);
}

// --- Toast ---------------------------------------------------------------

function showToast(msg) {
  let host = document.getElementById('yt-focus-toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'yt-focus-toast-host';
    document.documentElement.appendChild(host);
  }
  const toast = document.createElement('div');
  toast.className = 'yt-focus-toast';
  toast.textContent = msg;
  host.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('yt-focus-toast-out');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// --- Clickbait -----------------------------------------------------------

const CLICKBAIT_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
let clickbaitVideoId = null;

async function readClickbaitCache() {
  const d = await chrome.storage.local.get({ clickbaitLocalCache: {} });
  return d.clickbaitLocalCache || {};
}

async function writeClickbaitCache(cache) {
  await chrome.storage.local.set({ clickbaitLocalCache: cache });
}

function findTitleElement() {
  return (
    document.querySelector('#title h1 yt-formatted-string') ||
    document.querySelector('ytd-watch-metadata h1 yt-formatted-string') ||
    document.querySelector('h1.ytd-watch-metadata')
  );
}

function findChannelName() {
  const el =
    document.querySelector('#channel-name #text a') ||
    document.querySelector('ytd-channel-name a') ||
    document.querySelector('#owner #channel-name a');
  return el ? el.textContent.trim() : undefined;
}

async function waitForElement(selector, timeoutMs) {
  const found = document.querySelector(selector);
  if (found) return found;
  return new Promise((resolve) => {
    const deadline = Date.now() + (timeoutMs || 10000);
    const obs = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        obs.disconnect();
        resolve(el);
      } else if (Date.now() > deadline) {
        obs.disconnect();
        resolve(null);
      }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => {
      obs.disconnect();
      resolve(document.querySelector(selector));
    }, timeoutMs || 10000);
  });
}

async function waitForTitle() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    const el = findTitleElement();
    if (el && el.textContent.trim()) return el;
    await new Promise((r) => setTimeout(r, 300));
  }
  return findTitleElement();
}

function removeClickbaitUI() {
  document.getElementById('yt-focus-clickbait-badge')?.remove();
  document.getElementById('yt-focus-clickbait-panel')?.remove();
}

function renderClickbaitUI(titleEl, result) {
  removeClickbaitUI();

  const badge = document.createElement('span');
  badge.id = 'yt-focus-clickbait-badge';
  badge.className = 'yt-focus-clickbait-badge';
  badge.textContent = 'CLICKBAIT';
  titleEl.parentElement?.appendChild(badge);

  const panel = document.createElement('div');
  panel.id = 'yt-focus-clickbait-panel';
  panel.className = 'yt-focus-clickbait-panel';
  panel.innerHTML = `
    <button class="yt-focus-clickbait-summary" type="button">
      <span>Why this might be clickbait</span>
      <span class="yt-focus-clickbait-chevron">></span>
    </button>
    <div class="yt-focus-clickbait-body" hidden>
      ${result.genuineTitle ? `<div class="yt-focus-clickbait-row"><strong>What it's really about:</strong> <span class="yt-focus-genuine-title"></span></div>` : ''}
      ${result.reasoning ? `<div class="yt-focus-clickbait-row yt-focus-clickbait-reasoning"></div>` : ''}
      ${result.genuineTitle ? `<button class="yt-focus-clickbait-reveal" type="button">Reveal real title</button>` : ''}
    </div>
  `;

  const genuineEl = panel.querySelector('.yt-focus-genuine-title');
  if (genuineEl) genuineEl.textContent = result.genuineTitle;
  const reasoningEl = panel.querySelector('.yt-focus-clickbait-reasoning');
  if (reasoningEl) reasoningEl.textContent = result.reasoning;

  const host = titleEl.closest('ytd-watch-metadata, #title') || titleEl.parentElement;
  host?.appendChild(panel);

  const summary = panel.querySelector('.yt-focus-clickbait-summary');
  const body = panel.querySelector('.yt-focus-clickbait-body');
  summary.addEventListener('click', () => {
    body.hidden = !body.hidden;
    panel.classList.toggle('yt-focus-clickbait-open', !body.hidden);
  });

  const revealBtn = panel.querySelector('.yt-focus-clickbait-reveal');
  if (revealBtn && result.genuineTitle) {
    revealBtn.addEventListener('click', () => {
      titleEl.textContent = result.genuineTitle;
      revealBtn.disabled = true;
      revealBtn.textContent = 'Revealed';
    });
  }
}

async function runClickbaitCheck() {
  if (!settings.clickbaitWarnings || !isPro() || !isWatchPage()) return;
  const videoId = currentVideoId();
  if (!videoId || videoId === clickbaitVideoId) return;
  clickbaitVideoId = videoId;
  removeClickbaitUI();

  const titleEl = await waitForTitle();
  if (!titleEl) return;
  const title = titleEl.textContent.trim();
  if (!title) return;

  // Cache check
  const cache = await readClickbaitCache();
  let result = null;
  const cached = cache[videoId];
  if (cached && Date.now() - cached.fetchedAt < CLICKBAIT_CACHE_TTL_MS) {
    result = cached.result;
  } else {
    try {
      const resp = await globalThis.apiFetch('/api/clickbait', {
        method: 'POST',
        body: JSON.stringify({ videoId, title, channelName: findChannelName() }),
      });
      if (!resp.ok) return;
      result = await resp.json();
      cache[videoId] = { result, fetchedAt: Date.now() };
      // Cap cache
      const keys = Object.keys(cache);
      if (keys.length > 200) {
        keys
          .sort((a, b) => (cache[a].fetchedAt || 0) - (cache[b].fetchedAt || 0))
          .slice(0, keys.length - 200)
          .forEach((k) => delete cache[k]);
      }
      await writeClickbaitCache(cache);
    } catch (e) {
      return;
    }
  }

  if (result && result.verdict === 'clickbait') {
    renderClickbaitUI(titleEl, result);
    bumpStat('clickbaitFlagged', 1).catch(() => {});
  }
}

// --- Load settings + auth, react to changes -----------------------------

async function loadAuth() {
  try {
    const data = await chrome.storage.local.get({ authSession: null });
    authSession = data.authSession || null;
  } catch (e) {
    authSession = null;
  }
}

async function init() {
  await loadAuth();
  const data = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  settings = { ...DEFAULT_SETTINGS, ...data };
  applySettingClasses();
  checkAndBlock();

  // On load, restore budget lockout if we're already over.
  const wt = (await chrome.storage.local.get({ watchTime: null })).watchTime;
  if (wt && wt.date === todayKey()) checkBudgetLockout(wt.seconds);

  attachSponsorSkip();
  runClickbaitCheck();
}

init();

// Live-update when user toggles settings in the popup
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync') {
    for (const [key, { newValue }] of Object.entries(changes)) {
      settings[key] = newValue;
    }
    applySettingClasses();
    checkAndBlock();
    attachSponsorSkip();
    runClickbaitCheck();
    chrome.storage.local.get({ watchTime: null }).then((d) => {
      const wt = d.watchTime;
      if (wt && wt.date === todayKey()) checkBudgetLockout(wt.seconds);
      else checkBudgetLockout(0);
    });
  }
  if (area === 'local' && changes.authSession) {
    authSession = changes.authSession.newValue || null;
    applySettingClasses();
    checkAndBlock();
    attachSponsorSkip();
    runClickbaitCheck();
  }
});

// Re-check on focus-window boundary crossings (cheap — just re-apply every minute).
setInterval(() => {
  applySettingClasses();
  checkAndBlock();
}, 60 * 1000);

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
    clickbaitVideoId = null;
    sponsorVideoId = null;
    removeClickbaitUI();
    checkAndBlock();
    attachSponsorSkip();
    runClickbaitCheck();
  }
}).observe(document, { subtree: true, childList: true });

window.addEventListener('popstate', () => {
  checkAndBlock();
  attachSponsorSkip();
  runClickbaitCheck();
});

// Clear puzzle-active flag when the page is hidden/closed
window.addEventListener('pagehide', () => {
  setPuzzleActive(false);
});

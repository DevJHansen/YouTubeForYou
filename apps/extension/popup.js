const WEB_URL = 'https://yt-foryou-web.vercel.app';

const DEFAULTS = {
  blockHomepage: true,
  hideShorts: true,
  hideComments: true,
  hideRecommended: true,
  puzzleBypass: true,
  scheduledFocus: false,
  autoSkipSponsors: false,
  sessionBudgets: false,
  clickbaitWarnings: false,
  analytics: false,
  focusSchedule: { days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00' },
  sessionBudget: { dailyMinutes: 30 },
};

// SVG glyphs match the hero mock (Lucide-style monochrome, stroke-based).
const ICON_SVG = {
  home:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v11a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9"/></svg>',
  shorts:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none"/></svg>',
  comment:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.8 7.05L4 20l1-4.2A8 8 0 1 1 21 12z"/></svg>',
  sidebar:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/></svg>',
  puzzle:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19.4 7.2h-2.1a2 2 0 0 0-2-2V3.1a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v2.1a2 2 0 0 0-2 2H5.2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2.1a2 2 0 0 1 0 4H5.2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a2 2 0 0 1 4 0h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2.1a2 2 0 0 1 0-4h2.1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1z"/></svg>',
  schedule:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/><circle cx="17" cy="16" r="2.4"/><path d="M17 14.5v1.5l1 1"/></svg>',
  sponsor:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4l10 8-10 8V4z"/><path d="M19 5v14"/></svg>',
  budget:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 2h6"/></svg>',
  alert:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4"/><circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none"/></svg>',
  chart:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v16h16"/><path d="M8 16V9"/><path d="M12 16v-4"/><path d="M16 16v-7"/></svg>',
};

const FEATURES = [
  { key: 'blockHomepage', icon: 'home', label: 'Block homepage feed', tier: 'free' },
  { key: 'puzzleBypass', icon: 'puzzle', label: 'Puzzle to bypass', tier: 'free', dependsOn: 'blockHomepage' },
  { key: 'hideShorts', icon: 'shorts', label: 'Hide Shorts', tier: 'free' },
  { key: 'hideComments', icon: 'comment', label: 'Hide comments', tier: 'free' },
  { key: 'hideRecommended', icon: 'sidebar', label: 'Hide recommendations', tier: 'free' },
  { key: 'scheduledFocus', icon: 'schedule', label: 'Scheduled focus', tier: 'pro', configurable: true },
  { key: 'sessionBudgets', icon: 'budget', label: 'Session budgets', tier: 'pro', configurable: true },
  { key: 'autoSkipSponsors', icon: 'sponsor', label: 'Auto-skip sponsors', tier: 'pro' },
  { key: 'clickbaitWarnings', icon: 'alert', label: 'Clickbait warnings', tier: 'pro' },
  { key: 'analytics', icon: 'chart', label: 'Sync analytics', tier: 'pro' },
];

const LOCKED_KEYS = ['blockHomepage', 'puzzleBypass'];
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const state = {
  settings: { ...DEFAULTS },
  authSession: null,
  puzzleActive: false,
  statsDaily: {},
};

// Wrapper centralises all innerHTML assignments. Every caller passes either
// a static literal or strings run through escapeHtml/escapeAttr.
function setHtml(el, markup) {
  el.innerHTML = markup;
}

async function init() {
  const [sync, local] = await Promise.all([
    chrome.storage.sync.get(DEFAULTS),
    chrome.storage.local.get({ authSession: null, puzzleActive: false, statsDaily: {} }),
  ]);
  state.settings = { ...DEFAULTS, ...sync };
  state.authSession = local.authSession || null;
  state.puzzleActive = !!local.puzzleActive;
  state.statsDaily = local.statsDaily || {};

  render();

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      for (const [k, { newValue }] of Object.entries(changes)) {
        state.settings[k] = newValue;
      }
      render();
    } else if (area === 'local') {
      if (changes.puzzleActive) state.puzzleActive = !!changes.puzzleActive.newValue;
      if (changes.authSession) state.authSession = changes.authSession.newValue || null;
      if (changes.statsDaily) state.statsDaily = changes.statsDaily.newValue || {};
      render();
    }
  });
}

function isPro() {
  return !!(state.authSession && state.authSession.plan === 'pro');
}

function render() {
  renderStatus();
  renderStats();
  renderList();
  renderAccount();
  document.getElementById('lockNotice').hidden = !state.puzzleActive;
}

function renderStatus() {
  const count = FEATURES.filter((f) => {
    if (f.tier === 'pro' && !isPro()) return false;
    return !!state.settings[f.key];
  }).length;
  document.getElementById('statusText').textContent = `Active · ${count} ${
    count === 1 ? 'rule' : 'rules'
  }`;
}

function weekTotals() {
  const totals = { shortsBlocked: 0, secondsWatchedLong: 0, secondsWatchedShorts: 0 };
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const bucket = state.statsDaily[key];
    if (!bucket) continue;
    totals.shortsBlocked += bucket.shortsBlocked || 0;
    totals.secondsWatchedLong += bucket.secondsWatchedLong || 0;
    totals.secondsWatchedShorts += bucket.secondsWatchedShorts || 0;
  }
  return totals;
}

function renderStats() {
  const totals = weekTotals();
  document.getElementById('statShorts').textContent = formatCount(totals.shortsBlocked);

  // Rough estimate: 30s saved per blocked Short.
  const savedSeconds = totals.shortsBlocked * 30;
  const hours = savedSeconds / 3600;
  const timeEl = document.getElementById('statTime');
  if (hours >= 1) {
    setHtml(timeEl, `${hours.toFixed(1)}<span class="unit">h</span>`);
  } else {
    const minutes = Math.round(savedSeconds / 60);
    setHtml(timeEl, `${minutes}<span class="unit">m</span>`);
  }
}

function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

function renderList() {
  const list = document.getElementById('list');
  setHtml(list, '');

  const free = FEATURES.filter((f) => f.tier === 'free');
  const pro = FEATURES.filter((f) => f.tier === 'pro');

  list.appendChild(buildGroup('Free', free, null));
  list.appendChild(buildGroup('Pro', pro, isPro() ? 'PRO' : state.authSession ? 'FREE' : 'LOCKED'));
}

function buildGroup(title, items, tag) {
  const group = document.createElement('section');
  group.className = 'popup-group';

  const head = document.createElement('div');
  head.className = 'popup-group-title';
  const tagMarkup = tag
    ? `<span class="popup-group-tag${tag === 'PRO' ? ' pro' : ''}">${escapeHtml(tag)}</span>`
    : '';
  setHtml(head, `<span>${escapeHtml(title)}</span>${tagMarkup}`);
  group.appendChild(head);

  for (const feat of items) {
    group.appendChild(buildRow(feat));
    if (feat.configurable && isPro() && state.settings[feat.key]) {
      const panel = buildConfigPanel(feat.key);
      panel.hidden = true;
      group.appendChild(panel);
      const chevron = group.querySelector(`[data-configure="${feat.key}"]`);
      if (chevron) {
        chevron.addEventListener('click', (e) => {
          e.stopPropagation();
          panel.hidden = !panel.hidden;
        });
      }
    }
  }

  return group;
}

function buildRow(feat) {
  const row = document.createElement('div');
  const on = !!state.settings[feat.key];
  const proLocked = feat.tier === 'pro' && !isPro();
  const depLocked = feat.dependsOn && !state.settings[feat.dependsOn];
  const puzzleLocked = state.puzzleActive && LOCKED_KEYS.includes(feat.key);
  const disabled = proLocked || depLocked || puzzleLocked;

  row.className = 'popup-row';
  if (on && !proLocked) row.classList.add('on');
  if (disabled) row.classList.add('disabled');

  const configureBtn =
    feat.configurable && isPro() && on
      ? `<button class="row-configure" type="button" data-configure="${escapeAttr(
          feat.key
        )}">Configure</button>`
      : '';
  const proBadge = feat.tier === 'pro' && !isPro() ? '<span class="pro-badge">PRO</span>' : '';

  setHtml(
    row,
    `
    <span class="row-icon">${ICON_SVG[feat.icon] || ''}</span>
    <div class="row-body">
      <span class="row-label">${escapeHtml(feat.label)}</span>
      ${proBadge}
    </div>
    ${configureBtn}
    <label class="switch">
      <input type="checkbox" ${on ? 'checked' : ''} ${disabled ? 'disabled' : ''} />
      <span class="slider"></span>
    </label>
  `
  );

  const input = row.querySelector('input');
  input.addEventListener('change', (e) => {
    e.stopPropagation();
    if (disabled) {
      input.checked = !input.checked;
      return;
    }
    chrome.storage.sync.set({ [feat.key]: input.checked });
    if (feat.key === 'blockHomepage' && !input.checked && state.settings.puzzleBypass) {
      chrome.storage.sync.set({ puzzleBypass: false });
    }
  });

  if (proLocked) {
    row.addEventListener('click', (e) => {
      if (e.target.closest('input, .row-configure')) return;
      openUpgrade();
    });
  }

  return row;
}

function buildConfigPanel(key) {
  const panel = document.createElement('div');
  panel.className = 'config-panel';

  if (key === 'scheduledFocus') {
    const sched = state.settings.focusSchedule || DEFAULTS.focusSchedule;
    setHtml(
      panel,
      `
      <label>Days</label>
      <div class="day-picker"></div>
      <div class="time-row">
        <div>
          <label>Start</label>
          <input type="time" class="focus-start" value="${escapeAttr(sched.start)}" />
        </div>
        <div>
          <label>End</label>
          <input type="time" class="focus-end" value="${escapeAttr(sched.end)}" />
        </div>
      </div>
    `
    );
    const dayPicker = panel.querySelector('.day-picker');
    for (let i = 0; i < 7; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = DAY_LABELS[i];
      if (sched.days && sched.days.includes(i)) btn.classList.add('active');
      btn.addEventListener('click', () => {
        const current = (state.settings.focusSchedule && state.settings.focusSchedule.days) || [];
        const next = current.includes(i) ? current.filter((d) => d !== i) : [...current, i].sort();
        saveFocusSchedule({ days: next });
      });
      dayPicker.appendChild(btn);
    }
    panel.querySelector('.focus-start').addEventListener('change', (e) => {
      saveFocusSchedule({ start: e.target.value });
    });
    panel.querySelector('.focus-end').addEventListener('change', (e) => {
      saveFocusSchedule({ end: e.target.value });
    });
  } else if (key === 'sessionBudgets') {
    const budget = state.settings.sessionBudget || DEFAULTS.sessionBudget;
    setHtml(
      panel,
      `
      <label>Minutes per day</label>
      <input type="number" min="5" max="480" step="5" class="budget-minutes" value="${
        Number(budget.dailyMinutes) || 30
      }" />
    `
    );
    panel.querySelector('.budget-minutes').addEventListener('change', (e) => {
      const n = Math.max(5, Math.min(480, parseInt(e.target.value, 10) || 30));
      chrome.storage.sync.set({ sessionBudget: { dailyMinutes: n } });
    });
  }

  return panel;
}

function saveFocusSchedule(patch) {
  const current = state.settings.focusSchedule || DEFAULTS.focusSchedule;
  chrome.storage.sync.set({ focusSchedule: { ...current, ...patch } });
}

function renderAccount() {
  const footer = document.getElementById('accountFooter');
  setHtml(footer, '');
  const session = state.authSession;

  if (!session) {
    setHtml(
      footer,
      `
      <div class="upsell">
        <div class="upsell-copy">
          <span class="upsell-title">Unlock Pro</span>
          <span class="upsell-sub">Schedules &middot; analytics &middot; sponsors</span>
        </div>
        <a class="account-btn primary" href="#" data-action="upgrade">Get Pro</a>
      </div>
      <div class="account-row">
        <span class="account-email">Not signed in</span>
        <div class="account-actions">
          <a class="account-btn" href="#" data-action="signin">Sign in</a>
        </div>
      </div>
    `
    );
  } else if (session.plan === 'pro') {
    setHtml(
      footer,
      `
      <div class="account-row">
        <span class="account-email" title="${escapeAttr(session.email || '')}">${escapeHtml(
        session.email || ''
      )}</span>
        <div class="account-actions">
          <a class="account-btn" href="#" data-action="manage">Manage</a>
          <a class="account-btn" href="#" data-action="signout">Sign out</a>
        </div>
      </div>
    `
    );
  } else {
    setHtml(
      footer,
      `
      <div class="upsell">
        <div class="upsell-copy">
          <span class="upsell-title">Upgrade to Pro</span>
          <span class="upsell-sub">$4.99/mo &middot; cancel anytime</span>
        </div>
        <a class="account-btn primary" href="#" data-action="upgrade">Get Pro</a>
      </div>
      <div class="account-row">
        <span class="account-email" title="${escapeAttr(session.email || '')}">${escapeHtml(
        session.email || ''
      )}</span>
        <div class="account-actions">
          <a class="account-btn" href="#" data-action="signout">Sign out</a>
        </div>
      </div>
    `
    );
  }

  footer.querySelectorAll('[data-action]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const action = el.dataset.action;
      if (action === 'signin') {
        chrome.tabs.create({ url: `${WEB_URL}/auth/signin?next=/auth/extension` });
      } else if (action === 'upgrade') {
        openUpgrade();
      } else if (action === 'manage') {
        chrome.tabs.create({ url: `${WEB_URL}/billing` });
      } else if (action === 'signout') {
        chrome.storage.local.remove('authSession');
      }
    });
  });
}

function openUpgrade() {
  const path = state.authSession ? '/billing' : '/auth/signup?next=/billing';
  chrome.tabs.create({ url: `${WEB_URL}${path}` });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function escapeAttr(s) {
  return escapeHtml(s);
}

init();

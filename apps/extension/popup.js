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

const FREE_FEATURES = [
  {
    key: 'blockHomepage',
    label: 'Block homepage',
    desc: 'Replace homepage with search',
  },
  {
    key: 'puzzleBypass',
    label: 'Puzzle to bypass',
    desc: 'Solve a math puzzle to proceed',
    indent: true,
    dependsOn: 'blockHomepage',
  },
  {
    key: 'hideShorts',
    label: 'Hide Shorts',
    desc: 'Remove Shorts everywhere',
  },
  {
    key: 'hideComments',
    label: 'Hide comments',
    desc: 'Hide comments on videos',
  },
  {
    key: 'hideRecommended',
    label: 'Hide recommended',
    desc: 'Hide sidebar suggestions',
  },
];

const PRO_FEATURES = [
  {
    key: 'scheduledFocus',
    label: 'Scheduled focus',
    desc: 'Force blockers on during chosen hours',
    configurable: true,
  },
  {
    key: 'sessionBudgets',
    label: 'Session budgets',
    desc: 'Lock YouTube after a daily watch-time limit',
    configurable: true,
  },
  {
    key: 'autoSkipSponsors',
    label: 'Auto-skip sponsors',
    desc: 'Use SponsorBlock to jump past ads',
  },
  {
    key: 'clickbaitWarnings',
    label: 'Clickbait warnings',
    desc: 'Flag clickbait titles with AI',
  },
  {
    key: 'analytics',
    label: 'Sync analytics',
    desc: 'Send stats to yourdash (local tracking always on)',
  },
];

const LOCKED_KEYS = ['blockHomepage', 'puzzleBypass'];
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

let state = {
  settings: { ...DEFAULTS },
  authSession: null,
  puzzleActive: false,
};

async function init() {
  const [sync, local] = await Promise.all([
    chrome.storage.sync.get(DEFAULTS),
    chrome.storage.local.get({ authSession: null, puzzleActive: false }),
  ]);
  state.settings = { ...DEFAULTS, ...sync };
  state.authSession = local.authSession || null;
  state.puzzleActive = !!local.puzzleActive;

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
      render();
    }
  });
}

function isPro() {
  return !!(state.authSession && state.authSession.plan === 'pro');
}

function render() {
  renderFree();
  renderPro();
  renderAccount();
  renderPlanTag();
}

function renderPlanTag() {
  const tag = document.getElementById('planTag');
  if (!tag) return;
  if (isPro()) {
    tag.textContent = 'PRO';
    tag.classList.add('pro');
  } else {
    tag.textContent = state.authSession ? 'FREE' : 'LOCKED';
    tag.classList.remove('pro');
  }
}

function renderFree() {
  const list = document.getElementById('freeList');
  list.innerHTML = '';

  const blockEnabled = !!state.settings.blockHomepage;
  const locked = state.puzzleActive;
  const lockNotice = document.getElementById('lockNotice');
  lockNotice.hidden = !locked;

  for (const feat of FREE_FEATURES) {
    const row = document.createElement('div');
    row.className = 'toggle-row' + (feat.indent ? ' sub' : '');
    const disableForDep = feat.dependsOn && !state.settings[feat.dependsOn];
    const disabled = locked && LOCKED_KEYS.includes(feat.key);
    if (disabled || disableForDep) row.classList.add('disabled');

    row.innerHTML = `
      <div class="toggle-text">
        <div class="toggle-label">${escapeHtml(feat.label)}</div>
        <div class="toggle-desc">${escapeHtml(feat.desc)}</div>
      </div>
      <label class="switch">
        <input type="checkbox" ${state.settings[feat.key] ? 'checked' : ''} ${disabled || disableForDep ? 'disabled' : ''} />
        <span class="slider"></span>
      </label>
    `;
    const input = row.querySelector('input');
    input.addEventListener('change', () => {
      if (LOCKED_KEYS.includes(feat.key) && state.puzzleActive) {
        input.checked = !input.checked;
        return;
      }
      chrome.storage.sync.set({ [feat.key]: input.checked });
      // If blockHomepage turns off, also turn off puzzleBypass.
      if (feat.key === 'blockHomepage' && !input.checked && state.settings.puzzleBypass) {
        chrome.storage.sync.set({ puzzleBypass: false });
      }
    });
    list.appendChild(row);
  }
}

function renderPro() {
  const list = document.getElementById('proList');
  list.innerHTML = '';

  for (const feat of PRO_FEATURES) {
    const row = document.createElement('div');
    row.className = 'toggle-row';
    const unlocked = isPro();
    if (!unlocked) row.classList.add('pro-locked');

    const showConfig = !!feat.configurable && unlocked && !!state.settings[feat.key];

    row.innerHTML = `
      <div class="toggle-text">
        <div class="toggle-label">
          ${escapeHtml(feat.label)}
          ${!unlocked ? '<span class="pro-badge">PRO</span>' : ''}
        </div>
        <div class="toggle-desc">${escapeHtml(feat.desc)}</div>
      </div>
      ${feat.configurable && unlocked && state.settings[feat.key] ? '<button class="config-chevron" type="button" data-key="' + feat.key + '">Configure</button>' : ''}
      <label class="switch">
        <input type="checkbox" ${state.settings[feat.key] ? 'checked' : ''} ${!unlocked ? 'disabled' : ''} />
        <span class="slider"></span>
      </label>
    `;
    const input = row.querySelector('input');
    input.addEventListener('change', () => {
      if (!unlocked) {
        input.checked = !input.checked;
        return;
      }
      chrome.storage.sync.set({ [feat.key]: input.checked });
    });

    // Non-Pro: clicking the row opens upgrade URL
    if (!unlocked) {
      row.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT') return;
        const path = state.authSession ? '/billing' : '/auth/signin?next=/billing';
        chrome.tabs.create({ url: `${WEB_URL}${path}` });
      });
    }

    list.appendChild(row);

    // Configure panel
    if (showConfig) {
      const chevron = row.querySelector('.config-chevron');
      const panel = buildConfigPanel(feat.key);
      panel.hidden = true;
      list.appendChild(panel);
      chevron.addEventListener('click', () => {
        panel.hidden = !panel.hidden;
      });
    }
  }
}

function buildConfigPanel(key) {
  const panel = document.createElement('div');
  panel.className = 'config-panel';

  if (key === 'scheduledFocus') {
    const sched = state.settings.focusSchedule || DEFAULTS.focusSchedule;
    panel.innerHTML = `
      <label>DAYS</label>
      <div class="day-picker"></div>
      <div class="time-row">
        <div>
          <label>START</label>
          <input type="time" class="focus-start" value="${escapeAttr(sched.start)}" />
        </div>
        <div>
          <label>END</label>
          <input type="time" class="focus-end" value="${escapeAttr(sched.end)}" />
        </div>
      </div>
    `;
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
    panel.innerHTML = `
      <label>MINUTES PER DAY</label>
      <input type="number" min="5" max="480" step="5" class="budget-minutes" value="${Number(budget.dailyMinutes) || 30}" />
    `;
    panel.querySelector('.budget-minutes').addEventListener('change', (e) => {
      const n = Math.max(5, Math.min(480, parseInt(e.target.value, 10) || 30));
      chrome.storage.sync.set({ sessionBudget: { dailyMinutes: n } });
    });
  }

  return panel;
}

function saveFocusSchedule(patch) {
  const current = state.settings.focusSchedule || DEFAULTS.focusSchedule;
  const next = { ...current, ...patch };
  chrome.storage.sync.set({ focusSchedule: next });
}

function renderAccount() {
  const footer = document.getElementById('accountFooter');
  footer.innerHTML = '';
  const session = state.authSession;
  if (!session) {
    footer.innerHTML = `
      <div class="account-row">
        <span class="account-email">Sign in to unlock Pro</span>
        <div class="account-actions">
          <a class="account-btn primary" href="#" data-action="signin">Sign in</a>
        </div>
      </div>
    `;
  } else if (session.plan === 'pro') {
    footer.innerHTML = `
      <div class="account-row">
        <span class="account-email" title="${escapeAttr(session.email || '')}">${escapeHtml(session.email || '')}</span>
        <div class="account-actions">
          <a class="account-btn" href="#" data-action="manage">Manage</a>
          <a class="account-btn" href="#" data-action="signout">Sign out</a>
        </div>
      </div>
    `;
  } else {
    footer.innerHTML = `
      <div class="account-row">
        <span class="account-email" title="${escapeAttr(session.email || '')}">${escapeHtml(session.email || '')}</span>
        <div class="account-actions">
          <a class="account-btn primary" href="#" data-action="upgrade">Upgrade</a>
          <a class="account-btn" href="#" data-action="signout">Sign out</a>
        </div>
      </div>
    `;
  }

  footer.querySelectorAll('[data-action]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const action = el.dataset.action;
      if (action === 'signin') {
        chrome.tabs.create({ url: `${WEB_URL}/auth/signin?next=/auth/extension` });
      } else if (action === 'upgrade') {
        chrome.tabs.create({ url: `${WEB_URL}/billing` });
      } else if (action === 'manage') {
        chrome.tabs.create({ url: `${WEB_URL}/billing` });
      } else if (action === 'signout') {
        chrome.storage.local.remove('authSession');
      }
    });
  });
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

const FREE_DEFAULTS = {
  blockHomepage: true,
  puzzleBypass: true,
  hideShorts: true,
  hideComments: true,
  hideRecommended: true,
};

const PRO_DEFAULTS = {
  scheduledFocus: false,
  autoSkipSponsors: false,
  sessionBudgets: false,
  clickbaitWarnings: false,
  analytics: false,
};

const STATS_DEFAULTS = {
  shortsBlocked: 0,
  secondsSaved: 0,
};

const WEB_URL = "https://yt-foryou-web.vercel.app";
const SIGNIN_URL = `${WEB_URL}/auth/extension`;
const UPGRADE_URL = `${WEB_URL}/upgrade`;
const BILLING_URL = `${WEB_URL}/billing`;

const FREE_FEATURES = [
  { key: "blockHomepage", label: "Block homepage", iconName: "home" },
  { key: "puzzleBypass", label: "Puzzle to bypass", iconName: "puzzle", sub: true },
  { key: "hideShorts", label: "Hide Shorts", iconName: "shorts" },
  { key: "hideComments", label: "Hide comments", iconName: "comment" },
  { key: "hideRecommended", label: "Hide recommendations", iconName: "sidebar" },
];

const PRO_FEATURES = [
  { key: "scheduledFocus", label: "Scheduled focus", iconName: "schedule" },
  { key: "autoSkipSponsors", label: "Auto-skip sponsors", iconName: "sponsor" },
  { key: "sessionBudgets", label: "Session budgets", iconName: "budget" },
  { key: "clickbaitWarnings", label: "Clickbait warnings", iconName: "alert" },
  { key: "analytics", label: "Analytics", iconName: "chart" },
];

const LOCKED_KEYS = ["blockHomepage", "puzzleBypass"];

function icon(name) {
  const common =
    'width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  switch (name) {
    case "home":
      return `<svg ${common}><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/></svg>`;
    case "puzzle":
      return `<svg ${common}><path d="M4 10h3a2 2 0 1 0 4 0h3a2 2 0 1 1 0 4v3a2 2 0 1 0-4 0H7a2 2 0 1 1 0-4V10z"/></svg>`;
    case "shorts":
      return `<svg ${common}><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none"/></svg>`;
    case "comment":
      return `<svg ${common}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z"/></svg>`;
    case "sidebar":
      return `<svg ${common}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/></svg>`;
    case "schedule":
      return `<svg ${common}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>`;
    case "sponsor":
      return `<svg ${common}><path d="M5 4v16l8-8zM14 4v16l8-8z" fill="currentColor" stroke="none"/></svg>`;
    case "budget":
      return `<svg ${common}><circle cx="12" cy="13" r="8"/><path d="M12 8v5l3 2M9 2h6"/></svg>`;
    case "alert":
      return `<svg ${common}><path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17h.01"/></svg>`;
    case "chart":
      return `<svg ${common}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>`;
    case "lock":
      return `<svg ${common} width="12" height="12"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;
    default:
      return "";
  }
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "className") node.className = v;
    else if (k === "dataset") for (const [dk, dv] of Object.entries(v)) node.dataset[dk] = dv;
    else if (k === "innerHTML") node.innerHTML = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

function renderFreeRow(feat, checked, disabled) {
  const row = el("div", {
    className: `row${feat.sub ? " sub" : ""}${checked ? " active" : ""}${disabled ? " disabled" : ""}`,
    dataset: { key: feat.key },
  });
  row.appendChild(el("span", { className: "icon", innerHTML: icon(feat.iconName) }));
  const label = el("span", { className: "label" }, [feat.label]);
  row.appendChild(label);
  const sw = el("label", { className: "switch" });
  const input = el("input", { type: "checkbox", id: feat.key });
  input.checked = !!checked;
  input.disabled = !!disabled;
  const slider = el("span", { className: "slider" });
  sw.appendChild(input);
  sw.appendChild(slider);
  row.appendChild(sw);
  return row;
}

function renderProRow(feat, checked, locked) {
  const row = el("div", {
    className: `row${checked && !locked ? " active" : ""}${locked ? " locked" : ""}`,
    dataset: { key: feat.key, pro: "true" },
  });
  row.appendChild(el("span", { className: "icon", innerHTML: icon(feat.iconName) }));
  const label = el("span", { className: "label" }, [
    feat.label,
    el("span", { className: "pro-badge" }, ["PRO"]),
  ]);
  row.appendChild(label);
  if (locked) {
    row.appendChild(el("span", { className: "lock-sym", innerHTML: icon("lock") }));
  } else {
    const sw = el("label", { className: "switch" });
    const input = el("input", { type: "checkbox", id: feat.key });
    input.checked = !!checked;
    const slider = el("span", { className: "slider" });
    sw.appendChild(input);
    sw.appendChild(slider);
    row.appendChild(sw);
  }
  return row;
}

function openTab(url) {
  chrome.tabs.create({ url });
}

function formatHours(seconds) {
  if (!seconds) return "0";
  return (seconds / 3600).toFixed(1);
}

async function init() {
  const [syncData, localData] = await Promise.all([
    chrome.storage.sync.get({ ...FREE_DEFAULTS, ...PRO_DEFAULTS }),
    chrome.storage.local.get({ puzzleActive: false, authSession: null, stats: STATS_DEFAULTS }),
  ]);

  const session = localData.authSession;
  const plan = session?.plan === "pro" ? "pro" : session ? "free" : "out";
  let puzzleActive = !!localData.puzzleActive;

  const freeList = document.getElementById("freeList");
  const proList = document.getElementById("proList");
  const account = document.getElementById("accountArea");
  const lockNotice = document.getElementById("lockNotice");

  function activeRuleCount() {
    return Object.keys(FREE_DEFAULTS).filter((k) => syncData[k]).length;
  }

  function updateStatusAndStats() {
    document.getElementById("activeCount").textContent = String(activeRuleCount());
    document.getElementById("statShorts").textContent = String(
      localData.stats?.shortsBlocked ?? 0,
    );
    document.getElementById("statSaved").innerHTML =
      `${formatHours(localData.stats?.secondsSaved ?? 0)}<span class="unit">h</span>`;
  }

  function render() {
    freeList.innerHTML = "";
    proList.innerHTML = "";
    account.innerHTML = "";

    const blockEnabled = !!syncData.blockHomepage;

    for (const f of FREE_FEATURES) {
      let disabled = false;
      if (puzzleActive && LOCKED_KEYS.includes(f.key)) disabled = true;
      if (f.key === "puzzleBypass" && (!blockEnabled || puzzleActive)) disabled = true;
      const row = renderFreeRow(f, syncData[f.key], disabled);
      row.addEventListener("click", (e) => {
        if (e.target.tagName === "INPUT") return; // label handles it
      });
      const input = row.querySelector("input");
      input.addEventListener("change", async () => {
        if (disabled) {
          input.checked = !input.checked;
          return;
        }
        syncData[f.key] = input.checked;
        await chrome.storage.sync.set({ [f.key]: input.checked });
        render();
      });
      freeList.appendChild(row);
    }

    const locked = plan !== "pro";
    for (const f of PRO_FEATURES) {
      const row = renderProRow(f, syncData[f.key], locked);
      if (locked) {
        row.addEventListener("click", () => openTab(UPGRADE_URL));
      } else {
        const input = row.querySelector("input");
        if (input) {
          input.addEventListener("change", async () => {
            syncData[f.key] = input.checked;
            await chrome.storage.sync.set({ [f.key]: input.checked });
            render();
          });
        }
      }
      proList.appendChild(row);
    }

    if (plan === "out") {
      account.appendChild(
        el("button", {
          className: "btn btn-primary",
          onClick: () => openTab(UPGRADE_URL),
        }, ["Upgrade to Pro — $4.99/mo"]),
      );
      account.appendChild(
        el("button", {
          className: "btn btn-link",
          onClick: () => openTab(SIGNIN_URL),
        }, ["Already a subscriber? Sign in"]),
      );
    } else if (plan === "free") {
      account.appendChild(
        el("div", { className: "account-user" }, [
          el("span", { className: "email" }, [session.email ?? "Signed in"]),
          el("span", { className: "plan-pill free" }, ["FREE"]),
        ]),
      );
      account.appendChild(
        el("button", {
          className: "btn btn-primary",
          onClick: () => openTab(UPGRADE_URL),
        }, ["Upgrade to Pro — $4.99/mo"]),
      );
    } else {
      account.appendChild(
        el("div", { className: "account-user" }, [
          el("span", { className: "email" }, [session.email ?? "Signed in"]),
          el("span", { className: "plan-pill pro" }, ["PRO"]),
        ]),
      );
      account.appendChild(
        el("button", {
          className: "btn btn-ghost",
          onClick: () => openTab(BILLING_URL),
        }, ["Manage subscription"]),
      );
    }

    lockNotice.hidden = !puzzleActive;
    updateStatusAndStats();
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
      if (changes.puzzleActive) {
        puzzleActive = !!changes.puzzleActive.newValue;
        render();
      }
      if (changes.stats) {
        localData.stats = changes.stats.newValue || STATS_DEFAULTS;
        updateStatusAndStats();
      }
    }
  });

  render();
}

init();

/*
 * Service worker for YouTube ForYou.
 *
 * Responsibilities:
 *   - Receive auth messages from the web app's /auth/extension page via
 *     chrome.runtime.onMessageExternal (externally_connectable).
 *   - Schedule + run the hourly analytics sync alarm.
 *   - Sync local statsDaily deltas to the web backend, subtracting on success.
 */

importScripts('lib/api.js');

const ANALYTICS_ALARM = 'analytics-sync';

// --- Auth messaging -------------------------------------------------------

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  (async () => {
    if (!message || typeof message !== 'object') {
      sendResponse({ ok: false });
      return;
    }

    if (message.type === 'foryou:auth') {
      const session = {
        email: message.email,
        plan: message.plan || 'free',
        accessToken: message.accessToken,
        refreshToken: message.refreshToken,
        expiresAt: message.expiresAt,
        userId: message.userId,
        updatedAt: Date.now(),
      };
      await chrome.storage.local.set({ authSession: session });
      sendResponse({ ok: true });
      // After auth, try an immediate sync so fresh Pro users see data.
      syncAnalytics().catch(() => {});
      return;
    }

    if (message.type === 'foryou:signout') {
      await chrome.storage.local.remove('authSession');
      sendResponse({ ok: true });
      return;
    }

    sendResponse({ ok: false, error: 'unknown message type' });
  })();
  return true; // keep channel open for async sendResponse
});

// --- Alarms --------------------------------------------------------------

function ensureAlarm() {
  chrome.alarms.get(ANALYTICS_ALARM, (existing) => {
    if (!existing) {
      chrome.alarms.create(ANALYTICS_ALARM, { periodInMinutes: 60 });
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  ensureAlarm();
  syncAnalytics().catch(() => {});
});

chrome.runtime.onStartup.addListener(() => {
  ensureAlarm();
  syncAnalytics().catch(() => {});
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ANALYTICS_ALARM) {
    syncAnalytics().catch(() => {});
  }
});

// --- Analytics sync ------------------------------------------------------

async function getSettings() {
  return chrome.storage.sync.get({ analytics: false });
}

async function getStatsDaily() {
  const data = await chrome.storage.local.get({ statsDaily: {} });
  return data.statsDaily || {};
}

async function setStatsDaily(statsDaily) {
  await chrome.storage.local.set({ statsDaily });
}

function zeroBucket() {
  return {
    shortsBlocked: 0,
    secondsWatchedLong: 0,
    secondsWatchedShorts: 0,
    sponsorsSkipped: 0,
    clickbaitFlagged: 0,
  };
}

function hasNonZeroDeltas(bucket) {
  if (!bucket) return false;
  return Object.values(bucket).some((v) => typeof v === 'number' && v > 0);
}

async function syncAnalytics() {
  const { analytics } = await getSettings();
  if (!analytics) return;

  const session = await (globalThis.getAuthSession ? globalThis.getAuthSession() : Promise.resolve(null));
  if (!session || session.plan !== 'pro') return;

  const statsDaily = await getStatsDaily();
  const dates = Object.keys(statsDaily).filter((d) => hasNonZeroDeltas(statsDaily[d]));
  if (dates.length === 0) return;

  for (const date of dates) {
    const deltas = statsDaily[date];
    try {
      const resp = await globalThis.apiFetch('/api/analytics/sync', {
        method: 'POST',
        body: JSON.stringify({ date, deltas }),
      });
      if (resp.ok) {
        // Subtract synced deltas. Since nothing else has mutated this
        // bucket between read and write here (no concurrent writers in SW),
        // we can zero it out. Content scripts additively increment, so if
        // a race occurs, the worst case is re-sending a tiny delta next
        // hour, never double-billing server-side assuming the server
        // treats (user, date, delta) as additive.
        const fresh = await getStatsDaily();
        const current = fresh[date] || zeroBucket();
        const updated = { ...current };
        for (const k of Object.keys(deltas)) {
          updated[k] = Math.max(0, (current[k] || 0) - (deltas[k] || 0));
        }
        fresh[date] = updated;
        await setStatsDaily(fresh);
      }
      // Non-200 (other than 401 which apiFetch retried): leave local state
      // alone, try again next hour.
    } catch (e) {
      // Network or auth failure. apiFetch already cleared the session on
      // refresh failure; nothing else to do.
      return;
    }
  }
}

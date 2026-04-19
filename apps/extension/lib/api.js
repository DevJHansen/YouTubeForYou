/*
 * Shared API helpers for YouTube ForYou extension.
 *
 * Loaded as the first content script so helpers are available to content.js
 * via globals. Also imported by background.js via importScripts().
 *
 * Exposes (on globalThis / window):
 *   WEB_URL                        - base URL for the web backend
 *   getAuthSession()               - returns authSession object or null
 *   clearAuthSession()             - removes authSession from chrome.storage.local
 *   refreshAuthSession()           - refreshes token (returns new session or null)
 *   apiFetch(path, init)           - fetch with auth, handles 401 + refresh
 *   todayKey()                     - returns "YYYY-MM-DD" in local time
 */

(function () {
  const WEB_URL = 'https://yt-foryou-web.vercel.app';
  const REFRESH_LEEWAY_SECONDS = 60;

  async function getAuthSession() {
    try {
      const data = await chrome.storage.local.get({ authSession: null });
      return data.authSession || null;
    } catch (e) {
      return null;
    }
  }

  async function setAuthSession(session) {
    await chrome.storage.local.set({ authSession: session });
  }

  async function clearAuthSession() {
    await chrome.storage.local.remove('authSession');
  }

  async function refreshAuthSession() {
    const session = await getAuthSession();
    if (!session || !session.refreshToken) {
      await clearAuthSession();
      return null;
    }
    try {
      const resp = await fetch(`${WEB_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refreshToken }),
      });
      if (!resp.ok) {
        await clearAuthSession();
        return null;
      }
      const data = await resp.json();
      const updated = {
        ...session,
        accessToken: data.access_token || data.accessToken,
        refreshToken: data.refresh_token || data.refreshToken || session.refreshToken,
        expiresAt: data.expires_at || data.expiresAt || (Math.floor(Date.now() / 1000) + 3600),
        updatedAt: Date.now(),
      };
      await setAuthSession(updated);
      return updated;
    } catch (e) {
      return null;
    }
  }

  function isExpiringSoon(session) {
    if (!session || !session.expiresAt) return true;
    const now = Math.floor(Date.now() / 1000);
    return session.expiresAt - now < REFRESH_LEEWAY_SECONDS;
  }

  async function apiFetch(path, init) {
    init = init || {};
    let session = await getAuthSession();
    if (!session) throw new Error('Not authenticated');

    if (isExpiringSoon(session)) {
      session = await refreshAuthSession();
      if (!session) throw new Error('Token refresh failed');
    }

    const url = path.startsWith('http') ? path : `${WEB_URL}${path}`;
    const headers = new Headers(init.headers || {});
    headers.set('Authorization', `Bearer ${session.accessToken}`);
    if (init.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    let resp = await fetch(url, { ...init, headers });

    if (resp.status === 401) {
      const refreshed = await refreshAuthSession();
      if (!refreshed) throw new Error('Unauthorized');
      const retryHeaders = new Headers(init.headers || {});
      retryHeaders.set('Authorization', `Bearer ${refreshed.accessToken}`);
      if (init.body && !retryHeaders.has('Content-Type')) {
        retryHeaders.set('Content-Type', 'application/json');
      }
      resp = await fetch(url, { ...init, headers: retryHeaders });
    }

    return resp;
  }

  function todayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  const api = {
    WEB_URL,
    getAuthSession,
    setAuthSession,
    clearAuthSession,
    refreshAuthSession,
    apiFetch,
    todayKey,
  };

  // Expose on globalThis so both content scripts (window) and service workers
  // (self) can pick up the helpers.
  globalThis.ForYouApi = api;
  globalThis.WEB_URL = WEB_URL;
  globalThis.getAuthSession = getAuthSession;
  globalThis.clearAuthSession = clearAuthSession;
  globalThis.refreshAuthSession = refreshAuthSession;
  globalThis.apiFetch = apiFetch;
  globalThis.todayKey = todayKey;
})();

// Service worker: bridges web auth tab → chrome.storage.local.
// /auth/extension sends { type: "foryou:auth", payload: { email, plan, accessToken, expiresAt, userId } }
// /auth/signout in popup posts { type: "foryou:signout" }.

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== "object") {
    sendResponse({ ok: false, error: "invalid message" });
    return false;
  }

  if (message.type === "foryou:auth") {
    const p = message.payload || {};
    const authSession = {
      email: p.email,
      plan: p.plan === "pro" ? "pro" : "free",
      accessToken: p.accessToken,
      expiresAt: p.expiresAt,
      userId: p.userId,
      updatedAt: Date.now(),
    };
    chrome.storage.local.set({ authSession }, () => sendResponse({ ok: true }));
    return true; // keep channel open for async sendResponse
  }

  if (message.type === "foryou:signout") {
    chrome.storage.local.remove("authSession", () => sendResponse({ ok: true }));
    return true;
  }

  sendResponse({ ok: false, error: "unknown type" });
  return false;
});

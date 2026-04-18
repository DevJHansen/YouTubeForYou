---
name: chrome-extension-mv3
description: Use when writing or modifying code in apps/extension/. Covers Manifest V3 conventions, chrome.storage, content-script lifecycle, message passing, and pitfalls specific to YouTube SPA navigation.
---

# Chrome Extension (Manifest V3) — project conventions

This skill applies to `apps/extension/`. The extension is a YouTube-focused content script + popup UI, using Manifest V3 and `chrome.storage.sync`.

## File layout (current)

- `manifest.json` — MV3 manifest, `run_at: document_start` on `www.youtube.com/*`
- `content.js` — single content script, runs on all YT pages, handles overlay + settings sync
- `popup.html` / `popup.js` — browser action popup with toggle UI
- `styles.css` — injected as a content stylesheet
- `icon*.png` — icon assets

## Conventions

1. **Settings live in `chrome.storage.sync`.** One flat object, no nesting. Keys are camelCase booleans or small primitives. Defaults are declared in a single `DEFAULT_SETTINGS` constant in `content.js` and `popup.js` (keep them in sync).
2. **SPA navigation.** YouTube is a SPA — `window.location.href` changes without full reloads. Watch for URL changes with a `MutationObserver` on `document` + a `popstate` listener. Re-run the gate check on every navigation.
3. **Flash-of-content avoidance.** Apply hide classes to `document.documentElement` at `document_start` BEFORE storage loads (use `DEFAULT_SETTINGS`), then reconcile after `chrome.storage.sync.get`.
4. **No persistent background script in MV3.** If you need background work, use a service worker (`background.service_worker` in manifest). Service workers can be terminated — don't hold in-memory state; persist to `chrome.storage`.
5. **Message passing.** Prefer `chrome.runtime.sendMessage` + `chrome.runtime.onMessage`. Always respond with `sendResponse(...)` or return `true` to keep the channel open for async responses.
6. **No remote code.** MV3 forbids loading JS from remote URLs. AI features must call out via `fetch` to YOUR backend, which then proxies to the LLM provider. Never put API keys in the extension.
7. **Permissions minimalism.** Only request what's needed. `storage` + host permissions for `*://www.youtube.com/*` — nothing else unless a feature demands it. Adding `tabs` or `<all_urls>` will trigger a Chrome Web Store review.

## Pro features that route through the web backend

When implementing pro-tier features (clickbait warning, TLDR, session budgets server-sync), the extension should:

1. Read the user's auth token from a known `chrome.storage.local` key set by a popup-triggered OAuth flow with our web app.
2. Call our Next.js API route (e.g., `api.yt-foryou.com/v1/clickbait`) with the token.
3. Gracefully degrade if the user isn't logged in or their quota is exhausted — never break the free experience.
4. Cache responses locally (IndexedDB or `chrome.storage.local`) with a TTL to reduce backend load. E.g., clickbait verdict per videoId, TTL 7 days.

## Common pitfalls

- **`document.body` may not exist at `document_start`.** Append overlays to `document.documentElement` instead.
- **YouTube injects DOM async.** Don't assume elements exist on first pass — observe or retry.
- **`chrome.storage.sync` has quotas** (8KB per item, 100KB total, 1800 writes/hour). Batch writes. Keep values small. For larger per-user data (notes, analytics), use `chrome.storage.local` or sync to the web backend.
- **Shorts redirect loops.** When redirecting away from `/shorts/*`, check you're not already on the homepage to avoid loops.

## Testing

- Load unpacked: `chrome://extensions/` → Developer mode → Load unpacked → select `apps/extension/`.
- Test: homepage block, shorts redirect, comments/recommended hiding, popup toggles, puzzle bypass, settings persistence across tabs.
- For pro features, test graceful degradation when: logged out, quota exhausted, backend unreachable.

## Release checklist

- [ ] Manifest `version` bumped
- [ ] `chrome.storage.sync` schema unchanged OR migration in place
- [ ] Permissions unchanged (any addition triggers CWS review)
- [ ] Screenshots/listing match current UI
- [ ] Zipped `apps/extension/` (exclude README, .DS_Store) uploaded to CWS dashboard

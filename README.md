# YouTube ForYou

A YouTube distraction blocker. Free Chrome extension + Pro web features.

<a href="https://buymeacoffee.com/builtby_justin" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="150">
</a>

## Monorepo layout

- [`apps/extension`](apps/extension/) — Chrome MV3 extension (free tier)
- [`apps/web`](apps/web/) — Next.js web app (landing page, billing, Pro APIs)

## Dev

```bash
pnpm install
pnpm dev         # runs the Next.js web app
```

For the extension: load `apps/extension/` unpacked at `chrome://extensions/`.

## License

MIT

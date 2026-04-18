---
description: End-of-feature pipeline — simplify, security-review, then code review. Run before opening a PR.
---

You are running the `/ship` pipeline on the current working changes. Execute the steps in order and report a summary at the end.

## Preflight

1. Run `git status --short` and `git diff --stat` to identify changed files.
2. If there are no uncommitted changes AND no commits ahead of `main`/`dev`, stop and tell the user there's nothing to ship.
3. If user passed `$ARGUMENTS`, treat it as scope context (e.g., "just the web app", "just the billing flow") and narrow accordingly.

## Step 1 — Simplify (loop)

Invoke the `simplify` skill on the changed files. It should:
- Find duplication with existing code that can be reused.
- Flag overengineered patterns (premature abstractions, unused flexibility).
- Remove dead code and unnecessary comments.

Apply its fixes. Do NOT add features, refactor unrelated code, or expand scope.

## Step 2 — Security review

Invoke the `security-review` skill (or `/security-review` command if available) on the staged + unstaged diff. Focus on:
- Secrets/keys in code or env examples.
- Auth/authorization gaps (RLS on Supabase, webhook signature verification on Polar).
- Input validation at API boundaries and webhook endpoints.
- XSS/injection risk in any rendered user content.
- Over-permissive CORS or permissions in manifest.json.

Fix any High/Critical findings before continuing. Flag Medium findings in the final summary.

## Step 3 — Code review

Spawn the `code-reviewer` agent (from `feature-dev` plugin) against the full set of changes. Pass it:
- The diff range (use `git diff main...HEAD` if on a feature branch, else staged + unstaged).
- The goal of the change (from commit messages or `$ARGUMENTS`).

## Step 4 — Summary

Print a final checklist:
- [ ] Simplify fixes applied: <N>
- [ ] Security findings: <High/Crit: N | Med: N | Low: N>
- [ ] Code review verdict: <approve | changes requested>
- [ ] Known tradeoffs / intentional decisions: <bullets>

Do NOT commit, push, or open a PR automatically. End with: "Ready to ship? Run `git commit` / `gh pr create` when you're happy."

## AI cost safety reminder

If the changes introduce any OpenAI/Anthropic API calls (clickbait detection, TLDR summaries), verify that:
- There's a per-user quota enforced server-side.
- Requests are rate-limited at the edge.
- Free-tier users are blocked from AI endpoints or given a stub response.

Flag any violations in the summary.

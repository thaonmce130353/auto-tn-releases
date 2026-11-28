# AGENTS.md — rules for AI coding agents (Claude, Codex, GitHub Copilot, any tool)

Public buyer website of Auto Tiên Nghịch (`https://autotiennghich.online`): sales page, install guide, version history, PC zip downloads. Developer guide: the "Developer guide" section of [README.md](README.md). System view: the game repo `game-tien-nghich-automation-daily` (`AGENTS.md`, `docs/handbook/`). This file is the single source of rules; `CLAUDE.md` and `.github/copilot-instructions.md` point here.

## Non-negotiable rules

1. **The repo root IS the public website.** Every root file is served unless listed in `.assetsignore`. Before adding any file not meant for buyers (notes, docs, scripts, tool configs), add it to `.assetsignore`. Never add secrets, keys or private links: this repo is public.
2. `worker.mjs` serves only `/tn-extension-latest.zip`, `/tn-extension-<x.y.z>.zip` and `/VERSIONS.md` from R2 (GET/HEAD). It must never serve anything else from the bucket (the bucket also holds a private `staging/` inbox).
3. Nothing is committed for downloads: the admin page writes the zips and `VERSIONS.md` into R2.
4. Text is plain Vietnamese for non-technical buyers; check the layout at iPhone width (~390 pt) and on PC. Prices live only in `index.html` `#bang-gia`; keep them in sync with the game repo `docs/pricing-plan.md`, and plan hours with `auto-tn-server/lib/plans.js`.
5. `wrangler.jsonc` keeps the empty `"previews": {}` block. Stay on the Cloudflare free tier.

## Validation

`node --test test/worker.test.mjs` must pass.

## Git flow

Feature branch (`claude/<topic>`, `codex/<topic>`, `copilot/<topic>` or `<name>/<topic>`) → PR to `main`; never push to `main`. Merging to `main` redeploys the site.

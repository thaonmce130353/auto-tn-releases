# Auto Tiên Nghịch — bản tải về

Trang hướng dẫn (iPhone + PC) và liên kết tải: **https://autotiennghich.online/** (cũ vẫn dùng được: https://auto-tn-releases.nguyenminhthaobt1.workers.dev/)

Hosting: Cloudflare Workers (`wrangler.jsonc`): the guide page is a static asset; `worker.mjs` serves the PC zips and `VERSIONS.md` from the R2 bucket `auto-tn-zips`, which the admin page fills on every release (no zips are committed to this repo). Create the bucket first (dashboard → R2 → Create bucket). GitHub Pages is no longer used.

Tiện ích PC cần **key bản quyền** để dùng; không có key thì không làm gì. Tải trực tiếp bản mới nhất: [`tn-extension-latest.zip`](tn-extension-latest.zip). Danh sách phiên bản: [`VERSIONS.md`](VERSIONS.md).

---

## Developer guide

The buyer-facing website of Auto Tiên Nghịch: sales page, install guide, version history and the PC zip downloads. System-wide picture (license server, admin page, release pipeline): the game repo `docs/handbook/` (start with `README.md` and `architecture.md`).

**This repo is public and its root IS the website.** Every file at the root is served as a static asset unless it is listed in [`.assetsignore`](.assetsignore) (today: `.git`, `.assetsignore`, `wrangler.jsonc`, `worker.mjs`, `test`, `README.md`, `VERSIONS.md`). Before adding any file that is not meant for buyers (notes, docs, scripts), add it to `.assetsignore`. Never put secrets, keys or private links here.

### Files

| File | Role |
|---|---|
| `index.html` | Sales landing page: problems solved (`#van-de`), features (`#tinh-nang`), how to use (`#cach-dung`), updates (`#cap-nhat`, latest version read from `VERSIONS.md`), **prices** (`#bang-gia`: Trial / Standard / Pro / Max), contact (`#lien-he`: Zalo QR `zalo-qr.jpg`, Facebook), FAQ (`#hoi-dap`) |
| `huong-dan.html` | Install guide for iPhone (Userscripts app + iOS Shortcut) and PC (unzip, Developer mode, Load unpacked; keep-sites-active tip for Edge/Chrome), with the latest PC download link |
| `phien-ban.html` | Version history ("Lịch sử phiên bản"), rendered in the browser from `VERSIONS.md` |
| `site-header.js` | Shared header/nav for every page (one source so the pages stay in sync) |
| `hud-iphone.webp`, `hud-pc.webp`, `og-image.png`, favicons | Images (social preview, HUD screenshots, icons) |
| `_headers` | Cache headers for static assets (`index.html` always revalidated) |
| `worker.mjs` | The only code: serves `/tn-extension-latest.zip`, `/tn-extension-<x.y.z>.zip` and `/VERSIONS.md` from the R2 bucket (binding `ZIPS`, GET/HEAD only, `no-cache`); everything else goes to the static assets |
| `wrangler.jsonc` | Worker config: assets = repo root, `run_worker_first` only for the zip and `VERSIONS.md` paths, R2 bucket `auto-tn-zips`, custom domains `autotiennghich.online` + `www`, empty `previews` block (required, keeps PR previews away from production data) |
| `test/worker.test.mjs` | Tests of `worker.mjs` with a fake bucket |

### Where the downloads come from

Nothing is committed here. The admin page Worker (`auto-tn-admin-web`) writes `tn-extension-<ver>.zip`, `tn-extension-latest.zip` and `VERSIONS.md` into R2 when the owner publishes or promotes a release; this Worker only reads them. The bucket also holds a private `staging/` inbox used by CI: `worker.mjs` must never serve anything outside the three public name patterns (the regex `ZIP` and the exact `/VERSIONS.md` path), and the bucket's own public access must stay Disabled.

### Working on it

```bash
node --test test/worker.test.mjs   # 3 tests, no dependencies
npx wrangler dev                   # optional local preview (needs wrangler); without an R2 binding the zip links 404
```

Opening the HTML files directly in a browser also works for layout work (the version boxes stay empty without `VERSIONS.md`).

Rules for content: Vietnamese, plain words for non-technical buyers; check the layout on an iPhone-sized screen (≈390 pt wide) and on PC. Prices appear only in `index.html` `#bang-gia`; keep them in sync with the game repo `docs/pricing-plan.md`, and the plan hours with `auto-tn-server/lib/plans.js`.

Branch → PR to `main`; merging to `main` redeploys the site (Cloudflare Workers Builds). Never push to `main` directly.

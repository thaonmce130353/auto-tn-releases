# Auto Tiên Nghịch — bản tải về

Trang hướng dẫn (iPhone + PC) và liên kết tải: **https://autotiennghich.online/** (cũ vẫn dùng được: https://auto-tn-releases.nguyenminhthaobt1.workers.dev/)

Hosting: Cloudflare Workers (`wrangler.jsonc`): the guide page is a static asset; `worker.mjs` serves the PC zips and `VERSIONS.md` from the R2 bucket `auto-tn-zips`, which the admin page fills on every release (no zips are committed to this repo). Create the bucket first (dashboard → R2 → Create bucket). GitHub Pages is no longer used.

Tiện ích PC cần **key bản quyền** để dùng; không có key thì không làm gì. Tải trực tiếp bản mới nhất: [`tn-extension-latest.zip`](tn-extension-latest.zip). Danh sách phiên bản: [`VERSIONS.md`](VERSIONS.md).

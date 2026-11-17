// Buyer site Worker: the guide page and icons are static assets (free, unlimited); the PC zips and VERSIONS.md live in the R2 bucket ZIPS
// (written by the admin page on every release) and are served here. Everything else falls through to the static assets.
const ZIP = /^\/tn-extension-(latest|\d+\.\d+\.\d+)\.zip$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isZip = ZIP.test(url.pathname);
    if ((isZip || url.pathname === '/VERSIONS.md') && env.ZIPS) {
      if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
      const obj = await env.ZIPS.get(url.pathname.slice(1));
      if (!obj) return new Response('not found', { status: 404, headers: { 'Cache-Control': 'no-cache' } });
      const headers = new Headers({
        'Content-Type': isZip ? 'application/zip' : 'text/markdown; charset=utf-8',
        'Cache-Control': 'no-cache',   // the latest zip and the version list change on every release; versioned zips are immutable but small
        'X-Content-Type-Options': 'nosniff',
      });
      if (isZip) headers.set('Content-Disposition', 'attachment; filename="' + url.pathname.slice(1) + '"');
      if (obj.size != null) headers.set('Content-Length', String(obj.size));
      return new Response(request.method === 'HEAD' ? null : obj.body, { status: 200, headers });
    }
    return env.ASSETS.fetch(request);
  },
};

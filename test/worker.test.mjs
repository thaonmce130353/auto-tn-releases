import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.mjs';

const bucket = (files) => ({ get: async (k) => (files[k] == null ? null : { body: new Response(files[k]).body, size: files[k].length }) });
const assets = { fetch: async (r) => new Response('asset ' + new URL(r.url).pathname) };
const call = (path, env, init) => worker.fetch(new Request('https://x' + path, init), env);

test('zips and VERSIONS.md come from R2; the page comes from assets', async () => {
  const env = { ZIPS: bucket({ 'tn-extension-latest.zip': 'PKdata', 'tn-extension-1.0.20.zip': 'PKold', 'VERSIONS.md': '# v' }), ASSETS: assets };
  const z = await call('/tn-extension-latest.zip', env);
  assert.equal(z.status, 200); assert.equal(await z.text(), 'PKdata');
  assert.equal(z.headers.get('content-type'), 'application/zip');
  assert.match(z.headers.get('content-disposition'), /tn-extension-latest\.zip/);
  assert.equal(z.headers.get('cache-control'), 'no-cache');
  assert.equal((await call('/tn-extension-1.0.20.zip', env)).status, 200);
  assert.match((await call('/VERSIONS.md', env)).headers.get('content-type'), /markdown/);
  assert.equal(await (await call('/index.html', env)).text(), 'asset /index.html');
  assert.equal(await (await call('/', env)).text(), 'asset /');
});

test('missing object is 404, odd names and methods are not served from R2', async () => {
  const env = { ZIPS: bucket({ 'tn-extension-latest.zip': 'x' }), ASSETS: assets };
  assert.equal((await call('/tn-extension-1.0.99.zip', env)).status, 404);
  assert.equal(await (await call('/tn-extension-evil.zip', env)).text(), 'asset /tn-extension-evil.zip');   // not a version -> falls through
  assert.equal((await call('/tn-extension-latest.zip', env, { method: 'POST' })).status, 405);
  const head = await call('/tn-extension-latest.zip', env, { method: 'HEAD' });
  assert.equal(head.status, 200); assert.equal(await head.text(), '');
});

// The release pipeline stores the whole package (admin builds included) in the SAME bucket under staging/<version>/. The buyer site must never serve it:
// only tn-extension-latest.zip, tn-extension-<x.y.z>.zip and VERSIONS.md may ever be read from R2.
test('staging/ objects (admin builds, unreleased zips) are never read from R2 or served', async () => {
  const files = { 'staging/1.2.3/tien-nghich-auto.user.js': 'ADMIN BUILD', 'staging/1.2.3/tn-bundle.js': 'ADMIN BUNDLE', 'staging/1.2.3/tn-extension-1.2.3.zip': 'PKnext', 'staging/1.2.3/manifest.json': '{}', 'tn-extension-latest.zip': 'PKpublic' };
  const asked = [];
  const env = { ZIPS: { get: async (k) => { asked.push(k); return files[k] == null ? null : { body: new Response(files[k]).body, size: files[k].length }; } }, ASSETS: assets };
  const paths = [
    '/staging/1.2.3/tn-bundle.js', '/staging/1.2.3/tien-nghich-auto.user.js', '/staging/1.2.3/tn-extension-1.2.3.zip', '/staging/1.2.3/manifest.json',
    '/staging%2F1.2.3%2Ftn-bundle.js', '/staging/../tn-extension-latest.zip/../staging/1.2.3/tn-bundle.js', '//staging/1.2.3/tn-bundle.js',
    '/tn-bundle.js', '/manifest.json', '/tien-nghich-auto.user.js', '/tn-extension-1.2.3.zip/staging', '/staging/', '/staging',
  ];
  for (const p of paths) {
    const r = await call(p, env);
    const body = await r.text();
    assert.doesNotMatch(body, /ADMIN|PKnext/, p);   // never the staged content
    assert.ok(r.status === 200 || r.status === 404, p);
    if (r.status === 200) assert.match(body, /^asset /, p);   // the only 200 is the static-site fallback
  }
  assert.deepEqual(asked.filter((k) => k.startsWith('staging/')), []);   // R2 was never even asked for a staged key
  for (const k of asked) assert.match(k, /^(tn-extension-(latest|\d+\.\d+\.\d+)\.zip|VERSIONS\.md)$/);   // nothing but the public names is ever read
  // and the public names keep working with staging present in the bucket
  const ok = await call('/tn-extension-latest.zip', env);
  assert.equal(ok.status, 200); assert.equal(await ok.text(), 'PKpublic');
});

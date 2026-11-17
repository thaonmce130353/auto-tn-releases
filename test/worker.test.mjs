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

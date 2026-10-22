const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');
const { once } = require('node:events');
async function availablePort() {
  const server = net.createServer(); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const port = server.address().port; await new Promise(resolve => server.close(resolve)); return port;
}
for (const entry of ['scraping-server.js', 'scraping-server-full.js']) {
  test(`${entry}: health, authentication and invalid URL without external calls`, { timeout: 30000 }, async t => {
    const port = await availablePort();
    const child = spawn(process.execPath, [path.join(__dirname, '../server', entry)], {
      cwd: path.resolve(__dirname, '..'),
      // Do not inherit personal cloud credentials/API keys from the test machine.
      env: { PATH: process.env.PATH, NODE_ENV: 'production', PORT: String(port), INTERNAL_API_KEY: 'local-test-only' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let logs = ''; child.stdout.on('data', data => logs += data); child.stderr.on('data', data => logs += data);
    t.after(async () => { const exited = once(child, 'exit'); child.kill('SIGTERM'); await exited; });
    const url = `http://127.0.0.1:${port}`;
    let health;
    for (let attempt = 0; attempt < 100; attempt++) {
      try { health = await fetch(url + '/api/health'); break; } catch {}
      if (child.exitCode !== null) assert.fail(`server exited: ${logs}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(health, logs); assert.equal(health.status, 200);
    const data = await health.json(); assert.equal(data.status, 'ok'); assert.equal(data.nodeVersion, process.versions.node);
    const request = body => ({ method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': 'local-test-only' }, body: JSON.stringify(body) });
    assert.equal((await fetch(url + '/api/scrape', { method: 'POST' })).status, 401);
    assert.equal((await fetch(url + '/api/scrape', request({}))).status, 400);
    assert.equal((await fetch(url + '/api/scrape', request({ url: 'http://127.0.0.1/private' }))).status, 400);
  });
}

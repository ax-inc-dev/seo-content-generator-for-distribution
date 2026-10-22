const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const net = require('node:net');
const puppeteer = require('../server/node_modules/puppeteer');
async function main() {
  const browser = await puppeteer.launch({ executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    for (const component of ['.', 'ai-article-imager-for-wordpress']) {
      const directory = path.resolve(__dirname, '..', component);
      const listener = net.createServer(); listener.listen(0, '127.0.0.1'); await once(listener, 'listening');
      const port = listener.address().port; await new Promise(resolve => listener.close(resolve));
      const server = spawn(process.execPath, [path.join(directory, 'node_modules/vite/bin/vite.js'), 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
        cwd: directory, env: { PATH: process.env.PATH }, stdio: 'ignore',
      });
      const page = await browser.newPage();
      const errors = []; page.on('pageerror', error => { errors.push(error.message); console.error(component + ': ' + error.message); });
      const url = `http://127.0.0.1:${port}`;
      try {
        // No paid APIs, personal credentials, WordPress/Slack writes or remote data.
        await page.setRequestInterception(true);
        page.on('request', request => {
          if (request.url().startsWith('https://cdn.tailwindcss.com')) return request.respond({ status: 200, contentType: 'application/javascript', body: process.env.SMOKE_TAILWIND_FILE ? fs.readFileSync(process.env.SMOKE_TAILWIND_FILE, 'utf8') : 'window.tailwind = { config: {} };' });
          if (!request.url().startsWith(url) && !request.url().startsWith('data:')) return request.abort();
          if (request.url().includes('/api/')) return request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', success: true, defaultPostStatus: 'draft' }) });
          request.continue();
        });
        let ready = false;
        for (let attempt = 0; attempt < 100; attempt++) {
          try { const response = await fetch(url); if (response.ok) { ready = true; break; } } catch {}
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        assert.ok(ready, `${component}: preview did not start`);
        await page.goto(url, { waitUntil: 'networkidle0' });
        await page.waitForFunction(() => document.querySelector('#root')?.textContent.length > 30, { timeout: 15000 });
        assert.deepEqual(errors, [], `${component}: browser errors`);
        const text = await page.$eval('#root', element => element.textContent);
        assert.match(text, /記事|画像|キーワード/);
        if (component !== '.') {
          const manifest = await (await fetch(url + '/default-images/manifest.json')).json();
          assert.equal(manifest.files.length, 5);
          assert.ok(!manifest.files.includes('サービス訴求.png'));
          for (const file of manifest.files) assert.equal((await fetch(url + '/default-images/' + encodeURIComponent(file))).status, 200);
        }
        if (process.env.SMOKE_SCREENSHOT_DIR) {
          await page.setViewport({ width: 1280, height: 900 });
          await page.screenshot({ path: path.join(process.env.SMOKE_SCREENSHOT_DIR, component === '.' ? 'frontend.png' : 'image.png') });
        }
        console.log(`${component}: UI rendered, no uncaught errors; local fixture only`);
      } finally { await page.close(); const exited = once(server, 'exit'); server.kill('SIGTERM'); await exited; }
    }
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

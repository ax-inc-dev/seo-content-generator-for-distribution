const { spawn } = require('node:child_process');
const path = require('node:path');
require('../check-node.cjs').assertSupported();
const root = path.resolve(__dirname, '..');
const children = [];
let stopping = false;
function stop(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
  const timeout = setTimeout(() => {
    for (const child of children) child.kill('SIGKILL');
  }, 3000);
  Promise.all(children.map(child => new Promise(resolve => {
    if (child.exitCode !== null || child.signalCode !== null) resolve();
    else child.once('exit', resolve);
  }))).then(() => { clearTimeout(timeout); process.exit(code); });
}
for (const entry of ['server/scraping-server.js', 'node_modules/vite/bin/vite.js']) {
  const child = spawn(process.execPath, [path.join(root, entry)], { cwd: root, stdio: 'inherit' });
  children.push(child);
  child.on('error', error => { console.error(error.message); stop(1); });
  child.on('exit', code => { if (!stopping) stop(code || 1); });
}
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

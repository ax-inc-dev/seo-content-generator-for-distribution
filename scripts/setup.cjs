const { spawnSync } = require('node:child_process');
const path = require('node:path');
require('../check-node.cjs').assertSupported();
// Install every component from its lockfile. API keys are configured separately.
for (const directory of ['.', 'server', 'ai-article-imager-for-wordpress']) {
  console.log(`\nInstalling: ${directory}`);
  const result = spawnSync(process.execPath, [process.env.npm_execpath, 'ci'], {
    cwd: path.resolve(__dirname, '..', directory), stdio: 'inherit',
  });
  if (result.error) { console.error(result.error.message); process.exit(1); }
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log('\nセットアップ完了。.env を設定して npm start で起動してください。');

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
require('../check-node.cjs').assertSupported();
const root = path.resolve(__dirname, '..');
const run = args => execFileSync('git', args, { cwd: root }).toString().trim();
if (run(['status', '--porcelain', '--untracked-files=normal'])) {
  console.error('配布ZIPはコミット済みのクリーンな状態から作成してください。'); process.exit(1);
}
execFileSync(process.execPath, [path.join(__dirname, 'check-distribution.cjs')], { stdio: 'inherit' });
const sha = run(['rev-parse', '--short=12', 'HEAD']);
const output = path.join(root, 'release', `seo-content-generator-${sha}.zip`);
fs.mkdirSync(path.dirname(output), { recursive: true });
execFileSync('git', ['archive', '--format=zip', '--prefix=seo-content-generator/', `--output=${output}`, 'HEAD'], { cwd: root });
console.log(`配布ZIP（Git履歴・ローカル設定を含みません）: ${output}`);

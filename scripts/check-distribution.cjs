const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const problems = [];
const files = execFileSync('git', ['ls-files', '-z'], { cwd: root }).toString().split('\0').filter(Boolean);
// Removed provider logo: prevent accidentally reintroducing the same binary.
const excludedImageDigest = 'e3e57aab7e7d79fffb12ecb6206d363b9ebfbca22b73a206cb4a1cc20ff5cb04';
for (const file of files) {
  const base = path.basename(file);
  if ((/^\.env(?:\.|$)/.test(base) && base !== '.env.example') ||
      /\.(?:pem|key|pickle)$/.test(file) || /(?:credentials|service-account).*\.json$/i.test(base)) {
    problems.push(`${file}: 配布対象に認証ファイルを含めないでください`);
  }
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue; // staged deletions are checked through git status at packaging time
  const content = fs.readFileSync(full);
  if (createHash('sha256').update(content).digest('hex') === excludedImageDigest) {
    problems.push(`${file}: 配布対象外の提供元ロゴです`);
  }
  if (content.includes(0) || file === 'scripts/check-distribution.cjs') continue;
  const text = content.toString('utf8');
  const patterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /AIza[0-9A-Za-z_-]{35}/,
    /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}/,
    /\bGOCSPX-[A-Za-z0-9_-]{20,}/,
    /https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]{20,}/,
    /\ba-x\.inc\b/i,
    /株式会社\s*AX|AX\s*CAMP/i,
  ];
  if (patterns.some(pattern => pattern.test(text))) problems.push(`${file}: 配布対象外の情報の候補があります（値は表示しません）`);
}
if (problems.length) {
  console.error(problems.join('\n')); process.exit(1);
}
console.log(`配布対象 ${files.length} ファイル: 認証ファイル・既知の提供元情報のチェック通過`);

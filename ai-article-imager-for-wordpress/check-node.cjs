// Dependency-free: also runs before npm install and when the server is started directly.
const { engines } = require('./package.json');
const minimum = engines.node.match(/^>=(\d+)\.(\d+)\.(\d+) </).slice(1).map(Number);
function isSupported(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) return false;
  const current = version.split('.').map(Number);
  return current[0] === minimum[0] &&
    (current[1] > minimum[1] || (current[1] === minimum[1] && current[2] >= minimum[2]));
}
function assertSupported(version = process.versions.node) {
  if (!isSupported(version)) {
    throw new Error(`Node.js ${version} はこの配布版では使えません。Node.js ${minimum.join('.')} 以上の24系LTSに更新してください。https://nodejs.org/ （README参照）`);
  }
}
module.exports = { isSupported, assertSupported };
if (require.main === module) {
  try { assertSupported(); } catch (error) { console.error(error.message); process.exit(1); }
}

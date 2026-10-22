const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const projects = ['.', 'server', 'ai-article-imager-for-wordpress', 'ai-article-imager-for-wordpress/image-generation-agent'];
for (const project of projects) {
  test(`${project}: supported LTS and unsafe runtime rejection`, () => {
    const { isSupported, assertSupported } = require(path.join(root, project, 'check-node.cjs'));
    for (const version of ['24.22.1', '24.22.2', '24.23.0']) assert.equal(isSupported(version), true);
    for (const version of ['18.20.8', '20.20.0', '22.23.4', '24.22.0', '24.21.9', '25.6.0', '26.12.1', '24.22.1-rc.1', 'garbage']) {
      assert.equal(isSupported(version), false, version);
      assert.throws(() => assertSupported(version), /LTS/);
    }
    assert.doesNotThrow(() => assertSupported('24.22.1'));
  });
}
test('runtime pins agree across install, containers and hosting', () => {
  const version = fs.readFileSync(path.join(root, '.node-version'), 'utf8').trim();
  assert.equal(fs.readFileSync(path.join(root, '.nvmrc'), 'utf8').trim(), version);
  for (const project of projects) {
    const pkg = require(path.join(root, project, 'package.json'));
    const lock = require(path.join(root, project, 'package-lock.json'));
    assert.equal(pkg.engines.node, `>=${version} <25.0.0`);
    assert.deepEqual(lock.packages[''].engines, pkg.engines);
  }
  for (const file of ['Dockerfile', 'server/Dockerfile', 'ai-article-imager-for-wordpress/Dockerfile']) {
    assert.match(fs.readFileSync(path.join(root, file), 'utf8'), new RegExp(`FROM node:${version.replaceAll('.', '\\.')}[- ]`));
  }
  assert.ok(fs.readFileSync(path.join(root, 'render.yaml'), 'utf8').includes(`value: ${version}`));
});

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { generateNotes } from '@semantic-release/release-notes-generator';

test('release tooling renders conventional commits and breaking changes', async () => {
  const cwd = fileURLToPath(new URL('../', import.meta.url));
  const config = JSON.parse(await readFile(new URL('../.releaserc.json', import.meta.url), 'utf8'));
  const [, options] = config.plugins.find(plugin => Array.isArray(plugin) && plugin[0] === '@semantic-release/release-notes-generator');
  const notes = await generateNotes(options, {
    cwd,
    commits: [{ hash: 'a'.repeat(40), message: 'fix!: update compiler defaults\n\nBREAKING CHANGE: Requires a compatible compiler.' }],
    lastRelease: { gitTag: 'v1.0.0' },
    nextRelease: { version: '2.0.0', gitTag: 'v2.0.0' },
    options: { repositoryUrl: 'https://github.com/taleland/tsconfig.git' },
  });
  assert.match(notes, /2\.0\.0/);
  assert.match(notes, /update compiler defaults/);
  assert.match(notes, /Requires a compatible compiler/);
});

import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
const compiler = join(dirname(fileURLToPath(import.meta.resolve('typescript/package.json'))), 'bin/tsc');

const root = fileURLToPath(new URL('../', import.meta.url));

test('published configurations compile in an independent consumer', async t => {
  const consumer = await mkdtemp(join(tmpdir(), 'taleland-tsconfig-'));
  t.after(() => rm(consumer, { recursive: true, force: true }));
  const [tarball] = JSON.parse(execFileSync('npm', [
    'pack', '--json', '--ignore-scripts', '--pack-destination', consumer,
  ], { cwd: root, encoding: 'utf8' }));
  const packageRoot = join(consumer, 'node_modules/@taleland/tsconfig');
  await mkdir(packageRoot, { recursive: true });
  execFileSync('tar', ['-xzf', join(consumer, tarball.filename), '-C', packageRoot, '--strip-components=1']);
  await writeFile(join(consumer, 'package.json'), JSON.stringify({ type: 'module' }));
  assert.match(await readFile(join(packageRoot, 'LICENSE'), 'utf8'), /Apache License/);

  for (const profile of ['base', 'lib', 'service']) {
    await t.test(profile, async () => {
      const project = join(consumer, profile);
      await mkdir(project);
      const configFile = join(project, 'tsconfig.json');
      const sourceFile = join(project, 'index.ts');
      await writeFile(configFile, JSON.stringify({
        extends: `@taleland/tsconfig/${profile}`,
        compilerOptions: { rootDir: '.', outDir: './dist' },
        include: ['index.ts'],
      }));
      await writeFile(sourceFile, 'export const answer: number = 42;\n');
      // Exercise the public CLI: TypeScript 7 no longer exposes the legacy compiler API.
      const compile = () => spawnSync(process.execPath, [compiler, '--project', configFile, '--pretty', 'false'], {
        cwd: project, encoding: 'utf8',
      });
      const result = compile();
      assert.equal(result.status, 0, result.stdout + result.stderr);
      assert.match(await readFile(join(project, 'dist/index.js'), 'utf8'), /export const answer = 42/);
      if (profile === 'lib') {
        assert.match(await readFile(join(project, 'dist/index.d.ts'), 'utf8'), /answer: number/);
      }
      await writeFile(sourceFile, 'export const answer: number = undefined;\n');
      const invalid = compile();
      assert.notEqual(invalid.status, 0);
      assert.match(invalid.stdout + invalid.stderr, /TS2322/,
        'The inherited strict configuration must reject undefined assigned to number');
    });
  }
});

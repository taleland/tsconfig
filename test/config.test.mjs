import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import ts from 'typescript';

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
      const config = ts.readConfigFile(configFile, ts.sys.readFile);
      assert.equal(config.error, undefined);
      const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, project);
      assert.deepEqual(parsed.errors, []);
      const program = ts.createProgram(parsed.fileNames, parsed.options);
      const diagnostics = ts.getPreEmitDiagnostics(program);
      assert.equal(diagnostics.length, 0, ts.formatDiagnostics(diagnostics, {
        getCanonicalFileName: path => path,
        getCurrentDirectory: () => project,
        getNewLine: () => '\n',
      }));
      assert.equal(program.emit().emitSkipped, false);
      assert.match(await readFile(join(project, 'dist/index.js'), 'utf8'), /export const answer = 42/);
      if (profile === 'lib') {
        assert.match(await readFile(join(project, 'dist/index.d.ts'), 'utf8'), /answer: number/);
      }
      await writeFile(sourceFile, 'export const answer: number = undefined;\n');
      const invalid = ts.createProgram(parsed.fileNames, parsed.options);
      assert.ok(ts.getPreEmitDiagnostics(invalid).some(diagnostic => diagnostic.code === 2322),
        'The inherited strict configuration must reject undefined assigned to number');
    });
  }
});

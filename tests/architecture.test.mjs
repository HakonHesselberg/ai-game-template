import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { checkArchitecture } from '../scripts/check-architecture.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = path.join(repo, 'scripts/check-architecture.mjs');

function fixture(t, files, tsconfig) {
  const root = mkdtempSync(path.join(tmpdir(), 'game-architecture-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(files)) {
    const target = path.join(root, name);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  if (tsconfig) writeFileSync(path.join(root, 'tsconfig.json'), JSON.stringify(tsconfig));
  return root;
}

function errors(root) {
  return checkArchitecture(root).errors.join('\n');
}

test('checkArchitecture_WithActualStarter_FindsNoViolations', () => {
  assert.deepEqual(checkArchitecture(repo).errors, []);
});

test('checkArchitecture_WithValidLayerGraph_AcceptsImportsAndBrowserCodeInApplication', (t) => {
  const root = fixture(t, {
    'src/shared/math.ts': 'export const two = 2;',
    'src/core/game.ts': "import { two } from '../shared/math'; export const score = two;",
    'src/data/content.ts': "import { score } from '../core/game'; export const content = score;",
    'src/presentation/three/world.ts': "import { score } from '../../core/game'; export const view = score;",
    'src/application/start.ts': "import { view } from '../presentation/three/world'; export const start = () => [view, window.devicePixelRatio];",
    'src/main.ts': "import { start } from './application/start'; start();",
  });
  assert.equal(errors(root), '');
});

test('checkArchitecture_WithBackwardImport_RejectsCoreAndDataDependencies', (t) => {
  const root = fixture(t, {
    'src/core/game.ts': "import '../presentation/dom/ui';",
    'src/data/config.ts': "import '../application/start';",
    'src/presentation/dom/ui.ts': 'export const ui = 1;',
    'src/application/start.ts': 'export const app = 1;',
  });
  assert.match(errors(root), /core must not import presentation/);
  assert.match(errors(root), /data must not import application/);
});

test('checkArchitecture_WithCoreAmbientState_RejectsRandomTimeAndBrowserGlobals', (t) => {
  const root = fixture(t, {
    'src/core/game.ts': [
      'export const roll = Math.random();',
      'export const otherRoll = Math["random"]();',
      'export const now = Date.now();',
      'export const elapsed = performance.now();',
      'export const pointer = window.devicePixelRatio;',
      'export const later = setTimeout(() => 0, 10);',
    ].join('\n'),
  });
  const result = errors(root);
  assert.match(result, /Math\.random/);
  assert.match(result, /Date/);
  assert.match(result, /performance/);
  assert.match(result, /window/);
  assert.match(result, /setTimeout/);
});

test('checkArchitecture_WithExternalDependency_RejectsPureLayerImports', (t) => {
  const root = fixture(t, { 'src/core/game.ts': "import * as THREE from 'three'; export const x = THREE;" });
  assert.match(errors(root), /core must not import external packages: three/);
});

test('checkArchitecture_WithDirectRendererCoupling_RequiresSharedContract', (t) => {
  const root = fixture(t, {
    'src/presentation/canvas2d/overlay.ts': "import type { Point } from '../three/world'; export type P = Point;",
    'src/presentation/three/world.ts': 'export interface Point { x: number }',
  });
  assert.match(errors(root), /canvas2d must not import the three renderer directly/);
});

test('checkArchitecture_WithImportCycle_ReportsReproduciblePath', (t) => {
  const root = fixture(t, {
    'src/core/a.ts': "import { b } from './b'; export const a = b;",
    'src/core/b.ts': "import { a } from './a'; export const b = a;",
  });
  assert.match(errors(root), /Circular import: src\/core\/a\.ts -> src\/core\/b\.ts -> src\/core\/a\.ts/);
});

test('checkArchitecture_WithDynamicImportOrRequire_StillCatchesBoundaryViolation', (t) => {
  const root = fixture(t, {
    'src/core/a.ts': "export const a = () => import('../presentation/three/world');",
    'src/core/b.ts': "export const b = require('../presentation/three/world');",
    'src/presentation/three/world.ts': 'export const world = 1;',
  });
  assert.match(errors(root), /src\/core\/a\.ts.*core must not import presentation/);
  assert.match(errors(root), /src\/core\/b\.ts.*core must not import presentation/);
});

test('checkArchitecture_WithTsconfigAlias_DoesNotBypassLayerRule', (t) => {
  const root = fixture(t, {
    'src/core/a.ts': "import { world } from '@/presentation/three/world'; export const a = world;",
    'src/presentation/three/world.ts': 'export const world = 1;',
  }, { compilerOptions: { baseUrl: '.', paths: { '@/*': ['src/*'] }, module: 'ESNext', moduleResolution: 'Bundler' } });
  assert.match(errors(root), /core must not import presentation/);
});

test('checkArchitecture_WithUnknownLayerOrMissingFile_ReportsInsteadOfSkipping', (t) => {
  const root = fixture(t, {
    'src/unknown/other.ts': 'export const x = 1;',
    'src/core/a.ts': "import './missing'; export const a = 1;",
  });
  assert.match(errors(root), /unknown src\/ layer/);
  assert.match(errors(root), /unresolved relative import/);
});

test('checkArchitecture_WithJavaScriptSource_StillRejectsAmbientRandomness', (t) => {
  const root = fixture(t, { 'src/core/roll.js': 'export const roll = Math.random();' });
  assert.match(errors(root), /core must not call Math.random/);
});

test('checkArchitecture_WithNoSourceFiles_FailsClosed', (t) => {
  const root = fixture(t, {});
  assert.match(errors(root), /no source files found/);
});

test('checkArchitecture_WithViolation_CliReturnsNonzeroAndUsefulMessage', (t) => {
  const root = fixture(t, { 'src/core/a.ts': 'export const x = Math.random();' });
  const processResult = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });
  assert.equal(processResult.status, 1);
  assert.match(processResult.stderr, /Architecture violation: src\/core\/a\.ts:1:/);
});

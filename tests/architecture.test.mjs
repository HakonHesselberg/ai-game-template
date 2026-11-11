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

function fixture(t, files, tsconfig, pureLayerAliases, architectureOptions = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'game-architecture-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(files)) {
    const target = path.join(root, name);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  if (tsconfig) writeFileSync(path.join(root, 'tsconfig.json'), JSON.stringify(tsconfig));
  if (pureLayerAliases || Object.keys(architectureOptions).length) {
    writeFileSync(path.join(root, 'architecture.layers.json'), JSON.stringify({
      ...(pureLayerAliases ? { pureLayerAliases } : {}), ...architectureOptions,
    }));
  }
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

test('checkArchitecture_WithCoreToDataPolicy_AcceptsDefinitionsButRejectsReverseDependency', (t) => {
  const root = fixture(t, {
    'src/core/rules.ts': "import { value } from '../data/values'; export const outcome = value;",
    'src/data/values.ts': 'export const value = 7;',
  }, null, null, { dataDependency: 'core-to-data' });
  assert.equal(errors(root), '');
  assert.match(errors(fixture(t, {
    'src/core/rules.ts': 'export const outcome = 7;',
    'src/data/values.ts': "import { outcome } from '../core/rules'; export const value = outcome;",
  }, null, null, { dataDependency: 'core-to-data' })), /data must not import core/);
});

test('checkArchitecture_WithDefaultDataPolicy_StillRejectsCoreImportingData', (t) => {
  const root = fixture(t, {
    'src/core/rules.ts': "import { value } from '../data/values'; export const outcome = value;",
    'src/data/values.ts': 'export const value = 7;',
  });
  assert.match(errors(root), /core must not import data/);
});

test('checkArchitecture_WithRootLevelLayout_ProtectsCoreAndSkipsTestsAndDependencies', (t) => {
  const root = fixture(t, {
    'core/rules.ts': "import { value } from '../data/values'; export const outcome = value + Math.random();",
    'data/values.ts': 'export const value = 7;',
    'tests/legacy.test.js': 'const ignored = Math.random();',
    'node_modules/demo/index.js': 'const ignored = Math.random();',
  }, null, null, { sourceRoot: '.', dataDependency: 'core-to-data' });
  assert.match(errors(root), /core\/rules\.ts.*core must not call Math\.random/);
  assert.equal(checkArchitecture(root).filesCount, 2);
});

test('checkArchitecture_WithInvalidSourceRootOrDependencyPolicy_FailsClosed', (t) => {
  const files = { 'src/core/a.ts': 'export const a = 1;' };
  assert.throws(() => checkArchitecture(fixture(t, files, null, null, { sourceRoot: '../' })), /Invalid sourceRoot/);
  assert.throws(() => checkArchitecture(fixture(t, files, null, null, { dataDependency: 'both' })), /Invalid sourceRoot/);
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

test('checkArchitecture_WithDestructuredRandom_RejectsRenamedAndUnrenamedAccess', (t) => {
  const root = fixture(t, {
    'src/core/dice.ts': 'const { random } = Math; const { "random": roll } = Math; export const dice = [random(), roll()];',
  });
  assert.equal(errors(root).match(/must not destructure Math\.random/g)?.length, 2);
});

test('checkArchitecture_WithRendererDependency_RejectsPureLayerImports', (t) => {
  const root = fixture(t, { 'src/core/game.ts': "import * as THREE from 'three'; import fs from 'fs'; export const x = [THREE, fs];" });
  assert.match(errors(root), /core must not import renderer\/platform packages: three/);
  assert.match(errors(root), /core must not import renderer\/platform packages: fs/);
});

test('checkArchitecture_WithPureDependencyAndTypeOnlyDate_AllowsBoth', (t) => {
  const root = fixture(t, {
    'src/core/game.ts': "import { produce } from 'immer'; export type GameDate = Date; export const update = produce;",
  });
  assert.equal(errors(root), '');
});

test('checkArchitecture_WithBrowserOnlyTypesInCore_RejectsEvenTypeOnlyUses', (t) => {
  const root = fixture(t, {
    'src/core/state.ts': 'export interface State { element: HTMLElement; canvas: HTMLCanvasElement; context: WebGL2RenderingContext }',
  });
  const result = errors(root);
  assert.match(result, /core must not depend on HTMLElement/);
  assert.match(result, /core must not depend on HTMLCanvasElement/);
  assert.match(result, /core must not depend on WebGL2RenderingContext/);
});

test('checkArchitecture_WithStylesheetImportInPureLayer_RejectsSideEffects', (t) => {
  const root = fixture(t, {
    'src/core/state.ts': "import './styles.css'; export const state = 1;",
    'src/core/styles.css': '.game { color: red; }',
  });
  assert.match(errors(root), /core must not import stylesheets: .\/styles.css/);
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

test('checkArchitecture_WithCustomFeatureFolder_AcceptsApplicationComposition', (t) => {
  const root = fixture(t, {
    'src/core/game.ts': 'export const state = 1;',
    'src/features/arena/arena.ts': "import { state } from '../../core/game'; export const arena = state;",
    'src/application/start.ts': "import { arena } from '../features/arena/arena'; export const start = arena;",
  });
  assert.equal(errors(root), '');
});

test('checkArchitecture_WithDeclaredPureFolder_ProtectsPurityAndImportDirection', (t) => {
  const root = fixture(t, {
    'src/core/game.ts': 'export const state = 1;',
    'src/physics/step.ts': "import { state } from '../core/game'; import '../presentation/three/world'; export const next = state + Math.random();",
    'src/presentation/three/world.ts': 'export const world = 1;',
    'src/features/visual.ts': "import { next } from '../physics/step'; export const x = next;",
  }, null, { physics: 'core' });
  assert.match(errors(root), /src\/physics\/step\.ts.*core must not call Math.random/);
  assert.match(errors(root), /src\/physics\/step\.ts.*core must not import presentation/);
});

test('checkArchitecture_WithDeclaredPureFolders_AcceptsHeadlessImports', (t) => {
  const root = fixture(t, {
    'src/content/values.ts': 'export const count = 3;',
    'src/core/game.ts': "import { count } from '../content/values'; export const state = count;",
    'src/physics/step.ts': "import { state } from '../core/game'; export const next = state + 1;",
    'src/application/start.ts': "import { next } from '../physics/step'; export const start = next;",
  }, null, { content: 'shared', physics: 'core' });
  assert.equal(errors(root), '');
});

test('checkArchitecture_WithDeclaredPureFolder_RejectsRendererImports', (t) => {
  const root = fixture(t, {
    'src/physics/step.ts': "import * as THREE from 'three'; export const x = THREE;",
  }, null, { physics: 'core' });
  assert.match(errors(root), /src\/physics\/step\.ts.*core must not import renderer\/platform packages/);
});

test('checkArchitecture_WithInvalidPureFolderAlias_FailsClosed', (t) => {
  const root = fixture(t, { 'src/core/game.ts': 'export const x = 1;' }, null, { physics: 'application' });
  assert.throws(() => checkArchitecture(root), /Invalid pure layer alias/);
});

test('checkArchitecture_WithCoreImportingFeatureOrMissingFile_ReportsBoth', (t) => {
  const root = fixture(t, {
    'src/features/arena.ts': 'export const arena = 1;',
    'src/core/a.ts': "import '../features/arena'; import './missing'; export const a = 1;",
  });
  assert.match(errors(root), /core must not import feature/);
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

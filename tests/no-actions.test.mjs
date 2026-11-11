import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../scripts/check-no-actions.mjs');

function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'game-no-actions-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function run(root) {
  return spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });
}

test('noActions_ChecksGeneratedGameWithoutTemplateMetadata', (t) => {
  const result = run(fixture(t));
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /No GitHub Actions workflows found/);
});

test('noActions_RejectsWorkflowsInGeneratedGame', (t) => {
  const root = fixture(t);
  mkdirSync(path.join(root, '.github/workflows'), { recursive: true });
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /GitHub Actions workflows are prohibited/);
});

#!/usr/bin/env node
/** Local, syntax-aware boundary checks. TypeScript 7 builds; Babel parses AST. */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '@babel/parser';
import { getTsconfig, createPathsMatcher } from 'get-tsconfig';

// Adjust the policy only after a generated game records its architecture.
// Application is the composition root; individual renderers cannot own it.
const allowedImports = {
  shared: new Set(['shared']),
  core: new Set(['core', 'shared']),
  data: new Set(['data', 'core', 'shared']),
  presentation: new Set(['presentation', 'data', 'core', 'shared']),
  application: new Set(['application', 'presentation', 'data', 'core', 'shared']),
  entry: new Set(['entry', 'application', 'presentation', 'data', 'core', 'shared']),
};
const pureLayers = new Set(['shared', 'core', 'data']);
const prohibitedGlobals = new Set([
  'Date', 'performance', 'window', 'document', 'navigator', 'location',
  'localStorage', 'sessionStorage', 'requestAnimationFrame', 'cancelAnimationFrame',
  'setTimeout', 'setInterval', 'fetch', 'WebSocket', 'Worker', 'crypto',
  'globalThis', 'process',
]);
const sourceExtensions = new Set(['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs']);
const rendererFolders = new Set(['dom', 'canvas2d', 'three']);

function within(folder, item) {
  const relative = path.relative(folder, item);
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

function listSourceFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((item) => {
      const fullPath = path.join(directory, item.name);
      if (item.isDirectory()) return listSourceFiles(fullPath);
      return item.isFile() && sourceExtensions.has(path.extname(item.name)) && !/\.d\.[cm]?ts$/.test(item.name) ? [fullPath] : [];
    })
    .sort();
}

function layerFor(srcRoot, filename) {
  if (!within(srcRoot, filename)) return null;
  const parts = path.relative(srcRoot, filename).split(path.sep);
  if (parts.length === 1) return 'entry';
  return Object.hasOwn(allowedImports, parts[0]) ? parts[0] : 'unclassified';
}

function rendererFor(srcRoot, filename) {
  const parts = path.relative(srcRoot, filename).split(path.sep);
  return parts[0] === 'presentation' && rendererFolders.has(parts[1]) ? parts[1] : null;
}

function findFile(candidate) {
  const alternatives = [candidate];
  if (/\.jsx?$/.test(candidate)) alternatives.push(candidate.replace(/\.jsx?$/, '.ts'), candidate.replace(/\.jsx?$/, '.tsx'));
  for (const extension of sourceExtensions) alternatives.push(candidate + extension);
  alternatives.push(candidate + '.js', candidate + '.jsx', candidate + '.json', candidate + '.css');
  for (const extension of sourceExtensions) alternatives.push(path.join(candidate, 'index' + extension));
  for (const option of alternatives) {
    if (existsSync(option) && statSync(option).isFile()) return path.resolve(option);
  }
  return null;
}

function resolverFor(root) {
  const configPath = path.join(root, 'tsconfig.json');
  const config = existsSync(configPath) ? getTsconfig(configPath) : null;
  const pathsMatcher = config && createPathsMatcher(config);
  const baseUrl = config?.config.compilerOptions?.baseUrl;

  return (specifier, fromFile) => {
    const candidates = specifier.startsWith('.')
      ? [path.resolve(path.dirname(fromFile), specifier)]
      : [...(pathsMatcher?.(specifier) || []), ...(baseUrl ? [path.resolve(root, baseUrl, specifier)] : [])];
    for (const candidate of candidates) {
      const resolved = findFile(candidate);
      if (resolved) return resolved;
    }
    return null;
  };
}

function specifierNode(node) {
  if (['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration'].includes(node.type) && node.source?.type === 'StringLiteral') {
    return node.source;
  }
  if (node.type === 'TSImportEqualsDeclaration' && node.moduleReference?.type === 'TSExternalModuleReference') {
    return node.moduleReference.expression?.type === 'StringLiteral' ? node.moduleReference.expression : null;
  }
  if (node.type === 'ImportExpression' && node.source?.type === 'StringLiteral') return node.source;
  if (node.type === 'CallExpression' && node.arguments?.length === 1 && node.arguments[0].type === 'StringLiteral') {
    if (node.callee.type === 'Import' || (node.callee.type === 'Identifier' && node.callee.name === 'require')) return node.arguments[0];
  }
  return null;
}

function visitAst(node, callback, parent = null, parentKey = '') {
  if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
  callback(node, parent, parentKey);
  for (const [key, child] of Object.entries(node)) {
    if (['loc', 'extra', 'errors', 'comments', 'tokens', 'leadingComments', 'trailingComments', 'innerComments'].includes(key)) continue;
    if (Array.isArray(child)) {
      for (const item of child) visitAst(item, callback, node, key);
    } else visitAst(child, callback, node, key);
  }
}

function isNonReferenceName(node, parent, parentKey) {
  if (!parent) return false;
  if ((parent.type === 'MemberExpression' || parent.type === 'OptionalMemberExpression') && parentKey === 'property' && !parent.computed) return true;
  if ((parent.type === 'ObjectProperty' || parent.type === 'ObjectMethod') && parentKey === 'key' && !parent.computed && !parent.shorthand) return true;
  if ((parent.type === 'TSPropertySignature' || parent.type === 'TSMethodSignature') && parentKey === 'key') return true;
  return false;
}

export function checkArchitecture(repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')) {
  const root = path.resolve(repositoryRoot);
  const srcRoot = path.join(root, 'src');
  const files = listSourceFiles(srcRoot);
  const errors = [];
  if (files.length === 0) errors.push('src/:1:1 no source files found; architecture checks cannot verify an empty project');
  let importsCount = 0;
  const graph = new Map(files.map((file) => [file, new Set()]));
  const resolveImport = resolverFor(root);

  function report(filename, node, message) {
    const line = node.loc?.start.line ?? 1;
    const column = (node.loc?.start.column ?? 0) + 1;
    errors.push(`${path.relative(root, filename)}:${line}:${column} ${message}`);
  }

  for (const filename of files) {
    const layer = layerFor(srcRoot, filename);
    const renderer = rendererFor(srcRoot, filename);
    if (layer === 'unclassified') {
      errors.push(`${path.relative(root, filename)}:1:1 unknown src/ layer; put pure utilities in src/shared/ or update the architecture policy`);
    }
    let syntax;
    try {
      syntax = parse(readFileSync(filename, 'utf8'), { sourceType: 'unambiguous', plugins: ['typescript', 'jsx'] });
    } catch (error) {
      errors.push(`${path.relative(root, filename)}:${error.loc?.line ?? 1}:${(error.loc?.column ?? 0) + 1} source parsing failed: ${error.message}`);
      continue;
    }

    visitAst(syntax.program, (node, parent, parentKey) => {
      const source = specifierNode(node);
      if (source) {
        importsCount += 1;
        const specifier = source.value;
        const resolved = resolveImport(specifier, filename);
        if (resolved && within(srcRoot, resolved)) {
          const importedLayer = layerFor(srcRoot, resolved);
          const importedRenderer = rendererFor(srcRoot, resolved);
          if (!allowedImports[layer]?.has(importedLayer)) {
            report(filename, source, `${layer} must not import ${importedLayer}: ${specifier}`);
          }
          if (renderer && importedRenderer && renderer !== importedRenderer) {
            report(filename, source, `${renderer} must not import the ${importedRenderer} renderer directly; use shared presentation contracts`);
          }
          if (graph.has(resolved)) graph.get(filename).add(resolved);
        } else if (specifier.startsWith('.')) {
          const target = path.resolve(path.dirname(filename), specifier);
          if (!within(srcRoot, target)) report(filename, source, `relative import leaves src/: ${specifier}`);
          else if (!resolved) report(filename, source, `unresolved relative import: ${specifier}`);
        } else if (pureLayers.has(layer)) {
          report(filename, source, `${layer} must not import external packages: ${specifier}`);
        }
      }

      if (!pureLayers.has(layer)) return;
      if (node.type === 'Identifier' && prohibitedGlobals.has(node.name) && !isNonReferenceName(node, parent, parentKey)) {
        report(filename, node, `${layer} must not depend on ${node.name}`);
      }
      if (['MemberExpression', 'OptionalMemberExpression'].includes(node.type) && node.object.type === 'Identifier' && node.object.name === 'Math' &&
          ((node.property.type === 'Identifier' && !node.computed && node.property.name === 'random') ||
           (node.property.type === 'StringLiteral' && node.property.value === 'random'))) {
        report(filename, node, `${layer} must not call Math.random; use seeded state instead`);
      }
      if (node.type === 'MetaProperty' && node.meta.name === 'import' && node.property.name === 'meta') {
        report(filename, node, `${layer} must not use import.meta`);
      }
    });
  }

  const state = new Map();
  const stack = [];
  const seenCycles = new Set();
  function explore(file) {
    state.set(file, 'visiting');
    stack.push(file);
    for (const next of [...graph.get(file)].sort()) {
      if (state.get(next) === 'visiting') {
        const cycle = [...stack.slice(stack.indexOf(next)), next].map((part) => path.relative(root, part));
        const label = cycle.join(' -> ');
        if (!seenCycles.has(label)) { errors.push(`Circular import: ${label}`); seenCycles.add(label); }
      } else if (!state.has(next)) explore(next);
    }
    stack.pop();
    state.set(file, 'visited');
  }
  for (const filename of files) if (!state.has(filename)) explore(filename);

  return { errors: errors.sort(), filesCount: files.length, importsCount };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = checkArchitecture(process.cwd());
    if (result.errors.length) {
      for (const error of result.errors) console.error(`Architecture violation: ${error}`);
      console.error(`${result.errors.length} architecture violation(s) found.`);
      process.exitCode = 1;
    } else {
      console.log(`Architecture checks passed (${result.filesCount} source files, ${result.importsCount} imports).`);
    }
  } catch (error) {
    console.error('Architecture checker failed:', error);
    process.exitCode = 1;
  }
}

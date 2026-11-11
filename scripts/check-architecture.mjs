#!/usr/bin/env node
/** Local, syntax-aware boundary checks. TypeScript 7 builds; Babel parses AST. */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { builtinModules } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '@babel/parser';
import { getTsconfig, createPathsMatcher } from 'get-tsconfig';

// Application is the composition root; custom feature folders are permitted.
// Known pure layers remain protected even as a generated game grows.
const allowedImports = {
  shared: new Set(['shared']),
  core: new Set(['core', 'shared']),
  data: new Set(['data', 'core', 'shared']),
  presentation: new Set(['presentation', 'data', 'core', 'shared']),
  feature: new Set(['feature', 'presentation', 'data', 'core', 'shared']),
  application: new Set(['application', 'feature', 'presentation', 'data', 'core', 'shared']),
  entry: new Set(['entry', 'application', 'feature', 'presentation', 'data', 'core', 'shared']),
};
const pureLayers = new Set(['shared', 'core', 'data']);
const nodeBuiltins = new Set(builtinModules.map((name) => name.replace(/^node:/, '').split('/')[0]));
// Other packages may be pure, but they still require human review. This is
// a boundary guard, not a proof that every installed dependency is deterministic.
const platformPackages = /^(?:node:|three(?:\/|$)|@react-three\/|react(?:\/|$)|react-dom(?:\/|$)|pixi\.js(?:\/|$)|phaser(?:\/|$)|@babylonjs\/|vite(?:\/|$)|@playwright\/)/;
const prohibitedGlobals = new Set([
  'Date', 'performance', 'window', 'document', 'navigator', 'location',
  'localStorage', 'sessionStorage', 'requestAnimationFrame', 'cancelAnimationFrame',
  'setTimeout', 'setInterval', 'fetch', 'WebSocket', 'Worker', 'crypto',
  'globalThis', 'process', 'HTMLElement', 'HTMLCanvasElement', 'Window',
  'Document', 'CanvasRenderingContext2D', 'WebGLRenderingContext',
  'WebGL2RenderingContext', 'PointerEvent', 'KeyboardEvent', 'MouseEvent',
  'TouchEvent', 'ResizeObserver', 'EventTarget', 'Storage', 'ImageData',
]);
const styleImport = /\.(?:css|scss|sass|less)(?:\?.*)?$/i;
const sourceExtensions = new Set(['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs']);
const rendererFolders = new Set(['dom', 'canvas2d', 'three']);

function loadArchitectureConfig(root) {
  const defaults = { sourceRoot: 'src', dataDependency: 'data-to-core', pureLayerAliases: {} };
  const filename = path.join(root, 'architecture.layers.json');
  if (!existsSync(filename)) return defaults;
  const config = JSON.parse(readFileSync(filename, 'utf8'));
  if (!config || typeof config !== 'object' || Array.isArray(config) ||
      Object.keys(config).some((key) => !Object.hasOwn(defaults, key))) {
    throw new Error('architecture.layers.json contains unsupported configuration');
  }
  const settings = { ...defaults, ...config };
  if (!['src', '.'].includes(settings.sourceRoot) ||
      !['data-to-core', 'core-to-data'].includes(settings.dataDependency) ||
      !settings.pureLayerAliases || typeof settings.pureLayerAliases !== 'object' ||
      Array.isArray(settings.pureLayerAliases)) {
    throw new Error('Invalid sourceRoot, dataDependency or pureLayerAliases in architecture.layers.json');
  }
  for (const [directory, layer] of Object.entries(settings.pureLayerAliases)) {
    if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(directory) ||
        Object.hasOwn(allowedImports, directory) || !pureLayers.has(layer)) {
      throw new Error(`Invalid pure layer alias in architecture.layers.json: ${directory}`);
    }
  }
  return settings;
}

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

// A root-level layout is opt-in; never scan dependencies, tests, build output
// or private tool directories as game source.
const rootNonSourceFolders = new Set([
  'node_modules', 'tests', 'scripts', 'docs', 'examples', 'public', 'assets',
  'dist', 'build', 'coverage', 'artifacts', 'fixtures', 'test-results', 'playwright-report',
]);
function listRootSourceFiles(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((item) => {
    if (item.name.startsWith('.') || rootNonSourceFolders.has(item.name)) return [];
    const entry = path.join(root, item.name);
    if (item.isDirectory()) return listSourceFiles(entry);
    return item.isFile() && sourceExtensions.has(path.extname(item.name)) &&
      !/\.d\.[cm]?ts$/.test(item.name) ? [entry] : [];
  }).sort();
}

function layerFor(srcRoot, filename, aliases) {
  if (!within(srcRoot, filename)) return null;
  const parts = path.relative(srcRoot, filename).split(path.sep);
  if (parts.length === 1) return 'entry';
  if (Object.hasOwn(allowedImports, parts[0])) return parts[0];
  return Object.hasOwn(aliases, parts[0]) ? aliases[parts[0]] : 'feature';
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
  // Date is harmless as a type, but DOM/WebGL types couple headless modules
  // to a browser even when the import is erased at runtime.
  if (parent.type === 'TSTypeReference' && parentKey === 'typeName') return node.name === 'Date';
  return false;
}

export function checkArchitecture(repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')) {
  const root = path.resolve(repositoryRoot);
  const config = loadArchitectureConfig(root);
  const srcRoot = path.resolve(root, config.sourceRoot);
  const aliases = config.pureLayerAliases;
  const files = config.sourceRoot === '.' ? listRootSourceFiles(root) : listSourceFiles(srcRoot);
  const errors = [];
  if (files.length === 0) errors.push(`${config.sourceRoot}/:1:1 no source files found; architecture checks cannot verify an empty project`);
  let importsCount = 0;
  const graph = new Map(files.map((file) => [file, new Set()]));
  const resolveImport = resolverFor(root);

  function report(filename, node, message) {
    const line = node.loc?.start.line ?? 1;
    const column = (node.loc?.start.column ?? 0) + 1;
    errors.push(`${path.relative(root, filename)}:${line}:${column} ${message}`);
  }

  for (const filename of files) {
    const layer = layerFor(srcRoot, filename, aliases);
    const renderer = rendererFor(srcRoot, filename);
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
        if (pureLayers.has(layer) && styleImport.test(specifier)) {
          report(filename, source, `${layer} must not import stylesheets: ${specifier}`);
        }
        const resolved = resolveImport(specifier, filename);
        if (resolved && within(srcRoot, resolved)) {
          const importedLayer = layerFor(srcRoot, resolved, aliases);
          const importedRenderer = rendererFor(srcRoot, resolved);
          const permitted = layer === 'core' && importedLayer === 'data'
            ? config.dataDependency === 'core-to-data'
            : layer === 'data' && importedLayer === 'core'
              ? config.dataDependency === 'data-to-core'
              : allowedImports[layer]?.has(importedLayer);
          if (!permitted) {
            report(filename, source, `${layer} must not import ${importedLayer}: ${specifier}`);
          }
          if (renderer && importedRenderer && renderer !== importedRenderer) {
            report(filename, source, `${renderer} must not import the ${importedRenderer} renderer directly; use shared presentation contracts`);
          }
          if (graph.has(resolved)) graph.get(filename).add(resolved);
        } else if (specifier.startsWith('.')) {
          const target = path.resolve(path.dirname(filename), specifier);
          if (!within(srcRoot, target)) report(filename, source, `relative import leaves ${config.sourceRoot}/: ${specifier}`);
          else if (!resolved) report(filename, source, `unresolved relative import: ${specifier}`);
        } else if (pureLayers.has(layer) && (platformPackages.test(specifier) || nodeBuiltins.has(specifier.split('/')[0]))) {
          report(filename, source, `${layer} must not import renderer/platform packages: ${specifier}`);
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
      if (node.type === 'VariableDeclarator' && node.init?.type === 'Identifier' && node.init.name === 'Math' &&
          node.id.type === 'ObjectPattern' && node.id.properties.some((property) =>
            property.type === 'ObjectProperty' &&
            ((property.key.type === 'Identifier' && property.key.name === 'random' && !property.computed) ||
             (property.key.type === 'StringLiteral' && property.key.value === 'random')))) {
        report(filename, node, `${layer} must not destructure Math.random; use seeded state instead`);
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

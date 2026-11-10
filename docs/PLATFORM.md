# Web platform and local commands

- **Target:** modern evergreen browsers, desktop and mobile.
- **Recommended runtime:** Node.js **26.13.0 LTS** (`.nvmrc`); supported Node
  range is specified in `package.json` (24.15+ and 26.x). Keep supported
  runtime and package versions compatible when updating.
- **Package manager:** npm 12.2.2; the checked-in `package-lock.json` makes
  dependency resolution reproducible with `npm ci`.
- **Build:** Vite 8.3.7; **language:** strict TypeScript 7.0.2.
- **Rendering:** Three.js 0.187.0 + Canvas 2D + semantic HTML/CSS. There is
  no mandatory engine, backend, asset pipeline or cloud service.

```bash
nvm use
npm ci
npm run dev           # Live dev server: http://127.0.0.1:5173
npm run typecheck     # TypeScript, no JS emission
npm run lint:architecture  # Boundary and determinism checker
npm test              # Headless pure-core tests
npm run build         # Typecheck plus static dist/ build
npm run preview       # Preview build: http://127.0.0.1:4173
npm run check         # Architecture, typecheck, tests, build, template guard
npx playwright install chromium
npm run test:browser  # Real Chromium, DOM/2D/WebGL interaction + resize
```

If you have system Chromium, use `CHROMIUM_PATH=/usr/bin/chromium npm run
test:browser` (adjust the path for your machine). A functioning WebGL device
or software renderer is required; do not substitute jsdom for browser checks.

Everything runs **locally**. Do not use GitHub Actions, hosted CI, or
implicit deployment. `scripts/validate-template.sh` checks MIT licensing,
prohibited workflows and local hook installation; it does not replace
the game tests.

The `src/` subdirectories separate pure rules, config, clock/input orchestration,
and DOM, Canvas 2D and Three.js ownership. Change them for the game's needs,
but avoid multiple competing clocks or giving renderers authority over rules.

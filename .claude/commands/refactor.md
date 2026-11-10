---
description: Simplify code without changing player behavior
---

Read `AGENTS.md`. Identify the exact behavior to preserve, remove duplication
or obsolete abstractions, and leave distinct DOM/Canvas/Three responsibilities
intact. Run `npm run check` before and after. For visual or input changes,
run `npm run test:browser` locally and record any unavailable checks.

Keep the diff small; do not introduce GitHub Actions or change gameplay rules
silently.

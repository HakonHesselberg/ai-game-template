---
description: Review code for regressions and unnecessary complexity
---

Read `AGENTS.md` and the changed files. Compare against the renderer ADR.

Prioritize correctness, input/state ownership, determinism, cleanup, tests,
accessibility and unnecessary abstraction. Check that pure rules do not depend
on browser state and DOM/Canvas/Three have distinct rendering jobs.

Return actionable findings with file references and severity; state clearly
when no issues were found. Do not treat unrun browser tests as verified.

---
description: Verify a change without claiming unrun checks
---

Read `AGENTS.md` and `docs/TESTING.md`.

1. Check the actual diff and architecture ownership.
2. Run `npm run check` and report the result, including failures.
3. For rendering, layout or input changes, run `npm run test:browser` locally.
4. Record browser and real-device evidence separately in `docs/PLAYTEST_MATRIX.md`.
5. Report what passed, what failed or could not run, and remaining risks.

Never use GitHub Actions or present a missing browser as a passing test.

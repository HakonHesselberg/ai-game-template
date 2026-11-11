# Claude Code entry point

Read [AGENTS.md](AGENTS.md) first; it is the canonical policy for every agent.
For new rendering choices, use [the rendering decision guide](docs/RENDERING_DECISION.md);
the [ADR](docs/decisions/0001-renderer.md) is optional for nontrivial tradeoffs.

Local commands are in [README.md](README.md). Run `npm run check`, and use the
browser smoke test for significant rendering or input/layout changes. Report
checks that cannot run. Never use GitHub Actions.

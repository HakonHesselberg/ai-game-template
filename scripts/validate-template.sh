#!/bin/sh
# Self-check for the generic template. Does not claim to test a generated game.
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$repo_root"

fail() {
    printf 'Template validation failed: %s\n' "$1" >&2
    exit 1
}

[ "$(sed -n '1p' LICENSE)" = 'MIT License' ] ||
    fail 'LICENSE must contain the selected MIT license.'
grep -Eq '^Copyright \(c\) [0-9]{4} .+' LICENSE ||
    fail 'MIT LICENSE must contain a year and copyright holder.'
if grep -Eqi '(your[ -]?name|placeholder|<copyright|\[name\])' LICENSE; then
    fail 'MIT copyright attribution still contains a placeholder.'
fi
grep -q 'MIT' README.md ||
    fail 'README must agree with the MIT LICENSE.'
[ -f AGENTS.md ] && [ -f docs/RENDERING_DECISION.md ] &&
    [ -f docs/decisions/0001-renderer.md ] ||
    fail 'Agent and rendering decision documentation is missing.'
if grep -Ei 'GPL-3\.0|GPLv3' README.md >/dev/null; then
    fail 'Conflicting GPL licensing statements remain in setup documentation.'
fi

# Fail closed if someone restores remote Actions workflows.
if [ -d .github/workflows ]; then
    fail 'GitHub Actions workflows are prohibited in this template.'
fi

sh -n scripts/install-hooks.sh
sh -n scripts/validate-template.sh
sh -n scripts/project-checks.sh
sh -n tests/test-hook-installer.sh
[ -x scripts/project-checks.sh ] ||
    fail 'The optional local project-checks hook script must be executable.'
if grep -En '<[[:alnum:]_-]+-command>' scripts/*.sh >/dev/null; then
    fail 'An executable script contains an unresolved command placeholder.'
fi

sh tests/test-hook-installer.sh

printf '%s\n' 'Template validation passed (license, local scripts and no GitHub Actions).'
printf '%s\n' 'Run npm test, npm run build, and npm run test:browser separately for game verification.'

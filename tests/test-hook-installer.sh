#!/bin/sh
# Exercise hook installation in an isolated temporary Git repository.
set -eu

template_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
test_dir=$(mktemp -d "$template_root/tests/.hook-test.XXXXXX")
trap 'rm -rf -- "$test_dir"' EXIT HUP INT TERM

fail() {
    printf 'Hook installer test failed: %s\n' "$1" >&2
    exit 1
}

mkdir -p "$test_dir/project/scripts"
cd "$test_dir/project"
git init -q
cp "$template_root/scripts/install-hooks.sh" scripts/install-hooks.sh
chmod +x scripts/install-hooks.sh

# Missing project checks must not create a hook.
if ./scripts/install-hooks.sh scripts/project-checks.sh >/dev/null 2>&1; then
    fail 'Installed a hook without a configured check script.'
fi
[ ! -e .git/hooks/pre-commit ] || fail 'Created a hook despite missing checks.'

# Existing, failing checks must also prevent installation.
printf '%s\n' '#!/bin/sh' 'exit 9' > scripts/project-checks.sh
chmod +x scripts/project-checks.sh
if ./scripts/install-hooks.sh scripts/project-checks.sh >/dev/null 2>&1; then
    fail 'Installed a hook even though project checks failed.'
fi
[ ! -e .git/hooks/pre-commit ] || fail 'Created a hook despite failing checks.'

# A functioning project script should be run at installation and at commit.
printf '%s\n' '#!/bin/sh' 'set -eu' 'test "$(pwd)" = "$(git rev-parse --show-toplevel)"' 'printf x >> .checks-ran' > scripts/project-checks.sh
chmod +x scripts/project-checks.sh
./scripts/install-hooks.sh scripts/project-checks.sh >/dev/null
[ -x .git/hooks/pre-commit ] || fail 'Did not create an executable hook.'
sh -n .git/hooks/pre-commit
[ "$(wc -c < .checks-ran)" -eq 1 ] || fail 'Installation did not run checks exactly once.'
.git/hooks/pre-commit
[ "$(wc -c < .checks-ran)" -eq 2 ] || fail 'Installed hook did not run project checks.'

# Reinstallation must not alter or replace the existing hook.
cp .git/hooks/pre-commit "$test_dir/original-hook"
if ./scripts/install-hooks.sh scripts/project-checks.sh >/dev/null 2>&1; then
    fail 'Overwrote an existing pre-commit hook.'
fi
cmp -s "$test_dir/original-hook" .git/hooks/pre-commit ||
    fail 'Changed an existing hook when installation was refused.'

printf '%s\n' 'Hook installer regression tests passed.'

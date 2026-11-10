#!/bin/sh
# Install an optional project-specific pre-commit verification hook.
# The generic template cannot know a game's build/test commands.
set -eu

fail() {
    printf 'Error: %s\n' "$1" >&2
    exit 1
}

if [ "$#" -ne 1 ]; then
    fail 'Usage: ./scripts/install-hooks.sh scripts/project-checks.sh (configure an executable local check script first).'
fi

check_script=$1
case "$check_script" in
    scripts/*) ;;
    *) fail 'The check script must be a repository-relative path under scripts/.' ;;
esac
case "$check_script" in
    *[!a-zA-Z0-9_./-]*|*../*|*/..|*/./*|*/.)
        fail 'Use a simple path without spaces, parent-directory segments or shell characters.' ;;
esac
case "$check_script" in
    scripts/install-hooks.sh|scripts/validate-template.sh)
        fail 'Choose a project-specific check script, not a template maintenance script.' ;;
esac

repo_root=$(git rev-parse --show-toplevel 2>/dev/null) || fail 'Run this inside a Git checkout.'
cd "$repo_root"

[ -f "$check_script" ] && [ -x "$check_script" ] ||
    fail "Create an executable $check_script with real build/test commands before installing the hook."

# A custom hooks path takes precedence over .git/hooks; do not install a hook
# somewhere Git will not use, or overwrite user-managed hook arrangements.
if git config --get core.hooksPath >/dev/null 2>&1; then
    fail 'core.hooksPath is configured. Integrate your check script into that existing hook setup manually.'
fi

hooks_dir=$(git rev-parse --git-path hooks)
case "$hooks_dir" in
    /*) ;;
    *) hooks_dir="$repo_root/$hooks_dir" ;;
esac
hook="$hooks_dir/pre-commit"

if [ -e "$hook" ] || [ -L "$hook" ]; then
    fail "A pre-commit hook already exists at $hook. Preserve it and integrate checks manually."
fi

printf 'Running %s once before installation...\n' "$check_script"
if ! "./$check_script"; then
    fail 'Project checks did not pass. Fix them before installing a hook.'
fi

mkdir -p "$hooks_dir"
(
    set -C  # refuse an unexpected concurrent file creation
    umask 077
    {
        printf '%s\n' '#!/bin/sh' 'set -eu'
        printf '%s\n' 'repo_root=$(git rev-parse --show-toplevel)'
        printf '%s\n' 'cd "$repo_root"'
        printf 'exec "./%s"\n' "$check_script"
    } > "$hook"
)
chmod 755 "$hook"

printf 'Installed pre-commit hook for %s. Existing hooks were not overwritten.\n' "$check_script"

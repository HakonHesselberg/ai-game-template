#!/bin/sh
# Optional local pre-commit entry point. Use the same command as manual checks.
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$repo_root"
exec npm run check

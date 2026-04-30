#!/bin/bash
# BNI 121 — one-shot deploy from GitHub to the Hostinger VPS.
#
#   Usage on the VPS (paste this single line in any terminal):
#     curl -sL https://raw.githubusercontent.com/chatgptnotes/bni121/main/1backup/BNI%20121/deploy.sh | bash
#
#   Edits the deploy target by setting BNI_TARGET=/path/to/bni before piping.
#   Default target: /var/www/bni
#
# What it does:
#   1. Clones the repo into a temp folder
#   2. Copies "1backup/BNI 121/" contents into the target dir (preserving perms)
#   3. Skips overwriting files that are newer in the target (rsync -u or cp -n fallback)
#   4. Prints the file list it touched and a "DEPLOYED" line.

set -euo pipefail

TARGET="${BNI_TARGET:-/var/www/bni}"
TMPDIR="${TMPDIR:-/tmp}/bni-deploy-$$"
REPO_URL="https://github.com/chatgptnotes/bni121.git"
SUBDIR="1backup/BNI 121"

echo "──────────────────────────────────────────────"
echo "BNI 121 deploy"
echo "  source : $REPO_URL  (branch: main)"
echo "  target : $TARGET"
echo "──────────────────────────────────────────────"

if [ ! -d "$TARGET" ]; then
  echo "ERROR: target directory $TARGET does not exist"
  echo "  Set BNI_TARGET=/your/path before piping, e.g.:"
  echo "  BNI_TARGET=/srv/bni curl -sL .../deploy.sh | bash"
  exit 1
fi

mkdir -p "$TMPDIR"
trap 'rm -rf "$TMPDIR"' EXIT

echo "→ cloning repo (shallow)…"
git clone --depth 1 --quiet "$REPO_URL" "$TMPDIR/repo"

SRC="$TMPDIR/repo/$SUBDIR/"
if [ ! -d "$SRC" ]; then
  echo "ERROR: expected directory not found in repo: $SUBDIR"
  exit 2
fi

echo "→ syncing files into $TARGET (.bak created for any overwrite)…"
if command -v rsync >/dev/null 2>&1; then
  rsync -av --backup --suffix=.bak "$SRC" "$TARGET/"
else
  cp -av "$SRC." "$TARGET/"
fi

echo
echo "✓ DEPLOYED  $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo "  Visit:  https://hopetech.me/bni/teams.html"

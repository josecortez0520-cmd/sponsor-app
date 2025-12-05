#!/usr/bin/env bash
# WARNING: This script makes destructive changes to the git history. ONLY run after you HAVE REVOKED any exposed secrets
# and you understand that collaborators will need to re-clone or reset their local clones.

set -euo pipefail

cat <<'DESC'
This script shows commands you can run to remove secrets from git history.
1) Replace <TOKEN_OR_PATTERN> with the literal token string to remove.
2) Run `git tag -l > ../tags_before.txt` to backup tag list if desired.
3) Run the filter command to remove the secret, then force-push.
DESC

echo "Example using git filter-repo (recommended):"
echo "  pip install --user git-filter-repo"
echo "  git filter-repo --invert-paths --paths-glob 'path/to/file/with/secret'" 

echo "Example removing a specific string across history using git-filter-repo (safer to test first):"
echo "  git filter-repo --replace-text <(echo '<TOKEN>==> [REDACTED]') --force"

echo "If you prefer BFG (simpler):"
echo "  curl -L https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar -o bfg.jar"
echo "  java -jar bfg.jar --delete-files 'path/to/file'"
echo "  git reflog expire --expire=now --all && git gc --prune=now --aggressive"

echo "After cleaning history, force-push to origin (ensure you have backups):"
echo "  git push --force --tags origin main"

echo "NOTE: Do NOT run any history rewrite until you have revoked exposed tokens. This script intentionally prints safe instructions only."

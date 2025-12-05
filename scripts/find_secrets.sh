#!/usr/bin/env bash
# scan repository for likely secrets (quick grep)
set -euo pipefail
echo "Scanning repository for potential secrets..."
# common patterns: github token, supabase, service keys, AWS keys
GREP_PATTERNS=(
  "ghp_[A-Za-z0-9_]+"
  "SUPABASE_KEY"
  "SUPABASE_URL"
  "service_role"
  "AWS_SECRET_ACCESS_KEY"
  "AKIA[0-9A-Z]{16}"
  "-----BEGIN PRIVATE KEY-----"
)
for p in "${GREP_PATTERNS[@]}"; do
  echo "--- Pattern: $p ---"
  git grep -n --line-number -I -E "$p" || true
done

echo "Also searching for long base64-like tokens or secrets in committed history (this may return false positives)"
git grep -n --line-number -I -E "[A-Za-z0-9_]{40,}" || true

echo "Scan complete. If you find secrets, revoke them immediately and then run the cleanup script: scripts/cleanup_git_history.sh" 

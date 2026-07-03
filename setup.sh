#!/usr/bin/env bash
# setup.sh — installs backend dependencies and starts the server.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> Installing backend dependencies"
cd "$ROOT_DIR/backend"
npm install

echo "==> (optional) Generating demo users"
if command -v python3 >/dev/null 2>&1; then
    python3 "$ROOT_DIR/scripts/seed_users.py" --count 5
else
    echo "python3 not found, skipping demo user generation"
fi

echo "==> Starting server on http://localhost:3000"
npm start

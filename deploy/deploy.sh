#!/bin/bash
# Deploy / update Dyntra from Git on VPS
# Run from repo root: bash deploy/deploy.sh
# First time: bash deploy/deploy.sh --first-run

set -euo pipefail

FIRST_RUN=false
if [ "${1:-}" = "--first-run" ]; then
  FIRST_RUN=true
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Pulling latest code..."
git pull origin main

echo "==> Starting PostgreSQL..."
docker compose -f docker-compose.prod.yml --env-file backend/.env up -d

echo "==> Installing backend dependencies..."
cd backend
npm ci --omit=dev

if [ "$FIRST_RUN" = true ]; then
  echo "==> First run: initializing database..."
  npm run seed
fi

cd "$ROOT"

echo "==> Building frontend..."
cd frontend
npm ci
npm run build
cd "$ROOT"

echo "==> Restarting API with PM2..."
pm2 startOrRestart deploy/ecosystem.config.cjs
pm2 save

echo "==> Reloading Nginx..."
sudo nginx -t
sudo systemctl reload nginx

echo ""
echo "Deploy complete!"
echo "Site: check FRONTEND_URL in backend/.env"

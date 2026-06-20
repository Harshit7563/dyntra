#!/bin/bash
# One-shot bootstrap for Ubuntu VPS — run AFTER cloning repo
# Usage: bash deploy/vps-bootstrap.sh

set -euo pipefail

DOMAIN="dyntra.in"
APP_DIR="/var/www/dyntra"

echo "=== Dyntra.in VPS Bootstrap ==="

if [ ! -f "$APP_DIR/backend/.env" ]; then
  echo "ERROR: backend/.env missing."
  echo "Run: cp deploy/env.production.example backend/.env && nano backend/.env"
  exit 1
fi

bash "$APP_DIR/deploy/setup-vps.sh" "$DOMAIN"
bash "$APP_DIR/deploy/deploy.sh" --first-run

echo ""
echo "=== Next: SSL ==="
echo "sudo certbot --nginx -d dyntra.in -d www.dyntra.in"
echo ""
echo "=== Live URLs ==="
echo "https://dyntra.in"
echo "https://dyntra.in/admin"

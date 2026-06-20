#!/bin/bash
# First-time Hostinger VPS setup for Dyntra (Ubuntu 22.04/24.04)
# Run on VPS as root or with sudo: bash deploy/setup-vps.sh YOUR_DOMAIN

set -euo pipefail

DOMAIN="${1:-dyntra.in}"
APP_DIR="/var/www/dyntra"

if [ -z "$DOMAIN" ]; then
  echo "Usage: bash deploy/setup-vps.sh [dyntra.in]"
  exit 1
fi

echo "==> Updating system..."
apt update && apt upgrade -y

echo "==> Installing Node.js 20, Nginx, Git, Docker..."
apt install -y curl git nginx certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi

echo "==> Creating app directory..."
mkdir -p "$APP_DIR"
chown -R "$SUDO_USER:$SUDO_USER" /var/www 2>/dev/null || true

echo "==> Nginx config for $DOMAIN..."
sed "s/YOUR_DOMAIN/$DOMAIN/g" "$APP_DIR/deploy/nginx-dyntra.conf" > /etc/nginx/sites-available/dyntra
ln -sf /etc/nginx/sites-available/dyntra /etc/nginx/sites-enabled/dyntra
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo ""
echo "Setup done. Next steps:"
echo "1. Clone your Git repo into $APP_DIR"
echo "2. Copy deploy/env.production.example to backend/.env and fill secrets"
echo "3. Run: bash deploy/deploy.sh --first-run"
echo "4. SSL: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"

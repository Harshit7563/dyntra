#!/bin/bash
# Full first-time install — runs ON the VPS (Ubuntu)
# From your Mac: bash deploy/upload-to-vps.sh

set -euo pipefail

DOMAIN="dyntra.in"
VPS_IP="187.127.164.150"
APP_DIR="/var/www/dyntra"
REPO="https://github.com/Harshit7563/dyntra.git"

DB_PASS="$(openssl rand -hex 16)"
JWT_SECRET="$(openssl rand -hex 32)"
WEBHOOK_SECRET="$(openssl rand -hex 16)"

echo "=========================================="
echo "  Dyntra.in VPS Install"
echo "  IP: $VPS_IP"
echo "=========================================="

echo ""
echo "[1/10] System update..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq

echo "[2/10] Installing Git, Nginx, Certbot..."
apt-get install -y -qq git curl nginx certbot python3-certbot-nginx ca-certificates gnupg

echo "[3/10] Installing Node.js 20..."
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi
node -v
npm install -g pm2

echo "[4/10] Installing Docker..."
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable docker
systemctl start docker

echo "[5/10] Cloning GitHub repo..."
mkdir -p /var/www
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git pull origin main
else
  rm -rf "$APP_DIR"
  git clone "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"

echo "[6/10] Creating backend/.env..."
cat > backend/.env << ENVEOF
PORT=5001
NODE_ENV=production
POSTGRES_USER=dyntra
POSTGRES_PASSWORD=${DB_PASS}
POSTGRES_DB=dyntra
DATABASE_URL=postgresql://dyntra:${DB_PASS}@127.0.0.1:5432/dyntra
FRONTEND_URL=https://${DOMAIN}
JWT_SECRET=${JWT_SECRET}
COMPANY_EMAIL=dynatradex@gmail.com
SMTP_USER=dynatradex@gmail.com
SMTP_PASS=
SMTP_FROM=Dyntra <dynatradex@gmail.com>
PAYMENT_WEBHOOK_SECRET=${WEBHOOK_SECRET}
WHATSAPP_ADMIN_PHONE=919137382475
ENVEOF
chmod 600 backend/.env

echo "[7/10] Starting PostgreSQL..."
docker compose -f docker-compose.prod.yml --env-file backend/.env up -d
sleep 5

echo "[8/10] Backend + database seed..."
cd backend
npm ci --omit=dev
npm run seed
cd "$APP_DIR"

echo "[9/10] Building frontend..."
cd frontend
npm ci
npm run build
cd "$APP_DIR"

echo "[10/10] Nginx + PM2 + Firewall..."
cp deploy/nginx-dyntra.conf /etc/nginx/sites-available/dyntra
# Allow access via IP before DNS propagates
sed -i "s/server_name dyntra.in www.dyntra.in;/server_name dyntra.in www.dyntra.in ${VPS_IP};/" /etc/nginx/sites-available/dyntra
ln -sf /etc/nginx/sites-available/dyntra /etc/nginx/sites-enabled/dyntra
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl reload nginx

pm2 startOrRestart deploy/ecosystem.config.cjs
pm2 save
pm2 startup systemd -hp /root -- 2>/dev/null || true

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable || true

echo ""
echo "=========================================="
echo "  DEPLOY SUCCESS!"
echo "=========================================="
echo ""
echo "Test now:"
echo "  curl http://${VPS_IP}/api/health"
echo ""
echo "Admin login:"
echo "  http://${VPS_IP}/admin"
echo "  Email: admin@dyntra.in"
echo "  Password: admin123"
echo ""
echo "Saved secrets in: ${APP_DIR}/backend/.env"
echo "Add SMTP_PASS in .env for order emails."
echo ""
echo "DNS (Hostinger): Point @ and www to ${VPS_IP}"
echo "Then run SSL:"
echo "  certbot --nginx -d dyntra.in -d www.dyntra.in"
echo "=========================================="

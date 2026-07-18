# dyntra.in → VPS 187.127.164.150

## Current status (checked now)

| Check | Result |
|-------|--------|
| dyntra.in DNS | `76.223.105.230` / `13.248.243.5` (GoDaddy hosting) ❌ |
| Your VPS IP | `187.127.164.150` |
| VPS web server | Not running yet (needs deploy) |

**Domain abhi VPS par point nahi hai** — isliye site load/load karti rehti hai.

---

## STEP 1 — DNS change (Hostinger)

Hostinger → **Domains** → **dyntra.in** → **Manage DNS** / **DNS Zone**

### Delete / edit these old records (GoDaddy hosting):
- `@` → 76.223.105.230
- `@` → 13.248.243.5  
- `www` → same IPs

### Add / update to this:

| Type | Name | Points to | TTL |
|------|------|-----------|-----|
| **A** | **@** | **187.127.164.150** | 3600 |
| **A** | **www** | **187.127.164.150** | 3600 |

Save karo. DNS update: **15 min – 2 hours**.

Verify (Mac terminal):
```bash
dig +short dyntra.in A
# Should show: 187.127.164.150
```

---

## STEP 2 — VPS par deploy (copy-paste poora block)

Mac se SSH:
```bash
ssh root@187.127.164.150
```

VPS par ye **poora block** paste karo:

```bash
set -e

# --- App clone ---
apt update && apt install -y git curl
mkdir -p /var/www
cd /var/www
rm -rf dyntra
git clone https://github.com/Harshit7563/dyntra.git dyntra
cd dyntra

# --- .env (passwords change karo!) ---
cat > backend/.env << 'ENVEOF'
PORT=5001
NODE_ENV=production
POSTGRES_USER=dyntra
POSTGRES_PASSWORD=DyntraDb2025Secure!
POSTGRES_DB=dyntra
DATABASE_URL=postgresql://dyntra:DyntraDb2025Secure!@127.0.0.1:5432/dyntra
FRONTEND_URL=https://dyntra.in
JWT_SECRET=dyntra-jwt-change-this-to-random-64-chars-minimum
COMPANY_EMAIL=dynatradex@gmail.com
SMTP_USER=dynatradex@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=Dyntra <dynatradex@gmail.com>
PAYMENT_WEBHOOK_SECRET=dyntra-webhook-secret-change-me
WHATSAPP_ADMIN_PHONE=919137382475
ENVEOF

echo "Edit SMTP_PASS in backend/.env if needed: nano backend/.env"

# --- Install + deploy ---
bash deploy/vps-bootstrap.sh

# --- Firewall ---
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "Deploy done. Waiting for DNS..."
echo "Test: curl http://187.127.164.150/api/health"
```

---

## STEP 3 — SSL (DNS update ke baad)

Jab `dig +short dyntra.in A` → `187.127.164.150` dikhe:

```bash
certbot --nginx -d dyntra.in -d www.dyntra.in
```

---

## STEP 4 — Test

```bash
curl http://187.127.164.150/api/health
# {"status":"ok","name":"Dyntra API"}

curl https://dyntra.in/api/health
# Same (after DNS + SSL)
```

**Live site:** https://dyntra.in  
**Admin:** https://dyntra.in/admin  
**Login:** `admin@dyntra.in` / `admin123` (pehle login ke baad password change karo)

---

## Baad me code update

VPS par:
```bash
cd /var/www/dyntra && bash deploy/deploy.sh
```

---

## Agar SSH connect na ho

Hostinger hPanel → VPS → **Root password reset**  
Port 22 open hona chahiye.

## Agar deploy fail ho

```bash
pm2 logs dyntra-api
docker ps
nginx -t
```

Error screenshot bhejo — fix kar denge.

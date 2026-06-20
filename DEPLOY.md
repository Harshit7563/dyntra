# Dyntra — Hostinger VPS par Git se Live Deploy

> **Important:** Shared **web hosting** (cPanel) sirf PHP/static ke liye hoti hai.  
> Dyntra me **Node.js + PostgreSQL** chahiye — isliye **Hostinger VPS** use karo, web hosting nahi.

---

## Architecture

```
Browser → dyntra.in (HTTPS)
           ↓
         Nginx
    ┌──────┴──────┐
    │             │
 frontend/dist   /api + /uploads → Node (PM2) → PostgreSQL (Docker)
```

---

## Step 1 — GitHub par code push karo

### Local machine par (ek baar)

```bash
cd /Users/harshit/Dyntra

# Alag repo banao (recommended)
git init
git add .
git commit -m "Dyntra e-commerce initial release"

# GitHub par naya repo banao: dyntra (Private recommended)
git branch -M main
git remote add origin https://github.com/Harshit7563/dyntra.git
git push -u origin main
```

> Purana repo `anilax-software` alag project hai — Dyntra ke liye **naya repo** best hai.

---

## Step 2 — Domain DNS (Hostinger)

Hostinger → **Domains** → DNS Zone:

| Type | Name | Value        | TTL |
|------|------|--------------|-----|
| A    | @    | VPS_IP       | 3600 |
| A    | www  | VPS_IP       | 3600 |

VPS IP: Hostinger hPanel → VPS → Overview

DNS propagate hone me 5 min – 24 hours lag sakte hain.

---

## Step 3 — VPS par pehli baar setup

SSH se connect karo:

```bash
ssh root@YOUR_VPS_IP
```

### 3a. Repo clone

```bash
apt update && apt install -y git
mkdir -p /var/www
cd /var/www
git clone https://github.com/Harshit7563/dyntra.git dyntra
cd dyntra
```

### 3b. Environment file

```bash
cp deploy/env.production.example backend/.env
nano backend/.env
```

Zaroor change karo:

- `POSTGRES_PASSWORD` — strong password
- `DATABASE_URL` — same password
- `FRONTEND_URL` — `https://dyntra.in`
- `JWT_SECRET` — random long string
- `SMTP_PASS` — Gmail App Password

### 3c. Server setup (Node, Nginx, Docker, PM2)

```bash
bash deploy/setup-vps.sh dyntra.in
```

### 3d. Pehla deploy

```bash
bash deploy/deploy.sh --first-run
```

### 3e. SSL (HTTPS) — free

```bash
certbot --nginx -d dyntra.in -d www.dyntra.in
```

---

## Step 4 — Baad me update (Git se)

Local par changes push karo:

```bash
git add .
git commit -m "your update message"
git push origin main
```

VPS par:

```bash
cd /var/www/dyntra
bash deploy/deploy.sh
```

---

## PM2 useful commands

```bash
pm2 status
pm2 logs dyntra-api
pm2 restart dyntra-api
```

---

## Admin login (production)

- URL: `https://dyntra.in/admin`
- Default (seed se): `admin@dyntra.in` / `admin123`
- **Pehle login ke baad password change karo**

---

## Payment gateway (live)

Admin → Payment → Gateway add karo:

- **Callback URL:** `https://dyntra.in/order-success/{order_number}?payment=success&email={email}`
- **Webhook URL:** `https://dyntra.in/api/payment/webhook`
- Header: `X-Payment-Secret: <PAYMENT_WEBHOOK_SECRET from .env>`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Site nahi khul rahi | `sudo nginx -t` · `pm2 status` · DNS A record check |
| API error | `pm2 logs dyntra-api` · `backend/.env` check |
| DB error | `docker ps` · `docker compose -f docker-compose.prod.yml logs` |
| 502 Bad Gateway | API crash — `pm2 restart dyntra-api` |
| Upload images fail | `backend/uploads/products` folder permissions |

---

## Firewall (recommended)

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

PostgreSQL port 5432 sirf localhost par bind hai — internet se open nahi.

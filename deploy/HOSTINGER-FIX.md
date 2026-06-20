# dyntra.in — Hostinger Git Error Fix

## Problem kya hai?

**dyntra.in** abhi **Hostinger Web Hosting / GoDaddy Website Builder** par point hai — hamara **Node.js app wahan nahi hai**.

Jab tum Hostinger me **GitHub connect** karte ho:
- Panel **load/load** karta rehta hai ya fail hota hai
- Kyunki hamara repo **React + Node API + PostgreSQL** hai
- Hostinger **web hosting Git** sirf **static HTML/PHP** sites ke liye hai — **Node.js nahi chalta**

GitHub repo theek hai: https://github.com/Harshit7563/dyntra

---

## Sahi tareeka (VPS use karo)

| ❌ Mat karo | ✅ Karo |
|------------|--------|
| Hostinger Web Hosting → Git connect | **Ubuntu VPS** par SSH se deploy |
| Website Builder | Hamara `deploy/deploy.sh` script |

---

## Step 1 — DNS change (IMPORTANT)

Hostinger → **Domains** → dyntra.in → **DNS Zone**

**Purane records hatao** jo web hosting / GoDaddy builder ki taraf point karte hain.

**Naye records add karo:**

| Type | Name | Points to |
|------|------|-----------|
| A | @ | **VPS ka IP** (e.g. 72.x.x.x) |
| A | www | **VPS ka IP** (same) |

VPS IP: Hostinger hPanel → **VPS** → Overview → IP Address

> DNS change hone me 15 min – 2 hours lag sakte hain.

---

## Step 2 — Hostinger Git disconnect karo

Web Hosting panel me agar GitHub connect try kiya tha:
- **Disconnect / Remove** kar do
- Woh feature is project ke liye use mat karo

---

## Step 3 — VPS par deploy (SSH)

```bash
ssh root@YOUR_VPS_IP

apt update && apt install -y git
mkdir -p /var/www && cd /var/www
git clone https://github.com/Harshit7563/dyntra.git dyntra
cd dyntra

cp deploy/env.production.example backend/.env
nano backend/.env
# POSTGRES_PASSWORD, JWT_SECRET, SMTP_PASS fill karo

bash deploy/vps-bootstrap.sh

certbot --nginx -d dyntra.in -d www.dyntra.in
```

---

## Verify

```bash
curl https://dyntra.in/api/health
# Expected: {"status":"ok","name":"Dyntra API"}
```

Agar ab bhi GoDaddy page dikhe → DNS abhi update nahi hua, thoda wait karo.

---

## Agar sirf local (localhost) load ho raha ho

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Open: http://localhost:3000 (3001 nahi, unless 3000 busy ho)

#!/bin/bash
# Paste this whole block in cPanel Terminal as user dyntra
set -e

echo "=== 1) Pull frontend helper repo ==="
cd /home/dyntra/dyntra
git fetch origin main
git reset --hard origin/main

echo "=== 2) Deploy static frontend ==="
rm -rf /home/dyntra/public_html/assets
cp -r frontend/dist/* /home/dyntra/public_html/
mkdir -p /home/dyntra/public_html/categories /home/dyntra/public_html/hero
cp -r frontend/dist/categories/* /home/dyntra/public_html/categories/ 2>/dev/null || true
cp -r frontend/dist/hero/* /home/dyntra/public_html/hero/ 2>/dev/null || true
echo "Frontend files:"
ls /home/dyntra/public_html/assets | head -5

echo "=== 3) Pull backend app ==="
cd /home/dyntra/apps/dyntra-app
git stash push -u -m "cpanel-pre-pull-$(date +%s)" || true
git fetch origin main
git reset --hard origin/main
test -f backend/src/routes/ai.js && echo "AI route OK" || echo "WARNING: ai.js missing"
test -f backend/src/routes/festival.js && echo "Festival route OK" || echo "WARNING: festival.js missing"
test -f backend/src/utils/festivalPresets.js && echo "Festival presets OK" || echo "WARNING: presets missing"

echo "=== 4) Restart Node ==="
PID=$(pgrep -f 'apps/dyntra-app/backend/src/index.js' | head -1 || true)
if [ -n "$PID" ]; then
  kill "$PID" || true
  echo "Killed old Node PID $PID"
else
  echo "Node PID nahi mila"
fi
echo ""
echo ">>> Ab cPanel → Setup Node.js App → STOP → START dabao <<<"
echo ""
echo "Phir check:"
echo "  https://dyntra.in/api/festival"
echo "  https://dyntra.in/api/health"
echo "  https://dyntra.in/"
echo "=== DONE ==="

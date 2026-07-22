#!/bin/bash
# Lightweight cPanel deploy — low memory (avoids git thread OOM)
set -e

echo "=== Git low-memory settings ==="
git config --global pack.threads 1
git config --global pack.windowMemory 10m
git config --global pack.packSizeLimit 20m
git config --global core.packedGitLimit 8m
git config --global core.packedGitWindowSize 8m
git config --global http.postBuffer 52428800

pull_shallow() {
  local dir="$1"
  cd "$dir"
  echo "Pulling $dir (shallow)..."
  git remote set-branches origin main 2>/dev/null || true
  if ! git fetch --depth=1 origin main; then
    echo "Shallow fetch failed — trying zip download..."
    return 1
  fi
  git checkout -f FETCH_HEAD 2>/dev/null || git reset --hard origin/main
  return 0
}

echo "=== 1) Frontend helper repo ==="
if ! pull_shallow /home/dyntra/dyntra; then
  echo "Downloading frontend zip..."
  cd /home/dyntra
  rm -rf dyntra-tmp.zip dyntra-extract
  curl -fsSL -o dyntra-tmp.zip "https://github.com/Harshit7563/dyntra/archive/refs/heads/main.zip"
  unzip -q dyntra-tmp.zip
  rm -rf dyntra-extract
  mv dyntra-main dyntra-extract
  # keep .git if present; sync files into helper clone
  rsync -a --delete --exclude .git dyntra-extract/ /home/dyntra/dyntra/
  rm -rf dyntra-tmp.zip dyntra-extract
fi

echo "=== 2) Deploy static frontend ==="
cd /home/dyntra/dyntra
rm -rf /home/dyntra/public_html/assets
cp -r frontend/dist/* /home/dyntra/public_html/
mkdir -p /home/dyntra/public_html/categories /home/dyntra/public_html/hero
cp -r frontend/dist/categories/* /home/dyntra/public_html/categories/ 2>/dev/null || true
cp -r frontend/dist/hero/* /home/dyntra/public_html/hero/ 2>/dev/null || true
ls /home/dyntra/public_html/assets | head -5

echo "=== 3) Backend app ==="
cd /home/dyntra/apps/dyntra-app
git stash push -u -m "cpanel-pre-pull-$(date +%s)" 2>/dev/null || true
if ! pull_shallow /home/dyntra/apps/dyntra-app; then
  echo "Downloading backend zip..."
  cd /tmp
  rm -rf dyntra-be.zip dyntra-main
  curl -fsSL -o dyntra-be.zip "https://github.com/Harshit7563/dyntra/archive/refs/heads/main.zip"
  unzip -q dyntra-be.zip
  rsync -a --delete \
    --exclude .git \
    --exclude node_modules \
    --exclude backend/.env \
    --exclude backend/uploads \
    dyntra-main/ /home/dyntra/apps/dyntra-app/
  rm -rf dyntra-be.zip dyntra-main
fi

cd /home/dyntra/apps/dyntra-app
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
echo ">>> cPanel → Setup Node.js App → STOP → START <<<"
echo "Check: https://dyntra.in/api/festival"
echo "=== DONE ==="

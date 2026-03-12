#!/bin/bash
cd "$(dirname "$0")/.."
mkdir -p games emulators/roms/{nes,snes,gba,gbc,n64,nds,genesis,psx}

echo "=== Null Testament: Cloning game repositories ==="

echo "[1/5] Cloning MonkeyGG2..."
git clone --depth 1 https://github.com/MonkeyGG2/monkeygg2.github.io.git games/monkeygg2
rm -rf games/monkeygg2/.git

echo "[2/5] Cloning 3kh0-lite..."
git clone --depth 1 https://github.com/3kh0/3kh0-lite.git games/3kh0
rm -rf games/3kh0/.git

echo "[3/5] Cloning EmulatorJS..."
git clone --depth 1 https://github.com/EmulatorJS/EmulatorJS.git emulators/emulatorjs
rm -rf emulators/emulatorjs/.git

echo "[4/5] Cleaning up unnecessary files..."
find games -name "*.md" -delete 2>/dev/null
find games -name "LICENSE" -delete 2>/dev/null
find games -name ".gitignore" -delete 2>/dev/null

echo "[5/5] Generating game catalog..."
node scripts/scan-games.js

echo "=== Done! ==="

#!/usr/bin/env bash
# Деплой на VPS. Запуск: /var/www/travellta-ai/scripts/deploy.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Deploy Travellta $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "==> Directory: $ROOT_DIR"

echo "==> git pull"
git pull origin main

echo "==> npm install"
npm install

echo "==> build"
npm run build

echo "==> postgres"
docker-compose up -d

echo "==> pm2 restart"
pm2 restart travellta-api travellta-web

echo "==> status"
pm2 status

echo "==> Deploy finished OK"

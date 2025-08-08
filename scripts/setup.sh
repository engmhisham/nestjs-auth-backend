#!/bin/bash
# scripts/setup.sh - Local project setup (Node + Postgres)

set -e

echo "Setting up NestJS Auth System (local)..."

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Please install Node.js v18+."
  exit 1
fi

NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Node.js 18+ is required. Current: $(node -v)"
  exit 1
fi

npm install

if [ ! -f .env ]; then
  cp .env.example .env
  echo ".env created. Update DB credentials if needed."
fi

mkdir -p logs
echo "Local setup complete."
echo "Run: npm run start:dev"

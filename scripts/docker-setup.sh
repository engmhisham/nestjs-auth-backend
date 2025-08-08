#!/bin/bash
# scripts/docker-setup.sh - Build and run with Docker

set -e

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed."
  exit 1
fi
if ! command -v docker-compose >/dev/null 2>&1; then
  echo "docker-compose is not installed."
  exit 1
fi

if [ ! -f .env.docker ]; then
  cp .env.example .env.docker
  # تعديل تلقائي لقيم الداتابيس داخل .env.docker
  sed -i.bak 's/^DB_HOST=.*/DB_HOST=postgres/' .env.docker
  sed -i.bak 's/^DB_PORT=.*/DB_PORT=5432/' .env.docker
  sed -i.bak 's/^DB_USERNAME=.*/DB_USERNAME=postgres/' .env.docker
  sed -i.bak 's/^DB_PASSWORD=.*/DB_PASSWORD=041196/' .env.docker
  sed -i.bak 's/^DB_NAME=.*/DB_NAME=auth_system_dev/' .env.docker
  sed -i.bak 's/^FRONTEND_URL=.*/FRONTEND_URL=http:\\/\\/localhost:5173/' .env.docker
  rm -f .env.docker.bak
  echo ".env.docker created."
fi

docker-compose up -d --build

echo "Services running:"
echo "- API:      http://localhost:3000/api/v1"
echo "- Swagger:  http://localhost:3000/api/docs"

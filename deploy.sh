#!/usr/bin/env bash
set -euo pipefail

# Despliegue simple y repetible para el stack Docker Compose.
# Uso:
#   ./deploy.sh                 # usa rama main
#   ./deploy.sh develop         # usa otra rama

BRANCH="${1:-main}"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

cd "$PROJECT_DIR"

echo "==> Verificando prerequisitos"
command -v git >/dev/null 2>&1 || { echo "git no esta instalado"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "docker no esta instalado"; exit 1; }

if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose no esta disponible"
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "Falta archivo .env en $PROJECT_DIR"
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Tu repositorio tiene cambios locales sin confirmar."
  echo "Haz commit o stash antes de desplegar para evitar conflictos con git pull."
  echo
  git status --short
  exit 1
fi

echo "==> Actualizando codigo (rama: $BRANCH)"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "==> Construyendo y levantando servicios"
docker compose up -d --build

echo "==> Esperando base de datos saludable"
for i in {1..30}; do
  status="$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' inventario-db 2>/dev/null || true)"
  if [[ "$status" == "healthy" || "$status" == "none" ]]; then
    break
  fi
  sleep 2
  if [[ "$i" -eq 30 ]]; then
    echo "La base de datos no paso a healthy a tiempo"
    docker compose logs --tail=80 db
    exit 1
  fi
done

echo "==> Verificando estado de contenedores"
docker compose ps

echo "==> Smoke test API"
if ! curl -fsS "http://localhost:3000/api/productos" >/dev/null; then
  echo "Fallo el smoke test de la API"
  docker compose logs --tail=120 api
  exit 1
fi

echo "==> Deploy completado correctamente"

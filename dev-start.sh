#!/bin/bash
# Onyx Local Dev Launcher
# Starts: Backend (FastAPI) + Frontend (Next.js) + Celery (worker + beat)
# Prerequisites: Docker infra running (docker-compose.infra.yml)

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_PYTHON="$ROOT_DIR/.venv/Scripts/python.exe"
BACKEND_DIR="$ROOT_DIR/backend"
WEB_DIR="$ROOT_DIR/web"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

cleanup() {
    echo -e "\n${YELLOW}Stopping all services...${NC}"
    kill $(jobs -p) 2>/dev/null
    wait 2>/dev/null
    echo -e "${GREEN}All services stopped.${NC}"
}
trap cleanup EXIT INT TERM

# Check prerequisites
echo -e "${CYAN}=== Onyx Dev Launcher ===${NC}"

if [ ! -f "$VENV_PYTHON" ]; then
    echo -e "${RED}ERROR: Python venv not found at $VENV_PYTHON${NC}"
    exit 1
fi

if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${RED}ERROR: backend/.env not found${NC}"
    exit 1
fi

# Check Docker infra
if ! docker ps --filter "name=onyx-infra" --format "{{.Names}}" 2>/dev/null | grep -q "onyx-infra"; then
    echo -e "${YELLOW}Docker infra not running. Starting...${NC}"
    docker compose -f "$ROOT_DIR/deployment/docker_compose/docker-compose.infra.yml" up -d
    echo -e "${GREEN}Docker infra started.${NC}"
    sleep 3
fi

# Load backend env vars
cd "$BACKEND_DIR"
set -a && source .env && set +a

# 1. Backend (FastAPI)
echo -e "${GREEN}[1/4] Starting Backend (port 8080)...${NC}"
"$VENV_PYTHON" -m uvicorn features.onyx.main:app \
    --host 0.0.0.0 --port 8080 --reload \
    2>&1 | sed "s/^/[backend] /" &

# 2. Celery Worker (consolidated)
echo -e "${GREEN}[2/4] Starting Celery Worker...${NC}"
"$VENV_PYTHON" -m celery \
    -A onyx.background.celery.apps.background worker \
    --loglevel=info --pool=solo \
    2>&1 | sed "s/^/[celery-worker] /" &

# 3. Celery Beat (scheduler)
echo -e "${GREEN}[3/4] Starting Celery Beat...${NC}"
"$VENV_PYTHON" -m celery \
    -A onyx.background.celery.apps.beat beat \
    --loglevel=info \
    2>&1 | sed "s/^/[celery-beat] /" &

# 4. Frontend (Next.js)
echo -e "${GREEN}[4/4] Starting Frontend (port 3000)...${NC}"
cd "$WEB_DIR"
npm run dev 2>&1 | sed "s/^/[frontend] /" &

echo ""
echo -e "${CYAN}=== All services starting ===${NC}"
echo -e "  Backend:  http://localhost:8080 (API docs: /docs)"
echo -e "  Frontend: http://localhost:3000"
echo -e "  Celery:   worker + beat running"
echo -e ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

wait

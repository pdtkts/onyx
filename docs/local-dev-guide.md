# Tee-Agent Local Development Guide

## Prerequisites

- Python 3.11+, Node.js 20+, Docker
- MinIO chạy trong Docker infra profile mặc định (`docker-compose.infra.yml`)

## 1. Start Infrastructure (Docker)

```bash
cd deployment/docker_compose
docker compose -f docker-compose.infra.yml up -d
```

Services: PostgreSQL (:5432), Redis (:6379), Vespa (:19071/:8081), MinIO (:9000/:9001)

MinIO Console: http://localhost:9001 (user: `minioadmin` / pass: `minioadmin123`)

Check health:

```bash
docker ps --filter "name=onyx-infra" --format "table {{.Names}}\t{{.Status}}"
```

## 2. Start Backend

```powershell
# PowerShell - load .env rồi khởi động uvicorn
cd backend
..\.venv\Scripts\python.exe -m uvicorn features.onyx.main:app --host 0.0.0.0 --port 8080 --reload --env-file .env
```

```bash
# Git Bash - load .env rồi khởi động uvicorn
cd backend
set -a && source .env && set +a && ../.venv/Scripts/python.exe -m uvicorn features.onyx.main:app --host 0.0.0.0 --port 8080 --reload
```

DB migration (chỉ cần chạy lần đầu hoặc khi có migration mới):

```powershell
# PowerShell
cd backend
Get-Content .env | ForEach-Object { if ($_ -match '^([^#].+?)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process') } }
..\.venv\Scripts\python.exe -m alembic upgrade head
```

```bash
# Git Bash
cd backend
set -a && source .env && set +a && ../.venv/Scripts/python.exe -m alembic upgrade head
```

API docs: http://localhost:8080/docs
Health: http://localhost:8080/health

## 3. Start Frontend

```bash
cd web
npm run dev
```

App: http://localhost:3000 (hoặc 3001 nếu 3000 bị chiếm)

## 4. Stop

```bash
# Stop infra
cd deployment/docker_compose
docker compose -f docker-compose.infra.yml down

# Stop BE/FE: Ctrl+C trong terminal tương ứng
```

## Config Files

| File                                                 | Mục đích                                                 |
| ---------------------------------------------------- | -------------------------------------------------------- |
| `backend/.env`                                       | Backend env vars (DB, Redis, Vespa, MinIO, model server) |
| `deployment/docker_compose/.env`                     | Docker infra env vars                                    |
| `deployment/docker_compose/docker-compose.infra.yml` | Docker infra services                                    |

## Known Issues

| Vấn đề                                     | Giải pháp                                           |
| ------------------------------------------ | --------------------------------------------------- |
| Vespa `illegal instruction`                | Dùng image `vespa-generic-intel-x86_64` (đã config) |
| `chonkie` build fail                       | Đã fix version 1.0.8 trong pyproject.toml           |
| `PIL.Image` import error                   | `uv pip install --force-reinstall Pillow`           |
| Port 9000 conflict (MinIO vs model server) | `DISABLE_MODEL_SERVER=true` trong backend/.env      |
| `AUTH_TYPE=disabled` not supported         | Dùng `AUTH_TYPE=basic`                              |
| FE lock file error                         | Xóa `web/.next/dev/lock` rồi chạy lại               |

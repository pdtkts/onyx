# Onyx Local Development Guide

## Prerequisites

- Python 3.11+, Node.js 20+, Docker
- MinIO được bao gồm trong Docker infra (localhost:9000)

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

> **Note:** This fork uses the **features layer** as entry point: `features.onyx.main:app`. It wraps the MIT base app and adds custom routers under `/api/features/*`. EE features are disabled.

**Option A -- Quick start (recommended):**

```bash
# From project root (Git Bash on Windows)
./dev-start.sh
```

Starts backend + frontend + Celery worker + Celery beat in one terminal. Press `Ctrl+C` to stop all.

**Option B -- Manual start:**

```bash
cd backend
# Windows (Git Bash)
set -a && source .env && set +a
../.venv/Scripts/python.exe -m uvicorn features.onyx.main:app --host 0.0.0.0 --port 8080 --reload
```

DB migration (chỉ cần chạy lần đầu hoặc khi có migration mới):

```bash
cd backend
set -a && source .env && set +a
../.venv/Scripts/python.exe -m alembic upgrade head
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
| `dev-start.sh`                                       | One-command launcher (BE + FE + Celery)                  |

## Known Issues

| Vấn đề                                     | Giải pháp                                           |
| ------------------------------------------ | --------------------------------------------------- |
| Vespa `illegal instruction`                | Dùng image `vespa-generic-intel-x86_64` (đã config) |
| `chonkie` build fail                       | Đã fix version 1.0.8 trong pyproject.toml           |
| `PIL.Image` import error                   | `uv pip install --force-reinstall Pillow`           |
| Port 9000 conflict (MinIO vs model server) | `DISABLE_MODEL_SERVER=true` trong backend/.env      |
| `AUTH_TYPE=disabled` not supported         | Dùng `AUTH_TYPE=basic`                              |
| FE lock file error                         | Xóa `web/.next/dev/lock` rồi chạy lại               |

## Git Workflow

```bash
# 1. Fetch latest
git fetch origin

# 2. Cập nhật develop
git checkout develop
git rebase origin/main

# 3. Tạo feature branch từ develop
git checkout -b feat/ten-tinh-nang
```

**Tại sao rebase thay vì merge?**

| | Rebase | Merge |
|-----------|------------------------|---------------------|
| History | Sạch, tuyến tính | Nhiều merge commits |
| Conflict | Giải quyết từng commit | Giải quyết 1 lần |
| Fork sync | Phù hợp hơn | Tạo noise |

Rebase phù hợp vì develop chỉ chứa ít custom commits, rebase giữ history sạch.

**Lưu ý quan trọng:**

1. Nếu develop đã push remote và có người khác dùng -- sau rebase cần `git push --force-with-lease` (không dùng `--force`)
2. Luôn fetch trước để đảm bảo `origin/main` mới nhất
3. Feature branch nên tạo từ develop, không từ main -- vì develop chứa custom code

**Rủi ro:**

- Rebase conflict: Nếu custom commits conflict với upstream -- phải resolve manually
- Force push: Nếu ai khác đang work trên develop -- coordinate trước

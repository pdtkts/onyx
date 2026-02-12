# System Architecture

Last updated: 2026-02-11

## High-Level Architecture

```text
Client (Browser)
  -> Next.js Web App (`web/`, port 3000/3001 in dev)
  -> API proxy (`/api/*`)
  -> FastAPI Backend (`backend/onyx/main.py`, port 8080)

Backend dependencies:
  - PostgreSQL (relational state)
  - Redis (cache + Celery broker/result backend)
  - Vespa (default search index) or OpenSearch (alternative)
  - S3/MinIO/Postgres file store backend
  - Optional model servers (inference/indexing)

Background processing:
  - Celery workers (multiple queues) + scheduler
```

## Runtime Components

## 1) Frontend (Next.js)

- App Router code is under `web/src/app/`.
- Client talks to backend through Next.js API route proxy (`/api/*`).
- UI layers include `lib/opal`, `src/refresh-components`, and legacy `src/components`.
- Fork-specific feature registration exists under `web/src/app/features/`.

### Request Path

```text
Browser -> Next.js -> /api/* -> FastAPI backend
```

## 2) Backend (FastAPI)

Primary backend app entrypoint is `backend/onyx/main.py`.
Fork extension wrapper entrypoint is `backend/features/onyx/main.py`.

Backend composition includes:
- Domain routers in `backend/onyx/server/`
- Auth/session middleware
- Feature/admin routers
- Error handling and service initialization hooks

## 3) Fork Extension Layer

Fork customizations are isolated in `backend/features/` and `web/src/app/features/`.

Current documented pattern:
- Runtime registration hooks for feature modules
- Image generation provider extension for Gemini Web
- Feature-only dependency list in `backend/features/requirements.txt`

This pattern reduces direct edits in upstream core paths and makes upstream sync easier.

## 4) Data Storage

### PostgreSQL

- System-of-record for users, sessions, chats, settings, connector metadata, and other relational entities.
- Schema evolution is managed through `backend/alembic/` (+ tenant migrations in `backend/alembic_tenants/`).

### Redis

- Used by Celery as broker/result backend.
- Also used for cache/session-related runtime data depending on configuration.

### File Storage Backend

Configured via `FILE_STORE_BACKEND` (see `backend/onyx/configs/app_configs.py`):
- `s3` (S3/MinIO-compatible)
- `postgres`

S3-compatible keys include:
- `S3_FILE_STORE_BUCKET_NAME`
- `S3_ENDPOINT_URL`
- `S3_AWS_ACCESS_KEY_ID`
- `S3_AWS_SECRET_ACCESS_KEY`

## 5) Search and Retrieval

- Default search engine path is Vespa.
- OpenSearch is supported as an alternative deployment variant.
- Retrieval and indexing logic is split across API/service code and background processing workers.

## 6) Background Processing (Celery)

Worker processes are orchestrated from backend Celery modules.
Common responsibilities:
- Connector fetch/sync tasks
- Document processing/indexing
- Maintenance/monitoring and asynchronous jobs

## 7) Optional Model Servers

Model server host/port settings are read through shared configs (`MODEL_SERVER_HOST`, `MODEL_SERVER_PORT`, `INDEXING_MODEL_SERVER_HOST`, `INDEXING_MODEL_SERVER_PORT`).

Local setups may disable model server usage when using external providers or to avoid port conflicts.

## Core Flows

## Chat Flow (Simplified)

```text
1. User sends message from web UI
2. Request reaches backend chat endpoint via Next.js proxy
3. Backend resolves persona/context and retrieves supporting docs
4. LLM provider call is executed
5. Streamed response is returned to UI
6. Conversation state is persisted in PostgreSQL
```

## Connector/Indexing Flow (Simplified)

```text
1. Connector job is scheduled/run
2. Data is fetched from external system
3. Documents are processed/chunked/embedded
4. Index is updated (Vespa/OpenSearch path)
5. Metadata/state is stored in PostgreSQL
```

## Deployment Topologies

## Local Development

Typical fork setup:
- Infra via `deployment/docker_compose/docker-compose.infra.yml`
- Backend run locally (uvicorn)
- Frontend run locally (`npm run dev`)

Typical ports:
- Frontend: `3000` (or `3001` when occupied)
- Backend API: `8080`
- PostgreSQL: `5432`
- Redis: `6379`
- Vespa: `19071` and `8081`
- MinIO: `9000` and `9001`

## Containerized / Cloud

- Docker Compose variants in `deployment/docker_compose/`
- Helm chart in `deployment/helm/charts/onyx/`
- AWS ECS Fargate templates in `deployment/aws_ecs_fargate/cloudformation/`
- AWS Terraform modules in `deployment/terraform/modules/aws/`

## Architecture Decisions (Fork)

1. Keep fork-specific behavior in `backend/features/` and `web/src/app/features/` when possible.
2. Keep infra-only local compose path for faster local development loops.
3. Keep deployment options aligned with upstream (Compose/Helm/Terraform/ECS artifacts).

## Constraints and Operational Notes

- Local port conflicts may occur around `9000` (MinIO vs model-server defaults).
- Auth mode and environment variables should be aligned with current upstream behavior in env templates.
- Upstream sync workflow currently uses manual dispatch configuration in `.github/workflows/sync-upstream.yml`.

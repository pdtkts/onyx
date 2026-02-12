# Codebase Summary

Last updated: 2026-02-11
Source: `D:\CODE\fullstack\tee-agent\repomix-output.xml` (generated with `repomix`)

## Repository Snapshot

- Packed files in repomix output: **3,541**
- Total packed tokens: **5,484,527**
- Security exclusions during pack: **3 test files** (excluded by repomix security check)

## Top-Level Structure

```text
tee-agent/
├── backend/              # FastAPI backend, workers, indexing, connectors
├── web/                  # Next.js frontend
├── deployment/           # Docker Compose, Helm, Terraform, ECS CloudFormation
├── desktop/              # Tauri desktop wrapper
├── extensions/chrome/    # Chrome extension
├── widget/               # Embeddable web widget
├── tools/ods/            # Dev tooling
├── docs/                 # Fork/project docs
├── examples/             # API and integration examples
└── .github/workflows/    # CI/CD workflows
```

## Backend (`backend/`)

### Main Application Areas (`backend/onyx/`)

| Area | Purpose |
|------|---------|
| `server/` | FastAPI routers and API composition |
| `auth/` | Authentication, user/session handling |
| `chat/` | Chat orchestration and response flow |
| `connectors/` | External data source integrations |
| `document_index/` | Vespa/OpenSearch retrieval integration |
| `background/celery/` | Worker tasks and scheduling |
| `llm/` | Provider abstraction and model access |
| `file_store/` | S3/MinIO/Postgres file storage integration |
| `db/` | SQLAlchemy models and DB access |
| `kg/` | Knowledge graph related logic |
| `tools/` | Built-in tool implementations |

### Fork Extension Layer (`backend/features/`)

| Path | Purpose |
|------|---------|
| `features/onyx/main.py` | Fork wrapper entrypoint; runtime extension bootstrap |
| `features/onyx/modules/` | Modular registration hooks for fork-only features |
| `features/onyx/modules/gemini_web_image_gen/` | Gemini Web image generation provider |
| `features/requirements.txt` | Feature-only dependency list (includes Git dependency for Gemini API fork) |

Notes:
- The fork layer exists to add custom behavior without directly editing upstream core modules where possible.
- Gemini provider dependency is sourced from GitHub in `backend/features/requirements.txt`.

### Data + Migrations

| Path | Purpose |
|------|---------|
| `alembic/` | Main schema migrations |
| `alembic_tenants/` | Tenant-specific migrations |
| `ee/onyx/` | Enterprise overlay code |

## Frontend (`web/`)

### Core Areas

| Area | Purpose |
|------|---------|
| `src/app/` | Next.js App Router pages + route handlers |
| `src/components/` | Shared UI components |
| `src/refresh-components/` | Modernized component layer |
| `src/hooks/` | Reusable React hooks |
| `src/lib/` | Client utilities and helpers |
| `src/providers/` | React providers/context wiring |
| `lib/opal/` | Internal design system package |

### Fork UI Feature Registration

| Path | Purpose |
|------|---------|
| `src/app/features/image-gen-registry.ts` | Registry for fork image-gen modules |
| `src/app/features/modules/gemini-web-image-gen/` | Gemini Web UI registration + form |
| `src/app/admin/configuration/image-generation/` | Upstream admin image-gen configuration surface |

## Deployment (`deployment/`)

### Compose + Runtime

| Path | Purpose |
|------|---------|
| `docker_compose/docker-compose.yml` | Full-stack compose |
| `docker_compose/docker-compose.infra.yml` | Infra-only local stack |
| `docker_compose/docker-compose.prod.yml` | Production compose profile |
| `docker_compose/docker-compose.opensearch.yml` | OpenSearch variant |
| `docker_compose/env.template` | Primary environment template |

### Cloud / Cluster Artifacts

| Path | Purpose |
|------|---------|
| `helm/charts/onyx/` | Helm chart and templates |
| `terraform/modules/aws/` | AWS Terraform modules |
| `aws_ecs_fargate/cloudformation/` | ECS Fargate CloudFormation templates/scripts |

## CI/CD (`.github/workflows/`)

Workflow set covers:
- Python checks/tests
- Frontend checks/tests
- Integration/database flows
- Docker/Helm release jobs
- Security/license scans
- Fork sync workflow (`sync-upstream.yml`)

## Key Runtime Composition

- **Frontend:** Next.js app in `web/`
- **Backend API:** FastAPI app in `backend/onyx/main.py`
- **Fork wrapper path:** `backend/features/onyx/main.py` for extension injection
- **Core infra dependencies:** PostgreSQL, Redis, Vespa/OpenSearch, optional MinIO/S3 file store

## Documentation Alignment Notes

This summary is intentionally high-confidence and path-based. It avoids undocumented API signatures and uncertain runtime assumptions.

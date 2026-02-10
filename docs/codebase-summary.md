# Codebase Summary

## Repository Structure (Top-Level)

```
tee-agent/
├── backend/              # Python backend (FastAPI + Celery)
│   ├── onyx/             #   MIT base application
│   ├── features/         #   Fork-specific features layer (entry point)
│   └── ee/               #   Enterprise (kept for sync, not loaded)
├── web/                  # Next.js frontend
│   └── src/app/features/ #   Fork-specific frontend routes
├── deployment/           # Docker, Kubernetes, Terraform, AWS configs
├── desktop/              # Tauri v2 desktop app
├── extensions/chrome/    # Chrome extension (Manifest V3)
├── widget/               # Embeddable chat widget (Lit + Vite)
├── tools/ods/            # Developer CLI tool (Go + Python)
├── examples/             # API examples + widget demo
├── contributing_guides/  # Setup guides, contribution process
├── docs/                 # Project documentation (fork-specific)
├── dev-start.sh          # One-command local dev launcher
└── .github/workflows/    # 23+ CI/CD workflows
```

## Backend (`backend/`)

### Core Application (`backend/onyx/`)

| Directory | Purpose | Key Details |
|-----------|---------|-------------|
| `auth/` | Authentication | fastapi-users, 5 auth types, 3 session backends |
| `background/celery/` | Background workers | 8 worker types (beat, light, heavy, doc processing, etc.) |
| `chat/` | Chat engine | Streaming responses, multi-turn conversations |
| `configs/` | App configuration | ~1068 lines of env vars across multiple files |
| `connectors/` | Data source connectors | 40+ connectors (GitHub, Confluence, Slack, etc.) |
| `db/` | Database layer | SQLAlchemy ORM, ~100 tables, ~4200 lines in models.py |
| `deep_research/` | Deep research feature | Agentic multi-step search |
| `document_index/` | Document indexing | Vespa (primary) + OpenSearch (alternative) |
| `file_store/` | File storage | S3/MinIO/Postgres backends |
| `kg/` | Knowledge Graph | Graph-based knowledge retrieval |
| `llm/` | LLM abstraction | litellm integration, multi-provider support |
| `mcp_server/` | MCP protocol | Model Context Protocol server |
| `server/` | API routers | 40+ FastAPI routers |
| `tools/` | Tool implementations | Web search, code interpreter, image gen |
| `tracing/` | Observability | Langfuse, Braintrust integration |

### Other Backend Directories

| Directory | Purpose |
|-----------|---------|
| `alembic/` | DB migrations (307 versions) |
| `alembic_tenants/` | Multi-tenant migrations (6 versions) |
| `features/onyx/` | Custom features layer -- wraps base app, adds fork-specific routers (entry point: `features.onyx.main:app`) |
| `ee/onyx/` | Enterprise Edition overlay (present for upstream sync, **not loaded at runtime** -- EE disabled) |
| `model_server/` | Separate ML model server (FastAPI, port 9000) |
| `shared_configs/` | Shared configuration modules |
| `tests/` | Backend test suite |

### API Routers (`backend/onyx/server/`)

Organized by domain:

| Router Area | Covers |
|-------------|--------|
| `features/persona/` | Agent/persona CRUD, configuration |
| `features/build/` | Agent builder, sandbox, sessions |
| `features/mcp/` | MCP tool management |
| `features/projects/` | Project management |
| `features/web_search/` | Web search configuration |
| `features/tool/` | Tool management |
| `features/document_set/` | Document set management |
| `features/notifications/` | Notification system |
| `documents/` | Connector, credential, document APIs |
| `api_key/` | API key management |
| `manage/` | Admin management endpoints |
| `settings/` | System settings |
| `query_and_chat/` | Chat and query endpoints |
| `openai_assistants_api/` | OpenAI-compatible API |
| **`features/onyx/server/`** | **Fork-specific routers (health, etc.) -- mounted at `/api/features/*`** |

### Celery Workers (8 Types)

| Worker | Purpose |
|--------|---------|
| `background` | General background tasks |
| `beat` | Scheduled task scheduler |
| `light` | Lightweight tasks |
| `heavy` | Resource-intensive tasks |
| `docprocessing` | Document processing pipeline |
| `docfetching` | Document fetching from sources |
| `monitoring` | System monitoring |
| `user_file_processing` | User-uploaded file processing |

## Frontend (`web/`)

### Directory Structure

| Directory | Purpose | Key Details |
|-----------|---------|-------------|
| `lib/opal/` | Internal design system | @onyx/opal components |
| `src/app/` | Next.js App Router | Pages and route handlers |
| `src/components/` | Legacy shared components | 60+ components + shadcn/ui |
| `src/hooks/` | Custom React hooks | 37 hook files |
| `src/lib/` | Utilities and types | API clients, helpers, 60+ files |
| `src/providers/` | React Context providers | 7 context providers |
| `src/refresh-components/` | Modern component library | 40+ components |
| `src/sections/` | Page sections | Composed page layouts |
| `tailwind-themes/` | Theme configurations | CSS variable theming |
| `tests/` | Frontend test suite | Jest + Playwright |

### App Routes (`web/src/app/`)

| Route | Purpose |
|-------|---------|
| `admin/` | Admin panel (20+ sections) |
| `anonymous/` | Anonymous chat interface |
| `api/` | Catch-all API proxy to backend |
| `app/` | Main chat interface (agents, settings, projects) |
| `auth/` | Auth pages (login, signup, OAuth, SAML, OIDC) |
| `craft/` | Agent/workflow builder |
| `ee/` | Enterprise routes (present for upstream sync, **not used** -- EE disabled) |
| `features/` | Custom features layer (auth-gated layout, fork-specific pages) |
| `mcp/` | MCP management pages |

### State Management

| Approach | Usage | Count |
|----------|-------|-------|
| React Context | App-wide state | 24 contexts |
| Zustand | Complex stores | 3 stores |
| SWR | Server data fetching | 76+ hooks |
| Formik/Yup | Form state + validation | Throughout admin/settings |

### Design System Layers

```
@onyx/opal (internal) > shadcn/ui (primitives) > refresh-components (modern) > legacy components
```

- **Icons:** @phosphor-icons/react (primary), lucide-react (secondary), react-icons (legacy)
- **Styling:** Tailwind CSS 3.4, CSS variables, dark mode via next-themes

## Deployment (`deployment/`)

| Directory | Purpose |
|-----------|---------|
| `aws_ecs_fargate/` | CloudFormation templates (9 service templates) |
| `data/nginx/` | Nginx configs (dev + prod + MCP proxy) |
| `docker_compose/` | 10+ Docker Compose files + env templates |
| `helm/charts/onyx/` | Kubernetes Helm chart v0.4.25 (40+ templates) |
| `terraform/modules/aws/` | 7 Terraform modules (VPC, EKS, PG, Redis, S3, WAF) |

### Docker Compose Variants

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Default full stack |
| `docker-compose.dev.yml` | Development overrides |
| `docker-compose.prod.yml` | Production deployment |
| `docker-compose.prod-cloud.yml` | Cloud production |
| `docker-compose.infra.yml` | Infrastructure only (fork-specific) |
| `docker-compose.opensearch.yml` | OpenSearch variant |
| `docker-compose.multitenant-dev.yml` | Multi-tenant development (EE-only, not used in this fork) |
| `docker-compose.resources.yml` | Resource limits |

### Docker Services (Full Stack)

| Service | Image | Port |
|---------|-------|------|
| api_server | Custom | 8080 |
| background | Custom (Celery) | - |
| web_server | Custom (Next.js) | 3000 |
| inference_model_server | Custom | 9000 |
| indexing_model_server | Custom | 9001 |
| relational_db | postgres:15.2-alpine | 5432 |
| index | vespa | 19071, 8081 |
| cache | redis:7.4-alpine | 6379 |
| nginx | nginx:1.25.5 | 80, 443 |
| minio | minio | 9000, 9001 |

## Other Top-Level Directories

| Directory | Purpose | Tech |
|-----------|---------|------|
| `desktop/` | Desktop app wrapper | Tauri v2 |
| `extensions/chrome/` | Chrome extension | Manifest V3, side panel |
| `widget/` | Embeddable chat widget | Lit + Vite web component |
| `tools/ods/` | Developer CLI | Go + Python (PyPI: onyx-devtools) |
| `examples/` | API examples + widget demo | Python, HTML |

## CI/CD Workflows (`.github/workflows/`)

| Category | Workflows |
|----------|-----------|
| Deployment | `deployment.yml` |
| Docker | `docker-tag-beta.yml`, `docker-tag-latest.yml` |
| Helm | `helm-chart-releases.yml`, `pr-helm-chart-testing.yml` |
| Python Tests | `pr-python-tests.yml`, `pr-python-checks.yml`, `pr-python-connector-tests.yml`, `pr-python-model-tests.yml` |
| Frontend Tests | `pr-jest-tests.yml`, `pr-playwright-tests.yml` |
| Integration | `pr-integration-tests.yml`, `pr-mit-integration-tests.yml`, `pr-database-tests.yml` |
| Quality | `pr-quality-checks.yml`, `pr-labeler.yml` |
| Security | `zizmor.yml`, `nightly-scan-licenses.yml` |
| Fork-Specific | `sync-upstream.yml` (auto-sync every 6h) |

## File Counts (Estimated)

| Category | Approximate Count |
|----------|------------------|
| Python backend files | 800+ |
| TypeScript/React frontend files | 500-700+ |
| Alembic migration versions | 307 + 6 tenant |
| Docker Compose files | 12 |
| GitHub Actions workflows | 28 |
| Helm chart templates | 40+ |
| Connectors | 40+ |
| Database tables | ~100 |

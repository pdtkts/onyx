# Project Overview & Product Development Requirements

## Project Identity

| Field | Value |
|-------|-------|
| Name | Tee-Agent |
| Base | Fork of [onyx-dot-app/onyx](https://github.com/onyx-dot-app/onyx) |
| Repository | [pdtkts/onyx](https://github.com/pdtkts/onyx) |
| License | MIT (Community Edition only) |
| Stack | Python (FastAPI) + Next.js + PostgreSQL + Vespa |

## Vision

Maintain a customized fork of Onyx that auto-syncs upstream changes while enabling project-specific modifications for local development, deployment, and feature experimentation.

## Goals

1. **Stay Current** -- Auto-sync upstream every 6h, minimize merge conflicts
2. **Local-First Dev** -- Streamlined local development with infra-only Docker Compose
3. **Customization** -- Fork-specific fixes (Vespa CPU compat, dependency pins, config tweaks)
4. **Documentation** -- Comprehensive internal docs for faster onboarding
5. **Extensibility** -- Foundation for custom agents, connectors, and integrations

## Stakeholders

| Role | Responsibility |
|------|---------------|
| Fork Maintainer | Upstream sync, conflict resolution, fork-specific patches |
| Backend Developer | FastAPI services, Celery workers, connectors, LLM integration |
| Frontend Developer | Next.js UI, React components, design system |
| DevOps | Docker, Kubernetes, CI/CD, infrastructure |

## Scope

### In Scope

- Onyx platform (MIT/CE features only; EE code present for upstream sync but not used)
- 40+ data source connectors
- Chat, RAG, Deep Research, Agents, MCP
- Multi-LLM support (OpenAI, Anthropic, Gemini, Ollama, vLLM)
- Web search, code interpreter, image generation
- Auth: basic, google_oauth (SAML/OIDC/Cloud are EE-only, not available)
- Docker, Kubernetes, Terraform deployment
- Desktop app (Tauri), Chrome extension, embeddable widget
- **Features layer** (`backend/features/`, `web/src/app/features/`) -- fork-specific extensions that wrap the MIT base app without modifying upstream code

### Out of Scope (Current Phase)

- Custom LLM training/fine-tuning
- Mobile native apps
- Non-Onyx integrations not in upstream

## Functional Requirements

### FR-1: AI Chat Platform
- Multi-turn conversational AI with streaming responses
- Support multiple LLM providers via litellm abstraction
- Chat sharing, feedback collection, session management

### FR-2: RAG (Retrieval-Augmented Generation)
- Hybrid vector + keyword search via Vespa
- Document chunking, embedding, indexing pipeline
- Knowledge graph support
- Document permissioning mirroring source app access

### FR-3: Agents & Tools
- Custom agent/persona builder with instructions + knowledge + tools
- MCP protocol server for external tool integration
- Built-in tools: web search, code interpreter, image generation
- Tool visibility and access control

### FR-4: Connectors
- 40+ data source connectors (GitHub, Confluence, Slack, Jira, Google Drive, Dropbox, SharePoint, S3, etc.)
- Credential management with encryption
- Scheduled sync via Celery workers
- OAuth flow support for connector authentication

### FR-5: User Management & Auth
- MIT auth types: `basic`, `google_oauth` (OIDC, SAML, Cloud are EE-only)
- 3 session backends: Redis, Postgres, JWT
- 5 user roles: ADMIN > GLOBAL_CURATOR > CURATOR > BASIC > LIMITED
- API key authentication for programmatic access

### FR-6: Admin Panel
- LLM provider configuration
- Embedding model management
- Connector and credential management
- User/group management
- Analytics and usage reporting
- System settings and configuration

### ~~FR-7: Enterprise Features (EE)~~ -- OUT OF SCOPE
> EE code exists in `backend/ee/` and `web/src/app/ee/` for upstream sync compatibility but is **not loaded at runtime**. `global_version.is_ee_version()` returns `False`; all `fetch_versioned_implementation()` calls fall back to MIT modules. The following features are **not available** in this fork:
- Analytics dashboard, Billing integration, RBAC user groups
- Multi-tenant support, Standard answers, Usage export, SAML SSO, Query history

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Search latency | < 2s for typical queries |
| Document scale | Up to tens of millions of documents |
| Availability | Self-hosted, no external dependency required |
| Security | SSO, RBAC, credential encryption, rate limiting |
| Deployment | Docker single-node to Kubernetes multi-node |
| LLM flexibility | Any OpenAI-compatible API, local models |

## Technical Constraints

1. **PostgreSQL 15.2** required for relational data
2. **Vespa** (or OpenSearch) required for document indexing
3. **Redis** required for caching and Celery broker
4. **Python 3.11+** for backend
5. **Node.js 20+** for frontend
6. **Docker** for containerized deployment

## Dependencies (Key Libraries)

### Backend
| Library | Version | Purpose |
|---------|---------|---------|
| FastAPI | 0.128 | Web framework |
| SQLAlchemy | 2.0.15 | ORM |
| Celery | 5.5.1 | Background task processing |
| litellm | 1.81.6 | LLM provider abstraction |
| Pydantic | 2.11.7 | Data validation |
| fastapi-users | - | Authentication |
| alembic | - | Database migrations |

### Frontend
| Library | Version | Purpose |
|---------|---------|---------|
| Next.js | 16.1.6 | React framework (App Router) |
| React | 19.2.4 | UI library |
| TypeScript | 5.9.3 | Type safety |
| Tailwind CSS | 3.4 | Styling |
| SWR | - | Data fetching |
| Zustand | - | State management |
| Formik + Yup | - | Form handling |

## Success Metrics

| Metric | Target |
|--------|--------|
| Upstream sync | Every 6h, < 1% conflict rate |
| Local dev startup | < 5 min from clone to running |
| Documentation coverage | All major systems documented |
| Build success rate | > 95% on main branch |

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Upstream breaking changes | High | Auto-sync + manual review of conflicts |
| Dependency version conflicts | Medium | Pin versions, test after sync |
| Vespa CPU incompatibility | Medium | Use generic Intel image |
| Port conflicts (9000) | Low | Document in local-dev-guide, use DISABLE_MODEL_SERVER |

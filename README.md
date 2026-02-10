<a name="readme-top"></a>

# Tee-Agent

> Fork of [onyx-dot-app/onyx](https://github.com/onyx-dot-app/onyx) at [pdtkts/onyx](https://github.com/pdtkts/onyx).
> Auto-syncs upstream `main` every 6 hours via GitHub Actions.

**Tee-Agent** builds on Onyx -- a feature-rich, self-hostable AI Chat Platform with RAG, Agents, Deep Research, MCP, Web Search, 40+ connectors, and more. Works with any LLM (OpenAI, Anthropic, Gemini, Ollama, vLLM).

## Fork-Specific Changes

- Custom `docker-compose.infra.yml` for local dev (Postgres, Redis, Vespa generic, MinIO)
- Upstream sync workflow (`.github/workflows/sync-upstream.yml`)
- `chonkie` pinned to 1.0.8 (upstream 1.0.10 unavailable)
- Vespa image switched to `vespa-generic-intel-x86_64` for broader CPU support
- **Features layer** (`backend/features/`, `web/src/app/features/`) -- fork-specific extensions wrapping MIT base, entry point: `features.onyx.main:app`
- `dev-start.sh` -- one-command launcher for backend + frontend + Celery
- Local development docs in `docs/local-dev-guide.md`

## Quick Start (Local Dev)

**Prerequisites:** Python 3.11+, Node.js 20+, Docker

```bash
# 1. Start infrastructure
cd deployment/docker_compose
docker compose -f docker-compose.infra.yml up -d

# 2. Start backend (uses features layer entry point)
cd backend
set -a && source .env && set +a
../.venv/Scripts/python.exe -m uvicorn features.onyx.main:app --host 0.0.0.0 --port 8080 --reload

# 3. Start frontend
cd web
npm run dev
```

- Backend API: http://localhost:8080/docs
- Frontend: http://localhost:3000 (or 3001 if 3000 occupied)
- MinIO Console: http://localhost:9001

See [docs/local-dev-guide.md](docs/local-dev-guide.md) for full setup details.

## Documentation

| Document | Description |
|----------|-------------|
| [Project Overview & PDR](docs/project-overview-pdr.md) | Vision, goals, scope, requirements |
| [System Architecture](docs/system-architecture.md) | Component diagram, data flow, service interactions |
| [Codebase Summary](docs/codebase-summary.md) | Directory structure, module descriptions |
| [Code Standards](docs/code-standards.md) | Python + TypeScript conventions |
| [Deployment Guide](docs/deployment-guide.md) | Docker, Kubernetes, cloud deployment |
| [Project Roadmap](docs/project-roadmap.md) | Fork roadmap, phases, milestones |
| [Local Dev Guide](docs/local-dev-guide.md) | Local development setup |

## Features

- **Custom Agents:** Build AI Agents with unique instructions, knowledge and actions
- **Web Search:** Google PSE, Exa, Serper + in-house scraper or Firecrawl
- **RAG:** Hybrid search + knowledge graph for uploaded files and connector documents
- **Connectors:** 40+ data source connectors (GitHub, Confluence, Slack, Jira, Google Drive, etc.)
- **Deep Research:** Agentic multi-step search for in-depth answers
- **Actions & MCP:** External system interaction via tools
- **Code Interpreter:** Execute code, analyze data, render graphs
- **Image Generation:** Generate images from prompts
- **Collaboration:** Chat sharing, feedback, user management, analytics

Works with all LLMs (OpenAI, Anthropic, Gemini) and self-hosted (Ollama, vLLM).

## Deployment

| Method | Best For | Guide |
|--------|----------|-------|
| Docker Compose | Most users | [Quickstart](https://docs.onyx.app/deployment/getting_started/quickstart) |
| Kubernetes/Helm | Large teams | [K8s Guide](https://docs.onyx.app/deployment/local/kubernetes) |
| Terraform | IaC teams | [Terraform Guide](https://docs.onyx.app/deployment/local/terraform) |
| AWS ECS Fargate | AWS users | [AWS Guide](https://docs.onyx.app/deployment/cloud/aws/eks) |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.11, FastAPI 0.128, SQLAlchemy 2.0, Celery 5.5, litellm |
| Frontend | Next.js 16, React 19, TypeScript 5.9, Tailwind CSS 3.4 |
| Database | PostgreSQL 15.2, Redis 7.4 |
| Search | Vespa 8.609 (primary), OpenSearch 3.4 (optional) |
| Storage | MinIO / S3 / Postgres file store |
| Desktop | Tauri v2 |

## Licensing

This fork runs **MIT-licensed (Community Edition) code only**.

- Code outside `ee/` directories: **MIT License**
- `backend/ee/` and `web/src/app/ee/` directories exist in the repo for upstream sync compatibility but are **NOT loaded or used at runtime** (EE features are disabled by default; `ENABLE_PAID_ENTERPRISE_EDITION_FEATURES` is not set)
- Entry point: `features.onyx.main:app` (wraps MIT `onyx.main.get_application()`), not `ee.onyx.main:app`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [contributing_guides/](contributing_guides/).

## Community

Join [Discord](https://discord.gg/TDJ59cGV2X) for discussions and support.

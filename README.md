<a name="readme-top"></a>

# Tee-Agent

> Fork of [onyx-dot-app/onyx](https://github.com/onyx-dot-app/onyx) at [pdtkts/onyx](https://github.com/pdtkts/onyx).
> Upstream sync is maintained via GitHub Actions manual dispatch workflow (`.github/workflows/sync-upstream.yml`).

**Tee-Agent** builds on Onyx, a self-hostable AI chat platform with RAG, agents, deep research, MCP, web search, connectors, and multi-LLM support.

## Fork-Specific Changes

- Custom `docker-compose.infra.yml` for local infra (PostgreSQL, Redis, Vespa generic, MinIO)
- Upstream sync workflow (`.github/workflows/sync-upstream.yml`)
- `chonkie` pinned to 1.0.8 (upstream 1.0.10 unavailable)
- Vespa image switched to `vespa-generic-intel-x86_64` for broader CPU compatibility
- Fork feature layer in `backend/features/` for runtime extension modules
- Local development guide in `docs/local-dev-guide.md`

## Quick Start (Local Dev)

**Prerequisites:** Python 3.11+, Node.js 20+, Docker

```bash
# 1) Start infrastructure
cd deployment/docker_compose
docker compose -f docker-compose.infra.yml up -d

# 2) Start backend
cd backend
set -a && source .env && set +a
../.venv/Scripts/python.exe -m uvicorn onyx.main:app --host 0.0.0.0 --port 8080 --reload

# 3) Start frontend
cd web
npm run dev
```

- Backend API docs: http://localhost:8080/docs
- Frontend: http://localhost:3000 (or 3001 if 3000 is occupied)
- MinIO Console: http://localhost:9001

See [docs/local-dev-guide.md](docs/local-dev-guide.md) for full setup details.

## Documentation

| Document | Description |
|----------|-------------|
| [Project Overview & PDR](docs/project-overview-pdr.md) | Vision, goals, scope, requirements |
| [System Architecture](docs/system-architecture.md) | Component diagram, data flow, service interactions |
| [Codebase Summary](docs/codebase-summary.md) | Repository structure and module map |
| [Code Standards](docs/code-standards.md) | Python + TypeScript conventions |
| [Deployment Guide](docs/deployment-guide.md) | Docker, Kubernetes, AWS deployment notes |
| [Project Roadmap](docs/project-roadmap.md) | Fork roadmap, phases, milestones |
| [Local Dev Guide](docs/local-dev-guide.md) | Local development setup |

## Features

- **Custom Agents:** Build AI agents with custom instructions, knowledge, and tools
- **Web Search:** Google PSE, Exa, Serper, and scraper integrations
- **RAG:** Hybrid retrieval over uploaded files and connector documents
- **Connectors:** 40+ data source connectors
- **Deep Research:** Multi-step research workflow
- **Actions & MCP:** External tool integration via MCP/tooling layer
- **Code Interpreter:** Code execution and data analysis
- **Image Generation:** Provider-based image generation
- **Collaboration:** Sharing, feedback, user/admin controls

Works with hosted and self-hosted LLM providers (OpenAI, Anthropic, Gemini, Ollama, vLLM, compatible APIs).

## Deployment

| Method | Best For | Guide |
|--------|----------|-------|
| Docker Compose | Most users | [Quickstart](https://docs.onyx.app/deployment/getting_started/quickstart) |
| Kubernetes/Helm | Large teams | [K8s Guide](https://docs.onyx.app/deployment/local/kubernetes) |
| Terraform | IaC teams | [Terraform Guide](https://docs.onyx.app/deployment/local/terraform) |
| AWS ECS Fargate | AWS users | [CloudFormation README](deployment/aws_ecs_fargate/cloudformation/README.md) |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.11, FastAPI, SQLAlchemy, Celery, litellm |
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Database | PostgreSQL, Redis |
| Search | Vespa (primary), OpenSearch (optional) |
| Storage | MinIO / S3 / Postgres file store |
| Desktop | Tauri v2 |

## Licensing

- **Community Edition (CE):** MIT License
- **Enterprise Edition (EE):** Additional features for large organizations

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [contributing_guides/](contributing_guides/).

## Community

Join [Discord](https://discord.gg/TDJ59cGV2X) for discussions and support.

# Project Roadmap -- Tee-Agent Fork

Last updated: 2026-02-14

## Phase 0: Foundation [COMPLETE]

**Goal:** Establish fork, local dev environment, initial documentation.

| Task | Status |
|------|--------|
| Fork repository from onyx-dot-app/onyx | Done |
| Configure upstream auto-sync (6h cron) | Done |
| Create docker-compose.infra.yml for local infra | Done |
| Fix Vespa CPU compatibility (generic image) | Done |
| Pin chonkie to 1.0.8 | Done |
| Create backend .env for local dev | Done |
| Write local-dev-guide.md | Done |
| Create initial project documentation | Done |

## Phase 1: Stabilization [IN PROGRESS]

**Goal:** Ensure stable local development, fix upstream compat issues, CI/CD for fork.

| Task | Status | Priority |
|------|--------|----------|
| Verify all infrastructure services start cleanly | In Progress | High |
| Test backend startup with all dependencies | In Progress | High |
| Test frontend startup and API proxy | In Progress | High |
| Resolve remaining dependency version conflicts | Pending | High |
| Set up fork-specific CI (lint, test, build) | Pending | Medium |
| Document all required env vars | Done | Medium |
| Test Celery worker startup | Pending | Medium |
| Validate auth flows (basic auth) | Pending | Medium |

## Phase 2: Customization [IN PROGRESS]

**Goal:** Implement fork-specific features and customizations.

| Task | Status | Priority |
|------|--------|----------|
| Custom agent/persona configurations | Planned | High |
| Custom connector development | Planned | Medium |
| UI/UX customizations | Planned | Medium |
| Custom tool integrations | In Progress | Medium |
| Gemini Web image generation provider (cookie auth) | Done | High |
| Admin Theme Module (non-EE, backend+frontend+sidebar) | Done | High |
| Fork-specific branding | Planned | Low |

## Phase 3: Production Readiness [PLANNED]

**Goal:** Prepare for production deployment.

| Task | Status | Priority |
|------|--------|----------|
| Production Docker Compose config | Planned | High |
| SSL/TLS configuration | Planned | High |
| Backup and recovery procedures | Planned | High |
| Monitoring and alerting setup | Planned | Medium |
| Performance tuning | Planned | Medium |
| Security hardening | Planned | High |
| Load testing | Planned | Medium |

## Phase 4: Advanced Features [FUTURE]

**Goal:** Extend platform capabilities.

| Task | Status | Priority |
|------|--------|----------|
| Custom knowledge graph extensions | Future | Medium |
| Advanced analytics dashboard | Future | Low |
| Custom MCP tool development | Future | Medium |
| Multi-tenant setup | Future | Low |
| Integration testing suite | Future | Medium |

## Key Milestones

| Milestone | Target | Status |
|-----------|--------|--------|
| Fork established + upstream sync workflow | 2026-01 | Done |
| Local dev fully functional | 2026-02 | In Progress |
| First custom feature deployed | 2026-02 | Done |
| Production deployment ready | TBD | Planned |

## Upstream Sync Strategy

- Sync is currently triggered via manual dispatch workflow (`.github/workflows/sync-upstream.yml`)
- Target branch remains `main` from `onyx-dot-app/onyx`
- Merge conflicts reviewed manually when detected
- Fork-specific changes kept in separate commits for easier rebase

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Upstream breaking changes | Medium | High | Pin versions, test after sync |
| Dependency conflicts | Medium | Medium | Lock files, version constraints |
| Vespa resource requirements | Low | Medium | Generic image, resource limits |
| Redis/Celery stability | Low | High | Health checks, restart policies |

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01 | Fork from onyx-dot-app/onyx | Full-stack AI platform with needed features |
| 2026-01 | Use vespa-generic-intel-x86_64 | CPU compatibility on dev machines |
| 2026-01 | Pin chonkie to 1.0.8 | Version 1.0.10 not available on PyPI |
| 2026-01 | Create infra-only compose | Lighter local dev, run backend natively |
| 2026-01 | AUTH_TYPE=basic | `disabled` no longer supported upstream |
| 2026-02 | DISABLE_MODEL_SERVER=true | Avoid port 9000 conflict with MinIO |
| 2026-02 | Gemini Web image provider via runtime injection | Add cookie-based image generation without upstream Python file modifications |
| 2026-02 | Dynamic app name via Admin Theme | Replace hardcoded "Onyx" with `DEFAULT_APP_NAME` constant and `useAppName()` hook |

# Project Roadmap -- Tee-Agent Fork

Last updated: 2026-02-10

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
| Set up features layer (`backend/features/`, `web/src/app/features/`) | Done | High |
| Validate auth flows (basic auth) | Pending | Medium |

## Phase 2: Customization [PLANNED]

**Goal:** Implement fork-specific features and customizations.

| Task | Status | Priority |
|------|--------|----------|
| Custom agent/persona configurations | Planned | High |
| Custom connector development | Planned | Medium |
| UI/UX customizations | Planned | Medium |
| Custom tool integrations | Planned | Medium |
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
| ~~Advanced analytics dashboard~~ | N/A | EE-only, out of scope |
| Custom MCP tool development | Future | Medium |
| ~~Multi-tenant setup~~ | N/A | EE-only, out of scope |
| Integration testing suite | Future | Medium |

## Key Milestones

| Milestone | Target | Status |
|-----------|--------|--------|
| Fork established + auto-sync | 2026-01 | Done |
| Local dev fully functional | 2026-02 | In Progress |
| First custom feature deployed | TBD | Planned |
| Production deployment ready | TBD | Planned |

## Upstream Sync Strategy

- Auto-sync `main` from `onyx-dot-app/onyx` every 6 hours
- Merge conflicts reviewed manually when detected
- Fork-specific changes kept in separate commits for easy rebase
- Breaking upstream changes documented in changelog

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Upstream breaking changes | Medium | High | Pin versions, test after sync |
| Dependency conflicts | Medium | Medium | Lock files, version constraints |
| Vespa resource requirements | Low | Medium | Generic image, resource limits |
| Redis/Celery stability | Low | High | Health checks, restart policies |
| Upstream renames imports used by features layer | Low | Medium | Run tests after sync, only import from stable APIs |

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01 | Fork from onyx-dot-app/onyx | Full-stack AI platform with needed features |
| 2026-01 | Use vespa-generic-intel-x86_64 | CPU compatibility on dev machines |
| 2026-01 | Pin chonkie to 1.0.8 | Version 1.0.10 not available on PyPI |
| 2026-01 | Create infra-only compose | Lighter local dev, run backend natively |
| 2026-01 | AUTH_TYPE=basic | `disabled` no longer supported upstream |
| 2026-02 | DISABLE_MODEL_SERVER=true | Avoid port 9000 conflict with MinIO |
| 2026-02 | MIT-only: do not use EE code | EE dirs kept for upstream sync; `onyx.main:app` entry point, `is_ee_version()=False`. Analytics, RBAC, multi-tenant, SAML SSO are out of scope |
| 2026-02 | Features layer at `backend/features/` | Mirrors `ee/` pattern; wraps `get_application()`, mounts custom routers. Avoids upstream conflicts by only importing, never modifying upstream files |

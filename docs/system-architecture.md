# System Architecture

## High-Level Overview

```
                        +-------------------+
                        |     Nginx         |
                        |  (Reverse Proxy)  |
                        +--------+----------+
                                 |
                    +------------+------------+
                    |                         |
             +------+------+          +------+------+
             |  Next.js    |          |  FastAPI    |
             |  Frontend   |          |  Backend    |
             |  (port 3000)|          |  (port 8080)|
             +------+------+          +------+------+
                    |                         |
                    |    /api/* proxy          |
                    +----------->--------------+
                                              |
                    +-------------------------+-------------------------+
                    |                         |                         |
             +------+------+          +------+------+          +------+------+
             | PostgreSQL  |          |    Vespa    |          |    Redis    |
             |  (port 5432)|          | (19071/8081)|          |  (port 6379)|
             +-------------+          +-------------+          +-------------+
                                                                      |
                                              +------+------+  +-----+------+
                                              |    MinIO    |  |   Celery   |
                                              | (9000/9001) |  |  Workers   |
                                              +-------------+  +------------+
```

## Component Architecture

### 1. Frontend (Next.js)

**Entry point:** `web/src/app/` (App Router)

| Component | Role |
|-----------|------|
| App Router | Page routing, layouts, server components |
| API Proxy (`/api/*`) | Forwards all API calls to FastAPI backend |
| React Context (24) | App-wide state (user, settings, chat) |
| Zustand (3 stores) | Complex client state |
| SWR (76+ hooks) | Server data fetching + caching |
| Design System | @onyx/opal > shadcn/ui > refresh-components |

**Request flow:**
```
Browser -> Next.js -> /api/* catch-all -> FastAPI backend (port 8080)
```

### 2. Backend (FastAPI)

**Entry points:**
- Upstream: `backend/onyx/main.py`
- Fork feature wrapper: `backend/features/onyx/main.py`

```
FastAPI App
├── 40+ API Routers (onyx/server/)
├── Auth Middleware (fastapi-users)
├── CORS Middleware
├── Rate Limiting
└── Error Handlers
```

#### API Router Organization

| Domain | Key Endpoints |
|--------|--------------|
| Chat | `/chat/send-message`, `/chat/sessions`, `/chat/feedback` |
| Query | `/query/search`, `/query/answer` |
| Connectors | `/connector/`, `/credential/` |
| Personas | `/persona/`, `/persona/{id}/` |
| Admin | `/manage/`, `/manage/admin/` |
| Settings | `/settings/`, `/llm/`, `/embedding/` |
| Documents | `/document/`, `/document-set/` |
| Tools | `/tool/`, `/mcp/` |
| Auth | `/auth/`, `/auth/login`, `/auth/logout` |
| Projects | `/projects/` |

#### Fork Feature Injection Pattern (Image Generation)

The fork adds a runtime extension layer for custom image providers without editing upstream backend source files.

```
features/onyx/main.py
  -> monkey-patch onyx.image_gen.factory._get_provider_cls
  -> add factory._CUSTOM_PROVIDERS map
  -> call features.onyx.modules.register_all()
  -> each module register() injects provider class
```

Gemini Web implementation details:
- Provider key: `gemini_web`
- Provider class: Gemini Web image provider class in `features/onyx/modules/gemini_web_image_gen/provider.py`
- Credentials source: `custom_config.secure_1psid` + `custom_config.secure_1psidts`
- Dependency: `gemini_webapi>=1.0.0,<2.0.0`

### 3. Database (PostgreSQL)

**~100 tables** managed by SQLAlchemy ORM + Alembic migrations.

Key table groups:

| Group | Tables | Purpose |
|-------|--------|---------|
| Auth | `user`, `access_token`, `api_key` | User accounts and sessions |
| Chat | `chat_session`, `chat_message`, `chat_feedback` | Conversation data |
| Connectors | `connector`, `credential`, `connector_credential_pair`, `index_attempt` | Data source config |
| Documents | `document`, `document_set`, `tag` | Document metadata |
| Personas | `persona`, `prompt`, `tool`, `persona__tool` | Agent configuration |
| LLM | `llm_provider`, `embedding_provider` | Model configuration |
| Settings | `key_value_store`, `system_settings` | System configuration |
| EE | `user_group`, `saml_config`, `usage_report` | Enterprise features |

**Migration count:** 307 main + 6 tenant versions.

### 4. Document Index (Vespa / OpenSearch)

**Primary: Vespa** -- Hybrid vector + keyword search.

```
Document Ingestion Pipeline:
  Connector Fetch -> Chunking -> Embedding -> Vespa Index
                                    |
                              Model Server
                           (port 9000/9001)
```

| Feature | Vespa | OpenSearch |
|---------|-------|-----------|
| Vector search | Yes | Yes |
| Keyword search | Yes | Yes |
| Hybrid search | Yes | Yes |
| Default | Primary | Alternative |

### 5. Background Processing (Celery)

**Broker:** Redis
**Result backend:** Redis

```
Celery Beat (scheduler)
  |
  +--> Light Worker     -- Quick tasks (notifications, status updates)
  +--> Heavy Worker     -- Resource-intensive tasks (embedding, indexing)
  +--> Doc Processing   -- Document chunking and processing pipeline
  +--> Doc Fetching     -- Connector data fetching
  +--> Monitoring       -- Health checks, metric collection
  +--> User File Proc   -- User-uploaded file handling
  +--> Background       -- General purpose
```

### 6. File Storage

Three backend options:

| Backend | When Used | Config |
|---------|-----------|--------|
| MinIO/S3 | Default for Docker/K8s | `FILE_STORE_TYPE=s3` |
| PostgreSQL | Simple deployments | `FILE_STORE_TYPE=postgres` |
| Local disk | Development only | `FILE_STORE_TYPE=local` |

### 7. Model Server

Separate FastAPI service for ML model inference.

| Server | Port | Purpose |
|--------|------|---------|
| Inference | 9000 | Embedding generation, reranking |
| Indexing | 9001 | Batch document embedding |

Can be disabled with `DISABLE_MODEL_SERVER=true` for external embedding providers.

### 8. Cache (Redis)

| Purpose | Usage |
|---------|-------|
| Celery broker | Task queue messaging |
| Session storage | Auth session backend option |
| Caching | LLM response cache, rate limiting |

## Authentication Flow

```
User Request
  |
  +--> Auth Middleware (fastapi-users)
  |      |
  |      +--> Check session (Redis/Postgres/JWT)
  |      +--> Validate API key
  |      +--> OAuth/OIDC/SAML flow
  |
  +--> Role Check (ADMIN > GLOBAL_CURATOR > CURATOR > BASIC > LIMITED)
  |
  +--> Route Handler
```

### Auth Types

| Type | Flow |
|------|------|
| BASIC | Email/password -> session cookie |
| GOOGLE_OAUTH | Google OAuth2 -> session cookie |
| OIDC | OpenID Connect -> session cookie |
| SAML | SAML 2.0 SSO -> session cookie |
| CLOUD | Cloud-managed auth |

### Session Backends

| Backend | Use Case |
|---------|----------|
| Redis | Default, fast, distributed |
| Postgres | Simpler deployments |
| JWT | Stateless, API-focused |

## Search Pipeline

```
User Query
  |
  +--> Query Preprocessing (intent detection, query expansion)
  |
  +--> Hybrid Search (Vespa)
  |      |
  |      +--> Vector Search (embedding similarity)
  |      +--> Keyword Search (BM25)
  |      +--> Hybrid Ranking (score fusion)
  |
  +--> Access Filtering (user permissions from connectors)
  |
  +--> Reranking (optional, cross-encoder)
  |
  +--> Context Assembly
  |
  +--> LLM Response Generation (litellm)
  |
  +--> Streaming Response to Client
```

## LLM Integration

```
litellm Abstraction Layer
  |
  +--> OpenAI API
  +--> Anthropic API
  +--> Google Gemini API
  +--> Azure OpenAI
  +--> Ollama (local)
  +--> vLLM (local)
  +--> Any OpenAI-compatible API
```

- Configured via Admin panel or env vars
- Supports multiple providers simultaneously
- Per-persona model assignment
- Token counting and cost tracking

## Image Generation Extension Flow (Gemini Web)

### Frontend registration path

```
image-gen-registry.ts
  -> import feature modules
  -> register provider groups + forms
  -> upstream constants.ts merges groups
  -> getImageGenForm.tsx resolves form by provider_name
```

### Backend execution path

```
Admin saves provider config
  -> provider_name=gemini_web
  -> cookies stored in encrypted custom_config
Image generation request
  -> patched image_gen factory resolves gemini_web provider
  -> provider validates cookies
  -> GeminiWebClientManager runs async call on dedicated loop thread
  -> image bytes downloaded
  -> response returned as litellm-compatible ImageResponse (b64_json)
```

Constraints:
- Gemini Web currently returns one image per request; `n` is ignored by provider.
- Cookie auth uses `__Secure-1PSID` and `__Secure-1PSIDTS`.

## Data Flow: Chat Message

```
1. User sends message (Next.js)
2. POST /api/chat/send-message -> FastAPI
3. Backend loads chat session + persona config
4. RAG: Query Vespa for relevant documents
5. Context assembly (system prompt + docs + history)
6. Stream LLM response via litellm
7. Save message + response to PostgreSQL
8. Stream SSE events back to frontend
9. Frontend renders streamed tokens
```

## Data Flow: Document Ingestion

```
1. Admin configures connector + credentials
2. Celery Beat schedules sync task
3. Doc Fetching worker pulls data from source
4. Doc Processing worker:
   a. Parse document content
   b. Chunk into segments
   c. Generate embeddings (Model Server)
   d. Index into Vespa
   e. Store metadata in PostgreSQL
5. Access permissions synced from source
```

## Deployment Topology

### Local Development

```
Host Machine
  ├── Docker (infra only)
  │   ├── PostgreSQL :5432
  │   ├── Redis :6379
  │   ├── Vespa :19071/:8081
  │   └── MinIO :9000/:9001
  ├── Backend (uvicorn) :8080
  └── Frontend (next dev) :3000
```

### Production (Docker Compose)

```
Docker Host
  ├── Nginx :80/:443
  ├── API Server :8080
  ├── Web Server :3000
  ├── Celery Workers (multiple)
  ├── Celery Beat
  ├── Model Server :9000/:9001
  ├── PostgreSQL :5432
  ├── Redis :6379
  ├── Vespa :19071/:8081
  └── MinIO :9000/:9001
```

### Production (Kubernetes)

```
K8s Cluster
  ├── Ingress (nginx-ingress)
  ├── API Deployment (HPA)
  ├── Web Deployment (HPA)
  ├── Celery Deployments (per worker type)
  ├── Model Server Deployment
  ├── CloudNativePG (PostgreSQL operator)
  ├── Redis (subchart)
  ├── Vespa (subchart)
  └── MinIO (subchart)
```

## Network Ports (Local Dev)

| Service | Port | Protocol |
|---------|------|----------|
| Frontend | 3000 | HTTP |
| Backend API | 8080 | HTTP |
| PostgreSQL | 5432 | TCP |
| Redis | 6379 | TCP |
| Vespa Config | 19071 | HTTP |
| Vespa Query | 8081 | HTTP |
| MinIO API | 9000 | HTTP |
| MinIO Console | 9001 | HTTP |
| Model Server | 9000* | HTTP |

*Model server port conflicts with MinIO; use `DISABLE_MODEL_SERVER=true` or `MODEL_SERVER_PORT=9090` locally.

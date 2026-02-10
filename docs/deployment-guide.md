# Deployment Guide

## Deployment Options

| Method | Best For | Complexity |
|--------|----------|------------|
| Docker Compose | Single server, small teams | Low |
| Kubernetes (Helm) | Large teams, HA requirements | Medium |
| AWS ECS Fargate | AWS-native teams | Medium |
| Terraform + EKS | IaC teams on AWS | High |

## Prerequisites

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| CPU | 4 cores | 8+ cores |
| RAM | 8 GB | 16+ GB |
| Disk | 50 GB | 100+ GB (SSD) |
| Docker | 20.10+ | Latest |
| Docker Compose | v2.0+ | Latest |

## 1. Docker Compose (Recommended)

### Quick Start

```bash
curl -fsSL https://raw.githubusercontent.com/onyx-dot-app/onyx/main/deployment/docker_compose/install.sh > install.sh
chmod +x install.sh
./install.sh
```

### Manual Setup

```bash
cd deployment/docker_compose

# Copy and edit env file
cp .env.example .env
# Edit .env with your settings

# Start all services
docker compose -f docker-compose.yml up -d

# Check status
docker compose ps
```

### Compose Variants

| File | Use Case |
|------|----------|
| `docker-compose.yml` | Default full stack |
| `docker-compose.dev.yml` | Development (hot reload, debug) |
| `docker-compose.prod.yml` | Production (SSL, Nginx) |
| `docker-compose.prod-no-letsencrypt.yml` | Production without auto SSL |
| `docker-compose.prod-cloud.yml` | Cloud production (managed DB) |
| `docker-compose.infra.yml` | Infrastructure only (local dev) |
| `docker-compose.opensearch.yml` | OpenSearch instead of Vespa |
| `docker-compose.multitenant-dev.yml` | Multi-tenant development (**EE-only**, not used in this fork) |
| `docker-compose.resources.yml` | With resource limits |

### Production with SSL

```bash
cd deployment/docker_compose

# Edit .env - set DOMAIN, EMAIL for Let's Encrypt
docker compose -f docker-compose.prod.yml up -d
```

## 2. Kubernetes (Helm)

### Prerequisites

- Kubernetes 1.24+
- Helm 3.0+
- `kubectl` configured

### Install

```bash
# Add Helm repo (if published)
helm repo add onyx https://onyx-dot-app.github.io/onyx
helm repo update

# Or install from local chart
cd deployment/helm/charts/onyx

# Install with default values
helm install onyx . -n onyx --create-namespace

# Install with custom values
helm install onyx . -n onyx --create-namespace -f my-values.yaml
```

### Key Helm Values

```yaml
# values.yaml overrides
api:
  replicas: 2
  resources:
    requests:
      cpu: "500m"
      memory: "1Gi"

web:
  replicas: 2

celery:
  workers:
    light:
      replicas: 2
    heavy:
      replicas: 1

postgresql:
  enabled: true  # Use subchart
  # Or set to false and configure external DB

vespa:
  enabled: true

redis:
  enabled: true

minio:
  enabled: true

ingress:
  enabled: true
  hostname: onyx.example.com
  tls: true
```

### Subcharts

| Chart | Purpose |
|-------|---------|
| cloudnative-pg | PostgreSQL operator |
| vespa | Document search engine |
| opensearch | Alternative search engine |
| ingress-nginx | Ingress controller |
| redis | Cache + Celery broker |
| minio | Object storage |
| code-interpreter | Code execution sandbox |

### Autoscaling

Supports HPA and KEDA for autoscaling:

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

## 3. AWS ECS Fargate

CloudFormation templates in `deployment/aws_ecs_fargate/`.

9 service templates covering:
- API server
- Web server
- Celery workers
- Model server
- Supporting infrastructure

See upstream docs: [AWS ECS Guide](https://docs.onyx.app/deployment/cloud/aws/eks)

## 4. Terraform (AWS)

Modules in `deployment/terraform/modules/aws/`:

| Module | Purpose |
|--------|---------|
| VPC | Network configuration |
| EKS | Kubernetes cluster |
| PostgreSQL (RDS) | Managed database |
| Redis (ElastiCache) | Managed cache |
| S3 | Object storage |
| WAF | Web application firewall |

```bash
cd deployment/terraform
terraform init
terraform plan
terraform apply
```

## Environment Variables Reference

### Core Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `AUTH_TYPE` | `basic` | Auth type: `basic`, `google_oauth` (MIT). `oidc`, `saml`, `cloud` are **EE-only** |
| `ENABLE_PAID_ENTERPRISE_EDITION_FEATURES` | `false` | Must remain unset/false for MIT-only operation |
| `WEB_DOMAIN` | `http://localhost:3000` | Frontend URL (for redirects) |
| `API_PREFIX` | `` | API path prefix |
| `FEATURES_API_PREFIX` | `features` | Prefix for fork-specific feature routers (mounted at `/api/{prefix}/*`) |
| `POSTGRES_HOST` | `localhost` | PostgreSQL host |
| `POSTGRES_PORT` | `5432` | PostgreSQL port |
| `POSTGRES_USER` | `postgres` | PostgreSQL user |
| `POSTGRES_PASSWORD` | `password` | PostgreSQL password |
| `POSTGRES_DB` | `onyx` | PostgreSQL database name |

### Redis

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | `` | Redis password |

### Vespa

| Variable | Default | Description |
|----------|---------|-------------|
| `VESPA_HOST` | `localhost` | Vespa host |
| `VESPA_PORT` | `8081` | Vespa query port |
| `VESPA_TENANT_PORT` | `19071` | Vespa config port |

### File Storage

| Variable | Default | Description |
|----------|---------|-------------|
| `FILE_STORE_TYPE` | `s3` | Storage type: s3, postgres, local |
| `S3_BUCKET_NAME` | `onyx` | S3/MinIO bucket |
| `S3_ENDPOINT` | `` | S3/MinIO endpoint URL |
| `AWS_ACCESS_KEY_ID` | `` | S3 access key |
| `AWS_SECRET_ACCESS_KEY` | `` | S3 secret key |

### LLM

| Variable | Default | Description |
|----------|---------|-------------|
| `GEN_AI_MODEL_PROVIDER` | `` | Default LLM provider |
| `GEN_AI_MODEL_VERSION` | `` | Default model name |
| `GEN_AI_API_KEY` | `` | LLM API key |

### Model Server

| Variable | Default | Description |
|----------|---------|-------------|
| `DISABLE_MODEL_SERVER` | `false` | Disable built-in model server |
| `MODEL_SERVER_HOST` | `localhost` | Model server host |
| `MODEL_SERVER_PORT` | `9000` | Model server port |

### Security

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | (generated) | Session encryption key |
| `ENCRYPTION_KEY_SECRET` | (generated) | Credential encryption key |
| `OAUTH_CLIENT_ID` | `` | OAuth client ID |
| `OAUTH_CLIENT_SECRET` | `` | OAuth client secret |

## Infrastructure Services

### PostgreSQL

- Version: 15.2-alpine
- Default port: 5432
- Max connections: 250 (configurable)
- Persistent volume for data

### Redis

- Version: 7.4-alpine
- Default port: 6379
- Used for: Celery broker, session cache, rate limiting
- No persistence by default (ephemeral)

### Vespa

- Default image: `vespaengine/vespa` (production)
- Generic image: `vespaengine/vespa-generic-intel-x86_64` (broader CPU support)
- Ports: 19071 (config), 8081 (query)
- Persistent volume for index data

### MinIO

- S3-compatible object storage
- Ports: 9000 (API), 9001 (Console)
- Default credentials: `minioadmin` / `minioadmin123`
- Change credentials in production

### Nginx

- Version: 1.25.5
- Reverse proxy for frontend + backend
- SSL termination (with Let's Encrypt or custom certs)
- Configs in `deployment/data/nginx/`

## Health Checks

| Service | Endpoint |
|---------|----------|
| Backend | `GET /health` |
| Features layer | `GET /api/features/health` (requires auth) |
| Vespa | `GET http://vespa:19071/state/v1/health` |
| PostgreSQL | `pg_isready` |
| Redis | `redis-cli ping` |
| MinIO | `GET /minio/health/live` |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Vespa `illegal instruction` | Use `vespa-generic-intel-x86_64` image |
| Port 9000 conflict | Set `DISABLE_MODEL_SERVER=true` or change `MODEL_SERVER_PORT` |
| `AUTH_TYPE=disabled` | Use `AUTH_TYPE=basic` instead |
| Memory issues | Add resource limits via `docker-compose.resources.yml` |
| SSL cert issues | Check domain DNS, Let's Encrypt rate limits |
| Celery not processing | Check Redis connectivity, worker logs |

# MITO Platform - Docker Infrastructure

This directory contains the complete Docker infrastructure for the MITO Platform, following the specifications in `docs/MASTER_SPEC.md`.

## Architecture Overview

The infrastructure consists of the following services:

### Core Services
- **API** - Fastify backend (Node.js)
- **Admin Web** - Next.js administrative portal
- **Mobile Build** - React Native development server

### Worker Services
- **Notifications** - Email and push notification workers (BullMQ)
- **AI Pipeline** - Automated content pipeline workers (BullMQ)

### Infrastructure Services
- **PostgreSQL** - Primary database
- **Redis** - Cache and job queue
- **MinIO** - S3-compatible object storage
- **Traefik** - Reverse proxy with automatic HTTPS

## Validation

Before starting, you can validate your infrastructure setup:

```bash
./validate.sh
```

This script checks:
- Docker and Docker Compose installation
- Configuration file syntax
- Required services and volumes
- Network configuration
- Documentation completeness
- Dockerfile existence

## Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- A domain name (for production with Let's Encrypt)

### Development Setup

1. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** with your configuration
   - For local development, you can keep the default values
   - For production, update all passwords and secrets

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Check service status**
   ```bash
   docker-compose ps
   ```

5. **View logs**
   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f api
   ```

### Production Setup

1. **Update environment variables**
   - Set a valid domain in `DOMAIN`
   - Set a valid email in `ACME_EMAIL` for Let's Encrypt
   - Update all passwords and secrets
   - Configure SMTP settings
   - Add Firebase credentials
   - Add AI API keys (OpenAI, Gemini)

2. **DNS Configuration**
   Point the following subdomains to your server IP:
   - `api.yourdomain.com` → API service
   - `admin.yourdomain.com` → Admin portal
   - `minio.yourdomain.com` → MinIO API
   - `minio-console.yourdomain.com` → MinIO web console
   - `mobile-build.yourdomain.com` → React Native packager
   - `traefik.yourdomain.com` → Traefik dashboard (optional)

3. **Start services**
   ```bash
   docker-compose up -d
   ```

4. **Verify HTTPS certificates**
   Let's Encrypt certificates are automatically obtained and renewed.
   Check Traefik logs: `docker-compose logs traefik`

## Service Access

### Local Development (localhost)
- API: https://api.localhost
- Admin: https://admin.localhost
- MinIO API: https://minio.localhost
- MinIO Console: https://minio-console.localhost
- Mobile Build: https://mobile-build.localhost
- Traefik Dashboard: http://localhost:8080

### Production (with custom domain)
- API: https://api.yourdomain.com
- Admin: https://admin.yourdomain.com
- MinIO API: https://minio.yourdomain.com
- MinIO Console: https://minio-console.yourdomain.com
- Mobile Build: https://mobile-build.yourdomain.com
- Traefik Dashboard: https://traefik.yourdomain.com

## Network Architecture

All services run on a shared Docker network (`mito-network`) for internal communication:
- Services communicate using container names (e.g., `postgres`, `redis`, `minio`)
- Traefik routes external traffic based on domain names
- Only Traefik exposes ports 80, 443, and 8080 to the host

## Persistent Volumes

The following data is persisted across container restarts:

- `mito-postgres-data` - PostgreSQL database
- `mito-redis-data` - Redis data and snapshots
- `mito-minio-data` - Object storage files
- `mito-traefik-letsencrypt` - SSL/TLS certificates

## Management Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes (⚠️ DESTROYS DATA)
```bash
docker-compose down -v
```

### Restart a specific service
```bash
docker-compose restart api
```

### Rebuild a service
```bash
docker-compose up -d --build api
```

### View service logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api

# Last 100 lines
docker-compose logs --tail=100 api
```

### Execute command in a container
```bash
# Shell access
docker-compose exec api sh

# Run migrations
docker-compose exec api npm run migrate
```

### Scale worker services
```bash
# Run multiple instances of a worker
docker-compose up -d --scale notifications=3
docker-compose up -d --scale ai-pipeline=2
```

## Database Migrations

Run database migrations on the API service:

```bash
docker-compose exec api npm run migrate:prod
```

## MinIO Setup

After first startup, access MinIO Console and:

1. Create a bucket named `mito-media` (or as configured in .env)
2. Set bucket policy to allow public read access for media files
3. Configure access keys if needed

MinIO Console: https://minio-console.yourdomain.com

## Traefik Configuration

### Dashboard Access
The Traefik dashboard is available at port 8080 (local) or https://traefik.yourdomain.com

**Security Note**: In production, protect the dashboard with authentication:

Add to Traefik labels in docker-compose.yml:
```yaml
- "traefik.http.middlewares.auth.basicauth.users=admin:$$apr1$$..."
- "traefik.http.routers.dashboard.middlewares=auth"
```

Generate password hash:
```bash
echo $(htpasswd -nb admin yourpassword) | sed -e s/\\$/\\$\\$/g
```

### HTTPS Configuration
- Automatic HTTPS via Let's Encrypt
- HTTP automatically redirects to HTTPS
- Certificates stored in `mito-traefik-letsencrypt` volume
- Auto-renewal enabled

### Rate Limiting
The API service has rate limiting enabled:
- Average: 100 requests per second
- Burst: 50 requests

Adjust in docker-compose.yml under API service labels.

## Monitoring

### Health Checks
Services have built-in health checks:
- PostgreSQL: `pg_isready`
- Redis: ping check
- MinIO: HTTP health endpoint
- API: HTTP /health endpoint (if implemented)

View health status:
```bash
docker-compose ps
```

### Resource Usage
```bash
# View resource usage
docker stats

# View specific service
docker stats mito-api
```

## Troubleshooting

### Service won't start
```bash
# Check logs
docker-compose logs service-name

# Check dependencies
docker-compose ps
```

### Database connection issues
```bash
# Verify PostgreSQL is healthy
docker-compose exec postgres pg_isready -U mito_user

# Check connection from API
docker-compose exec api sh -c 'nc -zv postgres 5432'
```

### Redis connection issues
```bash
# Test Redis
docker-compose exec redis redis-cli -a mito_redis_pass ping
```

### MinIO connection issues
```bash
# Check MinIO health
docker-compose exec minio curl -f http://localhost:9000/minio/health/live
```

### Let's Encrypt certificate issues
```bash
# View Traefik logs
docker-compose logs traefik

# Check acme.json
docker-compose exec traefik cat /letsencrypt/acme.json
```

Common issues:
- Domain not pointing to server
- Ports 80/443 not accessible
- Rate limiting from Let's Encrypt (5 certs per week per domain)

### Clear all data and restart
```bash
# Stop services
docker-compose down

# Remove volumes (⚠️ DESTROYS ALL DATA)
docker volume rm mito-postgres-data mito-redis-data mito-minio-data mito-traefik-letsencrypt

# Restart
docker-compose up -d
```

## Security Considerations

### Production Checklist
- [ ] Change all default passwords
- [ ] Use strong JWT secrets (min 32 characters)
- [ ] Configure firewall to allow only ports 80, 443
- [ ] Enable Traefik dashboard authentication
- [ ] Configure SMTP with app-specific password
- [ ] Secure Firebase service account credentials
- [ ] Secure API keys (OpenAI, Gemini)
- [ ] Enable Docker content trust
- [ ] Regular backup of volumes
- [ ] Monitor logs for suspicious activity
- [ ] Keep Docker images updated
- [ ] Configure rate limiting appropriately
- [ ] Set up monitoring and alerting

### Backup Strategy

**Database backup:**
```bash
docker-compose exec postgres pg_dump -U mito_user mito_db > backup.sql
```

**Restore database:**
```bash
cat backup.sql | docker-compose exec -T postgres psql -U mito_user mito_db
```

**Volume backup:**
```bash
docker run --rm -v mito-postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

## Development Tips

### Local Development with localhost domains
Add to `/etc/hosts`:
```
127.0.0.1 api.localhost
127.0.0.1 admin.localhost
127.0.0.1 minio.localhost
127.0.0.1 minio-console.localhost
127.0.0.1 mobile-build.localhost
127.0.0.1 traefik.localhost
```

### Hot Reload
For development with hot reload, use volume mounts:
```yaml
volumes:
  - ../../services/api/src:/app/src:ro
```

## Architecture Compliance

This infrastructure follows the MITO Platform MASTER_SPEC.md:
- ✅ All services in Docker
- ✅ Separate database container
- ✅ Persistent volumes (PostgreSQL, MinIO, Redis)
- ✅ Shared network
- ✅ Environment variables via .env
- ✅ Traefik as reverse proxy
- ✅ HTTPS with Let's Encrypt
- ✅ Multiple domain support
- ✅ Stateless applications
- ✅ Scalable worker services
- ✅ BullMQ for job queues

## Support

For issues or questions, refer to:
- Main documentation: `../../docs/MASTER_SPEC.md`
- Traefik docs: https://doc.traefik.io/traefik/
- Docker Compose docs: https://docs.docker.com/compose/

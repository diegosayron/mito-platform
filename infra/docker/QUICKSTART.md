# MITO Platform - Quick Start Guide

This guide will help you get the MITO Platform up and running in minutes.

## Prerequisites

- Docker 20.10 or later
- Docker Compose 2.0 or later
- 4GB+ RAM available for Docker
- For production: A domain name with DNS configured

## Quick Start for Development

### 1. Copy environment file

```bash
cd infra/docker
cp .env.example .env
```

### 2. Start the platform

```bash
# Using Make (recommended)
make dev

# Or using Docker Compose directly
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### 3. Wait for services to be ready

```bash
# Check status
docker compose ps

# View logs
docker compose logs -f
```

All services should show as "healthy" or "running".

### 4. Access the services

Once running, access the platform at:

- **API**: http://api.localhost
- **Admin Portal**: http://admin.localhost
- **MinIO Console**: http://minio-console.localhost
- **Traefik Dashboard**: http://localhost:8080

**Note**: Add these to `/etc/hosts` if needed:
```
127.0.0.1 api.localhost
127.0.0.1 admin.localhost
127.0.0.1 minio.localhost
127.0.0.1 minio-console.localhost
```

### 5. Initialize MinIO

Create the media bucket:

```bash
make minio-init
```

### 6. Run database migrations

```bash
make migrate
```

That's it! Your development environment is ready.

## Quick Start for Production

### 1. Update environment variables

```bash
cd infra/docker
cp .env.example .env
nano .env  # Edit with your production values
```

**Important:** Update these values:
- `DOMAIN` - Your domain (e.g., mito.example.com)
- `ACME_EMAIL` - Your email for Let's Encrypt
- All passwords and secrets
- SMTP settings
- Firebase credentials
- API keys

### 2. Configure DNS

Point these subdomains to your server IP:
- `api.yourdomain.com`
- `admin.yourdomain.com`
- `minio.yourdomain.com`
- `minio-console.yourdomain.com`

### 3. Configure firewall

Allow ports 80 and 443:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 4. Start the platform

```bash
make prod
```

Or:
```bash
docker compose up -d
```

### 5. Initialize and migrate

```bash
make minio-init
make migrate
```

### 6. Verify HTTPS

Let's Encrypt certificates should be automatically obtained. Access:
- https://api.yourdomain.com
- https://admin.yourdomain.com

Check Traefik logs if certificates are not obtained:
```bash
docker compose logs traefik
```

## Common Commands

### View logs
```bash
make logs              # All services
make logs-api          # API only
make logs-admin        # Admin web only
```

### Restart services
```bash
make restart
```

### Stop everything
```bash
make down
```

### Rebuild services
```bash
make dev-build     # Development
make prod-build    # Production
```

### Database operations
```bash
make migrate       # Run migrations
make backup        # Backup database
make restore FILE=backups/backup.sql  # Restore
```

### Shell access
```bash
make shell-api        # API container
make shell-postgres   # PostgreSQL
make shell-redis      # Redis
```

## Troubleshooting

### Services won't start

Check logs:
```bash
docker compose logs -f
```

Verify Docker is running:
```bash
docker ps
```

### Can't access services

Verify services are running:
```bash
docker compose ps
```

Check if ports are available:
```bash
sudo netstat -tulpn | grep -E '80|443'
```

### Database connection errors

Check PostgreSQL health:
```bash
docker compose exec postgres pg_isready -U mito_user
```

### HTTPS not working

Verify:
1. DNS points to your server
2. Ports 80/443 are accessible from internet
3. Domain is set correctly in .env
4. ACME_EMAIL is valid

Check Traefik logs:
```bash
docker compose logs traefik | grep -i error
```

## Next Steps

1. **Configure Services**: Update service-specific configuration files
2. **Add Content**: Use the Admin Portal to create content
3. **Test Mobile App**: Build the mobile app pointing to your API
4. **Set Up Monitoring**: Add monitoring tools (Prometheus, Grafana)
5. **Configure Backups**: Set up automated backups
6. **Security Hardening**: Review and implement security best practices

## Getting Help

- **Documentation**: See [README.md](README.md) for detailed information
- **Network**: See [NETWORK.md](NETWORK.md) for network architecture
- **Master Spec**: See `../../docs/MASTER_SPEC.md` for platform specifications

## Clean Up

To completely remove the platform and all data:

```bash
make clean
```

**⚠️ WARNING**: This will delete all volumes and data!

---

For detailed documentation, see [README.md](README.md)

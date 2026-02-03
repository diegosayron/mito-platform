# MITO Platform - Production Deployment Guide

This guide covers deploying the MITO Platform to a production server.

## Server Requirements

### Minimum Specifications
- **CPU**: 4 cores
- **RAM**: 8GB (16GB recommended)
- **Storage**: 100GB SSD
- **OS**: Ubuntu 22.04 LTS or similar
- **Network**: Static IP address
- **Ports**: 80, 443 open to internet

### Recommended Specifications
- **CPU**: 8+ cores
- **RAM**: 16GB+
- **Storage**: 200GB+ SSD
- **Bandwidth**: 1Gbps

## Pre-Deployment Checklist

- [ ] Server provisioned with required specs
- [ ] Domain name registered and DNS configured
- [ ] SSH access configured
- [ ] Docker and Docker Compose installed
- [ ] Firewall configured
- [ ] SSL certificate requirements understood
- [ ] Backup strategy planned
- [ ] Monitoring solution chosen

## Server Setup

### 1. Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker repository
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker compose version
```

### 2. Configure Firewall

```bash
# Install UFW if not present
sudo apt install -y ufw

# Configure firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 3. Create Deployment User

```bash
# Create mito user
sudo useradd -m -s /bin/bash mito
sudo usermod -aG docker mito

# Set up SSH for mito user
sudo mkdir -p /home/mito/.ssh
sudo cp ~/.ssh/authorized_keys /home/mito/.ssh/
sudo chown -R mito:mito /home/mito/.ssh
sudo chmod 700 /home/mito/.ssh
sudo chmod 600 /home/mito/.ssh/authorized_keys
```

## DNS Configuration

Configure the following DNS A records to point to your server IP:

```
api.yourdomain.com          → YOUR_SERVER_IP
admin.yourdomain.com        → YOUR_SERVER_IP
minio.yourdomain.com        → YOUR_SERVER_IP
minio-console.yourdomain.com → YOUR_SERVER_IP
mobile-build.yourdomain.com  → YOUR_SERVER_IP (optional)
traefik.yourdomain.com      → YOUR_SERVER_IP (optional)
```

Wait for DNS propagation (can take up to 48 hours, usually minutes):

```bash
# Check DNS propagation
nslookup api.yourdomain.com
```

## Application Deployment

### 1. Clone Repository

```bash
# Switch to mito user
sudo su - mito

# Clone repository
git clone https://github.com/diegosayron/mito-platform.git
cd mito-platform/infra/docker
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
```

**Critical environment variables to configure:**

```bash
# Domain configuration
DOMAIN=yourdomain.com
ACME_EMAIL=admin@yourdomain.com

# Database credentials
PG_USER=mito_user
PG_PASSWORD=<generate-strong-password>
PG_DATABASE=mito_db

# Redis credentials
REDIS_PASSWORD=<generate-strong-password>

# MinIO credentials
MINIO_ROOT_USER=mito_admin
MINIO_ROOT_PASSWORD=<generate-strong-password>
MINIO_BUCKET=mito-media

# JWT secrets (generate with: openssl rand -base64 32)
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>

# SMTP configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=<app-specific-password>
SMTP_FROM=MITO Platform <noreply@yourdomain.com>

# Firebase configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=<your-private-key>
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# AI API keys
OPENAI_API_KEY=sk-your-key
GEMINI_API_KEY=your-key
```

**Generate secure passwords:**
```bash
# Generate random passwords
openssl rand -base64 32
```

### 3. Pull Images and Build

```bash
# Pull base images
docker compose pull postgres redis minio traefik

# Build application images
docker compose build --no-cache
```

### 4. Start Services

```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 5. Initialize Services

```bash
# Wait for services to be healthy (may take 1-2 minutes)
sleep 60

# Initialize MinIO bucket
docker compose exec minio mc alias set local http://localhost:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD
docker compose exec minio mc mb local/mito-media
docker compose exec minio mc anonymous set download local/mito-media

# Run database migrations
docker compose exec api npm run migrate:prod
```

### 6. Verify Deployment

Check all services are running:
```bash
docker compose ps
```

Test endpoints:
```bash
# Test API
curl -k https://api.yourdomain.com/health

# Test Admin
curl -k https://admin.yourdomain.com

# Check SSL certificates
curl -vI https://api.yourdomain.com 2>&1 | grep -i "certificate"
```

## Post-Deployment

### 1. Set Up Monitoring

Install monitoring tools (optional):
```bash
# Portainer for container management
docker run -d -p 9000:9000 --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce
```

### 2. Configure Backups

Create backup script:
```bash
mkdir -p ~/backups

cat > ~/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d-%H%M%S)

# Backup database
docker compose exec -T postgres pg_dump -U mito_user mito_db > $BACKUP_DIR/db-$DATE.sql

# Backup volumes
docker run --rm \
  -v mito-postgres-data:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/postgres-vol-$DATE.tar.gz /data

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
EOF

chmod +x ~/backup.sh
```

Add to cron:
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/mito/backup.sh
```

### 3. Set Up Log Rotation

```bash
sudo tee /etc/logrotate.d/mito-docker << EOF
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  size=10M
  missingok
  delaycompress
  copytruncate
}
EOF
```

### 4. Configure Alerts

Set up basic health monitoring:
```bash
cat > ~/health-check.sh << 'EOF'
#!/bin/bash
WEBHOOK_URL="YOUR_SLACK_WEBHOOK_OR_EMAIL"

# Check if services are running
if ! docker compose ps | grep -q "Up"; then
  curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"MITO Platform: Services are down!"}' \
    $WEBHOOK_URL
fi
EOF

chmod +x ~/health-check.sh

# Add to cron (every 5 minutes)
crontab -e
# Add: */5 * * * * /home/mito/health-check.sh
```

## Maintenance

### Update Application

```bash
cd ~/mito-platform

# Pull latest code
git pull origin main

# Rebuild and restart
cd infra/docker
docker compose build
docker compose up -d

# Check logs
docker compose logs -f
```

### Scale Workers

```bash
# Scale notification workers
docker compose up -d --scale notifications=3

# Scale AI pipeline workers
docker compose up -d --scale ai-pipeline=2
```

### Database Maintenance

```bash
# Vacuum database
docker compose exec postgres psql -U mito_user -d mito_db -c "VACUUM ANALYZE;"

# Check database size
docker compose exec postgres psql -U mito_user -d mito_db -c "\l+"
```

### SSL Certificate Renewal

Let's Encrypt certificates auto-renew. To manually renew:
```bash
docker compose restart traefik
docker compose logs traefik | grep -i certificate
```

## Troubleshooting Production Issues

### High CPU Usage

```bash
# Check resource usage
docker stats

# Check specific service
docker stats mito-api

# View service logs
docker compose logs --tail=100 api
```

### High Memory Usage

```bash
# Check memory
docker stats --no-stream

# Restart specific service
docker compose restart api
```

### Disk Space Issues

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a --volumes

# Check container logs size
du -sh /var/lib/docker/containers/*
```

### Database Performance

```bash
# Check active connections
docker compose exec postgres psql -U mito_user -d mito_db -c "SELECT count(*) FROM pg_stat_activity;"

# Check slow queries
docker compose exec postgres psql -U mito_user -d mito_db -c "SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

### Let's Encrypt Rate Limits

If you hit Let's Encrypt rate limits (5 certificates per week per domain):

1. Wait for the limit to reset (1 week)
2. Use staging environment for testing:
   ```bash
   # In docker-compose.yml, change:
   - "--certificatesresolvers.letsencrypt.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory"
   ```

## Security Hardening

### 1. Secure Traefik Dashboard

Generate basic auth password:
```bash
# Install htpasswd
sudo apt install apache2-utils

# Generate password
htpasswd -nb admin yourpassword
```

Add to Traefik labels in docker-compose.yml:
```yaml
- "traefik.http.middlewares.auth.basicauth.users=admin:$$apr1$$..."
- "traefik.http.routers.dashboard.middlewares=auth"
```

### 2. Restrict SSH Access

```bash
# Allow only key-based authentication
sudo nano /etc/ssh/sshd_config

# Set:
PasswordAuthentication no
PermitRootLogin no

# Restart SSH
sudo systemctl restart sshd
```

### 3. Enable Fail2Ban

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. Regular Updates

```bash
# System updates
sudo apt update && sudo apt upgrade -y

# Docker image updates
docker compose pull
docker compose up -d
```

## Rollback Procedure

If deployment fails:

```bash
# Stop services
docker compose down

# Restore from backup
cat ~/backups/db-YYYYMMDD-HHMMSS.sql | docker compose exec -T postgres psql -U mito_user mito_db

# Checkout previous version
git checkout <previous-commit>

# Rebuild and restart
docker compose build
docker compose up -d
```

## Performance Tuning

### PostgreSQL Tuning

Edit docker-compose.yml to add:
```yaml
postgres:
  command:
    - "postgres"
    - "-c"
    - "shared_buffers=256MB"
    - "-c"
    - "effective_cache_size=1GB"
    - "-c"
    - "max_connections=200"
```

### Redis Tuning

Adjust memory limits in docker-compose.yml:
```yaml
redis:
  command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
```

### Application Scaling

Add more worker instances:
```bash
docker compose up -d --scale notifications=5 --scale ai-pipeline=3
```

## Support and Resources

- MITO Platform Documentation: `../../docs/MASTER_SPEC.md`
- Docker Documentation: https://docs.docker.com
- Traefik Documentation: https://doc.traefik.io/traefik/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Let's Encrypt Documentation: https://letsencrypt.org/docs/

---

For development setup, see [QUICKSTART.md](QUICKSTART.md)

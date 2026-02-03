# MITO Platform - Network Architecture

## Overview

The MITO Platform uses a Docker bridge network (`mito-network`) to enable communication between all services while isolating them from external access, except through the Traefik reverse proxy.

## Network Diagram

```
                                  Internet
                                     |
                                     |
                              +------+------+
                              |   Traefik   |
                              |  (Gateway)  |
                              +------+------+
                                     |
                    +----------------+----------------+
                    |                                 |
            Port 80 (HTTP)                    Port 443 (HTTPS)
                    |                                 |
                    +---------> Auto Redirect --------+
                                                      |
                         +----------------------------+
                         |
                         v
              +-----------------------+
              |    mito-network       |
              |  (Bridge Network)     |
              |                       |
              |  +----------------+   |
              |  |   API          |   |
              |  |  (Fastify)     |   |
              |  +-------+--------+   |
              |          |            |
              |  +-------+--------+   |
              |  |  Admin Web     |   |
              |  |  (Next.js)     |   |
              |  +-------+--------+   |
              |          |            |
              |  +-------+--------+   |
              |  | Mobile Build   |   |
              |  | (React Native) |   |
              |  +-------+--------+   |
              |          |            |
              |  +-------+--------+   |
              |  | Notifications  |   |
              |  |   (Workers)    |   |
              |  +-------+--------+   |
              |          |            |
              |  +-------+--------+   |
              |  | AI Pipeline    |   |
              |  |   (Workers)    |   |
              |  +----------------+   |
              |          |            |
              |  +-------+--------+   |
              |  |  PostgreSQL    |   |
              |  |   (Database)   |   |
              |  +-------+--------+   |
              |          |            |
              |  +-------+--------+   |
              |  |     Redis      |   |
              |  | (Cache/Queue)  |   |
              |  +-------+--------+   |
              |          |            |
              |  +-------+--------+   |
              |  |     MinIO      |   |
              |  | (Object Store) |   |
              |  +----------------+   |
              |                       |
              +-----------------------+
```

## Service Communication

### Internal Communication (within mito-network)

Services communicate using Docker's built-in DNS resolution. Each service is accessible by its container name:

| Service         | Internal Hostname | Port  | Protocol |
|----------------|-------------------|-------|----------|
| postgres       | postgres          | 5432  | TCP      |
| redis          | redis             | 6379  | TCP      |
| minio (API)    | minio             | 9000  | HTTP     |
| minio (Console)| minio             | 9001  | HTTP     |
| api            | api               | 3000  | HTTP     |
| admin-web      | admin-web         | 3001  | HTTP     |
| mobile-build   | mobile-build      | 8081  | HTTP     |

**Example:** The API service connects to PostgreSQL using:
```
Host: postgres
Port: 5432
```

### External Access (via Traefik)

External traffic is routed through Traefik based on domain names:

| Service         | External URL                          | Internal Service |
|----------------|---------------------------------------|------------------|
| API            | https://api.DOMAIN                    | api:3000         |
| Admin Web      | https://admin.DOMAIN                  | admin-web:3001   |
| MinIO API      | https://minio.DOMAIN                  | minio:9000       |
| MinIO Console  | https://minio-console.DOMAIN          | minio:9001       |
| Mobile Build   | https://mobile-build.DOMAIN           | mobile-build:8081|
| Traefik Dash   | https://traefik.DOMAIN                | traefik:8080     |

## Port Mapping

### Exposed Ports (Host → Container)

Only Traefik exposes ports to the host machine:

| Host Port | Container Port | Service | Purpose              |
|-----------|----------------|---------|----------------------|
| 80        | 80             | Traefik | HTTP (redirects)     |
| 443       | 443            | Traefik | HTTPS                |
| 8080      | 8080           | Traefik | Dashboard (optional) |

### Internal Ports (Container-only)

All other services run on internal ports accessible only within the Docker network:

| Container Port | Service         | Purpose              |
|---------------|-----------------|----------------------|
| 3000          | api             | Fastify HTTP         |
| 3001          | admin-web       | Next.js HTTP         |
| 8081          | mobile-build    | React Native Metro   |
| 5432          | postgres        | PostgreSQL           |
| 6379          | redis           | Redis                |
| 9000          | minio           | MinIO API            |
| 9001          | minio           | MinIO Console        |

## Network Configuration

### Bridge Network Settings

```yaml
networks:
  mito-network:
    name: mito-network
    driver: bridge
```

**Features:**
- Automatic DNS resolution for container names
- Isolated from other Docker networks
- Allows container-to-container communication
- NAT for outbound internet access

### Network Isolation

1. **Service-to-Service:** All services can communicate on the mito-network
2. **External Access:** Only through Traefik on ports 80/443
3. **Database Access:** PostgreSQL only accessible from within the network
4. **Redis Access:** Redis only accessible from within the network
5. **MinIO Access:** Direct API access only from within the network (external via Traefik)

## Security Considerations

### Network Security

1. **Firewall Rules:**
   - Allow inbound: TCP 80, 443
   - Block all other inbound ports
   - Allow outbound for updates and external API calls

2. **Service Isolation:**
   - Database not exposed to internet
   - Redis not exposed to internet
   - MinIO API access only through authenticated requests

3. **TLS/SSL:**
   - All external traffic encrypted via HTTPS
   - Internal traffic uses HTTP (encrypted at network layer by Docker)
   - Automatic certificate management via Let's Encrypt

### Recommended iptables Rules

```bash
# Allow SSH (if needed)
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow HTTP/HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Drop all other inbound
iptables -A INPUT -j DROP
```

## Traefik Routing

### Domain-Based Routing

Traefik uses domain-based routing to direct traffic to the appropriate service:

```
Request: https://api.example.com
    ↓
Traefik matches: Host(`api.example.com`)
    ↓
Routes to: api:3000
```

### Routing Rules

Each service has Traefik labels defining its routing:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.api.rule=Host(`api.${DOMAIN}`)"
  - "traefik.http.routers.api.entrypoints=websecure"
  - "traefik.http.routers.api.tls.certresolver=letsencrypt"
  - "traefik.http.services.api.loadbalancer.server.port=3000"
```

### Middleware

Rate limiting on API:
```yaml
- "traefik.http.middlewares.api-ratelimit.ratelimit.average=100"
- "traefik.http.middlewares.api-ratelimit.ratelimit.burst=50"
```

## Service Dependencies

### Startup Order

Docker Compose manages startup order with `depends_on` and health checks:

```
1. postgres, redis, minio (start in parallel)
2. Wait for health checks to pass
3. api, notifications, ai-pipeline (start after dependencies)
4. admin-web, mobile-build (start after API)
```

### Health Checks

- **PostgreSQL:** `pg_isready` command
- **Redis:** Ping check
- **MinIO:** HTTP health endpoint
- **API:** HTTP /health endpoint (if implemented)

## Scaling

### Horizontal Scaling

Worker services can be scaled:

```bash
# Scale notifications to 3 instances
docker-compose up -d --scale notifications=3

# Scale AI pipeline to 2 instances
docker-compose up -d --scale ai-pipeline=2
```

**Load Balancing:**
- Workers pull jobs from Redis queue (BullMQ)
- Natural load distribution
- No additional load balancer needed

**Web Services:**
- Can be scaled with external load balancer
- Traefik supports multiple backend instances
- Sticky sessions may be needed for stateful features

## Monitoring

### Network Monitoring

Check network status:
```bash
# List networks
docker network ls

# Inspect mito-network
docker network inspect mito-network

# Show network connections
docker network inspect mito-network | grep -A 10 "Containers"
```

### Traffic Monitoring

Traefik provides:
- Access logs
- Metrics endpoint
- Dashboard with real-time traffic

View logs:
```bash
docker-compose logs -f traefik
```

## Troubleshooting

### Network Connectivity Issues

**Check service is on network:**
```bash
docker network inspect mito-network
```

**Test connectivity between services:**
```bash
# From API to PostgreSQL
docker-compose exec api nc -zv postgres 5432

# From API to Redis
docker-compose exec api nc -zv redis 6379
```

**DNS Resolution:**
```bash
# Check if container can resolve other services
docker-compose exec api nslookup postgres
docker-compose exec api ping -c 1 redis
```

### Traefik Routing Issues

**Check Traefik routing config:**
```bash
# Access Traefik API
curl http://localhost:8080/api/http/routers
```

**Verify labels:**
```bash
docker inspect mito-api | grep traefik
```

### Common Issues

1. **Service can't connect to database**
   - Check service is on mito-network
   - Verify database health check passed
   - Check environment variables are correct

2. **External URL not accessible**
   - Verify DNS points to server
   - Check Traefik labels are correct
   - Ensure Traefik is running and healthy

3. **HTTPS not working**
   - Check Let's Encrypt rate limits
   - Verify email in ACME_EMAIL is valid
   - Ensure ports 80/443 are accessible from internet

## Additional Resources

- [Docker Networking](https://docs.docker.com/network/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

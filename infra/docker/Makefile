# MITO Platform - Docker Infrastructure Makefile
# Convenient commands for managing the Docker infrastructure

.PHONY: help up down restart logs ps build clean dev prod migrate backup restore

# Default target
help:
	@echo "MITO Platform - Docker Infrastructure Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev              - Start all services in development mode"
	@echo "  make dev-build        - Build and start in development mode"
	@echo "  make logs             - View logs for all services"
	@echo "  make logs-api         - View logs for API service"
	@echo "  make logs-admin       - View logs for Admin Web"
	@echo ""
	@echo "Production:"
	@echo "  make prod             - Start all services in production mode"
	@echo "  make prod-build       - Build and start in production mode"
	@echo ""
	@echo "General:"
	@echo "  make up               - Start all services"
	@echo "  make down             - Stop all services"
	@echo "  make restart          - Restart all services"
	@echo "  make ps               - Show service status"
	@echo "  make build            - Build all services"
	@echo "  make clean            - Stop and remove all containers and volumes (⚠️  DESTROYS DATA)"
	@echo ""
	@echo "Database:"
	@echo "  make migrate          - Run database migrations"
	@echo "  make backup           - Backup PostgreSQL database"
	@echo "  make restore          - Restore PostgreSQL database from backup"
	@echo ""
	@echo "MinIO:"
	@echo "  make minio-init       - Initialize MinIO bucket"
	@echo ""
	@echo "Utilities:"
	@echo "  make shell-api        - Shell access to API container"
	@echo "  make shell-admin      - Shell access to Admin Web container"
	@echo "  make shell-postgres   - Shell access to PostgreSQL container"

# Development mode
dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
	@echo "Development environment started!"
	@echo "Access services at:"
	@echo "  - API: http://api.localhost"
	@echo "  - Admin: http://admin.localhost"
	@echo "  - MinIO Console: http://minio-console.localhost"
	@echo "  - Traefik Dashboard: http://localhost:8080"

dev-build:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# Production mode
prod:
	docker-compose up -d
	@echo "Production environment started!"
	@echo "Access services at:"
	@echo "  - API: https://api.$${DOMAIN}"
	@echo "  - Admin: https://admin.$${DOMAIN}"
	@echo "  - MinIO Console: https://minio-console.$${DOMAIN}"

prod-build:
	docker-compose up -d --build

# General commands
up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

logs-api:
	docker-compose logs -f api

logs-admin:
	docker-compose logs -f admin-web

logs-notifications:
	docker-compose logs -f notifications

logs-ai:
	docker-compose logs -f ai-pipeline

logs-traefik:
	docker-compose logs -f traefik

ps:
	docker-compose ps

build:
	docker-compose build

# Clean up (WARNING: DESTROYS DATA)
clean:
	@echo "⚠️  WARNING: This will remove all containers and volumes!"
	@echo "Press Ctrl+C to cancel, or wait 5 seconds to continue..."
	@sleep 5
	docker-compose down -v
	@echo "Cleanup complete!"

# Database operations
migrate:
	docker-compose exec api npm run migrate:prod

backup:
	@mkdir -p backups
	docker-compose exec -T postgres pg_dump -U $${PG_USER:-mito_user} $${PG_DATABASE:-mito_db} > backups/backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "Database backup created in backups/"

restore:
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make restore FILE=backups/backup-20240101-120000.sql"; \
		exit 1; \
	fi
	cat $(FILE) | docker-compose exec -T postgres psql -U $${PG_USER:-mito_user} $${PG_DATABASE:-mito_db}
	@echo "Database restored from $(FILE)"

# MinIO operations
minio-init:
	@echo "Creating MinIO bucket..."
	docker-compose exec minio mc alias set minio http://localhost:9000 $${MINIO_ROOT_USER:-mito_minio} $${MINIO_ROOT_PASSWORD:-mito_minio_password}
	docker-compose exec minio mc mb minio/$${MINIO_BUCKET:-mito-media}
	docker-compose exec minio mc anonymous set download minio/$${MINIO_BUCKET:-mito-media}
	@echo "MinIO bucket created!"

# Shell access
shell-api:
	docker-compose exec api sh

shell-admin:
	docker-compose exec admin-web sh

shell-postgres:
	docker-compose exec postgres psql -U $${PG_USER:-mito_user} $${PG_DATABASE:-mito_db}

shell-redis:
	docker-compose exec redis redis-cli -a $${REDIS_PASSWORD:-mito_redis_pass}

# Scale workers
scale-notifications:
	@if [ -z "$(N)" ]; then \
		echo "Usage: make scale-notifications N=3"; \
		exit 1; \
	fi
	docker-compose up -d --scale notifications=$(N)

scale-ai:
	@if [ -z "$(N)" ]; then \
		echo "Usage: make scale-ai N=2"; \
		exit 1; \
	fi
	docker-compose up -d --scale ai-pipeline=$(N)

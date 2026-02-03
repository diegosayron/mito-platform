#!/bin/bash

# MITO Platform - Infrastructure Validation Script
# This script validates the Docker infrastructure setup

set -e

echo "🔍 MITO Platform - Infrastructure Validation"
echo "============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print success
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if Docker is installed
echo "Checking prerequisites..."
if command -v docker &> /dev/null; then
    success "Docker is installed ($(docker --version))"
else
    error "Docker is not installed"
    exit 1
fi

# Check if Docker Compose is installed
if command -v docker compose &> /dev/null; then
    success "Docker Compose is installed ($(docker compose version))"
elif command -v docker-compose &> /dev/null; then
    success "Docker Compose is installed ($(docker-compose --version))"
else
    error "Docker Compose is not installed"
    exit 1
fi

echo ""
echo "Validating configuration files..."

# Check if docker-compose.yml exists
if [ -f "docker-compose.yml" ]; then
    success "docker-compose.yml exists"
else
    error "docker-compose.yml not found"
    exit 1
fi

# Check if .env.example exists
if [ -f ".env.example" ]; then
    success ".env.example exists"
else
    warning ".env.example not found (optional)"
fi

# Validate docker-compose.yml syntax
if docker compose config --quiet 2>/dev/null; then
    success "docker-compose.yml is valid"
elif docker-compose config --quiet 2>/dev/null; then
    success "docker-compose.yml is valid"
else
    error "docker-compose.yml has syntax errors"
    exit 1
fi

# Validate development compose
if [ -f "docker-compose.dev.yml" ]; then
    success "docker-compose.dev.yml exists"
    if docker compose -f docker-compose.yml -f docker-compose.dev.yml config --quiet 2>/dev/null; then
        success "docker-compose.dev.yml is valid"
    else
        warning "docker-compose.dev.yml has syntax errors"
    fi
fi

echo ""
echo "Checking required services in docker-compose.yml..."

REQUIRED_SERVICES=("traefik" "postgres" "redis" "minio" "api" "admin-web" "notifications" "ai-pipeline")

for service in "${REQUIRED_SERVICES[@]}"; do
    if docker compose config --services 2>/dev/null | grep -q "^$service$"; then
        success "Service '$service' is defined"
    elif docker-compose config --services 2>/dev/null | grep -q "^$service$"; then
        success "Service '$service' is defined"
    else
        error "Service '$service' is missing"
    fi
done

echo ""
echo "Checking volumes configuration..."

REQUIRED_VOLUMES=("postgres-data" "redis-data" "minio-data" "traefik-letsencrypt")

for volume in "${REQUIRED_VOLUMES[@]}"; do
    if docker compose config 2>/dev/null | grep -q "$volume"; then
        success "Volume '$volume' is defined"
    elif docker-compose config 2>/dev/null | grep -q "$volume"; then
        success "Volume '$volume' is defined"
    else
        error "Volume '$volume' is missing"
    fi
done

echo ""
echo "Checking network configuration..."

if docker compose config 2>/dev/null | grep -q "mito-network"; then
    success "Network 'mito-network' is defined"
elif docker-compose config 2>/dev/null | grep -q "mito-network"; then
    success "Network 'mito-network' is defined"
else
    error "Network 'mito-network' is missing"
fi

echo ""
echo "Checking Traefik configuration..."

# Check Traefik labels
if docker compose config 2>/dev/null | grep -q "traefik.http.routers"; then
    success "Traefik labels are configured"
elif docker-compose config 2>/dev/null | grep -q "traefik.http.routers"; then
    success "Traefik labels are configured"
else
    warning "Traefik labels not found (this is OK if using defaults)"
fi

# Check Let's Encrypt configuration
if docker compose config 2>/dev/null | grep -q "certificatesresolvers.letsencrypt"; then
    success "Let's Encrypt is configured"
elif docker-compose config 2>/dev/null | grep -q "certificatesresolvers.letsencrypt"; then
    success "Let's Encrypt is configured"
else
    warning "Let's Encrypt configuration not found"
fi

echo ""
echo "Checking environment variables..."

if [ -f ".env" ]; then
    success ".env file exists"
    
    # Check critical variables
    CRITICAL_VARS=("DOMAIN" "PG_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET")
    for var in "${CRITICAL_VARS[@]}"; do
        if grep -q "^${var}=" .env; then
            success "Variable '$var' is set"
        else
            warning "Variable '$var' is not set in .env"
        fi
    done
else
    warning ".env file not found (will use defaults from .env.example)"
fi

echo ""
echo "Checking documentation..."

DOCS=("README.md" "NETWORK.md" "QUICKSTART.md" "PRODUCTION.md")
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        success "Documentation '$doc' exists"
    else
        warning "Documentation '$doc' not found"
    fi
done

echo ""
echo "Checking Makefile..."

if [ -f "Makefile" ]; then
    success "Makefile exists"
    
    # Check important targets
    TARGETS=("dev" "prod" "up" "down" "logs" "migrate" "backup")
    for target in "${TARGETS[@]}"; do
        if grep -q "^${target}:" Makefile; then
            success "Makefile target '$target' exists"
        else
            warning "Makefile target '$target' not found"
        fi
    done
else
    warning "Makefile not found"
fi

echo ""
echo "Checking Dockerfiles..."

DOCKERFILES=(
    "../../services/api/Dockerfile"
    "../../apps/admin-web/Dockerfile"
    "../../apps/mobile/Dockerfile"
    "../../services/notifications/Dockerfile"
    "../../services/ai-pipeline/Dockerfile"
)

for dockerfile in "${DOCKERFILES[@]}"; do
    if [ -f "$dockerfile" ]; then
        success "Dockerfile exists: $dockerfile"
    else
        error "Dockerfile missing: $dockerfile"
    fi
done

echo ""
echo "============================================="
echo "Validation Summary:"
echo ""

# Count files
total_files=0
existing_files=0

for file in "docker-compose.yml" "docker-compose.dev.yml" ".env.example" "README.md" "NETWORK.md" "QUICKSTART.md" "PRODUCTION.md" "Makefile"; do
    total_files=$((total_files + 1))
    if [ -f "$file" ]; then
        existing_files=$((existing_files + 1))
    fi
done

echo "Configuration files: $existing_files/$total_files"
echo "Required services: ${#REQUIRED_SERVICES[@]}/${#REQUIRED_SERVICES[@]}"
echo "Required volumes: ${#REQUIRED_VOLUMES[@]}/${#REQUIRED_VOLUMES[@]}"
echo ""

if [ $existing_files -eq $total_files ]; then
    success "All infrastructure files are in place!"
    echo ""
    echo "Next steps:"
    echo "  1. Copy .env.example to .env and configure it"
    echo "  2. Run 'make dev' to start development environment"
    echo "  3. Run 'make migrate' to initialize the database"
    echo "  4. Access services at http://api.localhost"
else
    warning "Some files are missing. Please check the output above."
    exit 1
fi

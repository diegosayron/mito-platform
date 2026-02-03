# MITO Platform - API Service

Backend API service for the MITO platform built with Node.js, Fastify, and TypeScript.

## Overview

This is the central backend API service that handles:
- User authentication and authorization (JWT-based)
- PostgreSQL database connections
- RESTful API endpoints
- Health check endpoints
- Rate limiting and security

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT + Refresh Tokens
- **Logging**: Pino

## Project Structure

```
src/
├── config/           # Configuration files
│   ├── index.ts      # Main config
│   └── database.ts   # Database connection
├── middlewares/      # Custom middlewares
│   └── auth.ts       # JWT authentication middleware
├── routes/           # API routes
│   └── health.ts     # Health check endpoints
├── services/         # Business logic layer
├── utils/            # Utility functions
│   └── jwt.ts        # JWT utilities
├── types/            # TypeScript type definitions
└── server.ts         # Main server entry point
```

## Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL 14 or higher
- npm or pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Configure your `.env` file with the appropriate values

4. Start the development server:
```bash
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `PORT` - Server port (default: 3000)
- `DB_HOST` - PostgreSQL host
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - Secret for JWT tokens
- `REFRESH_TOKEN_SECRET` - Secret for refresh tokens

## API Endpoints

### Health Check

- `GET /health` - Overall health status including database
- `GET /ready` - Readiness check for Kubernetes
- `GET /live` - Liveness check for Kubernetes

### Authentication (To be implemented)

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout

## Docker

Build the Docker image:
```bash
docker build -t mito-api .
```

Run the container:
```bash
docker run -p 3000:3000 --env-file .env mito-api
```

## Architecture

This service follows the principles defined in the [MASTER_SPEC.md](../../docs/MASTER_SPEC.md):
- Modular folder structure
- Stateless backend
- JWT-based authentication
- PostgreSQL for data persistence
- Configuration via environment variables
- Docker-ready for containerization

## Security

- Helmet for security headers
- CORS protection
- Rate limiting
- JWT-based authentication
- Prepared for HTTPS in production

## Contributing

Follow the architecture and patterns defined in the MASTER_SPEC.md document.

## License

ISC

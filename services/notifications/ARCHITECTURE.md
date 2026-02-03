# Notification Service Architecture

## System Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         MITO Notification Service                         │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌──────────────────┐         ┌────────────────┐
│   Client Apps   │────────▶│  Fastify Server  │────────▶│  PostgreSQL DB │
│  (API, Admin)   │         │   (Port 3003)    │         │  (Logs/Templates)
└─────────────────┘         └──────────────────┘         └────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │  Notification    │
                            │    Service       │
                            │  (Orchestrator)  │
                            └──────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │   Template   │ │    Email     │ │   Firebase   │
            │   Service    │ │   Service    │ │   Service    │
            └──────────────┘ └──────────────┘ └──────────────┘
                    │                │                │
                    │                ▼                ▼
                    │        ┌──────────────┐ ┌──────────────┐
                    │        │ SMTP Server  │ │   Firebase   │
                    │        │  (External)  │ │     FCM      │
                    │        └──────────────┘ └──────────────┘
                    │
                    ▼
            ┌──────────────────┐
            │   PostgreSQL     │
            │    Templates     │
            └──────────────────┘


┌──────────────────────────────────────────────────────────────────────────┐
│                           Queue Processing Flow                           │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌──────────────────┐         ┌────────────────┐
│  Send Request   │────1───▶│ Create Log Entry │────2───▶│  Add to Queue  │
│  (API Call)     │         │   (PostgreSQL)   │         │   (BullMQ)     │
└─────────────────┘         └──────────────────┘         └────────────────┘
                                                                   │
                                                                   │
┌─────────────────┐                                               │
│  Return Job ID  │◀───────────────────────────────────────────────┘
│  (201 Created)  │
└─────────────────┘
                            
                            ┌──────────────────┐
                            │   Redis Queue    │
                            │    (BullMQ)      │
                            └──────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │ Notification     │
                            │    Worker        │
                            │  (Background)    │
                            └──────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                  ▼
            ┌──────────────┐                  ┌──────────────┐
            │   Success    │                  │    Failed    │
            │ Update Log   │                  │ Update Log   │
            │ status=sent  │                  │ status=failed│
            └──────────────┘                  └──────────────┘
                                                       │
                                                       ▼
                                              ┌──────────────┐
                                              │  Retry Job   │
                                              │ (Max 3x with │
                                              │   backoff)   │
                                              └──────────────┘
```

## Component Responsibilities

### API Server (server.ts)
- HTTP request handling
- Route registration
- Health checks
- Service initialization
- SMTP/Firebase verification

### Worker Process (worker.ts)
- Background job processing
- Queue monitoring
- Retry logic execution
- Graceful shutdown handling

### Services

#### Notification Service
- Job orchestration
- Log creation and updates
- Channel routing (email/push/both)

#### Email Service
- SMTP connection management
- Email composition and sending
- Connection verification

#### Firebase Service
- FCM initialization
- Push notification delivery
- Token validation

#### Template Service
- Template retrieval from DB
- Variable substitution
- Template CRUD operations

### Queue System
- Redis connection
- BullMQ queue management
- Job scheduling
- Retry configuration

### Database
- Connection pooling
- Migration management
- Template storage
- Log persistence

## API Endpoints Flow

```
POST /api/notifications/send
    │
    ├──▶ Validate payload
    ├──▶ Create log entry (status: pending)
    ├──▶ Add job to queue
    └──▶ Return notification ID

GET /api/notifications/:id
    │
    └──▶ Query notification_logs table

GET /api/notifications/user/:userId
    │
    └──▶ Query user's notifications with limit

GET /api/notifications/templates/email
    │
    └──▶ Query all email templates

PUT /api/notifications/templates/email/:id
    │
    ├──▶ Validate template data
    └──▶ Update email template

GET /api/notifications/templates/push
    │
    └──▶ Query all push templates

PUT /api/notifications/templates/push/:id
    │
    ├──▶ Validate template data
    └──▶ Update push template

GET /health
    │
    └──▶ Return service status
```

## Data Flow

### Sending a Notification

1. **Client** → POST request to API
2. **API** → Validate request data
3. **API** → Insert record into `notification_logs` (status: pending)
4. **API** → Add job to BullMQ queue with notification ID
5. **API** → Return notification ID to client
6. **Worker** → Pick job from queue
7. **Worker** → Fetch template from database
8. **Worker** → Render template with variables
9. **Worker** → Send via Email Service and/or Firebase Service
10. **Worker** → Update log status (sent/failed)
11. **Worker** → On failure: BullMQ auto-retries with backoff

### Template Management

1. **Admin** → PUT request to update template
2. **API** → Validate template content
3. **API** → Update database record
4. **API** → Return success response
5. **Future notifications** → Use updated template

## Retry Strategy

```
Attempt 1: Immediate
    │
    ├──▶ Success → status: sent ✓
    │
    └──▶ Failed → status: retrying
            │
            └──▶ Wait 5000ms (exponential backoff)
                    │
                    └──▶ Attempt 2
                            │
                            ├──▶ Success → status: sent ✓
                            │
                            └──▶ Failed → status: retrying
                                    │
                                    └──▶ Wait 10000ms (exponential backoff)
                                            │
                                            └──▶ Attempt 3 (Final)
                                                    │
                                                    ├──▶ Success → status: sent ✓
                                                    │
                                                    └──▶ Failed → status: failed ✗
                                                            (Error logged in DB)
```

## Database Schema

```sql
notification_logs
├── id (SERIAL PRIMARY KEY)
├── user_id (INTEGER)
├── type (VARCHAR) -- welcome, subscription_expiring, etc.
├── channel (VARCHAR) -- email, push, both
├── status (VARCHAR) -- pending, sent, failed, retrying
├── payload (JSONB) -- Full request data
├── error (TEXT) -- Error message if failed
├── attempts (INTEGER) -- Retry counter
├── sent_at (TIMESTAMP) -- Success timestamp
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

email_templates
├── id (SERIAL PRIMARY KEY)
├── type (VARCHAR UNIQUE) -- Notification type
├── subject (VARCHAR)
├── html_body (TEXT)
├── text_body (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

push_templates
├── id (SERIAL PRIMARY KEY)
├── type (VARCHAR UNIQUE) -- Notification type
├── title (VARCHAR)
├── body (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## Environment Configuration

```
Application Layer
├── PORT=3003
├── HOST=0.0.0.0
└── NODE_ENV=development|production

Data Layer
├── PostgreSQL (PG_HOST, PG_PORT, PG_DATABASE, PG_USER, PG_PASSWORD)
└── Redis (REDIS_HOST, REDIS_PORT, REDIS_PASSWORD)

External Services
├── SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM)
└── Firebase (FIREBASE_KEY)

Configuration
├── Retry (MAX_RETRY_ATTEMPTS, RETRY_DELAY)
└── Rate Limit (RATE_LIMIT_MAX, RATE_LIMIT_TIME_WINDOW)
```

## Deployment Architecture

```
┌────────────────────────────────────────────┐
│           Docker Container 1               │
│  ┌──────────────────────────────────────┐  │
│  │   Notification API Server            │  │
│  │   Port: 3003                         │  │
│  │   Process: node dist/server.js       │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────┐
│           Docker Container 2               │
│  ┌──────────────────────────────────────┐  │
│  │   Notification Worker                │  │
│  │   Process: node dist/worker.js       │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────┐        ┌──────────────┐
│  PostgreSQL  │        │    Redis     │
│  Container   │        │  Container   │
└──────────────┘        └──────────────┘
```

## Scalability Considerations

### Horizontal Scaling
- Multiple API server instances behind load balancer
- Multiple worker instances for parallel processing
- Shared PostgreSQL and Redis instances
- Stateless design allows easy scaling

### Performance
- Database connection pooling
- Queue-based async processing
- Optimized template rendering
- Rate limiting to prevent overload

### Monitoring
- Health check endpoint
- Structured logging (Pino)
- Database logs for auditing
- BullMQ metrics in Redis

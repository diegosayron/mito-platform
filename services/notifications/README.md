# MITO Notification Service

Email and Push Notification service for the MITO Platform.

## Features

- **Email Notifications**: Send transactional emails via SMTP
- **Push Notifications**: Send push notifications via Firebase Cloud Messaging
- **Template System**: Dynamic template rendering with variables
- **Queue System**: BullMQ-based queue for reliable message delivery
- **Retry Logic**: Automatic retry on failure
- **Persistent Logs**: Track delivery and failure logs

## Message Types

- Welcome
- Subscription Expiring
- Subscription Expired
- Renewal Confirmed
- Report Received
- Report Resolved
- Account Closed
- Campaigns

## Environment Variables

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
FIREBASE_KEY={"type":"service_account",...}
```

## Running

```bash
# Development
npm run dev

# Production
npm run build
npm start

# Worker
npm run worker
```

## API Endpoints

- `POST /api/notifications/send` - Send notification
- `GET /api/notifications/templates` - Get templates
- `PUT /api/notifications/templates/:id` - Update template
- `GET /health` - Health check

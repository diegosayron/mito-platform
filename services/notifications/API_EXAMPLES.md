# API Testing Examples

## Prerequisites

1. Start PostgreSQL database
2. Run migrations: `npm run migrate`
3. Start Redis server
4. Start the notification server: `npm run dev`
5. Start the worker (in another terminal): `npm run worker`

## Example API Calls

### 1. Send Email Notification

```bash
curl -X POST http://localhost:3003/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "type": "welcome",
    "channel": "email",
    "email": "user@example.com",
    "variables": {
      "userName": "João Silva"
    }
  }'
```

### 2. Send Push Notification

```bash
curl -X POST http://localhost:3003/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "type": "subscription_expiring",
    "channel": "push",
    "fcmToken": "your-fcm-token",
    "variables": {
      "userName": "João Silva",
      "daysLeft": "7"
    }
  }'
```

### 3. Send Both Email and Push

```bash
curl -X POST http://localhost:3003/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "type": "renewal_confirmed",
    "channel": "both",
    "email": "user@example.com",
    "fcmToken": "your-fcm-token",
    "variables": {
      "userName": "João Silva",
      "newExpiryDate": "2026-03-01"
    }
  }'
```

### 4. Get Notification Status

```bash
curl http://localhost:3003/api/notifications/1
```

### 5. Get User Notifications

```bash
curl http://localhost:3003/api/notifications/user/1?limit=10
```

### 6. Get Email Templates

```bash
curl http://localhost:3003/api/notifications/templates/email
```

### 7. Update Email Template

```bash
curl -X PUT http://localhost:3003/api/notifications/templates/email/1 \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Bem-vindo ao MITO - Atualizado!",
    "htmlBody": "<h1>Olá, {{userName}}!</h1><p>Sua jornada começa agora!</p>",
    "textBody": "Olá, {{userName}}! Sua jornada começa agora!"
  }'
```

### 8. Get Push Templates

```bash
curl http://localhost:3003/api/notifications/templates/push
```

### 9. Update Push Template

```bash
curl -X PUT http://localhost:3003/api/notifications/templates/push/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bem-vindo!",
    "body": "Olá {{userName}}, bem-vindo ao MITO!"
  }'
```

### 10. Health Check

```bash
curl http://localhost:3003/health
```

## Notification Types

- `welcome` - Welcome message
- `subscription_expiring` - Subscription expiring soon
- `subscription_expired` - Subscription expired
- `renewal_confirmed` - Renewal confirmed
- `report_received` - Report received
- `report_resolved` - Report resolved
- `account_closed` - Account closed
- `campaign` - Campaign message

## Channel Types

- `email` - Email only
- `push` - Push notification only
- `both` - Both email and push

## Template Variables

Common variables that can be used in templates:

- `{{userName}}` - User name
- `{{daysLeft}}` - Days left
- `{{expiredDate}}` - Expiration date
- `{{newExpiryDate}}` - New expiration date
- `{{reportId}}` - Report ID
- `{{resolution}}` - Resolution status
- `{{subject}}` - Subject (for campaigns)
- `{{content}}` - Content (for campaigns)
- `{{title}}` - Title (for campaigns)
- `{{message}}` - Message (for campaigns)

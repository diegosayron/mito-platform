# Diagrama de Deploy da MITO Platform

## Arquitetura de Deploy com Portainer e Traefik

```
                              INTERNET
                                 |
                                 | HTTPS (443)
                                 | HTTP (80)
                                 ↓
                        ┌────────────────┐
                        │    TRAEFIK     │
                        │ (letsencrypt   │
                        │  resolver)     │
                        └────────┬───────┘
                                 |
                    ┌────────────┴────────────┐
                    |    Rede: automacao      |
                    |                         |
        ┌───────────┼─────────────────────────┼───────────┐
        |           |                         |           |
        |      ┌────▼──────┐            ┌────▼──────┐    |
        |      │ API       │            │ Admin Web │    |
        |      │ Fastify   │            │ Next.js   │    |
        |      └────┬──────┘            └───────────┘    |
        |           |                                     |
        |      ┌────▼──────────────────────┐             |
        |      |    PostgreSQL Database    |             |
        |      └───────────────────────────┘             |
        |           |                                     |
        |      ┌────▼──────┐     ┌────────────┐          |
        |      │   Redis   │     │   MinIO    │          |
        |      │  Cache    │     │  Storage   │          |
        |      └───────────┘     └────────────┘          |
        |                                                 |
        |      ┌───────────────┐  ┌─────────────┐        |
        |      │ Notifications │  │ AI Pipeline │        |
        |      │    Worker     │  │   Worker    │        |
        |      └───────────────┘  └─────────────┘        |
        |                                                 |
        └─────────────────────────────────────────────────┘

                    Gerenciado via Portainer UI
```

## Fluxo de Requisições

### 1. Usuário acessa Admin Portal

```
Usuário
   ↓
https://admin.mito.inbox360.com.br
   ↓
Traefik (verifica domínio e certificate)
   ↓
Container admin-web:3001
   ↓
Resposta HTML/JS
```

### 2. App Mobile faz requisição à API

```
App Mobile
   ↓
https://api.mito.inbox360.com.br/api/videos
   ↓
Traefik (rate limiting, SSL)
   ↓
Container api:3000
   ↓
PostgreSQL (dados)
   ↓
Redis (cache)
   ↓
MinIO (arquivos de mídia)
   ↓
Resposta JSON
```

### 3. Worker processa job assíncrono

```
API enfileira job
   ↓
Redis (BullMQ)
   ↓
Notifications Worker (pega job)
   ↓
Envia e-mail via SMTP
   ↓
Envia push via Firebase
   ↓
Atualiza status no PostgreSQL
```

## Portas e Serviços

| Serviço          | Porta Interna | URL Externa                              | Protocolo |
|------------------|---------------|------------------------------------------|-----------|
| API              | 3000          | https://api.mito.inbox360.com.br         | HTTPS     |
| Admin Web        | 3001          | https://admin.mito.inbox360.com.br       | HTTPS     |
| MinIO API        | 9000          | https://minio.mito.inbox360.com.br       | HTTPS     |
| MinIO Console    | 9001          | https://minio-console.mito.inbox360.com.br| HTTPS    |
| PostgreSQL       | 5432          | (interno) postgres:5432                  | TCP       |
| Redis            | 6379          | (interno) redis:6379                     | TCP       |
| Traefik          | 80, 443       | (internet)                               | HTTP/HTTPS|

## Volumes Persistentes

```
┌─────────────────────────────────────────┐
│         Volumes Docker                  │
├─────────────────────────────────────────┤
│ mito-postgres-data                      │
│   ├── Tabelas do PostgreSQL             │
│   └── Indices e WAL logs                │
├─────────────────────────────────────────┤
│ mito-redis-data                         │
│   ├── Cache de dados                    │
│   └── Filas de jobs (BullMQ)            │
├─────────────────────────────────────────┤
│ mito-minio-data                         │
│   ├── bucket: mito-media                │
│   │   ├── /videos                       │
│   │   ├── /images                       │
│   │   └── /documents                    │
│   └── Metadados                         │
├─────────────────────────────────────────┤
│ mito-traefik-letsencrypt (se aplicável) │
│   └── acme.json (certificados SSL)      │
└─────────────────────────────────────────┘
```

## Variáveis de Ambiente - Fluxo de Dados

```
.env file
    ↓
docker-compose.yml (substitui ${VARIAVEL})
    ↓
Container environment
    ↓
Application code (process.env.VARIAVEL)
```

### Exemplo:

```
.env:
  DOMAIN=mito.inbox360.com.br
  PG_PASSWORD=senha123

docker-compose.yml:
  api:
    environment:
      PG_HOST: postgres
      PG_PASSWORD: ${PG_PASSWORD}
    labels:
      - "traefik.http.routers.api.rule=Host(`api.${DOMAIN}`)"

Container api:
  Variáveis disponíveis:
    PG_HOST=postgres
    PG_PASSWORD=senha123

Label resolvida:
  traefik.http.routers.api.rule=Host(`api.mito.inbox360.com.br`)
```

## Deploy Workflow via Portainer

```
1. Configuração
   ├── Criar arquivo .env com todas as variáveis
   ├── Configurar DNS (apontar para servidor)
   └── Verificar rede 'automacao' existe

2. Upload no Portainer
   ├── Stacks → Add Stack
   ├── Upload docker-compose.yml
   ├── Colar variáveis do .env
   └── Deploy

3. Inicialização
   ├── Aguardar containers iniciarem
   ├── Inicializar MinIO (criar bucket)
   └── Executar migrações do banco

4. Verificação
   ├── Testar URLs (HTTPS)
   ├── Verificar logs
   └── Testar login no Admin
```

## Conexão com Banco Existente

### Cenário 1: PostgreSQL em outro Container

```
Stack MITO Platform          Stack Database Existente
┌─────────────────┐         ┌──────────────────┐
│ api             │────────▶│  postgres-main   │
│ notifications   │         │  (porta 5432)    │
│ ai-pipeline     │         └──────────────────┘
└─────────────────┘
       |
       └─ PG_HOST=postgres-main
          PG_PORT=5432
```

Ambos devem estar na mesma rede Docker (`automacao`).

### Cenário 2: PostgreSQL em Servidor Externo

```
Stack MITO Platform              Servidor Externo
┌─────────────────┐             ┌──────────────────┐
│ api             │────────────▶│  PostgreSQL      │
│ notifications   │  Internet   │  IP: 10.0.0.50   │
│ ai-pipeline     │             │  Porta: 5432     │
└─────────────────┘             └──────────────────┘
       |
       └─ PG_HOST=10.0.0.50
          PG_PORT=5432
```

Configurar firewall para permitir conexão.

## Segurança em Camadas

```
Layer 1: Firewall
  ├── Porta 80, 443: aberta (Traefik)
  └── Todas outras: fechadas

Layer 2: Traefik
  ├── SSL/TLS (Let's Encrypt)
  ├── Rate limiting
  └── Headers de segurança

Layer 3: Application
  ├── JWT authentication
  ├── CORS configurado
  └── Input validation

Layer 4: Database
  ├── Credenciais fortes
  ├── Acesso apenas via rede interna
  └── Backups automáticos
```

## Monitoramento e Logs

```
Portainer Dashboard
    ↓
Container Logs
    ├── API logs
    ├── Worker logs
    ├── Traefik access logs
    └── Database logs

Stats
    ├── CPU usage
    ├── Memory usage
    ├── Network I/O
    └── Disk I/O
```

## Backup Strategy

```
Backup Diário Automático (Cron)
    ↓
PostgreSQL
    ├── pg_dump → backup.sql
    └── Volume snapshot → backup.tar.gz
    ↓
MinIO
    └── Volume snapshot → minio-backup.tar.gz
    ↓
Armazenamento Externo
    ├── S3 / Cloud Storage
    └── Retention: 7 dias
```

## Escalonamento

### Vertical (Aumentar recursos)

```
Portainer → Container → Resources
    ├── Memory limit: 2GB → 4GB
    └── CPU limit: 2 cores → 4 cores
```

### Horizontal (Mais instâncias)

```
docker-compose up -d --scale notifications=3

Redis Queue
    ↓
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Worker 1 │  │ Worker 2 │  │ Worker 3 │
└──────────┘  └──────────┘  └──────────┘
```

---

## Links Rápidos

- [README Principal](../../README.md)
- [Guia Portainer](PORTAINER.md)
- [Exemplos de Configuração](PORTAINER-EXAMPLE.md)
- [Guia de Produção](PRODUCTION.md)
- [Início Rápido](QUICKSTART.md)

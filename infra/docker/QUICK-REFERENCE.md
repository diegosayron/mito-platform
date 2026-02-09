# MITO Platform - Referência Rápida

## 🚀 Quick Start

### Deploy Rápido (Desenvolvimento Local)

```bash
cd infra/docker
cp .env.example .env
docker compose up -d
# Aguarde ~60 segundos
docker compose exec minio mc alias set local http://localhost:9000 admin password
docker compose exec minio mc mb local/mito-media
docker compose exec api npm run migrate:prod
```

Acesse: https://admin.localhost

### Deploy em Produção com Portainer

```bash
1. Edite docker-compose.yml → networks: external: true, name: automacao
2. Substitua certresolver=letsencrypt → certresolver=letsencryptresolver
3. Configure .env com valores de produção
4. No Portainer: Stacks → Add Stack → Upload docker-compose.yml
5. Cole variáveis do .env
6. Deploy
```

## 📝 Variáveis de Ambiente Essenciais

```bash
# Domínio
DOMAIN=mito.inbox360.com.br
ACME_EMAIL=admin@dominio.com.br

# Database
PG_HOST=postgres
PG_USER=mito_user
PG_PASSWORD=<senha-forte>
PG_DATABASE=mito_db

# Redis
REDIS_PASSWORD=<senha-forte>

# MinIO
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=<senha-forte>

# JWT (gerar: openssl rand -base64 32)
JWT_SECRET=<chave-32-chars>
JWT_REFRESH_SECRET=<chave-32-chars>

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@gmail.com
SMTP_PASSWORD=<senha-app>

# Firebase
FIREBASE_PROJECT_ID=projeto-id
FIREBASE_PRIVATE_KEY=<chave-privada>
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
```

## 🌐 URLs de Acesso

### Produção (mito.inbox360.com.br)

```
API:           https://api.mito.inbox360.com.br
Admin Portal:  https://admin.mito.inbox360.com.br
MinIO Console: https://minio-console.mito.inbox360.com.br
MinIO API:     https://minio.mito.inbox360.com.br
```

### Desenvolvimento (localhost)

```
API:           https://api.localhost
Admin Portal:  https://admin.localhost
MinIO Console: https://minio-console.localhost
Traefik Dash:  http://localhost:8080
```

## 🔧 Comandos Úteis

### Docker Compose

```bash
# Iniciar todos os serviços
docker compose up -d

# Ver status
docker compose ps

# Ver logs
docker compose logs -f
docker compose logs -f api        # apenas API

# Parar tudo
docker compose down

# Parar e remover volumes (⚠️ perde dados)
docker compose down -v

# Reiniciar um serviço
docker compose restart api

# Reconstruir e reiniciar
docker compose up -d --build api

# Escalar workers
docker compose up -d --scale notifications=3
```

### Banco de Dados

```bash
# Executar migrações
docker compose exec api npm run migrate:prod

# Backup
docker compose exec postgres pg_dump -U mito_user mito_db > backup.sql

# Restaurar
cat backup.sql | docker compose exec -T postgres psql -U mito_user mito_db

# Acessar PostgreSQL
docker compose exec postgres psql -U mito_user -d mito_db

# Verificar conexão
docker compose exec postgres pg_isready -U mito_user
```

### MinIO

```bash
# Inicializar bucket
docker compose exec minio mc alias set local http://localhost:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD
docker compose exec minio mc mb local/mito-media
docker compose exec minio mc anonymous set download local/mito-media

# Listar buckets
docker compose exec minio mc ls local/

# Ver status
docker compose exec minio mc admin info local
```

### Redis

```bash
# Testar conexão
docker compose exec redis redis-cli -a $REDIS_PASSWORD ping

# Monitorar comandos
docker compose exec redis redis-cli -a $REDIS_PASSWORD monitor

# Ver info
docker compose exec redis redis-cli -a $REDIS_PASSWORD info
```

### Logs e Debug

```bash
# Logs em tempo real
docker compose logs -f

# Últimas 100 linhas
docker compose logs --tail=100

# Logs desde determinado tempo
docker compose logs --since=10m

# Acessar shell do container
docker compose exec api sh
docker compose exec postgres sh

# Ver variáveis de ambiente
docker compose exec api env

# Testar conectividade entre serviços
docker compose exec api nc -zv postgres 5432
docker compose exec api nc -zv redis 6379
```

## 📱 Build Mobile

### Android

```bash
cd apps/mobile
cp .env.example .env
# Edite .env com API_BASE_URL=https://api.mito.inbox360.com.br/api

npm install
cd android

# Build APK
./gradlew assembleRelease
# APK em: android/app/build/outputs/apk/release/

# Build AAB (Google Play)
./gradlew bundleRelease
# AAB em: android/app/build/outputs/bundle/release/
```

### iOS

```bash
cd apps/mobile
cp .env.example .env
# Edite .env

npm install
cd ios
pod install
cd ..

# Abrir no Xcode
open ios/MitoPlatform.xcworkspace

# No Xcode: Product → Archive
```

## 🔒 Segurança - Checklist

```bash
✓ Alterar todas senhas padrão
✓ JWT secrets com 32+ caracteres
✓ DNS configurado corretamente
✓ Firewall: portas 80, 443 abertas apenas
✓ SMTP configurado
✓ Firebase configurado
✓ MinIO bucket criado
✓ Migrações executadas
✓ SSL/HTTPS funcionando
✓ Backups configurados
```

## 🐛 Troubleshooting

### Certificado SSL não gerado

```bash
# Verificar logs do Traefik
docker compose logs traefik

# Verificar DNS
nslookup api.mito.inbox360.com.br

# Verificar portas abertas (no servidor)
sudo netstat -tulpn | grep -E '80|443'
```

### Erro de conexão com banco

```bash
# Testar PostgreSQL
docker compose exec postgres pg_isready -U mito_user

# Testar da API
docker compose exec api nc -zv postgres 5432

# Ver logs do banco
docker compose logs postgres
```

### Serviços não iniciam

```bash
# Ver status
docker compose ps

# Ver logs
docker compose logs

# Verificar recursos
docker stats

# Reiniciar tudo
docker compose restart
```

### App mobile não conecta

```bash
# Verificar .env do mobile
cat apps/mobile/.env

# Testar API manualmente
curl https://api.mito.inbox360.com.br/health

# Verificar CORS na API
docker compose logs api | grep CORS
```

## 📊 Monitoramento

```bash
# Uso de recursos
docker stats

# Status dos serviços
docker compose ps

# Saúde dos containers
docker inspect mito-api | grep -A 5 Health

# Espaço em disco
df -h
docker system df
```

## 🔄 Atualizações

```bash
# Atualizar código
git pull origin main

# Reconstruir serviços
cd infra/docker
docker compose build

# Aplicar atualizações
docker compose up -d

# Executar migrações (se necessário)
docker compose exec api npm run migrate:prod
```

## 🗄️ Backup e Restore

```bash
# Backup completo
./backup.sh   # Se existir script

# Backup manual do banco
docker compose exec postgres pg_dump -U mito_user mito_db > backup-$(date +%Y%m%d).sql

# Backup de volume
docker run --rm -v mito-postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data

# Restaurar banco
cat backup-20240101.sql | docker compose exec -T postgres psql -U mito_user mito_db
```

## 🔗 Links Rápidos

- [README Principal](../../README.md)
- [Guia Completo Portainer](PORTAINER.md)
- [Exemplos de Configuração](PORTAINER-EXAMPLE.md)
- [Diagramas de Arquitetura](ARCHITECTURE-DIAGRAM.md)
- [Guia de Produção](PRODUCTION.md)
- [Início Rápido](QUICKSTART.md)
- [Rede Docker](NETWORK.md)

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs: `docker compose logs -f`
2. Consulte a documentação específica
3. Verifique issues no GitHub
4. Abra uma issue detalhando o problema

---

**Gerado para MITO Platform - Deploy com Portainer e Traefik**

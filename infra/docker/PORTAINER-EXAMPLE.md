# Exemplo de docker-compose.yml Adaptado para Portainer/Traefik Existente

Este é um exemplo do `docker-compose.yml` modificado para usar com Portainer e Traefik já configurados.

## Principais Modificações

### 1. Usar Rede Existente `automacao`

No final do arquivo, modifique:

```yaml
networks:
  mito-network:
    external: true
    name: automacao
```

### 2. Ajustar Certificate Resolver

Substituir todas as ocorrências de:
```yaml
tls.certresolver=letsencrypt
```

Por:
```yaml
tls.certresolver=letsencryptresolver
```

### 3. Remover Serviço Traefik (Opcional)

Se você já tem Traefik rodando, remova ou comente toda a seção do serviço `traefik:` do arquivo.

### 4. Configurar PostgreSQL Existente (Opcional)

Se você já tem PostgreSQL rodando:

1. Remova ou comente a seção `postgres:`
2. Ajuste o `PG_HOST` nas variáveis de ambiente para apontar para seu container/servidor PostgreSQL

## Exemplo Completo de Modificações

### Antes (Original):

```yaml
# ... serviços ...

networks:
  mito-network:
    name: mito-network
    driver: bridge

volumes:
  traefik-letsencrypt:
    name: mito-traefik-letsencrypt
  # ...
```

### Depois (Adaptado para Portainer):

```yaml
# ... serviços ...

networks:
  mito-network:
    external: true
    name: automacao

volumes:
  # Remover traefik-letsencrypt se Traefik já existe
  postgres-data:
    name: mito-postgres-data
  redis-data:
    name: mito-redis-data
  minio-data:
    name: mito-minio-data
```

## Labels do Traefik - Exemplo de Modificação

### Antes (Original):

```yaml
api:
  # ...
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.api.rule=Host(`api.${DOMAIN:-localhost}`)"
    - "traefik.http.routers.api.entrypoints=websecure"
    - "traefik.http.routers.api.tls.certresolver=letsencrypt"  # ← Mudar aqui
    - "traefik.http.services.api.loadbalancer.server.port=3000"
```

### Depois (Adaptado):

```yaml
api:
  # ...
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.api.rule=Host(`api.${DOMAIN:-localhost}`)"
    - "traefik.http.routers.api.entrypoints=websecure"
    - "traefik.http.routers.api.tls.certresolver=letsencryptresolver"  # ← Alterado
    - "traefik.http.services.api.loadbalancer.server.port=3000"
```

Faça o mesmo para todos os outros serviços (admin-web, minio, minio-console, mobile-build, etc.).

## Script de Modificação Automática

Você pode usar este comando para fazer as alterações automaticamente:

```bash
cd /caminho/para/mito-platform/infra/docker

# Backup do arquivo original
cp docker-compose.yml docker-compose.yml.backup

# Substituir certresolver
sed -i 's/certresolver=letsencrypt/certresolver=letsencryptresolver/g' docker-compose.yml

echo "✅ Modificações aplicadas! Verifique o arquivo docker-compose.yml"
echo "⚠️  Ainda é necessário modificar manualmente a seção 'networks:' no final"
```

## Verificação

Após as modificações, valide o arquivo:

```bash
docker compose config
```

Este comando deve mostrar a configuração compilada sem erros.

## Exemplo de .env para Produção com Portainer

```bash
# Domínio customizado
DOMAIN=mito.inbox360.com.br
ACME_EMAIL=admin@mito.inbox360.com.br

# PostgreSQL (ajuste conforme seu banco existente)
PG_HOST=postgres
PG_USER=mito_user
PG_PASSWORD=SenhaSegura123!@#
PG_DATABASE=mito_db
PG_PORT=5432

# Redis
REDIS_PASSWORD=RedisSeguro456$%^

# MinIO
MINIO_ROOT_USER=mito_admin
MINIO_ROOT_PASSWORD=MinIOSeguro789&*(

# JWT (gere novas chaves!)
JWT_SECRET=chave_jwt_muito_segura_com_32_caracteres_ou_mais
JWT_REFRESH_SECRET=chave_refresh_muito_segura_com_32_caracteres_ou_mais

# SMTP (exemplo com Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notificacoes@mito.inbox360.com.br
SMTP_PASSWORD=senha_de_aplicativo_gmail
SMTP_FROM=MITO Platform <noreply@mito.inbox360.com.br>

# Firebase
FIREBASE_PROJECT_ID=mito-platform-12345
# Note: Obtain the private key from Firebase Console → Project Settings → Service Accounts
# The key should be in the format: -----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIE...sua_chave...vQIDAQAB\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@mito-platform-12345.iam.gserviceaccount.com

# APIs de IA (opcional)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxx
```

## Notas Importantes

1. **Backup**: Sempre faça backup do `docker-compose.yml` original antes de modificar
2. **Validação**: Use `docker compose config` para validar o arquivo após modificações
3. **Segurança**: Nunca versione o arquivo `.env` com senhas reais
4. **Rede**: Certifique-se de que a rede `automacao` existe antes do deploy
5. **DNS**: Configure todos os subdomínios antes de fazer o deploy

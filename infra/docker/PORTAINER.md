# Deploy da MITO Platform com Portainer e Traefik

Este guia detalha como fazer o deploy da MITO Platform usando Portainer com Traefik já configurado.

## 📋 Pré-requisitos

- Portainer instalado e rodando
- Traefik configurado como reverse proxy
- Rede Docker `automacao` criada
- Certificado resolver `letsencryptresolver` configurado no Traefik
- Domínio `mito.inbox360.com.br` configurado
- Banco de dados PostgreSQL (pode ser existente ou usar o do stack)

## 🚀 Passo a Passo

### 1. Preparar o docker-compose.yml

Você tem duas opções:

#### Opção A: Usar a Rede Existente `automacao`

Edite o arquivo `docker-compose.yml` e modifique a seção `networks` no final:

```yaml
networks:
  mito-network:
    external: true
    name: automacao
```

Isso fará com que todos os serviços da MITO Platform sejam adicionados à rede `automacao` existente.

#### Opção B: Criar uma Nova Rede e Conectar ao Traefik

Mantenha a configuração padrão e conecte manualmente a rede ao Traefik depois.

### 2. Ajustar Labels do Traefik

Substitua todas as ocorrências de `certresolver=letsencrypt` por `certresolver=letsencryptresolver` no arquivo `docker-compose.yml`:

```bash
# No diretório infra/docker
sed -i 's/certresolver=letsencrypt/certresolver=letsencryptresolver/g' docker-compose.yml
```

Ou edite manualmente todas as labels que contenham:
```yaml
tls.certresolver=letsencrypt
```
para:
```yaml
tls.certresolver=letsencryptresolver
```

### 3. Configurar Variáveis de Ambiente

Copie e configure o arquivo de ambiente:

```bash
cp .env.example .env
nano .env
```

**Configurações essenciais:**

```bash
# Domínio
DOMAIN=mito.inbox360.com.br
ACME_EMAIL=admin@mito.inbox360.com.br

# PostgreSQL (use seu banco existente ou as credenciais que deseja)
PG_HOST=postgres  # ou o nome/IP do seu PostgreSQL existente
PG_USER=mito_user
PG_PASSWORD=SUA_SENHA_SEGURA_AQUI
PG_DATABASE=mito_db
PG_PORT=5432

# Redis
REDIS_PASSWORD=SENHA_REDIS_SEGURA_16_CHARS

# MinIO
MINIO_ROOT_USER=mito_admin
MINIO_ROOT_PASSWORD=SENHA_MINIO_SEGURA_16_CHARS
MINIO_BUCKET=mito-media

# JWT (gere com: openssl rand -base64 32)
JWT_SECRET=CHAVE_JWT_SEGURA_32_CARACTERES
JWT_REFRESH_SECRET=CHAVE_REFRESH_SEGURA_32_CARACTERES

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=senha-de-aplicativo
SMTP_FROM=MITO Platform <noreply@mito.inbox360.com.br>

# Firebase
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_PRIVATE_KEY=sua-chave-privada
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@projeto.iam.gserviceaccount.com

# APIs de IA (opcional)
OPENAI_API_KEY=sk-sua-chave
GEMINI_API_KEY=sua-chave
```

### 4. Deploy via Portainer

#### Método 1: Upload do docker-compose.yml

1. Acesse seu Portainer
2. Selecione o ambiente (local/edge)
3. Vá em **Stacks** → **Add stack**
4. Configure:
   - **Name**: `mito-platform`
   - **Build method**: Selecione **Upload**
   - Faça upload do arquivo `docker-compose.yml`
5. Em **Environment variables**:
   - Clique em **Advanced mode**
   - Cole o conteúdo do seu arquivo `.env`
6. Clique em **Deploy the stack**

#### Método 2: Git Repository

1. Acesse seu Portainer
2. Selecione o ambiente
3. Vá em **Stacks** → **Add stack**
4. Configure:
   - **Name**: `mito-platform`
   - **Build method**: Selecione **Repository**
   - **Repository URL**: `https://github.com/diegosayron/mito-platform`
   - **Repository reference**: `main`
   - **Compose path**: `infra/docker/docker-compose.yml`
5. Em **Environment variables**, adicione todas as variáveis do `.env`
6. Clique em **Deploy the stack**

#### Método 3: Web Editor

1. Acesse seu Portainer
2. Selecione o ambiente
3. Vá em **Stacks** → **Add stack**
4. Configure:
   - **Name**: `mito-platform`
   - **Build method**: Selecione **Web editor**
5. Cole o conteúdo completo do arquivo `docker-compose.yml`
6. Em **Environment variables**, adicione as variáveis
7. Clique em **Deploy the stack**

### 5. Configurar DNS

Configure os seguintes registros A no seu DNS:

```
api.mito.inbox360.com.br          → IP_DO_SERVIDOR
admin.mito.inbox360.com.br        → IP_DO_SERVIDOR
minio.mito.inbox360.com.br        → IP_DO_SERVIDOR
minio-console.mito.inbox360.com.br → IP_DO_SERVIDOR
```

### 6. Usando PostgreSQL Existente

Se você já tem um PostgreSQL rodando (seja em container ou servidor):

1. **No arquivo `.env`**, configure o host correto:

```bash
PG_HOST=nome-do-container-postgres  # ou IP do servidor
PG_PORT=5432
PG_USER=usuario_existente
PG_PASSWORD=senha_existente
PG_DATABASE=mito_db
```

2. **Remova o serviço PostgreSQL** do `docker-compose.yml`:

Comente ou delete toda a seção `postgres:` do arquivo.

3. **Crie o database** no seu PostgreSQL existente:

```sql
CREATE DATABASE mito_db;
CREATE USER mito_user WITH ENCRYPTED PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE mito_db TO mito_user;
```

### 7. Inicialização Pós-Deploy

Após o deploy, execute os comandos de inicialização:

#### Via Portainer UI:

1. Vá em **Stacks** → `mito-platform`
2. Clique no container `mito-minio`
3. Vá em **Console** e execute:

```bash
mc alias set local http://localhost:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD
mc mb local/mito-media
mc anonymous set download local/mito-media
```

4. Clique no container `mito-api`
5. Vá em **Console** e execute:

```bash
npm run migrate:prod
```

#### Via CLI (se tiver acesso SSH ao servidor):

```bash
cd /caminho/para/mito-platform/infra/docker

# Inicializar MinIO
docker compose exec minio mc alias set local http://localhost:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD
docker compose exec minio mc mb local/mito-media
docker compose exec minio mc anonymous set download local/mito-media

# Executar migrações
docker compose exec api npm run migrate:prod
```

### 8. Verificação

Teste se os serviços estão acessíveis:

```bash
# API
curl https://api.mito.inbox360.com.br/health

# Admin (deve retornar HTML)
curl https://admin.mito.inbox360.com.br

# MinIO Console (deve retornar HTML)
curl https://minio-console.mito.inbox360.com.br
```

No Portainer:
1. Vá em **Stacks** → `mito-platform`
2. Verifique se todos os containers estão **running**
3. Verifique os logs de cada serviço

## 🔧 Configuração do Traefik Existente

Se você já tem Traefik rodando, certifique-se de que ele está configurado corretamente:

### 1. Verificar Configuração do Certificado Resolver

No seu Traefik, verifique se o resolver `letsencryptresolver` está configurado:

```yaml
# traefik.yml ou docker-compose labels
certificatesresolvers:
  letsencryptresolver:
    acme:
      email: seu-email@dominio.com
      storage: /letsencrypt/acme.json
      tlschallenge: true
```

### 2. Verificar Rede

Certifique-se de que o Traefik está conectado à rede `automacao`:

```bash
docker network inspect automacao
```

Você deve ver o container do Traefik listado.

### 3. Remover o Serviço Traefik do docker-compose.yml

Se você já tem Traefik rodando, **remova ou comente** a seção completa do serviço `traefik:` do arquivo `docker-compose.yml` da MITO Platform para evitar conflitos.

## 🐛 Troubleshooting

### Problema: Containers não iniciam

**Solução:**
1. Verifique os logs no Portainer (Stacks → mito-platform → Logs)
2. Verifique se as variáveis de ambiente estão corretas
3. Verifique se não há conflito de portas

### Problema: Certificado SSL não é obtido

**Solução:**
1. Verifique se os domínios apontam para o servidor
2. Verifique se as portas 80 e 443 estão abertas
3. Verifique os logs do Traefik
4. Confirme que o resolver `letsencryptresolver` existe no Traefik

### Problema: Erro de conexão com PostgreSQL

**Solução:**
1. Se usando banco existente, verifique se está na mesma rede Docker
2. Teste conectividade: no container API, execute `nc -zv postgres 5432`
3. Verifique credenciais no `.env`

### Problema: Serviços não aparecem no Traefik

**Solução:**
1. Verifique se os containers estão na rede `automacao`
2. Verifique as labels do Traefik nos containers
3. Reinicie o Traefik: `docker restart nome-container-traefik`

### Problema: MinIO não inicializa o bucket

**Solução:**
Execute os comandos manualmente via console do Portainer ou SSH:

```bash
docker exec -it mito-minio sh
mc alias set local http://localhost:9000 admin_user admin_password
mc mb local/mito-media
mc anonymous set download local/mito-media
exit
```

## 📊 Monitoramento via Portainer

### Visualizar Logs

1. Vá em **Stacks** → `mito-platform`
2. Clique em um container
3. Vá em **Logs**
4. Selecione "Auto-refresh logs" para atualização em tempo real

### Visualizar Estatísticas

1. Vá em **Containers**
2. Selecione um container da MITO Platform
3. Veja CPU, memória, rede e I/O

### Reiniciar Serviços

1. Vá em **Stacks** → `mito-platform`
2. Clique nos 3 pontos ao lado do container
3. Selecione **Restart**

## 🔄 Atualizações

Para atualizar a stack:

1. Vá em **Stacks** → `mito-platform`
2. Clique em **Editor**
3. Faça as alterações necessárias
4. Clique em **Update the stack**
5. Marque "Re-pull images and redeploy" se necessário
6. Clique em **Update**

Ou via Git (se usou método de repository):

1. Faça push das alterações no repositório
2. Vá em **Stacks** → `mito-platform`
3. Clique em **Pull and redeploy**

## 📝 Checklist de Deploy

- [ ] Rede `automacao` existe e Traefik está conectado
- [ ] Certificado resolver `letsencryptresolver` configurado no Traefik
- [ ] DNS configurado (api, admin, minio, minio-console)
- [ ] Arquivo `.env` configurado com valores de produção
- [ ] Labels do Traefik ajustadas (`letsencryptresolver`)
- [ ] Rede no docker-compose.yml ajustada (`automacao`)
- [ ] PostgreSQL configurado (existente ou container)
- [ ] Stack deployado via Portainer
- [ ] MinIO inicializado (bucket criado)
- [ ] Migrações do banco executadas
- [ ] Serviços acessíveis via HTTPS
- [ ] Backups configurados

## 📚 Recursos Adicionais

- [Documentação do Portainer](https://docs.portainer.io/)
- [Documentação do Traefik](https://doc.traefik.io/traefik/)
- [README Principal](../../README.md)
- [Guia de Produção](PRODUCTION.md)

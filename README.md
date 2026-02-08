# MITO Platform
Plataforma multiplataforma (Android, iOS e Web) para curadoria, distribuição e engajamento com conteúdos culturais, históricos, religiosos e filosóficos alinhados a valores tradicionais.

> **Nota:** Este projeto não é um veículo jornalístico. Parte do conteúdo pode ser gerado ou adaptado por sistemas de inteligência artificial a partir de fontes públicas.

---

## 📦 Visão Geral

### O MITO é composto por:
A plataforma MITO é composta por quatro aplicações principais:
Aplicativo Mobile (Android e iOS)
Backend Central (API)
Portal Administrativo Web
Pipeline Automatizado de Conteúdo
Todos os componentes se comunicam por meio de APIs REST autenticadas.
Stack Tecnológica
Mobile: React Native
Admin Web: Next.js
Backend: Node.js + Fastify
Banco de Dados: PostgreSQL
Cache: Redis
Filas: BullMQ
Object Storage: MinIO (compatível com S3)
CDN: Cloudflare
Infraestrutura: Docker + Traefik
Autenticação: JWT + Refresh Token
Push: Firebase
Emails: SMTP configurável


---

## 🧱 Arquitetura
Mobile App / Admin Web
↓
API Gateway (Fastify)
↓
Camada de Serviços
↓
PostgreSQL + Redis
↓
Workers BullMQ
↓
MinIO Object Storage
↓
CDN

## 🗂️ Estrutura do Monorepo
mito-platform/
├── apps/
│ ├── mobile/
│ └── admin-web/
├── services/
│ ├── api/
│ ├── ai-pipeline/
│ └── notifications/
├── packages/
│ ├── shared-types/
│ ├── ui/
│ └── utils/
├── infra/
│ ├── docker/
│ └── traefik/
├── docs/
│ └── MASTER_SPEC.md
└── .env.example

## Funcionalidades Principais
Autenticação e gestão de usuários
Conteúdos (histórias, personagens, grandes obras, vídeos, trechos bíblicos)
Comentários com moderação automática
Stickers e badges
Direitômetro (contador coletivo)
Notificações push e e-mail
Assinaturas com lembretes automáticos
Denúncias de conteúdo e usuários
Campanhas com banners agendados
Portal administrativo completo

## 🚀 Configuração e Deploy

### Requisitos
- Docker Engine 20.10+
- Docker Compose 2.0+
- Portainer (opcional, para gerenciamento visual)
- Traefik como reverse proxy
- Domínio configurado (ex: mito.inbox360.com.br)
- Banco de dados PostgreSQL

### 📝 Configuração de Variáveis de Ambiente

#### 1. Configure o arquivo principal `.env`

Navegue até o diretório de infraestrutura:

```bash
cd infra/docker
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```bash
# ==============================================
# Configurações Gerais
# ==============================================
DOMAIN=mito.inbox360.com.br
ACME_EMAIL=seu-email@dominio.com.br

# ==============================================
# Banco de Dados PostgreSQL
# ==============================================
# Use as credenciais do seu banco existente
PG_HOST=postgres  # Nome do container ou host do banco
PG_USER=seu_usuario_postgres
PG_PASSWORD=sua_senha_segura
PG_DATABASE=mito_db
PG_PORT=5432

# ==============================================
# Redis (Cache e Filas)
# ==============================================
REDIS_PASSWORD=senha_redis_segura_minimo_16_caracteres
REDIS_PORT=6379

# ==============================================
# MinIO (Armazenamento de Arquivos)
# ==============================================
MINIO_ROOT_USER=admin_minio
MINIO_ROOT_PASSWORD=senha_minio_segura_minimo_16_caracteres
MINIO_BUCKET=mito-media

# ==============================================
# JWT (Autenticação)
# ==============================================
# Gere chaves seguras com: openssl rand -base64 32
JWT_SECRET=sua-chave-jwt-minimo-32-caracteres-muito-segura
JWT_REFRESH_SECRET=sua-chave-refresh-minimo-32-caracteres-muito-segura

# ==============================================
# SMTP (Envio de E-mails)
# ==============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=senha-de-aplicativo-gmail
SMTP_FROM=MITO Platform <noreply@mito.inbox360.com.br>

# ==============================================
# Firebase (Notificações Push)
# ==============================================
FIREBASE_PROJECT_ID=seu-projeto-firebase
FIREBASE_PRIVATE_KEY=sua-chave-privada-firebase
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@seu-projeto.iam.gserviceaccount.com

# ==============================================
# APIs de IA (Opcional)
# ==============================================
OPENAI_API_KEY=sk-sua-chave-openai
GEMINI_API_KEY=sua-chave-gemini
```

**🔐 Dicas de Segurança:**
- Gere senhas fortes com pelo menos 16 caracteres
- Use `openssl rand -base64 32` para gerar chaves JWT
- Nunca compartilhe ou versione o arquivo `.env` em produção

#### 2. Configuração do Domínio

Configure os seguintes subdomínios no seu DNS para apontar para o IP do servidor:

```
api.mito.inbox360.com.br          → IP_DO_SERVIDOR
admin.mito.inbox360.com.br        → IP_DO_SERVIDOR
minio.mito.inbox360.com.br        → IP_DO_SERVIDOR
minio-console.mito.inbox360.com.br → IP_DO_SERVIDOR
```

### 🐳 Deploy com Portainer e Traefik

#### Opção 1: Usando Portainer com Rede Existente

**📖 Para instruções completas e detalhadas, veja: [infra/docker/PORTAINER.md](infra/docker/PORTAINER.md)**

Se você já tem Portainer rodando com Traefik na rede `automacao`:

1. **Modifique o docker-compose.yml** para usar sua rede existente:

```bash
cd infra/docker
```

Adicione no final do arquivo `docker-compose.yml`:

```yaml
networks:
  mito-network:
    external: true
    name: automacao
```

2. **Ajuste o Traefik** para usar o certificado `letsencryptresolver`:

No `docker-compose.yml`, nas labels do Traefik, substitua:
```yaml
tls.certresolver=letsencrypt
```
por:
```yaml
tls.certresolver=letsencryptresolver
```

3. **Deploy via Portainer:**

- Acesse seu Portainer
- Vá em **Stacks** → **Add Stack**
- Nome: `mito-platform`
- Build method: **Repository** ou **Upload**
- Cole o conteúdo do `docker-compose.yml`
- Em **Environment variables**, adicione as variáveis do seu `.env`
- Clique em **Deploy the stack**

#### Opção 2: Deploy via Docker Compose (Linha de Comando)

```bash
cd infra/docker

# Inicie todos os serviços
docker compose up -d

# Verifique o status
docker compose ps

# Visualize os logs
docker compose logs -f
```

### 🗄️ Usando Banco de Dados PostgreSQL Existente

Se você já tem um PostgreSQL rodando, você tem duas opções:

#### Opção 1: Usar o banco existente (Recomendado)

No arquivo `.env`, configure:

```bash
PG_HOST=nome-container-postgres  # ou IP do servidor
PG_PORT=5432
PG_USER=seu_usuario
PG_PASSWORD=sua_senha
PG_DATABASE=mito_db
```

E **remova** ou **comente** o serviço `postgres` no `docker-compose.yml`.

#### Opção 2: Usar o PostgreSQL do docker-compose

Se preferir usar o container PostgreSQL do projeto, mantenha as configurações padrão.

### 🔧 Inicialização dos Serviços

Após o deploy, execute os comandos de inicialização:

```bash
# 1. Aguarde os serviços ficarem prontos (30-60 segundos)
sleep 60

# 2. Inicialize o bucket do MinIO
docker compose exec minio mc alias set local http://localhost:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD
docker compose exec minio mc mb local/mito-media
docker compose exec minio mc anonymous set download local/mito-media

# 3. Execute as migrações do banco de dados
docker compose exec api npm run migrate:prod

# 4. Verifique se tudo está funcionando
curl https://api.mito.inbox360.com.br/health
```

### 🌐 Acesso aos Serviços

Após o deploy bem-sucedido:

- **API Backend**: https://api.mito.inbox360.com.br
- **Portal Admin**: https://admin.mito.inbox360.com.br
- **MinIO Console**: https://minio-console.mito.inbox360.com.br
- **MinIO API**: https://minio.mito.inbox360.com.br

### 📱 Build e Publicação do App Mobile (Android/iOS)

#### Android

1. **Configure as variáveis de ambiente do app:**

```bash
cd apps/mobile
cp .env.example .env
```

Edite `.env`:
```bash
API_BASE_URL=https://api.mito.inbox360.com.br/api
CDN_BASE_URL=https://minio.mito.inbox360.com.br
APP_NAME=MITO Platform
```

2. **Instale as dependências:**

```bash
npm install
cd android
./gradlew clean
cd ..
```

3. **Build de Produção (APK):**

```bash
cd android
./gradlew assembleRelease
```

O APK estará em: `android/app/build/outputs/apk/release/app-release.apk`

4. **Build para Google Play (AAB):**

```bash
cd android
./gradlew bundleRelease
```

O AAB estará em: `android/app/build/outputs/bundle/release/app-release.aab`

5. **Configuração de Assinatura:**

Crie o arquivo `android/app/build.gradle` com as credenciais de assinatura ou configure via variáveis de ambiente.

6. **Publicação na Google Play Store:**
   - Acesse [Google Play Console](https://play.google.com/console)
   - Crie um novo app ou selecione existente
   - Faça upload do arquivo `.aab`
   - Preencha as informações do app (descrição, screenshots, etc.)
   - Envie para revisão

#### iOS

1. **Requisitos:**
   - macOS com Xcode instalado
   - Conta Apple Developer

2. **Configure as variáveis de ambiente** (mesmo processo do Android)

3. **Instale as dependências:**

```bash
cd apps/mobile
npm install
cd ios
pod install
cd ..
```

4. **Abra o projeto no Xcode:**

```bash
open ios/MitoPlatform.xcworkspace
```

5. **Configure o Bundle Identifier e Provisioning Profile no Xcode**

6. **Build de Produção:**
   - No Xcode: Product → Archive
   - Após o archive, clique em "Distribute App"
   - Escolha "App Store Connect"

7. **Publicação na App Store:**
   - Acesse [App Store Connect](https://appstoreconnect.apple.com)
   - Crie um novo app
   - Após o upload via Xcode, preencha as informações
   - Envie para revisão

### 💻 Deploy do Portal Administrativo Web

O portal web já é deployado automaticamente via Docker Compose. Acesse:

**https://admin.mito.inbox360.com.br**

Para fazer login, use as credenciais de um usuário administrador criado no banco de dados.

### 🔍 Troubleshooting

#### Problema: Certificado SSL não é gerado

**Solução:**
- Verifique se os domínios apontam corretamente para o servidor
- Confirme que as portas 80 e 443 estão abertas
- Verifique logs do Traefik: `docker compose logs traefik`

#### Problema: Não consigo acessar os serviços

**Solução:**
- Verifique se os containers estão rodando: `docker compose ps`
- Teste a conectividade: `curl http://localhost` (no servidor)
- Verifique os logs: `docker compose logs -f`

#### Problema: Erro de conexão com o banco de dados

**Solução:**
- Verifique as credenciais no `.env`
- Teste a conexão: `docker compose exec api nc -zv postgres 5432`
- Verifique se o PostgreSQL está rodando

#### Problema: App mobile não conecta à API

**Solução:**
- Verifique se `API_BASE_URL` no `.env` do mobile está correto
- Teste a URL da API no navegador
- Verifique se o CORS está configurado corretamente na API

## Execução em Desenvolvimento

Para desenvolvimento local:

```bash
pnpm install
pnpm dev
```

## 🛡️ Segurança e Manutenção

### Backup do Banco de Dados

```bash
# Fazer backup
docker compose exec postgres pg_dump -U seu_usuario mito_db > backup-$(date +%Y%m%d).sql

# Restaurar backup
cat backup-20240101.sql | docker compose exec -T postgres psql -U seu_usuario mito_db
```

### Atualizações

```bash
# Atualizar o código
git pull origin main

# Reconstruir e reiniciar serviços
cd infra/docker
docker compose build
docker compose up -d

# Executar migrações (se necessário)
docker compose exec api npm run migrate:prod
```

### Monitoramento

```bash
# Ver logs em tempo real
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs -f api

# Ver uso de recursos
docker stats

# Ver status dos serviços
docker compose ps
```

### Escalonamento de Workers

```bash
# Aumentar workers de notificação
docker compose up -d --scale notifications=3

# Aumentar workers de pipeline de IA
docker compose up -d --scale ai-pipeline=2
```

## 📚 Documentação Adicional

- **[Infraestrutura Docker](infra/docker/README.md)** - Guia completo da infraestrutura
- **[Guia de Produção](infra/docker/PRODUCTION.md)** - Deploy em produção detalhado
- **[Quick Start](infra/docker/QUICKSTART.md)** - Início rápido
- **[Arquitetura de Rede](infra/docker/NETWORK.md)** - Detalhes da rede Docker
- **[Especificação Master](docs/MASTER_SPEC.md)** - Especificação completa do projeto
- **[API README](services/api/README.md)** - Documentação da API
- **[Mobile README](apps/mobile/README.md)** - Documentação do app mobile
- **[Admin Web README](apps/admin-web/README.md)** - Documentação do portal admin

## 🔗 URLs Importantes

### Produção
- API: https://api.mito.inbox360.com.br
- Portal Admin: https://admin.mito.inbox360.com.br
- MinIO Console: https://minio-console.mito.inbox360.com.br
- MinIO API: https://minio.mito.inbox360.com.br

### Desenvolvimento Local
- API: https://api.localhost
- Portal Admin: https://admin.localhost
- MinIO Console: https://minio-console.localhost
- Traefik Dashboard: http://localhost:8080

## 🆘 Suporte e Recursos

### Comandos Úteis

```bash
# Parar todos os serviços
docker compose down

# Parar e remover volumes (⚠️ Remove todos os dados)
docker compose down -v

# Reiniciar um serviço específico
docker compose restart api

# Ver configuração de um serviço
docker compose config

# Executar comando em um container
docker compose exec api sh
```

### Checklist de Produção

- [ ] Todas as senhas foram alteradas dos valores padrão
- [ ] JWT secrets têm pelo menos 32 caracteres
- [ ] DNS configurado corretamente
- [ ] Portas 80 e 443 abertas no firewall
- [ ] SMTP configurado e testado
- [ ] Firebase configurado (para notificações push)
- [ ] MinIO configurado e bucket criado
- [ ] Migrações de banco executadas
- [ ] Certificados SSL obtidos (Let's Encrypt)
- [ ] Backups automáticos configurados
- [ ] Logs sendo monitorados

## Governança
Todo o desenvolvimento deve seguir:
docs/MASTER_SPEC.md
Este arquivo é a fonte única de verdade do projeto.

## Contribuição
Crie uma branch a partir de main
Desenvolva
Abra um Pull Request
Aguarde revisão


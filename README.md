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

## Configuração de Ambiente
Copie o arquivo de exemplo:
cp .env.example .env

Configure:
Banco de dados
Redis
MinIO
SMTP
Firebase
Domínios
Chaves de API

## Execução em Desenvolvimento
pnpm install
pnpm dev

## Governança
Todo o desenvolvimento deve seguir:
docs/MASTER_SPEC.md
Este arquivo é a fonte única de verdade do projeto.

## Contribuição
Crie uma branch a partir de main
Desenvolva
Abra um Pull Request
Aguarde revisão


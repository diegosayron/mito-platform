# MITO Platform — Documento Técnico Oficial

## 1. Objetivo do Sistema
O MITO é uma plataforma digital multiplataforma (Android, iOS e Web) voltada à curadoria, organização, distribuição e engajamento com conteúdos culturais, históricos, religiosos e filosóficos alinhados a valores tradicionais.
O sistema não é um veículo jornalístico, não se apresenta como fonte oficial de notícias, e parte de seu conteúdo pode ser produzido, adaptado ou resumido por sistemas automatizados de inteligência artificial, sempre a partir de fontes públicas ou licenciadas.
O foco do produto é:
Engajamento contínuo
Conteúdo temático segmentado
Comunidade controlada
Automação de publicação
Escalabilidade

## 2. Visão Geral da Plataforma
A plataforma MITO é composta por quatro aplicações principais:
Aplicativo Mobile (Android/iOS)
Backend Central (API)
Portal Administrativo Web
Pipeline Automatizado de Conteúdo
Esses componentes se comunicam por meio de APIs REST autenticadas.

## 3. Stack			Tecnológica
| Camada         | Tecnologia                |
| -------------- | ------------------------- |
| Mobile         | React Native              |
| Admin Web      | Next.js                   |
| Backend        | Node.js + Fastify         |
| Banco de Dados | PostgreSQL                |
| Cache          | Redis                     |
| Fila de Jobs   | BullMQ                    |
| Object Storage | MinIO (compatível com S3) |
| CDN            | Cloudflare                |
| Infraestrutura | Docker + Traefik          |
| Autenticação   | JWT + Refresh Token       |
| Push           | Firebase                  |
| Emails         | SMTP configurável         |



## 4. Arquitetura Geral
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

## 5. Princípios Arquiteturais
Separação total de responsabilidades
Backend stateless
Conteúdo pesado fora do banco
Cache agressivo
Pipeline desacoplado
Preparado para escala horizontal
Configuração via variáveis de ambiente

## 6. Gestão de Usuários
6.1 Tipos de Usuário
Free
Assinante Ativo
Assinante Expirado
Admin

## 6.2 Funcionalidades
Cadastro por e-mail
Login
Recuperação de senha
Encerramento de conta
Classificação automática
Histórico de ações

## 7. Sistema de Assinaturas
7.1 Dados
user_id
plano
data_compra
data_vencimento
status

7.2 Regras
X dias antes do vencimento: e-mail automático
No vencimento: alerta
Após vencimento: downgrade automático

## 8. Sistema de Conteúdo
8.1 Tipos de Conteúdo
Tipo	Descrição
História	Narrativas e análises históricas
Personagem	Perfis de figuras relevantes
Grande Obra	Livros, discursos, documentos
Vídeo	Clipes e séries
Trecho Bíblico	Versículos com contexto

8.2 Campos Padrão
id
type
title
body
tags
media_id
source
status (draft, scheduled, published, hidden)
publish_at
created_at
updated_at
like_count
comment_count

## 9. Mídia
Armazenamento em MinIO
URLs assinadas
CDN na entrega
Metadados no banco

## 10. Comentários
Texto
Like
Resposta
Denúncia
Auto-bloqueio ao atingir limite
Moderação posterior

## 11. Denúncias
Podem ser feitas para:
Conteúdos
Comentários
Usuários
Limite X para ocultação automática
Registro com motivo
Fila de moderação
Notificação ao denunciante

## 12. Stickers
Packs
Liberação por badge
Download e compartilhamento

## 13. Badges
Concedidos por regras:
Engajamento
Tempo de uso
Assinatura

## 14. Direitômetro
Contador global
Incrementa por conta criada
Compartilhamento externo

## 15. Notificações
Push
Email
Campanhas

## 16. Campanhas
Upload PNG
Link
Agendamento
Barra de avisos no app

## 17. Portal Administrativo
Funcionalidades
CRUD de conteúdos
Upload de mídia
Agendamento
Gestão de usuários
Gestão de assinaturas
Gestão de denúncias (badge +99)
Configuração de mensagens automáticas
Gestão de campanhas
Métricas
Logs de auditoria

## 18. Pipeline Automatizado
Scraping → Limpeza → IA → Classificação → Vídeo → Agendamento → App

## 19. Requisitos Não Funcionais
| Categoria    | Requisito                      |
| ------------ | ------------------------------ |
| Segurança    | JWT, rate limit, logs          |
| Escala       | Docker, volumes, load balancer |
| Performance  | Redis, CDN                     |
| Configuração | via .env                       |
| Offline      | cache local                    |
| Legal        | LGPD, auditoria                |


## 20. Infraestrutura
Todos os serviços em Docker
Banco em container separado
Volumes persistentes
Aplicações stateless

## 21. Governança
Moderação automática com uso de credenciais de api openai, gemini, etc.
Transparência
Auditoria
Logs

## 22. Fonte Única de Verdade
Este documento deve ser seguido por todos os componentes do sistema.

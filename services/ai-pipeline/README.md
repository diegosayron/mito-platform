# AI Pipeline Service

Serviço de pipeline automatizado de conteúdo para a plataforma MITO. Este serviço implementa um fluxo completo de geração de conteúdo usando web scraping, limpeza de dados, IA para resumo, geração de vídeo e agendamento de publicação.

## Visão Geral

O AI Pipeline automatiza o processo de criação de conteúdo através dos seguintes módulos:

```
Scraping → Limpeza → Resumo IA → Geração de Vídeo → Agendamento → Publicação
```

### Módulos

1. **Scraping**: Coleta de conteúdo da internet baseado em consultas
2. **Limpeza**: Remoção de HTML, ads e formatação desnecessária
3. **Resumo IA**: Geração de resumos usando OpenAI/Gemini
4. **Geração de Vídeo**: Criação de vídeos (integração com serviços externos)
5. **Agendamento**: Publicação de conteúdo na API principal

## Tecnologias

- **Node.js** + **TypeScript**
- **Fastify**: Framework web
- **BullMQ**: Gerenciamento de filas
- **Redis**: Backend para BullMQ
- **Puppeteer**: Web scraping dinâmico
- **Cheerio**: Web scraping estático
- **OpenAI**: Geração de resumos com IA
- **Axios**: Cliente HTTP

## Estrutura do Projeto

```
services/ai-pipeline/
├── src/
│   ├── config/          # Configurações e conexões
│   │   ├── index.ts     # Configuração principal
│   │   └── redis.ts     # Conexão Redis
│   ├── modules/         # Módulos de processamento
│   │   ├── scraping/    # Módulo de scraping
│   │   ├── cleaning/    # Módulo de limpeza
│   │   ├── summary/     # Módulo de resumo IA
│   │   ├── video/       # Módulo de geração de vídeo
│   │   └── scheduling/  # Módulo de agendamento
│   ├── workers/         # Workers BullMQ
│   │   ├── scraping.ts
│   │   ├── cleaning.ts
│   │   ├── summary.ts
│   │   ├── video.ts
│   │   └── scheduling.ts
│   ├── queues/          # Definições de filas
│   ├── types/           # Tipos TypeScript
│   ├── server.ts        # Servidor HTTP (API)
│   └── worker.ts        # Processo worker
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Configuração

### Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```bash
# Servidor
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# Redis (obrigatório para BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# IA (configure pelo menos um)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=

# API Principal
MAIN_API_URL=http://localhost:3000
MAIN_API_SECRET=

# Scraping
SCRAPING_MAX_PAGES=10
SCRAPING_TIMEOUT=30000

# Vídeo (opcional)
VIDEO_SERVICE_URL=
VIDEO_SERVICE_API_KEY=
```

### Instalação

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev        # Inicia servidor HTTP
npm run worker     # Inicia workers em modo watch

# Produção
npm run build      # Compila TypeScript
npm start          # Inicia servidor HTTP
node dist/worker.js # Inicia workers
```

## Uso

### Iniciar Pipeline via API

```bash
POST http://localhost:3001/api/v1/pipeline/start
Content-Type: application/json

{
  "query": "História do Brasil Colonial",
  "userId": "admin-user-id",
  "maxPages": 5
}
```

Resposta:
```json
{
  "jobId": "pipeline-1234567890-abc123",
  "status": "started",
  "message": "Pipeline started successfully"
}
```

### Fluxo Automático

Quando você inicia um pipeline:

1. **Job de Scraping** é criado
2. Ao completar, cria automaticamente **Job de Limpeza**
3. Ao completar, cria automaticamente **Job de Resumo IA**
4. Ao completar, cria automaticamente **Job de Geração de Vídeo**
5. Ao completar, cria automaticamente **Job de Agendamento**
6. Conteúdo é publicado na API principal

### Verificar Status

```bash
GET http://localhost:3001/api/v1/pipeline/status/:jobId
```

## Docker

### Build

```bash
docker build -t mito/ai-pipeline .
```

### Run

```bash
docker run -d \
  --name ai-pipeline \
  -p 3001:3001 \
  -e REDIS_HOST=redis \
  -e OPENAI_API_KEY=sk-... \
  -e MAIN_API_URL=http://api:3000 \
  mito/ai-pipeline
```

## Integração com Portal Administrativo

O portal administrativo deve chamar a API do pipeline:

```typescript
// Exemplo de integração
const startPipeline = async (query: string) => {
  const response = await fetch('http://ai-pipeline:3001/api/v1/pipeline/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      userId: currentUser.id,
      maxPages: 5
    })
  });
  
  const data = await response.json();
  return data.jobId;
};
```

## Desenvolvimento

### Adicionar Novo Módulo

1. Criar em `src/modules/novo-modulo/index.ts`
2. Implementar interface de processamento
3. Criar worker em `src/workers/novo-modulo.ts`
4. Adicionar queue em `src/queues/index.ts`
5. Registrar worker em `src/worker.ts`

### Testes

```bash
# Executar testes (quando implementados)
npm test
```

### Lint

```bash
npm run lint
npm run lint:fix
```

## Monitoramento

### Logs

Os workers emitem logs para cada job:
- ✓ Job completado com sucesso
- ✗ Job falhou com erro

### Redis/BullMQ

Use ferramentas como **Bull Board** para monitorar filas:

```bash
npm install @bull-board/api @bull-board/fastify
```

## Limitações e Melhorias Futuras

### Implementado
- ✅ Scraping com Puppeteer e Cheerio
- ✅ Limpeza de conteúdo
- ✅ Resumo com OpenAI
- ✅ Pipeline BullMQ completo
- ✅ API REST para iniciar pipeline

### Placeholder/Futuro
- ⏳ Integração com Gemini AI
- ⏳ Geração de vídeo (requer serviço externo)
- ⏳ Tracking de status de jobs
- ⏳ UI de monitoramento
- ⏳ Webhooks para notificações
- ⏳ Retry policies avançadas

## Troubleshooting

### Puppeteer não funciona no Docker

Verifique que as dependências estão instaladas (já incluídas no Dockerfile):
- chromium
- nss
- freetype

### Redis connection failed

Verifique:
1. Redis está rodando
2. `REDIS_HOST` e `REDIS_PORT` estão corretos
3. Firewall permite conexão

### OpenAI API errors

Verifique:
1. `OPENAI_API_KEY` está configurada
2. Há créditos na conta OpenAI
3. Rate limits não foram excedidos

## Segurança

- ✅ Processo roda como usuário não-root no Docker
- ✅ Rate limiting configurável
- ✅ Validação de inputs
- ✅ Secrets via variáveis de ambiente
- ⚠️ Adicione autenticação JWT nas rotas em produção

## Licença

ISC

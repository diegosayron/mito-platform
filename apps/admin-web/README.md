# MITO Admin Portal

Portal Administrativo da Plataforma MITO construído com Next.js e TypeScript.

## Funcionalidades

- **Autenticação**: Sistema de login com tokens JWT
- **Dashboard**: Visão geral de métricas e estatísticas
- **Conteúdos**: Gerenciamento de conteúdos (história, personagem, grande obra, vídeo, trecho bíblico)
- **Usuários**: Gestão de usuários e assinaturas
- **Denúncias**: Moderação de denúncias com ocultação automática configurável
- **Campanhas**: Criação e agendamento de campanhas (banners)
- **Configurações**: Configuração de mensagens automáticas e parâmetros do sistema

## Tecnologias

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- React 19

## Configuração

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Configure a URL da API:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

3. Instale as dependências:
```bash
npm install
```

## Desenvolvimento

Execute o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Build

Para criar uma build de produção:

```bash
npm run build
npm start
```

## Docker

Para construir a imagem Docker:

```bash
docker build -t mito-admin-web .
```

Para executar o container:

```bash
docker run -p 3001:3001 -e NEXT_PUBLIC_API_URL=http://api:3000 mito-admin-web
```

## Estrutura do Projeto

```
src/
├── app/                    # App Router pages
│   ├── login/             # Página de login
│   ├── dashboard/         # Dashboard principal
│   ├── conteudos/         # Gestão de conteúdos
│   ├── usuarios/          # Gestão de usuários
│   ├── denuncias/         # Gestão de denúncias
│   ├── campanhas/         # Gestão de campanhas
│   └── configuracoes/     # Configurações do sistema
├── components/            # Componentes reutilizáveis
│   ├── Sidebar.tsx       # Menu lateral de navegação
│   └── ProtectedRoute.tsx # HOC para rotas protegidas
├── contexts/              # Contextos React
│   └── auth-context.tsx  # Contexto de autenticação
└── lib/                   # Utilitários
    └── api-client.ts     # Cliente HTTP para API
```

## Autenticação

O sistema usa autenticação baseada em tokens JWT. Os tokens são armazenados no localStorage e enviados no header Authorization de todas as requisições autenticadas.

## Cores e Design

Seguindo as diretrizes do MASTER_SPEC, o design utiliza:
- Verde (patriota): Elementos principais e navegação
- Amarelo: Destaques e ações importantes
- Azul: Informações complementares
- Vermelho: Alertas e ações críticas

Interface moderna e "magnética" inspirada em plataformas como Netflix para listagens de conteúdo.

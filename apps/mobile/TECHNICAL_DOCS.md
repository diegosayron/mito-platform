# MITO Platform Mobile App - Documentação Técnica

## Visão Geral

O aplicativo mobile do MITO Platform foi desenvolvido seguindo rigorosamente as especificações do `docs/MASTER_SPEC.md`. É um aplicativo React Native com TypeScript que oferece uma experiência multiplataforma (Android/iOS) para consumo de conteúdos culturais, históricos, religiosos e filosóficos.

## Arquitetura

### Estrutura de Pastas

```
apps/mobile/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   └── common/         
│   │       └── ContentCard.tsx
│   ├── contexts/            # Context API para estado global
│   │   └── AuthContext.tsx  # Gerenciamento de autenticação
│   ├── hooks/               # Custom hooks (preparado para expansão)
│   ├── navigation/          # Configuração de navegação
│   │   ├── RootNavigator.tsx    # Navegador raiz
│   │   ├── AuthNavigator.tsx    # Stack de autenticação
│   │   └── MainNavigator.tsx    # Tab navigator + Home stack
│   ├── screens/             # Telas do aplicativo
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SignupScreen.tsx
│   │   └── main/
│   │       ├── HomeScreen.tsx
│   │       ├── ContentDetailScreen.tsx
│   │       ├── VideoPlayerScreen.tsx
│   │       ├── CommentsScreen.tsx
│   │       ├── ProfileScreen.tsx
│   │       ├── StickersScreen.tsx
│   │       ├── BadgesScreen.tsx
│   │       └── NotificationsScreen.tsx
│   ├── services/            # Serviços de API
│   │   ├── api.ts          # Cliente HTTP com interceptors
│   │   ├── auth.ts         # Serviços de autenticação
│   │   ├── content.ts      # Serviços de conteúdo
│   │   └── user.ts         # Serviços de usuário
│   ├── theme/               # Sistema de design
│   │   ├── colors.ts       # Paleta de cores patrióticas
│   │   ├── typography.ts   # Tipografia
│   │   ├── spacing.ts      # Espaçamentos e sombras
│   │   └── index.ts        # Exportação unificada
│   ├── types/               # TypeScript types e interfaces
│   │   └── index.ts
│   └── utils/               # Utilitários
│       ├── cache.ts        # Serviço de cache offline
│       └── config.ts       # Configurações da aplicação
├── android/                 # Código nativo Android
├── ios/                     # Código nativo iOS
├── App.tsx                  # Componente raiz
├── Dockerfile               # Container para build
└── .env.example            # Exemplo de variáveis de ambiente
```

## Telas Implementadas

### Autenticação
1. **Login** (`LoginScreen.tsx`)
   - Input de email e senha
   - Validação de campos
   - Loading states
   - Navegação para cadastro

2. **Cadastro** (`SignupScreen.tsx`)
   - Cadastro com email, senha e nome (opcional)
   - Validação de senhas
   - Confirmação de senha

### Principais
3. **Home** (`HomeScreen.tsx`)
   - Layout estilo Netflix com seções horizontais
   - Categorias: Histórias, Personagens, Vídeos, Grandes Obras
   - Pull-to-refresh
   - Cache offline
   - Cards com thumbnails e estatísticas

4. **Detalhes de Conteúdo** (`ContentDetailScreen.tsx`)
   - Visualização completa do conteúdo
   - Tags
   - Sistema de likes
   - Compartilhamento
   - Denúncia
   - Navegação para comentários

5. **Player de Vídeo** (`VideoPlayerScreen.tsx`)
   - Placeholder para integração com react-native-video
   - Navegação para comentários

6. **Comentários** (`CommentsScreen.tsx`)
   - Lista de comentários
   - Adicionar novo comentário
   - Like em comentários
   - Denúncia de comentários
   - Respostas (estrutura preparada)

7. **Perfil** (`ProfileScreen.tsx`)
   - Informações do usuário
   - Avatar com inicial
   - Status de assinatura
   - Menu de navegação
   - Logout

8. **Stickers** (`StickersScreen.tsx`)
   - Listagem de packs
   - Indicação de packs bloqueados/desbloqueados
   - Visualização de stickers do pack

9. **Badges** (`BadgesScreen.tsx`)
   - Listagem de badges
   - Estatísticas (desbloqueados/total)
   - Indicação de status
   - Regras para desbloqueio

10. **Notificações** (`NotificationsScreen.tsx`)
    - Lista de notificações
    - Marcar como lida
    - Marcar todas como lidas
    - Indicadores visuais

## Funcionalidades Implementadas

### Autenticação
- ✅ Login com JWT
- ✅ Signup
- ✅ Logout
- ✅ Refresh token automático
- ✅ Persistência de sessão
- ✅ Context API para estado global

### Cache Offline
- ✅ AsyncStorage para dados persistentes
- ✅ Cache de conteúdos
- ✅ Expiração automática (24h)
- ✅ Invalidação de cache

### Consumo de Conteúdos
- ✅ Listagem por categorias
- ✅ Detalhamento completo
- ✅ Suporte a diferentes tipos (história, personagem, vídeo, etc.)
- ✅ Thumbnails e mídia

### Interação
- ✅ Sistema de likes (conteúdos e comentários)
- ✅ Comentários com respostas
- ✅ Compartilhamento
- ✅ Denúncias (conteúdos, comentários)

### Navegação
- ✅ Bottom tabs (Home, Notificações, Perfil)
- ✅ Stack navigation para fluxos
- ✅ Navegação condicional (autenticado/não autenticado)

## Design System

### Paleta de Cores (Patriótica)

#### Cores Primárias
- **Verde**: `#006633` (escuro), `#004422` (mais escuro), `#008844` (claro)
- **Amarelo**: `#FFB800` (escuro/dourado), `#CC9600` (mais escuro), `#FFD54F` (claro)
- **Azul**: `#003366` (escuro), `#002244` (mais escuro), `#004488` (claro)

#### Cor de Destaque
- **Dourado**: `#FFD700` (principal), `#DAA520` (escuro), `#FFE55C` (claro)

#### Backgrounds
- **Primary**: `#0A0E1A` (muito escuro azul-preto)
- **Secondary**: `#151B2E` (azul-cinza escuro)
- **Card**: `#1A2238` (background de cards)

### Tipografia
- Fonte: System (nativa)
- Tamanhos: xs (12), sm (14), md (16), lg (18), xl (20), xxl (24), xxxl (32)
- Pesos: light (300), regular (400), medium (500), semiBold (600), bold (700)

### Espaçamento
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, xxl: 48px, xxxl: 64px

## Serviços de API

### ApiClient (`services/api.ts`)
- Cliente HTTP baseado em Axios
- Interceptors para autenticação automática
- Refresh token automático
- Tratamento de erros 401

### AuthService (`services/auth.ts`)
- Login
- Signup
- Logout
- Get current user
- Verificação de autenticação

### ContentService (`services/content.ts`)
- Listagem de conteúdos (com paginação e filtros)
- Detalhes de conteúdo
- Like/Unlike conteúdo
- Listagem de comentários
- Adicionar comentário
- Like/Unlike comentário
- Denunciar conteúdo/comentário

### UserService (`services/user.ts`)
- Badges do usuário
- Packs de stickers
- Stickers de um pack
- Notificações (com paginação)
- Marcar notificação como lida
- Marcar todas como lidas

## Variáveis de Ambiente

```env
API_BASE_URL=http://localhost:3000/api
CDN_BASE_URL=http://localhost:9000
APP_NAME=MITO Platform
```

## Segurança

1. **Tokens JWT**: Armazenados no AsyncStorage
2. **Refresh Token**: Implementado automaticamente
3. **HTTPS**: Recomendado para produção
4. **Validação de Inputs**: Em todos os formulários
5. **Sanitização**: Preparada para implementação

## Próximos Passos Sugeridos

1. **Instalação de Dependências**
   ```bash
   cd apps/mobile
   npm install
   ```

2. **Integração com Backend**
   - Configurar URLs da API no `.env`
   - Testar endpoints

3. **Teste em Dispositivos**
   - Android: `npm run android`
   - iOS: `npm run ios`

4. **Melhorias Futuras**
   - Integração com react-native-video para player
   - Push notifications com Firebase
   - Testes unitários e E2E
   - Animações com Reanimated
   - Infinite scroll nas listas
   - Deep linking

## Conformidade com MASTER_SPEC

O projeto foi desenvolvido seguindo rigorosamente o documento `docs/MASTER_SPEC.md`:

✅ Stack tecnológica: React Native  
✅ Autenticação: JWT + Refresh Token  
✅ Cache: Offline com AsyncStorage  
✅ Tipos de conteúdo: História, Personagem, Grande Obra, Vídeo, Trecho Bíblico  
✅ Sistema de comentários com denúncias  
✅ Sistema de likes  
✅ Badges e Stickers  
✅ Notificações  
✅ UI/UX: Netflix-style com cores patrióticas  
✅ Dockerfile incluído  

## Notas de Desenvolvimento

- **TypeScript**: Strict mode habilitado para maior segurança de tipos
- **ESLint**: Configurado com regras do React Native
- **Prettier**: Formatação de código consistente
- **Git**: Ignora node_modules, builds, e arquivos de ambiente
- **Modularização**: Código organizado por feature/domínio
- **Reutilização**: Componentes comuns extraídos
- **Performance**: Cache agressivo, lazy loading preparado

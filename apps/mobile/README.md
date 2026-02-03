# MITO Platform - Mobile App

Aplicativo mobile multiplataforma (Android/iOS) desenvolvido em React Native com TypeScript.

## 📱 Sobre

O aplicativo mobile do MITO Platform oferece uma experiência completa de navegação e consumo de conteúdos culturais, históricos, religiosos e filosóficos, com interface inspirada no Netflix e paleta de cores patrióticas.

## 🎨 Design

- **Layout**: Estilo Netflix com cards horizontais
- **Cores**: 
  - Verde, amarelo e azul em tons escuros
  - Dourado como cor de destaque
- **Tipografia**: Limpa e moderna
- **Animações**: Suaves e responsivas

## 🚀 Funcionalidades

### Telas
- ✅ Login
- ✅ Cadastro
- ✅ Home (feed de conteúdos)
- ✅ Detalhes de conteúdo
- ✅ Player de vídeo
- ✅ Comentários
- ✅ Perfil do usuário
- ✅ Stickers
- ✅ Badges
- ✅ Notificações

### Features
- ✅ Autenticação via API (JWT)
- ✅ Cache offline com AsyncStorage
- ✅ Consumo de conteúdos
- ✅ Sistema de comentários
- ✅ Sistema de likes
- ✅ Denúncias (conteúdos e comentários)
- ✅ Compartilhamento
- ✅ Navegação por tabs
- ✅ Context API para gerenciamento de estado

## 🛠️ Tecnologias

- React Native 0.83
- TypeScript
- React Navigation (Stack + Bottom Tabs)
- Axios (requisições HTTP)
- AsyncStorage (cache offline)
- Context API (estado global)
- React Native Gesture Handler
- React Native Screens

## 📦 Instalação

### Pré-requisitos

- Node.js >= 20
- npm ou yarn
- Android Studio (para Android)
- Xcode (para iOS, apenas no macOS)

### Instalar dependências

```bash
npm install
```

### Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com as configurações corretas:

```env
API_BASE_URL=http://seu-servidor:3000/api
CDN_BASE_URL=http://seu-cdn:9000
```

### Executar em desenvolvimento

#### Android

```bash
npm run android
```

#### iOS (apenas macOS)

```bash
cd ios && pod install && cd ..
npm run ios
```

### Metro Bundler

```bash
npm start
```

## 📁 Estrutura do Projeto

```
apps/mobile/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   │   └── common/      # Componentes comuns (ContentCard, etc.)
│   ├── contexts/        # Context API (AuthContext)
│   ├── hooks/           # Custom hooks
│   ├── navigation/      # Configuração de navegação
│   ├── screens/         # Telas do aplicativo
│   │   ├── auth/        # Telas de autenticação
│   │   └── main/        # Telas principais
│   ├── services/        # Serviços de API
│   ├── theme/           # Tema (cores, tipografia, espaçamento)
│   ├── types/           # TypeScript types/interfaces
│   └── utils/           # Utilitários (cache, config)
├── android/             # Código nativo Android
├── ios/                 # Código nativo iOS
├── App.tsx              # Componente raiz
├── package.json         # Dependências
├── tsconfig.json        # Configuração TypeScript
└── Dockerfile           # Docker para build
```

## 🔧 Configuração

### Babel

O projeto usa `react-native-dotenv` para variáveis de ambiente.

### TypeScript

Configurado para strict mode com paths absolutos.

## 📝 Scripts disponíveis

```bash
npm run android      # Roda no Android
npm run ios          # Roda no iOS
npm start            # Inicia Metro Bundler
npm test             # Executa testes
npm run lint         # Executa linter
```

## 🔒 Segurança

- Tokens JWT armazenados de forma segura no AsyncStorage
- Refresh token automático
- Sanitização de inputs
- Validação de dados

## 📄 Licença

Este projeto faz parte da MITO Platform.

## 🤝 Contribuição

Siga as diretrizes do `docs/MASTER_SPEC.md` para qualquer modificação.

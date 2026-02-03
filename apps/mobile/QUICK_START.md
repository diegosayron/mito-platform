# MITO Platform Mobile - Quick Start Guide

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (>= 20)
- **npm** or **yarn**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **CocoaPods** (for iOS dependencies, macOS only)

### Installation Steps

1. **Navigate to the mobile app directory:**
   ```bash
   cd apps/mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your API endpoints:
   ```env
   API_BASE_URL=http://localhost:3000/api
   CDN_BASE_URL=http://localhost:9000
   ```

4. **Install iOS dependencies (macOS only):**
   ```bash
   cd ios
   pod install
   cd ..
   ```

### Running the App

#### Start Metro Bundler
In one terminal:
```bash
npm start
```

#### Run on Android
In another terminal:
```bash
npm run android
```

#### Run on iOS (macOS only)
In another terminal:
```bash
npm run ios
```

### Development Tips

#### Hot Reload
- Press `r` in Metro Bundler to reload
- Press `d` to open developer menu
- Shake device to open developer menu on physical device

#### Debugging
- Use React Native Debugger or Flipper
- Chrome DevTools can be used for basic debugging

#### Clear Cache
If you encounter issues:
```bash
npm start -- --reset-cache
```

#### Clean Build (Android)
```bash
cd android
./gradlew clean
cd ..
```

#### Clean Build (iOS)
```bash
cd ios
rm -rf Pods
pod install
cd ..
```

## 📁 Project Structure Overview

```
src/
├── components/     # Reusable UI components
├── contexts/       # React Context for global state
├── navigation/     # Navigation configuration
├── screens/        # Application screens
├── services/       # API and business logic
├── theme/          # Design system (colors, typography)
├── types/          # TypeScript definitions
└── utils/          # Helper functions
```

## 🎨 Key Features

- **Authentication:** Login and signup with JWT
- **Home Feed:** Netflix-style content browsing
- **Content:** View, like, share, and comment
- **Profile:** User settings and preferences
- **Badges & Stickers:** Gamification features
- **Notifications:** Push and in-app notifications

## 🔧 Common Issues

### Metro Bundler won't start
```bash
npm start -- --reset-cache
```

### Android build fails
```bash
cd android && ./gradlew clean && cd ..
npm run android
```

### iOS build fails
```bash
cd ios && pod install && cd ..
npm run ios
```

### "Unable to resolve module"
```bash
npm install
npm start -- --reset-cache
```

## 📚 Next Steps

1. **Configure Backend:** Update `.env` with your API URL
2. **Test Authentication:** Try login/signup flows
3. **Customize Theme:** Edit `src/theme/colors.ts` if needed
4. **Add Features:** Follow the modular structure to add new screens/features

## 🤝 Contributing

Follow the guidelines in `docs/MASTER_SPEC.md` for any modifications.

## 📖 Documentation

- **README.md** - General information
- **TECHNICAL_DOCS.md** - Detailed technical documentation
- **docs/MASTER_SPEC.md** - System specifications

## 🆘 Help

If you encounter issues:
1. Check the error message carefully
2. Clear cache and rebuild
3. Ensure all dependencies are installed
4. Refer to React Native documentation
5. Check the TECHNICAL_DOCS.md for architecture details

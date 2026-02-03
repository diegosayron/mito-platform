# Dockerfile for MITO Platform Mobile App Build
# This Dockerfile is used to build the React Native app for Android/iOS

FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    bash \
    openjdk17-jdk \
    android-tools

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy app source
COPY . .

# Build Android APK (requires Android SDK to be properly configured)
# This is a placeholder - actual build would require full Android SDK setup
FROM base AS android-build
RUN echo "Android build environment ready"
# RUN cd android && ./gradlew assembleRelease

# Build iOS (requires macOS and Xcode)
FROM base AS ios-build
RUN echo "iOS build requires macOS environment"

# Development image
FROM base AS development
EXPOSE 8081
CMD ["npm", "start"]

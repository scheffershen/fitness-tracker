# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VibeCoded is an Expo React Native application built with:
- **Expo Router** for file-based navigation (v5.1.6)
- **NativeWind** for Tailwind CSS styling in React Native
- **Zustand** for state management
- **TypeScript** with strict mode enabled
- **ESLint** and **Prettier** for code quality

## Development Commands

### Starting the Application
- `npm start` - Start the Expo development server
- `npm run android` - Start on Android device/emulator
- `npm run ios` - Start on iOS device/simulator
- `npm run web` - Start web version

### Code Quality
- `npm run lint` - Run ESLint and Prettier checks
- `npm run format` - Auto-fix ESLint issues and format code with Prettier

### Building
- `npm run prebuild` - Generate native code for platforms

## Project Structure

### App Directory (`app/`)
Uses Expo Router file-based routing:
- `_layout.tsx` - Root layout component that wraps all screens
- `index.tsx` - Home screen (matches `/` route)
- `details.tsx` - Details screen
- `+html.tsx` - Custom HTML for web builds
- `+not-found.tsx` - 404 error page

### Components (`components/`)
Reusable UI components:
- `Button.tsx` - Custom button component
- `Container.tsx` - Layout container
- `ScreenContent.tsx` - Screen content wrapper
- `EditScreenInfo.tsx` - Development info component

### State Management (`store/`)
- `store.ts` - Zustand store with example bear state (replace with actual app state)

### Configuration Files
- `tailwind.config.js` - TailwindCSS configuration with NativeWind preset
- `tsconfig.json` - TypeScript config with path mapping (`~/*` → root)
- `babel.config.js` - Babel configuration for Expo
- `metro.config.js` - Metro bundler configuration

## Key Architecture Patterns

### Routing
File-based routing with Expo Router. Use `expo-router` Link component for navigation between screens.

### Styling
NativeWind for styling - write Tailwind classes that work across platforms. Global styles in `global.css`.

### State Management
Zustand store pattern with TypeScript interfaces. Current example store (`BearState`) should be replaced with actual application state.

### TypeScript Paths
Use `~/` prefix for imports from project root (configured in tsconfig.json).

## Platform Support
- iOS (supports tablets)
- Android (adaptive icons configured)
- Web (Metro bundler, static output)

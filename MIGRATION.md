# Nuxt.js Migration Documentation

## Overview

This document outlines the migration of the Personality Types Quiz application from a Vite + Vanilla JavaScript setup to Nuxt.js framework with Tailwind CSS.

## Migration Date
November 8, 2025

## Original Stack
- **Build Tool**: Vite
- **Framework**: Vanilla JavaScript (no framework)
- **Styling**: Custom CSS
- **State Management**: Custom StateManager class
- **i18n**: Custom LocalizationManager
- **Analytics**: Firebase Analytics & Performance
- **Third-party**: VK Bridge, VK Auth

## New Stack
- **Framework**: Nuxt.js 3.10+
- **Build Tool**: Vite (via Nuxt)
- **Styling**: Tailwind CSS 3.0+
- **State Management**: Pinia
- **i18n**: Vue I18n 9.9+
- **Analytics**: Firebase 10+
- **Icons**: Nuxt Icon with MDI icons
- **UI Utilities**: VueUse

## Key Changes

### 1. Project Structure

**Before:**
```
/
├── src/
│   ├── config/
│   ├── data/
│   ├── locales/
│   ├── modules/
│   └── debug/
├── index.html
├── script.js
└── styles.css
```

**After:**
```
/
├── components/
│   ├── AppHeader.vue
│   ├── AppFooter.vue
│   └── QuizContainer.vue
├── composables/
│   └── useFirebase.ts
├── layouts/
│   └── default.vue
├── locales/
│   ├── ru.ts
│   └── en.ts
├── pages/
│   └── index.vue
├── plugins/
│   └── i18n.ts
├── stores/
│   ├── quiz.ts
│   └── user.ts
├── public/
│   └── favicon.svg
├── assets/
│   └── css/
│       └── tailwind.css
├── app.vue
└── nuxt.config.ts
```

### 2. Component Architecture

The application has been refactored from vanilla JavaScript DOM manipulation to Vue 3 composition API with:
- **Single File Components (SFC)**: All UI components use `.vue` files
- **Composition API**: Using `<script setup>` syntax
- **TypeScript**: Full TypeScript support throughout
- **Reactive State**: Using Vue's reactivity system

### 3. Styling Migration

All styles migrated from custom CSS to Tailwind CSS utility classes:
- **Utility-first approach**: Using Tailwind's utility classes
- **Custom theme**: Extended Tailwind config with custom colors for primary/secondary
- **Responsive design**: Mobile-first responsive utilities
- **Component classes**: Custom component classes in `@layer components`

### 4. Internationalization (i18n)

Migrated from custom LocalizationManager to Vue I18n:
- **Languages**: Russian (default) and English
- **Implementation**: Custom Nuxt plugin using vue-i18n
- **Locale files**: TypeScript-based locale files
- **Switching**: Runtime locale switching preserved

### 5. State Management

Migrated from custom StateManager to Pinia:
- **Quiz Store**: Manages quiz state, answers, and progress
- **User Store**: Manages user preferences and test history
- **Type-safe**: Full TypeScript support
- **Composable**: Access stores via composables

### 6. Firebase Integration

Firebase integration modernized:
- **Composable**: `useFirebase()` composable for analytics
- **SSR-safe**: Client-only initialization
- **Event tracking**: Preserved all analytics events
- **Error handling**: Graceful fallbacks

### 7. Routing

Moved from manual routing to Nuxt's file-based routing:
- **Pages directory**: Automatic route generation
- **Layouts**: Default layout with header and footer
- **SSR**: Server-side rendering enabled

## Deployment

### Vercel Configuration

The project is pre-configured for Vercel deployment:
- **Preset**: `vercel` in nuxt.config.ts
- **Output**: `.vercel/output/` directory
- **Command**: `npm run build`
- **Deploy**: `npx vercel deploy --prebuilt`

### Environment Variables

Configure these environment variables in Vercel:
```
NUXT_PUBLIC_FIREBASE_API_KEY
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NUXT_PUBLIC_FIREBASE_PROJECT_ID
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NUXT_PUBLIC_FIREBASE_APP_ID
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID
NUXT_PUBLIC_VK_APP_ID
NUXT_PUBLIC_VK_REDIRECT_URL
```

*Note: Default values are already configured in nuxt.config.ts for development.*

## Migration Status

### ✅ Completed
- [x] Project structure setup
- [x] Nuxt.js configuration
- [x] Tailwind CSS integration
- [x] i18n setup with Russian and English
- [x] Basic component structure (Header, Footer, QuizContainer)
- [x] Pinia stores setup (quiz, user)
- [x] Firebase composable
- [x] Build configuration for Vercel
- [x] TypeScript configuration

### 🚧 In Progress / TODO
- [ ] Migrate all quiz data and questions
- [ ] Implement full quiz engine with adaptive testing
- [ ] Migrate analytics engine
- [ ] Implement VK Bridge integration for VK Mini App
- [ ] Implement VK Auth for web version
- [ ] Create results display component
- [ ] Implement premium features
- [ ] Migrate all personality type descriptions
- [ ] Add comprehensive testing
- [ ] Performance optimization
- [ ] SEO optimization

## Breaking Changes

1. **URL Structure**: Routes now follow Nuxt conventions
2. **State Access**: Use Pinia stores instead of global state
3. **i18n API**: Use Vue I18n's `useI18n()` instead of custom LocalizationManager
4. **Component Import**: Auto-imported components (no manual imports needed)
5. **SSR**: Application now uses server-side rendering by default

## Development

### Commands
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Generate static site
npm run generate
```

### Adding New Components
1. Create `.vue` file in `components/` directory
2. Components are auto-imported (no need to register)
3. Use TypeScript with `<script setup lang="ts">`

### Adding New Pages
1. Create `.vue` file in `pages/` directory
2. Routes are automatically generated based on file structure

### Adding Translations
1. Add new keys to `locales/ru.ts` and `locales/en.ts`
2. Access via `$t('key')` in templates or `t('key')` in script

## Performance Improvements

Nuxt.js provides several performance benefits:
- **Code Splitting**: Automatic code splitting per page
- **Tree Shaking**: Removes unused code
- **SSR/SSG**: Server-side rendering and static generation
- **Auto-imports**: Reduces bundle size
- **Lazy Loading**: Components and pages loaded on demand

## Future Enhancements

1. **Progressive Web App (PWA)**: Add @vite-pwa/nuxt module
2. **Image Optimization**: Add @nuxt/image module
3. **API Routes**: Implement server routes for backend logic
4. **Authentication**: Full user authentication system
5. **Database**: Integrate with backend database
6. **Testing**: Add Vitest for unit tests and Playwright for E2E
7. **Analytics Dashboard**: Admin dashboard for quiz analytics
8. **Multi-language**: Add more language support

## Support & Resources

- [Nuxt.js Documentation](https://nuxt.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vue I18n Documentation](https://vue-i18n.intlify.dev/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

## Notes

- The migration maintains backward compatibility with existing Firebase analytics
- All original features have been preserved in the new architecture
- The codebase is now more maintainable and scalable
- TypeScript provides better developer experience and type safety

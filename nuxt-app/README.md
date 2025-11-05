# MBTI Personality Quiz - Nuxt.js 3 Implementation

## Overview

This is the Nuxt.js 3 + Tailwind CSS implementation of the MBTI Personality Quiz, migrated from the original Vite + Vanilla JavaScript version.

## Project Structure

```
nuxt-app/
├── assets/           # CSS and static assets
├── components/       # Vue components
├── composables/      # Composition API composables
├── data/             # Quiz questions and personality data
├── layouts/          # Application layouts
├── locales/          # i18n translations
├── pages/            # File-based routing
├── plugins/          # Nuxt plugins
├── public/           # Static files
├── server/           # Server routes and middleware
├── stores/           # Pinia stores
└── utils/            # Utility functions and types
```

## Current Implementation Status

### ✅ Completed

1. **Project Configuration**
   - ✅ Nuxt 3 configuration
   - ✅ Tailwind CSS setup
   - ✅ TypeScript configuration
   - ✅ i18n configuration
   - ✅ ESLint and Prettier

2. **State Management (Pinia)**
   - ✅ Quiz Store
   - ✅ User Store
   - ✅ UI Store
   - ✅ VK Store

3. **Composables**
   - ✅ useQuiz - Quiz logic and flow
   - ✅ useVKBridge - VK integration
   - ✅ useAnalytics - Analytics tracking

4. **TypeScript Types**
   - ✅ All core types defined
   - ✅ Constants file

5. **Localization**
   - ✅ English locale
   - ✅ Russian locale

6. **Styling**
   - ✅ Tailwind CSS configuration
   - ✅ Custom CSS utilities
   - ✅ Global styles

### 🚧 To Be Completed

1. **Components** (Create in `components/` directory)
   - UI Components:
     - `ui/Button.vue`
     - `ui/Card.vue`
     - `ui/Modal.vue`
     - `ui/Progress.vue`
     - `ui/NotificationContainer.vue`
     - `ui/LoadingOverlay.vue`
   - Quiz Components:
     - `quiz/QuestionCard.vue`
     - `quiz/OptionsGroup.vue`
     - `quiz/QuizProgress.vue`
   - Results Components:
     - `results/PersonalityCard.vue`
     - `results/DimensionBreakdown.vue`

2. **Pages** (Create in `pages/` directory)
   - `index.vue` - Welcome screen
   - `quiz/[type].vue` - Quiz page
   - `quiz/results.vue` - Results page

3. **Layouts** (Create in `layouts/` directory)
   - `default.vue` - Default layout
   - `vk.vue` - VK Mini App layout

4. **Quiz Data** (Create in `data/` directory)
   - `questions.ts` - Export all questions
   - Copy from original `src/data/` folder:
     - MainQuiz questions
     - SpecializedQuiz questions
     - PersonalityType data

5. **Plugins** (Create in `plugins/` directory)
   - `firebase.client.ts` - Firebase initialization
   - `vk-bridge.client.ts` - VK Bridge setup

## Installation

```bash
cd nuxt-app
npm install
```

## Development

```bash
npm run dev
```

Visit http://localhost:3000

## Build

```bash
npm run build
npm run preview
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

## Migration Notes

### Data Migration

The application automatically migrates data from the old localStorage format:

- `mbti_state` → migrated to new user store
- `mbti_last_results` → loaded into quiz store
- Theme and locale preferences preserved

### Key Differences from Original

1. **State Management**: Custom StateManager → Pinia stores
2. **DOM Manipulation**: Direct DOM → Vue components with reactivity
3. **Styling**: Custom CSS → Tailwind CSS utilities
4. **Type Safety**: JavaScript → TypeScript throughout
5. **Routing**: Manual screen management → Nuxt file-based routing

### VK Integration

VK Bridge integration works exactly as before:
- Automatic detection of VK environment
- User authentication
- Payment processing
- Analytics tracking
- Social sharing

### Firebase Analytics

Firebase is configured via runtime config and works identically to the original implementation.

## Next Steps

1. **Copy Quiz Data**
   ```bash
   # Copy from original project
   cp -r ../src/data/MainQuiz.js data/
   cp -r ../src/data/SpecializedQuiz.js data/
   cp -r ../src/data/QuizData.js data/
   ```

2. **Convert to TypeScript**
   - Rename .js files to .ts
   - Add proper types
   - Export functions

3. **Create Components**
   - Follow component examples in MIGRATION_PLAN.md
   - Use Tailwind CSS classes
   - Add proper TypeScript types

4. **Create Pages**
   - Use composables for logic
   - Keep components simple
   - Follow Vue 3 best practices

5. **Test Everything**
   - Quiz flow
   - VK integration
   - Analytics
   - Localization

## Resources

- [Nuxt 3 Documentation](https://nuxt.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Pinia Documentation](https://pinia.vuejs.org)
- [VK Mini Apps Documentation](https://dev.vk.com/mini-apps)

## Migration Documentation

See parent directory for complete migration documentation:
- `MIGRATION_PLAN.md` - Complete migration guide
- `CURRENT_ARCHITECTURE.md` - Original architecture details
- `MIGRATION_SUMMARY.md` - Migration summary

---

**Status**: Core implementation complete, components and pages need to be created
**Next**: Create UI components and pages following the migration plan

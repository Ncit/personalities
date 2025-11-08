# Personality Types Quiz - Nuxt.js Edition

A comprehensive personality assessment platform built with Nuxt.js, featuring the Myers-Briggs Type Indicator (MBTI) and multiple specialized personality quizzes.

## Features

- **16 Personality Types**: Complete MBTI personality assessment
- **Multilingual Support**: Russian and English languages
- **Modern UI**: Built with Tailwind CSS
- **Responsive Design**: Mobile-first approach
- **Firebase Analytics**: Track user engagement and quiz completion
- **VK Integration**: Support for VK Mini App and VK Auth
- **State Management**: Pinia for robust state handling
- **TypeScript**: Full type safety throughout the application
- **SSR/SSG**: Server-side rendering and static generation support

## Tech Stack

- **Framework**: [Nuxt.js 3](https://nuxt.com/) - Vue framework with SSR
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **State Management**: [Pinia](https://pinia.vuejs.org/) - Vue store
- **i18n**: [Vue I18n](https://vue-i18n.intlify.dev/) - Internationalization
- **Analytics**: [Firebase](https://firebase.google.com/) - Analytics & Performance
- **Icons**: [Nuxt Icon](https://github.com/nuxt-modules/icon) - Icon component
- **Utilities**: [VueUse](https://vueuse.org/) - Vue composition utilities
- **TypeScript**: Full TypeScript support

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd personalities

# Install dependencies
npm install
```

### Development

```bash
# Start development server at http://localhost:3000
npm run dev
```

### Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Generate static site
npm run generate
```

## Project Structure

```
personalities/
├── assets/          # Static assets (CSS, images)
├── components/      # Vue components
├── composables/     # Vue composables
├── layouts/         # Nuxt layouts
├── locales/         # i18n translations
├── pages/           # Application pages (auto-routed)
├── plugins/         # Nuxt plugins
├── public/          # Public static files
├── stores/          # Pinia stores
├── app.vue          # Root component
├── nuxt.config.ts   # Nuxt configuration
├── tailwind.config.js # Tailwind configuration
└── tsconfig.json    # TypeScript configuration
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
NUXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NUXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# VK Configuration
NUXT_PUBLIC_VK_APP_ID=your_vk_app_id
NUXT_PUBLIC_VK_REDIRECT_URL=your_redirect_url
```

### Tailwind CSS

The project uses a custom Tailwind configuration with extended colors and utilities. Modify `tailwind.config.js` to customize the theme.

### i18n

Add new translations in `locales/ru.ts` and `locales/en.ts`. The application defaults to Russian with English as an alternative.

## Components

### Main Components

- **AppHeader**: Application header with language switcher and navigation
- **AppFooter**: Application footer with copyright information
- **QuizContainer**: Main quiz interface container

### Composables

- **useFirebase**: Firebase analytics integration

### Stores

- **quiz**: Manages quiz state, answers, and progress
- **user**: Manages user preferences and test history

## Deployment

### Vercel (Recommended)

The project is pre-configured for Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your repository to Vercel for automatic deployments.

### Other Platforms

The application can be deployed to any platform supporting Node.js:

```bash
# Build the application
npm run build

# The output will be in .output/ directory
```

## Development Guidelines

### Adding New Pages

Create a new file in the `pages/` directory:

```vue
<!-- pages/about.vue -->
<template>
  <div>
    <h1>About Page</h1>
  </div>
</template>

<script setup lang="ts">
// Page logic here
</script>
```

### Adding New Components

Create a new file in the `components/` directory:

```vue
<!-- components/MyComponent.vue -->
<template>
  <div class="my-component">
    <!-- Component template -->
  </div>
</template>

<script setup lang="ts">
// Component logic here
</script>
```

Components are auto-imported in Nuxt.js - no need to manually import them.

### Using Tailwind CSS

Apply utility classes directly in your templates:

```vue
<div class="bg-blue-500 text-white p-4 rounded-lg shadow-md">
  Styled with Tailwind
</div>
```

### State Management

Access stores using composables:

```typescript
const quizStore = useQuizStore()
quizStore.startQuiz('mbti')
```

### Translations

Use the `$t` function in templates:

```vue
<template>
  <h1>{{ $t('ui.welcomeTitle') }}</h1>
</template>

<script setup lang="ts">
const { t } = useI18n()
console.log(t('ui.welcomeTitle'))
</script>
```

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Analytics and Performance Monitoring
3. Copy your configuration to `.env` file
4. The `useFirebase` composable will handle initialization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Lighthouse Score: 95+ (target)
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please use the GitHub issues tracker.

## Acknowledgments

- Myers-Briggs Type Indicator® and MBTI® are trademarks of the Myers & Briggs Foundation
- Icon set from Material Design Icons
- Powered by Nuxt.js and Vue.js communities

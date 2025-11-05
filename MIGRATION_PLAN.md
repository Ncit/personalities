# MBTI Personality Quiz - Nuxt.js + Tailwind CSS Migration Plan

## Executive Summary

This document outlines the comprehensive migration plan for transitioning the MBTI Personality Quiz application from a Vite + Vanilla JavaScript architecture to a modern Nuxt.js 3 + Tailwind CSS stack.

**Migration Timeline**: 4-6 weeks
**Complexity Level**: High
**Risk Level**: Medium

---

## Table of Contents

1. [Current Architecture Analysis](#current-architecture-analysis)
2. [Target Architecture](#target-architecture)
3. [Class Diagrams & Schemas](#class-diagrams--schemas)
4. [API & Integration Documentation](#api--integration-documentation)
5. [Migration Strategy](#migration-strategy)
6. [Implementation Plan](#implementation-plan)
7. [Testing Strategy](#testing-strategy)
8. [Rollback Plan](#rollback-plan)

---

## 1. Current Architecture Analysis

### 1.1 Technology Stack

**Current Stack:**
- **Framework**: Vanilla JavaScript (ES6 Modules)
- **Build Tool**: Vite 7.0.5
- **Styling**: Custom CSS with CSS Variables
- **State Management**: Custom StateManager (Observer Pattern)
- **PDF Generation**: jsPDF 3.0.1
- **Analytics**: Firebase Analytics & Performance
- **Social Integration**: VK Mini Apps (VKontakte)
- **Localization**: Custom LocalizationManager (en/ru)

**Dependencies:**
```json
{
  "dependencies": {
    "jspdf": "^3.0.1"
  },
  "devDependencies": {
    "vite": "^7.0.5",
    "@vitejs/plugin-legacy": "^7.0.1",
    "typescript": "^5.1.6"
  }
}
```

### 1.2 Project Structure

```
personalities/
├── src/
│   ├── modules/
│   │   ├── core/                    # Core functionality
│   │   │   ├── StateManager.js      # State management (Observer pattern)
│   │   │   └── LoggerManager.js     # Logging system
│   │   ├── quiz/                    # Quiz engine
│   │   │   └── QuizEngine.js        # Quiz logic, scoring, adaptive features
│   │   ├── ui/                      # UI management
│   │   │   └── UIManager.js         # DOM manipulation, screen transitions
│   │   ├── analytics/               # Analytics
│   │   │   └── AnalyticsEngine.js   # Charts, visualizations
│   │   ├── adaptive/                # Adaptive assessment AI
│   │   │   ├── AdaptiveEngine.js    # Main adaptive engine
│   │   │   ├── AccuracyPredictor.js # Confidence prediction
│   │   │   ├── PersonalizationEngine.js # User personalization
│   │   │   └── QuestionSelector.js  # Smart question selection
│   │   └── vk/                      # VK integration
│   │       ├── VKBridgeManager.js   # VK bridge orchestrator
│   │       ├── services/
│   │       │   ├── VKUserService.js # User management
│   │       │   ├── VKPaymentService.js # Payment processing
│   │       │   └── VKAnalyticsService.js # VK analytics
│   │       └── config/VKConfig.js   # VK configuration
│   ├── data/                        # Quiz data
│   │   ├── MainQuiz.js / .ru.js    # Main MBTI questions
│   │   ├── SpecializedQuiz.js / .ru.js # Specialized quizzes
│   │   └── QuizData.js / .ru.js    # Quiz metadata & personality types
│   ├── locales/                     # i18n
│   │   ├── LocalizationManager.js   # Localization engine
│   │   ├── en.js                    # English translations
│   │   └── ru.js                    # Russian translations
│   └── config/
│       └── firebase.js              # Firebase configuration
├── index.html                       # Main HTML entry
├── styles.css                       # Global styles (2000+ lines)
├── vite.config.js                   # Vite configuration
└── package.json                     # Dependencies
```

### 1.3 Key Features

1. **MBTI Assessment**
   - 20 questions (free tier)
   - 60 questions (premium tier)
   - Adaptive question selection based on confidence scores
   - Real-time progress tracking

2. **Specialized Assessments** (15 types)
   - Leadership Style
   - Communication Style
   - Stress Response
   - Learning Style
   - Relationship Dynamics
   - Creativity & Innovation
   - Decision Making
   - Team Collaboration
   - Career Preferences
   - Conflict Resolution
   - Motivation & Drive
   - Adaptability & Change
   - Emotional Intelligence
   - Productivity Style
   - Social Interaction

3. **Adaptive Engine**
   - AI-powered question selection
   - Confidence-based early termination
   - User behavior tracking
   - Personalization engine
   - Performance metrics

4. **VK Mini App Integration**
   - VK Bridge API integration
   - User authentication
   - Payment processing (VK Pay)
   - Social sharing
   - Analytics tracking
   - Premium status synchronization

5. **Internationalization**
   - English (en)
   - Russian (ru)
   - URL-based locale switching
   - Dynamic content loading

6. **Analytics & Monitoring**
   - Firebase Analytics
   - Firebase Performance Monitoring
   - VK Analytics
   - Custom event tracking
   - Error logging

---

## 2. Target Architecture

### 2.1 Technology Stack

**Target Stack:**
- **Framework**: Nuxt.js 3.x (Vue 3 + Composition API)
- **Styling**: Tailwind CSS 3.x
- **State Management**: Pinia (Nuxt-native)
- **PDF Generation**: jsPDF 3.x (retained)
- **Analytics**: Firebase (retained) + Nuxt Analytics Module
- **Social Integration**: VK Mini Apps (retained with composables)
- **Localization**: Nuxt i18n Module
- **TypeScript**: Full TypeScript support
- **Build Tool**: Vite (Nuxt 3 uses Vite by default)
- **UI Components**: Headless UI + Custom Tailwind Components

**New Dependencies:**
```json
{
  "dependencies": {
    "nuxt": "^3.11.0",
    "vue": "^3.4.0",
    "@pinia/nuxt": "^0.5.0",
    "@nuxtjs/tailwindcss": "^6.12.0",
    "@nuxtjs/i18n": "^8.0.0",
    "@vueuse/core": "^10.9.0",
    "@vueuse/nuxt": "^10.9.0",
    "jspdf": "^3.0.1"
  },
  "devDependencies": {
    "@nuxt/devtools": "^1.0.0",
    "@nuxtjs/eslint-config-typescript": "^12.0.0",
    "typescript": "^5.3.0"
  }
}
```

### 2.2 New Project Structure

```
personalities-nuxt/
├── nuxt.config.ts                  # Nuxt configuration
├── tailwind.config.ts              # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
│
├── app/                            # App directory
│   ├── app.vue                     # Root app component
│   ├── error.vue                   # Error page
│   └── router.options.ts           # Router configuration
│
├── pages/                          # File-based routing
│   ├── index.vue                   # Welcome screen
│   ├── quiz/
│   │   ├── [type].vue             # Dynamic quiz page
│   │   └── results.vue            # Results page
│   └── premium/
│       └── index.vue              # Premium subscription page
│
├── layouts/                        # Layouts
│   ├── default.vue                # Default layout
│   └── vk.vue                     # VK Mini App layout
│
├── components/                     # Vue components
│   ├── ui/                        # UI components
│   │   ├── Button.vue
│   │   ├── Card.vue
│   │   ├── Modal.vue
│   │   ├── Progress.vue
│   │   └── Notification.vue
│   ├── quiz/                      # Quiz components
│   │   ├── QuestionCard.vue
│   │   ├── OptionsGroup.vue
│   │   ├── QuizProgress.vue
│   │   └── AdaptiveIndicators.vue
│   ├── results/                   # Results components
│   │   ├── PersonalityCard.vue
│   │   ├── DimensionBreakdown.vue
│   │   └── ChartsSection.vue
│   └── analytics/                 # Analytics charts
│       ├── RadarChart.vue
│       ├── BarChart.vue
│       └── PieChart.vue
│
├── composables/                    # Composition API composables
│   ├── useQuiz.ts                 # Quiz logic
│   ├── useAdaptive.ts             # Adaptive engine
│   ├── useVKBridge.ts             # VK integration
│   ├── useAnalytics.ts            # Analytics
│   ├── useLocalization.ts         # i18n helpers
│   └── useCharts.ts               # Chart rendering
│
├── stores/                         # Pinia stores
│   ├── quiz.ts                    # Quiz state
│   ├── user.ts                    # User state
│   ├── vk.ts                      # VK state
│   └── ui.ts                      # UI state
│
├── server/                         # Server routes (API)
│   ├── api/
│   │   ├── vk/
│   │   │   ├── user.post.ts      # VK user data
│   │   │   └── payment.post.ts   # VK payment verification
│   │   └── analytics/
│   │       └── event.post.ts     # Analytics events
│   └── middleware/
│       └── vk-auth.ts            # VK authentication
│
├── utils/                          # Utility functions
│   ├── constants.ts               # App constants
│   ├── types.ts                   # TypeScript types
│   ├── validators.ts              # Validation functions
│   └── helpers.ts                 # Helper functions
│
├── data/                           # Static data
│   ├── quizzes/
│   │   ├── mbti.ts               # MBTI questions
│   │   └── specialized.ts        # Specialized quizzes
│   └── personalities/
│       ├── types.ts              # Personality type data
│       └── descriptions.ts       # Descriptions
│
├── locales/                        # i18n translations
│   ├── en.json                    # English
│   └── ru.json                    # Russian
│
├── assets/                         # Static assets
│   ├── css/
│   │   └── main.css              # Global CSS + Tailwind directives
│   └── images/
│
└── public/                         # Public static files
    ├── favicon.svg
    └── robots.txt
```

---

## 3. Class Diagrams & Schemas

### 3.1 Current Architecture - Class Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      CURRENT ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   StateManager   │ (Singleton, Observer Pattern)
├──────────────────┤
│ - state          │
│ - subscribers    │
├──────────────────┤
│ + getState()     │
│ + setState()     │
│ + subscribe()    │
│ + notify()       │
└────────┬─────────┘
         │
         │ observes
         ├─────────────────────────┐
         │                         │
         ▼                         ▼
┌──────────────┐          ┌──────────────┐
│  UIManager   │◄─────────┤ QuizEngine   │
├──────────────┤          ├──────────────┤
│ - elements   │          │ - questions  │
│ - screens    │          │ - answers    │
├──────────────┤          │ - scores     │
│ + showScreen()│         ├──────────────┤
│ + displayQ()  │         │ + startQuiz()│
│ + selectOpt() │         │ + nextQ()    │
└──────┬───────┘         │ + calcScore()│
       │                 └──────┬───────┘
       │                        │
       │                        │ uses
       │                        ▼
       │               ┌─────────────────┐
       │               │ AdaptiveEngine  │
       │               ├─────────────────┤
       │               │ - selector      │
       │               │ - predictor     │
       │               │ - personalizer  │
       │               ├─────────────────┤
       │               │ + getNextQ()    │
       │               │ + updateState() │
       │               │ + predict()     │
       │               └─────────────────┘
       │
       │ uses
       ▼
┌──────────────────┐
│ AnalyticsEngine  │
├──────────────────┤
│ - charts         │
│ - data           │
├──────────────────┤
│ + renderRadar()  │
│ + renderBar()    │
│ + exportData()   │
└──────────────────┘

┌──────────────────────┐
│  VKBridgeManager     │ (Singleton)
├──────────────────────┤
│ - bridge             │
│ - userService        │
│ - paymentService     │
│ - analyticsService   │
├──────────────────────┤
│ + init()             │
│ + getUserInfo()      │
│ + showOrderBox()     │
│ + shareResults()     │
└──────────────────────┘
         │
         ├─────────────────┬─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ VKUserService  │  │VKPaymentService│  │VKAnalyticsServ.│
├────────────────┤  ├────────────────┤  ├────────────────┤
│ + getUserInfo()│  │ + showOrderBox()│  │ + trackEvent() │
│ + checkPremium()│  │ + checkPayment()│  │ + setUserProp()│
└────────────────┘  └────────────────┘  └────────────────┘
```

### 3.2 Target Architecture - Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    TARGET NUXT.JS ARCHITECTURE                   │
└─────────────────────────────────────────────────────────────────┘

                          ┌─────────────┐
                          │  Nuxt App   │
                          │   (app.vue) │
                          └──────┬──────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
            ┌───────▼──────┐ ┌──▼────┐ ┌────▼─────┐
            │   Layouts    │ │ Pages │ │Components│
            │              │ │       │ │          │
            │ - default    │ │-index │ │- quiz/   │
            │ - vk         │ │-quiz  │ │- results/│
            └──────────────┘ │-results│ │- ui/     │
                             └───┬────┘ └────┬─────┘
                                 │           │
                    ┌────────────┼───────────┘
                    │
        ┌───────────┼───────────────────────┐
        │           │                       │
    ┌───▼────┐ ┌───▼─────┐        ┌───────▼──────┐
    │ Stores │ │Composables│       │    Utils     │
    │(Pinia) │ │           │       │              │
    └────────┘ └───────────┘       └──────────────┘
        │           │                       │
        │           │                       │
    ┌───▼────────────▼───────────────────  ▼────┐
    │  State Layer (Pinia Stores)               │
    │                                            │
    │  - quiz: QuizStore                        │
    │    * questions, answers, scores           │
    │    * currentQuestion, progress            │
    │    * adaptive settings                    │
    │                                            │
    │  - user: UserStore                        │
    │    * userInfo, isPremium                  │
    │    * preferences, history                 │
    │                                            │
    │  - vk: VKStore                           │
    │    * bridge, isVKPlatform                │
    │    * vkUser, vkAnalytics                 │
    │                                            │
    │  - ui: UIStore                           │
    │    * modals, notifications               │
    │    * theme, locale                       │
    └────────────────────────────────────────────┘

    ┌────────────────────────────────────────────┐
    │  Composables Layer                         │
    │                                            │
    │  useQuiz()                                │
    │  ├─ startQuiz()                           │
    │  ├─ nextQuestion()                        │
    │  ├─ calculateResults()                    │
    │  └─ useAdaptive()                         │
    │                                            │
    │  useVKBridge()                            │
    │  ├─ initBridge()                          │
    │  ├─ getUserInfo()                         │
    │  ├─ showOrderBox()                        │
    │  └─ trackEvent()                          │
    │                                            │
    │  useAnalytics()                           │
    │  ├─ trackQuizEvent()                      │
    │  ├─ trackPageView()                       │
    │  └─ logError()                            │
    │                                            │
    │  useCharts()                              │
    │  ├─ renderRadarChart()                    │
    │  ├─ renderBarChart()                      │
    │  └─ exportData()                          │
    └────────────────────────────────────────────┘
```

### 3.3 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                │
└─────────────────────────────────────────────────────────────────┘

User Interaction
       │
       ▼
┌──────────────┐
│  Components  │
│  (Vue SFC)   │
└──────┬───────┘
       │
       │ dispatch actions
       ▼
┌──────────────┐
│Pinia Stores  │◄──────┐
│              │       │
│ quiz         │       │ reactive
│ user         │       │ updates
│ vk           │       │
│ ui           │       │
└──────┬───────┘       │
       │               │
       │ call          │
       ▼               │
┌──────────────┐       │
│ Composables  │       │
│              │       │
│ useQuiz()    │       │
│ useVKBridge()│       │
└──────┬───────┘       │
       │               │
       │ business logic│
       ▼               │
┌──────────────┐       │
│   Utils /    │       │
│   Helpers    │       │
└──────┬───────┘       │
       │               │
       │ update state  │
       └───────────────┘
```

### 3.4 State Management Schema (Pinia)

```typescript
// Quiz Store
interface QuizState {
  // Quiz configuration
  currentQuizType: string
  questions: Question[]
  currentQuestionIndex: number

  // User responses
  answers: Answer[]
  scores: MBTIScores
  selectedOption: number | null

  // Adaptive features
  adaptiveEngine: AdaptiveEngine | null
  isAdaptiveMode: boolean
  confidenceScores: ConfidenceScores

  // Results
  lastResults: QuizResults | null

  // Progress
  progress: {
    current: number
    total: number
    percentage: number
  }
}

// User Store
interface UserState {
  userInfo: UserInfo | null
  isPremium: boolean
  preferences: UserPreferences
  history: QuizHistory[]
  locale: 'en' | 'ru'
  theme: 'light' | 'dark'
}

// VK Store
interface VKState {
  bridge: any | null
  isVKPlatform: boolean
  vkUser: VKUser | null
  isInitialized: boolean
  paymentStatus: PaymentStatus | null
}

// UI Store
interface UIState {
  currentScreen: 'welcome' | 'quiz' | 'results'
  modals: ModalState
  notifications: Notification[]
  loading: boolean
  error: Error | null
}
```

---

## 4. API & Integration Documentation

### 4.1 VK Bridge API Integration

**Current Implementation:**
- VKBridgeManager orchestrates all VK interactions
- Modular services for User, Payment, Analytics
- Event-based communication
- Fallback mechanisms for non-VK environments

**VK Bridge Methods Used:**

```javascript
// Initialization
vkBridge.send('VKWebAppInit')

// User Information
vkBridge.send('VKWebAppGetUserInfo')

// Payment
vkBridge.send('VKWebAppShowOrderBox', {
  type: 'item',
  item: 'premium_subscription'
})

// Sharing
vkBridge.send('VKWebAppShare', {
  link: 'https://vk.ru/app...',
  title: 'Check out my result!'
})

// Analytics
vkBridge.send('VKWebAppTrackEvent', {
  event_name: 'quiz_completed',
  event_params: {...}
})

// Appearance
vkBridge.send('VKWebAppSetViewSettings', {
  status_bar_style: 'light'
})
```

**Migration Approach:**

```typescript
// composables/useVKBridge.ts
export const useVKBridge = () => {
  const vkStore = useVKStore()
  const bridge = ref<any>(null)

  const initBridge = async () => {
    if (typeof window.vkBridge !== 'undefined') {
      bridge.value = window.vkBridge
      await bridge.value.send('VKWebAppInit')
      vkStore.setInitialized(true)
    }
  }

  const getUserInfo = async () => {
    if (!bridge.value) return null
    const result = await bridge.value.send('VKWebAppGetUserInfo')
    vkStore.setUser(result)
    return result
  }

  const showOrderBox = async (item: string) => {
    if (!bridge.value) throw new Error('VK Bridge not initialized')
    return await bridge.value.send('VKWebAppShowOrderBox', {
      type: 'item',
      item
    })
  }

  return {
    initBridge,
    getUserInfo,
    showOrderBox,
    // ... other methods
  }
}
```

### 4.2 Firebase Integration

**Current Setup:**
- Firebase Analytics for event tracking
- Firebase Performance Monitoring
- CDN imports from gstatic.com

**Events Tracked:**
```javascript
// Quiz events
firebaseAnalytics.logEvent('quiz_started', { quiz_type: 'mbti' })
firebaseAnalytics.logEvent('quiz_completed', { personality_type: 'INTJ' })
firebaseAnalytics.logEvent('question_answered', { question_number: 5 })

// User events
firebaseAnalytics.logEvent('premium_purchased')
firebaseAnalytics.logEvent('results_shared')
firebaseAnalytics.logEvent('pdf_exported')

// VK events
firebaseAnalytics.logEvent('vk_auth_success')
firebaseAnalytics.logEvent('vk_payment_initiated')
```

**Migration Approach:**

```typescript
// composables/useAnalytics.ts
import { getAnalytics, logEvent } from 'firebase/analytics'

export const useAnalytics = () => {
  const analytics = getAnalytics()

  const trackQuizEvent = (action: string, params?: object) => {
    logEvent(analytics, `quiz_${action}`, params)
  }

  const trackPageView = (pageName: string) => {
    logEvent(analytics, 'page_view', { page_name: pageName })
  }

  const setUserProperties = (properties: object) => {
    Object.entries(properties).forEach(([key, value]) => {
      setUserProperty(analytics, key, value)
    })
  }

  return {
    trackQuizEvent,
    trackPageView,
    setUserProperties
  }
}

// Auto-tracking with router
export default defineNuxtPlugin(() => {
  const router = useRouter()
  const { trackPageView } = useAnalytics()

  router.afterEach((to) => {
    trackPageView(to.name as string)
  })
})
```

### 4.3 Data Models & Types

```typescript
// types/quiz.ts
export interface Question {
  id: string
  question: string
  options: string[]
  dimension: 'EI' | 'SN' | 'TF' | 'JP'
  weights: number[]
  type?: 'behavioral' | 'situational' | 'preference'
  difficulty?: 'easy' | 'medium' | 'hard'
}

export interface Answer {
  questionIndex: number
  selectedOption: number
  dimension: string
  weights: number[]
  responseTime?: number
  timestamp: number
}

export interface MBTIScores {
  E: number
  I: number
  S: number
  N: number
  T: number
  F: number
  J: number
  P: number
}

export interface QuizResults {
  personalityType: string
  dimensionBreakdown: DimensionBreakdown
  scores: MBTIScores
  answers: Answer[]
  quizType: string
  timestamp: string
  isAdaptive: boolean
  adaptiveAnalytics?: AdaptiveAnalytics
}

export interface DimensionBreakdown {
  EI: { E: number; I: number; preference: 'E' | 'I' }
  SN: { S: number; N: number; preference: 'S' | 'N' }
  TF: { T: number; F: number; preference: 'T' | 'F' }
  JP: { J: number; P: number; preference: 'J' | 'P' }
}

export interface PersonalityType {
  code: string
  title: string
  subtitle: string
  description: string
  traits: string[]
  strengths: string[]
  weaknesses: string[]
  careers: string[]
  relationships: string[]
}

// types/vk.ts
export interface VKUser {
  id: number
  first_name: string
  last_name: string
  photo_url: string
  is_premium: boolean
}

export interface VKPaymentStatus {
  orderId: string
  status: 'pending' | 'completed' | 'failed'
  item: string
  amount: number
  timestamp: number
}
```

---

## 5. Migration Strategy

### 5.1 Migration Approach

**Strategy**: **Progressive Migration** (Hybrid Approach)

We'll use a progressive migration strategy that allows both old and new code to coexist during the transition period.

**Phases:**

1. **Phase 1: Foundation** (Week 1)
   - Set up Nuxt.js 3 project
   - Configure Tailwind CSS
   - Set up TypeScript
   - Configure build tools and dev environment

2. **Phase 2: Core Architecture** (Week 2)
   - Migrate state management to Pinia
   - Create composables for core functionality
   - Set up routing and layouts
   - Configure i18n

3. **Phase 3: UI Components** (Week 2-3)
   - Convert UI components to Vue SFCs
   - Implement Tailwind styling
   - Create reusable component library
   - Migrate screens to pages

4. **Phase 4: Business Logic** (Week 3-4)
   - Migrate QuizEngine to composables
   - Port AdaptiveEngine functionality
   - Implement analytics integration
   - Port VK Bridge integration

5. **Phase 5: Testing & Optimization** (Week 4-5)
   - Unit testing with Vitest
   - E2E testing with Playwright
   - Performance optimization
   - Accessibility audit

6. **Phase 6: Deployment & Monitoring** (Week 5-6)
   - Deploy to staging
   - Monitor performance
   - Fix issues
   - Deploy to production

### 5.2 Risk Mitigation

**Identified Risks:**

1. **VK Bridge Compatibility**
   - Risk: VK Bridge may not work properly with Vue/Nuxt
   - Mitigation: Create a dedicated VK composable with fallbacks

2. **Adaptive Engine Complexity**
   - Risk: Complex adaptive logic may be difficult to port
   - Mitigation: Port incrementally, test thoroughly

3. **State Management**
   - Risk: Observer pattern behavior may differ from Pinia
   - Mitigation: Careful testing of state updates

4. **Performance**
   - Risk: Nuxt overhead may slow down the app
   - Mitigation: Use code splitting, lazy loading, SSR optimization

5. **Data Loss**
   - Risk: LocalStorage data may not migrate
   - Mitigation: Create migration script for localStorage

### 5.3 Backward Compatibility

**LocalStorage Migration:**

```typescript
// utils/storage-migration.ts
export const migrateLocalStorage = () => {
  // Migrate old state to new Pinia structure
  const oldState = localStorage.getItem('mbti_state')
  if (oldState) {
    const parsed = JSON.parse(oldState)
    const quizStore = useQuizStore()
    const userStore = useUserStore()

    userStore.setTheme(parsed.theme)
    userStore.setLocale(parsed.language)
    if (parsed.lastResults) {
      quizStore.setLastResults(parsed.lastResults)
    }

    // Mark as migrated
    localStorage.setItem('mbti_migrated', 'true')
  }
}
```

---

## 6. Implementation Plan

### 6.1 Week-by-Week Breakdown

#### Week 1: Foundation Setup

**Day 1-2: Project Initialization**
- [ ] Create new Nuxt 3 project
- [ ] Install dependencies (Tailwind, Pinia, i18n)
- [ ] Configure `nuxt.config.ts`
- [ ] Set up TypeScript
- [ ] Configure Tailwind CSS
- [ ] Set up ESLint + Prettier

**Day 3-4: Project Structure**
- [ ] Create directory structure
- [ ] Set up Pinia stores scaffolding
- [ ] Create composables directory
- [ ] Set up layouts
- [ ] Configure routing

**Day 5-7: Development Environment**
- [ ] Set up Git workflow
- [ ] Configure Vitest for unit testing
- [ ] Set up Playwright for E2E testing
- [ ] Create development documentation
- [ ] Set up CI/CD pipeline (GitHub Actions)

#### Week 2: Core Architecture

**Day 1-2: State Management**
- [ ] Create Pinia stores:
  - [ ] `quiz.ts` - Quiz state
  - [ ] `user.ts` - User state
  - [ ] `vk.ts` - VK integration state
  - [ ] `ui.ts` - UI state
- [ ] Port StateManager logic to stores
- [ ] Implement persistence layer
- [ ] Test state reactivity

**Day 3-5: Core Composables**
- [ ] Create `useQuiz()` composable
- [ ] Create `useVKBridge()` composable
- [ ] Create `useAnalytics()` composable
- [ ] Create `useLocalization()` composable
- [ ] Write unit tests

**Day 6-7: Routing & i18n**
- [ ] Configure Nuxt i18n module
- [ ] Migrate locale files to JSON
- [ ] Set up dynamic routes
- [ ] Create layouts (default, VK)
- [ ] Test navigation

#### Week 3: UI Components

**Day 1-3: Base Components**
- [ ] Create UI component library:
  - [ ] Button
  - [ ] Card
  - [ ] Modal
  - [ ] Progress
  - [ ] Notification
  - [ ] Input
  - [ ] Select
  - [ ] Toggle
- [ ] Style with Tailwind
- [ ] Create Storybook stories
- [ ] Write component tests

**Day 4-5: Quiz Components**
- [ ] Create quiz-specific components:
  - [ ] QuestionCard
  - [ ] OptionsGroup
  - [ ] QuizProgress
  - [ ] AdaptiveIndicators
- [ ] Implement responsive design
- [ ] Test interactions

**Day 6-7: Results Components**
- [ ] Create results components:
  - [ ] PersonalityCard
  - [ ] DimensionBreakdown
  - [ ] ChartsSection
- [ ] Integrate chart libraries
- [ ] Test visualizations

#### Week 4: Business Logic & Integration

**Day 1-3: Quiz Engine**
- [ ] Port QuizEngine to composables
- [ ] Implement question generation
- [ ] Implement scoring algorithms
- [ ] Port adaptive engine
- [ ] Test quiz flow

**Day 4-5: VK Integration**
- [ ] Port VKBridgeManager to composable
- [ ] Implement VK user service
- [ ] Implement VK payment service
- [ ] Test VK features
- [ ] Create fallbacks for non-VK

**Day 6-7: Analytics & Utilities**
- [ ] Port AnalyticsEngine
- [ ] Integrate Firebase
- [ ] Create chart rendering utilities
- [ ] Implement PDF export
- [ ] Test analytics tracking

#### Week 5: Pages & Testing

**Day 1-2: Pages**
- [ ] Create `pages/index.vue` (Welcome)
- [ ] Create `pages/quiz/[type].vue` (Quiz)
- [ ] Create `pages/quiz/results.vue` (Results)
- [ ] Create `pages/premium/index.vue` (Premium)
- [ ] Test page navigation

**Day 3-5: Testing**
- [ ] Write unit tests for stores
- [ ] Write unit tests for composables
- [ ] Write component tests
- [ ] Write E2E tests for critical flows
- [ ] Fix bugs and issues

**Day 6-7: Optimization**
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Image optimization
- [ ] Bundle size optimization
- [ ] Performance audit

#### Week 6: Deployment & Launch

**Day 1-2: Staging Deployment**
- [ ] Deploy to staging environment
- [ ] Test all features in staging
- [ ] Fix critical bugs
- [ ] Performance monitoring

**Day 3-4: Production Prep**
- [ ] Final testing
- [ ] Security audit
- [ ] Accessibility audit
- [ ] SEO optimization
- [ ] Documentation finalization

**Day 5-6: Production Deployment**
- [ ] Deploy to production
- [ ] Monitor errors and performance
- [ ] Hot fixes if needed
- [ ] Rollback plan ready

**Day 7: Post-Launch**
- [ ] Monitor analytics
- [ ] Gather user feedback
- [ ] Plan next iteration
- [ ] Documentation updates

### 6.2 Code Migration Examples

#### Example 1: StateManager → Pinia Store

**Before (StateManager.js):**
```javascript
export class StateManager {
  constructor() {
    this.state = {
      currentScreen: 'welcome',
      isPremium: false,
      language: 'en'
    }
    this.subscribers = new Map()
  }

  setState(newState) {
    this.state = { ...this.state, ...newState }
    this.notifySubscribers()
  }

  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set())
    }
    this.subscribers.get(key).add(callback)
  }
}
```

**After (stores/ui.ts):**
```typescript
export const useUIStore = defineStore('ui', () => {
  const currentScreen = ref<'welcome' | 'quiz' | 'results'>('welcome')
  const isPremium = ref(false)
  const language = ref<'en' | 'ru'>('en')

  // Actions
  const setScreen = (screen: typeof currentScreen.value) => {
    currentScreen.value = screen
  }

  const setPremium = (premium: boolean) => {
    isPremium.value = premium
  }

  const setLanguage = (lang: typeof language.value) => {
    language.value = lang
  }

  // Persistence
  watch([isPremium, language], () => {
    localStorage.setItem('mbti_state', JSON.stringify({
      isPremium: isPremium.value,
      language: language.value
    }))
  })

  // Load from storage
  onMounted(() => {
    const saved = localStorage.getItem('mbti_state')
    if (saved) {
      const data = JSON.parse(saved)
      isPremium.value = data.isPremium ?? false
      language.value = data.language ?? 'en'
    }
  })

  return {
    currentScreen,
    isPremium,
    language,
    setScreen,
    setPremium,
    setLanguage
  }
})
```

#### Example 2: UIManager → Vue Components

**Before (UIManager.js):**
```javascript
displayCurrentQuestion() {
  const question = quizEngine.getCurrentQuestion()
  if (!question) return

  this.elements.questionText.textContent = question.question

  question.options.forEach((option, index) => {
    this.elements.options[index].textContent = option
  })

  const progress = quizEngine.getProgress()
  this.elements.progressFill.style.width = `${progress.percentage}%`
}
```

**After (components/quiz/QuestionCard.vue):**
```vue
<template>
  <div class="question-card">
    <h2 class="text-2xl font-bold mb-6">{{ currentQuestion.question }}</h2>

    <div class="options-group space-y-4">
      <button
        v-for="(option, index) in currentQuestion.options"
        :key="index"
        class="option-button"
        :class="{ 'selected': selectedOption === index }"
        @click="selectOption(index)"
      >
        {{ option }}
      </button>
    </div>

    <div class="progress-bar mt-8">
      <div
        class="progress-fill"
        :style="{ width: `${progress}%` }"
      />
    </div>

    <p class="text-center mt-2 text-gray-600">
      {{ currentQuestionNumber }} / {{ totalQuestions }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuizStore } from '~/stores/quiz'

const quizStore = useQuizStore()
const { selectOption } = useQuiz()

const currentQuestion = computed(() => quizStore.currentQuestion)
const selectedOption = computed(() => quizStore.selectedOption)
const progress = computed(() => quizStore.progress.percentage)
const currentQuestionNumber = computed(() => quizStore.progress.current)
const totalQuestions = computed(() => quizStore.progress.total)
</script>

<style scoped>
.question-card {
  @apply bg-white rounded-2xl shadow-xl p-8;
}

.option-button {
  @apply w-full p-4 text-left rounded-lg border-2 border-gray-200
         hover:border-primary hover:bg-primary/5 transition-all
         duration-300 cursor-pointer;
}

.option-button.selected {
  @apply border-primary bg-primary/10 font-semibold;
}

.progress-bar {
  @apply w-full h-2 bg-gray-200 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-primary to-purple-600
         transition-all duration-500;
}
</style>
```

#### Example 3: QuizEngine → Composable

**Before (QuizEngine.js):**
```javascript
export class QuizEngine {
  async nextQuestion() {
    if (this.selectedOption === null) {
      throw new Error('No option selected')
    }

    const currentQuestion = this.questions[this.currentQuestionIndex]
    const responseData = {
      questionIndex: this.currentQuestionIndex,
      selectedOption: this.selectedOption,
      dimension: currentQuestion.dimension,
      weights: currentQuestion.weights
    }

    this.answers.push(responseData)
    this.updateScores(currentQuestion, this.selectedOption)
    this.currentQuestionIndex++

    if (this.currentQuestionIndex >= this.questions.length) {
      return this.completeQuiz()
    }

    return this.getCurrentQuestion()
  }
}
```

**After (composables/useQuiz.ts):**
```typescript
export const useQuiz = () => {
  const quizStore = useQuizStore()
  const userStore = useUserStore()
  const { trackQuizEvent } = useAnalytics()

  const nextQuestion = async () => {
    if (quizStore.selectedOption === null) {
      throw new Error('No option selected')
    }

    const currentQuestion = quizStore.currentQuestion
    const responseData = {
      questionIndex: quizStore.currentQuestionIndex,
      selectedOption: quizStore.selectedOption,
      dimension: currentQuestion.dimension,
      weights: currentQuestion.weights,
      timestamp: Date.now()
    }

    // Add answer
    quizStore.addAnswer(responseData)

    // Update scores
    quizStore.updateScores(currentQuestion, quizStore.selectedOption)

    // Track event
    trackQuizEvent('question_answered', {
      question_number: quizStore.currentQuestionIndex + 1,
      dimension: currentQuestion.dimension
    })

    // Move to next question
    quizStore.incrementQuestion()
    quizStore.clearSelection()

    // Check if quiz is complete
    if (quizStore.currentQuestionIndex >= quizStore.questions.length) {
      return await completeQuiz()
    }

    return quizStore.currentQuestion
  }

  const completeQuiz = async () => {
    const results = quizStore.calculateResults()
    quizStore.setResults(results)

    trackQuizEvent('completed', {
      personality_type: results.personalityType,
      quiz_type: quizStore.currentQuizType
    })

    await navigateTo('/quiz/results')
    return results
  }

  return {
    nextQuestion,
    completeQuiz
  }
}
```

#### Example 4: Tailwind Migration

**Before (styles.css):**
```css
.btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
```

**After (components/ui/Button.vue):**
```vue
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false
})

const buttonClasses = computed(() => [
  'btn',
  `btn-${props.variant}`,
  `btn-${props.size}`,
  {
    'opacity-50 cursor-not-allowed': props.disabled
  }
])
</script>

<style scoped>
.btn {
  @apply font-semibold rounded-lg transition-all duration-300
         shadow-md hover:shadow-lg hover:-translate-y-0.5
         disabled:opacity-50 disabled:cursor-not-allowed
         disabled:transform-none;
}

.btn-primary {
  @apply bg-gradient-to-r from-primary to-purple-600 text-white;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
}

.btn-outline {
  @apply bg-transparent border-2 border-primary text-primary
         hover:bg-primary hover:text-white;
}

.btn-sm {
  @apply px-4 py-2 text-sm;
}

.btn-md {
  @apply px-6 py-3 text-base;
}

.btn-lg {
  @apply px-8 py-4 text-lg;
}
</style>
```

---

## 7. Testing Strategy

### 7.1 Testing Pyramid

```
         /\
        /  \
       / E2E\          10% - End-to-End Tests
      /______\
     /        \
    /Integration\     30% - Integration Tests
   /____________\
  /              \
 /  Unit Tests    \   60% - Unit Tests
/__________________\
```

### 7.2 Unit Tests (Vitest)

**Test Coverage Goals:**
- Stores: 90%+
- Composables: 85%+
- Utils: 90%+
- Components: 75%+

**Example Test:**
```typescript
// stores/quiz.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useQuizStore } from '~/stores/quiz'

describe('Quiz Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default state', () => {
    const store = useQuizStore()
    expect(store.currentQuestionIndex).toBe(0)
    expect(store.answers).toEqual([])
    expect(store.selectedOption).toBeNull()
  })

  it('adds answer correctly', () => {
    const store = useQuizStore()
    const answer = {
      questionIndex: 0,
      selectedOption: 2,
      dimension: 'EI',
      weights: [3, 2, 1, 0]
    }

    store.addAnswer(answer)
    expect(store.answers).toHaveLength(1)
    expect(store.answers[0]).toEqual(answer)
  })

  it('calculates personality type correctly', () => {
    const store = useQuizStore()
    store.scores = { E: 10, I: 5, S: 8, N: 12, T: 15, F: 5, J: 7, P: 13 }

    const personalityType = store.calculatePersonalityType()
    expect(personalityType).toBe('ENTP')
  })
})
```

### 7.3 Component Tests

```typescript
// components/quiz/QuestionCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import QuestionCard from '~/components/quiz/QuestionCard.vue'

describe('QuestionCard', () => {
  it('renders question text', () => {
    const wrapper = mount(QuestionCard, {
      props: {
        question: {
          question: 'Do you prefer thinking or feeling?',
          options: ['Thinking', 'Feeling', 'Both', 'Neither']
        }
      }
    })

    expect(wrapper.text()).toContain('Do you prefer thinking or feeling?')
  })

  it('emits select event when option clicked', async () => {
    const wrapper = mount(QuestionCard, {
      props: {
        question: {
          question: 'Test question',
          options: ['Option 1', 'Option 2']
        }
      }
    })

    await wrapper.find('.option-button').trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
  })
})
```

### 7.4 E2E Tests (Playwright)

```typescript
// tests/e2e/quiz-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Quiz Flow', () => {
  test('completes full quiz', async ({ page }) => {
    await page.goto('/')

    // Start quiz
    await page.click('text=Start Quiz')
    await expect(page).toHaveURL('/quiz/mbti')

    // Answer all questions
    for (let i = 0; i < 20; i++) {
      await page.click('.option-button:first-child')
      await page.click('text=Next')
    }

    // Check results
    await expect(page).toHaveURL('/quiz/results')
    await expect(page.locator('.personality-type')).toBeVisible()
  })

  test('VK integration works', async ({ page }) => {
    await page.goto('/?vk_user_id=123')

    // Check VK platform detected
    await expect(page.locator('.vk-platform')).toBeVisible()

    // Test premium purchase
    await page.click('text=Get Premium')
    // VK order box should appear
  })
})
```

---

## 8. Rollback Plan

### 8.1 Rollback Triggers

**Automatic Rollback Conditions:**
- Error rate > 5% for 10 minutes
- Page load time > 5 seconds
- Critical functionality broken
- VK integration failure rate > 20%

**Manual Rollback Triggers:**
- Major security vulnerability discovered
- Data loss reported
- Negative user feedback spike

### 8.2 Rollback Procedure

1. **Immediate Actions**
   ```bash
   # Revert to previous deployment
   git revert <commit-hash>
   npm run build
   npm run deploy
   ```

2. **Communication**
   - Notify team via Slack/Discord
   - Update status page
   - Inform VK platform team if needed

3. **Post-Rollback**
   - Analyze failure cause
   - Fix issues in development
   - Prepare new deployment
   - Re-test thoroughly

### 8.3 Data Recovery

```typescript
// If localStorage data is corrupted
export const recoverUserData = () => {
  try {
    // Try to recover from backup
    const backup = localStorage.getItem('mbti_state_backup')
    if (backup) {
      localStorage.setItem('mbti_state', backup)
      return true
    }

    // Try to recover from IndexedDB
    const db = await openDB('mbti-backup')
    const state = await db.get('state', 'latest')
    if (state) {
      localStorage.setItem('mbti_state', JSON.stringify(state))
      return true
    }

    return false
  } catch (error) {
    console.error('Data recovery failed:', error)
    return false
  }
}
```

---

## 9. Success Metrics

### 9.1 Technical Metrics

- **Performance**
  - First Contentful Paint (FCP): < 1.5s
  - Time to Interactive (TTI): < 3s
  - Largest Contentful Paint (LCP): < 2.5s
  - Cumulative Layout Shift (CLS): < 0.1

- **Bundle Size**
  - Initial bundle: < 200KB
  - Total bundle: < 500KB

- **Code Quality**
  - Test coverage: > 80%
  - TypeScript coverage: 100%
  - ESLint errors: 0

### 9.2 User Experience Metrics

- **Engagement**
  - Quiz completion rate: > 85%
  - Return user rate: > 30%
  - Average session time: > 5 minutes

- **Conversion**
  - Premium conversion rate: > 5%
  - Share rate: > 15%
  - VK app installs: +20%

### 9.3 Monitoring & Alerts

**Tools:**
- Sentry for error tracking
- Google Analytics / Firebase for user analytics
- Lighthouse CI for performance
- VK Analytics for platform metrics

**Alerts:**
- Critical errors: immediate notification
- Performance degradation: 5-minute alert
- Conversion drop: daily report

---

## 10. Conclusion

This migration plan provides a comprehensive roadmap for transitioning the MBTI Personality Quiz from a Vanilla JavaScript + Vite architecture to a modern Nuxt.js 3 + Tailwind CSS stack.

**Key Benefits:**
1. **Better Developer Experience**: Vue 3 Composition API + TypeScript
2. **Improved Performance**: SSR, code splitting, optimized builds
3. **Enhanced Maintainability**: Component-based architecture
4. **Modern Tooling**: Vite, Tailwind, Pinia
5. **Better Testing**: Vitest, Playwright integration
6. **Scalability**: Modular structure for future features

**Next Steps:**
1. Review and approve this plan
2. Set up development environment
3. Begin Phase 1 implementation
4. Regular progress reviews
5. Stakeholder updates

---

**Document Version**: 1.0
**Last Updated**: 2024-11-05
**Author**: Migration Team
**Status**: Draft - Awaiting Approval

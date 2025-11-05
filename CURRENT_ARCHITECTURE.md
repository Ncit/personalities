# Current Architecture - Detailed Analysis

## Overview

The MBTI Personality Quiz is a sophisticated single-page application built with Vanilla JavaScript (ES6 modules) and Vite as the build tool. The application features a modular architecture with clear separation of concerns, implementing several design patterns including Singleton, Observer, and Service patterns.

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        APPLICATION ENTRY POINT                        │
│                            (index.html)                              │
└───────────────────────────┬──────────────────────────────────────────┘
                            │
                  ┌─────────┴─────────┐
                  │    script.js      │
                  │  (Main Bootstrap) │
                  └─────────┬─────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
    ┌─────▼──────┐    ┌─────▼──────┐   ┌─────▼──────┐
    │   CORE     │    │    UI      │   │    QUIZ    │
    │  MODULES   │    │  MODULES   │   │  MODULES   │
    └────────────┘    └────────────┘   └────────────┘
          │                 │                 │
    ┌─────▼──────┐    ┌─────▼──────┐   ┌─────▼──────┐
    │StateManager│    │ UIManager  │   │QuizEngine  │
    │LoggerManager│   │            │   │            │
    └────────────┘    └────────────┘   └────────────┘
```

---

## Module Breakdown

### 1. Core Modules

#### 1.1 StateManager (`src/modules/core/StateManager.js`)

**Purpose**: Centralized state management using the Observer pattern

**Design Pattern**: Singleton + Observer

**Responsibilities**:
- Global application state management
- State persistence (localStorage)
- State observation and notification
- URL state synchronization

**State Structure**:
```javascript
{
  // Application State
  appState: 'release' | 'development',
  currentScreen: 'welcome' | 'quiz' | 'results',

  // User Preferences
  isPremium: false,
  theme: 'light' | 'dark',
  language: 'en' | 'ru',

  // Quiz State
  currentQuizType: 'mbti',
  currentQuestion: 0,
  answers: [],
  scores: { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 },
  selectedOption: null,

  // Results
  lastResults: null,

  // UI State
  modals: {
    types: false,
    premium: false,
    exitQuiz: false
  }
}
```

**Key Methods**:
```javascript
// Getters
getState()              // Returns full state copy
get(key)               // Get specific state value

// Setters
setState(newState)     // Merge new state
set(key, value)        // Set specific value

// Observer Pattern
subscribe(key, callback)    // Subscribe to state changes
unsubscribe(key, callback)  // Unsubscribe from changes
notifySubscribers(key)      // Notify all subscribers

// Persistence
saveToStorage()        // Save to localStorage
loadFromStorage()      // Load from localStorage

// Quiz Management
updateQuizProgress()   // Update quiz state
resetQuiz()           // Reset quiz to initial state
setQuizType()         // Set current quiz type

// URL Management
updateURLWithState()   // Sync state to URL
getStateFromURL()     // Read state from URL
```

#### 1.2 LoggerManager (`src/modules/core/LoggerManager.js`)

**Purpose**: Centralized logging system with module-based loggers

**Features**:
- Module-specific loggers
- Log level filtering (debug, info, warn, error)
- Console formatting
- Production/development modes

**Example Usage**:
```javascript
const logger = new LoggerManager().createModuleLogger('QuizEngine')
logger.info('Quiz started')
logger.warn('Adaptive engine not available')
logger.error('Failed to load questions')
```

---

### 2. Quiz Module

#### 2.1 QuizEngine (`src/modules/quiz/QuizEngine.js`)

**Purpose**: Core quiz logic, question management, and scoring

**Design Pattern**: Singleton

**Responsibilities**:
- Quiz initialization and lifecycle
- Question generation and management
- Answer processing and scoring
- Adaptive assessment integration
- Results calculation

**Key Features**:

1. **Question Management**
   - Dynamic question loading
   - Support for multiple quiz types (MBTI + 15 specialized)
   - Question randomization
   - Progress tracking

2. **Scoring Algorithm**
   ```javascript
   updateScores(question, selectedOption) {
     const weights = question.weights
     const dimension = question.dimension

     if (dimension === 'EI') {
       this.scores.E += weights[selectedOption - 1]
       this.scores.I -= weights[selectedOption - 1]
     }
     // ... similar for SN, TF, JP
   }
   ```

3. **Adaptive Assessment**
   - Integration with AdaptiveEngine
   - Confidence-based question selection
   - Early termination based on confidence thresholds
   - Performance metrics tracking

4. **Quiz Types Supported**:
   - MBTI (20 free / 60 premium questions)
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

**API**:
```javascript
// Lifecycle
initializeQuiz()           // Initialize quiz
startQuiz()               // Start new quiz
resetQuiz()               // Reset quiz state
completeQuiz()            // Complete and calculate results

// Question Management
getCurrentQuestion()       // Get current question object
generateQuestions()       // Load questions for quiz type
generateMBTIQuestions()   // Load MBTI questions
generateSpecializedQuestions()  // Load specialized questions

// Navigation
nextQuestion()            // Move to next question
previousQuestion()        // Move to previous question
selectOption(index)       // Select an option

// Scoring
updateScores()            // Update scores based on answer
recalculateScores()       // Recalculate all scores
calculateResults()        // Calculate final results
calculatePersonalityType() // Determine MBTI type
calculateDimensionBreakdown() // Calculate dimension percentages

// Adaptive Features
initializeAdaptiveEngine()     // Initialize adaptive system
updateAdaptiveEngine()         // Update with new response
checkEarlyCompletion()         // Check if quiz can end early
getCurrentConfidence()         // Get confidence scores
getAdaptiveAnalytics()        // Get adaptive metrics

// Utilities
getProgress()             // Get progress information
canGoNext()              // Check if can proceed
canGoPrevious()          // Check if can go back
getQuizInfo()            // Get quiz metadata
toggleAdaptiveMode()     // Toggle adaptive mode
getAdaptiveModeStatus()  // Get adaptive status

// Development
fillRandomAnswers()      // Fill with random answers (dev only)
```

---

### 3. UI Module

#### 3.1 UIManager (`src/modules/ui/UIManager.js`)

**Purpose**: DOM manipulation, screen management, UI updates

**Design Pattern**: Singleton

**Responsibilities**:
- Element caching for performance
- Screen transitions
- Modal management
- Event handling
- UI state updates
- Adaptive indicators display

**Cached Elements**:
```javascript
{
  // Screens
  welcomeScreen, quizScreen, resultsScreen,

  // Quiz Elements
  questionText, options[], progressFill, questionCounter,
  prevBtn, nextBtn,

  // Adaptive Indicators
  adaptiveIndicators, confidenceEI, confidenceSN,
  confidenceTF, confidenceJP, adaptiveStatus,

  // Results
  personalityType, personalityCard, personalityTitle,
  personalityDescription, personalityTraits,

  // Modals
  typesModal, premiumModal, exitQuizModal, subscriptionModal,

  // UI Controls
  headerPremiumBtn, viewLastResultsBtn
}
```

**Key Methods**:

1. **Screen Management**
   ```javascript
   showScreen(screen)           // Show specific screen
   displayCurrentQuestion()     // Render current question
   displayResults()            // Render results screen
   ```

2. **Option Handling**
   ```javascript
   selectOption(index)         // Select an option
   clearOptionSelection()      // Clear all selections
   ```

3. **Navigation**
   ```javascript
   nextQuestion()              // Handle next button
   previousQuestion()          // Handle previous button
   ```

4. **Results Display**
   ```javascript
   displayResults()            // Show results
   updateDimensionBreakdown()  // Update dimension bars
   showPremiumContent()        // Show premium sections
   ```

5. **Modal Management**
   ```javascript
   openModal(name)             // Open a modal
   closeModal(name)            // Close a modal
   updateModals(modals)        // Sync modal states
   populateTypesModal()        // Fill personality types modal
   ```

6. **Premium UI**
   ```javascript
   updatePremiumUI(isPremium)  // Update premium-related UI
   ```

7. **Notifications**
   ```javascript
   showError(message)          // Show error notification
   showSuccess(message)        // Show success notification
   showLoading()              // Show loading overlay
   hideLoading()              // Hide loading overlay
   ```

8. **Adaptive Indicators**
   ```javascript
   showAdaptiveIndicators()         // Show adaptive UI
   hideAdaptiveIndicators()         // Hide adaptive UI
   updateAdaptiveStatus()           // Update status text
   updateConfidenceBars()           // Update confidence bars
   updateConfidenceBar()            // Update single bar
   updateAdaptiveMetrics()          // Update metrics
   updateAllAdaptiveIndicators()    // Update everything
   calculateAdaptiveMetrics()       // Calculate metrics
   updateAdaptiveStatusBasedOnProgress() // Update based on progress
   ```

---

### 4. Adaptive Module

#### 4.1 AdaptiveEngine (`src/modules/adaptive/AdaptiveEngine.js`)

**Purpose**: AI-powered adaptive assessment system

**Components**:
- AdaptiveEngine: Main orchestrator
- QuestionSelector: Smart question selection
- AccuracyPredictor: Confidence prediction
- PersonalizationEngine: User personalization

**Features**:

1. **Adaptive Question Selection**
   - Confidence-based selection
   - Dimension balancing
   - User preference consideration
   - Performance optimization

2. **Early Termination**
   ```javascript
   shouldTerminateEarly() {
     // Minimum 20 questions required
     if (answeredCount < 20) return false

     // All dimensions must have 85%+ confidence
     const highConfidence = dimensions.filter(d =>
       confidence[d] >= 0.85
     ).length

     return highConfidence >= 4
   }
   ```

3. **Confidence Tracking**
   - Real-time confidence calculation
   - Per-dimension tracking
   - Adaptation history
   - Performance metrics

4. **User Profiling**
   ```javascript
   userProfile: {
     preferences: {
       questionTypes: { behavioral, situational, preference },
       difficulty: { easy, medium, hard },
       responseTime: { fast, medium, slow }
     },
     history: {
       previousAssessments: [],
       responsePatterns: {},
       accuracyHistory: []
     },
     personalization: {
       learningRate: 0.1,
       adaptationThreshold: 0.7
     }
   }
   ```

**Configuration** (`src/modules/adaptive/config/AdaptiveConfig.js`):
```javascript
{
  enabled: true,
  minQuestions: 20,
  maxQuestions: 60,
  confidenceThreshold: 0.85,

  questionSelection: {
    balanceWeight: 0.4,      // Balance across dimensions
    confidenceWeight: 0.3,    // Focus on low confidence
    diversityWeight: 0.3     // Question variety
  },

  earlyTermination: {
    enabled: true,
    minQuestionsAnswered: 20,
    minConfidence: 0.85,
    allDimensionsMustMeet: true
  },

  personalization: {
    enabled: true,
    learningRate: 0.1,
    adaptationThreshold: 0.7
  }
}
```

---

### 5. Analytics Module

#### 5.1 AnalyticsEngine (`src/modules/analytics/AnalyticsEngine.js`)

**Purpose**: Data visualization and chart generation

**Chart Types**:

1. **Radar Chart**
   - 8-point radar (E, I, S, N, T, F, J, P)
   - Visual personality profile
   - Canvas-based rendering

2. **Bar Chart**
   - Dimension comparison
   - Score visualization
   - Horizontal bars

3. **Balance Chart**
   - Preference balance
   - Side-by-side comparison
   - Percentage display

4. **Pie Chart**
   - Score distribution
   - Dimension breakdown
   - Interactive segments

5. **Timeline Chart**
   - Progress tracking
   - Historical data
   - Trend analysis

6. **Strengths Chart**
   - Top traits
   - Dominant dimensions
   - Strength levels

**Rendering Pipeline**:
```javascript
1. Data Preparation
   └─> prepareChartData(results)

2. Canvas Setup
   └─> setupCanvas(width, height)

3. Chart Rendering
   └─> renderChart(type, data, options)

4. Interactivity
   └─> addEventListeners()

5. Export
   └─> exportToImage() / exportToPDF()
```

---

### 6. VK Integration Module

#### 6.1 VKBridgeManager (`src/modules/vk/VKBridgeManager.js`)

**Purpose**: VKontakte Mini Apps integration orchestrator

**Architecture**:
```
VKBridgeManager (Orchestrator)
├── VKUserService (User management)
├── VKPaymentService (Payment processing)
├── VKAnalyticsService (Analytics tracking)
├── VKConfig (Configuration)
└── VKErrorHandler (Error handling)
```

**Features**:

1. **Bridge Initialization**
   ```javascript
   init() {
     // Check VK environment
     if (window.vkBridge) {
       this.bridge = window.vkBridge
       await this.bridge.send('VKWebAppInit')

       // Initialize services
       this.userService = new VKUserService(...)
       this.paymentService = new VKPaymentService(...)
       this.analyticsService = new VKAnalyticsService(...)

       // Apply VK styles
       this.applyVKStyles()

       // Subscribe to events
       this.bridge.subscribe(this.handleBridgeEvent)
     }
   }
   ```

2. **User Management** (VKUserService)
   ```javascript
   // Get user info
   getUserInfo()

   // Check premium status
   checkPremiumStatus()

   // Save user data
   saveUserDataToServer()

   // Manage premium status
   refreshPremiumStatus()
   ```

3. **Payment Processing** (VKPaymentService)
   ```javascript
   // Show order box
   showOrderBox(productId, productName)

   // Handle payment result
   handleOrderBoxResult(result)

   // Purchase subscription
   purchaseSubscription(tier)

   // Get payment status
   getPaymentStatus()
   ```

4. **Analytics Tracking** (VKAnalyticsService)
   ```javascript
   // Track events
   trackEvent(eventName, parameters)

   // Track user properties
   setUserProperties(properties)

   // Track quiz events
   trackQuizEvent(action, data)

   // Get analytics data
   getAnalyticsData()
   ```

5. **Error Handling** (VKErrorHandler)
   ```javascript
   // Handle VK errors
   handleError(error, context)

   // Provide fallbacks
   provideFallback(errorType)

   // Log errors
   logError(error)
   ```

**VK Bridge Events Handled**:
```javascript
- VKWebAppUpdateConfig        // Config updates
- VKWebAppViewRestrictions    // View restrictions
- VKWebAppGetUserInfoResult   // User info received
- VKWebAppGetLaunchParamsResult // Launch params
- VKWebAppShowOrderBoxResult  // Payment result
```

**VK Bridge Methods Used**:
```javascript
// App Control
VKWebAppInit
VKWebAppClose
VKWebAppExpand
VKWebAppResizeWindow

// User
VKWebAppGetUserInfo
VKWebAppGetLaunchParams

// UI
VKWebAppSetViewSettings
VKWebAppShowPopup
VKWebAppShowNotification

// Payment
VKWebAppShowOrderBox

// Sharing
VKWebAppShare

// Analytics
VKWebAppTrackEvent

// Ads
VKWebAppShowBannerAd
VKWebAppHideBannerAd
VKWebAppShowInterstitialAd
```

---

### 7. Localization Module

#### 7.1 LocalizationManager (`src/locales/LocalizationManager.js`)

**Purpose**: Multi-language support and i18n

**Supported Languages**:
- English (en)
- Russian (ru)

**Features**:

1. **Translation Access**
   ```javascript
   // Get translation by key path
   get('quiz.welcome.title')

   // With parameters
   get('quiz.progress', { current: 5, total: 20 })
   ```

2. **Locale Management**
   ```javascript
   // Set locale
   setLocale('ru')

   // Get current locale
   getCurrentLocale()

   // Get available locales
   getAvailableLocales()
   ```

3. **URL Synchronization**
   ```javascript
   // Update URL with locale
   updateURLWithLocale('en')

   // Get locale from URL
   getLocaleFromURL()
   ```

4. **Fallback System**
   - Primary: Requested locale
   - Fallback: Russian (default)
   - Last resort: Key path itself

**Translation Structure** (`src/locales/en.js` / `ru.js`):
```javascript
{
  app: {
    title: "Personality Test",
    description: "Discover your MBTI type"
  },
  quiz: {
    welcome: {
      title: "Welcome",
      start: "Start Quiz"
    },
    questions: {
      progress: "Question {current} of {total}",
      next: "Next",
      previous: "Previous"
    },
    results: {
      title: "Your Results",
      type: "Personality Type",
      download: "Download PDF"
    }
  },
  premium: {
    title: "Premium Features",
    description: "Unlock all quizzes",
    price: "Purchase for {price}"
  },
  errors: {
    loadFailed: "Failed to load quiz",
    networkError: "Network error"
  }
}
```

---

### 8. Data Layer

#### 8.1 Quiz Data Structure

**Main MBTI Questions** (`src/data/MainQuiz.js` / `.ru.js`):
```javascript
{
  id: "mbti_q1",
  question: "Do you prefer...",
  options: [
    "Being with others (E)",
    "Being alone (I)",
    "Both equally",
    "Neither specifically"
  ],
  dimension: "EI",  // E-I, S-N, T-F, J-P
  weights: [3, -3, 0, 0],  // Scoring weights
  type: "behavioral",  // behavioral, situational, preference
  difficulty: "medium"  // easy, medium, hard
}
```

**Specialized Questions** (`src/data/SpecializedQuiz.js` / `.ru.js`):
```javascript
{
  leadership: [ /* 20 questions */ ],
  communication: [ /* 20 questions */ ],
  stress: [ /* 20 questions */ ],
  // ... 13 more quiz types
}
```

**Personality Types** (`src/data/QuizData.js` / `.ru.js`):
```javascript
{
  INTJ: {
    code: "INTJ",
    title: "The Architect",
    subtitle: "Strategic Thinker",
    description: "Innovative thinkers with an unquenchable thirst for knowledge...",
    traits: ["Strategic", "Analytical", "Independent"],
    strengths: ["Planning", "Problem-solving", "Innovation"],
    weaknesses: ["Social interaction", "Emotional expression"],
    careers: ["Scientist", "Engineer", "Strategist"],
    relationships: ["Deep connections", "Intellectual partnerships"],
    percentage: 2,  // Population percentage
    compatibility: ["INTJ", "ENTP", "ENTJ"]
  },
  // ... 15 more types
}
```

---

## Data Flow

### 1. Quiz Flow
```
User starts quiz
   │
   ▼
QuizEngine.startQuiz()
   │
   ├─> Generate questions
   │   └─> Load from MainQuiz / SpecializedQuiz
   │
   ├─> Initialize adaptive engine (if enabled)
   │   └─> AdaptiveEngine.init()
   │
   └─> Update state
       └─> StateManager.setState()
           └─> Notify subscribers
               └─> UIManager.displayCurrentQuestion()
```

### 2. Answer Flow
```
User selects option
   │
   ▼
UIManager.selectOption()
   │
   └─> QuizEngine.selectOption()
       └─> StateManager.set('selectedOption')

User clicks Next
   │
   ▼
UIManager.nextQuestion()
   │
   └─> QuizEngine.nextQuestion()
       │
       ├─> Save answer
       ├─> Update scores
       ├─> Update adaptive engine (if enabled)
       │   └─> AdaptiveEngine.updateAssessmentState()
       │       └─> Update confidence scores
       │
       ├─> Check early completion (adaptive)
       │   └─> AdaptiveEngine.checkEarlyCompletion()
       │
       └─> Update state
           └─> StateManager.updateQuizProgress()
               └─> UIManager.displayCurrentQuestion()
```

### 3. Results Flow
```
Quiz completed
   │
   ▼
QuizEngine.completeQuiz()
   │
   ├─> Calculate personality type
   ├─> Calculate dimension breakdown
   ├─> Get adaptive analytics (if enabled)
   │
   └─> StateManager.setState({
         currentScreen: 'results',
         lastResults: results
       })
       │
       └─> UIManager.displayResults()
           │
           ├─> Load personality data
           ├─> Render charts
           │   └─> AnalyticsEngine.renderRadarChart()
           │   └─> AnalyticsEngine.renderBarChart()
           │
           └─> Show premium content (if applicable)
```

### 4. VK Integration Flow
```
App loads in VK
   │
   ▼
VKBridgeManager.init()
   │
   ├─> Detect VK environment
   ├─> Initialize VK Bridge
   │   └─> vkBridge.send('VKWebAppInit')
   │
   ├─> Initialize services
   │   ├─> VKUserService
   │   ├─> VKPaymentService
   │   └─> VKAnalyticsService
   │
   ├─> Get user info
   │   └─> VKUserService.getUserInfo()
   │       └─> vkBridge.send('VKWebAppGetUserInfo')
   │
   ├─> Check premium status
   │   └─> VKUserService.checkPremiumStatus()
   │       └─> API call to backend
   │
   └─> Configure appearance
       └─> vkBridge.send('VKWebAppSetViewSettings')
```

---

## Performance Optimizations

### 1. Element Caching
```javascript
// UIManager caches DOM elements on init
this.elements = this.cacheElements()

// No repeated querySelector calls
this.elements.questionText.textContent = question.question
```

### 2. State Batching
```javascript
// StateManager batches state updates
setState({ a: 1, b: 2, c: 3 })  // Single update
// vs
set('a', 1)  // Three separate updates
set('b', 2)
set('c', 3)
```

### 3. Lazy Loading
```javascript
// Questions loaded dynamically
async generateMBTIQuestions(isPremium) {
  const { MBTI_QUESTIONS } = await import('../../data/MainQuiz.js')
  return isPremium ? MBTI_QUESTIONS : MBTI_QUESTIONS.slice(0, 20)
}
```

### 4. LocalStorage Persistence
```javascript
// Only essential data persisted
saveToStorage() {
  const dataToSave = {
    theme: this.state.theme,
    language: this.state.language,
    lastResults: this.state.lastResults
  }
  localStorage.setItem('mbti_state', JSON.stringify(dataToSave))
}
```

### 5. Vite Build Optimization
```javascript
// vite.config.js
{
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['jspdf'],
          quiz: ['./src/modules/quiz/QuizEngine.js'],
          analytics: ['./src/modules/analytics/AnalyticsEngine.js']
        }
      }
    }
  }
}
```

---

## Security Considerations

### 1. Data Privacy
- All quiz data processed locally
- No server-side storage of quiz answers
- LocalStorage only for user preferences
- VK user data handled securely

### 2. Input Validation
- Question weights validated
- Answer indices bounds-checked
- Premium status verified server-side

### 3. XSS Prevention
- All user input sanitized
- No innerHTML with user data
- TextContent used for dynamic content

### 4. API Security
- VK Bridge signed requests
- Backend API validates VK signatures
- Premium status checked server-side

---

## Known Limitations

### 1. Browser Compatibility
- Requires ES6 module support
- LocalStorage required
- Canvas API for charts

### 2. VK Platform Constraints
- VK Bridge API version dependencies
- Payment processing VK-specific
- Limited offline functionality

### 3. Performance
- Large question pools may impact load time
- Canvas rendering performance varies by device
- No service worker (offline support)

### 4. Scalability
- Singleton pattern limits testing
- Global state can become complex
- Manual DOM manipulation error-prone

---

## Technical Debt

1. **No TypeScript**: Lack of type safety
2. **Manual DOM Manipulation**: Error-prone, hard to test
3. **No Component System**: Code reuse limited
4. **Limited Testing**: Manual testing primarily
5. **CSS Management**: Large monolithic CSS file
6. **No Server-Side Rendering**: SEO limitations
7. **No Hydration**: Client-side only
8. **Limited Code Splitting**: Manual chunk management

---

This detailed analysis provides a comprehensive understanding of the current architecture, serving as the foundation for the migration to Nuxt.js + Tailwind CSS.

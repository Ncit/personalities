# App Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current 3-screen personality quiz app (welcome/quiz/results) with a 4-tab dashboard architecture (Home/Explore/Results/Profile) using a new sage-and-cream design system, while preserving all existing business logic (quiz engine, VK auth, analytics, adaptive system).

**Architecture:** The app stays vanilla JS with ES modules and Vite. The monolithic `index.html` + `UIManager.js` + `styles.css` are replaced with a component-based structure: a new Router manages tab/overlay navigation, each screen is its own module, and a shared design-system CSS file provides all tokens and base components. Existing modules (QuizEngine, StateManager, VKBridgeManager, AnalyticsEngine, AdaptiveEngine, LocalizationManager) are reused as-is with minimal interface additions.

**Tech Stack:** Vanilla JS (ES modules), Vite 7, CSS custom properties, Google Fonts (Fraunces, Inter, IBM Plex Mono), Lucide icons (CDN), Firebase Analytics, VK Bridge

**Localization note:** All user-facing strings in this plan are written in English for readability. The existing `LocalizationManager` and translation files (`src/locales/en.js`, `src/locales/ru.js`) must be extended with keys for all new UI strings. This is deferred to a follow-up task after the structural migration is complete — the implementer should add `localizationManager.t('key')` calls once the new screens are working.

---

## File Structure

### New files to create

```
src/
├── styles/
│   ├── design-system.css          # Color tokens, typography, spacing, shadows, gradients
│   ├── components.css             # 19 reusable component styles (buttons, cards, bars, etc.)
│   ├── screens/
│   │   ├── home.css               # Home screen layout
│   │   ├── explore.css            # Explore screen layout (quizzes + types tabs)
│   │   ├── quiz.css               # Quiz overlay layout
│   │   ├── result-detail.css      # Result detail overlay layout
│   │   ├── results-timeline.css   # Results timeline tab layout
│   │   ├── profile.css            # Profile tab layout
│   │   └── premium-modal.css      # Premium bottom sheet
│   └── responsive.css             # Breakpoints (<768, 768-1024, >1024)
├── modules/
│   ├── router/
│   │   └── Router.js              # Tab navigation + overlay stack management
│   ├── ui/
│   │   ├── App.js                 # Root app shell (status bar + content + tab bar)
│   │   ├── TabBar.js              # Bottom tab bar component
│   │   ├── screens/
│   │   │   ├── HomeScreen.js      # Home dashboard with bento cards
│   │   │   ├── ExploreScreen.js   # Quiz catalog + types encyclopedia
│   │   │   ├── QuizScreen.js      # Full-screen quiz overlay
│   │   │   ├── ResultDetailScreen.js  # Result breakdown overlay
│   │   │   ├── ResultsTimelineScreen.js # Results history tab
│   │   │   └── ProfileScreen.js   # User stats, achievements, premium CTA
│   │   └── components/
│   │       ├── HeroCard.js        # Sage gradient hero CTA
│   │       ├── BentoGrid.js       # Home bento card layout
│   │       ├── TraitBar.js        # Single trait bar (letter + bar + %)
│   │       ├── DimensionBar.js    # Full dimension bar (labels + bar)
│   │       ├── TypeCard.js        # Type encyclopedia card
│   │       ├── QuizListItem.js    # Quiz catalog list item
│   │       ├── AchievementCard.js # Achievement display
│   │       ├── StatCard.js        # Stat value display
│   │       ├── PremiumModal.js    # Bottom sheet overlay
│   │       └── Toast.js           # Error/success toast notifications
│   └── results/
│       └── ResultsStore.js        # Results timeline data (localStorage)
```

### Files to modify

```
index.html                         # Replace body content with app shell markup
script.js                          # Replace init with new App.js bootstrap
src/modules/core/StateManager.js   # Add: currentTab, resultsHistory, achievements
vite.config.js                     # Add new chunk entries
```

### Files preserved as-is

```
src/modules/quiz/QuizEngine.js
src/modules/adaptive/*
src/modules/analytics/AnalyticsEngine.js
src/modules/vk/VKBridgeManager.js
src/modules/vk/services/*
src/modules/core/LoggerManager.js
src/data/*
src/locales/*
src/config/firebase.js
```

### Files to delete after migration

```
styles.css                         # Replaced by src/styles/*
src/modules/ui/UIManager.js        # Replaced by new screen modules
```

---

## Chunk 1: Design System & Infrastructure

### Task 1: CSS Design System Tokens

**Files:**
- Create: `src/styles/design-system.css`

- [ ] **Step 1: Create the design system CSS with all tokens**

```css
/* src/styles/design-system.css */
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz@9..144&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');

:root {
  /* Colors */
  --color-primary: #7C9082;
  --color-primary-dark: #5A7A64;
  --color-surface: #FAF8F5;
  --color-card: #FFFFFF;
  --color-border: #E8E4DF;
  --color-muted-bg: #F0EDE8;
  --color-text-primary: #2D2D2D;
  --color-text-secondary: #5A5A5A;
  --color-text-muted: #8A8A8A;
  --color-text-disabled: #ADADAD;
  --color-accent-purple: #8B7EC8;
  --color-accent-amber: #E8A85C;
  --color-accent-rose: #C47A8A;
  --color-accent-gold: #D4A574;
  --color-success: #6BAF8D;
  --color-info-blue: #5B82B0;
  --color-error: #D45C5C;

  /* Gradients */
  --gradient-sage: linear-gradient(135deg, #7C9082, #5A7A64);
  --gradient-purple: linear-gradient(160deg, #8B7EC820, #8B7EC808);
  --gradient-amber: linear-gradient(160deg, #E8A85C20, #E8A85C08);
  --gradient-gold: linear-gradient(135deg, #D4A57430, #D4A57410);

  /* Shadows */
  --shadow-tab-bar: 0 4px 20px #0000000A;
  --shadow-card-elevated: 0 2px 8px #00000008;

  /* Typography */
  --font-display: 'Fraunces', Georgia, serif;
  --font-body: 'Inter', -apple-system, sans-serif;
  --font-mono: 'IBM Plex Mono', 'Courier New', monospace;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 20px;
  --space-2xl: 24px;
  --space-3xl: 32px;

  /* Radii */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-pill: 24px;
  --radius-tab-bar: 36px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: var(--font-body);
  background: var(--color-surface);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 2: Verify fonts load by opening dev server**

Run: `cd /Users/nikitaf/development/projects/personalities && npx vite --port 3002 &`
Open browser, check Network tab for Fraunces, Inter, IBM Plex Mono loading.
Expected: All 3 font families load successfully.

- [ ] **Step 3: Commit**

```bash
git add src/styles/design-system.css
git commit -m "feat: add CSS design system with color tokens, typography, spacing"
```

---

### Task 2: Component Styles

**Files:**
- Create: `src/styles/components.css`

- [ ] **Step 1: Create component styles for all 19 design system components**

```css
/* src/styles/components.css */

/* 1. Button/Primary */
.btn-primary {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px 28px;
  background: var(--color-primary);
  color: #fff;
  border: none; border-radius: var(--radius-pill);
  font: 600 14px/1 var(--font-body);
  cursor: pointer; transition: background 0.2s;
}
.btn-primary:hover { background: var(--color-primary-dark); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

/* 2. Button/Secondary */
.btn-secondary {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px 28px;
  background: var(--color-muted-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border); border-radius: var(--radius-pill);
  font: 500 14px/1 var(--font-body);
  cursor: pointer; transition: background 0.2s;
}
.btn-secondary:hover { background: var(--color-border); }
.btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-secondary .icon { color: var(--color-primary); }

/* 3. Badge */
.badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font: 500 11px/1 var(--font-body);
  letter-spacing: 0.3px;
  text-transform: uppercase;
}
.badge--sage { background: #7C908220; color: var(--color-primary); }
.badge--gold { background: #D4A57430; color: #9B7A4A; }
.badge--amber { background: #E8A85C20; color: #B07830; }
.badge--purple { background: #8B7EC820; color: #6B5EA8; }

/* 4. Card */
.card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
}

/* 5. Stat Card */
.stat-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  flex: 1;
}
.stat-card__label {
  font: 500 13px/1 var(--font-body);
  color: var(--color-text-muted);
  margin-bottom: 8px;
}
.stat-card__value {
  font: 500 28px/1 var(--font-mono);
  color: var(--color-text-primary);
}

/* 6. Type Card */
.type-card {
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--color-border);
}
.type-card__header {
  background: var(--gradient-sage);
  padding: 16px;
  text-align: center;
}
.type-card__code {
  font: 500 32px/1 var(--font-mono);
  color: #fff;
}
.type-card__body {
  background: var(--color-card);
  padding: 16px;
}
.type-card__name {
  font: 400 16px/1.3 var(--font-display);
  color: var(--color-text-primary);
  margin-bottom: 4px;
}
.type-card__desc {
  font: 400 13px/1.4 var(--font-body);
  color: var(--color-text-secondary);
}

/* 7-8. Nav Item */
.nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font: 400 14px/1 var(--font-body);
  cursor: pointer;
}
.nav-item--active {
  background: #7C908215;
  color: var(--color-primary);
  font-weight: 500;
}

/* 9. Status Bar */
.status-bar {
  height: 62px;
  padding: 0 20px;
  display: flex; align-items: flex-end; justify-content: space-between;
  padding-bottom: 8px;
  color: var(--color-text-primary);
  font: 500 15px/1 var(--font-body);
}

/* 10-11. Tab Item */
.tab-item {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  color: var(--color-text-muted);
  cursor: pointer; transition: all 0.2s;
  border: none; background: none;
}
.tab-item__icon { width: 20px; height: 20px; }
.tab-item__label {
  font: 600 10px/1 var(--font-body);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.tab-item--active {
  background: var(--color-primary);
  color: #fff;
}

/* 12. Tab Bar */
.tab-bar {
  position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 4px;
  padding: 6px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-tab-bar);
  box-shadow: var(--shadow-tab-bar);
  z-index: 100;
}

/* 13. Hero Card */
.hero-card {
  background: var(--gradient-sage);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  color: #fff;
}
.hero-card__badge {
  display: inline-flex; padding: 4px 10px;
  background: rgba(255,255,255,0.2);
  border-radius: var(--radius-pill);
  font: 500 11px/1 var(--font-body);
  margin-bottom: 12px;
}
.hero-card__title {
  font: 400 22px/1.3 var(--font-display);
  margin-bottom: 8px;
}
.hero-card__subtitle {
  font: 400 13px/1.4 var(--font-body);
  opacity: 0.8;
}

/* 14-15. Answer Option */
.answer-option {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 18px var(--space-xl);
  font: 400 14px/1.4 var(--font-body);
  color: var(--color-text-primary);
  cursor: pointer; transition: all 0.2s;
  width: 100%; text-align: left;
}
.answer-option:hover { border-color: var(--color-primary); }
.answer-option--selected {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

/* 16. Trait Bar */
.trait-bar {
  display: flex; align-items: center; gap: 10px;
}
.trait-bar__letter {
  font: 500 14px/1 var(--font-mono);
  color: var(--color-text-secondary);
  width: 16px; text-align: center;
}
.trait-bar__track {
  flex: 1; height: 8px;
  background: var(--color-muted-bg);
  border-radius: 4px; overflow: hidden;
}
.trait-bar__fill {
  height: 100%; border-radius: 4px;
  background: var(--color-primary);
  transition: width 0.4s ease;
}
.trait-bar__percent {
  font: 400 11px/1 var(--font-mono);
  color: var(--color-text-muted);
  width: 32px; text-align: right;
}

/* 17. Achievement Card */
.achievement-card {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px 0;
}
.achievement-card__icon-wrap {
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-md);
  background: #7C908215;
  color: var(--color-primary);
  flex-shrink: 0;
}
.achievement-card--locked .achievement-card__icon-wrap {
  background: var(--color-muted-bg);
  color: var(--color-text-disabled);
}
.achievement-card__title {
  font: 500 14px/1.3 var(--font-body);
  color: var(--color-text-primary);
}
.achievement-card--locked .achievement-card__title {
  color: var(--color-text-muted);
}
.achievement-card__desc {
  font: 400 13px/1.4 var(--font-body);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

/* 18. Dimension Bar */
.dimension-bar {
  display: flex; flex-direction: column; gap: 6px;
}
.dimension-bar__labels {
  display: flex; justify-content: space-between;
  font: 400 13px/1 var(--font-body);
}
.dimension-bar__left { color: var(--color-text-primary); }
.dimension-bar__right { color: var(--color-text-muted); }
.dimension-bar__track {
  height: 8px;
  background: var(--color-muted-bg);
  border-radius: 4px; overflow: hidden;
}
.dimension-bar__fill {
  height: 100%; border-radius: 4px;
  transition: width 0.4s ease;
}

/* 19. Quiz List Item */
.quiz-list-item {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 0;
  cursor: pointer;
}
.quiz-list-item__icon-wrap {
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}
.quiz-list-item__info { flex: 1; }
.quiz-list-item__title {
  font: 400 16px/1.3 var(--font-display);
  color: var(--color-text-primary);
}
.quiz-list-item__meta {
  font: 400 13px/1.4 var(--font-body);
  color: var(--color-text-muted);
  margin-top: 2px;
}
.quiz-list-item__chevron {
  color: var(--color-text-disabled);
  flex-shrink: 0;
}

/* Utility: Scrollable content area */
.screen-content {
  padding: 8px 20px 20px;
  padding-bottom: 100px; /* space for tab bar */
  overflow-y: auto;
  flex: 1;
}

/* Utility: Section label */
.section-label {
  font: 500 13px/1 var(--font-body);
  color: var(--color-text-muted);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin: 20px 0 12px;
}

/* Utility: Page title */
.page-title {
  font: 400 28px/1.2 var(--font-display);
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

/* Overlay backdrop */
.overlay-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.37);
  z-index: 200;
  display: flex; align-items: flex-end; justify-content: center;
}

/* Bottom sheet */
.bottom-sheet {
  background: var(--color-card);
  border-radius: 24px 24px 0 0;
  padding: 12px 24px 40px;
  width: 100%; max-width: 500px;
  max-height: 90vh; overflow-y: auto;
}
.bottom-sheet__handle {
  width: 40px; height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  margin: 0 auto 20px;
}

/* Toast */
.toast {
  position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: var(--radius-md);
  font: 400 14px/1.4 var(--font-body);
  z-index: 300;
  animation: toastIn 0.3s ease;
}
.toast--error {
  background: #FEE; border: 1px solid #D45C5C40;
  color: var(--color-error);
}
.toast--success {
  background: #EFE; border: 1px solid #6BAF8D40;
  color: #3A7A5A;
}
@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* Segmented Control */
.segmented-control {
  display: flex; gap: 4px;
  background: var(--color-muted-bg);
  border-radius: var(--radius-pill);
  padding: 4px;
}
.segmented-control__item {
  flex: 1; text-align: center;
  padding: 10px 16px;
  border-radius: var(--radius-pill);
  font: 500 14px/1 var(--font-body);
  color: var(--color-text-muted);
  cursor: pointer; border: none; background: none;
  transition: all 0.2s;
}
.segmented-control__item--active {
  background: var(--color-card);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-card-elevated);
}

/* Spinner */
.spinner {
  width: 24px; height: 24px;
  border: 3px solid var(--color-muted-bg);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Loading screen */
.loading-screen {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 16px; flex: 1;
  color: var(--color-text-muted);
  font: 400 14px/1 var(--font-body);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/components.css
git commit -m "feat: add component styles for all 19 design system components"
```

---

### Task 3: Router Module

**Files:**
- Create: `src/modules/router/Router.js`

- [ ] **Step 1: Create the Router module**

```js
// src/modules/router/Router.js
import { LoggerManager } from '../core/LoggerManager.js';

const logger = new LoggerManager().createModuleLogger('Router');

class Router {
  constructor() {
    this.tabs = ['home', 'explore', 'results', 'profile'];
    this.currentTab = 'home';
    this.overlayStack = []; // ['quiz', 'result-detail', 'premium-modal']
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify() {
    const state = this.getState();
    this.subscribers.forEach(cb => cb(state));
    logger.log('Route changed:', state);
  }

  getState() {
    return {
      tab: this.currentTab,
      overlay: this.overlayStack[this.overlayStack.length - 1] || null,
      overlayData: this._overlayData || null,
    };
  }

  navigateTab(tab) {
    if (!this.tabs.includes(tab)) return;
    if (this.overlayStack.length > 0) return; // don't switch tabs while overlay open
    this.currentTab = tab;
    this.notify();
  }

  openOverlay(name, data = null) {
    this._overlayData = data;
    this.overlayStack.push(name);
    this.notify();
  }

  closeOverlay() {
    this.overlayStack.pop();
    this._overlayData = this.overlayStack.length > 0 ? this._overlayData : null;
    this.notify();
  }

  closeAllOverlays() {
    this.overlayStack = [];
    this._overlayData = null;
    this.notify();
  }
}

export const router = new Router();
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/router/Router.js
git commit -m "feat: add Router module for tab navigation and overlay management"
```

---

### Task 4: Results Store

**Files:**
- Create: `src/modules/results/ResultsStore.js`

- [ ] **Step 1: Create ResultsStore for timeline data**

```js
// src/modules/results/ResultsStore.js
import { LoggerManager } from '../core/LoggerManager.js';

const logger = new LoggerManager().createModuleLogger('ResultsStore');
const STORAGE_KEY = 'quiz_results_history';

class ResultsStore {
  constructor() {
    this.results = this._load();
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  _notify() {
    this.subscribers.forEach(cb => cb(this.results));
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      logger.error('Failed to load results:', e);
      return [];
    }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.results));
    } catch (e) {
      logger.error('Failed to save results:', e);
    }
  }

  addResult(result) {
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      framework: result.framework || 'mbti',
      typeCode: result.typeCode,
      typeName: result.typeName,
      dimensions: result.dimensions, // { E: 72, I: 28, S: 35, N: 65, ... }
      confidence: result.confidence || null,
      date: new Date().toISOString(),
    };
    this.results.unshift(entry);
    this._save();
    this._notify();
    logger.log('Result added:', entry);
    return entry;
  }

  getAll() {
    return [...this.results];
  }

  getLatestByFramework(framework) {
    return this.results.find(r => r.framework === framework) || null;
  }

  getCount() {
    return this.results.length;
  }

  getAverageConfidence() {
    const withConfidence = this.results.filter(r => r.confidence != null);
    if (withConfidence.length === 0) return null;
    const sum = withConfidence.reduce((acc, r) => acc + r.confidence, 0);
    return Math.round(sum / withConfidence.length);
  }

  // Migrate existing single-result from old StateManager
  // Old format: { personalityType: 'ENFP', dimensionBreakdown: { EI: {E,I}, SN: {S,N}, ... }, scores: {...} }
  migrateFromLegacy() {
    const legacy = localStorage.getItem('mbti_last_results');
    if (legacy && this.results.length === 0) {
      try {
        const old = JSON.parse(legacy);
        if (old && old.personalityType) {
          const dims = old.dimensionBreakdown || {};
          this.addResult({
            framework: 'mbti',
            typeCode: old.personalityType,
            typeName: old.personalityType,
            dimensions: {
              E: dims.EI?.E || 50, I: dims.EI?.I || 50,
              S: dims.SN?.S || 50, N: dims.SN?.N || 50,
              T: dims.TF?.T || 50, F: dims.TF?.F || 50,
              J: dims.JP?.J || 50, P: dims.JP?.P || 50,
            },
            confidence: old.adaptiveAnalytics?.confidenceScores || null,
          });
          logger.log('Migrated legacy result');
        }
      } catch (e) {
        logger.error('Failed to migrate legacy result:', e);
      }
    }
  }
}

export const resultsStore = new ResultsStore();
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/results/ResultsStore.js
git commit -m "feat: add ResultsStore for timeline data with localStorage persistence"
```

---

### Task 5: Extend StateManager

**Files:**
- Modify: `src/modules/core/StateManager.js`

- [ ] **Step 1: Add new state fields for redesign**

Add to the state object in the constructor (after line 37):

```js
// Add these to this.state in constructor:
currentTab: 'home',           // 'home' | 'explore' | 'results' | 'profile'
achievements: {
  firstSteps: false,           // completed first quiz
  onFire: false,              // 3+ quizzes in a week
  highAccuracy: false,         // confidence >= 85%
  explorer: false,             // 5+ different types
  specialist: false,           // all premium quizzes done
  master: false,               // all available tests done
},
```

- [ ] **Step 2: Add achievement checking method**

```js
// Add after the setQuizType method:
checkAchievements(resultsStore) {
  const count = resultsStore.getCount();
  const confidence = resultsStore.getAverageConfidence();
  const updated = { ...this.state.achievements };

  if (count >= 1) updated.firstSteps = true;
  if (confidence && confidence >= 85) updated.highAccuracy = true;

  this.setState({ achievements: updated });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/core/StateManager.js
git commit -m "feat: extend StateManager with tab state and achievements"
```

---

### Task 6: Update Vite Config

**Files:**
- Modify: `vite.config.js`

- [ ] **Step 1: Add CSS import handling to vite config**

No changes needed — Vite handles CSS imports from JS automatically. The new CSS files will be imported from `App.js`. Skip this task.

---

## Chunk 2: App Shell & Tab Navigation

### Task 7: HTML App Shell

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace body content with app shell**

Keep the `<head>` section (Firebase, VK SDK scripts) but replace the `<body>` content. The new body should contain only an app root container. All screen content will be rendered by JS modules.

Replace everything inside `<body>` (after any inline scripts for VK/Firebase init) with:

```html
<div id="app">
  <div id="screen-container"></div>
  <nav id="tab-bar" class="tab-bar"></nav>
</div>
<div id="overlay-container"></div>
<div id="toast-container"></div>

<script type="module" src="./script.js"></script>
```

Keep the existing `<script>` blocks for VK Bridge initialization and Firebase config that are in `<head>`.

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: replace HTML body with minimal app shell for new architecture"
```

---

### Task 8: TabBar Component

**Files:**
- Create: `src/modules/ui/TabBar.js`

- [ ] **Step 1: Create TabBar component**

```js
// src/modules/ui/TabBar.js
import { router } from '../router/Router.js';

const TABS = [
  { id: 'home', label: 'HOME', icon: 'layout-dashboard' },
  { id: 'explore', label: 'EXPLORE', icon: 'compass' },
  { id: 'results', label: 'RESULTS', icon: 'chart-bar' },
  { id: 'profile', label: 'PROFILE', icon: 'user' },
];

export class TabBar {
  constructor(container) {
    this.container = container;
    this.render();
    router.subscribe(() => this.updateActive());
  }

  render() {
    this.container.innerHTML = TABS.map(tab => `
      <button class="tab-item ${router.getState().tab === tab.id ? 'tab-item--active' : ''}"
              data-tab="${tab.id}">
        <i data-lucide="${tab.icon}" class="tab-item__icon"></i>
        <span class="tab-item__label">${tab.label}</span>
      </button>
    `).join('');

    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-item');
      if (btn) router.navigateTab(btn.dataset.tab);
    });

    // Initialize Lucide icons
    if (window.lucide) window.lucide.createIcons({ nodes: [this.container] });
  }

  updateActive() {
    const { tab, overlay } = router.getState();
    // Hide tab bar when overlay is open
    this.container.style.display = overlay ? 'none' : 'flex';

    this.container.querySelectorAll('.tab-item').forEach(btn => {
      btn.classList.toggle('tab-item--active', btn.dataset.tab === tab);
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/ui/TabBar.js
git commit -m "feat: add TabBar component with Lucide icons"
```

---

### Task 9: App Shell Module

**Files:**
- Create: `src/modules/ui/App.js`

- [ ] **Step 1: Create App shell that orchestrates screens**

```js
// src/modules/ui/App.js

// Styles
import '../../styles/design-system.css';
import '../../styles/components.css';

import { router } from '../router/Router.js';
import { TabBar } from './TabBar.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { ExploreScreen } from './screens/ExploreScreen.js';
import { ResultsTimelineScreen } from './screens/ResultsTimelineScreen.js';
import { ProfileScreen } from './screens/ProfileScreen.js';
import { QuizScreen } from './screens/QuizScreen.js';
import { ResultDetailScreen } from './screens/ResultDetailScreen.js';
import { PremiumModal } from './components/PremiumModal.js';
import { resultsStore } from '../results/ResultsStore.js';
import { LoggerManager } from '../core/LoggerManager.js';

const logger = new LoggerManager().createModuleLogger('App');

export class App {
  constructor() {
    this.screenContainer = document.getElementById('screen-container');
    this.overlayContainer = document.getElementById('overlay-container');
    this.tabBar = new TabBar(document.getElementById('tab-bar'));

    // Initialize screens (lazy — only render when navigated to)
    this.screens = {
      home: new HomeScreen(),
      explore: new ExploreScreen(),
      results: new ResultsTimelineScreen(),
      profile: new ProfileScreen(),
    };

    this.overlays = {
      quiz: () => new QuizScreen(),
      'result-detail': () => new ResultDetailScreen(),
      'premium-modal': () => new PremiumModal(),
    };

    this.currentOverlay = null;

    // Migrate legacy results
    resultsStore.migrateFromLegacy();

    // Listen to route changes
    router.subscribe((state) => this.onRouteChange(state));

    // Initial render
    this.onRouteChange(router.getState());

    logger.log('App initialized');
  }

  onRouteChange({ tab, overlay, overlayData }) {
    // Update tab screen
    Object.entries(this.screens).forEach(([id, screen]) => {
      const el = screen.getElement();
      el.style.display = id === tab ? '' : 'none';
      if (id === tab && screen.onActivate) screen.onActivate();
    });

    // Ensure all screen elements are in the container
    Object.values(this.screens).forEach(screen => {
      const el = screen.getElement();
      if (!el.parentElement) this.screenContainer.appendChild(el);
    });

    // Handle overlay
    if (overlay) {
      if (!this.currentOverlay || this.currentOverlay._name !== overlay) {
        this.overlayContainer.innerHTML = '';
        const OverlayFactory = this.overlays[overlay];
        if (OverlayFactory) {
          this.currentOverlay = OverlayFactory();
          this.currentOverlay._name = overlay;
          if (overlayData && this.currentOverlay.setData) {
            this.currentOverlay.setData(overlayData);
          }
          this.overlayContainer.appendChild(this.currentOverlay.getElement());
        }
      }
    } else {
      this.overlayContainer.innerHTML = '';
      this.currentOverlay = null;
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/ui/App.js
git commit -m "feat: add App shell module orchestrating screens and overlays"
```

---

### Task 10: Update script.js Entry Point

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Add new App import and initialization**

Keep all existing Firebase/VK init code. At the end of the DOMContentLoaded handler (or after VK init), add:

```js
import { App } from './src/modules/ui/App.js';

// After existing Firebase and VK initialization:
const app = new App();
window.app = app; // expose for VK callbacks
```

The existing `handleUserInfo`, Firebase analytics setup, and VK Bridge initialization remain. The old UIManager import and instantiation should be removed (or commented out initially during migration, then deleted in the cleanup task).

- [ ] **Step 2: Commit**

```bash
git add script.js
git commit -m "feat: bootstrap new App shell from script.js entry point"
```

---

## Chunk 3: Screen Implementations

### Task 11: Home Screen

**Files:**
- Create: `src/modules/ui/screens/HomeScreen.js`
- Create: `src/modules/ui/components/HeroCard.js`
- Create: `src/modules/ui/components/BentoGrid.js`
- Create: `src/modules/ui/components/TraitBar.js`
- Create: `src/styles/screens/home.css`

- [ ] **Step 1: Create TraitBar component**

```js
// src/modules/ui/components/TraitBar.js
export class TraitBar {
  static render(letter, percent, color = 'var(--color-primary)') {
    return `
      <div class="trait-bar">
        <span class="trait-bar__letter">${letter}</span>
        <div class="trait-bar__track">
          <div class="trait-bar__fill" style="width:${percent}%;background:${color}"></div>
        </div>
        <span class="trait-bar__percent">${percent}%</span>
      </div>
    `;
  }
}
```

- [ ] **Step 2: Create HeroCard component**

```js
// src/modules/ui/components/HeroCard.js
import { router } from '../../router/Router.js';
import { resultsStore } from '../../results/ResultsStore.js';

export class HeroCard {
  static render() {
    const mbtiResult = resultsStore.getLatestByFramework('mbti');
    const badge = mbtiResult ? 'Retake Quiz' : 'MBTI Quiz';
    const title = mbtiResult
      ? 'Retake the MBTI Quiz'
      : 'Discover Your\nPersonality Type';
    const subtitle = mbtiResult
      ? 'See if your type has changed'
      : '60 questions · 15 min · Free';

    return `
      <div class="hero-card" id="hero-card">
        <div class="hero-card__badge">${badge}</div>
        <div class="hero-card__title">${title}</div>
        <div class="hero-card__subtitle">${subtitle}</div>
      </div>
    `;
  }

  static bind(container) {
    container.querySelector('#hero-card')?.addEventListener('click', () => {
      router.openOverlay('quiz', { framework: 'mbti' });
    });
  }
}
```

- [ ] **Step 3: Create BentoGrid component**

```js
// src/modules/ui/components/BentoGrid.js
import { TraitBar } from './TraitBar.js';
import { resultsStore } from '../../results/ResultsStore.js';
import { router } from '../../router/Router.js';

export class BentoGrid {
  static render() {
    const mbti = resultsStore.getLatestByFramework('mbti');
    return `
      <div class="bento-row">
        ${BentoGrid._typeCard(mbti)}
        ${BentoGrid._compareCard()}
      </div>
      <div class="bento-row">
        ${BentoGrid._traitsCard(mbti)}
        ${BentoGrid._frameworkSlot()}
      </div>
    `;
  }

  static _typeCard(mbti) {
    if (!mbti) {
      return `<div class="card bento-card bento-card--type">
        <div class="bento-card__label">Your Type</div>
        <div class="bento-card__empty">Take a quiz to discover</div>
      </div>`;
    }
    return `<div class="card bento-card bento-card--type" data-action="view-result" data-id="${mbti.id}">
      <div class="bento-card__label">Your Type</div>
      <div class="bento-card__code">${mbti.typeCode}</div>
      <div class="bento-card__name">${mbti.typeName}</div>
    </div>`;
  }

  static _compareCard() {
    return `<div class="card bento-card bento-card--compare">
      <i data-lucide="users" style="width:20px;height:20px;color:var(--color-accent-purple)"></i>
      <div class="bento-card__label">Compare</div>
      <div class="bento-card__link">With Friends →</div>
    </div>`;
  }

  static _traitsCard(mbti) {
    const dims = mbti?.dimensions || {};
    const bars = [
      { letter: 'E', pct: dims.E || 50, color: 'var(--color-primary)' },
      { letter: 'N', pct: dims.N || 50, color: 'var(--color-accent-gold)' },
      { letter: 'F', pct: dims.F || 50, color: 'var(--color-success)' },
      { letter: 'P', pct: dims.P || 50, color: 'var(--color-info-blue)' },
    ];
    return `<div class="card bento-card bento-card--traits">
      <div class="bento-card__label">Traits</div>
      ${bars.map(b => TraitBar.render(b.letter, b.pct, b.color)).join('')}
    </div>`;
  }

  static _frameworkSlot() {
    return `<div class="card bento-card bento-card--framework" style="background:var(--gradient-amber);min-width:140px">
      <span class="badge badge--amber">New!</span>
      <i data-lucide="sparkles" style="width:24px;height:24px;color:var(--color-accent-amber);margin:8px 0"></i>
      <div class="bento-card__label" style="color:var(--color-accent-amber)">Socionics</div>
    </div>`;
  }

  static bind(container) {
    container.querySelectorAll('[data-action="view-result"]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        router.openOverlay('result-detail', { resultId: id });
      });
    });
  }
}
```

- [ ] **Step 4: Create home.css**

```css
/* src/styles/screens/home.css */
.home-screen .page-title { margin-bottom: 4px; }
.home-screen .page-subtitle {
  font: 400 14px/1.4 var(--font-body);
  color: var(--color-text-muted);
  margin-bottom: 20px;
}

.bento-row {
  display: flex; gap: 12px;
  margin-bottom: 12px;
}
.bento-card {
  flex: 1; padding: 16px;
  display: flex; flex-direction: column;
}
.bento-card__label {
  font: 500 13px/1 var(--font-body);
  color: var(--color-text-muted);
  margin-bottom: 8px;
}
.bento-card__code {
  font: 500 32px/1 var(--font-mono);
  color: var(--color-primary);
  margin-bottom: 4px;
}
.bento-card__name {
  font: 400 16px/1.3 var(--font-display);
}
.bento-card__empty {
  font: 400 13px/1.4 var(--font-body);
  color: var(--color-text-disabled);
}
.bento-card__link {
  font: 500 13px/1 var(--font-body);
  color: var(--color-accent-purple);
  margin-top: auto;
}
.bento-card--compare {
  background: var(--gradient-purple);
}
.bento-card--framework {
  min-width: 140px; max-width: 140px;
}
.bento-card--traits {
  display: flex; flex-direction: column; gap: 8px;
}

.share-card {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 20px;
}
.share-card__info { flex: 1; }
.share-card__title {
  font: 400 18px/1.3 var(--font-display);
  margin-bottom: 4px;
}
.share-card__subtitle {
  font: 400 13px/1.4 var(--font-body);
  color: var(--color-text-muted);
}
```

- [ ] **Step 5: Create HomeScreen module**

```js
// src/modules/ui/screens/HomeScreen.js
import '../../../styles/screens/home.css';
import { HeroCard } from '../components/HeroCard.js';
import { BentoGrid } from '../components/BentoGrid.js';
import { resultsStore } from '../../results/ResultsStore.js';
import { router } from '../../router/Router.js';

export class HomeScreen {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'home-screen screen-content';
    this.render();
  }

  getElement() { return this.el; }

  onActivate() { this.render(); }

  render() {
    const hasResults = resultsStore.getCount() > 0;

    this.el.innerHTML = `
      <h1 class="page-title">Discover Yourself</h1>
      <p class="page-subtitle">Your personality journey starts here</p>
      ${HeroCard.render()}
      ${BentoGrid.render()}
      ${hasResults ? this._shareCard() : ''}
    `;

    HeroCard.bind(this.el);
    BentoGrid.bind(this.el);

    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });

    // Share button
    this.el.querySelector('#share-btn')?.addEventListener('click', () => {
      // Native share or VK share
      if (navigator.share) {
        navigator.share({ title: 'My Personality Type', url: window.location.href });
      }
    });
  }

  _shareCard() {
    return `
      <div class="card share-card">
        <div class="share-card__info">
          <div class="share-card__title">Share Your Type</div>
          <div class="share-card__subtitle">Show friends your personality</div>
        </div>
        <button class="btn-primary" id="share-btn">
          <i data-lucide="share-2" style="width:16px;height:16px"></i> Share
        </button>
      </div>
    `;
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/modules/ui/screens/HomeScreen.js src/modules/ui/components/HeroCard.js src/modules/ui/components/BentoGrid.js src/modules/ui/components/TraitBar.js src/styles/screens/home.css
git commit -m "feat: add Home screen with hero card, bento grid, trait bars"
```

---

### Task 12: Explore Screen

**Files:**
- Create: `src/modules/ui/screens/ExploreScreen.js`
- Create: `src/modules/ui/components/QuizListItem.js`
- Create: `src/modules/ui/components/TypeCard.js`
- Create: `src/styles/screens/explore.css`

- [ ] **Step 1: Create QuizListItem component**

```js
// src/modules/ui/components/QuizListItem.js
export class QuizListItem {
  static render({ icon, title, meta, accent, onClick }) {
    return `
      <div class="quiz-list-item" data-quiz="${title}">
        <div class="quiz-list-item__icon-wrap" style="background:${accent}15;color:${accent}">
          <i data-lucide="${icon}" style="width:20px;height:20px"></i>
        </div>
        <div class="quiz-list-item__info">
          <div class="quiz-list-item__title">${title}</div>
          <div class="quiz-list-item__meta">${meta}</div>
        </div>
        <i data-lucide="chevron-right" class="quiz-list-item__chevron" style="width:18px;height:18px"></i>
      </div>
    `;
  }
}
```

- [ ] **Step 2: Create TypeCard component**

```js
// src/modules/ui/components/TypeCard.js
export class TypeCard {
  static render({ code, name, description, gradient }) {
    return `
      <div class="type-card" data-type-code="${code}">
        <div class="type-card__header" style="background:${gradient || 'var(--gradient-sage)'}">
          <div class="type-card__code">${code}</div>
        </div>
        <div class="type-card__body">
          <div class="type-card__name">${name}</div>
          <div class="type-card__desc">${description}</div>
        </div>
      </div>
    `;
  }
}
```

- [ ] **Step 3: Create explore.css**

```css
/* src/styles/screens/explore.css */
.explore-screen .segmented-control { margin-bottom: 20px; }

.quiz-section { margin-bottom: 8px; }
.quiz-section .quiz-list-item + .quiz-list-item {
  border-top: 1px solid var(--color-border);
}

.types-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.filter-pills {
  display: flex; gap: 8px;
  overflow-x: auto; padding-bottom: 12px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.filter-pills::-webkit-scrollbar { display: none; }

.filter-pill {
  white-space: nowrap;
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
  background: var(--color-card);
  font: 400 13px/1 var(--font-body);
  color: var(--color-text-secondary);
  cursor: pointer;
}
.filter-pill--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.types-empty {
  text-align: center; padding: 40px 20px;
  color: var(--color-text-muted);
  font: 400 14px/1.4 var(--font-body);
}
```

- [ ] **Step 4: Create ExploreScreen module**

```js
// src/modules/ui/screens/ExploreScreen.js
import '../../../styles/screens/explore.css';
import { QuizListItem } from '../components/QuizListItem.js';
import { TypeCard } from '../components/TypeCard.js';
import { router } from '../../router/Router.js';
import { stateManager } from '../../core/StateManager.js';

const QUIZZES = {
  frameworks: [
    { icon: 'brain', title: 'MBTI', meta: '60 questions · 15 min · Free', accent: '#7C9082', framework: 'mbti' },
    { icon: 'sparkles', title: 'Socionics', meta: '40 questions · 10 min · Free', accent: '#E8A85C', framework: 'socionics' },
    { icon: 'heart', title: 'Enneagram', meta: 'Coming soon', accent: '#C47A8A', framework: 'enneagram' },
  ],
  premium: [
    { icon: 'crown', title: 'Leadership Style', meta: '30 questions · 10 min · Premium', accent: '#D4A574', framework: 'leadership' },
    { icon: 'message-circle', title: 'Communication', meta: '25 questions · 8 min · Premium', accent: '#D4A574', framework: 'communication' },
    { icon: 'zap', title: 'Stress Response', meta: '20 questions · 7 min · Premium', accent: '#D4A574', framework: 'stress' },
  ],
};

// Import MBTI types data for types tab
const MBTI_CATEGORIES = {
  Analysts: ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
  Diplomats: ['INFJ', 'INFP', 'ENFJ', 'ENFP'],
  Sentinels: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
  Explorers: ['ISTP', 'ISFP', 'ESTP', 'ESFP'],
};

export class ExploreScreen {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'explore-screen screen-content';
    this.activeTab = 'quizzes'; // 'quizzes' | 'types'
    this.activeFilter = 'All';
    this.render();
  }

  getElement() { return this.el; }
  onActivate() { this.render(); }

  render() {
    this.el.innerHTML = `
      <h1 class="page-title">Explore</h1>
      <div class="segmented-control">
        <button class="segmented-control__item ${this.activeTab === 'quizzes' ? 'segmented-control__item--active' : ''}" data-tab="quizzes">Quizzes</button>
        <button class="segmented-control__item ${this.activeTab === 'types' ? 'segmented-control__item--active' : ''}" data-tab="types">Types</button>
      </div>
      ${this.activeTab === 'quizzes' ? this._quizzesTab() : this._typesTab()}
    `;

    this._bind();
    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }

  _quizzesTab() {
    return `
      <div class="quiz-section">
        <div class="section-label">Personality Frameworks</div>
        ${QUIZZES.frameworks.map(q => QuizListItem.render(q)).join('')}
      </div>
      <div class="quiz-section">
        <div class="section-label">Premium Quizzes</div>
        ${QUIZZES.premium.map(q => QuizListItem.render(q)).join('')}
      </div>
    `;
  }

  _typesTab() {
    const categories = ['All', ...Object.keys(MBTI_CATEGORIES)];
    const types = this._getFilteredTypes();

    return `
      <div class="filter-pills">
        ${categories.map(c => `<button class="filter-pill ${c === this.activeFilter ? 'filter-pill--active' : ''}" data-filter="${c}">${c}</button>`).join('')}
      </div>
      ${types.length > 0
        ? `<div class="types-grid">${types.map(t => TypeCard.render(t)).join('')}</div>`
        : '<div class="types-empty">No types match this filter<br><button class="btn-secondary" data-filter="All" style="margin-top:12px">Show all</button></div>'
      }
    `;
  }

  _getFilteredTypes() {
    // This will use imported PERSONALITY_TYPES data
    // For now, generate from category mapping
    let codes;
    if (this.activeFilter === 'All') {
      codes = Object.values(MBTI_CATEGORIES).flat();
    } else {
      codes = MBTI_CATEGORIES[this.activeFilter] || [];
    }
    return codes.map(code => ({
      code,
      name: code, // Will be replaced with actual type names from QuizData
      description: 'Personality type',
      gradient: 'var(--gradient-sage)',
    }));
  }

  _bind() {
    // Segmented control
    this.el.querySelectorAll('.segmented-control__item').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        this.render();
      });
    });

    // Filter pills
    this.el.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeFilter = btn.dataset.filter;
        this.render();
      });
    });

    // Quiz list items
    this.el.querySelectorAll('.quiz-list-item').forEach(item => {
      item.addEventListener('click', () => {
        const title = item.dataset.quiz;
        const quiz = [...QUIZZES.frameworks, ...QUIZZES.premium].find(q => q.title === title);
        if (quiz) {
          if (quiz.meta.includes('Premium') && !stateManager.get('isPremium')) {
            router.openOverlay('premium-modal');
          } else if (!quiz.meta.includes('Coming soon')) {
            router.openOverlay('quiz', { framework: quiz.framework });
          }
        }
      });
    });
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/modules/ui/screens/ExploreScreen.js src/modules/ui/components/QuizListItem.js src/modules/ui/components/TypeCard.js src/styles/screens/explore.css
git commit -m "feat: add Explore screen with quiz catalog and types encyclopedia"
```

---

### Task 13: Quiz Screen

**Files:**
- Create: `src/modules/ui/screens/QuizScreen.js`
- Create: `src/styles/screens/quiz.css`

- [ ] **Step 1: Create quiz.css**

```css
/* src/styles/screens/quiz.css */
.quiz-screen {
  position: fixed; inset: 0;
  background: var(--color-surface);
  z-index: 200;
  display: flex; flex-direction: column;
}
.quiz-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
}
.quiz-header__close {
  background: none; border: none; cursor: pointer;
  color: var(--color-text-muted); padding: 4px;
}
.quiz-header__title {
  font: 500 15px/1 var(--font-body);
  color: var(--color-text-primary);
}
.quiz-header__counter {
  font: 400 14px/1 var(--font-mono);
  color: var(--color-text-muted);
}

.quiz-progress {
  height: 6px; background: var(--color-muted-bg);
  margin: 0 20px;
  border-radius: 3px; overflow: hidden;
}
.quiz-progress__fill {
  height: 100%; background: var(--color-primary);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.quiz-content {
  flex: 1; display: flex; flex-direction: column;
  justify-content: center; padding: 20px;
  max-width: 600px; margin: 0 auto; width: 100%;
}
.quiz-question {
  font: 400 22px/1.3 var(--font-display);
  color: var(--color-text-primary);
  margin-bottom: 24px; text-align: center;
}
.quiz-options {
  display: flex; flex-direction: column; gap: 12px;
}

.quiz-nav {
  display: flex; justify-content: space-between;
  padding: 16px 20px;
  max-width: 600px; margin: 0 auto; width: 100%;
}

/* Exit confirmation dialog */
.exit-dialog {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 250;
}
.exit-dialog__card {
  background: var(--color-card);
  border-radius: var(--radius-xl);
  padding: 24px;
  max-width: 300px; width: 90%;
  text-align: center;
}
.exit-dialog__title {
  font: 400 18px/1.3 var(--font-display);
  margin-bottom: 8px;
}
.exit-dialog__text {
  font: 400 14px/1.4 var(--font-body);
  color: var(--color-text-secondary);
  margin-bottom: 20px;
}
.exit-dialog__actions {
  display: flex; gap: 12px; justify-content: center;
}
.btn-danger {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 12px 24px;
  background: var(--color-error);
  color: #fff; border: none; border-radius: var(--radius-pill);
  font: 600 14px/1 var(--font-body); cursor: pointer;
}

/* Adaptive confidence bars */
.quiz-adaptive {
  display: flex; gap: 8px; padding: 8px 20px;
}
.quiz-adaptive__bar {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.quiz-adaptive__label {
  font: 400 10px/1 var(--font-mono);
  color: var(--color-text-muted);
}
.quiz-adaptive__track {
  width: 100%; height: 4px; background: var(--color-muted-bg);
  border-radius: 2px; overflow: hidden;
}
.quiz-adaptive__fill {
  height: 100%; background: var(--color-primary);
  border-radius: 2px; transition: width 0.3s;
}
```

- [ ] **Step 2: Create QuizScreen module**

**QuizEngine API reference (from `src/modules/quiz/QuizEngine.js`):**
- `quizEngine.resetQuiz()` — resets state
- `quizEngine.startQuiz()` — initializes and returns first question
- `quizEngine.getCurrentQuestion()` — returns `{ text, options, questionNumber, totalQuestions, isAdaptive, confidence }`
- `quizEngine.questions.length` — total question count
- `quizEngine.currentQuestionIndex` — current 0-based index
- `quizEngine.selectOption(idx)` — sets selected option (1-based index)
- `quizEngine.nextQuestion()` — **async**, saves answer + advances. Returns next question or result on completion.
- `quizEngine.previousQuestion()` — goes back, recalculates scores
- `quizEngine.calculateResults()` — returns `{ personalityType, dimensionBreakdown, scores, ... }`
- `quizEngine.getCurrentConfidence()` — returns `{ EI, SN, TF, JP }` confidence scores
- `quizEngine.isAdaptiveMode` — boolean property (not method)
- `quizEngine.canGoNext()` / `quizEngine.canGoPrevious()` — boolean helpers
- `dimensionBreakdown` shape: `{ EI: { E: number, I: number }, SN: { S, N }, TF: { T, F }, JP: { J, P } }`

```js
// src/modules/ui/screens/QuizScreen.js
import '../../../styles/screens/quiz.css';
import { router } from '../../router/Router.js';
import { quizEngine } from '../../quiz/QuizEngine.js';
import { stateManager } from '../../core/StateManager.js';
import { resultsStore } from '../../results/ResultsStore.js';
import { LoggerManager } from '../../core/LoggerManager.js';

const logger = new LoggerManager().createModuleLogger('QuizScreen');

export class QuizScreen {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'quiz-screen';
    this.showExitDialog = false;
    this.framework = 'mbti';
    this.render();
  }

  getElement() { return this.el; }

  setData(data) {
    if (data?.framework) this.framework = data.framework;
    quizEngine.resetQuiz();
    quizEngine.startQuiz();
    this.render();
  }

  render() {
    const current = quizEngine.getCurrentQuestion();
    const total = quizEngine.questions.length;
    const questionIndex = quizEngine.currentQuestionIndex;
    const progress = total > 0 ? ((questionIndex + 1) / total) * 100 : 0;
    const isAdaptive = quizEngine.isAdaptiveMode;
    const isLast = questionIndex === total - 1;
    const hasSelection = quizEngine.selectedOption !== null;

    this.el.innerHTML = `
      <div class="status-bar"></div>
      <div class="quiz-header">
        <button class="quiz-header__close" id="quiz-close">
          <i data-lucide="x" style="width:24px;height:24px"></i>
        </button>
        <span class="quiz-header__title">${this.framework.toUpperCase()} Quiz</span>
        <span class="quiz-header__counter">${questionIndex + 1}/${total}</span>
      </div>
      <div class="quiz-progress">
        <div class="quiz-progress__fill" style="width:${progress}%"></div>
      </div>
      ${isAdaptive ? this._adaptiveBars() : ''}
      <div class="quiz-content">
        <div class="quiz-question">${current?.text || 'Loading...'}</div>
        <div class="quiz-options">
          ${(current?.options || []).map((opt, i) => {
            const optionIndex = i + 1; // QuizEngine uses 1-based option indices
            const isSelected = quizEngine.selectedOption === optionIndex;
            return `
            <button class="answer-option ${isSelected ? 'answer-option--selected' : ''}" data-option="${optionIndex}">
              ${isSelected ? '<i data-lucide="check" style="width:18px;height:18px;margin-right:8px"></i>' : ''}
              ${opt.text || opt}
            </button>`;
          }).join('')}
        </div>
      </div>
      <div class="quiz-nav">
        <button class="btn-secondary" id="quiz-prev" ${questionIndex === 0 ? 'disabled' : ''}>
          <i data-lucide="arrow-left" style="width:16px;height:16px"></i> Previous
        </button>
        <button class="btn-primary" id="quiz-next" ${!hasSelection ? 'disabled' : ''}>
          ${isLast ? 'See Results' : 'Next'} <i data-lucide="arrow-right" style="width:16px;height:16px"></i>
        </button>
      </div>
      ${this.showExitDialog ? this._exitDialog() : ''}
    `;

    this._bind();
    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }

  _adaptiveBars() {
    const confidence = quizEngine.getCurrentConfidence() || {};
    const dims = [
      { label: 'E/I', value: Math.round((confidence.EI || 0) * 100) },
      { label: 'S/N', value: Math.round((confidence.SN || 0) * 100) },
      { label: 'T/F', value: Math.round((confidence.TF || 0) * 100) },
      { label: 'J/P', value: Math.round((confidence.JP || 0) * 100) },
    ];
    return `<div class="quiz-adaptive">
      ${dims.map(d => `
        <div class="quiz-adaptive__bar">
          <div class="quiz-adaptive__track"><div class="quiz-adaptive__fill" style="width:${d.value}%"></div></div>
          <span class="quiz-adaptive__label">${d.label}</span>
        </div>
      `).join('')}
    </div>`;
  }

  _exitDialog() {
    return `
      <div class="exit-dialog" id="exit-dialog">
        <div class="exit-dialog__card">
          <div class="exit-dialog__title">Exit quiz?</div>
          <div class="exit-dialog__text">Your progress will be lost.</div>
          <div class="exit-dialog__actions">
            <button class="btn-secondary" id="exit-cancel">Cancel</button>
            <button class="btn-danger" id="exit-confirm">Exit</button>
          </div>
        </div>
      </div>
    `;
  }

  _bind() {
    // Close button
    this.el.querySelector('#quiz-close')?.addEventListener('click', () => {
      this.showExitDialog = true;
      this.render();
    });

    // Exit dialog
    this.el.querySelector('#exit-cancel')?.addEventListener('click', () => {
      this.showExitDialog = false;
      this.render();
    });
    this.el.querySelector('#exit-confirm')?.addEventListener('click', () => {
      quizEngine.resetQuiz();
      router.closeOverlay();
    });
    this.el.querySelector('#exit-dialog')?.addEventListener('click', (e) => {
      if (e.target.id === 'exit-dialog') {
        this.showExitDialog = false;
        this.render();
      }
    });

    // Answer options — QuizEngine uses 1-based option indices
    this.el.querySelectorAll('.answer-option').forEach(btn => {
      btn.addEventListener('click', () => {
        quizEngine.selectOption(parseInt(btn.dataset.option));
        this.render();
      });
    });

    // Navigation
    this.el.querySelector('#quiz-prev')?.addEventListener('click', () => {
      quizEngine.previousQuestion();
      this.render();
    });

    this.el.querySelector('#quiz-next')?.addEventListener('click', async () => {
      if (!quizEngine.canGoNext()) return;

      // nextQuestion() is async — it saves the answer, updates scores,
      // checks adaptive early completion, and advances the index.
      // It returns the next question, or calls completeQuiz() if done.
      const result = await quizEngine.nextQuestion();

      // If completeQuiz() was called, stateManager.currentScreen is now 'results'
      // and lastResults is populated.
      const lastResults = stateManager.get('lastResults');
      if (stateManager.get('currentScreen') === 'results' && lastResults) {
        this._handleCompletion(lastResults);
      } else {
        this.render();
      }
    });
  }

  _handleCompletion(results) {
    // Map QuizEngine result shape to ResultsStore format
    const dims = results.dimensionBreakdown || {};
    const entry = resultsStore.addResult({
      framework: this.framework,
      typeCode: results.personalityType,
      typeName: results.personalityType, // Will be enriched with type name lookup
      dimensions: {
        E: dims.EI?.E || 50, I: dims.EI?.I || 50,
        S: dims.SN?.S || 50, N: dims.SN?.N || 50,
        T: dims.TF?.T || 50, F: dims.TF?.F || 50,
        J: dims.JP?.J || 50, P: dims.JP?.P || 50,
      },
      confidence: results.adaptiveAnalytics?.confidenceScores || null,
    });
    stateManager.checkAchievements(resultsStore);
    router.closeOverlay();
    router.openOverlay('result-detail', { resultId: entry.id });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/ui/screens/QuizScreen.js src/styles/screens/quiz.css
git commit -m "feat: add Quiz screen overlay with progress, adaptive mode, exit dialog"
```

---

### Task 14: Result Detail Screen

**Files:**
- Create: `src/modules/ui/screens/ResultDetailScreen.js`
- Create: `src/modules/ui/components/DimensionBar.js`
- Create: `src/styles/screens/result-detail.css`

- [ ] **Step 1: Create DimensionBar component**

```js
// src/modules/ui/components/DimensionBar.js
export class DimensionBar {
  static render({ leftLabel, rightLabel, leftPercent, color }) {
    return `
      <div class="dimension-bar">
        <div class="dimension-bar__labels">
          <span class="dimension-bar__left">${leftLabel} ${leftPercent}%</span>
          <span class="dimension-bar__right">${rightLabel}</span>
        </div>
        <div class="dimension-bar__track">
          <div class="dimension-bar__fill" style="width:${leftPercent}%;background:${color}"></div>
        </div>
      </div>
    `;
  }
}
```

- [ ] **Step 2: Create result-detail.css**

```css
/* src/styles/screens/result-detail.css */
.result-detail-screen {
  position: fixed; inset: 0;
  background: var(--color-surface);
  z-index: 200;
  overflow-y: auto;
  padding-bottom: 40px;
}
.result-detail__back {
  display: flex; align-items: center; gap: 6px;
  padding: 16px 20px;
  color: var(--color-text-muted);
  font: 400 14px/1 var(--font-body);
  cursor: pointer; background: none; border: none;
}
.result-hero {
  background: var(--gradient-sage);
  border-radius: var(--radius-xl);
  padding: 32px;
  margin: 0 20px 20px;
  text-align: center; color: #fff;
}
.result-hero__code {
  font: 500 48px/1 var(--font-mono);
  margin-bottom: 8px;
}
.result-hero__name {
  font: 400 22px/1.3 var(--font-display);
  margin-bottom: 8px;
}
.result-hero__desc {
  font: 400 13px/1.4 var(--font-body);
  opacity: 0.8;
}
.result-dimensions {
  margin: 0 20px 20px;
  display: flex; flex-direction: column; gap: 16px;
}
.result-actions {
  display: flex; gap: 12px;
  padding: 0 20px;
  margin-bottom: 20px;
}
.result-actions .btn-primary,
.result-actions .btn-secondary { flex: 1; }

/* Premium teaser */
.premium-teaser {
  display: flex; align-items: center; gap: 14px;
  margin: 0 20px 20px;
  padding: 16px;
  cursor: pointer;
}
.premium-teaser__icon-wrap {
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-md);
  background: #D4A57415;
  color: var(--color-accent-gold);
}
.premium-teaser__info { flex: 1; }
.premium-teaser__badge {
  display: inline-flex; margin-bottom: 4px;
}
.premium-teaser__title {
  font: 500 14px/1.3 var(--font-body);
}
.premium-teaser__desc {
  font: 400 13px/1.4 var(--font-body);
  color: var(--color-text-muted);
}

/* Premium insights */
.insights-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  margin: 0 20px 20px;
}
.insight-card {
  padding: 16px;
}
.insight-card__icon-wrap {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-sm);
  background: #7C908215;
  color: var(--color-primary);
  margin-bottom: 10px;
}
.insight-card__title {
  font: 500 14px/1.3 var(--font-body);
  margin-bottom: 6px;
}
.insight-card__list {
  list-style: none; padding: 0;
  font: 400 12px/1.5 var(--font-body);
  color: var(--color-text-secondary);
}

/* Famous personalities */
.famous-scroll {
  display: flex; gap: 12px;
  overflow-x: auto; padding: 0 20px 20px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.famous-scroll::-webkit-scrollbar { display: none; }
.famous-card {
  min-width: 100px; text-align: center;
}
.famous-card__avatar {
  width: 64px; height: 64px;
  border-radius: 50%; background: var(--color-muted-bg);
  margin: 0 auto 8px;
  object-fit: cover;
}
.famous-card__name {
  font: 500 13px/1.3 var(--font-body);
}
.famous-card__role {
  font: 400 11px/1.3 var(--font-body);
  color: var(--color-text-muted);
}
```

- [ ] **Step 3: Create ResultDetailScreen module**

```js
// src/modules/ui/screens/ResultDetailScreen.js
import '../../../styles/screens/result-detail.css';
import { DimensionBar } from '../components/DimensionBar.js';
import { router } from '../../router/Router.js';
import { resultsStore } from '../../results/ResultsStore.js';
import { stateManager } from '../../core/StateManager.js';

import { MBTI_TYPES, ADVANCED_INSIGHTS, FAMOUS_PERSONALITIES } from '../../../data/QuizData.ru.js';

export class ResultDetailScreen {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'result-detail-screen';
    this.resultId = null;
  }

  getElement() { return this.el; }

  setData(data) {
    this.resultId = data?.resultId;
    this.render();
  }

  render() {
    const result = this.resultId
      ? resultsStore.getAll().find(r => r.id === this.resultId)
      : null;

    if (!result) {
      this.el.innerHTML = '<div class="loading-screen"><div class="spinner"></div></div>';
      return;
    }

    const isPremium = stateManager.get('isPremium');
    const dims = result.dimensions || {};

    const dimensionBars = [
      { leftLabel: 'Extraversion', rightLabel: 'Introversion', leftPercent: dims.E || 50, color: 'var(--color-primary)' },
      { leftLabel: 'Sensing', rightLabel: 'Intuition', leftPercent: dims.S || 50, color: 'var(--color-accent-gold)' },
      { leftLabel: 'Thinking', rightLabel: 'Feeling', leftPercent: dims.T || 50, color: 'var(--color-success)' },
      { leftLabel: 'Judging', rightLabel: 'Perceiving', leftPercent: dims.J || 50, color: 'var(--color-info-blue)' },
    ];

    this.el.innerHTML = `
      <div class="status-bar"></div>
      <button class="result-detail__back" id="result-back">
        <i data-lucide="arrow-left" style="width:18px;height:18px"></i> Back
      </button>
      <div class="result-hero">
        <div class="result-hero__code">${result.typeCode}</div>
        <div class="result-hero__name">${result.typeName}</div>
        <div class="result-hero__desc">${result.typeCode} personality type</div>
      </div>
      <div class="card result-dimensions" style="margin:0 20px 20px">
        <h3 style="font:400 18px/1.3 var(--font-display);margin-bottom:8px">Your Preferences</h3>
        ${dimensionBars.map(d => DimensionBar.render(d)).join('')}
      </div>
      ${isPremium ? this._premiumContent(result) : this._premiumTeaser()}
      <div class="result-actions">
        <button class="btn-primary" id="result-share">
          <i data-lucide="share-2" style="width:16px;height:16px"></i> Share
        </button>
        <button class="btn-secondary" id="result-retake">
          <i data-lucide="refresh-cw" style="width:16px;height:16px"></i> Retake
        </button>
      </div>
    `;

    this._bind(result);
    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }

  _premiumTeaser() {
    return `
      <div class="card premium-teaser" id="premium-teaser">
        <div class="premium-teaser__icon-wrap">
          <i data-lucide="lock" style="width:20px;height:20px"></i>
        </div>
        <div class="premium-teaser__info">
          <span class="badge badge--gold premium-teaser__badge">Premium</span>
          <div class="premium-teaser__title">Unlock Deep Insights</div>
          <div class="premium-teaser__desc">Advanced analysis, famous matches & more</div>
        </div>
        <i data-lucide="chevron-right" style="width:18px;height:18px;color:var(--color-text-disabled)"></i>
      </div>
    `;
  }

  _premiumContent(result) {
    // ADVANCED_INSIGHTS is keyed by type code: { ENFP: { strengths: [...], growth: [...], career: [...], development: [...] } }
    // FAMOUS_PERSONALITIES is keyed by type code: { ENFP: [{ name, role, image? }, ...] }
    const typeInsights = ADVANCED_INSIGHTS?.[result.typeCode] || {};
    const typeFamous = FAMOUS_PERSONALITIES?.[result.typeCode] || [];

    const insightSections = [
      { icon: 'star', title: 'Strengths', key: 'strengths' },
      { icon: 'target', title: 'Growth Areas', key: 'growth' },
      { icon: 'briefcase', title: 'Career Advice', key: 'career' },
      { icon: 'lightbulb', title: 'Development', key: 'development' },
    ];

    return `
      <div class="card" style="margin:0 20px 20px;padding:20px">
        <h3 style="font:400 18px/1.3 var(--font-display);margin-bottom:16px">Advanced Insights</h3>
        <div class="insights-grid" style="margin:0">
          ${insightSections.map(ins => {
            const items = typeInsights[ins.key] || [];
            return `
            <div class="card insight-card">
              <div class="insight-card__icon-wrap">
                <i data-lucide="${ins.icon}" style="width:18px;height:18px"></i>
              </div>
              <div class="insight-card__title">${ins.title}</div>
              <ul class="insight-card__list">
                ${items.length > 0
                  ? items.map(item => `<li>${item}</li>`).join('')
                  : '<li>No data available</li>'
                }
              </ul>
            </div>`;
          }).join('')}
        </div>
      </div>
      ${typeFamous.length > 0 ? `
      <div style="margin-bottom:20px">
        <h3 style="font:400 18px/1.3 var(--font-display);padding:0 20px;margin-bottom:12px">Famous Personalities</h3>
        <div class="famous-scroll">
          ${typeFamous.map(p => `
            <div class="famous-card">
              <div class="famous-card__avatar"${p.image ? ` style="background-image:url(${p.image});background-size:cover"` : ''}></div>
              <div class="famous-card__name">${p.name}</div>
              <div class="famous-card__role">${p.role || ''}</div>
            </div>
          `).join('')}
        </div>
      </div>` : ''}
    `;
  }

  _bind(result) {
    this.el.querySelector('#result-back')?.addEventListener('click', () => {
      router.closeOverlay();
      router.navigateTab('results'); // Spec: Back navigates to Results Timeline
    });

    this.el.querySelector('#premium-teaser')?.addEventListener('click', () => {
      router.openOverlay('premium-modal');
    });

    this.el.querySelector('#result-share')?.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: `I'm ${result.typeCode} — ${result.typeName}`,
          url: window.location.href
        });
      }
    });

    this.el.querySelector('#result-retake')?.addEventListener('click', () => {
      router.closeOverlay();
      router.openOverlay('quiz', { framework: result.framework });
    });
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/modules/ui/screens/ResultDetailScreen.js src/modules/ui/components/DimensionBar.js src/styles/screens/result-detail.css
git commit -m "feat: add Result Detail screen with dimension bars and premium sections"
```

---

### Task 15: Results Timeline Screen

**Files:**
- Create: `src/modules/ui/screens/ResultsTimelineScreen.js`
- Create: `src/styles/screens/results-timeline.css`

- [ ] **Step 1: Create results-timeline.css**

```css
/* src/styles/screens/results-timeline.css */
.results-list {
  display: flex; flex-direction: column; gap: 12px;
}
.result-item {
  display: flex; align-items: center; gap: 14px;
  padding: 14px;
  cursor: pointer;
}
.result-item__badge {
  width: 56px; height: 56px;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-lg);
  font: 500 18px/1 var(--font-mono);
  color: #fff; flex-shrink: 0;
}
.result-item__badge--mbti { background: var(--gradient-sage); }
.result-item__badge--premium { background: var(--gradient-gold); }
.result-item__info { flex: 1; }
.result-item__title {
  font: 500 14px/1.3 var(--font-body);
  color: var(--color-text-primary);
}
.result-item__date {
  font: 400 13px/1 var(--font-body);
  color: var(--color-text-muted);
  margin-top: 2px;
}
.result-item__chevron {
  color: var(--color-text-disabled);
}

.results-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 60px 20px;
  text-align: center;
}
.results-empty__icon {
  width: 64px; height: 64px;
  color: var(--color-text-disabled);
  margin-bottom: 16px;
}
.results-empty__title {
  font: 400 18px/1.3 var(--font-display);
  color: var(--color-text-muted);
  margin-bottom: 8px;
}
.results-empty__text {
  font: 400 14px/1.4 var(--font-body);
  color: var(--color-text-muted);
  margin-bottom: 20px;
}
```

- [ ] **Step 2: Create ResultsTimelineScreen module**

```js
// src/modules/ui/screens/ResultsTimelineScreen.js
import '../../../styles/screens/results-timeline.css';
import { resultsStore } from '../../results/ResultsStore.js';
import { router } from '../../router/Router.js';

export class ResultsTimelineScreen {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'results-timeline-screen screen-content';
    this.render();
  }

  getElement() { return this.el; }
  onActivate() { this.render(); }

  render() {
    const results = resultsStore.getAll();

    this.el.innerHTML = `
      <h1 class="page-title">Results</h1>
      ${results.length > 0 ? this._list(results) : this._empty()}
    `;

    this._bind();
    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }

  _list(results) {
    return `<div class="results-list">
      ${results.map(r => `
        <div class="card result-item" data-id="${r.id}">
          <div class="result-item__badge result-item__badge--${r.framework === 'mbti' ? 'mbti' : 'premium'}">
            ${r.typeCode}
          </div>
          <div class="result-item__info">
            <div class="result-item__title">${r.typeName}</div>
            <div class="result-item__date">${new Date(r.date).toLocaleDateString()}</div>
          </div>
          <i data-lucide="chevron-right" class="result-item__chevron" style="width:18px;height:18px"></i>
        </div>
      `).join('')}
    </div>`;
  }

  _empty() {
    return `<div class="results-empty">
      <i data-lucide="clipboard-list" class="results-empty__icon"></i>
      <div class="results-empty__title">No results yet</div>
      <div class="results-empty__text">Take your first quiz to see results here</div>
      <button class="btn-primary" id="results-start-quiz">Start Quiz</button>
    </div>`;
  }

  _bind() {
    this.el.querySelectorAll('.result-item').forEach(item => {
      item.addEventListener('click', () => {
        router.openOverlay('result-detail', { resultId: item.dataset.id });
      });
    });

    this.el.querySelector('#results-start-quiz')?.addEventListener('click', () => {
      router.navigateTab('explore');
    });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/ui/screens/ResultsTimelineScreen.js src/styles/screens/results-timeline.css
git commit -m "feat: add Results Timeline screen with result list and empty state"
```

---

### Task 16: Profile Screen

**Files:**
- Create: `src/modules/ui/screens/ProfileScreen.js`
- Create: `src/modules/ui/components/StatCard.js`
- Create: `src/modules/ui/components/AchievementCard.js`
- Create: `src/styles/screens/profile.css`

- [ ] **Step 1: Create StatCard and AchievementCard components**

```js
// src/modules/ui/components/StatCard.js
export class StatCard {
  static render({ label, value }) {
    return `
      <div class="stat-card">
        <div class="stat-card__label">${label}</div>
        <div class="stat-card__value">${value}</div>
      </div>
    `;
  }
}
```

```js
// src/modules/ui/components/AchievementCard.js
export class AchievementCard {
  static render({ icon, title, description, earned }) {
    return `
      <div class="achievement-card ${earned ? '' : 'achievement-card--locked'}">
        <div class="achievement-card__icon-wrap">
          <i data-lucide="${icon}" style="width:20px;height:20px"></i>
        </div>
        <div>
          <div class="achievement-card__title">${title}</div>
          <div class="achievement-card__desc">${description}</div>
        </div>
      </div>
    `;
  }
}
```

- [ ] **Step 2: Create profile.css**

```css
/* src/styles/screens/profile.css */
.user-card {
  display: flex; align-items: center; gap: 14px;
  margin-bottom: 20px;
}
.user-card__avatar {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: #7C908215;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0; overflow: hidden;
}
.user-card__avatar img {
  width: 100%; height: 100%; object-fit: cover;
}
.user-card__name {
  font: 500 16px/1.3 var(--font-body);
}
.user-card__type {
  font: 400 13px/1 var(--font-body);
  color: var(--color-text-muted);
  margin-top: 2px;
}

.stats-row {
  display: flex; gap: 12px;
  margin-bottom: 20px;
}

.achievements-section { margin-bottom: 20px; }
.achievements-section__title {
  font: 400 18px/1.3 var(--font-display);
  margin-bottom: 12px;
}

.premium-cta {
  background: var(--gradient-gold);
  border-radius: var(--radius-xl);
  padding: 24px;
  text-align: center; cursor: pointer;
}
.premium-cta__title {
  font: 400 22px/1.3 var(--font-display);
  margin-bottom: 4px;
}
.premium-cta__subtitle {
  font: 400 14px/1.4 var(--font-body);
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}
.btn-gold {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 14px 28px;
  background: var(--color-accent-gold);
  color: #fff; border: none; border-radius: var(--radius-pill);
  font: 600 16px/1 var(--font-body);
  cursor: pointer;
}
```

- [ ] **Step 3: Create ProfileScreen module**

```js
// src/modules/ui/screens/ProfileScreen.js
import '../../../styles/screens/profile.css';
import { StatCard } from '../components/StatCard.js';
import { AchievementCard } from '../components/AchievementCard.js';
import { resultsStore } from '../../results/ResultsStore.js';
import { stateManager } from '../../core/StateManager.js';
import { router } from '../../router/Router.js';

const ACHIEVEMENTS = [
  { key: 'firstSteps', icon: 'footprints', title: 'First Steps', description: 'Complete your first quiz' },
  { key: 'onFire', icon: 'flame', title: 'On Fire', description: '3+ quizzes in one week' },
  { key: 'highAccuracy', icon: 'target', title: 'High Accuracy', description: '85%+ confidence score' },
  { key: 'explorer', icon: 'compass', title: 'Explorer', description: 'Discover 5 different types' },
  { key: 'specialist', icon: 'award', title: 'Specialist', description: 'Complete all premium quizzes' },
  { key: 'master', icon: 'trophy', title: 'Master', description: 'Complete all available tests' },
];

export class ProfileScreen {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'profile-screen screen-content';
    this.render();
  }

  getElement() { return this.el; }
  onActivate() { this.render(); }

  render() {
    const isPremium = stateManager.get('isPremium');
    const achievements = stateManager.get('achievements') || {};
    const mbti = resultsStore.getLatestByFramework('mbti');
    const testCount = resultsStore.getCount();
    const accuracy = resultsStore.getAverageConfidence();

    // Get VK user info if available
    const vkUser = this._getVkUser();

    this.el.innerHTML = `
      <h1 class="page-title">Profile</h1>
      <div class="user-card">
        <div class="user-card__avatar">
          ${vkUser?.photo_100
            ? `<img src="${vkUser.photo_100}" alt="">`
            : '<i data-lucide="user" style="width:24px;height:24px"></i>'
          }
        </div>
        <div>
          <div class="user-card__name">${vkUser ? `${vkUser.first_name} ${vkUser.last_name}` : 'Guest'}</div>
          ${mbti ? `<div class="user-card__type">${mbti.typeCode} · ${mbti.typeName}</div>` : ''}
        </div>
      </div>
      <div class="stats-row">
        ${StatCard.render({ label: 'Tests Taken', value: testCount.toString() })}
        ${StatCard.render({ label: 'Accuracy', value: accuracy != null ? `${accuracy}%` : '—' })}
      </div>
      <div class="achievements-section">
        <div class="achievements-section__title">Achievements</div>
        ${ACHIEVEMENTS.map(a => AchievementCard.render({
          ...a,
          earned: !!achievements[a.key],
        })).join('')}
      </div>
      ${!isPremium ? this._premiumCta() : ''}
    `;

    this._bind();
    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }

  _getVkUser() {
    try {
      const data = localStorage.getItem('vk_user_auth');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  }

  _premiumCta() {
    return `
      <div class="premium-cta" id="premium-cta">
        <div class="premium-cta__title">Go Premium</div>
        <div class="premium-cta__subtitle">Unlock all quizzes & insights</div>
        <button class="btn-gold">280 ₽</button>
      </div>
    `;
  }

  _bind() {
    this.el.querySelector('#premium-cta')?.addEventListener('click', () => {
      router.openOverlay('premium-modal');
    });
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/modules/ui/screens/ProfileScreen.js src/modules/ui/components/StatCard.js src/modules/ui/components/AchievementCard.js src/styles/screens/profile.css
git commit -m "feat: add Profile screen with stats, achievements, and premium CTA"
```

---

### Task 17: Premium Modal

**Files:**
- Create: `src/modules/ui/components/PremiumModal.js`
- Create: `src/styles/screens/premium-modal.css`

- [ ] **Step 1: Create premium-modal.css**

```css
/* src/styles/screens/premium-modal.css */
.premium-modal .bottom-sheet__header {
  text-align: center; margin-bottom: 24px;
}
.premium-modal__icon-wrap {
  width: 56px; height: 56px;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-lg);
  background: #D4A57420;
  color: var(--color-accent-gold);
  margin: 0 auto 16px;
}
.premium-modal__title {
  font: 400 26px/1.2 var(--font-display);
  margin-bottom: 4px;
}
.premium-modal__subtitle {
  font: 400 14px/1.4 var(--font-body);
  color: var(--color-text-secondary);
}
.premium-benefits {
  list-style: none; padding: 0;
  margin-bottom: 24px;
}
.premium-benefits li {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 0;
  font: 400 14px/1.4 var(--font-body);
}
.premium-benefits__icon {
  color: var(--color-primary);
  flex-shrink: 0;
}
.premium-cta-btn {
  width: 100%;
  padding: 16px;
  background: var(--color-accent-gold);
  color: #fff; border: none; border-radius: var(--radius-pill);
  font: 600 16px/1 var(--font-body);
  cursor: pointer; transition: opacity 0.2s;
}
.premium-cta-btn:disabled {
  opacity: 0.7; cursor: not-allowed;
}
.premium-note {
  font: 400 12px/1 var(--font-body);
  color: var(--color-text-muted);
  text-align: center; margin-top: 12px;
}
.premium-error {
  font: 400 13px/1 var(--font-body);
  color: var(--color-error);
  text-align: center; margin-top: 8px;
}
```

- [ ] **Step 2: Create PremiumModal module**

```js
// src/modules/ui/components/PremiumModal.js
import '../../../styles/screens/premium-modal.css';
import { router } from '../../router/Router.js';
import { stateManager } from '../../core/StateManager.js';
import { LoggerManager } from '../../core/LoggerManager.js';

const logger = new LoggerManager().createModuleLogger('PremiumModal');

export class PremiumModal {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'overlay-backdrop';
    this.state = 'idle'; // 'idle' | 'processing' | 'error'
    this.errorMessage = '';
    this.render();
  }

  getElement() { return this.el; }

  render() {
    const isProcessing = this.state === 'processing';

    this.el.innerHTML = `
      <div class="bottom-sheet premium-modal">
        <div class="bottom-sheet__handle"></div>
        <div class="bottom-sheet__header">
          <div class="premium-modal__icon-wrap">
            <i data-lucide="crown" style="width:24px;height:24px"></i>
          </div>
          <div class="premium-modal__title">Go Premium</div>
          <div class="premium-modal__subtitle">Unlock the full personality experience</div>
        </div>
        <ul class="premium-benefits">
          <li><i data-lucide="circle-check" class="premium-benefits__icon" style="width:20px;height:20px"></i> Advanced personality insights & analysis</li>
          <li><i data-lucide="circle-check" class="premium-benefits__icon" style="width:20px;height:20px"></i> All specialized premium quizzes</li>
          <li><i data-lucide="circle-check" class="premium-benefits__icon" style="width:20px;height:20px"></i> Famous personality matches</li>
          <li><i data-lucide="circle-check" class="premium-benefits__icon" style="width:20px;height:20px"></i> Visual charts & analytics</li>
          <li><i data-lucide="circle-check" class="premium-benefits__icon" style="width:20px;height:20px"></i> Ad-free experience</li>
        </ul>
        <button class="premium-cta-btn" id="premium-buy" ${isProcessing ? 'disabled' : ''}>
          ${isProcessing ? '<span class="spinner" style="width:18px;height:18px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px"></span> Processing…' : 'Unlock Premium — 280 ₽'}
        </button>
        ${this.state === 'error' ? `<div class="premium-error">${this.errorMessage}</div>` : ''}
        <div class="premium-note">One-time payment · No subscription</div>
      </div>
    `;

    this._bind();
    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }

  _bind() {
    // Close on backdrop click
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) router.closeOverlay();
    });

    // Buy button
    this.el.querySelector('#premium-buy')?.addEventListener('click', async () => {
      this.state = 'processing';
      this.errorMessage = '';
      this.render();

      try {
        // Try VK payment if available
        if (window.vkBridge || window.vkBridgeManager) {
          const bridge = window.vkBridgeManager || window.vkBridge;
          if (bridge.showOrderBox) {
            await bridge.showOrderBox();
          } else if (bridge.send) {
            await bridge.send('VKWebAppShowOrderBox', { type: 'item', item: 'premium_unlock' });
          }
        }

        // If we get here, payment succeeded (or no VK bridge — treat as success for web)
        stateManager.setPremium(true);
        this.state = 'idle';
        router.closeOverlay();

        // Show success toast
        this._showToast('Premium unlocked!', 'success');
      } catch (error) {
        if (error.error_data?.error_code === 4) {
          // User cancelled
          this.state = 'idle';
          this.render();
        } else {
          logger.error('Payment failed:', error);
          this.state = 'error';
          this.errorMessage = 'Payment failed. Please try again.';
          this.render();
        }
      }
    });
  }

  _showToast(message, type) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/ui/components/PremiumModal.js src/styles/screens/premium-modal.css
git commit -m "feat: add Premium Modal bottom sheet with VK payment flow"
```

---

### Task 18: Toast Component

**Files:**
- Create: `src/modules/ui/components/Toast.js`

- [ ] **Step 1: Create Toast utility**

```js
// src/modules/ui/components/Toast.js
export class Toast {
  static show(message, type = 'success', duration = 5000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  static error(message) { Toast.show(message, 'error'); }
  static success(message) { Toast.show(message, 'success'); }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/ui/components/Toast.js
git commit -m "feat: add Toast notification component"
```

---

## Chunk 4: Responsive Design & Integration

### Task 19: Responsive CSS

**Files:**
- Create: `src/styles/responsive.css`

- [ ] **Step 1: Create responsive breakpoints**

```css
/* src/styles/responsive.css */

/* Tablet (768-1024px) */
@media (min-width: 768px) {
  .screen-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .bento-row {
    gap: 16px;
  }

  .types-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .insights-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Desktop (>1024px) */
@media (min-width: 1024px) {
  .screen-content {
    padding-left: 40px;
    padding-right: 40px;
  }

  .types-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .quiz-screen {
    background: rgba(0,0,0,0.4);
    align-items: center; justify-content: center;
  }
  .quiz-screen {
    /* On desktop, the quiz-screen itself stays full-screen fixed,
       but its child content is constrained via .quiz-content max-width (600px).
       The existing styles already handle this. Add subtle background dimming: */
  }

  .result-detail-screen {
    max-width: 800px;
    margin: 0 auto;
  }

  .tab-bar {
    bottom: 24px;
  }
}
```

- [ ] **Step 2: Import responsive.css from App.js**

Add to `src/modules/ui/App.js` imports:

```js
import '../../styles/responsive.css';
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/responsive.css src/modules/ui/App.js
git commit -m "feat: add responsive breakpoints for tablet and desktop"
```

---

### Task 20: Add Lucide Icons CDN

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add Lucide script to head**

Add before the closing `</head>` tag:

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add Lucide icons CDN for new UI components"
```

---

### Task 21: Smoke Test Quiz Flow End-to-End

**Note:** The QuizScreen code in Task 13 is already written against the actual QuizEngine API (verified against source). This task is a manual integration test.

**Files:** None to modify (unless bugs found)

- [ ] **Step 1: Run dev server and test quiz flow**

Run: `npm run dev`
Test the following flow:
1. Home → tap Hero Card → quiz overlay opens
2. Select an answer → Next button enables
3. Navigate prev/next — verify question counter updates
4. Complete all questions (or reach early completion in adaptive)
5. Result Detail opens with correct type code and dimension bars
6. Tap Back → navigates to Results tab (not Home)
7. Results Timeline shows the new result entry
8. Home screen bento cards show updated type

- [ ] **Step 2: Fix any runtime issues found**

Common things to watch for:
- `quizEngine.questions` may be empty if `generateQuestions` is async — add a loading state if needed
- Option text format may vary — check `opt.text` vs `opt` fallback
- `dimensionBreakdown` values are percentages (e.g., `{ E: 60, I: 40 }`)

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve quiz flow integration issues"
```

---

### Task 22: Connect ExploreScreen Types to Real Data

**Files:**
- Modify: `src/modules/ui/screens/ExploreScreen.js`

- [ ] **Step 1: Import actual type data and update _getFilteredTypes()**

Add this import at the top of `ExploreScreen.js`:

```js
import { MBTI_TYPES } from '../../../data/QuizData.ru.js';
```

Replace the `_getFilteredTypes()` method:

```js
_getFilteredTypes() {
  let codes;
  if (this.activeFilter === 'All') {
    codes = Object.values(MBTI_CATEGORIES).flat();
  } else {
    codes = MBTI_CATEGORIES[this.activeFilter] || [];
  }
  // MBTI_TYPES is an object keyed by type code: { ISTJ: { code, title, subtitle, description, traits }, ... }
  return codes.map(code => {
    const typeData = MBTI_TYPES[code];
    return {
      code,
      name: typeData ? typeData.title : code,
      description: typeData ? typeData.subtitle : '',
      gradient: 'var(--gradient-sage)',
    };
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/ui/screens/ExploreScreen.js
git commit -m "feat: connect Explore types tab to real MBTI type data"
```

---

### Task 23: Clean Up Old UI

**Files:**
- Delete: `styles.css` (after confirming no remaining references)
- Delete: `src/modules/ui/UIManager.js` (after confirming all functionality migrated)
- Modify: `script.js` — remove old UIManager import

- [ ] **Step 1: Search for remaining references to old files**

Search for `UIManager` and `styles.css` imports across the codebase. Remove or redirect them.

- [ ] **Step 2: Delete old files**

```bash
git rm styles.css
git rm src/modules/ui/UIManager.js
```

- [ ] **Step 3: Update script.js to remove old imports**

Remove the UIManager import and instantiation. Keep all Firebase, VK, analytics, and localization code.

- [ ] **Step 4: Run dev server and verify no console errors**

Run: `npm run dev`
Expected: App loads with new 4-tab UI, no references to old UIManager.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove old UIManager and styles.css, complete migration to new UI"
```

---

### Task 24: Build and Verify

**Files:** None new

- [ ] **Step 1: Run production build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Preview production build**

Run: `npm run preview`
Verify all screens render correctly, fonts load, icons display.

- [ ] **Step 3: Test all flows**

1. New user: Home (empty) → Hero → Quiz → Result → Home (populated)
2. Explore: Browse quizzes, switch to Types tab, filter
3. Results: View timeline, tap result to see details
4. Profile: View stats, achievements, premium CTA
5. Premium: Open modal, verify payment flow UI (actual payment not testable locally)
6. Responsive: Resize browser to check mobile/tablet/desktop breakpoints

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify production build passes for redesigned app"
```

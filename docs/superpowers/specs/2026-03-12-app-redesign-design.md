# App Redesign — Full Design Specification

## Overview

Complete redesign of the MBTI personality quiz app with a new warm color scheme (sage & cream), card-based dashboard architecture, bottom tab navigation, and extensible design system supporting multiple personality frameworks (MBTI now, Socionics and others in the future).

**Approach:** Dashboard Hub — 4-tab architecture (Home / Explore / Results / Profile) with full-screen overlay screens for quiz flow, result details, and modals.

**Platform:** Mobile-first + desktop adaptive, both equally important. Responsive design with max-width container (~1200px) on desktop.

**Premium Model:** One-time unlock (280 rubles) for all premium features across all frameworks.

**Framework Architecture:** Unified profile — one home screen shows results across all frameworks, quizzes are accessed from a catalog. Adding a new framework means adding quiz entries in Explore, type entries in the encyclopedia, and results appear in the timeline.

---

## Design System

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#7C9082` | Sage green — buttons, active states, MBTI accent |
| Primary Dark | `#5A7A64` | Gradient endpoints, hover states |
| Surface | `#FAF8F5` | Page background |
| Card | `#FFFFFF` | Card backgrounds |
| Border | `#E8E4DF` | Card borders, dividers |
| Muted BG | `#F0EDE8` | Input backgrounds, inactive segments |
| Text Primary | `#2D2D2D` | Headings, body text |
| Text Secondary | `#5A5A5A` | Descriptions |
| Text Muted | `#8A8A8A` | Labels, captions |
| Text Disabled | `#ADADAD` | Disabled states, placeholders |
| Accent Purple | `#8B7EC8` | Compatibility features |
| Accent Amber | `#E8A85C` | Socionics / new framework badges |
| Accent Rose | `#C47A8A` | Enneagram (future) |
| Accent Gold | `#D4A574` | Premium features, CTAs |
| Success | `#6BAF8D` | Positive trait bars |
| Info Blue | `#5B82B0` | Neutral trait bars |

### Gradients

| Name | Direction | Stops | Usage |
|------|-----------|-------|-------|
| Sage Gradient | 135° | `#7C9082` → `#5A7A64` | Hero cards, result hero, type badges |
| Purple Gradient | 160° | `#8B7EC820` → `#8B7EC808` | Compare card bg |
| Amber Gradient | 160° | `#E8A85C20` → `#E8A85C08` | Socionics card bg |
| Gold Gradient | 135° | `#D4A57430` → `#D4A57410` | Premium CTA bg |

### Shadows

| Name | Offset | Blur | Color | Usage |
|------|--------|------|-------|-------|
| Tab Bar | 0, 4px | 20px | `#0000000A` | Tab bar pill container |
| Card Elevated | 0, 2px | 8px | `#00000008` | Elevated cards (optional) |

### Typography

| Role | Font | Weight | Size | Usage |
|------|------|--------|------|-------|
| Page titles | Fraunces | Regular | 28px | Screen titles (Home, Explore, Results, Profile) |
| Hero title | Fraunces | Regular | 22px | Hero card title, quiz question text, result type name |
| Card titles | Fraunces | Regular | 18px | Share card, premium card, section headings |
| Type names | Fraunces | Regular | 16px | Bento card type names, quiz list titles |
| Body text | Inter | Regular | 14px | Descriptions, subtitles |
| Small body | Inter | Regular | 13px | Card descriptions, metadata |
| Section labels | Inter | Medium 500 | 13px | Section headers ("Personality Frameworks") |
| Tab labels | Inter | Semi-bold 600 | 10px | Bottom tab bar labels |
| Micro labels | Inter | Medium 500 | 11px | Badges, hero subtitle |
| Type code large | IBM Plex Mono | Medium 500 | 48px | Result hero type code (max 4 chars) |
| Type code medium | IBM Plex Mono | Medium 500 | 32px | Home bento type card |
| Stat values | IBM Plex Mono | Medium 500 | 28px | Profile stat cards |
| Counter | IBM Plex Mono | Regular | 14px | Quiz question counter |
| Bar percent | IBM Plex Mono | Regular | 11px | Trait bar percentages |

**Note:** Fraunces is used as a static Regular weight (optical size auto). Inter and IBM Plex Mono are loaded via Google Fonts with system font fallback.

### Component Library (19 components)

1. **Button/Primary** — Sage fill, white text, pill shape (24px radius)
2. **Button/Secondary** — Cream fill, dark text, sage icon, pill shape with border
3. **Badge** — Small pill with tinted background
4. **Card** — White card with border, 20px radius, 24px padding
5. **Stat Card** — Label + large mono value + optional delta
6. **Type Card** — Gradient header with type code, body with name + description
7. **Nav Item** — Icon + label, muted colors
8. **Nav Item Active** — Icon + label, sage tint background
9. **Status Bar** — iOS-style time + signal/wifi/battery icons (62px height, respects safe area insets)
10. **Tab Item** — Bottom tab item, vertical icon + uppercase label, muted
11. **Tab Item Active** — Bottom tab item, sage fill, white icon/label
12. **Tab Bar** — Pill-shaped container (radius 36px), shadow (0 4px 20px #0000000A), 62px inner height, border 1px #E8E4DF
13. **Hero Card** — Sage gradient (135°), badge + title + subtitle
14. **Answer Option** — White card with border, 20px radius, 18px vertical padding
15. **Answer Option Selected** — Sage fill, white text, check icon
16. **Trait Bar** — Letter + progress bar (8px height, 4px radius) + percentage
17. **Achievement Card** — 44px icon wrap + title + description
18. **Dimension Bar** — Left/right labels + full-width progress bar
19. **Quiz List Item** — 44px icon wrap + title + description + chevron

---

## Screen Specifications

### 1. Home Screen (Tab: Home)

**Layout:** Status Bar → Content (scrollable) → Tab Bar

**Content structure (vertical, gap 20px, padding 8/20/20/20):**
- **Greeting** — "Discover Yourself" (Fraunces 28) + subtitle (Inter 14, muted)
- **Hero Card** — Primary quiz CTA. Sage gradient. Shows quiz name, question count, time estimate. If quiz completed: changes to "Retake" or suggests next framework.
- **Bento Row 1** (horizontal, 2 cards):
  - *Your Type* — Shows MBTI code (IBM Plex Mono 32, sage) + type name (Fraunces 16). Empty state: "Take a quiz to discover"
  - *Compare* — Purple accent gradient. People icon + "With Friends →" link. Taps to share a comparison link. Phase 1: generates shareable link with your type. Phase 2 (future): side-by-side comparison view when both users have results.
- **Bento Row 2** (horizontal, flexible):
  - *Traits Chart* — 4 trait bars (E/N/F/P) with colored fills and percentages. Empty state: placeholder bars
  - *Socionics Quiz* (140px wide) — Amber accent. "New!" badge + sparkles icon + title. This is the framework extensibility slot.
- **Share Card** — Horizontal card with title + subtitle + Share button. Hidden if no results.

**Empty state (new user):** Hero card prominent, bento cards show invite states, share card hidden.

**Desktop:** Bento grid expands to wider columns, max-width 1200px container.

### 2. Explore Screen (Tab: Explore)

**Layout:** Status Bar → Content (scrollable) → Tab Bar

**Content structure:**
- **Title** — "Explore" (Fraunces 28)
- **Segmented Control** — "Quizzes" (active) / "Types" (inactive). Pill-shaped toggle with cream bg.
- **Section: Personality Frameworks** (label, Inter 13 muted, 0.5 letter-spacing)
  - Quiz List Items: MBTI (brain icon, sage), Socionics (sparkles, amber), Enneagram (heart, rose)
  - Each shows: icon + title + metadata ("60 questions · 15 min · Free")
- **Section: Premium Quizzes** (label)
  - Quiz List Items: Leadership (crown), Communication (message-circle), Stress (zap) — all gold accent
  - Each shows: icon + title + metadata

**Types tab (when selected):**
- **Filter pills** — Horizontal scroll of filter buttons: All (active) / Analysts / Diplomats / Sentinels / Explorers. Each is a Badge component. When a framework is added, its categories are appended.
- **Type Cards grid** — 2-column grid (gap 12px) of Type Card components. Each shows gradient header with type code + body with name + short description.
- **Empty/no-match state:** "No types match this filter" with reset button.
- On desktop: 3-4 column grid.

### 3. Quiz Screen (Full-screen overlay, no tabs)

**Layout:** Status Bar → Header → Progress Bar → Question Content (centered, fill) → Navigation

**Header (horizontal, space-between):**
- Close button (X icon, muted) — tapping shows Exit Confirmation dialog
- Quiz title ("MBTI Quiz", Inter 15 medium)
- Counter ("12/60", IBM Plex Mono 14 muted)

**Progress Bar:** Full-width track (6px, Muted BG fill) with Primary sage fill, width proportional to progress.

**Question Content (centered vertically):**
- Question text (Fraunces 22, line-height 1.3)
- 4 Answer Options — White cards with border. Selected state: sage fill, white text, check icon.

**Navigation (bottom, horizontal, space-between):**
- Previous button (Secondary, arrow-left) — disabled on first question (opacity 0.4)
- Next button (Primary, arrow-right) — disabled until an answer is selected (opacity 0.4). On last question, label changes to "See Results".

**Quiz flow states:**
- **No answer selected:** Next button disabled. Tapping it does nothing.
- **Close (X) tapped:** Shows exit confirmation dialog — "Exit quiz? Your progress will be lost." with Cancel (secondary) and Exit (danger/red) buttons.
- **Quiz resume:** Progress is NOT saved if user exits. They restart from question 1.
- **Adaptive mode:** When active, confidence bars appear below progress bar (4 bars: E/I, S/N, T/F, J/P). Adaptive status text shown. Can complete early when all dimensions reach 85% confidence.

**Adaptive indicators:** Hidden by default. When adaptive mode active, show confidence bars below progress (same as current, restyled to match new design system).

### 4. Result Detail Screen (Full-screen overlay)

**Layout:** Status Bar → Content (scrollable)

**Content structure:**
- **Back row** — Arrow-left icon + "Back" label (muted, tappable). Navigates to Results Timeline tab.
- **Result Hero** — Sage gradient card, centered. Type code (IBM Plex Mono 48, white, max 4 characters) + type name (Fraunces 22, white) + description (Inter 13, semi-transparent white)
- **Dimensions Card** — White card with "Your Preferences" title. 4 Dimension Bars:
  - Each bar: left label with percentage (e.g., "Extraversion 72%") + right label + colored fill
  - Colors: Primary `#7C9082` (E/I), Accent Gold `#D4A574` (S/N), Success `#6BAF8D` (T/F), Info Blue `#5B82B0` (J/P)
- **Premium Teaser** (free users) — Horizontal card. Lock icon + "Premium" badge (gold) + "Unlock Deep Insights" title + description + chevron. Taps to Premium Modal.
- **Action Buttons** (horizontal):
  - Share (Primary, share-2 icon) — generates a share card image with type code, name, and dimension bars. Native share sheet for VK/Telegram/etc.
  - Retake (Secondary, refresh-cw icon)

**Premium unlocked state:** Premium teaser is replaced with these sections:
- **Advanced Insights** — Card with 2x2 grid of insight cards: Strengths (star icon), Growth Areas (target icon), Career Advice (briefcase icon), Personal Development (lightbulb icon). Each card has title + bullet list from `ADVANCED_INSIGHTS` data.
- **Visual Analytics** — Card with radar chart showing 4 dimensions + bar chart comparison. Uses existing canvas-based charting from current codebase.
- **Famous Personalities** — Card with horizontal scroll of famous person cards: avatar image + name + role. Data from `FAMOUS_PERSONALITIES`.

**Multiple results:** Each quiz attempt creates a separate result. Retaking MBTI adds a new entry to the timeline. Home screen always shows the latest result per framework.

### 5. Results Timeline (Tab: Results)

**Layout:** Status Bar → Content (scrollable) → Tab Bar

**Content structure:**
- **Title** — "Results" (Fraunces 28)
- **Results List** (vertical, gap 12):
  - Each result item: horizontal card with type badge (56x56, gradient/colored, rounded 16px) + info (title + subtitle with date) + chevron
  - MBTI results: sage gradient badge with type code
  - Premium quiz results: gold-tinted badge with quiz icon
  - Tapping opens Result Detail screen

**Empty state:** Illustration + "No results yet" + CTA to start first quiz.

### 6. Profile Screen (Tab: Profile)

**Layout:** Status Bar → Content (scrollable) → Tab Bar

**Content structure:**
- **Title** — "Profile" (Fraunces 28)
- **User Card** — Avatar circle (56px, sage tint with user icon; or VK photo if authorized) + name (Inter 16 medium; "Guest" if not logged in) + type summary ("ENFP · The Campaigner", Inter 13 muted; hidden if no quiz taken)
- **Stats Row** (horizontal, 2 Stat Cards): Tests Taken (count of completed quizzes) + Accuracy (average confidence across all completed adaptive quizzes; shows "—" if no quizzes taken)
- **Achievements Section** — Title + Achievement Cards:
  - Earned: sage icon wrap + dark text
  - Locked: muted icon wrap + muted text
  - Achievements: First Steps, On Fire (streak), High Accuracy, Explorer (5 types), Specialist (all premium), Master (all tests)
- **Premium CTA** — Gold gradient card. "Go Premium" title + "Unlock all quizzes & insights" + price button (280 ₽). Hidden if already premium.

### 7. Premium Modal (Bottom sheet overlay)

**Layout:** Semi-transparent backdrop (#00000060) → Bottom sheet with handle

**Sheet structure:**
- **Handle** — 40x4px pill, centered
- **Header** — Gold icon wrap (crown) + "Go Premium" (Fraunces 26) + subtitle
- **Benefits List** — 5 items with check-circle icons (sage):
  - Advanced personality insights & analysis
  - 15 specialized premium quizzes
  - Famous personality matches
  - Visual charts & analytics
  - Ad-free experience
- **CTA Button** — Gold fill (#D4A574), full-width pill. "Unlock Premium — 280 ₽" (Inter 16 semibold, white)
- **Note** — "One-time payment · No subscription" (Inter 12, muted)

---

## Navigation & Flows

### Tab Bar
4 tabs with pill-shaped container: HOME / EXPLORE / RESULTS / PROFILE
- Active: sage fill + white icon/label
- Inactive: transparent + muted icon/label
- Icons: layout-dashboard / compass / chart-bar / user
- Labels: uppercase, Inter 10, 500 weight, 0.5 letter-spacing

### Key User Flows

**New User:**
1. Home (empty state, hero CTA prominent) → Start Quiz → Quiz Screen → Results → Home (populated dashboard)

**Returning User:**
1. Home (dashboard with type) → Explore (browse more quizzes) → Quiz → Results Timeline updated

**Premium Purchase:**
1. Any premium-locked section → Premium Modal → VK Payment → Content revealed

**Framework Extension (adding Socionics):**
1. Add quiz entry in Explore catalog with amber accent
2. Add type entries in Types encyclopedia
3. Results appear in Results Timeline with amber badge
4. Home dashboard shows Socionics badge card (extensibility slot)

---

## Extensibility Architecture

### Adding a New Framework

Each framework gets:
- **Color accent** — Unique color for badges, icons, gradients (e.g., amber for Socionics)
- **Quiz entry** — Appears in Explore > Quizzes section
- **Type entries** — Appear in Explore > Types tab with framework filter
- **Result items** — Appear in Results Timeline with framework-colored badge
- **Home badge** — Appears in the Bento Row 2 extensibility slot
- **Data files** — Follows existing pattern: `src/data/{Framework}Quiz.js` + `src/data/{Framework}Quiz.ru.js`

### Design System Extension

To add a framework color:
1. Add color token to palette (e.g., `Accent Rose: #C47A8A` for Enneagram)
2. Use in icon wraps, gradient backgrounds, and badges
3. All existing components (Quiz List Item, Type Card, Badge, etc.) work with any accent color

---

## Responsive Behavior

### Mobile (< 768px)
- Single column layout, full-width cards
- Bottom tab bar visible
- Quiz screen: full-screen overlay

### Tablet (768–1024px)
- Wider bento grid (3 columns on Home)
- Side-by-side layout for some sections

### Desktop (> 1024px)
- Max-width 1200px container, centered
- Bento grid expands to 3-4 columns
- Tab bar remains as bottom bar (same as mobile, for consistency and simplicity)
- Quiz screen: centered card (max 600px width) on dimmed background

---

## Design File Reference

All screens are designed in `personalities.pen`:
- **Design System** frame — 19 reusable components
- **Home Screen** — Dashboard with bento cards
- **Explore Screen** — Quiz catalog with segmented control
- **Quiz Screen** — Full-screen question flow
- **Results Screen** — Type result with dimension breakdown
- **Results Timeline** — Chronological test history
- **Profile Screen** — User stats and achievements
- **Premium Modal** — Bottom sheet purchase flow

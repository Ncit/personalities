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

### Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Page titles | Fraunces | Regular | 28px |
| Card titles | Fraunces | Regular | 18–22px |
| Type names | Fraunces | Regular | 16px |
| Body text | Inter | Regular/Medium | 13–15px |
| Labels | Inter | Medium 500 | 11–13px |
| Data values | IBM Plex Mono | Medium 500 | 24–48px |
| Percentages | IBM Plex Mono | Regular | 11–14px |

### Component Library (19 components)

1. **Button/Primary** — Sage fill, white text, pill shape (24px radius)
2. **Button/Secondary** — Cream fill, dark text, sage icon, pill shape with border
3. **Badge** — Small pill with tinted background
4. **Card** — White card with border, 20px radius, 24px padding
5. **Stat Card** — Label + large mono value + optional delta
6. **Type Card** — Gradient header with type code, body with name + description
7. **Nav Item / Nav Item Active** — Icon + label, active has tinted background
8. **Status Bar** — iOS-style time + signal/wifi/battery icons (62px height)
9. **Tab Item / Tab Item Active** — Bottom tab items, vertical icon + uppercase label
10. **Tab Bar** — Pill-shaped container with shadow, 62px inner height
11. **Hero Card** — Sage gradient, badge + title + subtitle
12. **Answer Option / Answer Option Selected** — Quiz answer buttons with check state
13. **Trait Bar** — Letter + progress bar + percentage
14. **Achievement Card** — Icon wrap + title + description
15. **Dimension Bar** — Left/right labels + full-width progress bar
16. **Quiz List Item** — Icon wrap + title + description + chevron

---

## Screen Specifications

### 1. Home Screen (Tab: Home)

**Layout:** Status Bar → Content (scrollable) → Tab Bar

**Content structure (vertical, gap 20px, padding 8/20/20/20):**
- **Greeting** — "Discover Yourself" (Fraunces 28) + subtitle (Inter 14, muted)
- **Hero Card** — Primary quiz CTA. Sage gradient. Shows quiz name, question count, time estimate. If quiz completed: changes to "Retake" or suggests next framework.
- **Bento Row 1** (horizontal, 2 cards):
  - *Your Type* — Shows MBTI code (IBM Plex Mono 32, sage) + type name (Fraunces 16). Empty state: "Take a quiz to discover"
  - *Compare* — Purple accent gradient. People icon + "With Friends →" link
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

**Types tab (when selected):** Shows Type Cards in a scrollable grid, filterable by framework (All / Analysts / Diplomats / Sentinels / Explorers for MBTI). Extensible: Socionics types would add their own filter categories.

### 3. Quiz Screen (Full-screen overlay, no tabs)

**Layout:** Status Bar → Header → Progress Bar → Question Content (centered, fill) → Navigation

**Header (horizontal, space-between):**
- Close button (X icon, muted)
- Quiz title ("MBTI Quiz", Inter 15 medium)
- Counter ("12/60", IBM Plex Mono 14 muted)

**Progress Bar:** Full-width track (6px, cream bg) with sage fill proportional to progress.

**Question Content (centered vertically):**
- Question text (Fraunces 22, line-height 1.3)
- 4 Answer Options — White cards with border. Selected state: sage fill, white text, check icon.

**Navigation (bottom, horizontal, space-between):**
- Previous button (Secondary, arrow-left)
- Next button (Primary, arrow-right)

**Adaptive indicators:** Hidden by default. When adaptive mode active, show confidence bars below progress (same as current, restyled to match new design system).

### 4. Results Screen (Full-screen overlay)

**Layout:** Status Bar → Content (scrollable)

**Content structure:**
- **Back row** — Arrow-left icon + "Results" label (muted, tappable)
- **Result Hero** — Sage gradient card, centered. Type code (IBM Plex Mono 48, white) + type name (Fraunces 22, white) + description (Inter 13, semi-transparent white)
- **Dimensions Card** — White card with "Your Preferences" title. 4 Dimension Bars:
  - Each bar: left label with percentage (e.g., "Extraversion 72%") + right label + colored fill
  - Colors: sage (E/I), gold (S/N), green (T/F), blue (J/P)
- **Premium Teaser** — Horizontal card. Lock icon + "Premium" badge (gold) + "Unlock Deep Insights" title + description + chevron. Taps to Premium Modal.
- **Action Buttons** (horizontal):
  - Share (Primary, share-2 icon)
  - Retake (Secondary, refresh-cw icon)

**Premium unlocked state:** Premium teaser replaced with actual content sections (Advanced Insights grid, Visual Analytics charts, Famous Personalities grid).

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
- **User Card** — Avatar circle (56px, sage tint) + name (Inter 16 medium) + type summary ("ENFP · The Campaigner", Inter 13 muted)
- **Stats Row** (horizontal, 2 Stat Cards): Tests Taken + Accuracy
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
- Tab bar converts to sidebar navigation (optional, can keep bottom bar)
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

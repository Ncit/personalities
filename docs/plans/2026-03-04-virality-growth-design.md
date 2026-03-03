# Virality-First Growth Strategy — Design Document

**Date:** 2026-03-04
**Status:** Approved
**Goal:** Grow the personality quiz platform from <100 daily users to sustainable organic growth through viral sharing, SEO, and improved conversion.

## Context

The platform is an MBTI/personality quiz at nikmobdev.ru, also running as a VK Mini App. It has a freemium model (free 20-question MBTI, premium unlocks 60 questions + 15 specialized quizzes) with VK payments. Traffic is early-stage (<100 daily users) across both VK and standalone web.

The core product quality is solid — the quiz, analytics, and premium content are well-built. What's missing is a growth loop: every completed quiz should generate 3-5 new visits through sharing and discoverability.

## Approach: Virality-First

At early stage, traffic growth beats conversion optimization. Focus on making the product inherently shareable and discoverable.

---

## Feature 1: Shareable Visual Result Cards

### What
Auto-generate beautiful, branded image cards after quiz completion. Two formats:
- 1080x1080 for VK/Instagram feed posts
- 1080x1920 for Stories

### Card Content
- Personality type code and name (e.g., "INFP — Идеалист")
- Key trait percentages as visual bars (e.g., "Интроверсия 72%")
- Unique color palette and icon per personality type
- Branded footer: "nikmobdev.ru — Узнай свой тип"
- QR code or short URL for mobile sharing

### Technical Approach
- HTML Canvas rendering (client-side, leveraging existing AnalyticsEngine Canvas expertise)
- PNG blob generation
- VK: share via `VKWebAppShowWallPostBox`
- Web: download button + copy-link-to-results

### User Flow
1. Complete quiz → results screen shows normally
2. Below results: polished "Share your type" section with card preview
3. One-tap sharing to VK wall/story
4. Card links back to quiz → viral loop closes

### Expected Impact
Highest-leverage single feature. Personality test results are among the most shared social content. Each share = free ad bringing 3-10 new visitors.

---

## Feature 2: Socionics Quiz

### What
Complete the existing Socionics quiz (SocionicsQuiz.js, SocionicsQuiz.ru.js already started). Socionics is hugely popular in Russian internet — "соционика тест" gets ~40K monthly searches.

### Implementation
- Finish Socionics quiz data (questions + 16 sociotype descriptions)
- Integrate into QuizEngine (already supports multiple quiz types)
- Dedicated landing: "Тест на соционический тип"
- 16 SEO pages (one per sociotype)
- Shareable cards for Socionics types
- **Free tier:** 20 questions, basic type result
- **Premium:** Full assessment + intertype relations + career compatibility

### Socionics-Specific Features
- **Intertype relations calculator** — free teaser shows partner type name, premium unlocks full compatibility analysis
- Dual/conflict/mirror/activation relation descriptions
- This is a major premium upsell hook (people want compatibility info)

### Expected Impact
Doubles addressable audience. Socionics enthusiasts are highly engaged and willing to pay for detailed analysis.

---

## Feature 3: SEO Landing Pages

### What
32 dedicated, content-rich pages (16 MBTI + 16 Socionics types) that rank in search.

### URL Structure
- `/mbti/infp` — "INFP: Идеалист — Полное описание типа личности"
- `/socionics/ile` — "ИЛЭ (Дон Кихот) — Описание соционического типа"

### Page Content
- H1 with type name and nickname
- Detailed personality description (strengths, weaknesses, career, relationships)
- Static key statistics visualization
- "Am I this type? Take the test" CTA
- Related types section (internal linking)
- Schema.org structured data for rich snippets

### Technical Approach
- Static HTML pages via Vite multi-page config or build-time generation
- Reuse existing personality descriptions from QuizData.js / QuizData.ru.js
- Lightweight pages with shared CSS

### Expected Impact
Long-tail SEO traffic. Thousands of monthly searches for personality type descriptions. Free, compounding traffic.

---

## Feature 4: Compare With Friends

### What
After completing the quiz, generate a unique comparison link. When a friend completes the quiz via that link, both see compatibility analysis.

### User Flow
1. User A completes quiz → gets result (e.g., INFP)
2. Clicks "Compare with a friend" → generates unique link
3. Shares link via VK, Telegram, WhatsApp
4. User B opens link → sees "Your friend [Name] is INFP. Take the quiz to see compatibility!"
5. User B completes quiz → both see compatibility result
6. **Premium upsell:** Free = basic match %. Premium = detailed analysis (communication tips, conflict areas, strengths as pair)

### Technical Approach
- No backend needed: comparison data encoded in URL (type + name + timestamp, base64)
- Example: `nikmobdev.ru/compare?d=eyJ0eXBlIjoiSU5GUCIsIm5hbWUiOiLQn9C10YLRjyJ9`
- Standard quiz flow, results page adds compatibility section
- Compatibility logic uses established MBTI/Socionics intertype relations

### Expected Impact
Viral loop multiplier. Every comparison link is a personal invitation. 2-3x organic growth rate potential.

---

## Feature 5: Improved Premium Upsell

### Progressive Reveals on Results Page
- Show first 2-3 lines of each premium section visible, blur the rest
- Animated "peek" previews (e.g., "Career strengths: Strategic Thinking, Creative Problem-Solving, and..." [blur])
- Mini compatibility teaser: "Most compatible: ENFJ (92%)... [unlock full analysis]"

### Timed Premium Prompt
- Don't show premium modal immediately — let user absorb free results for 10-15 seconds
- Then slide in subtle bottom bar: "Want deeper insights? 15 specialized quizzes available"

### Social Proof
- Counter: "Более 10,000 человек уже прошли тест" (seeded, incremented by Firebase)
- 2-3 testimonial blurbs

### Premium Value Preview
- Specialized quiz selection shows mini-descriptions with lock icons
- Tapping a locked quiz shows 3-second animated preview of what it reveals, then offers to unlock

### Expected Impact
Progressive reveals typically increase conversion 20-40% vs hard paywalls.

---

## Priority Order

1. **Shareable visual result cards** — biggest single impact, enables all sharing
2. **Socionics quiz** — captures huge search demand, leverages existing partial work
3. **SEO type pages** — long-term organic traffic engine
4. **Compare with friends** — viral loop multiplier
5. **Improved premium upsell** — conversion optimization on growing traffic

## Success Metrics

- Daily unique visitors (target: 100 → 500 in 3 months)
- Quiz completion rate (target: >70%)
- Share rate after completion (target: >15%)
- Premium conversion rate (target: >3% of completions)
- Organic search impressions growth (month-over-month)

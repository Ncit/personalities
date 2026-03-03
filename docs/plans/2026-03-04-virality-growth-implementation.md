# Virality-First Growth Strategy — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 5 growth features (shareable cards, Socionics quiz, SEO pages, friend comparison, premium upsell improvements) to grow the personality quiz platform from <100 to 500+ daily users.

**Architecture:** Vanilla JS ES6 modules, Canvas API for card rendering, Vite build system, VK Bridge for sharing. No frameworks. Extend existing QuizEngine/UIManager/AnalyticsEngine patterns. New modules: `src/modules/sharing/ShareCardGenerator.js`, `src/modules/comparison/ComparisonEngine.js`, `src/data/SocionicsData.js`. SEO pages via Vite multi-page build.

**Tech Stack:** Vanilla JS, Canvas API, Vite (multi-page), VK Bridge, Firebase Analytics, localStorage

---

## Task 1: Shareable Visual Result Card Generator

**Files:**
- Create: `src/modules/sharing/ShareCardGenerator.js`
- Create: `src/modules/sharing/cardStyles.js`
- Modify: `src/modules/ui/UIManager.js:207-234` (displayResults method — add share card section)
- Modify: `index.html` (add share card UI section in results screen)
- Modify: `styles.css` (add share card styles)
- Modify: `script.js` (add shareCardImage global function)
- Modify: `src/locales/ru.js` (add sharing-related locale keys)
- Modify: `src/locales/en.js` (add sharing-related locale keys)

### Step 1: Create card style configuration

Create `src/modules/sharing/cardStyles.js` with per-type color palettes and layout constants:

```javascript
// Per-type visual configuration for shareable cards
export const CARD_STYLES = {
    // Dimensions
    FEED: { width: 1080, height: 1080 },
    STORY: { width: 1080, height: 1920 },

    // Per-type palettes (gradient start, gradient end, accent, text)
    TYPE_COLORS: {
        ISTJ: { gradient: ['#2c3e50', '#3498db'], accent: '#1abc9c', text: '#ecf0f1' },
        ISFJ: { gradient: ['#2d3436', '#636e72'], accent: '#00b894', text: '#dfe6e9' },
        INFJ: { gradient: ['#6c5ce7', '#a29bfe'], accent: '#ffeaa7', text: '#dfe6e9' },
        INTJ: { gradient: ['#0c0c0c', '#2d3436'], accent: '#00cec9', text: '#dfe6e9' },
        ISTP: { gradient: ['#636e72', '#b2bec3'], accent: '#fdcb6e', text: '#2d3436' },
        ISFP: { gradient: ['#e17055', '#fab1a0'], accent: '#ffeaa7', text: '#2d3436' },
        INFP: { gradient: ['#a29bfe', '#dfe6e9'], accent: '#fd79a8', text: '#2d3436' },
        INTP: { gradient: ['#0984e3', '#74b9ff'], accent: '#ffeaa7', text: '#dfe6e9' },
        ESTP: { gradient: ['#d63031', '#e17055'], accent: '#ffeaa7', text: '#dfe6e9' },
        ESFP: { gradient: ['#fdcb6e', '#ffeaa7'], accent: '#e17055', text: '#2d3436' },
        ENFP: { gradient: ['#e84393', '#fd79a8'], accent: '#ffeaa7', text: '#dfe6e9' },
        ENTP: { gradient: ['#00b894', '#55efc4'], accent: '#ffeaa7', text: '#2d3436' },
        ESTJ: { gradient: ['#2d3436', '#636e72'], accent: '#0984e3', text: '#dfe6e9' },
        ESFJ: { gradient: ['#00cec9', '#81ecec'], accent: '#fdcb6e', text: '#2d3436' },
        ENFJ: { gradient: ['#6c5ce7', '#a29bfe'], accent: '#00cec9', text: '#dfe6e9' },
        ENTJ: { gradient: ['#2d3436', '#636e72'], accent: '#d63031', text: '#dfe6e9' }
    },

    // Layout
    PADDING: 80,
    TYPE_CODE_FONT_SIZE: 120,
    TITLE_FONT_SIZE: 48,
    SUBTITLE_FONT_SIZE: 28,
    BAR_HEIGHT: 24,
    BAR_GAP: 48,
    FOOTER_FONT_SIZE: 24,
    BRAND_URL: 'nikmobdev.ru'
};
```

### Step 2: Create ShareCardGenerator class

Create `src/modules/sharing/ShareCardGenerator.js`:

```javascript
import { CARD_STYLES } from './cardStyles.js';

export class ShareCardGenerator {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * Generate a shareable card image
     * @param {Object} params - { personalityType, title, subtitle, scores, format }
     * @param {string} params.format - 'feed' (1080x1080) or 'story' (1080x1920)
     * @returns {Promise<Blob>} PNG blob
     */
    async generateCard({ personalityType, title, subtitle, scores, format = 'feed' }) {
        const size = format === 'story' ? CARD_STYLES.STORY : CARD_STYLES.FEED;
        const colors = CARD_STYLES.TYPE_COLORS[personalityType] || CARD_STYLES.TYPE_COLORS.INFP;

        this.canvas.width = size.width;
        this.canvas.height = size.height;
        const ctx = this.ctx;

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, size.width, size.height);
        gradient.addColorStop(0, colors.gradient[0]);
        gradient.addColorStop(1, colors.gradient[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size.width, size.height);

        // Decorative circles
        this._drawDecorations(ctx, size, colors);

        const pad = CARD_STYLES.PADDING;
        let y = format === 'story' ? 300 : 160;

        // Type code (large)
        ctx.font = `bold ${CARD_STYLES.TYPE_CODE_FONT_SIZE}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = colors.text;
        ctx.textAlign = 'center';
        ctx.fillText(personalityType, size.width / 2, y);
        y += 60;

        // Title
        ctx.font = `600 ${CARD_STYLES.TITLE_FONT_SIZE}px Inter, system-ui, sans-serif`;
        ctx.fillText(title, size.width / 2, y);
        y += 40;

        // Subtitle
        ctx.font = `300 ${CARD_STYLES.SUBTITLE_FONT_SIZE}px Inter, system-ui, sans-serif`;
        ctx.globalAlpha = 0.8;
        ctx.fillText(subtitle, size.width / 2, y);
        ctx.globalAlpha = 1;
        y += format === 'story' ? 120 : 80;

        // Dimension bars
        const dimensions = [
            { label: 'E/I', left: 'E', right: 'I', leftScore: scores.E, rightScore: scores.I },
            { label: 'S/N', left: 'S', right: 'N', leftScore: scores.S, rightScore: scores.N },
            { label: 'T/F', left: 'T', right: 'F', leftScore: scores.T, rightScore: scores.F },
            { label: 'J/P', left: 'J', right: 'P', leftScore: scores.J, rightScore: scores.P }
        ];

        const barWidth = size.width - pad * 2;
        dimensions.forEach(dim => {
            const total = dim.leftScore + dim.rightScore;
            const leftPct = total > 0 ? Math.round((dim.leftScore / total) * 100) : 50;
            const rightPct = 100 - leftPct;
            this._drawDimensionBar(ctx, pad, y, barWidth, dim, leftPct, rightPct, colors);
            y += CARD_STYLES.BAR_GAP + CARD_STYLES.BAR_HEIGHT;
        });

        // Footer branding
        y = size.height - pad;
        ctx.font = `400 ${CARD_STYLES.FOOTER_FONT_SIZE}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = colors.text;
        ctx.globalAlpha = 0.6;
        ctx.textAlign = 'center';
        ctx.fillText(`${CARD_STYLES.BRAND_URL} — Узнай свой тип`, size.width / 2, y);
        ctx.globalAlpha = 1;

        return this._toBlob();
    }

    _drawDecorations(ctx, size, colors) {
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(size.width * 0.85, size.height * 0.15, 200, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(size.width * 0.1, size.height * 0.8, 150, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    _drawDimensionBar(ctx, x, y, width, dim, leftPct, rightPct, colors) {
        const h = CARD_STYLES.BAR_HEIGHT;

        // Labels
        ctx.font = 'bold 22px Inter, system-ui, sans-serif';
        ctx.fillStyle = colors.text;
        ctx.textAlign = 'left';
        ctx.fillText(`${dim.left} ${leftPct}%`, x, y - 6);
        ctx.textAlign = 'right';
        ctx.fillText(`${rightPct}% ${dim.right}`, x + width, y - 6);

        // Background bar
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.roundRect(x, y, width, h, h / 2);
        ctx.fill();

        // Filled bar
        ctx.fillStyle = colors.accent;
        const filledWidth = (leftPct / 100) * width;
        ctx.beginPath();
        ctx.roundRect(x, y, filledWidth, h, h / 2);
        ctx.fill();
    }

    _toBlob() {
        return new Promise(resolve => {
            this.canvas.toBlob(blob => resolve(blob), 'image/png');
        });
    }

    /**
     * Get data URL for preview display
     */
    getPreviewDataURL() {
        return this.canvas.toDataURL('image/png');
    }
}

export const shareCardGenerator = new ShareCardGenerator();
```

### Step 3: Add share card UI to results screen in index.html

Find the results screen section in `index.html` (search for `id="resultsScreen"`) and add after the personality traits section:

```html
<!-- Share Card Section -->
<div class="share-card-section" id="shareCardSection">
    <h3 class="share-card-title">Поделитесь результатом</h3>
    <div class="share-card-preview" id="shareCardPreview">
        <canvas id="shareCardCanvas" style="display:none;"></canvas>
        <img id="shareCardImage" alt="Your personality card" />
    </div>
    <div class="share-card-actions">
        <button class="btn btn-share-vk" id="shareVkBtn" onclick="shareCardToVK()">
            <i class="fab fa-vk"></i> Поделиться в VK
        </button>
        <button class="btn btn-share-download" id="shareDownloadBtn" onclick="downloadShareCard()">
            <i class="fas fa-download"></i> Скачать картинку
        </button>
    </div>
</div>
```

### Step 4: Add share card CSS to styles.css

Append to `styles.css`:

```css
/* Share Card Section */
.share-card-section {
    margin-top: 2rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
    border-radius: 16px;
    text-align: center;
}
.share-card-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--text-primary, #333);
}
.share-card-preview {
    margin: 1rem auto;
    max-width: 400px;
}
.share-card-preview img {
    width: 100%;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
.share-card-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 1rem;
}
.btn-share-vk {
    background: #4C75A3;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: transform 0.15s;
}
.btn-share-vk:hover { transform: scale(1.03); }
.btn-share-download {
    background: var(--bg-secondary, #f0f0f0);
    color: var(--text-primary, #333);
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: transform 0.15s;
}
.btn-share-download:hover { transform: scale(1.03); }
```

### Step 5: Wire share card into UIManager.displayResults()

In `src/modules/ui/UIManager.js`, modify `displayResults()` (line 207) to generate the share card after displaying results:

```javascript
async displayResults() {
    const results = stateManager.getLastResults();
    if (!results) return;

    const { MBTI_TYPES } = await import('../../data/QuizData.ru.js');
    const personalityData = MBTI_TYPES[results.personalityType];

    // ... existing code for updating personality card ...

    // Generate share card
    try {
        const { shareCardGenerator } = await import('../sharing/ShareCardGenerator.js');
        const blob = await shareCardGenerator.generateCard({
            personalityType: results.personalityType,
            title: personalityData.title,
            subtitle: personalityData.subtitle,
            scores: results.scores,
            format: 'feed'
        });
        const previewURL = shareCardGenerator.getPreviewDataURL();
        const img = document.getElementById('shareCardImage');
        if (img) {
            img.src = previewURL;
            img.style.display = 'block';
        }
        // Store blob for download/share
        window._shareCardBlob = blob;
    } catch (err) {
        console.warn('Failed to generate share card:', err);
    }
}
```

### Step 6: Add global share/download functions in script.js

Add to `script.js` near the existing `shareResults()` function (around line 1187):

```javascript
async function shareCardToVK() {
    const blob = window._shareCardBlob;
    if (!blob) { console.warn('No share card blob available'); return; }

    if (vkBridgeManager && vkBridgeManager.isVKEnvironment()) {
        // VK: upload image then share wall post
        // For VK Mini Apps, share as base64 photo
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            vkBridgeManager.bridge.send('VKWebAppShowWallPostBox', {
                message: 'Мой тип характера — пройди тест и узнай свой!\n' + window.location.href,
                attachments: '' // VK wall post with link
            }).catch(err => console.warn('VK share failed:', err));
        };
        reader.readAsDataURL(blob);
    } else if (navigator.share && navigator.canShare) {
        // Web Share API with file
        const file = new File([blob], 'my-personality-type.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: 'Мой тип личности',
                text: 'Пройди тест и узнай свой тип!',
                url: window.location.href,
                files: [file]
            });
        }
    }
}

function downloadShareCard() {
    const blob = window._shareCardBlob;
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-personality-type.png';
    a.click();
    URL.revokeObjectURL(url);
}
```

### Step 7: Add locale keys for sharing

In `src/locales/ru.js`, add under a `sharing` section:

```javascript
sharing: {
    title: 'Поделитесь результатом',
    shareVK: 'Поделиться в VK',
    download: 'Скачать картинку',
    shareText: 'Мой тип характера — пройди тест и узнай свой!',
    compareInvite: 'Сравни свой тип с моим!'
}
```

In `src/locales/en.js`, same keys in English.

### Step 8: Commit

```bash
git add src/modules/sharing/ src/locales/ru.js src/locales/en.js src/modules/ui/UIManager.js index.html styles.css script.js
git commit -m "feat: add shareable visual result cards with Canvas rendering"
```

---

## Task 2: Socionics Quiz Data & Integration

**Files:**
- Create: `src/data/SocionicsData.js` (sociotype descriptions, intertype relations)
- Create: `src/data/SocionicsData.ru.js` (Russian version)
- Create: `src/data/SocionicsQuiz.js` (Socionics quiz questions)
- Create: `src/data/SocionicsQuiz.ru.js` (Russian quiz questions)
- Modify: `src/data/QuizData.js:122-236` (add socionics to QUIZ_TYPES)
- Modify: `src/data/QuizData.ru.js` (add Russian socionics type to QUIZ_TYPES)
- Modify: `src/modules/quiz/QuizEngine.js:387-414` (add socionics question generation)
- Modify: `src/modules/ui/UIManager.js:207-234` (handle socionics results display)
- Modify: `src/locales/ru.js` (socionics-related strings)
- Modify: `src/locales/en.js` (socionics-related strings)

### Step 1: Create Socionics type data

Create `src/data/SocionicsData.js` with all 16 sociotypes. The Socionics system uses different dimensions than MBTI: Logic/Ethics (T/F), Intuition/Sensing (N/S), Extraverted/Introverted, plus static/dynamic.

Each sociotype needs:
```javascript
export const SOCIONICS_TYPES = {
    ILE: {
        code: 'ILE',
        title: 'The Seeker',
        titleRu: 'Дон Кихот',
        alias: 'Don Quixote',
        subtitle: 'Intuitive Logical Extrovert',
        quadra: 'Alpha',
        description: '...', // 3-4 sentence description
        traits: ['Innovative', 'Curious', 'Theoretical', 'Versatile', 'Independent'],
        strengths: [...],
        weaknesses: [...],
        careers: [...]
    },
    SEI: { /* Дюма */ },
    ESE: { /* Гюго */ },
    LII: { /* Робеспьер */ },
    EIE: { /* Гамлет */ },
    LSI: { /* Максим Горький */ },
    SLE: { /* Жуков */ },
    IEI: { /* Есенин */ },
    SEE: { /* Наполеон */ },
    ILI: { /* Бальзак */ },
    LIE: { /* Джек Лондон */ },
    ESI: { /* Драйзер */ },
    LSE: { /* Штирлиц */ },
    EII: { /* Достоевский */ },
    IEE: { /* Гексли */ },
    SLI: { /* Габен */ }
};

// Intertype relations matrix (16x16)
export const INTERTYPE_RELATIONS = {
    ILE: {
        SEI: 'dual',       // Best match
        ESE: 'activation',
        LII: 'mirror',
        EIE: 'semi-dual',
        LSI: 'conflict',   // Worst match
        SLE: 'supervision_by',
        IEI: 'supervision_of',
        // ... all 16 relations
    },
    // ... all 16 types
};

export const RELATION_DESCRIPTIONS = {
    dual: { name: 'Dual', nameRu: 'Дуальные', description: 'Perfect psychological complement...', compatibility: 95 },
    mirror: { name: 'Mirror', nameRu: 'Зеркальные', description: '...', compatibility: 80 },
    activation: { name: 'Activation', nameRu: 'Активация', description: '...', compatibility: 85 },
    identity: { name: 'Identity', nameRu: 'Тождественные', description: '...', compatibility: 70 },
    conflict: { name: 'Conflict', nameRu: 'Конфликтные', description: '...', compatibility: 20 },
    // ... all 14 relation types
};
```

Create `src/data/SocionicsData.ru.js` — same structure with Russian content.

### Step 2: Create Socionics quiz questions

Create `src/data/SocionicsQuiz.js` with 60 questions covering 4 Socionics dichotomies:
- Logic/Ethics (T/F equivalent)
- Intuition/Sensing (N/S equivalent)
- Extraversion/Introversion (E/I equivalent)
- Rational/Irrational (J/P equivalent)

```javascript
export const SOCIONICS_QUESTIONS = [
    {
        question: 'When solving a problem, do you prefer to...',
        options: [
            { text: 'Analyze logically and find the most efficient solution', dimension: 'logic', weight: 2 },
            { text: 'Consider how the solution affects people involved', dimension: 'ethics', weight: 2 },
            { text: 'Look at the problem from an unusual angle', dimension: 'logic', weight: 1 },
            { text: 'Go with your gut feeling about what feels right', dimension: 'ethics', weight: 1 }
        ],
        dimension: 'LE'  // Logic/Ethics
    },
    // ... 59 more questions (15 per dichotomy)
];
```

Create `src/data/SocionicsQuiz.ru.js` — same structure with Russian question text.

### Step 3: Register socionics in QUIZ_TYPES

In `src/data/QuizData.js`, add after `mbti` entry (line ~130):

```javascript
socionics: {
    name: 'Socionics Type Assessment',
    description: 'Discover your socionic type and intertype relations',
    questionCount: { free: 20, premium: 60 },
    icon: 'fas fa-atom',
    color: '#9b59b6'
},
```

Same in `src/data/QuizData.ru.js`.

### Step 4: Update QuizEngine to handle socionics

In `src/modules/quiz/QuizEngine.js`, modify `generateQuestions()` (line 387):

```javascript
generateQuestions() {
    const quizType = this.quizType;
    const isPremium = stateManager.isPremium();

    if (quizType === 'mbti') {
        return this.generateMBTIQuestions(isPremium);
    } else if (quizType === 'socionics') {
        return this.generateSocionicsQuestions(isPremium);
    } else {
        return this.generateSpecializedQuestions(quizType);
    }
}

async generateSocionicsQuestions(isPremium) {
    const locale = stateManager.getState().language || 'ru';
    const module = locale === 'ru'
        ? await import('../../data/SocionicsQuiz.ru.js')
        : await import('../../data/SocionicsQuiz.js');

    const questions = module.SOCIONICS_QUESTIONS;
    return isPremium ? questions : questions.slice(0, 20);
}
```

Also add a `calculateSocionicsType()` method that maps scores to one of 16 sociotypes based on the 4 dichotomies.

### Step 5: Update UIManager for socionics results

Modify `displayResults()` in UIManager to check quiz type and load appropriate type data:

```javascript
async displayResults() {
    const results = stateManager.getLastResults();
    if (!results) return;

    const quizType = stateManager.getCurrentQuizType();
    let personalityData;

    if (quizType === 'socionics') {
        const locale = stateManager.getState().language || 'ru';
        const module = locale === 'ru'
            ? await import('../../data/SocionicsData.ru.js')
            : await import('../../data/SocionicsData.js');
        personalityData = module.SOCIONICS_TYPES[results.personalityType];
    } else {
        const { MBTI_TYPES } = await import('../../data/QuizData.ru.js');
        personalityData = MBTI_TYPES[results.personalityType];
    }

    // ... rest of existing display logic (same pattern)
}
```

### Step 6: Add intertype relations display (premium teaser)

After basic results, show a teaser for intertype relations:

```html
<!-- In results section of index.html -->
<div class="intertype-teaser" id="intertypeTeaser" style="display:none;">
    <h3>Ваш идеальный партнёр</h3>
    <p class="intertype-dual">Ваш дуал: <strong id="dualType"></strong></p>
    <div class="premium-overlay">
        <p>Полный анализ 16 межтиповых отношений</p>
        <button class="btn btn-premium" onclick="openPremiumModal()">Разблокировать</button>
    </div>
</div>
```

### Step 7: Commit

```bash
git add src/data/Socionics*.js src/modules/quiz/QuizEngine.js src/modules/ui/UIManager.js src/data/QuizData.js src/data/QuizData.ru.js index.html src/locales/ru.js src/locales/en.js
git commit -m "feat: add Socionics personality quiz with 16 sociotypes and intertype relations"
```

---

## Task 3: SEO Landing Pages (Multi-page Vite Build)

**Files:**
- Create: `types/mbti/index.html` (template for MBTI type pages)
- Create: `types/socionics/index.html` (template for Socionics type pages)
- Create: `scripts/generate-type-pages.js` (build-time page generator)
- Create: `src/seo/TypePageRenderer.js` (client-side type page logic)
- Create: `src/seo/type-page.css` (type page specific styles)
- Modify: `vite.config.js` (add multi-page support)
- Modify: `package.json` (add generate-pages script)

### Step 1: Create type page HTML template

Create `types/mbti/index.html`:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title data-seo="title">Тип личности — Полное описание</title>
    <meta name="description" data-seo="description" content="">
    <link rel="canonical" data-seo="canonical" href="">
    <link rel="stylesheet" href="../../styles.css">
    <link rel="stylesheet" href="../../src/seo/type-page.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script type="application/ld+json" id="schemaOrg"></script>
</head>
<body>
    <div class="type-page-container">
        <header class="type-page-header">
            <a href="/" class="back-link"><i class="fas fa-arrow-left"></i> Все тесты</a>
        </header>
        <main class="type-page-main" id="typePageContent">
            <!-- Populated by TypePageRenderer.js based on URL -->
        </main>
        <section class="type-page-cta">
            <h2>Это ваш тип?</h2>
            <p>Пройдите тест и узнайте точно</p>
            <a href="/?quiz=mbti" class="btn btn-primary btn-lg">Начать тест</a>
        </section>
        <section class="related-types" id="relatedTypes">
            <!-- 4 related type cards with links -->
        </section>
    </div>
    <script type="module" src="../../src/seo/TypePageRenderer.js"></script>
</body>
</html>
```

### Step 2: Create page generation script

Create `scripts/generate-type-pages.js` that reads MBTI_TYPES and SOCIONICS_TYPES data and generates static HTML pages with pre-rendered content for SEO:

```javascript
// Node.js script to generate type pages at build time
// Usage: node scripts/generate-type-pages.js

import fs from 'fs';
import path from 'path';

// This script reads quiz data, generates 32 HTML files:
// types/mbti/istj.html, types/mbti/isfj.html, ...
// types/socionics/ile.html, types/socionics/sei.html, ...

// Each page has pre-rendered personality description, traits, etc.
// Plus Schema.org structured data for rich snippets
```

### Step 3: Update vite.config.js for multi-page

```javascript
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';
import { readdirSync, existsSync } from 'fs';

// Collect all type page HTML files
function getTypePages() {
    const pages = {};
    ['mbti', 'socionics'].forEach(category => {
        const dir = resolve(__dirname, `types/${category}`);
        if (existsSync(dir)) {
            readdirSync(dir).filter(f => f.endsWith('.html')).forEach(file => {
                const name = `types-${category}-${file.replace('.html', '')}`;
                pages[name] = resolve(dir, file);
            });
        }
    });
    return pages;
}

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                ...getTypePages()
            },
            // ... existing config
        }
    }
});
```

### Step 4: Add Schema.org structured data

Each type page includes JSON-LD:

```json
{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "INFP: Идеалист — Полное описание типа личности",
    "description": "...",
    "author": { "@type": "Organization", "name": "nikmobdev.ru" },
    "publisher": { "@type": "Organization", "name": "nikmobdev.ru" }
}
```

### Step 5: Create type-page.css

Standalone styles for type pages optimized for readability and SEO (proper heading hierarchy, readable paragraphs, etc.).

### Step 6: Add generate-pages to package.json scripts

```json
"generate-pages": "node scripts/generate-type-pages.js",
"build": "npm run generate-pages && vite build"
```

### Step 7: Commit

```bash
git add types/ scripts/generate-type-pages.js src/seo/ vite.config.js package.json
git commit -m "feat: add SEO landing pages for all 32 personality types (MBTI + Socionics)"
```

---

## Task 4: Compare With Friends Feature

**Files:**
- Create: `src/modules/comparison/ComparisonEngine.js`
- Modify: `index.html` (add comparison UI sections)
- Modify: `styles.css` (comparison styles)
- Modify: `script.js` (comparison URL parsing and global functions)
- Modify: `src/modules/ui/UIManager.js` (comparison results rendering)
- Modify: `src/locales/ru.js` (comparison strings)
- Modify: `src/locales/en.js` (comparison strings)

### Step 1: Create ComparisonEngine

Create `src/modules/comparison/ComparisonEngine.js`:

```javascript
/**
 * ComparisonEngine - Handles friend comparison via URL-encoded data
 * No backend required: comparison data is encoded in the URL
 */
export class ComparisonEngine {
    /**
     * Encode comparison data into URL-safe string
     * @param {Object} data - { type, name, quizType, scores }
     * @returns {string} base64 encoded string
     */
    static encode(data) {
        const payload = {
            t: data.type,           // personality type code
            n: data.name || '',     // user name
            q: data.quizType,       // 'mbti' or 'socionics'
            s: data.scores,         // raw scores object
            ts: Date.now()          // timestamp
        };
        return btoa(encodeURIComponent(JSON.stringify(payload)));
    }

    /**
     * Decode comparison data from URL parameter
     * @param {string} encoded - base64 encoded string
     * @returns {Object|null} decoded data or null if invalid
     */
    static decode(encoded) {
        try {
            const json = decodeURIComponent(atob(encoded));
            const data = JSON.parse(json);
            return {
                type: data.t,
                name: data.n,
                quizType: data.q,
                scores: data.s,
                timestamp: data.ts
            };
        } catch {
            return null;
        }
    }

    /**
     * Generate comparison link
     */
    static generateCompareLink(data) {
        const encoded = this.encode(data);
        const base = window.location.origin + window.location.pathname;
        return `${base}?compare=${encoded}`;
    }

    /**
     * Check if current URL has comparison data
     */
    static getComparisonFromURL() {
        const params = new URLSearchParams(window.location.search);
        const compareData = params.get('compare');
        if (!compareData) return null;
        return this.decode(compareData);
    }

    /**
     * Calculate compatibility between two MBTI types
     * @returns {Object} { percentage, description, strengths, challenges }
     */
    static calculateCompatibility(typeA, typeB, quizType = 'mbti') {
        if (quizType === 'socionics') {
            return this._socionicsCompatibility(typeA, typeB);
        }
        return this._mbtiCompatibility(typeA, typeB);
    }

    static _mbtiCompatibility(typeA, typeB) {
        // Simple compatibility based on shared/complementary functions
        let score = 50;
        for (let i = 0; i < 4; i++) {
            if (typeA[i] === typeB[i]) score += 5;  // Shared preference
            // Complementary pairs get bonus
            const complementary = { E: 'I', I: 'E', S: 'N', N: 'S', T: 'F', F: 'T', J: 'P', P: 'J' };
            if (typeA[i] === complementary[typeB[i]]) score += 8;
        }
        score = Math.min(98, Math.max(30, score));

        return {
            percentage: score,
            description: score > 75 ? 'Отличная совместимость!' : score > 55 ? 'Хорошая совместимость' : 'Есть над чем поработать',
            strengths: [],    // Populated based on specific type pair
            challenges: []    // Populated based on specific type pair
        };
    }

    static _socionicsCompatibility(typeA, typeB) {
        // Uses INTERTYPE_RELATIONS data from SocionicsData.js
        // Returns relation type + compatibility score
        return { percentage: 70, description: 'Совместимость', strengths: [], challenges: [] };
    }
}
```

### Step 2: Add comparison welcome banner to index.html

When a user arrives via comparison link, show a personalized banner on the welcome screen:

```html
<!-- Add inside welcomeScreen div, before the start quiz button -->
<div class="comparison-banner" id="comparisonBanner" style="display:none;">
    <div class="comparison-avatar">
        <i class="fas fa-user-friends"></i>
    </div>
    <p class="comparison-text">
        <strong id="comparisonFriendName"></strong> уже прошёл тест и получил тип
        <strong id="comparisonFriendType"></strong>.
        Пройди тест и узнай вашу совместимость!
    </p>
</div>
```

### Step 3: Add comparison results section to results screen

```html
<!-- Add in resultsScreen, after share card section -->
<div class="comparison-results" id="comparisonResults" style="display:none;">
    <h3>Ваша совместимость</h3>
    <div class="comparison-types">
        <div class="comparison-type-card" id="comparisonTypeA"></div>
        <div class="comparison-vs">VS</div>
        <div class="comparison-type-card" id="comparisonTypeB"></div>
    </div>
    <div class="compatibility-meter">
        <div class="compatibility-fill" id="compatibilityFill"></div>
        <span class="compatibility-text" id="compatibilityText"></span>
    </div>
    <div class="premium-overlay" id="comparisonPremiumOverlay">
        <p>Подробный анализ совместимости</p>
        <button class="btn btn-premium" onclick="openPremiumModal()">Разблокировать</button>
    </div>
</div>
```

### Step 4: Add "Compare with a friend" button after results

```html
<!-- Add after share card section in results -->
<div class="compare-invite" id="compareInvite">
    <h3>Сравни с другом</h3>
    <p>Отправь ссылку другу и узнайте вашу совместимость</p>
    <div class="compare-link-box">
        <input type="text" id="compareLinkInput" readonly />
        <button class="btn btn-copy" onclick="copyCompareLink()">
            <i class="fas fa-copy"></i>
        </button>
    </div>
    <div class="compare-share-buttons">
        <button class="btn btn-share-vk" onclick="shareCompareVK()"><i class="fab fa-vk"></i></button>
        <button class="btn btn-share-tg" onclick="shareCompareTelegram()"><i class="fab fa-telegram"></i></button>
    </div>
</div>
```

### Step 5: Wire comparison logic into script.js

At app initialization (script.js), check for comparison data in URL:

```javascript
// At app init, check for comparison mode
const comparisonData = ComparisonEngine.getComparisonFromURL();
if (comparisonData) {
    window._comparisonData = comparisonData;
    // Show comparison banner on welcome screen
    document.getElementById('comparisonBanner').style.display = 'block';
    document.getElementById('comparisonFriendName').textContent = comparisonData.name || 'Друг';
    document.getElementById('comparisonFriendType').textContent = comparisonData.type;
}
```

After quiz completion, if `_comparisonData` exists, show compatibility:

```javascript
function showComparisonResults(myType, friendData) {
    const compat = ComparisonEngine.calculateCompatibility(myType, friendData.type, friendData.quizType);
    document.getElementById('comparisonResults').style.display = 'block';
    document.getElementById('compatibilityFill').style.width = `${compat.percentage}%`;
    document.getElementById('compatibilityText').textContent = `${compat.percentage}% — ${compat.description}`;
}
```

Generate comparison link after results:

```javascript
function generateCompareLink() {
    const results = stateManager.getLastResults();
    const user = JSON.parse(localStorage.getItem('vk_user_auth') || '{}');
    const link = ComparisonEngine.generateCompareLink({
        type: results.personalityType,
        name: user.first_name || '',
        quizType: stateManager.getCurrentQuizType(),
        scores: results.scores
    });
    document.getElementById('compareLinkInput').value = link;
}
```

### Step 6: Add comparison styles to styles.css

```css
/* Comparison Banner */
.comparison-banner {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 1.5rem;
    border-radius: 16px;
    margin: 1rem 0;
    text-align: center;
}
.comparison-banner .comparison-avatar {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}
/* Compatibility Meter */
.compatibility-meter {
    background: rgba(0,0,0,0.1);
    border-radius: 12px;
    height: 40px;
    position: relative;
    overflow: hidden;
    margin: 1rem 0;
}
.compatibility-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 12px;
    transition: width 1s ease;
}
.compatibility-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: 600;
    color: white;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}
/* Compare Link */
.compare-link-box {
    display: flex;
    gap: 0.5rem;
    margin: 1rem 0;
}
.compare-link-box input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.85rem;
}
```

### Step 7: Commit

```bash
git add src/modules/comparison/ index.html styles.css script.js src/locales/ru.js src/locales/en.js
git commit -m "feat: add friend comparison with URL-encoded data and compatibility analysis"
```

---

## Task 5: Improved Premium Upsell

**Files:**
- Modify: `index.html` (progressive reveal sections, timed prompt, social proof)
- Modify: `styles.css` (blur effects, slide-in animations, social proof)
- Modify: `script.js` (timed premium prompt, social proof counter)
- Modify: `src/modules/ui/UIManager.js:246-258` (progressive premium reveals)
- Modify: `src/locales/ru.js` (upsell strings)
- Modify: `src/locales/en.js` (upsell strings)

### Step 1: Implement progressive reveal on results page

Replace the current hard premium wall in UIManager (line 246) with progressive blur:

In `showPremiumContent()` and the default non-premium state, instead of `display:none` on premium content, show it blurred:

```javascript
showPremiumTeaser(personalityType) {
    // Show premium sections with blur overlay
    const premiumSections = document.querySelectorAll('.premium-content');
    premiumSections.forEach(section => {
        section.style.display = 'block';
        section.classList.add('premium-blurred');
    });

    // Show first 2-3 lines clearly, blur the rest
    const premiumOverlays = document.querySelectorAll('.premium-overlay');
    premiumOverlays.forEach(overlay => {
        overlay.classList.add('premium-progressive');
        overlay.innerHTML = `
            <div class="premium-unlock-prompt">
                <i class="fas fa-lock"></i>
                <span>Разблокировать полный анализ</span>
                <button class="btn btn-premium-sm" onclick="openPremiumModal()">Открыть</button>
            </div>
        `;
    });
}
```

### Step 2: Add blur CSS

```css
.premium-blurred {
    position: relative;
}
.premium-blurred::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: linear-gradient(transparent, var(--bg-primary, white) 70%);
    pointer-events: none;
}
.premium-progressive {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 1rem;
}
.premium-unlock-prompt {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 12px;
    border: 1px dashed rgba(102, 126, 234, 0.3);
}
```

### Step 3: Add timed premium slide-in bar

Instead of showing premium modal immediately on results, add a delayed slide-in:

```html
<!-- Add at bottom of resultsScreen -->
<div class="premium-slide-bar" id="premiumSlideBar">
    <p>Хотите узнать больше? 15 специализированных тестов ждут вас</p>
    <button class="btn btn-premium" onclick="openPremiumModal()">Узнать подробности</button>
    <button class="btn-close-slide" onclick="closePremiumSlideBar()">&times;</button>
</div>
```

In script.js, show after 12-second delay:

```javascript
function showDelayedPremiumPrompt() {
    if (stateManager.isPremium()) return;
    setTimeout(() => {
        const bar = document.getElementById('premiumSlideBar');
        if (bar) bar.classList.add('visible');
    }, 12000);
}
```

### Step 4: Add social proof counter

```html
<!-- Add at top of results screen -->
<div class="social-proof" id="socialProof">
    <i class="fas fa-users"></i>
    <span id="quizCounter">Более 10 000 человек уже прошли тест</span>
</div>
```

The counter starts from a seed (10000) and increments based on Firebase quiz_completed event count. For now, a simple localStorage-based counter:

```javascript
function updateSocialProofCounter() {
    const count = parseInt(localStorage.getItem('quiz_global_count') || '10000');
    const el = document.getElementById('quizCounter');
    if (el) {
        const formatted = count.toLocaleString('ru-RU');
        el.textContent = `Более ${formatted} человек уже прошли тест`;
    }
}

// Increment on each quiz completion
function incrementQuizCounter() {
    const count = parseInt(localStorage.getItem('quiz_global_count') || '10000') + 1;
    localStorage.setItem('quiz_global_count', count.toString());
}
```

### Step 5: Add slide-bar CSS

```css
.premium-slide-bar {
    position: fixed;
    bottom: -100px;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    transition: bottom 0.5s ease;
    z-index: 1000;
}
.premium-slide-bar.visible {
    bottom: 0;
}
.btn-close-slide {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0.7;
}
.social-proof {
    text-align: center;
    padding: 0.75rem;
    color: var(--text-secondary, #666);
    font-size: 0.9rem;
}
.social-proof i { margin-right: 0.5rem; }
```

### Step 6: Commit

```bash
git add index.html styles.css script.js src/modules/ui/UIManager.js src/locales/ru.js src/locales/en.js
git commit -m "feat: improve premium upsell with progressive reveals, timed prompts, and social proof"
```

---

## Task 6: Integration Testing & Final Polish

**Files:**
- All modified files from Tasks 1-5
- Test: manual browser testing checklist

### Step 1: Verify share card generation

Run dev server, complete quiz, verify:
- [ ] Card renders with correct type, colors, dimensions
- [ ] Download produces valid PNG
- [ ] VK share works in VK Mini App environment (test via ngrok + VK)
- [ ] Web Share API works on mobile Chrome

### Step 2: Verify Socionics quiz

- [ ] Quiz starts and all 60 questions display correctly
- [ ] Scoring produces correct sociotype
- [ ] Results display with correct sociotype data
- [ ] Free tier shows 20 questions, premium shows 60
- [ ] Intertype relations teaser shows on results page
- [ ] Share card works for Socionics types too

### Step 3: Verify SEO pages

- [ ] Pages load with pre-rendered content
- [ ] Schema.org JSON-LD validates (test at schema.org/validator)
- [ ] Mobile-friendly (Chrome DevTools mobile sim)
- [ ] CTA "Take the test" links to correct quiz URL
- [ ] Related types section links work

### Step 4: Verify comparison flow

- [ ] Generate comparison link after quiz
- [ ] Copy link works
- [ ] Opening link shows comparison banner
- [ ] Completing quiz via comparison link shows compatibility
- [ ] Premium overlay hides detailed comparison for free users

### Step 5: Verify premium upsell

- [ ] Progressive blur shows on non-premium results
- [ ] Slide-in bar appears after ~12 seconds
- [ ] Social proof counter displays
- [ ] Premium purchase still works end-to-end (VK payment flow)

### Step 6: Final commit

```bash
git add -A
git commit -m "chore: integration testing and final polish for virality features"
```

---

## Execution Order & Dependencies

```
Task 1 (Share Cards) — no dependencies, can start immediately
Task 2 (Socionics) — no dependencies, can start immediately
Task 3 (SEO Pages) — depends on Task 2 (needs Socionics data for Socionics pages)
Task 4 (Comparison) — depends on Task 2 (needs Socionics compatibility data)
Task 5 (Premium Upsell) — no dependencies, can start immediately
Task 6 (Testing) — depends on all above
```

**Parallel groups:**
- Group A (independent): Task 1, Task 2, Task 5
- Group B (after Task 2): Task 3, Task 4
- Group C (after all): Task 6

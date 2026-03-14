import { router } from '../../router/Router.js';
import { resultsStore } from '../../results/ResultsStore.js';
import localizationManager from '../../../locales/LocalizationManager.js';
import { MBTI_EXTRA_RU, SOCIONICS_INSIGHTS_RU, ENNEAGRAM_INSIGHTS_RU } from '../../../data/InsightsData.ru.js';
import { MBTI_EXTRA_EN, SOCIONICS_INSIGHTS_EN, ENNEAGRAM_INSIGHTS_EN } from '../../../data/InsightsData.en.js';

function getStateManager() { return window.stateManager; }
function getMbtiExtra() { return localizationManager.getCurrentLocale() === 'en' ? MBTI_EXTRA_EN : MBTI_EXTRA_RU; }
function getSocionicsInsights() { return localizationManager.getCurrentLocale() === 'en' ? SOCIONICS_INSIGHTS_EN : SOCIONICS_INSIGHTS_RU; }
function getEnneagramInsights() { return localizationManager.getCurrentLocale() === 'en' ? ENNEAGRAM_INSIGHTS_EN : ENNEAGRAM_INSIGHTS_RU; }
function getTypeData() { return window.PERSONALITY_TYPES || {}; }
function getAdvancedInsights() { return window.ADVANCED_INSIGHTS || {}; }
function getFamousPersonalities() { return window.FAMOUS_PERSONALITIES || {}; }

const ICONS = {
  briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
  trending: '<polyline points="23 6 13.5 17 8.5 12 1 22"></polyline><polyline points="17 6 23 6 23 12"></polyline>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.27a1 1 0 0 0 0 1.83l8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09a1 1 0 0 0 0-1.83Z"></path><path d="m2.6 15.91 8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09"></path><path d="m2.6 11.09 8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09"></path>',
  cpu: '<rect width="16" height="16" x="4" y="4" rx="2"></rect><rect width="6" height="6" x="9" y="9" rx="1"></rect><path d="M15 2v2"></path><path d="M15 20v2"></path><path d="M2 15h2"></path><path d="M2 9h2"></path><path d="M20 15h2"></path><path d="M20 9h2"></path><path d="M9 2v2"></path><path d="M9 20v2"></path>',
  feather: '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h6.5l6.74-6.76Z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>'
};

const INSIGHT_SECTIONS_MBTI = [
  { icon: 'briefcase', get title() { return localizationManager.get('resultDetail.career'); }, key: 'careers', bg: '#5C7CFA10', color: '#5C7CFA' },
  { icon: 'zap', get title() { return localizationManager.get('resultDetail.strengths'); }, key: 'strengths', bg: '#40C05710', color: '#40C057' },
  { icon: 'shield', get title() { return localizationManager.get('resultDetail.weaknesses'); }, key: 'weaknesses', bg: '#E6498010', color: '#E64980' },
  { icon: 'trending', get title() { return localizationManager.get('resultDetail.growth'); }, key: 'development', bg: '#FAB00510', color: '#FAB005' },
  { icon: 'message', get title() { return localizationManager.get('resultDetail.communication'); }, key: 'communication', bg: '#9775FA10', color: '#9775FA' },
  { icon: 'flame', get title() { return localizationManager.get('resultDetail.underStress'); }, key: 'stress', bg: '#FF692210', color: '#FF6922' },
];

const INSIGHT_SECTIONS_SOCIONICS = [
  { icon: 'briefcase', get title() { return localizationManager.get('resultDetail.career'); }, key: 'careers', bg: '#5C7CFA10', color: '#5C7CFA' },
  { icon: 'zap', get title() { return localizationManager.get('resultDetail.strengths'); }, key: 'strengths', bg: '#40C05710', color: '#40C057' },
  { icon: 'trending', get title() { return localizationManager.get('resultDetail.growth'); }, key: 'development', bg: '#FAB00510', color: '#FAB005' },
  { icon: 'heart', get title() { return localizationManager.get('resultDetail.relationships'); }, key: 'relations', bg: '#E6498010', color: '#E64980' },
  { icon: 'layers', get title() { return localizationManager.get('resultDetail.quadra'); }, key: 'quadra', bg: '#9775FA10', color: '#9775FA' },
  { icon: 'cpu', get title() { return localizationManager.get('resultDetail.functions'); }, key: 'functions', bg: '#FF692210', color: '#FF6922' },
];

const INSIGHT_SECTIONS_ENNEAGRAM = [
  { icon: 'briefcase', get title() { return localizationManager.get('resultDetail.career'); }, key: 'careers', bg: '#5C7CFA10', color: '#5C7CFA' },
  { icon: 'zap', get title() { return localizationManager.get('resultDetail.strengths'); }, key: 'strengths', bg: '#40C05710', color: '#40C057' },
  { icon: 'trending', get title() { return localizationManager.get('resultDetail.growth'); }, key: 'development', bg: '#FAB00510', color: '#FAB005' },
  { icon: 'heart', get title() { return localizationManager.get('resultDetail.relationships'); }, key: 'relations', bg: '#E6498010', color: '#E64980' },
  { icon: 'feather', get title() { return localizationManager.get('resultDetail.wings'); }, key: 'wings', bg: '#9775FA10', color: '#9775FA' },
  { icon: 'alert', get title() { return localizationManager.get('resultDetail.fearsDesires'); }, key: 'fears', bg: '#FF692210', color: '#FF6922' },
];

// MBTI_EXTRA data moved to InsightsData.ru.js / InsightsData.en.js

// SOCIONICS_INSIGHTS and ENNEAGRAM_INSIGHTS data moved to InsightsData.ru.js / InsightsData.en.js

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

    const sm = getStateManager();
    const isPremium = sm ? sm.get('isPremium') : false;

    this.el.className = `result-detail-screen result-detail-screen--${result.framework}`;

    this.el.innerHTML = `
      <div class="status-bar"></div>
      <div class="result-detail__content">
        <button class="result-detail__back" id="result-back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg> ${localizationManager.get('resultDetail.toResults')}
        </button>
        ${this._renderHero(result, isPremium)}
        ${this._renderDimensions(result)}
        ${isPremium
          ? `${this._renderAnalytics(result)}${this._renderInsights(result)}${this._renderFamous(result)}`
          : this._renderPremiumPaywall(result)}
        ${this._renderActions()}
      </div>
    `;

    this._bind(result);
    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }

  _renderHero(result, isPremium) {
    const displayName = this._getDisplayName(result);
    const heroDesc = this._getHeroDesc(result);
    return `
      <div class="result-hero">
        <div class="result-hero__code">${result.typeCode}</div>
        <div class="result-hero__name">${displayName}</div>
        <div class="result-hero__desc">${heroDesc}</div>
        ${isPremium ? `<span class="result-hero__badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"></path><path d="M3 20h18"></path></svg> ${localizationManager.get('home.premium')}</span>` : ''}
      </div>
    `;
  }

  _renderDimensions(result) {
    const dims = result.dimensions || {};
    const bars = this._getDimensionBars(result.framework, dims);
    return `
      <div class="result-dimensions">
        <div class="result-dimensions__title">${localizationManager.get('resultDetail.yourPreferences')}</div>
        ${bars.map(d => this._renderDimBar(d)).join('')}
      </div>
    `;
  }

  _renderDimBar({ leftLabel, rightLabel, leftPercent }) {
    const rightPercent = 100 - leftPercent;
    const leftActive = leftPercent >= 50;
    return `
      <div class="dim-row">
        <div class="dim-row__labels">
          <span class="dim-row__label${leftActive ? ' dim-row__label--active' : ''}">${leftLabel}</span>
          <span class="dim-row__label${!leftActive ? ' dim-row__label--active' : ''}">${rightLabel}</span>
        </div>
        <div class="dim-row__bar">
          <div class="dim-row__fill" style="width:${leftPercent}%"></div>
        </div>
      </div>
    `;
  }

  _getFrameworkTheme(framework) {
    if (framework === 'socionics') return {
      colors: ['#E8A85C', '#C4843A', '#D4A574', '#B8894E'],
      primary: '#E8A85C', primaryRgb: '232,168,92',
      strengths: localizationManager.get('resultDetail.socionicsStrengths'),
    };
    if (framework === 'enneagram') return {
      colors: ['#C47A8A', '#A05A6A', '#C49A7A'],
      primary: '#C47A8A', primaryRgb: '196,122,138',
      strengths: localizationManager.get('resultDetail.enneagramStrengths'),
    };
    return {
      colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
      primary: '#7C9082', primaryRgb: '124,144,130',
      strengths: localizationManager.get('resultDetail.mbtiStrengths'),
    };
  }

  _renderAnalytics(result) {
    const dims = result.dimensions || {};
    const bars = this._getDimensionBars(result.framework, dims);
    const values = bars.map(b => b.leftPercent);
    const leftLabels = bars.map(b => b.shortLeft || b.leftLabel);
    const rightLabels = bars.map(b => b.shortRight ?? b.rightLabel);
    const labels = bars.map(b => {
      const sl = b.shortLeft || b.leftLabel;
      const sr = b.shortRight ?? b.rightLabel;
      return sr ? `${sl}/${sr}` : sl;
    });
    const theme = this._getFrameworkTheme(result.framework);
    const colors = theme.colors;

    // 1. Radar chart
    const cx = 120, cy = 120, r = 90;
    const n = values.length;
    const angleStep = (2 * Math.PI) / n;
    const gridCircles = [0.2, 0.4, 0.6, 0.8, 1.0].map(s =>
      `<circle cx="${cx}" cy="${cy}" r="${r * s}" fill="none" stroke="#E8E4DF" stroke-width="1"/>`
    ).join('');
    const axes = labels.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      return `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(angle)}" y2="${cy + r * Math.sin(angle)}" stroke="#E8E4DF" stroke-width="1"/>`;
    }).join('');
    const axisLabels = labels.map((lbl, i) => {
      const angle = i * angleStep - Math.PI / 2;
      return `<text x="${cx + (r + 18) * Math.cos(angle)}" y="${cy + (r + 18) * Math.sin(angle)}" text-anchor="middle" dominant-baseline="middle" font-size="${n <= 3 ? 11 : 10}" fill="#8A8A8A" font-family="Inter,sans-serif">${lbl}</text>`;
    }).join('');
    const pts = values.map((v, i) => {
      const angle = i * angleStep - Math.PI / 2;
      return `${cx + (r * v / 100) * Math.cos(angle)},${cy + (r * v / 100) * Math.sin(angle)}`;
    }).join(' ');
    const radarDots = values.map((v, i) => {
      const angle = i * angleStep - Math.PI / 2;
      return `<circle cx="${cx + (r * v / 100) * Math.cos(angle)}" cy="${cy + (r * v / 100) * Math.sin(angle)}" r="4" fill="#fff" stroke="${theme.primary}" stroke-width="2"/>`;
    }).join('');
    const radarSvg = `<svg viewBox="0 0 240 240" width="100%" style="max-width:240px">${gridCircles}${axes}<polygon points="${pts}" fill="rgba(${theme.primaryRgb},0.2)" stroke="${theme.primary}" stroke-width="2"/>${radarDots}${axisLabels}</svg>`;

    // 2. Bar chart (Сравнение измерений)
    const barW = 40, barGap = 20, barMaxH = 100;
    const svgW = n * (barW + barGap) - barGap + 40;
    const baseY = barMaxH + 30;
    const barsSvg = values.map((v, i) => {
      const x = 20 + i * (barW + barGap);
      const h = (v / 100) * barMaxH;
      return `<rect x="${x}" y="${baseY - h}" width="${barW}" height="${h}" rx="6" fill="${colors[i % colors.length]}"/>
        <text x="${x + barW / 2}" y="${baseY - h - 8}" text-anchor="middle" font-size="12" font-weight="600" fill="#2D2D2D" font-family="Inter,sans-serif">${Math.round(v)}%</text>
        <text x="${x + barW / 2}" y="${baseY + 16}" text-anchor="middle" font-size="11" fill="#8A8A8A" font-family="Inter,sans-serif">${leftLabels[i]}</text>`;
    }).join('');
    const chartSvg = `<svg viewBox="0 0 ${svgW} ${baseY + 30}" width="100%">${barsSvg}</svg>`;

    // 3. Balance chart (Баланс личности)
    const balRowH = 28, balGap = 8, balBarW = 120, balX = 90, balRightX = balX + balBarW + 8;
    const balSvgH = n * (balRowH + balGap) + 10;
    const balSvgW = balRightX + 70;
    const balRows = values.map((v, i) => {
      const y = 10 + i * (balRowH + balGap);
      const leftW = (v / 100) * balBarW;
      const rightW = balBarW - leftW;
      const midX = balX + leftW;
      const rightText = rightLabels[i] ? `${rightLabels[i]} ${100 - Math.round(v)}%` : '';
      return `
        <text x="${balX - 6}" y="${y + 16}" text-anchor="end" font-size="11" fill="#2D2D2D" font-family="Inter,sans-serif">${leftLabels[i]} ${Math.round(v)}%</text>
        <rect x="${balX}" y="${y}" width="${leftW}" height="${balRowH}" rx="4" fill="${colors[i % colors.length]}"/>
        <rect x="${midX}" y="${y}" width="${rightW}" height="${balRowH}" rx="4" fill="#E8E4DF"/>
        <circle cx="${midX}" cy="${y + balRowH / 2}" r="6" fill="${colors[i % colors.length]}" stroke="#fff" stroke-width="2"/>
        <text x="${balRightX}" y="${y + 16}" text-anchor="start" font-size="11" fill="#8A8A8A" font-family="Inter,sans-serif">${rightText}</text>`;
    }).join('');
    const balanceSvg = `<svg viewBox="0 0 ${balSvgW} ${balSvgH}" width="100%">${balRows}</svg>`;

    // 4. Pie chart (Распределение предпочтений)
    const pieCx = 70, pieCy = 70, pieR = 60;
    const total = values.reduce((a, b) => a + b, 0);
    let startAngle = -Math.PI / 2;
    const pieSlices = values.map((v, i) => {
      const sliceAngle = (v / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      const x1 = pieCx + pieR * Math.cos(startAngle);
      const y1 = pieCy + pieR * Math.sin(startAngle);
      const x2 = pieCx + pieR * Math.cos(endAngle);
      const y2 = pieCy + pieR * Math.sin(endAngle);
      const large = sliceAngle > Math.PI ? 1 : 0;
      const d = `M${pieCx},${pieCy} L${x1},${y1} A${pieR},${pieR} 0 ${large} 1 ${x2},${y2} Z`;
      startAngle = endAngle;
      return `<path d="${d}" fill="${colors[i % colors.length]}"/>`;
    }).join('');
    const pieH = Math.max(140, n * 22 + 30);
    const pieLegX = 150;
    const pieLegend = leftLabels.map((lbl, i) => {
      const ly = 20 + i * 22;
      return `<rect x="${pieLegX}" y="${ly}" width="10" height="10" rx="2" fill="${colors[i % colors.length]}"/>
        <text x="${pieLegX + 16}" y="${ly + 9}" font-size="11" fill="#2D2D2D" font-family="Inter,sans-serif">${lbl}: ${Math.round(values[i])}%</text>`;
    }).join('');
    const pieSvg = `<svg viewBox="0 0 280 ${pieH}" width="100%">${pieSlices}${pieLegend}</svg>`;

    // 5. Framework-specific extra chart
    let extraChart = '';
    if (result.framework === 'socionics') {
      // Socionics: Cognitive functions stack
      const funcs = this._getSocionicsFunctions(result.typeCode);
      const fBarMaxW = 100, fBarH = 20, fLabelW = 160, fRowGap = 10;
      const fSvgH = funcs.length * (fBarH + fRowGap) + 10;
      const fSvgW = fLabelW + fBarMaxW + 50;
      const funcRows = funcs.map((f, i) => {
        const y = 10 + i * (fBarH + fRowGap);
        const w = (f.strength / 100) * fBarMaxW;
        return `
          <text x="${fLabelW - 8}" y="${y + 15}" text-anchor="end" font-size="11" fill="#2D2D2D" font-family="Inter,sans-serif">${f.label}</text>
          <rect x="${fLabelW}" y="${y}" width="${fBarMaxW}" height="${fBarH}" rx="4" fill="#F0EDE8"/>
          <rect x="${fLabelW}" y="${y}" width="${w}" height="${fBarH}" rx="4" fill="${colors[i % colors.length]}"/>
          <text x="${fLabelW + fBarMaxW + 8}" y="${y + 15}" font-size="11" font-weight="600" fill="#2D2D2D" font-family="Inter,sans-serif">${f.strength}%</text>`;
      }).join('');
      extraChart = `
        <div class="result-analytics__card">
          <div class="result-analytics__card-title">${localizationManager.get('resultDetail.functionStack')}</div>
          <svg viewBox="0 0 ${fSvgW} ${fSvgH}" width="100%">${funcRows}</svg>
        </div>`;
    } else if (result.framework === 'enneagram') {
      // Enneagram: Triadic centers visualization
      const centers = [
        { label: localizationManager.get('resultDetail.heart'), value: Math.max(10, Math.min(90, 50 + (dims.HC ?? 0) * 3)), color: colors[0] },
        { label: localizationManager.get('resultDetail.head'), value: Math.max(10, Math.min(90, 50 + (dims.HD ?? 0) * 3)), color: colors[1] },
        { label: localizationManager.get('resultDetail.body'), value: Math.max(10, Math.min(90, 50 + (dims.BD ?? 0) * 3)), color: colors[2] },
      ];
      const triR = 60, triCx = 130, triCy = 110;
      const triPts = centers.map((c, i) => {
        const angle = i * (2 * Math.PI / 3) - Math.PI / 2;
        const dist = triR * (c.value / 100);
        return { x: triCx + dist * Math.cos(angle), y: triCy + dist * Math.sin(angle), lx: triCx + (triR + 30) * Math.cos(angle), ly: triCy + (triR + 30) * Math.sin(angle) };
      });
      const triGrid = [0.33, 0.66, 1.0].map(s =>
        `<polygon points="${centers.map((_, i) => { const a = i * (2 * Math.PI / 3) - Math.PI / 2; return `${triCx + triR * s * Math.cos(a)},${triCy + triR * s * Math.sin(a)}`; }).join(' ')}" fill="none" stroke="#E8E4DF" stroke-width="1"/>`
      ).join('');
      const triShape = `<polygon points="${triPts.map(p => `${p.x},${p.y}`).join(' ')}" fill="rgba(${theme.primaryRgb},0.2)" stroke="${theme.primary}" stroke-width="2"/>`;
      const triDots = triPts.map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="5" fill="${centers[i].color}"/>`).join('');
      const triLabels = centers.map((c, i) => `<text x="${triPts[i].lx}" y="${triPts[i].ly}" text-anchor="middle" font-size="11" fill="#2D2D2D" font-family="Inter,sans-serif">${c.label} ${c.value}%</text>`).join('');
      extraChart = `
        <div class="result-analytics__card">
          <div class="result-analytics__card-title">${localizationManager.get('resultDetail.energyCenters')}</div>
          <svg viewBox="0 0 260 230" width="100%" style="max-width:260px">${triGrid}${triShape}${triDots}${triLabels}</svg>
        </div>`;
    } else {
      // MBTI: Timeline
      const tlY = 50, tlX1 = 30, tlX2 = 270, tlMid = 150;
      extraChart = `
        <div class="result-analytics__card">
          <div class="result-analytics__card-title">${localizationManager.get('resultDetail.personalityTimeline')}</div>
          <svg viewBox="0 0 300 100" width="100%">
            <line x1="${tlX1}" y1="${tlY}" x2="${tlX2}" y2="${tlY}" stroke="#E8E4DF" stroke-width="3" stroke-linecap="round"/>
            <circle cx="${tlX1 + 40}" cy="${tlY}" r="5" fill="#C5C0B8"/>
            <circle cx="${tlMid}" cy="${tlY}" r="8" fill="${theme.primary}"/>
            <circle cx="${tlMid}" cy="${tlY}" r="12" fill="none" stroke="${colors[3] || colors[0]}" stroke-width="2"/>
            <circle cx="${tlX2 - 40}" cy="${tlY}" r="5" fill="#C5C0B8"/>
            <text x="${tlX1 + 40}" y="${tlY + 22}" text-anchor="middle" font-size="11" fill="#8A8A8A" font-family="Inter,sans-serif">${localizationManager.get('resultDetail.past')}</text>
            <text x="${tlMid}" y="${tlY - 20}" text-anchor="middle" font-size="11" fill="#2D2D2D" font-family="Inter,sans-serif">${localizationManager.get('resultDetail.currentPosition')}</text>
            <text x="${tlMid}" y="${tlY + 22}" text-anchor="middle" font-size="11" font-weight="600" fill="#2D2D2D" font-family="Inter,sans-serif">${localizationManager.get('resultDetail.present')}</text>
            <text x="${tlX2 - 40}" y="${tlY + 22}" text-anchor="middle" font-size="11" fill="#8A8A8A" font-family="Inter,sans-serif">${localizationManager.get('resultDetail.future')}</text>
          </svg>
        </div>`;
    }

    // 6. Strengths chart (framework-specific)
    const sLabels = theme.strengths;
    const sValues = sLabels.map((_, i) => values[i % values.length] || 50);
    const sBarMaxW = 100, sBarH = 20, sLabelW = 140, sRowGap = 12;
    const sSvgH = sLabels.length * (sBarH + sRowGap) + 10;
    const sSvgW = sLabelW + sBarMaxW + 50;
    const strengthRows = sLabels.map((lbl, i) => {
      const y = 10 + i * (sBarH + sRowGap);
      const w = (sValues[i] / 100) * sBarMaxW;
      return `
        <text x="${sLabelW - 8}" y="${y + 15}" text-anchor="end" font-size="12" fill="#2D2D2D" font-family="Inter,sans-serif">${lbl}</text>
        <rect x="${sLabelW}" y="${y}" width="${sBarMaxW}" height="${sBarH}" rx="4" fill="#F0EDE8"/>
        <rect x="${sLabelW}" y="${y}" width="${w}" height="${sBarH}" rx="4" fill="${colors[i % colors.length]}"/>
        <text x="${sLabelW + sBarMaxW + 8}" y="${y + 15}" font-size="12" font-weight="600" fill="#2D2D2D" font-family="Inter,sans-serif">${Math.round(sValues[i])}%</text>`;
    }).join('');
    const strengthsSvg = `<svg viewBox="0 0 ${sSvgW} ${sSvgH}" width="100%">${strengthRows}</svg>`;

    return `
      <div class="result-analytics">
        <div class="result-analytics__title">${localizationManager.get('resultDetail.visualAnalytics')}</div>
        <div class="result-analytics__grid">
          <div class="result-analytics__card">
            <div class="result-analytics__card-title">${localizationManager.get('resultDetail.radarChart')}</div>
            ${radarSvg}
          </div>
          <div class="result-analytics__card">
            <div class="result-analytics__card-title">${localizationManager.get('resultDetail.dimensionComparison')}</div>
            ${chartSvg}
          </div>
          <div class="result-analytics__card">
            <div class="result-analytics__card-title">${localizationManager.get('resultDetail.personalityBalance')}</div>
            ${balanceSvg}
          </div>
          <div class="result-analytics__card">
            <div class="result-analytics__card-title">${localizationManager.get('resultDetail.preferenceDistribution')}</div>
            ${pieSvg}
          </div>
          ${extraChart}
          <div class="result-analytics__card">
            <div class="result-analytics__card-title">${localizationManager.get('resultDetail.strengthAnalysis')}</div>
            ${strengthsSvg}
          </div>
        </div>
      </div>
    `;
  }

  _getSocionicsFunctions(typeCode) {
    const FUNC_MAP = {
      'ИЛЭ': [{ label: localizationManager.get('resultDetail.ne'), strength: 90 }, { label: localizationManager.get('resultDetail.ti'), strength: 75 }, { label: localizationManager.get('resultDetail.fe'), strength: 40 }, { label: localizationManager.get('resultDetail.si'), strength: 25 }],
      'СЭИ': [{ label: localizationManager.get('resultDetail.si'), strength: 90 }, { label: localizationManager.get('resultDetail.fe'), strength: 75 }, { label: localizationManager.get('resultDetail.ti'), strength: 40 }, { label: localizationManager.get('resultDetail.ne'), strength: 25 }],
      'ЭСЭ': [{ label: localizationManager.get('resultDetail.fe'), strength: 90 }, { label: localizationManager.get('resultDetail.si'), strength: 75 }, { label: localizationManager.get('resultDetail.ni'), strength: 40 }, { label: localizationManager.get('resultDetail.te'), strength: 25 }],
      'ЛИИ': [{ label: localizationManager.get('resultDetail.ti'), strength: 90 }, { label: localizationManager.get('resultDetail.ne'), strength: 75 }, { label: localizationManager.get('resultDetail.si'), strength: 40 }, { label: localizationManager.get('resultDetail.fe'), strength: 25 }],
      'ЭИЭ': [{ label: localizationManager.get('resultDetail.fe'), strength: 90 }, { label: localizationManager.get('resultDetail.ni'), strength: 75 }, { label: localizationManager.get('resultDetail.te'), strength: 40 }, { label: localizationManager.get('resultDetail.si'), strength: 25 }],
      'ЛСИ': [{ label: localizationManager.get('resultDetail.ti'), strength: 90 }, { label: localizationManager.get('resultDetail.se'), strength: 75 }, { label: localizationManager.get('resultDetail.ne'), strength: 40 }, { label: localizationManager.get('resultDetail.fi'), strength: 25 }],
      'СЛЭ': [{ label: localizationManager.get('resultDetail.se'), strength: 90 }, { label: localizationManager.get('resultDetail.ti'), strength: 75 }, { label: localizationManager.get('resultDetail.fi'), strength: 40 }, { label: localizationManager.get('resultDetail.ni'), strength: 25 }],
      'ИЭИ': [{ label: localizationManager.get('resultDetail.ni'), strength: 90 }, { label: localizationManager.get('resultDetail.fe'), strength: 75 }, { label: localizationManager.get('resultDetail.te'), strength: 40 }, { label: localizationManager.get('resultDetail.se'), strength: 25 }],
      'СЭЭ': [{ label: localizationManager.get('resultDetail.se'), strength: 90 }, { label: localizationManager.get('resultDetail.fi'), strength: 75 }, { label: localizationManager.get('resultDetail.ti'), strength: 40 }, { label: localizationManager.get('resultDetail.ni'), strength: 25 }],
      'ИЛИ': [{ label: localizationManager.get('resultDetail.ni'), strength: 90 }, { label: localizationManager.get('resultDetail.te'), strength: 75 }, { label: localizationManager.get('resultDetail.fe'), strength: 40 }, { label: localizationManager.get('resultDetail.se'), strength: 25 }],
      'ЛИЭ': [{ label: localizationManager.get('resultDetail.te'), strength: 90 }, { label: localizationManager.get('resultDetail.ni'), strength: 75 }, { label: localizationManager.get('resultDetail.se'), strength: 40 }, { label: localizationManager.get('resultDetail.fi'), strength: 25 }],
      'ЭСИ': [{ label: localizationManager.get('resultDetail.fi'), strength: 90 }, { label: localizationManager.get('resultDetail.se'), strength: 75 }, { label: localizationManager.get('resultDetail.ne'), strength: 40 }, { label: localizationManager.get('resultDetail.te'), strength: 25 }],
      'ЛСЭ': [{ label: localizationManager.get('resultDetail.te'), strength: 90 }, { label: localizationManager.get('resultDetail.si'), strength: 75 }, { label: localizationManager.get('resultDetail.fe'), strength: 40 }, { label: localizationManager.get('resultDetail.ne'), strength: 25 }],
      'ЭИИ': [{ label: localizationManager.get('resultDetail.fi'), strength: 90 }, { label: localizationManager.get('resultDetail.ni'), strength: 75 }, { label: localizationManager.get('resultDetail.se'), strength: 40 }, { label: localizationManager.get('resultDetail.te'), strength: 25 }],
      'ИЭЭ': [{ label: localizationManager.get('resultDetail.ne'), strength: 90 }, { label: localizationManager.get('resultDetail.fi'), strength: 75 }, { label: localizationManager.get('resultDetail.si'), strength: 40 }, { label: localizationManager.get('resultDetail.ti'), strength: 25 }],
      'СЛИ': [{ label: localizationManager.get('resultDetail.si'), strength: 90 }, { label: localizationManager.get('resultDetail.te'), strength: 75 }, { label: localizationManager.get('resultDetail.fe'), strength: 40 }, { label: localizationManager.get('resultDetail.ne'), strength: 25 }],
    };
    return FUNC_MAP[typeCode] || [
      { label: localizationManager.get('resultDetail.baseFunc'), strength: 85 }, { label: localizationManager.get('resultDetail.creativeFunc'), strength: 70 },
      { label: localizationManager.get('resultDetail.roleFunc'), strength: 45 }, { label: localizationManager.get('resultDetail.vulnerableFunc'), strength: 20 },
    ];
  }

  _getInsightsData(result) {
    if (result.framework === 'socionics') return getSocionicsInsights()[result.typeCode] || {};
    if (result.framework === 'enneagram') {
      const num = result.typeCode.replace(/\D/g, '');
      return getEnneagramInsights()[num] || {};
    }
    const base = getAdvancedInsights()[result.typeCode] || {};
    const extra = getMbtiExtra()[result.typeCode] || {};
    return { ...base, ...extra };
  }

  _renderInsights(result) {
    const typeInsights = this._getInsightsData(result);
    const sections = result.framework === 'socionics' ? INSIGHT_SECTIONS_SOCIONICS
      : result.framework === 'enneagram' ? INSIGHT_SECTIONS_ENNEAGRAM
      : INSIGHT_SECTIONS_MBTI;
    return `
      <div class="result-insights">
        <div class="result-insights__title">${localizationManager.get('resultDetail.deepAnalysis')}</div>
        <div class="insights-carousel">
          ${sections.map(ins => {
            const items = typeInsights[ins.key] || [];
            const desc = items.length > 0 ? items.join(', ') : localizationManager.get('resultDetail.noData');
            return `
              <div class="insight-card" style="background: ${ins.bg}">
                <div class="insight-card__icon-wrap" style="background: ${ins.color}15; color: ${ins.color}">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    ${ICONS[ins.icon]}
                  </svg>
                </div>
                <div class="insight-card__title">${ins.title}</div>
                <div class="insight-card__desc">${desc}</div>
              </div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  _renderFamous(result) {
    const typeFamous = getFamousPersonalities()[result.typeCode] || [];
    if (typeFamous.length === 0) return '';
    const famousTitle = localizationManager.get('resultDetail.famousType', { type: result.typeCode });
    return `
      <div class="result-famous">
        <div class="result-famous__title">${famousTitle}</div>
        <div class="famous-list">
          ${typeFamous.slice(0, 3).map(p => `
            <div class="famous-card">
              <div class="famous-card__avatar">${p.image || ''}</div>
              <div class="famous-card__info">
                <div class="famous-card__name">${p.name}</div>
                <div class="famous-card__role">${p.profession || p.role || ''}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  _renderPremiumPaywall(result) {
    const content = `${this._renderAnalytics(result)}${this._renderInsights(result)}${this._renderFamous(result)}`;
    return `
      <div class="comparison-paywall" id="premium-teaser">
        <div class="comparison-paywall__content">${content}</div>
        <div class="comparison-paywall__overlay">
          <div class="comparison-paywall__card">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5.5 21h13"/></svg>
            <div class="comparison-paywall__title">${localizationManager.get('resultDetail.deepAnalysis')}</div>
            <div class="comparison-paywall__desc">${localizationManager.get('resultDetail.paywallDesc')}</div>
            <button class="premium-cta-btn comparison-paywall__btn">${localizationManager.get('resultDetail.paywallButton')}</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderActions() {
    return `
      <div class="result-actions">
        <button class="result-action result-action--secondary" id="result-retake">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C9082" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 16h5v5"></path></svg>
          ${localizationManager.get('resultDetail.retake')}
        </button>
      </div>
    `;
  }

  _getDimensionBars(framework, dims) {
    if (framework === 'socionics') {
      return [
        { leftLabel: localizationManager.get('resultDetail.logicLabel'), rightLabel: localizationManager.get('resultDetail.ethicsLabel'), shortLeft: localizationManager.get('resultDetail.shortLogic'), shortRight: localizationManager.get('resultDetail.shortEthics'), leftPercent: dims.L ?? 50 },
        { leftLabel: localizationManager.get('resultDetail.intuitionLabel'), rightLabel: localizationManager.get('resultDetail.sensingLabel'), shortLeft: localizationManager.get('resultDetail.shortIntuition'), shortRight: localizationManager.get('resultDetail.shortSensing'), leftPercent: dims.I ?? 50 },
        { leftLabel: localizationManager.get('resultDetail.extraversionLabel'), rightLabel: localizationManager.get('resultDetail.introversionLabel'), shortLeft: localizationManager.get('resultDetail.shortExtra'), shortRight: localizationManager.get('resultDetail.shortIntro'), leftPercent: dims.Ex ?? 50 },
        { leftLabel: localizationManager.get('resultDetail.rationalityLabel'), rightLabel: localizationManager.get('resultDetail.irrationalityLabel'), shortLeft: localizationManager.get('resultDetail.shortRat'), shortRight: localizationManager.get('resultDetail.shortIrr'), leftPercent: dims.R ?? 50 },
      ];
    }
    if (framework === 'enneagram') {
      return [
        { leftLabel: localizationManager.get('resultDetail.heartCenter'), rightLabel: '', shortLeft: localizationManager.get('resultDetail.heart'), shortRight: '', leftPercent: Math.max(10, Math.min(90, 50 + (dims.HC ?? 0) * 3)) },
        { leftLabel: localizationManager.get('resultDetail.headCenter'), rightLabel: '', shortLeft: localizationManager.get('resultDetail.head'), shortRight: '', leftPercent: Math.max(10, Math.min(90, 50 + (dims.HD ?? 0) * 3)) },
        { leftLabel: localizationManager.get('resultDetail.bodyCenter'), rightLabel: '', shortLeft: localizationManager.get('resultDetail.body'), shortRight: '', leftPercent: Math.max(10, Math.min(90, 50 + (dims.BD ?? 0) * 3)) },
      ];
    }
    return [
      { leftLabel: localizationManager.get('resultDetail.mbtiExtraversion'), rightLabel: localizationManager.get('resultDetail.mbtiIntroversion'), shortLeft: 'E', shortRight: 'I', leftPercent: dims.E ?? 50 },
      { leftLabel: localizationManager.get('resultDetail.mbtiSensing'), rightLabel: localizationManager.get('resultDetail.mbtiIntuition'), shortLeft: 'S', shortRight: 'N', leftPercent: dims.S ?? 50 },
      { leftLabel: localizationManager.get('resultDetail.mbtiThinking'), rightLabel: localizationManager.get('resultDetail.mbtiFeeling'), shortLeft: 'T', shortRight: 'F', leftPercent: dims.T ?? 50 },
      { leftLabel: localizationManager.get('resultDetail.mbtiJudging'), rightLabel: localizationManager.get('resultDetail.mbtiPerceiving'), shortLeft: 'J', shortRight: 'P', leftPercent: dims.J ?? 50 },
    ];
  }

  _getDisplayName(result) {
    if (result.framework === 'socionics' || result.framework === 'enneagram') {
      return result.typeName || result.typeCode;
    }
    const typeData = getTypeData()[result.typeCode] || {};
    return typeData.title || typeData.name || result.typeName || result.typeCode;
  }

  _getHeroDesc(result) {
    if (result.framework === 'socionics' || result.framework === 'enneagram') {
      return result.typeName ? localizationManager.get('resultDetail.personalityType', { type: result.typeCode }) : '';
    }
    const typeData = getTypeData()[result.typeCode] || {};
    return typeData.description || typeData.subtitle || localizationManager.get('resultDetail.personalityType', { type: result.typeCode });
  }

  _bind(result) {
    this.el.querySelector('#result-back')?.addEventListener('click', () => {
      router.closeOverlay();
      router.navigateTab('results');
    });

    this.el.querySelector('#premium-teaser')?.addEventListener('click', () => {
      router.openOverlay('premium-modal');
    });

    this.el.querySelector('#result-share')?.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: localizationManager.get('ui.shareMessage', { type: result.typeCode }),
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

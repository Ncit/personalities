import '../../../styles/screens/result-detail.css';
import { DimensionBar } from '../components/DimensionBar.js';
import { router } from '../../router/Router.js';
import { resultsStore } from '../../results/ResultsStore.js';

// Access stateManager via window since it's initialized in script.js
function getStateManager() { return window.stateManager; }

// Try to get type data — these may or may not exist in the data files
function getTypeData() {
  return window.PERSONALITY_TYPES || {};
}
function getAdvancedInsights() {
  return window.ADVANCED_INSIGHTS || {};
}
function getFamousPersonalities() {
  return window.FAMOUS_PERSONALITIES || {};
}

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
    const typeInsights = getAdvancedInsights()[result.typeCode] || {};
    const typeFamous = getFamousPersonalities()[result.typeCode] || [];

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
      router.navigateTab('results');
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

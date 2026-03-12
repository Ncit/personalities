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

    const dimensionBars = this._getDimensionBars(result.framework, dims);

    // Get type description and name from personality data
    const heroDesc = this._getHeroDesc(result);
    const displayName = this._getDisplayName(result);

    this.el.innerHTML = `
      <div class="status-bar"></div>
      <div class="result-detail__layout">
        <div class="result-detail__main">
          <button class="result-detail__back" id="result-back">
            <i data-lucide="arrow-left" style="width:18px;height:18px"></i> К результатам
          </button>
          <div class="result-hero">
            <div class="result-hero__code">${result.typeCode}</div>
            <div class="result-hero__name">${displayName}</div>
            <div class="result-hero__desc">${heroDesc}</div>
            ${isPremium ? '<span class="badge badge--gold result-hero__badge">Premium</span>' : ''}
          </div>
          <div class="card result-dimensions" style="margin:0 20px 20px">
            <h3 style="font:400 18px/1.3 var(--font-display);margin-bottom:8px">Ваши предпочтения</h3>
            ${dimensionBars.map(d => DimensionBar.render(d)).join('')}
          </div>
        </div>
        <div class="result-detail__sidebar">
          ${isPremium ? this._premiumContent(result) : this._premiumTeaser()}
        </div>
      </div>
      <div class="result-actions">
        <button class="btn-primary" id="result-share">
          <i data-lucide="share-2" style="width:16px;height:16px"></i> Поделиться
        </button>
        <button class="btn-secondary" id="result-retake">
          <i data-lucide="refresh-cw" style="width:16px;height:16px"></i> Пройти снова
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
          <div class="premium-teaser__title">Открыть глубокий анализ</div>
          <div class="premium-teaser__desc">Расширенный анализ, известные совпадения и другое</div>
        </div>
        <i data-lucide="chevron-right" style="width:18px;height:18px;color:var(--color-text-disabled)"></i>
      </div>
    `;
  }

  _premiumContent(result) {
    const typeInsights = getAdvancedInsights()[result.typeCode] || {};
    const typeFamous = getFamousPersonalities()[result.typeCode] || [];

    const insightSections = [
      { icon: 'briefcase', title: 'Карьера', key: 'career', bg: '#D4A57418', color: '#D4A574' },
      { icon: 'zap', title: 'Сильные стороны', key: 'strengths', bg: '#7C908218', color: '#7C9082' },
      { icon: 'sprout', title: 'Рост', key: 'growth', bg: '#C2856A18', color: '#C2856A' },
      { icon: 'heart', title: 'Отношения', key: 'development', bg: '#C47A8A18', color: '#C47A8A' },
    ];

    return `
      <h3 class="result-detail__section-title">Глубокий анализ</h3>
      <div class="insights-grid">
        ${insightSections.map(ins => {
          const items = typeInsights[ins.key] || [];
          return `
          <div class="card insight-card">
            <div class="insight-card__icon-wrap" style="background:${ins.bg};color:${ins.color}">
              <i data-lucide="${ins.icon}" style="width:18px;height:18px"></i>
            </div>
            <div class="insight-card__title">${ins.title}</div>
            <ul class="insight-card__list">
              ${items.length > 0
                ? items.map(item => `<li>${item}</li>`).join('')
                : '<li>Нет данных</li>'
              }
            </ul>
          </div>`;
        }).join('')}
      </div>
      ${typeFamous.length > 0 ? `
      <div class="famous-section">
        <h3 class="result-detail__section-title">Известные ${result.typeCode}</h3>
        <div class="famous-list">
          ${typeFamous.slice(0, 3).map(p => `
            <div class="famous-card">
              <div class="famous-card__avatar"${p.image ? ` style="background-image:url(${p.image});background-size:cover"` : ''}></div>
              <div class="famous-card__info">
                <div class="famous-card__name">${p.name}</div>
                <div class="famous-card__role">${p.role || ''}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>` : ''}
    `;
  }

  _getDimensionBars(framework, dims) {
    if (framework === 'socionics') {
      return [
        { leftLabel: 'Логика (Л)', rightLabel: 'Этика (Э)', leftPercent: dims.L || 50, color: 'var(--color-dim-ei, #7C9082)' },
        { leftLabel: 'Интуиция (И)', rightLabel: 'Сенсорика (С)', leftPercent: dims.I || 50, color: 'var(--color-dim-sn, #E8A85C)' },
        { leftLabel: 'Экстраверсия (Э)', rightLabel: 'Интроверсия (И)', leftPercent: dims.Ex || 50, color: 'var(--color-dim-tf, #C47A8A)' },
        { leftLabel: 'Рациональность (Р)', rightLabel: 'Иррациональность (Ир)', leftPercent: dims.R || 50, color: 'var(--color-dim-jp, #8B7EC8)' },
      ];
    }
    if (framework === 'enneagram') {
      return [
        { leftLabel: 'Центр Сердца', rightLabel: '', leftPercent: Math.max(10, Math.min(90, 50 + (dims.HC || 0) * 3)), color: '#C47A8A' },
        { leftLabel: 'Центр Головы', rightLabel: '', leftPercent: Math.max(10, Math.min(90, 50 + (dims.HD || 0) * 3)), color: '#7C9082' },
        { leftLabel: 'Центр Тела', rightLabel: '', leftPercent: Math.max(10, Math.min(90, 50 + (dims.BD || 0) * 3)), color: '#E8A85C' },
      ];
    }
    return [
      { leftLabel: 'Экстраверсия (E)', rightLabel: 'Интроверсия (I)', leftPercent: dims.E || 50, color: 'var(--color-dim-ei)' },
      { leftLabel: 'Сенсорика (S)', rightLabel: 'Интуиция (N)', leftPercent: dims.S || 50, color: 'var(--color-dim-sn)' },
      { leftLabel: 'Мышление (T)', rightLabel: 'Чувство (F)', leftPercent: dims.T || 50, color: 'var(--color-dim-tf)' },
      { leftLabel: 'Суждение (J)', rightLabel: 'Восприятие (P)', leftPercent: dims.J || 50, color: 'var(--color-dim-jp)' },
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
      return result.typeName ? `Тип личности ${result.typeCode}` : '';
    }
    const typeData = getTypeData()[result.typeCode] || {};
    return typeData.description || typeData.subtitle || `Тип личности ${result.typeCode}`;
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
          title: `Я — ${result.typeCode} (${result.typeName})`,
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

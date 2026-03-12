import { resultsStore } from '../../results/ResultsStore.js';
import { router } from '../../router/Router.js';
import { ComparisonSection } from '../components/ComparisonSection.js';

function getStateManager() { return window.stateManager; }

const FRAMEWORK_NAMES = {
  mbti: 'MBTI',
  socionics: 'Соционика',
  enneagram: 'Эннеаграмма',
  // MBTI specialized
  leadership: 'Стиль лидерства',
  communication: 'Стиль общения',
  stress: 'Реакция на стресс',
  learning: 'Стиль обучения',
  relationships: 'Динамика отношений',
  creativity: 'Креативность',
  decision: 'Принятие решений',
  teamwork: 'Командная работа',
  career: 'Карьера',
  social: 'Социальное взаимодействие',
  motivation: 'Мотивация',
  adaptability: 'Адаптивность',
  conflict: 'Разрешение конфликтов',
  productivity: 'Продуктивность',
  emotional: 'Эмоциональный интеллект',
  // Socionics specialized
  socionics_intertype: 'Интертипные отношения',
  socionics_quadra: 'Квадровые ценности',
  socionics_functions: 'Инф. метаболизм',
  socionics_conflict: 'Конфликтология',
  socionics_career: 'Карьера и социотип',
  socionics_love: 'Любовь и дуальность',
  // Enneagram specialized
  enneagram_wings: 'Крылья и подтипы',
  enneagram_stress: 'Стресс и рост',
  enneagram_instincts: 'Инстинкты выживания',
  enneagram_relationships: 'Отношения',
  enneagram_shadow: 'Теневая сторона',
  enneagram_spiritual: 'Духовный путь',
};

export class ResultsTimelineScreen {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'results-timeline-screen screen-content';
    this._comparison = new ComparisonSection();
    this.render();
  }

  getElement() { return this.el; }
  onActivate() { this.render(); }

  render() {
    const results = resultsStore.getAll();
    const sm = getStateManager();
    const isPremium = sm ? sm.get('isPremium') : false;

    this.el.innerHTML = `
      <h1 class="page-title">Результаты</h1>
      ${results.length > 0 ? this._list(results) : this._empty()}
      ${results.length >= 2
        ? (isPremium ? this._comparison.render(null) : this._comparisonTeaser())
        : ''}
    `;

    this._bind();
    if (isPremium && results.length >= 2) this._comparison.bind(this.el, null);
    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }

  _list(results) {
    const types = window.PERSONALITY_TYPES || {};
    return `
    <div class="results-scroll-wrapper">
    <div class="results-scroll">
      ${results.map(r => {
        const typeData = types[r.typeCode] || {};
        const displayName = typeData.title || r.typeName || r.typeCode;
        return `
        <div class="card result-item" data-id="${r.id}">
          <div class="result-item__badge result-item__badge--${r.framework}">
            ${r.typeCode}
          </div>
          <div class="result-item__info">
            <div class="result-item__title">${FRAMEWORK_NAMES[r.framework] || r.framework.toUpperCase()} — ${r.typeCode}</div>
            <div class="result-item__date">${displayName} · ${this._formatDate(r.date)}</div>
          </div>
        </div>`;
      }).join('')}
    </div>
    </div>`;
  }

  _empty() {
    return `<div class="results-empty">
      <div class="results-empty__icon-circle">
        <i data-lucide="clipboard-list" class="results-empty__icon"></i>
      </div>
      <div class="results-empty__title">Результатов пока нет</div>
      <div class="results-empty__text">Пройдите первый тест личности, чтобы увидеть результаты здесь.</div>
      <button class="btn-primary" id="results-start-quiz">
        <i data-lucide="compass" style="width:18px;height:18px"></i>
        К тестам
      </button>
    </div>`;
  }

  _formatDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    return d.toLocaleDateString();
  }

  _comparisonTeaser() {
    const content = this._comparison.render(null);
    return `
      <div class="comparison-paywall" id="comparison-premium-teaser">
        <div class="comparison-paywall__content">${content}</div>
        <div class="comparison-paywall__overlay">
          <div class="comparison-paywall__card">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5.5 21h13"/></svg>
            <div class="comparison-paywall__title">Эволюция типа</div>
            <div class="comparison-paywall__desc">Сравнение результатов, диаграмма, стабильность и корреляция типов</div>
            <button class="premium-cta-btn comparison-paywall__btn">Открыть Премиум</button>
          </div>
        </div>
      </div>
    `;
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

    this.el.querySelector('#comparison-premium-teaser')?.addEventListener('click', () => {
      router.openOverlay('premium-modal');
    });
  }
}

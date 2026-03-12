import { resultsStore } from '../../results/ResultsStore.js';
import { router } from '../../router/Router.js';

function getStateManager() { return window.stateManager; }

const ACHIEVEMENTS = [
  { key: 'firstSteps', icon: 'ach_firstSteps', title: 'Первые шаги', description: 'Пройдите первый тест' },
  { key: 'onFire', icon: 'ach_onFire', title: 'В ударе', description: '3+ теста за неделю' },
  { key: 'highAccuracy', icon: 'ach_highAccuracy', title: 'Высокая точность', description: '85%+ показатель уверенности' },
  { key: 'explorer', icon: 'ach_explorer', title: 'Исследователь', description: 'Откройте 5 разных типов' },
  { key: 'collector', icon: 'ach_collector', title: 'Коллекционер', description: 'Пройдите тесты 3 разных систем' },
  { key: 'marathon', icon: 'ach_marathon', title: 'Марафонец', description: 'Пройдите 10 тестов' },
  { key: 'stable', icon: 'ach_stable', title: 'Стабильность', description: 'Один тип 3 раза подряд' },
  { key: 'perfectionist', icon: 'ach_perfectionist', title: 'Перфекционист', description: '95%+ показатель уверенности' },
  { key: 'earlyBird', icon: 'ach_earlyBird', title: 'Ранняя пташка', description: 'Пройдите тест до 7 утра' },
  { key: 'nightOwl', icon: 'ach_nightOwl', title: 'Ночная сова', description: 'Пройдите тест после полуночи' },
  { key: 'weekStreak', icon: 'ach_weekStreak', title: 'Неделя роста', description: 'Заходите 7 дней подряд' },
  { key: 'curious', icon: 'ach_curious', title: 'Любознательный', description: 'Откройте все разделы помощи' },
  { key: 'specialist', icon: 'ach_specialist', title: 'Специалист', description: 'Пройдите все премиум тесты' },
  { key: 'master', icon: 'ach_master', title: 'Мастер', description: 'Пройдите все доступные тесты' },
];

const FRAMEWORK_NAMES = {
  mbti: 'MBTI',
  socionics: 'Соционика',
  enneagram: 'Эннеаграмма',
};

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
    const sm = getStateManager();
    const achievements = sm ? (sm.get('achievements') || {}) : {};

    this.el.innerHTML = `
      <h1 class="page-title">Результаты</h1>
      ${results.length > 0 ? this._list(results) : this._empty()}
      ${this._achievements(achievements)}
    `;

    this._bind();
    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }

  _list(results) {
    const types = window.PERSONALITY_TYPES || {};
    return `
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

  _achievements(achievements) {
    return `
      <div class="section-label" style="margin-top:28px">Достижения</div>
      <div class="achievements-grid">
        ${ACHIEVEMENTS.map(a => {
          const earned = !!achievements[a.key];
          return `
          <div class="achievement-card ${earned ? '' : 'achievement-card--locked'}">
            <div class="achievement-card__icon-wrap">
              <img src="/images/achievements/${a.icon}.png" style="width:40px;height:40px;object-fit:cover;border-radius:8px">
            </div>
            <div class="achievement-card__text">
              <div class="achievement-card__title">${a.title}</div>
              <div class="achievement-card__desc">${a.description}</div>
            </div>
          </div>`;
        }).join('')}
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

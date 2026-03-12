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
      <h1 class="page-title">Результаты</h1>
      ${results.length > 0 ? this._list(results) : this._empty()}
    `;

    this._bind();
    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }

  _list(results) {
    const types = window.PERSONALITY_TYPES || {};
    return `<div class="results-list">
      ${results.map(r => {
        const typeData = types[r.typeCode] || {};
        const displayName = typeData.title || r.typeName || r.typeCode;
        return `
        <div class="card result-item" data-id="${r.id}">
          <div class="result-item__badge result-item__badge--${r.framework === 'mbti' ? 'mbti' : 'premium'}">
            ${r.typeCode}
          </div>
          <div class="result-item__info">
            <div class="result-item__title">${r.framework.toUpperCase()} — ${r.typeCode}</div>
            <div class="result-item__date">${displayName} · ${this._formatDate(r.date)}</div>
          </div>
          <i data-lucide="chevron-right" class="result-item__chevron" style="width:18px;height:18px"></i>
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

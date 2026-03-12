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
      <h1 class="page-title">Results</h1>
      ${results.length > 0 ? this._list(results) : this._empty()}
    `;

    this._bind();
    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }

  _list(results) {
    return `<div class="results-list">
      ${results.map(r => `
        <div class="card result-item" data-id="${r.id}">
          <div class="result-item__badge result-item__badge--${r.framework === 'mbti' ? 'mbti' : 'premium'}">
            ${r.typeCode}
          </div>
          <div class="result-item__info">
            <div class="result-item__title">${r.typeName}</div>
            <div class="result-item__date">${new Date(r.date).toLocaleDateString()}</div>
          </div>
          <i data-lucide="chevron-right" class="result-item__chevron" style="width:18px;height:18px"></i>
        </div>
      `).join('')}
    </div>`;
  }

  _empty() {
    return `<div class="results-empty">
      <i data-lucide="clipboard-list" class="results-empty__icon"></i>
      <div class="results-empty__title">No results yet</div>
      <div class="results-empty__text">Take your first quiz to see results here</div>
      <button class="btn-primary" id="results-start-quiz">Start Quiz</button>
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

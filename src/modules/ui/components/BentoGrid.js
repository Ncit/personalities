import { TraitBar } from './TraitBar.js';
import { resultsStore } from '../../results/ResultsStore.js';
import { router } from '../../router/Router.js';

export class BentoGrid {
  static render() {
    const mbti = resultsStore.getLatestByFramework('mbti');
    return `
      <div class="bento-row">
        ${BentoGrid._typeCard(mbti)}
        ${BentoGrid._compareCard()}
      </div>
      <div class="bento-row">
        ${BentoGrid._traitsCard(mbti)}
        ${BentoGrid._frameworkSlot()}
      </div>
    `;
  }

  static _typeCard(mbti) {
    if (!mbti) {
      return `<div class="card bento-card bento-card--type">
        <div class="bento-card__label">Your Type</div>
        <div class="bento-card__empty">Take a quiz to discover</div>
      </div>`;
    }
    return `<div class="card bento-card bento-card--type" data-action="view-result" data-id="${mbti.id}">
      <div class="bento-card__label">Your Type</div>
      <div class="bento-card__code">${mbti.typeCode}</div>
      <div class="bento-card__name">${mbti.typeName}</div>
    </div>`;
  }

  static _compareCard() {
    return `<div class="card bento-card bento-card--compare">
      <i data-lucide="users" style="width:20px;height:20px;color:var(--color-accent-purple)"></i>
      <div class="bento-card__label">Compare</div>
      <div class="bento-card__link">With Friends →</div>
    </div>`;
  }

  static _traitsCard(mbti) {
    const dims = mbti?.dimensions || {};
    const bars = [
      { letter: 'E', pct: dims.E || 50, color: 'var(--color-primary)' },
      { letter: 'N', pct: dims.N || 50, color: 'var(--color-accent-gold)' },
      { letter: 'F', pct: dims.F || 50, color: 'var(--color-success)' },
      { letter: 'P', pct: dims.P || 50, color: 'var(--color-info-blue)' },
    ];
    return `<div class="card bento-card bento-card--traits">
      <div class="bento-card__label">Traits</div>
      ${bars.map(b => TraitBar.render(b.letter, b.pct, b.color)).join('')}
    </div>`;
  }

  static _frameworkSlot() {
    return `<div class="card bento-card bento-card--framework" style="background:var(--gradient-amber);min-width:140px">
      <span class="badge badge--amber">New!</span>
      <i data-lucide="sparkles" style="width:24px;height:24px;color:var(--color-accent-amber);margin:8px 0"></i>
      <div class="bento-card__label" style="color:var(--color-accent-amber)">Socionics</div>
    </div>`;
  }

  static bind(container) {
    container.querySelectorAll('[data-action="view-result"]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        router.openOverlay('result-detail', { resultId: id });
      });
    });
  }
}

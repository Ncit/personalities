import { resultsStore } from '../../results/ResultsStore.js';
import { router } from '../../router/Router.js';
import { TraitBar } from './TraitBar.js';

const DIMENSION_COLORS = {
  E: 'var(--color-dim-ei)',
  N: 'var(--color-dim-sn)',
  F: 'var(--color-dim-tf)',
  P: 'var(--color-dim-jp)',
};

export class BentoGrid {
  static render(hasResults) {
    const mbti = resultsStore.getLatestByFramework('mbti');
    return `
      ${BentoGrid._renderMobile(mbti, hasResults)}
      ${BentoGrid._renderDesktop(mbti)}
    `;
  }

  /* ── Mobile: 2×2 grid ── */
  static _renderMobile(mbti, hasResults) {
    return `
      <div class="bento-mobile">
        <div class="bento-grid-2x2">
          ${BentoGrid._typeCardMobile(mbti)}
          ${BentoGrid._enneagramCard()}
          ${BentoGrid._traitsCardMobile(mbti)}
          ${BentoGrid._socionicsCard()}
        </div>
      </div>
    `;
  }

  static _typeCardMobile(mbti) {
    if (!mbti) {
      return `<div class="card bento-card bento-card--type">
        <div class="bento-card__label">Ваш тип</div>
        <div class="bento-card__code bento-card__code--empty">????</div>
        <div class="bento-card__empty">Пройдите тест</div>
      </div>`;
    }
    return `<div class="card bento-card bento-card--type" data-action="view-result" data-id="${mbti.id}">
      <div class="bento-card__label">Ваш тип</div>
      <div class="bento-card__code">${mbti.typeCode}</div>
      <div class="bento-card__name">${mbti.typeName}</div>
    </div>`;
  }

  static _enneagramCard() {
    return `<div class="card bento-card bento-card--enneagram" data-action="enneagram">
      <div class="bento-card__badge">Новое!</div>
      <div class="bento-card__label">Эннеаграмма</div>
      <div class="bento-card__icon">🔷</div>
      <div class="bento-card__link">9 типов</div>
    </div>`;
  }

  static _traitsCardMobile(mbti) {
    if (!mbti) {
      return `<div class="card bento-card bento-card--traits-bars">
        <div class="bento-card__label">Ваши черты</div>
        <div class="bento-card__empty">Сначала пройдите тест</div>
      </div>`;
    }
    const dims = mbti.dimensions || {};
    const code = mbti.typeCode || 'ENFP';
    const bars = code.split('').map(letter => {
      const pct = dims[letter] || 50;
      const color = DIMENSION_COLORS[letter] || 'var(--color-primary)';
      return TraitBar.render(letter, pct, color);
    }).join('');
    return `<div class="card bento-card bento-card--traits-bars">
      <div class="bento-card__label">Ваши черты</div>
      <div class="bento-card__bars">${bars}</div>
    </div>`;
  }

  static _socionicsCard() {
    return `<div class="card bento-card bento-card--socionics" data-action="socionics">
      <div class="bento-card__badge">Новое!</div>
      <div class="bento-card__label">Соционика</div>
      <div class="bento-card__icon">✨</div>
      <div class="bento-card__link">16 типов</div>
    </div>`;
  }

  /* ── Desktop: 1×3 row ── */
  static _renderDesktop(mbti) {
    return `
      <div class="bento-desktop">
        <div class="bento-row">
          ${BentoGrid._typeCardDesktop(mbti)}
          ${BentoGrid._traitsCardDesktop(mbti)}
          ${BentoGrid._statsCard()}
        </div>
      </div>
    `;
  }

  static _typeCardDesktop(mbti) {
    if (!mbti) {
      return `<div class="card bento-card bento-card--type">
        <div class="bento-card__label">Ваш тип</div>
        <div class="bento-card__empty">Пройдите тест</div>
      </div>`;
    }
    return `<div class="card bento-card bento-card--type" data-action="view-result" data-id="${mbti.id}">
      <div class="bento-card__label">Ваш тип</div>
      <div class="bento-card__code">${mbti.typeCode}</div>
      <div class="bento-card__name">${mbti.typeName}</div>
    </div>`;
  }

  static _traitsCardDesktop(mbti) {
    if (!mbti) {
      return `<div class="card bento-card bento-card--traits">
        <div class="bento-card__label">Основные черты</div>
        <div class="bento-card__empty">Сначала пройдите тест</div>
      </div>`;
    }
    const traits = mbti.traits || ['Энтузиаст', 'Творческий', 'Общительный'];
    return `<div class="card bento-card bento-card--traits">
      <div class="bento-card__label">Основные черты</div>
      <div class="bento-card__traits-list">${traits.join(' · ')}</div>
    </div>`;
  }

  static _statsCard() {
    const count = resultsStore.getCount();
    return `<div class="card bento-card bento-card--stats">
      <div class="bento-card__label">Статистика</div>
      <div class="bento-card__stats-line">${count} тестов пройдено</div>
      <div class="bento-card__stats-line">${count > 0 ? '82% средняя точность' : 'Нет данных'}</div>
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

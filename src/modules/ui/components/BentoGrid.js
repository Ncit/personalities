import { resultsStore } from '../../results/ResultsStore.js';
import { TraitBar } from './TraitBar.js';
import localizationManager from '../../../locales/LocalizationManager.js';

const DIMENSION_COLORS = {
  E: 'var(--color-dim-ei)',
  N: 'var(--color-dim-sn)',
  F: 'var(--color-dim-tf)',
  P: 'var(--color-dim-jp)',
  I: 'var(--color-dim-ei)',
  S: 'var(--color-dim-sn)',
  T: 'var(--color-dim-tf)',
  J: 'var(--color-dim-jp)',
};

const SOCIONICS_BARS = [
  { key: 'L', label: 'Л', color: '#E8A85C' },
  { key: 'I', label: 'И', color: '#C4843A' },
  { key: 'Ex', label: 'Э', color: '#D4A574' },
  { key: 'R', label: 'Р', color: '#B8894E' },
];

const ENNEAGRAM_BARS = [
  { key: 'HC', label: 'С', color: '#C47A8A' },
  { key: 'HD', label: 'Г', color: '#A05A6A' },
  { key: 'BD', label: 'Т', color: '#C49A7A' },
];

function getFrameworkLabel(fw) {
  return localizationManager.get(`frameworks.${fw}`) || fw;
}

const FRAMEWORKS = ['mbti', 'socionics', 'enneagram'];

export class BentoGrid {
  static render(hasResults) {
    const results = FRAMEWORKS
      .map(fw => resultsStore.getLatestByFramework(fw))
      .filter(Boolean);

    if (results.length === 0) {
      return BentoGrid._renderEmpty();
    }

    const slides = results.map(r => BentoGrid._renderSlide(r)).join('');
    const dots = results.length > 1
      ? `<div class="bento-carousel__dots">${results.map((_, i) =>
          `<button class="bento-carousel__dot ${i === 0 ? 'bento-carousel__dot--active' : ''}" data-slide="${i}"></button>`
        ).join('')}</div>`
      : '';

    return `
      <div class="bento-carousel">
        <div class="bento-carousel__track">${slides}</div>
        ${dots}
      </div>
    `;
  }

  static _renderEmpty() {
    return `
      <div class="bento-grid-2x2">
        <div class="card bento-card bento-card--type">
          <div class="bento-card__label">${localizationManager.get('bento.yourType')}</div>
          <div class="bento-card__code bento-card__code--empty">????</div>
          <div class="bento-card__empty">${localizationManager.get('bento.takeTest')}</div>
        </div>
        <div class="card bento-card bento-card--traits-bars">
          <div class="bento-card__label">${localizationManager.get('bento.yourTraits')}</div>
          <div class="bento-card__empty">${localizationManager.get('bento.takeTestFirst')}</div>
        </div>
      </div>
    `;
  }

  static _renderSlide(result) {
    return `
      <div class="bento-carousel__slide">
        <div class="bento-carousel__slide-label">${getFrameworkLabel(result.framework)}</div>
        <div class="bento-grid-2x2">
          ${BentoGrid._typeCard(result)}
          ${BentoGrid._traitsCard(result)}
        </div>
      </div>
    `;
  }

  static _typeCard(result) {
    return `<div class="card bento-card bento-card--type">
      <div class="bento-card__label">${localizationManager.get('bento.yourType')}</div>
      <div class="bento-card__code">${result.typeCode}</div>
      <div class="bento-card__name">${result.typeName}</div>
    </div>`;
  }

  static _traitsCard(result) {
    const dims = result.dimensions || {};
    let bars;
    if (result.framework === 'socionics') {
      bars = SOCIONICS_BARS.map(b => {
        const pct = dims[b.key] ?? 50;
        return TraitBar.render(b.label, pct, b.color);
      }).join('');
    } else if (result.framework === 'enneagram') {
      bars = ENNEAGRAM_BARS.map(b => {
        const pct = Math.max(10, Math.min(90, 50 + (dims[b.key] ?? 0) * 3));
        return TraitBar.render(b.label, pct, b.color);
      }).join('');
    } else {
      const code = result.typeCode || 'ENFP';
      bars = code.split('').map(letter => {
        const pct = dims[letter] ?? 50;
        const color = DIMENSION_COLORS[letter] || 'var(--color-primary)';
        return TraitBar.render(letter, pct, color);
      }).join('');
    }
    return `<div class="card bento-card bento-card--traits-bars">
      <div class="bento-card__label">${localizationManager.get('bento.yourTraits')}</div>
      <div class="bento-card__bars">${bars}</div>
    </div>`;
  }

  static bind(container) {
    // Carousel dot navigation
    const track = container.querySelector('.bento-carousel__track');
    const dots = container.querySelectorAll('.bento-carousel__dot');
    if (track && dots.length > 1) {
      dots.forEach(dot => {
        dot.addEventListener('click', () => {
          const idx = parseInt(dot.dataset.slide);
          const slide = track.children[idx];
          if (slide) {
            track.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
          }
        });
      });

      // Update active dot on scroll
      track.addEventListener('scroll', () => {
        const scrollLeft = track.scrollLeft;
        const slideWidth = track.children[0]?.offsetWidth || 1;
        const activeIdx = Math.round(scrollLeft / slideWidth);
        dots.forEach((d, i) => {
          d.classList.toggle('bento-carousel__dot--active', i === activeIdx);
        });
      });
    }
  }
}

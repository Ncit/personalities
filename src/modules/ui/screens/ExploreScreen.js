import { router } from '../../router/Router.js';
import { stateManager } from '../../core/StateManager.js';

const FRAMEWORKS = [
  { title: 'MBTI — 16 типов личности', meta: '60 вопросов · 15 мин · Бесплатно', gradient: 'linear-gradient(135deg, #7C9082 0%, #5A7A64 100%)', framework: 'mbti' },
  { title: 'Соционика — 16 социотипов', meta: '48 вопросов · 12 мин · Бесплатно', gradient: 'linear-gradient(135deg, #E8A85C 0%, #C4843A 100%)', framework: 'socionics' },
  { title: 'Эннеаграмма — 9 типов', meta: '36 вопросов · 10 мин · Бесплатно', gradient: 'linear-gradient(135deg, #C47A8A 0%, #A05A6A 100%)', framework: 'enneagram' },
];

const PREMIUM_SECTIONS = [
  {
    label: 'MBTI · Премиум',
    accent: '#7C9082',
    accentDark: '#5A7A64',
    tests: [
      { icon: 'crown', title: 'Стиль лидерства', meta: '20 вопросов · 10 мин', framework: 'leadership' },
      { icon: 'message-circle', title: 'Стиль общения', meta: '20 вопросов · 8 мин', framework: 'communication' },
      { icon: 'zap', title: 'Реакция на стресс', meta: '20 вопросов · 7 мин', framework: 'stress' },
      { icon: 'graduation-cap', title: 'Стиль обучения', meta: '20 вопросов · 7 мин', framework: 'learning' },
      { icon: 'heart', title: 'Динамика отношений', meta: '20 вопросов · 7 мин', framework: 'relationships' },
      { icon: 'palette', title: 'Креативность и инновации', meta: '20 вопросов · 7 мин', framework: 'creativity' },
      { icon: 'scale', title: 'Принятие решений', meta: '20 вопросов · 7 мин', framework: 'decision' },
      { icon: 'users', title: 'Командное сотрудничество', meta: '20 вопросов · 7 мин', framework: 'teamwork' },
      { icon: 'briefcase', title: 'Карьерные предпочтения', meta: '20 вопросов · 7 мин', framework: 'career' },
      { icon: 'handshake', title: 'Социальное взаимодействие', meta: '20 вопросов · 7 мин', framework: 'social' },
      { icon: 'rocket', title: 'Мотивация и стремление', meta: '20 вопросов · 7 мин', framework: 'motivation' },
      { icon: 'refresh-cw', title: 'Адаптивность и изменения', meta: '20 вопросов · 7 мин', framework: 'adaptability' },
      { icon: 'shield', title: 'Разрешение конфликтов', meta: '20 вопросов · 7 мин', framework: 'conflict' },
      { icon: 'check-square', title: 'Стиль продуктивности', meta: '20 вопросов · 7 мин', framework: 'productivity' },
      { icon: 'smile', title: 'Эмоциональный интеллект', meta: '20 вопросов · 7 мин', framework: 'emotional' },
    ],
  },
  {
    label: 'Соционика · Премиум',
    accent: '#E8A85C',
    accentDark: '#C4843A',
    tests: [
      { icon: 'users', title: 'Интертипные отношения', meta: '20 вопросов · 8 мин', framework: 'socionics_intertype' },
      { icon: 'layers', title: 'Квадровые ценности', meta: '20 вопросов · 8 мин', framework: 'socionics_quadra' },
      { icon: 'cpu', title: 'Информационный метаболизм', meta: '20 вопросов · 8 мин', framework: 'socionics_functions' },
      { icon: 'shield', title: 'Конфликтология', meta: '20 вопросов · 7 мин', framework: 'socionics_conflict' },
      { icon: 'briefcase', title: 'Карьера и социотип', meta: '20 вопросов · 7 мин', framework: 'socionics_career' },
      { icon: 'heart', title: 'Любовь и дуальность', meta: '20 вопросов · 8 мин', framework: 'socionics_love' },
    ],
  },
  {
    label: 'Эннеаграмма · Премиум',
    accent: '#C47A8A',
    accentDark: '#A05A6A',
    tests: [
      { icon: 'feather', title: 'Крылья и подтипы', meta: '20 вопросов · 8 мин', framework: 'enneagram_wings' },
      { icon: 'zap', title: 'Стресс и рост', meta: '20 вопросов · 7 мин', framework: 'enneagram_stress' },
      { icon: 'flame', title: 'Инстинкты выживания', meta: '20 вопросов · 8 мин', framework: 'enneagram_instincts' },
      { icon: 'heart', title: 'Отношения по эннеаграмме', meta: '20 вопросов · 7 мин', framework: 'enneagram_relationships' },
      { icon: 'eye', title: 'Теневая сторона', meta: '20 вопросов · 8 мин', framework: 'enneagram_shadow' },
      { icon: 'sunrise', title: 'Духовный путь', meta: '20 вопросов · 8 мин', framework: 'enneagram_spiritual' },
    ],
  },
];

function renderFrameworkCard(f) {
  return `
    <div class="catalog-fw-card" data-framework="${f.framework}" style="background:${f.gradient}">
      <div class="catalog-fw-card__title">${f.title}</div>
      <div class="catalog-fw-card__meta">${f.meta}</div>
    </div>`;
}

function renderPremiumCard(test, accent) {
  return `
    <div class="catalog-premium-card" data-framework="${test.framework}" style="--card-border:${accent}30">
      <div class="catalog-premium-card__icon" style="background:${accent}15;color:${accent}">
        <i data-lucide="${test.icon}" style="width:18px;height:18px"></i>
      </div>
      <div class="catalog-premium-card__title">${test.title}</div>
      <div class="catalog-premium-card__meta">${test.meta}</div>
    </div>`;
}

function renderPremiumSection(section) {
  return `
    <div class="catalog-premium-header">
      <span class="catalog-premium-dot" style="background:${section.accent}"></span>
      <span class="catalog-premium-label" style="color:${section.accentDark}">${section.label}</span>
    </div>
    <div class="catalog-premium-grid">
      ${section.tests.map(t => renderPremiumCard(t, section.accent)).join('')}
    </div>`;
}

export class ExploreScreen {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'explore-screen screen-content';
    this.render();
  }

  getElement() { return this.el; }
  onActivate() { this.render(); }

  render() {
    this.el.innerHTML = `
      <h1 class="page-title">Каталог</h1>
      <div class="section-label">Основные методики</div>
      <div class="catalog-fw-cards">
        ${FRAMEWORKS.map(renderFrameworkCard).join('')}
      </div>
      ${PREMIUM_SECTIONS.map(renderPremiumSection).join('')}
    `;

    this._bind();
    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }

  _bind() {
    this.el.querySelectorAll('.catalog-fw-card').forEach(card => {
      card.addEventListener('click', () => {
        router.openOverlay('quiz', { framework: card.dataset.framework });
      });
    });

    this.el.querySelectorAll('.catalog-premium-card').forEach(card => {
      card.addEventListener('click', () => {
        if (!stateManager.get('isPremium')) {
          router.openOverlay('premium-modal');
        } else {
          router.openOverlay('quiz', { framework: card.dataset.framework });
        }
      });
    });
  }
}

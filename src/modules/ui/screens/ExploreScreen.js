import '../../../styles/screens/explore.css';
import { QuizListItem } from '../components/QuizListItem.js';
import { TypeCard } from '../components/TypeCard.js';
import { router } from '../../router/Router.js';
import { stateManager } from '../../core/StateManager.js';
import { MBTI_TYPES } from '../../../data/QuizData.ru.js';

const QUIZZES = {
  frameworks: [
    { icon: 'brain', title: 'MBTI — 16 типов личности', meta: '60 вопросов · 15 мин · Бесплатно', accent: '#7C9082', framework: 'mbti' },
    { icon: 'sparkles', title: 'Соционика', meta: '48 вопросов · 12 мин · Скоро', accent: '#E8A85C', framework: 'socionics' },
    { icon: 'heart', title: 'Эннеаграмма', meta: '36 вопросов · 10 мин · Скоро', accent: '#C47A8A', framework: 'enneagram' },
  ],
  premium: [
    { icon: 'crown', title: 'Стиль лидерства', meta: '30 вопросов · 10 мин · Премиум', accent: '#D4A574', framework: 'leadership' },
    { icon: 'message-circle', title: 'Стиль общения', meta: '25 вопросов · 8 мин · Премиум', accent: '#D4A574', framework: 'communication' },
    { icon: 'zap', title: 'Реакция на стресс', meta: '20 вопросов · 7 мин · Премиум', accent: '#D4A574', framework: 'stress' },
  ],
};

const MBTI_CATEGORIES = {
  Analysts: ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
  Diplomats: ['INFJ', 'INFP', 'ENFJ', 'ENFP'],
  Sentinels: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
  Explorers: ['ISTP', 'ISFP', 'ESTP', 'ESFP'],
};

export class ExploreScreen {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'explore-screen screen-content';
    this.activeTab = 'quizzes';
    this.activeFilter = 'All';
    this.render();
  }

  getElement() { return this.el; }
  onActivate() { this.render(); }

  render() {
    this.el.innerHTML = `
      <h1 class="page-title">Каталог</h1>
      <div class="segmented-control">
        <button class="segmented-control__item ${this.activeTab === 'quizzes' ? 'segmented-control__item--active' : ''}" data-tab="quizzes">Тесты</button>
        <button class="segmented-control__item ${this.activeTab === 'types' ? 'segmented-control__item--active' : ''}" data-tab="types">Типы</button>
      </div>
      ${this.activeTab === 'quizzes' ? this._quizzesTab() : this._typesTab()}
    `;

    this._bind();
    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }

  _quizzesTab() {
    return `
      <div class="quiz-section">
        <div class="section-label">Методики определения личности</div>
        ${QUIZZES.frameworks.map(q => QuizListItem.render(q)).join('')}
      </div>
      <div class="quiz-section">
        <div class="section-label">Премиум тесты</div>
        ${QUIZZES.premium.map(q => QuizListItem.render(q)).join('')}
      </div>
    `;
  }

  _typesTab() {
    const categories = ['All', ...Object.keys(MBTI_CATEGORIES)];
    const categoryLabels = { All: 'Все', Analysts: 'Аналитики', Diplomats: 'Дипломаты', Sentinels: 'Стражи', Explorers: 'Искатели' };
    const types = this._getFilteredTypes();

    return `
      <div class="filter-pills">
        ${categories.map(c => `<button class="filter-pill ${c === this.activeFilter ? 'filter-pill--active' : ''}" data-filter="${c}">${categoryLabels[c] || c}</button>`).join('')}
      </div>
      ${types.length > 0
        ? `<div class="types-grid">${types.map(t => TypeCard.render(t)).join('')}</div>`
        : '<div class="types-empty">Нет типов для этого фильтра</div>'
      }
    `;
  }

  _getFilteredTypes() {
    let codes;
    if (this.activeFilter === 'All') {
      codes = Object.values(MBTI_CATEGORIES).flat();
    } else {
      codes = MBTI_CATEGORIES[this.activeFilter] || [];
    }
    return codes.map(code => {
      const typeData = MBTI_TYPES ? MBTI_TYPES[code] : null;
      return {
        code,
        name: typeData ? (typeData.title || typeData.name || code) : code,
        description: typeData ? (typeData.subtitle || typeData.description || '') : 'Personality type',
        gradient: 'var(--gradient-sage)',
      };
    });
  }

  _bind() {
    this.el.querySelectorAll('.segmented-control__item').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        this.render();
      });
    });

    this.el.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeFilter = btn.dataset.filter;
        this.render();
      });
    });

    this.el.querySelectorAll('.quiz-list-item').forEach(item => {
      item.addEventListener('click', () => {
        const title = item.dataset.quiz;
        const quiz = [...QUIZZES.frameworks, ...QUIZZES.premium].find(q => q.title === title);
        if (quiz) {
          if (quiz.meta.includes('Премиум') && !stateManager.get('isPremium')) {
            router.openOverlay('premium-modal');
          } else if (!quiz.meta.includes('Скоро')) {
            router.openOverlay('quiz', { framework: quiz.framework });
          }
        }
      });
    });
  }
}

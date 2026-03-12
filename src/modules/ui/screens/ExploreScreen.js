import '../../../styles/screens/explore.css';
import { QuizListItem } from '../components/QuizListItem.js';
import { TypeCard } from '../components/TypeCard.js';
import { router } from '../../router/Router.js';
import { stateManager } from '../../core/StateManager.js';

const QUIZZES = {
  frameworks: [
    { icon: 'brain', title: 'MBTI', meta: '60 questions · 15 min · Free', accent: '#7C9082', framework: 'mbti' },
    { icon: 'sparkles', title: 'Socionics', meta: '40 questions · 10 min · Free', accent: '#E8A85C', framework: 'socionics' },
    { icon: 'heart', title: 'Enneagram', meta: 'Coming soon', accent: '#C47A8A', framework: 'enneagram' },
  ],
  premium: [
    { icon: 'crown', title: 'Leadership Style', meta: '30 questions · 10 min · Premium', accent: '#D4A574', framework: 'leadership' },
    { icon: 'message-circle', title: 'Communication', meta: '25 questions · 8 min · Premium', accent: '#D4A574', framework: 'communication' },
    { icon: 'zap', title: 'Stress Response', meta: '20 questions · 7 min · Premium', accent: '#D4A574', framework: 'stress' },
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
      <h1 class="page-title">Explore</h1>
      <div class="segmented-control">
        <button class="segmented-control__item ${this.activeTab === 'quizzes' ? 'segmented-control__item--active' : ''}" data-tab="quizzes">Quizzes</button>
        <button class="segmented-control__item ${this.activeTab === 'types' ? 'segmented-control__item--active' : ''}" data-tab="types">Types</button>
      </div>
      ${this.activeTab === 'quizzes' ? this._quizzesTab() : this._typesTab()}
    `;

    this._bind();
    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }

  _quizzesTab() {
    return `
      <div class="quiz-section">
        <div class="section-label">Personality Frameworks</div>
        ${QUIZZES.frameworks.map(q => QuizListItem.render(q)).join('')}
      </div>
      <div class="quiz-section">
        <div class="section-label">Premium Quizzes</div>
        ${QUIZZES.premium.map(q => QuizListItem.render(q)).join('')}
      </div>
    `;
  }

  _typesTab() {
    const categories = ['All', ...Object.keys(MBTI_CATEGORIES)];
    const types = this._getFilteredTypes();

    return `
      <div class="filter-pills">
        ${categories.map(c => `<button class="filter-pill ${c === this.activeFilter ? 'filter-pill--active' : ''}" data-filter="${c}">${c}</button>`).join('')}
      </div>
      ${types.length > 0
        ? `<div class="types-grid">${types.map(t => TypeCard.render(t)).join('')}</div>`
        : '<div class="types-empty">No types match this filter</div>'
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
    return codes.map(code => ({
      code,
      name: code,
      description: 'Personality type',
      gradient: 'var(--gradient-sage)',
    }));
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
          if (quiz.meta.includes('Premium') && !stateManager.get('isPremium')) {
            router.openOverlay('premium-modal');
          } else if (!quiz.meta.includes('Coming soon')) {
            router.openOverlay('quiz', { framework: quiz.framework });
          }
        }
      });
    });
  }
}

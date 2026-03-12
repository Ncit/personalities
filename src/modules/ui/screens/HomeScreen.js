import { HeroCard } from '../components/HeroCard.js';
import { BentoGrid } from '../components/BentoGrid.js';
import { TypeCard } from '../components/TypeCard.js';
import { resultsStore } from '../../results/ResultsStore.js';
import { router } from '../../router/Router.js';
import { MBTI_TYPES } from '../../../data/QuizData.ru.js';

const QUIZZES = [
  { title: 'MBTI — 16 типов личности', meta: '60 вопросов · 15 мин · Бесплатно', gradient: 'linear-gradient(135deg, #7C9082 0%, #5A7A64 100%)', framework: 'mbti' },
  { title: 'Соционика — 16 социотипов', meta: '48 вопросов · 12 мин · Бесплатно', gradient: 'linear-gradient(135deg, #E8A85C 0%, #C4843A 100%)', framework: 'socionics' },
  { title: 'Эннеаграмма — 9 типов', meta: '36 вопросов · 10 мин · Бесплатно', gradient: 'linear-gradient(135deg, #C47A8A 0%, #A05A6A 100%)', framework: 'enneagram' },
];

const FRAMEWORK_FILTERS = [
  { key: 'mbti', label: 'MBTI' },
  { key: 'socionics', label: 'Соционика' },
  { key: 'enneagram', label: 'Эннеаграмма' },
];

// MBTI types by category
const MBTI_CODES = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];

// Socionics type keys (will be loaded lazily)
const SOCIONICS_KEYS = ['ILE','SEI','ESE','LII','EIE','LSI','SLE','IEI','SEE','ILI','LIE','ESI','IEE','SLI','LSE','EII'];

// Enneagram type keys
const ENNEAGRAM_KEYS = ['1','2','3','4','5','6','7','8','9'];

// Cache for lazily loaded type data
let _socionicsTypes = null;
let _enneagramTypes = null;

async function getSocionicsTypes() {
  if (!_socionicsTypes) {
    const { SOCIONICS_TYPES } = await import('../../../data/SocionicsQuiz.ru.js');
    _socionicsTypes = SOCIONICS_TYPES;
  }
  return _socionicsTypes;
}

async function getEnneagramTypes() {
  if (!_enneagramTypes) {
    const { ENNEAGRAM_TYPES } = await import('../../../data/EnneagramQuiz.ru.js');
    _enneagramTypes = ENNEAGRAM_TYPES;
  }
  return _enneagramTypes;
}

export class HomeScreen {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'home-screen screen-content';
    this.activeFramework = 'mbti';
    this.render();
  }

  getElement() { return this.el; }

  onActivate() { this.render(); }

  render() {
    const hasResults = resultsStore.getCount() > 0;
    const greeting = this._getGreeting();
    const sm = window.stateManager;
    const isPremium = sm ? sm.get('isPremium') : false;

    this.el.innerHTML = `
      <h1 class="page-title">${greeting}</h1>
      <p class="page-subtitle">Исследуйте свою личность через разные методики</p>
      ${HeroCard.render()}
      ${!isPremium ? `
      <div class="premium-cta-mobile" id="home-premium-cta" style="margin-bottom:12px">
        <div class="premium-cta-mobile__text">
          <div class="premium-cta-mobile__title">Премиум</div>
          <div class="premium-cta-mobile__subtitle">Откройте все тесты и аналитику</div>
        </div>
        <button class="btn-gold btn-gold--small">299 ₽</button>
      </div>
      ` : ''}
      ${BentoGrid.render(hasResults)}
      ${hasResults ? this._shareCard() : ''}

      <div class="home-section">
        <div class="section-label">Основные тесты</div>
        <div class="catalog-fw-cards">
          ${QUIZZES.map(q => `
            <div class="catalog-fw-card" data-framework="${q.framework}" style="background:${q.gradient}">
              <div class="catalog-fw-card__title">${q.title}</div>
              <div class="catalog-fw-card__meta">${q.meta}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="home-section">
        <div class="section-label">Типы личности</div>
        <div class="filter-pills">
          ${FRAMEWORK_FILTERS.map(f =>
            `<button class="filter-pill ${f.key === this.activeFramework ? 'filter-pill--active' : ''}" data-framework-filter="${f.key}">${f.label}</button>`
          ).join('')}
        </div>
        <div class="types-grid" id="types-grid"></div>
      </div>
    `;

    HeroCard.bind(this.el);
    BentoGrid.bind(this.el);
    this.el.querySelector('#home-premium-cta')?.addEventListener('click', () => {
      router.openOverlay('premium-modal');
    });
    this._bind();
    this._renderTypes();

    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });

    this.el.querySelector('#share-btn')?.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({ title: 'Мой тип личности', url: window.location.href });
      }
    });
  }

  async _renderTypes() {
    const grid = this.el.querySelector('#types-grid');
    if (!grid) return;

    let types = [];
    if (this.activeFramework === 'mbti') {
      types = MBTI_CODES.map(code => {
        const td = MBTI_TYPES?.[code];
        return {
          code,
          name: td ? (td.title || td.name || code) : code,
          description: td ? (td.subtitle || td.description || '') : '',
          fullDescription: td ? (td.description || '') : '',
          traits: td ? (td.traits || []) : [],
          gradient: 'var(--gradient-sage)',
        };
      });
    } else if (this.activeFramework === 'socionics') {
      const st = await getSocionicsTypes();
      types = SOCIONICS_KEYS.map(key => {
        const td = st[key];
        return {
          code: td ? td.code : key,
          name: td ? td.title : key,
          description: td ? td.subtitle : '',
          fullDescription: td ? (td.description || td.subtitle || '') : '',
          traits: td ? (td.traits || []) : [],
          gradient: 'linear-gradient(135deg, #E8A85C 0%, #C4843A 100%)',
        };
      });
    } else if (this.activeFramework === 'enneagram') {
      const et = await getEnneagramTypes();
      types = ENNEAGRAM_KEYS.map(key => {
        const td = et[key];
        return {
          code: td ? `Тип ${td.code}` : key,
          name: td ? td.title : `Тип ${key}`,
          description: td ? td.subtitle : '',
          fullDescription: td ? (td.description || td.subtitle || '') : '',
          traits: td ? (td.traits || []) : [],
          gradient: 'linear-gradient(135deg, #C47A8A 0%, #A05A6A 100%)',
        };
      });
    }

    this._typesData = types;
    grid.innerHTML = types.map(t => TypeCard.render(t)).join('');

    grid.querySelectorAll('.type-card').forEach((card, i) => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        const t = this._typesData[i];
        router.openOverlay('type-detail', {
          code: t.code,
          name: t.name,
          description: t.fullDescription,
          traits: t.traits,
          gradient: t.gradient,
        });
      });
    });
  }

  _bind() {
    this.el.querySelectorAll('[data-framework-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeFramework = btn.dataset.frameworkFilter;
        this.el.querySelectorAll('[data-framework-filter]').forEach(b => {
          b.classList.toggle('filter-pill--active', b.dataset.frameworkFilter === this.activeFramework);
        });
        this._renderTypes();
      });
    });

    this.el.querySelectorAll('.catalog-fw-card').forEach(card => {
      card.addEventListener('click', () => {
        const framework = card.dataset.framework;
        if (framework) {
          router.openOverlay('quiz', { framework });
        }
      });
    });
  }

  _getGreeting() {
    const hour = new Date().getHours();
    let timeOfDay = 'Добрый вечер';
    if (hour < 12) timeOfDay = 'Доброе утро';
    else if (hour < 18) timeOfDay = 'Добрый день';

    const userName = window.stateManager?.getState?.()?.userName;
    return userName ? `${timeOfDay}, ${userName}` : timeOfDay;
  }

  _shareCard() {
    return `
      <div class="card share-card">
        <div class="share-card__info">
          <div class="share-card__title">Поделиться типом</div>
          <div class="share-card__subtitle">Покажите друзьям свой результат</div>
        </div>
        <button class="btn-primary" id="share-btn">
          <i data-lucide="share-2" style="width:16px;height:16px"></i> Поделиться
        </button>
      </div>
    `;
  }
}

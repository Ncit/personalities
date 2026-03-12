import '../../../styles/screens/profile.css';
import { StatCard } from '../components/StatCard.js';
import { AchievementCard } from '../components/AchievementCard.js';
import { resultsStore } from '../../results/ResultsStore.js';
import { router } from '../../router/Router.js';

function getStateManager() { return window.stateManager; }

const ACHIEVEMENTS = [
  { key: 'firstSteps', icon: 'footprints', title: 'Первые шаги', description: 'Пройдите первый тест' },
  { key: 'onFire', icon: 'flame', title: 'В ударе', description: '3+ теста за неделю' },
  { key: 'highAccuracy', icon: 'target', title: 'Высокая точность', description: '85%+ показатель уверенности' },
  { key: 'explorer', icon: 'compass', title: 'Исследователь', description: 'Откройте 5 разных типов' },
  { key: 'specialist', icon: 'award', title: 'Специалист', description: 'Пройдите все премиум тесты' },
  { key: 'master', icon: 'trophy', title: 'Мастер', description: 'Пройдите все доступные тесты' },
];

const HELP_LINKS = [
  { icon: 'help-circle', label: 'Как пройти тест' },
  { icon: 'bar-chart-2', label: 'Понимание результатов' },
  { icon: 'users', label: 'О типах личности' },
];

export class ProfileScreen {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'profile-screen screen-content';
    this.render();
  }

  getElement() { return this.el; }
  onActivate() { this.render(); }

  render() {
    const sm = getStateManager();
    const isPremium = sm ? sm.get('isPremium') : false;
    const achievements = sm ? (sm.get('achievements') || {}) : {};
    const mbti = resultsStore.getLatestByFramework('mbti');
    const testCount = resultsStore.getCount();
    const accuracy = resultsStore.getAverageConfidence();

    const vkUser = this._getVkUser();
    const isGuest = !vkUser;

    this.el.innerHTML = `
      <h1 class="page-title">Профиль</h1>
      <div class="profile-layout">
        <div class="profile-layout__left">
          <div class="user-card">
            <div class="user-card__avatar">
              ${vkUser?.photo_100
                ? `<img src="${vkUser.photo_100}" alt="">`
                : '<i data-lucide="user" style="width:24px;height:24px"></i>'
              }
            </div>
            <div>
              <div class="user-card__name">${vkUser ? `${vkUser.first_name} ${vkUser.last_name}` : 'Гость'}</div>
              ${isGuest
                ? '<div class="user-card__type">Войдите, чтобы сохранить результаты</div>'
                : (mbti ? `<div class="user-card__type">${mbti.typeCode} · ${mbti.typeName}</div>` : '')
              }
            </div>
          </div>
          <div class="stats-row">
            ${StatCard.render({ label: 'Тестов пройдено', value: testCount.toString() })}
            ${StatCard.render({ label: 'Точность', value: accuracy != null ? `${accuracy}%` : '—' })}
          </div>
          ${!isGuest ? `
            <div class="achievements-section">
              <div class="achievements-section__title">Достижения</div>
              ${ACHIEVEMENTS.map(a => AchievementCard.render({
                ...a,
                earned: !!achievements[a.key],
              })).join('')}
            </div>
          ` : ''}
          ${!isPremium && !isGuest ? this._premiumCtaMobile() : ''}
          ${isGuest ? this._vkSignInMobile() : ''}
          ${!isGuest ? this._helpInfo() : ''}
        </div>
        <div class="profile-layout__right">
          ${isGuest ? this._vkSignInCard() : ''}
          ${!isPremium && !isGuest ? this._premiumCta() : ''}
        </div>
      </div>
    `;

    this._bind();
    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }

  _getVkUser() {
    try {
      const data = localStorage.getItem('vk_user_auth');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  }

  _premiumCta() {
    return `
      <div class="premium-cta premium-cta--desktop" id="premium-cta">
        <div class="premium-cta__icon">
          <i data-lucide="crown" style="width:32px;height:32px;color:var(--color-accent-gold)"></i>
        </div>
        <div class="premium-cta__title">Премиум</div>
        <div class="premium-cta__subtitle">Откройте все тесты, глубокий анализ и знаменитые совпадения</div>
        <button class="btn-gold">Открыть доступ — 299 ₽</button>
      </div>
    `;
  }

  _premiumCtaMobile() {
    return `
      <div class="premium-cta-mobile" id="premium-cta-mobile">
        <div class="premium-cta-mobile__text">
          <div class="premium-cta-mobile__title">Премиум</div>
          <div class="premium-cta-mobile__subtitle">Откройте все тесты и аналитику</div>
        </div>
        <button class="btn-gold btn-gold--small">299 ₽</button>
      </div>
    `;
  }

  _vkSignInCard() {
    return `
      <div class="vk-signin-card vk-signin-card--desktop" id="vk-signin">
        <div class="vk-signin-card__icon">
          <i data-lucide="log-in" style="width:28px;height:28px"></i>
        </div>
        <div class="vk-signin-card__title">Войти через VK</div>
        <div class="vk-signin-card__subtitle">Сохраняйте результаты и достижения на всех устройствах</div>
        <button class="btn-sage">
          <i data-lucide="log-in" style="width:16px;height:16px"></i>
          Войти
        </button>
      </div>
    `;
  }

  _vkSignInMobile() {
    return `
      <div class="vk-signin-card vk-signin-card--mobile" id="vk-signin-mobile">
        <div class="vk-signin-card__icon">
          <i data-lucide="log-in" style="width:28px;height:28px"></i>
        </div>
        <div class="vk-signin-card__title">Войти через VK</div>
        <div class="vk-signin-card__subtitle">Сохраняйте результаты и достижения на всех устройствах</div>
        <button class="btn-sage btn-sage--full">
          <i data-lucide="log-in" style="width:16px;height:16px"></i>
          Войти
        </button>
      </div>
    `;
  }

  _helpInfo() {
    return `
      <div class="help-info">
        <div class="help-info__title">Помощь и информация</div>
        ${HELP_LINKS.map(link => `
          <div class="help-info__link">
            <i data-lucide="${link.icon}" style="width:18px;height:18px"></i>
            <span>${link.label}</span>
            <i data-lucide="chevron-right" style="width:16px;height:16px;margin-left:auto;opacity:0.4"></i>
          </div>
        `).join('')}
      </div>
    `;
  }

  _bind() {
    this.el.querySelector('#premium-cta')?.addEventListener('click', () => {
      router.openOverlay('premium-modal');
    });
    this.el.querySelector('#premium-cta-mobile')?.addEventListener('click', () => {
      router.openOverlay('premium-modal');
    });
    const vkBtn = this.el.querySelector('#vk-signin') || this.el.querySelector('#vk-signin-mobile');
    vkBtn?.addEventListener('click', () => {
      if (window.vkAuth) window.vkAuth.login();
    });
  }
}

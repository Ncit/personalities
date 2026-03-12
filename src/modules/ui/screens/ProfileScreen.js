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
  { icon: 'info', label: 'Как пройти тест', action: 'how-to-test' },
  { icon: 'bar-chart-2', label: 'Понимание результатов', action: 'understanding-results' },
  { icon: 'crown', label: 'Премиум функции', action: 'premium-features' },
  { icon: 'message-circle', label: 'Вопросы и ответы', action: 'faq' },
];

const ABOUT_LINKS = [
  { icon: 'users', label: 'О типах личности', action: 'about-personality' },
  { icon: 'shield', label: 'Конфиденциальность', action: 'privacy' },
  { icon: 'file-text', label: 'Условия использования', action: 'terms' },
  { icon: 'scroll-text', label: 'Публичная оферта', action: 'offer' },
  { icon: 'mail', label: 'Контакты', action: 'contacts' },
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

    const isDev = sm ? sm.isDevelopment() : false;

    this.el.innerHTML = `
      <h1 class="page-title">Профиль</h1>
      <div class="profile-content">
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
        ${isGuest && !isDev ? this._vkSignInMobile() : ''}
        ${isGuest && isDev ? this._devVkSignIn() : ''}
        ${this._helpInfo()}
        ${this._devTools()}
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

  _devVkSignIn() {
    return `
      <div class="dev-vk-signin" id="dev-vk-signin">
        <div class="dev-vk-signin__title">
          <i data-lucide="code" style="width:16px;height:16px"></i>
          Dev: Войти как тестовый пользователь
        </div>
        <button class="dev-tools-btn" id="dev-vk-login">
          <i data-lucide="log-in" style="width:16px;height:16px"></i>
          Войти как Никита (тест)
        </button>
      </div>
    `;
  }

  _helpInfo() {
    const renderLinks = (links) => links.map(link => `
      <div class="help-info__link" data-action="${link.action}">
        <i data-lucide="${link.icon}" style="width:18px;height:18px"></i>
        <span>${link.label}</span>
        <i data-lucide="chevron-right" style="width:16px;height:16px;margin-left:auto;opacity:0.4"></i>
      </div>
    `).join('');

    return `
      <div class="help-info">
        <div class="help-info__title">Помощь</div>
        ${renderLinks(HELP_LINKS)}
      </div>
      <div class="help-info">
        <div class="help-info__title">О проекте</div>
        ${renderLinks(ABOUT_LINKS)}
      </div>
      <div class="profile-footer">
        <div class="profile-footer__text">
          <a href="mailto:personalitiesresearch@mail.ru">personalitiesresearch@mail.ru</a><br>
          © 2025 Тест личности. Основано на исследованиях психологии личности.
        </div>
      </div>
    `;
  }

  _devTools() {
    const sm = getStateManager();
    if (!sm || !sm.isDevelopment()) return '';
    const isPremium = sm.get('isPremium');
    return `
      <div class="dev-tools-panel">
        <div class="dev-tools-panel__title">
          <i data-lucide="code" style="width:16px;height:16px"></i>
          Инструменты разработчика
        </div>
        <button class="dev-tools-btn" id="dev-toggle-premium">
          <i data-lucide="crown" style="width:16px;height:16px"></i>
          ${isPremium ? 'Отключить Премиум' : 'Включить Премиум'}
        </button>
        <button class="dev-tools-btn" id="dev-clear-storage">
          <i data-lucide="trash-2" style="width:16px;height:16px"></i>
          Очистить localStorage
        </button>
        <button class="dev-tools-btn" id="dev-toggle-state">
          <i data-lucide="toggle-left" style="width:16px;height:16px"></i>
          Переключить на release
        </button>
        ${this._getVkUser() ? `
        <button class="dev-tools-btn" id="dev-vk-logout">
          <i data-lucide="log-out" style="width:16px;height:16px"></i>
          Выйти из VK (тест)
        </button>
        ` : ''}
      </div>
    `;
  }

  _bind() {
    this.el.querySelector('#premium-cta-mobile')?.addEventListener('click', () => {
      router.openOverlay('premium-modal');
    });

    this.el.querySelector('#vk-signin-mobile')?.addEventListener('click', () => {
      if (window.vkAuth) window.vkAuth.login();
    });

    this.el.querySelector('#dev-vk-login')?.addEventListener('click', () => {
      const fakeUser = {
        first_name: 'Никита',
        last_name: 'Тестов',
        photo_100: '',
      };
      localStorage.setItem('vk_user_auth', JSON.stringify(fakeUser));
      this.render();
    });

    this.el.querySelectorAll('.help-info__link[data-action]').forEach(link => {
      link.addEventListener('click', () => {
        router.openOverlay('help', { topic: link.dataset.action });
      });
    });

    this.el.querySelector('#dev-toggle-premium')?.addEventListener('click', () => {
      const sm = getStateManager();
      if (sm) {
        sm.setPremium(!sm.get('isPremium'));
        this.render();
      }
    });

    this.el.querySelector('#dev-clear-storage')?.addEventListener('click', () => {
      localStorage.clear();
      location.reload();
    });

    this.el.querySelector('#dev-toggle-state')?.addEventListener('click', () => {
      const sm = getStateManager();
      if (sm) {
        const current = sm.get('appState');
        sm.setState({ appState: current === 'development' ? 'release' : 'development' });
        this.render();
      }
    });

    this.el.querySelector('#dev-vk-logout')?.addEventListener('click', () => {
      localStorage.removeItem('vk_user_auth');
      this.render();
    });
  }
}

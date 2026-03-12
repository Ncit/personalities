import { resultsStore } from '../../results/ResultsStore.js';
import { router } from '../../router/Router.js';

function getStateManager() { return window.stateManager; }

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
  { icon: 'mail', label: 'Контакты', action: 'contacts' },
  { icon: 'scroll-text', label: 'Публичная оферта', action: 'offer' },
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
    const mbti = resultsStore.getLatestByFramework('mbti');
    const testCount = resultsStore.getCount();
    const accuracy = resultsStore.getAverageConfidence();

    const vkUser = this._getVkUser();
    const isGuest = !vkUser;
    const isDev = sm ? sm.isDevelopment() : false;

    this.el.innerHTML = `
      <h1 class="page-title">Профиль</h1>
      <div class="profile-grid">
        <!-- User card — full width -->
        <div class="profile-grid__user">
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
        </div>

        <!-- Stats — each card in its own grid cell -->
        <div class="profile-grid__stat">
          <div class="stat-card">
            <div class="stat-card__label">Тестов пройдено</div>
            <div class="stat-card__value">${testCount}</div>
          </div>
        </div>
        <div class="profile-grid__stat">
          <div class="stat-card">
            <div class="stat-card__label">Точность</div>
            <div class="stat-card__value">${accuracy != null ? `${accuracy}%` : '—'}</div>
          </div>
        </div>

        ${!isPremium && !isGuest ? `
        <!-- Premium CTA — full width -->
        <div class="profile-grid__premium">
          <div class="premium-cta-mobile" id="premium-cta-mobile">
            <div class="premium-cta-mobile__text">
              <div class="premium-cta-mobile__title">Премиум</div>
              <div class="premium-cta-mobile__subtitle">Откройте все тесты и аналитику</div>
            </div>
            <button class="btn-gold btn-gold--small">299 ₽</button>
          </div>
        </div>
        ` : ''}

        ${isGuest && !isDev ? `
        <!-- VK Sign In — full width -->
        <div class="profile-grid__signin">
          <div class="vk-signin-card" id="vk-signin-mobile">
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
        </div>
        ` : ''}

        ${isGuest && isDev ? `
        <!-- Dev VK Sign In — full width -->
        <div class="profile-grid__signin">
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
        </div>
        ` : ''}

        <!-- Help links — 2-column grid -->
        <div class="profile-grid__help">
          <div class="section-label">Помощь</div>
          <div class="links-grid">
            ${HELP_LINKS.map(link => `
              <div class="help-info__link" data-action="${link.action}">
                <i data-lucide="${link.icon}" style="width:18px;height:18px"></i>
                <span>${link.label}</span>
                <i data-lucide="chevron-right" style="width:16px;height:16px;margin-left:auto;opacity:0.4"></i>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- About links — 2-column grid -->
        <div class="profile-grid__about">
          <div class="section-label">О проекте</div>
          <div class="links-grid">
            ${ABOUT_LINKS.map(link => `
              <div class="help-info__link" data-action="${link.action}">
                <i data-lucide="${link.icon}" style="width:18px;height:18px"></i>
                <span>${link.label}</span>
                <i data-lucide="chevron-right" style="width:16px;height:16px;margin-left:auto;opacity:0.4"></i>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Footer — full width -->
        <div class="profile-grid__footer">
          <div class="profile-footer__text">
            <a href="mailto:personalitiesresearch@mail.ru">personalitiesresearch@mail.ru</a><br>
            © ${new Date().getFullYear()} Тест личности. Основано на исследованиях психологии личности.
          </div>
        </div>

        ${isDev ? `
        <!-- Dev tools — full width -->
        <div class="profile-grid__dev">
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
            ${vkUser ? `
            <button class="dev-tools-btn" id="dev-vk-logout">
              <i data-lucide="log-out" style="width:16px;height:16px"></i>
              Выйти из VK (тест)
            </button>
            ` : ''}
          </div>
        </div>
        ` : ''}
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

  _bind() {
    this.el.querySelector('#premium-cta-mobile')?.addEventListener('click', () => {
      router.openOverlay('premium-modal');
    });

    this.el.querySelector('#vk-signin-mobile')?.addEventListener('click', () => {
      if (window.vkAuth) window.vkAuth.login();
    });

    this.el.querySelector('#dev-vk-login')?.addEventListener('click', () => {
      localStorage.setItem('vk_user_auth', JSON.stringify({
        first_name: 'Никита',
        last_name: 'Тестов',
        photo_100: '',
      }));
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

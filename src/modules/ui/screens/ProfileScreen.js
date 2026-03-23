import { resultsStore } from '../../results/ResultsStore.js';
import { router } from '../../router/Router.js';
import localizationManager from '../../../locales/LocalizationManager.js';
import { PlatformDetector } from '../../platform/PlatformDetector.js';
import { PremiumCTA } from '../components/PremiumCTA.js';

function getStateManager() { return window.stateManager; }

function getHelpLinks() {
  return [
    { icon: 'info', label: localizationManager.get('footer.howToTest'), action: 'how-to-test' },
    { icon: 'bar-chart-2', label: localizationManager.get('footer.understandingResults'), action: 'understanding-results' },
    { icon: 'crown', label: localizationManager.get('footer.premiumFeatures'), action: 'premium-features' },
    { icon: 'message-circle', label: localizationManager.get('footer.faq'), action: 'faq' },
  ];
}

function getAboutLinks() {
  return [
    { icon: 'users', label: localizationManager.get('footer.aboutPersonality'), action: 'about-personality' },
    { icon: 'shield', label: localizationManager.get('footer.privacy'), action: 'privacy' },
    { icon: 'file-text', label: localizationManager.get('footer.terms'), action: 'terms' },
    { icon: 'mail', label: localizationManager.get('footer.contacts'), action: 'contacts' },
    { icon: 'scroll-text', label: localizationManager.get('footer.offer'), action: 'offer' },
  ];
}

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
      <h1 class="page-title">${localizationManager.get('profile.title')}</h1>
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
              <div class="user-card__name">${vkUser ? `${vkUser.first_name} ${vkUser.last_name}` : localizationManager.get('profile.guest')}</div>
              ${isGuest
                ? `<div class="user-card__type">${localizationManager.get('profile.signInToSave')}</div>`
                : (mbti ? `<div class="user-card__type">${mbti.typeCode} · ${mbti.typeName}</div>` : '')
              }
            </div>
          </div>
        </div>

        <!-- Stats — each card in its own grid cell -->
        <div class="profile-grid__stat">
          <div class="stat-card">
            <div class="stat-card__label">${localizationManager.get('profile.testsCompleted')}</div>
            <div class="stat-card__value">${testCount}</div>
          </div>
        </div>
        <div class="profile-grid__stat">
          <div class="stat-card">
            <div class="stat-card__label">${localizationManager.get('profile.accuracy')}</div>
            <div class="stat-card__value">${accuracy != null ? `${accuracy}%` : '—'}</div>
          </div>
        </div>

        ${!isPremium && !isGuest ? `
        <!-- Premium CTA — full width -->
        <div class="profile-grid__premium">
          ${PremiumCTA.render('profile.premiumSubtitle')}
        </div>
        ` : ''}

        ${isGuest && !isDev ? `
        <!-- VK Sign In — full width -->
        <div class="profile-grid__signin">
          <div class="vk-signin-card" id="vk-signin-mobile">
            <div class="vk-signin-card__icon">
              <i data-lucide="log-in" style="width:28px;height:28px"></i>
            </div>
            <div class="vk-signin-card__title">${localizationManager.get('profile.signInVK')}</div>
            <div class="vk-signin-card__subtitle">${localizationManager.get('profile.saveResults')}</div>
            <button class="btn-sage btn-sage--full">
              <i data-lucide="log-in" style="width:16px;height:16px"></i>
              ${localizationManager.get('profile.signIn')}
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
              ${localizationManager.get('profile.devSignIn')}
            </div>
            <button class="dev-tools-btn" id="dev-vk-login">
              <i data-lucide="log-in" style="width:16px;height:16px"></i>
              ${localizationManager.get('profile.devSignInBtn')}
            </button>
          </div>
        </div>
        ` : ''}

        <!-- Help links — 2-column grid -->
        <div class="profile-grid__help">
          <div class="section-label">${localizationManager.get('profile.help')}</div>
          <div class="links-grid">
            ${getHelpLinks().map(link => `
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
          <div class="section-label">${localizationManager.get('profile.about')}</div>
          <div class="links-grid">
            ${getAboutLinks().map(link => `
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
            © ${new Date().getFullYear()} ${localizationManager.get('profile.footerText')}
          </div>
        </div>

        ${isDev ? `
        <!-- Dev tools — full width -->
        <div class="profile-grid__dev">
          <div class="dev-tools-panel">
            <div class="dev-tools-panel__title">
              <i data-lucide="code" style="width:16px;height:16px"></i>
              ${localizationManager.get('profile.devTools')}
            </div>
            <button class="dev-tools-btn" id="dev-toggle-premium">
              <i data-lucide="crown" style="width:16px;height:16px"></i>
              ${isPremium ? localizationManager.get('profile.togglePremiumOff') : localizationManager.get('profile.togglePremiumOn')}
            </button>
            <button class="dev-tools-btn" id="dev-clear-storage">
              <i data-lucide="trash-2" style="width:16px;height:16px"></i>
              ${localizationManager.get('profile.clearStorage')}
            </button>
            <button class="dev-tools-btn" id="dev-toggle-state">
              <i data-lucide="toggle-left" style="width:16px;height:16px"></i>
              ${localizationManager.get('profile.toggleRelease')}
            </button>
            ${vkUser ? `
            <button class="dev-tools-btn" id="dev-vk-logout">
              <i data-lucide="log-out" style="width:16px;height:16px"></i>
              ${localizationManager.get('profile.logoutVK')}
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
    // Mobile Tauri environment
    if (window.mobileBridgeManager?.userService?.isAuthenticated()) {
      return window.mobileBridgeManager.userService.getUserInfo();
    }
    // VK Bridge Manager (VK Mini App)
    if (window.vkBridgeManager?.userService?.userInfo) {
      return window.vkBridgeManager.userService.userInfo;
    }
    // Fallback to localStorage (dev/test login)
    try {
      const data = localStorage.getItem('vk_user_auth');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  }

  _bind() {
    PremiumCTA.bind(this.el, () => router.openOverlay('premium-modal'));

    this.el.querySelector('#vk-signin-mobile')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (window.mobileBridgeManager?.userService) {
        try {
          await window.mobileBridgeManager.userService.authenticate();
          this.render();
        } catch (err) {
          console.error('VK auth error:', err?.message || err);
        }
      } else if (window.vkAuth) {
        window.vkAuth.login();
      }
    });

    this.el.querySelector('#dev-vk-login')?.addEventListener('click', () => {
      localStorage.setItem('vk_user_auth', JSON.stringify({
        first_name: 'Nikita',
        last_name: 'Test',
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

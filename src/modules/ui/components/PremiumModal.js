import { router } from '../../router/Router.js';
import { LoggerManager } from '../../core/LoggerManager.js';
import { firebaseAnalytics } from '../../../config/firebase.js';
import { PlatformDetector } from '../../platform/PlatformDetector.js';

const logger = new LoggerManager().createModuleLogger('PremiumModal');

function getStateManager() { return window.stateManager; }

export class PremiumModal {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'overlay-backdrop premium-backdrop';
    this.state = 'idle';
    this.errorMessage = '';
    this.render();
  }

  getElement() { return this.el; }

  render() {
    const isProcessing = this.state === 'processing';

    this.el.innerHTML = `
      <div class="premium-modal">
        <div class="premium-modal__header-section">
          <div class="premium-modal__icon-wrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5.5 21h13"/></svg>
          </div>
          <div class="premium-modal__title">Премиум</div>
          <div class="premium-modal__subtitle">Откройте полный опыт определения личности</div>
        </div>
        <ul class="premium-benefits">
          <li><i data-lucide="circle-check" class="premium-benefits__icon" style="width:20px;height:20px"></i> Расширенный анализ личности</li>
          <li><i data-lucide="circle-check" class="premium-benefits__icon" style="width:20px;height:20px"></i> Все специализированные премиум тесты</li>
          <li><i data-lucide="circle-check" class="premium-benefits__icon" style="width:20px;height:20px"></i> Совпадения с известными личностями</li>
          <li><i data-lucide="circle-check" class="premium-benefits__icon" style="width:20px;height:20px"></i> Визуальные графики и аналитика</li>
          <li><i data-lucide="circle-check" class="premium-benefits__icon" style="width:20px;height:20px"></i> Без рекламы</li>
        </ul>
        <button class="premium-cta-btn" id="premium-buy" ${isProcessing ? 'disabled' : ''}>
          ${isProcessing ? '<span class="spinner" style="width:18px;height:18px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px"></span> Обработка…' : this._getButtonText()}
        </button>
        ${this.state === 'error' ? `<div class="premium-error">${this.errorMessage}</div>` : ''}
        <div class="premium-note">Разовый платёж · Без подписки</div>
      </div>
    `;

    this._bind();
    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }

  _bind() {
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) router.closeOverlay();
    });

    this.el.querySelector('#premium-buy')?.addEventListener('click', async () => {
      this.state = 'processing';
      this.errorMessage = '';
      this.render();

      try {
        const manager = PlatformDetector.getManager();
        const flavor = PlatformDetector.getFlavor();

        if (flavor === 'tg' && manager) {
          // Telegram: showOrderBox handles Stars/Tochka choice
          const result = await manager.showOrderBox();
          if (result?.success) {
            router.closeOverlay();
            return;
          } else if (result?.pending) {
            // Tochka redirect — modal stays, user will return
            this.state = 'idle';
            this.render();
            return;
          }
          // Cancelled or failed — reset
          this.state = 'idle';
          this.render();
          return;
        }

        // VK / Web: existing Tochka flow
        let vkUserId = null;
        let appId = '53942833';

        if (window.vkBridgeManager && window.vkBridgeManager.userService) {
          const userInfo = window.vkBridgeManager.userService.getUserInfo();
          if (userInfo && userInfo.id) vkUserId = String(userInfo.id);
        }
        if (!vkUserId && window.userInfo && window.userInfo.id) {
          vkUserId = String(window.userInfo.id);
        }
        if (!vkUserId) {
          try {
            const authData = localStorage.getItem('vk_user_auth');
            if (authData) { const p = JSON.parse(authData); if (p.id) vkUserId = String(p.id); }
          } catch {}
        }
        if (!vkUserId) {
          try {
            const ld = localStorage.getItem('vk_user_data_local');
            if (ld) { const p = JSON.parse(ld); if (p.id) vkUserId = String(p.id); }
          } catch {}
        }
        if (!vkUserId) {
          const urlParams = new URLSearchParams(window.location.search);
          const vid = urlParams.get('vk_user_id');
          if (vid) vkUserId = vid;
        }
        if (!vkUserId) throw new Error('User not identified');

        const backendUrl = 'https://nikmobdev.ru/goodsshop/api/tochka/create-payment';
        const resp = await fetch(backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vk_user_id: vkUserId, app_id: appId })
        });

        const data = await resp.json();
        if (!data.success || !data.paymentLink) throw new Error(data.message || 'Failed to create payment');

        firebaseAnalytics.logEvent('payment_initiated', {
          vk_user_id: vkUserId,
          operation_id: data.operationId,
          payment_method: 'tochka'
        });

        localStorage.setItem('tochka_pending_operation', data.operationId);
        window.location.href = data.paymentLink;
      } catch (error) {
        logger.error('Payment failed:', error);
        this.state = 'error';
        this.errorMessage = error.message === 'User not identified'
          ? 'Не удалось определить пользователя'
          : 'Ошибка оплаты. Попробуйте позже.';
        this.render();
      }
    });
  }

  _getButtonText() {
    const flavor = PlatformDetector.getFlavor();
    if (flavor === 'tg') return 'Открыть Премиум';
    if (flavor === 'vk') return 'Открыть Премиум — 40 голосов';
    return 'Открыть Премиум — 150 ₽';
  }

  _showToast(message, type) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }
}

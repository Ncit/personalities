import { router } from '../../router/Router.js';
import { LoggerManager } from '../../core/LoggerManager.js';

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
            <i data-lucide="crown" style="width:24px;height:24px"></i>
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
          ${isProcessing ? '<span class="spinner" style="width:18px;height:18px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px"></span> Обработка…' : 'Открыть Премиум — 280 ₽'}
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
        if (window.vkBridge || window.vkBridgeManager) {
          const bridge = window.vkBridgeManager || window.vkBridge;
          if (bridge.showOrderBox) {
            await bridge.showOrderBox();
          } else if (bridge.send) {
            await bridge.send('VKWebAppShowOrderBox', { type: 'item', item: 'premium_unlock' });
          }
        }

        const sm = getStateManager();
        if (sm) sm.setPremium(true);
        this.state = 'idle';
        router.closeOverlay();

        this._showToast('Премиум разблокирован!', 'success');
      } catch (error) {
        if (error.error_data?.error_code === 4) {
          this.state = 'idle';
          this.render();
        } else {
          logger.error('Payment failed:', error);
          this.state = 'error';
          this.errorMessage = 'Ошибка оплаты. Попробуйте снова.';
          this.render();
        }
      }
    });
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

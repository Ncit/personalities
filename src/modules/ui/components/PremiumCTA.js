import localizationManager from '../../../locales/LocalizationManager.js';
import { PlatformDetector } from '../../platform/PlatformDetector.js';

export class PremiumCTA {
    static _getButtonLabel() {
        if (PlatformDetector.isTelegram()) return localizationManager.get('premium.priceTg');
        if (PlatformDetector.isMobile()) return localizationManager.get('premium.priceMobile');
        return localizationManager.get('premium.priceDefault');
    }

    static render(subtitleKey = 'home.premiumSubtitle') {
        // Hide if already premium on mobile
        if (PlatformDetector.isMobile() && window.mobileBridgeManager?.paymentService?.isPremium()) {
            return '';
        }
        return `
          <div class="premium-cta-mobile" id="premium-cta">
            <div class="premium-cta-mobile__text">
              <div class="premium-cta-mobile__title">${localizationManager.get('home.premium')}</div>
              <div class="premium-cta-mobile__subtitle">${localizationManager.get(subtitleKey)}</div>
            </div>
            <button class="btn-gold btn-gold--small">${PremiumCTA._getButtonLabel()}</button>
          </div>
        `;
    }

    static bind(container, onOpen) {
        container.querySelector('#premium-cta')?.addEventListener('click', () => {
            if (onOpen) onOpen();
        });
    }
}

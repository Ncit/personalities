import { MobilePaymentService } from './services/MobilePaymentService.js';
import { MobileUserService } from './services/MobileUserService.js';
import { PlatformDetector } from '../platform/PlatformDetector.js';
import { LoggerManager } from '../core/LoggerManager.js';
import localizationManager from '../../locales/LocalizationManager.js';

export class MobileBridgeManager {
    constructor() {
        this.logger = new LoggerManager().createModuleLogger('MobileBridgeManager');
        this.paymentService = new MobilePaymentService();
        this.userService = new MobileUserService();
        this.isMobilePlatform = false;
    }

    async init() {
        try {
            if (!window.__TAURI__) {
                this.logger.warn('Tauri runtime not available');
            }

            this.isMobilePlatform = true;
            PlatformDetector.setManager(this);

            // Set locale — always Russian for RuStore app
            localizationManager.setLocale('ru');
            this.logger.log('Locale set to: ru');

            // Restore purchases (blocking — must complete before app renders)
            try {
                await this.paymentService.restorePurchases();
            } catch (err) {
                this.logger.warn('Purchase restore failed:', err);
            }

            this.logger.log('MobileBridgeManager initialized');
        } catch (error) {
            this.logger.error('MobileBridgeManager init failed:', error);
        }
    }

    isMobileEnvironment() {
        return this.isMobilePlatform;
    }

    // Cross-compat methods (match TG/VK bridge interface)
    isTGEnvironment() { return false; }
    isVKEnvironment() { return false; }
}

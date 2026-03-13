/**
 * TGBridgeManager — main orchestrator for Telegram Mini Apps integration.
 * Exposed as window.tgBridgeManager.
 */
import { LoggerManager } from '../core/LoggerManager.js';
import { TGConfig } from './config/TGConfig.js';
import { TGErrorHandler } from './utils/TGErrorHandler.js';
import { TGAnalyticsService } from './services/TGAnalyticsService.js';
import { TGUserService } from './services/TGUserService.js';
import { TGPaymentService } from './services/TGPaymentService.js';
import { PlatformDetector } from '../platform/PlatformDetector.js';

export class TGBridgeManager {
    constructor() {
        this.logger = new LoggerManager().createModuleLogger('TGBridgeManager');
        this.errorHandler = new TGErrorHandler(this.logger);
        this.analytics = new TGAnalyticsService(this.logger);
        this.userService = new TGUserService(this.logger, this.analytics);
        this.paymentService = new TGPaymentService(this.logger, this.analytics, this.errorHandler);
        this.isTG = false;
    }

    /** Initialize Telegram Mini App. */
    async init() {
        try {
            const tgApp = window.Telegram?.WebApp;
            if (!tgApp) {
                this.logger.warn('Telegram WebApp not available');
                return;
            }

            // Signal readiness to Telegram
            tgApp.ready();

            // Expand to full height
            tgApp.expand();

            this.isTG = true;

            // Register with PlatformDetector
            PlatformDetector.setManager(this);

            // Apply theme
            this._applyTheme();

            // Listen for theme changes
            tgApp.onEvent('themeChanged', () => this._applyTheme());

            // Listen for viewport changes
            tgApp.onEvent('viewportChanged', (event) => {
                this.logger.log('Viewport changed, isStateStable:', event.isStateStable);
            });

            // Initialize user service (extracts user from initDataUnsafe)
            this.userService.init();

            // Check premium (non-blocking)
            this.userService.checkPremiumStatus().catch(err => {
                this.logger.warn('Premium check failed (non-blocking):', err);
            });

            this.analytics.track(TGConfig.ANALYTICS_EVENTS.appInit, {
                user_id: this.userService.getUserId()
            });

            this.logger.log('TGBridgeManager initialized');
        } catch (error) {
            this.logger.error('TGBridgeManager init failed:', error);
        }
    }

    /** Returns true when running inside Telegram. */
    isTGEnvironment() {
        return this.isTG;
    }

    /** Returns false — not VK. Used by code that checks `manager.isVKEnvironment()`. */
    isVKEnvironment() {
        return false;
    }

    /** Get user info from TGUserService. */
    getUserInfo() {
        return this.userService.getUserInfo();
    }

    /** Get Telegram user ID as string. */
    getUserId() {
        return this.userService.getUserId();
    }

    /** Check premium status. */
    async checkPremiumStatus() {
        return this.userService.checkPremiumStatus();
    }

    /**
     * Share results via switchInlineQuery.
     * Falls back to openTelegramLink if unavailable.
     */
    shareResults(type, text, title) {
        try {
            const tgApp = window.Telegram?.WebApp;
            if (!tgApp) return;

            this.analytics.track(TGConfig.ANALYTICS_EVENTS.shareAttempted);

            // Replace VK link with Telegram link in text
            const tgText = text?.replace(/https:\/\/vk\.com\/app\d+[_\d]*/g, TGConfig.getMiniAppUrl()) || title || '';

            if (typeof tgApp.switchInlineQuery === 'function') {
                tgApp.switchInlineQuery(tgText, ['users', 'groups', 'channels']);
            } else {
                // Fallback
                const encoded = encodeURIComponent(tgText);
                tgApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(TGConfig.getMiniAppUrl())}&text=${encoded}`);
            }
        } catch (error) {
            this.logger.error('Share failed:', error);
            this.errorHandler.showError('Не удалось поделиться результатом.');
        }
    }

    /**
     * Show payment options.
     * For Russian locale: Stars + Tochka choice.
     * For other locales: Stars only.
     */
    async showOrderBox(productId) {
        const userId = this.userService.getUserId();
        if (!userId) {
            this.errorHandler.showError('Пользователь не определён.');
            return null;
        }

        const lang = this.userService.getLanguage();
        const isRussian = (lang === 'ru');
        const config = TGConfig.getPaymentConfig(productId);

        if (isRussian) {
            // Show choice popup: Stars or Tochka
            return this._showPaymentChoicePopup(userId, config);
        } else {
            // English: Stars only
            return this._payWithStars(userId);
        }
    }

    /** Pay with Telegram Stars directly. */
    async _payWithStars(userId) {
        try {
            const result = await this.paymentService.payWithStars(userId);
            if (result.success) {
                this.userService.storePremiumStatus(true);
                this._restartAppUI();
            }
            return result;
        } catch (error) {
            const msg = this.errorHandler.handle('Stars payment', error);
            this.errorHandler.showError(msg);
            return { success: false };
        }
    }

    /** Show a popup letting user choose Stars or Tochka, then execute chosen flow. */
    _showPaymentChoicePopup(userId, config) {
        return new Promise((resolve) => {
            const tgApp = window.Telegram?.WebApp;
            if (!tgApp?.showPopup) {
                // Fallback: just use Stars
                this._payWithStars(userId).then(resolve);
                return;
            }

            tgApp.showPopup({
                title: 'Способ оплаты',
                message: 'Выберите способ оплаты для Премиум:',
                buttons: [
                    { id: 'stars', type: 'default', text: `⭐ ${config.starsPrice} Stars` },
                    { id: 'tochka', type: 'default', text: `💳 ${config.tochkaPrice} ₽` },
                    { id: 'cancel', type: 'cancel' }
                ]
            }, async (buttonId) => {
                if (buttonId === 'stars') {
                    const result = await this._payWithStars(userId);
                    resolve(result);
                } else if (buttonId === 'tochka') {
                    await this._payWithTochka(userId);
                    resolve({ success: false, pending: true }); // User redirected externally
                } else {
                    resolve({ success: false, cancelled: true });
                }
            });
        });
    }

    /** Initiate Tochka payment — opens external link. */
    async _payWithTochka(userId) {
        try {
            const { paymentLink, operationId } = await this.paymentService.createTochkaPayment(userId);
            localStorage.setItem('tochka_pending_operation', operationId);
            window.Telegram.WebApp.openLink(paymentLink);
        } catch (error) {
            const msg = this.errorHandler.handle('Tochka payment', error);
            this.errorHandler.showError(msg);
        }
    }

    /** Show a notification popup. */
    showNotification(message) {
        try {
            const tgApp = window.Telegram?.WebApp;
            if (tgApp?.showPopup) {
                tgApp.showPopup({ message, buttons: [{ type: 'ok' }] });
            } else {
                alert(message);
            }
        } catch (e) {
            alert(message);
        }
    }

    /** Trigger haptic feedback. */
    haptic(type = 'impact', style = 'light') {
        try {
            const hf = window.Telegram?.WebApp?.HapticFeedback;
            if (!hf) return;
            if (type === 'impact') hf.impactOccurred(style);
            else if (type === 'notification') hf.notificationOccurred(style);
            else if (type === 'selection') hf.selectionChanged();
        } catch (e) {
            // Haptics not supported — ignore
        }
    }

    /** Show/hide the Telegram BackButton. */
    setBackButtonVisible(visible, onClick) {
        const bb = window.Telegram?.WebApp?.BackButton;
        if (!bb) return;
        if (visible) {
            bb.show();
            if (onClick) bb.onClick(onClick);
        } else {
            bb.hide();
        }
    }

    /** Configure and show the Telegram MainButton. */
    setMainButton(text, onClick) {
        const mb = window.Telegram?.WebApp?.MainButton;
        if (!mb) return;
        mb.setText(text);
        mb.onClick(onClick);
        mb.show();
        document.getElementById('app')?.classList.add('tg-main-button-visible');
    }

    /** Hide the Telegram MainButton. */
    hideMainButton() {
        const mb = window.Telegram?.WebApp?.MainButton;
        if (mb) mb.hide();
        document.getElementById('app')?.classList.remove('tg-main-button-visible');
    }

    /** VK-compatible method for tracking events. */
    trackVKEvent(eventName, data = {}) {
        this.analytics.track(`tg_${eventName}`, data);
    }

    /** Alias for VK compat: track quiz events. */
    trackVKQuizEvent(eventName, data = {}) {
        this.analytics.track(`tg_${eventName}`, data);
    }

    /** Restart app UI after premium purchase. */
    _restartAppUI() {
        if (typeof window.updatePremiumUI === 'function') {
            window.updatePremiumUI();
        }
    }

    /** Apply Telegram theme params to CSS variables. */
    _applyTheme() {
        const tp = window.Telegram?.WebApp?.themeParams;
        if (!tp) return;

        const root = document.documentElement.style;
        if (tp.bg_color) root.setProperty('--tg-bg', tp.bg_color);
        if (tp.text_color) root.setProperty('--tg-text', tp.text_color);
        if (tp.hint_color) root.setProperty('--tg-hint', tp.hint_color);
        if (tp.link_color) root.setProperty('--tg-link', tp.link_color);
        if (tp.button_color) root.setProperty('--tg-button', tp.button_color);
        if (tp.button_text_color) root.setProperty('--tg-button-text', tp.button_text_color);
        if (tp.secondary_bg_color) root.setProperty('--tg-secondary-bg', tp.secondary_bg_color);
    }
}

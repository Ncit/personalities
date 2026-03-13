/**
 * Telegram-specific error handling.
 */
import localizationManager from '../../../locales/LocalizationManager.js';

export class TGErrorHandler {
    constructor(logger) {
        this.logger = logger;
    }

    /** Handle and log an error, returning a user-friendly message. */
    handle(context, error) {
        this.logger.error(`[TG ${context}]`, error);

        if (error?.message?.includes('PAYMENT')) {
            return localizationManager.get('errors.paymentError');
        }
        if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
            return localizationManager.get('errors.networkErrorShort');
        }
        return localizationManager.get('errors.genericErrorShort');
    }

    /** Show a Telegram popup with an error message. */
    showError(message) {
        try {
            if (window.Telegram?.WebApp?.showPopup) {
                window.Telegram.WebApp.showPopup({
                    title: localizationManager.get('errors.errorTitle'),
                    message,
                    buttons: [{ type: 'ok' }]
                });
            } else {
                alert(message);
            }
        } catch (e) {
            this.logger.error('Failed to show error popup:', e);
            alert(message);
        }
    }
}

/**
 * Telegram-specific error handling.
 */
export class TGErrorHandler {
    constructor(logger) {
        this.logger = logger;
    }

    /** Handle and log an error, returning a user-friendly message. */
    handle(context, error) {
        this.logger.error(`[TG ${context}]`, error);

        if (error?.message?.includes('PAYMENT')) {
            return 'Ошибка оплаты. Попробуйте позже.';
        }
        if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
            return 'Ошибка сети. Проверьте соединение.';
        }
        return 'Произошла ошибка. Попробуйте позже.';
    }

    /** Show a Telegram popup with an error message. */
    showError(message) {
        try {
            if (window.Telegram?.WebApp?.showPopup) {
                window.Telegram.WebApp.showPopup({
                    title: 'Ошибка',
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

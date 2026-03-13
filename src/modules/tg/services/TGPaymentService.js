/**
 * TGPaymentService — handles Telegram Stars and Tochka payment flows.
 */
import { TGConfig } from '../config/TGConfig.js';

export class TGPaymentService {
    constructor(logger, analytics, errorHandler) {
        this.logger = logger;
        this.analytics = analytics;
        this.errorHandler = errorHandler;
    }

    /**
     * Open Telegram Stars invoice.
     * 1. Call backend to create invoice link
     * 2. Open invoice via Telegram.WebApp.openInvoice
     * 3. Return result via callback
     */
    async payWithStars(tgUserId) {
        this.analytics.track(TGConfig.ANALYTICS_EVENTS.paymentAttempted, {
            method: 'telegram_stars',
            user_id: tgUserId
        });

        const config = TGConfig.getPaymentConfig();
        const url = TGConfig.getBackendUrl(TGConfig.CREATE_INVOICE_ENDPOINT);

        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tg_user_id: tgUserId,
                product_id: config.id,
                app_id: TGConfig.APP_ID
            }),
            signal: AbortSignal.timeout(TGConfig.TIMEOUTS.invoiceCreate)
        });

        const data = await resp.json();
        if (!data.success || !data.invoiceLink) {
            throw new Error(data.message || 'Failed to create invoice');
        }

        // Open invoice in Telegram
        return new Promise((resolve, reject) => {
            window.Telegram.WebApp.openInvoice(data.invoiceLink, (status) => {
                this.logger.log('Invoice status:', status);
                if (status === 'paid') {
                    this.analytics.track(TGConfig.ANALYTICS_EVENTS.paymentSuccess, {
                        method: 'telegram_stars',
                        user_id: tgUserId
                    });
                    resolve({ success: true, method: 'stars' });
                } else if (status === 'cancelled') {
                    resolve({ success: false, cancelled: true });
                } else {
                    reject(new Error(`Payment failed with status: ${status}`));
                }
            });
        });
    }

    /**
     * Create Tochka payment (same as web flow but passes tg_user_id).
     * Returns { paymentLink, operationId }.
     */
    async createTochkaPayment(tgUserId) {
        this.analytics.track(TGConfig.ANALYTICS_EVENTS.paymentAttempted, {
            method: 'tochka',
            user_id: tgUserId
        });

        const url = TGConfig.getBackendUrl(TGConfig.TOCHKA_CREATE_PAYMENT_ENDPOINT);

        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                vk_user_id: `tg_${tgUserId}`,
                app_id: TGConfig.APP_ID
            }),
            signal: AbortSignal.timeout(TGConfig.TIMEOUTS.apiRequest)
        });

        const data = await resp.json();
        if (!data.success || !data.paymentLink) {
            throw new Error(data.message || 'Failed to create Tochka payment');
        }

        return { paymentLink: data.paymentLink, operationId: data.operationId };
    }
}

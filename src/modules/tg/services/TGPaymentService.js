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
        // Note: openInvoice callback sometimes doesn't fire — add timeout fallback
        return new Promise((resolve, reject) => {
            let settled = false;
            const settle = (value) => {
                if (settled) return;
                settled = true;
                resolve(value);
            };

            window.Telegram.WebApp.openInvoice(data.invoiceLink, (status) => {
                this.logger.log('Invoice status:', status);
                if (status === 'paid') {
                    this.analytics.track(TGConfig.ANALYTICS_EVENTS.paymentSuccess, {
                        method: 'telegram_stars',
                        user_id: tgUserId
                    });
                    settle({ success: true, method: 'stars' });
                } else if (status === 'cancelled') {
                    settle({ success: false, cancelled: true });
                } else {
                    settle({ success: false, error: `Payment status: ${status}` });
                }
            });

            // Fallback: if callback doesn't fire in 30s, check purchase status
            setTimeout(async () => {
                if (settled) return;
                this.logger.log('Invoice callback timeout — checking purchase status');
                try {
                    const checkUrl = TGConfig.getBackendUrl(TGConfig.CHECK_PURCHASE_ENDPOINT);
                    const checkResp = await fetch(`${checkUrl}?user_id=tg_${tgUserId}&app_id=${TGConfig.APP_ID}&item_id=${config.id}`);
                    const checkData = await checkResp.json();
                    if (checkData.is_purchased) {
                        this.analytics.track(TGConfig.ANALYTICS_EVENTS.paymentSuccess, {
                            method: 'telegram_stars',
                            user_id: tgUserId,
                            fallback: true
                        });
                        settle({ success: true, method: 'stars' });
                    } else {
                        settle({ success: false, timeout: true });
                    }
                } catch {
                    settle({ success: false, timeout: true });
                }
            }, 30000);
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

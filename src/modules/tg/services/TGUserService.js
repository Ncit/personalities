/**
 * TGUserService — extracts and stores user info from Telegram WebApp initDataUnsafe.
 */
import { TGConfig } from '../config/TGConfig.js';
import localizationManager from '../../../locales/LocalizationManager.js';

export class TGUserService {
    constructor(logger, analytics) {
        this.logger = logger;
        this.analytics = analytics;
        this.userInfo = null;
        this._premiumStatus = false;
    }

    /** Extract user from Telegram initDataUnsafe and store in memory. */
    init() {
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (!tgUser) {
            this.logger.warn('No Telegram user data available (running outside Telegram?)');
            // Try localStorage fallback for ?flavor=tg dev mode
            this._loadFromStorage();
            return;
        }

        this.userInfo = {
            id: String(tgUser.id),
            first_name: tgUser.first_name || '',
            last_name: tgUser.last_name || '',
            username: tgUser.username || '',
            photo_url: tgUser.photo_url || '',
            language_code: tgUser.language_code || 'ru'
        };

        // Set locale: URL ?locale= override takes priority, then Telegram language
        const urlLocale = new URLSearchParams(window.location.search).get('locale');
        const lang = urlLocale || this.userInfo.language_code;
        const supportedLang = (lang === 'ru' || lang === 'en') ? lang : 'ru';
        localizationManager.setLocale(supportedLang);

        // Notify app via global handler
        if (typeof window.handleUserInfo === 'function') {
            window.handleUserInfo({
                id: this.userInfo.id,
                first_name: this.userInfo.first_name,
                last_name: this.userInfo.last_name,
                screen_name: this.userInfo.username,
                photo_100: this.userInfo.photo_url,
                user_type: 'tg_user'
            });
        }

        this.analytics.track(TGConfig.ANALYTICS_EVENTS.userInfoRetrieved, {
            user_id: this.userInfo.id,
            language: this.userInfo.language_code
        });

        this.logger.log('TG user initialized:', this.userInfo.id, this.userInfo.first_name);
    }

    /** Return stored user info. */
    getUserInfo() {
        return this.userInfo;
    }

    /** Return Telegram user ID as string. */
    getUserId() {
        return this.userInfo?.id || null;
    }

    /** Return user's language code. */
    getLanguage() {
        return this.userInfo?.language_code || 'ru';
    }

    /** Check premium status from backend. */
    async checkPremiumStatus() {
        const userId = this.getUserId();
        if (!userId) return false;

        try {
            const url = TGConfig.getBackendUrl(TGConfig.CHECK_PURCHASE_ENDPOINT) +
                `?user_id=tg_${userId}&app_id=${TGConfig.APP_ID}&item_id=mbti_premium`;

            const resp = await fetch(url, { signal: AbortSignal.timeout(TGConfig.TIMEOUTS.premiumCheck) });
            const data = await resp.json();

            this._premiumStatus = data.hasPurchased === true;

            // Update global premium state
            if (this._premiumStatus && window.stateManager) {
                window.stateManager.set('isPremium', true);
                localStorage.setItem(TGConfig.STORAGE_KEYS.premiumStatus, 'true');
                localStorage.setItem(TGConfig.STORAGE_KEYS.premiumTimestamp, Date.now().toString());
            }

            this.analytics.track(TGConfig.ANALYTICS_EVENTS.premiumStatusCheck, {
                is_premium: this._premiumStatus
            });

            return this._premiumStatus;
        } catch (error) {
            this.logger.error('Premium status check failed:', error);
            // Fallback to localStorage
            const cached = localStorage.getItem(TGConfig.STORAGE_KEYS.premiumStatus);
            this._premiumStatus = cached === 'true';
            return this._premiumStatus;
        }
    }

    /** Get cached premium status. */
    getPremiumStatus() {
        return this._premiumStatus;
    }

    /** Store premium status (called after successful payment). */
    storePremiumStatus(status) {
        this._premiumStatus = status;
        localStorage.setItem(TGConfig.STORAGE_KEYS.premiumStatus, String(status));
        localStorage.setItem(TGConfig.STORAGE_KEYS.premiumTimestamp, Date.now().toString());
        if (window.stateManager) {
            window.stateManager.set('isPremium', status);
        }
    }

    /** Load user from localStorage (dev mode fallback). */
    _loadFromStorage() {
        try {
            const saved = localStorage.getItem(TGConfig.STORAGE_KEYS.userData);
            if (saved) {
                this.userInfo = JSON.parse(saved);
                this.logger.log('TG user loaded from localStorage (dev mode)');
            }
        } catch (e) {
            this.logger.warn('Failed to load TG user from localStorage:', e);
        }
    }
}

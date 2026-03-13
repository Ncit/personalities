/**
 * PlatformDetector — thin shared entry point for flavor detection.
 * Returns 'vk' | 'tg' | 'web' and the active platform manager.
 */
export class PlatformDetector {
    static _flavor = null;
    static _manager = null;

    /**
     * Detect and cache the current flavor.
     * Priority:
     *   1. Telegram WebApp initData present (non-empty) → 'tg'
     *   2. URL param ?flavor=tg → 'tg'
     *   3. URL param ?flavor=vk → 'vk'
     *   4. VK Bridge environment → 'vk'
     *   5. Default → 'web'
     */
    static getFlavor() {
        if (this._flavor) return this._flavor;

        // 1. Telegram WebApp SDK injected with initData
        if (window.Telegram?.WebApp?.initData?.length > 0) {
            this._flavor = 'tg';
            return this._flavor;
        }

        const params = new URLSearchParams(window.location.search);

        // 2. Explicit ?flavor=tg (dev/testing)
        if (params.get('flavor') === 'tg') {
            this._flavor = 'tg';
            return this._flavor;
        }

        // 3. Explicit ?flavor=vk
        if (params.get('flavor') === 'vk') {
            this._flavor = 'vk';
            return this._flavor;
        }

        // 4. VK Bridge available
        if (typeof window.vkBridge !== 'undefined') {
            this._flavor = 'vk';
            return this._flavor;
        }

        // 5. Default
        this._flavor = 'web';
        return this._flavor;
    }

    /** Register the active platform manager (called by VKBridgeManager or TGBridgeManager). */
    static setManager(manager) {
        this._manager = manager;
    }

    /** Return the active manager (VKBridgeManager | TGBridgeManager | null). */
    static getManager() {
        return this._manager;
    }

    /** Convenience: true when flavor is 'tg'. */
    static isTelegram() {
        return this.getFlavor() === 'tg';
    }

    /** Convenience: true when flavor is 'vk'. */
    static isVK() {
        return this.getFlavor() === 'vk';
    }

    /** Reset cache (useful for tests). */
    static _reset() {
        this._flavor = null;
        this._manager = null;
    }
}

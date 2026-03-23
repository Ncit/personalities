import { MobileConfig } from '../config/MobileConfig.js';
import { LoggerManager } from '../../core/LoggerManager.js';

export class MobileUserService {
    constructor() {
        this.logger = new LoggerManager().createModuleLogger('MobileUserService');
        this._userInfo = null;
        this._loadFromStorage();
    }

    _loadFromStorage() {
        try {
            const stored = localStorage.getItem(MobileConfig.STORAGE_KEYS.vkUser);
            if (stored) {
                this._userInfo = JSON.parse(stored);
            }
        } catch (e) {
            this.logger.warn('Failed to load VK user from storage:', e);
        }
    }

    _saveToStorage() {
        try {
            if (this._userInfo) {
                localStorage.setItem(
                    MobileConfig.STORAGE_KEYS.vkUser,
                    JSON.stringify(this._userInfo)
                );
            }
        } catch (e) {
            this.logger.warn('Failed to save VK user to storage:', e);
        }
    }

    isAuthenticated() {
        return this._userInfo !== null;
    }

    getUserInfo() {
        return this._userInfo;
    }

    getUserName() {
        if (!this._userInfo) return null;
        return `${this._userInfo.first_name || ''} ${this._userInfo.last_name || ''}`.trim();
    }

    getUserId() {
        return this._userInfo?.id || null;
    }

    /**
     * Start VK ID OAuth flow via Tauri plugin.
     * Opens system browser, waits for deep link callback.
     */
    async authenticate() {
        const invoke = window.__TAURI__?.core?.invoke;
        const addPluginListener = window.__TAURI__?.core?.addPluginListener;
        if (!invoke || !addPluginListener) {
            throw new Error('Tauri runtime not available');
        }

        try {
            this.logger.log('Starting VK auth flow...');

            // Register listener (don't await — it resolves when event fires)
            const resultPromise = new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('VK auth timeout'));
                }, MobileConfig.TIMEOUTS.auth);

                addPluginListener('vk-auth', 'vk-auth-result', (payload) => {
                    clearTimeout(timeout);
                    if (payload.success) {
                        this._userInfo = payload.user;
                        this._saveToStorage();
                        this.logger.log('VK auth successful:', this._userInfo?.id);
                        resolve(this._userInfo);
                    } else {
                        reject(new Error(payload.error || 'VK auth failed'));
                    }
                });
            });

            // Start auth flow immediately (don't wait for listener setup)
            await invoke('plugin:vk-auth|start_vk_auth');

            return resultPromise;
        } catch (error) {
            this.logger.error('VK auth failed:', error);
            throw error;
        }
    }

    logout() {
        this._userInfo = null;
        localStorage.removeItem(MobileConfig.STORAGE_KEYS.vkUser);
        localStorage.removeItem(MobileConfig.STORAGE_KEYS.vkToken);
    }
}

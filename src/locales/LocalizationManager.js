/**
 * Localization Manager
 * Handles multiple languages and provides easy access to localized strings
 */

import { en } from './en.js';
import { ru } from './ru.js';

class LocalizationManager {
    constructor() {
        this.currentLocale = 'ru';
        this.locales = {
            en: en,
            ru: ru
        };
        this.fallbackLocale = 'ru';
    }

    /**
     * Set the current locale
     * @param {string} locale - The locale code (e.g., 'en', 'es', 'fr')
     */
    setLocale(locale) {
        if (this.locales[locale]) {
            this.currentLocale = locale;
            this.updateURLWithLocale(locale);
        } else {
            console.warn(`Locale '${locale}' not found, falling back to '${this.fallbackLocale}'`);
            this.currentLocale = this.fallbackLocale;
        }
    }

    /**
     * Get the current locale
     * @returns {string} The current locale code
     */
    getCurrentLocale() {
        return this.currentLocale;
    }

    /**
     * Get a localized string by key path
     * @param {string} keyPath - The dot-separated key path (e.g., 'errors.initFailed')
     * @param {Object} params - Optional parameters for string interpolation
     * @returns {string} The localized string
     */
    get(keyPath, params = {}) {
        const keys = keyPath.split('.');
        let value = this.locales[this.currentLocale];
        
        // Navigate through the nested object
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                // Fallback to English if key not found
                value = this.getFallback(keyPath);
                break;
            }
        }

        // If value is not a string, fallback to English
        if (typeof value !== 'string') {
            value = this.getFallback(keyPath);
        }

        // Apply parameter interpolation
        return this.interpolate(value, params);
    }

    /**
     * Get fallback string from English locale
     * @param {string} keyPath - The dot-separated key path
     * @returns {string} The fallback string
     */
    getFallback(keyPath) {
        const keys = keyPath.split('.');
        let value = this.locales[this.fallbackLocale];
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return keyPath; // Return the key path if not found
            }
        }

        return typeof value === 'string' ? value : keyPath;
    }

    /**
     * Interpolate parameters into a string
     * @param {string} template - The string template
     * @param {Object} params - The parameters to interpolate
     * @returns {string} The interpolated string
     */
    interpolate(template, params) {
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    /**
     * Get locale from URL parameter
     * @returns {string} The locale from URL or default
     */
    getLocaleFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('locale') || this.fallbackLocale;
    }

    /**
     * Update URL with current locale
     * @param {string} locale - The locale to set
     */
    updateURLWithLocale(locale) {
        const url = new URL(window.location);
        url.searchParams.set('locale', locale);
        window.history.replaceState({}, '', url);
    }

    /**
     * Initialize locale from URL or browser preference
     */
    initialize() {
        // Try to get locale from URL first
        const urlLocale = this.getLocaleFromURL();
        if (urlLocale && this.locales[urlLocale]) {
            this.setLocale(urlLocale);
        } else {
            // Try to get locale from browser
            const browserLocale = navigator.language.split('-')[0];
            if (this.locales[browserLocale]) {
                this.setLocale(browserLocale);
            } else {
                // Fallback to default
                this.setLocale(this.fallbackLocale);
            }
        }
    }

    /**
     * Add a new locale
     * @param {string} localeCode - The locale code
     * @param {Object} localeData - The locale data object
     */
    addLocale(localeCode, localeData) {
        this.locales[localeCode] = localeData;
    }

    /**
     * Get all available locales
     * @returns {Array} Array of available locale codes
     */
    getAvailableLocales() {
        return Object.keys(this.locales);
    }

    /**
     * Get locale data for a specific locale
     * @param {string} localeCode - The locale code
     * @returns {Object} The locale data object
     */
    getLocaleData(localeCode) {
        return this.locales[localeCode] || this.locales[this.fallbackLocale];
    }
}

// Create and export singleton instance
const localizationManager = new LocalizationManager();

export default localizationManager; 
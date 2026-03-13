/**
 * TGAnalyticsService — Firebase analytics with tg_ prefix events.
 */
import { firebaseAnalytics } from '../../../config/firebase.js';

export class TGAnalyticsService {
    constructor(logger) {
        this.logger = logger;
    }

    /** Track a named event with optional properties. */
    track(eventName, properties = {}) {
        try {
            if (firebaseAnalytics && firebaseAnalytics.logEvent) {
                firebaseAnalytics.logEvent(eventName, {
                    ...properties,
                    platform: 'telegram'
                });
            }
        } catch (error) {
            this.logger.warn('Analytics track failed:', eventName, error);
        }
    }
}

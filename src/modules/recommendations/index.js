/**
 * Recommendations Module - Main export file
 * Provides access to all recommendation system components
 */

// Import all recommendation system components
import { ResponseAnalyzer } from './ResponseAnalyzer.js';
import { RecommendationEngine } from './RecommendationEngine.js';
import { ContentManager } from '../content/ContentManager.js';
import { UserProfileManager } from '../profiles/UserProfileManager.js';

// Import enhanced Phase 2B modules
import { GoalTracker } from '../profiles/GoalTracker.js';
import { EnhancedResponseAnalyzer } from './EnhancedResponseAnalyzer.js';
import { EnhancedContentManager } from '../content/EnhancedContentManager.js';
import { EnhancedRecommendationsManager } from './EnhancedRecommendationsManager.js';

/**
 * RecommendationsManager - Orchestrates all recommendation functionality
 * Provides a unified interface for the recommendation system
 */
class RecommendationsManager {
    constructor() {
        this.responseAnalyzer = new ResponseAnalyzer();
        this.recommendationEngine = new RecommendationEngine(this.responseAnalyzer);
        this.contentManager = new ContentManager();
        this.userProfileManager = new UserProfileManager();
        this.currentLanguage = 'en'; // Default language
        
        // Connect components
        this.recommendationEngine.setContentManager(this.contentManager);
    }

    /**
     * Set the current language for the entire recommendation system
     * @param {String} language - Language code ('en' or 'ru')
     */
    setLanguage(language) {
        this.currentLanguage = language;
        
        // Update language in all components
        this.recommendationEngine.setLanguage(language);
        this.contentManager.setLanguage(language);
        
        console.log(`🌍 Recommendations system language set to: ${language}`);
    }

    /**
     * Get the current language setting
     * @returns {String} Current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Initialize the recommendation system
     * @param {Object} options - Initialization options
     * @returns {Promise<Object>} Initialization status
     */
    async initialize(options = {}) {
        try {
            // Initialize all components
            await this.userProfileManager.initialize();
            await this.contentManager.initializeContentDatabase();
            
            // Set language if specified
            if (options.language) {
                this.setLanguage(options.language);
            }
            
            console.log('✅ Recommendations system initialized successfully');
            return {
                status: 'success',
                components: {
                    responseAnalyzer: true,
                    recommendationEngine: true,
                    contentManager: true,
                    userProfileManager: true
                },
                language: this.currentLanguage
            };
        } catch (error) {
            console.error('❌ Failed to initialize recommendations system:', error);
            return {
                status: 'error',
                error: error.message
            };
        }
    }

    /**
     * Generate comprehensive recommendations for a user
     * @param {Object} quizData - Complete quiz data
     * @param {Object} userProfile - User profile and preferences
     * @returns {Object} Complete recommendation package
     */
    generateRecommendations(quizData, userProfile = {}) {
        try {
            // Merge with existing profile if available
            const existingProfile = this.userProfileManager.getProfile(userProfile.id || 'default');
            const mergedProfile = existingProfile ? 
                this.userProfileManager.mergeProfile(existingProfile, userProfile) : 
                userProfile;

            // Generate recommendations
            const recommendations = this.recommendationEngine.generateRecommendations(quizData, mergedProfile);
            
            // Update user profile with quiz results
            if (quizData.results) {
                this.userProfileManager.mergeQuizResults(mergedProfile.id || 'default', quizData.results);
            }
            
            return recommendations;
        } catch (error) {
            console.error('❌ Error generating recommendations:', error);
            return {
                error: error.message,
                status: 'error'
            };
        }
    }

    /**
     * Get content recommendations based on user profile
     * @param {Object} userProfile - User profile
     * @param {String} contentType - Type of content to search
     * @param {Object} filters - Additional filters
     * @returns {Array} Filtered content recommendations
     */
    getContentRecommendations(userProfile, contentType = null, filters = {}) {
        try {
            if (contentType) {
                return this.contentManager.getContentRecommendations(contentType, userProfile, filters);
            } else {
                return this.contentManager.getAllContent();
            }
        } catch (error) {
            console.error('❌ Error getting content recommendations:', error);
            return [];
        }
    }

    /**
     * Search content across all types
     * @param {String} query - Search query
     * @param {Object} filters - Search filters
     * @returns {Array} Search results
     */
    searchContent(query, filters = {}) {
        try {
            return this.contentManager.searchContent(query, filters);
        } catch (error) {
            console.error('❌ Error searching content:', error);
            return [];
        }
    }

    /**
     * Update user profile and preferences
     * @param {String} userId - User identifier
     * @param {Object} updates - Profile updates
     * @returns {Object} Updated profile
     */
    updateUserProfile(userId, updates) {
        try {
            return this.userProfileManager.updateProfile(userId, updates);
        } catch (error) {
            console.error('❌ Error updating user profile:', error);
            return null;
        }
    }

    /**
     * Get user profile
     * @param {String} userId - User identifier
     * @returns {Object} User profile
     */
    getUserProfile(userId) {
        try {
            return this.userProfileManager.getProfile(userId);
        } catch (error) {
            console.error('❌ Error getting user profile:', error);
            return null;
        }
    }

    /**
     * Get system statistics
     * @returns {Object} System statistics
     */
    getSystemStats() {
        try {
            return {
                recommendationEngine: this.recommendationEngine.getStats(),
                contentManager: this.contentManager.getContentStats(),
                userProfileManager: this.userProfileManager.getStats(),
                language: this.currentLanguage,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('❌ Error getting system stats:', error);
            return {
                error: error.message,
                status: 'error'
            };
        }
    }

    /**
     * Export user data
     * @param {String} userId - User identifier
     * @returns {Object} Exported user data
     */
    exportUserData(userId) {
        try {
            const profile = this.userProfileManager.exportProfile(userId);
            const recommendations = this.getUserRecommendations(userId);
            
            return {
                profile,
                recommendations,
                exportDate: new Date().toISOString(),
                language: this.currentLanguage
            };
        } catch (error) {
            console.error('❌ Error exporting user data:', error);
            return null;
        }
    }

    /**
     * Import user data
     * @param {String} userId - User identifier
     * @param {Object} userData - User data to import
     * @returns {Boolean} Success status
     */
    importUserData(userId, userData) {
        try {
            if (userData.profile) {
                this.userProfileManager.importProfile(userId, userData.profile);
            }
            
            // Set language if specified in imported data
            if (userData.language) {
                this.setLanguage(userData.language);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error importing user data:', error);
            return false;
        }
    }

    /**
     * Get user's recommendation history
     * @param {String} userId - User identifier
     * @returns {Array} Recommendation history
     */
    getUserRecommendations(userId) {
        try {
            const profile = this.userProfileManager.getProfile(userId);
            return profile ? profile.recommendationHistory || [] : [];
        } catch (error) {
            console.error('❌ Error getting user recommendations:', error);
            return [];
        }
    }

    /**
     * Clear user data
     * @param {String} userId - User identifier
     * @returns {Boolean} Success status
     */
    clearUserData(userId) {
        try {
            this.userProfileManager.clearCache();
            return true;
        } catch (error) {
            console.error('❌ Error clearing user data:', error);
            return false;
        }
    }
}

// Export the main manager and individual components
export {
    RecommendationsManager,
    ResponseAnalyzer,
    RecommendationEngine,
    ContentManager,
    UserProfileManager,
    // Enhanced Phase 2B components
    GoalTracker,
    EnhancedResponseAnalyzer,
    EnhancedContentManager,
    EnhancedRecommendationsManager
};

// Make available globally if in browser environment
if (typeof window !== 'undefined') {
    window.RecommendationsManager = RecommendationsManager;
    window.ResponseAnalyzer = ResponseAnalyzer;
    window.RecommendationEngine = RecommendationEngine;
    window.ContentManager = ContentManager;
    window.UserProfileManager = UserProfileManager;
    // Enhanced Phase 2B components
    window.GoalTracker = GoalTracker;
    window.EnhancedResponseAnalyzer = EnhancedResponseAnalyzer;
    window.EnhancedContentManager = EnhancedContentManager;
    window.EnhancedRecommendationsManager = EnhancedRecommendationsManager;
}

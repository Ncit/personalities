/**
 * Recommendations Module - Main export file
 * Provides access to all recommendation system components
 */

// Import core components
import { ResponseAnalyzer } from './ResponseAnalyzer.js';
import { RecommendationEngine } from './RecommendationEngine.js';

// Import content management
import { ContentManager } from '../content/ContentManager.js';

// Import profile management (will be created next)
import { UserProfileManager } from '../profiles/UserProfileManager.js';

/**
 * Main Recommendations Manager Class
 * Orchestrates all recommendation functionality
 */
class RecommendationsManager {
    constructor() {
        this.responseAnalyzer = new ResponseAnalyzer();
        this.recommendationEngine = new RecommendationEngine();
        this.contentManager = new ContentManager();
        this.userProfileManager = new UserProfileManager();
        
        // Connect components
        this.recommendationEngine.setContentManager(this.contentManager);
    }

    /**
     * Initialize the recommendations system
     * @param {Object} options - Initialization options
     * @returns {Promise} Initialization promise
     */
    async initialize(options = {}) {
        try {
            // Initialize user profile manager
            await this.userProfileManager.initialize(options.userProfile);
            
            // Initialize content manager
            await this.contentManager.initialize(options.content);
            
            console.log('✅ Recommendations system initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize recommendations system:', error);
            return false;
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
            // Merge with stored user profile
            const completeProfile = this.userProfileManager.mergeProfile(userProfile);
            
            // Generate recommendations
            const recommendations = this.recommendationEngine.generateRecommendations(quizData, completeProfile);
            
            // Enhance with content recommendations
            recommendations.content = this.contentManager.getContentRecommendations(completeProfile);
            
            return recommendations;
        } catch (error) {
            console.error('❌ Error generating recommendations:', error);
            return {
                error: 'Failed to generate recommendations',
                message: error.message,
                timestamp: Date.now()
            };
        }
    }

    /**
     * Get user profile information
     * @param {String} userId - User identifier
     * @returns {Object} User profile data
     */
    getUserProfile(userId) {
        return this.userProfileManager.getProfile(userId);
    }

    /**
     * Update user profile and preferences
     * @param {String} userId - User identifier
     * @param {Object} updates - Profile updates
     * @returns {Object} Updated profile
     */
    updateUserProfile(userId, updates) {
        return this.userProfileManager.updateProfile(userId, updates);
    }

    /**
     * Search for specific content
     * @param {String} query - Search query
     * @param {Array} categories - Content categories to search
     * @returns {Object} Search results
     */
    searchContent(query, categories = []) {
        return this.contentManager.searchContent(query, categories);
    }

    /**
     * Get content by ID
     * @param {String} contentId - Content identifier
     * @returns {Object|null} Content item
     */
    getContentById(contentId) {
        return this.contentManager.getContentById(contentId);
    }

    /**
     * Get system statistics
     * @returns {Object} System statistics
     */
    getSystemStats() {
        return {
            recommendations: this.recommendationEngine.getStats(),
            content: this.contentManager.getContentStats(),
            profiles: this.userProfileManager.getStats(),
            timestamp: Date.now()
        };
    }

    /**
     * Clear all caches
     */
    clearCaches() {
        this.responseAnalyzer.clearCache();
        this.contentManager.clearCache();
        this.userProfileManager.clearCache();
        console.log('🧹 All caches cleared');
    }
}

// Export individual components
export { ResponseAnalyzer } from './ResponseAnalyzer.js';
export { RecommendationEngine } from './RecommendationEngine.js';
export { ContentManager } from '../content/ContentManager.js';
export { UserProfileManager } from '../profiles/UserProfileManager.js';

// Export main manager
export { RecommendationsManager };

// Export default instance
export default new RecommendationsManager();

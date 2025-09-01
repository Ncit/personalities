/**
 * EnhancedRecommendationsManager - Orchestrates Phase 2B enhanced recommendation system
 * Integrates GoalTracker, EnhancedContentManager, and EnhancedResponseAnalyzer
 */
class EnhancedRecommendationsManager {
    constructor() {
        // Core components
        this.responseAnalyzer = new ResponseAnalyzer();
        this.recommendationEngine = new RecommendationEngine(this.responseAnalyzer);
        this.contentManager = new ContentManager();
        this.userProfileManager = new UserProfileManager();
        this.goalTracker = new GoalTracker();
        
        // Enhanced components
        this.enhancedResponseAnalyzer = new EnhancedResponseAnalyzer();
        this.enhancedContentManager = new EnhancedContentManager();
        
        // System state
        this.currentLanguage = 'en';
        this.currentUser = null;
        this.initialized = false;
        
        // Performance tracking
        this.performanceMetrics = {
            recommendationGenerationTime: 0,
            cacheHitRate: 0,
            userSatisfactionScore: 0,
            totalRecommendationsGenerated: 0
        };
    }

    /**
     * Initialize the enhanced recommendation system
     * @param {Object} options - Initialization options
     */
    async initialize(options = {}) {
        try {
            console.log('🚀 Initializing Enhanced Recommendations Manager...');
            
            // Set language across all components
            if (options.language) {
                this.setLanguage(options.language);
            }
            
            // Initialize all components
            await this.initializeComponents();
            
            // Load user data if provided
            if (options.userId) {
                await this.loadUserData(options.userId);
            }
            
            this.initialized = true;
            console.log('✅ Enhanced Recommendations Manager initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Enhanced Recommendations Manager:', error);
            throw error;
        }
    }

    /**
     * Initialize all system components
     */
    async initializeComponents() {
        // Initialize content databases
        this.contentManager.initializeContentDatabase();
        this.enhancedContentManager.initializeEnhancedContentDatabase();
        
        // Initialize user profile manager
        await this.userProfileManager.initialize();
        
        // Initialize goal tracker
        this.goalTracker.setLanguage(this.currentLanguage);
        
        console.log('📚 All components initialized');
    }

    /**
     * Set system language
     * @param {String} language - Language code ('en' or 'ru')
     */
    setLanguage(language) {
        this.currentLanguage = language;
        
        // Update language across all components
        this.responseAnalyzer.setLanguage(language);
        this.recommendationEngine.setLanguage(language);
        this.contentManager.setLanguage(language);
        this.userProfileManager.setLanguage(language);
        this.enhancedResponseAnalyzer.setLanguage(language);
        this.enhancedContentManager.setLanguage(language);
        this.goalTracker.setLanguage(language);
        
        console.log(`🌍 System language set to: ${language}`);
    }

    /**
     * Load user data and initialize user-specific components
     * @param {String} userId - User identifier
     */
    async loadUserData(userId) {
        this.currentUser = userId;
        
        // Load user profile
        await this.userProfileManager.setCurrentUser(userId);
        
        // Load user goals
        this.goalTracker.loadGoalsFromStorage(userId);
        
        console.log(`👤 User data loaded for: ${userId}`);
    }

    /**
     * Generate comprehensive recommendations using enhanced analysis
     * @param {Object} quizData - Complete quiz data
     * @param {Object} options - Recommendation options
     * @returns {Object} Comprehensive recommendations
     */
    async generateEnhancedRecommendations(quizData, options = {}) {
        const startTime = performance.now();
        
        try {
            console.log('🎯 Generating enhanced recommendations...');
            
            // Perform enhanced analysis
            const enhancedAnalysis = this.enhancedResponseAnalyzer.analyzeUserResponses(quizData);
            
            // Generate traditional recommendations
            const traditionalRecommendations = this.recommendationEngine.generateRecommendations(quizData);
            
            // Generate goal recommendations
            const goalRecommendations = await this.generateGoalRecommendations(quizData, enhancedAnalysis);
            
            // Generate content recommendations
            const contentRecommendations = await this.generateContentRecommendations(quizData, enhancedAnalysis);
            
            // Generate personalized insights
            const personalizedInsights = this.generatePersonalizedInsights(enhancedAnalysis);
            
            // Combine all recommendations
            const comprehensiveRecommendations = {
                // Enhanced analysis results
                analysis: enhancedAnalysis,
                
                // Traditional recommendations - fix the mapping
                immediateActions: traditionalRecommendations.recommendations?.immediate || [],
                shortTermGoals: traditionalRecommendations.recommendations?.shortTerm || [],
                longTermDevelopment: traditionalRecommendations.recommendations?.longTerm || [],
                
                // Enhanced recommendations
                goalRecommendations: goalRecommendations,
                contentRecommendations: contentRecommendations,
                personalizedInsights: personalizedInsights,
                
                // System metadata
                generatedAt: new Date().toISOString(),
                language: this.currentLanguage,
                userId: this.currentUser,
                version: '2.0.0'
            };
            
            // Update performance metrics
            const endTime = performance.now();
            this.performanceMetrics.recommendationGenerationTime = endTime - startTime;
            this.performanceMetrics.totalRecommendationsGenerated++;
            
            console.log(`✅ Enhanced recommendations generated in ${this.performanceMetrics.recommendationGenerationTime.toFixed(2)}ms`);
            
            return comprehensiveRecommendations;
            
        } catch (error) {
            console.error('❌ Failed to generate enhanced recommendations:', error);
            throw error;
        }
    }

    /**
     * Generate goal recommendations based on analysis
     * @param {Object} quizData - Quiz data
     * @param {Object} analysis - Enhanced analysis results
     * @returns {Array} Goal recommendations
     */
    async generateGoalRecommendations(quizData, analysis) {
        if (!this.currentUser) {
            return [];
        }
        
        try {
            // Get user profile
            const userProfile = this.userProfileManager.getProfile(this.currentUser);
            
            // Generate goal recommendations
            const goalRecommendations = this.goalTracker.generateGoalRecommendations(this.currentUser, userProfile);
            
            // Filter based on analysis insights
            const filteredRecommendations = goalRecommendations.filter(goal => {
                // Filter based on growth opportunities
                const growthAreas = analysis.growthOpportunities || [];
                return growthAreas.some(area => 
                    goal.category === area.area
                );
            });
            
            return filteredRecommendations.slice(0, 5); // Return top 5
            
        } catch (error) {
            console.error('Error generating goal recommendations:', error);
            return [];
        }
    }

    /**
     * Generate content recommendations based on analysis
     * @param {Object} quizData - Quiz data
     * @param {Object} analysis - Enhanced analysis results
     * @returns {Object} Content recommendations by category
     */
    async generateContentRecommendations(quizData, analysis) {
        try {
            const userProfile = this.userProfileManager.getProfile(this.currentUser);
            const contentRecommendations = {};
            
            // Get recommendations for each content type
            const contentTypes = ['books', 'courses', 'activities', 'tools', 'articles', 'podcasts', 'videos', 'apps', 'communities'];
            
            for (const contentType of contentTypes) {
                const recommendations = this.enhancedContentManager.getContentRecommendations(userProfile, {
                    limit: 3,
                    category: contentType,
                    mbtiType: quizData.results?.personalityType
                });
                
                if (recommendations.length > 0) {
                    contentRecommendations[contentType] = recommendations;
                }
            }
            
            return contentRecommendations;
            
        } catch (error) {
            console.error('Error generating content recommendations:', error);
            return {};
        }
    }

    /**
     * Generate personalized insights based on enhanced analysis
     * @param {Object} analysis - Enhanced analysis results
     * @returns {Object} Personalized insights
     */
    generatePersonalizedInsights(analysis) {
        return {
            personalityInsights: analysis.personalityInsights || {},
            communicationStyle: analysis.communicationStyle || {},
            leadershipPotential: analysis.leadershipPotential || {},
            teamDynamics: analysis.teamDynamics || {},
            cognitiveStyle: analysis.cognitiveStyle || {},
            emotionalIntelligence: analysis.emotionalIntelligence || {},
            motivationFactors: analysis.motivationFactors || {},
            stressResilience: analysis.stressResilience || {},
            growthOpportunities: analysis.growthOpportunities || [],
            developmentPriorities: this.calculateDevelopmentPriorities(analysis)
        };
    }

    /**
     * Calculate development priorities based on analysis
     * @param {Object} analysis - Enhanced analysis results
     * @returns {Array} Development priorities
     */
    calculateDevelopmentPriorities(analysis) {
        const priorities = [];
        
        // Analyze growth opportunities
        if (analysis.growthOpportunities) {
            analysis.growthOpportunities.forEach(opportunity => {
                priorities.push({
                    area: opportunity.area,
                    priority: opportunity.priority,
                    description: opportunity.description,
                    estimatedImpact: this.calculateImpactScore(opportunity),
                    estimatedEffort: this.calculateEffortScore(opportunity)
                });
            });
        }
        
        // Sort by priority and impact
        return priorities.sort((a, b) => {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return b.estimatedImpact - a.estimatedImpact;
        });
    }

    /**
     * Calculate impact score for development opportunity
     * @param {Object} opportunity - Development opportunity
     * @returns {Number} Impact score (0-1)
     */
    calculateImpactScore(opportunity) {
        const priorityScores = { 'high': 0.9, 'medium': 0.6, 'low': 0.3 };
        return priorityScores[opportunity.priority] || 0.5;
    }

    /**
     * Calculate effort score for development opportunity
     * @param {Object} opportunity - Development opportunity
     * @returns {Number} Effort score (0-1)
     */
    calculateEffortScore(opportunity) {
        const difficultyScores = { 'beginner': 0.3, 'intermediate': 0.6, 'advanced': 0.9 };
        return difficultyScores[opportunity.difficulty] || 0.5;
    }

    // Goal Management Methods

    /**
     * Create a new goal for the current user
     * @param {Object} goalData - Goal information
     * @returns {Object} Created goal
     */
    createGoal(goalData) {
        if (!this.currentUser) {
            throw new Error('No current user set');
        }
        
        return this.goalTracker.createGoal(this.currentUser, goalData);
    }

    /**
     * Update goal progress
     * @param {String} goalId - Goal identifier
     * @param {Number} progress - Progress percentage
     * @param {String} note - Progress note
     * @returns {Object} Updated goal
     */
    updateGoalProgress(goalId, progress, note = '') {
        return this.goalTracker.updateGoalProgress(goalId, progress, note);
    }

    /**
     * Get user's goals
     * @param {String} status - Filter by status
     * @returns {Array} User's goals
     */
    getUserGoals(status = null) {
        if (!this.currentUser) {
            return [];
        }
        
        return this.goalTracker.getUserGoals(this.currentUser, status);
    }

    /**
     * Get user's development statistics
     * @returns {Object} Development statistics
     */
    getUserDevelopmentStats() {
        if (!this.currentUser) {
            return {};
        }
        
        return this.goalTracker.getUserDevelopmentStats(this.currentUser);
    }

    // Content Management Methods

    /**
     * Search enhanced content
     * @param {String} query - Search query
     * @param {Object} filters - Search filters
     * @returns {Array} Search results
     */
    searchContent(query, filters = {}) {
        return this.enhancedContentManager.searchContent(query, filters);
    }

    /**
     * Get content by ID
     * @param {String} contentId - Content identifier
     * @returns {Object} Content item
     */
    getContentById(contentId) {
        return this.enhancedContentManager.getContentById(contentId);
    }

    /**
     * Get content statistics
     * @returns {Object} Content statistics
     */
    getContentStats() {
        return this.enhancedContentManager.getContentStats();
    }

    // User Profile Management Methods

    /**
     * Update user profile
     * @param {Object} profileData - Profile data
     * @returns {Object} Updated profile
     */
    updateUserProfile(profileData) {
        if (!this.currentUser) {
            throw new Error('No current user set');
        }
        
        return this.userProfileManager.updateProfile(this.currentUser, profileData);
    }

    /**
     * Get user profile
     * @returns {Object} User profile
     */
    getUserProfile() {
        if (!this.currentUser) {
            return null;
        }
        
        return this.userProfileManager.getProfile(this.currentUser);
    }

    // System Management Methods

    /**
     * Get system statistics
     * @returns {Object} System statistics
     */
    getSystemStats() {
        return {
            performance: this.performanceMetrics,
            content: this.enhancedContentManager.getContentStats(),
            goals: this.goalTracker.getStats(),
            analysis: this.enhancedResponseAnalyzer.getCacheStats(),
            language: this.currentLanguage,
            initialized: this.initialized,
            currentUser: this.currentUser,
            timestamp: Date.now()
        };
    }

    /**
     * Clear all user data
     * @param {String} userId - User identifier
     */
    clearUserData(userId) {
        this.userProfileManager.clearCache();
        this.goalTracker.clearUserGoals(userId);
        this.enhancedResponseAnalyzer.clearCache();
        
        console.log(`🧹 Cleared all data for user: ${userId}`);
    }

    /**
     * Export user data
     * @param {String} userId - User identifier
     * @returns {Object} User data export
     */
    exportUserData(userId) {
        return {
            profile: this.userProfileManager.exportProfile(userId),
            goals: this.goalTracker.getUserGoals(userId),
            developmentStats: this.goalTracker.getUserDevelopmentStats(userId),
            exportedAt: new Date().toISOString(),
            version: '2.0.0'
        };
    }

    /**
     * Import user data
     * @param {String} userId - User identifier
     * @param {Object} userData - User data to import
     */
    importUserData(userId, userData) {
        if (userData.profile) {
            this.userProfileManager.importProfile(userId, userData.profile);
        }
        
        if (userData.goals) {
            userData.goals.forEach(goal => {
                this.goalTracker.createGoal(userId, goal);
            });
        }
        
        console.log(`📥 Imported data for user: ${userId}`);
    }

    /**
     * Get current language
     * @returns {String} Current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Check if system is initialized
     * @returns {Boolean} Initialization status
     */
    isInitialized() {
        return this.initialized;
    }

    /**
     * Get current user
     * @returns {String} Current user ID
     */
    getCurrentUser() {
        return this.currentUser;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedRecommendationsManager;
} else if (typeof window !== 'undefined') {
    window.EnhancedRecommendationsManager = EnhancedRecommendationsManager;
}

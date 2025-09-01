/**
 * UserProfileManager - Manages user profiles and preferences for recommendations
 * Handles profile storage, updates, and merging with quiz data
 */
class UserProfileManager {
    constructor() {
        this.profiles = new Map();
        this.defaultProfile = this.createDefaultProfile();
        this.storageKey = 'mbti_user_profiles';
        this.currentUserId = null;
        this.currentLanguage = 'en'; // Default language
    }

    /**
     * Set the current language for user profiles
     * @param {String} language - Language code ('en' or 'ru')
     */
    setLanguage(language) {
        this.currentLanguage = language;
        console.log(`🌍 UserProfileManager language set to: ${language}`);
    }

    /**
     * Create a default user profile template
     * @returns {Object} Default profile structure
     */
    createDefaultProfile() {
        return {
            id: null,
            mbtiType: null,
            preferences: {
                learningStyle: 'balanced',
                preferredDifficulty: 'beginner',
                timeConstraints: {
                    maxTimePerSession: 60, // minutes
                    preferredSessionLength: 30, // minutes
                    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                },
                contentPreferences: {
                    preferredFormats: ['activities', 'courses', 'books'],
                    avoidFormats: [],
                    language: 'en'
                }
            },
            goals: [],
            interests: [],
            developmentHistory: [],
            quizResults: [],
            lastUpdated: Date.now()
        };
    }

    /**
     * Initialize the profile manager
     * @param {Object} initialProfile - Initial profile data
     * @returns {Promise} Initialization promise
     */
    async initialize(initialProfile = {}) {
        try {
            // Load existing profiles from storage
            await this.loadProfilesFromStorage();
            
            // Set initial profile if provided
            if (initialProfile && initialProfile.id) {
                this.setCurrentUser(initialProfile.id);
                await this.updateProfile(initialProfile.id, initialProfile);
            }
            
            console.log('✅ UserProfileManager initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize UserProfileManager:', error);
            return false;
        }
    }

    /**
     * Set the current active user
     * @param {String} userId - User identifier
     */
    setCurrentUser(userId) {
        this.currentUserId = userId;
        if (!this.profiles.has(userId)) {
            this.profiles.set(userId, this.createDefaultProfile());
        }
    }

    /**
     * Get or create a user profile
     * @param {String} userId - User identifier
     * @returns {Object} User profile
     */
    getProfile(userId) {
        if (!this.profiles.has(userId)) {
            const newProfile = this.createDefaultProfile();
            newProfile.id = userId;
            this.profiles.set(userId, newProfile);
        }
        return this.profiles.get(userId);
    }

    /**
     * Update user profile with new information
     * @param {String} userId - User identifier
     * @param {Object} updates - Profile updates
     * @returns {Object} Updated profile
     */
    updateProfile(userId, updates) {
        const profile = this.getProfile(userId);
        
        // Deep merge updates
        const updatedProfile = this.deepMerge(profile, updates);
        updatedProfile.lastUpdated = Date.now();
        
        this.profiles.set(userId, updatedProfile);
        
        // Save to storage
        this.saveProfilesToStorage();
        
        return updatedProfile;
    }

    /**
     * Merge quiz results with user profile
     * @param {String} userId - User identifier
     * @param {Object} quizData - Quiz results and data
     * @returns {Object} Updated profile with quiz data
     */
    mergeQuizResults(userId, quizData) {
        const profile = this.getProfile(userId);
        
        // Extract MBTI type if available
        if (quizData.personalityType && !profile.mbtiType) {
            profile.mbtiType = quizData.personalityType;
        }
        
        // Add quiz results to history
        const quizResult = {
            id: `quiz_${Date.now()}`,
            timestamp: Date.now(),
            personalityType: quizData.personalityType,
            dimensions: quizData.dimensions,
            confidence: quizData.confidence,
            totalQuestions: quizData.totalQuestions || 61,
            completionTime: quizData.totalTime || 0
        };
        
        profile.quizResults.push(quizResult);
        
        // Update development history based on quiz results
        this.updateDevelopmentHistory(profile, quizData);
        
        // Update preferences based on quiz behavior
        this.updatePreferencesFromQuiz(profile, quizData);
        
        // Save updated profile
        this.updateProfile(userId, profile);
        
        return profile;
    }

    /**
     * Update development history based on quiz results
     * @param {Object} profile - User profile
     * @param {Object} quizData - Quiz data
     */
    updateDevelopmentHistory(profile, quizData) {
        const dimensions = quizData.dimensions || {};
        const developmentAreas = [];
        
        // Identify development areas based on confidence
        Object.entries(dimensions).forEach(([dimension, data]) => {
            const confidence = data.confidence || 0;
            if (confidence < 0.6) {
                developmentAreas.push({
                    dimension,
                    area: this.mapDimensionToDevelopmentArea(dimension),
                    confidence,
                    priority: this.calculatePriority(confidence),
                    identifiedAt: Date.now()
                });
            }
        });
        
        // Add to development history
        if (developmentAreas.length > 0) {
            profile.developmentHistory.push({
                id: `dev_${Date.now()}`,
                timestamp: Date.now(),
                areas: developmentAreas,
                source: 'quiz_analysis'
            });
        }
    }

    /**
     * Update user preferences based on quiz behavior
     * @param {Object} profile - User profile
     * @param {Object} quizData - Quiz data
     */
    updatePreferencesFromQuiz(profile, quizData) {
        const responses = quizData.responses || [];
        
        if (responses.length === 0) return;
        
        // Analyze response patterns
        const responseTimes = responses.map(r => r.responseTime || 0).filter(t => t > 0);
        const avgResponseTime = responseTimes.length > 0 ? 
            responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;
        
        // Update learning style preference
        if (avgResponseTime < 3000) {
            profile.preferences.learningStyle = 'rapid_learner';
        } else if (avgResponseTime > 8000) {
            profile.preferences.learningStyle = 'deliberate_learner';
        }
        
        // Update time constraints
        if (avgResponseTime > 0) {
            profile.preferences.timeConstraints.preferredSessionLength = 
                Math.min(60, Math.max(15, Math.round(avgResponseTime / 1000)));
        }
    }

    /**
     * Merge profile with additional data
     * @param {Object} additionalData - Additional profile data
     * @returns {Object} Merged profile
     */
    mergeProfile(additionalData = {}) {
        if (!this.currentUserId) {
            return this.deepMerge(this.defaultProfile, additionalData);
        }
        
        const currentProfile = this.getProfile(this.currentUserId);
        return this.deepMerge(currentProfile, additionalData);
    }

    /**
     * Add development goal to user profile
     * @param {String} userId - User identifier
     * @param {Object} goal - Development goal
     * @returns {Object} Updated profile
     */
    addDevelopmentGoal(userId, goal) {
        const profile = this.getProfile(userId);
        
        const newGoal = {
            id: `goal_${Date.now()}`,
            ...goal,
            createdAt: Date.now(),
            status: 'active',
            progress: 0
        };
        
        profile.goals.push(newGoal);
        return this.updateProfile(userId, profile);
    }

    /**
     * Update development goal progress
     * @param {String} userId - User identifier
     * @param {String} goalId - Goal identifier
     * @param {Number} progress - Progress percentage (0-100)
     * @returns {Object} Updated profile
     */
    updateGoalProgress(userId, goalId, progress) {
        const profile = this.getProfile(userId);
        const goal = profile.goals.find(g => g.id === goalId);
        
        if (goal) {
            goal.progress = Math.max(0, Math.min(100, progress));
            goal.lastUpdated = Date.now();
            
            if (goal.progress >= 100) {
                goal.status = 'completed';
                goal.completedAt = Date.now();
            }
        }
        
        return this.updateProfile(userId, profile);
    }

    /**
     * Add interest to user profile
     * @param {String} userId - User identifier
     * @param {String} interest - Interest to add
     * @returns {Object} Updated profile
     */
    addInterest(userId, interest) {
        const profile = this.getProfile(userId);
        
        if (!profile.interests.includes(interest)) {
            profile.interests.push(interest);
        }
        
        return this.updateProfile(userId, profile);
    }

    /**
     * Remove interest from user profile
     * @param {String} userId - User identifier
     * @param {String} interest - Interest to remove
     * @returns {Object} Updated profile
     */
    removeInterest(userId, interest) {
        const profile = this.getProfile(userId);
        
        profile.interests = profile.interests.filter(i => i !== interest);
        return this.updateProfile(userId, profile);
    }

    /**
     * Get user's development progress
     * @param {String} userId - User identifier
     * @returns {Object} Development progress summary
     */
    getDevelopmentProgress(userId) {
        const profile = this.getProfile(userId);
        
        const activeGoals = profile.goals.filter(g => g.status === 'active');
        const completedGoals = profile.goals.filter(g => g.status === 'completed');
        
        const totalProgress = activeGoals.length > 0 ? 
            activeGoals.reduce((sum, goal) => sum + goal.progress, 0) / activeGoals.length : 0;
        
        return {
            totalGoals: profile.goals.length,
            activeGoals: activeGoals.length,
            completedGoals: completedGoals.length,
            overallProgress: totalProgress,
            recentActivity: profile.developmentHistory.slice(-5),
            lastQuiz: profile.quizResults[profile.quizResults.length - 1] || null
        };
    }

    /**
     * Get profile statistics
     * @returns {Object} Profile statistics
     */
    getStats() {
        return {
            totalProfiles: this.profiles.size,
            currentUser: this.currentUserId,
            timestamp: Date.now()
        };
    }

    /**
     * Deep merge two objects
     * @param {Object} target - Target object
     * @param {Object} source - Source object
     * @returns {Object} Merged object
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        });
        
        return result;
    }

    /**
     * Map MBTI dimension to development area
     * @param {String} dimension - MBTI dimension
     * @returns {String} Development area
     */
    mapDimensionToDevelopmentArea(dimension) {
        const mapping = {
            'EI': 'Social Skills',
            'SN': 'Information Processing',
            'TF': 'Decision Making',
            'JP': 'Organization & Planning'
        };
        return mapping[dimension] || 'Personal Development';
    }

    /**
     * Calculate priority level based on confidence
     * @param {Number} confidence - Confidence score
     * @returns {String} Priority level
     */
    calculatePriority(confidence) {
        if (confidence < 0.3) return 'critical';
        if (confidence < 0.5) return 'high';
        if (confidence < 0.7) return 'medium';
        return 'low';
    }

    /**
     * Save profiles to local storage
     */
    saveProfilesToStorage() {
        try {
            const profilesData = {};
            this.profiles.forEach((profile, userId) => {
                profilesData[userId] = profile;
            });
            
            localStorage.setItem(this.storageKey, JSON.stringify(profilesData));
        } catch (error) {
            console.error('❌ Failed to save profiles to storage:', error);
        }
    }

    /**
     * Load profiles from local storage
     */
    async loadProfilesFromStorage() {
        try {
            const storedData = localStorage.getItem(this.storageKey);
            if (storedData) {
                const profilesData = JSON.parse(storedData);
                
                Object.entries(profilesData).forEach(([userId, profile]) => {
                    this.profiles.set(userId, profile);
                });
                
                console.log(`📚 Loaded ${this.profiles.size} profiles from storage`);
            }
        } catch (error) {
            console.error('❌ Failed to load profiles from storage:', error);
        }
    }

    /**
     * Clear profile cache
     */
    clearCache() {
        this.profiles.clear();
        console.log('🧹 Profile cache cleared');
    }

    /**
     * Export user profile data
     * @param {String} userId - User identifier
     * @returns {String} JSON string of profile data
     */
    exportProfile(userId) {
        const profile = this.getProfile(userId);
        return JSON.stringify(profile, null, 2);
    }

    /**
     * Import user profile data
     * @param {String} userId - User identifier
     * @param {String} profileData - JSON string of profile data
     * @returns {Object} Imported profile
     */
    importProfile(userId, profileData) {
        try {
            const profile = JSON.parse(profileData);
            profile.id = userId;
            profile.lastUpdated = Date.now();
            
            this.profiles.set(userId, profile);
            this.saveProfilesToStorage();
            
            return profile;
        } catch (error) {
            console.error('❌ Failed to import profile:', error);
            return null;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserProfileManager;
} else if (typeof window !== 'undefined') {
    window.UserProfileManager = UserProfileManager;
}

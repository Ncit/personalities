/**
 * Personalization Engine
 * Manages user personalization and learning preferences
 */

import { getConfig } from './config/AdaptiveConfig.js';

export class PersonalizationEngine {
    constructor() {
        this.learningRate = getConfig('personalization.learningRate');
        this.adaptationThreshold = getConfig('personalization.adaptationThreshold');
        this.userProfiles = new Map();
        this.learningHistory = [];
    }
    
    /**
     * Update user profile based on new responses
     * @param {Object} userProfile - Current user profile
     * @param {Object} response - New user response
     * @param {Array} allResponses - All user responses
     * @returns {Object} Updated user profile
     */
    updateProfile(userProfile, response, allResponses) {
        try {
            // Create profile if it doesn't exist
            if (!userProfile) {
                userProfile = this.createDefaultProfile();
            }
            
            // Update question type preferences
            this.updateQuestionTypePreferences(userProfile, response, allResponses);
            
            // Update difficulty preferences
            this.updateDifficultyPreferences(userProfile, response, allResponses);
            
            // Update response time preferences
            this.updateResponseTimePreferences(userProfile, response, allResponses);
            
            // Update learning patterns
            this.updateLearningPatterns(userProfile, response, allResponses);
            
            // Store updated profile
            this.userProfiles.set(userProfile.id || 'default', userProfile);
            
            // Track learning history
            this.trackLearningHistory(userProfile, response);
            
            return userProfile;
            
        } catch (error) {
            console.error('Error updating user profile:', error);
            return userProfile || this.createDefaultProfile();
        }
    }
    
    /**
     * Create default user profile
     * @returns {Object} Default user profile
     */
    createDefaultProfile() {
        return {
            id: `user_${Date.now()}`,
            preferences: {
                questionTypes: {
                    behavioral: 0.33,
                    situational: 0.33,
                    preference: 0.34
                },
                difficulty: {
                    easy: 0.33,
                    medium: 0.34,
                    hard: 0.33
                },
                responseTime: {
                    fast: 0.33,
                    medium: 0.34,
                    slow: 0.33
                }
            },
            learning: {
                style: 'balanced',
                pace: 'medium',
                engagement: 'moderate'
            },
            history: {
                totalAssessments: 0,
                averageCompletionTime: 0,
                preferredTimes: [],
                responsePatterns: {}
            },
            personalization: {
                lastUpdated: Date.now(),
                adaptationCount: 0,
                learningRate: this.learningRate
            }
        };
    }
    
    /**
     * Update question type preferences
     * @param {Object} userProfile - User profile
     * @param {Object} response - User response
     * @param {Array} allResponses - All responses
     */
    updateQuestionTypePreferences(userProfile, response, allResponses) {
        const questionType = response.questionType || 'behavioral';
        const currentPreferences = userProfile.preferences.questionTypes;
        
        // Calculate engagement score based on response time and consistency
        const engagementScore = this.calculateEngagementScore(response, allResponses);
        
        // Update preference with learning rate
        const currentPreference = currentPreferences[questionType] || 0.33;
        const newPreference = currentPreference + (this.learningRate * (engagementScore - 0.5));
        
        // Normalize preferences to sum to 1
        currentPreferences[questionType] = Math.max(0.1, Math.min(0.8, newPreference));
        this.normalizePreferences(currentPreferences);
    }
    
    /**
     * Update difficulty preferences
     * @param {Object} userProfile - User profile
     * @param {Object} response - User response
     * @param {Array} allResponses - All responses
     */
    updateDifficultyPreferences(userProfile, response, allResponses) {
        const difficulty = response.difficulty || 'medium';
        const currentPreferences = userProfile.preferences.difficulty;
        
        // Calculate performance score based on response accuracy and time
        const performanceScore = this.calculatePerformanceScore(response, allResponses);
        
        // Update preference based on performance
        const currentPreference = currentPreferences[difficulty] || 0.33;
        const newPreference = currentPreference + (this.learningRate * (performanceScore - 0.5));
        
        // Normalize preferences
        currentPreferences[difficulty] = Math.max(0.1, Math.min(0.8, newPreference));
        this.normalizePreferences(currentPreferences);
    }
    
    /**
     * Update response time preferences
     * @param {Object} userProfile - User profile
     * @param {Object} response - User response
     * @param {Array} allResponses - All responses
     */
    updateResponseTimePreferences(userProfile, response, allResponses) {
        const responseTime = response.responseTime || 5000; // Default 5 seconds
        const currentPreferences = userProfile.preferences.responseTime;
        
        // Categorize response time
        let timeCategory = 'medium';
        if (responseTime < 3000) timeCategory = 'fast';
        else if (responseTime > 8000) timeCategory = 'slow';
        
        // Calculate time preference score based on consistency
        const timeScore = this.calculateTimePreferenceScore(response, allResponses);
        
        // Update preference
        const currentPreference = currentPreferences[timeCategory] || 0.33;
        const newPreference = currentPreference + (this.learningRate * (timeScore - 0.5));
        
        // Normalize preferences
        currentPreferences[timeCategory] = Math.max(0.1, Math.min(0.8, newPreference));
        this.normalizePreferences(currentPreferences);
    }
    
    /**
     * Update learning patterns
     * @param {Object} userProfile - User profile
     * @param {Object} response - User response
     * @param {Array} allResponses - All responses
     */
    updateLearningPatterns(userProfile, response, allResponses) {
        // Update learning style based on response patterns
        const learningStyle = this.determineLearningStyle(response, allResponses);
        userProfile.learning.style = learningStyle;
        
        // Update learning pace based on response times
        const learningPace = this.determineLearningPace(response, allResponses);
        userProfile.learning.pace = learningPace;
        
        // Update engagement level
        const engagement = this.determineEngagementLevel(response, allResponses);
        userProfile.learning.engagement = engagement;
        
        // Update history
        this.updateHistory(userProfile, response);
    }
    
    /**
     * Calculate engagement score for a response
     * @param {Object} response - User response
     * @param {Array} allResponses - All responses
     * @returns {number} Engagement score (0-1)
     */
    calculateEngagementScore(response, allResponses) {
        let score = 0.5; // Base score
        
        // Response time factor (optimal range: 2-8 seconds)
        const responseTime = response.responseTime || 5000;
        if (responseTime >= 2000 && responseTime <= 8000) {
            score += 0.2; // Good engagement
        } else if (responseTime < 1000) {
            score -= 0.3; // Too fast, might be random
        } else if (responseTime > 15000) {
            score -= 0.2; // Too slow, might be distracted
        }
        
        // Consistency factor
        const consistency = this.calculateResponseConsistency(response, allResponses);
        score += consistency * 0.3;
        
        return Math.max(0, Math.min(1, score));
    }
    
    /**
     * Calculate performance score for a response
     * @param {Object} response - User response
     * @param {Array} allResponses - All responses
     * @returns {number} Performance score (0-1)
     */
    calculatePerformanceScore(response, allResponses) {
        let score = 0.5; // Base score
        
        // Response time factor (faster responses might indicate better understanding)
        const responseTime = response.responseTime || 5000;
        if (responseTime >= 2000 && responseTime <= 6000) {
            score += 0.2; // Optimal performance range
        } else if (responseTime < 2000) {
            score += 0.1; // Fast but might be rushed
        } else if (responseTime > 10000) {
            score -= 0.1; // Slow, might indicate confusion
        }
        
        // Pattern consistency factor
        const consistency = this.calculateResponseConsistency(response, allResponses);
        score += consistency * 0.3;
        
        return Math.max(0, Math.min(1, score));
    }
    
    /**
     * Calculate time preference score
     * @param {Object} response - User response
     * @param {Array} allResponses - All responses
     * @returns {number} Time preference score (0-1)
     */
    calculateTimePreferenceScore(response, allResponses) {
        const responseTime = response.responseTime || 5000;
        const recentResponses = allResponses.slice(-10);
        
        if (recentResponses.length === 0) return 0.5;
        
        // Calculate time consistency
        const timeVariance = this.calculateTimeVariance(recentResponses);
        const consistency = Math.max(0, 1 - (timeVariance / 10000)); // Normalize variance
        
        return consistency;
    }
    
    /**
     * Calculate response consistency
     * @param {Object} response - User response
     * @param {Array} allResponses - All responses
     * @returns {number} Consistency score (0-1)
     */
    calculateResponseConsistency(response, allResponses) {
        const recentResponses = allResponses.slice(-5);
        
        if (recentResponses.length < 2) return 0.5;
        
        // Check if responses are consistent with user's pattern
        const userPattern = this.extractUserPattern(recentResponses);
        const currentResponse = response.selectedOption;
        
        // Calculate how well current response fits the pattern
        const patternFit = this.calculatePatternFit(currentResponse, userPattern);
        
        return patternFit;
    }
    
    /**
     * Extract user response pattern
     * @param {Array} responses - Recent responses
     * @returns {Object} User pattern
     */
    extractUserPattern(responses) {
        const pattern = {
            preferredOptions: {},
            responseTimes: [],
            dimensions: {}
        };
        
        responses.forEach(response => {
            // Track preferred options
            const option = response.selectedOption;
            pattern.preferredOptions[option] = (pattern.preferredOptions[option] || 0) + 1;
            
            // Track response times
            if (response.responseTime) {
                pattern.responseTimes.push(response.responseTime);
            }
            
            // Track dimension preferences
            const dimension = response.dimension;
            if (dimension) {
                pattern.dimensions[dimension] = (pattern.dimensions[dimension] || 0) + 1;
            }
        });
        
        return pattern;
    }
    
    /**
     * Calculate how well a response fits the user pattern
     * @param {number} response - Current response
     * @param {Object} pattern - User pattern
     * @returns {number} Pattern fit score (0-1)
     */
    calculatePatternFit(response, pattern) {
        const totalResponses = Object.values(pattern.preferredOptions).reduce((sum, count) => sum + count, 0);
        
        if (totalResponses === 0) return 0.5;
        
        const responseCount = pattern.preferredOptions[response] || 0;
        const fitRatio = responseCount / totalResponses;
        
        return fitRatio;
    }
    
    /**
     * Calculate time variance
     * @param {Array} responses - Recent responses
     * @returns {number} Time variance
     */
    calculateTimeVariance(responses) {
        const times = responses.map(r => r.responseTime || 5000);
        const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
        const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length;
        
        return variance;
    }
    
    /**
     * Determine learning style based on responses
     * @param {Object} response - User response
     * @param {Array} allResponses - All responses
     * @returns {string} Learning style
     */
    determineLearningStyle(response, allResponses) {
        const recentResponses = allResponses.slice(-10);
        
        if (recentResponses.length === 0) return 'balanced';
        
        // Analyze response patterns to determine learning style
        const patterns = this.analyzeResponsePatterns(recentResponses);
        
        if (patterns.consistency > 0.8) return 'systematic';
        else if (patterns.adaptability > 0.7) return 'adaptive';
        else if (patterns.exploration > 0.6) return 'exploratory';
        else return 'balanced';
    }
    
    /**
     * Determine learning pace based on responses
     * @param {Object} response - User response
     * @param {Array} allResponses - All responses
     * @returns {string} Learning pace
     */
    determineLearningPace(response, allResponses) {
        const recentResponses = allResponses.slice(-10);
        
        if (recentResponses.length === 0) return 'medium';
        
        const averageTime = recentResponses.reduce((sum, r) => sum + (r.responseTime || 5000), 0) / recentResponses.length;
        
        if (averageTime < 3000) return 'fast';
        else if (averageTime > 8000) return 'slow';
        else return 'medium';
    }
    
    /**
     * Determine engagement level based on responses
     * @param {Object} response - User response
     * @param {Array} allResponses - All responses
     * @returns {string} Engagement level
     */
    determineEngagementLevel(response, allResponses) {
        const recentResponses = allResponses.slice(-10);
        
        if (recentResponses.length === 0) return 'moderate';
        
        const engagementScores = recentResponses.map(r => this.calculateEngagementScore(r, allResponses));
        const averageEngagement = engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length;
        
        if (averageEngagement > 0.7) return 'high';
        else if (averageEngagement < 0.4) return 'low';
        else return 'moderate';
    }
    
    /**
     * Analyze response patterns
     * @param {Array} responses - Recent responses
     * @returns {Object} Pattern analysis
     */
    analyzeResponsePatterns(responses) {
        if (responses.length < 2) {
            return { consistency: 0.5, adaptability: 0.5, exploration: 0.5 };
        }
        
        // Calculate consistency
        const consistency = this.calculateResponseConsistency(responses[responses.length - 1], responses);
        
        // Calculate adaptability (how well user adapts to different question types)
        const questionTypes = responses.map(r => r.questionType || 'behavioral');
        const uniqueTypes = new Set(questionTypes).size;
        const adaptability = uniqueTypes / questionTypes.length;
        
        // Calculate exploration (tendency to try different options)
        const options = responses.map(r => r.selectedOption);
        const uniqueOptions = new Set(options).size;
        const exploration = uniqueOptions / options.length;
        
        return { consistency, adaptability, exploration };
    }
    
    /**
     * Update user history
     * @param {Object} userProfile - User profile
     * @param {Object} response - User response
     */
    updateHistory(userProfile, response) {
        // Update total assessments
        userProfile.history.totalAssessments++;
        
        // Update average completion time
        const currentAvg = userProfile.history.averageCompletionTime;
        const newTime = response.responseTime || 5000;
        const totalAssessments = userProfile.history.totalAssessments;
        
        userProfile.history.averageCompletionTime = 
            ((currentAvg * (totalAssessments - 1)) + newTime) / totalAssessments;
        
        // Update preferred times
        const hour = new Date().get Date().getHours();
        userProfile.history.preferredTimes.push(hour);
        
        // Keep only last 100 preferred times
        if (userProfile.history.preferredTimes.length > 100) {
            userProfile.history.preferredTimes = userProfile.history.preferredTimes.slice(-100);
        }
        
        // Update response patterns
        this.updateResponsePatterns(userProfile.history, response);
    }
    
    /**
     * Update response patterns
     * @param {Object} history - User history
     * @param {Object} response - User response
     */
    updateResponsePatterns(history, response) {
        const dimension = response.dimension;
        const option = response.selectedOption;
        
        if (!history.responsePatterns[dimension]) {
            history.responsePatterns[dimension] = {};
        }
        
        if (!history.responsePatterns[dimension][option]) {
            history.responsePatterns[dimension][option] = 0;
        }
        
        history.responsePatterns[dimension][option]++;
    }
    
    /**
     * Normalize preferences to sum to 1
     * @param {Object} preferences - Preference object
     */
    normalizePreferences(preferences) {
        const total = Object.values(preferences).reduce((sum, value) => sum + value, 0);
        
        if (total > 0) {
            Object.keys(preferences).forEach(key => {
                preferences[key] = preferences[key] / total;
            });
        }
    }
    
    /**
     * Track learning history
     * @param {Object} userProfile - User profile
     * @param {Object} response - User response
     */
    trackLearningHistory(userProfile, response) {
        this.learningHistory.push({
            userId: userProfile.id,
            timestamp: Date.now(),
            response: response,
            profileSnapshot: {
                preferences: { ...userProfile.preferences },
                learning: { ...userProfile.learning }
            }
        });
        
        // Keep only last 1000 entries for memory management
        if (this.learningHistory.length > 1000) {
            this.learningHistory = this.learningHistory.slice(-1000);
        }
    }
    
    /**
     * Get personalization analytics
     * @param {string} userId - User ID
     * @returns {Object} Personalization analytics
     */
    getPersonalizationAnalytics(userId) {
        const userProfile = this.userProfiles.get(userId);
        
        if (!userProfile) {
            return { error: 'User profile not found' };
        }
        
        const userHistory = this.learningHistory.filter(h => h.userId === userId);
        
        return {
            profile: userProfile,
            learningProgress: this.analyzeLearningProgress(userHistory),
            preferenceEvolution: this.analyzePreferenceEvolution(userHistory),
            engagementTrends: this.analyzeEngagementTrends(userHistory)
        };
    }
    
    /**
     * Analyze learning progress
     * @param {Array} history - Learning history
     * @returns {Object} Learning progress analysis
     */
    analyzeLearningProgress(history) {
        if (history.length < 2) {
            return { trend: 'insufficient_data', improvement: 0 };
        }
        
        // Analyze improvement over time
        const earlyProfile = history[0].profileSnapshot;
        const recentProfile = history[history.length - 1].profileSnapshot;
        
        const improvement = this.calculateProfileImprovement(earlyProfile, recentProfile);
        
        let trend = 'stable';
        if (improvement > 0.1) trend = 'improving';
        else if (improvement < -0.1) trend = 'declining';
        
        return { trend, improvement };
    }
    
    /**
     * Calculate profile improvement
     * @param {Object} earlyProfile - Early profile snapshot
     * @param {Object} recentProfile - Recent profile snapshot
     * @returns {number} Improvement score
     */
    calculateProfileImprovement(earlyProfile, recentProfile) {
        // Compare preference distributions
        const earlyPreferences = earlyProfile.preferences;
        const recentPreferences = recentProfile.preferences;
        
        let improvement = 0;
        let comparisons = 0;
        
        // Compare question type preferences
        Object.keys(earlyPreferences.questionTypes).forEach(type => {
            const early = earlyPreferences.questionTypes[type];
            const recent = recentPreferences.questionTypes[type];
            improvement += (recent - early);
            comparisons++;
        });
        
        return comparisons > 0 ? improvement / comparisons : 0;
    }
    
    /**
     * Analyze preference evolution
     * @param {Array} history - Learning history
     * @returns {Object} Preference evolution analysis
     */
    analyzePreferenceEvolution(history) {
        if (history.length < 5) {
            return { evolution: 'insufficient_data' };
        }
        
        // Analyze how preferences have changed over time
        const evolution = {
            questionTypes: this.analyzePreferenceCategory(history, 'questionTypes'),
            difficulty: this.analyzePreferenceCategory(history, 'difficulty'),
            responseTime: this.analyzePreferenceCategory(history, 'responseTime')
        };
        
        return { evolution };
    }
    
    /**
     * Analyze preference category evolution
     * @param {Array} history - Learning history
     * @param {string} category - Preference category
     * @returns {Object} Category evolution
     */
    analyzePreferenceCategory(history, category) {
        const early = history[0].profileSnapshot.preferences[category];
        const recent = history[history.length - 1].profileSnapshot.preferences[category];
        
        const changes = {};
        Object.keys(early).forEach(key => {
            changes[key] = recent[key] - early[key];
        });
        
        return changes;
    }
    
    /**
     * Analyze engagement trends
     * @param {Array} history - Learning history
     * @returns {Object} Engagement trend analysis
     */
    analyzeEngagementTrends(history) {
        if (history.length < 3) {
            return { trend: 'insufficient_data' };
        }
        
        // Analyze engagement over time
        const engagementScores = history.map(h => {
            return this.calculateEngagementScore(h.response, []);
        });
        
        const earlyEngagement = engagementScores.slice(0, Math.ceil(engagementScores.length / 3));
        const recentEngagement = engagementScores.slice(-Math.ceil(engagementScores.length / 3));
        
        const earlyAvg = earlyEngagement.reduce((sum, score) => sum + score, 0) / earlyEngagement.length;
        const recentAvg = recentEngagement.reduce((sum, score) => sum + score, 0) / recentEngagement.length;
        
        let trend = 'stable';
        if (recentAvg > earlyAvg + 0.1) trend = 'improving';
        else if (recentAvg < earlyAvg - 0.1) trend = 'declining';
        
        return { trend, earlyAverage: earlyAvg, recentAverage: recentAvg };
    }
    
    /**
     * Reset personalization engine
     */
    reset() {
        this.userProfiles.clear();
        this.learningHistory = [];
    }
}

export default PersonalizationEngine;

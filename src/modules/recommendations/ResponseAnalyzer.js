/**
 * ResponseAnalyzer - Analyzes quiz responses to detect patterns and preferences
 * Provides the foundation for generating personalized recommendations
 */
class ResponseAnalyzer {
    constructor() {
        this.analysisCache = new Map();
        this.patternWeights = {
            confidence: 0.4,
            consistency: 0.3,
            timing: 0.2,
            behavior: 0.1
        };
        this.currentLanguage = 'en'; // Default language
    }

    /**
     * Set the current language for analysis
     * @param {String} language - Language code ('en' or 'ru')
     */
    setLanguage(language) {
        this.currentLanguage = language;
        console.log(`🌍 ResponseAnalyzer language set to: ${language}`);
    }

    /**
     * Analyze user quiz responses and extract meaningful patterns
     * @param {Object} quizData - Complete quiz data including responses and results
     * @returns {Object} Analysis results with patterns and insights
     */
    analyzeUserResponses(quizData) {
        const cacheKey = this.generateCacheKey(quizData);
        
        if (this.analysisCache.has(cacheKey)) {
            return this.analysisCache.get(cacheKey);
        }

        const analysis = {
            confidencePatterns: this.analyzeConfidencePatterns(quizData.dimensions),
            responsePatterns: this.analyzeResponsePatterns(quizData.responses),
            behavioralPatterns: this.analyzeBehavioralPatterns(quizData),
            learningStyle: this.detectLearningStyle(quizData),
            stressIndicators: this.analyzeStressPatterns(quizData),
            developmentAreas: this.identifyDevelopmentAreas(quizData),
            timestamp: Date.now()
        };

        // Cache the analysis for performance
        this.analysisCache.set(cacheKey, analysis);
        
        return analysis;
    }

    /**
     * Analyze confidence patterns across MBTI dimensions
     * @param {Object} dimensions - MBTI dimension data with confidence scores
     * @returns {Object} Confidence analysis results
     */
    analyzeConfidencePatterns(dimensions) {
        const confidenceData = {};
        let totalConfidence = 0;
        let confidenceGaps = [];
        let strongAreas = [];

        Object.entries(dimensions).forEach(([dimension, data]) => {
            const confidence = data.confidence || 0;
            confidenceData[dimension] = {
                score: confidence,
                level: this.getConfidenceLevel(confidence),
                gap: 1 - confidence,
                needsImprovement: confidence < 0.6
            };

            totalConfidence += confidence;

            if (confidence < 0.6) {
                confidenceGaps.push({
                    dimension,
                    gapLevel: this.getGapLevel(confidence),
                    priority: this.calculatePriority(confidence),
                    developmentArea: this.mapDimensionToDevelopmentArea(dimension)
                });
            } else if (confidence > 0.8) {
                strongAreas.push({
                    dimension,
                    strength: confidence,
                    developmentArea: this.mapDimensionToDevelopmentArea(dimension)
                });
            }
        });

        const averageConfidence = totalConfidence / Object.keys(dimensions).length;

        return {
            averageConfidence,
            confidenceGaps: this.rankConfidenceGaps(confidenceGaps),
            strongAreas,
            overallLevel: this.getConfidenceLevel(averageConfidence),
            confidenceData
        };
    }

    /**
     * Analyze response patterns for consistency and timing
     * @param {Array} responses - Array of user responses
     * @returns {Object} Response pattern analysis
     */
    analyzeResponsePatterns(responses) {
        if (!responses || responses.length === 0) {
            return { consistency: 0, timing: {}, patterns: [] };
        }

        const responseTimes = responses.map(r => r.responseTime || 0).filter(t => t > 0);
        const answerChanges = this.countAnswerChanges(responses);
        const consistency = this.calculateResponseConsistency(responses);

        return {
            consistency,
            timing: {
                average: responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
                fast: responseTimes.filter(t => t < 2000).length / responseTimes.length,
                slow: responseTimes.filter(t => t > 8000).length / responseTimes.length,
                trend: this.calculateTimingTrend(responseTimes)
            },
            patterns: {
                answerChanges,
                changeFrequency: answerChanges / responses.length,
                consistencyLevel: this.getConsistencyLevel(consistency)
            }
        };
    }

    /**
     * Analyze behavioral patterns and user engagement
     * @param {Object} quizData - Complete quiz data
     * @returns {Object} Behavioral analysis results
     */
    analyzeBehavioralPatterns(quizData) {
        const responses = quizData.responses || [];
        const totalTime = quizData.totalTime || 0;
        const questionCount = responses.length;

        return {
            engagement: {
                level: this.calculateEngagementLevel(responses, totalTime),
                timePerQuestion: questionCount > 0 ? totalTime / questionCount : 0,
                completionRate: this.calculateCompletionRate(quizData)
            },
            stress: {
                indicators: this.detectStressIndicators(responses),
                level: this.calculateStressLevel(responses),
                triggers: this.analyzeStressTriggers(this.detectStressIndicators(responses))
            },
            learning: {
                style: this.detectLearningStyle(quizData),
                pace: this.calculateLearningPace(responses),
                adaptability: this.calculateAdaptability(responses)
            }
        };
    }

    /**
     * Detect user's learning style based on response patterns
     * @param {Object} quizData - Quiz data for analysis
     * @returns {String} Detected learning style
     */
    detectLearningStyle(quizData) {
        const responses = quizData.responses || [];
        const timing = this.analyzeResponsePatterns(responses).timing;
        const consistency = this.analyzeResponsePatterns(responses).consistency;

        // Analyze patterns to determine learning style
        if (timing.fast > 0.7 && consistency > 0.8) {
            return 'rapid_learner';
        } else if (timing.slow > 0.6 && consistency > 0.6) {
            return 'deliberate_learner';
        } else if (consistency < 0.5) {
            return 'exploratory_learner';
        } else {
            return 'balanced_learner';
        }
    }

    /**
     * Analyze stress patterns in user responses
     * @param {Object} quizData - Quiz data for stress analysis
     * @returns {Object} Stress pattern analysis
     */
    analyzeStressPatterns(quizData) {
        const responses = quizData.responses || [];
        const stressIndicators = [];

        responses.forEach((response, index) => {
            const stressScore = this.calculateResponseStress(response, index);
            if (stressScore > 0.5) {
                stressIndicators.push({
                    questionIndex: index,
                    stressScore,
                    trigger: this.identifyStressTrigger(response),
                    dimension: response.dimension
                });
            }
        });

        return {
            indicators: stressIndicators,
            overallLevel: stressIndicators.length > 0 ? 
                stressIndicators.reduce((sum, ind) => sum + ind.stressScore, 0) / stressIndicators.length : 0,
            triggers: this.analyzeStressTriggers(stressIndicators),
            recommendations: this.generateStressRecommendations(stressIndicators)
        };
    }

    /**
     * Identify areas for personal development based on analysis
     * @param {Object} quizData - Quiz data for development analysis
     * @returns {Array} Development areas with priorities
     */
    identifyDevelopmentAreas(quizData) {
        const confidenceAnalysis = this.analyzeConfidencePatterns(quizData.dimensions);
        const behavioralAnalysis = this.analyzeBehavioralPatterns(quizData);
        const stressAnalysis = this.analyzeStressPatterns(quizData);

        const developmentAreas = [];

        // Add confidence-based development areas
        confidenceAnalysis.confidenceGaps.forEach(gap => {
            developmentAreas.push({
                type: 'confidence_building',
                dimension: gap.dimension,
                priority: gap.priority,
                area: gap.developmentArea,
                description: `Build confidence in ${gap.developmentArea}`,
                estimatedTime: '2-4 weeks',
                difficulty: 'beginner'
            });
        });

        // Add behavioral development areas
        if (behavioralAnalysis.stress.level > 0.6) {
            developmentAreas.push({
                type: 'stress_management',
                priority: 'high',
                area: 'Emotional Regulation',
                description: 'Develop stress management and emotional regulation skills',
                estimatedTime: '3-6 weeks',
                difficulty: 'intermediate'
            });
        }

        if (behavioralAnalysis.learning.pace === 'slow') {
            developmentAreas.push({
                type: 'learning_optimization',
                priority: 'medium',
                area: 'Learning Efficiency',
                description: 'Optimize your learning approach for better efficiency',
                estimatedTime: '2-3 weeks',
                difficulty: 'beginner'
            });
        }

        return this.rankDevelopmentAreas(developmentAreas);
    }

    // Helper methods
    generateCacheKey(quizData) {
        return JSON.stringify({
            responseCount: quizData.responses?.length || 0,
            dimensions: quizData.dimensions,
            timestamp: Math.floor(Date.now() / 60000) // Cache for 1 minute
        });
    }

    getConfidenceLevel(confidence) {
        if (confidence >= 0.9) return 'excellent';
        if (confidence >= 0.8) return 'high';
        if (confidence >= 0.6) return 'good';
        if (confidence >= 0.4) return 'fair';
        return 'low';
    }

    getGapLevel(confidence) {
        if (confidence < 0.3) return 'critical';
        if (confidence < 0.5) return 'high';
        if (confidence < 0.7) return 'moderate';
        return 'low';
    }

    calculatePriority(confidence) {
        if (confidence < 0.3) return 'critical';
        if (confidence < 0.5) return 'high';
        if (confidence < 0.7) return 'medium';
        return 'low';
    }

    mapDimensionToDevelopmentArea(dimension) {
        const mapping = {
            'EI': 'Social Skills',
            'SN': 'Information Processing',
            'TF': 'Decision Making',
            'JP': 'Organization & Planning'
        };
        return mapping[dimension] || 'Personal Development';
    }

    rankConfidenceGaps(gaps) {
        return gaps.sort((a, b) => {
            const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    countAnswerChanges(responses) {
        let changes = 0;
        for (let i = 1; i < responses.length; i++) {
            if (responses[i].selectedOption !== responses[i-1].selectedOption) {
                changes++;
            }
        }
        return changes;
    }

    calculateResponseConsistency(responses) {
        if (responses.length < 2) return 1;
        
        const changes = this.countAnswerChanges(responses);
        return 1 - (changes / (responses.length - 1));
    }

    getConsistencyLevel(consistency) {
        if (consistency >= 0.9) return 'very_high';
        if (consistency >= 0.7) return 'high';
        if (consistency >= 0.5) return 'moderate';
        return 'low';
    }

    calculateTimingTrend(responseTimes) {
        if (responseTimes.length < 3) return 'stable';
        
        const firstHalf = responseTimes.slice(0, Math.floor(responseTimes.length / 2));
        const secondHalf = responseTimes.slice(Math.floor(responseTimes.length / 2));
        
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        
        if (secondAvg < firstAvg * 0.8) return 'accelerating';
        if (secondAvg > firstAvg * 1.2) return 'decelerating';
        return 'stable';
    }

    calculateEngagementLevel(responses, totalTime) {
        const avgTimePerQuestion = totalTime / responses.length;
        const consistency = this.calculateResponseConsistency(responses);
        
        if (avgTimePerQuestion < 3000 && consistency > 0.8) return 'high';
        if (avgTimePerQuestion < 5000 && consistency > 0.6) return 'medium';
        return 'low';
    }

    calculateCompletionRate(quizData) {
        const totalQuestions = quizData.totalQuestions || 61;
        const answeredQuestions = quizData.responses?.length || 0;
        return answeredQuestions / totalQuestions;
    }

    detectStressIndicators(responses) {
        return responses.map((response, index) => {
            const stressScore = this.calculateResponseStress(response, index);
            return { index, stressScore, dimension: response.dimension };
        }).filter(indicator => indicator.stressScore > 0.5);
    }

    calculateResponseStress(response, index) {
        let stressScore = 0;
        
        // Response time stress
        if (response.responseTime > 10000) stressScore += 0.3;
        if (response.responseTime < 1000) stressScore += 0.2;
        
        // Confidence stress
        if (response.confidence < 0.5) stressScore += 0.4;
        
        // Pattern stress
        if (index > 0 && response.responseTime > 15000) stressScore += 0.3;
        
        return Math.min(stressScore, 1);
    }

    identifyStressTrigger(response) {
        if (response.responseTime > 10000) return 'time_pressure';
        if (response.confidence < 0.5) return 'uncertainty';
        if (response.dimension === 'TF' && response.confidence < 0.6) return 'decision_stress';
        return 'general_stress';
    }

    analyzeStressTriggers(stressIndicators) {
        const triggers = {};
        stressIndicators.forEach(indicator => {
            const trigger = indicator.trigger || 'general_stress';
            triggers[trigger] = (triggers[trigger] || 0) + 1;
        });
        return triggers;
    }

    generateStressRecommendations(stressIndicators) {
        const recommendations = [];
        
        if (stressIndicators.some(ind => ind.trigger === 'time_pressure')) {
            recommendations.push({
                type: 'time_management',
                title: 'Improve Time Management',
                description: 'Practice time management techniques to reduce pressure',
                priority: 'high'
            });
        }
        
        if (stressIndicators.some(ind => ind.trigger === 'uncertainty')) {
            recommendations.push({
                type: 'confidence_building',
                title: 'Build Self-Confidence',
                description: 'Work on building confidence in your decision-making',
                priority: 'medium'
            });
        }
        
        return recommendations;
    }

    /**
     * Analyze stress triggers from stress indicators
     * @param {Array} stressIndicators - Array of stress indicators
     * @returns {Object} Stress triggers analysis
     */
    analyzeStressTriggers(stressIndicators) {
        const triggers = {};
        stressIndicators.forEach(indicator => {
            const trigger = indicator.trigger || 'general_stress';
            triggers[trigger] = (triggers[trigger] || 0) + 1;
        });
        return triggers;
    }

    rankDevelopmentAreas(areas) {
        const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return areas.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    }

    /**
     * Calculate stress level from responses
     * @param {Array} responses - User responses
     * @returns {Number} Stress level (0-1)
     */
    calculateStressLevel(responses) {
        if (!responses || responses.length === 0) return 0;
        
        const stressIndicators = this.detectStressIndicators(responses);
        return stressIndicators.length > 0 ? 
            stressIndicators.reduce((sum, ind) => sum + ind.stressScore, 0) / stressIndicators.length : 0;
    }

    /**
     * Calculate learning pace from responses
     * @param {Array} responses - User responses
     * @returns {String} Learning pace description
     */
    calculateLearningPace(responses) {
        if (!responses || responses.length === 0) return 'unknown';
        
        const responseTimes = responses.map(r => r.responseTime || 0).filter(t => t > 0);
        if (responseTimes.length === 0) return 'unknown';
        
        const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        
        if (avgTime < 3000) return 'fast';
        if (avgTime < 6000) return 'moderate';
        return 'slow';
    }

    /**
     * Calculate adaptability from responses
     * @param {Array} responses - User responses
     * @returns {Number} Adaptability score (0-1)
     */
    calculateAdaptability(responses) {
        if (!responses || responses.length < 2) return 0;
        
        const consistency = this.calculateResponseConsistency(responses);
        const timingTrend = this.calculateTimingTrend(
            responses.map(r => r.responseTime || 0).filter(t => t > 0)
        );
        
        let adaptability = consistency;
        
        // Bonus for accelerating trend
        if (timingTrend === 'accelerating') adaptability += 0.2;
        // Penalty for decelerating trend
        if (timingTrend === 'decelerating') adaptability -= 0.1;
        
        return Math.max(0, Math.min(1, adaptability));
    }

    /**
     * Clear analysis cache to free memory
     */
    clearCache() {
        this.analysisCache.clear();
    }

    /**
     * Get cache statistics for debugging
     */
    getCacheStats() {
        return {
            size: this.analysisCache.size,
            keys: Array.from(this.analysisCache.keys())
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponseAnalyzer;
} else if (typeof window !== 'undefined') {
    window.ResponseAnalyzer = ResponseAnalyzer;
}

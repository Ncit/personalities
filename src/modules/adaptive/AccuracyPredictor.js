/**
 * Accuracy Predictor
 * Predicts confidence levels and accuracy for personality dimensions
 */

import { getConfig } from './config/AdaptiveConfig.js';

export class AccuracyPredictor {
    constructor() {
        this.confidenceModels = new Map();
        this.accuracyHistory = [];
        this.patternCache = new Map();
        
        this.initializeModels();
    }
    
    /**
     * Initialize confidence prediction models
     */
    initializeModels() {
        const dimensions = ['EI', 'SN', 'TF', 'JP'];
        
        dimensions.forEach(dimension => {
            this.confidenceModels.set(dimension, {
                baseConfidence: 0.5,
                learningRate: 0.1,
                patternWeights: {
                    consistency: 0.3,
                    responseTime: 0.2,
                    difficulty: 0.25,
                    frequency: 0.25
                }
            });
        });
    }
    
    /**
     * Calculate confidence for a specific dimension
     * @param {string} dimension - MBTI dimension (EI, SN, TF, JP)
     * @param {Array} responses - User responses for this dimension
     * @returns {number} Confidence score (0-1)
     */
    calculateConfidence(dimension, responses) {
        if (!responses || responses.length === 0) {
            return this.getBaseConfidence(dimension);
        }
        
        try {
            // Calculate various confidence factors
            const consistencyScore = this.calculateConsistencyScore(dimension, responses);
            const responseTimeScore = this.calculateResponseTimeScore(responses);
            const difficultyScore = this.calculateDifficultyScore(responses);
            const frequencyScore = this.calculateFrequencyScore(dimension, responses);
            
            // Weighted combination of factors
            const weights = this.getConfidenceWeights(dimension);
            const confidence = (
                consistencyScore * weights.consistency +
                responseTimeScore * weights.responseTime +
                difficultyScore * weights.difficulty +
                frequencyScore * weights.frequency
            );
            
            // Apply confidence bounds and smoothing
            const boundedConfidence = Math.max(0, Math.min(1, confidence));
            const smoothedConfidence = this.applyConfidenceSmoothing(
                dimension, 
                boundedConfidence, 
                responses.length
            );
            
            // Update model with new data
            this.updateConfidenceModel(dimension, smoothedConfidence, responses);
            
            return smoothedConfidence;
            
        } catch (error) {
            console.error('Error calculating confidence:', error);
            return this.getBaseConfidence(dimension);
        }
    }
    
    /**
     * Calculate consistency score based on response patterns
     * @param {string} dimension - MBTI dimension
     * @param {Array} responses - User responses
     * @returns {number} Consistency score (0-1)
     */
    calculateConsistencyScore(dimension, responses) {
        if (responses.length < 2) return 0.5;
        
        const dimensionResponses = responses.filter(r => r.dimension === dimension);
        
        if (dimensionResponses.length < 2) return 0.5;
        
        // Calculate response pattern consistency
        const patterns = this.extractResponsePatterns(dimensionResponses);
        const consistency = this.analyzePatternConsistency(patterns);
        
        return consistency;
    }
    
    /**
     * Extract response patterns from user responses
     * @param {Array} responses - User responses
     * @returns {Array} Response patterns
     */
    extractResponsePatterns(responses) {
        const patterns = [];
        
        for (let i = 1; i < responses.length; i++) {
            const current = responses[i];
            const previous = responses[i - 1];
            
            if (current.dimension === previous.dimension) {
                patterns.push({
                    dimension: current.dimension,
                    optionChange: Math.abs(current.selectedOption - previous.selectedOption),
                    timeChange: current.responseTime - previous.responseTime,
                    consistency: current.selectedOption === previous.selectedOption ? 1 : 0
                });
            }
        }
        
        return patterns;
    }
    
    /**
     * Analyze consistency of response patterns
     * @param {Array} patterns - Response patterns
     * @returns {number} Consistency score (0-1)
     */
    analyzePatternConsistency(patterns) {
        if (patterns.length === 0) return 0.5;
        
        // Calculate various consistency metrics
        const optionConsistency = patterns.filter(p => p.consistency === 1).length / patterns.length;
        const timeConsistency = this.calculateTimeConsistency(patterns);
        const patternStability = this.calculatePatternStability(patterns);
        
        // Weighted combination
        const consistency = (
            optionConsistency * 0.5 +
            timeConsistency * 0.3 +
            patternStability * 0.2
        );
        
        return consistency;
    }
    
    /**
     * Calculate time consistency between responses
     * @param {Array} patterns - Response patterns
     * @returns {number} Time consistency score (0-1)
     */
    calculateTimeConsistency(patterns) {
        if (patterns.length < 2) return 0.5;
        
        const timeChanges = patterns.map(p => p.timeChange);
        const meanTime = timeChanges.reduce((sum, time) => sum + time, 0) / timeChanges.length;
        const variance = timeChanges.reduce((sum, time) => sum + Math.pow(time - meanTime, 2), 0) / timeChanges.length;
        const standardDeviation = Math.sqrt(variance);
        
        // Lower standard deviation means higher consistency
        const maxExpectedDeviation = 5000; // 5 seconds
        const consistency = Math.max(0, 1 - (standardDeviation / maxExpectedDeviation));
        
        return consistency;
    }
    
    /**
     * Calculate pattern stability over time
     * @param {Array} patterns - Response patterns
     * @returns {number} Pattern stability score (0-1)
     */
    calculatePatternStability(patterns) {
        if (patterns.length < 3) return 0.5;
        
        // Split patterns into early and late groups
        const midPoint = Math.floor(patterns.length / 2);
        const earlyPatterns = patterns.slice(0, midPoint);
        const latePatterns = patterns.slice(midPoint);
        
        // Calculate consistency for each group
        const earlyConsistency = this.calculateGroupConsistency(earlyPatterns);
        const lateConsistency = this.calculateGroupConsistency(latePatterns);
        
        // Stability is how similar the consistency is between groups
        const stability = 1 - Math.abs(earlyConsistency - lateConsistency);
        
        return stability;
    }
    
    /**
     * Calculate consistency for a group of patterns
     * @param {Array} patterns - Pattern group
     * @returns {number} Group consistency score
     */
    calculateGroupConsistency(patterns) {
        if (patterns.length === 0) return 0.5;
        
        const consistencyScores = patterns.map(p => p.consistency);
        return consistencyScores.reduce((sum, score) => sum + score, 0) / consistencyScores.length;
    }
    
    /**
     * Calculate response time score
     * @param {Array} responses - User responses
     * @returns {number} Response time score (0-1)
     */
    calculateResponseTimeScore(responses) {
        if (responses.length === 0) return 0.5;
        
        const responseTimes = responses.map(r => r.responseTime || 0);
        const averageTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
        
        // Optimal response time range (2-8 seconds)
        const optimalMin = 2000;
        const optimalMax = 8000;
        
        let score = 0;
        
        if (averageTime >= optimalMin && averageTime <= optimalMax) {
            score = 1.0; // Optimal range
        } else if (averageTime < optimalMin) {
            score = 0.5; // Too fast, might be random
        } else {
            // Too slow, calculate penalty
            const penalty = Math.min(1, (averageTime - optimalMax) / 10000);
            score = Math.max(0, 1 - penalty);
        }
        
        return score;
    }
    
    /**
     * Calculate difficulty score based on question difficulty
     * @param {Array} responses - User responses
     * @returns {number} Difficulty score (0-1)
     */
    calculateDifficultyScore(responses) {
        if (responses.length === 0) return 0.5;
        
        const difficulties = responses.map(r => r.difficulty || 'medium');
        const difficultyScores = difficulties.map(d => {
            switch (d) {
                case 'easy': return 0.3;
                case 'medium': return 0.7;
                case 'hard': return 1.0;
                default: return 0.5;
            }
        });
        
        const averageDifficulty = difficultyScores.reduce((sum, score) => sum + score, 0) / difficultyScores.length;
        
        // Higher difficulty questions provide more confidence
        return averageDifficulty;
    }
    
    /**
     * Calculate frequency score for dimension coverage
     * @param {string} dimension - MBTI dimension
     * @param {Array} responses - User responses
     * @returns {number} Frequency score (0-1)
     */
    calculateFrequencyScore(dimension, responses) {
        const dimensionResponses = responses.filter(r => r.dimension === dimension);
        const totalResponses = responses.length;
        
        if (totalResponses === 0) return 0.5;
        
        const dimensionRatio = dimensionResponses.length / totalResponses;
        const targetRatio = 0.25; // Each dimension should have ~25% of questions
        
        // Score based on how close we are to target ratio
        const ratioScore = 1 - Math.abs(dimensionRatio - targetRatio) / targetRatio;
        
        // Bonus for having minimum number of responses
        const minResponses = getConfig('confidence.minSamples');
        const coverageBonus = dimensionResponses.length >= minResponses ? 0.2 : 0;
        
        return Math.min(1, ratioScore + coverageBonus);
    }
    
    /**
     * Get confidence weights for a dimension
     * @param {string} dimension - MBTI dimension
     * @returns {Object} Confidence weights
     */
    getConfidenceWeights(dimension) {
        const model = this.confidenceModels.get(dimension);
        return model ? model.patternWeights : {
            consistency: 0.3,
            responseTime: 0.2,
            difficulty: 0.25,
            frequency: 0.25
        };
    }
    
    /**
     * Apply confidence smoothing based on response count
     * @param {string} dimension - MBTI dimension
     * @param {number} confidence - Raw confidence score
     * @param {number} responseCount - Number of responses
     * @returns {number} Smoothed confidence score
     */
    applyConfidenceSmoothing(dimension, confidence, responseCount) {
        const minSamples = getConfig('confidence.minSamples');
        
        if (responseCount < minSamples) {
            // Apply smoothing for low sample sizes
            const smoothingFactor = responseCount / minSamples;
            const baseConfidence = this.getBaseConfidence(dimension);
            
            return (confidence * smoothingFactor) + (baseConfidence * (1 - smoothingFactor));
        }
        
        return confidence;
    }
    
    /**
     * Get base confidence for a dimension
     * @param {string} dimension - MBTI dimension
     * @returns {number} Base confidence score
     */
    getBaseConfidence(dimension) {
        const model = this.confidenceModels.get(dimension);
        return model ? model.baseConfidence : 0.5;
    }
    
    /**
     * Update confidence model with new data
     * @param {string} dimension - MBTI dimension
     * @param {number} confidence - New confidence score
     * @param {Array} responses - User responses
     */
    updateConfidenceModel(dimension, confidence, responses) {
        const model = this.confidenceModels.get(dimension);
        
        if (!model) return;
        
        // Update base confidence using learning rate
        const learningRate = model.learningRate;
        model.baseConfidence = (model.baseConfidence * (1 - learningRate)) + (confidence * learningRate);
        
        // Store accuracy history
        this.accuracyHistory.push({
            dimension,
            confidence,
            responseCount: responses.length,
            timestamp: Date.now()
        });
        
        // Keep only last 1000 entries for memory management
        if (this.accuracyHistory.length > 1000) {
            this.accuracyHistory = this.accuracyHistory.slice(-1000);
        }
    }
    
    /**
     * Get accuracy analytics
     * @returns {Object} Accuracy analytics
     */
    getAccuracyAnalytics() {
        const dimensions = ['EI', 'SN', 'TF', 'JP'];
        const analytics = {};
        
        dimensions.forEach(dimension => {
            const dimensionHistory = this.accuracyHistory.filter(h => h.dimension === dimension);
            
            if (dimensionHistory.length === 0) {
                analytics[dimension] = {
                    averageConfidence: 0.5,
                    confidenceTrend: 'stable',
                    responseCount: 0
                };
                return;
            }
            
            const confidences = dimensionHistory.map(h => h.confidence);
            const averageConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
            
            // Calculate trend (last 10 vs previous 10)
            const recentConfidences = confidences.slice(-10);
            const previousConfidences = confidences.slice(-20, -10);
            
            let trend = 'stable';
            if (recentConfidences.length >= 5 && previousConfidences.length >= 5) {
                const recentAvg = recentConfidences.reduce((sum, c) => sum + c, 0) / recentConfidences.length;
                const previousAvg = previousConfidences.reduce((sum, c) => sum + c, 0) / previousConfidences.length;
                
                if (recentAvg > previousAvg + 0.1) trend = 'improving';
                else if (recentAvg < previousAvg - 0.1) trend = 'declining';
            }
            
            analytics[dimension] = {
                averageConfidence,
                confidenceTrend: trend,
                responseCount: dimensionHistory.length
            };
        });
        
        return analytics;
    }
    
    /**
     * Reset predictor for new assessment
     */
    reset() {
        this.accuracyHistory = [];
        this.patternCache.clear();
        this.initializeModels();
    }
}

export default AccuracyPredictor;

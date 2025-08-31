/**
 * Adaptive Assessment Engine
 * Core engine for intelligent question selection and assessment adaptation
 */

import { ADAPTIVE_CONFIG, getConfig } from './config/AdaptiveConfig.js';
import { QuestionSelector } from './QuestionSelector.js';
import { AccuracyPredictor } from './AccuracyPredictor.js';
import { PersonalizationEngine } from './PersonalizationEngine.js';

export class AdaptiveEngine {
    constructor(questionPool, userProfile = null) {
        this.questionPool = questionPool;
        this.userProfile = userProfile || this.createDefaultUserProfile();
        
        // Initialize components
        this.questionSelector = new QuestionSelector(questionPool);
        this.accuracyPredictor = new AccuracyPredictor();
        this.personalizationEngine = new PersonalizationEngine();
        
        // Assessment state
        this.assessmentState = {
            currentQuestion: 0,
            answeredQuestions: [],
            confidenceScores: {},
            adaptationHistory: [],
            personalizationData: {},
            performanceMetrics: {
                startTime: Date.now(),
                processingTimes: [],
                memoryUsage: []
            }
        };
        
        // Initialize tracking
        this.initializeTracking();
    }
    
    /**
     * Create default user profile
     */
    createDefaultUserProfile() {
        return {
            preferences: {
                questionTypes: { behavioral: 0.33, situational: 0.33, preference: 0.34 },
                difficulty: { easy: 0.33, medium: 0.34, hard: 0.33 },
                responseTime: { fast: 0.33, medium: 0.34, slow: 0.33 }
            },
            history: {
                previousAssessments: [],
                responsePatterns: {},
                accuracyHistory: []
            },
            personalization: {
                learningRate: getConfig('personalization.learningRate'),
                adaptationThreshold: getConfig('personalization.adaptationThreshold')
            }
        };
    }
    
    /**
     * Initialize tracking and analytics
     */
    initializeTracking() {
        if (getConfig('analytics.trackAdaptation')) {
            this.assessmentState.adaptationHistory = [];
        }
        
        if (getConfig('analytics.trackConfidence')) {
            this.assessmentState.confidenceScores = {};
        }
        
        if (getConfig('analytics.trackPerformance')) {
            this.assessmentState.performanceMetrics = {
                startTime: Date.now(),
                processingTimes: [],
                memoryUsage: []
            };
        }
    }
    
    /**
     * Get next question based on adaptive logic
     * @param {Object} currentResponse - Current user response
     * @returns {Object|null} Next question or null if assessment complete
     */
    async getNextQuestion(currentResponse = null) {
        const startTime = performance.now();
        
        try {
            // Update assessment state with current response
            if (currentResponse) {
                this.updateAssessmentState(currentResponse);
            }
            
            // Check if assessment should terminate early
            if (this.shouldTerminateEarly()) {
                return this.completeAssessment();
            }
            
            // Get next question using adaptive selection
            const nextQuestion = await this.selectNextQuestion();
            
            // Track performance
            this.trackPerformance(startTime);
            
            return nextQuestion;
            
        } catch (error) {
            console.error('Error in getNextQuestion:', error);
            // Fallback to standard question selection
            return this.questionSelector.getRandomQuestion();
        }
    }
    
    /**
     * Update assessment state with new response
     * @param {Object} response - User response data
     */
    updateAssessmentState(response) {
        const { questionIndex, selectedOption, responseTime, dimension } = response;
        
        // Add to answered questions
        this.assessmentState.answeredQuestions.push({
            questionIndex,
            selectedOption,
            responseTime,
            dimension,
            timestamp: Date.now()
        });
        
        // Update confidence scores
        this.updateConfidenceScores();
        
        // Update personalization data
        this.updatePersonalizationData(response);
        
        // Track adaptation
        this.trackAdaptation(response);
    }
    
    /**
     * Update confidence scores for all dimensions
     */
    updateConfidenceScores() {
        const dimensions = ['EI', 'SN', 'TF', 'JP'];
        
        dimensions.forEach(dimension => {
            const confidence = this.accuracyPredictor.calculateConfidence(
                dimension,
                this.assessmentState.answeredQuestions
            );
            
            this.assessmentState.confidenceScores[dimension] = confidence;
        });
    }
    
    /**
     * Update personalization data based on user response
     * @param {Object} response - User response data
     */
    updatePersonalizationData(response) {
        this.personalizationEngine.updateProfile(
            this.userProfile,
            response,
            this.assessmentState.answeredQuestions
        );
    }
    
    /**
     * Track adaptation decisions
     * @param {Object} response - User response data
     */
    trackAdaptation(response) {
        if (getConfig('analytics.trackAdaptation')) {
            this.assessmentState.adaptationHistory.push({
                questionIndex: response.questionIndex,
                adaptationType: this.getAdaptationType(response),
                confidence: this.assessmentState.confidenceScores[response.dimension],
                timestamp: Date.now()
            });
        }
    }
    
    /**
     * Determine adaptation type for response
     * @param {Object} response - User response data
     * @returns {string} Adaptation type
     */
    getAdaptationType(response) {
        const confidence = this.assessmentState.confidenceScores[response.dimension];
        
        if (confidence > getConfig('confidence.dimensionWeight') * 0.8) {
            return 'reinforcement';
        } else if (confidence < getConfig('confidence.dimensionWeight') * 0.4) {
            return 'clarification';
        } else {
            return 'exploration';
        }
    }
    
    /**
     * Select next question using adaptive logic
     * @returns {Object} Selected question
     */
    async selectNextQuestion() {
        const selectionCriteria = {
            confidence: this.assessmentState.confidenceScores,
            personalization: this.userProfile.personalization,
            balance: this.getBalanceRequirements(),
            history: this.assessmentState.answeredQuestions
        };
        
        return await this.questionSelector.selectQuestion(selectionCriteria);
    }
    
    /**
     * Get balance requirements for question selection
     * @returns {Object} Balance requirements
     */
    getBalanceRequirements() {
        const dimensions = ['EI', 'SN', 'TF', 'JP'];
        const balance = {};
        
        dimensions.forEach(dimension => {
            const answered = this.assessmentState.answeredQuestions.filter(
                q => q.dimension === dimension
            ).length;
            
            const minQuestions = getConfig('questionPool.dimensionBalance')[dimension].min * 
                               getConfig('questionSelection.maxQuestions');
            
            balance[dimension] = {
                answered,
                minRequired: Math.ceil(minQuestions),
                priority: answered < minQuestions ? 'high' : 'medium'
            };
        });
        
        return balance;
    }
    
    /**
     * Check if assessment should terminate early
     * @returns {boolean} Should terminate early
     */
    shouldTerminateEarly() {
        if (!getConfig('earlyTermination.enabled')) {
            return false;
        }
        
        const answeredCount = this.assessmentState.answeredQuestions.length;
        const minQuestions = getConfig('earlyTermination.minQuestionsAnswered');
        
        if (answeredCount < minQuestions) {
            return false;
        }
        
        // Check if all dimensions have sufficient confidence
        const dimensions = ['EI', 'SN', 'TF', 'JP'];
        const highConfidenceCount = dimensions.filter(dimension => {
            const confidence = this.assessmentState.confidenceScores[dimension] || 0;
            return confidence >= getConfig('earlyTermination.minConfidence');
        }).length;
        
        return highConfidenceCount >= dimensions.length;
    }
    
    /**
     * Complete assessment with final results
     * @returns {Object} Assessment completion data
     */
    completeAssessment() {
        const completionData = {
            status: 'completed',
            totalQuestions: this.assessmentState.answeredQuestions.length,
            confidenceScores: this.assessmentState.confidenceScores,
            personalizationData: this.assessmentState.personalizationData,
            performanceMetrics: this.getPerformanceMetrics(),
            adaptationSummary: this.getAdaptationSummary()
        };
        
        // Track completion analytics
        this.trackCompletionAnalytics(completionData);
        
        return completionData;
    }
    
    /**
     * Get performance metrics
     * @returns {Object} Performance metrics
     */
    getPerformanceMetrics() {
        const endTime = Date.now();
        const totalTime = endTime - this.assessmentState.performanceMetrics.startTime;
        
        return {
            totalTime,
            averageProcessingTime: this.calculateAverageProcessingTime(),
            memoryUsage: this.assessmentState.performanceMetrics.memoryUsage,
            questionsPerMinute: this.calculateQuestionsPerMinute(totalTime)
        };
    }
    
    /**
     * Calculate average processing time
     * @returns {number} Average processing time in milliseconds
     */
    calculateAverageProcessingTime() {
        const times = this.assessmentState.performanceMetrics.processingTimes;
        if (times.length === 0) return 0;
        
        return times.reduce((sum, time) => sum + time, 0) / times.length;
    }
    
    /**
     * Calculate questions per minute
     * @param {number} totalTime - Total time in milliseconds
     * @returns {number} Questions per minute
     */
    calculateQuestionsPerMinute(totalTime) {
        const totalQuestions = this.assessmentState.answeredQuestions.length;
        const minutes = totalTime / (1000 * 60);
        
        return minutes > 0 ? totalQuestions / minutes : 0;
    }
    
    /**
     * Get adaptation summary
     * @returns {Object} Adaptation summary
     */
    getAdaptationSummary() {
        if (!getConfig('analytics.trackAdaptation')) {
            return { enabled: false };
        }
        
        const adaptations = this.assessmentState.adaptationHistory;
        const adaptationTypes = adaptations.map(a => a.adaptationType);
        
        return {
            enabled: true,
            totalAdaptations: adaptations.length,
            adaptationTypes: {
                reinforcement: adaptationTypes.filter(t => t === 'reinforcement').length,
                clarification: adaptationTypes.filter(t => t === 'clarification').length,
                exploration: adaptationTypes.filter(t => t === 'exploration').length
            },
            averageConfidence: this.calculateAverageConfidence()
        };
    }
    
    /**
     * Calculate average confidence across dimensions
     * @returns {number} Average confidence score
     */
    calculateAverageConfidence() {
        const scores = Object.values(this.assessmentState.confidenceScores);
        if (scores.length === 0) return 0;
        
        return scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }
    
    /**
     * Track performance metrics
     * @param {number} startTime - Start time from performance.now()
     */
    trackPerformance(startTime) {
        if (getConfig('analytics.trackPerformance')) {
            const processingTime = performance.now() - startTime;
            this.assessmentState.performanceMetrics.processingTimes.push(processingTime);
            
            // Track memory usage if available
            if (performance.memory) {
                this.assessmentState.performanceMetrics.memoryUsage.push({
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    timestamp: Date.now()
                });
            }
        }
    }
    
    /**
     * Track completion analytics
     * @param {Object} completionData - Completion data
     */
    trackCompletionAnalytics(completionData) {
        // This would integrate with your existing analytics system
        if (window.gtag) {
            window.gtag('event', 'adaptive_assessment_completed', {
                total_questions: completionData.totalQuestions,
                average_confidence: completionData.adaptationSummary.averageConfidence,
                total_time: completionData.performanceMetrics.totalTime
            });
        }
    }
    
    /**
     * Reset engine for new assessment
     */
    reset() {
        this.assessmentState = {
            currentQuestion: 0,
            answeredQuestions: [],
            confidenceScores: {},
            adaptationHistory: [],
            personalizationData: {},
            performanceMetrics: {
                startTime: Date.now(),
                processingTimes: [],
                memoryUsage: []
            }
        };
        
        this.initializeTracking();
    }
    
    /**
     * Get current assessment state
     * @returns {Object} Current assessment state
     */
    getState() {
        return { ...this.assessmentState };
    }
    
    /**
     * Get user profile
     * @returns {Object} User profile
     */
    getUserProfile() {
        return { ...this.userProfile };
    }
}

export default AdaptiveEngine;

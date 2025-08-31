/**
 * Intelligent Question Selector
 * Selects questions based on adaptive criteria and user personalization
 */

import { getConfig } from './config/AdaptiveConfig.js';

export class QuestionSelector {
    constructor(questionPool) {
        this.questionPool = questionPool;
        this.usedQuestions = new Set();
        this.questionScores = new Map();
        this.selectionHistory = [];
    }
    
    /**
     * Select next question based on selection criteria
     * @param {Object} criteria - Selection criteria
     * @returns {Object} Selected question
     */
    async selectQuestion(criteria) {
        const startTime = performance.now();
        
        try {
            // Calculate scores for all available questions
            const scoredQuestions = await this.scoreQuestions(criteria);
            
            // Filter out used questions
            const availableQuestions = scoredQuestions.filter(q => 
                !this.usedQuestions.has(q.id)
            );
            
            if (availableQuestions.length === 0) {
                // If no questions available, reset used questions (for retakes)
                this.usedQuestions.clear();
                return this.selectQuestion(criteria);
            }
            
            // Select question using weighted random selection
            const selectedQuestion = this.weightedRandomSelection(availableQuestions);
            
            // Mark question as used
            this.usedQuestions.add(selectedQuestion.id);
            
            // Track selection
            this.trackSelection(selectedQuestion, criteria, startTime);
            
            return selectedQuestion.question;
            
        } catch (error) {
            console.error('Error in selectQuestion:', error);
            // Fallback to random selection
            return this.getRandomQuestion();
        }
    }
    
    /**
     * Score questions based on selection criteria
     * @param {Object} criteria - Selection criteria
     * @returns {Array} Scored questions
     */
    async scoreQuestions(criteria) {
        const { confidence, personalization, balance, history } = criteria;
        
        const scoredQuestions = [];
        
        for (const question of this.questionPool) {
            const score = await this.calculateQuestionScore(question, {
                confidence,
                personalization,
                balance,
                history
            });
            
            scoredQuestions.push({
                id: question.id || `q_${Math.random()}`,
                question,
                score,
                criteria: {
                    confidence: score.confidence,
                    personalization: score.personalization,
                    balance: score.balance,
                    total: score.total
                }
            });
        }
        
        // Sort by total score (descending)
        scoredQuestions.sort((a, b) => b.score.total - a.score.total);
        
        return scoredQuestions;
    }
    
    /**
     * Calculate score for a single question
     * @param {Object} question - Question object
     * @param {Object} criteria - Scoring criteria
     * @returns {Object} Question scores
     */
    async calculateQuestionScore(question, criteria) {
        const { confidence, personalization, balance, history } = criteria;
        
        // Calculate confidence score
        const confidenceScore = this.calculateConfidenceScore(question, confidence);
        
        // Calculate personalization score
        const personalizationScore = this.calculatePersonalizationScore(question, personalization);
        
        // Calculate balance score
        const balanceScore = this.calculateBalanceScore(question, balance, history);
        
        // Calculate total weighted score
        const totalScore = this.calculateTotalScore({
            confidence: confidenceScore,
            personalization: personalizationScore,
            balance: balanceScore
        });
        
        return {
            confidence: confidenceScore,
            personalization: personalizationScore,
            balance: balanceScore,
            total: totalScore
        };
    }
    
    /**
     * Calculate confidence score for question
     * @param {Object} question - Question object
     * @param {Object} confidence - Confidence scores for dimensions
     * @returns {number} Confidence score
     */
    calculateConfidenceScore(question, confidence) {
        const dimension = question.dimension;
        const currentConfidence = confidence[dimension] || 0;
        
        // Lower confidence dimensions get higher priority
        const confidenceScore = 1 - currentConfidence;
        
        // Apply dimension-specific weights
        const dimensionWeight = getConfig('confidence.dimensionWeight');
        
        return confidenceScore * dimensionWeight;
    }
    
    /**
     * Calculate personalization score for question
     * @param {Object} question - Question object
     * @param {Object} personalization - Personalization preferences
     * @returns {number} Personalization score
     */
    calculatePersonalizationScore(question, personalization) {
        let score = 0;
        
        // Question type preference
        if (question.type && personalization.questionTypes) {
            const typePreference = personalization.questionTypes[question.type] || 0.33;
            score += typePreference;
        }
        
        // Difficulty preference
        if (question.difficulty && personalization.difficulty) {
            const difficultyPreference = personalization.difficulty[question.difficulty] || 0.33;
            score += difficultyPreference;
        }
        
        // Response time preference
        if (personalization.responseTime) {
            const responseTimePreference = personalization.responseTime.medium || 0.34;
            score += responseTimePreference;
        }
        
        return score / 3; // Normalize to 0-1 range
    }
    
    /**
     * Calculate balance score for question
     * @param {Object} question - Question object
     * @param {Object} balance - Balance requirements
     * @param {Array} history - Question history
     * @returns {number} Balance score
     */
    calculateBalanceScore(question, balance, history) {
        const dimension = question.dimension;
        const dimensionBalance = balance[dimension];
        
        if (!dimensionBalance) {
            return 0.5; // Default score if dimension not found
        }
        
        let score = 0;
        
        // Priority scoring based on balance requirements
        if (dimensionBalance.priority === 'high') {
            score += 0.8; // High priority for dimensions needing more questions
        } else if (dimensionBalance.priority === 'medium') {
            score += 0.5; // Medium priority for balanced dimensions
        } else {
            score += 0.2; // Low priority for well-covered dimensions
        }
        
        // Question distribution scoring
        const questionTypes = getConfig('questionPool.questionTypes');
        const currentType = question.type || 'behavioral';
        const typeBalance = this.calculateTypeBalance(history, currentType);
        
        score += typeBalance * 0.3;
        
        // Difficulty distribution scoring
        const difficultyBalance = this.calculateDifficultyBalance(history, question.difficulty);
        
        score += difficultyBalance * 0.2;
        
        return Math.min(score, 1); // Cap at 1.0
    }
    
    /**
     * Calculate type balance for question types
     * @param {Array} history - Question history
     * @param {string} currentType - Current question type
     * @returns {number} Type balance score
     */
    calculateTypeBalance(history, currentType) {
        const typeCounts = {};
        const targetDistribution = getConfig('questionPool.questionTypes');
        
        // Count question types in history
        history.forEach(q => {
            const type = q.type || 'behavioral';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        
        // Calculate balance score
        const totalQuestions = history.length;
        if (totalQuestions === 0) return 0.5;
        
        const currentRatio = typeCounts[currentType] / totalQuestions;
        const targetRatio = targetDistribution[currentType] || 0.33;
        
        // Lower score means better balance (closer to target)
        return 1 - Math.abs(currentRatio - targetRatio);
    }
    
    /**
     * Calculate difficulty balance for questions
     * @param {Array} history - Question history
     * @param {string} currentDifficulty - Current question difficulty
     * @returns {number} Difficulty balance score
     */
    calculateDifficultyBalance(history, currentDifficulty) {
        const difficultyCounts = {};
        const targetDistribution = getConfig('questionPool.difficultyDistribution');
        
        // Count difficulty levels in history
        history.forEach(q => {
            const difficulty = q.difficulty || 'medium';
            difficultyCounts[difficulty] = (difficultyCounts[difficulty] || 0) + 1;
        });
        
        // Calculate balance score
        const totalQuestions = history.length;
        if (totalQuestions === 0) return 0.5;
        
        const currentRatio = difficultyCounts[currentDifficulty] / totalQuestions;
        const targetRatio = targetDistribution[currentDifficulty] || 0.33;
        
        // Lower score means better balance (closer to target)
        return 1 - Math.abs(currentRatio - targetRatio);
    }
    
    /**
     * Calculate total weighted score
     * @param {Object} scores - Individual scores
     * @returns {number} Total weighted score
     */
    calculateTotalScore(scores) {
        const weights = {
            confidence: getConfig('questionSelection.balanceWeight'),
            personalization: getConfig('questionSelection.personalizationWeight'),
            balance: 1 - getConfig('questionSelection.balanceWeight') - getConfig('questionSelection.personalizationWeight')
        };
        
        return (
            scores.confidence * weights.confidence +
            scores.personalization * weights.personalization +
            scores.balance * weights.balance
        );
    }
    
    /**
     * Weighted random selection from scored questions
     * @param {Array} scoredQuestions - Questions with scores
     * @returns {Object} Selected question
     */
    weightedRandomSelection(scoredQuestions) {
        // Use top 20% of questions for selection to maintain quality
        const topQuestions = scoredQuestions.slice(0, Math.ceil(scoredQuestions.length * 0.2));
        
        // Calculate total weight
        const totalWeight = topQuestions.reduce((sum, q) => sum + q.score.total, 0);
        
        // Generate random value
        let random = Math.random() * totalWeight;
        
        // Select question based on weight
        for (const question of topQuestions) {
            random -= question.score.total;
            if (random <= 0) {
                return question;
            }
        }
        
        // Fallback to first question
        return topQuestions[0];
    }
    
    /**
     * Get random question (fallback method)
     * @returns {Object} Random question
     */
    getRandomQuestion() {
        const availableQuestions = this.questionPool.filter(q => 
            !this.usedQuestions.has(q.id || `q_${Math.random()}`)
        );
        
        if (availableQuestions.length === 0) {
            this.usedQuestions.clear();
            return this.questionPool[0];
        }
        
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const question = availableQuestions[randomIndex];
        
        this.usedQuestions.add(question.id || `q_${Math.random()}`);
        
        return question;
    }
    
    /**
     * Track question selection for analytics
     * @param {Object} question - Selected question
     * @param {Object} criteria - Selection criteria
     * @param {number} startTime - Selection start time
     */
    trackSelection(question, criteria, startTime) {
        const selectionTime = performance.now() - startTime;
        
        this.selectionHistory.push({
            questionId: question.id,
            selectionTime,
            criteria: question.criteria,
            timestamp: Date.now()
        });
        
        // Keep only last 100 selections for memory management
        if (this.selectionHistory.length > 100) {
            this.selectionHistory = this.selectionHistory.slice(-100);
        }
    }
    
    /**
     * Get selection analytics
     * @returns {Object} Selection analytics
     */
    getSelectionAnalytics() {
        const totalSelections = this.selectionHistory.length;
        
        if (totalSelections === 0) {
            return { totalSelections: 0 };
        }
        
        const averageSelectionTime = this.selectionHistory.reduce(
            (sum, s) => sum + s.selectionTime, 0
        ) / totalSelections;
        
        const averageScores = {
            confidence: this.calculateAverageScore('confidence'),
            personalization: this.calculateAverageScore('personalization'),
            balance: this.calculateAverageScore('balance'),
            total: this.calculateAverageScore('total')
        };
        
        return {
            totalSelections,
            averageSelectionTime,
            averageScores,
            selectionHistory: this.selectionHistory.slice(-20) // Last 20 selections
        };
    }
    
    /**
     * Calculate average score for a specific criteria
     * @param {string} criteria - Criteria name
     * @returns {number} Average score
     */
    calculateAverageScore(criteria) {
        const scores = this.selectionHistory
            .filter(s => s.criteria && s.criteria[criteria])
            .map(s => s.criteria[criteria]);
        
        if (scores.length === 0) return 0;
        
        return scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }
    
    /**
     * Reset selector for new assessment
     */
    reset() {
        this.usedQuestions.clear();
        this.questionScores.clear();
        this.selectionHistory = [];
    }
}

export default QuestionSelector;

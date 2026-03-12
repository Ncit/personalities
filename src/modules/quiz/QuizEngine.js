/**
 * Enhanced Quiz Engine - Core Quiz Logic with Adaptive Assessment
 * Handles quiz flow, question management, scoring algorithms, and adaptive features
 */
import { stateManager } from '../core/StateManager.js';
import { QUIZ_TYPES } from '../../data/QuizData.js';
import { AdaptiveEngine } from '../adaptive/index.js';

export class QuizEngine {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        this.selectedOption = null;
        this.quizType = 'mbti';
        
        // Adaptive assessment system
        this.adaptiveEngine = null;
        this.isAdaptiveMode = false;
        this.adaptiveConfig = {
            enabled: true,
            minQuestions: 20,
            maxQuestions: 60,
            confidenceThreshold: 0.85
        };
        
        this.initializeQuiz();
    }

    async initializeQuiz() {
        this.quizType = stateManager.getCurrentQuizType();
        this.questions = await this.generateQuestions();

        // Initialize adaptive engine if enabled
        if (this.adaptiveConfig.enabled && this.quizType === 'mbti') {
            this.initializeAdaptiveEngine();
        }

        this.resetQuiz();
    }

    /**
     * Initialize adaptive assessment engine
     */
    initializeAdaptiveEngine() {
        try {
            this.adaptiveEngine = new AdaptiveEngine(this.questions);
            this.isAdaptiveMode = true;
            console.log('Adaptive assessment engine initialized');
        } catch (error) {
            console.warn('Failed to initialize adaptive engine, falling back to standard mode:', error);
            this.isAdaptiveMode = false;
        }
    }

    resetQuiz() {
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.scores = { E: 0, I: 0, S: 0, N: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        this.selectedOption = null;
        
        // Reset adaptive engine if available
        if (this.adaptiveEngine) {
            this.adaptiveEngine.reset();
        }
        
        stateManager.resetQuiz();
    }

    async startQuiz() {
        await this.initializeQuiz();
        stateManager.setState({
            currentScreen: 'quiz',
            currentQuestion: 0
        });

        return this.getCurrentQuestion();
    }

    getCurrentQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            return null;
        }
        
        const question = this.questions[this.currentQuestionIndex];
        
        return {
            ...question,
            questionNumber: this.currentQuestionIndex + 1,
            totalQuestions: this.questions.length,
            isAdaptive: this.isAdaptiveMode,
            confidence: this.getCurrentConfidence()
        };
    }

    /**
     * Get current confidence level for adaptive mode
     */
    getCurrentConfidence() {
        if (!this.adaptiveEngine || !this.isAdaptiveMode) {
            return null;
        }
        
        const state = this.adaptiveEngine.getState();
        return state.confidenceScores;
    }

    selectOption(optionIndex) {
        this.selectedOption = optionIndex;
        stateManager.set('selectedOption', optionIndex);
    }

    async nextQuestion() {
        if (this.selectedOption === null) {
            throw new Error('No option selected');
        }

        // Save current answer with enhanced data
        const currentQuestion = this.questions[this.currentQuestionIndex];
        const responseData = {
            questionIndex: this.currentQuestionIndex,
            selectedOption: this.selectedOption,
            dimension: currentQuestion.dimension,
            weights: currentQuestion.weights,
            responseTime: this.calculateResponseTime(),
            questionType: currentQuestion.type || 'behavioral',
            difficulty: currentQuestion.difficulty || 'medium',
            questionId: currentQuestion.id || `q_${this.currentQuestionIndex}`
        };

        this.answers.push(responseData);

        // Update scores
        this.updateScores(currentQuestion, this.selectedOption);

        // Update adaptive engine if available
        if (this.adaptiveEngine && this.isAdaptiveMode) {
            await this.updateAdaptiveEngine(responseData);
        }

        // Update state
        stateManager.updateQuizProgress(
            this.currentQuestionIndex,
            this.selectedOption,
            this.scores
        );

        this.currentQuestionIndex++;
        this.selectedOption = null;

        // Check if quiz should complete early (adaptive mode)
        if (this.isAdaptiveMode && this.adaptiveEngine) {
            const shouldComplete = await this.checkEarlyCompletion();
            if (shouldComplete) {
                return this.completeQuiz();
            }
        }

        // Check if we've reached the end
        if (this.currentQuestionIndex >= this.questions.length) {
            return this.completeQuiz();
        }

        return this.getCurrentQuestion();
    }

    /**
     * Update adaptive engine with new response
     */
    async updateAdaptiveEngine(responseData) {
        try {
            if (this.adaptiveEngine) {
                this.adaptiveEngine.updateAssessmentState(responseData);
            }
        } catch (error) {
            console.warn('Failed to update adaptive engine:', error);
        }
    }

    /**
     * Check if quiz should complete early based on confidence
     */
    async checkEarlyCompletion() {
        try {
            if (!this.adaptiveEngine) return false;
            
            const state = this.adaptiveEngine.getState();
            const answeredCount = state.answeredQuestions.length;
            
            // Check minimum questions requirement
            if (answeredCount < this.adaptiveConfig.minQuestions) {
                return false;
            }
            
            // Check confidence threshold
            const dimensions = ['EI', 'SN', 'TF', 'JP'];
            const highConfidenceCount = dimensions.filter(dimension => {
                const confidence = state.confidenceScores[dimension] || 0;
                return confidence >= this.adaptiveConfig.confidenceThreshold;
            }).length;
            
            // Complete if all dimensions have high confidence
            return highConfidenceCount >= dimensions.length;
            
        } catch (error) {
            console.warn('Error checking early completion:', error);
            return false;
        }
    }

    /**
     * Calculate response time for current question
     */
    calculateResponseTime() {
        // This would integrate with your existing timing system
        // For now, return a default value
        return 5000; // 5 seconds default
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            
            // Remove last answer and recalculate scores
            if (this.answers.length > 0) {
                const lastAnswer = this.answers.pop();
                this.recalculateScores();
                
                // Update adaptive engine if available
                if (this.adaptiveEngine && this.isAdaptiveMode) {
                    this.adaptiveEngine.reset();
                    // Replay all answers except the last one
                    this.answers.forEach(answer => {
                        this.adaptiveEngine.updateAssessmentState(answer);
                    });
                }
            }
            
            stateManager.set('currentQuestion', this.currentQuestionIndex);
            return this.getCurrentQuestion();
        }
        
        return null;
    }

    updateScores(question, selectedOption) {
        const weights = question.weights;
        const dimension = question.dimension;
        
        if (dimension === 'EI') {
            this.scores.E += weights[selectedOption - 1];
            this.scores.I -= weights[selectedOption - 1];
        } else if (dimension === 'SN') {
            this.scores.S += weights[selectedOption - 1];
            this.scores.N -= weights[selectedOption - 1];
        } else if (dimension === 'TF') {
            this.scores.T += weights[selectedOption - 1];
            this.scores.F -= weights[selectedOption - 1];
        } else if (dimension === 'JP') {
            this.scores.J += weights[selectedOption - 1];
            this.scores.P -= weights[selectedOption - 1];
        }
    }

    recalculateScores() {
        this.scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        
        this.answers.forEach(answer => {
            const question = this.questions[answer.questionIndex];
            this.updateScores(question, answer.selectedOption);
        });
    }

    completeQuiz() {
        const results = this.calculateResults();
        
        // Get adaptive analytics if available
        if (this.adaptiveEngine && this.isAdaptiveMode) {
            results.adaptiveAnalytics = this.getAdaptiveAnalytics();
        }
        
        stateManager.setState({
            currentScreen: 'results',
            lastResults: results
        });
        
        return results;
    }

    /**
     * Get adaptive assessment analytics
     */
    getAdaptiveAnalytics() {
        if (!this.adaptiveEngine || !this.isAdaptiveMode) {
            return null;
        }
        
        try {
            const state = this.adaptiveEngine.getState();
            const userProfile = this.adaptiveEngine.getUserProfile();
            
            return {
                confidenceScores: state.confidenceScores,
                adaptationHistory: state.adaptationHistory,
                performanceMetrics: state.performanceMetrics,
                personalizationData: state.personalizationData,
                userProfile: userProfile,
                questionsSaved: this.questions.length - state.answeredQuestions.length,
                assessmentEfficiency: this.calculateAssessmentEfficiency(state)
            };
        } catch (error) {
            console.warn('Failed to get adaptive analytics:', error);
            return null;
        }
    }

    /**
     * Calculate assessment efficiency
     */
    calculateAssessmentEfficiency(state) {
        const totalQuestions = this.questions.length;
        const answeredQuestions = state.answeredQuestions.length;
        const questionsSaved = totalQuestions - answeredQuestions;
        
        if (totalQuestions === 0) return 0;
        
        return (questionsSaved / totalQuestions) * 100;
    }

    calculateResults() {
        const personalityType = this.calculatePersonalityType();
        const dimensionBreakdown = this.calculateDimensionBreakdown();
        
        return {
            personalityType,
            dimensionBreakdown,
            scores: { ...this.scores },
            answers: [...this.answers],
            quizType: this.quizType,
            timestamp: new Date().toISOString(),
            isAdaptive: this.isAdaptiveMode,
            totalQuestions: this.questions.length,
            answeredQuestions: this.answers.length
        };
    }

    calculatePersonalityType() {
        const type = [
            this.scores.E > this.scores.I ? 'E' : 'I',
            this.scores.S > this.scores.N ? 'S' : 'N',
            this.scores.T > this.scores.F ? 'T' : 'F',
            this.scores.J > this.scores.P ? 'J' : 'P'
        ].join('');
        
        return type;
    }

    calculateDimensionBreakdown() {
        const total = Math.abs(this.scores.E) + Math.abs(this.scores.I);
        const ePercentage = total > 0 ? (this.scores.E / total) * 100 : 50;
        
        return {
            EI: {
                E: Math.max(0, ePercentage),
                I: Math.max(0, 100 - ePercentage),
                preference: this.scores.E > this.scores.I ? 'E' : 'I'
            },
            SN: {
                S: this.scores.S > this.scores.N ? 60 : 40,
                N: this.scores.N > this.scores.S ? 60 : 40,
                preference: this.scores.S > this.scores.N ? 'S' : 'N'
            },
            TF: {
                T: this.scores.T > this.scores.F ? 60 : 40,
                F: this.scores.F > this.scores.T ? 60 : 40,
                preference: this.scores.T > this.scores.F ? 'T' : 'F'
            },
            JP: {
                J: this.scores.J > this.scores.P ? 60 : 40,
                P: this.scores.P > this.scores.J ? 60 : 40,
                preference: this.scores.J > this.scores.P ? 'J' : 'P'
            }
        };
    }

    generateQuestions() {
        const quizType = this.quizType;
        const isPremium = stateManager.isPremium();
        
        if (quizType === 'mbti') {
            return this.generateMBTIQuestions(isPremium);
        } else {
            return this.generateSpecializedQuestions(quizType);
        }
    }

    async generateMBTIQuestions(isPremium) {
        // Import Russian questions
        const { MBTI_QUESTIONS_RU } = await import('../../data/MainQuiz.ru.js');

        if (isPremium) {
            return MBTI_QUESTIONS_RU;
        } else {
            return MBTI_QUESTIONS_RU.slice(0, 20);
        }
    }

    async generateSpecializedQuestions(quizType) {
        // Import specialized questions from separate data file
        const { MBTI_SPECIALIZED_QUESTIONS } = await import('../../data/SpecializedQuiz.js');
        
        return MBTI_SPECIALIZED_QUESTIONS[quizType] || [];
    }

    // Utility methods
    getProgress() {
        return {
            current: this.currentQuestionIndex + 1,
            total: this.questions.length,
            percentage: ((this.currentQuestionIndex + 1) / this.questions.length) * 100,
            isAdaptive: this.isAdaptiveMode,
            confidence: this.getCurrentConfidence()
        };
    }

    canGoNext() {
        return this.selectedOption !== null;
    }

    canGoPrevious() {
        return this.currentQuestionIndex > 0;
    }

    getQuizInfo() {
        return QUIZ_TYPES[this.quizType] || QUIZ_TYPES.mbti;
    }

    /**
     * Toggle adaptive mode
     */
    toggleAdaptiveMode() {
        if (this.adaptiveConfig.enabled) {
            this.isAdaptiveMode = !this.isAdaptiveMode;
            if (this.isAdaptiveMode && !this.adaptiveEngine) {
                this.initializeAdaptiveEngine();
            }
            console.log('Adaptive mode:', this.isAdaptiveMode ? 'enabled' : 'disabled');
        }
        return this.isAdaptiveMode;
    }

    /**
     * Get adaptive mode status
     */
    getAdaptiveModeStatus() {
        return {
            enabled: this.adaptiveConfig.enabled,
            active: this.isAdaptiveMode,
            engineAvailable: !!this.adaptiveEngine,
            config: this.adaptiveConfig
        };
    }

    // Development tools
    fillRandomAnswers() {
        if (!stateManager.isDevelopment()) {
            throw new Error('Random answers only available in development mode');
        }

        this.answers = [];
        this.scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

        for (let i = 0; i < this.questions.length; i++) {
            const randomOption = Math.floor(Math.random() * 4) + 1;
            const question = this.questions[i];
            
            this.answers.push({
                questionIndex: i,
                selectedOption: randomOption,
                dimension: question.dimension,
                weights: question.weights
            });

            this.updateScores(question, randomOption);
        }

        this.currentQuestionIndex = this.questions.length;
        return this.completeQuiz();
    }
}

// Export singleton instance
export const quizEngine = new QuizEngine();

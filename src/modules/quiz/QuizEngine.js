/**
 * Enhanced Quiz Engine - Core Quiz Logic with Adaptive Assessment
 * Handles quiz flow, question management, scoring algorithms, and adaptive features
 */
import { stateManager } from '../core/StateManager.js';
import { QUIZ_TYPES } from '../../data/QuizData.ru.js';
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
        this._resetScores();
        this.selectedOption = null;

        // Reset adaptive engine if available
        if (this.adaptiveEngine) {
            this.adaptiveEngine.reset();
        }

        stateManager.resetQuiz();
    }

    _resetScores() {
        if (this.quizType === 'socionics') {
            this.scores = { L: 0, E: 0, I: 0, S: 0, Ex: 0, In: 0, R: 0, Ir: 0 };
        } else if (this.quizType === 'enneagram') {
            this.scores = { HC: 0, HD: 0, BD: 0, H1: 0, D1: 0, B1: 0 };
        } else {
            this.scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        }
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
        const w = question.weights[selectedOption - 1];
        const dim = question.dimension;

        if (this.quizType === 'socionics') {
            if (dim === 'LE') { this.scores.L += w; this.scores.E -= w; }
            else if (dim === 'IN') { this.scores.I += w; this.scores.S -= w; }
            else if (dim === 'EI') { this.scores.Ex += w; this.scores.In -= w; }
            else if (dim === 'RJ') { this.scores.R += w; this.scores.Ir -= w; }
        } else if (this.quizType === 'enneagram') {
            this.scores[dim] = (this.scores[dim] || 0) + w;
        } else {
            // MBTI
            if (dim === 'EI') { this.scores.E += w; this.scores.I -= w; }
            else if (dim === 'SN') { this.scores.S += w; this.scores.N -= w; }
            else if (dim === 'TF') { this.scores.T += w; this.scores.F -= w; }
            else if (dim === 'JP') { this.scores.J += w; this.scores.P -= w; }
        }
    }

    recalculateScores() {
        this._resetScores();

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
        if (this.quizType === 'socionics') return this._calculateSocionicsResults();
        if (this.quizType === 'enneagram') return this._calculateEnneagramResults();
        return this._calculateMBTIResults();
    }

    _calculateMBTIResults() {
        const personalityType = this.calculatePersonalityType();
        const dimensionBreakdown = this.calculateDimensionBreakdown();

        return {
            personalityType,
            dimensionBreakdown,
            dimensions: {
                E: dimensionBreakdown.EI?.E || 50, I: dimensionBreakdown.EI?.I || 50,
                S: dimensionBreakdown.SN?.S || 50, N: dimensionBreakdown.SN?.N || 50,
                T: dimensionBreakdown.TF?.T || 50, F: dimensionBreakdown.TF?.F || 50,
                J: dimensionBreakdown.JP?.J || 50, P: dimensionBreakdown.JP?.P || 50,
            },
            scores: { ...this.scores },
            answers: [...this.answers],
            quizType: this.quizType,
            timestamp: new Date().toISOString(),
            isAdaptive: this.isAdaptiveMode,
            totalQuestions: this.questions.length,
            answeredQuestions: this.answers.length
        };
    }

    async _calculateSocionicsResults() {
        const { SOCIONICS_TYPES } = await import('../../data/SocionicsQuiz.ru.js');
        const s = this.scores;

        // Find matching type via MBTI equivalent mapping
        const mbtiEquiv = this._socionicsToMBTI(s);
        const typeEntry = Object.values(SOCIONICS_TYPES).find(t => t.mbtiEquivalent === mbtiEquiv);

        const typeCode = typeEntry ? typeEntry.code : mbtiEquiv;
        const typeName = typeEntry ? typeEntry.title : typeCode;

        return {
            personalityType: typeCode,
            typeName,
            dimensions: {
                L: this._pct(s.L, s.E), E: this._pct(s.E, s.L),
                I: this._pct(s.I, s.S), S: this._pct(s.S, s.I),
                Ex: this._pct(s.Ex, s.In), In: this._pct(s.In, s.Ex),
                R: this._pct(s.R, s.Ir), Ir: this._pct(s.Ir, s.R),
            },
            scores: { ...this.scores },
            answers: [...this.answers],
            quizType: this.quizType,
            timestamp: new Date().toISOString(),
            totalQuestions: this.questions.length,
            answeredQuestions: this.answers.length
        };
    }

    _socionicsToMBTI(s) {
        return [
            s.Ex > s.In ? 'E' : 'I',
            s.I > s.S ? 'N' : 'S',
            s.L > s.E ? 'T' : 'F',
            s.R > s.Ir ? 'J' : 'P',
        ].join('');
    }

    async _calculateEnneagramResults() {
        const { ENNEAGRAM_TYPES } = await import('../../data/EnneagramQuiz.ru.js');
        const s = this.scores;

        // Determine dominant center
        const centers = [
            { name: 'heart', score: s.HC, types: [2, 3, 4], sub: s.H1 },
            { name: 'head', score: s.HD, types: [5, 6, 7], sub: s.D1 },
            { name: 'body', score: s.BD, types: [8, 9, 1], sub: s.B1 },
        ];
        centers.sort((a, b) => b.score - a.score);
        const dominant = centers[0];

        // Within the dominant center, use sub-dimension to pick type
        // sub > 0 = assertive (3,7,8), sub < 0 = compliant (2,6,1), near 0 = withdrawn (4,5,9)
        let typeNum;
        if (Math.abs(dominant.sub) < 2) {
            typeNum = dominant.types[2]; // withdrawn: 4, 5, 9
        } else if (dominant.sub > 0) {
            typeNum = dominant.types[1]; // assertive: 3, 7, 8
        } else {
            typeNum = dominant.types[0]; // compliant: 2, 6, 1 (mapped as first in array)
        }

        const typeCode = String(typeNum);
        const typeData = ENNEAGRAM_TYPES[typeCode];
        const typeName = typeData ? typeData.title : `Тип ${typeCode}`;

        return {
            personalityType: typeCode,
            typeName,
            dimensions: {
                HC: s.HC, HD: s.HD, BD: s.BD,
                H1: s.H1, D1: s.D1, B1: s.B1,
            },
            scores: { ...this.scores },
            answers: [...this.answers],
            quizType: this.quizType,
            timestamp: new Date().toISOString(),
            totalQuestions: this.questions.length,
            answeredQuestions: this.answers.length
        };
    }

    _pct(a, b) {
        const total = Math.abs(a) + Math.abs(b);
        return total > 0 ? Math.round((Math.max(0, a) / total) * 100) : 50;
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

        if (quizType === 'socionics') {
            return this._generateSocionicsQuestions();
        } else if (quizType === 'enneagram') {
            return this._generateEnneagramQuestions();
        } else if (quizType === 'mbti') {
            return this.generateMBTIQuestions(isPremium);
        } else {
            return this.generateSpecializedQuestions(quizType);
        }
    }

    async generateMBTIQuestions(isPremium) {
        const { MBTI_QUESTIONS_RU } = await import('../../data/MainQuiz.ru.js');
        if (isPremium) {
            return MBTI_QUESTIONS_RU;
        } else {
            return MBTI_QUESTIONS_RU.slice(0, 20);
        }
    }

    async _generateSocionicsQuestions() {
        const { SOCIONICS_QUESTIONS_RU } = await import('../../data/SocionicsQuiz.ru.js');
        return SOCIONICS_QUESTIONS_RU;
    }

    async _generateEnneagramQuestions() {
        const { ENNEAGRAM_QUESTIONS_RU } = await import('../../data/EnneagramQuiz.ru.js');
        return ENNEAGRAM_QUESTIONS_RU;
    }

    async generateSpecializedQuestions(quizType) {
        const { MBTI_SPECIALIZED_QUESTIONS_RU } = await import('../../data/SpecializedQuiz.ru.js');
        return MBTI_SPECIALIZED_QUESTIONS_RU[quizType] || [];
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
        this._resetScores();

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

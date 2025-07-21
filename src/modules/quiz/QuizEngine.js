/**
 * Quiz Engine - Core Quiz Logic and Management
 * Handles quiz flow, question management, and scoring algorithms
 */
import { stateManager } from '../core/StateManager.js';
import { QUIZ_TYPES } from '../../data/QuizData.js';

export class QuizEngine {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        this.selectedOption = null;
        this.quizType = 'mbti';
        
        this.initializeQuiz();
    }

    initializeQuiz() {
        this.quizType = stateManager.getCurrentQuizType();
        this.questions = this.generateQuestions();
        this.resetQuiz();
    }

    resetQuiz() {
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        this.selectedOption = null;
        
        stateManager.resetQuiz();
    }

    startQuiz() {
        this.initializeQuiz();
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
        
        return {
            ...this.questions[this.currentQuestionIndex],
            questionNumber: this.currentQuestionIndex + 1,
            totalQuestions: this.questions.length
        };
    }

    selectOption(optionIndex) {
        this.selectedOption = optionIndex;
        stateManager.set('selectedOption', optionIndex);
    }

    nextQuestion() {
        if (this.selectedOption === null) {
            throw new Error('No option selected');
        }

        // Save current answer
        const currentQuestion = this.questions[this.currentQuestionIndex];
        this.answers.push({
            questionIndex: this.currentQuestionIndex,
            selectedOption: this.selectedOption,
            dimension: currentQuestion.dimension,
            weights: currentQuestion.weights
        });

        // Update scores
        this.updateScores(currentQuestion, this.selectedOption);

        // Update state
        stateManager.updateQuizProgress(
            this.currentQuestionIndex,
            this.selectedOption,
            this.scores
        );

        this.currentQuestionIndex++;
        this.selectedOption = null;

        if (this.currentQuestionIndex >= this.questions.length) {
            return this.completeQuiz();
        }

        return this.getCurrentQuestion();
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            
            // Remove last answer and recalculate scores
            if (this.answers.length > 0) {
                const lastAnswer = this.answers.pop();
                this.recalculateScores();
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
        stateManager.setState({
            currentScreen: 'results',
            lastResults: results
        });
        
        return results;
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
            timestamp: new Date().toISOString()
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
        // Import questions from separate data file
        const { MBTI_QUESTIONS } = await import('../../data/MBTIQuestions.js');
        
        if (isPremium) {
            return MBTI_QUESTIONS.full; // 60 questions
        } else {
            return MBTI_QUESTIONS.free; // 20 questions
        }
    }

    async generateSpecializedQuestions(quizType) {
        // Import specialized questions from separate data file
        const { SPECIALIZED_QUESTIONS } = await import('../../data/SpecializedQuestions.js');
        
        return SPECIALIZED_QUESTIONS[quizType] || [];
    }

    // Utility methods
    getProgress() {
        return {
            current: this.currentQuestionIndex + 1,
            total: this.questions.length,
            percentage: ((this.currentQuestionIndex + 1) / this.questions.length) * 100
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
import { defineStore } from 'pinia'
import type {
  Question,
  Answer,
  MBTIScores,
  QuizResults,
  DimensionBreakdown,
  QuizProgress,
  ConfidenceScores
} from '~/utils/types'
import { DEFAULT_SCORES } from '~/utils/constants'

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    // Quiz configuration
    currentQuizType: 'mbti' as string,
    questions: [] as Question[],
    currentQuestionIndex: 0,

    // User responses
    answers: [] as Answer[],
    scores: { ...DEFAULT_SCORES } as MBTIScores,
    selectedOption: null as number | null,

    // Adaptive features
    isAdaptiveMode: false,
    confidenceScores: {
      EI: 0,
      SN: 0,
      TF: 0,
      JP: 0
    } as ConfidenceScores,

    // Results
    lastResults: null as QuizResults | null,

    // State flags
    isLoading: false,
    error: null as Error | null
  }),

  getters: {
    currentQuestion: (state): Question | null => {
      if (state.currentQuestionIndex >= state.questions.length) {
        return null
      }
      return state.questions[state.currentQuestionIndex]
    },

    progress: (state): QuizProgress => {
      const total = state.questions.length
      const current = state.currentQuestionIndex + 1
      const percentage = total > 0 ? (current / total) * 100 : 0

      return {
        current,
        total,
        percentage,
        isAdaptive: state.isAdaptiveMode,
        confidence: state.isAdaptiveMode ? state.confidenceScores : undefined
      }
    },

    canGoNext: (state) => state.selectedOption !== null,

    canGoPrevious: (state) => state.currentQuestionIndex > 0,

    isQuizComplete: (state) => state.currentQuestionIndex >= state.questions.length,

    personalityType: (state): string => {
      return [
        state.scores.E > state.scores.I ? 'E' : 'I',
        state.scores.S > state.scores.N ? 'S' : 'N',
        state.scores.T > state.scores.F ? 'T' : 'F',
        state.scores.J > state.scores.P ? 'J' : 'P'
      ].join('')
    }
  },

  actions: {
    // Initialize quiz
    initializeQuiz(quizType: string, questions: Question[]) {
      this.currentQuizType = quizType
      this.questions = questions
      this.currentQuestionIndex = 0
      this.answers = []
      this.scores = { ...DEFAULT_SCORES }
      this.selectedOption = null
      this.error = null
    },

    // Reset quiz
    resetQuiz() {
      this.currentQuestionIndex = 0
      this.answers = []
      this.scores = { ...DEFAULT_SCORES }
      this.selectedOption = null
      this.confidenceScores = { EI: 0, SN: 0, TF: 0, JP: 0 }
      this.error = null
    },

    // Select option
    selectOption(optionIndex: number) {
      this.selectedOption = optionIndex
    },

    // Clear selection
    clearSelection() {
      this.selectedOption = null
    },

    // Add answer
    addAnswer(answer: Answer) {
      this.answers.push(answer)
    },

    // Update scores
    updateScores(question: Question, selectedOption: number) {
      const weights = question.weights
      const dimension = question.dimension
      const weight = weights[selectedOption - 1]

      if (dimension === 'EI') {
        this.scores.E += weight
        this.scores.I -= weight
      } else if (dimension === 'SN') {
        this.scores.S += weight
        this.scores.N -= weight
      } else if (dimension === 'TF') {
        this.scores.T += weight
        this.scores.F -= weight
      } else if (dimension === 'JP') {
        this.scores.J += weight
        this.scores.P -= weight
      }
    },

    // Recalculate all scores
    recalculateScores() {
      this.scores = { ...DEFAULT_SCORES }

      this.answers.forEach(answer => {
        const question = this.questions[answer.questionIndex]
        if (question) {
          this.updateScores(question, answer.selectedOption)
        }
      })
    },

    // Move to next question
    incrementQuestion() {
      this.currentQuestionIndex++
    },

    // Move to previous question
    decrementQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--
      }
    },

    // Remove last answer
    removeLastAnswer() {
      if (this.answers.length > 0) {
        this.answers.pop()
        this.recalculateScores()
      }
    },

    // Calculate dimension breakdown
    calculateDimensionBreakdown(): DimensionBreakdown {
      const totalEI = Math.abs(this.scores.E) + Math.abs(this.scores.I)
      const totalSN = Math.abs(this.scores.S) + Math.abs(this.scores.N)
      const totalTF = Math.abs(this.scores.T) + Math.abs(this.scores.F)
      const totalJP = Math.abs(this.scores.J) + Math.abs(this.scores.P)

      const ePercentage = totalEI > 0 ? (this.scores.E / totalEI) * 100 : 50
      const sPercentage = totalSN > 0 ? (this.scores.S / totalSN) * 100 : 50
      const tPercentage = totalTF > 0 ? (this.scores.T / totalTF) * 100 : 50
      const jPercentage = totalJP > 0 ? (this.scores.J / totalJP) * 100 : 50

      return {
        EI: {
          E: Math.max(0, ePercentage),
          I: Math.max(0, 100 - ePercentage),
          preference: this.scores.E > this.scores.I ? 'E' : 'I'
        },
        SN: {
          S: Math.max(0, sPercentage),
          N: Math.max(0, 100 - sPercentage),
          preference: this.scores.S > this.scores.N ? 'S' : 'N'
        },
        TF: {
          T: Math.max(0, tPercentage),
          F: Math.max(0, 100 - tPercentage),
          preference: this.scores.T > this.scores.F ? 'T' : 'F'
        },
        JP: {
          J: Math.max(0, jPercentage),
          P: Math.max(0, 100 - jPercentage),
          preference: this.scores.J > this.scores.P ? 'J' : 'P'
        }
      }
    },

    // Calculate results
    calculateResults(): QuizResults {
      const results: QuizResults = {
        personalityType: this.personalityType,
        dimensionBreakdown: this.calculateDimensionBreakdown(),
        scores: { ...this.scores },
        answers: [...this.answers],
        quizType: this.currentQuizType,
        timestamp: new Date().toISOString(),
        isAdaptive: this.isAdaptiveMode,
        totalQuestions: this.questions.length,
        answeredQuestions: this.answers.length
      }

      return results
    },

    // Set results
    setResults(results: QuizResults) {
      this.lastResults = results

      // Save to localStorage
      if (process.client) {
        try {
          localStorage.setItem('mbti_last_results', JSON.stringify(results))
        } catch (error) {
          console.warn('Failed to save results to localStorage:', error)
        }
      }
    },

    // Update confidence scores (for adaptive mode)
    updateConfidenceScores(scores: ConfidenceScores) {
      this.confidenceScores = { ...scores }
    },

    // Toggle adaptive mode
    toggleAdaptiveMode() {
      this.isAdaptiveMode = !this.isAdaptiveMode
    },

    // Set loading state
    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    // Set error
    setError(error: Error | null) {
      this.error = error
    },

    // Load from localStorage
    loadFromStorage() {
      if (process.client) {
        try {
          const savedResults = localStorage.getItem('mbti_last_results')
          if (savedResults) {
            this.lastResults = JSON.parse(savedResults)
          }
        } catch (error) {
          console.warn('Failed to load from localStorage:', error)
        }
      }
    }
  }
})

import { defineStore } from 'pinia'

export interface QuizState {
  currentQuestionIndex: number
  answers: Record<number, number>
  quizType: string
  isQuizActive: boolean
  isPremium: boolean
  results: any | null
}

export const useQuizStore = defineStore('quiz', {
  state: (): QuizState => ({
    currentQuestionIndex: 0,
    answers: {},
    quizType: 'mbti',
    isQuizActive: false,
    isPremium: false,
    results: null
  }),

  getters: {
    totalAnswered: (state) => Object.keys(state.answers).length,
    currentAnswer: (state) => state.answers[state.currentQuestionIndex],
    hasAnswer: (state) => state.currentQuestionIndex in state.answers
  },

  actions: {
    startQuiz(type: string = 'mbti') {
      this.quizType = type
      this.isQuizActive = true
      this.currentQuestionIndex = 0
      this.answers = {}
      this.results = null
    },

    setAnswer(questionIndex: number, answerValue: number) {
      this.answers[questionIndex] = answerValue
    },

    nextQuestion() {
      this.currentQuestionIndex++
    },

    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--
      }
    },

    resetQuiz() {
      this.currentQuestionIndex = 0
      this.answers = {}
      this.isQuizActive = false
      this.results = null
    },

    unlockPremium() {
      this.isPremium = true
    },

    setResults(results: any) {
      this.results = results
    }
  }
})

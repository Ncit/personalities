import type { Question, Answer } from '~/utils/types'

export const useQuiz = () => {
  const quizStore = useQuizStore()
  const userStore = useUserStore()
  const uiStore = useUIStore()
  const router = useRouter()
  const { trackQuizEvent } = useAnalytics()

  /**
   * Start a new quiz
   */
  const startQuiz = async (quizType: string = 'mbti') => {
    try {
      uiStore.setLoading(true, 'Loading quiz...')

      // Load questions
      const questions = await loadQuestions(quizType, userStore.isPremium)

      // Initialize quiz
      quizStore.initializeQuiz(quizType, questions)

      // Track event
      trackQuizEvent('started', {
        quiz_type: quizType,
        question_count: questions.length
      })

      // Navigate to quiz page
      await router.push(`/quiz/${quizType}`)

      uiStore.setScreen('quiz')
    } catch (error) {
      uiStore.setError(error as Error)
      throw error
    } finally {
      uiStore.setLoading(false)
    }
  }

  /**
   * Load questions for quiz type
   */
  const loadQuestions = async (quizType: string, isPremium: boolean): Promise<Question[]> => {
    // Import question loader utility
    const { loadQuestions: loadQuestionsUtil } = await import('~/utils/questionLoader')
    return loadQuestionsUtil(quizType, isPremium)
  }

  /**
   * Select an option
   */
  const selectOption = (optionIndex: number) => {
    quizStore.selectOption(optionIndex)
  }

  /**
   * Move to next question
   */
  const nextQuestion = async () => {
    if (!quizStore.canGoNext) {
      uiStore.showWarning('Please select an option')
      return
    }

    const currentQuestion = quizStore.currentQuestion
    if (!currentQuestion) return

    // Create answer record
    const answer: Answer = {
      questionIndex: quizStore.currentQuestionIndex,
      selectedOption: quizStore.selectedOption!,
      dimension: currentQuestion.dimension,
      weights: currentQuestion.weights,
      timestamp: Date.now(),
      questionType: currentQuestion.type,
      difficulty: currentQuestion.difficulty,
      questionId: currentQuestion.id
    }

    // Add answer
    quizStore.addAnswer(answer)

    // Update scores
    quizStore.updateScores(currentQuestion, quizStore.selectedOption!)

    // Track event
    trackQuizEvent('question_answered', {
      question_number: quizStore.currentQuestionIndex + 1,
      dimension: currentQuestion.dimension
    })

    // Clear selection
    quizStore.clearSelection()

    // Move to next question
    quizStore.incrementQuestion()

    // Check if quiz is complete
    if (quizStore.isQuizComplete) {
      await completeQuiz()
    }
  }

  /**
   * Move to previous question
   */
  const previousQuestion = () => {
    if (!quizStore.canGoPrevious) {
      return
    }

    // Remove last answer
    quizStore.removeLastAnswer()

    // Move to previous question
    quizStore.decrementQuestion()

    // Clear selection
    quizStore.clearSelection()
  }

  /**
   * Complete quiz and calculate results
   */
  const completeQuiz = async () => {
    try {
      uiStore.setLoading(true, 'Calculating results...')

      // Calculate results
      const results = quizStore.calculateResults()

      // Save results
      quizStore.setResults(results)

      // Add to user history
      userStore.addToHistory({
        quizType: results.quizType,
        results,
        date: results.timestamp
      })

      // Track completion
      trackQuizEvent('completed', {
        personality_type: results.personalityType,
        quiz_type: results.quizType,
        questions_answered: results.answeredQuestions
      })

      // Navigate to results
      await router.push('/quiz/results')

      uiStore.setScreen('results')
      uiStore.showSuccess('Quiz completed successfully!')
    } catch (error) {
      uiStore.setError(error as Error)
      throw error
    } finally {
      uiStore.setLoading(false)
    }
  }

  /**
   * Reset quiz
   */
  const resetQuiz = () => {
    quizStore.resetQuiz()
    uiStore.setScreen('welcome')
    router.push('/')
  }

  /**
   * Restart current quiz
   */
  const restartQuiz = async () => {
    const confirmed = confirm('Are you sure you want to restart the quiz? All progress will be lost.')
    if (!confirmed) return

    const quizType = quizStore.currentQuizType
    quizStore.resetQuiz()

    await startQuiz(quizType)
  }

  /**
   * Exit quiz with confirmation
   */
  const exitQuiz = async () => {
    if (quizStore.answers.length > 0) {
      uiStore.openModal('exitQuiz')
    } else {
      await resetQuiz()
    }
  }

  /**
   * Confirm exit quiz
   */
  const confirmExitQuiz = async () => {
    uiStore.closeModal('exitQuiz')
    await resetQuiz()
  }

  return {
    // State
    currentQuestion: computed(() => quizStore.currentQuestion),
    progress: computed(() => quizStore.progress),
    selectedOption: computed(() => quizStore.selectedOption),
    canGoNext: computed(() => quizStore.canGoNext),
    canGoPrevious: computed(() => quizStore.canGoPrevious),
    isQuizComplete: computed(() => quizStore.isQuizComplete),
    lastResults: computed(() => quizStore.lastResults),

    // Actions
    startQuiz,
    selectOption,
    nextQuestion,
    previousQuestion,
    completeQuiz,
    resetQuiz,
    restartQuiz,
    exitQuiz,
    confirmExitQuiz
  }
}

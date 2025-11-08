<template>
  <div class="min-h-screen">
    <!-- Welcome Screen -->
    <div v-if="!quizStore.isQuizActive" class="card p-8 max-w-4xl mx-auto my-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          {{ $t('ui.welcomeTitle') }}
        </h2>
        <p class="text-gray-600 mb-8">
          {{ $t('quizTypes.mbti.description') }}
        </p>

        <div class="grid md:grid-cols-2 gap-4 mb-8">
          <div class="p-4 bg-blue-50 rounded-lg">
            <Icon name="mdi:lightbulb-on" class="text-3xl text-blue-600 mb-2" />
            <h3 class="font-semibold text-blue-900">{{ $t('ui.dimensionEI') }}</h3>
            <p class="text-sm text-blue-700">{{ $t('ui.dimensionEIDesc') }}</p>
          </div>
          <div class="p-4 bg-purple-50 rounded-lg">
            <Icon name="mdi:eye" class="text-3xl text-purple-600 mb-2" />
            <h3 class="font-semibold text-purple-900">{{ $t('ui.dimensionSN') }}</h3>
            <p class="text-sm text-purple-700">{{ $t('ui.dimensionSNDesc') }}</p>
          </div>
          <div class="p-4 bg-green-50 rounded-lg">
            <Icon name="mdi:head-cog" class="text-3xl text-green-600 mb-2" />
            <h3 class="font-semibold text-green-900">{{ $t('ui.dimensionTF') }}</h3>
            <p class="text-sm text-green-700">{{ $t('ui.dimensionTFDesc') }}</p>
          </div>
          <div class="p-4 bg-orange-50 rounded-lg">
            <Icon name="mdi:compass" class="text-3xl text-orange-600 mb-2" />
            <h3 class="font-semibold text-orange-900">{{ $t('ui.dimensionJP') }}</h3>
            <p class="text-sm text-orange-700">{{ $t('ui.dimensionJPDesc') }}</p>
          </div>
        </div>

        <div class="flex gap-4 justify-center">
          <button
            @click="startQuiz"
            class="btn btn-primary text-lg px-8 py-3"
          >
            <Icon name="mdi:play" />
            {{ $t('ui.startQuiz') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Quiz Questions -->
    <div v-else-if="!showResults">
      <QuizQuestion
        :question="currentQuestion"
        :current-question="quizStore.currentQuestionIndex"
        :total-questions="questions.length"
        v-model="currentAnswer"
        @next="handleNext"
        @previous="handlePrevious"
      />
    </div>

    <!-- Results -->
    <div v-else class="card p-8 max-w-4xl mx-auto my-8">
      <div class="text-center">
        <Icon name="mdi:trophy" class="text-6xl text-yellow-500 mb-4" />
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          Тест завершен!
        </h2>
        <p class="text-gray-600 mb-8">
          Спасибо за прохождение теста. Ваши результаты обрабатываются...
        </p>

        <div class="bg-gray-50 rounded-lg p-6 mb-6">
          <p class="text-sm text-gray-600 mb-4">
            Полный анализ результатов и определение вашего типа личности будет доступно после интеграции всех модулей.
          </p>
          <div class="text-2xl font-bold text-primary-600 mb-2">
            Вы ответили на {{ questions.length }} вопросов
          </div>
        </div>

        <button @click="restartQuiz" class="btn btn-primary text-lg px-8 py-3">
          <Icon name="mdi:restart" />
          Пройти тест заново
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { MBTI_QUESTIONS } from '~/data/quizData'

const { t } = useI18n()
const quizStore = useQuizStore()

const questions = ref(MBTI_QUESTIONS)
const currentAnswer = ref<number | null>(null)
const showResults = ref(false)

const currentQuestion = computed(() => questions.value[quizStore.currentQuestionIndex])

const startQuiz = () => {
  // Track event only on client side
  if (process.client) {
    const { trackQuizEvent } = useFirebase()
    trackQuizEvent('start', 'mbti')
  }

  quizStore.startQuiz('mbti')
  currentAnswer.value = quizStore.currentAnswer
}

const handleNext = () => {
  if (currentAnswer.value !== null) {
    quizStore.setAnswer(quizStore.currentQuestionIndex, currentAnswer.value)

    if (quizStore.currentQuestionIndex < questions.value.length - 1) {
      quizStore.nextQuestion()
      currentAnswer.value = quizStore.currentAnswer
    } else {
      // Quiz completed
      showResults.value = true
      if (process.client) {
        const { trackQuizEvent } = useFirebase()
        trackQuizEvent('complete', 'mbti')
      }
    }
  }
}

const handlePrevious = () => {
  quizStore.previousQuestion()
  currentAnswer.value = quizStore.currentAnswer
}

const restartQuiz = () => {
  quizStore.resetQuiz()
  showResults.value = false
  currentAnswer.value = null
}

// Watch for changes in current question to load saved answer
watch(() => quizStore.currentQuestionIndex, () => {
  currentAnswer.value = quizStore.currentAnswer
})
</script>

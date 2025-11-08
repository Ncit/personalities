<template>
  <div class="min-h-screen">
    <!-- Quiz Selection Screen -->
    <div v-if="!quizStore.isQuizActive && !showQuizSelection" class="card p-8 max-w-6xl mx-auto my-8">
      <div class="text-center mb-8">
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
            @click="startQuiz('mbti')"
            class="btn btn-primary text-lg px-8 py-3"
          >
            <Icon name="mdi:play" />
            {{ $t('ui.startQuiz') }}
          </button>
          <button
            @click="showQuizSelection = true"
            class="btn btn-secondary text-lg px-8 py-3"
          >
            <Icon name="mdi:format-list-bulleted" />
            Все тесты
          </button>
        </div>
      </div>
    </div>

    <!-- All Quizzes Selection -->
    <div v-else-if="showQuizSelection && !quizStore.isQuizActive" class="card p-8 max-w-6xl mx-auto my-8">
      <div class="mb-6">
        <button @click="showQuizSelection = false" class="btn btn-outline mb-4">
          <Icon name="mdi:arrow-left" />
          Назад
        </button>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          Выберите тест
        </h2>
        <p class="text-gray-600">
          Пройдите специализированные тесты для глубокого понимания вашей личности
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Main MBTI Quiz -->
        <div class="card p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-primary-200" @click="startQuiz('mbti')">
          <div class="flex items-start justify-between mb-3">
            <Icon name="mdi:brain" class="text-4xl text-primary-600" />
            <span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Бесплатно</span>
          </div>
          <h3 class="font-bold text-lg text-gray-900 mb-2">MBTI Тест</h3>
          <p class="text-sm text-gray-600 mb-4">{{ $t('quizTypes.mbti.description') }}</p>
          <button class="btn btn-primary w-full">
            Начать
          </button>
        </div>

        <!-- Premium Quizzes -->
        <QuizCard
          v-for="quiz in premiumQuizzes"
          :key="quiz.id"
          :quiz="quiz"
          :is-locked="!quizStore.isPremium"
          @start="startQuiz(quiz.id)"
          @unlock="showPremiumModal = true"
        />
      </div>
    </div>

    <!-- Quiz Questions -->
    <div v-else-if="quizStore.isQuizActive && !showResults">
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
    <div v-else-if="showResults" class="card p-8 max-w-4xl mx-auto my-8">
      <div class="text-center">
        <Icon name="mdi:trophy" class="text-6xl text-yellow-500 mb-4" />
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          Тест завершен!
        </h2>
        <p class="text-gray-600 mb-8">
          Спасибо за прохождение теста {{ quizTypeNames[quizStore.quizType] || 'MBTI' }}
        </p>

        <div class="bg-gray-50 rounded-lg p-6 mb-6">
          <p class="text-sm text-gray-600 mb-4">
            Полный анализ результатов и определение вашего типа личности будет доступно после интеграции всех модулей.
          </p>
          <div class="text-2xl font-bold text-primary-600 mb-2">
            Вы ответили на {{ questions.length }} вопросов
          </div>
        </div>

        <div class="flex gap-4 justify-center">
          <button @click="restartQuiz" class="btn btn-primary text-lg px-8 py-3">
            <Icon name="mdi:restart" />
            Пройти другой тест
          </button>
          <button @click="viewResults" class="btn btn-secondary text-lg px-8 py-3">
            <Icon name="mdi:chart-bar" />
            Подробные результаты
          </button>
        </div>
      </div>
    </div>

    <!-- Premium Modal -->
    <PremiumModal v-model="showPremiumModal" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { QUIZ_QUESTIONS_MAP } from '~/data/quizData'

const { t } = useI18n()
const quizStore = useQuizStore()

const questions = ref(QUIZ_QUESTIONS_MAP.mbti)
const currentAnswer = ref<number | null>(null)
const showResults = ref(false)
const showQuizSelection = ref(false)
const showPremiumModal = ref(false)

const premiumQuizzes = [
  {
    id: 'leadership',
    name: 'Стиль лидерства',
    description: 'Откройте свой подход к лидерству и предпочтения',
    icon: 'mdi:account-group'
  },
  {
    id: 'communication',
    name: 'Стиль общения',
    description: 'Поймите, как вы общаетесь с другими',
    icon: 'mdi:message-text'
  },
  {
    id: 'stress',
    name: 'Реакция на стресс',
    description: 'Узнайте, как вы справляетесь со стрессом',
    icon: 'mdi:emoticon-stressed'
  },
  {
    id: 'learning',
    name: 'Стиль обучения',
    description: 'Найдите свой оптимальный метод обучения',
    icon: 'mdi:school'
  },
  {
    id: 'relationships',
    name: 'Динамика отношений',
    description: 'Изучите свои паттерны отношений',
    icon: 'mdi:heart-multiple'
  },
  {
    id: 'creativity',
    name: 'Креативность и инновации',
    description: 'Раскройте свой творческий потенциал',
    icon: 'mdi:lightbulb-on'
  },
  {
    id: 'decision',
    name: 'Принятие решений',
    description: 'Поймите свои процессы принятия решений',
    icon: 'mdi:scale-balance'
  },
  {
    id: 'career',
    name: 'Карьерные предпочтения',
    description: 'Найдите свою идеальную рабочую среду',
    icon: 'mdi:briefcase'
  }
]

const quizTypeNames: Record<string, string> = {
  mbti: 'MBTI',
  leadership: 'Стиль лидерства',
  communication: 'Стиль общения',
  stress: 'Реакция на стресс',
  learning: 'Стиль обучения',
  relationships: 'Динамика отношений',
  creativity: 'Креативность',
  decision: 'Принятие решений',
  career: 'Карьерные предпочтения'
}

const currentQuestion = computed(() => questions.value[quizStore.currentQuestionIndex])

const startQuiz = (type: string) => {
  // Track event only on client side
  if (process.client) {
    const { trackQuizEvent } = useFirebase()
    trackQuizEvent('start', type)
  }

  // Load appropriate questions for the quiz type
  questions.value = QUIZ_QUESTIONS_MAP[type] || QUIZ_QUESTIONS_MAP.mbti

  showQuizSelection.value = false
  quizStore.startQuiz(type)
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
        trackQuizEvent('complete', quizStore.quizType)
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
  showQuizSelection.value = true
}

const viewResults = () => {
  // TODO: Navigate to detailed results page
  alert('Подробные результаты будут доступны в следующей версии')
}

// Watch for changes in current question to load saved answer
watch(() => quizStore.currentQuestionIndex, () => {
  currentAnswer.value = quizStore.currentAnswer
})
</script>

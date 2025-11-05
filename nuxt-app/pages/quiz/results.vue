<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- Results Header -->
    <div class="text-center mb-8">
      <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
        {{ t('results.title') }}
      </h1>
      <p class="text-xl text-white/90">
        {{ t('results.subtitle') }}
      </p>
    </div>

    <div v-if="results" class="space-y-8">
      <!-- Personality Card -->
      <PersonalityCard
        :personality-type="results.personalityType"
        :type-data="typeData"
      />

      <!-- Dimension Breakdown -->
      <DimensionBreakdown :breakdown="results.dimensionBreakdown" />

      <!-- Adaptive Analytics (if available) -->
      <Card v-if="results.isAdaptive && results.adaptiveAnalytics" padding="lg">
        <h3 class="text-2xl font-bold text-gray-800 mb-4">
          {{ t('results.adaptiveInsights') }}
        </h3>

        <div class="grid md:grid-cols-3 gap-4">
          <div class="bg-blue-50 rounded-lg p-4">
            <div class="text-3xl font-bold text-blue-600 mb-1">
              {{ results.answeredQuestions }}
            </div>
            <div class="text-sm text-gray-600">
              {{ t('results.questionsAnswered') }}
            </div>
          </div>

          <div class="bg-green-50 rounded-lg p-4">
            <div class="text-3xl font-bold text-green-600 mb-1">
              {{ results.adaptiveAnalytics.questionsSaved }}
            </div>
            <div class="text-sm text-gray-600">
              {{ t('results.questionsSaved') }}
            </div>
          </div>

          <div class="bg-purple-50 rounded-lg p-4">
            <div class="text-3xl font-bold text-purple-600 mb-1">
              {{ Math.round(results.adaptiveAnalytics.assessmentEfficiency) }}%
            </div>
            <div class="text-sm text-gray-600">
              {{ t('results.efficiency') }}
            </div>
          </div>
        </div>
      </Card>

      <!-- Action Buttons -->
      <Card padding="lg">
        <div class="flex flex-col sm:flex-row gap-4">
          <Button
            variant="primary"
            size="lg"
            full-width
            @click="handleShare"
          >
            📤 {{ t('results.share') }}
          </Button>

          <Button
            variant="outline"
            size="lg"
            full-width
            @click="handleRestart"
          >
            🔄 {{ t('results.restart') }}
          </Button>

          <Button
            variant="outline"
            size="lg"
            full-width
            @click="handleGoHome"
          >
            🏠 {{ t('results.home') }}
          </Button>
        </div>
      </Card>

      <!-- Quiz Info -->
      <Card padding="sm">
        <div class="text-center text-sm text-gray-600">
          <p>
            {{ t('results.completedOn') }}:
            {{ formatDate(results.timestamp) }}
          </p>
          <p v-if="results.isAdaptive" class="text-primary font-medium mt-1">
            ⚡ {{ t('results.adaptiveMode') }}
          </p>
        </div>
      </Card>
    </div>

    <!-- No Results -->
    <Card v-else class="text-center" padding="lg">
      <p class="text-gray-600 mb-6">{{ t('results.noResults') }}</p>
      <Button
        variant="primary"
        @click="handleStartQuiz"
      >
        {{ t('welcome.startButton') }}
      </Button>
    </Card>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const router = useRouter()
const quizStore = useQuizStore()
const { shareResults } = useVKBridge()
const { startQuiz } = useQuiz()

const results = computed(() => quizStore.lastResults)

// Mock personality type data - would be loaded from data files
const typeData = computed(() => {
  if (!results.value) return undefined

  // This would be loaded from the actual personality types data
  return {
    code: results.value.personalityType,
    title: 'The Architect',
    subtitle: 'Strategic Thinker',
    description: 'Innovative thinkers with an unquenchable thirst for knowledge.',
    traits: ['Strategic', 'Analytical', 'Independent', 'Innovative'],
    strengths: ['Planning', 'Problem-solving', 'Innovation', 'Analysis', 'Independence'],
    weaknesses: ['Social interaction', 'Emotional expression', 'Patience', 'Flexibility'],
    percentage: 2
  }
})

const handleShare = async () => {
  if (!results.value) return

  const shareText = t('results.shareText', {
    type: results.value.personalityType
  })

  await shareResults(results.value.personalityType, shareText)
}

const handleRestart = async () => {
  await startQuiz('mbti')
}

const handleGoHome = () => {
  router.push('/')
}

const handleStartQuiz = async () => {
  await startQuiz('mbti')
}

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString()
}

// Set page metadata
useHead({
  title: `${t('results.title')} - ${t('app.title')}`
})
</script>

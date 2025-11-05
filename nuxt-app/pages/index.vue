<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- Hero Section -->
    <div class="text-center mb-12">
      <h1 class="text-4xl md:text-6xl font-bold text-white mb-4">
        {{ t('welcome.title') }}
      </h1>
      <p class="text-xl md:text-2xl text-white/90 mb-8">
        {{ t('welcome.subtitle') }}
      </p>

      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button
          size="lg"
          @click="handleStartQuiz"
        >
          {{ t('welcome.startButton') }}
        </Button>

        <Button
          v-if="lastResults"
          variant="outline"
          size="lg"
          @click="handleViewResults"
        >
          {{ t('welcome.viewResults') }}
        </Button>
      </div>
    </div>

    <!-- Main Quiz Card -->
    <Card class="mb-8 max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">
        {{ t('welcome.aboutQuiz') }}
      </h2>
      <p class="text-gray-700 mb-6">
        {{ t('welcome.description') }}
      </p>

      <!-- Features Grid -->
      <div class="grid md:grid-cols-2 gap-4 mb-6">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <span class="text-xl">📊</span>
          </div>
          <div>
            <h3 class="font-semibold text-gray-800 mb-1">{{ t('welcome.features.comprehensive') }}</h3>
            <p class="text-sm text-gray-600">{{ t('welcome.features.comprehensiveDesc') }}</p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <span class="text-xl">🎯</span>
          </div>
          <div>
            <h3 class="font-semibold text-gray-800 mb-1">{{ t('welcome.features.accurate') }}</h3>
            <p class="text-sm text-gray-600">{{ t('welcome.features.accurateDesc') }}</p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <span class="text-xl">⚡</span>
          </div>
          <div>
            <h3 class="font-semibold text-gray-800 mb-1">{{ t('welcome.features.adaptive') }}</h3>
            <p class="text-sm text-gray-600">{{ t('welcome.features.adaptiveDesc') }}</p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <span class="text-xl">🔒</span>
          </div>
          <div>
            <h3 class="font-semibold text-gray-800 mb-1">{{ t('welcome.features.private') }}</h3>
            <p class="text-sm text-gray-600">{{ t('welcome.features.privateDesc') }}</p>
          </div>
        </div>
      </div>

      <!-- Start Quiz Button -->
      <Button
        variant="primary"
        size="lg"
        full-width
        @click="handleStartQuiz"
      >
        {{ t('welcome.startButton') }}
      </Button>
    </Card>

    <!-- Premium Section -->
    <div v-if="!isPremium" class="max-w-4xl mx-auto">
      <Card :hover="true" padding="lg">
        <div class="text-center">
          <h3 class="text-2xl font-bold text-gray-800 mb-2">
            {{ t('premium.title') }}
          </h3>
          <p class="text-gray-600 mb-6">
            {{ t('premium.description') }}
          </p>

          <div class="grid md:grid-cols-2 gap-4 mb-6">
            <div class="bg-primary/5 rounded-lg p-4 text-left">
              <h4 class="font-semibold text-gray-800 mb-2">{{ t('premium.free') }}</h4>
              <ul class="space-y-2 text-sm text-gray-600">
                <li class="flex items-center gap-2">
                  <span class="text-green-500">✓</span>
                  {{ t('premium.features.basic') }}
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-green-500">✓</span>
                  {{ t('premium.features.results') }}
                </li>
              </ul>
            </div>

            <div class="bg-gradient-to-br from-primary to-purple-600 rounded-lg p-4 text-left text-white">
              <h4 class="font-semibold mb-2">{{ t('premium.premiumTitle') }}</h4>
              <ul class="space-y-2 text-sm">
                <li class="flex items-center gap-2">
                  <span>✓</span>
                  {{ t('premium.features.full') }}
                </li>
                <li class="flex items-center gap-2">
                  <span>✓</span>
                  {{ t('premium.features.specialized') }}
                </li>
                <li class="flex items-center gap-2">
                  <span>✓</span>
                  {{ t('premium.features.detailed') }}
                </li>
                <li class="flex items-center gap-2">
                  <span>✓</span>
                  {{ t('premium.features.pdf') }}
                </li>
              </ul>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            @click="handlePremiumUpgrade"
          >
            {{ t('premium.unlock') }}
          </Button>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const router = useRouter()
const quizStore = useQuizStore()
const userStore = useUserStore()
const { startQuiz } = useQuiz()
const { showOrderBox } = useVKBridge()

const lastResults = computed(() => quizStore.lastResults)
const isPremium = computed(() => userStore.isPremium)

const handleStartQuiz = async () => {
  await startQuiz('mbti')
}

const handleViewResults = () => {
  router.push('/quiz/results')
}

const handlePremiumUpgrade = async () => {
  await showOrderBox('premium_subscription')
}

// Set page metadata
useHead({
  title: t('app.title'),
  meta: [
    { name: 'description', content: t('app.description') }
  ]
})
</script>

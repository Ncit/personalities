<template>
  <div class="min-h-screen">
    <div class="card p-8 max-w-4xl mx-auto my-8">
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
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const startQuiz = () => {
  // Track event only on client side
  if (process.client) {
    const { trackQuizEvent } = useFirebase()
    trackQuizEvent('start', 'mbti')
  }
  // TODO: Implement quiz start logic
  console.log('Starting quiz...')
}
</script>

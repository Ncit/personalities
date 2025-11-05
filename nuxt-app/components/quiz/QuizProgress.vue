<template>
  <div class="quiz-progress">
    <Progress
      :value="progress.current"
      :max="progress.total"
      :label="label"
      :show-percentage="true"
      size="lg"
    />

    <!-- Adaptive Mode Indicator -->
    <div v-if="progress.isAdaptive && progress.confidence" class="mt-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">
          {{ t('quiz.confidenceLevels') }}
        </span>
        <span class="text-xs text-gray-500">
          {{ t('quiz.adaptiveMode') }}
        </span>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          v-for="(value, dimension) in progress.confidence"
          :key="dimension"
          class="bg-white rounded-lg p-3 shadow-sm"
        >
          <div class="text-xs text-gray-500 mb-1 font-medium">{{ dimension }}</div>
          <div class="flex items-center gap-2">
            <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                :class="getConfidenceBarClass(value)"
                class="h-full rounded-full transition-all duration-500"
                :style="{ width: `${value * 100}%` }"
              />
            </div>
            <span class="text-xs font-bold" :class="getConfidenceTextClass(value)">
              {{ Math.round(value * 100) }}%
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QuizProgress as QuizProgressType } from '~/utils/types'

interface Props {
  progress: QuizProgressType
  label?: string
}

withDefaults(defineProps<Props>(), {
  label: 'Progress'
})

const { t } = useI18n()

const getConfidenceBarClass = (value: number) => {
  if (value >= 0.85) return 'bg-green-500'
  if (value >= 0.7) return 'bg-blue-500'
  if (value >= 0.5) return 'bg-yellow-500'
  return 'bg-gray-400'
}

const getConfidenceTextClass = (value: number) => {
  if (value >= 0.85) return 'text-green-600'
  if (value >= 0.7) return 'text-blue-600'
  if (value >= 0.5) return 'text-yellow-600'
  return 'text-gray-600'
}
</script>

<template>
  <Card :hover="false" padding="lg">
    <!-- Question Number Badge -->
    <div class="mb-4">
      <span class="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
        {{ t('quiz.progress', { current: questionNumber, total: totalQuestions }) }}
      </span>
    </div>

    <!-- Question Text -->
    <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6 leading-relaxed">
      {{ question }}
    </h2>

    <!-- Adaptive Indicators (if applicable) -->
    <div v-if="isAdaptive && confidence" class="mt-4 pt-4 border-t border-gray-200">
      <p class="text-sm text-gray-600 mb-2">{{ t('quiz.adaptiveMode') }}</p>
      <div class="grid grid-cols-4 gap-2">
        <div
          v-for="(value, dimension) in confidence"
          :key="dimension"
          class="text-center"
        >
          <div class="text-xs text-gray-500 mb-1">{{ dimension }}</div>
          <div class="text-sm font-bold" :class="getConfidenceColor(value)">
            {{ Math.round(value * 100) }}%
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import type { ConfidenceScores } from '~/utils/types'

interface Props {
  question: string
  questionNumber: number
  totalQuestions: number
  isAdaptive?: boolean
  confidence?: ConfidenceScores
}

defineProps<Props>()

const { t } = useI18n()

const getConfidenceColor = (value: number) => {
  if (value >= 0.85) return 'text-green-600'
  if (value >= 0.7) return 'text-blue-600'
  if (value >= 0.5) return 'text-yellow-600'
  return 'text-gray-600'
}
</script>

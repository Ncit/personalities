<template>
  <div class="card p-8 max-w-4xl mx-auto my-8 animate-fade-in">
    <!-- Progress Bar -->
    <div class="mb-6">
      <div class="flex justify-between text-sm text-gray-600 mb-2">
        <span>Вопрос {{ currentQuestion + 1 }} из {{ totalQuestions }}</span>
        <span>{{ Math.round((currentQuestion / totalQuestions) * 100) }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-primary-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${(currentQuestion / totalQuestions) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- Question -->
    <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">
      {{ question.question }}
    </h2>

    <!-- Options -->
    <div class="space-y-3 mb-8">
      <button
        v-for="(option, index) in question.options"
        :key="index"
        @click="selectAnswer(index)"
        :class="[
          'w-full p-4 text-left rounded-lg border-2 transition-all duration-200',
          selectedAnswer === index
            ? 'border-primary-600 bg-primary-50 shadow-md'
            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
        ]"
      >
        <div class="flex items-center gap-3">
          <div
            :class="[
              'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
              selectedAnswer === index
                ? 'border-primary-600 bg-primary-600'
                : 'border-gray-300'
            ]"
          >
            <Icon
              v-if="selectedAnswer === index"
              name="mdi:check"
              class="text-white text-lg"
            />
          </div>
          <span class="text-gray-800">{{ option }}</span>
        </div>
      </button>
    </div>

    <!-- Navigation -->
    <div class="flex justify-between items-center">
      <button
        v-if="currentQuestion > 0"
        @click="$emit('previous')"
        class="btn btn-outline"
      >
        <Icon name="mdi:arrow-left" />
        {{ $t('ui.previousQuestion') }}
      </button>
      <div v-else></div>

      <button
        @click="handleNext"
        :disabled="selectedAnswer === null"
        :class="[
          'btn',
          selectedAnswer !== null ? 'btn-primary' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        ]"
      >
        {{ isLastQuestion ? 'Завершить' : $t('ui.nextQuestion') }}
        <Icon :name="isLastQuestion ? 'mdi:check' : 'mdi:arrow-right'" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { QuizQuestion as Question } from '~/data/quizData'

const { t } = useI18n()

const props = defineProps<{
  question: Question
  currentQuestion: number
  totalQuestions: number
  modelValue: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
  'next': []
  'previous': []
}>()

const selectedAnswer = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isLastQuestion = computed(() => props.currentQuestion === props.totalQuestions - 1)

const selectAnswer = (index: number) => {
  selectedAnswer.value = index
}

const handleNext = () => {
  if (selectedAnswer.value !== null) {
    emit('next')
  }
}
</script>

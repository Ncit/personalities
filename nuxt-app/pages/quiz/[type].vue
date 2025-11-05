<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Progress Bar -->
    <QuizProgress
      v-if="progress"
      :progress="progress"
      :label="t('quiz.yourProgress')"
      class="mb-8"
    />

    <!-- Question Card -->
    <QuestionCard
      v-if="currentQuestion"
      :question="currentQuestion.question"
      :question-number="progress?.current || 0"
      :total-questions="progress?.total || 0"
      :is-adaptive="progress?.isAdaptive"
      :confidence="progress?.confidence"
      class="mb-6"
    />

    <!-- Options -->
    <OptionsGroup
      v-if="currentQuestion"
      :options="currentQuestion.options"
      :selected="selectedOption"
      @select="selectOption"
      class="mb-8"
    />

    <!-- Navigation Buttons -->
    <div class="flex flex-col sm:flex-row gap-4 justify-between">
      <Button
        variant="outline"
        :disabled="!canGoPrevious"
        @click="previousQuestion"
        class="order-2 sm:order-1"
      >
        ← {{ t('quiz.previous') }}
      </Button>

      <div class="flex gap-4 order-1 sm:order-2">
        <Button
          variant="secondary"
          @click="handleExit"
        >
          {{ t('quiz.exit') }}
        </Button>

        <Button
          variant="primary"
          :disabled="!canGoNext"
          @click="nextQuestion"
        >
          {{ t('quiz.next') }} →
        </Button>
      </div>
    </div>

    <!-- Exit Confirmation Modal -->
    <Modal
      v-model="uiStore.modals.exitQuiz"
      :title="t('quiz.exitTitle')"
      size="sm"
    >
      <p class="text-gray-700 mb-6">{{ t('quiz.exitConfirm') }}</p>

      <template #footer>
        <div class="flex gap-3 justify-end">
          <Button
            variant="outline"
            @click="uiStore.closeModal('exitQuiz')"
          >
            {{ t('common.cancel') }}
          </Button>
          <Button
            variant="danger"
            @click="confirmExitQuiz"
          >
            {{ t('common.confirm') }}
          </Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const uiStore = useUIStore()

const {
  currentQuestion,
  progress,
  selectedOption,
  canGoNext,
  canGoPrevious,
  selectOption,
  nextQuestion,
  previousQuestion,
  exitQuiz,
  confirmExitQuiz,
  startQuiz
} = useQuiz()

// Start quiz on mount
onMounted(async () => {
  const quizType = route.params.type as string
  await startQuiz(quizType || 'mbti')
})

const handleExit = () => {
  exitQuiz()
}

// Set page metadata
useHead({
  title: `${t('quiz.title')} - ${t('app.title')}`
})
</script>

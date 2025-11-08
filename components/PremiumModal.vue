<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto" @click.self="close">
        <div class="flex min-h-screen items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="close"></div>

          <!-- Modal -->
          <div class="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 transform transition-all">
            <!-- Close button -->
            <button @click="close" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <Icon name="mdi:close" class="text-2xl" />
            </button>

            <!-- Header -->
            <div class="text-center mb-6">
              <Icon name="mdi:crown" class="text-6xl text-yellow-500 mb-4" />
              <h2 class="text-3xl font-bold text-gray-900 mb-2">
                {{ $t('ui.unlockPremiumTitle') }}
              </h2>
              <p class="text-gray-600">
                Получите доступ ко всем расширенным функциям
              </p>
            </div>

            <!-- Features -->
            <div class="space-y-4 mb-8">
              <div class="flex items-start gap-3">
                <Icon name="mdi:check-circle" class="text-2xl text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 class="font-semibold text-gray-900">Расширенные анализы личности</h3>
                  <p class="text-sm text-gray-600">Подробные отчеты с рекомендациями по развитию</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <Icon name="mdi:check-circle" class="text-2xl text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 class="font-semibold text-gray-900">Сравнение с известными личностями</h3>
                  <p class="text-sm text-gray-600">Узнайте, какие знаменитости имеют ваш тип</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <Icon name="mdi:check-circle" class="text-2xl text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 class="font-semibold text-gray-900">Сохранение и обмен результатами</h3>
                  <p class="text-sm text-gray-600">Уникальные ссылки для обмена результатами</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <Icon name="mdi:check-circle" class="text-2xl text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 class="font-semibold text-gray-900">Визуальная аналитика</h3>
                  <p class="text-sm text-gray-600">Графики и диаграммы ваших характеристик</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <Icon name="mdi:check-circle" class="text-2xl text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 class="font-semibold text-gray-900">Новые тесты каждый месяц</h3>
                  <p class="text-sm text-gray-600">Доступ ко всем специализированным тестам</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <Icon name="mdi:check-circle" class="text-2xl text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 class="font-semibold text-gray-900">Без рекламы</h3>
                  <p class="text-sm text-gray-600">Пользуйтесь сервисом без отвлечений</p>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <button @click="unlockPremium" class="btn btn-primary flex-1 text-lg py-3">
                <Icon name="mdi:crown" />
                {{ $t('ui.unlockPremium') }}
              </button>
              <button @click="close" class="btn btn-outline flex-1 text-lg py-3">
                {{ $t('ui.close') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const quizStore = useQuizStore()

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const close = () => {
  emit('update:modelValue', false)
}

const unlockPremium = () => {
  quizStore.unlockPremium()
  alert(t('success.premiumUnlocked'))
  close()
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>

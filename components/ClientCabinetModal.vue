<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto" @click.self="close">
        <div class="flex min-h-screen items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="close"></div>

          <!-- Modal -->
          <div class="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full p-8 transform transition-all">
            <!-- Close button -->
            <button @click="close" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <Icon name="mdi:close" class="text-2xl" />
            </button>

            <!-- Header -->
            <div class="text-center mb-6">
              <Icon name="mdi:account-circle" class="text-6xl text-primary-600 mb-4" />
              <h2 class="text-3xl font-bold text-gray-900 mb-2">
                Личный кабинет
              </h2>
              <p class="text-gray-600">
                Управление вашим профилем и результатами тестов
              </p>
            </div>

            <!-- User Info -->
            <div class="bg-gray-50 rounded-lg p-6 mb-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Статус</h3>
                  <p class="text-sm text-gray-600">
                    {{ userStore.isPremium ? '👑 Премиум пользователь' : 'Бесплатный доступ' }}
                  </p>
                </div>
                <button v-if="!userStore.isPremium" @click="openPremiumModal" class="btn btn-primary">
                  Улучшить
                </button>
              </div>

              <div class="grid grid-cols-2 gap-4 mt-4">
                <div class="bg-white rounded-lg p-4">
                  <div class="text-2xl font-bold text-primary-600">
                    {{ userStore.testHistory.length }}
                  </div>
                  <div class="text-sm text-gray-600">Пройдено тестов</div>
                </div>
                <div class="bg-white rounded-lg p-4">
                  <div class="text-2xl font-bold text-secondary-600">
                    {{ userStore.preferences.language }}
                  </div>
                  <div class="text-sm text-gray-600">Язык интерфейса</div>
                </div>
              </div>
            </div>

            <!-- Test History -->
            <div v-if="userStore.hasTestHistory" class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">История тестов</h3>
              <div class="space-y-3 max-h-64 overflow-y-auto">
                <div
                  v-for="(test, index) in userStore.testHistory"
                  :key="index"
                  class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-semibold text-gray-900">
                        {{ test.type || 'MBTI Test' }}
                      </div>
                      <div class="text-sm text-gray-600">
                        {{ new Date(test.timestamp || Date.now()).toLocaleDateString('ru-RU') }}
                      </div>
                    </div>
                    <button class="btn btn-outline btn-sm">
                      Посмотреть
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500">
              <Icon name="mdi:clipboard-text-outline" class="text-5xl mb-2" />
              <p>У вас пока нет пройденных тестов</p>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 mt-6">
              <button @click="close" class="btn btn-outline flex-1">
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const userStore = useUserStore()

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'openPremium': []
}>()

const close = () => {
  emit('update:modelValue', false)
}

const openPremiumModal = () => {
  close()
  emit('openPremium')
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

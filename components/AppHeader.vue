<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="container-main py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-primary-600 flex items-center gap-2">
            <Icon name="mdi:brain" class="text-3xl" />
            {{ $t('ui.mbtiQuiz') }}
          </h1>
          <p class="text-sm text-gray-600 mt-1">
            {{ $t('quizTypes.mbti.description') }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Language Switcher -->
          <div class="flex gap-2">
            <button
              v-for="locale in availableLocales"
              :key="locale.code"
              @click="switchLocale(locale.code)"
              :class="[
                'px-3 py-1 rounded-lg text-sm font-medium transition-all',
                currentLocale === locale.code
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ locale.name }}
            </button>
          </div>

          <!-- Cabinet Button -->
          <button @click="showCabinet = true" class="btn btn-outline">
            <Icon name="mdi:account" />
            Личный кабинет
          </button>

          <!-- Premium Button -->
          <button @click="showPremium = true" class="btn btn-primary">
            <Icon name="mdi:crown" />
            {{ $t('ui.upgradeToPremium') }}
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Modals -->
  <PremiumModal v-model="showPremium" />
  <ClientCabinetModal v-model="showCabinet" @open-premium="showPremium = true" />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const currentLocale = computed(() => locale.value)
const availableLocales = ref([
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' }
])

const showPremium = ref(false)
const showCabinet = ref(false)

const switchLocale = (newLocale: string) => {
  locale.value = newLocale
}
</script>

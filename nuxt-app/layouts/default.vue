<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
            <span class="text-2xl">🧠</span>
            <span class="text-xl font-bold hidden sm:inline">{{ t('app.title') }}</span>
          </NuxtLink>

          <!-- Navigation -->
          <nav class="flex items-center gap-4">
            <!-- Language Switcher -->
            <div class="flex items-center gap-2 bg-white/10 rounded-lg p-1">
              <button
                v-for="locale in availableLocales"
                :key="locale.code"
                :class="[
                  'px-3 py-1 rounded-md text-sm font-medium transition-all',
                  currentLocale === locale.code
                    ? 'bg-white text-primary'
                    : 'text-white hover:bg-white/20'
                ]"
                @click="setLocale(locale.code)"
              >
                {{ locale.code.toUpperCase() }}
              </button>
            </div>

            <!-- Premium Button (if not premium) -->
            <Button
              v-if="!isPremium && isVKPlatform"
              variant="primary"
              size="sm"
              @click="handlePremiumClick"
            >
              ⭐ {{ t('premium.unlock') }}
            </Button>

            <!-- User Info (VK) -->
            <div v-if="vkUser" class="flex items-center gap-2">
              <img
                v-if="vkUser.photo_url"
                :src="vkUser.photo_url"
                :alt="vkUser.first_name"
                class="w-8 h-8 rounded-full border-2 border-white/30"
              />
              <span class="text-white text-sm hidden md:inline">
                {{ vkUser.first_name }}
              </span>
            </div>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white/5 backdrop-blur-md border-t border-white/10 py-6 mt-12">
      <div class="container mx-auto px-4 text-center text-white/70 text-sm">
        <p>&copy; {{ new Date().getFullYear() }} {{ t('app.title') }}. {{ t('footer.rights') }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { t, locale, locales } = useI18n()
const userStore = useUserStore()
const vkStore = useVKStore()
const { showOrderBox } = useVKBridge()

const currentLocale = computed(() => locale.value)
const availableLocales = computed(() => locales.value)
const isPremium = computed(() => userStore.isPremium)
const isVKPlatform = computed(() => vkStore.isVKPlatform)
const vkUser = computed(() => vkStore.vkUser)

const setLocale = (newLocale: string) => {
  locale.value = newLocale
  userStore.setLocale(newLocale as 'en' | 'ru')
}

const handlePremiumClick = async () => {
  await showOrderBox('premium_subscription')
}
</script>

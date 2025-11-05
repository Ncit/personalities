<template>
  <div class="min-h-screen bg-white vk-platform">
    <!-- Compact Header for VK -->
    <header class="bg-primary text-white py-3 shadow-md sticky top-0 z-10">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between">
          <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span class="text-xl">🧠</span>
            <span class="font-bold">{{ t('app.title') }}</span>
          </NuxtLink>

          <!-- User Info -->
          <div v-if="vkUser" class="flex items-center gap-2">
            <img
              v-if="vkUser.photo_url"
              :src="vkUser.photo_url"
              :alt="vkUser.first_name"
              class="w-8 h-8 rounded-full border-2 border-white/50"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="pb-4">
      <slot />
    </main>

    <!-- VK-specific footer (minimal) -->
    <footer class="bg-gray-50 py-4 border-t border-gray-200">
      <div class="container mx-auto px-4 text-center text-gray-600 text-xs">
        <p>{{ t('app.title') }} {{ new Date().getFullYear() }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const vkStore = useVKStore()

const vkUser = computed(() => vkStore.vkUser)
</script>

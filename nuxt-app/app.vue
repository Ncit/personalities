<template>
  <div class="min-h-screen bg-gradient-primary">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Global Notifications -->
    <NotificationContainer />

    <!-- Global Loading Overlay -->
    <LoadingOverlay v-if="uiStore.loading" :message="uiStore.loadingMessage" />
  </div>
</template>

<script setup lang="ts">
const uiStore = useUIStore()
const userStore = useUserStore()
const vkStore = useVKStore()
const { initBridge, isVKEnvironment } = useVKBridge()
const { trackPageView } = useAnalytics()

// Load user data from storage
onMounted(async () => {
  userStore.loadFromStorage()
  vkStore.loadFromStorage()

  // Initialize VK Bridge if in VK environment
  if (isVKEnvironment()) {
    await initBridge()
  }
})

// Track page views
const router = useRouter()
router.afterEach((to) => {
  trackPageView(to.name as string)
})
</script>

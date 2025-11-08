<template>
  <div id="app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Initialize Firebase on app mount (client-side only)
onMounted(() => {
  if (process.client) {
    const { initialize } = useFirebase()
    initialize()
  }
})
</script>

<style>
html {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>

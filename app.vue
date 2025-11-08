<template>
  <div id="app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Initialize Firebase on app mount
import { useFirebase } from '~/composables/useFirebase'

const { initialize } = useFirebase()

onMounted(() => {
  initialize()
})
</script>

<style>
html {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>

<template>
  <footer class="bg-gray-50 border-t border-gray-200 mt-12 py-8">
    <div class="container-main">
      <div class="text-center text-gray-600 text-sm">
        <p>© {{ currentYear }} Personality Types Quiz. All rights reserved.</p>
        <p class="mt-2">Built with Nuxt.js & Tailwind CSS</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = computed(() => new Date().getFullYear())
</script>

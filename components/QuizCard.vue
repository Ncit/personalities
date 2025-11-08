<template>
  <div
    :class="[
      'card p-6 hover:shadow-lg transition-all cursor-pointer relative',
      isLocked ? 'opacity-90' : ''
    ]"
    @click="handleClick"
  >
    <!-- Premium Badge -->
    <div class="flex items-start justify-between mb-3">
      <Icon :name="quiz.icon" class="text-4xl text-secondary-600" />
      <span
        v-if="isLocked"
        class="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full flex items-center gap-1"
      >
        <Icon name="mdi:crown" class="text-sm" />
        Премиум
      </span>
      <span
        v-else
        class="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full"
      >
        Доступно
      </span>
    </div>

    <h3 class="font-bold text-lg text-gray-900 mb-2">{{ quiz.name }}</h3>
    <p class="text-sm text-gray-600 mb-4">{{ quiz.description }}</p>

    <!-- Action Button -->
    <button
      v-if="isLocked"
      class="btn btn-outline w-full flex items-center justify-center gap-2"
      @click.stop="$emit('unlock')"
    >
      <Icon name="mdi:lock" />
      Разблокировать
    </button>
    <button
      v-else
      class="btn btn-secondary w-full"
      @click.stop="$emit('start')"
    >
      Начать
    </button>

    <!-- Lock Overlay -->
    <div
      v-if="isLocked"
      class="absolute inset-0 bg-white bg-opacity-50 rounded-lg flex items-center justify-center backdrop-blur-[1px]"
      @click.stop="$emit('unlock')"
    >
      <Icon name="mdi:lock" class="text-5xl text-gray-400 opacity-30" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Quiz {
  id: string
  name: string
  description: string
  icon: string
}

const props = defineProps<{
  quiz: Quiz
  isLocked: boolean
}>()

const emit = defineEmits<{
  start: []
  unlock: []
}>()

const handleClick = () => {
  if (props.isLocked) {
    emit('unlock')
  } else {
    emit('start')
  }
}
</script>

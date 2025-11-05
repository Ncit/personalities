<template>
  <div class="progress-container">
    <div v-if="showLabel" class="flex justify-between items-center mb-2">
      <span class="text-sm font-medium text-gray-700">{{ label }}</span>
      <span v-if="showPercentage" class="text-sm font-bold text-primary">
        {{ percentage }}%
      </span>
    </div>

    <div :class="progressClasses">
      <div
        class="progress-fill h-full bg-gradient-to-r from-primary to-purple-600 rounded-full transition-all duration-500 ease-out"
        :style="{ width: `${percentage}%` }"
      />
    </div>

    <div v-if="$slots.default" class="mt-2">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  showPercentage: true,
  showLabel: true,
  size: 'md',
  color: 'primary'
})

const percentage = computed(() => {
  const value = Math.max(0, Math.min(props.value, props.max))
  return Math.round((value / props.max) * 100)
})

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
}

const progressClasses = computed(() => [
  'progress-bar w-full bg-gray-200 rounded-full overflow-hidden',
  sizeClasses[props.size]
])
</script>

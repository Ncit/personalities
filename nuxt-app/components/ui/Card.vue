<template>
  <div :class="cardClasses">
    <div v-if="$slots.header || title" class="card-header mb-4">
      <slot name="header">
        <h3 v-if="title" class="text-xl font-bold text-gray-800">{{ title }}</h3>
      </slot>
    </div>

    <div class="card-body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="card-footer mt-4 pt-4 border-t border-gray-200">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: boolean
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
  shadow: true,
  hover: false
})

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
}

const cardClasses = computed(() => [
  'card',
  'bg-white rounded-2xl transition-all duration-300',
  paddingClasses[props.padding],
  {
    'shadow-xl': props.shadow,
    'hover:shadow-2xl hover:-translate-y-1': props.hover
  }
])
</script>

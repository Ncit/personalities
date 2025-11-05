<template>
  <div class="space-y-3">
    <button
      v-for="(option, index) in options"
      :key="index"
      :class="getOptionClasses(index)"
      @click="handleSelect(index)"
    >
      <div class="flex items-center gap-3">
        <div :class="getRadioClasses(index)">
          <div v-if="isSelected(index)" class="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <span class="text-left flex-1">{{ option }}</span>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  options: string[]
  selected: number | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [index: number]
}>()

const handleSelect = (index: number) => {
  emit('select', index + 1) // Options are 1-indexed in the original system
}

const isSelected = (index: number) => {
  return props.selected === index + 1
}

const getOptionClasses = (index: number) => {
  return [
    'w-full p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer text-left',
    isSelected(index)
      ? 'border-primary bg-primary/10 shadow-md transform scale-[1.02]'
      : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm'
  ]
}

const getRadioClasses = (index: number) => {
  return [
    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300',
    isSelected(index)
      ? 'border-primary bg-primary'
      : 'border-gray-300 bg-white'
  ]
}
</script>

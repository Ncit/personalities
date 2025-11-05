<template>
  <Card padding="lg" :hover="true">
    <!-- Personality Type Badge -->
    <div class="text-center mb-6">
      <div class="inline-block">
        <div class="text-6xl font-bold text-gradient mb-2">
          {{ personalityType }}
        </div>
        <div class="text-xl font-semibold text-gray-800 mb-1">
          {{ typeData?.title }}
        </div>
        <div class="text-sm text-gray-600">
          {{ typeData?.subtitle }}
        </div>
      </div>
    </div>

    <!-- Description -->
    <div class="mb-6">
      <p class="text-gray-700 leading-relaxed text-center">
        {{ typeData?.description }}
      </p>
    </div>

    <!-- Traits -->
    <div v-if="typeData?.traits" class="mb-6">
      <h4 class="text-sm font-semibold text-gray-700 mb-3">{{ t('results.keyTraits') }}</h4>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="trait in typeData.traits"
          :key="trait"
          class="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
        >
          {{ trait }}
        </span>
      </div>
    </div>

    <!-- Strengths & Weaknesses -->
    <div v-if="typeData?.strengths || typeData?.weaknesses" class="grid md:grid-cols-2 gap-4">
      <div v-if="typeData.strengths">
        <h4 class="text-sm font-semibold text-green-700 mb-2">{{ t('results.strengths') }}</h4>
        <ul class="space-y-1">
          <li
            v-for="strength in typeData.strengths.slice(0, 5)"
            :key="strength"
            class="text-sm text-gray-700 flex items-start gap-2"
          >
            <span class="text-green-500 flex-shrink-0">✓</span>
            <span>{{ strength }}</span>
          </li>
        </ul>
      </div>

      <div v-if="typeData.weaknesses">
        <h4 class="text-sm font-semibold text-orange-700 mb-2">{{ t('results.growthAreas') }}</h4>
        <ul class="space-y-1">
          <li
            v-for="weakness in typeData.weaknesses.slice(0, 5)"
            :key="weakness"
            class="text-sm text-gray-700 flex items-start gap-2"
          >
            <span class="text-orange-500 flex-shrink-0">•</span>
            <span>{{ weakness }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Population Percentage -->
    <div v-if="typeData?.percentage" class="mt-6 pt-6 border-t border-gray-200 text-center">
      <p class="text-sm text-gray-600">
        {{ t('results.populationPercentage') }}:
        <span class="font-bold text-primary">{{ typeData.percentage }}%</span>
      </p>
    </div>
  </Card>
</template>

<script setup lang="ts">
import type { PersonalityType } from '~/utils/types'

interface Props {
  personalityType: string
  typeData?: PersonalityType
}

defineProps<Props>()

const { t } = useI18n()
</script>

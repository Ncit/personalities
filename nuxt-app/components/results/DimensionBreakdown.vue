<template>
  <Card padding="lg">
    <h3 class="text-2xl font-bold text-gray-800 mb-6">{{ t('results.dimensions') }}</h3>

    <div class="space-y-6">
      <!-- E-I Dimension -->
      <div class="dimension-item">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-semibold text-gray-700">
            {{ t('dimensions.EI.label') }}
          </span>
          <span class="text-xs text-gray-500">
            {{ breakdown.EI.preference }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-medium text-gray-600 w-8">E</span>
          <div class="flex-1 h-8 bg-gray-200 rounded-full overflow-hidden relative">
            <div
              class="absolute left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              :style="{ width: `${breakdown.EI.E}%` }"
            />
            <div
              class="absolute right-0 h-full bg-gradient-to-l from-purple-500 to-purple-600 transition-all duration-500"
              :style="{ width: `${breakdown.EI.I}%` }"
            />
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xs font-bold text-white drop-shadow">
                {{ Math.round(breakdown.EI.E) }}% - {{ Math.round(breakdown.EI.I) }}%
              </span>
            </div>
          </div>
          <span class="text-xs font-medium text-gray-600 w-8 text-right">I</span>
        </div>
        <div class="flex justify-between mt-1">
          <span class="text-xs text-gray-500">{{ t('dimensions.EI.E') }}</span>
          <span class="text-xs text-gray-500">{{ t('dimensions.EI.I') }}</span>
        </div>
      </div>

      <!-- S-N Dimension -->
      <div class="dimension-item">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-semibold text-gray-700">
            {{ t('dimensions.SN.label') }}
          </span>
          <span class="text-xs text-gray-500">
            {{ breakdown.SN.preference }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-medium text-gray-600 w-8">S</span>
          <div class="flex-1 h-8 bg-gray-200 rounded-full overflow-hidden relative">
            <div
              class="absolute left-0 h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
              :style="{ width: `${breakdown.SN.S}%` }"
            />
            <div
              class="absolute right-0 h-full bg-gradient-to-l from-teal-500 to-teal-600 transition-all duration-500"
              :style="{ width: `${breakdown.SN.N}%` }"
            />
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xs font-bold text-white drop-shadow">
                {{ Math.round(breakdown.SN.S) }}% - {{ Math.round(breakdown.SN.N) }}%
              </span>
            </div>
          </div>
          <span class="text-xs font-medium text-gray-600 w-8 text-right">N</span>
        </div>
        <div class="flex justify-between mt-1">
          <span class="text-xs text-gray-500">{{ t('dimensions.SN.S') }}</span>
          <span class="text-xs text-gray-500">{{ t('dimensions.SN.N') }}</span>
        </div>
      </div>

      <!-- T-F Dimension -->
      <div class="dimension-item">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-semibold text-gray-700">
            {{ t('dimensions.TF.label') }}
          </span>
          <span class="text-xs text-gray-500">
            {{ breakdown.TF.preference }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-medium text-gray-600 w-8">T</span>
          <div class="flex-1 h-8 bg-gray-200 rounded-full overflow-hidden relative">
            <div
              class="absolute left-0 h-full bg-gradient-to-r from-yellow-500 to-yellow-600 transition-all duration-500"
              :style="{ width: `${breakdown.TF.T}%` }"
            />
            <div
              class="absolute right-0 h-full bg-gradient-to-l from-pink-500 to-pink-600 transition-all duration-500"
              :style="{ width: `${breakdown.TF.F}%` }"
            />
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xs font-bold text-white drop-shadow">
                {{ Math.round(breakdown.TF.T) }}% - {{ Math.round(breakdown.TF.F) }}%
              </span>
            </div>
          </div>
          <span class="text-xs font-medium text-gray-600 w-8 text-right">F</span>
        </div>
        <div class="flex justify-between mt-1">
          <span class="text-xs text-gray-500">{{ t('dimensions.TF.T') }}</span>
          <span class="text-xs text-gray-500">{{ t('dimensions.TF.F') }}</span>
        </div>
      </div>

      <!-- J-P Dimension -->
      <div class="dimension-item">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-semibold text-gray-700">
            {{ t('dimensions.JP.label') }}
          </span>
          <span class="text-xs text-gray-500">
            {{ breakdown.JP.preference }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-medium text-gray-600 w-8">J</span>
          <div class="flex-1 h-8 bg-gray-200 rounded-full overflow-hidden relative">
            <div
              class="absolute left-0 h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
              :style="{ width: `${breakdown.JP.J}%` }"
            />
            <div
              class="absolute right-0 h-full bg-gradient-to-l from-orange-500 to-orange-600 transition-all duration-500"
              :style="{ width: `${breakdown.JP.P}%` }"
            />
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xs font-bold text-white drop-shadow">
                {{ Math.round(breakdown.JP.J) }}% - {{ Math.round(breakdown.JP.P) }}%
              </span>
            </div>
          </div>
          <span class="text-xs font-medium text-gray-600 w-8 text-right">P</span>
        </div>
        <div class="flex justify-between mt-1">
          <span class="text-xs text-gray-500">{{ t('dimensions.JP.J') }}</span>
          <span class="text-xs text-gray-500">{{ t('dimensions.JP.P') }}</span>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import type { DimensionBreakdown } from '~/utils/types'

interface Props {
  breakdown: DimensionBreakdown
}

defineProps<Props>()

const { t } = useI18n()
</script>

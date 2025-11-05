<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      <TransitionGroup name="notification">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="getNotificationClasses(notification.type)"
          @click="removeNotification(notification.id)"
        >
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 text-2xl">
              {{ getIcon(notification.type) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white">
                {{ notification.message }}
              </p>
            </div>
            <button
              class="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
              @click.stop="removeNotification(notification.id)"
            >
              ×
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const uiStore = useUIStore()

const notifications = computed(() => uiStore.notifications)

const removeNotification = (id: string) => {
  uiStore.removeNotification(id)
}

const getIcon = (type: string) => {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }
  return icons[type as keyof typeof icons] || icons.info
}

const getNotificationClasses = (type: string) => {
  const baseClasses = 'notification p-4 rounded-lg shadow-lg cursor-pointer transition-all duration-300'
  const typeClasses = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  }
  return `${baseClasses} ${typeClasses[type as keyof typeof typeClasses] || typeClasses.info}`
}
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.8);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>

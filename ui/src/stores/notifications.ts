import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface NotificationData {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
}

export const useNotificationStore = defineStore('notifications', () => {
  const notification = ref<NotificationData | null>(null)

  const show = (type: NotificationData['type'], title: string, message: string) => {
    notification.value = { type, title, message }
    
    // Auto-clear after 5 seconds
    setTimeout(() => {
      clear()
    }, 5000)
  }

  const clear = () => {
    notification.value = null
  }

  return {
    notification,
    show,
    clear
  }
})

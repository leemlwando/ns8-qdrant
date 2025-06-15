import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/services/api'

export interface ServiceStatus {
  status: 'running' | 'stopped' | 'failed' | 'unknown'
  uptime?: number
  version?: string
}

export const useServiceStore = defineStore('service', () => {
  const status = ref<ServiceStatus | null>(null)
  const loading = ref(false)

  const checkStatus = async () => {
    try {
      loading.value = true
      const data = await api.getServiceStatus()
      status.value = data
    } catch (error) {
      console.error('Failed to check service status:', error)
      status.value = { status: 'unknown' }
    } finally {
      loading.value = false
    }
  }

  const controlService = async (action: 'start' | 'stop' | 'restart') => {
    try {
      await api.controlService(action)
      // Wait a moment then check status
      setTimeout(() => {
        checkStatus()
      }, 2000)
    } catch (error) {
      console.error(`Failed to ${action} service:`, error)
      throw error
    }
  }

  return {
    status,
    loading,
    checkStatus,
    controlService
  }
})

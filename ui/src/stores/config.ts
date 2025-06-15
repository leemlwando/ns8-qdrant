import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '@/services/api'

export interface QdrantConfig {
  host: string
  path: string
  lets_encrypt: boolean
  http2https: boolean
}

export const useConfigStore = defineStore('config', () => {
  // State
  const config = ref<QdrantConfig>({
    host: '',
    path: '',
    lets_encrypt: false,
    http2https: false
  })

  const errors = ref<Partial<Record<keyof QdrantConfig, string>>>({})
  const loading = ref(true)
  const saving = ref(false)
  const testing = ref(false)

  // Getters
  const isValidConfig = computed(() => {
    return config.value.host.trim() !== '' && Object.keys(errors.value).length === 0
  })

  // Actions
  const validateConfig = (): boolean => {
    errors.value = {}

    if (!config.value.host || config.value.host.trim() === '') {
      errors.value.host = 'Host is required'
    } else if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(config.value.host)) {
      errors.value.host = 'Please enter a valid domain name'
    }

    if (config.value.path && !config.value.path.startsWith('/')) {
      errors.value.path = 'Path must start with /'
    }

    return Object.keys(errors.value).length === 0
  }

  const loadConfiguration = async () => {
    try {
      loading.value = true
      const data = await api.getConfiguration()
      config.value = {
        host: data.host || '',
        path: data.path || '',
        lets_encrypt: data.lets_encrypt || false,
        http2https: data.http2https || false
      }
    } catch (error) {
      console.error('Failed to load configuration:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const saveConfiguration = async () => {
    if (!validateConfig()) {
      throw new Error('Please fix validation errors before saving')
    }

    try {
      saving.value = true
      await api.saveConfiguration(config.value)
    } catch (error) {
      console.error('Failed to save configuration:', error)
      throw error
    } finally {
      saving.value = false
    }
  }

  const testConnection = async (): Promise<boolean> => {
    if (!validateConfig()) {
      throw new Error('Please fix validation errors before testing')
    }

    try {
      testing.value = true
      const result = await api.testConnection(config.value)
      return result.success || false
    } catch (error) {
      console.error('Connection test failed:', error)
      return false
    } finally {
      testing.value = false
    }
  }

  return {
    // State
    config,
    errors,
    loading,
    saving,
    testing,
    
    // Getters
    isValidConfig,
    
    // Actions
    validateConfig,
    loadConfiguration,
    saveConfiguration,
    testConnection
  }
})

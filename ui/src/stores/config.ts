import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '@/services/api'

export interface QdrantConfig {
  host: string
  path: string
  lets_encrypt: boolean
  http2https: boolean
  port: number
  api_key: string
  collection_size_limit: number
  enable_cors: boolean
}

export const useConfigStore = defineStore('config', () => {
  // State
  const config = ref<QdrantConfig>({
    host: '',
    path: '',
    lets_encrypt: false,
    http2https: false,
    port: 6333,
    api_key: '',
    collection_size_limit: 10000,
    enable_cors: true
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

    if (config.value.port < 1 || config.value.port > 65535) {
      errors.value.port = 'Port must be between 1 and 65535'
    }

    if (config.value.collection_size_limit < 0) {
      errors.value.collection_size_limit = 'Collection size limit must be non-negative'
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
        http2https: data.http2https || false,
        port: data.port || 6333,
        api_key: data.api_key || '',
        collection_size_limit: data.collection_size_limit || 10000,
        enable_cors: data.enable_cors !== undefined ? data.enable_cors : true
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
  const testConnection = async (): Promise<{ success: boolean; error?: string; version?: string }> => {
    if (!validateConfig()) {
      throw new Error('Please fix validation errors before testing')
    }

    try {
      testing.value = true
      const result = await api.testConnection(config.value)
      return result
    } catch (error) {
      console.error('Connection test failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      }
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

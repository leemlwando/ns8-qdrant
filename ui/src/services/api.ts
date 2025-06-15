import axios from 'axios'
import type { QdrantConfig } from '@/stores/config'
import type { ServiceStatus } from '@/stores/service'

const API_BASE = '/api'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || `HTTP ${error.response.status}: ${error.response.statusText}`
      throw new Error(message)
    } else if (error.request) {
      // Network error
      throw new Error('Network error: Unable to connect to server')
    } else {
      // Other error
      throw new Error(error.message || 'An unknown error occurred')
    }
  }
)

export async function getConfiguration(): Promise<QdrantConfig> {
  try {
    const response = await apiClient.get('/get-configuration')
    return response.data
  } catch (error) {
    console.error('Failed to get configuration:', error)
    throw error
  }
}

export async function saveConfiguration(config: QdrantConfig): Promise<void> {
  try {
    await apiClient.post('/configure-module', config)
  } catch (error) {
    console.error('Failed to save configuration:', error)
    throw error
  }
}

export async function testConnection(config: QdrantConfig): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiClient.post('/test-connection', config)
    return response.data
  } catch (error) {
    console.error('Connection test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed'
    }
  }
}

export async function getServiceStatus(): Promise<ServiceStatus> {
  try {
    const response = await apiClient.get('/get-status')
    return response.data
  } catch (error) {
    console.error('Failed to get service status:', error)
    // Return default status if API fails
    return { status: 'unknown' }
  }
}

export async function controlService(action: 'start' | 'stop' | 'restart'): Promise<void> {
  try {
    await apiClient.post(`/service-control/${action}`)
  } catch (error) {
    console.error(`Failed to ${action} service:`, error)
    throw error
  }
}

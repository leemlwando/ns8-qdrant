<template>
  <div id="app">
    <div class="container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <div class="module-info">
            <svg class="database-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
            <div>
              <h1>Qdrant Vector Database</h1>
              <p>High-performance vector database for AI applications and similarity search</p>
            </div>
          </div>
          <ServiceStatus v-if="serviceStore.status" :status="serviceStore.status" />
        </div>
      </header>

      <!-- Notifications -->
      <div v-if="notificationStore.notification" class="notification-container">
        <Notification 
          :type="notificationStore.notification.type"
          :title="notificationStore.notification.title"
          :message="notificationStore.notification.message"
          @close="notificationStore.clear()"
        />
      </div>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Loading State -->
        <div v-if="configStore.loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading configuration...</p>
        </div>

        <!-- Configuration Form -->
        <div v-else class="config-card">
          <div class="card-header">
            <svg class="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
            </svg>
            <h2>Configuration</h2>
          </div>

          <form @submit.prevent="handleSave" class="config-form">
            <!-- Host Configuration -->
            <div class="form-group">
              <label for="host" class="form-label">Host (FQDN) *</label>
              <input
                id="host"
                v-model="configStore.config.host"
                type="text"
                class="form-input"
                :class="{ 'error': configStore.errors.host }"
                placeholder="qdrant.yourdomain.com"
                required
              />
              <span v-if="configStore.errors.host" class="error-message">
                {{ configStore.errors.host }}
              </span>
              <span class="help-text">
                The public domain name for accessing Qdrant (e.g., qdrant.yourdomain.com)
              </span>
            </div>            <!-- Path Prefix -->
            <div class="form-group">
              <label for="path" class="form-label">Path Prefix</label>
              <input
                id="path"
                v-model="configStore.config.path"
                type="text"
                class="form-input"
                :class="{ 'error': configStore.errors.path }"
                placeholder="/qdrant"
              />
              <span v-if="configStore.errors.path" class="error-message">
                {{ configStore.errors.path }}
              </span>
              <span class="help-text">
                Optional URL path to serve Qdrant from (e.g., /qdrant)
              </span>
            </div>

            <!-- Port Configuration -->
            <div class="form-group">
              <label for="port" class="form-label">Port</label>
              <input
                id="port"
                v-model="configStore.config.port"
                type="number"
                class="form-input"
                :class="{ 'error': configStore.errors.port }"
                min="1"
                max="65535"
                placeholder="6333"
              />
              <span v-if="configStore.errors.port" class="error-message">
                {{ configStore.errors.port }}
              </span>
              <span class="help-text">
                Port number for Qdrant service (default: 6333)
              </span>
            </div>

            <!-- API Key Configuration -->
            <div class="form-group">
              <label for="api_key" class="form-label">API Key</label>
              <input
                id="api_key"
                v-model="configStore.config.api_key"
                type="password"
                class="form-input"
                :class="{ 'error': configStore.errors.api_key }"
                placeholder="Optional API key for authentication"
              />
              <span v-if="configStore.errors.api_key" class="error-message">
                {{ configStore.errors.api_key }}
              </span>
              <span class="help-text">
                Optional API key for authenticating requests to Qdrant
              </span>
            </div>

            <!-- Collection Size Limit -->
            <div class="form-group">
              <label for="collection_size_limit" class="form-label">Collection Size Limit</label>
              <input
                id="collection_size_limit"
                v-model="configStore.config.collection_size_limit"
                type="number"
                class="form-input"
                :class="{ 'error': configStore.errors.collection_size_limit }"
                min="0"
                placeholder="10000"
              />
              <span v-if="configStore.errors.collection_size_limit" class="error-message">
                {{ configStore.errors.collection_size_limit }}
              </span>
              <span class="help-text">
                Maximum number of points allowed per collection
              </span>
            </div>

            <!-- CORS Configuration -->
            <div class="form-group">
              <div class="checkbox-group">
                <input
                  id="enable_cors"
                  v-model="configStore.config.enable_cors"
                  type="checkbox"
                  class="form-checkbox"
                />
                <label for="enable_cors" class="checkbox-label">
                  Enable CORS
                </label>
              </div>
              <span class="help-text">
                Allow cross-origin requests from web browsers
              </span>
            </div>

            <!-- SSL Configuration -->
            <div class="form-group">
              <div class="checkbox-group">
                <input
                  id="lets_encrypt"
                  v-model="configStore.config.lets_encrypt"
                  type="checkbox"
                  class="form-checkbox"
                />
                <label for="lets_encrypt" class="checkbox-label">
                  Enable HTTPS (Let's Encrypt)
                </label>
              </div>
              <span class="help-text">
                Automatically obtain and renew a Let's Encrypt SSL certificate
              </span>
            </div>

            <!-- HTTP to HTTPS Redirect -->
            <div v-if="configStore.config.lets_encrypt" class="form-group">
              <div class="checkbox-group">
                <input
                  id="http2https"
                  v-model="configStore.config.http2https"
                  type="checkbox"
                  class="form-checkbox"
                />
                <label for="http2https" class="checkbox-label">
                  Force HTTPS Redirect
                </label>
              </div>
              <span class="help-text">
                Redirect all HTTP traffic to HTTPS
              </span>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button
                type="button"
                @click="handleTestConnection"
                :disabled="configStore.testing"
                class="btn btn-secondary"
              >
                <svg v-if="configStore.testing" class="btn-icon loading" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <svg v-else class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c-1.5 0-3-1-3-3s1.5-3 3-3"/>
                </svg>
                {{ configStore.testing ? 'Testing...' : 'Test Connection' }}
              </button>

              <button
                type="submit"
                :disabled="configStore.saving || !configStore.isValidConfig"
                class="btn btn-primary"
              >
                <svg v-if="configStore.saving" class="btn-icon loading" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <svg v-else class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17,21 17,13 7,13 7,21"/>
                  <polyline points="7,3 7,8 15,8"/>
                </svg>
                {{ configStore.saving ? 'Saving...' : 'Save Configuration' }}
              </button>
            </div>
          </form>
        </div>        <!-- Access Information -->
        <div v-if="configStore.config.host && !configStore.loading" class="info-card">
          <h3>Access Information</h3>
          <div class="access-info">
            <div class="access-item">
              <strong>Dashboard URL:</strong>
              <code>{{ dashboardUrl }}</code>
            </div>
            <div class="access-item">
              <strong>API URL:</strong>
              <code>{{ apiUrl }}</code>
            </div>
          </div>
        </div>

        <!-- Qdrant Information -->
        <QdrantInfo v-if="serviceStore.status && serviceStore.status.status === 'active'" :status="serviceStore.status" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useNotificationStore } from '@/stores/notifications'
import { useServiceStore } from '@/stores/service'
import ServiceStatus from '@/components/ServiceStatus.vue'
import Notification from '@/components/Notification.vue'
import QdrantInfo from '@/components/QdrantInfo.vue'

const configStore = useConfigStore()
const notificationStore = useNotificationStore()
const serviceStore = useServiceStore()

const dashboardUrl = computed(() => {
  const protocol = configStore.config.lets_encrypt ? 'https' : 'http'
  const path = configStore.config.path || ''
  return `${protocol}://${configStore.config.host}${path}/dashboard`
})

const apiUrl = computed(() => {
  const protocol = configStore.config.lets_encrypt ? 'https' : 'http'
  const path = configStore.config.path || ''
  return `${protocol}://${configStore.config.host}${path}/`
})

const handleSave = async () => {
  try {
    await configStore.saveConfiguration()
    await serviceStore.checkStatus()
    notificationStore.show('success', 'Configuration Saved', 'Qdrant configuration has been updated successfully.')
  } catch (error) {
    notificationStore.show('error', 'Save Error', error instanceof Error ? error.message : 'Failed to save configuration')
  }
}

const handleTestConnection = async () => {
  try {
    const result = await configStore.testConnection()
    if (result.success) {
      const message = result.version 
        ? `Successfully connected to Qdrant instance (Version: ${result.version})`
        : 'Successfully connected to Qdrant instance.'
      notificationStore.show('success', 'Connection Test', message)
    } else {
      notificationStore.show('error', 'Connection Test Failed', result.error || 'Could not connect to Qdrant instance.')
    }
  } catch (error) {
    notificationStore.show('error', 'Connection Test Error', error instanceof Error ? error.message : 'Test failed')
  }
}

onMounted(async () => {
  await Promise.all([
    configStore.loadConfiguration(),
    serviceStore.checkStatus()
  ])
})
</script>

<style scoped>
/* Global styles for the NS8 Qdrant module */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.module-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.database-icon {
  width: 48px;
  height: 48px;
  color: rgba(255, 255, 255, 0.9);
}

.module-info h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
}

.module-info p {
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.notification-container {
  margin-bottom: 1rem;
}

.main-content {
  display: grid;
  gap: 2rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e1e8ed;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.config-card, .info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e1e8ed;
}

.settings-icon {
  width: 24px;
  height: 24px;
  color: #667eea;
}

.card-header h2 {
  margin: 0;
  color: #1a202c;
  font-size: 1.5rem;
}

.config-form {
  display: grid;
  gap: 1.5rem;
}

.form-group {
  display: grid;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.95rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error {
  border-color: #e53e3e;
  background-color: #fed7d7;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #667eea;
  cursor: pointer;
}

.checkbox-label {
  font-weight: 500;
  color: #2d3748;
  cursor: pointer;
}

.help-text {
  font-size: 0.875rem;
  color: #718096;
  font-style: italic;
}

.error-message {
  color: #e53e3e;
  font-size: 0.875rem;
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover:not(:disabled) {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.btn-icon.loading {
  animation: spin 1s linear infinite;
}

.info-card h3 {
  margin: 0 0 1rem 0;
  color: #1a202c;
  font-size: 1.25rem;
}

.access-info {
  display: grid;
  gap: 1rem;
}

.access-item {
  display: grid;
  gap: 0.5rem;
}

.access-item strong {
  color: #2d3748;
  font-weight: 600;
}

.access-item code {
  background: #f7fafc;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-family: 'Consolas', 'Monaco', monospace;
  border: 1px solid #e2e8f0;
  color: #2d3748;
  word-break: break-all;
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: 0.5rem;
  }

  .header {
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .module-info {
    flex-direction: column;
    text-align: center;
  }

  .module-info h1 {
    font-size: 1.5rem;
  }

  .config-card, .info-card {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    justify-content: center;
  }
}
</style>

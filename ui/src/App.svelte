<script>
  import { onMount } from 'svelte';
  import { Content, Grid, Row, Column, Tile, SkeletonText, TextInput, NumberInput, Button, Toggle, InlineNotification } from 'carbon-components-svelte';
  import { Database, Settings, Connect, Test, Save } from 'carbon-icons-svelte';
  import * as api from './lib/api.js';
  import { showNotification } from './lib/stores.js';

  import Notification from './components/Notification.svelte';
  import ServiceStatus from './components/ServiceStatus.svelte';

  // --- STATE ---
  let configuration = {
    host: 'localhost',
    port: 6333,
    api_key: '',
    enable_cors: true,
    collection_size_limit: 10000,
    timeout: 30
  };
  let validationErrors = {};
  let loading = true;
  let saving = false;
  let testing = false;
  let serviceStatus = null;
  let showAdvanced = false;  let isAuthenticated = false;
  let authKey = '';
  let authError = '';

  // --- LIFECYCLE ---
  onMount(async () => {
    // Try to load without authentication first
    try {
      await Promise.all([loadConfiguration(), checkServiceStatus()]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      // Don't block UI if initial load fails - show login form
      isAuthenticated = false;
    } finally {
      loading = false;
    }
  });
  // --- DATA & API LOGIC ---
  async function loadConfiguration() {
    try {
      const config = await api.getConfiguration();
      configuration = { ...configuration, ...config };
      isAuthenticated = true;
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        isAuthenticated = false;
        authError = 'Authentication required';
      } else {
        showNotification('error', 'Load Error', 'Could not fetch configuration from server.');
      }
    }
  }

  async function checkServiceStatus() {
    try {
      serviceStatus = await api.checkServiceStatus();
    } catch (error) {
      // Service status is optional, don't show error
      serviceStatus = null;
    }
  }

  async function handleAuthentication() {
    if (!authKey.trim()) {
      authError = 'API key is required';
      return;
    }
    
    authError = '';
    api.setApiKey(authKey);
    
    loading = true;
    try {
      await loadConfiguration();
      await checkServiceStatus();
      if (isAuthenticated) {
        showNotification('success', 'Authentication Success', 'Successfully connected to Qdrant.');
      }
    } catch (error) {
      authError = 'Invalid API key or connection failed';
      isAuthenticated = false;
    } finally {
      loading = false;
    }
  }

  async function handleSave() {
    if (!validateConfiguration()) return;
    saving = true;
    try {
      await api.saveConfiguration(configuration);
      showNotification('success', 'Configuration Saved', 'Qdrant configuration has been updated successfully.');
      await checkServiceStatus();
    } catch (error) {
      showNotification('error', 'Save Error', error.message);
    } finally {
      saving = false;
    }
  }

  async function handleTestConnection() {
    if (!validateConfiguration()) return;
    testing = true;
    try {
      const result = await api.testConnection({
        host: configuration.host,
        port: configuration.port,
        api_key: configuration.api_key
      });
      
      if (result.success) {
        showNotification('success', 'Connection Test', 'Successfully connected to Qdrant instance.');
      } else {
        showNotification('error', 'Connection Test Failed', result.error || 'Could not connect to Qdrant.');
      }
    } catch (error) {
      showNotification('error', 'Connection Test Error', error.message);
    } finally {
      testing = false;
    }
  }
  
  // --- VALIDATION ---
  function validateConfiguration() {
    validationErrors = {};
    
    if (!configuration.host || configuration.host.trim() === '') {
      validationErrors.host = 'Host is required';
    }
    
    if (!configuration.port || configuration.port < 1 || configuration.port > 65535) {
      validationErrors.port = 'Port must be between 1 and 65535';
    }
    
    if (configuration.collection_size_limit && configuration.collection_size_limit < 1) {
      validationErrors.collection_size_limit = 'Collection size limit must be positive';
    }
    
    if (configuration.timeout && configuration.timeout < 1) {
      validationErrors.timeout = 'Timeout must be positive';
    }
    
    return Object.keys(validationErrors).length === 0;
  }

</script>

<style>
  :global(body, html) { 
    background-color: #f4f4f4; 
    margin: 0;
    padding: 0;
  }
  
  .module-header { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    margin-bottom: 2rem; 
  }
  
  .module-title {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .module-title h1 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .auth-container {
    max-width: 400px;
    margin: 2rem auto;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    justify-content: flex-end;
  }
    .advanced-toggle {
    margin: 1.5rem 0;
  }
</style>

<Content>
  <Grid>
    <Row>
      <Column>
        <Notification />
      </Column>
    </Row>

    {#if !isAuthenticated}
      <!-- Authentication Form -->
      <Row>
        <Column>
          <div class="auth-container">
            <Tile>
              <div class="module-title">
                <Database size={32} />
                <h2>Qdrant Authentication</h2>
              </div>              <p>Please enter your API key to access the Qdrant configuration.</p>
              
              <form on:submit|preventDefault={handleAuthentication}>
                <div class="form-group">
                  <TextInput 
                    labelText="API Key" 
                    placeholder="Enter your Qdrant API key"
                    type="password"
                    bind:value={authKey}
                    invalid={!!authError}
                    invalidText={authError}
                  />
                </div>                
                <div class="form-actions">
                  <Button type="submit" disabled={loading}>
                    {#if loading}
                      Connecting...
                    {:else}
                      <Connect size={16} />
                      Connect
                    {/if}
                  </Button>
                </div>
              </form>
            </Tile>
          </div>
        </Column>
      </Row>
    {:else}
      <!-- Main Configuration Interface -->
      <Row>
        <Column>
          <div class="module-header">
            <div>
              <div class="module-title">
                <Database size={32} />
                <h1>Qdrant Vector Database</h1>
              </div>
              <p>High-performance vector database for AI applications and similarity search.</p>
            </div>
            <ServiceStatus {serviceStatus} onStatusChange={checkServiceStatus} />
          </div>
        </Column>
      </Row>

      <Row>
        <Column>
          <Tile>
            <div class="module-title">
              <Settings size={24} />
              <h3>Configuration</h3>
            </div>
              {#if loading}
              <SkeletonText paragraph lines={6} />
            {:else}
              <form on:submit|preventDefault={handleSave}>
                <!-- Basic Configuration -->
                <div class="form-group">
                  <TextInput 
                    labelText="Host" 
                    placeholder="localhost"
                    bind:value={configuration.host}
                    invalid={!!validationErrors.host}
                    invalidText={validationErrors.host}
                  />
                </div>

                <div class="form-group">
                  <NumberInput 
                    label="Port" 
                    min={1}
                    max={65535}
                    bind:value={configuration.port}
                    invalid={!!validationErrors.port}
                    invalidText={validationErrors.port}
                  />
                </div>

                <div class="form-group">
                  <TextInput 
                    labelText="API Key" 
                    placeholder="Enter Qdrant API key (optional)"
                    type="password"
                    bind:value={configuration.api_key}
                  />
                </div>

                <!-- Advanced Configuration Toggle -->
                <div class="advanced-toggle">
                  <Toggle 
                    labelText="Show Advanced Settings"
                    bind:toggled={showAdvanced}
                  />
                </div>

                {#if showAdvanced}
                  <div class="form-group">
                    <Toggle 
                      labelText="Enable CORS"
                      bind:toggled={configuration.enable_cors}
                    />
                  </div>

                  <div class="form-group">
                    <NumberInput 
                      label="Collection Size Limit" 
                      min={1}
                      bind:value={configuration.collection_size_limit}
                      invalid={!!validationErrors.collection_size_limit}
                      invalidText={validationErrors.collection_size_limit}
                    />
                  </div>

                  <div class="form-group">
                    <NumberInput 
                      label="Timeout (seconds)" 
                      min={1}
                      bind:value={configuration.timeout}
                      invalid={!!validationErrors.timeout}
                      invalidText={validationErrors.timeout}
                    />
                  </div>
                {/if}

                <!-- Form Actions -->
                <div class="form-actions">
                  <Button 
                    kind="secondary" 
                    disabled={testing}
                    on:click={handleTestConnection}
                  >
                    {#if testing}
                      Testing...
                    {:else}
                      <Test size={16} />
                      Test Connection
                    {/if}
                  </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={saving}
                  >
                    {#if saving}
                      Saving...
                    {:else}
                      <Save size={16} />
                      Save Configuration
                    {/if}                  </Button>
                </div>
              </form>
            {/if}
          </Tile>
        </Column>
      </Row>
    {/if}
  </Grid>
</Content>
<script>
  import { Tag, Button } from 'carbon-components-svelte';
  import { CheckmarkOutline, WarningFilled, ErrorFilled, Restart, Play, Stop } from 'carbon-icons-svelte';
  import { controlService } from '../lib/api.js';
  import { showNotification } from '../lib/stores.js';

  export let serviceStatus = null;
  export let onStatusChange = () => {};

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return CheckmarkOutline;
      case 'stopped': return Stop;
      case 'failed': return ErrorFilled;
      default: return WarningFilled;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'green';
      case 'stopped': return 'gray';
      case 'failed': return 'red';
      default: return 'yellow';
    }
  };

  const handleControlService = async (action) => {
    try {
      await controlService(action);
      showNotification('success', 'Service Control', `Service ${action} completed successfully.`);
      setTimeout(onStatusChange, 2000); // Wait for service to update
    } catch (error) {
      showNotification('error', 'Service Control Error', error.message);
    }
  };
</script>

{#if serviceStatus}
  <div class="status-badge">
    <Tag type={getStatusColor(serviceStatus.status)} icon={getStatusIcon(serviceStatus.status)}>
      {serviceStatus.status?.toUpperCase() || 'UNKNOWN'}
    </Tag>
    <div class="service-controls">
      <Button size="sm" kind="tertiary" icon={Play} disabled={serviceStatus.status === 'running'} on:click={() => handleControlService('start')}>Start</Button>
      <Button size="sm" kind="tertiary" icon={Stop} disabled={serviceStatus.status !== 'running'} on:click={() => handleControlService('stop')}>Stop</Button>
      <Button size="sm" kind="tertiary" icon={Restart} on:click={() => handleControlService('restart')}>Restart</Button>
    </div>
  </div>
{/if}

<style>
  .status-badge {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .service-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>
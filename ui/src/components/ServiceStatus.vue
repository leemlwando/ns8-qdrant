<template>
  <div class="service-status">
    <div class="status-indicator">
      <div 
        class="status-badge"
        :class="`status-badge--${status.status}`"
      >
        <div class="status-icon">
          <svg v-if="status.status === 'running'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4"/>
            <circle cx="12" cy="12" r="10"/>
          </svg>
          <svg v-else-if="status.status === 'stopped'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="6" y="6" width="12" height="12" rx="2"/>
          </svg>
          <svg v-else-if="status.status === 'failed'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </div>
        <span class="status-text">{{ statusText }}</span>
      </div>
    </div>

    <div class="service-controls">
      <button
        @click="controlService('start')"
        :disabled="status.status === 'running' || controlling"
        class="control-btn control-btn--start"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="5,3 19,12 5,21"/>
        </svg>
        Start
      </button>

      <button
        @click="controlService('stop')"
        :disabled="status.status !== 'running' || controlling"
        class="control-btn control-btn--stop"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="6" y="6" width="12" height="12" rx="2"/>
        </svg>
        Stop
      </button>

      <button
        @click="controlService('restart')"
        :disabled="controlling"
        class="control-btn control-btn--restart"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23,4 23,10 17,10"/>
          <polyline points="1,20 1,14 7,14"/>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64l1.27 1.27m4.24 11.18A9 9 0 0 0 15.36 18.36l-1.27-1.27"/>
        </svg>
        Restart
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useServiceStore } from '@/stores/service'
import { useNotificationStore } from '@/stores/notifications'
import type { ServiceStatus } from '@/stores/service'

interface Props {
  status: ServiceStatus
}

const props = defineProps<Props>()

const serviceStore = useServiceStore()
const notificationStore = useNotificationStore()
const controlling = ref(false)

const statusText = computed(() => {
  switch (props.status.status) {
    case 'running':
      return 'Running'
    case 'stopped':
      return 'Stopped'
    case 'failed':
      return 'Failed'
    default:
      return 'Unknown'
  }
})

const controlService = async (action: 'start' | 'stop' | 'restart') => {
  try {
    controlling.value = true
    await serviceStore.controlService(action)
    notificationStore.show('success', 'Service Control', `Service ${action} completed successfully.`)
  } catch (error) {
    notificationStore.show('error', 'Service Control Error', error instanceof Error ? error.message : `Failed to ${action} service`)
  } finally {
    controlling.value = false
  }
}
</script>

<style scoped>
.service-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge--running {
  background: rgba(72, 187, 120, 0.2);
  color: #22543d;
  border: 1px solid rgba(72, 187, 120, 0.3);
}

.status-badge--stopped {
  background: rgba(113, 128, 150, 0.2);
  color: #2d3748;
  border: 1px solid rgba(113, 128, 150, 0.3);
}

.status-badge--failed {
  background: rgba(229, 62, 62, 0.2);
  color: #742a2a;
  border: 1px solid rgba(229, 62, 62, 0.3);
}

.status-badge--unknown {
  background: rgba(237, 137, 54, 0.2);
  color: #7b341e;
  border: 1px solid rgba(237, 137, 54, 0.3);
}

.status-icon {
  width: 1rem;
  height: 1rem;
}

.service-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.control-btn:hover:not(:disabled) {
  background: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn svg {
  width: 0.875rem;
  height: 0.875rem;
}

.control-btn--start {
  color: #22543d;
}

.control-btn--start:hover:not(:disabled) {
  background: #f0fff4;
  border-color: #48bb78;
}

.control-btn--stop {
  color: #742a2a;
}

.control-btn--stop:hover:not(:disabled) {
  background: #fed7d7;
  border-color: #e53e3e;
}

.control-btn--restart {
  color: #744210;
}

.control-btn--restart:hover:not(:disabled) {
  background: #fffaf0;
  border-color: #ed8936;
}

/* Responsive design */
@media (max-width: 768px) {
  .service-status {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .service-controls {
    width: 100%;
    justify-content: space-between;
  }

  .control-btn {
    flex: 1;
    justify-content: center;
    font-size: 0.7rem;
    padding: 0.4rem 0.5rem;
  }
}
</style>

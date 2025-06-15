<template>
  <div 
    class="notification"
    :class="`notification--${type}`"
  >
    <div class="notification__icon">
      <svg v-if="type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 12l2 2 4-4"/>
        <path d="M21 12c-1.5 0-3-1-3-3s1.5-3 3-3"/>
      </svg>
      <svg v-else-if="type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      <svg v-else-if="type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    </div>
    
    <div class="notification__content">
      <h4 class="notification__title">{{ title }}</h4>
      <p class="notification__message">{{ message }}</p>
    </div>
    
    <button 
      class="notification__close"
      @click="$emit('close')"
      aria-label="Close notification"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
}

defineProps<Props>()
defineEmits<{
  close: []
}>()
</script>

<style scoped>
.notification {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border-left: 4px solid;
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.notification--success {
  border-left-color: #48bb78;
  background: #f0fff4;
}

.notification--error {
  border-left-color: #e53e3e;
  background: #fed7d7;
}

.notification--warning {
  border-left-color: #ed8936;
  background: #fffaf0;
}

.notification--info {
  border-left-color: #4299e1;
  background: #ebf8ff;
}

.notification__icon {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  margin-top: 0.125rem;
}

.notification--success .notification__icon {
  color: #48bb78;
}

.notification--error .notification__icon {
  color: #e53e3e;
}

.notification--warning .notification__icon {
  color: #ed8936;
}

.notification--info .notification__icon {
  color: #4299e1;
}

.notification__content {
  flex: 1;
  min-width: 0;
}

.notification__title {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
}

.notification__message {
  margin: 0;
  font-size: 0.875rem;
  color: #4a5568;
  line-height: 1.4;
}

.notification__close {
  flex-shrink: 0;
  padding: 0.25rem;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #718096;
  transition: all 0.2s ease;
}

.notification__close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #2d3748;
}

.notification__close svg {
  width: 1rem;
  height: 1rem;
}
</style>

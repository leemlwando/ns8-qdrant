<template>
  <div v-if="status && status.qdrant_info" class="qdrant-info">
    <h4>Qdrant Information</h4>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Version:</span>
        <span class="info-value">{{ status.qdrant_info.version || 'Unknown' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Collections:</span>
        <span class="info-value">{{ status.qdrant_info.collections_count || 0 }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Total Points:</span>
        <span class="info-value">{{ formatNumber(status.qdrant_info.total_points || 0) }}</span>
      </div>
      <div v-if="status.uptime" class="info-item">
        <span class="info-label">Uptime:</span>
        <span class="info-value">{{ formatUptime(status.uptime) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ServiceStatus } from '@/stores/service'

interface Props {
  status: ServiceStatus | null
}

defineProps<Props>()

const formatNumber = (num: number): string => {
  return num.toLocaleString()
}

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}
</script>

<style scoped>
.qdrant-info {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

.qdrant-info h4 {
  margin: 0 0 1rem 0;
  color: #1a202c;
  font-size: 1.125rem;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.875rem;
  color: #718096;
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  color: #2d3748;
  font-weight: 600;
}

/* Responsive design */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>

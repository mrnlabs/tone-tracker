<template>
  <div class="stats-grid">
    <Card v-for="stat in stats" :key="stat.key || stat.title" class="stat-card">
      <template #content>
        <div class="stat-content">
          <div 
              class="stat-icon" 
              :class="stat.iconClass"
              :style="{ background: stat.gradient || stat.background || defaultGradients[stat.type] }"
          >
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stat.title }}</h3>
            <p class="stat-number">{{ formatStatValue(stat) }}</p>
            <span v-if="stat.subtitle" class="stat-subtitle">{{ stat.subtitle }}</span>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  stats: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const defaultGradients = {
  total: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  active: 'linear-gradient(135deg, #10b981, #059669)',
  upcoming: 'linear-gradient(135deg, #f59e0b, #d97706)',
  revenue: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  performance: 'linear-gradient(135deg, #06b6d4, #0891b2)',
  team: 'linear-gradient(135deg, #f97316, #ea580c)',
  primary: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  secondary: 'linear-gradient(135deg, #6b7280, #4b5563)'
}

const formatStatValue = (stat) => {
  if (stat.formatter && typeof stat.formatter === 'function') {
    return stat.formatter(stat.value)
  }
  
  if (stat.format === 'currency') {
    return `$${(stat.value || 0).toLocaleString()}`
  }
  
  if (stat.format === 'percentage') {
    return `${(stat.value || 0).toFixed(1)}%`
  }
  
  if (stat.format === 'number') {
    return (stat.value || 0).toLocaleString()
  }
  
  return stat.value || 0
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-info h3 {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-number {
  margin: 0.25rem 0 0 0;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.stat-subtitle {
  font-size: 0.75rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-content {
    gap: 0.75rem;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .stat-number {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
}
</style>
<template>
  <div class="stats-grid">
    <Card
        v-for="stat in statsData"
        :key="stat.id"
        class="stat-card"
    >
      <template #content>
        <div class="stat-content">
          <div :class="['stat-icon', stat.type]">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stat.label }}</h3>
            <p class="stat-number">{{ formatValue(stat.value, stat.format) }}</p>
            <span :class="['stat-change', stat.trend]" v-if="stat.change">
              <i :class="getTrendIcon(stat.trend)"></i>
              {{ stat.change }} from last month
            </span>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  stats: {
    type: Array,
    default: () => []
  }
})

const authStore = useAuthStore()

// Mock stats data based on user role
const statsData = computed(() => {
  const userRole = authStore.user?.role

  // If custom stats are provided, use them
  if (props.stats && props.stats.length > 0) {
    return props.stats
  }

  // Default stats based on role
  const roleBasedStats = {
    ADMIN: [
      {
        id: 1,
        label: 'Total Users',
        value: 156,
        format: 'number',
        icon: 'pi pi-users',
        type: 'users',
        change: '+12',
        trend: 'positive'
      },
      {
        id: 2,
        label: 'Active Activations',
        value: 24,
        format: 'number',
        icon: 'pi pi-calendar',
        type: 'activations',
        change: '+3',
        trend: 'positive'
      },
      {
        id: 3,
        label: 'Total Revenue',
        value: 2450000,
        format: 'currency',
        icon: 'pi pi-dollar',
        type: 'revenue',
        change: '+15%',
        trend: 'positive'
      },
      {
        id: 4,
        label: 'System Health',
        value: 99.8,
        format: 'percentage',
        icon: 'pi pi-check-circle',
        type: 'health',
        change: '+0.2%',
        trend: 'positive'
      }
    ],
    ACTIVATION_MANAGER: [
      {
        id: 1,
        label: 'My Activations',
        value: 8,
        format: 'number',
        icon: 'pi pi-briefcase',
        type: 'activations',
        change: '+2',
        trend: 'positive'
      },
      {
        id: 2,
        label: 'Active Today',
        value: 3,
        format: 'number',
        icon: 'pi pi-play-circle',
        type: 'active',
        change: '0',
        trend: 'neutral'
      },
      {
        id: 3,
        label: 'Team Members',
        value: 12,
        format: 'number',
        icon: 'pi pi-users',
        type: 'team',
        change: '+1',
        trend: 'positive'
      },
      {
        id: 4,
        label: 'Completion Rate',
        value: 85,
        format: 'percentage',
        icon: 'pi pi-chart-line',
        type: 'performance',
        change: '+5%',
        trend: 'positive'
      }
    ],
    CLIENT: [
      {
        id: 1,
        label: 'Active Activations',
        value: 3,
        format: 'number',
        icon: 'pi pi-calendar',
        type: 'activations',
        change: '+1',
        trend: 'positive'
      },
      {
        id: 2,
        label: 'Completed',
        value: 15,
        format: 'number',
        icon: 'pi pi-check-circle',
        type: 'completed',
        change: '+2',
        trend: 'positive'
      },
      {
        id: 3,
        label: 'Total Investment',
        value: 125000,
        format: 'currency',
        icon: 'pi pi-dollar',
        type: 'revenue',
        change: '+8%',
        trend: 'positive'
      },
      {
        id: 4,
        label: 'ROI',
        value: 145,
        format: 'percentage',
        icon: 'pi pi-chart-bar',
        type: 'performance',
        change: '+12%',
        trend: 'positive'
      }
    ],
    WAREHOUSE_MANAGER: [
      {
        id: 1,
        label: 'Total SKUs',
        value: 245,
        format: 'number',
        icon: 'pi pi-box',
        type: 'inventory',
        change: '+15',
        trend: 'positive'
      },
      {
        id: 2,
        label: 'Low Stock Items',
        value: 8,
        format: 'number',
        icon: 'pi pi-exclamation-triangle',
        type: 'warning',
        change: '-2',
        trend: 'positive'
      },
      {
        id: 3,
        label: 'Active Warehouses',
        value: 5,
        format: 'number',
        icon: 'pi pi-building',
        type: 'warehouses',
        change: '0',
        trend: 'neutral'
      },
      {
        id: 4,
        label: 'Inventory Value',
        value: 485000,
        format: 'currency',
        icon: 'pi pi-chart-line',
        type: 'revenue',
        change: '+3%',
        trend: 'positive'
      }
    ],
    PROMOTER: [
      {
        id: 1,
        label: 'This Month',
        value: 15,
        format: 'number',
        icon: 'pi pi-briefcase',
        type: 'activations',
        change: '+3',
        trend: 'positive'
      },
      {
        id: 2,
        label: 'Hours Worked',
        value: 96,
        format: 'number',
        icon: 'pi pi-clock',
        type: 'hours',
        change: '+12',
        trend: 'positive'
      },
      {
        id: 3,
        label: 'Rating',
        value: 4.7,
        format: 'rating',
        icon: 'pi pi-star',
        type: 'rating',
        change: '+0.2',
        trend: 'positive'
      },
      {
        id: 4,
        label: 'Earnings',
        value: 2400,
        format: 'currency',
        icon: 'pi pi-dollar',
        type: 'revenue',
        change: '+15%',
        trend: 'positive'
      }
    ]
  }

  return roleBasedStats[userRole] || roleBasedStats.CLIENT
})

// Methods
const formatValue = (value, format) => {
  switch (format) {
    case 'currency':
      return `$${value.toLocaleString()}`
    case 'percentage':
      return `${value}%`
    case 'rating':
      return `${value}/5`
    case 'number':
    default:
      return value.toLocaleString()
  }
}

const getTrendIcon = (trend) => {
  switch (trend) {
    case 'positive':
      return 'pi pi-arrow-up'
    case 'negative':
      return 'pi pi-arrow-down'
    case 'neutral':
    default:
      return 'pi pi-minus'
  }
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

.stat-icon.users { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.stat-icon.activations { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.stat-icon.revenue { background: linear-gradient(135deg, #10b981, #059669); }
.stat-icon.health { background: linear-gradient(135deg, #06b6d4, #0891b2); }
.stat-icon.active { background: linear-gradient(135deg, #10b981, #059669); }
.stat-icon.team { background: linear-gradient(135deg, #f59e0b, #d97706); }
.stat-icon.performance { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.stat-icon.completed { background: linear-gradient(135deg, #10b981, #059669); }
.stat-icon.inventory { background: linear-gradient(135deg, #6366f1, #4f46e5); }
.stat-icon.warning { background: linear-gradient(135deg, #ef4444, #dc2626); }
.stat-icon.warehouses { background: linear-gradient(135deg, #64748b, #475569); }
.stat-icon.hours { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.stat-icon.rating { background: linear-gradient(135deg, #f59e0b, #d97706); }

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-info h3 {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
  line-height: 1.2;
}

.stat-number {
  margin: 0.25rem 0 0 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.negative {
  color: #ef4444;
}

.stat-change.neutral {
  color: #6b7280;
}

.stat-change i {
  font-size: 0.7rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
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
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .stat-icon {
    width: 60px;
    height: 60px;
  }

  .stat-number {
    font-size: 1.75rem;
  }
}
</style>
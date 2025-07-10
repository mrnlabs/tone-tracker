<!-- StatusBadge.vue - Status indicator component for activation tracking -->
<template>
  <span :class="badgeClasses" v-bind="$attrs">
    <i v-if="icon" :class="icon" class="badge-icon"></i>
    <span v-if="showDot && !icon" class="status-dot"></span>
    <span class="badge-text">{{ displayText }}</span>
    <i v-if="showTrend && trend" :class="trendIcon" class="trend-icon"></i>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  text: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'auto', // auto, primary, secondary, success, warning, danger, info
    validator: (value) => ['auto', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'].includes(value)
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  icon: {
    type: String,
    default: ''
  },
  showDot: {
    type: Boolean,
    default: true
  },
  showTrend: {
    type: Boolean,
    default: false
  },
  trend: {
    type: String,
    default: '', // up, down, stable
    validator: (value) => ['', 'up', 'down', 'stable'].includes(value)
  },
  rounded: {
    type: Boolean,
    default: true
  },
  outlined: {
    type: Boolean,
    default: false
  }
})

// Status configurations for activation tracking system
const statusConfig = {
  // Activation statuses
  'active': {
    variant: 'success',
    icon: 'pi pi-play-circle',
    text: 'Active'
  },
  'pending': {
    variant: 'warning',
    icon: 'pi pi-clock',
    text: 'Pending'
  },
  'completed': {
    variant: 'success',
    icon: 'pi pi-check-circle',
    text: 'Completed'
  },
  'cancelled': {
    variant: 'danger',
    icon: 'pi pi-times-circle',
    text: 'Cancelled'
  },
  'draft': {
    variant: 'secondary',
    icon: 'pi pi-file-edit',
    text: 'Draft'
  },
  'scheduled': {
    variant: 'info',
    icon: 'pi pi-calendar',
    text: 'Scheduled'
  },
  'in-progress': {
    variant: 'primary',
    icon: 'pi pi-spinner',
    text: 'In Progress'
  },
  'paused': {
    variant: 'warning',
    icon: 'pi pi-pause',
    text: 'Paused'
  },
  'overdue': {
    variant: 'danger',
    icon: 'pi pi-exclamation-triangle',
    text: 'Overdue'
  },

  // User/Promoter statuses
  'online': {
    variant: 'success',
    icon: 'pi pi-circle-fill',
    text: 'Online'
  },
  'offline': {
    variant: 'secondary',
    icon: 'pi pi-circle',
    text: 'Offline'
  },
  'checked-in': {
    variant: 'success',
    icon: 'pi pi-map-marker',
    text: 'Checked In'
  },
  'checked-out': {
    variant: 'warning',
    icon: 'pi pi-sign-out',
    text: 'Checked Out'
  },
  'absent': {
    variant: 'danger',
    icon: 'pi pi-times',
    text: 'Absent'
  },
  'on-break': {
    variant: 'warning',
    icon: 'pi pi-pause-circle',
    text: 'On Break'
  },

  // Stock/Inventory statuses
  'in-stock': {
    variant: 'success',
    icon: 'pi pi-check',
    text: 'In Stock'
  },
  'low-stock': {
    variant: 'warning',
    icon: 'pi pi-exclamation-triangle',
    text: 'Low Stock'
  },
  'out-of-stock': {
    variant: 'danger',
    icon: 'pi pi-times',
    text: 'Out of Stock'
  },
  'allocated': {
    variant: 'info',
    icon: 'pi pi-send',
    text: 'Allocated'
  },
  'delivered': {
    variant: 'success',
    icon: 'pi pi-check-circle',
    text: 'Delivered'
  },

  // Client statuses
  'new': {
    variant: 'info',
    icon: 'pi pi-plus-circle',
    text: 'New'
  },
  'verified': {
    variant: 'success',
    icon: 'pi pi-verified',
    text: 'Verified'
  },
  'inactive': {
    variant: 'secondary',
    icon: 'pi pi-pause',
    text: 'Inactive'
  },
  'suspended': {
    variant: 'danger',
    icon: 'pi pi-ban',
    text: 'Suspended'
  }
}

const currentConfig = computed(() => {
  return statusConfig[props.status.toLowerCase()] || {
    variant: 'secondary',
    icon: 'pi pi-question',
    text: props.status
  }
})

const displayVariant = computed(() => {
  return props.variant === 'auto' ? currentConfig.value.variant : props.variant
})

const displayText = computed(() => {
  return props.text || currentConfig.value.text
})

const displayIcon = computed(() => {
  return props.icon || currentConfig.value.icon
})

const trendIcon = computed(() => {
  const icons = {
    'up': 'pi pi-arrow-up',
    'down': 'pi pi-arrow-down',
    'stable': 'pi pi-minus'
  }
  return icons[props.trend]
})

const badgeClasses = computed(() => {
  const classes = ['status-badge']

  // Variant classes
  classes.push(`badge-${displayVariant.value}`)

  // Size classes
  classes.push(`badge-${props.size}`)

  // Style classes
  if (props.rounded) classes.push('badge-rounded')
  if (props.outlined) classes.push('badge-outlined')
  if (props.showTrend && props.trend) classes.push('badge-with-trend')

  return classes.join(' ')
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: 1px solid transparent;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
  line-height: 1.2;
}

/* Size variants */
.badge-small {
  padding: 0.125rem 0.5rem;
  font-size: 0.625rem;
  gap: 0.25rem;
}

.badge-large {
  padding: 0.375rem 1rem;
  font-size: 0.875rem;
  gap: 0.5rem;
}

/* Color variants - Solid */
.badge-primary {
  background-color: var(--brand-primary, #3b82f6);
  color: white;
}

.badge-secondary {
  background-color: var(--text-secondary, #6b7280);
  color: white;
}

.badge-success {
  background-color: var(--brand-success, #10b981);
  color: white;
}

.badge-warning {
  background-color: var(--brand-warning, #f59e0b);
  color: white;
}

.badge-danger {
  background-color: var(--brand-error, #ef4444);
  color: white;
}

.badge-info {
  background-color: var(--brand-info, #06b6d4);
  color: white;
}

/* Outlined variants */
.badge-outlined.badge-primary {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--brand-primary, #3b82f6);
  border-color: var(--brand-primary, #3b82f6);
}

.badge-outlined.badge-secondary {
  background-color: rgba(107, 114, 128, 0.1);
  color: var(--text-secondary, #6b7280);
  border-color: var(--text-secondary, #6b7280);
}

.badge-outlined.badge-success {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--brand-success, #10b981);
  border-color: var(--brand-success, #10b981);
}

.badge-outlined.badge-warning {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--brand-warning, #f59e0b);
  border-color: var(--brand-warning, #f59e0b);
}

.badge-outlined.badge-danger {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--brand-error, #ef4444);
  border-color: var(--brand-error, #ef4444);
}

.badge-outlined.badge-info {
  background-color: rgba(6, 182, 212, 0.1);
  color: var(--brand-info, #06b6d4);
  border-color: var(--brand-info, #06b6d4);
}

/* Rounded style */
.badge-rounded {
  border-radius: 9999px;
}

/* Icon and dot styles */
.badge-icon {
  font-size: 0.75em;
}

.badge-small .badge-icon {
  font-size: 0.7em;
}

.badge-large .badge-icon {
  font-size: 0.8em;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: currentColor;
  flex-shrink: 0;
}

.badge-small .status-dot {
  width: 0.375rem;
  height: 0.375rem;
}

.badge-large .status-dot {
  width: 0.625rem;
  height: 0.625rem;
}

/* Trend indicator */
.trend-icon {
  font-size: 0.6em;
  opacity: 0.8;
}

.badge-with-trend {
  padding-right: 0.5rem;
}

/* Special animation for active status */
.status-badge.badge-success .status-dot {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Special spinner animation for in-progress */
.status-badge .pi-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Activation tracking specific styles */
.status-badge.activation-priority-high {
  border-left: 3px solid var(--brand-error, #ef4444);
}

.status-badge.activation-priority-medium {
  border-left: 3px solid var(--brand-warning, #f59e0b);
}

.status-badge.activation-priority-low {
  border-left: 3px solid var(--brand-success, #10b981);
}

/* Hover effects */
.status-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .status-badge {
    font-size: 0.65rem;
    padding: 0.2rem 0.6rem;
  }

  .badge-large {
    font-size: 0.75rem;
    padding: 0.3rem 0.8rem;
  }
}
</style>
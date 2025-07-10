<!-- BaseCard.vue - Reusable card component for the entire app -->
<template>
  <Card :class="cardClasses" v-bind="$attrs">
    <!-- Header slot -->
    <template v-if="hasHeader" #header>
      <div class="card-header">
        <div class="header-content">
          <div class="header-main">
            <i v-if="icon" :class="icon" class="header-icon"></i>
            <div class="header-text">
              <h3 v-if="title" class="header-title">{{ title }}</h3>
              <p v-if="subtitle" class="header-subtitle">{{ subtitle }}</p>
            </div>
          </div>
          <div v-if="hasHeaderActions" class="header-actions">
            <slot name="header-actions"></slot>
          </div>
        </div>
      </div>
    </template>

    <!-- Content -->
    <template #content>
      <div :class="contentClasses">
        <slot></slot>
      </div>
    </template>

    <!-- Footer slot -->
    <template v-if="hasFooter" #footer>
      <div class="card-footer">
        <slot name="footer"></slot>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'default', // default, primary, success, warning, danger, info
    validator: (value) => ['default', 'primary', 'success', 'warning', 'danger', 'info'].includes(value)
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  padding: {
    type: String,
    default: 'normal', // none, small, normal, large
    validator: (value) => ['none', 'small', 'normal', 'large'].includes(value)
  },
  shadow: {
    type: String,
    default: 'medium', // none, small, medium, large
    validator: (value) => ['none', 'small', 'medium', 'large'].includes(value)
  },
  hoverable: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  rounded: {
    type: Boolean,
    default: true
  },
  bordered: {
    type: Boolean,
    default: true
  }
})

const slots = useSlots()

const hasHeader = computed(() => {
  return props.title || props.subtitle || props.icon || slots.header || slots['header-actions']
})

const hasHeaderActions = computed(() => {
  return slots['header-actions']
})

const hasFooter = computed(() => {
  return slots.footer
})

const cardClasses = computed(() => {
  const classes = ['base-card']

  // Variant classes
  classes.push(`card-${props.variant}`)

  // Size classes
  classes.push(`card-${props.size}`)

  // Shadow classes
  classes.push(`shadow-${props.shadow}`)

  // State classes
  if (props.hoverable) classes.push('card-hoverable')
  if (props.loading) classes.push('card-loading')
  if (!props.rounded) classes.push('card-square')
  if (!props.bordered) classes.push('card-borderless')

  return classes.join(' ')
})

const contentClasses = computed(() => {
  const classes = ['card-content']

  // Padding classes
  classes.push(`padding-${props.padding}`)

  return classes.join(' ')
})
</script>

<style scoped>
/* Base card styles */
.base-card {
  position: relative;
  background: var(--bg-primary, #ffffff);
  border-radius: 0.75rem;
  transition: all 0.2s ease-in-out;
  overflow: hidden;
}

/* Card variants */
.card-default {
  border: 1px solid var(--border-light, #e5e7eb);
}

.card-primary {
  border: 1px solid var(--brand-primary, #3b82f6);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(59, 130, 246, 0.08) 100%);
}

.card-success {
  border: 1px solid var(--brand-success, #10b981);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, rgba(16, 185, 129, 0.08) 100%);
}

.card-warning {
  border: 1px solid var(--brand-warning, #f59e0b);
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.02) 0%, rgba(245, 158, 11, 0.08) 100%);
}

.card-danger {
  border: 1px solid var(--brand-error, #ef4444);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.02) 0%, rgba(239, 68, 68, 0.08) 100%);
}

.card-info {
  border: 1px solid var(--brand-info, #06b6d4);
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.02) 0%, rgba(6, 182, 212, 0.08) 100%);
}

/* Card sizes */
.card-small {
  border-radius: 0.5rem;
}

.card-large {
  border-radius: 1rem;
}

/* Shadow variants */
.shadow-none {
  box-shadow: none;
}

.shadow-small {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.shadow-medium {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.shadow-large {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Interactive states */
.card-hoverable {
  cursor: pointer;
}

.card-hoverable:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.card-loading {
  opacity: 0.7;
  pointer-events: none;
}

.card-loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* Style overrides */
.card-square {
  border-radius: 0;
}

.card-borderless {
  border: none;
}

/* Header styles */
.card-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid var(--border-light, #e5e7eb);
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.header-main {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
}

.header-icon {
  color: var(--brand-primary, #3b82f6);
  font-size: 1.25rem;
  margin-top: 0.125rem;
}

.header-text {
  flex: 1;
}

.header-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary, #111827);
  line-height: 1.4;
}

.header-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
  line-height: 1.4;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
}

/* Content styles */
.card-content {
  transition: all 0.2s ease-in-out;
}

.padding-none {
  padding: 0;
}

.padding-small {
  padding: 1rem;
}

.padding-normal {
  padding: 1.5rem;
}

.padding-large {
  padding: 2rem;
}

/* Footer styles */
.card-footer {
  padding: 0 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid var(--border-light, #e5e7eb);
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

/* Activation tracking specific card styles */
.base-card.activation-card {
  border: 1px solid var(--border-light, #e5e7eb);
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.base-card.activation-card:hover {
  border-color: var(--brand-primary, #3b82f6);
  box-shadow: 0 8px 25px -3px rgba(59, 130, 246, 0.15);
}

.base-card.stat-card {
  text-align: center;
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
}

.base-card.metric-card {
  border-left: 4px solid var(--brand-primary, #3b82f6);
}

/* Responsive design */
@media (max-width: 768px) {
  .card-header,
  .card-content,
  .card-footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .padding-normal {
    padding: 1rem;
  }

  .padding-large {
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .header-actions {
    justify-content: flex-end;
  }

  .card-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}
</style>
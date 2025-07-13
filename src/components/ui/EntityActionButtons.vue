<template>
  <div class="entity-action-buttons">
    <Button
        v-for="action in visibleActions"
        :key="action.action || action.key || action.icon"
        @click="handleAction(action)"
        :icon="action.icon"
        :label="action.label"
        :class="getButtonClass(action)"
        :disabled="action.disabled || loading"
        :loading="action.loading"
        v-tooltip.top="getTooltip(action)"
    />
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  actions: {
    type: Array,
    required: true
  },
  entity: {
    type: Object,
    required: true
  },
  permissions: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'table', // 'table' | 'card'
    validator: (value) => ['table', 'card'].includes(value)
  }
})

const emit = defineEmits(['action'])

const visibleActions = computed(() => {
  return props.actions.filter(action => {
    // Check permission-based visibility
    if (action.permission && !props.permissions[action.permission]) {
      return false
    }
    
    // Check custom visibility function
    if (action.visible && typeof action.visible === 'function') {
      return action.visible(props.entity, props.permissions)
    }
    
    // Check simple visible boolean
    if (action.visible !== undefined && typeof action.visible === 'boolean') {
      return action.visible
    }
    
    // Default to visible
    return true
  })
})

const getButtonClass = (action) => {
  const baseClasses = ['p-button-text', 'p-button-rounded']
  
  // Add size based on variant
  if (props.variant === 'card') {
    baseClasses.push('p-button-sm')
  }
  
  // Add severity classes
  if (action.severity === 'danger') {
    baseClasses.push('p-button-danger')
  } else if (action.severity === 'warning') {
    baseClasses.push('p-button-warning')
  } else if (action.severity === 'success') {
    baseClasses.push('p-button-success')
  }
  
  // Add custom classes
  if (action.class) {
    if (Array.isArray(action.class)) {
      baseClasses.push(...action.class)
    } else {
      baseClasses.push(action.class)
    }
  }
  
  return baseClasses.join(' ')
}

const getTooltip = (action) => {
  if (action.tooltip) {
    return typeof action.tooltip === 'function' 
      ? action.tooltip(props.entity) 
      : action.tooltip
  }
  return action.label || action.key
}

const handleAction = (action) => {
  if (action.handler && typeof action.handler === 'function') {
    action.handler(props.entity)
  } else {
    emit('action', {
      action: action.action || action.key || action.label,
      entity: props.entity,
      actionConfig: action
    })
  }
}
</script>

<style scoped>
.entity-action-buttons {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

/* Responsive behavior for mobile */
@media (max-width: 768px) {
  .entity-action-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
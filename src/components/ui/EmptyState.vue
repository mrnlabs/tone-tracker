<template>
  <div class="empty-state">
    <i :class="iconClass" class="empty-icon"></i>
    <h3>{{ title }}</h3>
    <p v-if="message">{{ message }}</p>
    <div v-if="actions && actions.length > 0" class="empty-actions">
      <Button
          v-for="action in actions"
          :key="action.key || action.label"
          @click="handleAction(action)"
          :label="action.label"
          :icon="action.icon"
          :class="action.class || 'p-button-outlined'"
          :disabled="action.disabled"
          :loading="action.loading"
      />
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'empty',
    validator: (value) => ['empty', 'no-results', 'error', 'loading'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: null
  },
  icon: {
    type: String,
    default: null
  },
  actions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['action'])

const iconClass = computed(() => {
  if (props.icon) {
    return `pi ${props.icon}`
  }
  
  // Default icons based on type
  const defaultIcons = {
    empty: 'pi pi-inbox',
    'no-results': 'pi pi-search',
    error: 'pi pi-exclamation-triangle',
    loading: 'pi pi-spin pi-spinner'
  }
  
  return defaultIcons[props.type] || 'pi pi-info-circle'
})

const handleAction = (action) => {
  if (action.handler && typeof action.handler === 'function') {
    action.handler()
  } else {
    emit('action', action)
  }
}
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
  display: block;
}

.empty-state h3 {
  color: #111827;
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.empty-state p {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* State-specific styling */
.empty-state[data-type="error"] .empty-icon {
  color: #ef4444;
}

.empty-state[data-type="loading"] .empty-icon {
  color: #3b82f6;
}

.empty-state[data-type="no-results"] .empty-icon {
  color: #f59e0b;
}

@media (max-width: 768px) {
  .empty-state {
    padding: 2rem 1rem;
  }
  
  .empty-icon {
    font-size: 3rem;
  }
  
  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
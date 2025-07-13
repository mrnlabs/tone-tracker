<template>
  <div class="page-header">
    <div class="header-content">
      <div class="header-info">
        <h1 class="page-title">{{ title }}</h1>
        <p v-if="description" class="page-description">{{ description }}</p>
      </div>
      <div v-if="actions && actions.length > 0" class="header-actions">
        <div class="header-button-group">
          <Button
              v-for="action in actions"
              :key="action.key || action.label"
              @click="handleAction(action)"
              :icon="action.icon"
              :label="action.label"
              :class="action.class || 'p-button-outlined'"
              :loading="action.loading || loading"
              :disabled="action.disabled || loading"
              :v-tooltip="action.tooltip"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  actions: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['action'])

const handleAction = (action) => {
  if (action.handler) {
    action.handler()
  } else {
    emit('action', action)
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.page-description {
  color: #6b7280;
  margin: 0;
}

.header-button-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .header-button-group {
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>
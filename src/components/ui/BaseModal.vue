<!-- BaseModal.vue - Reusable modal component for the entire app -->
<template>
  <Dialog
      :visible="visible"
      :modal="modal"
      :header="title"
      :closable="closable"
      :draggable="draggable"
      :resizable="resizable"
      :style="modalStyle"
      :class="modalClasses"
      :pt="{
      root: { class: 'base-modal-root' },
      header: { class: 'base-modal-header' },
      content: { class: 'base-modal-content' },
      footer: { class: 'base-modal-footer' }
    }"
      @update:visible="handleVisibilityChange"
      @show="$emit('show')"
      @hide="$emit('hide')"
  >
    <!-- Custom header if needed -->
    <template v-if="hasCustomHeader" #header>
      <div class="modal-header-custom">
        <div class="header-main">
          <i v-if="icon" :class="icon" class="header-icon"></i>
          <div class="header-text">
            <h3 class="header-title">{{ title }}</h3>
            <p v-if="subtitle" class="header-subtitle">{{ subtitle }}</p>
          </div>
        </div>
        <div v-if="hasHeaderActions" class="header-actions">
          <slot name="header-actions"></slot>
        </div>
      </div>
    </template>

    <!-- Modal Content -->
    <div :class="contentClasses">
      <div v-if="loading" class="modal-loading">
        <ProgressSpinner style="width:50px;height:50px" strokeWidth="8" fill="transparent" animationDuration=".5s"/>
        <p>{{ loadingText }}</p>
      </div>
      <div v-else>
        <slot></slot>
      </div>
    </div>

    <!-- Modal Footer -->
    <template v-if="hasFooter" #footer>
      <div class="modal-footer-content">
        <slot name="footer">
          <!-- Default footer buttons -->
          <div v-if="showDefaultButtons" class="default-buttons">
            <BaseButton
                v-if="showCancelButton"
                :label="cancelText"
                variant="outlined"
                @click="handleCancel"
                :disabled="processing"
            />
            <BaseButton
                v-if="showConfirmButton"
                :label="confirmText"
                :variant="confirmVariant"
                :loading="processing"
                @click="handleConfirm"
            />
          </div>
        </slot>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed, useSlots } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
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
  size: {
    type: String,
    default: 'medium', // small, medium, large, xl, full
    validator: (value) => ['small', 'medium', 'large', 'xl', 'full'].includes(value)
  },
  variant: {
    type: String,
    default: 'default', // default, primary, success, warning, danger
    validator: (value) => ['default', 'primary', 'success', 'warning', 'danger'].includes(value)
  },
  modal: {
    type: Boolean,
    default: true
  },
  closable: {
    type: Boolean,
    default: true
  },
  draggable: {
    type: Boolean,
    default: false
  },
  resizable: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: 'Loading...'
  },
  processing: {
    type: Boolean,
    default: false
  },
  showDefaultButtons: {
    type: Boolean,
    default: false
  },
  showCancelButton: {
    type: Boolean,
    default: true
  },
  showConfirmButton: {
    type: Boolean,
    default: true
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  confirmVariant: {
    type: String,
    default: 'primary'
  }
})

const emit = defineEmits(['update:visible', 'show', 'hide', 'confirm', 'cancel'])

const slots = useSlots()

const hasCustomHeader = computed(() => {
  return props.icon || props.subtitle || slots['header-actions']
})

const hasHeaderActions = computed(() => {
  return slots['header-actions']
})

const hasFooter = computed(() => {
  return slots.footer || props.showDefaultButtons
})

const modalClasses = computed(() => {
  const classes = ['base-modal']

  // Size classes
  classes.push(`modal-${props.size}`)

  // Variant classes
  classes.push(`modal-${props.variant}`)

  // State classes
  if (props.loading) classes.push('modal-loading-state')

  return classes.join(' ')
})

const modalStyle = computed(() => {
  const styles = {}

  switch (props.size) {
    case 'small':
      styles.width = '400px'
      break
    case 'medium':
      styles.width = '600px'
      break
    case 'large':
      styles.width = '800px'
      break
    case 'xl':
      styles.width = '1200px'
      break
    case 'full':
      styles.width = '95vw'
      styles.height = '95vh'
      break
  }

  return styles
})

const contentClasses = computed(() => {
  const classes = ['modal-body']

  if (props.loading) classes.push('modal-body-loading')

  return classes.join(' ')
})

const handleVisibilityChange = (value) => {
  emit('update:visible', value)
}

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}
</script>

<style scoped>
/* Base modal overrides */
:deep(.base-modal-root) {
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

:deep(.base-modal-header) {
  background: var(--bg-primary, #ffffff);
  border-bottom: 1px solid var(--border-light, #e5e7eb);
  padding: 1.5rem;
}

:deep(.base-modal-content) {
  background: var(--bg-primary, #ffffff);
  padding: 0;
}

:deep(.base-modal-footer) {
  background: var(--bg-secondary, #f9fafb);
  border-top: 1px solid var(--border-light, #e5e7eb);
  padding: 1rem 1.5rem;
}

/* Modal variants */
.modal-primary :deep(.base-modal-header) {
  background: linear-gradient(135deg, var(--brand-primary, #3b82f6) 0%, #1d4ed8 100%);
  color: white;
}

.modal-success :deep(.base-modal-header) {
  background: linear-gradient(135deg, var(--brand-success, #10b981) 0%, #059669 100%);
  color: white;
}

.modal-warning :deep(.base-modal-header) {
  background: linear-gradient(135deg, var(--brand-warning, #f59e0b) 0%, #d97706 100%);
  color: white;
}

.modal-danger :deep(.base-modal-header) {
  background: linear-gradient(135deg, var(--brand-error, #ef4444) 0%, #dc2626 100%);
  color: white;
}

/* Custom header styles */
.modal-header-custom {
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
  font-size: 1.5rem;
  margin-top: 0.125rem;
}

.header-text {
  flex: 1;
}

.header-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
}

.header-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  opacity: 0.8;
  line-height: 1.4;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
}

/* Modal body styles */
.modal-body {
  padding: 1.5rem;
  min-height: 100px;
}

.modal-body-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-align: center;
  color: var(--text-secondary, #6b7280);
}

/* Footer styles */
.modal-footer-content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
}

.default-buttons {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

/* Size-specific adjustments */
.modal-small .modal-body {
  padding: 1rem;
}

.modal-large .modal-body {
  padding: 2rem;
}

.modal-xl .modal-body {
  padding: 2rem;
}

.modal-full .modal-body {
  padding: 2rem;
  height: calc(95vh - 140px);
  overflow-y: auto;
}

/* Activation tracking specific modal styles */
.base-modal.activation-modal :deep(.base-modal-header) {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 2px solid var(--brand-primary, #3b82f6);
}

.base-modal.confirmation-modal :deep(.base-modal-root) {
  border: 2px solid var(--brand-warning, #f59e0b);
}

.base-modal.danger-modal :deep(.base-modal-root) {
  border: 2px solid var(--brand-error, #ef4444);
}

/* Responsive design */
@media (max-width: 768px) {
  :deep(.base-modal-root) {
    width: 95vw !important;
    margin: 0.5rem;
  }

  .modal-body {
    padding: 1rem;
  }

  :deep(.base-modal-header),
  :deep(.base-modal-footer) {
    padding: 1rem;
  }

  .modal-header-custom {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .header-actions {
    justify-content: flex-end;
  }

  .modal-footer-content {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .default-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  :deep(.base-modal-root) {
    width: 100vw !important;
    height: 100vh !important;
    margin: 0;
    border-radius: 0;
  }

  .modal-full .modal-body {
    height: calc(100vh - 140px);
  }
}
</style>
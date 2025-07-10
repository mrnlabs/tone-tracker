<template>
  <transition
      name="alert"
      enter-active-class="alert-enter-active"
      leave-active-class="alert-leave-active"
      enter-from-class="alert-enter-from"
      leave-to-class="alert-leave-to"
  >
    <div v-if="visible" :class="alertClasses" role="alert" :aria-live="ariaLive">
      <div class="alert-content">
        <!-- Icon -->
        <div v-if="showIcon" class="alert-icon">
          <i :class="iconClass" />
        </div>

        <!-- Main Content -->
        <div class="alert-body">
          <!-- Title -->
          <h4 v-if="title" class="alert-title">{{ title }}</h4>

          <!-- Message -->
          <div class="alert-message">
            <slot>
              <p v-if="message">{{ message }}</p>
            </slot>
          </div>

          <!-- Actions -->
          <div v-if="actions.length > 0 || $slots.actions" class="alert-actions">
            <slot name="actions">
              <BaseButton
                  v-for="action in actions"
                  :key="action.id"
                  :variant="getActionVariant(action)"
                  :size="action.size || 'small'"
                  :icon="action.icon"
                  :label="action.label"
                  :disabled="action.disabled"
                  @click="handleAction(action)"
              />
            </slot>
          </div>
        </div>

        <!-- Close Button -->
        <button
            v-if="closable"
            type="button"
            class="alert-close"
            :aria-label="closeLabel"
            @click="handleClose"
        >
          <i class="pi pi-times" />
        </button>
      </div>

      <!-- Progress Bar for Auto-dismiss -->
      <div
          v-if="autoDismiss && showProgress"
          class="alert-progress"
          :style="{ animationDuration: `${autoDismissDelay}ms` }"
      />
    </div>
  </transition>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: true
  },
  variant: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'info', 'warning', 'danger'].includes(value)
  },
  severity: {
    type: String,
    default: null,
    validator: (value) => [null, 'success', 'info', 'warn', 'error'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  closable: {
    type: Boolean,
    default: true
  },
  closeLabel: {
    type: String,
    default: 'Close alert'
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    default: ''
  },
  autoDismiss: {
    type: Boolean,
    default: false
  },
  autoDismissDelay: {
    type: Number,
    default: 5000
  },
  showProgress: {
    type: Boolean,
    default: false
  },
  actions: {
    type: Array,
    default: () => []
  },
  rounded: {
    type: Boolean,
    default: true
  },
  outlined: {
    type: Boolean,
    default: false
  },
  filled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'close', 'action'])

// Internal state
const isVisible = ref(props.visible)
const autoDismissTimer = ref(null)

// Computed properties
const currentVariant = computed(() => {
  if (props.severity) {
    const severityMap = {
      success: 'success',
      info: 'info',
      warn: 'warning',
      error: 'danger'
    }
    return severityMap[props.severity] || 'info'
  }
  return props.variant
})

const alertClasses = computed(() => {
  const classes = ['base-alert']

  // Variant classes
  classes.push(`alert-${currentVariant.value}`)

  // Size classes
  classes.push(`alert-${props.size}`)

  // Style modifiers
  if (props.rounded) classes.push('alert-rounded')
  if (props.outlined) classes.push('alert-outlined')
  if (props.filled) classes.push('alert-filled')

  return classes.join(' ')
})

const iconClass = computed(() => {
  if (props.icon) return props.icon

  const defaultIcons = {
    success: 'pi pi-check-circle',
    info: 'pi pi-info-circle',
    warning: 'pi pi-exclamation-triangle',
    danger: 'pi pi-times-circle'
  }

  return defaultIcons[currentVariant.value] || 'pi pi-info-circle'
})

const ariaLive = computed(() => {
  return currentVariant.value === 'danger' ? 'assertive' : 'polite'
})

// Methods
const getActionVariant = (action) => {
  if (action.variant) return action.variant

  const variantMap = {
    success: 'success',
    info: 'primary',
    warning: 'warning',
    danger: 'danger'
  }

  return variantMap[currentVariant.value] || 'text'
}

const handleClose = () => {
  isVisible.value = false
  clearAutoDismissTimer()
  emit('update:visible', false)
  emit('close')
}

const handleAction = (action) => {
  emit('action', action)
  if (action.close !== false) {
    handleClose()
  }
}

const startAutoDismissTimer = () => {
  if (props.autoDismiss && props.autoDismissDelay > 0) {
    autoDismissTimer.value = setTimeout(() => {
      handleClose()
    }, props.autoDismissDelay)
  }
}

const clearAutoDismissTimer = () => {
  if (autoDismissTimer.value) {
    clearTimeout(autoDismissTimer.value)
    autoDismissTimer.value = null
  }
}

const pauseAutoDismiss = () => {
  clearAutoDismissTimer()
}

const resumeAutoDismiss = () => {
  startAutoDismissTimer()
}

// Watchers
watch(() => props.visible, (newValue) => {
  isVisible.value = newValue
  if (newValue) {
    startAutoDismissTimer()
  } else {
    clearAutoDismissTimer()
  }
})

watch(isVisible, (newValue) => {
  if (newValue !== props.visible) {
    emit('update:visible', newValue)
  }
})

// Lifecycle
onMounted(() => {
  if (isVisible.value) {
    startAutoDismissTimer()
  }
})

// Expose methods for parent components
defineExpose({
  close: handleClose,
  pauseAutoDismiss,
  resumeAutoDismiss
})
</script>

<style scoped>
.base-alert {
  position: relative;
  border: 1px solid transparent;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.alert-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
}

.alert-icon {
  flex-shrink: 0;
  font-size: 1.25rem;
  margin-top: 0.125rem;
}

.alert-body {
  flex: 1;
  min-width: 0;
}

.alert-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
}

.alert-message {
  margin: 0;
  line-height: 1.5;
}

.alert-message p {
  margin: 0;
}

.alert-actions {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.alert-close {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.15s ease;
  color: inherit;
  opacity: 0.7;
  margin-top: 0.125rem;
}

.alert-close:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.1);
}

.alert-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  transform-origin: left;
  animation: progress-shrink linear;
}

@keyframes progress-shrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Variant Styles - Default (Light) */
.alert-success {
  background-color: #ecfdf5;
  border-color: #a7f3d0;
  color: #065f46;
}

.alert-success .alert-icon {
  color: #10b981;
}

.alert-success .alert-progress {
  background-color: #10b981;
}

.alert-info {
  background-color: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
}

.alert-info .alert-icon {
  color: #3b82f6;
}

.alert-info .alert-progress {
  background-color: #3b82f6;
}

.alert-warning {
  background-color: #fffbeb;
  border-color: #fde68a;
  color: #92400e;
}

.alert-warning .alert-icon {
  color: #f59e0b;
}

.alert-warning .alert-progress {
  background-color: #f59e0b;
}

.alert-danger {
  background-color: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

.alert-danger .alert-icon {
  color: #ef4444;
}

.alert-danger .alert-progress {
  background-color: #ef4444;
}

/* Outlined variants */
.alert-outlined {
  background-color: transparent;
  border-width: 2px;
}

.alert-outlined.alert-success {
  border-color: #10b981;
  color: #059669;
}

.alert-outlined.alert-info {
  border-color: #3b82f6;
  color: #2563eb;
}

.alert-outlined.alert-warning {
  border-color: #f59e0b;
  color: #d97706;
}

.alert-outlined.alert-danger {
  border-color: #ef4444;
  color: #dc2626;
}

/* Filled variants */
.alert-filled {
  border: none;
  color: white;
}

.alert-filled.alert-success {
  background: linear-gradient(135deg, #10b981, #059669);
}

.alert-filled.alert-info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.alert-filled.alert-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.alert-filled.alert-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.alert-filled .alert-close:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Size variants */
.alert-small {
  font-size: 0.875rem;
}

.alert-small .alert-content {
  padding: 0.75rem;
  gap: 0.5rem;
}

.alert-small .alert-icon {
  font-size: 1rem;
}

.alert-small .alert-title {
  font-size: 0.875rem;
}

.alert-large {
  font-size: 1.125rem;
}

.alert-large .alert-content {
  padding: 1.5rem;
  gap: 1rem;
}

.alert-large .alert-icon {
  font-size: 1.5rem;
}

.alert-large .alert-title {
  font-size: 1.25rem;
}

/* Rounded variants */
.alert-rounded {
  border-radius: 0.5rem;
}

/* Animation classes */
.alert-enter-active,
.alert-leave-active {
  transition: all 0.3s ease;
}

.alert-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.alert-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive design */
@media (max-width: 768px) {
  .alert-content {
    padding: 0.75rem;
  }

  .alert-actions {
    margin-top: 0.5rem;
  }

  .alert-actions .base-button {
    font-size: 0.875rem;
  }
}

/* Focus management for accessibility */
.alert-close:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Print styles */
@media print {
  .base-alert {
    break-inside: avoid;
    border: 1px solid #000 !important;
    background: #fff !important;
    color: #000 !important;
  }

  .alert-close {
    display: none;
  }
}
</style>
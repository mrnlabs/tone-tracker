<!-- InputError.vue - Form error display component -->
<template>
  <Transition name="error-fade" appear>
    <div v-if="hasError" :class="errorClasses">
      <i :class="iconClass" class="error-icon"></i>
      <div class="error-content">
        <span v-if="typeof error === 'string'" class="error-message">{{ error }}</span>
        <div v-else-if="Array.isArray(error)" class="error-list">
          <span v-for="(err, index) in error" :key="index" class="error-message">
            {{ err }}
          </span>
        </div>
        <div v-else-if="typeof error === 'object'" class="error-details">
          <span class="error-message">{{ error.message || 'An error occurred' }}</span>
          <span v-if="error.code" class="error-code">Error Code: {{ error.code }}</span>
        </div>
      </div>
      <button
          v-if="dismissible"
          @click="handleDismiss"
          class="error-dismiss"
          type="button"
          aria-label="Dismiss error"
      >
        <i class="pi pi-times"></i>
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  error: {
    type: [String, Array, Object],
    default: null
  },
  variant: {
    type: String,
    default: 'error', // error, warning, info
    validator: (value) => ['error', 'warning', 'info'].includes(value)
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
  showIcon: {
    type: Boolean,
    default: true
  },
  dismissible: {
    type: Boolean,
    default: false
  },
  inline: {
    type: Boolean,
    default: false
  },
  bordered: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['dismiss'])

const hasError = computed(() => {
  if (!props.error) return false
  if (typeof props.error === 'string') return props.error.trim().length > 0
  if (Array.isArray(props.error)) return props.error.length > 0
  if (typeof props.error === 'object') return true
  return false
})

const errorClasses = computed(() => {
  const classes = ['input-error']

  // Variant classes
  classes.push(`error-${props.variant}`)

  // Size classes
  classes.push(`error-${props.size}`)

  // Style classes
  if (props.inline) classes.push('error-inline')
  if (props.bordered) classes.push('error-bordered')
  if (props.dismissible) classes.push('error-dismissible')

  return classes.join(' ')
})

const iconClass = computed(() => {
  if (props.icon) return props.icon

  const defaultIcons = {
    error: 'pi pi-exclamation-circle',
    warning: 'pi pi-exclamation-triangle',
    info: 'pi pi-info-circle'
  }

  return defaultIcons[props.variant]
})

const handleDismiss = () => {
  emit('dismiss')
}
</script>

<style scoped>
.input-error {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.4;
  margin-top: 0.25rem;
}

/* Variant styles */
.error-error {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--brand-error, #ef4444);
}

.error-warning {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--brand-warning, #f59e0b);
}

.error-info {
  background-color: rgba(6, 182, 212, 0.1);
  color: var(--brand-info, #06b6d4);
}

/* Bordered variants */
.error-bordered.error-error {
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.error-bordered.error-warning {
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.error-bordered.error-info {
  border: 1px solid rgba(6, 182, 212, 0.3);
}

/* Size variants */
.error-small {
  padding: 0.5rem;
  font-size: 0.75rem;
  gap: 0.375rem;
}

.error-large {
  padding: 1rem;
  font-size: 1rem;
  gap: 0.75rem;
}

/* Inline style */
.error-inline {
  background-color: transparent;
  padding: 0.25rem 0;
  margin-top: 0.125rem;
}

.error-inline.error-error {
  color: var(--brand-error, #ef4444);
}

.error-inline.error-warning {
  color: var(--brand-warning, #f59e0b);
}

.error-inline.error-info {
  color: var(--brand-info, #06b6d4);
}

/* Icon styles */
.error-icon {
  flex-shrink: 0;
  font-size: 1em;
  margin-top: 0.125rem;
}

.error-small .error-icon {
  font-size: 0.875em;
}

.error-large .error-icon {
  font-size: 1.125em;
}

/* Content styles */
.error-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.error-message {
  display: block;
  font-weight: 500;
}

.error-list {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.error-list .error-message {
  position: relative;
  padding-left: 1rem;
}

.error-list .error-message::before {
  content: '•';
  position: absolute;
  left: 0;
  color: currentColor;
  opacity: 0.7;
}

.error-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.error-code {
  font-size: 0.8em;
  opacity: 0.7;
  font-family: monospace;
}

/* Dismiss button */
.error-dismiss {
  flex-shrink: 0;
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  opacity: 0.6;
  transition: all 0.2s ease-in-out;
  margin-top: -0.125rem;
}

.error-dismiss:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.1);
}

.error-dismiss:focus {
  outline: none;
  box-shadow: 0 0 0 2px currentColor;
  opacity: 1;
}

.error-dismiss i {
  font-size: 0.8em;
}

/* Dismissible spacing adjustment */
.error-dismissible {
  padding-right: 0.5rem;
}

/* Animation */
.error-fade-enter-active,
.error-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.error-fade-enter-from {
  opacity: 0;
  transform: translateY(-0.5rem);
  max-height: 0;
}

.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
  max-height: 0;
}

.error-fade-enter-to,
.error-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 200px;
}

/* Activation tracking specific styles */
.input-error.activation-form-error {
  border-left: 3px solid currentColor;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.1) 100%);
}

.input-error.field-error {
  margin-top: 0.5rem;
  border-radius: 0.5rem;
}

.input-error.validation-error {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Contextual error styles */
.input-error.server-error {
  border-left: 4px solid var(--brand-error, #ef4444);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
}

.input-error.network-error {
  border-left: 4px solid var(--brand-warning, #f59e0b);
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
}

/* Responsive design */
@media (max-width: 768px) {
  .input-error {
    padding: 0.625rem;
    font-size: 0.8rem;
  }

  .error-small {
    padding: 0.375rem;
    font-size: 0.7rem;
  }

  .error-large {
    padding: 0.75rem;
    font-size: 0.9rem;
  }

  .error-list .error-message {
    padding-left: 0.75rem;
  }
}

/* Print styles */
@media print {
  .input-error {
    background: transparent !important;
    border: 1px solid #ccc;
    color: #000;
  }

  .error-dismiss {
    display: none;
  }
}
</style>
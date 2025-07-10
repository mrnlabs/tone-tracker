<!-- BaseButton.vue - Reusable button component for the entire app -->
<template>
  <Button
      :class="buttonClasses"
      :disabled="disabled || loading"
      :type="type"
      v-bind="$attrs"
      @click="handleClick"
  >
    <i v-if="loading" class="pi pi-spin pi-spinner" style="margin-right: 0.5rem;"></i>
    <i v-else-if="icon && iconPosition === 'left'" :class="icon" style="margin-right: 0.5rem;"></i>

    <span v-if="label">{{ label }}</span>
    <slot v-else></slot>

    <i v-if="icon && iconPosition === 'right'" :class="icon" style="margin-left: 0.5rem;"></i>
  </Button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'primary', // primary, secondary, success, warning, danger, info, outlined, text
    validator: (value) => ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'outlined', 'text'].includes(value)
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
  iconPosition: {
    type: String,
    default: 'left', // left, right
    validator: (value) => ['left', 'right'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'button', // button, submit, reset
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  rounded: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => {
  const classes = ['base-button']

  // Variant classes
  switch (props.variant) {
    case 'primary':
      classes.push('p-button-primary')
      break
    case 'secondary':
      classes.push('p-button-secondary')
      break
    case 'success':
      classes.push('p-button-success')
      break
    case 'warning':
      classes.push('p-button-warning')
      break
    case 'danger':
      classes.push('p-button-danger')
      break
    case 'info':
      classes.push('p-button-info')
      break
    case 'outlined':
      classes.push('p-button-outlined')
      break
    case 'text':
      classes.push('p-button-text')
      break
  }

  // Size classes
  switch (props.size) {
    case 'small':
      classes.push('p-button-sm')
      break
    case 'large':
      classes.push('p-button-lg')
      break
  }

  // Additional classes
  if (props.rounded) classes.push('p-button-rounded')
  if (props.fullWidth) classes.push('button-full-width')
  if (props.loading) classes.push('button-loading')

  return classes.join(' ')
})

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-button {
  transition: all 0.2s ease-in-out;
  font-weight: 500;
  border-radius: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.button-full-width {
  width: 100%;
}

.button-loading {
  cursor: not-allowed;
  opacity: 0.7;
}

/* Custom size overrides */
:deep(.p-button-sm) {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

:deep(.p-button-lg) {
  padding: 1rem 1.5rem;
  font-size: 1.125rem;
}

/* Custom brand colors */
:deep(.p-button-primary) {
  background: var(--brand-primary, #3b82f6);
  border-color: var(--brand-primary, #3b82f6);
  color: white;
}

:deep(.p-button-primary:hover) {
  background: var(--brand-primary-dark, #2563eb);
  border-color: var(--brand-primary-dark, #2563eb);
}

:deep(.p-button-secondary) {
  background: var(--brand-secondary, #6b7280);
  border-color: var(--brand-secondary, #6b7280);
  color: white;
}

:deep(.p-button-secondary:hover) {
  background: var(--brand-secondary-dark, #4b5563);
  border-color: var(--brand-secondary-dark, #4b5563);
}

/* Activation tracking specific button styles */
.base-button.activation-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.base-button.activation-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 10px -1px rgba(59, 130, 246, 0.4);
}

/* Status-specific buttons */
.base-button.status-active {
  background: var(--status-active, #10b981);
  border-color: var(--status-active, #10b981);
}

.base-button.status-pending {
  background: var(--status-pending, #f59e0b);
  border-color: var(--status-pending, #f59e0b);
}

.base-button.status-completed {
  background: var(--status-completed, #059669);
  border-color: var(--status-completed, #059669);
}

.base-button.status-cancelled {
  background: var(--status-cancelled, #dc2626);
  border-color: var(--status-cancelled, #dc2626);
}

/* Loading animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.pi-spinner {
  animation: spin 1s linear infinite;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .base-button {
    font-size: 0.875rem;
    padding: 0.75rem 1rem;
  }

  :deep(.p-button-lg) {
    font-size: 1rem;
    padding: 0.875rem 1.25rem;
  }
}
</style>
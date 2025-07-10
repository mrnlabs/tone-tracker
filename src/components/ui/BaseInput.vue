<template>
  <div class="base-input-wrapper">
    <label v-if="label" :for="inputId" class="input-label" :class="{ 'required': required }">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
    </label>

    <div class="input-container" :class="{ 'has-error': hasError, 'has-icon': icon }">
      <i v-if="icon" :class="icon" class="input-icon"></i>

      <InputText
          v-if="type === 'text' || type === 'email' || type === 'url' || type === 'tel'"
          :id="inputId"
          v-model="inputValue"
          :type="type"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :class="inputClasses"
          v-bind="$attrs"
          @input="handleInput"
          @blur="handleBlur"
          @focus="handleFocus"
      />

      <InputNumber
          v-else-if="type === 'number'"
          :id="inputId"
          v-model="inputValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :class="inputClasses"
          :min="min"
          :max="max"
          :step="step"
          :format="numberFormat"
          :currency="currency"
          :locale="locale"
          v-bind="$attrs"
          @input="handleInput"
          @blur="handleBlur"
          @focus="handleFocus"
      />

      <Password
          v-else-if="type === 'password'"
          :id="inputId"
          v-model="inputValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :class="inputClasses"
          :feedback="passwordFeedback"
          :toggle-mask="passwordToggle"
          v-bind="$attrs"
          @input="handleInput"
          @blur="handleBlur"
          @focus="handleFocus"
      />

      <Textarea
          v-else-if="type === 'textarea'"
          :id="inputId"
          v-model="inputValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :class="inputClasses"
          :rows="rows"
          :auto-resize="autoResize"
          v-bind="$attrs"
          @input="handleInput"
          @blur="handleBlur"
          @focus="handleFocus"
      />
    </div>

    <small v-if="helpText && !hasError" class="help-text">{{ helpText }}</small>
    <small v-if="hasError" class="error-text">{{ errorMessage }}</small>
  </div>
</template>

<script setup>
import { computed, ref, useAttrs } from 'vue'
import { generateId } from '@/utils/helpers'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'email', 'password', 'number', 'url', 'tel', 'textarea'].includes(value)
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  // Number input specific
  min: {
    type: Number,
    default: undefined
  },
  max: {
    type: Number,
    default: undefined
  },
  step: {
    type: Number,
    default: 1
  },
  numberFormat: {
    type: Boolean,
    default: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  locale: {
    type: String,
    default: 'en-US'
  },
  // Password specific
  passwordFeedback: {
    type: Boolean,
    default: true
  },
  passwordToggle: {
    type: Boolean,
    default: true
  },
  // Textarea specific
  rows: {
    type: Number,
    default: 3
  },
  autoResize: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'input', 'blur', 'focus'])

const attrs = useAttrs()
const inputId = ref(attrs.id || generateId('input'))

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const hasError = computed(() => !!props.errorMessage)

const inputClasses = computed(() => {
  const classes = ['base-input']

  if (props.size === 'small') classes.push('input-sm')
  if (props.size === 'large') classes.push('input-lg')
  if (hasError.value) classes.push('p-invalid')
  if (props.icon) classes.push('input-with-icon')

  return classes.join(' ')
})

const handleInput = (event) => {
  emit('input', event)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const handleFocus = (event) => {
  emit('focus', event)
}
</script>

<style scoped>
.base-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.input-label {
  font-weight: 500;
  color: var(--text-primary, #374151);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.input-label.required {
  font-weight: 600;
}

.required-asterisk {
  color: var(--brand-error, #ef4444);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-container.has-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--text-secondary, #6b7280);
  z-index: 1;
  pointer-events: none;
}

.input-container.has-icon :deep(.base-input) {
  padding-left: 2.5rem;
}

:deep(.base-input) {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-medium, #d1d5db);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  background-color: var(--bg-primary, #ffffff);
}

:deep(.base-input:focus) {
  outline: none;
  border-color: var(--brand-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:deep(.base-input:disabled) {
  background-color: var(--bg-tertiary, #f9fafb);
  color: var(--text-muted, #9ca3af);
  cursor: not-allowed;
}

:deep(.base-input.p-invalid) {
  border-color: var(--brand-error, #ef4444);
}

:deep(.base-input.input-sm) {
  padding: 0.5rem;
  font-size: 0.875rem;
}

:deep(.base-input.input-lg) {
  padding: 1rem;
  font-size: 1.125rem;
}

.help-text {
  color: var(--text-secondary, #6b7280);
  font-size: 0.75rem;
  margin: 0;
}

.error-text {
  color: var(--brand-error, #ef4444);
  font-size: 0.75rem;
  margin: 0;
}

.input-container.has-error :deep(.base-input) {
  border-color: var(--brand-error, #ef4444);
}

/* PrimeVue Password specific styling */
:deep(.p-password) {
  width: 100%;
}

:deep(.p-password .p-inputtext) {
  width: 100%;
}

/* PrimeVue InputNumber specific styling */
:deep(.p-inputnumber) {
  width: 100%;
}

:deep(.p-inputnumber .p-inputtext) {
  width: 100%;
}

/* PrimeVue Textarea specific styling */
:deep(.p-textarea) {
  resize: vertical;
  min-height: 3rem;
}
</style>
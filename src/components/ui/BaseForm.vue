<template>
  <form :class="formClasses" @submit="handleSubmit" @reset="handleReset" v-bind="$attrs">
    <!-- Form Header -->
    <div v-if="hasHeader" class="form-header">
      <slot name="header">
        <div class="header-content">
          <div class="header-text">
            <h2 v-if="title" class="form-title">{{ title }}</h2>
            <p v-if="description" class="form-description">{{ description }}</p>
          </div>
          <div v-if="$slots.headerActions" class="header-actions">
            <slot name="headerActions" />
          </div>
        </div>
      </slot>
    </div>

    <!-- Form Body -->
    <div class="form-body" :class="bodyClasses">
      <!-- Loading Overlay -->
      <div v-if="loading" class="form-loading-overlay">
        <div class="loading-content">
          <ProgressSpinner />
          <p v-if="loadingMessage">{{ loadingMessage }}</p>
        </div>
      </div>

      <!-- Error Summary -->
      <BaseAlert
          v-if="showErrorSummary && hasErrors"
          variant="danger"
          :title="errorSummaryTitle"
          :closable="false"
          class="form-error-summary"
      >
        <ul class="error-list">
          <li v-for="error in errorList" :key="error.field || error">
            {{ typeof error === 'string' ? error : error.message }}
          </li>
        </ul>
      </BaseAlert>

      <!-- Success Message -->
      <BaseAlert
          v-if="successMessage"
          variant="success"
          :message="successMessage"
          :auto-dismiss="true"
          :auto-dismiss-delay="5000"
          class="form-success-message"
          @close="$emit('update:successMessage', '')"
      />

      <!-- Form Sections -->
      <div v-if="sections.length > 0" class="form-sections">
        <div
            v-for="(section, index) in sections"
            :key="section.id || index"
            class="form-section"
            :class="section.class"
        >
          <div v-if="section.title || section.description" class="section-header">
            <h3 v-if="section.title" class="section-title">{{ section.title }}</h3>
            <p v-if="section.description" class="section-description">{{ section.description }}</p>
          </div>

          <div class="section-content" :class="getSectionGridClass(section)">
            <slot :name="`section-${section.id || index}`" :section="section">
              <!-- Dynamic field rendering -->
              <template v-if="section.fields">
                <component
                    v-for="field in section.fields"
                    :key="field.name"
                    :is="getFieldComponent(field)"
                    v-model="formData[field.name]"
                    v-bind="getFieldProps(field)"
                    :error-message="getFieldError(field.name)"
                    :class="getFieldClass(field)"
                    @input="handleFieldInput(field.name, $event)"
                    @blur="handleFieldBlur(field.name)"
                    @focus="handleFieldFocus(field.name)"
                />
              </template>
            </slot>
          </div>
        </div>
      </div>

      <!-- Default Content Slot -->
      <div v-else class="form-content" :class="contentGridClass">
        <slot :form-data="formData" :errors="errors" :set-field="setField" :get-error="getFieldError" />
      </div>
    </div>

    <!-- Form Footer -->
    <div v-if="hasFooter" class="form-footer" :class="footerClasses">
      <slot name="footer" :form-data="formData" :errors="errors" :loading="loading" :submitting="submitting">
        <div class="footer-actions">
          <!-- Cancel/Reset Button -->
          <BaseButton
              v-if="showCancel || showReset"
              :type="showReset ? 'reset' : 'button'"
              :label="showReset ? resetLabel : cancelLabel"
              :icon="showReset ? resetIcon : cancelIcon"
              variant="text"
              :disabled="loading || submitting"
              @click="showReset ? handleReset() : handleCancel()"
          />

          <!-- Secondary Action -->
          <BaseButton
              v-if="secondaryAction"
              :type="secondaryAction.type || 'button'"
              :label="secondaryAction.label"
              :icon="secondaryAction.icon"
              :variant="secondaryAction.variant || 'secondary'"
              :disabled="loading || submitting || secondaryAction.disabled"
              :loading="secondaryAction.loading"
              @click="handleSecondaryAction"
          />

          <!-- Submit Button -->
          <BaseButton
              :type="submitType"
              :label="submitLabel"
              :icon="submitIcon"
              :variant="submitVariant"
              :disabled="!canSubmit"
              :loading="submitting"
              :block="submitBlock"
          />
        </div>
      </slot>
    </div>
  </form>
</template>

<script setup>
import { computed, ref, watch, provide } from 'vue'
import BaseButton from './BaseButton.vue'
import BaseAlert from './BaseAlert.vue'
import BaseInput from './BaseInput.vue'
import BaseDropdown from './BaseDropdown.vue'

const props = defineProps({
  // Form data
  modelValue: {
    type: Object,
    default: () => ({})
  },

  // Form configuration
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  sections: {
    type: Array,
    default: () => []
  },

  // Layout
  layout: {
    type: String,
    default: 'vertical',
    validator: (value) => ['vertical', 'horizontal', 'inline'].includes(value)
  },
  columns: {
    type: Number,
    default: 1,
    validator: (value) => value >= 1 && value <= 12
  },
  gap: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },

  // Validation
  errors: {
    type: Object,
    default: () => ({})
  },
  rules: {
    type: Object,
    default: () => ({})
  },
  validateOnInput: {
    type: Boolean,
    default: false
  },
  validateOnBlur: {
    type: Boolean,
    default: true
  },
  showErrorSummary: {
    type: Boolean,
    default: false
  },
  errorSummaryTitle: {
    type: String,
    default: 'Please correct the following errors:'
  },

  // State
  loading: {
    type: Boolean,
    default: false
  },
  submitting: {
    type: Boolean,
    default: false
  },
  loadingMessage: {
    type: String,
    default: 'Loading...'
  },
  successMessage: {
    type: String,
    default: ''
  },

  // Submit configuration
  submitLabel: {
    type: String,
    default: 'Submit'
  },
  submitIcon: {
    type: String,
    default: ''
  },
  submitVariant: {
    type: String,
    default: 'primary'
  },
  submitType: {
    type: String,
    default: 'submit'
  },
  submitBlock: {
    type: Boolean,
    default: false
  },
  preventSubmit: {
    type: Boolean,
    default: false
  },

  // Cancel/Reset
  showCancel: {
    type: Boolean,
    default: true
  },
  showReset: {
    type: Boolean,
    default: false
  },
  cancelLabel: {
    type: String,
    default: 'Cancel'
  },
  cancelIcon: {
    type: String,
    default: 'pi pi-times'
  },
  resetLabel: {
    type: String,
    default: 'Reset'
  },
  resetIcon: {
    type: String,
    default: 'pi pi-refresh'
  },

  // Secondary action
  secondaryAction: {
    type: Object,
    default: null
  },

  // Footer alignment
  footerAlign: {
    type: String,
    default: 'right',
    validator: (value) => ['left', 'center', 'right', 'between'].includes(value)
  }
})

const emit = defineEmits([
  'update:modelValue',
  'update:errors',
  'update:successMessage',
  'submit',
  'cancel',
  'reset',
  'secondary-action',
  'field-input',
  'field-blur',
  'field-focus',
  'validation-error'
])

// Internal state
const formData = ref({ ...props.modelValue })
const internalErrors = ref({ ...props.errors })

// Computed properties
const hasHeader = computed(() => {
  return props.title || props.description || Object.keys($slots).includes('header') || Object.keys($slots).includes('headerActions')
})

const hasFooter = computed(() => {
  return props.showCancel || props.showReset || props.secondaryAction || Object.keys($slots).includes('footer')
})

const hasErrors = computed(() => {
  return Object.keys(internalErrors.value).length > 0
})

const errorList = computed(() => {
  return Object.values(internalErrors.value).flat()
})

const canSubmit = computed(() => {
  return !props.loading && !props.submitting && !props.preventSubmit
})

const formClasses = computed(() => {
  const classes = ['base-form']

  classes.push(`form-${props.layout}`)
  classes.push(`form-gap-${props.gap}`)

  if (props.loading) classes.push('form-loading')
  if (props.submitting) classes.push('form-submitting')
  if (hasErrors.value) classes.push('form-has-errors')

  return classes.join(' ')
})

const bodyClasses = computed(() => {
  const classes = []

  if (props.loading) classes.push('body-loading')

  return classes.join(' ')
})

const contentGridClass = computed(() => {
  if (props.columns === 1) return ''

  return `grid-cols-${props.columns}`
})

const footerClasses = computed(() => {
  const classes = []
  classes.push(`footer-${props.footerAlign}`)
  return classes.join(' ')
})

// Methods
const getFieldComponent = (field) => {
  const componentMap = {
    text: 'BaseInput',
    email: 'BaseInput',
    password: 'BaseInput',
    number: 'BaseInput',
    textarea: 'BaseInput',
    select: 'BaseDropdown',
    dropdown: 'BaseDropdown',
    // Add more field types as needed
  }

  return componentMap[field.type] || 'BaseInput'
}

const getFieldProps = (field) => {
  const baseProps = {
    ...field.props,
    label: field.label,
    placeholder: field.placeholder,
    required: field.required,
    disabled: field.disabled,
    readonly: field.readonly,
    type: field.type
  }

  // Add type-specific props
  if (field.type === 'select' || field.type === 'dropdown') {
    baseProps.options = field.options || []
    baseProps.optionLabel = field.optionLabel || 'label'
    baseProps.optionValue = field.optionValue || 'value'
  }

  return baseProps
}

const getFieldClass = (field) => {
  const classes = []

  if (field.class) classes.push(field.class)
  if (field.span) classes.push(`col-span-${field.span}`)

  return classes.join(' ')
}

const getSectionGridClass = (section) => {
  if (!section.columns || section.columns === 1) return ''
  return `grid-cols-${section.columns}`
}

const getFieldError = (fieldName) => {
  return internalErrors.value[fieldName]
}

const setField = (fieldName, value) => {
  formData.value[fieldName] = value
  emit('update:modelValue', formData.value)
}

const validateField = (fieldName) => {
  const rules = props.rules[fieldName]
  if (!rules) return true

  const value = formData.value[fieldName]
  const errors = []

  // Run validation rules
  for (const rule of rules) {
    if (typeof rule === 'function') {
      const result = rule(value)
      if (result !== true) {
        errors.push(result)
      }
    }
  }

  // Update errors
  if (errors.length > 0) {
    internalErrors.value[fieldName] = errors
  } else {
    delete internalErrors.value[fieldName]
  }

  emit('update:errors', internalErrors.value)

  return errors.length === 0
}

// Event handlers
const handleSubmit = (event) => {
  if (props.preventSubmit) {
    event.preventDefault()
  }

  // Validate all fields
  let isValid = true
  for (const fieldName in props.rules) {
    if (!validateField(fieldName)) {
      isValid = false
    }
  }

  if (isValid) {
    emit('submit', { event, data: formData.value })
  } else {
    event.preventDefault()
    emit('validation-error', internalErrors.value)
  }
}

const handleReset = () => {
  formData.value = {}
  internalErrors.value = {}
  emit('update:modelValue', formData.value)
  emit('update:errors', internalErrors.value)
  emit('reset')
}

const handleCancel = () => {
  emit('cancel')
}

const handleSecondaryAction = () => {
  emit('secondary-action', props.secondaryAction)
}

const handleFieldInput = (fieldName, value) => {
  setField(fieldName, value)

  if (props.validateOnInput) {
    validateField(fieldName)
  }

  emit('field-input', { field: fieldName, value })
}

const handleFieldBlur = (fieldName) => {
  if (props.validateOnBlur) {
    validateField(fieldName)
  }

  emit('field-blur', { field: fieldName, value: formData.value[fieldName] })
}

const handleFieldFocus = (fieldName) => {
  emit('field-focus', { field: fieldName })
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  formData.value = { ...newValue }
}, { deep: true })

watch(() => props.errors, (newValue) => {
  internalErrors.value = { ...newValue }
}, { deep: true })

// Provide form context to child components
provide('formContext', {
  formData,
  errors: internalErrors,
  setField,
  validateField,
  getFieldError
})

// Expose methods for parent components
defineExpose({
  validate: () => {
    let isValid = true
    for (const fieldName in props.rules) {
      if (!validateField(fieldName)) {
        isValid = false
      }
    }
    return isValid
  },
  resetForm: handleReset,
  setFieldValue: setField,
  getFieldValue: (fieldName) => formData.value[fieldName],
  clearErrors: () => {
    internalErrors.value = {}
    emit('update:errors', internalErrors.value)
  }
})
</script>

<style scoped>
.base-form {
  position: relative;
  background: var(--bg-primary, #ffffff);
  border-radius: 0.75rem;
  overflow: hidden;
}

/* Form header */
.form-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid var(--border-light, #e5e7eb);
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.header-text {
  flex: 1;
}

.form-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary, #111827);
}

.form-description {
  margin: 0;
  color: var(--text-secondary, #6b7280);
  line-height: 1.5;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

/* Form body */
.form-body {
  position: relative;
  padding: 1.5rem;
}

.body-loading {
  opacity: 0.7;
  pointer-events: none;
}

.form-loading-overlay {
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

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.loading-content p {
  margin: 0;
  color: var(--text-secondary, #6b7280);
}

/* Error summary */
.form-error-summary {
  margin-bottom: 1.5rem;
}

.error-list {
  margin: 0;
  padding-left: 1.25rem;
}

.error-list li {
  margin-bottom: 0.25rem;
}

.error-list li:last-child {
  margin-bottom: 0;
}

/* Success message */
.form-success-message {
  margin-bottom: 1.5rem;
}

/* Form sections */
.form-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-light, #e5e7eb);
}

.section-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #111827);
}

.section-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
}

.section-content {
  display: grid;
  gap: 1rem;
}

/* Form content */
.form-content {
  display: grid;
  gap: 1rem;
}

/* Grid columns */
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

/* Column spans */
.col-span-1 { grid-column: span 1 / span 1; }
.col-span-2 { grid-column: span 2 / span 2; }
.col-span-3 { grid-column: span 3 / span 3; }
.col-span-4 { grid-column: span 4 / span 4; }

/* Form layouts */
.form-horizontal .form-content {
  grid-template-columns: 200px 1fr;
  align-items: center;
}

.form-inline .form-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Gap sizes */
.form-gap-small .form-content,
.form-gap-small .section-content {
  gap: 0.75rem;
}

.form-gap-medium .form-content,
.form-gap-medium .section-content {
  gap: 1rem;
}

.form-gap-large .form-content,
.form-gap-large .section-content {
  gap: 1.5rem;
}

/* Form footer */
.form-footer {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid var(--border-light, #e5e7eb);
  background: var(--bg-secondary, #f9fafb);
}

.footer-actions {
  display: flex;
  gap: 0.75rem;
}

.footer-left .footer-actions {
  justify-content: flex-start;
}

.footer-center .footer-actions {
  justify-content: center;
}

.footer-right .footer-actions {
  justify-content: flex-end;
}

.footer-between .footer-actions {
  justify-content: space-between;
}

/* State classes */
.form-loading {
  pointer-events: none;
}

.form-submitting {
  opacity: 0.8;
}

.form-has-errors {
  /* Add any global error styles here */
}

/* Responsive design */
@media (max-width: 768px) {
  .form-header {
    padding: 1rem 1rem 0 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .form-body {
    padding: 1rem;
  }

  .form-content {
    grid-template-columns: 1fr !important;
  }

  .section-content {
    grid-template-columns: 1fr !important;
  }

  .form-horizontal .form-content {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .form-inline .form-content {
    flex-direction: column;
    align-items: stretch;
  }

  .form-footer {
    padding: 1rem;
  }

  .footer-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .footer-between .footer-actions {
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>
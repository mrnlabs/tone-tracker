<template>
  <div class="base-dropdown-wrapper">
    <label v-if="label" :for="dropdownId" class="dropdown-label" :class="{ 'required': required }">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
    </label>

    <div class="dropdown-container" :class="{ 'has-error': hasError }">
      <Dropdown
          v-if="!multiSelect"
          :id="dropdownId"
          v-model="selectedValue"
          :options="processedOptions"
          :option-label="optionLabel"
          :option-value="optionValue"
          :option-disabled="optionDisabled"
          :placeholder="placeholder"
          :disabled="disabled"
          :loading="loading"
          :filter="filter"
          :filter-placeholder="filterPlaceholder"
          :show-clear="showClear"
          :class="dropdownClasses"
          v-bind="$attrs"
          @change="handleChange"
          @focus="handleFocus"
          @blur="handleBlur"
      >
        <template v-if="$slots.value" #value="slotProps">
          <slot name="value" v-bind="slotProps" />
        </template>

        <template v-if="$slots.option" #option="slotProps">
          <slot name="option" v-bind="slotProps" />
        </template>

        <template v-if="$slots.header" #header>
          <slot name="header" />
        </template>

        <template v-if="$slots.footer" #footer>
          <slot name="footer" />
        </template>
      </Dropdown>

      <MultiSelect
          v-else
          :id="dropdownId"
          v-model="selectedValue"
          :options="processedOptions"
          :option-label="optionLabel"
          :option-value="optionValue"
          :option-disabled="optionDisabled"
          :placeholder="placeholder"
          :disabled="disabled"
          :loading="loading"
          :filter="filter"
          :filter-placeholder="filterPlaceholder"
          :show-clear="showClear"
          :max-selected-labels="maxSelectedLabels"
          :selected-items-label="selectedItemsLabel"
          :class="dropdownClasses"
          v-bind="$attrs"
          @change="handleChange"
          @focus="handleFocus"
          @blur="handleBlur"
      >
        <template v-if="$slots.value" #value="slotProps">
          <slot name="value" v-bind="slotProps" />
        </template>

        <template v-if="$slots.option" #option="slotProps">
          <slot name="option" v-bind="slotProps" />
        </template>

        <template v-if="$slots.chip" #chip="slotProps">
          <slot name="chip" v-bind="slotProps" />
        </template>

        <template v-if="$slots.header" #header>
          <slot name="header" />
        </template>

        <template v-if="$slots.footer" #footer>
          <slot name="footer" />
        </template>
      </MultiSelect>
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
    type: [String, Number, Array, Object],
    default: null
  },
  options: {
    type: Array,
    required: true
  },
  optionLabel: {
    type: String,
    default: 'label'
  },
  optionValue: {
    type: String,
    default: 'value'
  },
  optionDisabled: {
    type: String,
    default: 'disabled'
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Select an option'
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
  loading: {
    type: Boolean,
    default: false
  },
  filter: {
    type: Boolean,
    default: false
  },
  filterPlaceholder: {
    type: String,
    default: 'Search...'
  },
  showClear: {
    type: Boolean,
    default: false
  },
  multiSelect: {
    type: Boolean,
    default: false
  },
  maxSelectedLabels: {
    type: Number,
    default: 3
  },
  selectedItemsLabel: {
    type: String,
    default: '{0} items selected'
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  // Option formatting
  groupBy: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur'])

const attrs = useAttrs()
const dropdownId = ref(attrs.id || generateId('dropdown'))

const selectedValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const hasError = computed(() => !!props.errorMessage)

const processedOptions = computed(() => {
  if (!props.groupBy) {
    return props.options
  }

  // Group options by the specified field
  const grouped = props.options.reduce((acc, option) => {
    const groupKey = option[props.groupBy] || 'Other'
    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(option)
    return acc
  }, {})

  // Convert to PrimeVue option group format
  return Object.entries(grouped).map(([label, items]) => ({
    label,
    items
  }))
})

const dropdownClasses = computed(() => {
  const classes = ['base-dropdown']

  if (props.size === 'small') classes.push('dropdown-sm')
  if (props.size === 'large') classes.push('dropdown-lg')
  if (hasError.value) classes.push('p-invalid')

  return classes.join(' ')
})

const handleChange = (event) => {
  emit('change', event)
}

const handleFocus = (event) => {
  emit('focus', event)
}

const handleBlur = (event) => {
  emit('blur', event)
}
</script>

<style scoped>
.base-dropdown-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.dropdown-label {
  font-weight: 500;
  color: var(--text-primary, #374151);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.dropdown-label.required {
  font-weight: 600;
}

.required-asterisk {
  color: var(--brand-error, #ef4444);
}

.dropdown-container {
  position: relative;
}

:deep(.base-dropdown) {
  width: 100%;
  border-radius: 0.5rem;
  transition: all 0.2s ease-in-out;
}

:deep(.base-dropdown .p-dropdown-trigger) {
  border-radius: 0 0.5rem 0.5rem 0;
}

:deep(.base-dropdown .p-multiselect-trigger) {
  border-radius: 0 0.5rem 0.5rem 0;
}

:deep(.base-dropdown.dropdown-sm) {
  font-size: 0.875rem;
}

:deep(.base-dropdown.dropdown-sm .p-dropdown-label),
:deep(.base-dropdown.dropdown-sm .p-multiselect-label) {
  padding: 0.5rem;
}

:deep(.base-dropdown.dropdown-lg) {
  font-size: 1.125rem;
}

:deep(.base-dropdown.dropdown-lg .p-dropdown-label),
:deep(.base-dropdown.dropdown-lg .p-multiselect-label) {
  padding: 1rem;
}

:deep(.base-dropdown.p-invalid) {
  border-color: var(--brand-error, #ef4444);
}

:deep(.base-dropdown:focus-within) {
  border-color: var(--brand-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

.dropdown-container.has-error :deep(.base-dropdown) {
  border-color: var(--brand-error, #ef4444);
}

/* Loading state */
:deep(.base-dropdown .p-dropdown-trigger .pi-spinner) {
  color: var(--brand-primary, #3b82f6);
}

/* Panel styling */
:deep(.p-dropdown-panel) {
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-light, #e5e7eb);
}

:deep(.p-multiselect-panel) {
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-light, #e5e7eb);
}

/* Filter input styling */
:deep(.p-dropdown-filter),
:deep(.p-multiselect-filter) {
  border-radius: 0.375rem;
  border: 1px solid var(--border-medium, #d1d5db);
}

:deep(.p-dropdown-filter:focus),
:deep(.p-multiselect-filter:focus) {
  border-color: var(--brand-primary, #3b82f6);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Option styling */
:deep(.p-dropdown-item),
:deep(.p-multiselect-item) {
  padding: 0.75rem;
  transition: background-color 0.15s ease;
}

:deep(.p-dropdown-item:hover),
:deep(.p-multiselect-item:hover) {
  background-color: var(--bg-secondary, #f9fafb);
}

:deep(.p-dropdown-item.p-highlight),
:deep(.p-multiselect-item.p-highlight) {
  background-color: var(--brand-primary, #3b82f6);
  color: white;
}

/* Clear icon styling */
:deep(.p-dropdown-clear-icon),
:deep(.p-multiselect-clear-icon) {
  color: var(--text-secondary, #6b7280);
}

:deep(.p-dropdown-clear-icon:hover),
:deep(.p-multiselect-clear-icon:hover) {
  color: var(--text-primary, #374151);
}
</style>
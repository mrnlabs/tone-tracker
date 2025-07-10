<template>
  <label
      :for="forId"
      :class="['form-label', { 'required': required, 'error': hasError }]"
  >
    {{ label }}
    <span v-if="required" class="required-indicator">*</span>
  </label>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  forId: {
    type: String,
    default: null
  },
  required: {
    type: Boolean,
    default: false
  },
  hasError: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  transition: color 0.15s ease-in-out;
}

.form-label.required {
  color: #111827;
}

.form-label.error {
  color: #dc2626;
}

.required-indicator {
  color: #dc2626;
  margin-left: 0.25rem;
}
</style>
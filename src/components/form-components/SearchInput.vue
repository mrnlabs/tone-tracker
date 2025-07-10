<!-- 3. SearchInput.vue - Enhanced search input with debouncing -->
<template>
  <div class="search-input-wrapper">
    <span class="p-input-icon-left">
      <i class="pi pi-search" />
      <InputText
          v-model="searchValue"
          :placeholder="placeholder"
          :disabled="disabled"
          @input="handleInput"
          @keyup.enter="handleEnter"
          class="search-input"
      />
    </span>
    <Button
        v-if="searchValue && clearable"
        @click="clearSearch"
        icon="pi pi-times"
        class="p-button-text p-button-sm clear-button"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Search...'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: true
  },
  debounce: {
    type: Number,
    default: 300
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'clear'])

const searchValue = ref(props.modelValue)
let debounceTimer = null

const handleInput = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('update:modelValue', searchValue.value)
    emit('search', searchValue.value)
  }, props.debounce)
}

const handleEnter = () => {
  clearTimeout(debounceTimer)
  emit('update:modelValue', searchValue.value)
  emit('search', searchValue.value)
}

const clearSearch = () => {
  searchValue.value = ''
  emit('update:modelValue', '')
  emit('clear')
}

watch(() => props.modelValue, (newValue) => {
  searchValue.value = newValue
})
</script>

<style scoped>
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
}

.clear-button {
  position: absolute;
  right: 0.5rem;
  z-index: 1;
}
</style>
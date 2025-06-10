<template>
  <input
    v-model="formattedValue"
    @input="onInput"
    @keydown="onKeyDown"
    @blur="onBlur"
    :type="type"
    :class="classes"
    :id="id"
    :placeholder="placeholder"
    ref="inputRef"
    maxlength="10"
  />
</template>

<script setup>
import { ref, computed } from 'vue';

// Define props
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'tel'
  },
  classes: {
    type: [String, Array, Object],
    default: ''
  },
  id: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Enter phone number'
  }
});

// Define emits for v-model
const emit = defineEmits(['update:modelValue']);

const inputRef = ref(null);


const formattedValue = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    const cleanedValue = value.replace(/\D/g, '');
    emit('update:modelValue', cleanedValue);
  }
});

function onInput(event) {
  let inputValue = event.target.value;
  
  const cleanedValue = inputValue.replace(/\D/g, '');
  formattedValue.value = cleanedValue;
}

function onKeyDown(event) {
  if (
    ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)
  ) {
    return; // Let the system handle it
  }

  //if it's not a number (0-9), don't let it through
  if (!/\d/.test(event.key)) {
    event.preventDefault();
  }
}
function onBlur() {
  emit('blur'); 
}
// Expose focus method
defineExpose({
  focus: () => inputRef.value?.focus()
});
</script>

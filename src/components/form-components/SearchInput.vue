<template>
  <input 
    :value="modelValue" 
    @input="$emit('update:modelValue', $event.target.value)" 
    :type="type" 
    :class="classes" 
    :id="id" 
    :placeholder="placeholder" 
    ref="inputRef" 
  />
  <slot name="search">{{ placeholder }}</slot>

</template>

<script setup >
import { ref } from 'vue';


const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'text'
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
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const inputRef = ref(null);


defineExpose({
  focus: () => inputRef.value?.focus()
});

</script>

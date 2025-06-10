<template>
    <button @click="onSubmit" :class="classes" :type="type" :disabled="disabled">
      <slot name="content">{{ text }}</slot> <!-- Named slot for the content, like h1 -->
      <slot></slot> <!-- Default slot for additional content, e.g., Spinner -->
    </button>
  </template>
  
  <script setup>
  
  const props = defineProps({
    text: {
      type: String,
      default: '' // Default empty string, if no text is passed
    },
    classes: {
      type: [String, Array, Object],
      default: ''
    },
    type: {
      type: String,
      default: 'button'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  });
  </script>
  
  
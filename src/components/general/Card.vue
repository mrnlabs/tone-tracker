<template>
    <div :class="classes" class="card">
      <slot></slot>
    </div>
  </template>
    
  <script setup>
    const modelValue = defineProps({
      classes: {
        type: [String, Array, Object],
        default: ''
      }
    })
  
    </script>
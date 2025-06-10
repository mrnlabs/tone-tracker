<template>
    <div :class="classes" class="card-body">
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
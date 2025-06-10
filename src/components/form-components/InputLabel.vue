<template>
    <label 
    :for="htmlFor"
     :class="classes">
      {{ labelText }}
    </label>
  </template>
  
  <script setup>

  defineProps({
    labelText: {
      type: String,
      required: true
    },
    classes: {
      type: [String, Array, Object],
      default: ''
    },
    htmlFor: {
      type: String,
      default: ''
    }
  })
  </script>
  
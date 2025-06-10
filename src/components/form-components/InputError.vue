<template>
  <div :class="classes" v-for="error of errors" :key="error.$uid">
    <div class="text-danger">{{ message }}</div>
  </div>
</template>
  
<script setup>
  const modelValue =  defineProps({
    errors: {
      type: [Array],
      default: ''
    },
    classes: {
      type: [String, Array, Object],
      default: ''
    },
    message: {
      type: String,
      default: ''
    }
  })

  </script>
  
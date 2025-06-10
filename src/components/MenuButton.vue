<!-- MenuButton.vue -->
<template>
    <i class="bx bx-menu" @click="toggleDrawer"></i>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  // Create a prop to receive the function from the parent component
  const props = defineProps(['onToggle']);
  
  // Toggle the drawer visibility using the function received from the parent
  const toggleDrawer = () => {
    props.onToggle();
  };
  </script>
  
  <style scoped>
  .bx-menu {
    font-size: 2rem; /* Make the icon large */
    color: #fff; /* White color for better visibility */
    cursor: pointer; /* Change cursor to pointer on hover */
    transition: transform 0.3s ease; /* Add a smooth transition effect */
  }
  
  .bx-menu:hover {
    transform: scale(1.1); /* Slightly enlarge the icon on hover */
    color: #ffff; /* Change color on hover for visual feedback */
  }
  </style>
  
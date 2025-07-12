<template>
  <div id="app">
    <router-view />
    <Toast position="top-right" />
    <GlobalLoader />
  </div>
</template>

<script setup>
import GlobalLoader from '@/components/ui/GlobalLoader.vue'
</script>

<style>
/* Global base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #2c3e50;
  background-color: #f8fafc;
}

#app {
  min-height: 100vh;
}
</style>
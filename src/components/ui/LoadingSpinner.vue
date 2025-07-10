<!-- LoadingSpinner.vue - Simple working loading component -->
<template>
  <div :class="containerClasses">
    <!-- Spinner Type -->
    <div v-if="type === 'spinner'" class="spinner-container">
      <div class="simple-spinner" :style="spinnerStyle"></div>
    </div>

    <!-- Dots Type -->
    <div v-else-if="type === 'dots'" class="dots-container">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>

    <!-- Bars Type -->
    <div v-else-if="type === 'bars'" class="bars-container">
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
    </div>

    <!-- Pulse Type -->
    <div v-else-if="type === 'pulse'" class="pulse-container">
      <div class="pulse-circle"></div>
    </div>

    <!-- Loading Text -->
    <div v-if="showText && text" class="loading-text">
      {{ text }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'spinner',
    validator: (value) => ['spinner', 'dots', 'bars', 'pulse'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'xl'].includes(value)
  },
  color: {
    type: String,
    default: 'primary'
  },
  text: {
    type: String,
    default: ''
  },
  showText: {
    type: Boolean,
    default: false
  },
  centered: {
    type: Boolean,
    default: false
  },
  overlay: {
    type: Boolean,
    default: false
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
})

const containerClasses = computed(() => {
  const classes = ['loading-container']

  classes.push(`loading-${props.size}`)
  classes.push(`loading-${props.color}`)

  if (props.centered) classes.push('loading-centered')
  if (props.overlay) classes.push('loading-overlay')
  if (props.fullscreen) classes.push('loading-fullscreen')

  return classes.join(' ')
})

const spinnerStyle = computed(() => {
  const sizes = {
    small: '24px',
    medium: '32px',
    large: '48px',
    xl: '64px'
  }

  return {
    width: sizes[props.size],
    height: sizes[props.size]
  }
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

/* Layout variants */
.loading-centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(2px);
  z-index: 999;
}

.loading-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  z-index: 9999;
}

/* Color variants */
.loading-primary {
  color: #3b82f6;
}

.loading-secondary {
  color: #6b7280;
}

.loading-success {
  color: #10b981;
}

.loading-warning {
  color: #f59e0b;
}

.loading-danger {
  color: #ef4444;
}

.loading-info {
  color: #06b6d4;
}

.loading-white {
  color: white;
}

.loading-dark {
  color: #111827;
}

/* Simple CSS Spinner */
.spinner-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.simple-spinner {
  border: 3px solid rgba(59, 130, 246, 0.1);
  border-top: 3px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Dots loading animation */
.dots-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: currentColor;
  animation: dots-bounce 1.4s ease-in-out infinite both;
}

.loading-small .dot {
  width: 0.375rem;
  height: 0.375rem;
}

.loading-large .dot {
  width: 0.625rem;
  height: 0.625rem;
}

.loading-xl .dot {
  width: 0.75rem;
  height: 0.75rem;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
.dot:nth-child(3) { animation-delay: 0s; }

@keyframes dots-bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Bars loading animation */
.bars-container {
  display: flex;
  gap: 0.25rem;
  align-items: end;
  height: 2rem;
}

.loading-small .bars-container {
  height: 1.5rem;
}

.loading-large .bars-container {
  height: 2.5rem;
}

.loading-xl .bars-container {
  height: 3rem;
}

.bar {
  width: 0.25rem;
  background-color: currentColor;
  animation: bars-scale 1.2s ease-in-out infinite;
}

.loading-small .bar {
  width: 0.2rem;
}

.loading-large .bar {
  width: 0.3rem;
}

.loading-xl .bar {
  width: 0.375rem;
}

.bar:nth-child(1) { animation-delay: -1.0s; }
.bar:nth-child(2) { animation-delay: -0.8s; }
.bar:nth-child(3) { animation-delay: -0.6s; }
.bar:nth-child(4) { animation-delay: -0.4s; }
.bar:nth-child(5) { animation-delay: -0.2s; }

@keyframes bars-scale {
  0%, 40%, 100% {
    height: 0.5rem;
    opacity: 0.5;
  }
  20% {
    height: 100%;
    opacity: 1;
  }
}

/* Pulse loading animation */
.pulse-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-circle {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: currentColor;
  animation: pulse-scale 1.5s ease-in-out infinite;
}

.loading-small .pulse-circle {
  width: 1.5rem;
  height: 1.5rem;
}

.loading-large .pulse-circle {
  width: 2.5rem;
  height: 2.5rem;
}

.loading-xl .pulse-circle {
  width: 3rem;
  height: 3rem;
}

@keyframes pulse-scale {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* Text styling */
.loading-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: currentColor;
  text-align: center;
  opacity: 0.8;
}

.loading-small .loading-text {
  font-size: 0.75rem;
}

.loading-large .loading-text {
  font-size: 1rem;
}

.loading-xl .loading-text {
  font-size: 1.125rem;
}

/* Size adjustments */
.loading-small {
  gap: 0.5rem;
}

.loading-large {
  gap: 1.5rem;
}

.loading-xl {
  gap: 2rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .loading-container {
    gap: 0.75rem;
  }

  .loading-text {
    font-size: 0.8rem;
  }
}
</style>
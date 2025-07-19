<template>
  <div class="base-loader" :class="loaderClasses">
    <ProgressSpinner
      v-if="type === 'spinner'"
      :style="spinnerStyle"
      :strokeWidth="strokeWidth"
    />
    <div v-else-if="type === 'dots'" class="loader-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div v-else-if="type === 'bars'" class="loader-bars">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
    <p v-if="text" class="loader-text">{{ text }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProgressSpinner from 'primevue/progressspinner'

const props = defineProps({
  type: {
    type: String,
    default: 'spinner',
    validator: (value) => ['spinner', 'dots', 'bars'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  color: {
    type: String,
    default: 'primary'
  },
  overlay: {
    type: Boolean,
    default: false
  },
  fullScreen: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: ''
  }
})

const loaderClasses = computed(() => ({
  [`loader-${props.size}`]: true,
  [`loader-${props.color}`]: true,
  'loader-overlay': props.overlay,
  'loader-fullscreen': props.fullScreen
}))

const spinnerStyle = computed(() => {
  const sizes = {
    small: '30px',
    medium: '50px',
    large: '80px'
  }
  return {
    width: sizes[props.size],
    height: sizes[props.size]
  }
})

const strokeWidth = computed(() => {
  const widths = {
    small: '4',
    medium: '3',
    large: '2'
  }
  return widths[props.size]
})
</script>

<style lang="scss" scoped>
.base-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  &.loader-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.9);
    z-index: 100;
  }

  &.loader-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.95);
    z-index: 9999;
  }

  // Size variations
  &.loader-small {
    .loader-text {
      font-size: 0.875rem;
    }
  }

  &.loader-medium {
    .loader-text {
      font-size: 1rem;
    }
  }

  &.loader-large {
    .loader-text {
      font-size: 1.125rem;
    }
  }

  // Color variations
  &.loader-primary {
    --loader-color: var(--primary-color);
  }

  &.loader-secondary {
    --loader-color: var(--surface-500);
  }

  &.loader-success {
    --loader-color: var(--green-500);
  }

  &.loader-warning {
    --loader-color: var(--yellow-500);
  }

  &.loader-danger {
    --loader-color: var(--red-500);
  }

  &.loader-info {
    --loader-color: var(--blue-500);
  }

  .loader-text {
    color: var(--text-color-secondary);
    margin: 0;
  }

  // Dots loader
  .loader-dots {
    display: flex;
    gap: 0.5rem;

    span {
      width: 0.75rem;
      height: 0.75rem;
      background-color: var(--loader-color);
      border-radius: 50%;
      animation: dots 1.4s infinite ease-in-out both;

      &:nth-child(1) {
        animation-delay: -0.32s;
      }

      &:nth-child(2) {
        animation-delay: -0.16s;
      }
    }

    &.loader-small span {
      width: 0.5rem;
      height: 0.5rem;
    }

    &.loader-large span {
      width: 1rem;
      height: 1rem;
    }
  }

  // Bars loader
  .loader-bars {
    display: flex;
    gap: 0.25rem;

    span {
      width: 0.25rem;
      height: 2rem;
      background-color: var(--loader-color);
      animation: bars 1.2s infinite ease-in-out;

      &:nth-child(1) {
        animation-delay: -0.45s;
      }

      &:nth-child(2) {
        animation-delay: -0.3s;
      }

      &:nth-child(3) {
        animation-delay: -0.15s;
      }
    }

    &.loader-small span {
      height: 1.5rem;
      width: 0.2rem;
    }

    &.loader-large span {
      height: 3rem;
      width: 0.375rem;
    }
  }
}

@keyframes dots {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes bars {
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}
</style>
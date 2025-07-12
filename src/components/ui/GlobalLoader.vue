<template>
  <Transition name="loader-fade">
    <div v-if="isVisible" class="global-loader">
      <div class="loader-backdrop" @click="handleBackdropClick">
        <div class="loader-content">
          <div class="loader-spinner">
            <ProgressSpinner 
              :style="{ width: '60px', height: '60px' }"
              strokeWidth="4"
              animationDuration="1s"
            />
          </div>
          <div v-if="message" class="loader-message">
            {{ message }}
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useGlobalLoading } from '@/composables/useLoading'

const props = defineProps({
  message: {
    type: String,
    default: 'Loading...'
  },
  blocking: {
    type: Boolean,
    default: true
  },
  showMessage: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['backdrop-click'])

const { isAnyLoading } = useGlobalLoading()

const isVisible = computed(() => isAnyLoading.value)

const handleBackdropClick = () => {
  if (!props.blocking) {
    emit('backdrop-click')
  }
}
</script>

<style scoped>
.global-loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  min-width: 200px;
}

.loader-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader-message {
  color: var(--text-primary, #111827);
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
}

/* Transition animations */
.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: all 0.3s ease;
}

.loader-fade-enter-from,
.loader-fade-leave-to {
  opacity: 0;
}

.loader-fade-enter-to,
.loader-fade-leave-from {
  opacity: 1;
}

.loader-fade-enter-active .loader-content,
.loader-fade-leave-active .loader-content {
  transition: transform 0.3s ease;
}

.loader-fade-enter-from .loader-content,
.loader-fade-leave-to .loader-content {
  transform: scale(0.9) translateY(-10px);
}

.loader-fade-enter-to .loader-content,
.loader-fade-leave-from .loader-content {
  transform: scale(1) translateY(0);
}

/* Responsive design */
@media (max-width: 768px) {
  .loader-content {
    margin: 1rem;
    padding: 1.5rem;
    min-width: auto;
    max-width: 90vw;
  }
}
</style>
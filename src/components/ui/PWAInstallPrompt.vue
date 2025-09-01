<template>
  <Transition name="install-prompt">
    <div v-if="showPrompt" class="pwa-install-prompt">
      <div class="prompt-backdrop" @click="dismissPrompt">
        <div class="prompt-card" @click.stop>
          <div class="prompt-header">
            <div class="app-icon">
              <img src="/android-chrome-192x192.png" alt="App Icon">
            </div>
            <div class="app-info">
              <h3 class="app-name">Activation Monitor</h3>
              <p class="app-description">Install for better experience</p>
            </div>
            <button 
              class="close-button" 
              @click="dismissPrompt"
              :aria-label="$t ? $t('close') : 'Close'"
            >
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div class="prompt-content">
            <div class="benefits">
              <div class="benefit-item">
                <i class="pi pi-bolt benefit-icon"></i>
                <span>Faster loading</span>
              </div>
              <div class="benefit-item">
                <i class="pi pi-wifi benefit-icon"></i>
                <span>Works offline</span>
              </div>
              <div class="benefit-item">
                <i class="pi pi-bell benefit-icon"></i>
                <span>Push notifications</span>
              </div>
              <div class="benefit-item">
                <i class="pi pi-mobile benefit-icon"></i>
                <span>Native app feel</span>
              </div>
            </div>
          </div>

          <div class="prompt-actions">
            <BaseButton
              variant="outlined"
              size="medium"
              @click="dismissPrompt"
              class="dismiss-btn"
            >
              Not Now
            </BaseButton>
            <BaseButton
              variant="primary"
              size="medium"
              @click="installApp"
              :loading="installing"
              class="install-btn"
            >
              <template v-if="!installing">
                <i class="pi pi-download"></i>
                Install App
              </template>
              <template v-else>
                Installing...
              </template>
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePWA } from '@/composables/usePWA'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  autoShow: {
    type: Boolean,
    default: true
  },
  showDelay: {
    type: Number,
    default: 10000 // 10 seconds
  },
  dismissRememberDays: {
    type: Number,
    default: 7 // Remember dismissal for 7 days
  }
})

const emit = defineEmits(['install', 'dismiss'])

const { canInstall, installPWA, isInstalled } = usePWA()

const showPrompt = ref(false)
const installing = ref(false)
const dismissed = ref(false)

let showTimer = null

// Check if user has dismissed recently
const getDismissalKey = () => 'pwa-install-dismissed'

const wasDismissedRecently = () => {
  const dismissedAt = localStorage.getItem(getDismissalKey())
  if (!dismissedAt) return false
  
  const dismissedTime = new Date(dismissedAt)
  const now = new Date()
  const daysDiff = (now - dismissedTime) / (1000 * 60 * 60 * 24)
  
  return daysDiff < props.dismissRememberDays
}

const shouldShowPrompt = computed(() => {
  return canInstall.value && 
         !isInstalled.value && 
         !dismissed.value && 
         !wasDismissedRecently()
})

const installApp = async () => {
  try {
    installing.value = true
    await installPWA()
    showPrompt.value = false
    emit('install')
  } catch (error) {
    console.error('Failed to install PWA:', error)
  } finally {
    installing.value = false
  }
}

const dismissPrompt = () => {
  showPrompt.value = false
  dismissed.value = true
  
  // Remember dismissal
  localStorage.setItem(getDismissalKey(), new Date().toISOString())
  
  emit('dismiss')
}

const setupAutoShow = () => {
  if (props.autoShow && shouldShowPrompt.value) {
    showTimer = setTimeout(() => {
      if (shouldShowPrompt.value) {
        showPrompt.value = true
      }
    }, props.showDelay)
  }
}

const clearAutoShow = () => {
  if (showTimer) {
    clearTimeout(showTimer)
    showTimer = null
  }
}

// Public methods
const show = () => {
  if (shouldShowPrompt.value) {
    showPrompt.value = true
  }
}

const hide = () => {
  showPrompt.value = false
}

// Lifecycle
onMounted(() => {
  setupAutoShow()
})

onUnmounted(() => {
  clearAutoShow()
})

// Expose methods to parent
defineExpose({
  show,
  hide,
  canShow: shouldShowPrompt
})
</script>

<style scoped>
.pwa-install-prompt {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.prompt-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.prompt-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 100%;
  overflow: hidden;
  transform: scale(1);
  transition: transform 0.2s ease;
}

.prompt-card:hover {
  transform: scale(1.02);
}

.prompt-header {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
}

.app-icon {
  width: 48px;
  height: 48px;
  margin-right: 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.app-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-info {
  flex: 1;
}

.app-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.app-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.prompt-content {
  padding: 20px;
}

.benefits {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.benefit-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #374151;
}

.benefit-icon {
  color: #3b82f6;
  margin-right: 8px;
  font-size: 1rem;
}

.prompt-actions {
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.dismiss-btn,
.install-btn {
  flex: 1;
}

.install-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

/* Transitions */
.install-prompt-enter-active,
.install-prompt-leave-active {
  transition: all 0.3s ease;
}

.install-prompt-enter-from,
.install-prompt-leave-to {
  opacity: 0;
}

.install-prompt-enter-to,
.install-prompt-leave-from {
  opacity: 1;
}

.install-prompt-enter-active .prompt-card,
.install-prompt-leave-active .prompt-card {
  transition: transform 0.3s ease;
}

.install-prompt-enter-from .prompt-card,
.install-prompt-leave-to .prompt-card {
  transform: scale(0.9) translateY(20px);
}

.install-prompt-enter-to .prompt-card,
.install-prompt-leave-from .prompt-card {
  transform: scale(1) translateY(0);
}

/* Mobile responsive */
@media (max-width: 640px) {
  .pwa-install-prompt {
    padding: 16px;
  }

  .prompt-card {
    max-width: none;
  }

  .prompt-header {
    padding: 16px;
  }

  .prompt-content {
    padding: 16px;
  }

  .benefits {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .prompt-actions {
    flex-direction: column;
    padding: 16px;
  }

  .dismiss-btn,
  .install-btn {
    width: 100%;
  }
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .prompt-card {
    background: #1f2937;
    color: #f9fafb;
  }

  .prompt-header {
    border-bottom-color: #374151;
  }

  .app-name {
    color: #f9fafb;
  }

  .app-description {
    color: #9ca3af;
  }

  .close-button {
    color: #9ca3af;
  }

  .close-button:hover {
    background: #374151;
    color: #f3f4f6;
  }

  .benefit-item {
    color: #d1d5db;
  }

  .prompt-actions {
    background: #111827;
    border-top-color: #374151;
  }
}
</style>
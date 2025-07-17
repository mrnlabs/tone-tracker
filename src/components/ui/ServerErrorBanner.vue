<template>
  <div v-if="showBanner" class="server-error-banner">
    <Message 
      severity="warn" 
      :closable="true"
      @close="showBanner = false"
    >
      <div class="banner-content">
        <div class="banner-text">
          <i class="pi pi-exclamation-triangle"></i>
          <span>Server is temporarily unavailable. Working with cached data.</span>
        </div>
        <div class="banner-actions">
          <Button
            @click="retryConnection"
            :loading="retrying"
            size="small"
            severity="info"
            outlined
          >
            <i class="pi pi-refresh"></i>
            Try Again
          </Button>
        </div>
      </div>
    </Message>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible'])

const authStore = useAuthStore()
const toast = useToast()

const showBanner = ref(props.visible)
const retrying = ref(false)

const retryConnection = async () => {
  retrying.value = true
  
  try {
    const success = await authStore.refreshUserData()
    
    if (success) {
      showBanner.value = false
      emit('update:visible', false)
      
      toast.add({
        severity: 'success',
        summary: 'Connection Restored',
        detail: 'Successfully reconnected to server',
        life: 3000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Still Offline',
        detail: 'Server is still unavailable. Please try again later.',
        life: 5000
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Connection Failed',
      detail: 'Unable to connect to server',
      life: 5000
    })
  } finally {
    retrying.value = false
  }
}

// Watch for prop changes
watch(() => props.visible, (newValue) => {
  showBanner.value = newValue
})
</script>

<style scoped>
.server-error-banner {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  max-width: 600px;
  width: 90%;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.banner-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.banner-text i {
  color: #f59e0b;
}

.banner-actions {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 640px) {
  .banner-content {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .banner-text {
    text-align: center;
  }
}
</style>
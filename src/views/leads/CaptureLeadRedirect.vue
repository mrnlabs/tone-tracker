<template>
  <div class="capture-lead-redirect">
    <div class="loading-container" v-if="loading">
      <ProgressSpinner />
      <p>Finding your active activation...</p>
    </div>
    <div class="no-activation" v-else-if="!loading && !activeActivation">
      <Message severity="warn" :closable="false">
        <template #icon>
          <i class="pi pi-exclamation-triangle"></i>
        </template>
        <div class="message-content">
          <h3>No Active Activation</h3>
          <p>You need to check in to an activation before you can capture leads.</p>
          <p>Please go to your dashboard and check in to today's activation first.</p>
          <Button 
            label="Go to Dashboard" 
            icon="pi pi-home" 
            @click="goToDashboard"
            class="mt-3"
          />
        </div>
      </Message>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePromoterStore } from '@/stores/promoter'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import api from '@/services/api'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import Button from 'primevue/button'

const router = useRouter()
const promoterStore = usePromoterStore()
const toast = useToast()

const loading = ref(true)
const activeActivation = ref(null)

onMounted(async () => {
  try {
    // Try to get activations from the API service directly
    const authStore = useAuthStore()
    const userId = authStore.userId
    
    if (!userId) {
      throw new Error('User not logged in')
    }
    
    // Try multiple API endpoints to find activations
    let activations = []
    
    // First try: Get user's current activations with simple params
    try {
      const response = await api.get('/users/current/activations', {
        params: {
          page: 0,
          size: 20
        }
      })
      activations = response.data.content || response.data || []
      console.log('Found activations from user endpoint:', activations.length)
    } catch (e1) {
      console.log('First API attempt failed, trying alternative endpoint...', e1.response?.status, e1.response?.data)
      
      // Second try: Use the activations/my endpoint
      try {
        const response = await api.get('/activations/my', {
          params: {
            page: 0,
            size: 20
          }
        })
        activations = response.data.content || response.data || []
        console.log('Found activations from my endpoint:', activations.length)
      } catch (e2) {
        console.log('Second API attempt failed, trying general activations...', e2.response?.status)
        
        // Third try: Get all activations and filter
        try {
          const response = await api.get('/activations', {
            params: {
              page: 0,
              size: 100
            }
          })
          const allActivations = response.data.content || response.data || []
          
          // Filter activations where the current user is assigned as a promoter
          activations = allActivations.filter(activation => {
            if (activation.assignedPromoters && Array.isArray(activation.assignedPromoters)) {
              return activation.assignedPromoters.some(p => p.id === userId || p.userId === userId)
            }
            if (activation.promoters && Array.isArray(activation.promoters)) {
              return activation.promoters.some(p => p.id === userId || p.userId === userId)
            }
            return false
          })
          console.log('Found activations from general endpoint:', activations.length)
        } catch (e3) {
          console.log('All API attempts failed:', e3)
        }
      }
    }
    
    // If we have activations, find the active one
    if (activations.length > 0) {
      // Try to find one where promoter is checked in
      activeActivation.value = activations.find(activation => {
        // Check attendance records if available
        if (activation.attendance && Array.isArray(activation.attendance)) {
          return activation.attendance.some(att => 
            att.userId === userId && 
            att.checkInTime && 
            !att.checkOutTime
          )
        }
        return false
      })
      
      // If no checked-in activation, just use the first one
      if (!activeActivation.value) {
        activeActivation.value = activations[0]
      }
    }
    
    if (activeActivation.value) {
      // Redirect to the activation details page with lead management tab
      router.push(`/activations/${activeActivation.value.id}?tab=lead-management`)
    } else {
      loading.value = false
      console.log('No activations found for promoter')
    }
  } catch (error) {
    console.error('Error loading promoter data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load activation data',
      life: 5000
    })
    loading.value = false
  }
})

const goToDashboard = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.capture-lead-redirect {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-container {
  text-align: center;
}

.loading-container p {
  margin-top: 1rem;
  color: var(--text-color-secondary);
}

.no-activation {
  max-width: 500px;
  width: 100%;
}

.message-content h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.message-content p {
  margin: 0.5rem 0;
  color: var(--text-color-secondary);
}
</style>
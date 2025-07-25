<template>
  <div class="checkin-out">
    <!-- Check-in/out Status Card -->
    <Card class="status-card">
      <template #header>
        <div class="card-header">
          <h3>{{ activation.name }}</h3>
        </div>
      </template>
      
      <template #content>
        <div class="status-content">
          <!-- Current Status -->
          <div class="current-status">
            <div v-if="checkInStatus.isCheckedIn" class="checked-in-info">
              <div class="status-item">
                <i class="pi pi-clock"></i>
                <span>Checked in at: {{ formatDateTime(checkInStatus.checkInTime) }}</span>
              </div>
              <div class="status-item" v-if="checkInStatus.location">
                <i class="pi pi-map-marker"></i>
                <span>Location: {{ formatLocation(checkInStatus.location) }}</span>
              </div>
              <div class="status-item">
                <i class="pi pi-stopwatch"></i>
                <span>Duration: {{ getWorkDuration() }}</span>
              </div>
            </div>
            <div v-else class="not-checked-in">
              <div class="status-item">
                <i class="pi pi-info-circle"></i>
                <span>Ready to check in to this activation</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <BaseButton
              v-if="!checkInStatus.isCheckedIn"
              @click="initiateCheckIn"
              variant="primary"
              icon="pi pi-sign-in"
              :loading="checkingIn"
              :disabled="!locationPermission || gettingLocation"
            >
              {{ gettingLocation ? 'Getting Location...' : 'Check In' }}
            </BaseButton>
            
            <BaseButton
              v-else
              @click="initiateCheckOut"
              variant="danger"
              icon="pi pi-sign-out"
              :loading="checkingOut"
            >
              Check Out
            </BaseButton>
          </div>

          <!-- Location Permission Warning -->
          <div v-if="!locationPermission" class="location-warning">
            <i class="pi pi-exclamation-triangle"></i>
            <span>Location access is required for check-in. Please enable location services.</span>
            <BaseButton
              @click="requestLocationPermission"
              variant="secondary"
              size="small"
              icon="pi pi-refresh"
            >
              Enable Location
            </BaseButton>
          </div>
        </div>
      </template>
    </Card>

    <!-- Check-in History -->
    <Card class="history-card" v-if="checkInHistory.length > 0">
      <template #header>
        <h3>Check-in History</h3>
      </template>
      
      <template #content>
        <div class="history-list">
          <div 
            v-for="entry in checkInHistory" 
            :key="entry.id"
            class="history-entry"
          >
            <div class="entry-info">
              <div class="entry-time">
                <strong>{{ formatDate(entry.checkInTime) }}</strong>
              </div>
              <div class="entry-details">
                <span>Check-in: {{ formatTime(entry.checkInTime) }}</span>
                <span v-if="entry.checkOutTime">
                  | Check-out: {{ formatTime(entry.checkOutTime) }}
                </span>
                <span v-if="entry.duration">
                  | Duration: {{ formatDuration(entry.duration) }}
                </span>
              </div>
              <div v-if="entry.location" class="entry-location">
                <i class="pi pi-map-marker"></i>
                {{ formatLocation(entry.location) }}
              </div>
            </div>
            <div class="entry-status">
              <Tag 
                :value="entry.checkOutTime ? 'Complete' : 'In Progress'"
                :severity="entry.checkOutTime ? 'success' : 'info'"
              />
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Confirmation Dialogs -->
    <Dialog
      v-model:visible="showCheckInConfirm"
      header="Confirm Check-in"
      :modal="true"
      :style="{ width: '400px' }"
    >
      <div class="confirm-content">
        <div class="confirm-info">
          <i class="pi pi-info-circle"></i>
          <div>
            <p><strong>Location:</strong> {{ currentLocation?.address || 'Getting address...' }}</p>
            <p><strong>Time:</strong> {{ formatDateTime(new Date()) }}</p>
          </div>
        </div>
        <p>Are you sure you want to check in to this activation?</p>
      </div>
      
      <template #footer>
        <BaseButton
          @click="showCheckInConfirm = false"
          variant="secondary"
        >
          Cancel
        </BaseButton>
        <BaseButton
          @click="confirmCheckIn"
          variant="primary"
          :loading="checkingIn"
        >
          Confirm Check-in
        </BaseButton>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showCheckOutConfirm"
      header="Confirm Check-out"
      :modal="true"
      :style="{ width: '400px' }"
    >
      <div class="confirm-content">
        <div class="confirm-info">
          <i class="pi pi-info-circle"></i>
          <div>
            <p><strong>Check-in Time:</strong> {{ formatDateTime(checkInStatus.checkInTime) }}</p>
            <p><strong>Duration:</strong> {{ getWorkDuration() }}</p>
          </div>
        </div>
        <p>Are you sure you want to check out?</p>
      </div>
      
      <template #footer>
        <BaseButton
          @click="showCheckOutConfirm = false"
          variant="secondary"
        >
          Cancel
        </BaseButton>
        <BaseButton
          @click="confirmCheckOut"
          variant="danger"
          :loading="checkingOut"
        >
          Confirm Check-out
        </BaseButton>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useActivationStore } from '@/stores/activation'
import { useAuthStore } from '@/stores/auth'
import { useToaster } from '@/composables/useToaster'
import { BaseButton } from '@/components'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'

const props = defineProps({
  activationId: {
    type: Number,
    required: true
  },
  activation: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['checkin-success', 'checkout-success'])

// Stores and composables
const activationStore = useActivationStore()
const authStore = useAuthStore()
const toaster = useToaster()

// Reactive state
const checkInStatus = ref({
  isCheckedIn: false,
  checkInTime: null,
  location: null
})

const checkInHistory = ref([])

const locationPermission = ref(false)
const gettingLocation = ref(false)
const currentLocation = ref(null)

const checkingIn = ref(false)
const checkingOut = ref(false)

const showCheckInConfirm = ref(false)
const showCheckOutConfirm = ref(false)

let workTimer = null

// Computed
const getWorkDuration = () => {
  if (!checkInStatus.value.checkInTime) return '0h 0m'
  
  const now = new Date()
  const checkIn = new Date(checkInStatus.value.checkInTime)
  const diffMs = now - checkIn
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  return `${hours}h ${minutes}m`
}

// Methods
const requestLocationPermission = async () => {
  try {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser')
    }

    const permission = await navigator.permissions.query({ name: 'geolocation' })
    
    if (permission.state === 'granted') {
      locationPermission.value = true
      return true
    } else if (permission.state === 'prompt') {
      // Request permission by attempting to get position
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => {
            locationPermission.value = true
            resolve(true)
          },
          () => {
            locationPermission.value = false
            resolve(false)
          }
        )
      })
    } else {
      locationPermission.value = false
      toaster.error('Location access denied. Please enable in browser settings.')
      return false
    }
  } catch (error) {
    console.error('Error requesting location permission:', error)
    toaster.error('Failed to request location permission')
    return false
  }
}

const getCurrentLocation = async () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }

    gettingLocation.value = true

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          // Try to get address from coordinates
          const address = await reverseGeocode(latitude, longitude)
          
          const location = {
            latitude,
            longitude,
            address,
            accuracy: position.coords.accuracy,
            timestamp: new Date()
          }
          
          currentLocation.value = location
          gettingLocation.value = false
          resolve(location)
        } catch (error) {
          // If reverse geocoding fails, still return coordinates
          const location = {
            latitude,
            longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            accuracy: position.coords.accuracy,
            timestamp: new Date()
          }
          
          currentLocation.value = location
          gettingLocation.value = false
          resolve(location)
        }
      },
      (error) => {
        gettingLocation.value = false
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  })
}

const reverseGeocode = async (lat, lng) => {
  try {
    // Using a simple reverse geocoding service
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    )
    const data = await response.json()
    return data.display_name || data.city || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  } catch (error) {
    console.error('Reverse geocoding failed:', error)
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }
}

const initiateCheckIn = async () => {
  try {
    if (!locationPermission.value) {
      const hasPermission = await requestLocationPermission()
      if (!hasPermission) {
        toaster.error('Location access is required for check-in')
        return
      }
    }

    const location = await getCurrentLocation()
    currentLocation.value = location
    showCheckInConfirm.value = true
  } catch (error) {
    console.error('Failed to get location:', error)
    toaster.error('Failed to get current location. Please try again.')
  }
}

const confirmCheckIn = async () => {
  try {
    checkingIn.value = true
    
    const result = await activationStore.checkinPromoter(
      props.activationId,
      authStore.userId,
      currentLocation.value
    )

    checkInStatus.value = {
      isCheckedIn: true,
      checkInTime: new Date(),
      location: currentLocation.value
    }

    showCheckInConfirm.value = false
    
    // Start work timer
    startWorkTimer()
    
    // Refresh history
    await loadCheckInHistory()
    
    emit('checkin-success', result)
    toaster.success('Successfully checked in to activation')
    
  } catch (error) {
    console.error('Check-in failed:', error)
    toaster.error('Failed to check in. Please try again.')
  } finally {
    checkingIn.value = false
  }
}

const initiateCheckOut = () => {
  showCheckOutConfirm.value = true
}

const confirmCheckOut = async () => {
  try {
    checkingOut.value = true
    
    const result = await activationStore.checkoutPromoter(
      props.activationId,
      authStore.userId
    )

    checkInStatus.value = {
      isCheckedIn: false,
      checkInTime: null,
      location: null
    }

    showCheckOutConfirm.value = false
    
    // Stop work timer
    stopWorkTimer()
    
    // Refresh history
    await loadCheckInHistory()
    
    emit('checkout-success', result)
    toaster.success('Successfully checked out of activation')
    
  } catch (error) {
    console.error('Check-out failed:', error)
    toaster.error('Failed to check out. Please try again.')
  } finally {
    checkingOut.value = false
  }
}

const startWorkTimer = () => {
  // Update duration every minute
  workTimer = setInterval(() => {
    // Force reactivity update
    checkInStatus.value = { ...checkInStatus.value }
  }, 60000)
}

const stopWorkTimer = () => {
  if (workTimer) {
    clearInterval(workTimer)
    workTimer = null
  }
}

const loadCheckInHistory = async () => {
  try {
    // This would need to be implemented in the backend
    // For now, using mock data
    checkInHistory.value = []
  } catch (error) {
    console.error('Failed to load check-in history:', error)
  }
}

// Utility methods
const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

const formatTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString()
}

const formatDuration = (duration) => {
  if (!duration) return ''
  const hours = Math.floor(duration / 3600000)
  const minutes = Math.floor((duration % 3600000) / 60000)
  return `${hours}h ${minutes}m`
}

const formatLocation = (location) => {
  if (!location) return 'Unknown location'
  return location.address || `${location.latitude?.toFixed(6)}, ${location.longitude?.toFixed(6)}`
}

// Lifecycle
onMounted(async () => {
  await requestLocationPermission()
  await loadCheckInHistory()
})

onUnmounted(() => {
  stopWorkTimer()
})
</script>

<style scoped>
.checkin-out {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card-header {
  margin: 0;
}

.card-header h3 {
  margin: 0;
  color: #374151;
}

.status-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.current-status {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #374151;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-item i {
  color: #6b7280;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.location-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fef3cd;
  border: 1px solid #fbbf24;
  border-radius: 6px;
  color: #92400e;
  font-size: 0.875rem;
}

.location-warning i {
  color: #d97706;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-entry {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
}

.entry-info {
  flex: 1;
}

.entry-time {
  margin-bottom: 0.25rem;
  color: #374151;
}

.entry-details {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.entry-location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.entry-location i {
  color: #ef4444;
}

.confirm-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.confirm-info {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: #f0f9ff;
  border-radius: 8px;
}

.confirm-info i {
  color: #0ea5e9;
  font-size: 1.25rem;
  margin-top: 0.25rem;
}

.confirm-info p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .history-entry {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
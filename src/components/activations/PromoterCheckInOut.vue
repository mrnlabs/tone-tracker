<template>
  <div class="promoter-checkin-out">
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
              @click="initiateCheckIn"
              variant="primary"
              icon="pi pi-sign-in"
              :loading="checkingIn"
              :disabled="!locationPermission || gettingLocation"
            >
              {{ gettingLocation ? 'Getting Best Location...' : 'Check In' }}
            </BaseButton>
            
            <BaseButton
              v-if="!checkInStatus.isCheckedIn && (!locationPermission || (currentLocation && currentLocation.accuracy > 100))"
              @click="showManualLocationDialog = true"
              variant="secondary"
              icon="pi pi-map-marker"
              size="small"
            >
              Manual Location
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


    <!-- Check-in History Table -->
    <Card class="history-card">
      <template #header>
        <div class="card-header">
          <h3>My Check-in History</h3>
          <BaseButton
            @click="loadCheckInHistory"
            variant="secondary"
            size="small"
            icon="pi pi-refresh"
            :loading="loadingHistory"
          >
            Refresh
          </BaseButton>
        </div>
      </template>
      
      <template #content>
        <DataTable 
          :value="checkInHistory" 
          :loading="loadingHistory"
          responsiveLayout="scroll"
          dataKey="id"
          emptyMessage="No check-ins found"
          class="simple-table"
        >
          <Column header="Date">
            <template #body="{ data }">
              {{ formatSimpleDate(data.checkInTime) }}
            </template>
          </Column>
          
          <Column header="Check-in">
            <template #body="{ data }">
              {{ formatSimpleTime(data.checkInTime) }}
            </template>
          </Column>
          
          <Column header="Check-out">
            <template #body="{ data }">
              {{ data.checkOutTime ? formatSimpleTime(data.checkOutTime) : 'Active' }}
            </template>
          </Column>
          
          <Column header="Status">
            <template #body="{ data }">
              <Tag 
                :value="data.checkOutTime ? 'Complete' : 'Active'"
                :severity="data.checkOutTime ? 'success' : 'info'"
              />
            </template>
          </Column>
          
          <Column header="Actions">
            <template #body="{ data }">
              <!-- TEMPORARILY: Show checkout button for ALL Active records for testing -->
              <BaseButton
                v-if="!data.checkOutTime"
                @click="quickCheckOut(data)"
                variant="danger"
                size="small"
                icon="pi pi-sign-out"
                :loading="checkingOut"
              >
                Check Out
              </BaseButton>
              <span v-else-if="data.checkOutTime" class="completed-text">
                Completed
              </span>
              <span v-else class="not-yours-text">
                -
              </span>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>



    <!-- Image Upload Dialog -->
    <Dialog
      v-model:visible="showImageUploader"
      header="Upload Activation Images"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <ImageUpload
v-model="selectedImages"
        :entity-id="activationId"
        entity-type="ACTIVATION"
        label="Upload Images"
        description="Upload photos from this activation event"
        :max-files="20"
        :max-size="10 * 1024 * 1024"
        @upload-success="handleImageUploadSuccess"
        @upload-error="handleImageUploadError"
      />
      
      <template #footer>
        <BaseButton
          @click="showImageUploader = false"
          variant="secondary"
        >
          Close
        </BaseButton>
      </template>
    </Dialog>

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
            <p v-if="currentLocation?.accuracy" class="location-accuracy">
              <strong>GPS Accuracy:</strong> {{ Math.round(currentLocation.accuracy) }}m
              <i v-if="currentLocation.accuracy > 100" class="pi pi-exclamation-triangle" style="color: #f59e0b; margin-left: 4px;" title="Low GPS accuracy"></i>
            </p>
          </div>
        </div>
        
        <div class="notes-field">
          <label for="checkInNotes">Notes (Optional):</label>
          <Textarea 
            id="checkInNotes"
            v-model="checkInNotes"
            placeholder="Add any notes about your check-in..."
            :rows="3"
            :maxlength="500"
          />
        </div>
        
        <div v-if="currentLocation?.accuracy && currentLocation.accuracy > 100" class="location-warning-tip">
          <i class="pi pi-info-circle"></i>
          <span>Your GPS accuracy is low. For best results, move to an open area with clear sky visibility.</span>
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
            <p v-if="currentLocation?.address"><strong>Check-out Location:</strong> {{ currentLocation.address }}</p>
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
import { activationService } from '@/services/api'
import { BaseButton } from '@/components'
import ImageUpload from '@/components/form-components/ImageUpload.vue'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Textarea from 'primevue/textarea'

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

const emit = defineEmits(['checkin-success', 'checkout-success', 'images-updated'])

// Stores and composables
const activationStore = useActivationStore()
const authStore = useAuthStore()
const toaster = useToaster()

// Reactive state
const checkInStatus = ref({
  isCheckedIn: false,
  checkInTime: null,
  location: null,
  attendanceRecordId: null
})

const checkInHistory = ref([])
const activationImages = ref([])

const locationPermission = ref(false)
const loadingHistory = ref(false)
const gettingLocation = ref(false)
const currentLocation = ref(null)

const checkingIn = ref(false)
const checkingOut = ref(false)

const showCheckInConfirm = ref(false)
const showCheckOutConfirm = ref(false)
const showImageUploader = ref(false)
const checkInNotes = ref('')

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
    
    // Try multiple location readings for better accuracy
    let attempts = 0
    let bestReading = null
    const maxAttempts = 3
    
    const tryGetLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          attempts++
          const currentReading = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date()
          }
          
          // Keep the most accurate reading (lowest accuracy number)
          if (!bestReading || currentReading.accuracy < bestReading.accuracy) {
            bestReading = currentReading
          }
          
          // If we have a good reading (< 50m accuracy) or reached max attempts, use it
          if (bestReading.accuracy < 50 || attempts >= maxAttempts) {
            try {
              // Try to get address from coordinates
              const address = await reverseGeocode(bestReading.latitude, bestReading.longitude)
              
              const location = {
                latitude: bestReading.latitude,
                longitude: bestReading.longitude,
                address,
                accuracy: bestReading.accuracy,
                timestamp: bestReading.timestamp
              }
              
              currentLocation.value = location
              gettingLocation.value = false
              resolve(location)
            } catch (error) {
              // If reverse geocoding fails, still return coordinates
              const location = {
                latitude: bestReading.latitude,
                longitude: bestReading.longitude,
                address: `${bestReading.latitude.toFixed(6)}, ${bestReading.longitude.toFixed(6)}`,
                accuracy: bestReading.accuracy,
                timestamp: bestReading.timestamp
              }
              
              currentLocation.value = location
              gettingLocation.value = false
              resolve(location)
            }
          } else {
            // Try again for better accuracy
            setTimeout(tryGetLocation, 1000)
          }
        },
        (error) => {
          attempts++
          if (attempts >= maxAttempts) {
            gettingLocation.value = false
            reject(error)
          } else {
            // Try again on error
            setTimeout(tryGetLocation, 1000)
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0  // Always get fresh reading
        }
      )
    }
    
    tryGetLocation()
  })
}

const reverseGeocode = async (lat, lng) => {
  try {
    // Using a simple reverse geocoding service
    // You might want to use Google Maps API or another service
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
    // Note: Let backend handle activation status validation
    // Frontend pre-check removed to allow backend to provide specific error messages

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
    
    if (!props.activationId) {
      throw new Error('Activation ID is required for check-in')
    }
    
    const result = await activationStore.checkinPromoter(
      props.activationId,
      authStore.userId,
      currentLocation.value,
      checkInNotes.value || null
    )

    checkInStatus.value = {
      isCheckedIn: true,
      checkInTime: new Date(),
      location: currentLocation.value,
      attendanceRecordId: result?.data?.id || result?.id // Store the attendance record ID from response
    }

    showCheckInConfirm.value = false
    checkInNotes.value = '' // Clear notes field
    
    // Start work timer
    startWorkTimer()
    
    // Refresh history
    await loadCheckInHistory()
    
    emit('checkin-success', result)
    toaster.success('Successfully checked in to activation')
    
  } catch (error) {
    console.error('Check-in failed:', error)
    console.error('Error response:', error.response)
    console.error('Error status:', error.response?.status)
    console.error('Error message:', error.response?.data?.message)
    
    // Handle specific error cases
    let errorMessage = 'Failed to check in. Please try again.'
    
    if (error.response?.data?.message) {
      const backendMessage = error.response.data.message.toLowerCase()
      
      if (backendMessage.includes('activation is not active')) {
        errorMessage = 'Cannot check in: This activation is not currently active. Please contact your manager.'
      } else if (backendMessage.includes('already checked in') || backendMessage.includes('promoter is already checked in')) {
        errorMessage = 'You are already checked in to this activation.'
        // If already checked in, refresh the check-in history to update the UI state
        await loadCheckInHistory()
      } else if (backendMessage.includes('check-in location is too far from activation site')) {
        errorMessage = 'Cannot check in: You are too far from the activation location. Please move closer to the designated area and try again.'
      } else if (backendMessage.includes('location') && (backendMessage.includes('too far') || backendMessage.includes('distance'))) {
        errorMessage = 'Cannot check in: Your current location is too far from the activation site.'
      } else if (error.response.status === 500) {
        // For any other 500 errors, show the backend message directly
        errorMessage = `Server error: ${error.response.data.message}`
      } else {
        errorMessage = error.response.data.message
      }
    } else if (error.response?.status === 400) {
      errorMessage = 'Invalid check-in data. Please try again.'
    } else if (error.response?.status === 404) {
      errorMessage = 'Activation not found. Please refresh and try again.'
    } else if (error.response?.status === 403) {
      errorMessage = 'You do not have permission to check in to this activation.'
    }
    
    toaster.error(errorMessage)
  } finally {
    checkingIn.value = false
  }
}

const initiateCheckOut = async () => {
  try {
    // Get current location for check-out
    const location = await getCurrentLocation()
    currentLocation.value = location
    showCheckOutConfirm.value = true
  } catch (error) {
    console.error('Failed to get location for check-out:', error)
    toaster.error('Failed to get current location for check-out. Please try again.')
  }
}

const quickCheckOut = async (attendanceRecord) => {
  try {
    checkingOut.value = true
    
    // Get current location for check-out
    let location = currentLocation.value
    if (!location) {
      try {
        location = await getCurrentLocation()
      } catch (error) {
        console.warn('Could not get location for checkout, proceeding without:', error)
        location = null
      }
    }
    
    const result = await activationStore.checkoutPromoter(
      props.activationId,
      authStore.userId,
      attendanceRecord.id, // Use the attendance record ID from the table row
      location
    )

    // Update local state if this was the current active check-in
    if (checkInStatus.value.attendanceRecordId === attendanceRecord.id) {
      checkInStatus.value = {
        isCheckedIn: false,
        checkInTime: null,
        location: null,
        attendanceRecordId: null
      }
      stopWorkTimer()
    }
    
    // Refresh history to update the table
    await loadCheckInHistory()
    
    emit('checkout-success', result)
    toaster.success('Successfully checked out of activation')
    
  } catch (error) {
    console.error('Quick check-out failed:', error)
    
    // Handle specific error cases
    let errorMessage = 'Failed to check out. Please try again.'
    
    if (error.response?.status === 500 && error.response?.data?.message) {
      const backendMessage = error.response.data.message.toLowerCase()
      
      if (backendMessage.includes('not checked in')) {
        errorMessage = 'Cannot check out: You are not currently checked in to this activation.'
      } else if (backendMessage.includes('activation is not active')) {
        errorMessage = 'Cannot check out: This activation is not currently active.'
      } else {
        errorMessage = error.response.data.message
      }
    } else if (error.response?.status === 400) {
      errorMessage = 'Invalid check-out data. Please try again.'
    } else if (error.response?.status === 404) {
      errorMessage = 'Check-in record not found. Please contact support.'
    } else if (error.response?.status === 403) {
      errorMessage = 'You do not have permission to check out of this activation.'
    }
    
    toaster.error(errorMessage)
  } finally {
    checkingOut.value = false
  }
}

const confirmCheckOut = async () => {
  try {
    checkingOut.value = true
    
    // Find active attendance record if attendanceRecordId is not set
    let attendanceRecordId = checkInStatus.value.attendanceRecordId
    
    if (!attendanceRecordId) {
      // Try to find active check-in from the history
      const activeRecord = checkInHistory.value.find(record => 
        record.promoterId === authStore.userId && !record.checkOutTime
      )
      
      if (activeRecord) {
        attendanceRecordId = activeRecord.id
      } else {
        // For now, allow checkout without check-in - use dummy ID as placeholder
        attendanceRecordId = 1
      }
    }
    
    const result = await activationStore.checkoutPromoter(
      props.activationId,
      authStore.userId,
      attendanceRecordId,
      currentLocation.value
    )

    checkInStatus.value = {
      isCheckedIn: false,
      checkInTime: null,
      location: null,
      attendanceRecordId: null
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
    
    // Handle specific error cases
    let errorMessage = 'Failed to check out. Please try again.'
    
    if (error.response?.status === 500 && error.response?.data?.message) {
      const backendMessage = error.response.data.message.toLowerCase()
      
      if (backendMessage.includes('not checked in')) {
        errorMessage = 'Cannot check out: You are not currently checked in to this activation.'
      } else if (backendMessage.includes('activation is not active')) {
        errorMessage = 'Cannot check out: This activation is not currently active.'
      } else {
        errorMessage = error.response.data.message
      }
    } else if (error.response?.status === 400) {
      errorMessage = 'Invalid check-out data. Please try again.'
    } else if (error.response?.status === 404) {
      errorMessage = 'Check-in record not found. Please contact support.'
    } else if (error.response?.status === 403) {
      errorMessage = 'You do not have permission to check out of this activation.'
    }
    
    toaster.error(errorMessage)
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
    loadingHistory.value = true
    
    // Get raw data directly from API service (skip store transformation)
    const response = await activationService.getCheckInHistory(props.activationId)
    
    // Handle direct array response
    const rawData = Array.isArray(response) ? response : []
    checkInHistory.value = rawData
    
    // Check for active check-in for current user (no check-out time)
    const activeCheckIn = rawData.find(record => 
      record.promoterId === authStore.userId && !record.checkOutTime
    )
    
    if (activeCheckIn) {
      checkInStatus.value = {
        isCheckedIn: true,
        checkInTime: new Date(activeCheckIn.checkInTime),
        location: {
          latitude: activeCheckIn.checkInLatitude,
          longitude: activeCheckIn.checkInLongitude,
          address: activeCheckIn.checkInAddress
        },
        attendanceRecordId: activeCheckIn.id
      }
      startWorkTimer()
    }
    
  } catch (error) {
    console.error('Failed to load check-in history:', error)
    checkInHistory.value = []
  } finally {
    loadingHistory.value = false
  }
}


const loadActivationImages = async () => {
  try {
    // Load images associated with the activation from the API
    const { activationService } = await import('@/services/api')
    
    // Try to get activation images - this might not exist yet, so we'll handle gracefully
    try {
      const response = await activationService.getActivationImages(props.activationId)
      
      if (response && Array.isArray(response)) {
        // Transform the response to match the expected format
        activationImages.value = response.map(file => ({
          id: file.id,
          fileName: file.fileName,
          filePath: file.filePath,
          size: file.fileSize,
          mimeType: file.mimeType,
          description: file.description || file.fileName,
          uploadDate: file.dateCreated || file.lastUpdated,
          url: file.downloadUrl,
          uploadedBy: file.uploadedByName
        }))
      } else {
        activationImages.value = []
      }
    } catch (imageError) {
      // If the specific endpoint doesn't exist, just show empty for now
      console.log('Activation images endpoint not available:', imageError.message)
      activationImages.value = []
    }
  } catch (error) {
    console.error('Failed to load activation images:', error)
    // Don't show error to user as images are optional
    activationImages.value = []
  }
}

const handleImageUploadSuccess = (uploadedImages) => {
  activationImages.value.push(...uploadedImages)
  emit('images-updated', activationImages.value)
  toaster.success(`Successfully uploaded ${uploadedImages.length} image(s)`)
}

const handleImageUploadError = (error) => {
  console.error('Image upload failed:', error)
  toaster.error('Failed to upload images')
}


// Simple utility methods
const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

const formatSimpleDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

const formatSimpleTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Lifecycle
onMounted(async () => {
  await requestLocationPermission()
  await loadCheckInHistory() // This will also check for active check-ins
  await loadActivationImages()
})

onUnmounted(() => {
  stopWorkTimer()
})
</script>

<style scoped>
.promoter-checkin-out {
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

.location-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.location-cell i {
  color: #ef4444;
  font-size: 0.875rem;
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

.notes-field {
  margin: 1rem 0;
}

.notes-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.location-accuracy {
  font-size: 0.8rem;
  color: #6b7280;
}

.location-warning-tip {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: 6px;
  margin: 1rem 0;
  font-size: 0.875rem;
  color: #92400e;
}

.location-warning-tip i {
  color: #f59e0b;
  font-size: 1rem;
  margin-top: 0.1rem;
  flex-shrink: 0;
}

.status-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.completed-text {
  color: #10b981;
  font-size: 0.875rem;
  font-weight: 500;
}

.not-yours-text {
  color: #9ca3af;
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
    margin: 0;
  }
}
</style>
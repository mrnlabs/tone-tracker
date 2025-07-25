<template>
  <div class="check-in-out">
    <Card>
      <template #header>
        <div class="header-content">
          <h3>{{ isCheckedIn ? 'Check Out' : 'Check In' }}</h3>
          <Tag 
            :value="checkStatus" 
            :severity="checkStatusSeverity"
          />
        </div>
      </template>
      
      <template #content>
        <div class="activation-info">
          <h4>{{ activation.name }}</h4>
          <p class="location">
            <i class="pi pi-map-marker"></i>
            {{ activation.location }}
          </p>
          <p class="time-info">
            <i class="pi pi-clock"></i>
            {{ formatTime(activation.startTime) }} - {{ formatTime(activation.endTime) }}
          </p>
        </div>

        <Divider />

        <!-- Check-in Form -->
        <div v-if="!isCheckedIn" class="check-form">
          <div class="form-group">
            <label>Current Location</label>
            <div class="location-status">
              <span v-if="locationLoading">
                <i class="pi pi-spin pi-spinner"></i> Getting location...
              </span>
              <span v-else-if="currentLocation">
                <i class="pi pi-check-circle text-success"></i> 
                Location captured
              </span>
              <span v-else class="text-danger">
                <i class="pi pi-times-circle"></i> 
                Location unavailable
              </span>
            </div>
            <small class="help-text">
              Make sure you're at the activation location
            </small>
          </div>

          <div class="form-group">
            <label for="checkInNotes">Notes (Optional)</label>
            <Textarea
              id="checkInNotes"
              v-model="checkInData.notes"
              rows="3"
              placeholder="Any notes about arrival, setup, etc."
              class="w-full"
            />
          </div>

          <div class="form-group">
            <label>Upload Photo</label>
            <FileUpload
              mode="basic"
              accept="image/*"
              :maxFileSize="5000000"
              @select="onPhotoSelect"
              :auto="false"
              chooseLabel="Take/Choose Photo"
              class="w-full"
            />
            <small class="help-text">
              Take a photo of the setup or activation area
            </small>
          </div>

          <Button
            @click="performCheckIn"
            :loading="loading"
            :disabled="!canCheckIn"
            label="Check In"
            icon="pi pi-sign-in"
            class="w-full p-button-success"
          />
        </div>

        <!-- Check-out Form -->
        <div v-else-if="!isCheckedOut" class="check-form">
          <div class="check-summary">
            <div class="summary-item">
              <span class="label">Checked in at:</span>
              <span class="value">{{ formatDateTime(checkInTime) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Duration:</span>
              <span class="value">{{ workDuration }}</span>
            </div>
            <div class="summary-item" v-if="attendanceRecord">
              <span class="label">Attendance ID:</span>
              <span class="value">#{{ attendanceRecord }}</span>
            </div>
          </div>

          <Divider />

          <div class="form-group">
            <label for="checkOutNotes" class="required">Summary</label>
            <Textarea
              id="checkOutNotes"
              v-model="checkOutData.summary"
              rows="3"
              placeholder="Brief summary of activities completed"
              class="w-full"
              :class="{ 'p-invalid': errors.summary }"
            />
            <small class="p-error" v-if="errors.summary">
              {{ errors.summary }}
            </small>
          </div>

          <div class="form-group">
            <label>Activities Completed</label>
            <MultiSelect
              v-model="checkOutData.activities"
              :options="activityOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select activities"
              display="chip"
              class="w-full"
            />
          </div>

          <div class="form-group">
            <label for="checkOutNotes">Additional Notes</label>
            <Textarea
              id="checkOutNotes"
              v-model="checkOutData.notes"
              rows="2"
              placeholder="Any additional notes about the checkout"
              class="w-full"
            />
          </div>

          <div class="form-group">
            <label>Upload End Photo</label>
            <FileUpload
              mode="basic"
              accept="image/*"
              :maxFileSize="5000000"
              @select="onEndPhotoSelect"
              :auto="false"
              chooseLabel="Take/Choose Photo"
              class="w-full"
            />
          </div>

          <Button
            @click="performCheckOut"
            :loading="loading"
            :disabled="!canCheckOut"
            label="Check Out"
            icon="pi pi-sign-out"
            class="w-full p-button-warning"
          />
        </div>

        <!-- Completion Status -->
        <div v-else class="completion-status">
          <div class="status-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <h4>Activation Completed</h4>
          <div class="completion-details">
            <div class="detail-item">
              <span class="label">Check-in:</span>
              <span class="value">{{ formatDateTime(checkInTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Check-out:</span>
              <span class="value">{{ formatDateTime(checkOutTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Total Duration:</span>
              <span class="value">{{ totalDuration }}</span>
            </div>
            <div class="detail-item" v-if="attendanceRecord">
              <span class="label">Attendance Record:</span>
              <span class="value">#{{ attendanceRecord }}</span>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Location Permission Dialog -->
    <Dialog
      v-model:visible="showLocationDialog"
      header="Location Permission Required"
      :modal="true"
      :closable="false"
      :style="{ width: '400px' }"
    >
      <div class="location-dialog">
        <i class="pi pi-map-marker dialog-icon"></i>
        <p>
          We need your location to verify you're at the activation site.
          Please enable location services.
        </p>
        <div class="dialog-actions">
          <Button
            @click="requestLocation"
            label="Enable Location"
            icon="pi pi-map-marker"
            class="p-button-primary"
          />
          <Button
            @click="skipLocation"
            label="Skip"
            class="p-button-text"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import promoterService from '@/services/promoterService'
import { formatDistanceToNow, format } from 'date-fns'

const props = defineProps({
  activation: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['checked-in', 'checked-out', 'updated'])

const toast = useToast()

// State
const loading = ref(false)
const locationLoading = ref(false)
const showLocationDialog = ref(false)
const currentLocation = ref(null)
const checkInTime = ref(null)
const checkOutTime = ref(null)
const isCheckedIn = ref(false)
const isCheckedOut = ref(false)
const selectedPhoto = ref(null)
const selectedEndPhoto = ref(null)
const attendanceRecord = ref(null) // Store the attendance record ID

const checkInData = ref({
  notes: '',
  location: null,
  photo: null
})

const checkOutData = ref({
  summary: '',
  activities: [],
  location: null,
  photo: null,
  notes: ''
})

const errors = ref({})

// Activity options
const activityOptions = [
  { label: 'Product Demonstration', value: 'demo' },
  { label: 'Customer Engagement', value: 'engagement' },
  { label: 'Sales', value: 'sales' },
  { label: 'Stock Management', value: 'stock' },
  { label: 'Setup/Breakdown', value: 'setup' },
  { label: 'Training', value: 'training' },
  { label: 'Reporting', value: 'reporting' }
]

// Computed
const checkStatus = computed(() => {
  if (isCheckedOut.value) return 'Completed'
  if (isCheckedIn.value) return 'In Progress'
  return 'Not Started'
})

const checkStatusSeverity = computed(() => {
  if (isCheckedOut.value) return 'success'
  if (isCheckedIn.value) return 'warning'
  return 'info'
})

const canCheckIn = computed(() => {
  return !loading.value && !locationLoading.value
})

const canCheckOut = computed(() => {
  return !loading.value && checkOutData.value.summary.trim()
})

const workDuration = computed(() => {
  if (!checkInTime.value) return '0 minutes'
  return formatDistanceToNow(new Date(checkInTime.value), { addSuffix: false })
})

const totalDuration = computed(() => {
  if (!checkInTime.value || !checkOutTime.value) return '0 minutes'
  const start = new Date(checkInTime.value)
  const end = new Date(checkOutTime.value)
  const diff = end - start
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
})

// Methods
const requestLocation = () => {
  locationLoading.value = true
  showLocationDialog.value = false

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentLocation.value = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        locationLoading.value = false
        toast.add({
          severity: 'success',
          summary: 'Location Captured',
          detail: 'Your location has been recorded',
          life: 3000
        })
      },
      (error) => {
        locationLoading.value = false
        toast.add({
          severity: 'warn',
          summary: 'Location Error',
          detail: 'Could not get your location. You can still check in.',
          life: 5000
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  } else {
    locationLoading.value = false
    toast.add({
      severity: 'warn',
      summary: 'Location Not Supported',
      detail: 'Your browser does not support location services',
      life: 5000
    })
  }
}

const skipLocation = () => {
  showLocationDialog.value = false
}

const onPhotoSelect = (event) => {
  selectedPhoto.value = event.files[0]
}

const onEndPhotoSelect = (event) => {
  selectedEndPhoto.value = event.files[0]
}

const performCheckIn = async () => {
  loading.value = true
  errors.value = {}

  try {
    const data = {
      notes: checkInData.value.notes,
      location: currentLocation.value
    }

    const response = await promoterService.checkIn(props.activation.id, data)

    // Upload photo if selected
    if (selectedPhoto.value) {
      await promoterService.uploadImage(
        props.activation.id, 
        selectedPhoto.value, 
        'check-in'
      )
    }

    checkInTime.value = response.checkInTime
    attendanceRecord.value = response.attendanceRecord || response.attendanceId || response.id || response.recordId
    isCheckedIn.value = true

    toast.add({
      severity: 'success',
      summary: 'Checked In',
      detail: 'You have successfully checked in',
      life: 3000
    })

    emit('checked-in', response)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Check-in Failed',
      detail: error.response?.data?.message || 'Failed to check in',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

const performCheckOut = async () => {
  if (!checkOutData.value.summary.trim()) {
    errors.value.summary = 'Please provide a summary of activities'
    return
  }

  loading.value = true
  errors.value = {}

  try {
    // Get current location for check-out
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          checkOutData.value.location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
          await completeCheckOut()
        },
        async () => {
          // Continue without location
          await completeCheckOut()
        }
      )
    } else {
      await completeCheckOut()
    }
  } catch (error) {
    loading.value = false
    toast.add({
      severity: 'error',
      summary: 'Check-out Failed',
      detail: error.response?.data?.message || 'Failed to check out',
      life: 5000
    })
  }
}

const completeCheckOut = async () => {
  try {
    const response = await promoterService.checkOut(props.activation.id, {
      attendanceRecord: attendanceRecord.value,
      summary: checkOutData.value.summary,
      activities: checkOutData.value.activities,
      latitude: checkOutData.value.location?.latitude,
      longitude: checkOutData.value.location?.longitude,
      address: checkOutData.value.location?.address || "Location address not available",
      notes: checkOutData.value.notes || checkOutData.value.summary
    })

    // Upload end photo if selected
    if (selectedEndPhoto.value) {
      await promoterService.uploadImage(
        props.activation.id, 
        selectedEndPhoto.value, 
        'check-out'
      )
    }

    checkOutTime.value = response.checkOutTime
    isCheckedOut.value = true

    toast.add({
      severity: 'success',
      summary: 'Checked Out',
      detail: 'You have successfully checked out',
      life: 3000
    })

    emit('checked-out', response)
  } finally {
    loading.value = false
  }
}

const loadCheckStatus = async () => {
  try {
    const status = await promoterService.getCheckInStatus(props.activation.id)
    isCheckedIn.value = status.checkedIn
    isCheckedOut.value = status.checkedOut
    checkInTime.value = status.checkInTime
    checkOutTime.value = status.checkOutTime
    attendanceRecord.value = status.attendanceRecord || status.attendanceId || status.id || status.recordId
  } catch (error) {
    console.error('Failed to load check status:', error)
  }
}

const formatTime = (time) => {
  return time // Assuming time is already formatted
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return 'N/A'
  return format(new Date(dateTime), 'PPp')
}

// Lifecycle
onMounted(() => {
  loadCheckStatus()
  
  // Check if we should request location on mount
  if (!isCheckedIn.value && !currentLocation.value) {
    showLocationDialog.value = true
  }
})
</script>

<style scoped>
.check-in-out {
  max-width: 500px;
  margin: 0 auto;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activation-info h4 {
  margin: 0 0 1rem 0;
  color: var(--text-color);
}

.activation-info p {
  margin: 0.5rem 0;
  color: var(--text-color-secondary);
}

.activation-info i {
  margin-right: 0.5rem;
  color: var(--primary-color);
}

.check-form .form-group {
  margin-bottom: 1.5rem;
}

.check-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.check-form label.required::after {
  content: ' *';
  color: var(--red-500);
}

.location-status {
  padding: 0.75rem;
  background: var(--surface-50);
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.location-status span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.text-success {
  color: var(--green-500);
}

.text-danger {
  color: var(--red-500);
}

.help-text {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.check-summary {
  background: var(--surface-50);
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-item .label {
  color: var(--text-color-secondary);
}

.summary-item .value {
  font-weight: 500;
  color: var(--text-color);
}

.completion-status {
  text-align: center;
  padding: 2rem;
}

.status-icon {
  font-size: 4rem;
  color: var(--green-500);
  margin-bottom: 1rem;
}

.completion-status h4 {
  margin: 0 0 1.5rem 0;
  color: var(--text-color);
}

.completion-details {
  background: var(--surface-50);
  padding: 1.5rem;
  border-radius: 6px;
  text-align: left;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-item .label {
  color: var(--text-color-secondary);
}

.detail-item .value {
  font-weight: 500;
  color: var(--text-color);
}

.location-dialog {
  text-align: center;
  padding: 1rem;
}

.dialog-icon {
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
  display: block;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.p-fileupload {
  width: 100%;
}

:deep(.p-fileupload-choose) {
  width: 100%;
  justify-content: center;
}

@media (max-width: 576px) {
  .check-in-out {
    max-width: 100%;
  }

  .dialog-actions {
    flex-direction: column;
  }

  .dialog-actions .p-button {
    width: 100%;
  }
}
</style>
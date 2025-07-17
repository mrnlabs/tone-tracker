<template>
  <DashboardLayout>
    <div class="edit-activation-page">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-content">
          <i class="pi pi-spinner pi-spin loading-icon"></i>
          <p>Loading activation details...</p>
        </div>
      </div>

      <!-- Error State -->
      <Card v-else-if="loadError" class="error-card">
        <template #content>
          <div class="error-content">
            <i class="pi pi-exclamation-triangle error-icon"></i>
            <h3>Failed to Load Activation</h3>
            <p>{{ loadError }}</p>
            <div class="error-actions">
              <Button
                @click="loadActivation"
                label="Retry"
                icon="pi pi-refresh"
                class="p-button-outlined"
              />
              <Button
                @click="$router.push('/activations')"
                label="Back to Activations"
                icon="pi pi-arrow-left"
                class="p-button-text"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Main Form -->
      <div v-else class="form-container">
        <!-- Page Header -->
        <div class="page-header">
          <div class="header-content">
            <div class="header-nav">
              <Button
                @click="$router.back()"
                icon="pi pi-arrow-left"
                class="p-button-text"
                label="Back"
              />
            </div>
            <div class="header-info">
              <h1 class="page-title">Edit Activation</h1>
              <p class="page-description">
                Modify {{ originalData?.name || 'activation' }} details and settings
              </p>
            </div>
          </div>
        </div>

        <!-- Progress Steps -->
        <Card class="progress-card">
          <template #content>
            <div class="progress-steps">
              <div :class="['step', { active: currentStep >= 1, completed: currentStep > 1 }]">
                <div class="step-number">1</div>
                <span class="step-label">Basic Info</span>
              </div>
              <div class="step-divider"></div>
              <div :class="['step', { active: currentStep >= 2, completed: currentStep > 2 }]">
                <div class="step-number">2</div>
                <span class="step-label">Schedule & Location</span>
              </div>
              <div class="step-divider"></div>
              <div :class="['step', { active: currentStep >= 3, completed: currentStep > 3 }]">
                <div class="step-number">3</div>
                <span class="step-label">Team Assignment</span>
              </div>
              <div class="step-divider"></div>
              <div :class="['step', { active: currentStep >= 4 }]">
                <div class="step-number">4</div>
                <span class="step-label">Review</span>
              </div>
            </div>
          </template>
        </Card>

        <!-- Form Content -->
        <Card class="form-card">
          <template #content>
            <!-- Step 1: Basic Information -->
            <div v-if="currentStep === 1" class="form-step">
              <h3 class="step-title">Basic Information</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label for="name" class="form-label required">Activation Name</label>
                  <InputText
                    id="name"
                    v-model="formData.name"
                    :class="{ 'p-invalid': errors.name }"
                    placeholder="Enter activation name (max 200 characters)"
                    maxlength="200"
                  />
                  <small v-if="errors.name" class="error-message">{{ errors.name }}</small>
                </div>

                <div class="form-group">
                  <label for="clientId" class="form-label required">Client</label>
                  <Dropdown
                    id="clientId"
                    v-model="formData.clientId"
                    :options="clientOptions"
                    optionValue="id"
                    optionLabel="name"
                    :class="{ 'p-invalid': errors.clientId }"
                    placeholder="Select client"
                  />
                  <small v-if="errors.clientId" class="error-message">{{ errors.clientId }}</small>
                </div>

                <div class="form-group">
                  <label for="status" class="form-label required">Status</label>
                  <Dropdown
                    id="status"
                    v-model="formData.status"
                    :options="statusOptions"
                    :class="{ 'p-invalid': errors.status }"
                    placeholder="Select status"
                  />
                  <small v-if="errors.status" class="error-message">{{ errors.status }}</small>
                </div>

                <div class="form-group full-width">
                  <RichTextEditor
                      v-model="formData.briefDescription"
                      label="Brief Description"
                      placeholder="Provide a detailed brief description of the activation, including objectives, target audience, key messaging, and execution strategy..."
                      :max-length="2000"
                      :error="errors.briefDescription"
                      :show-word-count="true"
                  />
                </div>

                <div class="form-group full-width">
                  <FileUpload
                      v-model="briefDocument"
                      label="Brief Document (PDF)"
                      accept=".pdf"
                      :max-size="10 * 1024 * 1024"
                      :error="errors.briefDocument"
                      @upload-success="handleBriefUploadSuccess"
                      @file-removed="handleBriefRemoved"
                  />
                </div>
              </div>
            </div>

            <!-- Step 2: Schedule & Location -->
            <div v-if="currentStep === 2" class="form-step">
              <h3 class="step-title">Schedule & Location</h3>
              
              <!-- Schedule Section -->
              <div class="section-header">
                <h4>Schedule</h4>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label for="startDate" class="form-label required">Start Date</label>
                  <Calendar
                    id="startDate"
                    v-model="formData.startDate"
                    :class="{ 'p-invalid': errors.startDate }"
                    placeholder="Select start date"
                    dateFormat="yy-mm-dd"
                  />
                  <small v-if="errors.startDate" class="error-message">{{ errors.startDate }}</small>
                </div>

                <div class="form-group">
                  <label for="endDate" class="form-label required">End Date</label>
                  <Calendar
                    id="endDate"
                    v-model="formData.endDate"
                    :class="{ 'p-invalid': errors.endDate }"
                    placeholder="Select end date"
                    dateFormat="yy-mm-dd"
                  />
                  <small v-if="errors.endDate" class="error-message">{{ errors.endDate }}</small>
                </div>

                <div class="form-group">
                  <label for="startTime" class="form-label required">Start Time</label>
                  <Calendar
                    id="startTime"
                    v-model="formData.startTime"
                    :class="{ 'p-invalid': errors.startTime }"
                    placeholder="Select start time"
                    :timeOnly="true"
                    hourFormat="24"
                  />
                  <small v-if="errors.startTime" class="error-message">{{ errors.startTime }}</small>
                </div>

                <div class="form-group">
                  <label for="endTime" class="form-label required">End Time</label>
                  <Calendar
                    id="endTime"
                    v-model="formData.endTime"
                    :class="{ 'p-invalid': errors.endTime }"
                    placeholder="Select end time"
                    :timeOnly="true"
                    hourFormat="24"
                  />
                  <small v-if="errors.endTime" class="error-message">{{ errors.endTime }}</small>
                </div>
              </div>

              <!-- Location Section -->
              <div class="section-header">
                <h4>Location</h4>
              </div>
              <div class="form-grid">
                <!-- Enhanced Location Picker with Google Places Autocomplete -->
                <div class="form-group full-width">
                  <LocationPicker
                      v-model="selectedLocation"
                      label="Location *"
                      placeholder="Search for a location or venue..."
                      :required="true"
                      :error="errors.location"
                      :show-map="true"
                      @location-selected="handleLocationSelected"
                  />
                </div>

                <!-- Manual Location Override (optional) -->
                <div class="form-group">
                  <label for="locationName" class="form-label">Location/Venue Name</label>
                  <InputText
                    id="locationName"
                    v-model="formData.locationName"
                    :class="{ 'p-invalid': errors.locationName }"
                    placeholder="Override or specify venue name"
                    maxlength="200"
                  />
                  <small v-if="errors.locationName" class="error-message">{{ errors.locationName }}</small>
                </div>
              </div>
            </div>

            <!-- Step 3: Team Assignment -->
            <div v-if="currentStep === 3" class="form-step">
              <h3 class="step-title">Team Assignment</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label for="activationManagerId" class="form-label">Activation Manager</label>
                  <Dropdown
                    id="activationManagerId"
                    v-model="formData.activationManagerId"
                    :options="managerOptions"
                    optionValue="id"
                    optionLabel="name"
                    :class="{ 'p-invalid': errors.activationManagerId }"
                    placeholder="Select activation manager"
                  />
                  <small v-if="errors.activationManagerId" class="error-message">{{ errors.activationManagerId }}</small>
                </div>

                <div class="form-group full-width">
                  <label for="assignedPromoterIds" class="form-label">Assigned Promoters</label>
                  <MultiSelect
                    id="assignedPromoterIds"
                    v-model="formData.assignedPromoterIds"
                    :options="promoterOptions"
                    optionValue="id"
                    optionLabel="name"
                    placeholder="Select promoters for this activation"
                    class="w-full"
                  />
                  <small class="field-hint">Select promoters who will participate in this activation</small>
                </div>
              </div>
            </div>

            <!-- Step 4: Review -->
            <div v-if="currentStep === 4" class="form-step">
              <h3 class="step-title">Review Changes</h3>
              <div class="review-content">
                <div class="review-section">
                  <h4>Basic Information</h4>
                  <div class="review-item">
                    <span class="label">Name:</span>
                    <span class="value">{{ formData.name }}</span>
                  </div>
                  <div class="review-item">
                    <span class="label">Client:</span>
                    <span class="value">{{ getClientName(formData.clientId) }}</span>
                  </div>
                  <div class="review-item">
                    <span class="label">Status:</span>
                    <span class="value">{{ formData.status }}</span>
                  </div>
                </div>

                <div class="review-section">
                  <h4>Schedule</h4>
                  <div class="review-item">
                    <span class="label">Dates:</span>
                    <span class="value">{{ formatDate(formData.startDate) }} - {{ formatDate(formData.endDate) }}</span>
                  </div>
                  <div class="review-item">
                    <span class="label">Times:</span>
                    <span class="value">{{ formatTime(formData.startTime) }} - {{ formatTime(formData.endTime) }}</span>
                  </div>
                </div>

                <div class="review-section">
                  <h4>Location</h4>
                  <div class="review-item">
                    <span class="label">Location:</span>
                    <span class="value">{{ formData.locationName }}</span>
                  </div>
                  <div class="review-item">
                    <span class="label">Address:</span>
                    <span class="value">{{ formData.streetAddress }}, {{ formData.city }} {{ formData.zipCode }}</span>
                  </div>
                  <div class="review-item">
                    <span class="label">Coordinates:</span>
                    <span class="value">{{ formData.latitude }}, {{ formData.longitude }}</span>
                  </div>
                </div>

                <div class="review-section">
                  <h4>Team Assignment</h4>
                  <div class="review-item">
                    <span class="label">Manager:</span>
                    <span class="value">{{ getManagerName(formData.activationManagerId) }}</span>
                  </div>
                  <div class="review-item">
                    <span class="label">Promoters:</span>
                    <span class="value">{{ getPromoterNames(formData.assignedPromoterIds) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Form Actions -->
        <div class="form-actions">
          <div class="action-buttons">
            <Button
              v-if="currentStep > 1"
              @click="previousStep"
              label="Previous"
              icon="pi pi-arrow-left"
              class="p-button-outlined"
              :disabled="isSubmitting"
            />
            
            <Button
              v-if="currentStep < 4"
              @click="nextStep"
              label="Next"
              icon="pi pi-arrow-right"
              icon-pos="right"
              :disabled="isSubmitting"
            />
            
            <Button
              v-if="currentStep === 4"
              @click="handleSubmit"
              label="Update Activation"
              icon="pi pi-check"
              :loading="isSubmitting"
              class="p-button-success"
            />
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { activationService, clientService, userService, promoterService, warehouseService, fileService } from '@/services/api'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import LocationPicker from '@/components/form-components/LocationPicker.vue'
import RichTextEditor from '@/components/form-components/RichTextEditor.vue'
import FileUpload from '@/components/form-components/FileUpload.vue'
import { ACTIVATION_STATUS } from '@/utils/constants'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import Calendar from 'primevue/calendar'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import Card from 'primevue/card'
import ProgressBar from 'primevue/progressbar'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// Loading and error states
const isLoading = ref(true)
const isSubmitting = ref(false)
const loadError = ref('')

// Current step and original data
const currentStep = ref(1)
const originalData = ref(null)
const selectedLocation = ref(null)

// Form data
const formData = ref({
  id: null,
  name: '',
  clientId: null,
  startDate: null,
  endDate: null,
  startTime: null,
  endTime: null,
  locationName: '',
  streetAddress: '',
  city: '',
  zipCode: '',
  latitude: null,
  longitude: null,
  activationManagerId: null,
  assignedPromoterIds: [],
  briefDescription: '',
  briefDocumentPath: '',
  status: 'DRAFT'
})

// File upload state
const briefDocument = ref(null)

// Form errors
const errors = ref({})

// Form options
const clientOptions = ref([])
const managerOptions = ref([])
const promoterOptions = ref([])

const statusOptions = computed(() => 
  Object.entries(ACTIVATION_STATUS).map(([key, value]) => ({
    label: value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: key
  }))
)

// File handling methods
const triggerFileSelect = () => {
  briefFileInput.value?.click()
}

const handleBriefFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file type
  if (file.type !== 'application/pdf') {
    toast.add({
      severity: 'error',
      summary: 'Invalid File Type',
      detail: 'Please select a PDF file',
      life: 5000
    })
    return
  }

  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    toast.add({
      severity: 'error',
      summary: 'File Too Large',
      detail: 'File size must be less than 10MB',
      life: 5000
    })
    return
  }

  briefFile.value = file
}

const clearSelectedFile = () => {
  briefFile.value = null
  if (briefFileInput.value) {
    briefFileInput.value.value = ''
  }
}

const uploadBriefDocument = async () => {
  if (!briefFile.value) return null

  try {
    isUploadingBrief.value = true
    briefUploadProgress.value = 0

    const result = await fileService.uploadFile(
      briefFile.value,
      (progress) => {
        briefUploadProgress.value = progress
      },
      {
        category: 'activation-brief',
        activationId: route.params.id
      }
    )

    return result.filePath || result.path || result.url
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Upload Failed',
      detail: error.message || 'Failed to upload brief document',
      life: 5000
    })
    throw error
  } finally {
    isUploadingBrief.value = false
    briefUploadProgress.value = 0
  }
}

const downloadBrief = async () => {
  if (!formData.value.briefDocumentPath) return

  try {
    // Use direct S3 URL construction with VITE_AWS_S3_BUCKET
    const s3Url = await fileService.getS3FileUrl(formData.value.briefDocumentPath)
    window.open(s3Url, '_blank', 'noopener,noreferrer')
    
    const fileName = formData.value.briefDocumentPath.split('/').pop() || 'brief-document.pdf'
    
    toast.add({
      severity: 'success',
      summary: 'Document Opened',
      detail: `Brief document opened from S3: ${fileName}`
    })
  } catch (error) {
    console.error('S3 access error:', error)
    toast.add({
      severity: 'error',
      summary: 'Access Failed',
      detail: 'Failed to access brief document from S3 bucket. Please check if the file exists.',
      life: 5000
    })
  }
}

const removeBrief = () => {
  formData.value.briefDocumentPath = ''
  clearSelectedFile()
  toast.add({
    severity: 'info',
    summary: 'Brief Removed',
    detail: 'Brief document will be removed when you save',
    life: 3000
  })
}

const getDocumentName = (path) => {
  if (!path) return 'No document'
  return path.split('/').pop() || 'brief-document.pdf'
}

// Methods
const loadActivation = async () => {
  try {
    isLoading.value = true
    loadError.value = ''
    
    const activationId = route.params.id
    if (!activationId) {
      throw new Error('Activation ID is required')
    }

    // Load activation data and form options in parallel
    const [activation, clients, managers, promoters] = await Promise.all([
      activationService.getActivation(activationId),
      clientService.getClients(),
      userService.getUsersByRole('ACTIVATION_MANAGER'),
      promoterService.getPromoters()
    ])

    // Store original data
    originalData.value = activation

    // Populate form with activation data
    Object.assign(formData.value, {
      id: activation.id || null,
      name: activation.name || '',
      clientId: activation.clientId || null,
      startDate: activation.startDate ? new Date(activation.startDate) : null,
      endDate: activation.endDate ? new Date(activation.endDate) : null,
      startTime: activation.startTime ? parseTimeString(activation.startTime) : null,
      endTime: activation.endTime ? parseTimeString(activation.endTime) : null,
      locationName: activation.locationName || '',
      streetAddress: activation.streetAddress || '',
      city: activation.city || '',
      zipCode: activation.zipCode || '',
      latitude: activation.latitude || null,
      longitude: activation.longitude || null,
      activationManagerId: activation.activationManagerId || null,
      assignedPromoterIds: activation.assignedPromoterIds || [],
      briefDescription: activation.briefDescription || '',
      briefDocumentPath: activation.briefDocumentPath || '',
      status: activation.status || 'DRAFT'
    })

    // Populate selected location for the LocationPicker component
    if (activation.latitude && activation.longitude) {
      selectedLocation.value = {
        lat: activation.latitude,
        lng: activation.longitude,
        address: activation.streetAddress || activation.locationName || '',
        name: activation.locationName || '',
        streetAddress: activation.streetAddress || '',
        city: activation.city || '',
        zipCode: activation.zipCode || ''
      }
    }

    // Populate brief document for the FileUpload component
    if (activation.briefDocumentPath) {
      briefDocument.value = {
        name: activation.briefDocumentPath.split('/').pop() || 'Brief Document.pdf',
        url: activation.briefDocumentPath,
        uploadDate: activation.dateCreated || new Date()
      }
    }

    // Populate form options
    clientOptions.value = clients.data || clients
    managerOptions.value = (managers.data || managers).map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`
    }))
    promoterOptions.value = (promoters.data || promoters).map(promoter => ({
      id: promoter.id,
      name: `${promoter.firstName} ${promoter.lastName}`
    }))

  } catch (error) {
    loadError.value = error.message || 'Failed to load activation data'
  } finally {
    isLoading.value = false
  }
}

const validateStep = (step) => {
  const newErrors = {}

  switch (step) {
    case 1:
      // Required fields from backend DTO
      if (!formData.value.name?.trim()) {
        newErrors.name = 'Activation name is required'
      } else if (formData.value.name.length > 200) {
        newErrors.name = 'Activation name must not exceed 200 characters'
      }
      
      if (!formData.value.clientId) {
        newErrors.clientId = 'Client ID is required'
      }
      
      if (!formData.value.status) {
        newErrors.status = 'Status is required'
      }
      
      if (formData.value.briefDescription && formData.value.briefDescription.length > 2000) {
        newErrors.briefDescription = 'Brief description must not exceed 2000 characters'
      }
      break

    case 2:
      // Required schedule fields
      if (!formData.value.startDate) newErrors.startDate = 'Start date is required'
      if (!formData.value.endDate) newErrors.endDate = 'End date is required'
      if (!formData.value.startTime) newErrors.startTime = 'Start time is required'
      if (!formData.value.endTime) newErrors.endTime = 'End time is required'
      
      // Required location fields
      if (!formData.value.locationName?.trim()) {
        newErrors.locationName = 'Location name is required'
      } else if (formData.value.locationName.length > 200) {
        newErrors.locationName = 'Location name must not exceed 200 characters'
      }
      
      if (!formData.value.streetAddress?.trim()) {
        newErrors.streetAddress = 'Street address is required'
      } else if (formData.value.streetAddress.length > 200) {
        newErrors.streetAddress = 'Street address must not exceed 200 characters'
      }
      
      if (!formData.value.latitude) {
        newErrors.latitude = 'Latitude is required'
      } else if (formData.value.latitude < -90 || formData.value.latitude > 90) {
        newErrors.latitude = 'Latitude must be between -90 and 90'
      }
      
      if (!formData.value.longitude) {
        newErrors.longitude = 'Longitude is required'
      } else if (formData.value.longitude < -180 || formData.value.longitude > 180) {
        newErrors.longitude = 'Longitude must be between -180 and 180'
      }
      
      // Optional field length validations
      if (formData.value.city && formData.value.city.length > 50) {
        newErrors.city = 'City must not exceed 50 characters'
      }
      
      if (formData.value.zipCode && formData.value.zipCode.length > 10) {
        newErrors.zipCode = 'Zip code must not exceed 10 characters'
      }
      
      // Date logic validation
      if (formData.value.startDate && formData.value.endDate) {
        if (formData.value.endDate < formData.value.startDate) {
          newErrors.endDate = 'End date must be after or equal to start date'
        }
      }
      break

    case 3:
      // Team assignment validation (optional in backend)
      break
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Handle location selection from Google Places
const handleLocationSelected = (location) => {
  if (location) {
    // Auto-populate form fields from the selected location
    formData.value.locationName = location.name || location.address
    formData.value.streetAddress = location.streetAddress || location.address
    formData.value.city = location.city || ''
    formData.value.zipCode = location.zipCode || ''
    formData.value.latitude = location.lat
    formData.value.longitude = location.lng
    
    // Clear any location-related errors
    delete errors.value.location
    delete errors.value.locationName
    delete errors.value.streetAddress
    delete errors.value.latitude
    delete errors.value.longitude
  }
}

// Handle brief document upload
const handleBriefUploadSuccess = (result) => {
  formData.value.briefDocumentPath = result.path || result.url
  
  toast.add({
    severity: 'success',
    summary: 'Upload Successful',
    detail: 'Brief document uploaded successfully',
    life: 3000
  })
}

const handleBriefRemoved = () => {
  formData.value.briefDocumentPath = ''
  briefDocument.value = null
}

const nextStep = () => {
  if (validateStep(currentStep.value)) {
    currentStep.value++
  }
}

const previousStep = () => {
  currentStep.value--
  errors.value = {}
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const handleSubmit = async () => {
  // Validate all steps
  let isValid = true
  for (let step = 1; step <= 3; step++) {
    if (!validateStep(step)) {
      isValid = false
      currentStep.value = step
      break
    }
  }

  if (!isValid) {
    toast.add({
      severity: 'warn',
      summary: 'Validation Error',
      detail: 'Please fix the errors before submitting',
      life: 5000
    })
    return
  }

  try {
    isSubmitting.value = true

    // Upload brief document if a new file is selected
    let briefDocumentPath = formData.value.briefDocumentPath
    if (briefFile.value) {
      briefDocumentPath = await uploadBriefDocument()
      clearSelectedFile()
    }

    // Prepare update data to match backend DTO
    const updateData = {
      name: formData.value.name,
      clientId: formData.value.clientId,
      startDate: formData.value.startDate ? formatDateForAPI(formData.value.startDate) : null,
      endDate: formData.value.endDate ? formatDateForAPI(formData.value.endDate) : null,
      startTime: formData.value.startTime ? formatTimeForAPI(formData.value.startTime) : null,
      endTime: formData.value.endTime ? formatTimeForAPI(formData.value.endTime) : null,
      locationName: formData.value.locationName,
      streetAddress: formData.value.streetAddress,
      city: formData.value.city,
      zipCode: formData.value.zipCode,
      latitude: formData.value.latitude,
      longitude: formData.value.longitude,
      activationManagerId: formData.value.activationManagerId,
      assignedPromoterIds: formData.value.assignedPromoterIds,
      briefDescription: formData.value.briefDescription,
      briefDocumentPath: briefDocumentPath,
      status: formData.value.status
    }

    await activationService.updateActivation(route.params.id, updateData)
    
    // Update form data with new document path
    formData.value.briefDocumentPath = briefDocumentPath

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Activation updated successfully',
      life: 5000
    })

    // Navigate back to activation details
    router.push(`/activations/${route.params.id}`)

  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Update Failed',
      detail: error.message || 'Failed to update activation',
      life: 5000
    })
  } finally {
    isSubmitting.value = false
  }
}

// Helper functions
const parseTimeString = (timeString) => {
  if (!timeString) return null
  const [hours, minutes] = timeString.split(':')
  const date = new Date()
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0)
  return date
}

const formatDateForAPI = (date) => {
  if (!date) return null
  return date.toISOString().split('T')[0] // Returns YYYY-MM-DD format
}

const formatTimeForAPI = (date) => {
  if (!date) return null
  return date.toTimeString().slice(0, 5) // Returns HH:mm format
}

const formatTime = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getClientName = (clientId) => {
  if (!clientId) return 'N/A'
  const client = clientOptions.value.find(c => c.id === clientId)
  return client?.name || 'Unknown Client'
}

const getManagerName = (managerId) => {
  if (!managerId) return 'Not assigned'
  const manager = managerOptions.value.find(m => m.id === managerId)
  return manager?.name || 'Unknown Manager'
}

const getPromoterNames = (promoterIds) => {
  if (!promoterIds || promoterIds.length === 0) return 'None assigned'
  const names = promoterIds.map(id => {
    const promoter = promoterOptions.value.find(p => p.id === id)
    return promoter?.name || 'Unknown'
  })
  return names.join(', ')
}

// Lifecycle
onMounted(() => {
  loadActivation()
})
</script>

<style scoped>
.edit-activation-page {
  padding: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-content {
  text-align: center;
}

.loading-icon {
  font-size: 2rem;
  color: #3b82f6;
  margin-bottom: 1rem;
}

.error-card,
.progress-card,
.form-card {
  margin-bottom: 2rem;
}

.error-content {
  text-align: center;
  padding: 2rem;
}

.error-icon {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.page-description {
  color: #6b7280;
  margin: 0;
}

.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.step-number {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  background-color: #e5e7eb;
  color: #6b7280;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background-color: #3b82f6;
  color: white;
}

.step.completed .step-number {
  background-color: #10b981;
  color: white;
}

.step-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  text-align: center;
}

.step.active .step-label,
.step.completed .step-label {
  color: #374151;
  font-weight: 600;
}

.step-divider {
  width: 3rem;
  height: 1px;
  background-color: #e5e7eb;
}

.form-step {
  padding: 2rem;
}

.step-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 2rem 0;
}

.section-header {
  margin: 2rem 0 1rem 0;
}

.section-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.field-hint {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* File Upload Styles */
.file-upload-container {
  margin-top: 0.5rem;
}

.current-document {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #f9fafb;
}

.document-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.document-info i {
  font-size: 1.5rem;
  color: #dc2626;
}

.document-name {
  flex: 1;
  font-weight: 500;
  color: #374151;
}

.document-actions {
  display: flex;
  gap: 0.5rem;
}

.file-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.file-upload-area:hover {
  border-color: #3b82f6;
  background-color: #f8fafc;
}

.file-upload-area.has-file {
  border-color: #10b981;
  background-color: #f0fdf4;
}

.file-input {
  display: none;
}

.upload-placeholder {
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-placeholder:hover {
  background-color: #f8fafc;
}

.upload-icon {
  font-size: 2.5rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.upload-text {
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.upload-hint {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.file-selected {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #f0fdf4;
}

.file-selected i {
  font-size: 1.5rem;
  color: #dc2626;
}

.file-name {
  flex: 1;
  font-weight: 500;
  color: #374151;
}

.uploading {
  padding: 1rem;
  text-align: center;
}

.upload-progress {
  margin-bottom: 0.5rem;
}

.upload-status {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.review-content {
  display: grid;
  gap: 2rem;
}

.review-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
}

.review-section h4 {
  color: #111827;
  font-weight: 600;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.review-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.review-item:last-child {
  border-bottom: none;
}

.review-item .label {
  font-weight: 500;
  color: #6b7280;
}

.review-item .value {
  color: #111827;
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: center;
  padding: 2rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 2rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

:deep(.p-calendar),
:deep(.p-dropdown),
:deep(.p-multiselect),
:deep(.p-inputnumber) {
  width: 100%;
}

:deep(.p-inputtext),
:deep(.p-textarea) {
  width: 100%;
}

@media (max-width: 768px) {
  .edit-activation-page {
    padding: 1rem;
  }

  .progress-steps {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .step-divider {
    display: none;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .action-buttons .p-button {
    width: 100%;
  }

  .error-actions {
    flex-direction: column;
    align-items: center;
  }

  .review-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
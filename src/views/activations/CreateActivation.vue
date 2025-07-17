<template>
  <DashboardLayout>
    <div class="create-activation-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-nav">
            <Button
                @click="$router.back()"
                icon="pi pi-arrow-left"
                class="p-button-text"
                label="Back to Activations"
            />
          </div>
          <div class="header-info">
            <h1 class="page-title">Create New Activation</h1>
            <p class="page-description">
              Set up a new brand activation campaign with detailed planning and team assignment
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
              <span class="step-label">Team & Resources</span>
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
      <form @submit.prevent="handleSubmit">
        <!-- Step 1: Basic Information -->
        <Card v-if="currentStep === 1" class="form-card">
          <template #header>
            <h2>Basic Information</h2>
          </template>
          <template #content>
            <div class="form-grid">
              <div class="form-group">
                <label for="activationName">Activation Name *</label>
                <InputText
                    id="activationName"
                    v-model="formData.name"
                    :class="{ 'p-invalid': errors.name }"
                    placeholder="Enter activation name (max 200 characters)"
                    maxlength="200"
                />
                <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
              </div>

              <div class="form-group">
                <label for="client">Client *</label>
                <Dropdown
                    id="client"
                    v-model="formData.clientId"
                    :options="clientOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select client"
                    :class="{ 'p-invalid': errors.clientId }"
                    filter
                />
                <small v-if="errors.clientId" class="p-error">{{ errors.clientId }}</small>
              </div>

              <div class="form-group">
                <label for="status">Status *</label>
                <Dropdown
                    id="status"
                    v-model="formData.status"
                    :options="statusOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select status"
                    :class="{ 'p-invalid': errors.status }"
                />
                <small v-if="errors.status" class="p-error">{{ errors.status }}</small>
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
                    :store-only="true"
                    @upload-success="handleBriefUploadSuccess"
                    @file-removed="handleBriefRemoved"
                />
              </div>
            </div>
          </template>
        </Card>

        <!-- Step 2: Schedule & Location -->
        <Card v-if="currentStep === 2" class="form-card">
          <template #header>
            <h2>Schedule & Location</h2>
          </template>
          <template #content>
            <div class="form-grid">
              <div class="form-group">
                <label for="startDate">Start Date *</label>
                <Calendar
                    id="startDate"
                    v-model="formData.startDate"
                    :showIcon="true"
                    :class="{ 'p-invalid': errors.startDate }"
                    dateFormat="mm/dd/yy"
                    placeholder="Select start date"
                />
                <small v-if="errors.startDate" class="p-error">{{ errors.startDate }}</small>
              </div>

              <div class="form-group">
                <label for="endDate">End Date *</label>
                <Calendar
                    id="endDate"
                    v-model="formData.endDate"
                    :showIcon="true"
                    :class="{ 'p-invalid': errors.endDate }"
                    dateFormat="mm/dd/yy"
                    placeholder="Select end date"
                    :minDate="formData.startDate"
                />
                <small v-if="errors.endDate" class="p-error">{{ errors.endDate }}</small>
              </div>

              <div class="form-group">
                <label for="startTime">Start Time *</label>
                <Calendar
                    id="startTime"
                    v-model="formData.startTime"
                    :timeOnly="true"
                    :showIcon="true"
                    placeholder="Select start time"
                    :class="{ 'p-invalid': errors.startTime }"
                    hourFormat="24"
                />
                <small v-if="errors.startTime" class="p-error">{{ errors.startTime }}</small>
              </div>

              <div class="form-group">
                <label for="endTime">End Time *</label>
                <Calendar
                    id="endTime"
                    v-model="formData.endTime"
                    :timeOnly="true"
                    :showIcon="true"
                    placeholder="Select end time"
                    :class="{ 'p-invalid': errors.endTime }"
                    hourFormat="24"
                />
                <small v-if="errors.endTime" class="p-error">{{ errors.endTime }}</small>
              </div>

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
                <label for="locationName">Location/Venue Name</label>
                <InputText
                    id="locationName"
                    v-model="formData.locationName"
                    :class="{ 'p-invalid': errors.locationName }"
                    placeholder="Override or specify venue name"
                    maxlength="200"
                />
                <small v-if="errors.locationName" class="p-error">{{ errors.locationName }}</small>
              </div>
            </div>
          </template>
        </Card>

        <!-- Step 3: Team & Resources -->
        <Card v-if="currentStep === 3" class="form-card">
          <template #header>
            <h2>Team Assignment & Resources</h2>
          </template>
          <template #content>
            <div class="form-grid">
              <div class="form-group">
                <label for="activationManager">Activation Manager</label>
                <Dropdown
                    id="activationManager"
                    v-model="formData.activationManagerId"
                    :options="managerOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select activation manager"
                    :class="{ 'p-invalid': errors.activationManagerId }"
                    filter
                />
                <small v-if="errors.activationManagerId" class="p-error">{{ errors.activationManagerId }}</small>
              </div>

              <div class="form-group full-width">
                <label for="promoters">Assign Promoters</label>
                <MultiSelect
                    id="promoters"
                    v-model="formData.assignedPromoterIds"
                    :options="promoterOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select promoters"
                    filter
                    :maxSelectedLabels="3"
                />
                <small class="p-help">You can assign promoters now or later</small>
              </div>

            </div>
          </template>
        </Card>

        <!-- Step 4: Review -->
        <Card v-if="currentStep === 4" class="form-card">
          <template #header>
            <h2>Review Activation Details</h2>
          </template>
          <template #content>
            <div class="review-sections">
              <!-- Basic Information -->
              <div class="review-section">
                <h3>Basic Information</h3>
                <div class="review-grid">
                  <div class="review-item">
                    <label>Activation Name:</label>
                    <span>{{ formData.name }}</span>
                  </div>
                  <div class="review-item">
                    <label>Client:</label>
                    <span>{{ getClientName(formData.clientId) }}</span>
                  </div>
                  <div class="review-item">
                    <label>Status:</label>
                    <span>{{ formData.status }}</span>
                  </div>
                  <div class="review-item full-width">
                    <label>Brief Description:</label>
                    <div class="brief-preview">
                      <div v-if="formData.briefDescription" v-html="formData.briefDescription" class="brief-content"></div>
                      <span v-else class="no-content">Not provided</span>
                    </div>
                  </div>
                  <div class="review-item full-width" v-if="briefDocument">
                    <label>Brief Document:</label>
                    <div class="document-preview">
                      <i class="pi pi-file-pdf"></i>
                      <span>{{ briefDocument.name }} ({{ formatFileSize(briefDocument.size) }})</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Schedule & Location -->
              <div class="review-section">
                <h3>Schedule & Location</h3>
                <div class="review-grid">
                  <div class="review-item">
                    <label>Duration:</label>
                    <span>{{ formatDate(formData.startDate) }} - {{ formatDate(formData.endDate) }}</span>
                  </div>
                  <div class="review-item">
                    <label>Time:</label>
                    <span>{{ formatTime(formData.startTime) }} - {{ formatTime(formData.endTime) }}</span>
                  </div>
                  <div class="review-item full-width">
                    <label>Location:</label>
                    <span>{{ formData.locationName }}</span>
                  </div>
                  <div class="review-item full-width">
                    <label>Address:</label>
                    <span>{{ formData.streetAddress }}, {{ formData.city }} {{ formData.zipCode }}</span>
                  </div>
                  <div class="review-item">
                    <label>Coordinates:</label>
                    <span>{{ formData.latitude }}, {{ formData.longitude }}</span>
                  </div>
                </div>
              </div>

              <!-- Team & Resources -->
              <div class="review-section">
                <h3>Team & Resources</h3>
                <div class="review-grid">
                  <div class="review-item">
                    <label>Activation Manager:</label>
                    <span>{{ getManagerName(formData.activationManagerId) || 'Not assigned' }}</span>
                  </div>
                  <div class="review-item">
                    <label>Assigned Promoters:</label>
                    <span>{{ formData.assignedPromoterIds?.length || 0 }} promoters assigned</span>
                  </div>
                </div>
              </div>

            </div>
          </template>
        </Card>

        <!-- Form Actions -->
        <Card class="actions-card">
          <template #content>
            <div class="form-actions">
              <div class="action-buttons-left">
                <Button
                    v-if="currentStep > 1"
                    @click="previousStep"
                    label="Previous"
                    icon="pi pi-arrow-left"
                    class="p-button-outlined"
                    :disabled="loading"
                />
              </div>

              <div class="action-buttons-right">
                <Button
                    @click="saveDraft"
                    label="Save Draft"
                    icon="pi pi-save"
                    class="p-button-secondary"
                    :disabled="loading"
                />
                <Button
                    @click="$router.push('/activations')"
                    label="Cancel"
                    class="p-button-text"
                    :disabled="loading"
                />
                <Button
                    v-if="currentStep < 4"
                    @click="nextStep"
                    label="Next"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    :disabled="!isCurrentStepValid"
                />
                <Button
                    v-if="currentStep === 4"
                    type="submit"
                    label="Create Activation"
                    icon="pi pi-check"
                    class="p-button-success"
                    :loading="loading"
                />
              </div>
            </div>
          </template>
        </Card>
      </form>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { clientService, userService, promoterService, activationService } from '@/services/api'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import LocationPicker from '@/components/form-components/LocationPicker.vue'
import RichTextEditor from '@/components/form-components/RichTextEditor.vue'
import FileUpload from '@/components/form-components/FileUpload.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// State
const currentStep = ref(1)
const loading = ref(false)
const errors = ref({})
const selectedLocation = ref(null)
const briefDocument = ref(null)

// Form data (matching backend DTO structure)
const formData = ref({
  // Basic Info (from ActivationDTO)
  name: '',
  clientId: null,
  status: 'PLANNED', // Default status
  briefDescription: '',
  briefDocumentPath: '',

  // Schedule
  startDate: null,
  endDate: null,
  startTime: null,
  endTime: null,

  // Location Details
  locationName: '',
  streetAddress: '',
  city: '',
  zipCode: '',
  latitude: null,
  longitude: null,

  // Staff Assignment
  activationManagerId: null,
  assignedPromoterIds: [],

  // Legacy fields (removed from current step but kept for potential future use)
  type: '',
  category: '',
  priority: '',
  objectives: '',
  totalBudget: null,
  targetCustomerInteractions: null,
  targetSalesUnits: null,
  targetRevenue: null
})

// Options
const clientOptions = ref([])
const managerOptions = ref([])
const promoterOptions = ref([])

// Status options matching backend ActivationStatus enum
const statusOptions = [
  { label: 'Planned', value: 'PLANNED' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' }
]




const timezoneOptions = [
  { label: 'Eastern Time (ET)', value: 'America/New_York' },
  { label: 'Central Time (CT)', value: 'America/Chicago' },
  { label: 'Mountain Time (MT)', value: 'America/Denver' },
  { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
  { label: 'Central Africa Time (CAT)', value: 'Africa/Harare' },
  { label: 'Greenwich Mean Time (GMT)', value: 'Europe/London' }
]

const countryOptions = [
  { label: 'United States', value: 'United States' },
  { label: 'Canada', value: 'Canada' },
  { label: 'United Kingdom', value: 'United Kingdom' },
  { label: 'South Africa', value: 'South Africa' },
  { label: 'Zimbabwe', value: 'Zimbabwe' }
]

const equipmentOptions = [
  { label: 'Display Stands', value: 'display_stands' },
  { label: 'Sound System', value: 'sound_system' },
  { label: 'Promotional Materials', value: 'promo_materials' },
  { label: 'Tablets/iPads', value: 'tablets' },
  { label: 'Uniforms', value: 'uniforms' },
  { label: 'Banners', value: 'banners' },
  { label: 'Product Samples', value: 'samples' },
  { label: 'Registration Desk', value: 'registration_desk' }
]

const kpiOptions = [
  { label: 'Customer Interactions', value: 'customer_interactions' },
  { label: 'Sales Volume', value: 'sales_volume' },
  { label: 'Revenue Generated', value: 'revenue' },
  { label: 'Lead Generation', value: 'leads' },
  { label: 'Brand Awareness', value: 'brand_awareness' },
  { label: 'Sample Distribution', value: 'samples_distributed' },
  { label: 'Social Media Engagement', value: 'social_engagement' },
  { label: 'Customer Satisfaction', value: 'satisfaction' }
]

// Computed
const isCurrentStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      return formData.value.name && formData.value.clientId && formData.value.status
    case 2:
      return formData.value.startDate && formData.value.endDate && formData.value.startTime && 
             formData.value.endTime && formData.value.latitude && formData.value.longitude &&
             (selectedLocation.value || formData.value.locationName?.trim())
    case 3:
      return true // Team assignment is optional
    default:
      return true
  }
})



// Methods
const loadFormOptions = async () => {
  loading.value = true
  try {
    // Load form options from API in parallel
    const [clientsResponse, managersResponse, promotersResponse] = await Promise.all([
      clientService.getClients({ size: 100 }), // Get all clients
      userService.getUsersByRole('ACTIVATION_MANAGER', { size: 100 }), // Get activation managers
      promoterService.getPromoters({ size: 100 }) // Get all promoters
    ])

    // Transform clients data
    clientOptions.value = (clientsResponse.data || []).map(client => ({
      label: client.companyName || client.name,
      value: client.id
    }))

    // Transform managers data (from users with ACTIVATION_MANAGER role)
    managerOptions.value = (managersResponse.data || []).map(manager => ({
      label: `${manager.firstName} ${manager.lastName}`,
      value: manager.id
    }))

    // Transform promoters data
    promoterOptions.value = (promotersResponse.data || []).map(promoter => ({
      label: `${promoter.firstName} ${promoter.lastName}`,
      value: promoter.id
    }))

    // Pre-select client if coming from query param
    if (route.query.client) {
      formData.value.clientId = parseInt(route.query.client)
    }

  } catch (error) {
    console.error('Failed to load form options:', error)
    toast.add({
      severity: 'error',
      summary: 'Loading Error',
      detail: error.message || 'Failed to load form options. Please refresh the page.',
      life: 5000
    })
  } finally {
    loading.value = false
  }
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
  // File is stored locally in briefDocument.value, no immediate upload
  console.log('Brief document selected:', result.file?.name)
}

const handleBriefRemoved = () => {
  formData.value.briefDocumentPath = ''
  briefDocument.value = null
}

const validateStep = (step) => {
  errors.value = {}
  let isValid = true

  if (step === 1) {
    // Required fields from backend DTO
    if (!formData.value.name?.trim()) {
      errors.value.name = 'Activation name is required'
      isValid = false
    } else if (formData.value.name.length > 200) {
      errors.value.name = 'Activation name must not exceed 200 characters'
      isValid = false
    }
    
    if (!formData.value.clientId) {
      errors.value.clientId = 'Client ID is required'
      isValid = false
    }
    
    if (!formData.value.status) {
      errors.value.status = 'Status is required'
      isValid = false
    }
    
    if (formData.value.briefDescription && formData.value.briefDescription.length > 2000) {
      errors.value.briefDescription = 'Brief description must not exceed 2000 characters'
      isValid = false
    }
  }

  if (step === 2) {
    // Required schedule fields
    if (!formData.value.startDate) {
      errors.value.startDate = 'Start date is required'
      isValid = false
    }
    if (!formData.value.endDate) {
      errors.value.endDate = 'End date is required'
      isValid = false
    }
    if (!formData.value.startTime) {
      errors.value.startTime = 'Start time is required'
      isValid = false
    }
    if (!formData.value.endTime) {
      errors.value.endTime = 'End time is required'
      isValid = false
    }
    
    // Location validation - either from Places picker or manual entry
    if (!selectedLocation.value && !formData.value.locationName?.trim()) {
      errors.value.location = 'Please select a location using the search or enter a location name'
      isValid = false
    }
    
    if (!formData.value.latitude) {
      errors.value.latitude = 'Latitude is required (select a location from search)'
      isValid = false
    }
    
    if (!formData.value.longitude) {
      errors.value.longitude = 'Longitude is required (select a location from search)'
      isValid = false
    }
    
    // Manual overrides validation
    if (formData.value.locationName && formData.value.locationName.length > 200) {
      errors.value.locationName = 'Location name must not exceed 200 characters'
      isValid = false
    }
    
    // Coordinate range validation (if coordinates exist)
    if (formData.value.latitude && (formData.value.latitude < -90 || formData.value.latitude > 90)) {
      errors.value.latitude = 'Latitude must be between -90 and 90'
      isValid = false
    }
    
    if (formData.value.longitude && (formData.value.longitude < -180 || formData.value.longitude > 180)) {
      errors.value.longitude = 'Longitude must be between -180 and 180'
      isValid = false
    }
    
    // Optional field length validations
    if (formData.value.city && formData.value.city.length > 50) {
      errors.value.city = 'City must not exceed 50 characters'
      isValid = false
    }
    
    if (formData.value.zipCode && formData.value.zipCode.length > 10) {
      errors.value.zipCode = 'Zip code must not exceed 10 characters'
      isValid = false
    }
    
    // Date logic validation
    if (formData.value.startDate && formData.value.endDate) {
      if (formData.value.endDate < formData.value.startDate) {
        errors.value.endDate = 'End date must be after or equal to start date'
        isValid = false
      }
    }
  }

  if (step === 3) {
    // Team assignment validation (optional in backend)
  }

  return isValid
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
  if (!date) return 'Not set'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (time) => {
  if (!time) return 'Not set'
  // If time is already a Date object from Calendar component
  if (time instanceof Date) {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }
  // If time is a string (HH:mm format)
  return time
}

const getClientName = (clientId) => {
  const client = clientOptions.value.find(c => c.value === clientId)
  return client ? client.label : 'Not selected'
}

const getManagerName = (managerId) => {
  if (!managerId) return 'Not assigned'
  const manager = managerOptions.value.find(m => m.value === managerId)
  return manager ? manager.label : 'Unknown Manager'
}


const saveDraft = async () => {
  try {
    // Mock API call to save draft
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.add({
      severity: 'success',
      summary: 'Draft Saved',
      detail: 'Activation draft has been saved',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save draft',
      life: 3000
    })
  }
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

  loading.value = true

  try {
    // Prepare data to match backend DTO
    const activationData = {
      name: formData.value.name,
      clientId: formData.value.clientId,
      startDate: formatDateForAPI(formData.value.startDate),
      endDate: formatDateForAPI(formData.value.endDate),
      startTime: formatTimeForAPI(formData.value.startTime),
      endTime: formatTimeForAPI(formData.value.endTime),
      locationName: formData.value.locationName,
      streetAddress: formData.value.streetAddress,
      city: formData.value.city || null,
      zipCode: formData.value.zipCode || null,
      latitude: formData.value.latitude,
      longitude: formData.value.longitude,
      activationManagerId: formData.value.activationManagerId || null,
      assignedPromoterIds: formData.value.assignedPromoterIds || [],
      briefDescription: formData.value.briefDescription || null,
      status: formData.value.status
    }

    // Get the selected brief document file if any
    const briefDocumentFile = briefDocument.value?.file || null

    // Make API call to create activation with document
    let response
    if (briefDocumentFile) {
      // Use the multipart endpoint if we have a document
      response = await activationService.createActivationWithDocument(activationData, briefDocumentFile)
    } else {
      // Use the regular endpoint if no document
      response = await activationService.createActivation(activationData)
    }

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `${formData.value.name} has been created successfully`,
      life: 3000
    })

    // Navigate to the created activation details page if we have an ID
    if (response && response.id) {
      router.push(`/activations/${response.id}`)
    } else {
      router.push('/activations')
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to create activation',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

// Helper functions for API formatting
const formatDateForAPI = (date) => {
  if (!date) return null
  return date.toISOString().split('T')[0] // Returns YYYY-MM-DD format
}

const formatTimeForAPI = (time) => {
  if (!time) return null
  if (time instanceof Date) {
    return time.toTimeString().slice(0, 5) // Returns HH:mm format
  }
  return time // Assume it's already in HH:mm format
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(() => {
  loadFormOptions()
})
</script>

<style scoped>
.create-activation-page {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 1.5rem;
}

.header-nav {
  margin-bottom: 1rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.page-description {
  color: #6b7280;
  margin: 0;
}

.progress-card {
  margin-bottom: 1.5rem;
}

.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
  flex-wrap: wrap;
  gap: 1rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.step-number {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: #3b82f6;
  color: white;
}

.step.completed .step-number {
  background: #10b981;
  color: white;
}

.step-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  text-align: center;
}

.step.active .step-label {
  color: #3b82f6;
}

.step.completed .step-label {
  color: #10b981;
}

.step-divider {
  width: 3rem;
  height: 2px;
  background: #e5e7eb;
  display: none;
}

.form-card {
  margin-bottom: 1.5rem;
}

.form-card h2 {
  color: #111827;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  align-items: start;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.section-title {
  color: #111827;
  font-size: 1.25rem;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.checkbox-group label {
  margin: 0;
  font-weight: normal;
}

.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.review-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.review-section h3 {
  color: #111827;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.review-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.review-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.review-item.full-width {
  grid-column: 1 / -1;
}

.review-item label {
  font-weight: 600;
  color: #6b7280;
  font-size: 0.875rem;
}

.review-item span {
  color: #111827;
}

.budget-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
}

.budget-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.budget-item:last-child {
  border-bottom: none;
}

.budget-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  font-weight: 600;
  border-top: 2px solid #e5e7eb;
  margin-top: 0.5rem;
}

.budget-remaining {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  font-weight: 600;
  color: #10b981;
}

.budget-remaining.over-budget {
  color: #ef4444;
}

.brief-preview {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 1rem;
  background: #f9fafb;
  max-height: 200px;
  overflow-y: auto;
}

.brief-content {
  line-height: 1.6;
}

.brief-content :deep(h1),
.brief-content :deep(h2),
.brief-content :deep(h3) {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.brief-content :deep(p) {
  margin-bottom: 0.75rem;
}

.brief-content :deep(ul),
.brief-content :deep(ol) {
  margin-left: 1.5rem;
  margin-bottom: 0.75rem;
}

.no-content {
  color: #9ca3af;
  font-style: italic;
}

.document-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #991b1b;
}

.document-preview i {
  font-size: 1.25rem;
}

.actions-card {
  margin-top: 1.5rem;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons-left,
.action-buttons-right {
  display: flex;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .step-divider {
    display: block;
  }

  .progress-steps {
    flex-wrap: nowrap;
    gap: 0;
  }
}

@media (max-width: 768px) {
  .create-activation-page {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .action-buttons-left,
  .action-buttons-right {
    justify-content: center;
  }

  .review-grid {
    grid-template-columns: 1fr;
  }
}
</style>
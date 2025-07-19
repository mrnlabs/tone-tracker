<template>
  <div class="lead-capture-form">
    <Card>
      <template #header>
        <div class="form-header">
          <h3>Capture Lead Information</h3>
          <p>Collect customer data for follow-up activities</p>
        </div>
      </template>
      
      <template #content>
        <form @submit.prevent="submitForm" class="lead-form">
          <!-- Basic Information -->
          <div class="form-section">
            <h4>Personal Information</h4>
            <div class="form-grid">
              <div class="form-field">
                <label for="firstName">First Name *</label>
                <InputText
                  id="firstName"
                  v-model="formData.name"
                  :class="{ 'p-invalid': validationErrors.name }"
                  placeholder="Enter first name"
                />
                <small v-if="validationErrors.name" class="p-error">
                  {{ validationErrors.name }}
                </small>
              </div>
              
              <div class="form-field">
                <label for="lastName">Last Name *</label>
                <InputText
                  id="lastName"
                  v-model="formData.surname"
                  :class="{ 'p-invalid': validationErrors.surname }"
                  placeholder="Enter last name"
                />
                <small v-if="validationErrors.surname" class="p-error">
                  {{ validationErrors.surname }}
                </small>
              </div>
              
              <div class="form-field">
                <label for="phone">Phone Number *</label>
                <InputText
                  id="phone"
                  v-model="formData.phone"
                  :class="{ 'p-invalid': validationErrors.phone }"
                  placeholder="Enter phone number"
                />
                <small v-if="validationErrors.phone" class="p-error">
                  {{ validationErrors.phone }}
                </small>
              </div>
              
              <div class="form-field">
                <label for="email">Email Address *</label>
                <InputText
                  id="email"
                  v-model="formData.email"
                  type="email"
                  :class="{ 'p-invalid': validationErrors.email }"
                  placeholder="Enter email address"
                />
                <small v-if="validationErrors.email" class="p-error">
                  {{ validationErrors.email }}
                </small>
              </div>
            </div>
          </div>

          <!-- Demographics -->
          <div class="form-section">
            <h4>Demographics</h4>
            <div class="form-grid">
              <div class="form-field">
                <label for="gender">Gender</label>
                <Dropdown
                  id="gender"
                  v-model="formData.customerGender"
                  :options="genderOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select gender"
                  showClear
                />
              </div>
              
              <div class="form-field">
                <label for="ageGroup">Age Group</label>
                <Dropdown
                  id="ageGroup"
                  v-model="formData.ageGroup"
                  :options="ageGroupOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select age group"
                  showClear
                />
              </div>
              
              <div class="form-field">
                <label for="customerType">Customer Type</label>
                <Dropdown
                  id="customerType"
                  v-model="formData.customerType"
                  :options="customerTypeOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select customer type"
                  showClear
                />
              </div>
            </div>
          </div>

          <!-- Contact Preferences -->
          <div class="form-section">
            <h4>Contact Preferences</h4>
            <div class="form-grid">
              <div class="form-field checkbox-field">
                <Checkbox
                  id="optedIn"
                  v-model="formData.optedIn"
                  :binary="true"
                />
                <label for="optedIn">Opt-in for marketing communications</label>
              </div>
              
              <div class="form-field checkbox-field">
                <Checkbox
                  id="whatsAppOptedIn"
                  v-model="formData.whatsAppOptedIn"
                  :binary="true"
                />
                <label for="whatsAppOptedIn">Opt-in for WhatsApp communications</label>
              </div>
            </div>
          </div>

          <!-- Purchase Information -->
          <div class="form-section">
            <h4>Purchase Information</h4>
            <div class="form-grid">
              <div class="form-field">
                <label for="repeatPurchase">Repeat Purchase Intent</label>
                <Dropdown
                  id="repeatPurchase"
                  v-model="formData.repeatPurchaseIntent"
                  :options="repeatPurchaseOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select intent"
                  showClear
                />
              </div>
              
              <div class="form-field">
                <label for="address">Address</label>
                <Textarea
                  id="address"
                  v-model="formData.address"
                  :class="{ 'p-invalid': validationErrors.address }"
                  placeholder="Enter address (optional)"
                  rows="2"
                />
                <small v-if="validationErrors.address" class="p-error">
                  {{ validationErrors.address }}
                </small>
              </div>
            </div>
          </div>

          <!-- Customer Feedback -->
          <div class="form-section">
            <h4>Additional Information</h4>
            <div class="form-field">
              <label for="feedback">Customer Feedback</label>
              <Textarea
                id="feedback"
                v-model="formData.customerFeedback"
                :class="{ 'p-invalid': validationErrors.customerFeedback }"
                placeholder="Enter any additional feedback or notes"
                rows="3"
              />
              <small v-if="validationErrors.customerFeedback" class="p-error">
                {{ validationErrors.customerFeedback }}
              </small>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <BaseButton
              type="button"
              variant="secondary"
              @click="resetForm"
            >
              Reset
            </BaseButton>
            <BaseButton
              type="submit"
              variant="primary"
              :loading="isSubmitting"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Saving...' : 'Capture Lead' }}
            </BaseButton>
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToaster } from '@/composables/useToaster'
import { useActivationStore } from '@/stores/activation'
import leadService from '@/services/leadService'
import {
  LEAD_GENDERS,
  LEAD_GENDER_LABELS,
  LEAD_AGE_GROUPS,
  LEAD_AGE_GROUP_LABELS,
  LEAD_CUSTOMER_TYPES,
  LEAD_CUSTOMER_TYPE_LABELS,
  LEAD_REPEAT_PURCHASE_INTENT,
  LEAD_REPEAT_PURCHASE_LABELS
} from '@/utils/constants'
import { BaseButton } from '@/components'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'

// Props
const props = defineProps({
  activationId: {
    type: [Number, String],
    default: null
  },
  initialData: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['lead-captured', 'form-reset'])

// Reactive data
const isSubmitting = ref(false)
const validationErrors = ref({})

// Form data
const formData = ref({
  name: '',
  surname: '',
  phone: '',
  email: '',
  address: '',
  customerGender: null,
  ageGroup: null,
  customerType: null,
  repeatPurchaseIntent: null,
  optedIn: false,
  whatsAppOptedIn: false,
  customerFeedback: '',
  activationId: props.activationId
})

// Stores
const activationStore = useActivationStore()
const toaster = useToaster()

// Computed options
const genderOptions = computed(() => {
  return Object.entries(LEAD_GENDER_LABELS).map(([key, label]) => ({
    value: LEAD_GENDERS[key],
    label
  }))
})

const ageGroupOptions = computed(() => {
  return Object.entries(LEAD_AGE_GROUP_LABELS).map(([key, label]) => ({
    value: LEAD_AGE_GROUPS[key],
    label
  }))
})

const customerTypeOptions = computed(() => {
  return Object.entries(LEAD_CUSTOMER_TYPE_LABELS).map(([key, label]) => ({
    value: LEAD_CUSTOMER_TYPES[key],
    label
  }))
})

const repeatPurchaseOptions = computed(() => {
  return Object.entries(LEAD_REPEAT_PURCHASE_LABELS).map(([key, label]) => ({
    value: LEAD_REPEAT_PURCHASE_INTENT[key],
    label
  }))
})

// Methods
const validateForm = () => {
  const validation = leadService.validateLeadData(formData.value)
  validationErrors.value = validation.errors
  return validation.isValid
}

const submitForm = async () => {
  if (!validateForm()) {
    toaster.error('Please fix the validation errors before submitting')
    return
  }

  isSubmitting.value = true
  
  try {
    // Prepare form data
    const leadData = {
      ...formData.value,
      activationId: props.activationId || formData.value.activationId
    }

    console.log('Attempting to create lead with data:', leadData)
    console.log('Activation ID:', leadData.activationId)

    // Create the lead
    const createdLead = await leadService.createLead(leadData)
    
    toaster.success('Lead captured successfully!')
    
    // Emit success event
    emit('lead-captured', createdLead)
    
    // Reset form
    resetForm()
    
  } catch (error) {
    console.error('Error capturing lead:', error)
    console.error('Error details:', {
      status: error.status,
      message: error.message,
      details: error.details,
      response: error.response
    })
    
    // Handle specific error cases
    if (error.status === 403 || (error.response && error.response.status === 403)) {
      toaster.error('Access denied. You do not have permission to capture leads.')
    } else if (error.status === 401 || (error.response && error.response.status === 401)) {
      toaster.error('Authentication required. Please log in again.')
    } else if (error.status === 400 && error.details?.fieldErrors) {
      // Backend validation errors
      validationErrors.value = error.details.fieldErrors
      toaster.error('Please correct the highlighted fields')
    } else {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to capture lead. Please try again.'
      toaster.error(errorMessage)
    }
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    surname: '',
    phone: '',
    email: '',
    address: '',
    customerGender: null,
    ageGroup: null,
    customerType: null,
    repeatPurchaseIntent: null,
    optedIn: false,
    whatsAppOptedIn: false,
    customerFeedback: '',
    activationId: props.activationId
  }
  
  validationErrors.value = {}
  emit('form-reset')
}

const populateFormData = (data) => {
  Object.keys(formData.value).forEach(key => {
    if (data[key] !== undefined) {
      formData.value[key] = data[key]
    }
  })
}

// Lifecycle
onMounted(() => {
  if (props.initialData && Object.keys(props.initialData).length > 0) {
    populateFormData(props.initialData)
  }
})

// Expose methods for parent components
defineExpose({
  resetForm,
  populateFormData,
  validateForm
})
</script>

<style lang="scss" scoped>
.lead-capture-form {
  max-width: 800px;
  margin: 0 auto;
  
  .form-header {
    padding: 1rem 1rem 0 1rem;
    
    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin: 0 0 0.5rem 0;
    }
    
    p {
      color: #6b7280;
      margin: 0;
      font-size: 0.875rem;
    }
  }
  
  .lead-form {
    .form-section {
      margin-bottom: 2rem;
      
      h4 {
        font-size: 1rem;
        font-weight: 600;
        color: #374151;
        margin: 0 0 1rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
      }
      
      .form-field {
        display: flex;
        flex-direction: column;
        
        label {
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }
        
        .p-inputtext,
        .p-dropdown,
        .p-inputtextarea {
          width: 100%;
        }
        
        .p-error {
          margin-top: 0.25rem;
          font-size: 0.75rem;
        }
        
        &.checkbox-field {
          flex-direction: row;
          align-items: center;
          gap: 0.5rem;
          
          label {
            margin-bottom: 0;
            font-weight: normal;
            cursor: pointer;
          }
        }
      }
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
      margin-top: 2rem;
    }
  }
}

@media (max-width: 768px) {
  .lead-capture-form {
    .lead-form .form-section .form-grid {
      grid-template-columns: 1fr;
    }
    
    .form-actions {
      flex-direction: column-reverse;
      
      .base-button {
        width: 100%;
      }
    }
  }
}
</style>
<template>
  <div class="lead-capture-form">
    <Card>
      <template #header>
        <div class="form-header">
          <h3>{{ props.editMode ? 'Edit Lead Information' : 'Capture Lead Information' }}</h3>
          <p>{{ props.editMode ? 'Update customer data' : 'Collect customer data for follow-up activities' }}</p>
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
                  id="optIn"
                  v-model="formData.optIn"
                  :binary="true"
                />
                <label for="optIn">Opt-in for marketing communications</label>
              </div>
              
              <div class="form-field checkbox-field">
                <Checkbox
                  id="whatsappOptIn"
                  v-model="formData.whatsappOptIn"
                  :binary="true"
                />
                <label for="whatsappOptIn">Opt-in for WhatsApp communications</label>
              </div>
            </div>
          </div>

          <!-- Product Awareness -->
          <div class="form-section">
            <h4>Product & Brand Awareness</h4>
            <div class="form-grid">
              <div class="form-field checkbox-field">
                <Checkbox
                  id="productAwareness"
                  v-model="formData.productAwareness"
                  :binary="true"
                />
                <label for="productAwareness">Customer is aware of our product</label>
              </div>
              
              <div class="form-field">
                <label for="brandAwareness">Brand Awareness Level</label>
                <Dropdown
                  id="brandAwareness"
                  v-model="formData.brandAwarenessLevel"
                  :options="brandAwarenessOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select awareness level"
                  showClear
                />
              </div>
              
              <div class="form-field full-width">
                <label for="brandAwarenessComments">Brand Awareness Comments</label>
                <Textarea
                  id="brandAwarenessComments"
                  v-model="formData.brandAwarenessComments"
                  placeholder="Additional comments about brand awareness"
                  rows="2"
                />
              </div>
            </div>
          </div>

          <!-- Purchase Intent -->
          <div class="form-section">
            <h4>Purchase Intent</h4>
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
                <label for="purchaseIntentLevel">Purchase Intent Level</label>
                <Dropdown
                  id="purchaseIntentLevel"
                  v-model="formData.purchaseIntentLevel"
                  :options="purchaseIntentOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select purchase intent"
                  showClear
                />
              </div>
              
              <div class="form-field">
                <label for="priceSensitivity">Price Sensitivity</label>
                <InputText
                  id="priceSensitivity"
                  v-model="formData.priceSensitivity"
                  placeholder="e.g., Very sensitive, Budget-conscious"
                />
              </div>
              
              <div class="form-field full-width">
                <label for="purchaseIntentComments">Purchase Intent Comments</label>
                <Textarea
                  id="purchaseIntentComments"
                  v-model="formData.purchaseIntentComments"
                  placeholder="Additional comments about purchase intent"
                  rows="2"
                />
              </div>
            </div>
          </div>

          <!-- Address Information -->
          <div class="form-section">
            <h4>Contact Details</h4>
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

          <!-- Additional Insights -->
          <div class="form-section">
            <h4>Additional Insights</h4>
            <div class="form-grid">
              <div class="form-field full-width">
                <label for="feedback">Customer Feedback</label>
                <Textarea
                  id="feedback"
                  v-model="formData.customerFeedback"
                  :class="{ 'p-invalid': validationErrors.customerFeedback }"
                  placeholder="General feedback from customer"
                  rows="2"
                />
                <small v-if="validationErrors.customerFeedback" class="p-error">
                  {{ validationErrors.customerFeedback }}
                </small>
              </div>
              
              <div class="form-field">
                <label for="competitorMentions">Competitor Mentions</label>
                <InputText
                  id="competitorMentions"
                  v-model="formData.competitorMentions"
                  placeholder="e.g., Currently uses Brand X"
                />
              </div>
              
              <div class="form-field">
                <label for="usageContext">Usage Context</label>
                <InputText
                  id="usageContext"
                  v-model="formData.usageContext"
                  placeholder="How/when would they use product"
                />
              </div>
              
              <div class="form-field">
                <label for="decisionMakerStatus">Decision Maker Status</label>
                <InputText
                  id="decisionMakerStatus"
                  v-model="formData.decisionMakerStatus"
                  placeholder="e.g., Primary decision maker"
                />
              </div>
              
              <div class="form-field">
                <label for="engagementQuality">Engagement Quality</label>
                <Dropdown
                  id="engagementQuality"
                  v-model="formData.engagementQuality"
                  :options="engagementQualityOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select engagement quality"
                  showClear
                />
              </div>
              
              <div class="form-field full-width">
                <label for="promoterObservations">Promoter Observations</label>
                <Textarea
                  id="promoterObservations"
                  v-model="formData.promoterObservations"
                  placeholder="Your observations about the interaction"
                  rows="2"
                />
              </div>
            </div>
          </div>

          <!-- Follow-up Information -->
          <div class="form-section">
            <h4>Follow-up</h4>
            <div class="form-grid">
              <div class="form-field checkbox-field">
                <Checkbox
                  id="followUpRequired"
                  v-model="formData.followUpRequired"
                  :binary="true"
                />
                <label for="followUpRequired">Follow-up required</label>
              </div>
              
              <div class="form-field full-width" v-if="formData.followUpRequired">
                <label for="followUpNotes">Follow-up Notes</label>
                <Textarea
                  id="followUpNotes"
                  v-model="formData.followUpNotes"
                  placeholder="Notes for follow-up"
                  rows="2"
                />
              </div>
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
              {{ isSubmitting ? 'Saving...' : (props.editMode ? 'Update Lead' : 'Capture Lead') }}
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
  LEAD_REPEAT_PURCHASE_LABELS,
  LEAD_BRAND_AWARENESS_LEVELS,
  LEAD_BRAND_AWARENESS_LABELS,
  LEAD_PURCHASE_INTENT_LEVELS,
  LEAD_PURCHASE_INTENT_LABELS,
  LEAD_ENGAGEMENT_QUALITY_LEVELS,
  LEAD_ENGAGEMENT_QUALITY_LABELS
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
  },
  editMode: {
    type: Boolean,
    default: false
  },
  leadId: {
    type: [Number, String],
    default: null
  }
})

// Emits
const emit = defineEmits(['lead-captured', 'lead-updated', 'form-reset'])

// Reactive data
const isSubmitting = ref(false)
const validationErrors = ref({})

// Form data
const formData = ref({
  // Basic Contact Information
  name: '',
  surname: '',
  phone: '',
  email: '',
  address: '',
  
  // Opt-in Preferences
  optIn: false,
  whatsappOptIn: false,
  
  // Customer Demographics
  customerGender: null,
  ageGroup: null,
  customerType: null,
  
  // Product Awareness
  productAwareness: false,
  brandAwarenessLevel: null,
  brandAwarenessComments: '',
  
  // Purchase Intent
  repeatPurchaseIntent: null,
  purchaseIntentLevel: null,
  purchaseIntentComments: '',
  priceSensitivity: '',
  
  // Additional Insights
  customerFeedback: '',
  competitorMentions: '',
  usageContext: '',
  decisionMakerStatus: '',
  engagementQuality: null,
  promoterObservations: '',
  
  // Follow-up
  followUpRequired: false,
  followUpNotes: '',
  
  // Required Association
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

const brandAwarenessOptions = computed(() => {
  return Object.entries(LEAD_BRAND_AWARENESS_LABELS).map(([key, label]) => ({
    value: LEAD_BRAND_AWARENESS_LEVELS[key],
    label
  }))
})

const purchaseIntentOptions = computed(() => {
  return Object.entries(LEAD_PURCHASE_INTENT_LABELS).map(([key, label]) => ({
    value: LEAD_PURCHASE_INTENT_LEVELS[key],
    label
  }))
})

const engagementQualityOptions = computed(() => {
  return Object.entries(LEAD_ENGAGEMENT_QUALITY_LABELS).map(([key, label]) => ({
    value: LEAD_ENGAGEMENT_QUALITY_LEVELS[key],
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

    let result
    if (props.editMode && props.leadId) {
      // Update existing lead
      console.log('Attempting to update lead:', props.leadId)
      result = await leadService.updateLead(props.leadId, leadData)
      toaster.success('Lead updated successfully!')
      emit('lead-updated', result)
    } else {
      // Create new lead
      console.log('Attempting to create lead with data:', leadData)
      console.log('Activation ID:', leadData.activationId)
      result = await leadService.createLead(leadData)
      toaster.success('Lead captured successfully!')
      emit('lead-captured', result)
      // Reset form only for new leads
      resetForm()
    }
    
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
    // Basic Contact Information
    name: '',
    surname: '',
    phone: '',
    email: '',
    address: '',
    
    // Opt-in Preferences
    optIn: false,
    whatsappOptIn: false,
    
    // Customer Demographics
    customerGender: null,
    ageGroup: null,
    customerType: null,
    
    // Product Awareness
    productAwareness: false,
    brandAwarenessLevel: null,
    brandAwarenessComments: '',
    
    // Purchase Intent
    repeatPurchaseIntent: null,
    purchaseIntentLevel: null,
    purchaseIntentComments: '',
    priceSensitivity: '',
    
    // Additional Insights
    customerFeedback: '',
    competitorMentions: '',
    usageContext: '',
    decisionMakerStatus: '',
    engagementQuality: null,
    promoterObservations: '',
    
    // Follow-up
    followUpRequired: false,
    followUpNotes: '',
    
    // Required Association
    activationId: props.activationId
  }
  
  validationErrors.value = {}
  emit('form-reset')
}

const populateFormData = (data) => {
  Object.keys(formData.value).forEach(key => {
    if (data[key] !== undefined) {
      // Handle boolean fields that come as null from backend
      if ((key === 'optIn' || key === 'whatsappOptIn' || key === 'productAwareness' || key === 'followUpRequired') && data[key] === null) {
        formData.value[key] = false
      } else {
        formData.value[key] = data[key]
      }
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
        
        &.full-width {
          grid-column: 1 / -1;
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
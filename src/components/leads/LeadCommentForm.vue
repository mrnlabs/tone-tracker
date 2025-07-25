<template>
  <Card class="lead-comment-form">
    <template #header>
      <div class="form-header">
        <div class="lead-info">
          <i class="pi pi-user"></i>
          <div>
            <h3>{{ leadData.name }} {{ leadData.surname }}</h3>
            <p>{{ leadData.email }} • {{ leadData.phone }}</p>
          </div>
        </div>
        <Tag :value="getEngagementLabel()" :severity="getEngagementSeverity()" />
      </div>
    </template>

    <template #content>
      <form @submit.prevent="handleSubmit" class="comment-form">
        <!-- Brand Awareness Section -->
        <div class="form-section">
          <div class="section-header">
            <i class="pi pi-eye section-icon"></i>
            <h4>Brand Awareness</h4>
          </div>
          
          <div class="form-grid">
            <div class="field">
              <label for="brandAwarenessLevel">Awareness Level *</label>
              <div class="rating-field">
                <Rating 
                  id="brandAwarenessLevel"
                  v-model="formData.brandAwarenessLevel" 
                  :stars="5"
                  :cancel="false"
                  :class="{ 'p-invalid': errors.brandAwarenessLevel }"
                />
                <small class="rating-label">
                  {{ getBrandAwarenessLabel(formData.brandAwarenessLevel) }}
                </small>
              </div>
              <small class="p-error">{{ errors.brandAwarenessLevel }}</small>
            </div>
            
            <div class="field full-width">
              <label for="brandAwarenessComments">Brand Perception Comments</label>
              <Textarea 
                id="brandAwarenessComments"
                v-model="formData.brandAwarenessComments"
                rows="3"
                placeholder="Customer's perception of the brand, familiarity with products..."
                :maxlength="1000"
                :class="{ 'p-invalid': errors.brandAwarenessComments }"
              />
              <small class="char-count">{{ (formData.brandAwarenessComments || '').length }}/1000</small>
              <small class="p-error">{{ errors.brandAwarenessComments }}</small>
            </div>
          </div>
        </div>

        <!-- Purchase Intent Section -->
        <div class="form-section">
          <div class="section-header">
            <i class="pi pi-shopping-cart section-icon"></i>
            <h4>Purchase Intent</h4>
          </div>
          
          <div class="form-grid">
            <div class="field">
              <label for="purchaseIntentLevel">Purchase Intent Level *</label>
              <div class="rating-field">
                <Rating 
                  id="purchaseIntentLevel"
                  v-model="formData.purchaseIntentLevel" 
                  :stars="5"
                  :cancel="false"
                  :class="{ 'p-invalid': errors.purchaseIntentLevel }"
                />
                <small class="rating-label">
                  {{ getPurchaseIntentLabel(formData.purchaseIntentLevel) }}
                </small>
              </div>
              <small class="p-error">{{ errors.purchaseIntentLevel }}</small>
            </div>
            
            <div class="field full-width">
              <label for="purchaseIntentComments">Purchase Intent Comments</label>
              <Textarea 
                id="purchaseIntentComments"
                v-model="formData.purchaseIntentComments"
                rows="3"
                placeholder="Likelihood to purchase, timeline, specific interest areas..."
                :maxlength="1000"
                :class="{ 'p-invalid': errors.purchaseIntentComments }"
              />
              <small class="char-count">{{ (formData.purchaseIntentComments || '').length }}/1000</small>
              <small class="p-error">{{ errors.purchaseIntentComments }}</small>
            </div>
          </div>
        </div>

        <!-- Market Intelligence Section -->
        <div class="form-section">
          <div class="section-header">
            <i class="pi pi-chart-line section-icon"></i>
            <h4>Market Intelligence</h4>
          </div>
          
          <div class="form-grid">
            <div class="field">
              <label for="priceSensitivity">Price Sensitivity</label>
              <Textarea 
                id="priceSensitivity"
                v-model="formData.priceSensitivity"
                rows="2"
                placeholder="Budget constraints, price concerns, spending capacity..."
                :maxlength="1000"
                :class="{ 'p-invalid': errors.priceSensitivity }"
              />
              <small class="char-count">{{ (formData.priceSensitivity || '').length }}/1000</small>
              <small class="p-error">{{ errors.priceSensitivity }}</small>
            </div>
            
            <div class="field">
              <label for="competitorMentions">Competitor Mentions</label>
              <Textarea 
                id="competitorMentions"
                v-model="formData.competitorMentions"
                rows="2"
                placeholder="Which competitors were mentioned, current solutions they use..."
                :maxlength="1000"
                :class="{ 'p-invalid': errors.competitorMentions }"
              />
              <small class="char-count">{{ (formData.competitorMentions || '').length }}/1000</small>
              <small class="p-error">{{ errors.competitorMentions }}</small>
            </div>
            
            <div class="field">
              <label for="usageContext">Usage Context</label>
              <Textarea 
                id="usageContext"
                v-model="formData.usageContext"
                rows="2"
                placeholder="How/when they would use the product, specific use cases..."
                :maxlength="1000"
                :class="{ 'p-invalid': errors.usageContext }"
              />
              <small class="char-count">{{ (formData.usageContext || '').length }}/1000</small>
              <small class="p-error">{{ errors.usageContext }}</small>
            </div>
            
            <div class="field">
              <label for="decisionMakerStatus">Decision Maker Status</label>
              <Textarea 
                id="decisionMakerStatus"
                v-model="formData.decisionMakerStatus"
                rows="2"
                placeholder="Are they the decision maker? Who else is involved in decisions?"
                :maxlength="500"
                :class="{ 'p-invalid': errors.decisionMakerStatus }"
              />
              <small class="char-count">{{ (formData.decisionMakerStatus || '').length }}/500</small>
              <small class="p-error">{{ errors.decisionMakerStatus }}</small>
            </div>
          </div>
        </div>

        <!-- Follow-up Management Section -->
        <div class="form-section">
          <div class="section-header">
            <i class="pi pi-calendar section-icon"></i>
            <h4>Follow-up Management</h4>
          </div>
          
          <div class="form-grid">
            <div class="field checkbox-field">
              <Checkbox 
                id="followUpRequired"
                v-model="formData.followUpRequired" 
                :binary="true"
              />
              <label for="followUpRequired">Follow-up Required</label>
            </div>
            
            <div class="field full-width" v-if="formData.followUpRequired">
              <label for="followUpNotes">Follow-up Notes *</label>
              <Textarea 
                id="followUpNotes"
                v-model="formData.followUpNotes"
                rows="3"
                placeholder="Specific follow-up actions needed, timeline, key points to address..."
                :maxlength="1000"
                :class="{ 'p-invalid': errors.followUpNotes }"
              />
              <small class="char-count">{{ (formData.followUpNotes || '').length }}/1000</small>
              <small class="p-error">{{ errors.followUpNotes }}</small>
            </div>
          </div>
        </div>

        <!-- Engagement Quality Section -->
        <div class="form-section">
          <div class="section-header">
            <i class="pi pi-heart section-icon"></i>
            <h4>Engagement Quality</h4>
          </div>
          
          <div class="form-grid">
            <div class="field">
              <label for="engagementQuality">Interaction Quality *</label>
              <div class="rating-field">
                <Rating 
                  id="engagementQuality"
                  v-model="formData.engagementQuality" 
                  :stars="5"
                  :cancel="false"
                  :class="{ 'p-invalid': errors.engagementQuality }"
                />
                <small class="rating-label">
                  {{ getEngagementQualityLabel(formData.engagementQuality) }}
                </small>
              </div>
              <small class="p-error">{{ errors.engagementQuality }}</small>
            </div>
            
            <div class="field full-width">
              <label for="promoterObservations">General Observations</label>
              <Textarea 
                id="promoterObservations"
                v-model="formData.promoterObservations"
                rows="4"
                placeholder="Overall assessment, potential opportunities, concerns, additional insights..."
                :maxlength="2000"
                :class="{ 'p-invalid': errors.promoterObservations }"
              />
              <small class="char-count">{{ (formData.promoterObservations || '').length }}/2000</small>
              <small class="p-error">{{ errors.promoterObservations }}</small>
            </div>
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <div class="form-actions">
        <Button 
          label="Cancel" 
          icon="pi pi-times" 
          class="p-button-outlined" 
          @click="handleCancel"
          :disabled="loading"
        />
        <Button 
          label="Save Comments" 
          icon="pi pi-check" 
          @click="handleSubmit"
          :loading="loading"
          :disabled="!isFormValid"
        />
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Rating from 'primevue/rating'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import Tag from 'primevue/tag'
import leadService from '@/services/leadService'

// Props
const props = defineProps({
  leadData: {
    type: Object,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'success'])

// Composables
const toast = useToast()

// Reactive data
const loading = ref(false)
const errors = ref({})

const formData = ref({
  brandAwarenessLevel: null,
  brandAwarenessComments: '',
  purchaseIntentLevel: null,
  purchaseIntentComments: '',
  priceSensitivity: '',
  competitorMentions: '',
  usageContext: '',
  decisionMakerStatus: '',
  followUpRequired: false,
  followUpNotes: '',
  engagementQuality: null,
  promoterObservations: ''
})

// Computed properties
const isFormValid = computed(() => {
  return formData.value.brandAwarenessLevel && 
         formData.value.purchaseIntentLevel && 
         formData.value.engagementQuality &&
         (!formData.value.followUpRequired || formData.value.followUpNotes.trim())
})

// Methods
const getBrandAwarenessLabel = (level) => {
  if (!level) return 'Select level'
  return leadService.getBrandAwarenessLevelLabel(level)
}

const getPurchaseIntentLabel = (level) => {
  if (!level) return 'Select level'
  return leadService.getPurchaseIntentLevelLabel(level)
}

const getEngagementQualityLabel = (level) => {
  if (!level) return 'Select level'
  return leadService.getEngagementQualityLabel(level)
}

const getEngagementLabel = () => {
  if (!formData.value.engagementQuality) return 'Not Rated'
  return getEngagementQualityLabel(formData.value.engagementQuality)
}

const getEngagementSeverity = () => {
  const level = formData.value.engagementQuality
  if (!level) return 'secondary'
  if (level >= 4) return 'success'
  if (level >= 3) return 'warning'
  return 'danger'
}

const validateForm = () => {
  const validation = leadService.validatePromoterComment(formData.value)
  errors.value = validation.errors
  
  // Additional required field validations
  if (!formData.value.brandAwarenessLevel) {
    errors.value.brandAwarenessLevel = 'Brand awareness level is required'
  }
  
  if (!formData.value.purchaseIntentLevel) {
    errors.value.purchaseIntentLevel = 'Purchase intent level is required'
  }
  
  if (!formData.value.engagementQuality) {
    errors.value.engagementQuality = 'Engagement quality rating is required'
  }
  
  if (formData.value.followUpRequired && !formData.value.followUpNotes.trim()) {
    errors.value.followUpNotes = 'Follow-up notes are required when follow-up is needed'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    toast.add({
      severity: 'warn',
      summary: 'Validation Error',
      detail: 'Please correct the errors below',
      life: 3000
    })
    return
  }

  loading.value = true
  try {
    await leadService.addPromoterComment(props.leadData.id, formData.value)
    
    toast.add({
      severity: 'success',
      summary: 'Comments Saved',
      detail: 'Lead insights have been successfully recorded',
      life: 3000
    })
    
    emit('success', { leadId: props.leadData.id, comments: formData.value })
  } catch (error) {
    console.error('Error saving lead comments:', error)
    toast.add({
      severity: 'error',
      summary: 'Save Failed',
      detail: error.message || 'Failed to save lead comments',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  emit('close')
}

const initializeForm = () => {
  // Pre-populate form with existing data if available
  if (props.leadData.promoterComments) {
    const comments = props.leadData.promoterComments
    formData.value = {
      brandAwarenessLevel: comments.brandAwarenessLevel || null,
      brandAwarenessComments: comments.brandAwarenessComments || '',
      purchaseIntentLevel: comments.purchaseIntentLevel || null,
      purchaseIntentComments: comments.purchaseIntentComments || '',
      priceSensitivity: comments.priceSensitivity || '',
      competitorMentions: comments.competitorMentions || '',
      usageContext: comments.usageContext || '',
      decisionMakerStatus: comments.decisionMakerStatus || '',
      followUpRequired: comments.followUpRequired || false,
      followUpNotes: comments.followUpNotes || '',
      engagementQuality: comments.engagementQuality || null,
      promoterObservations: comments.promoterObservations || ''
    }
  }
}

// Lifecycle
onMounted(() => {
  initializeForm()
})
</script>

<style scoped>
.lead-comment-form {
  max-width: 800px;
  width: 100%;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  border-radius: 0.375rem 0.375rem 0 0;
}

.lead-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.lead-info i {
  font-size: 2rem;
  color: #6c757d;
  padding: 0.75rem;
  background: white;
  border-radius: 50%;
  border: 2px solid #e9ecef;
}

.lead-info h3 {
  margin: 0;
  color: #212529;
  font-size: 1.25rem;
  font-weight: 600;
}

.lead-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.875rem;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e9ecef;
}

.section-icon {
  color: #495057;
  font-size: 1.25rem;
}

.section-header h4 {
  margin: 0;
  color: #495057;
  font-size: 1.1rem;
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field.full-width {
  grid-column: 1 / -1;
}

.field.checkbox-field {
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.field.checkbox-field label {
  margin: 0;
  font-weight: 500;
}

.field label {
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
}

.rating-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rating-label {
  color: #6c757d;
  font-size: 0.8rem;
  font-style: italic;
}

.char-count {
  color: #6c757d;
  font-size: 0.75rem;
  text-align: right;
}

.p-error {
  color: #dc3545;
  font-size: 0.8rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

/* Rating customization */
:deep(.p-rating) {
  gap: 0.25rem;
}

:deep(.p-rating .p-rating-icon) {
  font-size: 1.5rem;
  color: #ffc107;
}

:deep(.p-rating .p-rating-icon.pi-star-fill) {
  color: #ffc107;
}

:deep(.p-rating .p-rating-icon:not(.pi-star-fill)) {
  color: #e9ecef;
}

/* Textarea customization */
:deep(.p-inputtextarea) {
  resize: vertical;
  min-height: 80px;
}

/* Responsive design */
@media (max-width: 768px) {
  .form-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    text-align: center;
  }
  
  .lead-info {
    justify-content: center;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
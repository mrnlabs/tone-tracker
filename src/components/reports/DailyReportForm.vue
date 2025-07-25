<template>
  <div class="daily-report-form">
    <Card class="form-header-card">
      <template #content>
        <div class="form-header">
          <div class="header-info">
            <i class="pi pi-file-edit header-icon"></i>
            <div>
              <h2>{{ isEdit ? 'Edit Daily Report' : 'Create Daily Report' }}</h2>
              <p>{{ selectedActivation?.name || 'Activation Manager Daily Report' }}</p>
            </div>
          </div>
          <div class="header-meta" v-if="formData.reportDate">
            <Tag 
              :value="formatDate(formData.reportDate)" 
              severity="info" 
              class="date-tag"
            />
          </div>
        </div>
      </template>
    </Card>

    <form @submit.prevent="handleSubmit" class="report-form">
      <!-- Basic Information -->
      <Card class="form-section">
        <template #header>
          <div class="section-header">
            <i class="pi pi-info-circle section-icon"></i>
            <h3>Basic Information</h3>
          </div>
        </template>
        
        <template #content>
          <div class="basic-info-grid">
            <div class="field">
              <label for="activation">Activation *</label>
              <Dropdown
                id="activation"
                v-model="formData.activationId"
                :options="availableActivations"
                optionLabel="name"
                optionValue="id"
                placeholder="Select activation"
                filter
                :loading="loadingActivations"
                :class="{ 'p-invalid': errors.activationId }"
                @change="onActivationChange"
              />
              <small class="p-error">{{ errors.activationId }}</small>
            </div>
            
            <div class="field">
              <label for="reportDate">Report Date *</label>
              <Calendar
                id="reportDate"
                v-model="formData.reportDate"
                dateFormat="yy-mm-dd"
                :maxDate="maxDate"
                placeholder="Select report date"
                :class="{ 'p-invalid': errors.reportDate }"
              />
              <small class="p-error">{{ errors.reportDate }}</small>
            </div>
            
            <div class="field">
              <label for="totalAttendance">Total Attendance</label>
              <InputNumber
                id="totalAttendance"
                v-model="formData.totalAttendance"
                :min="0"
                placeholder="Number of attendees"
                :class="{ 'p-invalid': errors.totalAttendance }"
              />
              <small class="p-error">{{ errors.totalAttendance }}</small>
            </div>
            
            <div class="field">
              <label for="totalSales">Total Sales</label>
              <InputNumber
                id="totalSales"
                v-model="formData.totalSales"
                mode="currency"
                currency="USD"
                locale="en-US"
                :min="0"
                placeholder="Total sales amount"
                :class="{ 'p-invalid': errors.totalSales }"
              />
              <small class="p-error">{{ errors.totalSales }}</small>
            </div>
          </div>
        </template>
      </Card>

      <!-- Consumer Behavior Section -->
      <ConsumerBehaviorSection
        v-model="consumerBehaviorData"
        :activationId="formData.activationId"
        :errors="errors"
      />

      <!-- Additional Notes -->
      <Card class="form-section">
        <template #header>
          <div class="section-header">
            <i class="pi pi-comment section-icon"></i>
            <h3>Additional Notes</h3>
          </div>
        </template>
        
        <template #content>
          <div class="notes-grid">
            <div class="field">
              <label for="generalNotes">General Notes</label>
              <Textarea
                id="generalNotes"
                v-model="formData.generalNotes"
                rows="4"
                placeholder="Any additional observations or notes about the day..."
                :maxlength="2000"
                :class="{ 'p-invalid': errors.generalNotes }"
              />
              <small class="char-count">{{ (formData.generalNotes || '').length }}/2000</small>
              <small class="p-error">{{ errors.generalNotes }}</small>
            </div>
            
            <div class="field">
              <label for="challenges">Challenges Faced</label>
              <Textarea
                id="challenges"
                v-model="formData.challengesFaced"
                rows="4"
                placeholder="Any challenges or issues encountered during the activation..."
                :maxlength="2000"
                :class="{ 'p-invalid': errors.challengesFaced }"
              />
              <small class="char-count">{{ (formData.challengesFaced || '').length }}/2000</small>
              <small class="p-error">{{ errors.challengesFaced }}</small>
            </div>
          </div>
        </template>
      </Card>

      <!-- Form Actions -->
      <Card class="form-actions-card">
        <template #content>
          <div class="form-actions">
            <Button
              type="button"
              label="Cancel"
              icon="pi pi-times"
              class="p-button-outlined cancel-btn"
              @click="handleCancel"
              :disabled="saving"
            />
            <Button
              type="button"
              label="Save as Draft"
              icon="pi pi-save"
              class="p-button-outlined draft-btn"
              @click="handleSaveDraft"
              :loading="savingDraft"
              :disabled="saving"
            />
            <Button
              type="submit"
              label="Submit Report"
              icon="pi pi-check"
              class="submit-btn"
              :loading="saving"
              :disabled="!isFormValid || savingDraft"
            />
          </div>
        </template>
      </Card>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Tag from 'primevue/tag'
import ConsumerBehaviorSection from './ConsumerBehaviorSection.vue'
import reportService from '@/services/reportService'
import { useActivationStore } from '@/stores/activation'

// Props
const props = defineProps({
  reportId: {
    type: Number,
    default: null
  }
})

// Composables
const route = useRoute()
const router = useRouter()
const toast = useToast()
const activationStore = useActivationStore()

// Reactive data
const saving = ref(false)
const savingDraft = ref(false)
const loadingActivations = ref(false)
const availableActivations = ref([])
const errors = ref({})

const formData = ref({
  activationId: null,
  reportDate: new Date(),
  totalAttendance: null,
  totalSales: null,
  generalNotes: '',
  challengesFaced: '',
  status: 'DRAFT'
})

const consumerBehaviorData = ref({
  // Top SKU data
  topPurchasedSkuId: null,
  topSkuUnitsSold: null,
  topSkuRevenue: null,
  secondTopSkuId: null,
  thirdTopSkuId: null,
  
  // Purchase reasons
  primaryPurchaseReason: null,
  priceDrivenSales: null,
  promoDrivenSales: null,
  brandLoyaltySales: null,
  recommendationSales: null,
  
  // Demographics
  dominantCustomerType: null,
  dominantAgeGroup: null,
  dominantGender: null,
  
  // Market insights
  observedMarketTrends: '',
  customerBehaviorNotes: '',
  competitiveActivity: '',
  locationInsights: '',
  productFeedback: '',
  improvementOpportunities: ''
})

// Computed properties
const isEdit = computed(() => !!props.reportId)

const maxDate = computed(() => new Date())

const selectedActivation = computed(() => {
  return availableActivations.value.find(a => a.id === formData.value.activationId)
})

const isFormValid = computed(() => {
  return formData.value.activationId && 
         formData.value.reportDate && 
         Object.keys(errors.value).length === 0
})

const fullFormData = computed(() => ({
  ...formData.value,
  ...consumerBehaviorData.value
}))

// Methods
const loadAvailableActivations = async () => {
  loadingActivations.value = true
  try {
    // Get activations from store or API
    const activations = activationStore.activations.length > 0 
      ? activationStore.activations 
      : await activationStore.fetchActivations()
    
    availableActivations.value = Array.isArray(activations) ? activations : []
  } catch (error) {
    console.error('Error loading activations:', error)
    toast.add({
      severity: 'error',
      summary: 'Loading Error',
      detail: 'Failed to load available activations',
      life: 5000
    })
    availableActivations.value = []
  } finally {
    loadingActivations.value = false
  }
}

const loadExistingReport = async () => {
  if (!props.reportId) return

  try {
    const report = await reportService.getReportById(props.reportId)
    
    // Populate form data
    formData.value = {
      activationId: report.activationId,
      reportDate: new Date(report.reportDate),
      totalAttendance: report.totalAttendance,
      totalSales: report.totalSales,
      generalNotes: report.generalNotes || '',
      challengesFaced: report.challengesFaced || '',
      status: report.status || 'DRAFT'
    }
    
    // Populate consumer behavior data
    consumerBehaviorData.value = {
      topPurchasedSkuId: report.topPurchasedSkuId,
      topSkuUnitsSold: report.topSkuUnitsSold,
      topSkuRevenue: report.topSkuRevenue,
      secondTopSkuId: report.secondTopSkuId,
      thirdTopSkuId: report.thirdTopSkuId,
      primaryPurchaseReason: report.primaryPurchaseReason,
      priceDrivenSales: report.priceDrivenSales,
      promoDrivenSales: report.promoDrivenSales,
      brandLoyaltySales: report.brandLoyaltySales,
      recommendationSales: report.recommendationSales,
      dominantCustomerType: report.dominantCustomerType,
      dominantAgeGroup: report.dominantAgeGroup,
      dominantGender: report.dominantGender,
      observedMarketTrends: report.observedMarketTrends || '',
      customerBehaviorNotes: report.customerBehaviorNotes || '',
      competitiveActivity: report.competitiveActivity || '',
      locationInsights: report.locationInsights || '',
      productFeedback: report.productFeedback || '',
      improvementOpportunities: report.improvementOpportunities || ''
    }
  } catch (error) {
    console.error('Error loading report:', error)
    toast.add({
      severity: 'error',
      summary: 'Loading Error',
      detail: 'Failed to load report data',
      life: 5000
    })
  }
}

const validateForm = () => {
  const validation = reportService.validateDailyReport(fullFormData.value)
  errors.value = validation.errors
  return validation.isValid
}

const onActivationChange = () => {
  // Clear previous errors when activation changes
  delete errors.value.activationId
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

  saving.value = true
  try {
    const submitData = {
      ...fullFormData.value,
      status: 'SUBMITTED'
    }

    let result
    if (isEdit.value) {
      result = await reportService.updateDailyReport(props.reportId, submitData)
    } else {
      result = await reportService.createDailyReport(submitData)
    }

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Report ${isEdit.value ? 'updated' : 'created'} successfully`,
      life: 3000
    })

    // Navigate back to reports list or activation details
    router.push('/reports')
  } catch (error) {
    console.error('Error saving report:', error)
    toast.add({
      severity: 'error',
      summary: 'Save Failed',
      detail: error.message || 'Failed to save report',
      life: 5000
    })
  } finally {
    saving.value = false
  }
}

const handleSaveDraft = async () => {
  savingDraft.value = true
  try {
    const draftData = {
      ...fullFormData.value,
      status: 'DRAFT'
    }

    let result
    if (isEdit.value) {
      result = await reportService.updateDailyReport(props.reportId, draftData)
    } else {
      result = await reportService.createDailyReport(draftData)
    }

    toast.add({
      severity: 'success',
      summary: 'Draft Saved',
      detail: 'Report saved as draft',
      life: 3000
    })

    // Update the reportId if this was a new report
    if (!isEdit.value && result.id) {
      router.replace({ name: route.name, params: { ...route.params, reportId: result.id } })
    }
  } catch (error) {
    console.error('Error saving draft:', error)
    toast.add({
      severity: 'error',
      summary: 'Save Failed',
      detail: error.message || 'Failed to save draft',
      life: 5000
    })
  } finally {
    savingDraft.value = false
  }
}

const handleCancel = () => {
  router.push('/reports')
}

const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString() : ''
}

// Lifecycle
onMounted(async () => {
  await loadAvailableActivations()
  if (props.reportId) {
    await loadExistingReport()
  }
})
</script>

<style scoped>
.daily-report-form {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.form-header-card {
  margin-bottom: 2rem;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 0.5rem;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  font-size: 2.5rem;
  opacity: 0.9;
}

.header-info h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
}

.header-info p {
  margin: 0;
  opacity: 0.9;
}

.date-tag {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.report-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e9ecef;
  border-radius: 0.75rem 0.75rem 0 0;
}

.section-icon {
  color: #495057;
  font-size: 1.5rem;
}

.section-header h3 {
  margin: 0;
  color: #495057;
  font-size: 1.25rem;
  font-weight: 600;
}

.basic-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.notes-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
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

.form-actions-card {
  position: sticky;
  bottom: 0;
  z-index: 10;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.cancel-btn {
  border-color: #6c757d;
  color: #6c757d;
}

.cancel-btn:hover {
  background: #6c757d;
  color: white;
}

.draft-btn {
  border-color: #ffc107;
  color: #ffc107;
}

.draft-btn:hover {
  background: #ffc107;
  color: #212529;
}

.submit-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
}

/* Input styling */
:deep(.p-dropdown),
:deep(.p-calendar),
:deep(.p-inputnumber),
:deep(.p-inputtextarea) {
  width: 100%;
}

:deep(.p-inputtextarea) {
  resize: vertical;
  min-height: 100px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .notes-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .daily-report-form {
    padding: 1rem;
  }
  
  .form-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    text-align: center;
  }
  
  .basic-info-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .notes-grid {
    padding: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
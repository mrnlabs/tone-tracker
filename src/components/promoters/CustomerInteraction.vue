<template>
  <div class="customer-interaction">
    <!-- Quick Interaction Buttons -->
    <Card class="quick-interactions">
      <template #header>
        <h3>Log Customer Interaction</h3>
      </template>
      <template #content>
        <div class="interaction-buttons">
          <Button
            v-for="interaction in quickInteractions"
            :key="interaction.type"
            @click="logQuickInteraction(interaction)"
            :icon="interaction.icon"
            :label="interaction.label"
            class="p-button-outlined interaction-btn"
            :loading="loading && selectedInteraction?.type === interaction.type"
          />
        </div>
      </template>
    </Card>

    <!-- Today's Interaction Stats -->
    <Card class="interaction-stats">
      <template #header>
        <h3>Today's Interactions</h3>
      </template>
      <template #content>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon total">
              <i class="pi pi-users"></i>
            </div>
            <div class="stat-info">
              <span class="stat-number">{{ todayInteractionCount }}</span>
              <span class="stat-label">Total Interactions</span>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon leads">
              <i class="pi pi-send"></i>
            </div>
            <div class="stat-info">
              <span class="stat-number">{{ todayLeadsCount }}</span>
              <span class="stat-label">Leads Captured</span>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon positive">
              <i class="pi pi-thumbs-up"></i>
            </div>
            <div class="stat-info">
              <span class="stat-number">{{ positiveInteractionRate }}%</span>
              <span class="stat-label">Positive Rate</span>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Detailed Interaction Form -->
    <Card class="detailed-interaction">
      <template #header>
        <div class="header-content">
          <h3>Detailed Interaction</h3>
          <Button
            @click="showDetailForm = !showDetailForm"
            :icon="showDetailForm ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
            class="p-button-text"
          />
        </div>
      </template>
      <template #content v-if="showDetailForm">
        <form @submit.prevent="submitDetailedInteraction" class="interaction-form">
          <div class="form-row">
            <div class="form-group">
              <label for="interactionType" class="required">Interaction Type</label>
              <Dropdown
                id="interactionType"
                v-model="interactionData.type"
                :options="interactionTypes"
                optionLabel="label"
                optionValue="value"
                placeholder="Select interaction type"
                class="w-full"
                :class="{ 'p-invalid': errors.type }"
              />
              <small class="p-error" v-if="errors.type">{{ errors.type }}</small>
            </div>

            <div class="form-group">
              <label for="outcome" class="required">Outcome</label>
              <Dropdown
                id="outcome"
                v-model="interactionData.outcome"
                :options="outcomeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select outcome"
                class="w-full"
                :class="{ 'p-invalid': errors.outcome }"
              />
              <small class="p-error" v-if="errors.outcome">{{ errors.outcome }}</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="duration">Duration (minutes)</label>
              <InputNumber
                id="duration"
                v-model="interactionData.duration"
                :min="1"
                :max="120"
                placeholder="Duration"
                class="w-full"
              />
            </div>

            <div class="form-group">
              <label for="customerAge">Customer Age Group</label>
              <Dropdown
                id="customerAge"
                v-model="interactionData.customerAgeGroup"
                :options="ageGroups"
                optionLabel="label"
                optionValue="value"
                placeholder="Age group"
                class="w-full"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="description" class="required">Description</label>
            <Textarea
              id="description"
              v-model="interactionData.description"
              rows="3"
              placeholder="Describe the interaction and what was discussed"
              class="w-full"
              :class="{ 'p-invalid': errors.description }"
            />
            <small class="p-error" v-if="errors.description">{{ errors.description }}</small>
          </div>

          <div class="form-group">
            <label for="productsDiscussed">Products Discussed</label>
            <MultiSelect
              id="productsDiscussed"
              v-model="interactionData.productsDiscussed"
              :options="availableProducts"
              optionLabel="name"
              optionValue="id"
              placeholder="Select products"
              display="chip"
              class="w-full"
            />
          </div>

          <div class="form-group">
            <label for="followUpRequired">Follow-up Required</label>
            <div class="follow-up-section">
              <Checkbox
                id="followUpRequired"
                v-model="interactionData.followUpRequired"
                :binary="true"
              />
              <label for="followUpRequired" class="checkbox-label">
                This interaction requires follow-up
              </label>
            </div>
            
            <div v-if="interactionData.followUpRequired" class="follow-up-details">
              <Textarea
                v-model="interactionData.followUpNotes"
                rows="2"
                placeholder="Follow-up notes and required actions"
                class="w-full"
              />
            </div>
          </div>

          <div class="form-actions">
            <Button
              type="submit"
              :loading="loading"
              label="Log Interaction"
              icon="pi pi-check"
              class="p-button-primary"
            />
            <Button
              type="button"
              @click="resetDetailForm"
              label="Reset"
              icon="pi pi-refresh"
              class="p-button-outlined"
            />
          </div>
        </form>
      </template>
    </Card>

    <!-- Lead Capture Form -->
    <Card class="lead-capture">
      <template #header>
        <div class="header-content">
          <h3>Capture Customer Lead</h3>
          <Button
            @click="showLeadForm = !showLeadForm"
            :icon="showLeadForm ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
            class="p-button-text"
          />
        </div>
      </template>
      <template #content v-if="showLeadForm">
        <form @submit.prevent="submitLead" class="lead-form">
          <div class="form-row">
            <div class="form-group">
              <label for="customerName" class="required">Customer Name</label>
              <InputText
                id="customerName"
                v-model="leadData.customerName"
                placeholder="Customer name"
                class="w-full"
                :class="{ 'p-invalid': leadErrors.customerName }"
              />
              <small class="p-error" v-if="leadErrors.customerName">{{ leadErrors.customerName }}</small>
            </div>

            <div class="form-group">
              <label for="customerPhone" class="required">Phone Number</label>
              <InputText
                id="customerPhone"
                v-model="leadData.customerPhone"
                placeholder="Phone number"
                class="w-full"
                :class="{ 'p-invalid': leadErrors.customerPhone }"
              />
              <small class="p-error" v-if="leadErrors.customerPhone">{{ leadErrors.customerPhone }}</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="customerEmail">Email (Optional)</label>
              <InputText
                id="customerEmail"
                v-model="leadData.customerEmail"
                placeholder="Email address"
                class="w-full"
              />
            </div>

            <div class="form-group">
              <label for="interestLevel" class="required">Interest Level</label>
              <Dropdown
                id="interestLevel"
                v-model="leadData.interestLevel"
                :options="interestLevels"
                optionLabel="label"
                optionValue="value"
                placeholder="Interest level"
                class="w-full"
                :class="{ 'p-invalid': leadErrors.interestLevel }"
              />
              <small class="p-error" v-if="leadErrors.interestLevel">{{ leadErrors.interestLevel }}</small>
            </div>
          </div>

          <div class="form-group">
            <label for="interestedProducts">Interested Products</label>
            <MultiSelect
              id="interestedProducts"
              v-model="leadData.interestedProducts"
              :options="availableProducts"
              optionLabel="name"
              optionValue="id"
              placeholder="Select products"
              display="chip"
              class="w-full"
            />
          </div>

          <div class="form-group">
            <label for="leadNotes">Notes</label>
            <Textarea
              id="leadNotes"
              v-model="leadData.notes"
              rows="3"
              placeholder="Additional notes about the customer and their interests"
              class="w-full"
            />
          </div>

          <div class="form-actions">
            <Button
              type="submit"
              :loading="leadLoading"
              label="Capture Lead"
              icon="pi pi-send"
              class="p-button-success"
            />
            <Button
              type="button"
              @click="resetLeadForm"
              label="Reset"
              icon="pi pi-refresh"
              class="p-button-outlined"
            />
          </div>
        </form>
      </template>
    </Card>

    <!-- Today's Interactions -->
    <Card class="todays-interactions">
      <template #header>
        <h3>Today's Interactions</h3>
      </template>
      <template #content>
        <div v-if="todayInteractions.length === 0" class="no-interactions">
          <i class="pi pi-users"></i>
          <p>No interactions recorded today</p>
        </div>
        <div v-else class="interactions-list">
          <div
            v-for="interaction in todayInteractions"
            :key="interaction.id"
            class="interaction-item"
          >
            <div class="interaction-icon">
              <i :class="getInteractionIcon(interaction.type)"></i>
            </div>
            <div class="interaction-content">
              <h4>{{ getInteractionLabel(interaction.type) }}</h4>
              <p class="description">{{ interaction.description }}</p>
              <div class="interaction-meta">
                <span class="time">
                  <i class="pi pi-clock"></i>
                  {{ formatTime(interaction.timestamp) }}
                </span>
                <span v-if="interaction.duration" class="duration">
                  <i class="pi pi-hourglass"></i>
                  {{ interaction.duration }}min
                </span>
                <Tag
                  :value="interaction.outcome"
                  :severity="getOutcomeSeverity(interaction.outcome)"
                  class="outcome-tag"
                />
              </div>
              <div v-if="interaction.followUpRequired" class="follow-up-indicator">
                <i class="pi pi-flag"></i>
                Requires follow-up
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { usePromoterStore } from '@/stores/promoter'
import { format } from 'date-fns'

const props = defineProps({
  activationId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['interaction-logged', 'lead-captured'])

const toast = useToast()
const promoterStore = usePromoterStore()

// State
const loading = ref(false)
const leadLoading = ref(false)
const selectedInteraction = ref(null)
const showDetailForm = ref(false)
const showLeadForm = ref(false)

const errors = ref({})
const leadErrors = ref({})

// Form data
const interactionData = ref({
  type: '',
  outcome: '',
  duration: null,
  customerAgeGroup: '',
  description: '',
  productsDiscussed: [],
  followUpRequired: false,
  followUpNotes: ''
})

const leadData = ref({
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  interestLevel: '',
  interestedProducts: [],
  notes: ''
})

// Quick interactions
const quickInteractions = [
  { type: 'greeting', label: 'Greeting', icon: 'pi pi-heart' },
  { type: 'product_inquiry', label: 'Product Inquiry', icon: 'pi pi-question-circle' },
  { type: 'demonstration', label: 'Demonstration', icon: 'pi pi-play' },
  { type: 'sampling', label: 'Sampling', icon: 'pi pi-gift' },
  { type: 'feedback', label: 'Feedback', icon: 'pi pi-comment' },
  { type: 'complaint', label: 'Complaint', icon: 'pi pi-exclamation-triangle' }
]

// Interaction types
const interactionTypes = [
  { label: 'Greeting/Welcome', value: 'greeting' },
  { label: 'Product Inquiry', value: 'product_inquiry' },
  { label: 'Product Demonstration', value: 'demonstration' },
  { label: 'Sampling/Trial', value: 'sampling' },
  { label: 'Price Inquiry', value: 'price_inquiry' },
  { label: 'Feedback Collection', value: 'feedback' },
  { label: 'Complaint Handling', value: 'complaint' },
  { label: 'Survey/Research', value: 'survey' },
  { label: 'Contest/Game', value: 'contest' },
  { label: 'Social Media Engagement', value: 'social_media' }
]

// Outcome options
const outcomeOptions = [
  { label: 'Very Positive', value: 'very_positive' },
  { label: 'Positive', value: 'positive' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Negative', value: 'negative' },
  { label: 'Purchase Made', value: 'purchase' },
  { label: 'Lead Captured', value: 'lead_captured' },
  { label: 'Follow-up Required', value: 'follow_up_required' }
]

// Age groups
const ageGroups = [
  { label: '18-25', value: '18-25' },
  { label: '26-35', value: '26-35' },
  { label: '36-45', value: '36-45' },
  { label: '46-55', value: '46-55' },
  { label: '56-65', value: '56-65' },
  { label: '65+', value: '65+' }
]

// Interest levels
const interestLevels = [
  { label: 'Very High', value: 'very_high' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
  { label: 'Very Low', value: 'very_low' }
]

// Available products (mock data)
const availableProducts = ref([
  { id: 1, name: 'Product A' },
  { id: 2, name: 'Product B' },
  { id: 3, name: 'Product C' }
])

// Computed
const todayInteractions = computed(() => 
  promoterStore.customerInteractions.filter(interaction => 
    new Date(interaction.timestamp).toDateString() === new Date().toDateString()
  )
)

const todayInteractionCount = computed(() => todayInteractions.value.length)

const todayLeadsCount = computed(() => 
  promoterStore.customerLeads.filter(lead => 
    new Date(lead.capturedAt).toDateString() === new Date().toDateString()
  ).length
)

const positiveInteractionRate = computed(() => {
  const positiveInteractions = todayInteractions.value.filter(
    interaction => ['very_positive', 'positive', 'purchase', 'lead_captured'].includes(interaction.outcome)
  ).length
  
  return todayInteractionCount.value > 0 
    ? Math.round((positiveInteractions / todayInteractionCount.value) * 100)
    : 0
})

// Methods
const logQuickInteraction = async (interaction) => {
  selectedInteraction.value = interaction
  loading.value = true
  
  try {
    const interactionPayload = {
      type: interaction.type,
      outcome: 'positive',
      description: `${interaction.label} with customer`,
      duration: 2
    }
    
    await promoterStore.recordCustomerInteraction(props.activationId, interactionPayload)
    
    toast.add({
      severity: 'success',
      summary: 'Interaction Logged',
      detail: `${interaction.label} interaction recorded`,
      life: 3000
    })
    
    emit('interaction-logged', interactionPayload)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Logging Failed',
      detail: error.message || 'Failed to log interaction',
      life: 5000
    })
  } finally {
    loading.value = false
    selectedInteraction.value = null
  }
}

const submitDetailedInteraction = async () => {
  if (!validateInteractionForm()) return
  
  loading.value = true
  
  try {
    await promoterStore.recordCustomerInteraction(props.activationId, interactionData.value)
    
    toast.add({
      severity: 'success',
      summary: 'Interaction Logged',
      detail: 'Detailed interaction recorded successfully',
      life: 3000
    })
    
    resetDetailForm()
    emit('interaction-logged', interactionData.value)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Logging Failed',
      detail: error.message || 'Failed to log interaction',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

const submitLead = async () => {
  if (!validateLeadForm()) return
  
  leadLoading.value = true
  
  try {
    await promoterStore.captureCustomerLead(props.activationId, leadData.value)
    
    toast.add({
      severity: 'success',
      summary: 'Lead Captured',
      detail: `Lead for ${leadData.value.customerName} captured successfully`,
      life: 3000
    })
    
    resetLeadForm()
    emit('lead-captured', leadData.value)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Capture Failed',
      detail: error.message || 'Failed to capture lead',
      life: 5000
    })
  } finally {
    leadLoading.value = false
  }
}

const validateInteractionForm = () => {
  errors.value = {}
  
  if (!interactionData.value.type) {
    errors.value.type = 'Interaction type is required'
  }
  
  if (!interactionData.value.outcome) {
    errors.value.outcome = 'Outcome is required'
  }
  
  if (!interactionData.value.description?.trim()) {
    errors.value.description = 'Description is required'
  }
  
  return Object.keys(errors.value).length === 0
}

const validateLeadForm = () => {
  leadErrors.value = {}
  
  if (!leadData.value.customerName?.trim()) {
    leadErrors.value.customerName = 'Customer name is required'
  }
  
  if (!leadData.value.customerPhone?.trim()) {
    leadErrors.value.customerPhone = 'Phone number is required'
  }
  
  if (!leadData.value.interestLevel) {
    leadErrors.value.interestLevel = 'Interest level is required'
  }
  
  return Object.keys(leadErrors.value).length === 0
}

const resetDetailForm = () => {
  interactionData.value = {
    type: '',
    outcome: '',
    duration: null,
    customerAgeGroup: '',
    description: '',
    productsDiscussed: [],
    followUpRequired: false,
    followUpNotes: ''
  }
  errors.value = {}
}

const resetLeadForm = () => {
  leadData.value = {
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    interestLevel: '',
    interestedProducts: [],
    notes: ''
  }
  leadErrors.value = {}
}

const getInteractionIcon = (type) => {
  const icons = {
    greeting: 'pi pi-heart',
    product_inquiry: 'pi pi-question-circle',
    demonstration: 'pi pi-play',
    sampling: 'pi pi-gift',
    price_inquiry: 'pi pi-dollar',
    feedback: 'pi pi-comment',
    complaint: 'pi pi-exclamation-triangle',
    survey: 'pi pi-list',
    contest: 'pi pi-trophy',
    social_media: 'pi pi-share-alt'
  }
  return icons[type] || 'pi pi-circle'
}

const getInteractionLabel = (type) => {
  const interaction = interactionTypes.find(t => t.value === type)
  return interaction?.label || type
}

const getOutcomeSeverity = (outcome) => {
  const severities = {
    very_positive: 'success',
    positive: 'success',
    purchase: 'success',
    lead_captured: 'success',
    neutral: 'warning',
    negative: 'danger',
    follow_up_required: 'info'
  }
  return severities[outcome] || 'info'
}

const formatTime = (timestamp) => {
  return format(new Date(timestamp), 'HH:mm')
}

// Lifecycle
onMounted(() => {
  // Load interactions if not already loaded
  if (promoterStore.customerInteractions.length === 0) {
    promoterStore.fetchCustomerInteractions?.(props.activationId)
  }
})
</script>

<style scoped>
.customer-interaction {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.interaction-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.interaction-btn {
  height: 3rem;
  justify-content: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-50);
  border-radius: 8px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.stat-icon.total {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.leads {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.positive {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.interaction-form .form-group,
.lead-form .form-group {
  margin-bottom: 1.5rem;
}

.interaction-form label,
.lead-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.interaction-form label.required::after,
.lead-form label.required::after {
  content: ' *';
  color: var(--red-500);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.follow-up-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.checkbox-label {
  margin: 0 !important;
  cursor: pointer;
}

.follow-up-details {
  margin-top: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.no-interactions {
  text-align: center;
  padding: 2rem;
  color: var(--text-color-secondary);
}

.no-interactions i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.interactions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.interaction-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--surface-200);
  border-radius: 8px;
  background: var(--surface-50);
}

.interaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.interaction-content {
  flex: 1;
}

.interaction-content h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.interaction-content .description {
  margin: 0 0 0.75rem 0;
  color: var(--text-color);
  line-height: 1.4;
}

.interaction-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.interaction-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.outcome-tag {
  font-size: 0.75rem;
}

.follow-up-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--orange-600);
  font-size: 0.875rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .interaction-buttons {
    grid-template-columns: 1fr 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .p-button {
    width: 100%;
  }
  
  .interaction-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .interaction-meta {
    justify-content: space-between;
  }
}
</style>
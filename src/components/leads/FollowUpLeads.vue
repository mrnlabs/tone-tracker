<template>
  <div class="follow-up-leads">
    <Card class="header-card">
      <template #header>
        <div class="section-header">
          <div class="header-info">
            <i class="pi pi-calendar-plus header-icon"></i>
            <div>
              <h2>Follow-up Required</h2>
              <p>Leads that need your attention</p>
            </div>
          </div>
          <div class="header-stats">
            <div class="stat-item">
              <span class="stat-number">{{ totalFollowUps }}</span>
              <span class="stat-label">Total Follow-ups</span>
            </div>
            <div class="stat-item urgent">
              <span class="stat-number">{{ urgentFollowUps }}</span>
              <span class="stat-label">Urgent</span>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Filters -->
    <Card class="filters-card">
      <template #content>
        <div class="filters-section">
          <div class="filter-row">
            <div class="filter-group">
              <label>Search</label>
              <IconField iconPosition="left">
                <InputIcon class="pi pi-search" />
                <InputText
                  v-model="searchQuery"
                  placeholder="Search leads..."
                  @input="debouncedSearch"
                  class="search-input"
                />
              </IconField>
            </div>
            
            <div class="filter-group">
              <label>Priority</label>
              <Dropdown
                v-model="selectedPriority"
                :options="priorityOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="All Priorities"
                @change="applyFilters"
                class="priority-filter"
              />
            </div>
            
            <div class="filter-group">
              <label>Time Frame</label>
              <Dropdown
                v-model="selectedTimeFrame"
                :options="timeFrameOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="All Time"
                @change="applyFilters"
                class="timeframe-filter"
              />
            </div>
            
            <div class="filter-actions">
              <Button
                icon="pi pi-refresh"
                @click="refreshFollowUps"
                :loading="loading"
                class="p-button-outlined refresh-btn"
                v-tooltip.top="'Refresh'"
              />
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Follow-up Cards -->
    <div class="follow-up-grid" v-if="!loading && followUpLeads.length > 0">
      <Card 
        v-for="lead in followUpLeads" 
        :key="lead.id" 
        class="follow-up-card"
        :class="getCardClass(lead)"
      >
        <template #header>
          <div class="card-header">
            <div class="lead-info">
              <Avatar 
                :label="getInitials(lead.name, lead.surname)"
                size="large"
                shape="circle"
                class="lead-avatar"
              />
              <div class="lead-details">
                <h3>{{ lead.name }} {{ lead.surname }}</h3>
                <p>{{ lead.email }}</p>
                <p>{{ formatPhoneNumber(lead.phone) }}</p>
              </div>
            </div>
            <div class="card-badges">
              <Tag 
                v-if="getPriorityLevel(lead) === 'urgent'"
                value="Urgent" 
                severity="danger"
                class="priority-tag"
              />
              <Tag 
                v-else-if="getPriorityLevel(lead) === 'high'"
                value="High Priority" 
                severity="warning"
                class="priority-tag"
              />
            </div>
          </div>
        </template>

        <template #content>
          <div class="card-content">
            <!-- Lead Insights Summary -->
            <div class="insights-summary">
              <div class="insight-item" v-if="lead.promoterComments?.brandAwarenessLevel">
                <i class="pi pi-eye insight-icon"></i>
                <div>
                  <small>Brand Awareness</small>
                  <Rating 
                    :modelValue="lead.promoterComments.brandAwarenessLevel" 
                    :readonly="true" 
                    :stars="5" 
                    :cancel="false"
                    class="mini-rating"
                  />
                </div>
              </div>
              
              <div class="insight-item" v-if="lead.promoterComments?.purchaseIntentLevel">
                <i class="pi pi-shopping-cart insight-icon"></i>
                <div>
                  <small>Purchase Intent</small>
                  <Rating 
                    :modelValue="lead.promoterComments.purchaseIntentLevel" 
                    :readonly="true" 
                    :stars="5" 
                    :cancel="false"
                    class="mini-rating"
                  />
                </div>
              </div>
              
              <div class="insight-item" v-if="lead.promoterComments?.engagementQuality">
                <i class="pi pi-heart insight-icon"></i>
                <div>
                  <small>Engagement</small>
                  <Tag 
                    :value="getEngagementLabel(lead.promoterComments.engagementQuality)"
                    :severity="getEngagementSeverity(lead.promoterComments.engagementQuality)"
                    class="engagement-tag"
                  />
                </div>
              </div>
            </div>

            <!-- Follow-up Notes -->
            <div class="follow-up-notes" v-if="lead.promoterComments?.followUpNotes">
              <h4>
                <i class="pi pi-sticky-note-o"></i>
                Follow-up Notes
              </h4>
              <p>{{ lead.promoterComments.followUpNotes }}</p>
            </div>

            <!-- Key Intelligence -->
            <div class="key-intelligence" v-if="hasKeyIntelligence(lead)">
              <h4>
                <i class="pi pi-info-circle"></i>
                Key Intelligence
              </h4>
              <div class="intelligence-items">
                <div v-if="lead.promoterComments?.competitorMentions" class="intel-item">
                  <strong>Competitors:</strong> {{ lead.promoterComments.competitorMentions }}
                </div>
                <div v-if="lead.promoterComments?.priceSensitivity" class="intel-item">
                  <strong>Price Sensitivity:</strong> {{ lead.promoterComments.priceSensitivity }}
                </div>
                <div v-if="lead.promoterComments?.decisionMakerStatus" class="intel-item">
                  <strong>Decision Maker:</strong> {{ lead.promoterComments.decisionMakerStatus }}
                </div>
              </div>
            </div>

            <!-- Activation Info -->
            <div class="activation-info" v-if="lead.activation">
              <i class="pi pi-map-marker"></i>
              <span>{{ lead.activation.name }}</span>
              <small>{{ formatDate(lead.dateCreated) }}</small>
            </div>
          </div>
        </template>

        <template #footer>
          <div class="card-actions">
            <Button
              label="Update Comments"
              icon="pi pi-edit"
              @click="openUpdateDialog(lead)"
              class="p-button-outlined update-btn"
            />
            <Button
              label="Mark Complete"
              icon="pi pi-check"
              @click="markFollowUpComplete(lead)"
              class="complete-btn"
            />
          </div>
        </template>
      </Card>
    </div>

    <!-- Empty State -->
    <Card v-else-if="!loading && followUpLeads.length === 0" class="empty-state">
      <template #content>
        <div class="empty-content">
          <i class="pi pi-calendar-check empty-icon"></i>
          <h3>No Follow-ups Required</h3>
          <p>Great job! You're all caught up with your follow-up tasks.</p>
          <Button
            label="View All Leads"
            icon="pi pi-users"
            @click="$router.push('/activations')"
            class="p-button-outlined"
          />
        </div>
      </template>
    </Card>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <p>Loading follow-up leads...</p>
    </div>

    <!-- Update Dialog -->
    <Dialog
      v-model:visible="showUpdateDialog"
      :modal="true"
      :closable="true"
      :style="{ width: '90vw', maxWidth: '900px' }"
      class="update-dialog"
    >
      <LeadCommentForm 
        v-if="selectedLead && showUpdateDialog"
        :leadData="selectedLead"
        :visible="showUpdateDialog"
        @close="closeUpdateDialog"
        @success="onUpdateSuccess"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Dropdown from 'primevue/dropdown'
import Avatar from 'primevue/avatar'
import Tag from 'primevue/tag'
import Rating from 'primevue/rating'
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'
import { LeadCommentForm } from '@/components'
import leadService from '@/services/leadService'

// Composables
const router = useRouter()
const toast = useToast()

// Reactive data
const loading = ref(false)
const followUpLeads = ref([])
const searchQuery = ref('')
const selectedPriority = ref(null)
const selectedTimeFrame = ref(null)
const showUpdateDialog = ref(false)
const selectedLead = ref(null)

// Filter options
const priorityOptions = ref([
  { label: 'All Priorities', value: null },
  { label: 'Urgent', value: 'urgent' },
  { label: 'High', value: 'high' },
  { label: 'Normal', value: 'normal' }
])

const timeFrameOptions = ref([
  { label: 'All Time', value: null },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Overdue', value: 'overdue' }
])

// Computed properties
const totalFollowUps = computed(() => followUpLeads.value.length)

const urgentFollowUps = computed(() => {
  return followUpLeads.value.filter(lead => getPriorityLevel(lead) === 'urgent').length
})

// Methods
const loadFollowUpLeads = async () => {
  loading.value = true
  try {
    const params = {
      searchTerm: searchQuery.value || undefined,
      priority: selectedPriority.value || undefined,
      timeFrame: selectedTimeFrame.value || undefined
    }
    
    const response = await leadService.getMyFollowUpLeads(params)
    
    // Handle different response structures
    if (response && typeof response === 'object') {
      if (response.content !== undefined) {
        followUpLeads.value = response.content || []
      } else if (response.data !== undefined) {
        followUpLeads.value = response.data || []
      } else if (Array.isArray(response)) {
        followUpLeads.value = response
      } else {
        followUpLeads.value = []
      }
    } else {
      followUpLeads.value = []
    }
  } catch (error) {
    console.error('Error loading follow-up leads:', error)
    toast.add({
      severity: 'error',
      summary: 'Loading Error',
      detail: 'Failed to load follow-up leads',
      life: 5000
    })
    followUpLeads.value = []
  } finally {
    loading.value = false
  }
}

const refreshFollowUps = () => {
  loadFollowUpLeads()
}

const applyFilters = () => {
  loadFollowUpLeads()
}

let searchTimeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadFollowUpLeads()
  }, 500)
}

const getPriorityLevel = (lead) => {
  const comments = lead.promoterComments
  if (!comments) return 'normal'
  
  // High purchase intent + high engagement = urgent
  if (comments.purchaseIntentLevel >= 4 && comments.engagementQuality >= 4) {
    return 'urgent'
  }
  
  // High purchase intent OR competitor mentions = high
  if (comments.purchaseIntentLevel >= 4 || comments.competitorMentions) {
    return 'high'
  }
  
  return 'normal'
}

const getCardClass = (lead) => {
  const priority = getPriorityLevel(lead)
  return {
    'urgent-card': priority === 'urgent',
    'high-priority-card': priority === 'high'
  }
}

const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`
}

const formatPhoneNumber = (phone) => {
  return leadService.formatPhoneNumber(phone)
}

const getEngagementLabel = (level) => {
  return leadService.getEngagementQualityLabel(level)
}

const getEngagementSeverity = (level) => {
  if (!level) return 'secondary'
  if (level >= 4) return 'success'
  if (level >= 3) return 'warning'
  return 'danger'
}

const hasKeyIntelligence = (lead) => {
  const comments = lead.promoterComments
  return comments && (
    comments.competitorMentions || 
    comments.priceSensitivity || 
    comments.decisionMakerStatus
  )
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const openUpdateDialog = (lead) => {
  selectedLead.value = lead
  showUpdateDialog.value = true
}

const closeUpdateDialog = () => {
  showUpdateDialog.value = false
  selectedLead.value = null
}

const onUpdateSuccess = async () => {
  toast.add({
    severity: 'success',
    summary: 'Updated',
    detail: 'Lead comments updated successfully',
    life: 3000
  })
  closeUpdateDialog()
  await loadFollowUpLeads()
}

const markFollowUpComplete = async (lead) => {
  try {
    // Update the lead to mark follow-up as complete
    const updateData = {
      ...lead.promoterComments,
      followUpRequired: false,
      followUpNotes: `${lead.promoterComments?.followUpNotes || ''}\n\n[COMPLETED: ${new Date().toLocaleDateString()}]`
    }
    
    await leadService.addPromoterComment(lead.id, updateData)
    
    toast.add({
      severity: 'success',
      summary: 'Follow-up Complete',
      detail: 'Follow-up marked as completed',
      life: 3000
    })
    
    // Refresh the list
    await loadFollowUpLeads()
  } catch (error) {
    console.error('Error marking follow-up complete:', error)
    toast.add({
      severity: 'error',
      summary: 'Update Failed',
      detail: 'Failed to mark follow-up as complete',
      life: 5000
    })
  }
}

// Lifecycle
onMounted(() => {
  loadFollowUpLeads()
})
</script>

<style scoped>
.follow-up-leads {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header-card {
  margin-bottom: 1.5rem;
}

.section-header {
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

.header-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  min-width: 100px;
}

.stat-item.urgent {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  opacity: 0.9;
  margin-top: 0.25rem;
}

.filters-card {
  margin-bottom: 2rem;
}

.filters-section {
  padding: 0;
}

.filter-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 1.5rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.search-input,
.priority-filter,
.timeframe-filter {
  width: 100%;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
}

.refresh-btn {
  padding: 0.75rem;
}

.follow-up-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.follow-up-card {
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.follow-up-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.follow-up-card.urgent-card {
  border-left: 4px solid #ef4444;
}

.follow-up-card.high-priority-card {
  border-left: 4px solid #f59e0b;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.lead-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.lead-avatar {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  flex-shrink: 0;
}

.lead-details h3 {
  margin: 0;
  color: #111827;
  font-size: 1.1rem;
  font-weight: 600;
}

.lead-details p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.card-badges {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.priority-tag {
  font-size: 0.75rem;
}

.card-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.insights-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.insight-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  text-align: center;
}

.insight-icon {
  color: #6b7280;
  font-size: 1.25rem;
}

.insight-item small {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.mini-rating {
  scale: 0.8;
}

.engagement-tag {
  font-size: 0.75rem;
}

.follow-up-notes h4,
.key-intelligence h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.75rem 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
}

.follow-up-notes p {
  margin: 0;
  color: #6b7280;
  line-height: 1.5;
  padding: 1rem;
  background: #fef3c7;
  border-radius: 0.5rem;
  border-left: 4px solid #f59e0b;
}

.intelligence-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.intel-item {
  padding: 0.75rem;
  background: #f3f4f6;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.4;
}

.intel-item strong {
  color: #374151;
}

.activation-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #eff6ff;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #1d4ed8;
}

.activation-info small {
  margin-left: auto;
  color: #6b7280;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.update-btn {
  flex: 1;
}

.complete-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: #10b981;
  color: white;
}

.complete-btn:hover {
  background: linear-gradient(135deg, #059669, #047857);
  border-color: #059669;
}

.empty-state {
  text-align: center;
}

.empty-content {
  padding: 3rem;
}

.empty-icon {
  font-size: 4rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.empty-content h3 {
  margin: 0 0 0.5rem 0;
  color: #111827;
}

.empty-content p {
  margin: 0 0 2rem 0;
  color: #6b7280;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.update-dialog :deep(.p-dialog-content) {
  padding: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .follow-up-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .follow-up-leads {
    padding: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
    text-align: center;
  }
  
  .header-stats {
    justify-content: center;
    gap: 1rem;
  }
  
  .filter-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .follow-up-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .lead-info {
    justify-content: center;
  }
  
  .card-badges {
    align-items: center;
  }
  
  .insights-summary {
    grid-template-columns: 1fr;
  }
  
  .card-actions {
    flex-direction: column;
  }
}
</style>
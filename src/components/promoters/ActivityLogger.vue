<template>
  <div class="activity-logger">
    <!-- Quick Activity Buttons -->
    <Card class="quick-activities">
      <template #header>
        <h3>Log Activity</h3>
      </template>
      <template #content>
        <div class="quick-buttons">
          <Button
            v-for="activity in quickActivities"
            :key="activity.type"
            @click="logQuickActivity(activity)"
            :icon="activity.icon"
            :label="activity.label"
            class="p-button-outlined activity-btn"
            :loading="loading && selectedActivity?.type === activity.type"
          />
        </div>
      </template>
    </Card>

    <!-- Detailed Activity Form -->
    <Card class="detailed-activity">
      <template #header>
        <h3>Detailed Activity Log</h3>
      </template>
      <template #content>
        <form @submit.prevent="logDetailedActivity" class="activity-form">
          <div class="form-group">
            <label for="activityType" class="required">Activity Type</label>
            <Dropdown
              id="activityType"
              v-model="activityData.type"
              :options="activityTypes"
              optionLabel="label"
              optionValue="value"
              placeholder="Select activity type"
              class="w-full"
              :class="{ 'p-invalid': errors.type }"
            />
            <small class="p-error" v-if="errors.type">{{ errors.type }}</small>
          </div>

          <div class="form-group">
            <label for="description" class="required">Description</label>
            <Textarea
              id="description"
              v-model="activityData.description"
              rows="3"
              placeholder="Describe the activity in detail"
              class="w-full"
              :class="{ 'p-invalid': errors.description }"
            />
            <small class="p-error" v-if="errors.description">{{ errors.description }}</small>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="duration">Duration (minutes)</label>
              <InputNumber
                id="duration"
                v-model="activityData.duration"
                :min="1"
                :max="480"
                placeholder="0"
                class="w-full"
              />
            </div>

            <div class="form-group">
              <label for="participants">Participants</label>
              <InputNumber
                id="participants"
                v-model="activityData.participants"
                :min="0"
                placeholder="0"
                class="w-full"
              />
            </div>
          </div>

          <div class="form-group" v-if="activityData.type === 'sales'">
            <label for="salesAmount">Sales Amount</label>
            <InputNumber
              id="salesAmount"
              v-model="activityData.salesAmount"
              mode="currency"
              currency="USD"
              :minFractionDigits="2"
              placeholder="0.00"
              class="w-full"
            />
          </div>

          <div class="form-group" v-if="activityData.type === 'customer_engagement'">
            <label for="engagementType">Engagement Type</label>
            <MultiSelect
              id="engagementType"
              v-model="activityData.engagementTypes"
              :options="engagementTypes"
              optionLabel="label"
              optionValue="value"
              placeholder="Select engagement types"
              display="chip"
              class="w-full"
            />
          </div>

          <div class="form-group">
            <label for="outcome">Outcome/Result</label>
            <Dropdown
              id="outcome"
              v-model="activityData.outcome"
              :options="outcomeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select outcome"
              class="w-full"
            />
          </div>

          <div class="form-group">
            <label for="notes">Additional Notes</label>
            <Textarea
              id="notes"
              v-model="activityData.notes"
              rows="2"
              placeholder="Any additional notes or observations"
              class="w-full"
            />
          </div>

          <div class="form-group">
            <label>Upload Photos</label>
            <FileUpload
              mode="basic"
              accept="image/*"
              :maxFileSize="5000000"
              @select="onPhotosSelect"
              :auto="false"
              chooseLabel="Add Photos"
              class="w-full"
              :multiple="true"
            />
            <small class="help-text">
              Upload photos related to this activity (max 5MB each)
            </small>
          </div>

          <div class="form-actions">
            <Button
              type="submit"
              :loading="loading"
              label="Log Activity"
              icon="pi pi-check"
              class="p-button-primary"
            />
            <Button
              type="button"
              @click="resetForm"
              label="Reset"
              icon="pi pi-refresh"
              class="p-button-outlined"
            />
          </div>
        </form>
      </template>
    </Card>

    <!-- Today's Activities -->
    <Card class="todays-activities">
      <template #header>
        <div class="header-content">
          <h3>Today's Activities</h3>
          <Tag :value="`${todayActivities.length} logged`" />
        </div>
      </template>
      <template #content>
        <div v-if="todayActivities.length === 0" class="no-activities">
          <i class="pi pi-clock"></i>
          <p>No activities logged today</p>
        </div>
        <div v-else class="activities-list">
          <div
            v-for="activity in todayActivities"
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-icon">
              <i :class="getActivityIcon(activity.type)"></i>
            </div>
            <div class="activity-content">
              <h4>{{ getActivityLabel(activity.type) }}</h4>
              <p class="description">{{ activity.description }}</p>
              <div class="activity-meta">
                <span class="time">
                  <i class="pi pi-clock"></i>
                  {{ formatTime(activity.timestamp) }}
                </span>
                <span v-if="activity.duration" class="duration">
                  <i class="pi pi-hourglass"></i>
                  {{ activity.duration }}min
                </span>
                <span v-if="activity.participants > 0" class="participants">
                  <i class="pi pi-users"></i>
                  {{ activity.participants }} people
                </span>
              </div>
              <div v-if="activity.outcome" class="outcome">
                <Tag :value="activity.outcome" :severity="getOutcomeSeverity(activity.outcome)" />
              </div>
            </div>
            <div class="activity-actions">
              <Button
                @click="editActivity(activity)"
                icon="pi pi-pencil"
                class="p-button-text p-button-sm"
                v-tooltip.top="'Edit Activity'"
              />
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Activity Statistics -->
    <Card class="activity-stats">
      <template #header>
        <h3>Activity Summary</h3>
      </template>
      <template #content>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon customer">
              <i class="pi pi-users"></i>
            </div>
            <div class="stat-info">
              <span class="stat-number">{{ activityStats.totalCustomers }}</span>
              <span class="stat-label">Customers Engaged</span>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon demos">
              <i class="pi pi-play"></i>
            </div>
            <div class="stat-info">
              <span class="stat-number">{{ activityStats.totalDemos }}</span>
              <span class="stat-label">Demos Given</span>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon sales">
              <i class="pi pi-dollar"></i>
            </div>
            <div class="stat-info">
              <span class="stat-number">${{ activityStats.totalSales }}</span>
              <span class="stat-label">Sales Generated</span>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon time">
              <i class="pi pi-clock"></i>
            </div>
            <div class="stat-info">
              <span class="stat-number">{{ activityStats.totalTime }}h</span>
              <span class="stat-label">Active Time</span>
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

const emit = defineEmits(['activity-logged'])

const toast = useToast()
const promoterStore = usePromoterStore()

// State
const loading = ref(false)
const selectedActivity = ref(null)
const selectedPhotos = ref([])
const errors = ref({})

const activityData = ref({
  type: '',
  description: '',
  duration: null,
  participants: 0,
  salesAmount: null,
  engagementTypes: [],
  outcome: '',
  notes: ''
})

// Quick activities
const quickActivities = [
  { type: 'customer_engagement', label: 'Customer Engagement', icon: 'pi pi-users' },
  { type: 'product_demo', label: 'Product Demo', icon: 'pi pi-play' },
  { type: 'sales', label: 'Sales Activity', icon: 'pi pi-dollar' },
  { type: 'setup', label: 'Setup/Breakdown', icon: 'pi pi-cog' },
  { type: 'break', label: 'Break', icon: 'pi pi-pause' }
]

// Activity types
const activityTypes = [
  { label: 'Customer Engagement', value: 'customer_engagement' },
  { label: 'Product Demonstration', value: 'product_demo' },
  { label: 'Sales Activity', value: 'sales' },
  { label: 'Lead Generation', value: 'lead_generation' },
  { label: 'Setup/Breakdown', value: 'setup' },
  { label: 'Stock Management', value: 'stock_management' },
  { label: 'Training', value: 'training' },
  { label: 'Administrative', value: 'administrative' },
  { label: 'Break', value: 'break' },
  { label: 'Other', value: 'other' }
]

// Engagement types
const engagementTypes = [
  { label: 'Face-to-Face Conversation', value: 'conversation' },
  { label: 'Product Explanation', value: 'explanation' },
  { label: 'Sample Distribution', value: 'sampling' },
  { label: 'Survey/Feedback', value: 'survey' },
  { label: 'Contest/Game', value: 'contest' },
  { label: 'Social Media', value: 'social_media' }
]

// Outcome options
const outcomeOptions = [
  { label: 'Successful', value: 'successful' },
  { label: 'Partially Successful', value: 'partial' },
  { label: 'Challenging', value: 'challenging' },
  { label: 'Unsuccessful', value: 'unsuccessful' },
  { label: 'Requires Follow-up', value: 'follow_up' }
]

// Computed
const todayActivities = computed(() => promoterStore.getTodayActivities)

const activityStats = computed(() => {
  const activities = todayActivities.value
  return {
    totalCustomers: activities
      .filter(a => a.type === 'customer_engagement')
      .reduce((sum, a) => sum + (a.participants || 0), 0),
    totalDemos: activities.filter(a => a.type === 'product_demo').length,
    totalSales: activities
      .filter(a => a.type === 'sales')
      .reduce((sum, a) => sum + (a.salesAmount || 0), 0),
    totalTime: Math.round(activities
      .reduce((sum, a) => sum + (a.duration || 0), 0) / 60 * 10) / 10
  }
})

// Methods
const logQuickActivity = async (activity) => {
  selectedActivity.value = activity
  loading.value = true
  
  try {
    const activityData = {
      type: activity.type,
      description: `${activity.label} logged`,
      duration: null,
      participants: 0,
      notes: 'Quick activity logged'
    }
    
    await promoterStore.logActivity(props.activationId, activityData)
    
    toast.add({
      severity: 'success',
      summary: 'Activity Logged',
      detail: `${activity.label} has been logged`,
      life: 3000
    })
    
    emit('activity-logged', activityData)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Logging Failed',
      detail: error.message || 'Failed to log activity',
      life: 5000
    })
  } finally {
    loading.value = false
    selectedActivity.value = null
  }
}

const logDetailedActivity = async () => {
  if (!validateForm()) return
  
  loading.value = true
  
  try {
    // Upload photos first if any
    const photoUrls = []
    if (selectedPhotos.value.length > 0) {
      for (const photo of selectedPhotos.value) {
        const result = await promoterStore.uploadImage(
          props.activationId, 
          photo, 
          'activity'
        )
        photoUrls.push(result.url)
      }
    }
    
    const activityPayload = {
      ...activityData.value,
      photos: photoUrls
    }
    
    await promoterStore.logActivity(props.activationId, activityPayload)
    
    toast.add({
      severity: 'success',
      summary: 'Activity Logged',
      detail: 'Detailed activity has been logged successfully',
      life: 3000
    })
    
    resetForm()
    emit('activity-logged', activityPayload)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Logging Failed',
      detail: error.message || 'Failed to log detailed activity',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

const validateForm = () => {
  errors.value = {}
  
  if (!activityData.value.type) {
    errors.value.type = 'Activity type is required'
  }
  
  if (!activityData.value.description?.trim()) {
    errors.value.description = 'Description is required'
  }
  
  return Object.keys(errors.value).length === 0
}

const resetForm = () => {
  activityData.value = {
    type: '',
    description: '',
    duration: null,
    participants: 0,
    salesAmount: null,
    engagementTypes: [],
    outcome: '',
    notes: ''
  }
  selectedPhotos.value = []
  errors.value = {}
}

const onPhotosSelect = (event) => {
  selectedPhotos.value = event.files
}

const editActivity = (activity) => {
  // Implement edit functionality if needed
  console.log('Edit activity:', activity)
}

const getActivityIcon = (type) => {
  const icons = {
    customer_engagement: 'pi pi-users',
    product_demo: 'pi pi-play',
    sales: 'pi pi-dollar',
    lead_generation: 'pi pi-send',
    setup: 'pi pi-cog',
    stock_management: 'pi pi-box',
    training: 'pi pi-book',
    administrative: 'pi pi-file',
    break: 'pi pi-pause',
    other: 'pi pi-circle'
  }
  return icons[type] || 'pi pi-circle'
}

const getActivityLabel = (type) => {
  const activity = activityTypes.find(a => a.value === type)
  return activity?.label || type
}

const getOutcomeSeverity = (outcome) => {
  const severities = {
    successful: 'success',
    partial: 'warning',
    challenging: 'warning',
    unsuccessful: 'danger',
    follow_up: 'info'
  }
  return severities[outcome] || 'info'
}

const formatTime = (timestamp) => {
  return format(new Date(timestamp), 'HH:mm')
}

// Lifecycle
onMounted(() => {
  // Load today's activities if not already loaded
  if (promoterStore.activities.length === 0) {
    promoterStore.fetchActivities(props.activationId)
  }
})
</script>

<style scoped>
.activity-logger {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.activity-btn {
  height: 3rem;
  justify-content: center;
}

.activity-form .form-group {
  margin-bottom: 1.5rem;
}

.activity-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.activity-form label.required::after {
  content: ' *';
  color: var(--red-500);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.no-activities {
  text-align: center;
  padding: 2rem;
  color: var(--text-color-secondary);
}

.no-activities i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--surface-200);
  border-radius: 8px;
  background: var(--surface-50);
}

.activity-icon {
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

.activity-content {
  flex: 1;
}

.activity-content h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.activity-content .description {
  margin: 0 0 0.75rem 0;
  color: var(--text-color);
  line-height: 1.4;
}

.activity-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.activity-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.activity-actions {
  flex-shrink: 0;
}

.outcome {
  margin-top: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
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

.stat-icon.customer {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.demos {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.sales {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-icon.time {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
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

.help-text {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .quick-buttons {
    grid-template-columns: 1fr 1fr;
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
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .activity-meta {
    justify-content: space-between;
  }
}
</style>
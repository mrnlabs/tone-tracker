<template>
  <div class="promoter-dashboard">
    <div class="dashboard-header">
      <h1>Welcome, {{ promoterName }}</h1>
      <p>Your activation assignments and performance</p>
    </div>

    <!-- Today's Schedule -->
    <Card class="today-schedule">
      <template #header>
        <h2>Today's Schedule</h2>
      </template>
      <template #content>
        <!-- DEBUG: Show data loading status -->
        <div style="background: #f0f0f0; padding: 10px; margin-bottom: 10px; font-size: 12px;">
          <strong>DEBUG DATA STATUS:</strong><br>
          Loading: {{ loading }}<br>
          todayActivations.length: {{ todayActivations.length }}<br>
          todayActivations data: {{ JSON.stringify(todayActivations, null, 2) }}<br>
          promoterStore data: {{ JSON.stringify(promoterStore.todayActivations, null, 2) }}
        </div>
        
        <div v-if="todayActivations.length === 0" class="no-schedule">
          <i class="pi pi-calendar-times"></i>
          <p>No activations scheduled for today</p>
          <p style="color: red; font-size: 12px;">DEBUG: Check if data is loading or if there's no data from API</p>
        </div>
        <div v-else class="schedule-list">
          <div
              v-for="activation in todayActivations"
              :key="activation.id"
              class="schedule-item"
          >
            <div class="schedule-time">
              <span class="time">{{ activation.startTime }}</span>
              <span class="duration">{{ activation.duration }}h</span>
            </div>
            <div class="schedule-details">
              <h3>{{ activation.name }}</h3>
              <p class="location">
                <i class="pi pi-map-marker"></i>
                {{ activation.location }}
              </p>
              <p class="client">{{ activation.client }}</p>
            </div>
            <div class="schedule-actions">
              <!-- DEBUG INFO - Remove this after troubleshooting -->
              <div class="debug-info" style="font-size: 11px; color: red; margin-bottom: 8px;">
                DEBUG: checkedIn={{ activation.checkedIn }}, checkedOut={{ activation.checkedOut }}, 
                checkInTime={{ activation.checkInTime }}, checkOutTime={{ activation.checkOutTime }}
              </div>
              
              <Button
                  v-if="!activation.checkedIn"
                  @click="checkIn(activation.id)"
                  label="Check In"
                  icon="pi pi-sign-in"
                  class="p-button-success p-button-sm"
              />
              <div v-else-if="!activation.checkedOut" class="checkout-section">
                <div style="color: green; font-size: 12px; margin-bottom: 4px;">
                  SHOULD SHOW CHECKOUT BUTTON (checkedIn=true, checkedOut=false)
                </div>
                <div class="attendance-info">
                  <small class="attendance-id" v-if="getAttendanceRecord(activation.id)">
                    Attendance: #{{ getAttendanceRecord(activation.id) }}
                  </small>
                  <small class="checkin-time">
                    Checked in: {{ formatTime(activation.checkInTime) }}
                  </small>
                </div>
                <Button
                    @click="openCheckoutDialog(activation)"
                    label="Check Out"
                    icon="pi pi-sign-out"
                    class="p-button-warning p-button-sm"
                />
              </div>
              <div v-else class="completed-section">
                <div style="color: blue; font-size: 12px; margin-bottom: 4px;">
                  COMPLETED (checkedIn=true, checkedOut=true)
                </div>
                <div class="attendance-info">
                  <small class="attendance-id" v-if="getAttendanceRecord(activation.id)">
                    Record: #{{ getAttendanceRecord(activation.id) }}
                  </small>
                  <small class="completion-time">
                    Completed: {{ formatTime(activation.checkOutTime) }}
                  </small>
                </div>
                <Tag value="Completed" class="status-completed" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Performance Stats -->
    <div class="stats-grid">
      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon assignments">
              <i class="pi pi-briefcase"></i>
            </div>
            <div class="stat-info">
              <h3>This Month</h3>
              <p class="stat-number">{{ stats.monthlyAssignments }}</p>
              <span class="stat-label">Assignments</span>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon completed">
              <i class="pi pi-check-circle"></i>
            </div>
            <div class="stat-info">
              <h3>Completed</h3>
              <p class="stat-number">{{ stats.completedActivations }}</p>
              <span class="stat-label">Activations</span>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon hours">
              <i class="pi pi-clock"></i>
            </div>
            <div class="stat-info">
              <h3>Total Hours</h3>
              <p class="stat-number">{{ stats.totalHours }}</p>
              <span class="stat-label">This Month</span>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon rating">
              <i class="pi pi-star"></i>
            </div>
            <div class="stat-info">
              <h3>Rating</h3>
              <p class="stat-number">{{ stats.averageRating }}</p>
              <span class="stat-label">Average</span>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Recent Activations -->
    <Card class="recent-activations">
      <template #header>
        <h2>Recent Activations</h2>
      </template>
      <template #content>
        <DataTable :value="recentActivations" responsiveLayout="scroll">
          <Column field="name" header="Activation"></Column>
          <Column field="client" header="Client"></Column>
          <Column field="date" header="Date">
            <template #body="{ data }">
              {{ formatDate(data.date) }}
            </template>
          </Column>
          <Column field="hours" header="Hours"></Column>
          <Column field="status" header="Status">
            <template #body="{ data }">
              <Tag
                  :value="data.status"
                  :class="getStatusClass(data.status)"
              />
            </template>
          </Column>
          <Column field="rating" header="Rating">
            <template #body="{ data }">
              <div class="rating-display" v-if="data.rating">
                <i class="pi pi-star-fill"></i>
                <span>{{ data.rating }}/5</span>
              </div>
              <span v-else class="no-rating">Not rated</span>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Quick Actions -->
    <Card class="quick-actions">
      <template #header>
        <h2>Quick Actions</h2>
      </template>
      <template #content>
        <div class="action-grid">
          <Button
              @click="$router.push('/activations')"
              icon="pi pi-calendar"
              label="View Schedule"
              class="p-button-outlined action-btn"
          />
          <Button
              @click="$router.push('/profile')"
              icon="pi pi-user"
              label="Update Profile"
              class="p-button-outlined action-btn"
          />
          <Button
              @click="$router.push('/support')"
              icon="pi pi-question-circle"
              label="Support"
              class="p-button-outlined action-btn"
          />
        </div>
      </template>
    </Card>

    <!-- Quick Checkout Dialog -->
    <Dialog
      v-model:visible="showCheckoutDialog"
      :header="`Check Out - ${selectedActivation?.name}`"
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div class="checkout-dialog" v-if="selectedActivation">
        <div class="activation-summary">
          <h4>{{ selectedActivation.name }}</h4>
          <p><strong>Location:</strong> {{ selectedActivation.location }}</p>
          <p><strong>Client:</strong> {{ selectedActivation.client }}</p>
          <div class="attendance-details">
            <span class="attendance-label">Attendance Record:</span>
            <span class="attendance-value">#{{ getAttendanceRecord(selectedActivation.id) }}</span>
          </div>
          <div class="time-details">
            <span>Checked in at: {{ formatTime(selectedActivation.checkInTime) }}</span>
          </div>
        </div>

        <Divider />

        <form @submit.prevent="performQuickCheckout" class="checkout-form">
          <div class="form-group">
            <label for="workSummary" class="required">Work Summary</label>
            <Textarea
              id="workSummary"
              v-model="checkoutData.summary"
              rows="3"
              placeholder="Brief summary of work completed"
              class="w-full"
              required
            />
          </div>

          <div class="form-group">
            <label for="activities">Activities Completed</label>
            <MultiSelect
              id="activities"
              v-model="checkoutData.activities"
              :options="activityOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select completed activities"
              display="chip"
              class="w-full"
            />
          </div>

          <div class="form-group">
            <label for="additionalNotes">Additional Notes</label>
            <Textarea
              id="additionalNotes"
              v-model="checkoutData.notes"
              rows="2"
              placeholder="Any additional notes"
              class="w-full"
            />
          </div>

          <div class="dialog-actions">
            <Button
              type="button"
              @click="showCheckoutDialog = false"
              label="Cancel"
              class="p-button-outlined"
            />
            <Button
              type="submit"
              :loading="promoterStore.loading.checkIn"
              label="Check Out"
              icon="pi pi-sign-out"
              class="p-button-warning"
            />
          </div>
        </form>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePromoterStore } from '@/stores/promoter'
import { useToast } from 'primevue/usetoast'
import { format } from 'date-fns'

const authStore = useAuthStore()
const promoterStore = usePromoterStore()
const toast = useToast()

const promoterName = computed(() => {
  return authStore.user?.firstName || 'Promoter'
})

// Get data from promoter store
const stats = computed(() => promoterStore.dashboardStats)
const todayActivations = computed(() => promoterStore.todayActivations)
const recentActivations = computed(() => promoterStore.recentActivations)
const loading = computed(() => promoterStore.loading.dashboard)

// Checkout dialog state
const showCheckoutDialog = ref(false)
const selectedActivation = ref(null)
const checkoutData = ref({
  summary: '',
  activities: [],
  notes: ''
})

// Activity options for checkout
const activityOptions = [
  { label: 'Product Demonstration', value: 'demo' },
  { label: 'Customer Engagement', value: 'engagement' },
  { label: 'Sales', value: 'sales' },
  { label: 'Stock Management', value: 'stock' },
  { label: 'Setup/Breakdown', value: 'setup' },
  { label: 'Training', value: 'training' },
  { label: 'Administrative Tasks', value: 'admin' }
]

onMounted(async () => {
  try {
    await promoterStore.initializeDashboard()
    
    // DEBUG: Add mock data if no real data is available
    if (promoterStore.todayActivations.length === 0) {
      console.log('DEBUG: No real data, adding mock data for testing')
      promoterStore.todayActivations = [
        {
          id: 1,
          name: 'Mall Activation - Product Demo',
          location: 'Westfield Mall',
          client: 'ABC Company',
          startTime: '09:00',
          endTime: '17:00',
          duration: 8,
          checkedIn: false,
          checkedOut: false,
          checkInTime: null,
          checkOutTime: null
        },
        {
          id: 2,
          name: 'Store Promotion Event',
          location: 'Downtown Store',
          client: 'XYZ Brand',
          startTime: '10:00', 
          endTime: '16:00',
          duration: 6,
          checkedIn: true,
          checkedOut: false,
          checkInTime: '2025-07-22T02:05:00Z',
          checkOutTime: null
        },
        {
          id: 3,
          name: 'Product Launch Event',
          location: 'Convention Center',
          client: 'Tech Corp',
          startTime: '08:00',
          endTime: '18:00', 
          duration: 10,
          checkedIn: true,
          checkedOut: true,
          checkInTime: '2025-07-22T00:18:00Z',
          checkOutTime: '2025-07-22T01:19:00Z'
        }
      ]
      
      // Mock check-in status for the promoter store
      promoterStore.checkInStatus = {
        2: {
          checkedIn: true,
          checkInTime: '2025-07-22T02:05:00Z',
          attendanceRecord: 'ATT-12345'
        },
        3: {
          checkedIn: true,
          checkedOut: true,
          checkInTime: '2025-07-22T00:18:00Z',
          checkOutTime: '2025-07-22T01:19:00Z',
          attendanceRecord: 'ATT-12344'
        }
      }
    }
  } catch (error) {
    console.error('Dashboard initialization error:', error)
    toast.add({
      severity: 'error',
      summary: 'Loading Error',
      detail: 'Failed to load dashboard data',
      life: 5000
    })
  }
})

const checkIn = async (activationId) => {
  try {
    const location = await getCurrentLocation()
    const result = await promoterStore.checkIn(activationId, { location })
    
    // Update local activation state to show checkout button
    const activation = todayActivations.value.find(a => a.id === activationId)
    if (activation) {
      activation.checkedIn = true
      activation.checkInTime = result.checkInTime || new Date().toISOString()
    }
    
    toast.add({
      severity: 'success',
      summary: 'Checked In',
      detail: 'Successfully checked in to activation',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Check-in Failed',
      detail: error.message || 'Failed to check in',
      life: 5000
    })
  }
}

const checkOut = async (activationId) => {
  try {
    const location = await getCurrentLocation()
    await promoterStore.checkOut(activationId, { 
      location,
      summary: 'Work completed successfully'
    })
    
    toast.add({
      severity: 'success',
      summary: 'Checked Out',
      detail: 'Successfully checked out from activation',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Check-out Failed',
      detail: error.message || 'Failed to check out',
      life: 5000
    })
  }
}

const getCurrentLocation = () => {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        () => resolve(null)
      )
    } else {
      resolve(null)
    }
  })
}

const formatDate = (dateString) => {
  return format(new Date(dateString), 'MMM dd, yyyy')
}

const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A'
  return format(new Date(timestamp), 'HH:mm')
}

const getAttendanceRecord = (activationId) => {
  return promoterStore.checkInStatus[activationId]?.attendanceRecord
}

const openCheckoutDialog = (activation) => {
  selectedActivation.value = activation
  checkoutData.value = {
    summary: '',
    activities: [],
    notes: ''
  }
  showCheckoutDialog.value = true
}

const performQuickCheckout = async () => {
  if (!selectedActivation.value || !checkoutData.value.summary.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Validation Error',
      detail: 'Please provide a work summary',
      life: 3000
    })
    return
  }

  try {
    const location = await getCurrentLocation()
    const result = await promoterStore.checkOut(selectedActivation.value.id, {
      summary: checkoutData.value.summary,
      activities: checkoutData.value.activities,
      location,
      notes: checkoutData.value.notes
    })
    
    // Update local activation state to show completed status
    const activation = todayActivations.value.find(a => a.id === selectedActivation.value.id)
    if (activation) {
      activation.checkedOut = true
      activation.checkOutTime = result.checkOutTime || new Date().toISOString()
    }
    
    toast.add({
      severity: 'success',
      summary: 'Checked Out',
      detail: `Successfully checked out from ${selectedActivation.value.name}`,
      life: 3000
    })
    
    showCheckoutDialog.value = false
    selectedActivation.value = null
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Check-out Failed',
      detail: error.message || 'Failed to check out',
      life: 5000
    })
  }
}

const getStatusClass = (status) => {
  const classes = {
    'Completed': 'status-completed',
    'In Progress': 'status-progress',
    'Cancelled': 'status-cancelled'
  }
  return classes[status] || 'status-default'
}
</script>

<style scoped>
.promoter-dashboard {
  padding: 2rem;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  color: var(--text-color-secondary);
  margin: 0;
}

.today-schedule {
  margin-bottom: 2rem;
}

.no-schedule {
  text-align: center;
  padding: 2rem;
  color: var(--text-color-secondary);
}

.no-schedule i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.schedule-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--surface-200);
  border-radius: 8px;
  background: var(--surface-50);
}

.schedule-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
  margin-right: 1rem;
}

.schedule-time .time {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-color);
}

.schedule-time .duration {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
}

.schedule-details {
  flex: 1;
}

.schedule-details h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.schedule-details .location {
  margin: 0 0 0.25rem 0;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.schedule-details .location i {
  margin-right: 0.25rem;
}

.schedule-details .client {
  margin: 0;
  color: var(--text-color);
  font-weight: 500;
  font-size: 0.9rem;
}

.schedule-actions {
  margin-left: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
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

.stat-icon.assignments {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.completed {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.hours {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.stat-icon.rating {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-info h3 {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  font-weight: 500;
}

.stat-number {
  margin: 0.25rem 0 0 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-color-secondary);
}

.recent-activations,
.quick-actions {
  margin-bottom: 2rem;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--orange-500);
}

.no-rating {
  color: var(--text-color-secondary);
  font-style: italic;
  font-size: 0.9rem;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  justify-content: flex-start;
  padding: 1rem;
  height: auto;
}

/* Status styling */
:deep(.status-completed) {
  background: #d1fae5 !important;
  color: #065f46 !important;
}

:deep(.status-progress) {
  background: #dbeafe !important;
  color: #1e40af !important;
}

:deep(.status-cancelled) {
  background: #fee2e2 !important;
  color: #991b1b !important;
}

/* Checkout section styles */
.checkout-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.attendance-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.attendance-id {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 0.75rem;
}

.checkin-time {
  color: var(--text-color-secondary);
  font-size: 0.75rem;
}

.completed-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.completion-time {
  color: var(--text-color-secondary);
  font-size: 0.75rem;
}

/* Dialog styles */
.checkout-dialog {
  padding: 1rem 0;
}

.activation-summary {
  margin-bottom: 1rem;
}

.activation-summary h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.attendance-details,
.time-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.attendance-label {
  font-weight: 500;
  color: var(--text-color-secondary);
}

.attendance-value {
  font-weight: 600;
  color: var(--primary-color);
  font-family: monospace;
}

.checkout-form .form-group {
  margin-bottom: 1rem;
}

.checkout-form label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.9rem;
}

.checkout-form label.required::after {
  content: ' *';
  color: var(--red-500);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .promoter-dashboard {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .schedule-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .schedule-time {
    margin-right: 0;
  }

  .schedule-actions {
    margin-left: 0;
    align-self: stretch;
  }

  .checkout-section,
  .completed-section {
    align-items: flex-start;
    width: 100%;
  }

  .attendance-info {
    align-items: flex-start;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }

  .dialog-actions {
    flex-direction: column;
  }

  .dialog-actions .p-button {
    width: 100%;
  }
}
</style>
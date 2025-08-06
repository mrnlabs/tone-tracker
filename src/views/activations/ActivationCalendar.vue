<template>
  <DashboardLayout>
    <div class="activation-calendar-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <i class="pi pi-calendar-plus"></i>
          </div>
          <div class="header-text">
            <h1 class="page-title">Activation Calendar</h1>
            <p class="page-description">
              View your scheduled activations and manage your timeline
            </p>
          </div>
        </div>
        
        <div class="header-actions">
          <Button
            @click="refreshCalendar"
            icon="pi pi-refresh"
            :loading="loading"
            severity="secondary"
            outlined
            rounded
          />
          
          <Button
            @click="goToToday"
            icon="pi pi-home"
            label="Today"
            severity="success"
            outlined
            rounded
          />
        </div>
      </div>

      <!-- Calendar Controls -->
      <Card class="calendar-controls-card modern-card">
        <template #content>
          <div class="calendar-controls">
            <div class="view-indicator">
              <div class="view-badge">
                <i class="pi pi-calendar"></i>
                <span>Month View</span>
              </div>
            </div>

            <div class="date-navigation">
              <Button
                @click="navigateDate(-1)"
                icon="pi pi-chevron-left"
                severity="secondary"
                text
                rounded
                class="nav-button"
              />
              <div class="current-period-container">
                <h3 class="current-period">{{ formatCurrentPeriod() }}</h3>
                <div class="period-dots">
                  <span class="dot active"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </div>
              </div>
              <Button
                @click="navigateDate(1)"
                icon="pi pi-chevron-right"
                severity="secondary"
                text
                rounded
                class="nav-button"
              />
            </div>

            <div class="filter-controls">
              <div class="filter-group">
                <label class="filter-label">Filter by status</label>
                <Select
                  v-model="statusFilter"
                  :options="statusFilterOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="All Statuses"
                  showClear
                  class="modern-dropdown"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <ProgressSpinner />
        <p>Loading activations...</p>
      </div>

      <!-- Calendar Content -->
      <div v-else class="calendar-container">
        <!-- Month View -->
        <Card v-if="currentView === 'month'" class="calendar-card modern-calendar">
          <template #content>
            <div class="month-calendar">
              <div class="month-header">
                <div class="weekday-headers">
                  <div 
                    v-for="day in weekdays" 
                    :key="day" 
                    class="weekday-header"
                  >
                    <span class="weekday-full">{{ {
                      'Sun': 'Sunday',
                      'Mon': 'Monday', 
                      'Tue': 'Tuesday',
                      'Wed': 'Wednesday',
                      'Thu': 'Thursday',
                      'Fri': 'Friday',
                      'Sat': 'Saturday'
                    }[day] }}</span>
                    <span class="weekday-short">{{ day }}</span>
                  </div>
                </div>
              </div>
              
              <div class="month-grid">
                <div
                  v-for="date in monthDates"
                  :key="date.dateKey"
                  :class="['date-cell', {
                    'other-month': !date.isCurrentMonth,
                    'today': date.isToday,
                    'has-activations': date.activations.length > 0,
                    'weekend': isWeekend(date.date)
                  }]"
                  @click="selectDate(date)"
                >
                  <div class="date-header">
                    <div class="date-number">{{ date.day }}</div>
                  </div>
                  
                  <div class="activations-preview">
                    <div
                      v-for="(activation, index) in date.activations.slice(0, 2)"
                      :key="activation.id"
                      :class="['activation-chip', `status-${activation.status.toLowerCase()}`]"
                      @click.stop="viewActivation(activation)"
                      :style="{ animationDelay: `${index * 0.1}s` }"
                    >
                      <div class="activation-dot"></div>
                      <span class="activation-text">
                        {{ activation.name.length > 12 ? activation.name.substring(0, 12) + '...' : activation.name }}
                      </span>
                    </div>
                    
                    <div
                      v-if="date.activations.length > 2"
                      class="more-activations"
                      @click.stop="showAllActivations(date)"
                    >
                      <i class="pi pi-plus"></i>
                      <span>{{ date.activations.length - 2 }} more</span>
                    </div>
                  </div>
                  
                  <!-- Hover overlay -->
                  <div 
                    class="date-overlay" 
                    @click.stop="viewDateDetails(date)"
                    v-if="date.activations.length > 0"
                  >
                    <i class="pi pi-eye"></i>
                    <span v-if="date.activations.length === 1">View Activation</span>
                    <span v-else>View {{ date.activations.length }} Activations</span>
                  </div>
                  
                  <!-- Empty date overlay -->
                  <div 
                    class="date-overlay empty-date"
                    v-if="date.activations.length === 0"
                  >
                    <i class="pi pi-plus"></i>
                    <span>No Activations</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>

      </div>

      <!-- Legend -->
      <Card class="legend-card modern-legend">
        <template #content>
          <div class="calendar-legend">
            <div class="legend-header">
              <i class="pi pi-info-circle"></i>
              <h4>Activation Status</h4>
            </div>
            <div class="legend-grid">
              <div class="legend-item">
                <div class="legend-indicator">
                  <div class="legend-dot status-planned"></div>
                  <div class="legend-glow status-planned"></div>
                </div>
                <div class="legend-text">
                  <span class="legend-label">Planned</span>
                  <span class="legend-desc">Scheduled activations</span>
                </div>
              </div>
              <div class="legend-item">
                <div class="legend-indicator">
                  <div class="legend-dot status-active"></div>
                  <div class="legend-glow status-active"></div>
                </div>
                <div class="legend-text">
                  <span class="legend-label">Active</span>
                  <span class="legend-desc">Currently running</span>
                </div>
              </div>
              <div class="legend-item">
                <div class="legend-indicator">
                  <div class="legend-dot status-completed"></div>
                  <div class="legend-glow status-completed"></div>
                </div>
                <div class="legend-text">
                  <span class="legend-label">Completed</span>
                  <span class="legend-desc">Successfully finished</span>
                </div>
              </div>
              <div class="legend-item">
                <div class="legend-indicator">
                  <div class="legend-dot status-cancelled"></div>
                  <div class="legend-glow status-cancelled"></div>
                </div>
                <div class="legend-text">
                  <span class="legend-label">Cancelled</span>
                  <span class="legend-desc">Stopped or cancelled</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useActivationStore } from '@/stores/activation'
import { useToaster } from '@/composables/useToaster'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'

const router = useRouter()
const authStore = useAuthStore()
const activationStore = useActivationStore()
const toaster = useToaster()

// Reactive state
const loading = ref(true)
const currentView = ref('month')
const currentDate = ref(new Date())
const activations = ref([])
const statusFilter = ref(null)

// Calendar data
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Filter options
const statusFilterOptions = [
  { label: 'All Statuses', value: null },
  { label: 'Planned', value: 'PLANNED' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' }
]

// Computed properties
const filteredActivations = computed(() => {
  if (!statusFilter.value) return activations.value
  return activations.value.filter(activation => activation.status === statusFilter.value)
})

const monthDates = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  // Get first day of month and calculate calendar grid
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const dates = []
  const today = new Date()
  
  for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const dateActivations = getActivationsForDate(date)
    
    dates.push({
      date: new Date(date),
      day: date.getDate(),
      dateKey: date.toISOString().split('T')[0],
      isCurrentMonth: date.getMonth() === month,
      isToday: date.toDateString() === today.toDateString(),
      activations: dateActivations
    })
  }
  
  return dates
})


// Methods
const loadActivations = async () => {
  console.log('🚀 Starting loadActivations method!')
  try {
    loading.value = true
    
    // Get activations based on user role
    const userRole = authStore.userRole
    let userActivations = []
    
    console.log('=== CALENDAR DEBUG ===')
    console.log('Auth Store Info:', {
      userId: authStore.userId,
      userRole: authStore.userRole,
      user: authStore.user,
      isAuthenticated: authStore.isAuthenticated
    })
    
    if (userRole === 'ACTIVATION_MANAGER') {
      // Get ALL activations where this user is assigned in ANY capacity
      console.log('Loading ALL activations where ACTIVATION_MANAGER is assigned:', authStore.userId)
      try {
        // First try to get all activations and filter for assigned ones
        await activationStore.fetchActivations()
        const allActivations = activationStore.activations || []
        
        console.log('Raw activations from store:', {
          count: allActivations.length,
          activations: allActivations,
          firstActivation: allActivations[0]
        })
        
        // Filter for activations where the user is assigned in ANY capacity
        userActivations = allActivations.filter(activation => {
          const currentUserId = authStore.userId
          const currentUserIdString = String(currentUserId)
          const currentUserIdInt = parseInt(currentUserId)
          const managerIdInt = parseInt(activation.activationManagerId)
          const managerIdString = String(activation.activationManagerId)
          
          // Check if user is the activation manager
          const isManager = activation.activationManagerId && (
            activation.activationManagerId === currentUserId ||
            activation.activationManagerId === currentUserIdInt ||
            managerIdInt === currentUserIdInt ||
            managerIdString === currentUserIdString
          )
          
          // Check if user is assigned as a promoter
          const isPromoter = activation.assignedPromoterIds && Array.isArray(activation.assignedPromoterIds) && 
            (activation.assignedPromoterIds.includes(currentUserIdInt) ||
             activation.assignedPromoterIds.includes(currentUserId) ||
             activation.assignedPromoterIds.includes(currentUserIdString))
          
          // Check other assignment methods
          const isOtherAssignment = activation.assignedTo === authStore.userId ||
                                   activation.assignedTo === authStore.user?.id ||
                                   (activation.team && activation.team.some(member => 
                                     member.id === authStore.userId || member.userId === authStore.userId
                                   )) ||
                                   (activation.assignedUsers && activation.assignedUsers.some(user =>
                                     user.id === authStore.userId || user.userId === authStore.userId
                                   ))
          
          const isAssigned = isManager || isPromoter || isOtherAssignment
          
          console.log(`📋 Activation ${activation.id} (${activation.name}):`, {
            activationManagerId: activation.activationManagerId,
            activationManagerName: activation.activationManagerName,
            assignedPromoterIds: activation.assignedPromoterIds,
            currentUserId: currentUserId,
            currentUserIdInt: currentUserIdInt,
            currentUserIdString: currentUserIdString,
            isManager: isManager,
            isPromoter: isPromoter,
            isOtherAssignment: isOtherAssignment,
            '🎯 FINAL_ASSIGNED': isAssigned
          })
          
          return isAssigned
        })
        
        console.log('🎯 ACTIVATION_MANAGER FINAL RESULTS:', {
          totalChecked: allActivations.length,
          totalAssigned: userActivations.length,
          assignedActivationIds: userActivations.map(a => a.id),
          assignedActivationNames: userActivations.map(a => a.name)
        })
      } catch (error) {
        console.log('Failed to load all activations, trying manager-specific endpoint')
        const response = await activationStore.getActivationsByManager(authStore.userId)
        userActivations = response.data || response || []
        console.log('ACTIVATION_MANAGER fallback activations:', userActivations.length, userActivations)
      }
    } else if (userRole === 'PROMOTER') {
      // Get activations assigned to this promoter
      console.log('Loading activations assigned to PROMOTER:', authStore.userId)
      try {
        // First try to get all activations and filter for assigned ones
        await activationStore.fetchActivations()
        const allActivations = activationStore.activations || []
        
        // Filter for activations where the user is in assignedPromoterIds
        userActivations = allActivations.filter(activation => {
          const isAssigned = activation.assignedPromoterIds && 
                            (activation.assignedPromoterIds.includes(parseInt(authStore.userId)) ||
                             activation.assignedPromoterIds.includes(authStore.userId))
          
          console.log(`Activation ${activation.id} (${activation.name}):`, {
            assignedPromoterIds: activation.assignedPromoterIds,
            currentUserId: authStore.userId,
            currentUserIdInt: parseInt(authStore.userId),
            isAssigned
          })
          
          return isAssigned
        })
        
        console.log('PROMOTER filtered activations:', userActivations.length, userActivations)
      } catch (error) {
        console.log('Failed to load all activations, trying promoter-specific endpoint')
        const response = await activationStore.getActivationsByPromoter(authStore.userId)
        userActivations = response.data || response || []
      }
    } else {
      // Fallback for other roles (including ADMIN)
      console.log('Loading all activations for role:', userRole)
      await activationStore.fetchActivations()
      userActivations = activationStore.activations || []
      console.log('Fallback loaded activations:', userActivations.length, userActivations)
    }
    
    // Additional fallback for ACTIVATION_MANAGER if no activations were found
    if (userRole === 'ACTIVATION_MANAGER' && userActivations.length === 0) {
      console.log('No assigned activations found for ACTIVATION_MANAGER')
      // If truly no activations are assigned, we'll show the empty calendar rather than mock data
    }

    // Process activations data
    activations.value = userActivations.map(activation => ({
      ...activation,
      startDate: activation.startDate ? new Date(activation.startDate) : null,
      endDate: activation.endDate ? new Date(activation.endDate) : null,
      startTime: activation.startTime || '09:00',
      endTime: activation.endTime || '17:00'
    }))
    
    console.log('Final processed activations for calendar:', {
      count: activations.value.length,
      activations: activations.value,
      userRole: userRole,
      userId: authStore.userId
    })
    
  } catch (error) {
    console.error('Error loading calendar activations:', error)
    toaster.error('Failed to load activation calendar')
    
    // Use mock data for demonstration
    activations.value = generateMockActivations()
  } finally {
    loading.value = false
  }
  
  // Final check - if we still have no activations, log the result
  if (activations.value.length === 0) {
    console.log(`No activations loaded for ${authStore.userRole}`)
  }
}

const generateMockActivations = () => {
  const mockActivations = []
  const today = new Date()
  
  // Generate some mock activations for the next 30 days
  for (let i = 0; i < 10; i++) {
    const startDate = new Date(today)
    startDate.setDate(today.getDate() + (i * 3) - 5)
    
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 1)
    
    mockActivations.push({
      id: i + 1,
      name: `Activation ${i + 1}`,
      clientCompanyName: `Client ${i + 1}`,
      locationName: `Location ${i + 1}`,
      startDate,
      endDate,
      startTime: '09:00',
      endTime: '17:00',
      status: ['PLANNED', 'ACTIVE', 'COMPLETED'][Math.floor(Math.random() * 3)]
    })
  }
  
  return mockActivations
}

const getActivationsForDate = (date) => {
  const dateString = date.toISOString().split('T')[0]
  
  return filteredActivations.value.filter(activation => {
    if (!activation.startDate) return false
    
    const activationStart = activation.startDate.toISOString().split('T')[0]
    const activationEnd = activation.endDate ? activation.endDate.toISOString().split('T')[0] : activationStart
    
    return dateString >= activationStart && dateString <= activationEnd
  })
}


const formatCurrentPeriod = () => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  return new Date(year, month).toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })
}


const getStatusSeverity = (status) => {
  const severityMap = {
    'PLANNED': 'info',
    'ACTIVE': 'success',
    'COMPLETED': 'secondary',
    'CANCELLED': 'danger'
  }
  return severityMap[status] || 'info'
}

const navigateDate = (direction) => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + direction)
  currentDate.value = newDate
}

const goToToday = () => {
  currentDate.value = new Date()
}

const selectDate = (dateObj) => {
  currentDate.value = new Date(dateObj.date)
  
  // If there are activations on this date, show details
  if (dateObj.activations.length > 0) {
    viewDateDetails(dateObj)
  }
}

const viewActivation = (activation) => {
  router.push(`/activations/${activation.id}`)
}

const refreshCalendar = () => {
  loadActivations()
}

const isWeekend = (date) => {
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday or Saturday
}

const showAllActivations = (dateObj) => {
  if (dateObj.activations.length === 1) {
    // If only one activation, go directly to it
    viewActivation(dateObj.activations[0])
  } else {
    // Show details for the selected date
    viewDateDetails(dateObj)
  }
}

const viewDateDetails = (dateObj) => {
  if (dateObj.activations.length === 0) {
    toaster.info('No activations scheduled for this date')
    return
  }
  
  if (dateObj.activations.length === 1) {
    // If only one activation, go directly to it
    viewActivation(dateObj.activations[0])
  } else {
    // Show a summary of all activations for this date
    const dateStr = dateObj.date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    const activationsList = dateObj.activations.map(activation => 
      `• ${activation.name} (${activation.status.toLowerCase()})`
    ).join('\n')
    
    const message = `Activations for ${dateStr}:\n\n${activationsList}\n\nClick on an individual activation to view details.`
    
    toaster.info(message)
  }
}

// Watchers
watch([currentView, statusFilter], () => {
  // Trigger reactivity when view or filter changes
})

// Lifecycle
onMounted(() => {
  console.log('📅 Calendar component mounted, calling loadActivations')
  loadActivations()
})
</script>

<style scoped>
/* Modern Calendar Styles */
.activation-calendar-page {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

/* Header Styles */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.header-text h1 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-text p {
  margin: 0;
  color: #718096;
  font-size: 1.1rem;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

/* Controls Card */
.calendar-controls-card.modern-card {
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
}

.calendar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  padding: 1rem;
}

.view-indicator {
  display: flex;
  align-items: center;
}

.view-badge {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3);
}

.date-navigation {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.nav-button:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.current-period-container {
  text-align: center;
  min-width: 250px;
}

.current-period {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 700;
}

.period-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e2e8f0;
  transition: all 0.3s ease;
}

.dot.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scale(1.2);
}

.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
}

.modern-dropdown {
  min-width: 180px;
}

/* Calendar Card */
.calendar-card.modern-calendar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  border-radius: 24px;
  overflow: hidden;
}

/* Month Calendar */
.month-calendar {
  width: 100%;
}

.weekday-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.weekday-header {
  padding: 1.5rem 1rem;
  text-align: center;
  color: white;
  font-weight: 700;
  position: relative;
}

.weekday-full {
  display: block;
  font-size: 1rem;
}

.weekday-short {
  display: none;
  font-size: 0.875rem;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8fafc;
}

.date-cell {
  background: white;
  min-height: 140px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.date-cell:hover {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.date-cell.other-month {
  background: #f7fafc;
  color: #a0aec0;
}

.date-cell.today {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.date-cell.today .date-number {
  color: white;
}

.date-cell.weekend {
  background: #fef9f3;
}

.date-cell.has-activations::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
}

.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.date-number {
  font-weight: 700;
  font-size: 1.125rem;
  color: #2d3748;
}


.activations-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.activation-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideInUp 0.3s ease forwards;
  opacity: 0;
  transform: translateY(10px);
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.activation-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.activation-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activation-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.activation-chip.status-planned {
  background: rgba(59, 130, 246, 0.1);
  color: #1e40af;
  border-color: rgba(59, 130, 246, 0.2);
}

.activation-chip.status-active {
  background: rgba(16, 185, 129, 0.1);
  color: #047857;
  border-color: rgba(16, 185, 129, 0.2);
}

.activation-chip.status-completed {
  background: rgba(107, 114, 128, 0.1);
  color: #374151;
  border-color: rgba(107, 114, 128, 0.2);
}

.activation-chip.status-cancelled {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border-color: rgba(239, 68, 68, 0.2);
}

.more-activations {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(107, 114, 128, 0.2);
}

.more-activations:hover {
  background: rgba(107, 114, 128, 0.2);
  transform: translateY(-1px);
}

.date-overlay {
  position: absolute;
  inset: 0;
  background: rgba(102, 126, 234, 0.9);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.date-cell:hover .date-overlay {
  opacity: 1;
}

.date-overlay.empty-date {
  background: rgba(107, 114, 128, 0.8);
  color: white;
}

.date-cell.other-month:hover .date-overlay.empty-date {
  opacity: 0.7;
}

/* Legend Card */
.legend-card.modern-legend {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
}

.legend-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  color: #2d3748;
}

.legend-header i {
  color: #667eea;
  font-size: 1.25rem;
}

.legend-header h4 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 16px;
  transition: all 0.3s ease;
  border: 1px solid rgba(226, 232, 240, 0.5);
}

.legend-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.9);
}

.legend-indicator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.legend-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  position: relative;
  z-index: 2;
}

.legend-glow {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  opacity: 0.3;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 0.1; }
}

.legend-dot.status-planned,
.legend-glow.status-planned {
  background: #3b82f6;
}

.legend-dot.status-active,
.legend-glow.status-active {
  background: #10b981;
}

.legend-dot.status-completed,
.legend-glow.status-completed {
  background: #6b7280;
}

.legend-dot.status-cancelled,
.legend-glow.status-cancelled {
  background: #ef4444;
}

.legend-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.legend-label {
  font-weight: 700;
  color: #2d3748;
  font-size: 0.95rem;
}

.legend-desc {
  font-size: 0.875rem;
  color: #718096;
}

/* Loading Container */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .calendar-controls {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .legend-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .activation-calendar-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .header-text h1 {
    font-size: 2rem;
  }

  .weekday-full {
    display: none;
  }

  .weekday-short {
    display: block;
  }

  .date-cell {
    min-height: 100px;
    padding: 0.75rem;
  }

  .current-period-container {
    min-width: auto;
  }

  .legend-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .date-cell {
    min-height: 80px;
    padding: 0.5rem;
  }

  .activation-chip {
    padding: 0.375rem 0.5rem;
    font-size: 0.7rem;
  }
  
  .header-icon {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }
}
</style>
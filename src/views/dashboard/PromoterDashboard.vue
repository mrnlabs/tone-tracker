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
        <div v-if="todayActivations.length === 0" class="no-schedule">
          <i class="pi pi-calendar-times"></i>
          <p>No activations scheduled for today</p>
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
              <Button
                  v-if="!activation.checkedIn"
                  @click="checkIn(activation.id)"
                  label="Check In"
                  icon="pi pi-sign-in"
                  class="p-button-success p-button-sm"
              />
              <Button
                  v-else-if="!activation.checkedOut"
                  @click="checkOut(activation.id)"
                  label="Check Out"
                  icon="pi pi-sign-out"
                  class="p-button-warning p-button-sm"
              />
              <Tag v-else value="Completed" class="status-completed" />
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
              @click="$router.push('/reports')"
              icon="pi pi-chart-bar"
              label="Performance"
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const promoterName = computed(() => {
  return authStore.user?.firstName || 'Promoter'
})

const stats = ref({
  monthlyAssignments: 0,
  completedActivations: 0,
  totalHours: 0,
  averageRating: 0
})

const todayActivations = ref([])
const recentActivations = ref([])

onMounted(() => {
  loadDashboardData()
})

const loadDashboardData = async () => {
  // Mock data - replace with actual API calls
  stats.value = {
    monthlyAssignments: 15,
    completedActivations: 12,
    totalHours: 96,
    averageRating: 4.7
  }

  todayActivations.value = [
    {
      id: 1,
      name: 'Product Demo',
      location: 'Shopping Mall A',
      client: 'Tech Corp',
      startTime: '09:00',
      duration: 4,
      checkedIn: false,
      checkedOut: false
    },
    {
      id: 2,
      name: 'Brand Activation',
      location: 'Downtown Plaza',
      client: 'Fashion Brand',
      startTime: '14:00',
      duration: 3,
      checkedIn: false,
      checkedOut: false
    }
  ]

  recentActivations.value = [
    {
      id: 1,
      name: 'Summer Campaign',
      client: 'ABC Corp',
      date: '2024-07-01',
      hours: 8,
      status: 'Completed',
      rating: 4.8
    },
    {
      id: 2,
      name: 'Product Launch',
      client: 'XYZ Ltd',
      date: '2024-06-28',
      hours: 6,
      status: 'Completed',
      rating: 4.5
    },
    {
      id: 3,
      name: 'Brand Awareness',
      client: 'Marketing Inc',
      date: '2024-06-25',
      hours: 4,
      status: 'Completed',
      rating: null
    }
  ]
}

const checkIn = (activationId) => {
  const activation = todayActivations.value.find(a => a.id === activationId)
  if (activation) {
    activation.checkedIn = true
    // In real app, send check-in data to backend
    console.log('Checked in to activation:', activationId)
  }
}

const checkOut = (activationId) => {
  const activation = todayActivations.value.find(a => a.id === activationId)
  if (activation) {
    activation.checkedOut = true
    // In real app, send check-out data to backend
    console.log('Checked out from activation:', activationId)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
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

  .action-grid {
    grid-template-columns: 1fr;
  }
}
</style>
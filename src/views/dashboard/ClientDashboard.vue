<template>
  <div class="client-dashboard">
    <div class="dashboard-header">
      <h1>Welcome back, {{ clientName }}</h1>
      <p>Here's an overview of your brand activations</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon active">
              <i class="pi pi-calendar"></i>
            </div>
            <div class="stat-info">
              <h3>Active Activations</h3>
              <p class="stat-number">{{ stats.activeActivations }}</p>
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
            </div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon upcoming">
              <i class="pi pi-clock"></i>
            </div>
            <div class="stat-info">
              <h3>Upcoming</h3>
              <p class="stat-number">{{ stats.upcomingActivations }}</p>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon total">
              <i class="pi pi-chart-bar"></i>
            </div>
            <div class="stat-info">
              <h3>Total Revenue</h3>
              <p class="stat-number">${{ stats.totalRevenue.toLocaleString() }}</p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Recent Activations -->
    <Card class="recent-activations">
      <template #header>
        <div class="card-header">
          <h2>Recent Activations</h2>
          <Button
              label="View All"
              icon="pi pi-external-link"
              class="p-button-text"
              @click="$router.push('/activations')"
          />
        </div>
      </template>
      <template #content>
        <DataTable :value="recentActivations" responsiveLayout="scroll">
          <Column field="name" header="Activation Name"></Column>
          <Column field="location" header="Location"></Column>
          <Column field="startDate" header="Start Date">
            <template #body="{ data }">
              {{ formatDate(data.startDate) }}
            </template>
          </Column>
          <Column field="status" header="Status">
            <template #body="{ data }">
              <Tag
                  :value="data.status"
                  :class="getStatusClass(data.status)"
              />
            </template>
          </Column>
          <Column header="Actions">
            <template #body="{ data }">
              <Button
                  icon="pi pi-eye"
                  class="p-button-text"
                  @click="viewActivation(data.id)"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const clientName = computed(() => {
  return authStore.user?.firstName || 'Client'
})

const stats = ref({
  activeActivations: 0,
  completedActivations: 0,
  upcomingActivations: 0,
  totalRevenue: 0
})

const recentActivations = ref([])

onMounted(() => {
  loadDashboardData()
})

const loadDashboardData = async () => {
  // Mock data - replace with actual API calls
  stats.value = {
    activeActivations: 3,
    completedActivations: 15,
    upcomingActivations: 2,
    totalRevenue: 125000
  }

  recentActivations.value = [
    {
      id: 1,
      name: 'Summer Campaign 2024',
      location: 'New York, NY',
      startDate: '2024-07-15',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Product Launch Event',
      location: 'Los Angeles, CA',
      startDate: '2024-07-10',
      status: 'Completed'
    },
    {
      id: 3,
      name: 'Brand Awareness Drive',
      location: 'Chicago, IL',
      startDate: '2024-07-20',
      status: 'Upcoming'
    }
  ]
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const getStatusClass = (status) => {
  const classes = {
    'Active': 'status-active',
    'Completed': 'status-completed',
    'Upcoming': 'status-upcoming',
    'Cancelled': 'status-cancelled'
  }
  return classes[status] || 'status-default'
}

const viewActivation = (activationId) => {
  // Navigate to activation details
  console.log('View activation:', activationId)
}
</script>

<style scoped>
.client-dashboard {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.stat-icon.active {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.completed {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.upcoming {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-icon.total {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.stat-info h3 {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  font-weight: 500;
}

.stat-number {
  margin: 0.25rem 0 0 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
}

.recent-activations {
  margin-top: 2rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.card-header h2 {
  margin: 0;
  color: var(--text-color);
}

/* Status styling */
:deep(.status-active) {
  background: #dbeafe !important;
  color: #1e40af !important;
}

:deep(.status-completed) {
  background: #d1fae5 !important;
  color: #065f46 !important;
}

:deep(.status-upcoming) {
  background: #fef3c7 !important;
  color: #92400e !important;
}

:deep(.status-cancelled) {
  background: #fee2e2 !important;
  color: #991b1b !important;
}

@media (max-width: 768px) {
  .client-dashboard {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
<!-- src/views/dashboard/Dashboard.vue -->
<template>
  <DashboardLayout>
    <!-- Dashboard Content -->
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ getWelcomeMessage() }}
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            {{ getCurrentDateString() }}
          </p>
        </div>

        <!-- Quick Actions -->
        <div class="mt-4 sm:mt-0 flex flex-wrap gap-2">
          <Button
              v-for="action in quickActions"
              :key="action.label"
              @click="$router.push(action.path)"
              outlined
              size="small"
          >
            <i :class="action.icon" class="mr-1"></i>
            {{ action.label }}
          </Button>
        </div>
      </div>

      <!-- Full-Screen Activation Map -->
      <div class="full-screen-map-container">
        <div class="map-header">
          <h2 class="text-2xl font-bold text-gray-900">
            <i class="pi pi-map-marker mr-3"></i>
            Active Activations Map - Zimbabwe
          </h2>
          <div class="map-header-actions">
            <router-link
                to="/activations"
                class="text-sm text-blue-600 hover:text-blue-800 mr-4"
            >
              View all activations
            </router-link>
            <router-link
                to="/reports"
                class="text-sm text-blue-600 hover:text-blue-800"
            >
              View reports
            </router-link>
          </div>
        </div>

        <div class="map-content">
          <div v-if="!showMap" class="map-placeholder">
            <div class="text-center py-8">
              <i class="pi pi-map text-4xl text-gray-400 mb-4"></i>
              <p class="text-gray-500">Map is initializing...</p>
            </div>
          </div>
          <LeafletActivationMap
            v-else
            :key="'leaflet-activation-map'"
            :height="'600px'"
            :center="mapCenter"
            :zoom="mapZoom"
            @activation-selected="onActivationSelected"
            @map-ready="onMapReady"
          />
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import DashboardStatsCard from '@/components/cards/DashboardStatsCard.vue'
import LeafletActivationMap from '@/components/maps/LeafletActivationMap.vue'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

// Computed properties
const userRole = computed(() => authStore.user?.role)
const userName = computed(() => authStore.user?.firstName || 'User')

// Quick actions based on role
const quickActions = computed(() => {
  const actions = {
    ADMIN: [
      { label: 'New Activation', path: '/activations/create', icon: 'pi pi-plus' },
      { label: 'Add User', path: '/users/create', icon: 'pi pi-user-plus' },
      { label: 'Reports', path: '/reports', icon: 'pi pi-chart-bar' }
    ],
    ACTIVATION_MANAGER: [
      { label: 'New Activation', path: '/activations/create', icon: 'pi pi-plus' },
      { label: 'Assign Promoters', path: '/promoters/assignments', icon: 'pi pi-users' },
      { label: 'Reports', path: '/reports/activations', icon: 'pi pi-chart-bar' }
    ],
    WAREHOUSE_MANAGER: [
      { label: 'Update Inventory', path: '/warehouses/inventory', icon: 'pi pi-box' },
      { label: 'Stock Report', path: '/reports/inventory', icon: 'pi pi-chart-line' }
    ],
    PROMOTER: [
      { label: 'My Activations', path: '/activations', icon: 'pi pi-calendar' }
    ],
    CLIENT: [
      { label: 'My Activations', path: '/activations', icon: 'pi pi-calendar' },
      { label: 'Performance', path: '/reports/performance', icon: 'pi pi-chart-line' }
    ]
  }

  return (actions[userRole.value] || []).slice(0, 3)
})

// Dashboard data
const dashboardStats = ref([])
const recentActivity = ref([])
const performanceMetrics = ref([])
const upcomingEvents = ref([])

// Map configuration
const showMap = ref(false) // Start false, will be set to true after DOM is ready
const mapCenter = ref({ lat: -17.8292, lng: 31.0522 }) // Harare, Zimbabwe
const mapZoom = ref(7)
const selectedActivation = ref(null)

// Methods
const getWelcomeMessage = () => {
  const hour = new Date().getHours()
  let greeting = 'Good morning'

  if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon'
  } else if (hour >= 17) {
    greeting = 'Good evening'
  }

  return `${greeting}, ${userName.value}!`
}

const getCurrentDateString = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (timestamp) => {
  const now = new Date()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (minutes < 60) {
    return `${minutes} minutes ago`
  } else {
    return `${hours} hours ago`
  }
}

// Map event handlers
const onActivationSelected = (activation) => {
  selectedActivation.value = activation
  toast.add({
    severity: 'info',
    summary: 'Activation Selected',
    detail: `Selected: ${activation.name}`,
    life: 2000
  })
}

const onMapReady = (mapInstance) => {
  console.log('✅ Leaflet map loaded successfully and ready for activations')
  console.log('🗺️ Map instance:', mapInstance)
}

const loadDashboardData = async () => {
  // Mock data loading - replace with actual API calls

  // Recent Activity
  recentActivity.value = [
    {
      id: 1,
      title: 'New activation "Summer Campaign 2024" created',
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      icon: 'pi pi-calendar-plus',
      iconColor: 'text-white',
      bgColor: 'bg-blue-100'
    },
    {
      id: 2,
      title: 'Promoter John Doe checked in at Mall Plaza',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      icon: 'pi pi-map-marker',
      iconColor: 'text-white',
      bgColor: 'bg-green-100'
    },
    {
      id: 3,
      title: 'Weekly inventory report generated',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      icon: 'pi pi-file',
      iconColor: 'text-white',
      bgColor: 'bg-purple-100'
    },
    {
      id: 4,
      title: 'Client ABC Corp approved campaign proposal',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      icon: 'pi pi-check-circle',
      iconColor: 'text-white',
      bgColor: 'bg-green-100'
    }
  ]

  // Performance Metrics
  performanceMetrics.value = [
    { label: 'Activation Completion', value: 92, color: 'bg-green-500' },
    { label: 'Customer Engagement', value: 87, color: 'bg-blue-500' },
    { label: 'Sales Target Achievement', value: 78, color: 'bg-orange-500' },
    { label: 'Promoter Performance', value: 94, color: 'bg-purple-500' }
  ]

  // Upcoming Events
  upcomingEvents.value = [
    {
      id: 1,
      title: 'Product Launch Event',
      date: 'Tomorrow, 9:00 AM',
      location: 'Central Mall',
      icon: 'pi pi-calendar',
      iconColor: 'text-white',
      bgColor: 'bg-blue-500'
    },
    {
      id: 2,
      title: 'Team Training Session',
      date: 'Friday, 2:00 PM',
      location: 'Head Office',
      icon: 'pi pi-users',
      iconColor: 'text-white',
      bgColor: 'bg-green-500'
    },
    {
      id: 3,
      title: 'Monthly Review Meeting',
      date: 'Next Monday, 10:00 AM',
      location: 'Conference Room A',
      icon: 'pi pi-chart-bar',
      iconColor: 'text-white',
      bgColor: 'bg-purple-500'
    }
  ]
}

onMounted(async () => {
  try {
    // Load dashboard data first
    await loadDashboardData()
    
    // Initialize map after a short delay to ensure DOM is ready
    setTimeout(() => {
      showMap.value = true
    }, 100)
  } catch (error) {
    console.error('Error loading dashboard:', error)
  }
})
</script>

<style scoped>
/* Full-screen map layout */
.full-screen-map-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 700px;
  display: flex;
  flex-direction: column;
}

.map-header {
  padding: 24px 32px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.map-header h2 {
  display: flex;
  align-items: center;
  margin: 0;
  color: #1f2937;
}

.map-header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.map-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.map-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  min-height: 400px;
}

.map-placeholder .text-center {
  text-align: center;
}

.map-placeholder i {
  display: block;
  margin: 0 auto 16px;
}

/* Map container styling for full-screen */
.full-screen-map-container :deep(.activation-map-container) {
  height: 600px !important;
  display: flex !important;
  flex-direction: column;
  visibility: visible !important;
}

.full-screen-map-container :deep(.map-container) {
  height: 600px !important;
  border-radius: 0;
  display: block !important;
  visibility: visible !important;
  position: relative !important;
}

/* Ensure Google Maps div stays visible */
.full-screen-map-container :deep(.map-container > div) {
  display: block !important;
  visibility: visible !important;
  height: 100% !important;
  width: 100% !important;
}

.full-screen-map-container :deep(.map-controls) {
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding: 16px 24px;
  flex-shrink: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .map-header {
    padding: 16px 20px 12px;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .map-header h2 {
    font-size: 1.5rem;
  }
  
  .map-header-actions {
    align-self: stretch;
    justify-content: space-between;
  }
  
  .full-screen-map-container {
    height: calc(100vh - 160px);
  }
  
  .full-screen-map-container :deep(.map-controls) {
    padding: 12px 16px;
  }
  
  .full-screen-map-container :deep(.control-group) {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  
  .full-screen-map-container :deep(.filter-dropdown) {
    width: 100%;
  }
}

/* Enhanced map styling */
.full-screen-map-container :deep(.legend) {
  gap: 20px;
}

.full-screen-map-container :deep(.legend-item) {
  font-size: 13px;
  font-weight: 500;
}

.full-screen-map-container :deep(.legend-marker) {
  width: 14px;
  height: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style>
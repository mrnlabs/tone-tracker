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

      <!-- Stats Cards -->
      <DashboardStatsCard :stats="dashboardStats" />

      <!-- Main Dashboard Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Activity -->
        <Card>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">Recent Activity</h3>
              <router-link
                  to="/activity"
                  class="text-sm text-blue-600 hover:text-blue-800"
              >
                View all
              </router-link>
            </div>
          </template>
          <template #content>
            <div class="space-y-4">
              <div
                  v-for="activity in recentActivity"
                  :key="activity.id"
                  class="flex items-start space-x-3"
              >
                <div class="flex-shrink-0">
                  <div :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    activity.bgColor
                  ]">
                    <i :class="[activity.icon, activity.iconColor, 'text-sm']"></i>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-900">{{ activity.title }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ formatTime(activity.timestamp) }}</p>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Performance Overview -->
        <Card>
          <template #header>
            <h3 class="text-lg font-medium text-gray-900">Performance Overview</h3>
          </template>
          <template #content>
            <div class="space-y-4">
              <div
                  v-for="metric in performanceMetrics"
                  :key="metric.label"
                  class="flex items-center justify-between"
              >
                <span class="text-sm text-gray-500">{{ metric.label }}</span>
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium text-gray-900">{{ metric.value }}%</span>
                  <ProgressBar
                      :value="metric.value"
                      class="w-16 h-2"
                      :pt="{
                      value: { class: metric.color }
                    }"
                  />
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Role-specific Content -->
      <div v-if="userRole === 'ADMIN'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- System Health -->
        <Card>
          <template #header>
            <h3 class="text-lg font-medium text-gray-900">System Health</h3>
          </template>
          <template #content>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Server Status</span>
                <Tag value="Online" severity="success" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Database</span>
                <Tag value="Connected" severity="success" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">API Response</span>
                <span class="text-sm font-medium text-gray-900">45ms</span>
              </div>
            </div>
          </template>
        </Card>

        <!-- User Activity -->
        <Card>
          <template #header>
            <h3 class="text-lg font-medium text-gray-900">User Activity</h3>
          </template>
          <template #content>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Active Users</span>
                <span class="text-sm font-medium text-gray-900">24</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">New Registrations</span>
                <span class="text-sm font-medium text-gray-900">3</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Login Rate</span>
                <span class="text-sm font-medium text-gray-900">87%</span>
              </div>
            </div>
          </template>
        </Card>

        <!-- Quick Links -->
        <Card>
          <template #header>
            <h3 class="text-lg font-medium text-gray-900">Quick Actions</h3>
          </template>
          <template #content>
            <div class="space-y-2">
              <router-link
                  to="/users/create"
                  class="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <i class="pi pi-user-plus mr-2"></i>
                Add New User
              </router-link>
              <router-link
                  to="/system/backup"
                  class="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <i class="pi pi-download mr-2"></i>
                System Backup
              </router-link>
              <router-link
                  to="/system/logs"
                  class="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <i class="pi pi-file mr-2"></i>
                View Logs
              </router-link>
            </div>
          </template>
        </Card>
      </div>

      <!-- Upcoming Events/Schedule -->
      <Card v-if="upcomingEvents.length > 0">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Upcoming Events</h3>
            <router-link
                to="/calendar"
                class="text-sm text-blue-600 hover:text-blue-800"
            >
              View calendar
            </router-link>
          </div>
        </template>
        <template #content>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
                v-for="event in upcomingEvents"
                :key="event.id"
                class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <div :class="[
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  event.bgColor
                ]">
                  <i :class="[event.icon, event.iconColor]"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-900 truncate">{{ event.title }}</h4>
                  <p class="text-xs text-gray-500">{{ event.date }}</p>
                  <p class="text-xs text-gray-500">{{ event.location }}</p>
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
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import DashboardStatsCard from '@/components/cards/DashboardStatsCard.vue'

const authStore = useAuthStore()

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
      { label: 'My Activations', path: '/activations', icon: 'pi pi-calendar' },
      { label: 'Check In/Out', path: '/promoter/checkin', icon: 'pi pi-clock' }
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

onMounted(() => {
  loadDashboardData()
})
</script>
<!-- PostLoginDashboard.vue -->
<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <ProgressSpinner class="w-12 h-12" />
      <p class="mt-4 text-gray-600">Loading your dashboard...</p>
    </div>
  </div>

  <DashboardLayout v-else>
    <!-- Role-specific dashboard components -->
    <AdminDashboard v-if="userRole === USER_ROLES.ADMIN" />
    <ActivationManagerDashboard v-else-if="userRole === USER_ROLES.ACTIVATION_MANAGER" />
    <WarehouseManagerDashboard v-else-if="userRole === USER_ROLES.WAREHOUSE_MANAGER" />
    <PromoterDashboard v-else-if="userRole === USER_ROLES.PROMOTER" />
    <ClientDashboard v-else-if="userRole === USER_ROLES.CLIENT" />

    <!-- Fallback for unknown roles -->
    <div v-else class="p-6">
      <Message severity="warn" :closable="false">
        <template #icon>
          <i class="pi pi-exclamation-triangle"></i>
        </template>
        <p>Your user role is not recognized. Please contact your administrator.</p>
      </Message>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { USER_ROLES } from '@/utils/constants'

// Components
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import AdminDashboard from '@/components/dashboard/AdminDashboard.vue'
import ActivationManagerDashboard from '@/components/dashboard/ActivationManagerDashboard.vue'
import WarehouseManagerDashboard from '@/components/dashboard/WarehouseManagerDashboard.vue'
import PromoterDashboard from '@/views/dashboard/PromoterDashboard.vue'
import ClientDashboard from '@/components/dashboard/ClientDashboard.vue'

// PrimeVue components
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const isLoading = ref(true)

// Computed properties
const userRole = computed(() => authStore.userRole)
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Methods
const initializeDashboard = async () => {
  try {
    // Ensure user is authenticated
    if (!isAuthenticated.value) {
      await router.push('/login')
      return
    }

    // Load user-specific dashboard data
    await loadDashboardData()

    // Set page title based on role
    document.title = getDashboardTitle()

  } catch (error) {
    console.error('Error initializing dashboard:', error)
    // Handle error - maybe redirect to login or show error message
  } finally {
    isLoading.value = false
  }
}

const loadDashboardData = async () => {
  // Load role-specific data
  switch (userRole.value) {
    case USER_ROLES.ADMIN:
      await loadAdminData()
      break
    case USER_ROLES.ACTIVATION_MANAGER:
      await loadActivationManagerData()
      break
    case USER_ROLES.WAREHOUSE_MANAGER:
      await loadWarehouseManagerData()
      break
    case USER_ROLES.PROMOTER:
      await loadPromoterData()
      break
    case USER_ROLES.CLIENT:
      await loadClientData()
      break
    default:
      console.warn('Unknown user role:', userRole.value)
  }
}

const loadAdminData = async () => {
  // Load admin-specific dashboard data
  console.log('Loading admin dashboard data...')
}

const loadActivationManagerData = async () => {
  // Load activation manager dashboard data
  console.log('Loading activation manager dashboard data...')
}

const loadWarehouseManagerData = async () => {
  // Load warehouse manager dashboard data
  console.log('Loading warehouse manager dashboard data...')
}

const loadPromoterData = async () => {
  // Load promoter dashboard data
  console.log('Loading promoter dashboard data...')
}

const loadClientData = async () => {
  // Load client dashboard data
  console.log('Loading client dashboard data...')
}

const getDashboardTitle = () => {
  const titles = {
    [USER_ROLES.ADMIN]: 'Admin Dashboard - Activation Tracker',
    [USER_ROLES.ACTIVATION_MANAGER]: 'Activation Manager Dashboard - Activation Tracker',
    [USER_ROLES.WAREHOUSE_MANAGER]: 'Warehouse Manager Dashboard - Activation Tracker',
    [USER_ROLES.PROMOTER]: 'My Dashboard - Activation Tracker',
    [USER_ROLES.CLIENT]: 'Client Dashboard - Activation Tracker'
  }

  return titles[userRole.value] || 'Dashboard - Activation Tracker'
}

// Watchers
watch(isAuthenticated, (newValue) => {
  if (!newValue) {
    router.push('/login')
  }
})

watch(userRole, () => {
  if (userRole.value) {
    document.title = getDashboardTitle()
  }
})

// Lifecycle
onMounted(() => {
  initializeDashboard()
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f8fafc;
}
</style>
<template>
  <div :class="containerClasses">
    <!-- Backdrop for mobile -->
    <div
        v-if="isMobile"
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
        @click="$emit('close')"
    />

    <!-- Sidebar -->
    <div :class="sidebarClasses">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <i class="pi pi-chart-line text-white text-sm"></i>
            </div>
            <div>
              <h1 class="font-bold text-gray-900 text-sm">Activation</h1>
              <p class="text-xs text-gray-500">Tracker</p>
            </div>
          </div>
          <button
              v-if="isMobile"
              @click="$emit('close')"
              class="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <i class="pi pi-times text-gray-500"></i>
          </button>
        </div>
      </div>

      <!-- User Profile -->
      <div class="p-4 border-b border-gray-100">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <i class="pi pi-user text-blue-600"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ currentUser.name }}
            </p>
            <p class="text-xs text-gray-500 capitalize">
              {{ formatRole(currentUser.role) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-4">
        <div class="px-3 space-y-1">
          <template v-for="item in filteredNavigation" :key="item.id">
            <!-- Menu with children -->
            <div v-if="item.children">
              <button
                  @click="toggleMenu(item.id)"
                  class="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 group transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <i :class="item.icon" class="text-gray-500"></i>
                  <span>{{ item.label }}</span>
                </div>
                <i :class="expandedMenus[item.id] ? 'pi pi-chevron-down' : 'pi pi-chevron-right'" class="text-xs"></i>
              </button>

              <Transition name="expand">
                <div v-if="expandedMenus[item.id]" class="mt-1 ml-6 space-y-1">
                  <router-link
                      v-for="(child, index) in getFilteredChildren(item.children)"
                      :key="index"
                      :to="child.path"
                      class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      active-class="bg-blue-50 text-blue-700"
                      @click="isMobile && $emit('close')"
                  >
                    <i :class="child.icon" class="text-xs"></i>
                    <span>{{ child.label }}</span>
                  </router-link>
                </div>
              </Transition>
            </div>

            <!-- Single menu item -->
            <router-link
                v-else
                :to="item.path"
                class="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 group transition-colors"
                active-class="bg-blue-50 text-blue-700"
                @click="isMobile && $emit('close')"
            >
              <i :class="item.icon" class="text-gray-500"></i>
              <span>{{ item.label }}</span>
            </router-link>
          </template>
        </div>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-200 space-y-1">
        <router-link
            to="/settings"
            class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            @click="isMobile && $emit('close')"
        >
          <i class="pi pi-cog text-gray-500"></i>
          <span>Settings</span>
        </router-link>
        <button
            @click="logout"
            class="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <i class="pi pi-sign-out text-gray-500"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  isMobile: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const router = useRouter()
const authStore = useAuthStore() // Fixed: Use useAuthStore instead of useAuth
const expandedMenus = ref({})

// Navigation items
const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'pi pi-home',
    path: '/dashboard',
    roles: ['ADMIN', 'ACTIVATION_MANAGER', 'CLIENT', 'WAREHOUSE_MANAGER', 'PROMOTER']
  },
  {
    id: 'activations',
    label: 'Activations',
    icon: 'pi pi-calendar',
    roles: ['ADMIN', 'ACTIVATION_MANAGER', 'CLIENT', 'PROMOTER'],
    children: [
      { label: 'All Activations', path: '/activations', icon: 'pi pi-calendar' },
      { label: 'Create Activation', path: '/activations/create', icon: 'pi pi-plus', roles: ['ADMIN'] },
      { label: 'Activation Briefs', path: '/activations/briefs', icon: 'pi pi-file-pdf' },
      { label: 'Performance', path: '/activations/performance', icon: 'pi pi-chart-line' }
    ]
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: 'pi pi-building',
    roles: ['ADMIN'],
    children: [
      { label: 'All Clients', path: '/clients', icon: 'pi pi-building' },
      { label: 'Add Client', path: '/clients/create', icon: 'pi pi-plus', roles: ['ADMIN'] }
    ]
  },
  {
    id: 'promoters',
    label: 'Promoters',
    icon: 'pi pi-users',
    roles: ['ADMIN', 'ACTIVATION_MANAGER'],
    children: [
      { label: 'All Promoters', path: '/promoters', icon: 'pi pi-users' },
      { label: 'Add Promoter', path: '/promoters/create', icon: 'pi pi-plus' },
      { label: 'Performance', path: '/promoters/performance', icon: 'pi pi-chart-bar' }
    ]
  },
  {
    id: 'warehouses',
    label: 'Warehouses',
    icon: 'pi pi-box',
    roles: ['ADMIN', 'WAREHOUSE_MANAGER'],
    children: [
      { label: 'All Warehouses', path: '/warehouses', icon: 'pi pi-box' }
    ]
  },
  {
    id: 'crm',
    label: 'CRM & Insights',
    icon: 'pi pi-chart-line',
    roles: ['ADMIN', 'CLIENT'],
    children: [
      { label: 'Customer Data', path: '/crm', icon: 'pi pi-users' },
      { label: 'Sales Tracking', path: '/crm/sales', icon: 'pi pi-dollar' },
      { label: 'Market Insights', path: '/crm/insights', icon: 'pi pi-chart-bar' }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'pi pi-chart-bar',
    roles: ['ADMIN', 'ACTIVATION_MANAGER', 'CLIENT', 'WAREHOUSE_MANAGER'],
    children: [
      { label: 'All Reports', path: '/reports', icon: 'pi pi-chart-bar' },
      { label: 'Stock Movement', path: '/reports/stock-movements', icon: 'pi pi-box', roles: ['ADMIN', 'WAREHOUSE_MANAGER'] },
      { label: 'Activation Reports', path: '/reports/activations', icon: 'pi pi-calendar' },
      { label: 'Performance Reports', path: '/reports/performance', icon: 'pi pi-chart-line' },
      { label: 'Inventory Reports', path: '/reports/inventory', icon: 'pi pi-box' }
    ]
  },
  {
    id: 'users',
    label: 'User Management',
    icon: 'pi pi-user',
    roles: ['ADMIN'],
    children: [
      { label: 'All Users', path: '/users', icon: 'pi pi-users' },
      { label: 'Add User', path: '/users/create', icon: 'pi pi-plus' },
      { label: 'Roles & Permissions', path: '/users/roles', icon: 'pi pi-key' }
    ]
  }
]

// Get current user from auth store
const currentUser = computed(() => {
  if (authStore.user) {
    return {
      name: authStore.userDisplayName || 'Unknown User',
      role: authStore.userRole || 'USER',
      avatar: authStore.userAvatar
    }
  }

  return {
    name: 'Unknown User',
    role: 'USER',
    avatar: null
  }
})

// Container classes for mobile vs desktop
const containerClasses = computed(() =>
    props.isMobile ? 'fixed inset-0 z-50 flex' : ''
)

// Sidebar classes - different for mobile vs desktop
const sidebarClasses = computed(() => {
  const baseClasses = 'bg-white border-r border-gray-200 flex flex-col'

  if (props.isMobile) {
    return `${baseClasses} fixed left-0 top-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out`
  }

  // Desktop - no positioning, just styling
  return `${baseClasses} w-64 h-screen`
})

// Filter navigation based on user role
const filteredNavigation = computed(() => {
  return navigationItems.filter(item => hasRole(item.roles))
})

// Helper functions
const hasRole = (roles) => {
  if (!roles) return true
  const userRole = authStore.userRole
  return roles.includes(userRole)
}

const getFilteredChildren = (children) => {
  return children.filter(child => hasRole(child.roles))
}

const formatRole = (role) => {
  if (!role) return 'User'
  return role.toLowerCase().replace('_', ' ')
}

const toggleMenu = (menuId) => {
  expandedMenus.value[menuId] = !expandedMenus.value[menuId]
}

const logout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 200px;
}
</style>
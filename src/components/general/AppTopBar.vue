<!-- Updated TopBar.vue - Fixed import and styling -->
<template>
  <header class="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center space-x-4">
        <!-- Mobile menu button -->
        <button
            @click="$emit('toggle-sidebar')"
            class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <i class="pi pi-bars text-gray-600"></i>
        </button>

        <!-- Search bar -->
        <div class="flex-1 max-w-lg">
          <div class="relative">
            <i class="pi pi-search search-icon"></i>
            <input
                v-model="searchQuery"
                type="text"
                placeholder="Search activations, clients..."
                class="search-input"
                @keyup.enter="handleSearch"
            />
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <!-- Quick Actions -->
        <div class="hidden md:flex items-center space-x-2">
          <Button
              v-if="canCreateActivation"
              @click="$router.push('/activations/create')"
              size="small"
              severity="success"
              class="p-2"
          >
            <i class="pi pi-plus text-xs mr-1"></i>
            New Activation
          </Button>
        </div>

        <!-- Notifications -->
        <div class="relative">
          <button
              @click="toggleNotifications"
              class="relative p-2 text-gray-400 hover:text-gray-500 transition-colors"
          >
            <i class="pi pi-bell"></i>
            <span
                v-if="unreadCount > 0"
                class="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full"
            >
              {{ unreadCount }}
            </span>
          </button>

          <!-- Notifications Dropdown -->
          <div
              v-if="showNotifications"
              class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              @click.stop
          >
            <div class="p-4 border-b border-gray-200">
              <h3 class="text-sm font-medium text-gray-900">Notifications</h3>
            </div>
            <div class="max-h-64 overflow-y-auto">
              <div
                  v-for="notification in notifications"
                  :key="notification.id"
                  class="p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer"
                  @click="markAsRead(notification.id)"
              >
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0">
                    <i :class="notification.icon" class="text-blue-500"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-900">{{ notification.title }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ formatTime(notification.timestamp) }}</p>
                  </div>
                  <div v-if="!notification.read" class="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </div>
            <div class="p-3 border-t border-gray-200">
              <router-link
                  to="/notifications"
                  class="text-sm text-blue-600 hover:text-blue-800"
                  @click="closeDropdowns"
              >
                View all notifications
              </router-link>
            </div>
          </div>
        </div>

        <!-- User Profile Dropdown -->
        <div class="relative">
          <button
              @click="toggleUserMenu"
              class="flex items-center space-x-3 focus:outline-none"
          >
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
              <img
                v-if="currentUser.profilePictureUrl"
                :src="currentUser.profilePictureUrl"
                :alt="currentUser.name"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
              <i
                v-else
                class="pi pi-user text-blue-600 text-sm"
              ></i>
            </div>
            <div class="hidden sm:block text-left">
              <p class="text-sm font-medium text-gray-900">{{ currentUser.name }}</p>
              <p class="text-xs text-gray-500 capitalize">
                {{ formatRole(currentUser.role) }}
              </p>
            </div>
            <i class="pi pi-chevron-down text-gray-400 text-xs"></i>
          </button>

          <!-- User Menu Dropdown -->
          <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              @click.stop
          >
            <div class="py-1">
              <router-link
                  :to="profileRoute"
                  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  @click="closeDropdowns"
              >
                <i class="pi pi-user mr-3 text-gray-400"></i>
                My Profile
              </router-link>
              <router-link
                  to="/settings"
                  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  @click="closeDropdowns"
              >
                <i class="pi pi-cog mr-3 text-gray-400"></i>
                Settings
              </router-link>
              <div class="border-t border-gray-100"></div>
              <button
                  @click="logout"
                  class="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <i class="pi pi-sign-out mr-3 text-gray-400"></i>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['toggle-sidebar'])

const router = useRouter()
const authStore = useAuthStore() // Fixed: Use useAuthStore instead of useAuth

// State
const searchQuery = ref('')
const showNotifications = ref(false)
const showUserMenu = ref(false)

// Mock notifications data
const notifications = ref([
  {
    id: 1,
    title: 'New activation assigned to you',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    icon: 'pi pi-calendar',
    read: false
  },
  {
    id: 2,
    title: 'Stock replenishment needed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    icon: 'pi pi-exclamation-triangle',
    read: false
  },
  {
    id: 3,
    title: 'Weekly report is ready',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    icon: 'pi pi-file',
    read: true
  }
])

// Computed
const currentUser = computed(() => {
  if (authStore.user) {
    return {
      id: authStore.userId,
      name: authStore.userFullName || 'Unknown User',
      role: authStore.userRole || 'USER',
      avatar: authStore.userAvatar,
      profilePictureUrl: authStore.profilePictureUrl
    }
  }

  return {
    id: null,
    name: 'Unknown User',
    role: 'USER',
    avatar: null,
    profilePictureUrl: null
  }
})

const profileRoute = computed(() => {
  return '/profile'
})

const viewProfileRoute = computed(() => {
  return '/profile'
})

const unreadCount = computed(() =>
    notifications.value.filter(n => !n.read).length
)

const canCreateActivation = computed(() => {
  const role = authStore.userRole
  return ['ADMIN', 'ACTIVATION_MANAGER'].includes(role)
})

// Methods
const formatRole = (role) => {
  if (!role) return 'User'
  return role.toLowerCase().replace('_', ' ')
}

const formatTime = (timestamp) => {
  const now = new Date()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes} minutes ago`
  } else if (hours < 24) {
    return `${hours} hours ago`
  } else {
    return `${days} days ago`
  }
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

const closeDropdowns = () => {
  showNotifications.value = false
  showUserMenu.value = false
}

const markAsRead = (notificationId) => {
  const notification = notifications.value.find(n => n.id === notificationId)
  if (notification) {
    notification.read = true
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'search',
      query: { q: searchQuery.value }
    })
  }
}

const logout = async () => {
  closeDropdowns()
  await authStore.logout()
  router.push('/')
}

const handleImageError = (event) => {
  // Hide the image and show the default user icon
  event.target.style.display = 'none'
}

// Close dropdowns when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    closeDropdowns()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Search icon positioning */
.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.875rem;
  z-index: 10;
  pointer-events: none;
}

/* Custom search input styling */
.search-input {
  width: 100%;
  padding-left: 2.5rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

/* Badge positioning */
.relative {
  position: relative;
}

/* Dropdown animations */
.absolute {
  position: absolute;
}

/* Hover effects */
.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}

.hover\:bg-gray-100:hover {
  background-color: #f3f4f6;
}

.hover\:text-gray-500:hover {
  color: #6b7280;
}

.hover\:text-blue-800:hover {
  color: #1e40af;
}

/* Focus styles */
.focus\:outline-none:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

/* Transition effects */
.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Responsive visibility */
@media (max-width: 768px) {
  .hidden.md\:flex {
    display: none;
  }
}

@media (min-width: 768px) {
  .hidden.md\:flex {
    display: flex;
  }
}

@media (max-width: 640px) {
  .hidden.sm\:block {
    display: none;
  }
}

@media (min-width: 640px) {
  .hidden.sm\:block {
    display: block;
  }
}

@media (max-width: 1024px) {
  .lg\:hidden {
    display: block;
  }
}

@media (min-width: 1024px) {
  .lg\:hidden {
    display: none;
  }
}
</style>
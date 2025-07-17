<template>
  <DashboardLayout>
    <div class="user-details-page">
      <!-- Page Header -->
      <PageHeader 
        :title="userFullName"
        :description="userRole"
        :actions="headerActions"
        :loading="loading"
      />

      <div v-if="!loading && user" class="user-content">
        <!-- User Profile Card -->
        <Card class="profile-card">
          <template #content>
            <div class="profile-header">
              <Avatar
                v-if="user.profilePictureUrl"
                :image="user.profilePictureUrl"
                size="xlarge"
                shape="circle"
                @error="handleAvatarError"
              />
              <Avatar
                v-else
                :label="(user.firstName || '?').charAt(0)"
                size="xlarge"
                shape="circle"
                :style="{ backgroundColor: getUserColor(user.id), color: 'white', fontSize: '2rem' }"
              />
              <div class="profile-info">
                <h2 class="user-name">{{ user.firstName }} {{ user.lastName }}</h2>
                <p class="user-email">{{ user.email }}</p>
                <div class="user-badges">
                  <Tag
                    :value="user.role"
                    :severity="getRoleSeverity(user.role)"
                    class="role-tag"
                  />
                  <Tag
                    :value="user.isActive ? 'Active' : 'Inactive'"
                    :severity="user.isActive ? 'success' : 'secondary'"
                    class="status-tag"
                  />
                </div>
              </div>
              <div class="profile-actions">
                <Button
                  @click="editUser"
                  icon="pi pi-pencil"
                  label="Edit"
                  class="p-button-outlined"
                />
                <Button
                  @click="toggleUserStatus"
                  :icon="user.isActive ? 'pi pi-pause' : 'pi pi-play'"
                  :label="user.isActive ? 'Deactivate' : 'Activate'"
                  :class="user.isActive ? 'p-button-warning' : 'p-button-success'"
                  class="p-button-outlined"
                />
              </div>
            </div>
          </template>
        </Card>

        <!-- User Details Grid -->
        <div class="details-grid">
          <!-- Personal Information -->
          <Card class="details-card">
            <template #header>
              <h3><i class="pi pi-user"></i> Personal Information</h3>
            </template>
            <template #content>
              <div class="details-list">
                <div class="detail-item">
                  <label>Full Name</label>
                  <span>{{ user.firstName }} {{ user.lastName }}</span>
                </div>
                <div class="detail-item">
                  <label>Email Address</label>
                  <span>{{ user.email }}</span>
                </div>
                <div class="detail-item" v-if="user.phone">
                  <label>Phone Number</label>
                  <span>{{ user.phone }}</span>
                </div>
                <div class="detail-item" v-if="user.gender">
                  <label>Gender</label>
                  <span>{{ formatGender(user.gender) }}</span>
                </div>
                <div class="detail-item" v-if="user.jobTitle">
                  <label>Job Title</label>
                  <span>{{ user.jobTitle }}</span>
                </div>
                <div class="detail-item" v-if="user.bio">
                  <label>Bio</label>
                  <span class="bio-text">{{ user.bio }}</span>
                </div>
              </div>
            </template>
          </Card>

          <!-- Account Information -->
          <Card class="details-card">
            <template #header>
              <h3><i class="pi pi-cog"></i> Account Information</h3>
            </template>
            <template #content>
              <div class="details-list">
                <div class="detail-item">
                  <label>User Role</label>
                  <Tag
                    :value="user.role"
                    :severity="getRoleSeverity(user.role)"
                  />
                </div>
                <div class="detail-item" v-if="user.department">
                  <label>Department</label>
                  <span>{{ user.department }}</span>
                </div>
                <div class="detail-item" v-if="user.companyName">
                  <label>Company</label>
                  <span>{{ user.companyName }}</span>
                </div>
                <div class="detail-item">
                  <label>Account Status</label>
                  <Tag
                    :value="user.isActive ? 'Active' : 'Inactive'"
                    :severity="user.isActive ? 'success' : 'secondary'"
                  />
                </div>
                <div class="detail-item" v-if="user.lastLogin">
                  <label>Last Login</label>
                  <span>{{ formatDateTime(user.lastLogin) }}</span>
                </div>
                <div class="detail-item">
                  <label>Member Since</label>
                  <span>{{ formatDate(user.dateCreated) }}</span>
                </div>
              </div>
            </template>
          </Card>

          <!-- Activity Summary -->
          <Card class="details-card">
            <template #header>
              <h3><i class="pi pi-chart-line"></i> Activity Summary</h3>
            </template>
            <template #content>
              <div class="activity-stats">
                <div class="stat-item">
                  <div class="stat-value">{{ userStats.activationsCompleted || 0 }}</div>
                  <div class="stat-label">Activations</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ userStats.salesGenerated || 0 }}</div>
                  <div class="stat-label">Sales</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ userStats.attendanceRate || 100 }}%</div>
                  <div class="stat-label">Attendance</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ userStats.averageRating || 0 }}/5</div>
                  <div class="stat-label">Rating</div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Recent Activity -->
          <Card class="details-card full-width">
            <template #header>
              <h3><i class="pi pi-history"></i> Recent Activity</h3>
            </template>
            <template #content>
              <div v-if="recentActivity.length > 0" class="activity-list">
                <div
                  v-for="activity in recentActivity"
                  :key="activity.id"
                  class="activity-item"
                >
                  <div class="activity-icon">
                    <i :class="getActivityIcon(activity.type)"></i>
                  </div>
                  <div class="activity-content">
                    <span class="activity-description">{{ activity.description }}</span>
                    <span class="activity-time">{{ formatRelativeTime(activity.timestamp) }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="no-activity">
                <i class="pi pi-info-circle"></i>
                <span>No recent activity recorded</span>
              </div>
            </template>
          </Card>
        </div>
      </div>

      <!-- Loading State -->
      <Card v-else-if="loading" class="loading-card">
        <template #content>
          <div class="loading-state">
            <ProgressSpinner />
            <p>Loading user details...</p>
          </div>
        </template>
      </Card>

      <!-- Error State -->
      <EmptyState
        v-else
        type="error"
        title="User Not Found"
        message="The requested user could not be found or you don't have permission to view their details."
        :actions="[
          {
            label: 'Back to Users',
            icon: 'pi pi-arrow-left',
            class: 'p-button-outlined',
            handler: () => router.push('/users')
          }
        ]"
      />
    </div>

    <!-- Status Change Dialog -->
    <Dialog
      v-model:visible="statusDialogVisible"
      :style="{ width: '450px' }"
      :header="statusDialogTitle"
      :modal="true"
    >
      <div class="status-dialog-content">
        <i class="pi pi-exclamation-triangle status-warning-icon"></i>
        <span v-if="user">
          Are you sure you want to {{ user.isActive ? 'deactivate' : 'activate' }} 
          <strong>{{ user.firstName }} {{ user.lastName }}</strong>?
          <br><br>
          <small>
            {{ user.isActive 
              ? 'This will prevent the user from logging in and accessing the system.' 
              : 'This will restore the user\'s access to the system.' 
            }}
          </small>
        </span>
      </div>
      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="statusDialogVisible = false"
          class="p-button-text"
        />
        <Button
          :label="user?.isActive ? 'Deactivate' : 'Activate'"
          icon="pi pi-check"
          @click="confirmStatusChange"
          :class="user?.isActive ? 'p-button-warning' : 'p-button-success'"
          :loading="statusChanging"
          autofocus
        />
      </template>
    </Dialog>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useUsersStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const usersStore = useUsersStore()
const authStore = useAuthStore()

// State
const loading = ref(false)
const statusChanging = ref(false)
const statusDialogVisible = ref(false)
const userId = ref(route.params.id)
const user = ref(null)

// Mock data for demonstration
const recentActivity = ref([
  {
    id: 1,
    type: 'login',
    description: 'Logged into the system',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    type: 'activation',
    description: 'Completed activation #AC-2024-003',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    type: 'profile',
    description: 'Updated profile information',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
])

// Computed properties
const userFullName = computed(() => {
  if (user.value?.firstName && user.value?.lastName) {
    return `${user.value.firstName} ${user.value.lastName}`
  }
  return 'User Details'
})

const userRole = computed(() => {
  if (user.value?.role) {
    return user.value.role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }
  return ''
})

const userStats = computed(() => {
  return usersStore.calculateUserStats(userId.value) || {
    activationsCompleted: 0,
    salesGenerated: 0,
    attendanceRate: 100,
    averageRating: 0
  }
})

const statusDialogTitle = computed(() => {
  if (!user.value) return ''
  return user.value.isActive ? 'Deactivate User' : 'Activate User'
})

const isOwnProfile = computed(() => {
  return authStore.userId && userId.value && authStore.userId.toString() === userId.value.toString()
})

// Header actions
const headerActions = computed(() => {
  const actions = [
    {
      key: 'back',
      label: 'Back to Users',
      icon: 'pi pi-arrow-left',
      class: 'p-button-outlined',
      handler: () => router.push('/users')
    }
  ]

  if (isOwnProfile.value) {
    actions.push({
      key: 'edit-profile',
      label: 'Edit My Profile',
      icon: 'pi pi-pencil',
      class: 'p-button-success',
      handler: editUser
    })
  } else {
    actions.push({
      key: 'edit',
      label: 'Edit User',
      icon: 'pi pi-pencil',
      class: 'p-button-primary',
      handler: editUser
    })
  }

  return actions
})

// Utility functions
const getUserColor = (userId) => {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16']
  return colors[userId % colors.length]
}

const handleAvatarError = (event) => {
  // Hide broken image and let the fallback avatar show
  event.target.style.display = 'none'
}

const getRoleSeverity = (role) => {
  const severityMap = {
    'ADMIN': 'danger',
    'ACTIVATION_MANAGER': 'warning',
    'WAREHOUSE_MANAGER': 'secondary'
  }
  return severityMap[role] || 'info'
}

const formatGender = (gender) => {
  const genderMap = {
    'MALE': 'Male',
    'FEMALE': 'Female',
    'OTHER': 'Other',
    'NOT_SPECIFIED': 'Prefer not to say'
  }
  return genderMap[gender] || gender
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'Never'
  try {
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

const formatRelativeTime = (dateTimeString) => {
  if (!dateTimeString) return 'Unknown'
  
  try {
    const date = new Date(dateTimeString)
    const now = new Date()
    const diffInMs = now - date
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    
    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  } catch (error) {
    return 'Unknown'
  }
}

const getActivityIcon = (type) => {
  const iconMap = {
    'login': 'pi pi-sign-in',
    'logout': 'pi pi-sign-out',
    'activation': 'pi pi-check-circle',
    'profile': 'pi pi-user-edit',
    'assignment': 'pi pi-users',
    'checkin': 'pi pi-map-marker',
    'checkout': 'pi pi-times-circle'
  }
  return iconMap[type] || 'pi pi-info-circle'
}

// Action handlers
const loadUser = async () => {
  try {
    loading.value = true
    const userData = await usersStore.getUser(userId.value)
    user.value = userData
  } catch (error) {
    console.error('Failed to load user:', error)
    
    let errorMessage = 'Failed to load user details'
    if (error.status === 404) {
      errorMessage = 'User not found'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    toast.add({
      severity: 'error',
      summary: 'Load Failed',
      detail: errorMessage,
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

const editUser = () => {
  router.push(`/users/${userId.value}/edit`)
}

const toggleUserStatus = () => {
  statusDialogVisible.value = true
}

const confirmStatusChange = async () => {
  statusChanging.value = true
  try {
    if (user.value.isActive) {
      await usersStore.deactivateUser(user.value.id)
      user.value.isActive = false
    } else {
      await usersStore.activateUser(user.value.id)
      user.value.isActive = true
    }
    
    const newStatus = user.value.isActive ? 'Active' : 'Inactive'
    toast.add({
      severity: 'success',
      summary: 'Status Updated',
      detail: `User status changed to ${newStatus}`,
      life: 3000
    })
  } catch (error) {
    console.error('Failed to update user status:', error)
    toast.add({
      severity: 'error',
      summary: 'Update Failed',
      detail: 'Failed to update user status',
      life: 5000
    })
  } finally {
    statusDialogVisible.value = false
    statusChanging.value = false
  }
}

// Watch for route parameter changes
watch(() => route.params.id, (newId) => {
  if (newId) {
    userId.value = newId
    loadUser()
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  if (userId.value) {
    loadUser()
  }
})
</script>

<style scoped>
.user-details-page {
  padding: 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.user-content {
  margin-top: 1.5rem;
}

.profile-card {
  margin-bottom: 1.5rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.profile-info {
  flex: 1;
}

.user-name {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.75rem;
  font-weight: 700;
}

.user-email {
  margin: 0 0 1rem 0;
  color: #6b7280;
  font-size: 1.125rem;
}

.user-badges {
  display: flex;
  gap: 0.5rem;
}

.role-tag, .status-tag {
  font-weight: 600;
}

.profile-actions {
  display: flex;
  gap: 0.75rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.details-card {
  height: fit-content;
}

.details-card.full-width {
  grid-column: 1 / -1;
}

.details-card h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-item span {
  color: #1f2937;
  font-weight: 500;
}

.bio-text {
  font-style: italic;
  line-height: 1.6;
}

.activity-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.activity-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.activity-description {
  font-weight: 500;
  color: #1f2937;
}

.activity-time {
  font-size: 0.875rem;
  color: #6b7280;
}

.no-activity {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: #6b7280;
  font-style: italic;
}

.loading-card {
  margin-top: 1.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: #6b7280;
}

.status-dialog-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.status-warning-icon {
  color: #f59e0b;
  font-size: 2rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .user-details-page {
    padding: 1rem;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .profile-actions {
    width: 100%;
    justify-content: center;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .activity-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .activity-item {
    padding: 0.75rem;
  }

  .activity-icon {
    width: 2rem;
    height: 2rem;
  }
}
</style>
<template>
  <DashboardLayout>
    <div class="users-page">
      <!-- Page Header -->
      <PageHeader 
        title="Staff User Management"
        description="Manage staff users (Admin, Activation Managers, and Warehouse Managers)"
        :actions="headerActions"
        :loading="loading"
      />

      <!-- Stats Cards -->
      <StatsGrid :stats="statsData" :loading="loading" />

      <!-- Filters and Search -->
      <FilterBar
        v-model:search="searchQuery"
        v-model:filter-values="filterValues"
        search-placeholder="Search users..."
        :filters="filterConfig"
        @search="handleSearch"
        @filter="handleFilter"
        @reset="resetFilters"
      />

      <!-- Users Table -->
      <Card class="users-table-card">
        <template #content>
          <DataTable
              :value="users"
              dataKey="id"
              :paginator="true"
              :rows="pagination.limit"
              :totalRecords="pagination.total"
              :first="(pagination.page - 1) * pagination.limit"
              :lazy="true"
              responsiveLayout="scroll"
              :loading="loading"
              v-model:selection="selectedUsers"
              :selectAll="selectAll"
              @select-all-change="onSelectAllChange"
              @row-select="onRowSelect"
              @row-unselect="onRowUnselect"
              @page="onPageChange"
              @sort="onSort"
          >
            <template #header>
              <div class="table-header">
                <h3>Staff Users Directory</h3>
                <div class="table-actions">
                  <Button
                      v-if="selectedUsers.length > 0"
                      @click="bulkAction"
                      icon="pi pi-cog"
                      :label="`Actions (${selectedUsers.length})`"
                      class="p-button-outlined"
                      :disabled="loading"
                      v-tooltip.top="`Bulk actions for ${selectedUsers.length} selected users`"
                  />
                  <Button
                      @click="exportData"
                      icon="pi pi-download"
                      label="Export"
                      class="p-button-outlined"
                      :disabled="loading || !users?.length"
                      v-tooltip.top="users?.length ? `Export ${users.length} users` : 'No users to export'"
                  />
                </div>
              </div>
            </template>

            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="id" header="ID" sortable></Column>
            
            <Column field="name" header="User" sortable>
              <template #body="{ data }">
                <div class="user-cell">
                  <Avatar
                      v-if="data.profilePictureUrl"
                      :image="data.profilePictureUrl"
                      size="normal"
                      shape="circle"
                      @error="handleAvatarError"
                  />
                  <Avatar
                      v-else
                      :label="(data.firstName || data.name || '?').charAt(0)"
                      size="normal"
                      shape="circle"
                      :style="{ backgroundColor: getUserColor(data.id), color: 'white' }"
                  />
                  <div class="user-info">
                    <span class="user-name">{{ data.firstName }} {{ data.lastName }}</span>
                    <span class="user-email">{{ data.email }}</span>
                  </div>
                </div>
              </template>
            </Column>

            <Column field="role" header="Role" sortable>
              <template #body="{ data }">
                <Tag
                    :value="data.role"
                    :severity="getRoleSeverity(data.role)"
                />
              </template>
            </Column>

            <Column field="department" header="Department" sortable></Column>

            <Column field="isActive" header="Status" sortable>
              <template #body="{ data }">
                <Tag
                    :value="data.isActive ? 'Active' : 'Inactive'"
                    :severity="data.isActive ? 'success' : 'secondary'"
                />
              </template>
            </Column>

            <Column field="lastLogin" header="Last Login" sortable>
              <template #body="{ data }">
                <span class="last-login">{{ formatRelativeTime(data.lastLogin) }}</span>
              </template>
            </Column>

            <Column field="dateCreated" header="Created" sortable>
              <template #body="{ data }">
                <span class="created-date">{{ formatDate(data.dateCreated) }}</span>
              </template>
            </Column>

            <Column header="Actions" :exportable="false">
              <template #body="{ data }">
                <EntityActionButtons
                  :entity="data"
                  :actions="userTableActions"
                  :permissions="userPermissions"
                  variant="table"
                  @action="handleTableAction"
                />
              </template>
            </Column>

            <template #empty>
              <EmptyState
                :type="emptyStateConfig.type"
                :title="emptyStateConfig.title"
                :message="emptyStateConfig.message"
                :actions="emptyStateConfig.actions"
              />
            </template>
          </DataTable>
        </template>
      </Card>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog
        v-model:visible="deleteDialogVisible"
        :style="{ width: '450px' }"
        header="Confirm Deletion"
        :modal="true"
    >
      <div class="delete-dialog-content">
        <i class="pi pi-exclamation-triangle delete-warning-icon"></i>
        <span v-if="userToDelete">
          Are you sure you want to delete user <strong>{{ userToDelete.firstName }} {{ userToDelete.lastName }}</strong>?
          This action cannot be undone and will revoke all access permissions.
        </span>
      </div>
      <template #footer>
        <Button
            label="Cancel"
            icon="pi pi-times"
            @click="deleteDialogVisible = false"
            class="p-button-text"
        />
        <Button
            label="Delete"
            icon="pi pi-check"
            @click="confirmDelete"
            class="p-button-danger"
            :loading="deleting"
            autofocus
        />
      </template>
    </Dialog>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useUsersStore } from '@/stores/user'
import { useLoading } from '@/composables/useLoading'
import { userService } from '@/services/api'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatsGrid from '@/components/ui/StatsGrid.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import EntityActionButtons from '@/components/ui/EntityActionButtons.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const router = useRouter()
const toast = useToast()
const usersStore = useUsersStore()
const { withLoading, isLoading } = useLoading()

// State
const refreshing = ref(false)
const deleting = ref(false)
const searchQuery = ref('')
const selectedUsers = ref([])
const selectAll = ref(false)
const deleteDialogVisible = ref(false)
const userToDelete = ref(null)

// Computed from store
const loading = computed(() => isLoading('fetch-users') || usersStore.isLoading)
const users = computed(() => usersStore.filteredUsers)
const userStats = computed(() => usersStore.userStats)
const pagination = computed(() => usersStore.pagination)
const hasError = computed(() => !!usersStore.error)

// Filter configuration
const filterValues = computed({
  get: () => ({
    role: usersStore.filters.role,
    department: usersStore.filters.department,
    active: usersStore.filters.active
  }),
  set: (newFilters) => {
    usersStore.setFilters(newFilters)
  }
})

const filterConfig = [
  {
    key: 'role',
    type: 'dropdown',
    placeholder: 'All Roles',
    options: [
      { label: 'Admin', value: 'ADMIN' },
      { label: 'Activation Manager', value: 'ACTIVATION_MANAGER' },
      { label: 'Warehouse Manager', value: 'WAREHOUSE_MANAGER' }
    ]
  },
  {
    key: 'department',
    type: 'dropdown',
    placeholder: 'All Departments',
    options: [
      { label: 'IT', value: 'IT' },
      { label: 'Marketing', value: 'Marketing' },
      { label: 'Sales', value: 'Sales' },
      { label: 'Operations', value: 'Operations' },
      { label: 'Finance', value: 'Finance' }
    ]
  },
  {
    key: 'active',
    type: 'dropdown',
    placeholder: 'All Status',
    options: [
      { label: 'Active', value: true },
      { label: 'Inactive', value: false }
    ]
  }
]

// Header actions configuration
const headerActions = computed(() => [
  {
    key: 'refresh',
    icon: 'pi pi-refresh',
    class: 'p-button-outlined',
    loading: refreshing.value,
    tooltip: 'Refresh user list',
    handler: refreshUsers
  },
  {
    key: 'create',
    icon: 'pi pi-plus',
    label: 'Add Staff User',
    class: 'p-button-success',
    handler: () => router.push('/users/create')
  }
])

// Stats data configuration
const statsData = computed(() => [
  {
    key: 'total',
    title: 'Total Users',
    value: userStats.value?.total || 0,
    icon: 'pi pi-users',
    color: 'blue',
    trend: null
  },
  {
    key: 'active',
    title: 'Active Users',
    value: userStats.value?.active || 0,
    icon: 'pi pi-check-circle',
    color: 'green',
    trend: null
  },
  {
    key: 'managers',
    title: 'Managers',
    value: userStats.value?.managers || 0,
    icon: 'pi pi-shield',
    color: 'purple',
    trend: null
  },
  {
    key: 'promoters',
    title: 'Promoters',
    value: userStats.value?.promoters || 0,
    icon: 'pi pi-user-plus',
    color: 'orange',
    trend: null
  }
])

// Table actions configuration
const tableActions = [
  {
    key: 'view',
    icon: 'pi pi-eye',
    tooltip: 'View Details',
    handler: (entity) => viewUser(entity.id)
  },
  {
    key: 'edit',
    icon: 'pi pi-pencil',
    tooltip: 'Edit User',
    handler: (entity) => editUser(entity.id)
  },
  {
    key: 'resetPassword',
    icon: 'pi pi-key',
    tooltip: 'Reset Password',
    handler: (entity) => resetPassword(entity.id)
  },
  {
    key: 'toggleStatus',
    icon: 'pi pi-power-off',
    tooltip: 'Toggle Status',
    handler: (entity) => toggleUserStatus(entity)
  },
  {
    key: 'delete',
    icon: 'pi pi-trash',
    tooltip: 'Delete User',
    severity: 'danger',
    visible: (entity) => entity.role !== 'ADMIN',
    handler: (entity) => deleteUser(entity)
  }
]

// Convert table actions for EntityActionButtons component
const userTableActions = computed(() => tableActions.map(action => ({
  label: action.tooltip,
  icon: action.icon,
  action: action.key,
  variant: 'text',
  severity: action.severity,
  permission: action.permission,
  visible: action.visible
})))

// User permissions for action visibility
const userPermissions = computed(() => ({
  canView: true,
  canEdit: true,
  canCreate: true,
  canDelete: true,
  canResetPassword: true
}))

// Empty state configurations
const emptyStateConfig = computed(() => {
  if (hasError.value) {
    return {
      type: 'error',
      title: 'Unable to Load Users',
      message: 'There was an error loading your user data. Please try refreshing the page.',
      actions: [
        {
          label: 'Retry',
          icon: 'pi pi-refresh',
          class: 'p-button-outlined',
          handler: () => loadUsers()
        },
        {
          label: 'Go to Dashboard',
          icon: 'pi pi-home',
          class: 'p-button-text',
          handler: () => router.push('/dashboard')
        }
      ]
    }
  } else if (searchQuery.value || filterValues.value.role || filterValues.value.department || filterValues.value.active !== null) {
    return {
      type: 'no-results',
      title: 'No Matching Users',
      message: 'No users found matching your current filters. Try adjusting your search criteria.',
      actions: [
        {
          label: 'Clear Filters',
          icon: 'pi pi-filter-slash',
          class: 'p-button-outlined',
          handler: resetFilters
        }
      ]
    }
  } else {
    return {
      type: 'empty',
      title: 'No Staff Users Yet',
      message: 'Start by adding your first staff user to begin managing system access and permissions.',
      actions: [
        {
          label: 'Add Your First Staff User',
          icon: 'pi pi-plus',
          class: 'p-button-success',
          handler: () => router.push('/users/create')
        }
      ]
    }
  }
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

const getStatusSeverity = (status) => {
  const severityMap = {
    'Active': 'success',
    'Inactive': 'secondary',
    'Pending': 'warning',
    'Suspended': 'danger'
  }
  return severityMap[status] || 'info'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

const formatRelativeTime = (dateTimeString) => {
  if (!dateTimeString) return 'Never'
  
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

// Action handlers
const loadUsers = async () => {
  try {
    await withLoading('fetch-users', () => usersStore.fetchUsers())
    console.log('Users loaded successfully:', users.value?.length || 0, 'users')
  } catch (error) {
    console.error('Failed to load users:', error)
    let errorMessage = 'Failed to load user list'
    
    if (error.response?.status === 403) {
      errorMessage = 'Access denied. Please check your permissions.'
    } else if (error.response?.status === 401) {
      errorMessage = 'Authentication required. Please log in again.'
    } else if (error.response?.status === 404) {
      errorMessage = 'User service not available.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    toast.add({
      severity: 'error',
      summary: 'Load Failed',
      detail: errorMessage,
      life: 5000
    })
  }
}

const refreshUsers = async () => {
  refreshing.value = true
  try {
    await usersStore.refreshUsers()
    toast.add({
      severity: 'success',
      summary: 'Users Refreshed',
      detail: 'User list has been updated',
      life: 3000
    })
  } catch (error) {
    console.error('Failed to refresh users:', error)
    toast.add({
      severity: 'error',
      summary: 'Refresh Failed',
      detail: 'Failed to refresh user list',
      life: 5000
    })
  } finally {
    refreshing.value = false
  }
}

const viewUser = (userId) => {
  router.push(`/users/${userId}`)
}

const editUser = (userId) => {
  router.push(`/users/${userId}/edit`)
}

const resetPassword = async (userId) => {
  try {
    loading.value = true
    await userService.resetPassword(userId)
    toast.add({
      severity: 'success',
      summary: 'Password Reset',
      detail: 'Password reset email has been sent to the user',
      life: 4000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Reset Failed',
      detail: 'Failed to reset user password',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

const toggleUserStatus = async (user) => {
  try {
    if (user.isActive) {
      await usersStore.deactivateUser(user.id)
    } else {
      await usersStore.activateUser(user.id)
    }
    
    const newStatus = user.isActive ? 'Inactive' : 'Active'
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
  }
}

const deleteUser = (user) => {
  userToDelete.value = user
  deleteDialogVisible.value = true
}

const confirmDelete = async () => {
  deleting.value = true
  try {
    await usersStore.deleteUser(userToDelete.value.id)
    
    toast.add({
      severity: 'success',
      summary: 'User Deleted',
      detail: `${userToDelete.value.firstName} ${userToDelete.value.lastName} has been deleted successfully`,
      life: 4000
    })
  } catch (error) {
    console.error('Failed to delete user:', error)
    
    let errorMessage = 'Failed to delete user'
    if (error.status === 409) {
      errorMessage = 'Cannot delete user with active assignments. Please reassign or complete all tasks first.'
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to delete this user.'
    } else if (error.status === 404) {
      errorMessage = 'User not found. It may have already been deleted.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    toast.add({
      severity: 'error',
      summary: 'Delete Failed',
      detail: errorMessage,
      life: 5000
    })
  } finally {
    deleteDialogVisible.value = false
    userToDelete.value = null
    deleting.value = false
  }
}

// Handle table action events from EntityActionButtons
const handleTableAction = (event) => {
  const actionType = event.actionConfig?.action || event.action
  const user = event.entity
  
  console.log('Table action triggered:', { actionType, user })
  
  // Find the action configuration that matches
  const actionConfig = tableActions.find(a => a.key === actionType)
  
  if (actionConfig && actionConfig.handler) {
    actionConfig.handler(user)
  } else {
    console.warn('Unknown action or no handler found:', actionType)
  }
}

// Filter handlers
const handleSearch = async (searchTerm) => {
  searchQuery.value = searchTerm
  usersStore.setFilters({ search: searchTerm })
  try {
    await usersStore.fetchUsers()
  } catch (error) {
    console.error('Search failed:', error)
  }
}

const handleFilter = async (filters) => {
  usersStore.setFilters(filters)
  try {
    await usersStore.fetchUsers()
  } catch (error) {
    console.error('Filter failed:', error)
  }
}

const resetFilters = async () => {
  searchQuery.value = ''
  usersStore.clearFilters()
  try {
    await usersStore.fetchUsers()
  } catch (error) {
    console.error('Reset filters failed:', error)
  }
}

// Selection handlers
const onSelectAllChange = (event) => {
  selectAll.value = event.checked
  if (event.checked) {
    selectedUsers.value = [...users.value]
  } else {
    selectedUsers.value = []
  }
}

const onRowSelect = (event) => {
  // Handle individual row selection
}

const onRowUnselect = (event) => {
  // Handle individual row deselection
}

const bulkAction = () => {
  // Simple bulk action menu - can be expanded later
  const actions = [
    'Activate Selected',
    'Deactivate Selected', 
    'Export Selected',
    'Send Email to Selected'
  ]
  
  // For now, just show a toast with available actions
  toast.add({
    severity: 'info',
    summary: 'Bulk Actions Available',
    detail: `${selectedUsers.value.length} users selected. Available actions: ${actions.join(', ')}`,
    life: 5000
  })
}

const exportData = () => {
  toast.add({
    severity: 'info',
    summary: 'Export Started',
    detail: 'User data export has been initiated',
    life: 3000
  })
}

// Pagination and sorting handlers
const onPageChange = async (event) => {
  const newPage = Math.floor(event.first / event.rows) + 1
  usersStore.setPagination({ page: newPage, limit: event.rows })
  try {
    await usersStore.fetchUsers()
  } catch (error) {
    console.error('Pagination failed:', error)
  }
}

const onSort = async (event) => {
  const field = event.sortField
  const order = event.sortOrder === 1 ? 'asc' : 'desc'
  usersStore.setSorting(field, order)
  try {
    await usersStore.fetchUsers()
  } catch (error) {
    console.error('Sorting failed:', error)
  }
}

// Watchers
watch(() => usersStore.filters.search, (newSearch) => {
  searchQuery.value = newSearch
})

// Lifecycle
onMounted(async () => {
  console.log('Users.vue mounted')
  // Clear any previous errors
  usersStore.clearError()
  
  // Load initial data
  console.log('Loading users...')
  await loadUsers()
  console.log('Users loaded:', users.value)
  console.log('Pagination:', pagination.value)
})
</script>

<style scoped>
.users-page {
  padding: 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.users-table-card {
  margin-bottom: 1.5rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.table-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
}

.table-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.user-email {
  color: #6b7280;
  font-size: 0.75rem;
}

.last-login,
.created-date {
  color: #6b7280;
  font-size: 0.875rem;
}

.delete-dialog-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.delete-warning-icon {
  color: #f59e0b;
  font-size: 2rem;
}

@media (max-width: 768px) {
  .users-page {
    padding: 1rem;
  }

  .table-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .table-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .user-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    min-width: 120px;
  }

  .user-name {
    font-size: 0.8rem;
  }

  .user-email {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .users-page {
    padding: 0.75rem;
  }

  .user-cell {
    gap: 0.25rem;
  }

  .table-actions {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .delete-dialog-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
}
</style>
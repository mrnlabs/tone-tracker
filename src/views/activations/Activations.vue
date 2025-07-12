<template>
  <DashboardLayout>
    <div class="activations-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1 class="page-title">Activation Management</h1>
            <p class="page-description">
              Manage and monitor all brand activations across locations
            </p>
          </div>
          <div class="header-actions">
            <div class="header-button-group">
              <Button
                  @click="refreshActivations"
                  icon="pi pi-refresh"
                  :loading="refreshing"
                  :disabled="loading"
                  class="p-button-outlined"
                  v-tooltip.top="refreshing ? 'Refreshing...' : 'Refresh activation list'"
              />
              <Button
                  v-if="canCreateActivation"
                  @click="$router.push('/activations/create')"
                  icon="pi pi-plus"
                  label="Create Activation"
                  class="p-button-success"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon total">
                <i class="pi pi-calendar"></i>
              </div>
              <div class="stat-info">
                <h3>Total Activations</h3>
                <p class="stat-number">{{ activationStats.total }}</p>
              </div>
            </div>
          </template>
        </Card>

        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon active">
                <i class="pi pi-play-circle"></i>
              </div>
              <div class="stat-info">
                <h3>Active Today</h3>
                <p class="stat-number">{{ activationStats.activeToday }}</p>
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
                <p class="stat-number">{{ activationStats.upcoming }}</p>
              </div>
            </div>
          </template>
        </Card>

        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon revenue">
                <i class="pi pi-dollar"></i>
              </div>
              <div class="stat-info">
                <h3>Total Budget</h3>
                <p class="stat-number">${{ activationStats.totalBudget.toLocaleString() }}</p>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Quick Filters -->
      <Card class="filters-card">
        <template #content>
          <div class="filters-row">
            <div class="search-field">
              <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText
                    v-model="searchQuery"
                    placeholder="Search activations..."
                    @input="handleSearch"
                />
              </span>
            </div>

            <div class="filter-field">
              <Dropdown
                  v-model="selectedStatus"
                  :options="statusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="All Status"
                  showClear
                  @change="handleFilter"
              />
            </div>

            <Button
                @click="resetFilters"
                icon="pi pi-filter-slash"
                label="Reset"
                class="p-button-outlined"
                :disabled="!hasActiveFilters"
            />
          </div>
        </template>
      </Card>

      <!-- Activations Table -->
      <Card class="activations-table-card">
        <template #content>
          <DataTable
              :value="activations"
              dataKey="id"
              :paginator="true"
              :rows="10"
              responsiveLayout="scroll"
          >
            <template #header>
              <div class="table-header">
                <h3>Activations Directory</h3>
                <div class="table-actions">
                  <div class="view-toggle">
                    <Button
                        @click="viewMode = 'table'"
                        :class="{ 'p-button-outlined': viewMode !== 'table' }"
                        icon="pi pi-list"
                        class="p-button-sm"
                        v-tooltip.top="'Table View'"
                    />
                    <Button
                        @click="viewMode = 'card'"
                        :class="{ 'p-button-outlined': viewMode !== 'card' }"
                        icon="pi pi-th-large"
                        class="p-button-sm"
                        v-tooltip.top="'Card View'"
                    />
                  </div>
                  <Button
                      v-if="selectedActivations.length > 0"
                      @click="bulkAction"
                      icon="pi pi-cog"
                      :label="`Actions (${selectedActivations.length})`"
                      class="p-button-outlined"
                      :disabled="loading"
                      v-tooltip.top="`Bulk actions for ${selectedActivations.length} selected activations`"
                  />
                  <Button
                      @click="exportData"
                      icon="pi pi-download"
                      label="Export"
                      class="p-button-outlined"
                      :disabled="loading || !activations?.length"
                      v-tooltip.top="activations?.length ? `Export ${activations.length} activations` : 'No activations to export'"
                  />
                </div>
              </div>
            </template>

            <!-- Table View -->
            <template v-if="viewMode === 'table'">
              <Column field="id" header="ID" sortable></Column>
              <Column field="name" header="Name" sortable></Column>
              <Column field="clientCompanyName" header="Client" sortable></Column>
              <Column field="locationName" header="Location" sortable></Column>
              <Column field="startDate" header="Start Date" sortable></Column>
              <Column field="endDate" header="End Date" sortable></Column>
              <Column field="status" header="Status" sortable></Column>
            </template>

            <template #empty>
              <div class="empty-state">
                <i class="pi pi-calendar empty-icon"></i>
                <h3>No activations found</h3>
                <p v-if="hasActiveFilters">Try adjusting your search criteria or clearing filters.</p>
                <p v-else>Start by creating your first activation to begin tracking performance.</p>
                <div class="empty-actions">
                  <Button
                      v-if="hasActiveFilters"
                      @click="resetFilters"
                      label="Clear Filters"
                      icon="pi pi-filter-slash"
                      class="p-button-outlined"
                  />
                  <Button
                      v-if="canCreateActivation && !hasActiveFilters"
                      @click="$router.push('/activations/create')"
                      label="Create First Activation"
                      icon="pi pi-plus"
                      class="p-button-outlined"
                  />
                </div>
              </div>
            </template>
          </DataTable>

          <!-- Card View -->
          <div v-if="viewMode === 'card'" class="card-view">
            <div class="activations-grid">
              <Card
                  v-for="activation in filteredActivations"
                  :key="activation.id"
                  class="activation-card"
                  @click="viewActivation(activation.id)"
              >
                <template #header>
                  <div class="card-header">
                    <div class="activation-status">
                      <Tag
                          :value="activation.status"
                          :severity="getStatusSeverity(activation.status)"
                      />
                    </div>
                    <div class="card-actions">
                      <Button
                          @click.stop="editActivation(activation.id)"
                          icon="pi pi-pencil"
                          class="p-button-text p-button-sm"
                          v-tooltip.top="'Edit'"
                      />
                    </div>
                  </div>
                </template>
                <template #content>
                  <div class="card-content">
                    <h4 class="activation-name">{{ activation.name }}</h4>
                    <p class="activation-code">#{{ activation.id }}</p>

                    <div class="card-details">
                      <div class="detail-item">
                        <i class="pi pi-building"></i>
                        <span>{{ activation.clientCompanyName || activation.clientBrandName || 'N/A' }}</span>
                      </div>
                      <div class="detail-item">
                        <i class="pi pi-map-marker"></i>
                        <span>{{ activation.locationName || activation.city || 'N/A' }}</span>
                      </div>
                      <div class="detail-item">
                        <i class="pi pi-calendar"></i>
                        <span>{{ formatDate(activation.startDate) }} - {{ formatDate(activation.endDate) }}</span>
                      </div>
                      <div class="detail-item">
                        <i class="pi pi-dollar"></i>
                        <span>${{ (activation.totalRevenueUSD || 0).toLocaleString() }}</span>
                      </div>
                    </div>

                    <div class="card-progress">
                      <div class="progress-header">
                        <span>Performance</span>
                        <span>{{ (activation.performancePercentage || 0).toFixed(1) }}%</span>
                      </div>
                      <ProgressBar :value="activation.performancePercentage || 0" />
                    </div>

                    <div class="card-team">
                      <span class="team-label">Team:</span>
                      <div class="team-avatars" v-if="activation.assignedPromoters && activation.assignedPromoters.length > 0">
                        <Avatar
                            v-for="promoter in activation.assignedPromoters.slice(0, 4)"
                            :key="promoter.id"
                            :label="promoter.name.charAt(0)"
                            size="small"
                            class="team-avatar"
                        />
                        <span v-if="activation.assignedPromoters.length > 4" class="more-count">
                          +{{ activation.assignedPromoters.length - 4 }}
                        </span>
                      </div>
                      <span v-else class="no-team">No team assigned</span>
                    </div>
                  </div>
                </template>
              </Card>
            </div>
          </div>
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
        <span v-if="activationToDelete">
          Are you sure you want to delete <strong>{{ activationToDelete.name }}</strong>?
          This action cannot be undone and will remove all associated data.
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
            autofocus
        />
      </template>
    </Dialog>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import { useActivationsStore } from '@/stores/activation'
import { useLoading } from '@/composables/useLoading'
import DashboardLayout from '@/components/general/DashboardLayout.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const activationsStore = useActivationsStore()
const { withLoading, isLoading } = useLoading()

// State
const selectedActivations = ref([])
const searchQuery = ref('')
const selectedStatus = ref(null)
const deleteDialogVisible = ref(false)
const activationToDelete = ref(null)
const viewMode = ref('table')
const refreshing = ref(false)

// Options
const statusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Planned', value: 'Planned' },
  { label: 'On Hold', value: 'On Hold' },
  { label: 'Cancelled', value: 'Cancelled' }
]

const clientOptions = ref([])

// Computed
const userRole = computed(() => authStore.user?.role)
const loading = computed(() => isLoading('fetch-activations') || activationsStore.isLoading)
const activations = computed(() => activationsStore.activations || [])
const activationStats = computed(() => {
  const stats = activationsStore.activationStats
  return {
    total: stats.total || 0,
    activeToday: stats.active || 0,
    upcoming: stats.upcoming || 0,
    totalBudget: activations.value.reduce((sum, a) => sum + (a.totalRevenueUSD || 0), 0)
  }
})
const pagination = computed(() => activationsStore.pagination)

const canCreateActivation = computed(() => {
  return ['ADMIN', 'ACTIVATION_MANAGER'].includes(userRole.value)
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedStatus.value
})

const filteredActivations = computed(() => {
  // With server-side pagination, we use activations directly from the store
  // The filtering is done on the server side based on the filters sent in the API request
  return activations.value
})

// Methods
const loadActivations = async (showLoading = true) => {
  try {
    if (showLoading) {
      await withLoading('fetch-activations', () => activationsStore.fetchActivations())
    } else {
      await activationsStore.fetchActivations()
    }
    
    // Load client options from activations
    clientOptions.value = [
      ...new Set(activations.value.map(a => a.clientCompanyName || a.clientBrandName).filter(Boolean))
    ].map(client => ({ label: client, value: client }))
    
    console.log('Activations loaded:', activations.value)
    console.log('Activations count:', activations.value?.length)
    console.log('First activation:', activations.value?.[0])
    console.log('Pagination:', pagination.value)
  } catch (error) {
    console.error('Failed to load activations:', error)
    
    let errorMessage = 'Failed to load activations'
    if (error.status === 401) {
      errorMessage = 'Session expired. Please log in again.'
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to view activations.'
    } else if (error.status === 404) {
      errorMessage = 'Activation service not found. Please contact support.'
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Please try again later.'
    } else if (error.code === 'NETWORK_ERROR') {
      errorMessage = 'Network connection failed. Please check your internet connection.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    toast.add({
      severity: 'error',
      summary: 'Error Loading Activations',
      detail: errorMessage,
      life: 6000
    })
  }
}

const refreshActivations = async () => {
  refreshing.value = true
  try {
    // Clear any existing errors before refreshing
    activationsStore.clearError()
    
    await loadActivations(false)
    
    toast.add({
      severity: 'success',
      summary: 'Refreshed',
      detail: `Loaded ${activations.value.length} activations successfully`,
      life: 3000
    })
  } catch (error) {
    console.error('Refresh failed:', error)
  } finally {
    refreshing.value = false
  }
}

const handleSearch = () => {
  activationsStore.setFilters({ search: searchQuery.value })
  debouncedFetch()
}

// Enhanced debounced search with pagination reset
let searchTimeout
const debouncedFetch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    try {
      // Reset to first page when searching
      activationsStore.setPagination({ page: 1 })
      await loadActivations(true)
      
      // Clear selection when search changes
      selectedActivations.value = []
    } catch (error) {
      console.error('Search failed:', error)
      toast.add({
        severity: 'error',
        summary: 'Search Error',
        detail: 'Failed to search activations',
        life: 3000
      })
    }
  }, 300)
}

const handleFilter = async () => {
  try {
    activationsStore.setFilters({ 
      status: selectedStatus.value
    })
    
    // Reset to first page when filters change
    activationsStore.setPagination({ page: 1 })
    await loadActivations(true)
    
    // Clear selection when filters change
    selectedActivations.value = []
  } catch (error) {
    console.error('Failed to apply filters:', error)
    toast.add({
      severity: 'error',
      summary: 'Filter Error', 
      detail: 'Failed to apply filters',
      life: 3000
    })
  }
}

const resetFilters = async () => {
  try {
    searchQuery.value = ''
    selectedStatus.value = null
    
    // Clear filters and reset pagination
    activationsStore.clearFilters()
    activationsStore.setPagination({ page: 1 })
    
    await loadActivations(true)
    
    // Clear selection
    selectedActivations.value = []
    
    toast.add({
      severity: 'info',
      summary: 'Filters Reset',
      detail: 'All filters have been cleared',
      life: 2000
    })
  } catch (error) {
    console.error('Failed to reset filters:', error)
    toast.add({
      severity: 'error',
      summary: 'Reset Error',
      detail: 'Failed to reset filters',
      life: 3000
    })
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  try {
    // Handle OffsetDateTime format from backend
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch (error) {
    console.warn('Invalid date format:', dateString)
    return 'Invalid Date'
  }
}

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A'
  
  try {
    // Handle OffsetDateTime format from backend
    const date = new Date(dateTimeString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    console.warn('Invalid datetime format:', dateTimeString)
    return 'Invalid DateTime'
  }
}

const formatRelativeTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A'
  
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
    console.warn('Invalid datetime format for relative time:', dateTimeString)
    return 'Unknown'
  }
}

const calculateDuration = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

const getStatusSeverity = (status) => {
  const severityMap = {
    'Active': 'success',
    'Completed': 'info',
    'Planned': 'warning',
    'On Hold': 'secondary',
    'Cancelled': 'danger'
  }
  return severityMap[status] || 'info'
}

const canEditActivation = (activation) => {
  return ['ADMIN', 'ACTIVATION_MANAGER'].includes(userRole.value) ||
      (userRole.value === 'CLIENT' && activation.clientEmail === authStore.user?.email)
}

const canDeleteActivation = (activation) => {
  return ['ADMIN', 'ACTIVATION_MANAGER'].includes(userRole.value) &&
      activation.status !== 'Active'
}

const viewActivation = (activationId) => {
  router.push(`/activations/${activationId}`)
}

const editActivation = (activationId) => {
  router.push(`/activations/${activationId}/edit`)
}

const deleteActivation = (activation) => {
  activationToDelete.value = activation
  deleteDialogVisible.value = true
}

const confirmDelete = async () => {
  try {
    await activationsStore.deleteActivation(activationToDelete.value.id)

    toast.add({
      severity: 'success',
      summary: 'Activation Deleted',
      detail: `${activationToDelete.value.name} has been deleted successfully`,
      life: 4000
    })
    
    // Refresh the activation list after successful deletion
    await loadActivations(false)
  } catch (error) {
    console.error('Failed to delete activation:', error)
    
    let errorMessage = 'Failed to delete activation'
    if (error.status === 409) {
      errorMessage = 'Cannot delete activation with active team members. Please remove team assignments first.'
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to delete this activation.'
    } else if (error.status === 404) {
      errorMessage = 'Activation not found. It may have already been deleted.'
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
    activationToDelete.value = null
  }
}

const bulkAction = () => {
  if (!selectedActivations.value.length) return
  
  // Show bulk action menu
  toast.add({
    severity: 'info',
    summary: 'Bulk Actions',
    detail: `${selectedActivations.value.length} activations selected. Bulk actions will be implemented.`,
    life: 3000
  })
}

const exportData = async () => {
  if (!activations.value?.length) {
    toast.add({
      severity: 'warn',
      summary: 'Export Warning',
      detail: 'No activations available to export',
      life: 3000
    })
    return
  }

  try {
    // Prepare data for export
    const exportData = activations.value.map(activation => ({
      'Activation Name': activation.name || '',
      'ID': activation.id || '',
      'Client Company': activation.clientCompanyName || '',
      'Client Brand': activation.clientBrandName || '',
      'Location': activation.locationName || activation.city || '',
      'Street Address': activation.streetAddress || '',
      'Start Date': activation.startDate ? formatDate(activation.startDate) : '',
      'End Date': activation.endDate ? formatDate(activation.endDate) : '',
      'Start Time': activation.startTime || '',
      'End Time': activation.endTime || '',
      'Revenue (USD)': activation.totalRevenueUSD || 0,
      'Revenue (ZWL)': activation.totalRevenueZWL || 0,
      'Units Sold': activation.totalUnitsSold || 0,
      'Customer Engagements': activation.totalCustomerEngagements || 0,
      'Hours Worked': activation.totalHoursWorked || 0,
      'Status': activation.status || '',
      'Performance': `${(activation.performancePercentage || 0).toFixed(1)}%`,
      'Manager': activation.activationManagerName || 'Unassigned',
      'Team Size': activation.assignedPromoters?.length || 0,
      'Duration': activation.startDate && activation.endDate ? 
        calculateDuration(activation.startDate, activation.endDate) + ' days' : '',
      'Brief Description': activation.briefDescription || '',
      'Created Date': activation.dateCreated ? formatDateTime(activation.dateCreated) : '',
      'Last Updated': activation.lastUpdated ? formatDateTime(activation.lastUpdated) : ''
    }))

    // Convert to CSV
    const headers = Object.keys(exportData[0])
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => 
          `"${String(row[header]).replace(/"/g, '""')}"`
        ).join(',')
      )
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `activations_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.add({
      severity: 'success',
      summary: 'Export Complete',
      detail: `Successfully exported ${exportData.length} activations to CSV`,
      life: 4000
    })
  } catch (error) {
    console.error('Export failed:', error)
    toast.add({
      severity: 'error',
      summary: 'Export Failed',
      detail: 'Failed to export activation data. Please try again.',
      life: 5000
    })
  }
}

// Pagination and sorting handlers
const onPageChange = async (event) => {
  try {
    const newPage = event.page + 1 // Convert to 1-based indexing
    const newLimit = event.rows
    
    // Update pagination in store
    activationsStore.setPagination({
      page: newPage,
      limit: newLimit
    })
    
    // Fetch new page data
    await loadActivations(true)
    
    // Clear selection when page changes
    selectedActivations.value = []
  } catch (error) {
    console.error('Failed to change page:', error)
    toast.add({
      severity: 'error',
      summary: 'Pagination Error',
      detail: 'Failed to load page data',
      life: 3000
    })
  }
}

const onSort = async (event) => {
  try {
    // Update sort in store
    activationsStore.setSorting(
      event.sortField,
      event.sortOrder === 1 ? 'asc' : 'desc'
    )
    
    // Reset to first page and fetch data
    activationsStore.setPagination({ page: 1 })
    await loadActivations(true)
    
    // Clear selection when sorting changes
    selectedActivations.value = []
  } catch (error) {
    console.error('Failed to sort:', error)
    toast.add({
      severity: 'error',
      summary: 'Sort Error',
      detail: 'Failed to sort activation data',
      life: 3000
    })
  }
}

// Initialize filters from store
const initializeFilters = () => {
  const storeFilters = activationsStore.filters || {}
  searchQuery.value = storeFilters.search || ''
  selectedStatus.value = storeFilters.status || null
}

// Enhanced error handling watcher
watch(() => activationsStore.error, (error) => {
  if (error) {
    // Only show toast if we're not already handling the error elsewhere
    if (!loading.value && !refreshing.value) {
      toast.add({
        severity: 'error',
        summary: 'Activation Service Error',
        detail: error,
        life: 6000
      })
    }
    
    // Auto-clear error after showing
    setTimeout(() => {
      activationsStore.clearError()
    }, 1000)
  }
})

onMounted(async () => {
  initializeFilters()
  
  // Add retry logic for initial load
  let retryCount = 0
  const maxRetries = 3
  
  const attemptLoad = async () => {
    try {
      await loadActivations()
    } catch (error) {
      retryCount++
      if (retryCount < maxRetries) {
        console.log(`Retrying activation load (attempt ${retryCount + 1}/${maxRetries})...`)
        setTimeout(attemptLoad, 2000 * retryCount) // Exponential backoff
      } else {
        console.error('Failed to load activations after maximum retries')
        toast.add({
          severity: 'error',
          summary: 'Connection Failed',
          detail: 'Unable to load activations after multiple attempts. Please check your connection and try refreshing.',
          life: 10000
        })
      }
    }
  }
  
  await attemptLoad()
  
  // Check for client filter from query params
  if (route.query.client) {
    selectedClient.value = route.query.client
    handleFilter()
  }
})
</script>

<style scoped>
.activations-page {
  padding: 1.5rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.page-description {
  color: #6b7280;
  margin: 0;
}

.header-button-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
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

.stat-icon.total { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.stat-icon.active { background: linear-gradient(135deg, #10b981, #059669); }
.stat-icon.upcoming { background: linear-gradient(135deg, #f59e0b, #d97706); }
.stat-icon.revenue { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }

.stat-info h3 {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-number {
  margin: 0.25rem 0 0 0;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.filters-card {
  margin-bottom: 1.5rem;
}

.filters-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-field {
  flex: 1;
  min-width: 250px;
}

.filter-field {
  min-width: 200px;
}

.activations-table-card {
  margin-bottom: 1.5rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.table-header h3 {
  margin: 0;
  color: #111827;
}

.table-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
}

.activation-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.activation-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
}

.activation-link:hover {
  text-decoration: underline;
}

.activation-code {
  font-size: 0.8rem;
  color: #6b7280;
  font-family: monospace;
}

.client-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.location-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
}

.date-range-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.start-date, .end-date {
  font-size: 0.875rem;
  color: #111827;
}

.date-separator {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0 0.25rem;
}

.duration {
  font-size: 0.75rem;
  color: #6b7280;
}

.manager-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.team-cell {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.promoter-avatars {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.promoter-avatar {
  background: #3b82f6;
}

.promoter-count {
  font-size: 0.8rem;
  color: #6b7280;
  margin-left: 0.5rem;
}

.team-size {
  font-size: 0.8rem;
  color: #6b7280;
}

.budget-amount {
  font-weight: 600;
  color: #10b981;
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 0.5rem;
}

.progress-text {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.875rem;
  min-width: 35px;
}

.audit-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.last-updated {
  font-weight: 500;
  color: #111827;
  font-size: 0.875rem;
}

.created-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #111827;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Card View Styles */
.card-view {
  margin-top: 1rem;
}

.activations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.activation-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
}

.activation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1rem 0 1rem;
}

.activation-status {
  flex: 1;
}

.card-actions {
  display: flex;
  gap: 0.25rem;
}

.card-content {
  padding: 0 1rem 1rem 1rem;
}

.activation-name {
  color: #111827;
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.detail-item i {
  width: 1rem;
  color: #9ca3af;
}

.card-progress {
  margin: 1rem 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.card-team {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.team-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.team-avatars {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.team-avatar {
  background: #6b7280;
}

.more-count {
  font-size: 0.8rem;
  color: #6b7280;
  margin-left: 0.5rem;
}

.delete-dialog-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.delete-warning-icon {
  font-size: 2rem;
  color: #f59e0b;
}

@media (max-width: 768px) {
  .activations-page {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-field,
  .filter-field {
    min-width: auto;
  }

  .table-header {
    flex-direction: column;
    align-items: stretch;
  }

  .table-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .activations-grid {
    grid-template-columns: 1fr;
  }

  .date-info {
    flex-direction: row;
    align-items: center;
  }

  .progress-cell {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .progress-text {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .activation-card {
    margin: 0 -0.5rem;
  }

  .card-content {
    padding: 0 0.75rem 0.75rem 0.75rem;
  }

  .card-header {
    padding: 0.75rem 0.75rem 0 0.75rem;
  }
}
</style>
<template>
  <DashboardLayout>
    <div class="clients-page">
      <!-- Page Header -->
      <PageHeader 
        title="Client Management"
        description="Manage your brand activation clients and their contact information"
        :actions="headerActions"
        :loading="loading"
      />

      <!-- Stats Cards -->
      <StatsGrid :stats="statsData" :loading="loading" />

      <!-- Filters and Search -->
      <FilterBar
        v-model:search="searchQuery"
        v-model:filter-values="filterValues"
        search-placeholder="Search clients..."
        :filters="filterConfig"
        @search="handleSearch"
        @filter="handleFilter"
        @reset="resetFilters"
      />

      <!-- Advanced Filters Panel -->
      <Card v-if="showAdvancedFilters" class="advanced-filters-card">
        <template #header>
          <h3>Advanced Filters</h3>
        </template>
        <template #content>
          <div class="advanced-filters-grid">
            <div class="filter-group">
              <label>Revenue Range</label>
              <div class="range-inputs">
                <InputNumber
                    v-model="minRevenue"
                    placeholder="Min revenue"
                    mode="currency"
                    currency="USD"
                    @input="handleAdvancedFilter"
                />
                <span class="range-separator">to</span>
                <InputNumber
                    v-model="maxRevenue"
                    placeholder="Max revenue"
                    mode="currency"
                    currency="USD"
                    @input="handleAdvancedFilter"
                />
              </div>
            </div>

            <div class="filter-group">
              <label>Activation Count</label>
              <div class="range-inputs">
                <InputNumber
                    v-model="minActivations"
                    placeholder="Min activations"
                    @input="handleAdvancedFilter"
                />
                <span class="range-separator">to</span>
                <InputNumber
                    v-model="maxActivations"
                    placeholder="Max activations"
                    @input="handleAdvancedFilter"
                />
              </div>
            </div>

            <div class="filter-group">
              <label>Countries</label>
              <MultiSelect
                  v-model="selectedCountries"
                  :options="countryOptions"
                  placeholder="Select countries"
                  @change="handleAdvancedFilter"
              />
            </div>

            <div class="filter-group">
              <label>Has Website</label>
              <div class="checkbox-group">
                <Checkbox
                    v-model="hasWebsite"
                    :binary="true"
                    @change="handleAdvancedFilter"
                />
                <span>Only clients with website</span>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Clients Table -->
      <Card class="clients-table-card">
        <template #content>
          <DataTable
              :value="clients"
              :loading="loading"
              responsiveLayout="scroll"
              :paginator="true"
              :lazy="true"
              :totalRecords="pagination.total"
              :rows="pagination.limit"
              :first="(pagination.page - 1) * pagination.limit"
              :rowsPerPageOptions="[5, 10, 25, 50, 100]"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} clients"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              dataKey="id"
              v-model:selection="selectedClients"
              selectionMode="multiple"
              :metaKeySelection="false"
              loadingIcon="pi pi-spin pi-spinner"
              emptyMessage="No clients found matching your criteria"
              :globalFilterFields="['companyName', 'brandName', 'primaryContactEmail', 'businessType']"
              :breakpoint="'768px'"
              :scrollable="true"
              scrollHeight="60vh"
              class="responsive-table"
              @page="onPageChange"
              @sort="onSort"
              :sortField="sortField"
              :sortOrder="sortOrder"
          >
            <template #header>
              <div class="table-header">
                <h3>Client Directory</h3>
                <div class="table-actions">
                  <Button
                      v-if="selectedClients.length > 0 && userRole === 'ADMIN'"
                      @click="bulkDelete"
                      icon="pi pi-trash"
                      :label="`Delete Selected (${selectedClients.length})`"
                      class="p-button-danger p-button-outlined"
                      :disabled="loading || bulkDeleting"
                      :loading="bulkDeleting"
                      v-tooltip.top="`Delete ${selectedClients.length} selected clients`"
                  />
                  <Button
                      @click="exportData"
                      icon="pi pi-download"
                      label="Export"
                      class="p-button-outlined"
                      :disabled="loading || !clients?.length"
                      v-tooltip.top="clients?.length ? `Export ${clients.length} clients` : 'No clients to export'"
                  />
                </div>
              </div>
            </template>

            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

            <Column field="id" header="ID" sortable>
              <template #body="{ data }">
                <span>{{ data.id }}</span>
              </template>
            </Column>

            <Column field="companyName" header="Company" sortable>
              <template #body="{ data }">
                <div class="company-cell">
                  <Avatar
                      :label="(data.companyName || data.brandName || '?').charAt(0)"
                      size="normal"
                      shape="circle"
                      :style="{ backgroundColor: data.brandColor || '#3b82f6', color: 'white' }"
                  />
                  <div class="company-info">
                    <span class="company-name">{{ data.companyName || data.brandName }}</span>
                    <span class="industry">{{ data.businessType || 'N/A' }}</span>
                  </div>
                </div>
              </template>
            </Column>

            <Column field="primaryContactEmail" header="Primary Contact" sortable>
              <template #body="{ data }">
                <div class="contact-cell">
                  <span class="contact-name">{{ data.primaryContactName || 'N/A' }}</span>
                  <span class="contact-email">{{ data.primaryContactEmail || 'N/A' }}</span>
                  <span class="contact-phone">{{ data.primaryContactPhone || 'N/A' }}</span>
                </div>
              </template>
            </Column>

            <Column field="city" header="Location" sortable>
              <template #body="{ data }">
                <div class="location-cell">
                  <i class="pi pi-map-marker"></i>
                  <span>{{ data.city }}, {{ data.country }}</span>
                </div>
              </template>
            </Column>

            <Column field="totalActivations" header="Activations" sortable>
              <template #body="{ data }">
                <div class="activations-cell">
                  <Badge :value="data.totalActivations || 0" severity="info" />
                  <span class="activation-text">{{ (data.totalActivations || 0) === 1 ? 'activation' : 'activations' }}</span>
                </div>
              </template>
            </Column>

            <Column field="totalContacts" header="Total Contacts" sortable>
              <template #body="{ data }">
                <span class="contacts-amount">{{ data.totalContacts || 0 }}</span>
              </template>
            </Column>

            <Column field="status" header="Status" sortable>
              <template #body="{ data }">
                <Tag
                    :value="data.status"
                    :severity="getStatusSeverity(data.status)"
                />
              </template>
            </Column>

            <Column field="lastUpdated" header="Last Updated" sortable>
              <template #body="{ data }">
                <div class="audit-cell">
                  <span class="last-updated">{{ formatRelativeTime(data.lastUpdated) }}</span>
                  <span class="created-date" v-if="data.dateCreated">
                    Created: {{ formatDate(data.dateCreated) }}
                  </span>
                </div>
              </template>
            </Column>

            <Column header="Actions" :exportable="false">
              <template #body="{ data }">
                <EntityActionButtons
                  :entity="data"
                  :actions="tableActions"
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
        <span v-if="clientToDelete">
          Are you sure you want to delete <strong>{{ clientToDelete.companyName || clientToDelete.brandName }}</strong>?
          This action cannot be undone and will also remove all associated activations.
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
import { useClientsStore } from '@/stores/client'
import { useAuthStore } from '@/stores/auth'
import { useLoading } from '@/composables/useLoading'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatsGrid from '@/components/ui/StatsGrid.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import EntityActionButtons from '@/components/ui/EntityActionButtons.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const router = useRouter()
const toast = useToast()
const clientsStore = useClientsStore()
const authStore = useAuthStore()
const { withLoading, isLoading } = useLoading()

// Get current user role
const userRole = computed(() => authStore.userRole)

// State
const selectedClients = ref([])
const searchQuery = ref('')
const selectedStatus = ref(null)
const selectedIndustry = ref(null)
const deleteDialogVisible = ref(false)
const clientToDelete = ref(null)
const refreshing = ref(false)
const deleting = ref(false)
const bulkDeleting = ref(false)
const dateRange = ref(null)
const selectedStatuses = ref([])
const showAdvancedFilters = ref(false)
const rowActionRefs = ref({})
const confirmationDialog = ref({
  visible: false,
  title: '',
  message: '',
  icon: 'pi pi-question-circle',
  severity: 'info',
  action: null
})
// Advanced filter state
const minRevenue = ref(null)
const maxRevenue = ref(null)
const minActivations = ref(null)
const maxActivations = ref(null)
const selectedCountries = ref([])
const hasWebsite = ref(false)

const statusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
  { label: 'Pending', value: 'Pending' }
]

const industryOptions = [
  { label: 'Technology', value: 'Technology' },
  { label: 'Fashion & Beauty', value: 'Fashion & Beauty' },
  { label: 'Food & Beverage', value: 'Food & Beverage' },
  { label: 'Automotive', value: 'Automotive' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Retail', value: 'Retail' },
  { label: 'Entertainment', value: 'Entertainment' }
]

// Country options
const countryOptions = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 
  'Australia', 'Japan', 'South Korea', 'Brazil', 'Mexico'
]

// Bulk action menu items
const bulkActionItems = [
  {
    label: 'Set Active',
    icon: 'pi pi-check',
    command: () => bulkUpdateStatus('ACTIVE')
  },
  {
    label: 'Set Inactive', 
    icon: 'pi pi-times',
    command: () => bulkUpdateStatus('INACTIVE')
  },
  {
    label: 'Set Pending',
    icon: 'pi pi-clock',
    command: () => bulkUpdateStatus('PENDING')
  },
  {
    separator: true
  },
  {
    label: 'Export Selected',
    icon: 'pi pi-download',
    command: () => exportSelectedClients()
  }
]

// Export options menu
const exportOptions = [
  {
    label: 'Export as CSV',
    icon: 'pi pi-file',
    command: () => exportData('csv')
  },
  {
    label: 'Export as Excel',
    icon: 'pi pi-file-excel',
    command: () => exportData('excel')
  },
  {
    label: 'Export Selected Only',
    icon: 'pi pi-filter',
    command: () => exportSelectedClients()
  }
]

// Header actions configuration
const headerActions = computed(() => [
  {
    key: 'refresh',
    icon: 'pi pi-refresh',
    class: 'p-button-outlined',
    loading: refreshing.value,
    tooltip: 'Refresh client list',
    handler: refreshClients
  },
  ...(userRole.value === 'ADMIN' ? [{
    key: 'create',
    icon: 'pi pi-plus',
    label: 'Add Client',
    class: 'p-button-success',
    handler: () => router.push('/clients/create')
  }] : [])
])

// Stats data configuration
const statsData = computed(() => [
  {
    key: 'total',
    title: 'Total Clients',
    value: clientStats.value.total,
    icon: 'pi pi-building',
    type: 'total'
  },
  {
    key: 'active',
    title: 'Active Clients',
    value: clientStats.value.active,
    icon: 'pi pi-check-circle',
    type: 'active'
  },
  {
    key: 'activeActivations',
    title: 'Active Activations',
    value: clientStats.value.activeActivations,
    icon: 'pi pi-calendar',
    type: 'activations'
  },
  {
    key: 'totalRevenue',
    title: 'Total Revenue',
    value: clientStats.value.totalRevenue,
    format: 'currency',
    icon: 'pi pi-dollar',
    type: 'revenue'
  }
])

// Filter configuration
const filterValues = ref({
  status: selectedStatus.value,
  industry: selectedIndustry.value
})

const filterConfig = [
  {
    key: 'status',
    type: 'dropdown',
    placeholder: 'All Status',
    options: statusOptions
  },
  {
    key: 'industry',
    type: 'dropdown', 
    placeholder: 'All Industries',
    options: industryOptions
  }
]

// Table actions configuration
const tableActions = [
  {
    key: 'view',
    icon: 'pi pi-eye',
    tooltip: 'View Details',
    handler: (entity) => viewClient(entity.id)
  },
  {
    key: 'edit',
    icon: 'pi pi-pencil',
    tooltip: 'Edit Client',
    handler: (entity) => editClient(entity.id)
  },
  {
    key: 'createActivation',
    icon: 'pi pi-plus',
    tooltip: 'Create Activation',
    handler: (entity) => createActivation(entity.id)
  },
  {
    key: 'delete',
    icon: 'pi pi-trash',
    tooltip: 'Delete Client',
    severity: 'danger',
    handler: (entity) => deleteClient(entity)
  }
]

// User permissions for action visibility
const userPermissions = computed(() => ({
  canView: true,
  canEdit: userRole.value === 'ADMIN',
  canCreate: userRole.value === 'ADMIN',
  canDelete: userRole.value === 'ADMIN'
}))

// Empty state configurations
const emptyStateConfig = computed(() => {
  if (hasError.value) {
    return {
      type: 'error',
      title: 'Unable to Load Clients',
      message: 'There was an error loading your client data. Please try refreshing the page.',
      actions: [
        {
          label: 'Retry',
          icon: 'pi pi-refresh',
          class: 'p-button-outlined',
          handler: () => loadClients()
        },
        {
          label: 'Go to Dashboard',
          icon: 'pi pi-home',
          class: 'p-button-text',
          handler: () => router.push('/dashboard')
        }
      ]
    }
  } else if (searchQuery.value || selectedStatus.value || selectedIndustry.value) {
    return {
      type: 'no-results',
      title: 'No Matching Clients',
      message: 'No clients found matching your current filters. Try adjusting your search criteria.',
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
      title: 'No Clients Yet',
      message: 'Start by adding your first client to begin managing activations and tracking performance.',
      actions: [
        {
          label: 'Add Your First Client',
          icon: 'pi pi-plus',
          class: 'p-button-success',
          handler: () => router.push('/clients/create')
        }
      ]
    }
  }
})

// Computed
const loading = computed(() => isLoading('fetch-clients') || clientsStore.isLoading)
const clientStats = computed(() => clientsStore.clientStats || { total: 0, active: 0, activeActivations: 0, totalRevenue: 0 })
const clients = computed(() => clientsStore.clients || [])
const pagination = computed(() => {
  const storePagination = clientsStore.pagination || {}
  return {
    total: storePagination.total || 0,
    page: storePagination.page || 1,
    limit: storePagination.limit || 10,
    totalPages: storePagination.totalPages || 0
  }
})
const hasError = computed(() => !!clientsStore.error)
const sortField = ref('companyName')
const sortOrder = ref(1)
const hasActiveFilters = computed(() => 
  searchQuery.value || 
  selectedStatus.value || 
  selectedIndustry.value || 
  dateRange.value || 
  selectedStatuses.value?.length > 0
)

// Methods
const loadClients = async (showLoading = true) => {
  try {
    if (showLoading) {
      await withLoading('fetch-clients', () => clientsStore.fetchClients())
    } else {
      await clientsStore.fetchClients()
    }
    
    console.log('Clients loaded:', clients.value)
    console.log('Pagination:', pagination.value)
  } catch (error) {
    console.error('Failed to load clients:', error)
    
    // More specific error handling
    let errorMessage = 'Failed to load clients'
    if (error.status === 401) {
      errorMessage = 'Session expired. Please log in again.'
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to view clients.'
    } else if (error.status === 404) {
      errorMessage = 'Client service not found. Please contact support.'
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Please try again later.'
    } else if (error.code === 'NETWORK_ERROR') {
      errorMessage = 'Network connection failed. Please check your internet connection.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    toast.add({
      severity: 'error',
      summary: 'Error Loading Clients',
      detail: errorMessage,
      life: 6000
    })
  }
}

const refreshClients = async () => {
  refreshing.value = true
  try {
    // Clear any existing errors before refreshing
    clientsStore.clearError()
    
    await loadClients(false)
    
    toast.add({
      severity: 'success',
      summary: 'Refreshed',
      detail: `Loaded ${clients.value?.length || 0} clients successfully`,
      life: 3000
    })
  } catch (error) {
    // Error already handled in loadClients, but we can add specific refresh error handling
    console.error('Refresh failed:', error)
  } finally {
    refreshing.value = false
  }
}

const handleSearch = () => {
  clientsStore.setFilters({ search: searchQuery.value })
  debouncedFetch()
}

const handleFilter = () => {
  clientsStore.setFilters({ 
    status: selectedStatus.value,
    industry: selectedIndustry.value 
  })
  loadClients(false)
}

const resetFilters = async () => {
  try {
    searchQuery.value = ''
    selectedStatus.value = null
    selectedIndustry.value = null
    
    // Clear filters and reset pagination
    clientsStore.clearFilters()
    clientsStore.setPagination({ page: 1 })
    
    await loadClients(true)
    
    // Clear selection
    selectedClients.value = []
    
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

const handleAdvancedFilter = async () => {
  try {
    clientsStore.setFilters({ 
      statuses: selectedStatuses.value,
      minRevenue: minRevenue.value,
      maxRevenue: maxRevenue.value,
      minActivations: minActivations.value,
      maxActivations: maxActivations.value,
      countries: selectedCountries.value,
      hasWebsite: hasWebsite.value
    })
    
    // Reset to first page when filters change
    clientsStore.setPagination({ page: 1 })
    await loadClients(true)
    
    // Clear selection when filters change
    selectedClients.value = []
  } catch (error) {
    console.error('Failed to apply advanced filters:', error)
    toast.add({
      severity: 'error',
      summary: 'Filter Error', 
      detail: 'Failed to apply advanced filters',
      life: 3000
    })
  }
}

const handleDateFilter = async () => {
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    clientsStore.setFilters({ 
      dateStart: startDate?.toISOString(),
      dateEnd: endDate?.toISOString()
    })
    
    // Reset to first page when filters change
    clientsStore.setPagination({ page: 1 })
    await loadClients(true)
    
    // Clear selection
    selectedClients.value = []
  }
}

const clearDateFilter = async () => {
  dateRange.value = null
  clientsStore.setFilters({ dateStart: null, dateEnd: null })
  
  // Reset to first page
  clientsStore.setPagination({ page: 1 })
  await loadClients(true)
  
  // Clear selection
  selectedClients.value = []
}

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value
}

// Debounced search
let searchTimeout
const debouncedFetch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadClients(false)
  }, 300)
}

const getStatusSeverity = (status) => {
  const severityMap = {
    'ACTIVE': 'success',
    'INACTIVE': 'danger', 
    'PENDING': 'warning',
    'Active': 'success',
    'Inactive': 'danger',
    'Pending': 'warning'
  }
  return severityMap[status] || 'info'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  try {
    // Handle OffsetDateTime format from backend
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

const viewClient = (clientId) => {
  router.push(`/clients/${clientId}`)
}

const editClient = (clientId) => {
  router.push(`/clients/${clientId}/edit`)
}

const createActivation = (clientId) => {
  router.push(`/activations/create?client=${clientId}`)
}

const deleteClient = (client) => {
  clientToDelete.value = client
  deleteDialogVisible.value = true
}

// Handle table action events from EntityActionButtons
const handleTableAction = ({ action, entity }) => {
  const handler = action.handler
  if (handler && typeof handler === 'function') {
    handler(entity)
  }
}

const confirmDelete = async () => {
  const deleting = ref(true)
  
  try {
    await clientsStore.deleteClient(clientToDelete.value.id)

    toast.add({
      severity: 'success',
      summary: 'Client Deleted',
      detail: `${clientToDelete.value.companyName || clientToDelete.value.brandName} has been deleted successfully`,
      life: 4000
    })
    
    // Refresh the client list after successful deletion
    await loadClients(false)
  } catch (error) {
    console.error('Failed to delete client:', error)
    
    let errorMessage = 'Failed to delete client'
    if (error.status === 409) {
      errorMessage = 'Cannot delete client with active activations. Please complete or cancel all activations first.'
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to delete this client.'
    } else if (error.status === 404) {
      errorMessage = 'Client not found. It may have already been deleted.'
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
    clientToDelete.value = null
    deleting.value = false
  }
}

const bulkDelete = async () => {
  if (!selectedClients.value.length) return
  
  const bulkDeleting = ref(true)
  const clientCount = selectedClients.value.length
  
  try {
    const deletePromises = selectedClients.value.map(client => 
      clientsStore.deleteClient(client.id).catch(error => ({ error, client }))
    )
    
    const results = await Promise.allSettled(deletePromises)
    
    // Count successful and failed deletions
    const successful = results.filter(result => 
      result.status === 'fulfilled' && !result.value?.error
    ).length
    
    const failed = clientCount - successful
    
    if (successful === clientCount) {
      toast.add({
        severity: 'success',
        summary: 'Bulk Delete Successful',
        detail: `All ${clientCount} clients have been deleted successfully`,
        life: 4000
      })
    } else if (successful > 0) {
      toast.add({
        severity: 'warn',
        summary: 'Partial Success',
        detail: `${successful} clients deleted successfully, ${failed} failed`,
        life: 5000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Bulk Delete Failed',
        detail: 'Failed to delete any of the selected clients',
        life: 5000
      })
    }

    selectedClients.value = []
    
    // Refresh the client list
    await loadClients(false)
  } catch (error) {
    console.error('Failed to delete clients:', error)
    toast.add({
      severity: 'error',
      summary: 'Bulk Delete Error',
      detail: 'An unexpected error occurred during bulk deletion',
      life: 5000
    })
  } finally {
    bulkDeleting.value = false
  }
}

const exportSelectedClients = async () => {
  if (!selectedClients.value.length) {
    toast.add({
      severity: 'warn',
      summary: 'No Selection',
      detail: 'Please select clients to export',
      life: 3000
    })
    return
  }
  
  await exportClientsData(selectedClients.value, 'selected_clients')
}

const exportClientsData = async (clientsToExport, filenamePrefix = 'clients') => {
  try {
    const exportData = clientsToExport.map(client => ({
      'Company Name': client.companyName || '',
      'Brand Name': client.brandName || '',
      'Business Type': client.businessType || '',
      'Primary Contact': client.primaryContactName || '',
      'Email': client.primaryContactEmail || '',
      'Phone': client.primaryContactPhone || '',
      'City': client.city || '',
      'Country': client.country || '',
      'Status': client.status || '',
      'Total Activations': client.totalActivations || 0,
      'Total Contacts': client.totalContacts || 0,
      'Website': client.website || '',
      'Created Date': client.dateCreated ? formatDateTime(client.dateCreated) : '',
      'Last Updated': client.lastUpdated ? formatDateTime(client.lastUpdated) : ''
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
    link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.add({
      severity: 'success',
      summary: 'Export Complete',
      detail: `Successfully exported ${exportData.length} clients to CSV`,
      life: 4000
    })
  } catch (error) {
    console.error('Export failed:', error)
    toast.add({
      severity: 'error',
      summary: 'Export Failed',
      detail: 'Failed to export client data. Please try again.',
      life: 5000
    })
  }
}

const exportData = async (format = 'csv') => {
  if (!clients.value?.length) {
    toast.add({
      severity: 'warn',
      summary: 'Export Warning',
      detail: 'No clients available to export',
      life: 3000
    })
    return
  }

  await exportClientsData(clients.value, `clients_${format}`)
}

// Confirmation dialog actions
const executeConfirmedAction = async () => {
  if (confirmationDialog.value.action) {
    await confirmationDialog.value.action()
  }
  confirmationDialog.value.visible = false
}

// Enhanced bulk status update with confirmation
const bulkUpdateStatus = (newStatus) => {
  if (!selectedClients.value.length) return
  
  const statusLabels = {
    'ACTIVE': 'Active',
    'INACTIVE': 'Inactive', 
    'PENDING': 'Pending'
  }
  
  confirmationDialog.value = {
    visible: true,
    title: `Update Client Status`,
    message: `Are you sure you want to set ${selectedClients.value.length} selected clients to <strong>${statusLabels[newStatus]}</strong> status?`,
    icon: 'pi pi-users',
    severity: 'info',
    action: () => performBulkStatusUpdate(newStatus)
  }
}

const performBulkStatusUpdate = async (newStatus) => {
  if (!selectedClients.value.length) return
  
  const updating = ref(true)
  
  try {
    const updatePromises = selectedClients.value.map(client => 
      clientsStore.updateClient(client.id, { status: newStatus })
        .catch(error => ({ error, client }))
    )
    
    const results = await Promise.allSettled(updatePromises)
    
    const successful = results.filter(result => 
      result.status === 'fulfilled' && !result.value?.error
    ).length
    
    const failed = selectedClients.value.length - successful
    
    if (successful === selectedClients.value.length) {
      toast.add({
        severity: 'success',
        summary: 'Bulk Update Successful',
        detail: `Updated ${successful} clients to ${newStatus}`,
        life: 4000
      })
    } else if (successful > 0) {
      toast.add({
        severity: 'warn',
        summary: 'Partial Success',
        detail: `${successful} clients updated, ${failed} failed`,
        life: 5000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Bulk Update Failed',
        detail: 'Failed to update any of the selected clients',
        life: 5000
      })
    }
    
    selectedClients.value = []
    await loadClients(false)
  } catch (error) {
    console.error('Bulk update failed:', error)
    toast.add({
      severity: 'error',
      summary: 'Update Error',
      detail: 'An unexpected error occurred during bulk update',
      life: 5000
    })
  } finally {
    updating.value = false
  }
}

// Mobile action menu handling
const setRowActionRef = (id, ref) => {
  if (ref) {
    rowActionRefs.value[id] = ref
  }
}

const toggleRowActions = (clientId) => {
  const ref = rowActionRefs.value[clientId]
  if (ref) {
    ref.toggle(event)
  }
}

const onPageChange = async (event) => {
  try {
    const newPage = event.page + 1 // Convert to 1-based indexing
    const newLimit = event.rows
    
    // Update pagination in store
    clientsStore.setPagination({
      page: newPage,
      limit: newLimit
    })
    
    // Fetch new page data
    await loadClients(true)
    
    // Clear selection when page changes
    selectedClients.value = []
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
    sortField.value = event.sortField
    sortOrder.value = event.sortOrder
    
    // Update sort in store
    clientsStore.setSorting({
      field: event.sortField,
      order: event.sortOrder === 1 ? 'asc' : 'desc'
    })
    
    // Reset to first page and fetch data
    clientsStore.setPagination({ page: 1 })
    await loadClients(true)
    
    // Clear selection when sorting changes
    selectedClients.value = []
  } catch (error) {
    console.error('Failed to sort:', error)
    toast.add({
      severity: 'error',
      summary: 'Sort Error',
      detail: 'Failed to sort client data',
      life: 3000
    })
  }
}

// Watchers
watch(searchQuery, (newValue) => {
  if (newValue !== clientsStore.filters.search) {
    handleSearch()
  }
})

// Initialize filters from store
const initializeFilters = () => {
  const storeFilters = clientsStore.filters || {}
  searchQuery.value = storeFilters.search || ''
  selectedStatus.value = storeFilters.status || null
  selectedIndustry.value = storeFilters.industry || null
  selectedStatuses.value = storeFilters.statuses || []
  dateRange.value = storeFilters.dateRange || null
  minRevenue.value = storeFilters.minRevenue || null
  maxRevenue.value = storeFilters.maxRevenue || null
  minActivations.value = storeFilters.minActivations || null
  maxActivations.value = storeFilters.maxActivations || null
  selectedCountries.value = storeFilters.countries || []
  hasWebsite.value = storeFilters.hasWebsite || false
}

// Enhanced error handling watcher
watch(() => clientsStore.error, (error) => {
  if (error) {
    // Only show toast if we're not already handling the error elsewhere
    if (!loading.value && !refreshing.value) {
      toast.add({
        severity: 'error',
        summary: 'Client Service Error',
        detail: error,
        life: 6000
      })
    }
    
    // Auto-clear error after showing
    setTimeout(() => {
      clientsStore.clearError()
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
      await loadClients()
    } catch (error) {
      retryCount++
      if (retryCount < maxRetries) {
        console.log(`Retrying client load (attempt ${retryCount + 1}/${maxRetries})...`)
        setTimeout(attemptLoad, 2000 * retryCount) // Exponential backoff
      } else {
        console.error('Failed to load clients after maximum retries')
        toast.add({
          severity: 'error',
          summary: 'Connection Failed',
          detail: 'Unable to load clients after multiple attempts. Please check your connection and try refreshing.',
          life: 10000
        })
      }
    }
  }
  
  await attemptLoad()
})
</script>

<style scoped>
.clients-page {
  padding: 1.5rem;
  space-y: 1.5rem;
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
.stat-icon.activations { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.stat-icon.revenue { background: linear-gradient(135deg, #f59e0b, #d97706); }

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

.filter-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.advanced-filters-card {
  margin-bottom: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.advanced-filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.range-separator {
  color: #6b7280;
  font-size: 0.875rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Touch-friendly interactions */
.p-button {
  min-height: 44px;
  touch-action: manipulation;
}

.p-inputtext,
.p-dropdown,
.p-multiselect {
  min-height: 44px;
}

/* Responsive table utilities */
.responsive-table {
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .responsive-table {
    font-size: 0.8rem;
  }
  
  .responsive-table .p-datatable-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

/* Loading and skeleton states for better UX */
.loading-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Enhanced accessibility */
.p-button:focus,
.p-inputtext:focus,
.p-dropdown:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Better visual hierarchy on mobile */
@media (max-width: 768px) {
  .page-title {
    line-height: 1.2;
  }
  
  .page-description {
    font-size: 0.875rem;
    line-height: 1.4;
  }
  
  .stat-card {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .filters-card,
  .clients-table-card,
  .advanced-filters-card {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }
}

.clients-table-card {
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
  color: #111827;
}

.table-actions {
  display: flex;
  gap: 0.75rem;
}

.company-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.company-info {
  display: flex;
  flex-direction: column;
}

.company-name {
  font-weight: 600;
  color: #111827;
}

.industry {
  font-size: 0.875rem;
  color: #6b7280;
}

.contact-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contact-name {
  font-weight: 500;
  color: #111827;
}

.contact-email,
.contact-phone {
  font-size: 0.875rem;
  color: #6b7280;
}

.location-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
}

.activations-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.activation-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.revenue-amount {
  font-weight: 600;
  color: #10b981;
}

.last-activity {
  color: #6b7280;
  font-size: 0.875rem;
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

.empty-clients-state .empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.error-state .error-icon {
  font-size: 4rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.no-results-state .no-results-icon {
  font-size: 4rem;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #111827;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 1.5rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
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

/* Confirmation dialog styles */
.confirmation-dialog-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
}

.confirmation-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.confirmation-icon.info {
  color: #3b82f6;
}

.confirmation-icon.danger {
  color: #dc2626;
}

.confirmation-icon.warning {
  color: #f59e0b;
}

.confirmation-icon.success {
  color: #10b981;
}

.confirmation-dialog .p-dialog-content {
  padding: 1.5rem;
}

.confirmation-dialog .p-dialog-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

/* Enhanced responsive design */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .advanced-filters-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .clients-page {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }

  .header-button-group {
    flex-direction: column;
    width: 100%;
  }

  .header-button-group .p-button {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .filters-row {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .search-field,
  .filter-field {
    min-width: auto;
    width: 100%;
  }

  .filter-actions {
    flex-direction: column;
    width: 100%;
  }

  .filter-actions .p-button {
    width: 100%;
  }

  .advanced-filters-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .range-inputs {
    flex-direction: column;
    gap: 0.5rem;
  }

  .range-separator {
    align-self: center;
  }

  .table-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .table-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .bulk-actions,
  .export-actions {
    flex-direction: column;
    width: 100%;
  }

  .bulk-actions .p-button,
  .export-actions .p-button {
    width: 100%;
  }

  /* DataTable mobile optimizations */
  .p-datatable .p-datatable-thead > tr > th,
  .p-datatable .p-datatable-tbody > tr > td {
    padding: 0.5rem;
    font-size: 0.875rem;
  }

  .company-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .contact-cell {
    gap: 0.125rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-buttons .p-button {
    width: 100%;
    justify-content: center;
  }

  /* Card responsive adjustments */
  .stat-content {
    flex-direction: column;
    text-align: center;
  }

  .stat-icon {
    align-self: center;
  }

  .empty-state {
    padding: 2rem 1rem;
  }

  .error-actions {
    flex-direction: column;
    width: 100%;
  }

  .error-actions .p-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .clients-page {
    padding: 0.75rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    gap: 0.75rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .filters-card,
  .clients-table-card,
  .advanced-filters-card {
    margin-bottom: 1rem;
  }

  /* Hide less important columns on very small screens */
  .p-datatable .p-column-header-content,
  .p-datatable .p-datatable-tbody td {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
  }

  /* Stack action buttons vertically on very small screens */
  .action-buttons {
    max-width: 100px;
  }

  .action-buttons .p-button {
    padding: 0.375rem;
    min-width: auto;
  }

  .action-buttons .p-button .p-button-label {
    display: none;
  }
}
</style>
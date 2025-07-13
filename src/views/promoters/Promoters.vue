<template>
  <DashboardLayout>
    <div class="promoters-page">
      <!-- Page Header -->
      <PageHeader 
        title="Promoter Management"
        description="Manage promoters and their field assignments"
        :actions="headerActions"
        :loading="loading"
      />

      <!-- Stats Cards -->
      <StatsGrid :stats="statsData" :loading="loading" />

      <!-- Filters and Search -->
      <FilterBar
        v-model:search="searchQuery"
        v-model:filter-values="filterValues"
        search-placeholder="Search promoters..."
        :filters="filterConfig"
        @search="handleSearch"
        @filter="handleFilter"
        @reset="resetFilters"
      />

      <!-- Promoters Table -->
      <Card class="promoters-table-card">
        <template #content>
          <DataTable
              :value="promoters"
              dataKey="id"
              :paginator="true"
              :rows="pagination.limit"
              :totalRecords="pagination.total"
              :first="(pagination.page - 1) * pagination.limit"
              :lazy="true"
              responsiveLayout="scroll"
              :loading="loading"
              v-model:selection="selectedPromoters"
              :selectAll="selectAll"
              @select-all-change="onSelectAllChange"
              @row-select="onRowSelect"
              @row-unselect="onRowUnselect"
              @page="onPageChange"
              @sort="onSort"
          >
            <template #header>
              <div class="table-header">
                <h3>Promoters Directory</h3>
                <div class="table-actions">
                  <Button
                      v-if="selectedPromoters.length > 0"
                      @click="bulkAction"
                      icon="pi pi-cog"
                      :label="`Actions (${selectedPromoters.length})`"
                      class="p-button-outlined"
                      :disabled="loading"
                      v-tooltip.top="`Bulk actions for ${selectedPromoters.length} selected promoters`"
                  />
                  <Button
                      @click="exportData"
                      icon="pi pi-download"
                      label="Export"
                      class="p-button-outlined"
                      :disabled="loading || !promoters?.length"
                      v-tooltip.top="promoters?.length ? `Export ${promoters.length} promoters` : 'No promoters to export'"
                  />
                </div>
              </div>
            </template>

            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="id" header="ID" sortable></Column>
            
            <Column field="name" header="Promoter" sortable>
              <template #body="{ data }">
                <div class="promoter-cell">
                  <Avatar
                      :label="(data.firstName || data.name || '?').charAt(0)"
                      size="normal"
                      shape="circle"
                      :style="{ backgroundColor: getPromoterColor(data.id), color: 'white' }"
                  />
                  <div class="promoter-info">
                    <span class="promoter-name">{{ data.firstName }} {{ data.lastName }}</span>
                    <span class="promoter-email">{{ data.email }}</span>
                  </div>
                </div>
              </template>
            </Column>

            <Column field="phone" header="Phone" sortable>
              <template #body="{ data }">
                <span class="phone">{{ data.phone || 'N/A' }}</span>
              </template>
            </Column>

            <Column field="experience" header="Experience" sortable>
              <template #body="{ data }">
                <span class="experience">{{ data.experienceYears || 0 }} years</span>
              </template>
            </Column>

            <Column field="isActive" header="Status" sortable>
              <template #body="{ data }">
                <Tag
                    :value="data.isActive ? 'Active' : 'Inactive'"
                    :severity="data.isActive ? 'success' : 'secondary'"
                />
              </template>
            </Column>

            <Column field="lastActivity" header="Last Activity" sortable>
              <template #body="{ data }">
                <span class="last-activity">{{ formatRelativeTime(data.lastActivity) }}</span>
              </template>
            </Column>

            <Column field="dateCreated" header="Joined" sortable>
              <template #body="{ data }">
                <span class="joined-date">{{ formatDate(data.dateCreated) }}</span>
              </template>
            </Column>

            <Column header="Actions" :exportable="false">
              <template #body="{ data }">
                <EntityActionButtons
                  :entity="data"
                  :actions="promoterTableActions"
                  :permissions="promoterPermissions"
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
        <span v-if="promoterToDelete">
          Are you sure you want to delete promoter <strong>{{ promoterToDelete.firstName }} {{ promoterToDelete.lastName }}</strong>?
          This action cannot be undone and will remove them from all assignments.
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
import { useLoading } from '@/composables/useLoading'
import { promoterService } from '@/services/api'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatsGrid from '@/components/ui/StatsGrid.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import EntityActionButtons from '@/components/ui/EntityActionButtons.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const router = useRouter()
const toast = useToast()
const { withLoading, isLoading } = useLoading()

// State
const refreshing = ref(false)
const deleting = ref(false)
const searchQuery = ref('')
const selectedPromoters = ref([])
const selectAll = ref(false)
const deleteDialogVisible = ref(false)
const promoterToDelete = ref(null)

// Mock data - to be replaced with actual store/API calls
const promoters = ref([])
const pagination = ref({
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0
})
const error = ref(null)

// Computed
const loading = computed(() => isLoading('fetch-promoters'))
const hasError = computed(() => !!error.value)

// Filter configuration
const filterValues = ref({
  experience: null,
  location: null,
  active: null
})

const filterConfig = [
  {
    key: 'experience',
    type: 'dropdown',
    placeholder: 'All Experience',
    options: [
      { label: 'New (0-1 years)', value: '0-1' },
      { label: 'Experienced (2-5 years)', value: '2-5' },
      { label: 'Senior (5+ years)', value: '5+' }
    ]
  },
  {
    key: 'location',
    type: 'dropdown',
    placeholder: 'All Locations',
    options: [
      { label: 'Harare', value: 'Harare' },
      { label: 'Bulawayo', value: 'Bulawayo' },
      { label: 'Mutare', value: 'Mutare' },
      { label: 'Gweru', value: 'Gweru' }
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
    tooltip: 'Refresh promoter list',
    handler: refreshPromoters
  },
  {
    key: 'create',
    icon: 'pi pi-plus',
    label: 'Add Promoter',
    class: 'p-button-success',
    handler: () => router.push('/promoters/create')
  }
])

// Stats data configuration
const statsData = computed(() => [
  {
    key: 'total',
    title: 'Total Promoters',
    value: promoters.value?.length || 0,
    icon: 'pi pi-users',
    color: 'blue',
    trend: null
  },
  {
    key: 'active',
    title: 'Active Promoters',
    value: promoters.value?.filter(p => p.isActive)?.length || 0,
    icon: 'pi pi-check-circle',
    color: 'green',
    trend: null
  },
  {
    key: 'assigned',
    title: 'Currently Assigned',
    value: 0, // TODO: Calculate from assignments
    icon: 'pi pi-calendar',
    color: 'orange',
    trend: null
  },
  {
    key: 'available',
    title: 'Available',
    value: promoters.value?.filter(p => p.isActive)?.length || 0,
    icon: 'pi pi-check',
    color: 'purple',
    trend: null
  }
])

// Table actions configuration
const tableActions = [
  {
    key: 'view',
    icon: 'pi pi-eye',
    tooltip: 'View Details',
    handler: (entity) => viewPromoter(entity.id)
  },
  {
    key: 'edit',
    icon: 'pi pi-pencil',
    tooltip: 'Edit Promoter',
    handler: (entity) => editPromoter(entity.id)
  },
  {
    key: 'assign',
    icon: 'pi pi-calendar-plus',
    tooltip: 'Assign to Activation',
    handler: (entity) => assignPromoter(entity.id)
  },
  {
    key: 'toggleStatus',
    icon: 'pi pi-power-off',
    tooltip: 'Toggle Status',
    handler: (entity) => togglePromoterStatus(entity)
  },
  {
    key: 'delete',
    icon: 'pi pi-trash',
    tooltip: 'Delete Promoter',
    severity: 'danger',
    handler: (entity) => deletePromoter(entity)
  }
]

// Convert table actions for EntityActionButtons component
const promoterTableActions = computed(() => tableActions.map(action => ({
  label: action.tooltip,
  icon: action.icon,
  action: action.key,
  variant: 'text',
  severity: action.severity,
  permission: action.permission,
  visible: action.visible
})))

// Promoter permissions for action visibility
const promoterPermissions = computed(() => ({
  canView: true,
  canEdit: true,
  canCreate: true,
  canDelete: true,
  canAssign: true
}))

// Empty state configurations
const emptyStateConfig = computed(() => {
  if (hasError.value) {
    return {
      type: 'error',
      title: 'Unable to Load Promoters',
      message: 'There was an error loading your promoter data. Please try refreshing the page.',
      actions: [
        {
          label: 'Retry',
          icon: 'pi pi-refresh',
          class: 'p-button-outlined',
          handler: () => loadPromoters()
        },
        {
          label: 'Go to Dashboard',
          icon: 'pi pi-home',
          class: 'p-button-text',
          handler: () => router.push('/dashboard')
        }
      ]
    }
  } else if (searchQuery.value || filterValues.value.experience || filterValues.value.location || filterValues.value.active !== null) {
    return {
      type: 'no-results',
      title: 'No Matching Promoters',
      message: 'No promoters found matching your current filters. Try adjusting your search criteria.',
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
      title: 'No Promoters Yet',
      message: 'Start by adding your first promoter to begin managing field teams and assignments.',
      actions: [
        {
          label: 'Add Your First Promoter',
          icon: 'pi pi-plus',
          class: 'p-button-success',
          handler: () => router.push('/promoters/create')
        }
      ]
    }
  }
})

// Utility functions
const getPromoterColor = (promoterId) => {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16']
  return colors[promoterId % colors.length]
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
const loadPromoters = async () => {
  try {
    await withLoading('fetch-promoters', async () => {
      const params = {
        page: pagination.value.page - 1,
        size: pagination.value.limit,
        search: searchQuery.value,
        ...filterValues.value
      }
      
      const response = await promoterService.getPromoters(params)
      promoters.value = response.data || []
      pagination.value = {
        total: response.meta?.total || 0,
        page: (response.meta?.page || 0) + 1,
        limit: response.meta?.size || 10,
        totalPages: response.meta?.totalPages || 0
      }
    })
    console.log('Promoters loaded successfully:', promoters.value?.length || 0, 'promoters')
    error.value = null
  } catch (err) {
    console.error('Failed to load promoters:', err)
    error.value = err.message || 'Failed to load promoter list'
    
    let errorMessage = 'Failed to load promoter list'
    if (err.status === 403) {
      errorMessage = 'Access denied. Please check your permissions.'
    } else if (err.status === 401) {
      errorMessage = 'Authentication required. Please log in again.'
    } else if (err.status === 404) {
      errorMessage = 'Promoter service not available.'
    } else if (err.message) {
      errorMessage = err.message
    }
    
    toast.add({
      severity: 'error',
      summary: 'Load Failed',
      detail: errorMessage,
      life: 5000
    })
  }
}

const refreshPromoters = async () => {
  refreshing.value = true
  try {
    await loadPromoters()
    toast.add({
      severity: 'success',
      summary: 'Promoters Refreshed',
      detail: 'Promoter list has been updated',
      life: 3000
    })
  } catch (error) {
    console.error('Failed to refresh promoters:', error)
    toast.add({
      severity: 'error',
      summary: 'Refresh Failed',
      detail: 'Failed to refresh promoter list',
      life: 5000
    })
  } finally {
    refreshing.value = false
  }
}

const viewPromoter = (promoterId) => {
  router.push(`/promoters/${promoterId}`)
}

const editPromoter = (promoterId) => {
  router.push(`/promoters/${promoterId}/edit`)
}

const assignPromoter = (promoterId) => {
  toast.add({
    severity: 'info',
    summary: 'Assignment',
    detail: 'Promoter assignment functionality will be implemented',
    life: 3000
  })
}

const togglePromoterStatus = async (promoter) => {
  try {
    if (promoter.isActive) {
      await promoterService.deactivatePromoter(promoter.id)
    } else {
      await promoterService.activatePromoter(promoter.id)
    }
    
    // Reload promoters to get updated data
    await loadPromoters()
    
    const newStatus = promoter.isActive ? 'Inactive' : 'Active'
    toast.add({
      severity: 'success',
      summary: 'Status Updated',
      detail: `Promoter status changed to ${newStatus}`,
      life: 3000
    })
  } catch (error) {
    console.error('Failed to update promoter status:', error)
    
    let errorMessage = 'Failed to update promoter status'
    if (error.status === 404) {
      errorMessage = 'Promoter not found'
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to update this promoter'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    toast.add({
      severity: 'error',
      summary: 'Update Failed',
      detail: errorMessage,
      life: 5000
    })
  }
}

const deletePromoter = (promoter) => {
  promoterToDelete.value = promoter
  deleteDialogVisible.value = true
}

const confirmDelete = async () => {
  deleting.value = true
  try {
    await promoterService.deletePromoter(promoterToDelete.value.id)
    
    // Reload promoters to get updated data
    await loadPromoters()
    
    toast.add({
      severity: 'success',
      summary: 'Promoter Deleted',
      detail: `${promoterToDelete.value.firstName} ${promoterToDelete.value.lastName} has been deleted successfully`,
      life: 4000
    })
  } catch (error) {
    console.error('Failed to delete promoter:', error)
    
    let errorMessage = 'Failed to delete promoter'
    if (error.status === 409) {
      errorMessage = 'Cannot delete promoter with active assignments. Please complete or reassign all tasks first.'
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to delete this promoter.'
    } else if (error.status === 404) {
      errorMessage = 'Promoter not found. It may have already been deleted.'
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
    promoterToDelete.value = null
    deleting.value = false
  }
}

// Handle table action events from EntityActionButtons
const handleTableAction = (event) => {
  const actionType = event.actionConfig?.action || event.action
  const promoter = event.entity
  
  console.log('Table action triggered:', { actionType, promoter })
  
  // Find the action configuration that matches
  const actionConfig = tableActions.find(a => a.key === actionType)
  
  if (actionConfig && actionConfig.handler) {
    actionConfig.handler(promoter)
  } else {
    console.warn('Unknown action or no handler found:', actionType)
  }
}

// Filter handlers
const handleSearch = async (searchTerm) => {
  searchQuery.value = searchTerm
  try {
    await loadPromoters()
  } catch (error) {
    console.error('Search failed:', error)
  }
}

const handleFilter = async (filters) => {
  Object.assign(filterValues.value, filters)
  try {
    await loadPromoters()
  } catch (error) {
    console.error('Filter failed:', error)
  }
}

const resetFilters = async () => {
  searchQuery.value = ''
  filterValues.value = {
    experience: null,
    location: null,
    active: null
  }
  try {
    await loadPromoters()
  } catch (error) {
    console.error('Reset filters failed:', error)
  }
}

// Selection handlers
const onSelectAllChange = (event) => {
  selectAll.value = event.checked
  if (event.checked) {
    selectedPromoters.value = [...promoters.value]
  } else {
    selectedPromoters.value = []
  }
}

const onRowSelect = (event) => {
  // Handle individual row selection
}

const onRowUnselect = (event) => {
  // Handle individual row deselection
}

const bulkAction = () => {
  const actions = [
    'Activate Selected',
    'Deactivate Selected', 
    'Export Selected',
    'Assign to Activation'
  ]
  
  toast.add({
    severity: 'info',
    summary: 'Bulk Actions Available',
    detail: `${selectedPromoters.value.length} promoters selected. Available actions: ${actions.join(', ')}`,
    life: 5000
  })
}

const exportData = () => {
  toast.add({
    severity: 'info',
    summary: 'Export Started',
    detail: 'Promoter data export has been initiated',
    life: 3000
  })
}

// Pagination and sorting handlers
const onPageChange = async (event) => {
  const newPage = Math.floor(event.first / event.rows) + 1
  pagination.value.page = newPage
  pagination.value.limit = event.rows
  try {
    await loadPromoters()
  } catch (error) {
    console.error('Pagination failed:', error)
  }
}

const onSort = async (event) => {
  const field = event.sortField
  const order = event.sortOrder === 1 ? 'asc' : 'desc'
  try {
    await loadPromoters()
  } catch (error) {
    console.error('Sorting failed:', error)
  }
}

// Lifecycle
onMounted(async () => {
  console.log('Promoters.vue mounted')
  
  // Load initial data
  console.log('Loading promoters...')
  await loadPromoters()
  console.log('Promoters loaded:', promoters.value)
  console.log('Pagination:', pagination.value)
})
</script>

<style scoped>
.promoters-page {
  padding: 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.promoters-table-card {
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

.promoter-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.promoter-info {
  display: flex;
  flex-direction: column;
}

.promoter-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.promoter-email {
  color: #6b7280;
  font-size: 0.75rem;
}

.phone,
.experience,
.last-activity,
.joined-date {
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
  .promoters-page {
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

  .promoter-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    min-width: 120px;
  }

  .promoter-name {
    font-size: 0.8rem;
  }

  .promoter-email {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .promoters-page {
    padding: 0.75rem;
  }

  .promoter-cell {
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
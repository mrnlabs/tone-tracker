<template>
  <DashboardLayout>
    <div class="warehouses-page">
      <!-- Page Header -->
      <PageHeader 
        title="Warehouse Management"
        description="Manage warehouses, inventory, and stock distribution across locations"
        :actions="headerActions"
        :loading="loading"
      />

      <!-- Stats Grid -->
      <StatsGrid :stats="statsData" :loading="loading" />

      <!-- Filters and Search -->
      <FilterBar
        v-model:search="searchQuery"
        v-model:filter-values="filterValues"
        search-placeholder="Search warehouses..."
        :filters="filterConfig"
        @search="handleSearch"
        @filter="handleFilter"
        @reset="resetFilters"
      />

      <!-- Warehouses Table -->
      <Card class="warehouses-table-card">
        <template #content>
          <DataTable
              :value="warehouses"
              dataKey="id"
              :paginator="true"
              :rows="pagination.limit"
              :totalRecords="pagination.total"
              :first="(pagination.page - 1) * pagination.limit"
              :lazy="true"
              responsiveLayout="scroll"
              :loading="loading"
              v-model:selection="selectedWarehouses"
              :selectAll="selectAll"
              @select-all-change="onSelectAllChange"
              @row-select="onRowSelect"
              @row-unselect="onRowUnselect"
              @page="onPageChange"
              @sort="onSort"
          >
            <template #header>
              <div class="table-header">
                <h3>Warehouses Directory</h3>
                <div class="table-actions">
                  <Button
                      v-if="selectedWarehouses.length > 0"
                      @click="bulkAction"
                      icon="pi pi-cog"
                      :label="`Actions (${selectedWarehouses.length})`"
                      class="p-button-outlined"
                      :disabled="loading"
                      v-tooltip.top="`Bulk actions for ${selectedWarehouses.length} selected warehouses`"
                  />
                  <Button
                      @click="exportData"
                      icon="pi pi-download"
                      label="Export"
                      class="p-button-outlined"
                      :disabled="loading || !warehouses?.length"
                      v-tooltip.top="warehouses?.length ? `Export ${warehouses.length} warehouses` : 'No warehouses to export'"
                  />
                </div>
              </div>
            </template>

            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="id" header="ID" sortable></Column>
            
            <Column field="name" header="Warehouse" sortable>
              <template #body="{ data }">
                <div class="warehouse-cell">
                  <div class="warehouse-icon">
                    <i class="pi pi-building"></i>
                  </div>
                  <div class="warehouse-info">
                    <span class="warehouse-name">{{ data.name }}</span>
                  </div>
                </div>
              </template>
            </Column>

            <Column field="streetAddress" header="Street Address" sortable>
              <template #body="{ data }">
                <span class="address">{{ data.streetAddress }}</span>
              </template>
            </Column>

            <Column field="city" header="City" sortable>
              <template #body="{ data }">
                <span class="city">{{ data.city || 'N/A' }}</span>
              </template>
            </Column>

            <Column field="warehouseManager" header="Manager" sortable>
              <template #body="{ data }">
                <span class="manager">
                  {{ data.warehouseManager ? `${data.warehouseManager.firstName} ${data.warehouseManager.lastName}` : 'Not assigned' }}
                </span>
              </template>
            </Column>

            <Column field="dateCreated" header="Created" sortable>
              <template #body="{ data }">
                <span class="date-created">{{ formatDate(data.dateCreated) }}</span>
              </template>
            </Column>

            <Column header="Actions" :exportable="false">
              <template #body="{ data }">
                <EntityActionButtons
                  :entity="data"
                  :actions="tableActions"
                  :permissions="warehousePermissions"
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
                @action="handleEmptyStateAction"
              />
            </template>
          </DataTable>
        </template>
      </Card>

      <!-- Recent Activity -->
      <Card class="recent-activity-card">
        <template #header>
          <div class="activity-header">
            <h3>Recent Activity</h3>
            <router-link to="/warehouses/stock" class="view-all-link">
              View All
            </router-link>
          </div>
        </template>
        <template #content>
          <div class="activity-list">
            <div
                v-for="activity in recentActivity"
                :key="activity.id"
                class="activity-item"
            >
              <div :class="['activity-icon', activity.type]">
                <i :class="activity.icon"></i>
              </div>
              <div class="activity-content">
                <p class="activity-text">{{ activity.text }}</p>
                <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import { useWarehouseStore } from '@/stores/warehouse'
import { useLoading } from '@/composables/useLoading'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatsGrid from '@/components/ui/StatsGrid.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import EntityActionButtons from '@/components/ui/EntityActionButtons.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const warehouseStore = useWarehouseStore()
const { withLoading } = useLoading()

// State
const refreshing = ref(false)
const searchQuery = ref('')
const selectedWarehouses = ref([])
const selectAll = ref(false)
const filterValues = ref({})
const recentActivity = ref([])

// Use warehouse store data
const warehouses = computed(() => warehouseStore.warehouses || [])
const pagination = computed(() => warehouseStore.pagination)
const loading = computed(() => warehouseStore.isLoading)
const warehouseStats = ref({
  total: 0,
  totalSKUs: 0,
  totalValue: 0,
  lowStockAlerts: 0
})

// Computed
const userRole = computed(() => authStore.user?.role)

const canManageWarehouses = computed(() => {
  return ['ADMIN', 'WAREHOUSE_MANAGER'].includes(userRole.value)
})

const warehousePermissions = computed(() => ({
  view: true,
  edit: canManageWarehouses.value,
  delete: ['ADMIN'].includes(userRole.value),
  manage: canManageWarehouses.value
}))

// Page Header Actions
const headerActions = computed(() => {
  const actions = [
    {
      label: 'Refresh',
      icon: 'pi pi-refresh',
      handler: handleRefresh,
      loading: refreshing.value,
      variant: 'outlined'
    }
  ]
  
  if (canManageWarehouses.value) {
    actions.unshift({
      label: 'New Warehouse',
      icon: 'pi pi-plus',
      handler: () => router.push('/warehouses/create'),
      variant: 'primary'
    })
  }
  
  return actions
})

// Stats Configuration
const statsData = computed(() => [
  {
    title: 'Total Warehouses',
    value: warehouseStats.value.total,
    icon: 'pi pi-building',
    color: 'blue',
    trend: null
  },
  {
    title: 'Total SKUs',
    value: warehouseStats.value.totalSKUs,
    icon: 'pi pi-box',
    color: 'purple',
    trend: null
  },
  {
    title: 'Inventory Value',
    value: warehouseStats.value.totalValue,
    icon: 'pi pi-dollar',
    color: 'green',
    format: 'currency',
    trend: null
  },
  {
    title: 'Low Stock Alerts',
    value: warehouseStats.value.lowStockAlerts,
    icon: 'pi pi-exclamation-triangle',
    color: 'red',
    trend: null
  }
])

// Filter Configuration
const filterConfig = computed(() => [
  {
    type: 'dropdown',
    key: 'city',
    label: 'City',
    placeholder: 'All Cities',
    options: [
      // These options would be populated from actual warehouse data
      { label: 'New York', value: 'New York' },
      { label: 'Los Angeles', value: 'Los Angeles' },
      { label: 'Chicago', value: 'Chicago' }
    ]
  }
])

// Table Actions
const tableActions = computed(() => [
  {
    label: 'View Details',
    icon: 'pi pi-eye',
    action: 'view',
    variant: 'text',
    permission: 'view'
  },
  {
    label: 'Edit',
    icon: 'pi pi-pencil',
    action: 'edit',
    variant: 'text',
    permission: 'edit'
  },
  {
    label: 'Delete',
    icon: 'pi pi-trash',
    action: 'delete',
    variant: 'text',
    severity: 'danger',
    permission: 'delete'
  }
])

// Empty State Configuration
const emptyStateConfig = computed(() => {
  const hasSearch = searchQuery.value && searchQuery.value.length > 0
  const hasFilters = filterValues.value && Object.keys(filterValues.value).length > 0
  const hasSearchOrFilters = hasSearch || hasFilters
  
  return {
    type: hasSearchOrFilters ? 'no-results' : 'empty',
    title: hasSearchOrFilters ? 'No warehouses found' : 'No warehouses yet',
    message: hasSearchOrFilters 
      ? 'Try adjusting your search criteria or filters.' 
      : 'Get started by creating your first warehouse.',
    actions: hasSearchOrFilters 
      ? [{ label: 'Clear Filters', action: 'clear-filters', icon: 'pi pi-filter-slash' }]
      : canManageWarehouses.value 
        ? [{ label: 'Create Warehouse', action: 'create', icon: 'pi pi-plus' }]
        : []
  }
})

// Methods
const loadWarehouseData = async () => {
  try {
    // Load warehouses from API
    await warehouseStore.fetchWarehouses()
    
    // Calculate warehouse stats from warehouse data
    warehouseStats.value = {
      total: warehouses.value.length,
      totalSKUs: warehouses.value.reduce((sum, w) => sum + (w.stocks?.length || 0), 0),
      totalValue: 0, // This would need to be calculated from stock values when available
      lowStockAlerts: 0 // This would need to be calculated from low stock alerts when available
    }

    // Load recent activity from API (this would be another API call)
    // For now, this can remain empty until we have the API endpoint
    recentActivity.value = []
  } catch (error) {
    console.error('Failed to load warehouse data:', error)
    
    let errorMessage = 'Failed to load warehouse data'
    
    // Provide more specific error messages
    if (error.response?.status === 403) {
      errorMessage = 'Access denied. Please check your permissions.'
    } else if (error.response?.status === 401) {
      errorMessage = 'Authentication required. Please log in again.'
    } else if (error.response?.status === 404) {
      errorMessage = 'Warehouse API endpoint not found.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 5000
    })
  }
}

const handleRefresh = async () => {
  refreshing.value = true
  try {
    await loadWarehouseData()
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Warehouse data refreshed',
      life: 3000
    })
  } catch (error) {
    console.error('Refresh failed:', error)
  } finally {
    refreshing.value = false
  }
}

const handleSearch = (searchTerm) => {
  searchQuery.value = searchTerm
  // Implement search logic
}

const handleFilter = (filters) => {
  filterValues.value = filters
  // Implement filter logic
}

const resetFilters = () => {
  filterValues.value = {}
  searchQuery.value = ''
}

const handleTableAction = async (event) => {
  // Handle the event object from EntityActionButtons
  const actionType = event.actionConfig?.action || event.action
  const warehouse = event.entity
  
  console.log('Table action triggered:', { actionType, warehouse })
  
  switch (actionType) {
    case 'view':
      viewWarehouse(warehouse.id)
      break
    case 'edit':
      editWarehouse(warehouse.id)
      break
    case 'delete':
      await deleteWarehouse(warehouse.id)
      break
    default:
      console.warn('Unknown action:', actionType)
  }
}

const editWarehouse = (warehouseId) => {
  router.push(`/warehouses/${warehouseId}/edit`)
}

const deleteWarehouse = async (warehouseId) => {
  const warehouse = warehouses.value.find(w => w.id === warehouseId)
  const warehouseName = warehouse?.name || `Warehouse ${warehouseId}`
  
  if (!confirm(`Are you sure you want to delete "${warehouseName}"? This action cannot be undone.`)) {
    return
  }
  
  try {
    await warehouseStore.deleteWarehouse(warehouseId)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Warehouse deleted successfully',
      life: 3000
    })
    
    // Refresh warehouse data
    await loadWarehouseData()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to delete warehouse',
      life: 3000
    })
  }
}

const bulkAction = () => {
  console.log('Bulk action for:', selectedWarehouses.value)
}

const exportData = () => {
  console.log('Export warehouse data')
}

const onSelectAllChange = (event) => {
  selectAll.value = event.checked
  if (event.checked) {
    selectedWarehouses.value = [...warehouses.value]
  } else {
    selectedWarehouses.value = []
  }
}

const onRowSelect = (event) => {
  selectedWarehouses.value.push(event.data)
}

const onRowUnselect = (event) => {
  const index = selectedWarehouses.value.findIndex(w => w.id === event.data.id)
  if (index > -1) {
    selectedWarehouses.value.splice(index, 1)
  }
}

const onPageChange = (event) => {
  warehouseStore.setPagination({ 
    page: Math.floor(event.first / event.rows) + 1,
    limit: event.rows
  })
  loadWarehouseData()
}

const onSort = (event) => {
  warehouseStore.setSorting(event.sortField, event.sortOrder === 1 ? 'asc' : 'desc')
  loadWarehouseData()
}

const handleEmptyStateAction = (action) => {
  switch (action) {
    case 'create':
      router.push('/warehouses/create')
      break
    case 'clear-filters':
      resetFilters()
      break
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
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

const viewWarehouse = (warehouseId) => {
  router.push(`/warehouses/${warehouseId}`)
}

const viewInventory = (warehouseId) => {
  router.push(`/warehouses/${warehouseId}/inventory`)
}

const viewDetails = (warehouseId) => {
  router.push(`/warehouses/${warehouseId}`)
}

onMounted(() => {
  loadWarehouseData()
})
</script>

<style scoped>
.warehouses-page {
  padding: 1.5rem;
}

.page-header {
  margin-bottom: 2rem;
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

.nav-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.nav-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
}

.nav-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.nav-card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.nav-icon.inventory { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.nav-icon.stock { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.nav-icon.reports { background: linear-gradient(135deg, #10b981, #059669); }

.nav-info h3 {
  margin: 0 0 0.5rem 0;
  color: #111827;
  font-size: 1.1rem;
}

.nav-info p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.4;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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
.stat-icon.skus { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.stat-icon.value { background: linear-gradient(135deg, #10b981, #059669); }
.stat-icon.alerts { background: linear-gradient(135deg, #ef4444, #dc2626); }

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

.warehouses-list-card {
  margin-bottom: 2rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.list-header h3 {
  margin: 0;
  color: #111827;
}

.warehouses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.warehouse-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.warehouse-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.warehouse-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.warehouse-info h4 {
  margin: 0;
  color: #111827;
  font-size: 1.1rem;
}

.warehouse-code {
  font-family: monospace;
  font-size: 0.8rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  margin-top: 0.25rem;
  display: inline-block;
}

.warehouse-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.detail-row i {
  color: #9ca3af;
  width: 16px;
}

.warehouse-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.metric-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.utilization-bar {
  width: 80px;
  height: 0.5rem;
}

.percentage {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  min-width: 35px;
}

.metric-amount {
  font-size: 0.875rem;
  font-weight: 600;
  color: #10b981;
}

.warehouse-actions {
  display: flex;
  gap: 0.5rem;
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

.recent-activity-card {
  margin-bottom: 2rem;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.activity-header h3 {
  margin: 0;
  color: #111827;
}

.view-all-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
}

.view-all-link:hover {
  text-decoration: underline;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.activity-icon.stock-in {
  background: #10b981;
}

.activity-icon.transfer {
  background: #3b82f6;
}

.activity-icon.alert {
  background: #ef4444;
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0 0 0.25rem 0;
  color: #111827;
  font-size: 0.9rem;
}

.activity-time {
  font-size: 0.8rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .warehouses-page {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .nav-cards {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .warehouses-grid {
    grid-template-columns: 1fr;
  }

  .list-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .warehouse-actions {
    flex-direction: column;
  }

  .activity-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .nav-card-content {
    flex-direction: column;
    text-align: center;
  }

  .stat-content {
    flex-direction: column;
    text-align: center;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .warehouse-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .warehouse-metrics {
    gap: 0.5rem;
  }

  .metric {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .metric-value {
    width: 100%;
  }

  .utilization-bar {
    flex: 1;
  }
}
</style>
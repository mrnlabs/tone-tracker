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

            <div class="filter-field">
              <Dropdown
                  v-model="selectedClient"
                  :options="clientOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="All Clients"
                  showClear
                  filter
                  @change="handleFilter"
              />
            </div>

            <div class="filter-field">
              <Calendar
                  v-model="selectedDateRange"
                  selectionMode="range"
                  placeholder="Date Range"
                  :showIcon="true"
                  @date-select="handleFilter"
              />
            </div>

            <Button
                @click="resetFilters"
                icon="pi pi-filter-slash"
                label="Reset"
                class="p-button-outlined"
            />
          </div>
        </template>
      </Card>

      <!-- Activations Table -->
      <Card class="activations-table-card">
        <template #content>
          <DataTable
              :value="filteredActivations"
              :loading="loading"
              responsiveLayout="scroll"
              :paginator="true"
              :rows="12"
              :rowsPerPageOptions="[12, 24, 50]"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} activations"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              dataKey="id"
              v-model:selection="selectedActivations"
              selectionMode="multiple"
              :metaKeySelection="false"
              sortField="startDate"
              :sortOrder="-1"
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
                      label="Bulk Actions"
                      class="p-button-outlined"
                      :disabled="loading"
                  />
                  <Button
                      @click="exportData"
                      icon="pi pi-download"
                      label="Export"
                      class="p-button-outlined"
                  />
                </div>
              </div>
            </template>

            <!-- Table View -->
            <template v-if="viewMode === 'table'">
              <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

              <Column field="name" header="Activation" sortable>
                <template #body="{ data }">
                  <div class="activation-cell">
                    <router-link
                        :to="`/activations/${data.id}`"
                        class="activation-link"
                    >
                      {{ data.name }}
                    </router-link>
                    <span class="activation-code">{{ data.code }}</span>
                  </div>
                </template>
              </Column>

              <Column field="client" header="Client" sortable>
                <template #body="{ data }">
                  <div class="client-cell">
                    <Avatar
                        :label="data.client.charAt(0)"
                        size="small"
                        shape="circle"
                        :style="{ backgroundColor: data.clientColor || '#3b82f6', color: 'white' }"
                    />
                    <span>{{ data.client }}</span>
                  </div>
                </template>
              </Column>

              <Column field="location" header="Location" sortable>
                <template #body="{ data }">
                  <div class="location-cell">
                    <i class="pi pi-map-marker"></i>
                    <span>{{ data.location }}</span>
                  </div>
                </template>
              </Column>

              <Column field="dateRange" header="Duration" sortable>
                <template #body="{ data }">
                  <div class="date-range-cell">
                    <div class="date-info">
                      <span class="start-date">{{ formatDate(data.startDate) }}</span>
                      <span class="date-separator">to</span>
                      <span class="end-date">{{ formatDate(data.endDate) }}</span>
                    </div>
                    <span class="duration">{{ calculateDuration(data.startDate, data.endDate) }} days</span>
                  </div>
                </template>
              </Column>

              <Column field="manager" header="Manager" sortable>
                <template #body="{ data }">
                  <div class="manager-cell">
                    <Avatar
                        :label="data.manager.name.split(' ').map(n => n.charAt(0)).join('')"
                        size="small"
                        shape="circle"
                    />
                    <span>{{ data.manager.name }}</span>
                  </div>
                </template>
              </Column>

              <Column field="promoters" header="Team" sortable>
                <template #body="{ data }">
                  <div class="team-cell">
                    <div class="promoter-avatars">
                      <Avatar
                          v-for="promoter in data.promoters.slice(0, 3)"
                          :key="promoter.id"
                          :label="promoter.name.charAt(0)"
                          size="small"
                          class="promoter-avatar"
                      />
                      <span v-if="data.promoters.length > 3" class="promoter-count">
                        +{{ data.promoters.length - 3 }}
                      </span>
                    </div>
                    <span class="team-size">{{ data.promoters.length }} members</span>
                  </div>
                </template>
              </Column>

              <Column field="budget" header="Budget" sortable>
                <template #body="{ data }">
                  <span class="budget-amount">${{ data.budget.toLocaleString() }}</span>
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

              <Column field="progress" header="Progress" sortable>
                <template #body="{ data }">
                  <div class="progress-cell">
                    <ProgressBar :value="data.progress" class="progress-bar" />
                    <span class="progress-text">{{ data.progress }}%</span>
                  </div>
                </template>
              </Column>

              <Column header="Actions" :exportable="false">
                <template #body="{ data }">
                  <div class="action-buttons">
                    <Button
                        @click="viewActivation(data.id)"
                        icon="pi pi-eye"
                        class="p-button-text p-button-rounded p-button-sm"
                        v-tooltip.top="'View Details'"
                    />
                    <Button
                        v-if="canEditActivation(data)"
                        @click="editActivation(data.id)"
                        icon="pi pi-pencil"
                        class="p-button-text p-button-rounded p-button-sm"
                        v-tooltip.top="'Edit'"
                    />
                    <Button
                        v-if="canDeleteActivation(data)"
                        @click="deleteActivation(data)"
                        icon="pi pi-trash"
                        class="p-button-text p-button-rounded p-button-sm p-button-danger"
                        v-tooltip.top="'Delete'"
                    />
                  </div>
                </template>
              </Column>
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
                    <p class="activation-code">{{ activation.code }}</p>

                    <div class="card-details">
                      <div class="detail-item">
                        <i class="pi pi-building"></i>
                        <span>{{ activation.client }}</span>
                      </div>
                      <div class="detail-item">
                        <i class="pi pi-map-marker"></i>
                        <span>{{ activation.location }}</span>
                      </div>
                      <div class="detail-item">
                        <i class="pi pi-calendar"></i>
                        <span>{{ formatDate(activation.startDate) }} - {{ formatDate(activation.endDate) }}</span>
                      </div>
                      <div class="detail-item">
                        <i class="pi pi-dollar"></i>
                        <span>${{ activation.budget.toLocaleString() }}</span>
                      </div>
                    </div>

                    <div class="card-progress">
                      <div class="progress-header">
                        <span>Progress</span>
                        <span>{{ activation.progress }}%</span>
                      </div>
                      <ProgressBar :value="activation.progress" />
                    </div>

                    <div class="card-team">
                      <span class="team-label">Team:</span>
                      <div class="team-avatars">
                        <Avatar
                            v-for="promoter in activation.promoters.slice(0, 4)"
                            :key="promoter.id"
                            :label="promoter.name.charAt(0)"
                            size="small"
                            class="team-avatar"
                        />
                        <span v-if="activation.promoters.length > 4" class="more-count">
                          +{{ activation.promoters.length - 4 }}
                        </span>
                      </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import DashboardLayout from '@/components/general/DashboardLayout.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

// State
const loading = ref(false)
const activations = ref([])
const selectedActivations = ref([])
const searchQuery = ref('')
const selectedStatus = ref(null)
const selectedClient = ref(null)
const selectedDateRange = ref(null)
const deleteDialogVisible = ref(false)
const activationToDelete = ref(null)
const viewMode = ref('table')

// Stats
const activationStats = ref({
  total: 0,
  activeToday: 0,
  upcoming: 0,
  totalBudget: 0
})

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

const canCreateActivation = computed(() => {
  return ['ADMIN', 'ACTIVATION_MANAGER'].includes(userRole.value)
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedStatus.value || selectedClient.value || selectedDateRange.value
})

const filteredActivations = computed(() => {
  let filtered = activations.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(activation =>
        activation.name.toLowerCase().includes(query) ||
        activation.code.toLowerCase().includes(query) ||
        activation.client.toLowerCase().includes(query) ||
        activation.location.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (selectedStatus.value) {
    filtered = filtered.filter(activation => activation.status === selectedStatus.value)
  }

  // Client filter
  if (selectedClient.value) {
    filtered = filtered.filter(activation => activation.client === selectedClient.value)
  }

  // Date range filter
  if (selectedDateRange.value && selectedDateRange.value.length === 2) {
    const [startRange, endRange] = selectedDateRange.value
    filtered = filtered.filter(activation => {
      const activationStart = new Date(activation.startDate)
      const activationEnd = new Date(activation.endDate)
      return (activationStart >= startRange && activationStart <= endRange) ||
          (activationEnd >= startRange && activationEnd <= endRange) ||
          (activationStart <= startRange && activationEnd >= endRange)
    })
  }

  // Role-based filtering
  if (userRole.value === 'CLIENT') {
    // Clients see only their activations
    const userEmail = authStore.user?.email
    filtered = filtered.filter(activation => activation.clientEmail === userEmail)
  } else if (userRole.value === 'PROMOTER') {
    // Promoters see only assigned activations
    const userId = authStore.user?.id
    filtered = filtered.filter(activation =>
        activation.promoters.some(promoter => promoter.id === userId)
    )
  }

  return filtered
})

// Methods
const loadActivations = async () => {
  loading.value = true
  try {
    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock data
    activations.value = [
      {
        id: 1,
        name: 'Summer Product Launch',
        code: 'SPL-2024-001',
        client: 'TechCorp Solutions',
        clientColor: '#3b82f6',
        clientEmail: 'john.smith@techcorp.com',
        location: 'Central Mall, New York',
        startDate: '2024-07-15',
        endDate: '2024-07-18',
        budget: 75000,
        status: 'Active',
        progress: 65,
        manager: { id: 1, name: 'Sarah Johnson' },
        promoters: [
          { id: 1, name: 'John Doe' },
          { id: 2, name: 'Jane Smith' },
          { id: 3, name: 'Mike Johnson' },
          { id: 4, name: 'Lisa Brown' }
        ]
      },
      {
        id: 2,
        name: 'Brand Awareness Campaign',
        code: 'BAC-2024-002',
        client: 'Fashion Forward Inc',
        clientColor: '#ec4899',
        clientEmail: 'sarah@fashionforward.com',
        location: 'Downtown Plaza, LA',
        startDate: '2024-07-20',
        endDate: '2024-07-22',
        budget: 45000,
        status: 'Planned',
        progress: 25,
        manager: { id: 2, name: 'Mike Chen' },
        promoters: [
          { id: 5, name: 'Emma Wilson' },
          { id: 6, name: 'David Lee' }
        ]
      },
      {
        id: 3,
        name: 'Holiday Promotion Event',
        code: 'HPE-2024-003',
        client: 'Global Foods Ltd',
        clientColor: '#f59e0b',
        clientEmail: 'mike.chen@globalfoods.com',
        location: 'Westfield Shopping Center',
        startDate: '2024-12-15',
        endDate: '2024-12-18',
        budget: 120000,
        status: 'Planned',
        progress: 10,
        manager: { id: 1, name: 'Sarah Johnson' },
        promoters: [
          { id: 1, name: 'John Doe' },
          { id: 2, name: 'Jane Smith' },
          { id: 7, name: 'Alex Turner' },
          { id: 8, name: 'Sophie Clark' },
          { id: 9, name: 'Ryan Miller' }
        ]
      }
    ]

    // Load client options
    clientOptions.value = [
      ...new Set(activations.value.map(a => a.client))
    ].map(client => ({ label: client, value: client }))

    // Calculate stats
    activationStats.value = {
      total: activations.value.length,
      activeToday: activations.value.filter(a => a.status === 'Active').length,
      upcoming: activations.value.filter(a => a.status === 'Planned').length,
      totalBudget: activations.value.reduce((sum, a) => sum + a.budget, 0)
    }

  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load activations',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // Search is reactive through computed property
}

const handleFilter = () => {
  // Filtering is reactive through computed property
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = null
  selectedClient.value = null
  selectedDateRange.value = null
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
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
    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 500))

    activations.value = activations.value.filter(a => a.id !== activationToDelete.value.id)

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `${activationToDelete.value.name} has been deleted`,
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete activation',
      life: 3000
    })
  } finally {
    deleteDialogVisible.value = false
    activationToDelete.value = null
  }
}

const bulkAction = () => {
  // Implement bulk actions
  toast.add({
    severity: 'info',
    summary: 'Bulk Actions',
    detail: 'Bulk action functionality will be implemented here',
    life: 3000
  })
}

const exportData = () => {
  // Mock export functionality
  toast.add({
    severity: 'info',
    summary: 'Export',
    detail: 'Activation data export started',
    life: 3000
  })
}

onMounted(() => {
  loadActivations()

  // Check for client filter from query params
  if (route.query.client) {
    selectedClient.value = route.query.client
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
<template>
  <DashboardLayout>
    <div class="clients-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1 class="page-title">Client Management</h1>
            <p class="page-description">
              Manage your brand activation clients and their contact information
            </p>
          </div>
          <div class="header-actions">
            <Button
                @click="$router.push('/clients/create')"
                icon="pi pi-plus"
                label="Add New Client"
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
                <i class="pi pi-building"></i>
              </div>
              <div class="stat-info">
                <h3>Total Clients</h3>
                <p class="stat-number">{{ clientStats.total }}</p>
              </div>
            </div>
          </template>
        </Card>

        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon active">
                <i class="pi pi-check-circle"></i>
              </div>
              <div class="stat-info">
                <h3>Active Clients</h3>
                <p class="stat-number">{{ clientStats.active }}</p>
              </div>
            </div>
          </template>
        </Card>

        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon activations">
                <i class="pi pi-calendar"></i>
              </div>
              <div class="stat-info">
                <h3>Active Activations</h3>
                <p class="stat-number">{{ clientStats.activeActivations }}</p>
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
                <h3>Total Revenue</h3>
                <p class="stat-number">${{ clientStats.totalRevenue.toLocaleString() }}</p>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Filters and Search -->
      <Card class="filters-card">
        <template #content>
          <div class="filters-row">
            <div class="search-field">
              <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText
                    v-model="searchQuery"
                    placeholder="Search clients..."
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
                  v-model="selectedIndustry"
                  :options="industryOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="All Industries"
                  showClear
                  @change="handleFilter"
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

      <!-- Clients Table -->
      <Card class="clients-table-card">
        <template #content>
          <DataTable
              :value="filteredClients"
              :loading="loading"
              responsiveLayout="scroll"
              :paginator="true"
              :rows="10"
              :rowsPerPageOptions="[10, 25, 50]"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} clients"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              dataKey="id"
              v-model:selection="selectedClients"
              selectionMode="multiple"
              :metaKeySelection="false"
          >
            <template #header>
              <div class="table-header">
                <h3>Client Directory</h3>
                <div class="table-actions">
                  <Button
                      v-if="selectedClients.length > 0"
                      @click="bulkDelete"
                      icon="pi pi-trash"
                      label="Delete Selected"
                      class="p-button-danger p-button-outlined"
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

            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

            <Column field="companyName" header="Company" sortable>
              <template #body="{ data }">
                <div class="company-cell">
                  <Avatar
                      :label="data.companyName.charAt(0)"
                      size="normal"
                      shape="circle"
                      :style="{ backgroundColor: data.brandColor || '#3b82f6', color: 'white' }"
                  />
                  <div class="company-info">
                    <span class="company-name">{{ data.companyName }}</span>
                    <span class="industry">{{ data.industry }}</span>
                  </div>
                </div>
              </template>
            </Column>

            <Column field="contactPerson" header="Primary Contact" sortable>
              <template #body="{ data }">
                <div class="contact-cell">
                  <span class="contact-name">{{ data.contactPerson.name }}</span>
                  <span class="contact-email">{{ data.contactPerson.email }}</span>
                  <span class="contact-phone">{{ data.contactPerson.phone }}</span>
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

            <Column field="activationsCount" header="Activations" sortable>
              <template #body="{ data }">
                <div class="activations-cell">
                  <Badge :value="data.activationsCount" severity="info" />
                  <span class="activation-text">{{ data.activationsCount === 1 ? 'activation' : 'activations' }}</span>
                </div>
              </template>
            </Column>

            <Column field="totalRevenue" header="Total Revenue" sortable>
              <template #body="{ data }">
                <span class="revenue-amount">${{ data.totalRevenue.toLocaleString() }}</span>
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

            <Column field="lastActivity" header="Last Activity" sortable>
              <template #body="{ data }">
                <span class="last-activity">{{ formatDate(data.lastActivity) }}</span>
              </template>
            </Column>

            <Column header="Actions" :exportable="false">
              <template #body="{ data }">
                <div class="action-buttons">
                  <Button
                      @click="viewClient(data.id)"
                      icon="pi pi-eye"
                      class="p-button-text p-button-rounded"
                      v-tooltip.top="'View Details'"
                  />
                  <Button
                      @click="editClient(data.id)"
                      icon="pi pi-pencil"
                      class="p-button-text p-button-rounded"
                      v-tooltip.top="'Edit Client'"
                  />
                  <Button
                      @click="createActivation(data.id)"
                      icon="pi pi-plus"
                      class="p-button-text p-button-rounded"
                      v-tooltip.top="'Create Activation'"
                  />
                  <Button
                      @click="deleteClient(data)"
                      icon="pi pi-trash"
                      class="p-button-text p-button-rounded p-button-danger"
                      v-tooltip.top="'Delete Client'"
                  />
                </div>
              </template>
            </Column>

            <template #empty>
              <div class="empty-state">
                <i class="pi pi-building empty-icon"></i>
                <h3>No clients found</h3>
                <p>Start by adding your first client to begin managing activations.</p>
                <Button
                    @click="$router.push('/clients/create')"
                    label="Add Your First Client"
                    icon="pi pi-plus"
                    class="p-button-outlined"
                />
              </div>
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
          Are you sure you want to delete <strong>{{ clientToDelete.companyName }}</strong>?
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
            autofocus
        />
      </template>
    </Dialog>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import DashboardLayout from '@/components/general/DashboardLayout.vue'

const router = useRouter()
const toast = useToast()

// State
const loading = ref(false)
const clients = ref([])
const selectedClients = ref([])
const searchQuery = ref('')
const selectedStatus = ref(null)
const selectedIndustry = ref(null)
const deleteDialogVisible = ref(false)
const clientToDelete = ref(null)

// Mock data
const clientStats = ref({
  total: 24,
  active: 18,
  activeActivations: 42,
  totalRevenue: 1250000
})

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

// Computed
const filteredClients = computed(() => {
  let filtered = clients.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(client =>
        client.companyName.toLowerCase().includes(query) ||
        client.contactPerson.name.toLowerCase().includes(query) ||
        client.contactPerson.email.toLowerCase().includes(query) ||
        client.industry.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (selectedStatus.value) {
    filtered = filtered.filter(client => client.status === selectedStatus.value)
  }

  // Industry filter
  if (selectedIndustry.value) {
    filtered = filtered.filter(client => client.industry === selectedIndustry.value)
  }

  return filtered
})

// Methods
const loadClients = async () => {
  loading.value = true
  try {
    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 1000))

    clients.value = [
      {
        id: 1,
        companyName: 'TechCorp Solutions',
        industry: 'Technology',
        contactPerson: {
          name: 'John Smith',
          email: 'john.smith@techcorp.com',
          phone: '+1 (555) 123-4567'
        },
        location: 'New York, NY',
        activationsCount: 8,
        totalRevenue: 450000,
        status: 'Active',
        lastActivity: '2024-07-05',
        brandColor: '#3b82f6'
      },
      {
        id: 2,
        companyName: 'Fashion Forward Inc',
        industry: 'Fashion & Beauty',
        contactPerson: {
          name: 'Sarah Johnson',
          email: 'sarah@fashionforward.com',
          phone: '+1 (555) 987-6543'
        },
        location: 'Los Angeles, CA',
        activationsCount: 12,
        totalRevenue: 680000,
        status: 'Active',
        lastActivity: '2024-07-06',
        brandColor: '#ec4899'
      },
      {
        id: 3,
        companyName: 'Global Foods Ltd',
        industry: 'Food & Beverage',
        contactPerson: {
          name: 'Mike Chen',
          email: 'mike.chen@globalfoods.com',
          phone: '+1 (555) 456-7890'
        },
        location: 'Chicago, IL',
        activationsCount: 5,
        totalRevenue: 120000,
        status: 'Inactive',
        lastActivity: '2024-06-15',
        brandColor: '#f59e0b'
      }
    ]
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load clients',
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
  selectedIndustry.value = null
}

const getStatusSeverity = (status) => {
  const severityMap = {
    'Active': 'success',
    'Inactive': 'danger',
    'Pending': 'warning'
  }
  return severityMap[status] || 'info'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
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

const confirmDelete = async () => {
  try {
    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 500))

    clients.value = clients.value.filter(c => c.id !== clientToDelete.value.id)

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `${clientToDelete.value.companyName} has been deleted`,
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete client',
      life: 3000
    })
  } finally {
    deleteDialogVisible.value = false
    clientToDelete.value = null
  }
}

const bulkDelete = async () => {
  try {
    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 500))

    const selectedIds = selectedClients.value.map(c => c.id)
    clients.value = clients.value.filter(c => !selectedIds.includes(c.id))

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `${selectedClients.value.length} clients have been deleted`,
      life: 3000
    })

    selectedClients.value = []
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete clients',
      life: 3000
    })
  }
}

const exportData = () => {
  // Mock export functionality
  toast.add({
    severity: 'info',
    summary: 'Export',
    detail: 'Client data export started',
    life: 3000
  })
}

onMounted(() => {
  loadClients()
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
  .clients-page {
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
    gap: 1rem;
  }

  .table-actions {
    justify-content: stretch;
  }
}
</style>
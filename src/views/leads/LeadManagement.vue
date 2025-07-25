<template>
  <DashboardLayout>
    <div class="lead-management">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Lead Management</h1>
          <p class="page-description">Manage and track customer leads across all activation campaigns</p>
        </div>
        <div class="header-actions">
          <BaseButton
            variant="secondary"
            icon="pi pi-refresh"
            :loading="loading"
            @click="refreshLeads"
          >
            Refresh
          </BaseButton>
          <BaseButton
            variant="secondary"
            icon="pi pi-download"
            @click="showExportDialog = true"
          >
            Export
          </BaseButton>
          <BaseButton
            variant="primary"
            icon="pi pi-plus"
            @click="showCaptureDialog = true"
          >
            Capture Lead
          </BaseButton>
        </div>
      </div>

      <!-- Filters -->
      <Card class="filters-card">
        <template #content>
          <div class="filters-container">
            <div class="filter-row">
              <div class="filter-item">
                <label>Search</label>
                <IconField iconPosition="left">
                  <InputIcon class="pi pi-search" />
                  <InputText
                    v-model="filters.search"
                    placeholder="Search by name, email, or phone"
                    @input="debounceSearch"
                  />
                </IconField>
              </div>
              
              <div class="filter-item">
                <label>Status</label>
                <MultiSelect
                  v-model="filters.statuses"
                  :options="statusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="All Statuses"
                  :maxSelectedLabels="2"
                  @change="applyFilters"
                />
              </div>
              
              <div class="filter-item">
                <label>Activation</label>
                <Dropdown
                  v-model="filters.activationId"
                  :options="activationOptions"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="All Activations"
                  :filter="true"
                  showClear
                  @change="applyFilters"
                />
              </div>
              
              <div class="filter-item">
                <label>Date Range</label>
                <Calendar
                  v-model="filters.dateRange"
                  selectionMode="range"
                  dateFormat="dd/mm/yy"
                  placeholder="Select date range"
                  showIcon
                  @date-select="applyFilters"
                />
              </div>
            </div>
            
            <div class="filter-actions">
              <BaseButton
                variant="secondary"
                size="small"
                @click="clearFilters"
              >
                Clear Filters
              </BaseButton>
              <BaseButton
                variant="primary"
                size="small"
                :loading="loading"
                @click="applyFilters"
              >
                Apply Filters
              </BaseButton>
            </div>
          </div>
        </template>
      </Card>

      <!-- Summary Cards -->
      <div class="summary-cards" v-if="summaryData">
        <Card class="summary-card">
          <template #content>
            <div class="summary-content">
              <div class="summary-icon total">
                <i class="pi pi-users"></i>
              </div>
              <div class="summary-details">
                <h3>Total Leads</h3>
                <p class="summary-value">{{ formatNumber(summaryData.totalLeads) }}</p>
                <small class="summary-period">{{ formatPeriod() }}</small>
              </div>
            </div>
          </template>
        </Card>

        <Card class="summary-card">
          <template #content>
            <div class="summary-content">
              <div class="summary-icon new">
                <i class="pi pi-plus-circle"></i>
              </div>
              <div class="summary-details">
                <h3>New Leads</h3>
                <p class="summary-value">{{ formatNumber(summaryData.newLeads) }}</p>
                <small class="summary-change positive">+{{ formatNumber(summaryData.newLeadsGrowth) }}%</small>
              </div>
            </div>
          </template>
        </Card>

        <Card class="summary-card">
          <template #content>
            <div class="summary-content">
              <div class="summary-icon qualified">
                <i class="pi pi-check-circle"></i>
              </div>
              <div class="summary-details">
                <h3>Qualified Leads</h3>
                <p class="summary-value">{{ formatNumber(summaryData.qualifiedLeads) }}</p>
                <small class="summary-change positive">{{ formatNumber(summaryData.qualificationRate) }}% rate</small>
              </div>
            </div>
          </template>
        </Card>

        <Card class="summary-card">
          <template #content>
            <div class="summary-content">
              <div class="summary-icon converted">
                <i class="pi pi-star"></i>
              </div>
              <div class="summary-details">
                <h3>Converted</h3>
                <p class="summary-value">{{ formatNumber(summaryData.convertedLeads) }}</p>
                <small class="summary-change positive">{{ formatNumber(summaryData.conversionRate) }}% rate</small>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Leads Table -->
      <Card class="table-card">
        <template #header>
          <div class="table-header">
            <h3>Lead Records</h3>
            <div class="table-stats">
              <span>{{ totalRecords }} total leads</span>
            </div>
          </div>
        </template>
        <template #content>
          <DataTable
            :value="leads"
            :loading="tableLoading"
            :paginator="true"
            :rows="20"
            :totalRecords="totalRecords"
            :lazy="true"
            @page="onPageChange"
            @sort="onSort"
            sortMode="multiple"
            removableSort
            :rowHover="true"
            class="leads-table"
          >
            <Column field="name" header="Name" sortable>
              <template #body="{ data }">
                <div class="name-cell">
                  <strong>{{ data.name }} {{ data.surname }}</strong>
                  <small>{{ data.email }}</small>
                </div>
              </template>
            </Column>
            
            <Column field="phone" header="Phone" sortable>
              <template #body="{ data }">
                {{ leadService.formatPhoneNumber(data.phone) }}
              </template>
            </Column>
            
            <Column field="customerGender" header="Gender" sortable>
              <template #body="{ data }">
                {{ leadService.getGenderLabel(data.customerGender) }}
              </template>
            </Column>
            
            <Column field="ageGroup" header="Age Group" sortable>
              <template #body="{ data }">
                {{ leadService.getAgeGroupLabel(data.ageGroup) }}
              </template>
            </Column>
            
            <Column field="customerType" header="Type" sortable>
              <template #body="{ data }">
                {{ leadService.getCustomerTypeLabel(data.customerType) }}
              </template>
            </Column>
            
            <Column field="optedIn" header="Marketing Opt-in" sortable>
              <template #body="{ data }">
                <Tag
                  :value="data.optedIn ? 'Yes' : 'No'"
                  :severity="data.optedIn ? 'success' : 'secondary'"
                />
              </template>
            </Column>
            
            <Column field="whatsAppOptedIn" header="WhatsApp Opt-in" sortable>
              <template #body="{ data }">
                <Tag
                  :value="data.whatsAppOptedIn ? 'Yes' : 'No'"
                  :severity="data.whatsAppOptedIn ? 'success' : 'secondary'"
                />
              </template>
            </Column>
            
            <Column field="repeatPurchaseIntent" header="Repeat Purchase" sortable>
              <template #body="{ data }">
                {{ leadService.getRepeatPurchaseLabel(data.repeatPurchaseIntent) }}
              </template>
            </Column>
            
            <Column field="dateCreated" header="Date Captured" sortable>
              <template #body="{ data }">
                {{ formatDate(data.dateCreated) }}
              </template>
            </Column>
            
            <Column header="Actions">
              <template #body="{ data }">
                <div class="action-buttons">
                  <BaseButton
                    variant="text"
                    size="small"
                    icon="pi pi-eye"
                    @click="viewLead(data)"
                    title="View Details"
                  />
                  <BaseButton
                    variant="text"
                    size="small"
                    icon="pi pi-pencil"
                    @click="editLead(data)"
                    title="Edit Lead"
                  />
                  <BaseButton
                    variant="text"
                    size="small"
                    icon="pi pi-trash"
                    severity="danger"
                    @click="confirmDeleteLead(data)"
                    title="Delete Lead"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <!-- Lead Capture Dialog -->
      <Dialog
        v-model:visible="showCaptureDialog"
        header="Capture New Lead"
        :modal="true"
        :style="{ width: '90vw', maxWidth: '900px' }"
        :maximizable="true"
      >
        <LeadCaptureForm
          @lead-captured="onLeadCaptured"
          @form-reset="onFormReset"
        />
      </Dialog>

      <!-- Lead Details Dialog -->
      <Dialog
        v-model:visible="showDetailsDialog"
        header="Lead Details"
        :modal="true"
        :style="{ width: '600px' }"
      >
        <div v-if="selectedLead" class="lead-details">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Full Name</label>
              <span>{{ selectedLead.name }} {{ selectedLead.surname }}</span>
            </div>
            
            <div class="detail-item">
              <label>Email</label>
              <span>{{ selectedLead.email }}</span>
            </div>
            
            <div class="detail-item">
              <label>Phone</label>
              <span>{{ leadService.formatPhoneNumber(selectedLead.phone) }}</span>
            </div>
            
            <div class="detail-item">
              <label>Gender</label>
              <span>{{ leadService.getGenderLabel(selectedLead.customerGender) }}</span>
            </div>
            
            <div class="detail-item">
              <label>Age Group</label>
              <span>{{ leadService.getAgeGroupLabel(selectedLead.ageGroup) }}</span>
            </div>
            
            <div class="detail-item">
              <label>Customer Type</label>
              <span>{{ leadService.getCustomerTypeLabel(selectedLead.customerType) }}</span>
            </div>
            
            <div class="detail-item" v-if="selectedLead.address">
              <label>Address</label>
              <span>{{ selectedLead.address }}</span>
            </div>
            
            <div class="detail-item">
              <label>Marketing Opt-in</label>
              <Tag
                :value="selectedLead.optedIn ? 'Yes' : 'No'"
                :severity="selectedLead.optedIn ? 'success' : 'secondary'"
              />
            </div>
            
            <div class="detail-item">
              <label>WhatsApp Opt-in</label>
              <Tag
                :value="selectedLead.whatsAppOptedIn ? 'Yes' : 'No'"
                :severity="selectedLead.whatsAppOptedIn ? 'success' : 'secondary'"
              />
            </div>
            
            <div class="detail-item">
              <label>Repeat Purchase Intent</label>
              <span>{{ leadService.getRepeatPurchaseLabel(selectedLead.repeatPurchaseIntent) }}</span>
            </div>
            
            <div class="detail-item">
              <label>Date Captured</label>
              <span>{{ formatDateTime(selectedLead.dateCreated) }}</span>
            </div>
            
            <div class="detail-item full-width" v-if="selectedLead.customerFeedback">
              <label>Customer Feedback</label>
              <span>{{ selectedLead.customerFeedback }}</span>
            </div>
          </div>
        </div>
      </Dialog>

      <!-- Export Dialog -->
      <Dialog
        v-model:visible="showExportDialog"
        header="Export Leads"
        :modal="true"
        :style="{ width: '450px' }"
      >
        <div class="export-options">
          <div class="form-group">
            <label>Export Format</label>
            <div class="format-options">
              <RadioButton
                v-model="exportFormat"
                inputId="format-xlsx"
                value="xlsx"
              />
              <label for="format-xlsx">Excel (.xlsx)</label>
              
              <RadioButton
                v-model="exportFormat"
                inputId="format-csv"
                value="csv"
              />
              <label for="format-csv">CSV (.csv)</label>
            </div>
          </div>
        </div>
        
        <template #footer>
          <BaseButton
            variant="secondary"
            @click="showExportDialog = false"
          >
            Cancel
          </BaseButton>
          <BaseButton
            variant="primary"
            :loading="exportLoading"
            @click="exportLeads"
          >
            Export
          </BaseButton>
        </template>
      </Dialog>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToaster } from '@/composables/useToaster'
import { useActivationStore } from '@/stores/activation'
import { useAuthStore } from '@/stores/auth'
import leadService from '@/services/leadService'
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from '@/utils/constants'
import { BaseButton } from '@/components'
import LeadCaptureForm from '@/components/leads/LeadCaptureForm.vue'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import InputIcon from 'primevue/inputicon'
import IconField from 'primevue/iconfield'
import MultiSelect from 'primevue/multiselect'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import RadioButton from 'primevue/radiobutton'

// Reactive data
const loading = ref(false)
const tableLoading = ref(false)
const exportLoading = ref(false)
const showCaptureDialog = ref(false)
const showDetailsDialog = ref(false)
const showExportDialog = ref(false)
const selectedLead = ref(null)

// Filters
const filters = ref({
  search: '',
  statuses: [],
  activationId: null,
  dateRange: null
})

// Data
const leads = ref([])
const totalRecords = ref(0)
const currentPage = ref(0)
const summaryData = ref(null)

// Export options
const exportFormat = ref('xlsx')

// Stores
const activationStore = useActivationStore()
const authStore = useAuthStore()
const toaster = useToaster()

// Computed properties
const statusOptions = computed(() => {
  return Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => ({
    value: LEAD_STATUSES[key],
    label
  }))
})

const activationOptions = computed(() => activationStore.activations)

// Methods
const loadLeads = async (page = 0) => {
  tableLoading.value = true
  try {
    const params = {
      ...buildFilterParams(),
      page,
      size: 20
    }
    
    let response
    // Use role-specific endpoints
    if (authStore.userRole === 'PROMOTER') {
      // For promoters, use the new my-activations endpoint
      response = await leadService.getMyActivationLeads(params)
    } else {
      // For other roles, use the standard endpoint
      response = await leadService.getLeads(params)
    }
    
    leads.value = response.content || response.data || []
    totalRecords.value = response.totalElements || response.total || 0
    currentPage.value = page
  } catch (error) {
    toaster.error('Failed to load leads')
    console.error('Error loading leads:', error)
  } finally {
    tableLoading.value = false
  }
}

const loadSummaryData = async () => {
  try {
    const params = buildFilterParams()
    const statistics = await leadService.getLeadStatistics(params)
    summaryData.value = statistics
  } catch (error) {
    console.error('Error loading summary data:', error)
  }
}

const buildFilterParams = () => {
  const params = {}
  
  if (filters.value.search) {
    params.searchTerm = filters.value.search
  }
  
  if (filters.value.statuses && filters.value.statuses.length > 0) {
    params.statuses = filters.value.statuses.join(',')
  }
  
  if (filters.value.activationId) {
    params.activationId = filters.value.activationId
  }
  
  if (filters.value.dateRange && filters.value.dateRange.length === 2) {
    const startDate = filters.value.dateRange[0]
    const endDate = filters.value.dateRange[1]
    
    if (startDate && endDate) {
      params.startDate = startDate.toISOString().split('T')[0]
      params.endDate = endDate.toISOString().split('T')[0]
    }
  }
  
  return params
}

const applyFilters = () => {
  loadLeads(0)
  loadSummaryData()
}

const clearFilters = () => {
  filters.value = {
    search: '',
    statuses: [],
    activationId: null,
    dateRange: null
  }
  applyFilters()
}

const refreshLeads = () => {
  loadLeads(currentPage.value)
  loadSummaryData()
}

let searchTimeout
const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadLeads(0)
  }, 500)
}

const onPageChange = (event) => {
  loadLeads(event.page)
}

const onSort = () => {
  loadLeads(0)
}

const viewLead = (lead) => {
  selectedLead.value = lead
  showDetailsDialog.value = true
}

const editLead = (lead) => {
  // TODO: Implement edit functionality
  toaster.info('Edit functionality coming soon')
}

const confirmDeleteLead = (lead) => {
  // TODO: Implement delete confirmation
  toaster.info('Delete functionality coming soon')
}

const onLeadCaptured = (lead) => {
  showCaptureDialog.value = false
  toaster.success('Lead captured successfully!')
  refreshLeads()
}

const onFormReset = () => {
  // Handle form reset if needed
}

const exportLeads = async () => {
  exportLoading.value = true
  try {
    const params = buildFilterParams()
    const blob = await leadService.exportLeads(params, exportFormat.value)
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `leads-export-${new Date().toISOString().split('T')[0]}.${exportFormat.value}`
    link.click()
    window.URL.revokeObjectURL(url)
    
    showExportDialog.value = false
    toaster.success('Leads exported successfully')
  } catch (error) {
    toaster.error('Failed to export leads')
    console.error('Error exporting leads:', error)
  } finally {
    exportLoading.value = false
  }
}

// Utility functions
const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num || 0)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString()
}

const formatPeriod = () => {
  if (!filters.value.dateRange || filters.value.dateRange.length !== 2) return 'All time'
  const start = formatDate(filters.value.dateRange[0])
  const end = formatDate(filters.value.dateRange[1])
  return `${start} - ${end}`
}

// Lifecycle
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      activationStore.fetchActivations(),
      loadLeads(),
      loadSummaryData()
    ])
  } catch (error) {
    toaster.error('Failed to load initial data')
    console.error('Error loading initial data:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.lead-management {
  padding: 1.5rem;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    
    .header-content {
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
    }
    
    .header-actions {
      display: flex;
      gap: 0.75rem;
    }
  }
  
  .filters-card {
    margin-bottom: 1.5rem;
    
    .filters-container {
      .filter-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
        
        .filter-item {
          label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #374151;
          }
        }
      }
      
      .filter-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
      }
    }
  }
  
  .summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
    
    .summary-card {
      .summary-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        
        .summary-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          
          &.total { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
          &.new { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; }
          &.qualified { background: linear-gradient(135deg, #fc466b 0%, #3f5efb 100%); color: white; }
          &.converted { background: linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%); color: white; }
        }
        
        .summary-details {
          flex: 1;
          
          h3 {
            font-size: 0.875rem;
            font-weight: 500;
            color: #6b7280;
            margin: 0 0 0.25rem 0;
          }
          
          .summary-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #111827;
            margin: 0 0 0.25rem 0;
          }
          
          .summary-change {
            font-size: 0.75rem;
            font-weight: 500;
            
            &.positive { color: #059669; }
            &.negative { color: #dc2626; }
          }
          
          .summary-period {
            font-size: 0.75rem;
            color: #9ca3af;
          }
        }
      }
    }
  }
  
  .table-card {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1rem 0 1rem;
      
      h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #111827;
        margin: 0;
      }
      
      .table-stats {
        color: #6b7280;
        font-size: 0.875rem;
      }
    }
    
    .leads-table {
      .name-cell {
        strong {
          display: block;
        }
        
        small {
          color: #6b7280;
        }
      }
      
      .action-buttons {
        display: flex;
        gap: 0.25rem;
      }
    }
  }
  
  .lead-details {
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      
      .detail-item {
        &.full-width {
          grid-column: 1 / -1;
        }
        
        label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.25rem;
        }
        
        span {
          color: #111827;
        }
      }
    }
  }
  
  .export-options {
    .form-group {
      margin-bottom: 1.5rem;
      
      label {
        display: block;
        margin-bottom: 0.75rem;
        font-weight: 500;
        color: #374151;
      }
      
      .format-options {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        
        label {
          margin-bottom: 0;
          margin-left: 0.5rem;
          font-weight: normal;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .lead-management {
    padding: 1rem;
    
    .page-header {
      flex-direction: column;
      gap: 1rem;
    }
    
    .lead-details .detail-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
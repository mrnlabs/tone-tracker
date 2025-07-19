<template>
  <DashboardLayout>
    <div class="stock-movement-report">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Stock Movement Report</h1>
          <p class="page-description">Comprehensive analysis of stock movements across all operations</p>
        </div>
        <div class="header-actions">
          <BaseButton
            variant="secondary"
            icon="pi pi-refresh"
            :loading="loading"
            @click="refreshReport"
          >
            Refresh
          </BaseButton>
          <BaseButton
            variant="primary"
            icon="pi pi-download"
            @click="showExportDialog = true"
          >
            Export
          </BaseButton>
        </div>
      </div>

      <!-- Filters -->
      <Card class="filters-card">
        <template #content>
          <div class="filters-container">
            <div class="filter-row">
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
              
              <div class="filter-item">
                <label>Movement Type</label>
                <MultiSelect
                  v-model="filters.movementTypes"
                  :options="movementTypeOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="All Types"
                  :maxSelectedLabels="2"
                  @change="applyFilters"
                />
              </div>
              
              <div class="filter-item">
                <label>Warehouse</label>
                <Dropdown
                  v-model="filters.warehouseId"
                  :options="warehouseOptions"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="All Warehouses"
                  showClear
                  @change="applyFilters"
                />
              </div>
              
              <div class="filter-item">
                <label>Product</label>
                <Dropdown
                  v-model="filters.productId"
                  :options="productOptions"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="All Products"
                  :filter="true"
                  showClear
                  @change="applyFilters"
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
                <i class="pi pi-chart-line"></i>
              </div>
              <div class="summary-details">
                <h3>Total Movements</h3>
                <p class="summary-value">{{ formatNumber(summaryData.totalMovements) }}</p>
                <small class="summary-period">{{ formatPeriod() }}</small>
              </div>
            </div>
          </template>
        </Card>

        <Card class="summary-card">
          <template #content>
            <div class="summary-content">
              <div class="summary-icon in">
                <i class="pi pi-arrow-down"></i>
              </div>
              <div class="summary-details">
                <h3>Stock In</h3>
                <p class="summary-value">{{ formatNumber(summaryData.totalIn) }}</p>
                <small class="summary-change positive">+{{ formatNumber(summaryData.inGrowth) }}%</small>
              </div>
            </div>
          </template>
        </Card>

        <Card class="summary-card">
          <template #content>
            <div class="summary-content">
              <div class="summary-icon out">
                <i class="pi pi-arrow-up"></i>
              </div>
              <div class="summary-details">
                <h3>Stock Out</h3>
                <p class="summary-value">{{ formatNumber(summaryData.totalOut) }}</p>
                <small class="summary-change" :class="summaryData.outGrowth >= 0 ? 'positive' : 'negative'">
                  {{ summaryData.outGrowth >= 0 ? '+' : '' }}{{ formatNumber(summaryData.outGrowth) }}%
                </small>
              </div>
            </div>
          </template>
        </Card>

        <Card class="summary-card">
          <template #content>
            <div class="summary-content">
              <div class="summary-icon sales">
                <i class="pi pi-shopping-cart"></i>
              </div>
              <div class="summary-details">
                <h3>Sales Volume</h3>
                <p class="summary-value">{{ formatNumber(summaryData.totalSales) }}</p>
                <small class="summary-change positive">+{{ formatNumber(summaryData.salesGrowth) }}%</small>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-row">
          <!-- Movement Trends Chart -->
          <Card class="chart-card">
            <template #header>
              <div class="chart-header">
                <h3>Movement Trends</h3>
                <Dropdown
                  v-model="trendsPeriod"
                  :options="periodOptions"
                  optionLabel="label"
                  optionValue="value"
                  @change="loadTrendsData"
                />
              </div>
            </template>
            <template #content>
              <Chart
                type="line"
                :data="trendsChartData"
                :options="trendsChartOptions"
                :height="300"
              />
            </template>
          </Card>

          <!-- Movement Types Distribution -->
          <Card class="chart-card">
            <template #header>
              <h3>Movement Types Distribution</h3>
            </template>
            <template #content>
              <Chart
                type="doughnut"
                :data="typesChartData"
                :options="typesChartOptions"
                :height="300"
              />
            </template>
          </Card>
        </div>

        <div class="chart-row">
          <!-- Top Products by Movement -->
          <Card class="chart-card">
            <template #header>
              <h3>Top Products by Movement Volume</h3>
            </template>
            <template #content>
              <Chart
                type="bar"
                :data="topProductsChartData"
                :options="topProductsChartOptions"
                :height="300"
              />
            </template>
          </Card>

          <!-- Warehouse Performance -->
          <Card class="chart-card">
            <template #header>
              <h3>Warehouse Performance</h3>
            </template>
            <template #content>
              <Chart
                type="bar"
                :data="warehouseChartData"
                :options="warehouseChartOptions"
                :height="300"
              />
            </template>
          </Card>
        </div>
      </div>

      <!-- Detailed Table -->
      <Card class="table-card">
        <template #header>
          <div class="table-header">
            <h3>Detailed Movement Records</h3>
            <div class="table-actions">
              <IconField iconPosition="left">
                <InputIcon class="pi pi-search" />
                <InputText
                  v-model="searchQuery"
                  placeholder="Search movements..."
                  @input="debounceSearch"
                />
              </IconField>
            </div>
          </div>
        </template>
        <template #content>
          <DataTable
            :value="movementRecords"
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
            class="movements-table"
          >
            <Column field="dateCreated" header="Date" sortable>
              <template #body="{ data }">
                {{ formatDate(data.dateCreated) }}
              </template>
            </Column>
            
            <Column field="movementType" header="Type" sortable>
              <template #body="{ data }">
                <Tag
                  :value="getMovementTypeLabel(data.movementType)"
                  :severity="getMovementTypeSeverity(data.movementType)"
                />
              </template>
            </Column>
            
            <Column field="productName" header="Product" sortable>
              <template #body="{ data }">
                <div class="product-cell">
                  <strong>{{ data.productName }}</strong>
                  <small>SKU: {{ data.sku }}</small>
                </div>
              </template>
            </Column>
            
            <Column field="warehouseName" header="Warehouse" sortable></Column>
            
            <Column field="quantity" header="Quantity" sortable>
              <template #body="{ data }">
                <span :class="{ 'quantity-negative': data.quantity < 0, 'quantity-positive': data.quantity > 0 }">
                  {{ data.quantity }}
                </span>
              </template>
            </Column>
            
            <Column field="openingStock" header="Opening Stock" sortable>
              <template #body="{ data }">
                <span class="stock-level">
                  {{ data.openingStock || '-' }}
                </span>
              </template>
            </Column>
            
            <Column field="closingStock" header="Closing Stock" sortable>
              <template #body="{ data }">
                <span class="stock-level">
                  {{ data.closingStock || '-' }}
                </span>
              </template>
            </Column>
            
            <Column field="reason" header="Reason" sortable>
              <template #body="{ data }">
                <span :title="data.reason">
                  {{ truncateText(data.reason, 30) }}
                </span>
              </template>
            </Column>
            
            <Column field="recordedBy" header="Recorded By" sortable>
              <template #body="{ data }">
                {{ data.recordedBy || data.recordedByName || '-' }}
              </template>
            </Column>
            
            <Column field="activationName" header="Campaign" sortable>
              <template #body="{ data }">
                <span v-if="data.activationName" class="activation-tag">
                  {{ truncateText(data.activationName, 20) }}
                </span>
                <span v-else class="no-activation">-</span>
              </template>
            </Column>
            
            <Column header="Actions">
              <template #body="{ data }">
                <BaseButton
                  variant="text"
                  size="small"
                  icon="pi pi-eye"
                  @click="viewMovementDetails(data)"
                />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <!-- Export Dialog -->
      <Dialog
        v-model:visible="showExportDialog"
        header="Export Stock Movement Report"
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
          
          <div class="form-group">
            <label>Include</label>
            <div class="include-options">
              <Checkbox
                v-model="exportOptions.includeSummary"
                inputId="include-summary"
                :binary="true"
              />
              <label for="include-summary">Summary Statistics</label>
              
              <Checkbox
                v-model="exportOptions.includeCharts"
                inputId="include-charts"
                :binary="true"
              />
              <label for="include-charts">Charts</label>
              
              <Checkbox
                v-model="exportOptions.includeDetails"
                inputId="include-details"
                :binary="true"
              />
              <label for="include-details">Detailed Records</label>
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
            @click="exportReport"
          >
            Export
          </BaseButton>
        </template>
      </Dialog>

      <!-- Movement Details Dialog -->
      <Dialog
        v-model:visible="showDetailsDialog"
        header="Movement Details"
        :modal="true"
        :style="{ width: '600px' }"
      >
        <div v-if="selectedMovement" class="movement-details">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Movement Type</label>
              <Tag
                :value="getMovementTypeLabel(selectedMovement.movementType)"
                :severity="getMovementTypeSeverity(selectedMovement.movementType)"
              />
            </div>
            
            <div class="detail-item">
              <label>Date & Time</label>
              <span>{{ formatDateTime(selectedMovement.dateCreated) }}</span>
            </div>
            
            <div class="detail-item">
              <label>Product</label>
              <div>
                <strong>{{ selectedMovement.productName }}</strong>
                <br>
                <small>SKU: {{ selectedMovement.sku }}</small>
              </div>
            </div>
            
            <div class="detail-item">
              <label>Warehouse</label>
              <span>{{ selectedMovement.warehouseName }}</span>
            </div>
            
            <div class="detail-item">
              <label>Quantity</label>
              <span :class="{ 'quantity-negative': selectedMovement.quantity < 0, 'quantity-positive': selectedMovement.quantity > 0 }">
                {{ selectedMovement.quantity }}
              </span>
            </div>
            
            <div class="detail-item">
              <label>Opening Stock</label>
              <span>{{ selectedMovement.openingStock || 'N/A' }}</span>
            </div>
            
            <div class="detail-item">
              <label>Closing Stock</label>
              <span>{{ selectedMovement.closingStock || 'N/A' }}</span>
            </div>
            
            <div class="detail-item">
              <label>Reason</label>
              <span>{{ selectedMovement.reason || 'N/A' }}</span>
            </div>
            
            <div class="detail-item" v-if="selectedMovement.notes">
              <label>Notes</label>
              <span>{{ selectedMovement.notes }}</span>
            </div>
            
            <div class="detail-item">
              <label>Recorded By</label>
              <span>{{ selectedMovement.recordedBy || selectedMovement.recordedByName || 'System' }}</span>
            </div>
            
            <div class="detail-item" v-if="selectedMovement.activationName">
              <label>Activation Campaign</label>
              <span>{{ selectedMovement.activationName }}</span>
            </div>
            
            <div class="detail-item" v-if="selectedMovement.stockProductName">
              <label>Product Details</label>
              <div>
                <strong>{{ selectedMovement.stockProductName }}</strong>
                <br>
                <small v-if="selectedMovement.stockSku">SKU: {{ selectedMovement.stockSku }}</small>
              </div>
            </div>
            
            <div class="detail-item" v-if="selectedMovement.id">
              <label>Movement ID</label>
              <span>#{{ selectedMovement.id }}</span>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useToaster } from '@/composables/useToaster'
import { useAuthStore } from '@/stores/auth'
import { useWarehouseStore } from '@/stores/warehouse'
import stockMovementReportService from '@/services/stockMovementReportService'
import { STOCK_MOVEMENT_TYPE, STOCK_MOVEMENT_TYPE_LABELS } from '@/utils/constants'
import { BaseButton } from '@/components'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import Card from 'primevue/card'
import Calendar from 'primevue/calendar'
import MultiSelect from 'primevue/multiselect'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import InputIcon from 'primevue/inputicon'
import IconField from 'primevue/iconfield'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import RadioButton from 'primevue/radiobutton'
import Checkbox from 'primevue/checkbox'
import Chart from 'primevue/chart'

// Reactive data
const loading = ref(false)
const tableLoading = ref(false)
const exportLoading = ref(false)
const showExportDialog = ref(false)
const showDetailsDialog = ref(false)
const selectedMovement = ref(null)
const searchQuery = ref('')

// Filters
const filters = ref({
  dateRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
  movementTypes: [],
  warehouseId: null,
  productId: null
})

// Chart data
const summaryData = ref(null)
const trendsChartData = ref({})
const typesChartData = ref({})
const topProductsChartData = ref({})
const warehouseChartData = ref({})
const trendsPeriod = ref('daily')

// Table data
const movementRecords = ref([])
const totalRecords = ref(0)
const currentPage = ref(0)

// Export options
const exportFormat = ref('xlsx')
const exportOptions = ref({
  includeSummary: true,
  includeCharts: true,
  includeDetails: true
})

// Stores
const authStore = useAuthStore()
const warehouseStore = useWarehouseStore()
const toaster = useToaster()

// Computed properties
const movementTypeOptions = computed(() => {
  return Object.entries(STOCK_MOVEMENT_TYPE_LABELS).map(([key, label]) => ({
    value: STOCK_MOVEMENT_TYPE[key],
    label
  }))
})

const warehouseOptions = computed(() => warehouseStore.warehouses)
const productOptions = ref([])

const periodOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' }
]

// Chart options
const trendsChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

const typesChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
    },
  }
}

const topProductsChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      beginAtZero: true
    }
  }
}

const warehouseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

// Methods
const loadReportData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadSummaryData(),
      loadTrendsData(),
      loadTypesData(),
      loadTopProductsData(),
      loadWarehouseData(),
      loadMovementRecords()
    ])
  } catch (error) {
    toaster.error('Failed to load report data')
    console.error('Error loading report data:', error)
  } finally {
    loading.value = false
  }
}

const loadSummaryData = async () => {
  const params = buildFilterParams()
  const summary = await stockMovementReportService.getMovementSummary(params)
  summaryData.value = summary
}

const loadTrendsData = async () => {
  const params = { ...buildFilterParams(), period: trendsPeriod.value }
  const trends = await stockMovementReportService.getMovementTrends(params)
  
  trendsChartData.value = {
    labels: trends.labels,
    datasets: [
      {
        label: 'Stock In',
        data: trends.stockIn,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4
      },
      {
        label: 'Stock Out',
        data: trends.stockOut,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4
      },
      {
        label: 'Sales',
        data: trends.sales,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  }
}

const loadTypesData = async () => {
  const params = buildFilterParams()
  const typeData = await stockMovementReportService.getMovementsByType(params)
  
  typesChartData.value = {
    labels: typeData.types,
    datasets: [{
      data: typeData.counts,
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
        '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
      ]
    }]
  }
}

const loadTopProductsData = async () => {
  const params = buildFilterParams()
  const topProducts = await stockMovementReportService.getTopProductsByMovement(params)
  
  topProductsChartData.value = {
    labels: topProducts.products,
    datasets: [{
      label: 'Movement Volume',
      data: topProducts.volumes,
      backgroundColor: 'rgba(59, 130, 246, 0.8)'
    }]
  }
}

const loadWarehouseData = async () => {
  const params = buildFilterParams()
  const warehouseData = await stockMovementReportService.getMovementsByWarehouse(params)
  
  warehouseChartData.value = {
    labels: warehouseData.warehouses,
    datasets: [
      {
        label: 'Inbound',
        data: warehouseData.inbound,
        backgroundColor: 'rgba(34, 197, 94, 0.8)'
      },
      {
        label: 'Outbound',
        data: warehouseData.outbound,
        backgroundColor: 'rgba(239, 68, 68, 0.8)'
      }
    ]
  }
}

const loadMovementRecords = async (page = 0) => {
  tableLoading.value = true
  try {
    const params = {
      ...buildFilterParams(),
      page,
      size: 20,
      search: searchQuery.value
    }
    
    const response = await stockMovementReportService.getStockMovementReport(params)
    movementRecords.value = response.content
    totalRecords.value = response.totalElements
    currentPage.value = page
  } catch (error) {
    toaster.error('Failed to load movement records')
    console.error('Error loading movement records:', error)
  } finally {
    tableLoading.value = false
  }
}

const buildFilterParams = () => {
  const params = {}
  
  if (filters.value.dateRange && filters.value.dateRange.length === 2) {
    // Check if dates are valid Date objects before calling toISOString
    const startDate = filters.value.dateRange[0]
    const endDate = filters.value.dateRange[1]
    
    if (startDate && endDate && 
        startDate instanceof Date && endDate instanceof Date &&
        !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      params.startDate = startDate.toISOString().split('T')[0]
      params.endDate = endDate.toISOString().split('T')[0]
    }
  }
  
  if (filters.value.movementTypes && filters.value.movementTypes.length > 0) {
    params.movementTypes = filters.value.movementTypes.join(',')
  }
  
  if (filters.value.warehouseId) {
    params.warehouseId = filters.value.warehouseId
  }
  
  if (filters.value.productId) {
    params.productId = filters.value.productId
  }
  
  return params
}

const applyFilters = () => {
  loadReportData()
}

const clearFilters = () => {
  filters.value = {
    dateRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
    movementTypes: [],
    warehouseId: null,
    productId: null
  }
  searchQuery.value = ''
  loadReportData()
}

const refreshReport = () => {
  loadReportData()
}

const exportReport = async () => {
  exportLoading.value = true
  try {
    const params = {
      ...buildFilterParams(),
      ...exportOptions.value
    }
    
    const blob = await stockMovementReportService.exportMovementReport(params, exportFormat.value)
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `stock-movement-report-${new Date().toISOString().split('T')[0]}.${exportFormat.value}`
    link.click()
    window.URL.revokeObjectURL(url)
    
    showExportDialog.value = false
    toaster.success('Report exported successfully')
  } catch (error) {
    toaster.error('Failed to export report')
    console.error('Error exporting report:', error)
  } finally {
    exportLoading.value = false
  }
}

const viewMovementDetails = (movement) => {
  selectedMovement.value = movement
  showDetailsDialog.value = true
}

const onPageChange = (event) => {
  loadMovementRecords(event.page)
}

const onSort = () => {
  loadMovementRecords(0)
}

let searchTimeout
const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadMovementRecords(0)
  }, 500)
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
  if (!filters.value.dateRange || filters.value.dateRange.length !== 2) return ''
  const start = formatDate(filters.value.dateRange[0])
  const end = formatDate(filters.value.dateRange[1])
  return `${start} - ${end}`
}

const getMovementTypeLabel = (type) => {
  return STOCK_MOVEMENT_TYPE_LABELS[type] || type
}

const getMovementTypeSeverity = (type) => {
  const severityMap = {
    'SALE': 'success',
    'ADJUSTMENT': 'warning',
    'SAMPLE': 'info',
    'REPLENISHMENT': 'success',
    'ALLOCATION': 'secondary',
    'DISTRIBUTION': 'info',
    'RETURN': 'warning',
    'IN': 'success',
    'OUT': 'danger'
  }
  return severityMap[type] || 'secondary'
}

const truncateText = (text, maxLength) => {
  if (!text) return '-'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Lifecycle
onMounted(async () => {
  await warehouseStore.fetchWarehouses()
  await loadReportData()
})

watch(() => trendsPeriod.value, () => {
  loadTrendsData()
})
</script>

<style lang="scss" scoped>
.stock-movement-report {
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
          &.in { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; }
          &.out { background: linear-gradient(135deg, #fc466b 0%, #3f5efb 100%); color: white; }
          &.sales { background: linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%); color: white; }
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
  
  .charts-section {
    margin-bottom: 1.5rem;
    
    .chart-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
      
      .chart-card {
        .chart-header {
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
    }
    
    .movements-table {
      .product-cell {
        strong {
          display: block;
        }
        
        small {
          color: #6b7280;
        }
      }
      
      .quantity-positive {
        color: #059669;
        font-weight: 600;
      }
      
      .quantity-negative {
        color: #dc2626;
        font-weight: 600;
      }
      
      .stock-level {
        font-weight: 500;
        color: #4B5563;
      }
      
      .activation-tag {
        background: #EBF4FF;
        color: #1E3A8A;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
      }
      
      .no-activation {
        color: #9CA3AF;
        font-style: italic;
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
      
      .format-options,
      .include-options {
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
  
  .movement-details {
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      
      .detail-item {
        label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.25rem;
        }
        
        span {
          color: #111827;
        }
        
        .quantity-positive {
          color: #059669;
          font-weight: 600;
        }
        
        .quantity-negative {
          color: #dc2626;
          font-weight: 600;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .stock-movement-report {
    padding: 1rem;
    
    .page-header {
      flex-direction: column;
      gap: 1rem;
    }
    
    .charts-section .chart-row {
      grid-template-columns: 1fr;
    }
    
    .movement-details .detail-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
<template>
  <DashboardLayout>
    <div class="inventory-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-nav">
          <Button
              @click="$router.push('/warehouses')"
              icon="pi pi-arrow-left"
              class="p-button-text"
              label="Back to Warehouses"
          />
        </div>
        <div class="header-info">
          <h1 class="page-title">{{ warehouseData?.name || 'Warehouse' }} Inventory</h1>
          <p class="page-description">
            Monitor and manage stock levels for {{ warehouseData?.name || 'this warehouse' }}
          </p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon total-skus">
                <i class="pi pi-box"></i>
              </div>
              <div class="stat-info">
                <h3>Total SKUs</h3>
                <p class="stat-number">{{ inventoryStats.totalSKUs }}</p>
                <span class="stat-detail">in this warehouse</span>
              </div>
            </div>
          </template>
        </Card>

        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon total-units">
                <i class="pi pi-shopping-cart"></i>
              </div>
              <div class="stat-info">
                <h3>Total Units</h3>
                <p class="stat-number">{{ inventoryStats.totalUnits.toLocaleString() }}</p>
                <span class="stat-detail">in stock</span>
              </div>
            </div>
          </template>
        </Card>

        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon inventory-value">
                <i class="pi pi-dollar"></i>
              </div>
              <div class="stat-info">
                <h3>Inventory Value</h3>
                <p class="stat-number">${{ inventoryStats.totalValue.toLocaleString() }}</p>
                <span class="stat-detail">in this warehouse</span>
              </div>
            </div>
          </template>
        </Card>

        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon low-stock">
                <i class="pi pi-exclamation-triangle"></i>
              </div>
              <div class="stat-info">
                <h3>Low Stock Items</h3>
                <p class="stat-number">{{ inventoryStats.lowStockItems }}</p>
                <span class="stat-detail">require attention</span>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Quick Actions -->
      <Card class="quick-actions-card">
        <template #content>
          <div class="quick-actions">
            <Button
                @click="showStockAdjustment = true"
                icon="pi pi-pencil"
                label="Stock Adjustment"
                class="p-button-outlined"
            />
            <Button
                @click="showBulkUpdate = true"
                icon="pi pi-upload"
                label="Bulk Update"
                class="p-button-outlined"
            />
            <Button
                @click="generateInventoryReport"
                icon="pi pi-file-pdf"
                label="Generate Report"
                class="p-button-outlined"
            />
            <Button
                @click="showLowStockItems"
                icon="pi pi-exclamation-triangle"
                label="Low Stock Alert"
                class="p-button-warning"
            />
          </div>
        </template>
      </Card>

      <!-- Filters -->
      <Card class="filters-card">
        <template #content>
          <div class="filters-row">
            <div class="search-field">
              <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText
                    v-model="searchQuery"
                    placeholder="Search by SKU, name, or category..."
                    @input="handleSearch"
                />
              </span>
            </div>


            <div class="filter-field">
              <Dropdown
                  v-model="selectedCategory"
                  :options="categoryOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="All Categories"
                  showClear
                  @change="handleFilter"
              />
            </div>

            <div class="filter-field">
              <Dropdown
                  v-model="selectedStockStatus"
                  :options="stockStatusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Stock Status"
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

      <!-- Inventory Table -->
      <Card class="inventory-table-card">
        <template #content>
          <DataTable
              :value="filteredInventory"
              :loading="loading"
              responsiveLayout="scroll"
              :paginator="true"
              :rows="15"
              :rowsPerPageOptions="[15, 25, 50, 100]"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              dataKey="id"
              v-model:selection="selectedItems"
              selectionMode="multiple"
              :metaKeySelection="false"
              :sortField="'sku'"
              :sortOrder="1"
          >
            <template #header>
              <div class="table-header">
                <h3>Inventory Items</h3>
                <div class="table-actions">
                  <Button
                      v-if="selectedItems.length > 0"
                      @click="bulkStockAction"
                      icon="pi pi-cog"
                      label="Bulk Actions"
                      class="p-button-outlined"
                  />
                  <Button
                      @click="exportInventory"
                      icon="pi pi-download"
                      label="Export"
                      class="p-button-outlined"
                  />
                </div>
              </div>
            </template>

            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

            <Column field="sku" header="SKU" sortable>
              <template #body="{ data }">
                <div class="sku-cell">
                  <span class="sku-code">{{ data.sku }}</span>
                  <span class="product-name">{{ data.productName }}</span>
                </div>
              </template>
            </Column>

            <Column field="category" header="Category" sortable>
              <template #body="{ data }">
                <Tag :value="data.category" class="category-tag" />
              </template>
            </Column>

            <Column field="totalStock" header="Total Stock" sortable>
              <template #body="{ data }">
                <div class="stock-cell">
                  <span class="stock-number">{{ data.totalStock.toLocaleString() }}</span>
                  <span class="stock-unit">{{ data.unit }}</span>
                </div>
              </template>
            </Column>

            <Column field="availableStock" header="Available" sortable>
              <template #body="{ data }">
                <div class="stock-cell">
                  <span class="stock-number available">{{ data.availableStock.toLocaleString() }}</span>
                  <span class="stock-unit">{{ data.unit }}</span>
                </div>
              </template>
            </Column>

            <Column field="allocatedStock" header="Allocated" sortable>
              <template #body="{ data }">
                <div class="stock-cell">
                  <span class="stock-number allocated">{{ data.allocatedStock.toLocaleString() }}</span>
                  <span class="stock-unit">{{ data.unit }}</span>
                </div>
              </template>
            </Column>

            <Column field="minThreshold" header="Min Threshold" sortable>
              <template #body="{ data }">
                <span class="threshold">{{ data.minThreshold.toLocaleString() }}</span>
              </template>
            </Column>

            <Column field="stockStatus" header="Status" sortable>
              <template #body="{ data }">
                <Tag
                    :value="getStockStatusLabel(data)"
                    :severity="getStockStatusSeverity(data)"
                />
              </template>
            </Column>

            <Column field="unitCost" header="Unit Cost" sortable>
              <template #body="{ data }">
                <span class="unit-cost">${{ data.unitCost.toFixed(2) }}</span>
              </template>
            </Column>

            <Column field="totalValue" header="Total Value" sortable>
              <template #body="{ data }">
                <span class="total-value">${{ (data.totalStock * data.unitCost).toLocaleString() }}</span>
              </template>
            </Column>

            <Column field="lastMovement" header="Last Movement" sortable>
              <template #body="{ data }">
                <span class="last-movement">{{ formatDate(data.lastMovement) }}</span>
              </template>
            </Column>

            <Column header="Actions" :exportable="false">
              <template #body="{ data }">
                <div class="action-buttons">
                  <Button
                      @click="viewStockDetails(data)"
                      icon="pi pi-eye"
                      class="p-button-text p-button-sm"
                      v-tooltip.top="'View Details'"
                  />
                  <Button
                      @click="editStock(data)"
                      icon="pi pi-pencil"
                      class="p-button-text p-button-sm"
                      v-tooltip.top="'Edit Stock'"
                  />
                  <Button
                      @click="adjustStock(data)"
                      icon="pi pi-plus-circle"
                      class="p-button-text p-button-sm"
                      v-tooltip.top="'Adjust Stock'"
                  />
                  <Button
                      @click="viewMovementHistory(data)"
                      icon="pi pi-history"
                      class="p-button-text p-button-sm"
                      v-tooltip.top="'Movement History'"
                  />
                  <Button
                      @click="allocateStock(data)"
                      icon="pi pi-send"
                      class="p-button-text p-button-sm"
                      v-tooltip.top="'Allocate'"
                  />
                  <Button
                      @click="deleteStock(data)"
                      icon="pi pi-trash"
                      class="p-button-text p-button-sm p-button-danger"
                      v-tooltip.top="'Delete Stock'"
                  />
                </div>
              </template>
            </Column>

            <template #empty>
              <div class="empty-state">
                <i class="pi pi-box empty-icon"></i>
                <h3>No inventory items found</h3>
                <p>No items match your current search criteria.</p>
                <Button
                    @click="resetFilters"
                    label="Clear Filters"
                    icon="pi pi-filter-slash"
                    class="p-button-outlined"
                />
              </div>
            </template>
          </DataTable>
        </template>
      </Card>

      <!-- Warehouse Information Card -->
      <Card class="warehouse-info-card">
        <template #header>
          <h3>Warehouse Information</h3>
        </template>
        <template #content>
          <div v-if="warehouseData" class="warehouse-details">
            <div class="detail-grid">
              <div class="detail-item">
                <label>Warehouse Name:</label>
                <span>{{ warehouseData.name }}</span>
              </div>
              <div class="detail-item">
                <label>Location:</label>
                <span>{{ warehouseData.city || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <label>Address:</label>
                <span>{{ warehouseData.streetAddress || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <label>Manager:</label>
                <span>{{ warehouseData.warehouseManager ? `${warehouseData.warehouseManager.firstName} ${warehouseData.warehouseManager.lastName}` : 'Not assigned' }}</span>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Stock Adjustment Dialog -->
    <Dialog
        v-model:visible="showStockAdjustment"
        :style="{ width: '500px' }"
        header="Stock Adjustment"
        :modal="true"
    >
      <div class="adjustment-form">
        <div class="form-group">
          <label for="adjustmentSku">SKU</label>
          <Dropdown
              id="adjustmentSku"
              v-model="stockAdjustment.sku"
              :options="skuOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select SKU"
              filter
          />
        </div>

        <div class="form-group">
          <label for="adjustmentWarehouse">Warehouse</label>
          <InputText
              id="adjustmentWarehouse"
              :value="warehouseData?.name || 'Current Warehouse'"
              readonly
              class="readonly-field"
          />
        </div>

        <div class="form-group">
          <label for="adjustmentType">Adjustment Type</label>
          <Dropdown
              id="adjustmentType"
              v-model="stockAdjustment.type"
              :options="adjustmentTypeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select adjustment type"
          />
        </div>

        <div class="form-group">
          <label for="adjustmentQuantity">Quantity</label>
          <InputNumber
              id="adjustmentQuantity"
              v-model="stockAdjustment.quantity"
              :min="1"
              placeholder="Enter quantity"
          />
        </div>

        <div class="form-group">
          <label for="adjustmentReason">Reason</label>
          <Textarea
              id="adjustmentReason"
              v-model="stockAdjustment.reason"
              :rows="3"
              placeholder="Reason for adjustment..."
          />
        </div>
      </div>

      <template #footer>
        <Button
            label="Cancel"
            icon="pi pi-times"
            @click="closeStockAdjustment"
            class="p-button-text"
        />
        <Button
            label="Apply Adjustment"
            icon="pi pi-check"
            @click="applyStockAdjustment"
            :disabled="!isAdjustmentFormValid"
        />
      </template>
    </Dialog>

    <!-- Stock Details Dialog -->
    <Dialog
        v-model:visible="showStockDetails"
        :style="{ width: '800px' }"
        header="Stock Details"
        :modal="true"
    >
      <div v-if="selectedStock" class="stock-details">
        <div class="stock-header">
          <h3>{{ selectedStock.productName }}</h3>
          <span class="sku-badge">{{ selectedStock.sku }}</span>
        </div>

        <div class="details-grid">
          <div class="detail-section">
            <h4>Stock Information</h4>
            <div class="detail-item">
              <label>Total Stock:</label>
              <span>{{ selectedStock.totalStock?.toLocaleString() }} {{ selectedStock.unit }}</span>
            </div>
            <div class="detail-item">
              <label>Available:</label>
              <span>{{ selectedStock.availableStock?.toLocaleString() }} {{ selectedStock.unit }}</span>
            </div>
            <div class="detail-item">
              <label>Allocated:</label>
              <span>{{ selectedStock.allocatedStock?.toLocaleString() }} {{ selectedStock.unit }}</span>
            </div>
            <div class="detail-item">
              <label>Min Threshold:</label>
              <span>{{ selectedStock.minThreshold?.toLocaleString() }} {{ selectedStock.unit }}</span>
            </div>
          </div>

          <div class="detail-section">
            <h4>Financial Information</h4>
            <div class="detail-item">
              <label>Unit Cost:</label>
              <span>${{ selectedStock.unitCost?.toFixed(2) }}</span>
            </div>
            <div class="detail-item">
              <label>Total Value:</label>
              <span>${{ ((selectedStock.totalStock || 0) * (selectedStock.unitCost || 0)).toLocaleString() }}</span>
            </div>
            <div class="detail-item">
              <label>Category:</label>
              <span>{{ selectedStock.category }}</span>
            </div>
            <div class="detail-item">
              <label>Last Movement:</label>
              <span>{{ formatDate(selectedStock.lastMovement) }}</span>
            </div>
          </div>
        </div>

        <div class="warehouse-breakdown">
          <h4>Warehouse Breakdown</h4>
          <DataTable
              :value="selectedStock.warehouseBreakdown"
              responsiveLayout="scroll"
              size="small"
          >
            <Column field="warehouse" header="Warehouse"></Column>
            <Column field="available" header="Available">
              <template #body="{ data }">
                {{ data.available.toLocaleString() }}
              </template>
            </Column>
            <Column field="allocated" header="Allocated">
              <template #body="{ data }">
                {{ data.allocated.toLocaleString() }}
              </template>
            </Column>
            <Column field="total" header="Total">
              <template #body="{ data }">
                {{ data.total.toLocaleString() }}
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <template #footer>
        <Button
            label="Close"
            icon="pi pi-times"
            @click="showStockDetails = false"
            class="p-button-text"
        />
      </template>
    </Dialog>

    <!-- Edit Stock Dialog -->
    <Dialog
        v-model:visible="showEditStock"
        :style="{ width: '600px' }"
        header="Edit Stock Item"
        :modal="true"
    >
      <div class="edit-form">
        <div class="form-row">
          <div class="form-group">
            <label for="editSku">SKU</label>
            <InputText
                id="editSku"
                v-model="editStockForm.sku"
                placeholder="Enter SKU"
                :readonly="true"
                class="readonly-field"
            />
          </div>
          <div class="form-group">
            <label for="editProductName">Product Name</label>
            <InputText
                id="editProductName"
                v-model="editStockForm.productName"
                placeholder="Enter product name"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="editCategory">Category</label>
            <Dropdown
                id="editCategory"
                v-model="editStockForm.category"
                :options="categoryOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select category"
            />
          </div>
          <div class="form-group">
            <label for="editUnit">Unit</label>
            <InputText
                id="editUnit"
                v-model="editStockForm.unit"
                placeholder="Enter unit (e.g., pieces, kg)"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="editMinThreshold">Min Threshold</label>
            <InputNumber
                id="editMinThreshold"
                v-model="editStockForm.minThreshold"
                :min="0"
                placeholder="Minimum stock level"
            />
          </div>
          <div class="form-group">
            <label for="editUnitCost">Unit Cost</label>
            <InputNumber
                id="editUnitCost"
                v-model="editStockForm.unitCost"
                mode="currency"
                currency="USD"
                locale="en-US"
                :min="0"
                placeholder="Cost per unit"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <Button
            label="Cancel"
            icon="pi pi-times"
            @click="closeEditStock"
            class="p-button-text"
        />
        <Button
            label="Save Changes"
            icon="pi pi-check"
            @click="saveEditStock"
            :disabled="!isEditFormValid"
        />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog
        v-model:visible="showDeleteConfirm"
        :style="{ width: '450px' }"
        header="Confirm Delete"
        :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: #f56565; margin-right: 1rem;"></i>
        <div>
          <h3>Delete Stock Item</h3>
          <p>Are you sure you want to delete the stock item <strong>{{ selectedStock?.sku }}</strong>?</p>
          <p class="warning-text">This action cannot be undone and will remove all stock data for this item.</p>
        </div>
      </div>

      <template #footer>
        <Button
            label="Cancel"
            icon="pi pi-times"
            @click="showDeleteConfirm = false"
            class="p-button-text"
        />
        <Button
            label="Delete"
            icon="pi pi-trash"
            @click="confirmDeleteStock"
            class="p-button-danger"
        />
      </template>
    </Dialog>

    <!-- Movement History Dialog -->
    <Dialog
        v-model:visible="showMovementHistory"
        :style="{ width: '90vw', maxWidth: '1200px' }"
        header="Stock Movement History"
        :modal="true"
        :maximizable="true"
    >
      <div v-if="selectedStock" class="movement-history-content">
        <div class="history-header">
          <h4>{{ selectedStock.productName }}</h4>
          <span class="sku-badge">{{ selectedStock.sku }}</span>
        </div>
        
        <StockMovementList
          :stock-id="selectedStock.id"
          :show-summary="true"
          :show-activation-filter="true"
          :hide-activation-column="false"
          :can-export="true"
          :can-refresh="true"
        />
      </div>

      <template #footer>
        <BaseButton
            label="Close"
            icon="pi pi-times"
            @click="showMovementHistory = false"
            variant="secondary"
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
import { useWarehouseStore } from '@/stores/warehouse'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import { StockMovementList, BaseButton } from '@/components'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const warehouseStore = useWarehouseStore()

// Get warehouse ID from route
const warehouseId = computed(() => route.params.id)

// State
const loading = ref(false)
const inventory = ref([])
const selectedItems = ref([])
const warehouseData = ref(null)
const searchQuery = ref('')
const selectedCategory = ref(null)
const selectedStockStatus = ref(null)

// Dialogs
const showStockAdjustment = ref(false)
const showBulkUpdate = ref(false)
const showStockDetails = ref(false)
const showEditStock = ref(false)
const showDeleteConfirm = ref(false)
const showMovementHistory = ref(false)
const selectedStock = ref(null)

// Form data
const stockAdjustment = ref({
  sku: '',
  warehouseId: '',
  type: '',
  quantity: null,
  reason: ''
})

const editStockForm = ref({
  id: null,
  sku: '',
  productName: '',
  category: '',
  minThreshold: null,
  unitCost: null,
  unit: ''
})

// Stats
const inventoryStats = ref({
  totalSKUs: 0,
  totalUnits: 0,
  totalValue: 0,
  lowStockItems: 0,
  activeWarehouses: 0
})

// Options
const categoryOptions = ref([])
const skuOptions = ref([])

const stockStatusOptions = [
  { label: 'In Stock', value: 'in_stock' },
  { label: 'Low Stock', value: 'low_stock' },
  { label: 'Out of Stock', value: 'out_of_stock' },
  { label: 'Overstocked', value: 'overstocked' }
]

const adjustmentTypeOptions = [
  { label: 'Stock In', value: 'in' },
  { label: 'Stock Out', value: 'out' },
  { label: 'Adjustment', value: 'adjustment' },
  { label: 'Damage/Loss', value: 'loss' }
]

// Computed
const userRole = computed(() => authStore.user?.role)

const filteredInventory = computed(() => {
  let filtered = inventory.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
        item.sku.toLowerCase().includes(query) ||
        item.productName.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    )
  }

  // Warehouse filter is automatically applied since we're only loading data for this warehouse

  // Category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(item => item.category === selectedCategory.value)
  }

  // Stock status filter
  if (selectedStockStatus.value) {
    filtered = filtered.filter(item => {
      const status = getStockStatus(item)
      return status === selectedStockStatus.value
    })
  }

  return filtered
})

const isAdjustmentFormValid = computed(() => {
  return stockAdjustment.value.sku &&
      stockAdjustment.value.warehouseId &&
      stockAdjustment.value.type &&
      stockAdjustment.value.quantity &&
      stockAdjustment.value.reason
})

const isEditFormValid = computed(() => {
  return editStockForm.value.sku &&
      editStockForm.value.productName &&
      editStockForm.value.category &&
      editStockForm.value.minThreshold &&
      editStockForm.value.unitCost &&
      editStockForm.value.unit
})

// Methods
const loadInventoryData = async () => {
  loading.value = true
  try {
    // Load warehouse data first
    await loadWarehouseData()
    
    // Mock API call - replace with actual API for warehouse-specific inventory
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock inventory data for this specific warehouse
    inventory.value = [
      {
        id: 1,
        sku: 'SKU-001',
        productName: 'Premium Shampoo 500ml',
        category: 'Hair Care',
        totalStock: 1500,
        availableStock: 1200,
        allocatedStock: 300,
        minThreshold: 200,
        unitCost: 12.50,
        unit: 'units',
        lastMovement: '2024-07-05',
        warehouseBreakdown: [
          { warehouse: 'Main Distribution Center', available: 500, allocated: 150, total: 650 },
          { warehouse: 'West Coast Depot', available: 400, allocated: 100, total: 500 },
          { warehouse: 'Central Hub', available: 300, allocated: 50, total: 350 }
        ]
      },
      {
        id: 2,
        sku: 'SKU-002',
        productName: 'Organic Face Cream 100ml',
        category: 'Skin Care',
        totalStock: 800,
        availableStock: 680,
        allocatedStock: 120,
        minThreshold: 150,
        unitCost: 25.00,
        unit: 'units',
        lastMovement: '2024-07-06',
        warehouseBreakdown: [
          { warehouse: 'Main Distribution Center', available: 280, allocated: 70, total: 350 },
          { warehouse: 'West Coast Depot', available: 200, allocated: 30, total: 230 },
          { warehouse: 'Central Hub', available: 200, allocated: 20, total: 220 }
        ]
      },
      {
        id: 3,
        sku: 'SKU-003',
        productName: 'Vitamin C Serum 30ml',
        category: 'Skin Care',
        totalStock: 45,
        availableStock: 45,
        allocatedStock: 0,
        minThreshold: 100,
        unitCost: 35.00,
        unit: 'units',
        lastMovement: '2024-07-01',
        warehouseBreakdown: [
          { warehouse: 'Main Distribution Center', available: 25, allocated: 0, total: 25 },
          { warehouse: 'West Coast Depot', available: 20, allocated: 0, total: 20 },
          { warehouse: 'Central Hub', available: 0, allocated: 0, total: 0 }
        ]
      }
    ]

    // Load options (categories remain the same)
    // Warehouse options removed since this is warehouse-specific

    categoryOptions.value = [
      { label: 'Hair Care', value: 'Hair Care' },
      { label: 'Skin Care', value: 'Skin Care' },
      { label: 'Makeup', value: 'Makeup' },
      { label: 'Fragrance', value: 'Fragrance' }
    ]

    skuOptions.value = inventory.value.map(item => ({
      label: `${item.sku} - ${item.productName}`,
      value: item.sku
    }))

    // Calculate warehouse-specific stats
    inventoryStats.value = {
      totalSKUs: inventory.value.length,
      totalUnits: inventory.value.reduce((sum, item) => sum + item.totalStock, 0),
      totalValue: inventory.value.reduce((sum, item) => sum + (item.totalStock * item.unitCost), 0),
      lowStockItems: inventory.value.filter(item => item.availableStock <= item.minThreshold).length,
      activeWarehouses: 1
    }

    // No warehouse distribution needed for single warehouse view

  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load inventory data',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const getStockStatus = (item) => {
  if (item.availableStock === 0) return 'out_of_stock'
  if (item.availableStock <= item.minThreshold) return 'low_stock'
  if (item.availableStock > item.minThreshold * 3) return 'overstocked'
  return 'in_stock'
}

const getStockStatusLabel = (item) => {
  const status = getStockStatus(item)
  const labels = {
    'in_stock': 'In Stock',
    'low_stock': 'Low Stock',
    'out_of_stock': 'Out of Stock',
    'overstocked': 'Overstocked'
  }
  return labels[status] || 'Unknown'
}

const getStockStatusSeverity = (item) => {
  const status = getStockStatus(item)
  const severities = {
    'in_stock': 'success',
    'low_stock': 'warning',
    'out_of_stock': 'danger',
    'overstocked': 'info'
  }
  return severities[status] || 'secondary'
}

const handleSearch = () => {
  // Search is reactive through computed property
}

const handleFilter = () => {
  // Filtering is reactive through computed property
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedWarehouse.value = null
  selectedCategory.value = null
  selectedStockStatus.value = null
}

const loadWarehouseData = async () => {
  try {
    if (warehouseId.value) {
      // In a real app, this would fetch from the warehouse store
      // For now, using mock data based on warehouse ID
      warehouseData.value = {
        id: parseInt(warehouseId.value),
        name: `Warehouse ${warehouseId.value}`,
        city: 'Sample City',
        streetAddress: '123 Warehouse Street',
        warehouseManager: {
          firstName: 'John',
          lastName: 'Doe'
        }
      }
      
      // Try to get actual warehouse data from store if available
      await warehouseStore.fetchWarehouses()
      const warehouses = warehouseStore.warehouses || []
      const actualWarehouse = warehouses.find(w => w.id === parseInt(warehouseId.value))
      if (actualWarehouse) {
        warehouseData.value = actualWarehouse
      }
    }
  } catch (error) {
    console.error('Error loading warehouse data:', error)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const viewStockDetails = (item) => {
  selectedStock.value = item
  showStockDetails.value = true
}

const editStock = (item) => {
  console.log('Edit stock clicked for item:', item)
  editStockForm.value = {
    id: item.id,
    sku: item.sku,
    productName: item.productName,
    category: item.category,
    minThreshold: item.minThreshold,
    unitCost: item.unitCost,
    unit: item.unit
  }
  showEditStock.value = true
}

const adjustStock = (item) => {
  stockAdjustment.value.sku = item.sku
  stockAdjustment.value.warehouseId = warehouseId.value
  showStockAdjustment.value = true
}

const viewMovementHistory = (item) => {
  selectedStock.value = item
  showMovementHistory.value = true
}

const allocateStock = (item) => {
  router.push(`/warehouses/inventory/${item.sku}/allocate`)
}

const deleteStock = (item) => {
  console.log('Delete stock clicked for item:', item)
  selectedStock.value = item
  showDeleteConfirm.value = true
}

const closeStockAdjustment = () => {
  showStockAdjustment.value = false
  stockAdjustment.value = {
    sku: '',
    warehouseId: warehouseId.value || '',
    type: '',
    quantity: null,
    reason: ''
  }
}

const closeEditStock = () => {
  showEditStock.value = false
  editStockForm.value = {
    id: null,
    sku: '',
    productName: '',
    category: '',
    minThreshold: null,
    unitCost: null,
    unit: ''
  }
}

const saveEditStock = async () => {
  try {
    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Find and update the item in the inventory array
    const index = inventory.value.findIndex(item => item.id === editStockForm.value.id)
    if (index !== -1) {
      inventory.value[index] = {
        ...inventory.value[index],
        sku: editStockForm.value.sku,
        productName: editStockForm.value.productName,
        category: editStockForm.value.category,
        minThreshold: editStockForm.value.minThreshold,
        unitCost: editStockForm.value.unitCost,
        unit: editStockForm.value.unit
      }
    }

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Stock item updated successfully',
      life: 3000
    })

    closeEditStock()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update stock item',
      life: 3000
    })
  }
}

const confirmDeleteStock = async () => {
  try {
    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 500))

    // Remove the item from the inventory array
    const index = inventory.value.findIndex(item => item.id === selectedStock.value.id)
    if (index !== -1) {
      inventory.value.splice(index, 1)
    }

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Stock item ${selectedStock.value.sku} deleted successfully`,
      life: 3000
    })

    showDeleteConfirm.value = false
    selectedStock.value = null
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete stock item',
      life: 3000
    })
  }
}

const applyStockAdjustment = async () => {
  try {
    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 500))

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Stock adjustment applied successfully',
      life: 3000
    })

    closeStockAdjustment()
    await loadInventoryData() // Reload data

  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to apply stock adjustment',
      life: 3000
    })
  }
}

const showLowStockItems = () => {
  selectedStockStatus.value = 'low_stock'
  toast.add({
    severity: 'info',
    summary: 'Filter Applied',
    detail: 'Showing low stock items only',
    life: 2000
  })
}

const generateInventoryReport = () => {
  toast.add({
    severity: 'info',
    summary: 'Report Generation',
    detail: 'Inventory report generation started',
    life: 3000
  })
}

const bulkStockAction = () => {
  toast.add({
    severity: 'info',
    summary: 'Bulk Actions',
    detail: 'Bulk action functionality will be implemented',
    life: 3000
  })
}

const exportInventory = () => {
  toast.add({
    severity: 'info',
    summary: 'Export',
    detail: 'Inventory data export started',
    life: 3000
  })
}

onMounted(() => {
  loadInventoryData()
})
</script>

<style scoped>
.inventory-page {
  padding: 1.5rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.header-nav {
  margin-bottom: 1rem;
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

.stat-icon.total-skus { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.stat-icon.total-units { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.stat-icon.inventory-value { background: linear-gradient(135deg, #10b981, #059669); }
.stat-icon.low-stock { background: linear-gradient(135deg, #ef4444, #dc2626); }

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

.stat-detail {
  font-size: 0.8rem;
  color: #6b7280;
}

.quick-actions-card {
  margin-bottom: 1.5rem;
}

.quick-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
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
  min-width: 300px;
}

.filter-field {
  min-width: 200px;
}

.inventory-table-card {
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

.sku-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sku-code {
  font-family: monospace;
  font-weight: 600;
  color: #111827;
}

.product-name {
  font-size: 0.875rem;
  color: #6b7280;
}

.category-tag {
  background: #f3f4f6;
  color: #374151;
}

.stock-cell {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.stock-number {
  font-weight: 600;
  color: #111827;
}

.stock-number.available {
  color: #10b981;
}

.stock-number.allocated {
  color: #f59e0b;
}

.stock-unit {
  font-size: 0.8rem;
  color: #6b7280;
}

.threshold {
  font-weight: 500;
  color: #6b7280;
}

.unit-cost {
  font-weight: 500;
  color: #111827;
}

.total-value {
  font-weight: 600;
  color: #10b981;
}

.last-movement {
  font-size: 0.875rem;
  color: #6b7280;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  min-width: 300px;
}

.action-buttons .p-button {
  min-width: 40px;
  min-height: 32px;
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

.warehouse-info-card {
  margin-bottom: 1.5rem;
}

.warehouse-details {
  padding: 1rem 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.detail-item label {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.875rem;
}

.detail-item span {
  color: #111827;
  font-weight: 500;
}

.adjustment-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.stock-details {
  padding: 1rem 0;
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.stock-header h3 {
  margin: 0;
  color: #111827;
}

.sku-badge {
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.875rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.detail-section h4 {
  color: #111827;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item label {
  font-weight: 500;
  color: #6b7280;
}

.detail-item span {
  color: #111827;
  font-weight: 500;
}

.warehouse-breakdown h4 {
  color: #111827;
  margin: 0 0 1rem 0;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.readonly-field {
  background-color: #f9fafb;
  color: #6b7280;
}

.confirmation-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
}

.confirmation-content h3 {
  margin: 0 0 0.5rem 0;
  color: #111827;
}

.confirmation-content p {
  margin: 0.5rem 0;
  color: #6b7280;
}

.warning-text {
  color: #f56565;
  font-weight: 500;
}

.movement-history-content {
  padding: 1rem 0;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.history-header h4 {
  margin: 0;
  color: #111827;
  font-size: 1.25rem;
}

@media (max-width: 768px) {
  .inventory-page {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    justify-content: center;
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
    justify-content: center;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .stat-content {
    flex-direction: column;
    text-align: center;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .confirmation-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
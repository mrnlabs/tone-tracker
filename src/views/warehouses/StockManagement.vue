<template>
  <DashboardLayout>
    <div class="stock-management-page">
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
          <h1 class="page-title">Stock Management</h1>
          <p class="page-description">
            Manage stock movements, allocations, and distribution
          </p>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="stats-grid">
        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon pending">
                <i class="pi pi-clock"></i>
              </div>
              <div class="stat-info">
                <h3>Pending Movements</h3>
                <p class="stat-number">{{ stockStats.pendingMovements }}</p>
              </div>
            </div>
          </template>
        </Card>

        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon today">
                <i class="pi pi-calendar"></i>
              </div>
              <div class="stat-info">
                <h3>Today's Movements</h3>
                <p class="stat-number">{{ stockStats.todayMovements }}</p>
              </div>
            </div>
          </template>
        </Card>

        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon allocated">
                <i class="pi pi-send"></i>
              </div>
              <div class="stat-info">
                <h3>Allocated Units</h3>
                <p class="stat-number">{{ stockStats.allocatedUnits.toLocaleString() }}</p>
              </div>
            </div>
          </template>
        </Card>

        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon value">
                <i class="pi pi-dollar"></i>
              </div>
              <div class="stat-info">
                <h3>Movement Value</h3>
                <p class="stat-number">${{ stockStats.movementValue.toLocaleString() }}</p>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Action Buttons -->
      <Card class="actions-card">
        <template #content>
          <div class="action-buttons">
            <Button
                @click="showStockInDialog = true"
                icon="pi pi-arrow-down"
                label="Stock In"
                class="p-button-success"
            />
            <Button
                @click="showStockOutDialog = true"
                icon="pi pi-arrow-up"
                label="Stock Out"
                class="p-button-warning"
            />
            <Button
                @click="showTransferDialog = true"
                icon="pi pi-arrow-right-arrow-left"
                label="Transfer"
                class="p-button-info"
            />
            <Button
                @click="showAllocationDialog = true"
                icon="pi pi-send"
                label="Allocate Stock"
                class="p-button-outlined"
            />
            <Button
                @click="showBulkOperations = true"
                icon="pi pi-upload"
                label="Bulk Operations"
                class="p-button-outlined"
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
                    placeholder="Search movements..."
                    @input="handleSearch"
                />
              </span>
            </div>

            <div class="filter-field">
              <Dropdown
                  v-model="selectedMovementType"
                  :options="movementTypeOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="All Movement Types"
                  showClear
                  @change="handleFilter"
              />
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

      <!-- Stock Movements Table -->
      <Card class="movements-table-card">
        <template #content>
          <DataTable
              :value="filteredMovements"
              :loading="loading"
              responsiveLayout="scroll"
              :paginator="true"
              :rows="15"
              :rowsPerPageOptions="[15, 25, 50]"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} movements"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              dataKey="id"
              :sortField="'createdDate'"
              :sortOrder="-1"
          >
            <template #header>
              <div class="table-header">
                <h3>Stock Movements</h3>
                <div class="table-actions">
                  <Button
                      @click="exportMovements"
                      icon="pi pi-download"
                      label="Export"
                      class="p-button-outlined"
                  />
                  <Button
                      @click="refreshMovements"
                      icon="pi pi-refresh"
                      class="p-button-outlined"
                  />
                </div>
              </div>
            </template>

            <Column field="movementNumber" header="Movement #" sortable>
              <template #body="{ data }">
                <span class="movement-number">{{ data.movementNumber }}</span>
              </template>
            </Column>

            <Column field="type" header="Type" sortable>
              <template #body="{ data }">
                <Tag
                    :value="data.type"
                    :severity="getMovementTypeSeverity(data.type)"
                />
              </template>
            </Column>

            <Column field="sku" header="SKU" sortable>
              <template #body="{ data }">
                <div class="sku-cell">
                  <span class="sku-code">{{ data.sku }}</span>
                  <span class="product-name">{{ data.productName }}</span>
                </div>
              </template>
            </Column>

            <Column field="quantity" header="Quantity" sortable>
              <template #body="{ data }">
                <div class="quantity-cell">
                  <span :class="['quantity-number', getQuantityClass(data.type)]">
                    {{ data.type === 'Stock Out' || data.type === 'Transfer Out' ? '-' : '+' }}{{ data.quantity.toLocaleString() }}
                  </span>
                  <span class="quantity-unit">{{ data.unit }}</span>
                </div>
              </template>
            </Column>

            <Column field="sourceWarehouse" header="Source" sortable>
              <template #body="{ data }">
                <span v-if="data.sourceWarehouse" class="warehouse-name">{{ data.sourceWarehouse }}</span>
                <span v-else class="no-data">—</span>
              </template>
            </Column>

            <Column field="destinationWarehouse" header="Destination" sortable>
              <template #body="{ data }">
                <span v-if="data.destinationWarehouse" class="warehouse-name">{{ data.destinationWarehouse }}</span>
                <span v-else class="no-data">—</span>
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

            <Column field="createdBy" header="Created By" sortable>
              <template #body="{ data }">
                <div class="user-cell">
                  <Avatar
                      :label="data.createdBy.name.split(' ').map(n => n.charAt(0)).join('')"
                      size="small"
                      shape="circle"
                  />
                  <span>{{ data.createdBy.name }}</span>
                </div>
              </template>
            </Column>

            <Column field="createdDate" header="Date" sortable>
              <template #body="{ data }">
                <span class="movement-date">{{ formatDateTime(data.createdDate) }}</span>
              </template>
            </Column>

            <Column header="Actions" :exportable="false">
              <template #body="{ data }">
                <div class="action-buttons">
                  <Button
                      @click="viewMovementDetails(data)"
                      icon="pi pi-eye"
                      class="p-button-text p-button-sm"
                      v-tooltip.top="'View Details'"
                  />
                  <Button
                      v-if="canEditMovement(data)"
                      @click="editMovement(data)"
                      icon="pi pi-pencil"
                      class="p-button-text p-button-sm"
                      v-tooltip.top="'Edit'"
                  />
                  <Button
                      v-if="canApproveMovement(data)"
                      @click="approveMovement(data)"
                      icon="pi pi-check"
                      class="p-button-text p-button-sm p-button-success"
                      v-tooltip.top="'Approve'"
                  />
                  <Button
                      v-if="canCancelMovement(data)"
                      @click="cancelMovement(data)"
                      icon="pi pi-times"
                      class="p-button-text p-button-sm p-button-danger"
                      v-tooltip.top="'Cancel'"
                  />
                </div>
              </template>
            </Column>

            <template #empty>
              <div class="empty-state">
                <i class="pi pi-arrow-right-arrow-left empty-icon"></i>
                <h3>No stock movements found</h3>
                <p>No movements match your current search criteria.</p>
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

      <!-- Recent Allocations -->
      <Card class="allocations-card">
        <template #header>
          <div class="card-header">
            <h3>Recent Stock Allocations</h3>
            <Button
                label="View All"
                icon="pi pi-external-link"
                class="p-button-text"
                @click="viewAllAllocations"
            />
          </div>
        </template>
        <template #content>
          <DataTable
              :value="recentAllocations"
              responsiveLayout="scroll"
              :rows="5"
          >
            <Column field="activationName" header="Activation"></Column>
            <Column field="sku" header="SKU"></Column>
            <Column field="allocatedQuantity" header="Allocated">
              <template #body="{ data }">
                {{ data.allocatedQuantity.toLocaleString() }} {{ data.unit }}
              </template>
            </Column>
            <Column field="warehouse" header="Warehouse"></Column>
            <Column field="allocationDate" header="Date">
              <template #body="{ data }">
                {{ formatDate(data.allocationDate) }}
              </template>
            </Column>
            <Column field="status" header="Status">
              <template #body="{ data }">
                <Tag
                    :value="data.status"
                    :severity="getAllocationStatusSeverity(data.status)"
                />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <!-- Stock In Dialog -->
    <Dialog
        v-model:visible="showStockInDialog"
        :style="{ width: '600px' }"
        header="Stock In"
        :modal="true"
    >
      <div class="stock-form">
        <div class="form-row">
          <div class="form-group">
            <label for="stockInSku">SKU</label>
            <Dropdown
                id="stockInSku"
                v-model="stockInForm.sku"
                :options="skuOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select SKU"
                filter
            />
          </div>
          <div class="form-group">
            <label for="stockInWarehouse">Warehouse</label>
            <Dropdown
                id="stockInWarehouse"
                v-model="stockInForm.warehouseId"
                :options="warehouseOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select warehouse"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="stockInQuantity">Quantity</label>
            <InputNumber
                id="stockInQuantity"
                v-model="stockInForm.quantity"
                :min="1"
                placeholder="Enter quantity"
            />
          </div>
          <div class="form-group">
            <label for="stockInCost">Unit Cost</label>
            <InputNumber
                id="stockInCost"
                v-model="stockInForm.unitCost"
                mode="currency"
                currency="USD"
                locale="en-US"
                placeholder="Unit cost"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="stockInSupplier">Supplier</label>
          <InputText
              id="stockInSupplier"
              v-model="stockInForm.supplier"
              placeholder="Supplier name"
          />
        </div>

        <div class="form-group">
          <label for="stockInReference">Reference Number</label>
          <InputText
              id="stockInReference"
              v-model="stockInForm.referenceNumber"
              placeholder="PO number, invoice number, etc."
          />
        </div>

        <div class="form-group">
          <label for="stockInNotes">Notes</label>
          <Textarea
              id="stockInNotes"
              v-model="stockInForm.notes"
              :rows="3"
              placeholder="Additional notes..."
          />
        </div>
      </div>

      <template #footer>
        <Button
            label="Cancel"
            icon="pi pi-times"
            @click="closeStockInDialog"
            class="p-button-text"
        />
        <Button
            label="Create Stock In"
            icon="pi pi-check"
            @click="createStockIn"
            :disabled="!isStockInFormValid"
        />
      </template>
    </Dialog>

    <!-- Stock Out Dialog -->
    <Dialog
        v-model:visible="showStockOutDialog"
        :style="{ width: '600px' }"
        header="Stock Out"
        :modal="true"
    >
      <div class="stock-form">
        <div class="form-row">
          <div class="form-group">
            <label for="stockOutSku">SKU</label>
            <Dropdown
                id="stockOutSku"
                v-model="stockOutForm.sku"
                :options="skuOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select SKU"
                filter
            />
          </div>
          <div class="form-group">
            <label for="stockOutWarehouse">Warehouse</label>
            <Dropdown
                id="stockOutWarehouse"
                v-model="stockOutForm.warehouseId"
                :options="warehouseOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select warehouse"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="stockOutQuantity">Quantity</label>
            <InputNumber
                id="stockOutQuantity"
                v-model="stockOutForm.quantity"
                :min="1"
                placeholder="Enter quantity"
            />
          </div>
          <div class="form-group">
            <label for="stockOutReason">Reason</label>
            <Dropdown
                id="stockOutReason"
                v-model="stockOutForm.reason"
                :options="stockOutReasons"
                optionLabel="label"
                optionValue="value"
                placeholder="Select reason"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="stockOutDestination">Destination</label>
          <InputText
              id="stockOutDestination"
              v-model="stockOutForm.destination"
              placeholder="Activation, customer, etc."
          />
        </div>

        <div class="form-group">
          <label for="stockOutNotes">Notes</label>
          <Textarea
              id="stockOutNotes"
              v-model="stockOutForm.notes"
              :rows="3"
              placeholder="Additional notes..."
          />
        </div>
      </div>

      <template #footer>
        <Button
            label="Cancel"
            icon="pi pi-times"
            @click="closeStockOutDialog"
            class="p-button-text"
        />
        <Button
            label="Create Stock Out"
            icon="pi pi-check"
            @click="createStockOut"
            :disabled="!isStockOutFormValid"
        />
      </template>
    </Dialog>

    <!-- Transfer Dialog -->
    <Dialog
        v-model:visible="showTransferDialog"
        :style="{ width: '600px' }"
        header="Stock Transfer"
        :modal="true"
    >
      <div class="stock-form">
        <div class="form-row">
          <div class="form-group">
            <label for="transferSku">SKU</label>
            <Dropdown
                id="transferSku"
                v-model="transferForm.sku"
                :options="skuOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select SKU"
                filter
            />
          </div>
          <div class="form-group">
            <label for="transferQuantity">Quantity</label>
            <InputNumber
                id="transferQuantity"
                v-model="transferForm.quantity"
                :min="1"
                placeholder="Enter quantity"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="transferFrom">From Warehouse</label>
            <Dropdown
                id="transferFrom"
                v-model="transferForm.fromWarehouseId"
                :options="warehouseOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select source warehouse"
            />
          </div>
          <div class="form-group">
            <label for="transferTo">To Warehouse</label>
            <Dropdown
                id="transferTo"
                v-model="transferForm.toWarehouseId"
                :options="warehouseOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select destination warehouse"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="transferReason">Transfer Reason</label>
          <Dropdown
              id="transferReason"
              v-model="transferForm.reason"
              :options="transferReasons"
              optionLabel="label"
              optionValue="value"
              placeholder="Select reason"
          />
        </div>

        <div class="form-group">
          <label for="transferNotes">Notes</label>
          <Textarea
              id="transferNotes"
              v-model="transferForm.notes"
              :rows="3"
              placeholder="Additional notes..."
          />
        </div>
      </div>

      <template #footer>
        <Button
            label="Cancel"
            icon="pi pi-times"
            @click="closeTransferDialog"
            class="p-button-text"
        />
        <Button
            label="Create Transfer"
            icon="pi pi-check"
            @click="createTransfer"
            :disabled="!isTransferFormValid"
        />
      </template>
    </Dialog>

    <!-- Allocation Dialog -->
    <Dialog
        v-model:visible="showAllocationDialog"
        :style="{ width: '600px' }"
        header="Allocate Stock"
        :modal="true"
    >
      <div class="stock-form">
        <div class="form-row">
          <div class="form-group">
            <label for="allocationActivation">Activation</label>
            <Dropdown
                id="allocationActivation"
                v-model="allocationForm.activationId"
                :options="activationOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select activation"
                filter
            />
          </div>
          <div class="form-group">
            <label for="allocationSku">SKU</label>
            <Dropdown
                id="allocationSku"
                v-model="allocationForm.sku"
                :options="skuOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select SKU"
                filter
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="allocationWarehouse">Warehouse</label>
            <Dropdown
                id="allocationWarehouse"
                v-model="allocationForm.warehouseId"
                :options="warehouseOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select warehouse"
            />
          </div>
          <div class="form-group">
            <label for="allocationQuantity">Quantity</label>
            <InputNumber
                id="allocationQuantity"
                v-model="allocationForm.quantity"
                :min="1"
                placeholder="Enter quantity"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="allocationDate">Allocation Date</label>
          <Calendar
              id="allocationDate"
              v-model="allocationForm.allocationDate"
              :showIcon="true"
              placeholder="Select date"
          />
        </div>

        <div class="form-group">
          <label for="allocationNotes">Notes</label>
          <Textarea
              id="allocationNotes"
              v-model="allocationForm.notes"
              :rows="3"
              placeholder="Additional notes..."
          />
        </div>
      </div>

      <template #footer>
        <Button
            label="Cancel"
            icon="pi pi-times"
            @click="closeAllocationDialog"
            class="p-button-text"
        />
        <Button
            label="Allocate Stock"
            icon="pi pi-check"
            @click="createAllocation"
            :disabled="!isAllocationFormValid"
        />
      </template>
    </Dialog>

    <!-- Movement Details Dialog -->
    <Dialog
        v-model:visible="showMovementDetails"
        :style="{ width: '700px' }"
        header="Movement Details"
        :modal="true"
    >
      <div v-if="selectedMovement" class="movement-details">
        <div class="movement-header">
          <div class="movement-info">
            <h3>{{ selectedMovement.movementNumber }}</h3>
            <Tag
                :value="selectedMovement.type"
                :severity="getMovementTypeSeverity(selectedMovement.type)"
            />
          </div>
          <div class="movement-status">
            <Tag
                :value="selectedMovement.status"
                :severity="getStatusSeverity(selectedMovement.status)"
            />
          </div>
        </div>

        <div class="details-grid">
          <div class="detail-section">
            <h4>Product Information</h4>
            <div class="detail-item">
              <label>SKU:</label>
              <span>{{ selectedMovement.sku }}</span>
            </div>
            <div class="detail-item">
              <label>Product:</label>
              <span>{{ selectedMovement.productName }}</span>
            </div>
            <div class="detail-item">
              <label>Quantity:</label>
              <span>{{ selectedMovement.quantity?.toLocaleString() }} {{ selectedMovement.unit }}</span>
            </div>
            <div class="detail-item" v-if="selectedMovement.unitCost">
              <label>Unit Cost:</label>
              <span>${{ selectedMovement.unitCost?.toFixed(2) }}</span>
            </div>
          </div>

          <div class="detail-section">
            <h4>Movement Information</h4>
            <div class="detail-item">
              <label>Type:</label>
              <span>{{ selectedMovement.type }}</span>
            </div>
            <div class="detail-item" v-if="selectedMovement.sourceWarehouse">
              <label>Source:</label>
              <span>{{ selectedMovement.sourceWarehouse }}</span>
            </div>
            <div class="detail-item" v-if="selectedMovement.destinationWarehouse">
              <label>Destination:</label>
              <span>{{ selectedMovement.destinationWarehouse }}</span>
            </div>
            <div class="detail-item">
              <label>Created By:</label>
              <span>{{ selectedMovement.createdBy?.name }}</span>
            </div>
            <div class="detail-item">
              <label>Created Date:</label>
              <span>{{ formatDateTime(selectedMovement.createdDate) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="selectedMovement.notes">
          <h4>Notes</h4>
          <p class="movement-notes">{{ selectedMovement.notes }}</p>
        </div>

        <div class="detail-section" v-if="selectedMovement.referenceNumber">
          <h4>Reference Information</h4>
          <div class="detail-item">
            <label>Reference Number:</label>
            <span>{{ selectedMovement.referenceNumber }}</span>
          </div>
          <div class="detail-item" v-if="selectedMovement.supplier">
            <label>Supplier:</label>
            <span>{{ selectedMovement.supplier }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
            label="Close"
            icon="pi pi-times"
            @click="showMovementDetails = false"
            class="p-button-text"
        />
      </template>
    </Dialog>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import DashboardLayout from '@/components/general/DashboardLayout.vue'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

// State
const loading = ref(false)
const movements = ref([])
const recentAllocations = ref([])
const searchQuery = ref('')
const selectedMovementType = ref(null)
const selectedStatus = ref(null)
const selectedDateRange = ref(null)

// Dialog states
const showStockInDialog = ref(false)
const showStockOutDialog = ref(false)
const showTransferDialog = ref(false)
const showAllocationDialog = ref(false)
const showBulkOperations = ref(false)
const showMovementDetails = ref(false)
const selectedMovement = ref(null)

// Form data
const stockInForm = ref({
  sku: '',
  warehouseId: '',
  quantity: null,
  unitCost: null,
  supplier: '',
  referenceNumber: '',
  notes: ''
})

const stockOutForm = ref({
  sku: '',
  warehouseId: '',
  quantity: null,
  reason: '',
  destination: '',
  notes: ''
})

const transferForm = ref({
  sku: '',
  quantity: null,
  fromWarehouseId: '',
  toWarehouseId: '',
  reason: '',
  notes: ''
})

const allocationForm = ref({
  activationId: '',
  sku: '',
  warehouseId: '',
  quantity: null,
  allocationDate: new Date(),
  notes: ''
})

// Stats
const stockStats = ref({
  pendingMovements: 0,
  todayMovements: 0,
  allocatedUnits: 0,
  movementValue: 0
})

// Options
const warehouseOptions = ref([])
const skuOptions = ref([])
const activationOptions = ref([])

const movementTypeOptions = [
  { label: 'Stock In', value: 'Stock In' },
  { label: 'Stock Out', value: 'Stock Out' },
  { label: 'Transfer', value: 'Transfer' },
  { label: 'Allocation', value: 'Allocation' },
  { label: 'Adjustment', value: 'Adjustment' }
]

const statusOptions = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' }
]

const stockOutReasons = [
  { label: 'Allocation to Activation', value: 'allocation' },
  { label: 'Sample Distribution', value: 'sample' },
  { label: 'Damage/Loss', value: 'damage' },
  { label: 'Quality Control', value: 'qc' },
  { label: 'Return to Supplier', value: 'return' }
]

const transferReasons = [
  { label: 'Stock Balancing', value: 'balancing' },
  { label: 'Demand Fulfillment', value: 'demand' },
  { label: 'Warehouse Optimization', value: 'optimization' },
  { label: 'Emergency Request', value: 'emergency' }
]

// Computed
const userRole = computed(() => authStore.user?.role)

const filteredMovements = computed(() => {
  let filtered = movements.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(movement =>
        movement.movementNumber.toLowerCase().includes(query) ||
        movement.sku.toLowerCase().includes(query) ||
        movement.productName.toLowerCase().includes(query) ||
        movement.createdBy.name.toLowerCase().includes(query)
    )
  }

  // Movement type filter
  if (selectedMovementType.value) {
    filtered = filtered.filter(movement => movement.type === selectedMovementType.value)
  }

  // Status filter
  if (selectedStatus.value) {
    filtered = filtered.filter(movement => movement.status === selectedStatus.value)
  }

  // Date range filter
  if (selectedDateRange.value && selectedDateRange.value.length === 2) {
    const [startDate, endDate] = selectedDateRange.value
    filtered = filtered.filter(movement => {
      const movementDate = new Date(movement.createdDate)
      return movementDate >= startDate && movementDate <= endDate
    })
  }

  return filtered
})

const isStockInFormValid = computed(() => {
  return stockInForm.value.sku &&
      stockInForm.value.warehouseId &&
      stockInForm.value.quantity &&
      stockInForm.value.unitCost
})

const isStockOutFormValid = computed(() => {
  return stockOutForm.value.sku &&
      stockOutForm.value.warehouseId &&
      stockOutForm.value.quantity &&
      stockOutForm.value.reason
})

const isTransferFormValid = computed(() => {
  return transferForm.value.sku &&
      transferForm.value.quantity &&
      transferForm.value.fromWarehouseId &&
      transferForm.value.toWarehouseId &&
      transferForm.value.fromWarehouseId !== transferForm.value.toWarehouseId
})

const isAllocationFormValid = computed(() => {
  return allocationForm.value.activationId &&
      allocationForm.value.sku &&
      allocationForm.value.warehouseId &&
      allocationForm.value.quantity &&
      allocationForm.value.allocationDate
})

// Methods
const loadStockData = async () => {
  loading.value = true
  try {
    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock movements data
    movements.value = [
      {
        id: 1,
        movementNumber: 'MOV-2024-001',
        type: 'Stock In',
        sku: 'SKU-001',
        productName: 'Premium Shampoo 500ml',
        quantity: 500,
        unit: 'units',
        sourceWarehouse: null,
        destinationWarehouse: 'Main Distribution Center',
        status: 'Completed',
        createdBy: { id: 1, name: 'John Smith' },
        createdDate: '2024-07-08T09:00:00',
        unitCost: 12.50,
        supplier: 'Beauty Supplies Inc',
        referenceNumber: 'PO-2024-123',
        notes: 'Monthly stock replenishment'
      },
      {
        id: 2,
        movementNumber: 'MOV-2024-002',
        type: 'Transfer',
        sku: 'SKU-002',
        productName: 'Organic Face Cream 100ml',
        quantity: 200,
        unit: 'units',
        sourceWarehouse: 'Main Distribution Center',
        destinationWarehouse: 'West Coast Depot',
        status: 'Pending',
        createdBy: { id: 2, name: 'Sarah Johnson' },
        createdDate: '2024-07-08T10:30:00',
        notes: 'Stock balancing for upcoming activation'
      },
      {
        id: 3,
        movementNumber: 'MOV-2024-003',
        type: 'Stock Out',
        sku: 'SKU-001',
        productName: 'Premium Shampoo 500ml',
        quantity: 150,
        unit: 'units',
        sourceWarehouse: 'Main Distribution Center',
        destinationWarehouse: null,
        status: 'Approved',
        createdBy: { id: 3, name: 'Mike Chen' },
        createdDate: '2024-07-08T14:15:00',
        destination: 'Summer Campaign Activation',
        notes: 'Allocated for product demonstration'
      }
    ]

    // Mock recent allocations
    recentAllocations.value = [
      {
        id: 1,
        activationName: 'Summer Product Launch',
        sku: 'SKU-001',
        allocatedQuantity: 300,
        unit: 'units',
        warehouse: 'Main Distribution Center',
        allocationDate: '2024-07-07',
        status: 'Active'
      },
      {
        id: 2,
        activationName: 'Brand Awareness Campaign',
        sku: 'SKU-002',
        allocatedQuantity: 150,
        unit: 'units',
        warehouse: 'West Coast Depot',
        allocationDate: '2024-07-06',
        status: 'Active'
      }
    ]

    // Load options
    warehouseOptions.value = [
      { label: 'Main Distribution Center', value: 1 },
      { label: 'West Coast Depot', value: 2 },
      { label: 'Central Hub', value: 3 }
    ]

    skuOptions.value = [
      { label: 'SKU-001 - Premium Shampoo 500ml', value: 'SKU-001' },
      { label: 'SKU-002 - Organic Face Cream 100ml', value: 'SKU-002' },
      { label: 'SKU-003 - Vitamin C Serum 30ml', value: 'SKU-003' }
    ]

    activationOptions.value = [
      { label: 'Summer Product Launch', value: 1 },
      { label: 'Brand Awareness Campaign', value: 2 },
      { label: 'Holiday Promotion', value: 3 }
    ]

    // Calculate stats
    stockStats.value = {
      pendingMovements: movements.value.filter(m => m.status === 'Pending').length,
      todayMovements: movements.value.filter(m => {
        const today = new Date().toDateString()
        return new Date(m.createdDate).toDateString() === today
      }).length,
      allocatedUnits: recentAllocations.value.reduce((sum, a) => sum + a.allocatedQuantity, 0),
      movementValue: movements.value.reduce((sum, m) => sum + ((m.unitCost || 0) * m.quantity), 0)
    }

  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load stock data',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const getMovementTypeSeverity = (type) => {
  const severityMap = {
    'Stock In': 'success',
    'Stock Out': 'warning',
    'Transfer': 'info',
    'Allocation': 'secondary',
    'Adjustment': 'danger'
  }
  return severityMap[type] || 'secondary'
}

const getStatusSeverity = (status) => {
  const severityMap = {
    'Pending': 'warning',
    'Approved': 'info',
    'Completed': 'success',
    'Cancelled': 'danger'
  }
  return severityMap[status] || 'secondary'
}

const getAllocationStatusSeverity = (status) => {
  const severityMap = {
    'Active': 'success',
    'Completed': 'info',
    'Cancelled': 'danger'
  }
  return severityMap[status] || 'secondary'
}

const getQuantityClass = (type) => {
  if (type === 'Stock Out' || type === 'Transfer Out') {
    return 'quantity-negative'
  }
  return 'quantity-positive'
}

const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleSearch = () => {
  // Search is reactive through computed property
}

const handleFilter = () => {
  // Filtering is reactive through computed property
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedMovementType.value = null
  selectedStatus.value = null
  selectedDateRange.value = null
}

const viewMovementDetails = (movement) => {
  selectedMovement.value = movement
  showMovementDetails.value = true
}

const editMovement = (movement) => {
  toast.add({
    severity: 'info',
    summary: 'Edit Movement',
    detail: 'Movement editing functionality will be implemented',
    life: 3000
  })
}

const canEditMovement = (movement) => {
  return movement.status === 'Pending' && ['ADMIN', 'WAREHOUSE_MANAGER'].includes(userRole.value)
}

const canApproveMovement = (movement) => {
  return movement.status === 'Pending' && ['ADMIN', 'WAREHOUSE_MANAGER'].includes(userRole.value)
}

const canCancelMovement = (movement) => {
  return ['Pending', 'Approved'].includes(movement.status) && ['ADMIN', 'WAREHOUSE_MANAGER'].includes(userRole.value)
}

const approveMovement = async (movement) => {
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))

    movement.status = 'Approved'
    toast.add({
      severity: 'success',
      summary: 'Movement Approved',
      detail: `Movement ${movement.movementNumber} has been approved`,
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to approve movement',
      life: 3000
    })
  }
}

const cancelMovement = async (movement) => {
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))

    movement.status = 'Cancelled'
    toast.add({
      severity: 'success',
      summary: 'Movement Cancelled',
      detail: `Movement ${movement.movementNumber} has been cancelled`,
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to cancel movement',
      life: 3000
    })
  }
}

const createStockIn = async () => {
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.add({
      severity: 'success',
      summary: 'Stock In Created',
      detail: 'Stock in movement created successfully',
      life: 3000
    })

    closeStockInDialog()
    await loadStockData()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create stock in movement',
      life: 3000
    })
  }
}

const createStockOut = async () => {
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.add({
      severity: 'success',
      summary: 'Stock Out Created',
      detail: 'Stock out movement created successfully',
      life: 3000
    })

    closeStockOutDialog()
    await loadStockData()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create stock out movement',
      life: 3000
    })
  }
}

const createTransfer = async () => {
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.add({
      severity: 'success',
      summary: 'Transfer Created',
      detail: 'Stock transfer created successfully',
      life: 3000
    })

    closeTransferDialog()
    await loadStockData()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create stock transfer',
      life: 3000
    })
  }
}

const createAllocation = async () => {
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.add({
      severity: 'success',
      summary: 'Stock Allocated',
      detail: 'Stock allocation created successfully',
      life: 3000
    })

    closeAllocationDialog()
    await loadStockData()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create stock allocation',
      life: 3000
    })
  }
}

const closeStockInDialog = () => {
  showStockInDialog.value = false
  stockInForm.value = {
    sku: '',
    warehouseId: '',
    quantity: null,
    unitCost: null,
    supplier: '',
    referenceNumber: '',
    notes: ''
  }
}

const closeStockOutDialog = () => {
  showStockOutDialog.value = false
  stockOutForm.value = {
    sku: '',
    warehouseId: '',
    quantity: null,
    reason: '',
    destination: '',
    notes: ''
  }
}

const closeTransferDialog = () => {
  showTransferDialog.value = false
  transferForm.value = {
    sku: '',
    quantity: null,
    fromWarehouseId: '',
    toWarehouseId: '',
    reason: '',
    notes: ''
  }
}

const closeAllocationDialog = () => {
  showAllocationDialog.value = false
  allocationForm.value = {
    activationId: '',
    sku: '',
    warehouseId: '',
    quantity: null,
    allocationDate: new Date(),
    notes: ''
  }
}

const viewAllAllocations = () => {
  router.push('/warehouses/allocations')
}

const exportMovements = () => {
  toast.add({
    severity: 'info',
    summary: 'Export',
    detail: 'Stock movements export started',
    life: 3000
  })
}

const refreshMovements = async () => {
  await loadStockData()
  toast.add({
    severity: 'success',
    summary: 'Refreshed',
    detail: 'Stock movements data updated',
    life: 2000
  })
}

onMounted(() => {
  loadStockData()
})
</script>

<style scoped>
.stock-management-page {
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

.stat-icon.pending { background: linear-gradient(135deg, #f59e0b, #d97706); }
.stat-icon.today { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.stat-icon.allocated { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.stat-icon.value { background: linear-gradient(135deg, #10b981, #059669); }

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

.actions-card {
  margin-bottom: 1.5rem;
}

.action-buttons {
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

.movements-table-card {
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

.movement-number {
  font-family: monospace;
  font-weight: 600;
  color: #111827;
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

.quantity-cell {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.quantity-number {
  font-weight: 600;
}

.quantity-positive {
  color: #10b981;
}

.quantity-negative {
  color: #ef4444;
}

.quantity-unit {
  font-size: 0.8rem;
  color: #6b7280;
}

.warehouse-name {
  color: #111827;
  font-weight: 500;
}

.no-data {
  color: #9ca3af;
  font-style: italic;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.movement-date {
  font-size: 0.875rem;
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

.allocations-card {
  margin-bottom: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.card-header h3 {
  margin: 0;
  color: #111827;
}

.stock-form {
  padding: 1rem 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
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

.movement-details {
  padding: 1rem 0;
}

.movement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.movement-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.movement-info h3 {
  margin: 0;
  color: #111827;
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

.movement-notes {
  color: #6b7280;
  line-height: 1.6;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 0;
}

@media (max-width: 768px) {
  .stock-management-page {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
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

  .form-row {
    grid-template-columns: 1fr;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .movement-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
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
  }

  .movement-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
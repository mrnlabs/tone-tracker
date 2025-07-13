<template>
  <DashboardLayout>
    <div class="warehouse-details-page">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <ProgressSpinner />
        <p>Loading warehouse details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <EmptyState
          type="error"
          title="Error Loading Warehouse"
          :message="error"
          :actions="[{ label: 'Back to Warehouses', action: 'back', icon: 'pi pi-arrow-left' }]"
          @action="handleEmptyStateAction"
        />
      </div>

      <!-- Not Found State -->
      <div v-else-if="!warehouse" class="not-found-container">
        <EmptyState
          type="error"
          title="Warehouse Not Found"
          message="The warehouse you're looking for could not be found."
          :actions="[{ label: 'Back to Warehouses', action: 'back', icon: 'pi pi-arrow-left' }]"
          @action="handleEmptyStateAction"
        />
      </div>

      <!-- Warehouse Details Content -->
      <div v-else class="warehouse-content">
        <!-- Page Header -->
        <PageHeader 
          :title="warehouse.name"
          :description="`${warehouse.streetAddress}${warehouse.city ? ', ' + warehouse.city : ''}`"
          :actions="headerActions"
          :loading="loading"
        >
          <template #subtitle>
            <div class="warehouse-meta">
              <div class="meta-items">
                <div class="meta-item">
                  <i class="pi pi-user"></i>
                  <span>{{ warehouse.warehouseManager?.firstName ? `${warehouse.warehouseManager.firstName} ${warehouse.warehouseManager.lastName}` : 'No manager assigned' }}</span>
                </div>
                <div class="meta-item">
                  <i class="pi pi-calendar"></i>
                  <span>Created {{ formatDate(warehouse.dateCreated) }}</span>
                </div>
                <div class="meta-item" v-if="warehouse.lastUpdated">
                  <i class="pi pi-clock"></i>
                  <span>Updated {{ formatDate(warehouse.lastUpdated) }}</span>
                </div>
              </div>
            </div>
          </template>
        </PageHeader>

        <!-- Main Content with Tabs -->
        <div class="content-main">
          <TabView>
            <!-- Warehouse Information Tab -->
            <TabPanel header="Warehouse Info">
              <div class="content-grid">
                <!-- Warehouse Information Card -->
                <Card class="info-card">
                  <template #title>
                    <div class="card-header">
                      <i class="pi pi-building"></i>
                      <span>Warehouse Information</span>
                    </div>
                  </template>
                  <template #content>
                    <div class="info-grid">
                      <div class="info-item">
                        <label>Name:</label>
                        <span>{{ warehouse.name }}</span>
                      </div>
                      <div class="info-item">
                        <label>Street Address:</label>
                        <span>{{ warehouse.streetAddress }}</span>
                      </div>
                      <div class="info-item" v-if="warehouse.city">
                        <label>City:</label>
                        <span>{{ warehouse.city }}</span>
                      </div>
                      <div class="info-item">
                        <label>Manager:</label>
                        <span>{{ warehouse.warehouseManager?.firstName ? `${warehouse.warehouseManager.firstName} ${warehouse.warehouseManager.lastName}` : 'Not assigned' }}</span>
                      </div>
                    </div>
                  </template>
                </Card>

                <!-- Stock Overview Card -->
                <Card class="info-card">
                  <template #title>
                    <div class="card-header">
                      <i class="pi pi-box"></i>
                      <span>Stock Overview</span>
                    </div>
                  </template>
                  <template #content>
                    <div class="stock-overview">
                      <div class="stock-stat">
                        <div class="stat-value">{{ stockCount }}</div>
                        <div class="stat-label">Total Stock Items</div>
                      </div>
                    </div>
                  </template>
                </Card>
              </div>
            </TabPanel>

            <!-- Inventory Tab -->
            <TabPanel header="Inventory">
              <div class="inventory-content">
                <!-- Inventory Header -->
                <div class="inventory-header">
                  <h3>Warehouse Inventory</h3>
                  <div class="inventory-actions">
                    <Button
                      label="Add Stock"
                      icon="pi pi-plus"
                      class="p-button-success"
                      @click="showAddStockDialog"
                      :disabled="!canManageWarehouse"
                    />
                    <Button
                      label="Refresh"
                      icon="pi pi-refresh"
                      class="p-button-outlined"
                      @click="loadInventory"
                      :loading="loadingInventory"
                    />
                  </div>
                </div>

                <!-- Inventory Table -->
                <Card class="inventory-table-card">
                  <template #content>
                    <DataTable
                      :value="warehouseStocks"
                      :loading="loadingInventory"
                      responsiveLayout="scroll"
                      :paginator="true"
                      :rows="10"
                      :totalRecords="warehouseStocks.length"
                    >
                      <template #empty>
                        <EmptyState
                          type="empty"
                          title="No Inventory Items"
                          message="This warehouse doesn't have any stock items yet."
                          :actions="[]"
                        />
                      </template>

                      <Column field="id" header="Stock ID" sortable></Column>
                      
                      <Column field="productName" header="Product" sortable>
                        <template #body="{ data }">
                          <div class="product-cell">
                            <span class="product-name">{{ data.productName || 'Unknown Product' }}</span>
                            <span class="product-sku">{{ data.sku || data.id }}</span>
                          </div>
                        </template>
                      </Column>

                      <Column field="quantityInWarehouse" header="Quantity" sortable>
                        <template #body="{ data }">
                          <span class="quantity">{{ data.quantityInWarehouse || 0 }}</span>
                        </template>
                      </Column>

                      <Column field="type" header="Type" sortable>
                        <template #body="{ data }">
                          <span class="type">{{ data.type }}</span>
                        </template>
                      </Column>

                      <Column field="unitPriceUSD" header="Price (USD)" sortable>
                        <template #body="{ data }">
                          <span class="price">${{ data.unitPriceUSD ? Number(data.unitPriceUSD).toFixed(2) : '0.00' }}</span>
                        </template>
                      </Column>

                      <Column field="dateCreated" header="Date Added" sortable>
                        <template #body="{ data }">
                          <span class="date">{{ formatDate(data.dateCreated) }}</span>
                        </template>
                      </Column>

                      <Column header="Actions" :exportable="false">
                        <template #body="{ data }">
                          <div class="stock-actions">
                            <Button
                              icon="pi pi-pencil"
                              class="p-button-text p-button-sm"
                              v-tooltip.top="'Edit Stock'"
                              @click="editStock(data)"
                            />
                          </div>
                        </template>
                      </Column>
                    </DataTable>
                  </template>
                </Card>
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>
    </div>

    <!-- Add Stock Dialog -->
    <Dialog
      v-model:visible="showDialog"
      modal
      header="Add Stock Item"
      :style="{ width: '500px' }"
      class="p-fluid"
    >
      <div class="stock-form">
        <!-- Product Name -->
        <div class="field">
          <label for="productName" class="form-label">Product Name *</label>
          <InputText
            id="productName"
            v-model="stockForm.productName"
            placeholder="Enter product name"
            :class="{ 'p-invalid': formErrors.productName }"
          />
          <small v-if="formErrors.productName" class="p-error">{{ formErrors.productName }}</small>
        </div>

        <!-- SKU -->
        <div class="field">
          <label for="sku" class="form-label">SKU *</label>
          <InputText
            id="sku"
            v-model="stockForm.sku"
            placeholder="Enter SKU"
            :class="{ 'p-invalid': formErrors.sku }"
          />
          <small v-if="formErrors.sku" class="p-error">{{ formErrors.sku }}</small>
        </div>

        <!-- Stock Type -->
        <div class="field">
          <label for="type" class="form-label">Stock Type *</label>
          <Dropdown
            id="type"
            v-model="stockForm.type"
            :options="stockTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select stock type"
            :class="{ 'p-invalid': formErrors.type }"
          />
          <small v-if="formErrors.type" class="p-error">{{ formErrors.type }}</small>
        </div>

        <!-- Description -->
        <div class="field">
          <label for="description" class="form-label">Description</label>
          <Textarea
            id="description"
            v-model="stockForm.description"
            placeholder="Optional description"
            :rows="2"
          />
        </div>

        <!-- Quantity -->
        <div class="field">
          <label for="quantityInWarehouse" class="form-label">Quantity in Warehouse *</label>
          <InputNumber
            id="quantityInWarehouse"
            v-model="stockForm.quantityInWarehouse"
            placeholder="Enter quantity"
            :min="0"
            :class="{ 'p-invalid': formErrors.quantityInWarehouse }"
          />
          <small v-if="formErrors.quantityInWarehouse" class="p-error">{{ formErrors.quantityInWarehouse }}</small>
        </div>

        <!-- Pricing -->
        <div class="field-group">
          <div class="field">
            <label for="unitPriceUSD" class="form-label">Unit Price USD *</label>
            <InputNumber
              id="unitPriceUSD"
              v-model="stockForm.unitPriceUSD"
              placeholder="0.00"
              :min="0"
              :maxFractionDigits="2"
              :class="{ 'p-invalid': formErrors.unitPriceUSD }"
            />
            <small v-if="formErrors.unitPriceUSD" class="p-error">{{ formErrors.unitPriceUSD }}</small>
          </div>
          
          <div class="field">
            <label for="unitPriceZWL" class="form-label">Unit Price ZWL *</label>
            <InputNumber
              id="unitPriceZWL"
              v-model="stockForm.unitPriceZWL"
              placeholder="0.00"
              :min="0"
              :maxFractionDigits="2"
              :class="{ 'p-invalid': formErrors.unitPriceZWL }"
            />
            <small v-if="formErrors.unitPriceZWL" class="p-error">{{ formErrors.unitPriceZWL }}</small>
          </div>
        </div>

        <!-- Reorder Level -->
        <div class="field">
          <label for="reorderLevel" class="form-label">Reorder Level *</label>
          <InputNumber
            id="reorderLevel"
            v-model="stockForm.reorderLevel"
            placeholder="Enter reorder level"
            :min="0"
            :class="{ 'p-invalid': formErrors.reorderLevel }"
          />
          <small v-if="formErrors.reorderLevel" class="p-error">{{ formErrors.reorderLevel }}</small>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
            label="Cancel"
            icon="pi pi-times"
            class="p-button-outlined"
            @click="cancelAddStock"
            :disabled="isCreatingStock"
          />
          <Button
            label="Add Stock"
            icon="pi pi-check"
            @click="saveStock"
            :loading="isCreatingStock"
          />
        </div>
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
import { warehouseService } from '@/services/api'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const warehouseStore = useWarehouseStore()

// State
const loading = ref(true)
const loadingInventory = ref(false)
const error = ref(null)
const warehouse = ref(null)
const warehouseStocks = ref([])

// Computed
const userRole = computed(() => authStore.user?.role)

const canManageWarehouse = computed(() => {
  return ['ADMIN', 'WAREHOUSE_MANAGER'].includes(userRole.value)
})

const stockCount = computed(() => {
  // This would come from warehouse.stocks.length when we have stock data
  return warehouseStocks.value?.length || warehouse.value?.stocks?.length || 0
})

const headerActions = computed(() => {
  const actions = [
    {
      label: 'Back to Warehouses',
      icon: 'pi pi-arrow-left',
      handler: () => router.push('/warehouses'),
      variant: 'outlined'
    }
  ]
  
  if (canManageWarehouse.value) {
    actions.push(
      {
        label: 'Edit Warehouse',
        icon: 'pi pi-pencil',
        handler: editWarehouse,
        variant: 'primary'
      },
      {
        label: 'Delete Warehouse',
        icon: 'pi pi-trash',
        handler: deleteWarehouse,
        variant: 'danger'
      }
    )
  }
  
  return actions
})

// Methods
const loadWarehouseData = async () => {
  try {
    loading.value = true
    error.value = null
    const warehouseId = route.params.id

    console.log('Loading warehouse with ID:', warehouseId)

    // Load warehouse from API
    warehouse.value = await warehouseStore.getWarehouse(warehouseId)
    
    console.log('Warehouse loaded successfully:', warehouse.value)

    // Also load the inventory for this warehouse
    await loadInventory()
    
  } catch (err) {
    error.value = err.message || 'Failed to load warehouse data'
    console.error('Error loading warehouse:', err)
    console.error('Error details:', {
      message: err.message,
      status: err.status,
      response: err.response
    })
  } finally {
    loading.value = false
  }
}

const loadInventory = async () => {
  try {
    loadingInventory.value = true
    const warehouseId = route.params.id

    console.log('Loading inventory for warehouse:', warehouseId)

    // Load warehouse stocks from API using your backend endpoint
    warehouseStocks.value = await warehouseService.getWarehouseStocks(warehouseId)
    
    console.log('Warehouse stocks loaded:', warehouseStocks.value)
    
  } catch (err) {
    console.error('Error loading warehouse inventory:', err)
    // Set empty array if loading fails
    warehouseStocks.value = []
  } finally {
    loadingInventory.value = false
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

const editWarehouse = () => {
  router.push(`/warehouses/${route.params.id}/edit`)
}

const deleteWarehouse = () => {
  // Show confirmation dialog
  if (confirm(`Are you sure you want to delete warehouse "${warehouse.value.name}"? This action cannot be undone.`)) {
    performDelete()
  }
}

const performDelete = async () => {
  try {
    await warehouseStore.deleteWarehouse(warehouse.value.id)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Warehouse deleted successfully',
      life: 3000
    })

    // Navigate back to warehouse list
    router.push('/warehouses')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to delete warehouse',
      life: 3000
    })
  }
}

const editStock = (stock) => {
  toast.add({
    severity: 'info',
    summary: 'Edit Stock',
    detail: `Edit functionality for stock ID ${stock.id} will be implemented`,
    life: 3000
  })
}

// Add Stock Dialog
const showDialog = ref(false)
const stockForm = ref({
  productName: '',
  sku: '',
  description: '',
  type: 'SELLABLE',
  quantityInWarehouse: 0,
  unitPriceUSD: 0,
  unitPriceZWL: 0,
  reorderLevel: 10
})
const formErrors = ref({})
const isCreatingStock = ref(false)

// Stock type options
const stockTypeOptions = [
  { label: 'Sellable', value: 'SELLABLE' },
  { label: 'Sample', value: 'SAMPLE' },
  { label: 'Promotional', value: 'PROMOTIONAL' },
  { label: 'Material', value: 'MATERIAL' }
]

const showAddStockDialog = () => {
  // Reset form
  stockForm.value = {
    productName: '',
    sku: '',
    description: '',
    type: 'SELLABLE',
    quantityInWarehouse: 0,
    unitPriceUSD: 0,
    unitPriceZWL: 0,
    reorderLevel: 10
  }
  formErrors.value = {}
  showDialog.value = true
}

const validateStockForm = () => {
  const errors = {}
  
  if (!stockForm.value.productName?.trim()) {
    errors.productName = 'Product name is required'
  }
  
  if (!stockForm.value.sku?.trim()) {
    errors.sku = 'SKU is required'
  }
  
  if (!stockForm.value.type) {
    errors.type = 'Stock type is required'
  }
  
  if (stockForm.value.quantityInWarehouse === null || stockForm.value.quantityInWarehouse < 0) {
    errors.quantityInWarehouse = 'Quantity cannot be negative'
  }
  
  if (stockForm.value.unitPriceUSD === null || stockForm.value.unitPriceUSD < 0) {
    errors.unitPriceUSD = 'Unit price USD cannot be negative'
  }
  
  if (stockForm.value.unitPriceZWL === null || stockForm.value.unitPriceZWL < 0) {
    errors.unitPriceZWL = 'Unit price ZWL cannot be negative'
  }
  
  if (stockForm.value.reorderLevel === null || stockForm.value.reorderLevel < 0) {
    errors.reorderLevel = 'Reorder level cannot be negative'
  }
  
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

const saveStock = async () => {
  if (!validateStockForm()) {
    return
  }
  
  try {
    isCreatingStock.value = true
    
    const stockData = {
      productName: stockForm.value.productName.trim(),
      sku: stockForm.value.sku.trim(),
      description: stockForm.value.description?.trim() || null,
      type: stockForm.value.type,
      warehouseId: Number(route.params.id),
      quantityInWarehouse: Number(stockForm.value.quantityInWarehouse),
      unitPriceUSD: Number(stockForm.value.unitPriceUSD),
      unitPriceZWL: Number(stockForm.value.unitPriceZWL),
      reorderLevel: Number(stockForm.value.reorderLevel)
    }
    
    // Create the stock item
    await warehouseService.createWarehouseStock(route.params.id, stockData)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Stock item added successfully',
      life: 3000
    })
    
    showDialog.value = false
    
    // Refresh inventory
    await loadInventory()
    
  } catch (error) {
    console.error('Error adding stock:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to add stock item',
      life: 3000
    })
  } finally {
    isCreatingStock.value = false
  }
}

const cancelAddStock = () => {
  showDialog.value = false
  stockForm.value = {
    productName: '',
    sku: '',
    description: '',
    type: 'SELLABLE',
    quantityInWarehouse: 0,
    unitPriceUSD: 0,
    unitPriceZWL: 0,
    reorderLevel: 10
  }
  formErrors.value = {}
}

const handleEmptyStateAction = (action) => {
  if (action === 'back') {
    router.push('/warehouses')
  }
}

onMounted(() => {
  loadWarehouseData()
})
</script>

<style scoped>
.warehouse-details-page {
  padding: 1.5rem;
}

.loading-container,
.error-container,
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
}

.warehouse-meta {
  margin-top: 0.5rem;
}

.meta-items {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.meta-item i {
  color: #9ca3af;
}

.content-main {
  margin-top: 1rem;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #111827;
}

.card-header i {
  color: #3b82f6;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-weight: 600;
  color: #6b7280;
  font-size: 0.875rem;
}

.info-item span {
  color: #111827;
}

.stock-overview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.stock-actions {
  margin-top: 0.5rem;
}

.inventory-content {
  padding: 1rem 0;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.inventory-header h3 {
  margin: 0;
  color: #111827;
}

.inventory-actions {
  display: flex;
  gap: 0.75rem;
}

.inventory-table-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.product-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-name {
  font-weight: 600;
  color: #111827;
}

.product-sku {
  font-family: monospace;
  font-size: 0.875rem;
  color: #6b7280;
}

.quantity {
  font-weight: 600;
  color: #111827;
}

.unit {
  color: #6b7280;
  font-size: 0.875rem;
}

.date {
  color: #6b7280;
  font-size: 0.875rem;
}

.stock-actions {
  display: flex;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .warehouse-details-page {
    padding: 1rem;
  }

  .meta-items {
    flex-direction: column;
    gap: 0.5rem;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

/* Add Stock Dialog Styles */
.stock-form {
  padding: 0.5rem 0;
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  display: block;
}

.field {
  margin-bottom: 1.25rem;
}

.field-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
}

.type {
  color: #6b7280;
  font-size: 0.875rem;
  text-transform: capitalize;
}

.price {
  font-weight: 600;
  color: #059669;
}

@media (max-width: 500px) {
  .field-group {
    grid-template-columns: 1fr;
  }
}
</style>
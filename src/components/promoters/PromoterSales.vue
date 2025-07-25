<template>
  <div class="promoter-sales">
    <!-- Quick Sale Actions -->
    <Card class="quick-sales">
      <template #header>
        <div class="header-content">
          <h3>Record Sale</h3>
          <Tag :value="`${todaySalesCount} sales today`" />
        </div>
      </template>
      <template #content>
        <div class="quick-actions">
          <Button
            @click="openSaleDialog"
            icon="pi pi-plus"
            label="New Sale"
            class="p-button-success"
          />
          <Button
            @click="openBulkSaleDialog"
            icon="pi pi-copy"
            label="Bulk Sale"
            class="p-button-outlined"
          />
        </div>
      </template>
    </Card>

    <!-- Today's Sales Summary -->
    <Card class="sales-summary">
      <template #header>
        <h3>Today's Sales</h3>
      </template>
      <template #content>
        <div class="summary-stats">
          <div class="stat-item">
            <div class="stat-icon sales">
              <i class="pi pi-dollar"></i>
            </div>
            <div class="stat-info">
              <span class="stat-number">${{ todaySalesTotal }}</span>
              <span class="stat-label">Total Sales</span>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon count">
              <i class="pi pi-shopping-cart"></i>
            </div>
            <div class="stat-info">
              <span class="stat-number">{{ todaySalesCount }}</span>
              <span class="stat-label">Transactions</span>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon average">
              <i class="pi pi-chart-bar"></i>
            </div>
            <div class="stat-info">
              <span class="stat-number">${{ averageSaleAmount }}</span>
              <span class="stat-label">Avg. Sale</span>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Recent Sales -->
    <Card class="recent-sales">
      <template #header>
        <h3>Recent Sales</h3>
      </template>
      <template #content>
        <DataTable 
          :value="recentSales" 
          :paginator="true" 
          :rows="5"
          :loading="loading"
          responsiveLayout="scroll"
        >
          <Column field="timestamp" header="Time">
            <template #body="{ data }">
              {{ formatTime(data.timestamp) }}
            </template>
          </Column>
          <Column field="productName" header="Product" />
          <Column field="quantity" header="Qty" />
          <Column field="unitPrice" header="Unit Price">
            <template #body="{ data }">
              ${{ data.unitPrice?.toFixed(2) }}
            </template>
          </Column>
          <Column field="totalAmount" header="Total">
            <template #body="{ data }">
              ${{ data.totalAmount?.toFixed(2) }}
            </template>
          </Column>
          <Column header="Actions">
            <template #body="{ data }">
              <Button
                @click="editSale(data)"
                icon="pi pi-pencil"
                class="p-button-text p-button-sm"
                v-tooltip.top="'Edit Sale'"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Sale Dialog -->
    <Dialog
      v-model:visible="showSaleDialog"
      :header="editMode ? 'Edit Sale' : 'Record New Sale'"
      :modal="true"
      :style="{ width: '600px' }"
      :closable="!saleLoading"
    >
      <form @submit.prevent="submitSale" class="sale-form">
        <!-- Product Selection -->
        <div class="form-group">
          <label for="product" class="required">Product</label>
          <Dropdown
            id="product"
            v-model="saleData.stockId"
            :options="availableProducts"
            optionLabel="productName"
            optionValue="id"
            placeholder="Select product"
            :filter="true"
            :loading="productsLoading"
            :disabled="saleLoading"
            class="w-full"
            @change="onProductChange"
          >
            <template #option="slotProps">
              <div class="product-option">
                <span class="product-name">{{ slotProps.option.productName }}</span>
                <span class="product-sku">SKU: {{ slotProps.option.sku }}</span>
                <span class="product-stock">Available: {{ slotProps.option.availableQuantity }}</span>
              </div>
            </template>
          </Dropdown>
          <small class="p-error" v-if="errors.stockId">{{ errors.stockId }}</small>
        </div>

        <!-- Product Info Display -->
        <div class="product-info" v-if="selectedProduct">
          <div class="info-row">
            <span class="label">Product:</span>
            <span class="value">{{ selectedProduct.productName }}</span>
          </div>
          <div class="info-row">
            <span class="label">SKU:</span>
            <span class="value">{{ selectedProduct.sku }}</span>
          </div>
          <div class="info-row">
            <span class="label">Available:</span>
            <span class="value">{{ selectedProduct.availableQuantity }} units</span>
          </div>
        </div>

        <div class="form-row">
          <!-- Quantity -->
          <div class="form-group">
            <label for="quantity" class="required">Quantity</label>
            <InputNumber
              id="quantity"
              v-model="saleData.quantity"
              :min="1"
              :max="selectedProduct?.availableQuantity || 999"
              :disabled="saleLoading"
              placeholder="Enter quantity"
              class="w-full"
            />
            <small class="p-error" v-if="errors.quantity">{{ errors.quantity }}</small>
          </div>

          <!-- Unit Price -->
          <div class="form-group">
            <label for="unitPrice" class="required">Unit Price ($)</label>
            <InputNumber
              id="unitPrice"
              v-model="saleData.unitPrice"
              mode="currency"
              currency="USD"
              :minFractionDigits="2"
              :disabled="saleLoading"
              placeholder="0.00"
              class="w-full"
            />
            <small class="p-error" v-if="errors.unitPrice">{{ errors.unitPrice }}</small>
          </div>
        </div>

        <!-- Total Amount Display -->
        <div class="total-display">
          <label>Total Amount:</label>
          <div class="total-amount">
            ${{ totalAmount.toFixed(2) }}
          </div>
        </div>

        <!-- Payment Method -->
        <div class="form-group">
          <label for="paymentMethod" class="required">Payment Method</label>
          <Dropdown
            id="paymentMethod"
            v-model="saleData.paymentMethod"
            :options="paymentMethods"
            optionLabel="label"
            optionValue="value"
            placeholder="Select payment method"
            :disabled="saleLoading"
            class="w-full"
          />
          <small class="p-error" v-if="errors.paymentMethod">{{ errors.paymentMethod }}</small>
        </div>

        <!-- Customer Information -->
        <div class="form-group">
          <label for="customerName">Customer Name (Optional)</label>
          <InputText
            id="customerName"
            v-model="saleData.customerName"
            placeholder="Customer name"
            class="w-full"
          />
        </div>

        <div class="form-group">
          <label for="customerPhone">Customer Phone (Optional)</label>
          <InputText
            id="customerPhone"
            v-model="saleData.customerPhone"
            placeholder="Customer phone"
            class="w-full"
          />
        </div>

        <!-- Sale Notes -->
        <div class="form-group">
          <label for="notes">Notes</label>
          <Textarea
            id="notes"
            v-model="saleData.notes"
            rows="3"
            placeholder="Additional notes about the sale"
            class="w-full"
          />
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <Button
            type="button"
            @click="closeSaleDialog"
            label="Cancel"
            icon="pi pi-times"
            class="p-button-outlined"
            :disabled="saleLoading"
          />
          <Button
            type="submit"
            :loading="saleLoading"
            :label="editMode ? 'Update Sale' : 'Record Sale'"
            icon="pi pi-check"
            class="p-button-success"
          />
        </div>
      </form>
    </Dialog>

    <!-- Bulk Sale Dialog -->
    <Dialog
      v-model:visible="showBulkSaleDialog"
      header="Record Bulk Sale"
      :modal="true"
      :style="{ width: '700px' }"
      :closable="!saleLoading"
    >
      <div class="bulk-sale-form">
        <p class="help-text">
          Record multiple sales of the same product with different quantities or prices.
        </p>
        
        <!-- Bulk Product Selection -->
        <div class="form-group">
          <label for="bulkProduct" class="required">Product</label>
          <Dropdown
            id="bulkProduct"
            v-model="bulkSaleData.stockId"
            :options="availableProducts"
            optionLabel="productName"
            optionValue="id"
            placeholder="Select product"
            :filter="true"
            class="w-full"
            @change="onBulkProductChange"
          />
        </div>

        <!-- Bulk Sales Table -->
        <div class="bulk-sales-table" v-if="bulkSaleData.stockId">
          <DataTable :value="bulkSaleData.sales" editMode="cell" @cell-edit-complete="onCellEditComplete">
            <Column field="quantity" header="Quantity" style="width: 20%">
              <template #body="{ data }">
                {{ data.quantity }}
              </template>
              <template #editor="{ data }">
                <InputNumber v-model="data.quantity" :min="1" />
              </template>
            </Column>
            
            <Column field="unitPrice" header="Unit Price ($)" style="width: 25%">
              <template #body="{ data }">
                ${{ data.unitPrice?.toFixed(2) }}
              </template>
              <template #editor="{ data }">
                <InputNumber v-model="data.unitPrice" mode="currency" currency="USD" />
              </template>
            </Column>
            
            <Column field="paymentMethod" header="Payment" style="width: 25%">
              <template #body="{ data }">
                {{ getPaymentMethodLabel(data.paymentMethod) }}
              </template>
              <template #editor="{ data }">
                <Dropdown 
                  v-model="data.paymentMethod" 
                  :options="paymentMethods" 
                  optionLabel="label" 
                  optionValue="value" 
                />
              </template>
            </Column>
            
            <Column field="total" header="Total" style="width: 20%">
              <template #body="{ data }">
                ${{ (data.quantity * data.unitPrice).toFixed(2) }}
              </template>
            </Column>
            
            <Column header="Actions" style="width: 10%">
              <template #body="{ index }">
                <Button
                  @click="removeBulkSale(index)"
                  icon="pi pi-trash"
                  class="p-button-danger p-button-text p-button-sm"
                />
              </template>
            </Column>
          </DataTable>
          
          <div class="bulk-actions">
            <Button
              @click="addBulkSale"
              icon="pi pi-plus"
              label="Add Sale"
              class="p-button-outlined"
            />
            <div class="bulk-total">
              Total: ${{ bulkTotal.toFixed(2) }}
            </div>
          </div>
        </div>

        <!-- Bulk Form Actions -->
        <div class="form-actions">
          <Button
            @click="closeBulkSaleDialog"
            label="Cancel"
            icon="pi pi-times"
            class="p-button-outlined"
          />
          <Button
            @click="submitBulkSales"
            :loading="saleLoading"
            label="Record All Sales"
            icon="pi pi-check"
            class="p-button-success"
            :disabled="bulkSaleData.sales.length === 0"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { usePromoterStore } from '@/stores/promoter'
import { format } from 'date-fns'

const props = defineProps({
  activationId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['sale-recorded'])

const toast = useToast()
const promoterStore = usePromoterStore()

// State
const loading = ref(false)
const saleLoading = ref(false)
const productsLoading = ref(false)
const showSaleDialog = ref(false)
const showBulkSaleDialog = ref(false)
const editMode = ref(false)
const editingSaleId = ref(null)

const availableProducts = ref([])
const selectedProduct = ref(null)
const errors = ref({})

// Sale form data
const saleData = ref({
  stockId: null,
  quantity: 1,
  unitPrice: 0,
  paymentMethod: '',
  customerName: '',
  customerPhone: '',
  notes: ''
})

// Bulk sale data
const bulkSaleData = ref({
  stockId: null,
  sales: []
})

// Payment methods
const paymentMethods = [
  { label: 'Cash', value: 'cash' },
  { label: 'Credit Card', value: 'card' },
  { label: 'Mobile Money', value: 'mobile_money' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Check', value: 'check' }
]

// Computed
const recentSales = computed(() => promoterStore.sales.slice(0, 10))
const todaySales = computed(() => promoterStore.todaySales)

const todaySalesCount = computed(() => todaySales.value.length)

const todaySalesTotal = computed(() => 
  todaySales.value.reduce((total, sale) => total + (sale.totalAmount || 0), 0)
)

const averageSaleAmount = computed(() => 
  todaySalesCount.value > 0 ? (todaySalesTotal.value / todaySalesCount.value).toFixed(2) : '0.00'
)

const totalAmount = computed(() => 
  (saleData.value.quantity || 0) * (saleData.value.unitPrice || 0)
)

const bulkTotal = computed(() =>
  bulkSaleData.value.sales.reduce((total, sale) => 
    total + (sale.quantity * sale.unitPrice), 0
  )
)

// Methods
const openSaleDialog = () => {
  resetSaleForm()
  editMode.value = false
  showSaleDialog.value = true
  loadAvailableProducts()
}

const openBulkSaleDialog = () => {
  resetBulkSaleForm()
  showBulkSaleDialog.value = true
  loadAvailableProducts()
}

const closeSaleDialog = () => {
  showSaleDialog.value = false
  resetSaleForm()
}

const closeBulkSaleDialog = () => {
  showBulkSaleDialog.value = false
  resetBulkSaleForm()
}

const resetSaleForm = () => {
  saleData.value = {
    stockId: null,
    quantity: 1,
    unitPrice: 0,
    paymentMethod: '',
    customerName: '',
    customerPhone: '',
    notes: ''
  }
  selectedProduct.value = null
  errors.value = {}
  editingSaleId.value = null
}

const resetBulkSaleForm = () => {
  bulkSaleData.value = {
    stockId: null,
    sales: []
  }
}

const loadAvailableProducts = async () => {
  productsLoading.value = true
  try {
    // This would typically come from a stock/inventory service
    // For now, using mock data
    availableProducts.value = [
      {
        id: 1,
        productName: 'Product A',
        sku: 'SKU001',
        availableQuantity: 50,
        suggestedPrice: 25.99
      },
      {
        id: 2,
        productName: 'Product B',
        sku: 'SKU002',
        availableQuantity: 30,
        suggestedPrice: 15.50
      }
    ]
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Loading Failed',
      detail: 'Failed to load available products',
      life: 5000
    })
  } finally {
    productsLoading.value = false
  }
}

const onProductChange = () => {
  selectedProduct.value = availableProducts.value.find(
    product => product.id === saleData.value.stockId
  )
  
  if (selectedProduct.value) {
    saleData.value.unitPrice = selectedProduct.value.suggestedPrice || 0
  }
}

const onBulkProductChange = () => {
  const product = availableProducts.value.find(
    product => product.id === bulkSaleData.value.stockId
  )
  
  if (product) {
    // Add first sale entry
    bulkSaleData.value.sales = [{
      quantity: 1,
      unitPrice: product.suggestedPrice || 0,
      paymentMethod: 'cash'
    }]
  }
}

const addBulkSale = () => {
  const product = availableProducts.value.find(
    product => product.id === bulkSaleData.value.stockId
  )
  
  bulkSaleData.value.sales.push({
    quantity: 1,
    unitPrice: product?.suggestedPrice || 0,
    paymentMethod: 'cash'
  })
}

const removeBulkSale = (index) => {
  bulkSaleData.value.sales.splice(index, 1)
}

const onCellEditComplete = (event) => {
  const { data, newValue, field } = event
  data[field] = newValue
}

const validateSale = () => {
  errors.value = {}
  
  if (!saleData.value.stockId) {
    errors.value.stockId = 'Product selection is required'
  }
  
  if (!saleData.value.quantity || saleData.value.quantity < 1) {
    errors.value.quantity = 'Valid quantity is required'
  }
  
  if (!saleData.value.unitPrice || saleData.value.unitPrice <= 0) {
    errors.value.unitPrice = 'Valid unit price is required'
  }
  
  if (!saleData.value.paymentMethod) {
    errors.value.paymentMethod = 'Payment method is required'
  }
  
  return Object.keys(errors.value).length === 0
}

const submitSale = async () => {
  if (!validateSale()) return
  
  saleLoading.value = true
  
  try {
    const salePayload = {
      ...saleData.value,
      totalAmount: totalAmount.value,
      productName: selectedProduct.value?.productName,
      sku: selectedProduct.value?.sku
    }
    
    let result
    if (editMode.value) {
      result = await promoterStore.updateSale(props.activationId, editingSaleId.value, salePayload)
    } else {
      result = await promoterStore.recordSale(props.activationId, salePayload)
    }
    
    toast.add({
      severity: 'success',
      summary: 'Sale Recorded',
      detail: `Sale of $${totalAmount.value.toFixed(2)} recorded successfully`,
      life: 3000
    })
    
    closeSaleDialog()
    emit('sale-recorded', result)
    
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Sale Failed',
      detail: error.message || 'Failed to record sale',
      life: 5000
    })
  } finally {
    saleLoading.value = false
  }
}

const submitBulkSales = async () => {
  if (bulkSaleData.value.sales.length === 0) return
  
  saleLoading.value = true
  
  try {
    const product = availableProducts.value.find(
      product => product.id === bulkSaleData.value.stockId
    )
    
    const promises = bulkSaleData.value.sales.map(sale => {
      const salePayload = {
        stockId: bulkSaleData.value.stockId,
        quantity: sale.quantity,
        unitPrice: sale.unitPrice,
        paymentMethod: sale.paymentMethod,
        totalAmount: sale.quantity * sale.unitPrice,
        productName: product?.productName,
        sku: product?.sku,
        notes: 'Bulk sale entry'
      }
      
      return promoterStore.recordSale(props.activationId, salePayload)
    })
    
    await Promise.all(promises)
    
    toast.add({
      severity: 'success',
      summary: 'Bulk Sales Recorded',
      detail: `${bulkSaleData.value.sales.length} sales totaling $${bulkTotal.value.toFixed(2)} recorded`,
      life: 3000
    })
    
    closeBulkSaleDialog()
    emit('sale-recorded', { count: bulkSaleData.value.sales.length, total: bulkTotal.value })
    
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Bulk Sale Failed',
      detail: error.message || 'Failed to record bulk sales',
      life: 5000
    })
  } finally {
    saleLoading.value = false
  }
}

const editSale = (sale) => {
  saleData.value = {
    stockId: sale.stockId,
    quantity: sale.quantity,
    unitPrice: sale.unitPrice,
    paymentMethod: sale.paymentMethod,
    customerName: sale.customerName || '',
    customerPhone: sale.customerPhone || '',
    notes: sale.notes || ''
  }
  
  selectedProduct.value = availableProducts.value.find(
    product => product.id === sale.stockId
  )
  
  editMode.value = true
  editingSaleId.value = sale.id
  showSaleDialog.value = true
}

const formatTime = (timestamp) => {
  return format(new Date(timestamp), 'HH:mm')
}

const getPaymentMethodLabel = (value) => {
  const method = paymentMethods.find(m => m.value === value)
  return method?.label || value
}

// Lifecycle
onMounted(() => {
  // Load today's sales if not already loaded
  if (promoterStore.sales.length === 0) {
    promoterStore.fetchSales(props.activationId)
  }
})
</script>

<style scoped>
.promoter-sales {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-actions {
  display: flex;
  gap: 1rem;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-50);
  border-radius: 8px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.stat-icon.sales {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.count {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.average {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.sale-form .form-group {
  margin-bottom: 1.5rem;
}

.sale-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.sale-form label.required::after {
  content: ' *';
  color: var(--red-500);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.product-option {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-name {
  font-weight: 500;
}

.product-sku {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.product-stock {
  font-size: 0.875rem;
  color: var(--green-600);
}

.product-info {
  padding: 1rem;
  background: var(--surface-50);
  border-radius: 6px;
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  font-weight: 500;
  color: var(--text-color-secondary);
}

.info-row .value {
  color: var(--text-color);
}

.total-display {
  background: var(--surface-100);
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.total-display label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--green-600);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.bulk-sale-form .help-text {
  color: var(--text-color-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.bulk-sales-table {
  margin-top: 1rem;
}

.bulk-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-200);
}

.bulk-total {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--green-600);
}

@media (max-width: 768px) {
  .quick-actions {
    flex-direction: column;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .p-button {
    width: 100%;
  }
  
  .bulk-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}
</style>
.current-location,
.target-location {
padding: 1rem;
border: 1px solid #e5e7eb;
border-radius: 8px;
background: #f9fafb;
}

.current-location h4,
.target-location h4 {
margin: 0 0 1rem 0;
color: #1f2937;
}

.location-info {
display: flex;
flex-direction: column;
gap: 0.5rem;
}

.coordinates,
.address,
.accuracy,
.distance {
display: flex;
align-items: center;
gap: 0.5rem;
font-size: 0.875rem;
color: #6b7280;
}

.distance.within-range {
color: #10b981;
font-weight: 500;
}

.location-loading {
display: flex;
align-items: center;
gap: 0.5rem;
color: #6b7280;
}

.location-actions {
display: flex;
gap: 1rem;
justify-content: flex-end;
}

.checkin-dialog,
.checkout-dialog {
display: flex;
flex-direction: column;
gap: 1.5rem;
}

.dialog-section h4 {
margin: 0 0 1rem 0;
color: #1f2937;
}

.assignment-summary p {
margin: 0.5rem 0;
color: #374151;
}

.verification-status {
display: flex;
align-items: center;
gap: 0.5rem;
padding: 0.75rem;
border-radius: 6px;
background: #fef2f2;
color: #dc2626;
margin-bottom: 0.5rem;
}

.verification-status.verified {
background: #f0fdf4;
color: #16a34a;
}

.verification-note {
font-size: 0.875rem;
color: #6b7280;
margin: 0;
}

.session-summary p {
margin: 0.5rem 0;
color: #374151;
}

.summary-grid {
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 1rem;
}

.summary-item {
display: flex;
justify-content: space-between;
align-items: center;
padding: 0.75rem;
border: 1px solid #e5e7eb;
border-radius: 6px;
background: #f9fafb;
}

.summary-item .label {
font-size: 0.875rem;
color: #6b7280;
}

.summary-item .value {
font-weight: 600;
color: #1f2937;
}

.dialog-footer {
display: flex;
gap: 1rem;
justify-content: flex-end;
}

.history-card {
margin-top: 1.5rem;
}

.assignment-cell {
display: flex;
flex-direction: column;
gap: 0.25rem;
}

.assignment-name {
font-weight: 500;
color: #1f2937;
}

.assignment-client {
font-size: 0.75rem;
color: #6b7280;
}

.status-scheduled { background: #dbeafe; color: #1d4ed8; }
.status-progress { background: #fef3c7; color: #d97706; }
.status-completed { background: #dcfce7; color: #16a34a; }
.status-cancelled { background: #fecaca; color: #dc2626; }

@media (max-width: 768px) {
.checkin-checkout {
padding: 1rem;
}

.status-content {
flex-direction: column;
gap: 1rem;
text-align: center;
}

.assignment-item {
flex-direction: column;
gap: 1rem;
text-align: center;
}

.assignment-time {
margin-right: 0;
}

.assignment-actions {
margin-left: 0;
}

.location-content {
grid-template-columns: 1fr;
}

.location-actions {
flex-direction: column;
}

.summary-grid {
grid-template-columns: 1fr;
}

.dialog-footer {
flex-direction: column;
}
}
</style>

<!-- StockTracking.vue -->
<template>
  <div class="stock-tracking">
    <div class="tracking-header">
      <h2>Stock Tracking</h2>
      <p>Monitor and manage your allocated stock for this activation</p>
    </div>

    <!-- Stock Overview -->
    <div class="overview-grid">
      <Card class="overview-card">
        <template #content>
          <div class="overview-content">
            <div class="overview-icon total-allocated">
              <i class="pi pi-box"></i>
            </div>
            <div class="overview-info">
              <h3>Total Allocated</h3>
              <div class="overview-number">{{ totalAllocated }}</div>
              <small>{{ stockItems.length }} SKUs</small>
            </div>
          </div>
        </template>
      </Card>

      <Card class="overview-card">
        <template #content>
          <div class="overview-content">
            <div class="overview-icon total-sold">
              <i class="pi pi-shopping-cart"></i>
            </div>
            <div class="overview-info">
              <h3>Total Sold</h3>
              <div class="overview-number">{{ totalSold }}</div>
              <small>{{ salesPercentage }}% of allocation</small>
            </div>
          </div>
        </template>
      </Card>

      <Card class="overview-card">
        <template #content>
          <div class="overview-content">
            <div class="overview-icon samples-given">
              <i class="pi pi-gift"></i>
            </div>
            <div class="overview-info">
              <h3>Samples Given</h3>
              <div class="overview-number">{{ totalSamples }}</div>
              <small>Free samples distributed</small>
            </div>
          </div>
        </template>
      </Card>

      <Card class="overview-card">
        <template #content>
          <div class="overview-content">
            <div class="overview-icon remaining-stock">
              <i class="pi pi-warehouse"></i>
            </div>
            <div class="overview-info">
              <h3>Remaining</h3>
              <div class="overview-number">{{ totalRemaining }}</div>
              <small>{{ remainingPercentage }}% remaining</small>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Stock Items -->
    <Card class="stock-items-card">
      <template #header>
        <div class="card-header">
          <h3>Stock Items</h3>
          <div class="header-actions">
            <Button
                label="Request Replenishment"
                icon="pi pi-plus"
                class="p-button-outlined"
                @click="showReplenishmentDialog = true"
            />
            <Button
                label="Report Issue"
                icon="pi pi-exclamation-triangle"
                class="p-button-outlined p-button-warning"
                @click="showIssueDialog = true"
            />
          </div>
        </div>
      </template>
      <template #content>
        <div class="stock-grid">
          <div
              v-for="item in stockItems"
              :key="item.sku"
              class="stock-item"
              :class="{ 'low-stock': item.remaining < item.threshold }"
          >
            <div class="item-header">
              <div class="item-info">
                <h4>{{ item.name }}</h4>
                <span class="sku">{{ item.sku }}</span>
                <span class="unit-price">${{ item.unitPrice }}</span>
              </div>
              <div class="stock-status">
                <Tag
                    :value="getStockStatusLabel(item)"
                    :class="getStockStatusClass(item)"
                />
              </div>
            </div>

            <div class="stock-details">
              <div class="stock-row">
                <span class="label">Opening Stock:</span>
                <span class="value">{{ item.opening }}</span>
              </div>
              <div class="stock-row">
                <span class="label">Sold:</span>
                <span class="value sold">{{ item.sold }}</span>
              </div>
              <div class="stock-row">
                <span class="label">Samples:</span>
                <span class="value samples">{{ item.samples }}</span>
              </div>
              <div class="stock-row">
                <span class="label">Remaining:</span>
                <span class="value remaining">{{ item.remaining }}</span>
              </div>
            </div>

            <div class="stock-progress">
              <div class="progress-info">
                <span class="progress-label">Stock Used</span>
                <span class="progress-value">{{ getUsagePercentage(item) }}%</span>
              </div>
              <ProgressBar
                  :value="getUsagePercentage(item)"
                  :class="getProgressBarClass(item)"
              />
            </div>

            <div class="item-actions">
              <Button
                  label="Quick Sale"
                  icon="pi pi-shopping-cart"
                  class="p-button-sm"
                  @click="quickSale(item)"
              />
              <Button
                  label="Give Sample"
                  icon="pi pi-gift"
                  class="p-button-sm p-button-outlined"
                  @click="giveSample(item)"
              />
              <Button
                  label="Details"
                  icon="pi pi-info-circle"
                  class="p-button-sm p-button-text"
                  @click="showItemDetails(item)"
              />
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Stock Movements -->
    <Card class="movements-card">
      <template #header>
        <h3>Recent Stock Movements</h3>
      </template>
      <template #content>
        <DataTable
            :value="stockMovements"
            :paginator="true"
            :rows="10"
            responsiveLayout="stack"
            breakpoint="768px"
            :sortOrder="1"
            sortField="timestamp"
        >
          <Column field="timestamp" header="Time" style="width: 15%" sortable>
            <template #body="slotProps">
              {{ formatTime(slotProps.data.timestamp) }}
            </template>
          </Column>
          <Column field="type" header="Type" style="width: 15%">
            <template #body="slotProps">
              <Tag
                  :value="slotProps.data.type"
                  :class="getMovementTypeClass(slotProps.data.type)"
              />
            </template>
          </Column>
          <Column field="product" header="Product" style="width: 25%">
            <template #body="slotProps">
              <div class="product-info">
                <span class="product-name">{{ slotProps.data.product }}</span>
                <span class="product-sku">{{ slotProps.data.sku }}</span>
              </div>
            </template>
          </Column>
          <Column field="quantity" header="Quantity" style="width: 10%">
            <template #body="slotProps">
              <span :class="{ 'negative': slotProps.data.quantity < 0 }">
                {{ slotProps.data.quantity > 0 ? '+' : '' }}{{ slotProps.data.quantity }}
              </span>
            </template>
          </Column>
          <Column field="notes" header="Notes" style="width: 25%">
            <template #body="slotProps">
              {{ slotProps.data.notes || 'N/A' }}
            </template>
          </Column>
          <Column header="Actions" style="width: 10%">
            <template #body="slotProps">
              <Button
                  v-if="slotProps.data.canReverse"
                  icon="pi pi-undo"
                  class="p-button-rounded p-button-text p-button-sm"
                  @click="reverseMovement(slotProps.data.id)"
                  v-tooltip="'Reverse Movement'"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Replenishment Request Dialog -->
    <Dialog
        v-model:visible="showReplenishmentDialog"
        header="Request Stock Replenishment"
        :modal="true"
        :style="{ width: '500px' }"
    >
      <div class="replenishment-dialog">
        <div class="dialog-section">
          <h4>Select Items to Replenish</h4>
          <div class="replenishment-items">
            <div
                v-for="item in stockItems"
                :key="item.sku"
                class="replenishment-item"
            >
              <div class="item-check">
                <Checkbox
                    v-model="replenishmentRequest.items"
                    :inputId="item.sku"
                    :value="item.sku"
                />
                <label :for="item.sku" class="item-label">
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-stock">{{ item.remaining }} remaining</span>
                </label>
              </div>
              <div class="quantity-input">
                <InputNumber
                    v-model="replenishmentRequest.quantities[item.sku]"
                    :min="1"
                    :max="100"
                    placeholder="Qty"
                    :disabled="!replenishmentRequest.items.includes(item.sku)"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="dialog-section">
          <h4>Request Details</h4>
          <div class="form-group">
            <label for="priority">Priority</label>
            <SelectButton
                id="priority"
                v-model="replenishmentRequest.priority"
                :options="priorityOptions"
                optionLabel="label"
                optionValue="value"
            />
          </div>
          <div class="form-group">
            <label for="reason">Reason for Request</label>
            <Textarea
                id="reason"
                v-model="replenishmentRequest.reason"
                rows="3"
                placeholder="Why do you need this replenishment?"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
              label="Cancel"
              icon="pi pi-times"
              @click="showReplenishmentDialog = false"
              class="p-button-text"
          />
          <Button
              label="Submit Request"
              icon="pi pi-send"
              @click="submitReplenishmentRequest"
              :disabled="replenishmentRequest.items.length === 0"
              :loading="submittingRequest"
          />
        </div>
      </template>
    </Dialog>

    <!-- Issue Report Dialog -->
    <Dialog
        v-model:visible="showIssueDialog"
        header="Report Stock Issue"
        :modal="true"
        :style="{ width: '500px' }"
    >
      <div class="issue-dialog">
        <div class="dialog-section">
          <h4>Issue Details</h4>
          <div class="form-group">
            <label for="issueType">Issue Type</label>
            <Dropdown
                id="issueType"
                v-model="issueReport.type"
                :options="issueTypeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select issue type"
            />
          </div>
          <div class="form-group">
            <label for="affectedProduct">Affected Product</label>
            <Dropdown
                id="affectedProduct"
                v-model="issueReport.sku"
                :options="productOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select product"
            />
          </div>
          <div class="form-group">
            <label for="issueQuantity">Quantity Affected</label>
            <InputNumber
                id="issueQuantity"
                v-model="issueReport.quantity"
                :min="1"
                placeholder="Number of units"
            />
          </div>
        </div>

        <div class="dialog-section">
          <h4>Description</h4>
          <div class="form-group">
            <label for="issueDescription">Detailed Description</label>
            <Textarea
                id="issueDescription"
                v-model="issueReport.description"
                rows="4"
                placeholder="Describe the issue in detail..."
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
              label="Cancel"
              icon="pi pi-times"
              @click="showIssueDialog = false"
              class="p-button-text"
          />
          <Button
              label="Submit Report"
              icon="pi pi-send"
              @click="submitIssueReport"
              :disabled="!issueReport.type || !issueReport.description"
              :loading="submittingIssue"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

// Data
const showReplenishmentDialog = ref(false)
const showIssueDialog = ref(false)
const submittingRequest = ref(false)
const submittingIssue = ref(false)

const stockItems = ref([
  {
    sku: 'SKU-001',
    name: 'Premium Shampoo 500ml',
    unitPrice: 12.99,
    opening: 50,
    sold: 15,
    samples: 8,
    remaining: 27,
    threshold: 10
  },
  {
    sku: 'SKU-002',
    name: 'Conditioner 400ml',
    unitPrice: 10.99,
    opening: 40,
    sold: 12,
    samples: 6,
    remaining: 22,
    threshold: 10
  },
  {
    sku: 'SKU-003',
    name: 'Hair Mask 250ml',
    unitPrice: 15.99,
    opening: 30,
    sold: 8,
    samples: 4,
    remaining: 18,
    threshold: 8
  },
  {
    sku: 'SKU-004',
    name: 'Hair Oil 100ml',
    unitPrice: 8.99,
    opening: 25,
    sold: 18,
    samples: 5,
    remaining: 2,
    threshold: 5
  }
])

const stockMovements = ref([
  {
    id: 1,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    type: 'Sale',
    product: 'Premium Shampoo 500ml',
    sku: 'SKU-001',
    quantity: -2,
    notes: 'Customer purchase - Cash payment',
    canReverse: true
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    type: 'Sample',
    product: 'Conditioner 400ml',
    sku: 'SKU-002',
    quantity: -1,
    notes: 'Free sample given to potential customer',
    canReverse: false
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    type: 'Sale',
    product: 'Hair Mask 250ml',
    sku: 'SKU-003',
    quantity: -1,
    notes: 'Customer purchase - Ecocash payment',
    canReverse: true
  },
  {
    id: 4,
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    type: 'Adjustment',
    product: 'Hair Oil 100ml',
    sku: 'SKU-004',
    quantity: -3,
    notes: 'Damaged items reported',
    canReverse: false
  }
])

const replenishmentRequest = ref({
  items: [],
  quantities: {},
  priority: 'normal',
  reason: ''
})

const issueReport = ref({
  type: '',
  sku: '',
  quantity: 1,
  description: ''
})

const priorityOptions = ref([
  { label: 'Low', value: 'low' },
  { label: 'Normal', value: 'normal' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' }
])

const issueTypeOptions = ref([
  { label: 'Damaged Product', value: 'damaged' },
  { label: 'Expired Product', value: 'expired' },
  { label: 'Missing Items', value: 'missing' },
  { label: 'Quality Issue', value: 'quality' },
  { label: 'Packaging Problem', value: 'packaging' },
  { label: 'Other', value: 'other' }
])

// Computed
const productOptions = computed(() => {
  return stockItems.value.map(item => ({
    label: item.name,
    value: item.sku
  }))
})

const totalAllocated = computed(() => {
  return stockItems.value.reduce((sum, item) => sum + item.opening, 0)
})

const totalSold = computed(() => {
  return stockItems.value.reduce((sum, item) => sum + item.sold, 0)
})

const totalSamples = computed(() => {
  return stockItems.value.reduce((sum, item) => sum + item.samples, 0)
})

const totalRemaining = computed(() => {
  return stockItems.value.reduce((sum, item) => sum + item.remaining, 0)
})

const salesPercentage = computed(() => {
  if (totalAllocated.value === 0) return 0
  return Math.round((totalSold.value / totalAllocated.value) * 100)
})

const remainingPercentage = computed(() => {
  if (totalAllocated.value === 0) return 0
  return Math.round((totalRemaining.value / totalAllocated.value) * 100)
})

// Methods
const getStockStatusLabel = (item) => {
  if (item.remaining === 0) return 'Out of Stock'
  if (item.remaining < item.threshold) return 'Low Stock'
  return 'In Stock'
}

const getStockStatusClass = (item) => {
  if (item.remaining === 0) return 'status-out-of-stock'
  if (item.remaining < item.threshold) return 'status-low-stock'
  return 'status-in-stock'
}

const getUsagePercentage = (item) => {
  if (item.opening === 0) return 0
  return Math.round(((item.sold + item.samples) / item.opening) * 100)
}

const getProgressBarClass = (item) => {
  const percentage = getUsagePercentage(item)
  if (percentage >= 90) return 'progress-critical'
  if (percentage >= 70) return 'progress-warning'
  return 'progress-normal'
}

const getMovementTypeClass = (type) => {
  const classes = {
    'Sale': 'movement-sale',
    'Sample': 'movement-sample',
    'Adjustment': 'movement-adjustment',
    'Replenishment': 'movement-replenishment'
  }
  return classes[type] || 'movement-default'
}

const quickSale = (item) => {
  if (item.remaining <= 0) {
    toast.add({
      severity: 'error',
      summary: 'Out of Stock',
      detail: `${item.name} is out of stock`,
      life: 3000
    })
    return
  }

  // Simulate quick sale
  item.remaining -= 1
  item.sold += 1

  // Add movement record
  stockMovements.value.unshift({
    id: Date.now(),
    timestamp: new Date(),
    type: 'Sale',
    product: item.name,
    sku: item.sku,
    quantity: -1,
    notes: 'Quick sale from stock tracking',
    canReverse: true
  })

  toast.add({
    severity: 'success',
    summary: 'Sale Recorded',
    detail: `Sold 1 unit of ${item.name}`,
    life: 3000
  })
}

const giveSample = (item) => {
  if (item.remaining <= 0) {
    toast.add({
      severity: 'error',
      summary: 'Out of Stock',
      detail: `${item.name} is out of stock`,
      life: 3000
    })
    return
  }

  // Simulate sample distribution
  item.remaining -= 1
  item.samples += 1

  // Add movement record
  stockMovements.value.unshift({
    id: Date.now(),
    timestamp: new Date(),
    type: 'Sample',
    product: item.name,
    sku: item.sku,
    quantity: -1,
    notes: 'Free sample distributed',
    canReverse: false
  })

  toast.add({
    severity: 'info',
    summary: 'Sample Given',
    detail: `Gave 1 sample of ${item.name}`,
    life: 3000
  })
}

const showItemDetails = (item) => {
  toast.add({
    severity: 'info',
    summary: 'Item Details',
    detail: `Opening details for ${item.name}`,
    life: 2000
  })
}

const submitReplenishmentRequest = async () => {
  if (replenishmentRequest.value.items.length === 0) {
    toast.add({
      severity: 'error',
      summary: 'No Items Selected',
      detail: 'Please select at least one item to replenish',
      life: 3000
    })
    return
  }

  submittingRequest.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    toast.add({
      severity: 'success',
      summary: 'Request Submitted',
      detail: 'Replenishment request has been submitted successfully',
      life: 3000
    })

    showReplenishmentDialog.value = false

    // Reset form
    replenishmentRequest.value = {
      items: [],
      quantities: {},
      priority: 'normal',
      reason: ''
    }

  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Request Failed',
      detail: 'Failed to submit replenishment request',
      life: 3000
    })
  } finally {
    submittingRequest.value = false
  }
}

const submitIssueReport = async () => {
  submittingIssue.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    toast.add({
      severity: 'success',
      summary: 'Report Submitted',
      detail: 'Issue report has been submitted successfully',
      life: 3000
    })

    showIssueDialog.value = false

    // Reset form
    issueReport.value = {
      type: '',
      sku: '',
      quantity: 1,
      description: ''
    }

  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Report Failed',
      detail: 'Failed to submit issue report',
      life: 3000
    })
  } finally {
    submittingIssue.value = false
  }
}

const reverseMovement = (movementId) => {
  const movement = stockMovements.value.find(m => m.id === movementId)
  if (!movement) return

  const item = stockItems.value.find(i => i.sku === movement.sku)
  if (!item) return

  // Reverse the movement
  if (movement.type === 'Sale') {
    item.remaining += Math.abs(movement.quantity)
    item.sold -= Math.abs(movement.quantity)
  }

  // Remove the movement record
  const index = stockMovements.value.findIndex(m => m.id === movementId)
  stockMovements.value.splice(index, 1)

  toast.add({
    severity: 'info',
    summary: 'Movement Reversed',
    detail: `Reversed ${movement.type.toLowerCase()} of ${movement.product}`,
    life: 3000
  })
}

const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  // Initialize quantities for replenishment
  stockItems.value.forEach(item => {
    replenishmentRequest.value.quantities[item.sku] = 10
  })
})
</script>

<style scoped>
.stock-tracking {
  padding: 1.5rem;
}

.tracking-header {
  margin-bottom: 1.5rem;
}

.tracking-header h2 {
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.tracking-header p {
  color: #6b7280;
  margin: 0;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.overview-card {
  transition: transform 0.2s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
}

.overview-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.overview-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
<!-- PromoterSalesRecording.vue -->
<template>
<div class="sales-recording">
<div class="recording-header">
<h2>Sales Recording</h2>
<div class="activation-info">
<span class="activation-name">{{ activationName }}</span>
<span class="activation-date">{{ formatDate(new Date()) }}</span>
</div>
</div>

<!-- Stock Status Overview -->
<Card class="stock-overview">
<template #header>
<h3>Current Stock Status</h3>
</template>
<template #content>
<div class="stock-grid">
<div v-for="item in stockItems" :key="item.sku" class="stock-item">
<div class="item-info">
<h4>{{ item.name }}</h4>
<span class="sku">{{ item.sku }}</span>
</div>
<div class="stock-levels">
<div class="stock-number">
<span class="label">Available:</span>
<span class="value">{{ item.available }}</span>
</div>
<div class="stock-number">
<span class="label">Sold:</span>
<span class="value">{{ item.sold }}</span>
</div>
</div>
</div>
</div>
</template>
</Card>

<!-- Sales Entry Form -->
<Card class="sales-entry">
<template #header>
<h3>Record New Sale</h3>
</template>
<template #content>
<form @submit.prevent="recordSale" class="sale-form">
<div class="form-row">
<div class="form-group">
<label for="product">Product *</label>
<Dropdown
id="product"
v-model="saleForm.sku"
:options="productOptions"
optionLabel="label"
optionValue="value"
placeholder="Select product"
:class="{ 'p-invalid': errors.sku }"
/>
<small v-if="errors.sku" class="p-error">{{ errors.sku }}</small>
</div>

<div class="form-group">
<label for="quantity">Quantity *</label>
<InputNumber
id="quantity"
v-model="saleForm.quantity"
:min="1"
:max="getMaxQuantity(saleForm.sku)"
placeholder="Enter quantity"
:class="{ 'p-invalid': errors.quantity }"
/>
<small v-if="errors.quantity" class="p-error">{{ errors.quantity }}</small>
</div>
</div>

<div class="form-row">
<div class="form-group">
<label for="unitPrice">Unit Price</label>
<InputNumber
id="unitPrice"
v-model="saleForm.unitPrice"
mode="currency"
currency="USD"
locale="en-US"
:disabled="true"
/>
</div>

<div class="form-group">
<label for="totalAmount">Total Amount</label>
<InputNumber
id="totalAmount"
v-model="calculatedTotal"
mode="currency"
currency="USD"
locale="en-US"
:disabled="true"
/>
</div>
</div>

<div class="form-group">
<label for="paymentMethod">Payment Method *</label>
<div class="payment-options">
<div v-for="method in paymentMethods" :key="method.value" class="payment-option">
<RadioButton
v-model="saleForm.paymentMethod"
:inputId="method.value"
:value="method.value"
/>
<label :for="method.value" class="payment-label">
<i :class="method.icon"></i>
{{ method.label }}
</label>
</div>
</div>
<small v-if="errors.paymentMethod" class="p-error">{{ errors.paymentMethod }}</small>
</div>

<div class="form-group">
<label for="customerInfo">Customer Information (Optional)</label>
<Textarea
id="customerInfo"
v-model="saleForm.customerInfo"
rows="3"
placeholder="Any additional customer information..."
/>
</div>

<div class="form-actions">
<Button
type="submit"
label="Record Sale"
icon="pi pi-check"
:loading="recording"
:disabled="!isFormValid"
/>
<Button
type="button"
label="Clear Form"
icon="pi pi-times"
class="p-button-secondary"
@click="clearForm"
/>
</div>
</form>
</template>
</Card>

<!-- Recent Sales -->
<Card class="recent-sales">
<template #header>
<div class="header-with-actions">
<h3>Today's Sales</h3>
<div class="sales-summary">
<span class="summary-item">
<i class="pi pi-shopping-cart"></i>
{{ totalSales }} units
</span>
<span class="summary-item">
<i class="pi pi-dollar"></i>
${{ totalRevenue }}
</span>
</div>
</div>
</template>
<template #content>
<DataTable
 :value="recentSales"
:paginator="true"
:rows="10"
responsiveLayout="stack"
breakpoint="768px"
class="sales-table"
>
<Column field="time" header="Time" style="width: 15%">
<template #body="slotProps">
                           {{ formatTime(slotProps.data.time) }}
</template>
</Column>
<Column field="product" header="Product" style="width: 30%">
<template #body="slotProps">
<div class="product-cell">
<span class="product-name">{{ slotProps.data.product }}</span>
<span class="product-sku">{{ slotProps.data.sku }}</span>
</div>
</template>
</Column>
<Column field="quantity" header="Qty" style="width: 10%">
<template #body="slotProps">
<Badge :value="slotProps.data.quantity" />
</template>
</Column>
<Column field="amount" header="Amount" style="width: 15%">
<template #body="slotProps">
<span class="amount">${{ slotProps.data.amount }}</span>
</template>
</Column>
<Column field="paymentMethod" header="Payment" style="width: 20%">
<template #body="slotProps">
<Tag :value="slotProps.data.paymentMethod" :class="getPaymentMethodClass(slotProps.data.paymentMethod)" />
</template>
</Column>
<Column header="Actions" style="width: 10%">
<template #body="slotProps">
<Button
 icon="pi pi-times"
class="p-button-rounded p-button-danger p-button-text p-button-sm"
@click="cancelSale(slotProps.data.id)"
v-tooltip="'Cancel Sale'"
/>
</template>
</Column>
</DataTable>
</template>
</Card>
</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

// Data
const activationName = ref('Summer Campaign 2024')
const recording = ref(false)
const errors = ref({})

const saleForm = ref({
  sku: '',
  quantity: 1,
  unitPrice: 0,
  paymentMethod: '',
  customerInfo: ''
})

const stockItems = ref([
                       { sku: 'SKU-001', name: 'Premium Shampoo 500ml', available: 45, sold: 25 },
{ sku: 'SKU-002', name: 'Conditioner 400ml', available: 30, sold: 20 },
{ sku: 'SKU-003', name: 'Hair Mask 250ml', available: 15, sold: 10 }
])

const productOptions = ref([
                           { label: 'Premium Shampoo 500ml', value: 'SKU-001', price: 12.99 },
{ label: 'Conditioner 400ml', value: 'SKU-002', price: 10.99 },
{ label: 'Hair Mask 250ml', value: 'SKU-003', price: 15.99 }
])

const paymentMethods = ref([
                           { label: 'USD Cash', value: 'USD', icon: 'pi pi-money-bill' },
{ label: 'ZWL Cash', value: 'ZWL', icon: 'pi pi-money-bill' },
{ label: 'Ecocash', value: 'ECOCASH', icon: 'pi pi-mobile' },
{ label: 'Card/Swipe', value: 'CARD', icon: 'pi pi-credit-card' }
])

const recentSales = ref([
                        {
                          id: 1,
                          time: new Date(Date.now() - 1000 * 60 * 30),
                          product: 'Premium Shampoo 500ml',
                          sku: 'SKU-001',
                          quantity: 2,
                          amount: 25.98,
                          paymentMethod: 'USD'
                        },
{
  id: 2,
  time: new Date(Date.now() - 1000 * 60 * 60),
  product: 'Conditioner 400ml',
  sku: 'SKU-002',
  quantity: 1,
  amount: 10.99,
  paymentMethod: 'ECOCASH'
}
])

// Computed
const calculatedTotal = computed(() => {
                                       return saleForm.value.quantity * saleForm.value.unitPrice
                                     })

const totalSales = computed(() => {
                                  return recentSales.value.reduce((sum, sale) => sum + sale.quantity, 0)
                                })

const totalRevenue = computed(() => {
                                    return recentSales.value.reduce((sum, sale) => sum + sale.amount, 0)
                                  })

const isFormValid = computed(() => {
                                   return saleForm.value.sku &&
                                   saleForm.value.quantity > 0 &&
  saleForm.value.paymentMethod &&
  Object.keys(errors.value).length === 0
                                 })

// Methods
const getMaxQuantity = (sku) => {
                                const item = stockItems.value.find(item => item.sku === sku)
                              return item ? item.available : 0
                              }

const validateForm = () => {
                           errors.value = {}

                           if (!saleForm.value.sku) {
                           errors.value.sku = 'Product is required'
                         }

                           if (!saleForm.value.quantity || saleForm.value.quantity <= 0) {
                           errors.value.quantity = 'Quantity must be greater than 0'
                         } else if (saleForm.value.quantity > getMaxQuantity(saleForm.value.sku)) {
                           errors.value.quantity = 'Quantity exceeds available stock'
                         }

                           if (!saleForm.value.paymentMethod) {
                           errors.value.paymentMethod = 'Payment method is required'
                         }

                           return Object.keys(errors.value).length === 0
                         }

const recordSale = async () => {
                               if (!validateForm()) {
                               return
                             }

                               recording.value = true

                             try {
                               // Simulate API call
                               await new Promise(resolve => setTimeout(resolve, 1000))

                                   // Add to recent sales
                               const newSale = {
                               id: Date.now(),
                               time: new Date(),
                               product: productOptions.value.find(p => p.value === saleForm.value.sku)?.label,
                               sku: saleForm.value.sku,
                               quantity: saleForm.value.quantity,
                               amount: calculatedTotal.value,
                               paymentMethod: saleForm.value.paymentMethod
                             }

                               recentSales.value.unshift(newSale)

                               // Update stock
                             const stockItem = stockItems.value.find(item => item.sku === saleForm.value.sku)
                             if (stockItem) {
                               stockItem.available -= saleForm.value.quantity
  stockItem.sold += saleForm.value.quantity
                             }

                               toast.add({
                               severity: 'success',
                               summary: 'Sale Recorded',
                               detail: `Successfully recorded sale of ${saleForm.value.quantity} units`,
                               life: 3000
                             })

                             clearForm()

                             } catch (error) {
                               toast.add({
                               severity: 'error',
                               summary: 'Error',
                               detail: 'Failed to record sale. Please try again.',
                               life: 3000
                             })
                             } finally {
                                 recording.value = false
                               }
                             }

const clearForm = () => {
                        saleForm.value = {
                        sku: '',
                        quantity: 1,
                        unitPrice: 0,
                        paymentMethod: '',
                        customerInfo: ''
                      }
                        errors.value = {}
                      }

const cancelSale = (saleId) => {
                               // In real implementation, this would call API to cancel sale
                               const saleIndex = recentSales.value.findIndex(sale => sale.id === saleId)
                             if (saleIndex !== -1) {
                               const sale = recentSales.value[saleIndex]

                               // Restore stock
                             const stockItem = stockItems.value.find(item => item.sku === sale.sku)
                             if (stockItem) {
                               stockItem.available += sale.quantity
                             stockItem.sold -= sale.quantity
                             }

                               recentSales.value.splice(saleIndex, 1)

                             toast.add({
                               severity: 'info',
                               summary: 'Sale Cancelled',
                               detail: 'Sale has been cancelled and stock restored',
                               life: 3000
                             })
                             }
                             }

const formatDate = (date) => {
                             return date.toLocaleDateString('en-US', {
                             weekday: 'long',
                             year: 'numeric',
                             month: 'long',
                             day: 'numeric'
                           })
                           }

const formatTime = (date) => {
                             return date.toLocaleTimeString('en-US', {
                             hour: '2-digit',
                             minute: '2-digit'
                           })
                           }

const getPaymentMethodClass = (method) => {
                                          const classes = {
                                        'USD': 'payment-usd',
                                        'ZWL': 'payment-zwl',
                                        'ECOCASH': 'payment-ecocash',
                                        'CARD': 'payment-card'
                                        }
                                          return classes[method] || 'payment-default'
                                        }

// Watch for product selection to update price
watch(() => saleForm.value.sku, (newSku) => {
                                            const product = productOptions.value.find(p => p.value === newSku)
                                          if (product) {
                                            saleForm.value.unitPrice = product.price
                                          }
                                          })

onMounted(() => {
                // Initialize component
              })
</script>

<style scoped>
 .sales-recording {
   padding: 1.5rem;
 }

.recording-header {
  margin-bottom: 1.5rem;
}

.recording-header h2 {
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.activation-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.activation-name {
  font-weight: 500;
  color: #3b82f6;
}

.activation-date {
  color: #6b7280;
  font-size: 0.875rem;
}

.stock-overview {
  margin-bottom: 1.5rem;
}

.stock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.stock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.item-info h4 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
  font-size: 1rem;
}

.sku {
  font-size: 0.75rem;
  color: #6b7280;
  font-family: monospace;
  background: #e5e7eb;
  padding: 0.125rem 0.25rem;
  border-radius: 4px;
}

.stock-levels {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stock-number {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stock-number .label {
  font-size: 0.875rem;
  color: #6b7280;
}

.stock-number .value {
  font-weight: 600;
  color: #1f2937;
}

.sales-entry {
  margin-bottom: 1.5rem;
}

.sale-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.payment-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.payment-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.payment-label:hover {
  background: #f3f4f6;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.header-with-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sales-summary {
  display: flex;
  gap: 1rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.summary-item i {
  color: #3b82f6;
}

.sales-table {
  margin-top: 1rem;
}

.product-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-name {
  font-weight: 500;
  color: #1f2937;
}

.product-sku {
  font-size: 0.75rem;
  color: #6b7280;
  font-family: monospace;
}

.amount {
  font-weight: 600;
  color: #059669;
}

.payment-usd { background: #dcfce7; color: #166534; }
.payment-zwl { background: #fef3c7; color: #92400e; }
.payment-ecocash { background: #dbeafe; color: #1e40af; }
.payment-card { background: #f3e8ff; color: #7c3aed; }

@media (max-width: 768px) {
  .sales-recording {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .payment-options {
    grid-template-columns: 1fr;
  }

  .stock-grid {
    grid-template-columns: 1fr;
  }

  .header-with-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>

<!-- CustomerEngagementForm.vue -->
<template>
  <div class="customer-engagement">
    <div class="engagement-header">
      <h2>Customer Engagement</h2>
      <p>Record customer interactions and collect valuable insights</p>
    </div>

    <form @submit.prevent="submitEngagement" class="engagement-form">
      <!-- Customer Demographics -->
      <Card class="form-section">
        <template #header>
          <h3>Customer Demographics</h3>
        </template>
        <template #content>
          <div class="form-row">
            <div class="form-group">
              <label for="gender">Gender *</label>
              <SelectButton
                  id="gender"
                  v-model="engagementForm.gender"
                  :options="genderOptions"
                  optionLabel="label"
                  optionValue="value"
                  :class="{ 'p-invalid': errors.gender }"
              />
              <small v-if="errors.gender" class="p-error">{{ errors.gender }}</small>
            </div>

            <div class="form-group">
              <label for="ageGroup">Age Group *</label>
              <Dropdown
                  id="ageGroup"
                  v-model="engagementForm.ageGroup"
                  :options="ageGroupOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select age group"
                  :class="{ 'p-invalid': errors.ageGroup }"
              />
              <small v-if="errors.ageGroup" class="p-error">{{ errors.ageGroup }}</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="customerType">Customer Type *</label>
              <Dropdown
                  id="customerType"
                  v-model="engagementForm.customerType"
                  :options="customerTypeOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select customer type"
                  :class="{ 'p-invalid': errors.customerType }"
              />
              <small v-if="errors.customerType" class="p-error">{{ errors.customerType }}</small>
            </div>

            <div class="form-group">
              <label for="location">Location</label>
              <InputText
                  id="location"
                  v-model="engagementForm.location"
                  placeholder="Area/District"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Product Awareness -->
      <Card class="form-section">
        <template #header>
          <h3>Product Awareness</h3>
        </template>
        <template #content>
          <div class="form-row">
            <div class="form-group">
              <label for="brandAwareness">Brand Awareness *</label>
              <SelectButton
                  id="brandAwareness"
                  v-model="engagementForm.brandAwareness"
                  :options="awarenessOptions"
                  optionLabel="label"
                  optionValue="value"
                  :class="{ 'p-invalid': errors.brandAwareness }"
              />
              <small v-if="errors.brandAwareness" class="p-error">{{ errors.brandAwareness }}</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="previousPurchase">Previous Purchase</label>
              <SelectButton
                  id="previousPurchase"
                  v-model="engagementForm.previousPurchase"
                  :options="yesNoOptions"
                  optionLabel="label"
                  optionValue="value"
              />
            </div>

            <div class="form-group">
              <label for="purchaseFrequency">Purchase Frequency</label>
              <Dropdown
                  id="purchaseFrequency"
                  v-model="engagementForm.purchaseFrequency"
                  :options="frequencyOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select frequency"
                  :disabled="!engagementForm.previousPurchase"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Engagement Details -->
      <Card class="form-section">
        <template #header>
          <h3>Engagement Details</h3>
        </template>
        <template #content>
          <div class="form-row">
            <div class="form-group">
              <label for="interestLevel">Interest Level *</label>
              <div class="rating-container">
                <Rating
                    id="interestLevel"
                    v-model="engagementForm.interestLevel"
                    :stars="5"
                    :cancel="false"
                    :class="{ 'p-invalid': errors.interestLevel }"
                />
                <span class="rating-label">{{ getRatingLabel(engagementForm.interestLevel) }}</span>
              </div>
              <small v-if="errors.interestLevel" class="p-error">{{ errors.interestLevel }}</small>
            </div>

            <div class="form-group">
              <label for="interactionDuration">Interaction Duration (minutes)</label>
              <InputNumber
                  id="interactionDuration"
                  v-model="engagementForm.interactionDuration"
                  :min="1"
                  :max="60"
                  placeholder="Duration in minutes"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="primaryConcerns">Primary Concerns/Questions</label>
            <MultiSelect
                id="primaryConcerns"
                v-model="engagementForm.primaryConcerns"
                :options="concernOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select concerns"
                :maxSelectedLabels="3"
                :filter="true"
            />
          </div>

          <div class="form-group">
            <label for="productInterest">Products of Interest</label>
            <MultiSelect
                id="productInterest"
                v-model="engagementForm.productInterest"
                :options="productOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select products"
                :maxSelectedLabels="3"
            />
          </div>
        </template>
      </Card>

      <!-- Purchase Intent -->
      <Card class="form-section">
        <template #header>
          <h3>Purchase Intent</h3>
        </template>
        <template #content>
          <div class="form-row">
            <div class="form-group">
              <label for="purchaseIntent">Likelihood to Purchase *</label>
              <div class="rating-container">
                <Rating
                    id="purchaseIntent"
                    v-model="engagementForm.purchaseIntent"
                    :stars="5"
                    :cancel="false"
                    :class="{ 'p-invalid': errors.purchaseIntent }"
                />
                <span class="rating-label">{{ getPurchaseIntentLabel(engagementForm.purchaseIntent) }}</span>
              </div>
              <small v-if="errors.purchaseIntent" class="p-error">{{ errors.purchaseIntent }}</small>
            </div>

            <div class="form-group">
              <label for="purchaseTimeframe">Purchase Timeframe</label>
              <Dropdown
                  id="purchaseTimeframe"
                  v-model="engagementForm.purchaseTimeframe"
                  :options="timeframeOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select timeframe"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="purchaseDrivers">Purchase Drivers</label>
              <MultiSelect
                  id="purchaseDrivers"
                  v-model="engagementForm.purchaseDrivers"
                  :options="driverOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select drivers"
                  :maxSelectedLabels="3"
              />
            </div>

            <div class="form-group">
              <label for="purchaseBarriers">Purchase Barriers</label>
              <MultiSelect
                  id="purchaseBarriers"
                  v-model="engagementForm.purchaseBarriers"
                  :options="barrierOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select barriers"
                  :maxSelectedLabels="3"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Contact Information -->
      <Card class="form-section">
        <template #header>
          <h3>Contact Information</h3>
        </template>
        <template #content>
          <div class="form-row">
            <div class="form-group">
              <label for="whatsappOptIn">WhatsApp Marketing Opt-in</label>
              <div class="checkbox-container">
                <Checkbox
                    id="whatsappOptIn"
                    v-model="engagementForm.whatsappOptIn"
                    :binary="true"
                />
                <label for="whatsappOptIn" class="checkbox-label">
                  Customer agrees to receive marketing messages via WhatsApp
                </label>
              </div>
            </div>
          </div>

          <div v-if="engagementForm.whatsappOptIn" class="form-row">
            <div class="form-group">
              <label for="whatsappNumber">WhatsApp Number</label>
              <InputText
                  id="whatsappNumber"
                  v-model="engagementForm.whatsappNumber"
                  placeholder="+263 XX XXX XXXX"
              />
            </div>

            <div class="form-group">
              <label for="preferredName">Preferred Name</label>
              <InputText
                  id="preferredName"
                  v-model="engagementForm.preferredName"
                  placeholder="How should we address them?"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Additional Notes -->
      <Card class="form-section">
        <template #header>
          <h3>Additional Notes</h3>
        </template>
        <template #content>
          <div class="form-group">
            <label for="customerFeedback">Customer Feedback</label>
            <Textarea
                id="customerFeedback"
                v-model="engagementForm.customerFeedback"
                rows="4"
                placeholder="Any specific feedback or comments from the customer..."
            />
          </div>

          <div class="form-group">
            <label for="promoterNotes">Promoter Notes</label>
            <Textarea
                id="promoterNotes"
                v-model="engagementForm.promoterNotes"
                rows="3"
                placeholder="Your observations and notes about this interaction..."
            />
          </div>
        </template>
      </Card>

      <!-- Form Actions -->
      <div class="form-actions">
        <Button
            type="submit"
            label="Submit Engagement"
            icon="pi pi-check"
            :loading="submitting"
            :disabled="!isFormValid"
        />
        <Button
            type="button"
            label="Save as Draft"
            icon="pi pi-save"
            class="p-button-secondary"
            @click="saveDraft"
        />
        <Button
            type="button"
            label="Clear Form"
            icon="pi pi-times"
            class="p-button-outlined"
            @click="clearForm"
        />
      </div>
    </form>

    <!-- Recent Engagements -->
    <Card class="recent-engagements">
      <template #header>
        <h3>Recent Engagements</h3>
      </template>
      <template #content>
        <DataTable
            :value="recentEngagements"
            :paginator="true"
            :rows="5"
            responsiveLayout="stack"
            breakpoint="768px"
        >
          <Column field="time" header="Time" style="width: 15%">
            <template #body="slotProps">
              {{ formatTime(slotProps.data.time) }}
            </template>
          </Column>
          <Column field="demographics" header="Customer" style="width: 25%">
            <template #body="slotProps">
              <div class="customer-info">
                <span class="demographics">{{ slotProps.data.gender }}, {{ slotProps.data.ageGroup }}</span>
                <span class="customer-type">{{ slotProps.data.customerType }}</span>
              </div>
            </template>
          </Column>
          <Column field="interestLevel" header="Interest" style="width: 20%">
            <template #body="slotProps">
              <Rating :modelValue="slotProps.data.interestLevel" :readonly="true" :cancel="false" />
            </template>
          </Column>
          <Column field="purchaseIntent" header="Purchase Intent" style="width: 20%">
            <template #body="slotProps">
              <Rating :modelValue="slotProps.data.purchaseIntent" :readonly="true" :cancel="false" />
            </template>
          </Column>
          <Column field="whatsappOptIn" header="WhatsApp" style="width: 10%">
            <template #body="slotProps">
              <i v-if="slotProps.data.whatsappOptIn" class="pi pi-check-circle" style="color: #10b981;"></i>
              <i v-else class="pi pi-times-circle" style="color: #ef4444;"></i>
            </template>
          </Column>
          <Column header="Actions" style="width: 10%">
            <template #body="slotProps">
              <Button
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-text p-button-sm"
                  @click="viewEngagement(slotProps.data.id)"
                  v-tooltip="'View Details'"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

// Data
const submitting = ref(false)
const errors = ref({})

const engagementForm = ref({
  gender: '',
  ageGroup: '',
  customerType: '',
  location: '',
  brandAwareness: '',
  previousPurchase: false,
  purchaseFrequency: '',
  interestLevel: 0,
  interactionDuration: 5,
  primaryConcerns: [],
  productInterest: [],
  purchaseIntent: 0,
  purchaseTimeframe: '',
  purchaseDrivers: [],
  purchaseBarriers: [],
  whatsappOptIn: false,
  whatsappNumber: '',
  preferredName: '',
  customerFeedback: '',
  promoterNotes: ''
})

// Options
const genderOptions = ref([
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' }
])

const ageGroupOptions = ref([
  { label: '18-24', value: '18-24' },
  { label: '25-34', value: '25-34' },
  { label: '35-44', value: '35-44' },
  { label: '45-54', value: '45-54' },
  { label: '55+', value: '55+' }
])

const customerTypeOptions = ref([
  { label: 'Individual Shopper', value: 'shopper' },
  { label: 'Retailer', value: 'retailer' },
  { label: 'Wholesaler', value: 'wholesaler' },
  { label: 'Salon Owner', value: 'salon_owner' },
  { label: 'Beauty Professional', value: 'beauty_professional' }
])

const awarenessOptions = ref([
  { label: 'Never Heard', value: 'never_heard' },
  { label: 'Heard Of', value: 'heard_of' },
  { label: 'Familiar', value: 'familiar' },
  { label: 'Very Familiar', value: 'very_familiar' }
])

const yesNoOptions = ref([
  { label: 'Yes', value: true },
  { label: 'No', value: false }
])

const frequencyOptions = ref([
  { label: 'First Time', value: 'first_time' },
  { label: 'Rarely', value: 'rarely' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Regular Customer', value: 'regular' }
])

const concernOptions = ref([
  { label: 'Price', value: 'price' },
  { label: 'Quality', value: 'quality' },
  { label: 'Availability', value: 'availability' },
  { label: 'Usage Instructions', value: 'usage' },
  { label: 'Ingredients', value: 'ingredients' },
  { label: 'Suitability', value: 'suitability' },
  { label: 'Side Effects', value: 'side_effects' }
])

const productOptions = ref([
  { label: 'Premium Shampoo', value: 'SKU-001' },
  { label: 'Conditioner', value: 'SKU-002' },
  { label: 'Hair Mask', value: 'SKU-003' },
  { label: 'Hair Oil', value: 'SKU-004' }
])

const timeframeOptions = ref([
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'this_week' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Next Month', value: 'next_month' },
  { label: 'Not Sure', value: 'not_sure' }
])

const driverOptions = ref([
  { label: 'Price/Promotion', value: 'price' },
  { label: 'Quality', value: 'quality' },
  { label: 'Brand Reputation', value: 'brand' },
  { label: 'Recommendation', value: 'recommendation' },
  { label: 'Convenience', value: 'convenience' },
  { label: 'Curiosity', value: 'curiosity' }
])

const barrierOptions = ref([
  { label: 'Price Too High', value: 'price' },
  { label: 'Not Convinced', value: 'not_convinced' },
  { label: 'Need to Research', value: 'research' },
  { label: 'Already Have Product', value: 'already_have' },
  { label: 'Wrong Timing', value: 'timing' },
  { label: 'Budget Constraints', value: 'budget' }
])

const recentEngagements = ref([
  {
    id: 1,
    time: new Date(Date.now() - 1000 * 60 * 15),
    gender: 'Female',
    ageGroup: '25-34',
    customerType: 'Individual Shopper',
    interestLevel: 4,
    purchaseIntent: 3,
    whatsappOptIn: true
  },
  {
    id: 2,
    time: new Date(Date.now() - 1000 * 60 * 45),
    gender: 'Male',
    ageGroup: '35-44',
    customerType: 'Retailer',
    interestLevel: 5,
    purchaseIntent: 4,
    whatsappOptIn: false
  }
])

// Computed
const isFormValid = computed(() => {
  return engagementForm.value.gender &&
      engagementForm.value.ageGroup &&
      engagementForm.value.customerType &&
      engagementForm.value.brandAwareness &&
      engagementForm.value.interestLevel > 0 &&
      engagementForm.value.purchaseIntent > 0 &&
      Object.keys(errors.value).length === 0
})

// Methods
const getRatingLabel = (rating) => {
  const labels = {
    1: 'Very Low',
    2: 'Low',
    3: 'Medium',
    4: 'High',
    5: 'Very High'
  }
  return labels[rating] || 'Not Rated'
}

const getPurchaseIntentLabel = (rating) => {
  const labels = {
    1: 'Very Unlikely',
    2: 'Unlikely',
    3: 'Neutral',
    4: 'Likely',
    5: 'Very Likely'
  }
  return labels[rating] || 'Not Rated'
}

const validateForm = () => {
  errors.value = {}

  if (!engagementForm.value.gender) {
    errors.value.gender = 'Gender is required'
  }

  if (!engagementForm.value.ageGroup) {
    errors.value.ageGroup = 'Age group is required'
  }

  if (!engagementForm.value.customerType) {
    errors.value.customerType = 'Customer type is required'
  }

  if (!engagementForm.value.brandAwareness) {
    errors.value.brandAwareness = 'Brand awareness is required'
  }

  if (!engagementForm.value.interestLevel) {
    errors.value.interestLevel = 'Interest level is required'
  }

  if (!engagementForm.value.purchaseIntent) {
    errors.value.purchaseIntent = 'Purchase intent is required'
  }

  return Object.keys(errors.value).length === 0
}

const submitEngagement = async () => {
  if (!validateForm()) {
    return
  }

  submitting.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Add to recent engagements
    const newEngagement = {
      id: Date.now(),
      time: new Date(),
      gender: engagementForm.value.gender,
      ageGroup: engagementForm.value.ageGroup,
      customerType: engagementForm.value.customerType,
      interestLevel: engagementForm.value.interestLevel,
      purchaseIntent: engagementForm.value.purchaseIntent,
      whatsappOptIn: engagementForm.value.whatsappOptIn
    }

    recentEngagements.value.unshift(newEngagement)

    toast.add({
      severity: 'success',
      summary: 'Engagement Recorded',
      detail: 'Customer engagement has been successfully recorded',
      life: 3000
    })

    clearForm()

  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to record engagement. Please try again.',
      life: 3000
    })
  } finally {
    submitting.value = false
  }
}

const saveDraft = () => {
  // Save form data to local storage or backend
  localStorage.setItem('engagementDraft', JSON.stringify(engagementForm.value))

  toast.add({
    severity: 'info',
    summary: 'Draft Saved',
    detail: 'Your engagement data has been saved as draft',
    life: 3000
  })
}

const clearForm = () => {
  engagementForm.value = {
    gender: '',
    ageGroup: '',
    customerType: '',
    location: '',
    brandAwareness: '',
    previousPurchase: false,
    purchaseFrequency: '',
    interestLevel: 0,
    interactionDuration: 5,
    primaryConcerns: [],
    productInterest: [],
    purchaseIntent: 0,
    purchaseTimeframe: '',
    purchaseDrivers: [],
    purchaseBarriers: [],
    whatsappOptIn: false,
    whatsappNumber: '',
    preferredName: '',
    customerFeedback: '',
    promoterNotes: ''
  }
  errors.value = {}
}

const viewEngagement = (id) => {
  // Navigate to engagement details view
  toast.add({
    severity: 'info',
    summary: 'View Engagement',
    detail: `Opening engagement details for ID: ${id}`,
    life: 2000
  })
}

const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  // Load draft if exists
  const draft = localStorage.getItem('engagementDraft')
  if (draft) {
    try {
      const parsedDraft = JSON.parse(draft)
      engagementForm.value = { ...engagementForm.value, ...parsedDraft }
    } catch (error) {
      console.error('Error loading draft:', error)
    }
  }
})
</script>

<style scoped>
.customer-engagement {
  padding: 1.5rem;
}

.engagement-header {
  margin-bottom: 1.5rem;
}

.engagement-header h2 {
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.engagement-header p {
  color: #6b7280;
  margin: 0;
}

.engagement-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  margin-bottom: 1.5rem;
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

.rating-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rating-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-label {
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.recent-engagements {
  margin-top: 2rem;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.demographics {
  font-weight: 500;
  color: #1f2937;
}

.customer-type {
  font-size: 0.75rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .customer-engagement {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .rating-container {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

<!-- PromoterCheckInOut.vue -->
<template>
  <div class="checkin-checkout">
    <div class="checkin-header">
      <h2>Check In/Out</h2>
      <p>Track your attendance and location for activations</p>
    </div>

    <!-- Current Status -->
    <Card class="status-card">
      <template #content>
        <div class="status-content">
          <div class="status-info">
            <div class="status-indicator" :class="currentStatus.class">
              <i :class="currentStatus.icon"></i>
            </div>
            <div class="status-details">
              <h3>{{ currentStatus.title }}</h3>
              <p>{{ currentStatus.description }}</p>
              <small v-if="currentActivation">
                {{ currentActivation.name }} at {{ currentActivation.location }}
              </small>
            </div>
          </div>
          <div class="status-actions">
            <Button
                v-if="!isCheckedIn"
                @click="showCheckInDialog = true"
                label="Check In"
                icon="pi pi-sign-in"
                class="p-button-success"
                :disabled="!hasActiveAssignment"
            />
            <Button
                v-else
                @click="showCheckOutDialog = true"
                label="Check Out"
                icon="pi pi-sign-out"
                class="p-button-warning"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Today's Assignments -->
    <Card class="assignments-card">
      <template #header>
        <h3>Today's Assignments</h3>
      </template>
      <template #content>
        <div v-if="todayAssignments.length === 0" class="no-assignments">
          <i class="pi pi-calendar-times"></i>
          <p>No assignments for today</p>
        </div>
        <div v-else class="assignments-list">
          <div
              v-for="assignment in todayAssignments"
              :key="assignment.id"
              class="assignment-item"
              :class="{ 'active': assignment.id === currentActivation?.id }"
          >
            <div class="assignment-time">
              <span class="time">{{ assignment.startTime }}</span>
              <span class="duration">{{ assignment.duration }}h</span>
            </div>
            <div class="assignment-details">
              <h4>{{ assignment.name }}</h4>
              <p class="location">
                <i class="pi pi-map-marker"></i>
                {{ assignment.location }}
              </p>
              <p class="client">{{ assignment.client }}</p>
              <div class="assignment-status">
                <Tag
                    :value="assignment.status"
                    :class="getStatusClass(assignment.status)"
                />
              </div>
            </div>
            <div class="assignment-actions">
              <Button
                  v-if="assignment.status === 'scheduled'"
                  @click="selectAssignment(assignment)"
                  label="Select"
                  icon="pi pi-arrow-right"
                  class="p-button-sm p-button-outlined"
              />
              <Button
                  v-else-if="assignment.status === 'in-progress'"
                  @click="viewAssignment(assignment)"
                  label="View"
                  icon="pi pi-eye"
                  class="p-button-sm p-button-outlined"
              />
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Location Verification -->
    <Card class="location-card">
      <template #header>
        <h3>Location Verification</h3>
      </template>
      <template #content>
        <div class="location-content">
          <div class="current-location">
            <h4>Current Location</h4>
            <div v-if="currentLocation" class="location-info">
              <div class="coordinates">
                <i class="pi pi-map-marker"></i>
                <span>{{ currentLocation.latitude }}, {{ currentLocation.longitude }}</span>
              </div>
              <div class="address">
                <i class="pi pi-home"></i>
                <span>{{ currentLocation.address }}</span>
              </div>
              <div class="accuracy">
                <i class="pi pi-info-circle"></i>
                <span>Accuracy: {{ currentLocation.accuracy }}m</span>
              </div>
            </div>
            <div v-else class="location-loading">
              <i class="pi pi-spin pi-spinner"></i>
              <span>Getting location...</span>
            </div>
          </div>

          <div v-if="selectedAssignment" class="target-location">
            <h4>Target Location</h4>
            <div class="location-info">
              <div class="coordinates">
                <i class="pi pi-map-marker"></i>
                <span>{{ selectedAssignment.coordinates.lat }}, {{ selectedAssignment.coordinates.lng }}</span>
              </div>
              <div class="address">
                <i class="pi pi-home"></i>
                <span>{{ selectedAssignment.location }}</span>
              </div>
              <div class="distance" :class="{ 'within-range': isWithinRange }">
                <i class="pi pi-compass"></i>
                <span>Distance: {{ distanceToTarget }}m</span>
              </div>
            </div>
          </div>
        </div>

        <div class="location-actions">
          <Button
              @click="getCurrentLocation"
              label="Refresh Location"
              icon="pi pi-refresh"
              class="p-button-outlined"
              :loading="locationLoading"
          />
          <Button
              v-if="selectedAssignment"
              @click="openInMaps"
              label="Open in Maps"
              icon="pi pi-external-link"
              class="p-button-outlined"
          />
        </div>
      </template>
    </Card>

    <!-- Check In Dialog -->
    <Dialog
        v-model:visible="showCheckInDialog"
        header="Check In"
        :modal="true"
        :draggable="false"
        :style="{ width: '500px' }"
    >
      <div class="checkin-dialog">
        <div class="dialog-section">
          <h4>Assignment Details</h4>
          <div v-if="selectedAssignment" class="assignment-summary">
            <p><strong>Name:</strong> {{ selectedAssignment.name }}</p>
            <p><strong>Client:</strong> {{ selectedAssignment.client }}</p>
            <p><strong>Location:</strong> {{ selectedAssignment.location }}</p>
            <p><strong>Time:</strong> {{ selectedAssignment.startTime }} - {{ selectedAssignment.endTime }}</p>
          </div>
        </div>

        <div class="dialog-section">
          <h4>Location Verification</h4>
          <div class="verification-status" :class="{ 'verified': isWithinRange }">
            <i :class="isWithinRange ? 'pi pi-check-circle' : 'pi pi-times-circle'"></i>
            <span>
              {{ isWithinRange ? 'Location verified' : 'Location not verified' }}
            </span>
          </div>
          <p class="verification-note">
            {{ isWithinRange
              ? 'You are within the required range of the activation location.'
              : 'You must be within 100m of the activation location to check in.'
            }}
          </p>
        </div>

        <div class="dialog-section">
          <h4>Pre-Check Notes</h4>
          <Textarea
              v-model="checkInNotes"
              rows="3"
              placeholder="Any notes or observations before starting..."
          />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
              label="Cancel"
              icon="pi pi-times"
              @click="showCheckInDialog = false"
              class="p-button-text"
          />
          <Button
              label="Check In"
              icon="pi pi-sign-in"
              @click="performCheckIn"
              :disabled="!isWithinRange"
              :loading="checkingIn"
          />
        </div>
      </template>
    </Dialog>

    <!-- Check Out Dialog -->
    <Dialog
        v-model:visible="showCheckOutDialog"
        header="Check Out"
        :modal="true"
        :draggable="false"
        :style="{ width: '500px' }"
    >
      <div class="checkout-dialog">
        <div class="dialog-section">
          <h4>Session Summary</h4>
          <div v-if="currentActivation" class="session-summary">
            <p><strong>Assignment:</strong> {{ currentActivation.name }}</p>
            <p><strong>Check In Time:</strong> {{ formatTime(checkInTime) }}</p>
            <p><strong>Duration:</strong> {{ sessionDuration }}</p>
            <p><strong>Location:</strong> {{ currentActivation.location }}</p>
          </div>
        </div>

        <div class="dialog-section">
          <h4>End of Day Summary</h4>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">Sales Made:</span>
              <span class="value">{{ dailySummary.sales }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Customers Engaged:</span>
              <span class="value">{{ dailySummary.customers }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Samples Distributed:</span>
              <span class="value">{{ dailySummary.samples }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Revenue Generated:</span>
              <span class="value">${{ dailySummary.revenue }}</span>
            </div>
          </div>
        </div>

        <div class="dialog-section">
          <h4>End of Day Notes</h4>
          <Textarea
              v-model="checkOutNotes"
              rows="4"
              placeholder="Summary of the day, challenges faced, recommendations..."
          />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
              label="Cancel"
              icon="pi pi-times"
              @click="showCheckOutDialog = false"
              class="p-button-text"
          />
          <Button
              label="Check Out"
              icon="pi pi-sign-out"
              @click="performCheckOut"
              :loading="checkingOut"
          />
        </div>
      </template>
    </Dialog>

    <!-- Attendance History -->
    <Card class="history-card">
      <template #header>
        <h3>Recent Attendance</h3>
      </template>
      <template #content>
        <DataTable
            :value="attendanceHistory"
            :paginator="true"
            :rows="10"
            responsiveLayout="stack"
            breakpoint="768px"
        >
          <Column field="date" header="Date" style="width: 15%">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.date) }}
            </template>
          </Column>
          <Column field="assignment" header="Assignment" style="width: 25%">
            <template #body="slotProps">
              <div class="assignment-cell">
                <span class="assignment-name">{{ slotProps.data.assignment }}</span>
                <span class="assignment-client">{{ slotProps.data.client }}</span>
              </div>
            </template>
          </Column>
          <Column field="checkIn" header="Check In" style="width: 15%">
            <template #body="slotProps">
              {{ formatTime(slotProps.data.checkIn) }}
            </template>
          </Column>
          <Column field="checkOut" header="Check Out" style="width: 15%">
            <template #body="slotProps">
              {{ slotProps.data.checkOut ? formatTime(slotProps.data.checkOut) : 'N/A' }}
            </template>
          </Column>
          <Column field="duration" header="Duration" style="width: 10%">
            <template #body="slotProps">
              {{ slotProps.data.duration }}
            </template>
          </Column>
          <Column field="status" header="Status" style="width: 10%">
            <template #body="slotProps">
              <Tag :value="slotProps.data.status" :class="getStatusClass(slotProps.data.status)" />
            </template>
          </Column>
          <Column header="Actions" style="width: 10%">
            <template #body="slotProps">
              <Button
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-text p-button-sm"
                  @click="viewAttendanceDetails(slotProps.data.id)"
                  v-tooltip="'View Details'"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

// Data
const isCheckedIn = ref(false)
const checkInTime = ref(null)
const selectedAssignment = ref(null)
const currentActivation = ref(null)
const currentLocation = ref(null)
const locationLoading = ref(false)
const checkingIn = ref(false)
const checkingOut = ref(false)
const showCheckInDialog = ref(false)
const showCheckOutDialog = ref(false)
const checkInNotes = ref('')
const checkOutNotes = ref('')
const locationWatcher = ref(null)

const todayAssignments = ref([
  {
    id: 1,
    name: 'Product Demo',
    client: 'Tech Corp',
    location: 'Shopping Mall A',
    startTime: '09:00',
    endTime: '13:00',
    duration: 4,
    status: 'scheduled',
    coordinates: { lat: -17.8292, lng: 31.0522 }
  },
  {
    id: 2,
    name: 'Brand Activation',
    client: 'Fashion Brand',
    location: 'Downtown Plaza',
    startTime: '14:00',
    endTime: '17:00',
    duration: 3,
    status: 'scheduled',
    coordinates: { lat: -17.8252, lng: 31.0335 }
  }
])

const attendanceHistory = ref([
  {
    id: 1,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    assignment: 'Summer Campaign',
    client: 'ABC Corp',
    checkIn: new Date(Date.now() - 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
    checkOut: new Date(Date.now() - 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
    duration: '8h 0m',
    status: 'completed'
  },
  {
    id: 2,
    date: new Date(Date.now() - 48 * 60 * 60 * 1000),
    assignment: 'Product Launch',
    client: 'XYZ Ltd',
    checkIn: new Date(Date.now() - 48 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
    checkOut: new Date(Date.now() - 48 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000),
    duration: '6h 0m',
    status: 'completed'
  }
])

const dailySummary = ref({
  sales: 15,
  customers: 45,
  samples: 30,
  revenue: 450
})

// Computed
const hasActiveAssignment = computed(() => {
  return selectedAssignment.value !== null
})

const currentStatus = computed(() => {
  if (!hasActiveAssignment.value) {
    return {
      title: 'No Active Assignment',
      description: 'Select an assignment to check in',
      icon: 'pi pi-clock',
      class: 'status-waiting'
    }
  }

  if (isCheckedIn.value) {
    return {
      title: 'Checked In',
      description: 'You are currently working on an activation',
      icon: 'pi pi-check-circle',
      class: 'status-active'
    }
  }

  return {
    title: 'Ready to Check In',
    description: 'Assignment selected, ready to start',
    icon: 'pi pi-play',
    class: 'status-ready'
  }
})

const distanceToTarget = computed(() => {
  if (!currentLocation.value || !selectedAssignment.value) {
    return 0
  }

  return calculateDistance(
      currentLocation.value.latitude,
      currentLocation.value.longitude,
      selectedAssignment.value.coordinates.lat,
      selectedAssignment.value.coordinates.lng
  )
})

const isWithinRange = computed(() => {
  return distanceToTarget.value <= 100 // 100 meters
})

const sessionDuration = computed(() => {
  if (!checkInTime.value) return '0h 0m'

  const now = new Date()
  const diff = now - checkInTime.value
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return `${hours}h ${minutes}m`
})

// Methods
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Geolocation is not supported by this browser.',
      life: 3000
    })
    return
  }

  locationLoading.value = true

  navigator.geolocation.getCurrentPosition(
      (position) => {
        currentLocation.value = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          address: 'Getting address...'
        }

        // Reverse geocoding (mock)
        setTimeout(() => {
          currentLocation.value.address = 'Central Business District, Harare'
          locationLoading.value = false
        }, 1000)
      },
      (error) => {
        toast.add({
          severity: 'error',
          summary: 'Location Error',
          detail: 'Unable to get current location. Please enable location services.',
          life: 3000
        })
        locationLoading.value = false
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
  )
}

const selectAssignment = (assignment) => {
  selectedAssignment.value = assignment
  getCurrentLocation()

  toast.add({
    severity: 'info',
    summary: 'Assignment Selected',
    detail: `Selected ${assignment.name} for check in`,
    life: 2000
  })
}

const viewAssignment = (assignment) => {
  // Navigate to assignment details
  toast.add({
    severity: 'info',
    summary: 'View Assignment',
    detail: `Opening details for ${assignment.name}`,
    life: 2000
  })
}

const performCheckIn = async () => {
  if (!isWithinRange.value) {
    toast.add({
      severity: 'error',
      summary: 'Location Error',
      detail: 'You must be within 100m of the activation location to check in.',
      life: 3000
    })
    return
  }

  checkingIn.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    isCheckedIn.value = true
    checkInTime.value = new Date()
    currentActivation.value = selectedAssignment.value

    // Update assignment status
    const assignment = todayAssignments.value.find(a => a.id === selectedAssignment.value.id)
    if (assignment) {
      assignment.status = 'in-progress'
    }

    toast.add({
      severity: 'success',
      summary: 'Checked In',
      detail: `Successfully checked in to ${selectedAssignment.value.name}`,
      life: 3000
    })

    showCheckInDialog.value = false
    checkInNotes.value = ''

  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Check In Failed',
      detail: 'Failed to check in. Please try again.',
      life: 3000
    })
  } finally {
    checkingIn.value = false
  }
}

const performCheckOut = async () => {
  checkingOut.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    const checkOutTime = new Date()
    const duration = sessionDuration.value

    // Add to attendance history
    attendanceHistory.value.unshift({
      id: Date.now(),
      date: new Date(),
      assignment: currentActivation.value.name,
      client: currentActivation.value.client,
      checkIn: checkInTime.value,
      checkOut: checkOutTime,
      duration: duration,
      status: 'completed'
    })

    // Update assignment status
    const assignment = todayAssignments.value.find(a => a.id === currentActivation.value.id)
    if (assignment) {
      assignment.status = 'completed'
    }

    // Reset state
    isCheckedIn.value = false
    checkInTime.value = null
    currentActivation.value = null
    selectedAssignment.value = null

    toast.add({
      severity: 'success',
      summary: 'Checked Out',
      detail: `Successfully checked out after ${duration}`,
      life: 3000
    })

    showCheckOutDialog.value = false
    checkOutNotes.value = ''

  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Check Out Failed',
      detail: 'Failed to check out. Please try again.',
      life: 3000
    })
  } finally {
    checkingOut.value = false
  }
}

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return Math.round(R * c)
}

const openInMaps = () => {
  if (selectedAssignment.value) {
    const { lat, lng } = selectedAssignment.value.coordinates
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    window.open(url, '_blank')
  }
}

const getStatusClass = (status) => {
  const classes = {
    'scheduled': 'status-scheduled',
    'in-progress': 'status-progress',
    'completed': 'status-completed',
    'cancelled': 'status-cancelled'
  }
  return classes[status] || 'status-default'
}

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const viewAttendanceDetails = (id) => {
  toast.add({
    severity: 'info',
    summary: 'View Details',
    detail: `Opening attendance details for ID: ${id}`,
    life: 2000
  })
}

// Lifecycle
onMounted(() => {
  getCurrentLocation()

  // Watch location changes
  if (navigator.geolocation) {
    locationWatcher.value = navigator.geolocation.watchPosition(
        (position) => {
          currentLocation.value = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            address: currentLocation.value?.address || 'Getting address...'
          }
        },
        (error) => {
          console.error('Location watch error:', error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
    )
  }
})

onUnmounted(() => {
  if (locationWatcher.value) {
    navigator.geolocation.clearWatch(locationWatcher.value)
  }
})
</script>

<style scoped>
.checkin-checkout {
  padding: 1.5rem;
}

.checkin-header {
  margin-bottom: 1.5rem;
}

.checkin-header h2 {
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.checkin-header p {
  color: #6b7280;
  margin: 0;
}

.status-card {
  margin-bottom: 1.5rem;
}

.status-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-indicator {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.status-indicator.status-waiting {
  background: #6b7280;
}

.status-indicator.status-ready {
  background: #3b82f6;
}

.status-indicator.status-active {
  background: #10b981;
}

.status-details h3 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
}

.status-details p {
  margin: 0 0 0.25rem 0;
  color: #6b7280;
}

.status-details small {
  color: #9ca3af;
  font-size: 0.75rem;
}

.assignments-card {
  margin-bottom: 1.5rem;
}

.no-assignments {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.no-assignments i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.assignments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.assignment-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.assignment-item:hover {
  background: #f9fafb;
}

.assignment-item.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.assignment-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
  margin-right: 1rem;
}

.assignment-time .time {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
}

.assignment-time .duration {
  font-size: 0.8rem;
  color: #6b7280;
}

.assignment-details {
  flex: 1;
}

.assignment-details h4 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.assignment-details .location {
  margin: 0 0 0.25rem 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.assignment-details .location i {
  margin-right: 0.25rem;
}

.assignment-details .client {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-weight: 500;
  font-size: 0.9rem;
}

.assignment-actions {
  margin-left: 1rem;
}

.location-card {
  margin-bottom: 1.5rem;
}

.location-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

</style>
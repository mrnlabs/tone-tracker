<template>
  <BaseCard>
    <template #header>
      <div class="flex justify-between items-center">
        <PageHeader 
          title="Stock Movements"
          subtitle="Track all stock movement activities"
        />
        <div class="flex space-x-2">
          <BaseButton
            icon="pi pi-download"
            variant="secondary"
            @click="exportMovements"
            :disabled="loading"
          >
            Export
          </BaseButton>
          <BaseButton
            icon="pi pi-plus"
            @click="$emit('create')"
            :disabled="loading"
          >
            Record Movement
          </BaseButton>
        </div>
      </div>
    </template>

    <!-- Filters -->
    <div class="mb-6 p-4 bg-gray-50 rounded-lg">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Stock Item</label>
          <Dropdown
            v-model="filters.stockId"
            :options="stocks"
            optionLabel="name"
            optionValue="id"
            placeholder="All stocks"
            showClear
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Movement Type</label>
          <Dropdown
            v-model="filters.movementType"
            :options="movementTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="All types"
            showClear
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Activation</label>
          <Dropdown
            v-model="filters.activationId"
            :options="activations"
            optionLabel="name"
            optionValue="id"
            placeholder="All activations"
            showClear
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
          <Calendar
            v-model="filters.startDate"
            placeholder="Start date"
            dateFormat="yy-mm-dd"
            showIcon
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date To</label>
          <Calendar
            v-model="filters.endDate"
            placeholder="End date"
            dateFormat="yy-mm-dd"
            showIcon
            class="w-full"
          />
        </div>
      </div>
      <div class="flex justify-end mt-4 space-x-2">
        <BaseButton
          variant="secondary"
          @click="clearFilters"
          :disabled="loading"
        >
          Clear
        </BaseButton>
        <BaseButton
          @click="applyFilters"
          :disabled="loading"
        >
          Apply Filters
        </BaseButton>
      </div>
    </div>

    <!-- Data Table -->
    <DataTable
      :value="stockMovements"
      :loading="loading"
      paginator
      :rows="20"
      :totalRecords="pagination.totalElements"
      :lazy="true"
      @page="onPageChange"
      removableSort
      sortMode="multiple"
      class="p-datatable-sm"
    >
      <Column field="dateCreated" header="Date" sortable>
        <template #body="{ data }">
          {{ formatDate(data.dateCreated) }}
        </template>
      </Column>

      <Column field="stockProductName" header="Stock Item" sortable>
        <template #body="{ data }">
          <div>
            <div class="font-medium">
              {{ getStockName(data) }}
            </div>
            <div class="text-sm text-gray-500">{{ data.stockSku || data.stock?.sku || 'No SKU' }}</div>
          </div>
        </template>
      </Column>

      <Column field="movementType" header="Type" sortable>
        <template #body="{ data }">
          <StatusBadge :status="data.movementType" :variant="getMovementTypeVariant(data.movementType)" />
        </template>
      </Column>

      <Column field="quantity" header="Quantity" sortable>
        <template #body="{ data }">
          <span :class="getQuantityClass(data.movementType, data.quantity)">
            {{ getQuantityDisplay(data.quantity, data.movementType) }}
          </span>
        </template>
      </Column>

      <Column field="openingStock" header="Opening" sortable>
        <template #body="{ data }">
          {{ data.openingStock }}
        </template>
      </Column>

      <Column field="closingStock" header="Closing" sortable>
        <template #body="{ data }">
          <span :class="{ 'text-red-500': isIncorrectClosingStock(data) }" 
                :title="isIncorrectClosingStock(data) ? 'Incorrect closing stock calculation detected' : ''">
            {{ data.closingStock }}
          </span>
        </template>
      </Column>

      <Column field="recordedByName" header="Recorded By" sortable>
        <template #body="{ data }">
          {{ data.recordedByName || data.recordedBy?.name }}
        </template>
      </Column>

      <Column field="activationName" header="Activation">
        <template #body="{ data }">
          <span v-if="data.activationName || data.activation" class="text-blue-600">
            {{ data.activationName || data.activation?.name }}
          </span>
          <span v-else class="text-gray-400">-</span>
        </template>
      </Column>

      <Column field="reason" header="Reason">
        <template #body="{ data }">
          <span class="text-sm" :title="data.reason">
            {{ truncateText(data.reason, 30) }}
          </span>
        </template>
      </Column>

      <Column header="Actions" :exportable="false">
        <template #body="{ data }">
          <div class="flex space-x-2">
            <BaseButton
              icon="pi pi-eye"
              variant="secondary"
              size="sm"
              @click="$emit('view', data)"
              :disabled="loading"
            />
            <BaseButton
              icon="pi pi-pencil"
              variant="secondary"
              size="sm"
              @click="$emit('edit', data)"
              :disabled="loading"
            />
            <BaseButton
              icon="pi pi-trash"
              severity="danger"
              size="sm"
              @click="confirmDelete(data)"
              :disabled="loading"
            />
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="text-center py-8">
          <i class="pi pi-box text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-500">No stock movements found</p>
        </div>
      </template>
    </DataTable>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="deleteDialog"
      :style="{ width: '450px' }"
      header="Confirm Delete"
      :modal="true"
    >
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span>Are you sure you want to delete this stock movement?</span>
      </div>
      <template #footer>
        <BaseButton
          label="No"
          icon="pi pi-times"
          variant="secondary"
          @click="deleteDialog = false"
        />
        <BaseButton
          label="Yes"
          icon="pi pi-check"
          severity="danger"
          @click="deleteMovement"
        />
      </template>
    </Dialog>
  </BaseCard>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStockMovementStore } from '@/stores/stockMovement'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { format } from 'date-fns'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/form-components/StatusBadge.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Dialog from 'primevue/dialog'

const props = defineProps({
  stocks: {
    type: Array,
    default: () => []
  },
  stockId: {
    type: Number,
    default: null
  },
  activations: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['create', 'edit', 'view'])

const stockMovementStore = useStockMovementStore()
const confirm = useConfirm()
const toast = useToast()

const loading = ref(false)
const deleteDialog = ref(false)
const movementToDelete = ref(null)

const filters = ref({
  stockId: props.stockId,
  movementType: null,
  activationId: null,
  startDate: null,
  endDate: null
})

const stockMovements = computed(() => stockMovementStore.stockMovements)
const pagination = computed(() => stockMovementStore.pagination)
const movementTypeOptions = computed(() => stockMovementStore.getMovementTypeOptions)

function formatDate(date) {
  if (!date) return 'No Date'
  try {
    return format(new Date(date), 'MMM dd, yyyy HH:mm')
  } catch (error) {
    return 'Invalid Date'
  }
}

function getMovementTypeVariant(type) {
  const variants = {
    'IN': 'success',
    'OUT': 'danger',
    'SALE': 'info',
    'SAMPLE': 'warning',
    'ADJUSTMENT': 'secondary',
    'ALLOCATION': 'info',
    'REPLENISHMENT': 'success',
    'DISTRIBUTION': 'info',
    'RETURN': 'warning'
  }
  return variants[type] || 'secondary'
}

function getQuantityClass(type, quantity = 0) {
  if (['IN', 'REPLENISHMENT', 'RETURN'].includes(type)) {
    return 'text-green-600 font-medium'
  } else if (['OUT', 'SALE', 'SAMPLE', 'DISTRIBUTION', 'ALLOCATION'].includes(type)) {
    return 'text-red-600 font-medium'
  } else if (type === 'ADJUSTMENT') {
    return quantity >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'
  }
  return 'text-gray-600'
}

function getQuantityDisplay(quantity, type) {
  const absQuantity = Math.abs(quantity)
  
  if (['IN', 'REPLENISHMENT', 'RETURN'].includes(type)) {
    return `+${absQuantity}`
  } else if (['OUT', 'SALE', 'SAMPLE', 'DISTRIBUTION', 'ALLOCATION'].includes(type)) {
    return `-${absQuantity}`
  } else if (type === 'ADJUSTMENT') {
    // For adjustments, show the actual sign from the quantity
    return quantity >= 0 ? `+${quantity}` : `${quantity}`
  }
  return quantity
}

function truncateText(text, length) {
  if (!text) return '-'
  return text.length > length ? text.substring(0, length) + '...' : text
}

function getStockName(data) {
  // Try multiple possible field names for stock name
  if (data.stockProductName) {
    return data.stockProductName
  }
  if (data.stock && data.stock.name) {
    return data.stock.name
  }
  if (data.stock && data.stock.productName) {
    return data.stock.productName
  }
  if (data.productName) {
    return data.productName
  }
  // Debug all possible fields
  console.log('Stock name not found. Available fields:', Object.keys(data))
  return 'Unknown Product'
}

function isIncorrectClosingStock(data) {
  // Check if closing stock calculation seems incorrect
  // For most movement types, closing stock should be opening stock +/- quantity
  const { openingStock, closingStock, quantity, movementType } = data
  
  if (openingStock == null || closingStock == null || quantity == null) {
    return false
  }
  
  let expectedClosing
  
  if (['IN', 'REPLENISHMENT', 'RETURN'].includes(movementType)) {
    expectedClosing = openingStock + Math.abs(quantity)
  } else if (['OUT', 'SALE', 'SAMPLE', 'DISTRIBUTION', 'ALLOCATION'].includes(movementType)) {
    expectedClosing = openingStock - Math.abs(quantity)
  } else if (movementType === 'ADJUSTMENT') {
    expectedClosing = openingStock + quantity
  } else {
    return false // Unknown movement type
  }
  
  return Math.abs(closingStock - expectedClosing) > 0.01 // Allow for small rounding differences
}

async function loadMovements(params = {}) {
  loading.value = true
  try {
    if (props.stockId) {
      await stockMovementStore.fetchStockMovements(props.stockId, params)
    } else {
      await stockMovementStore.fetchAllStockMovements(params)
    }
  } catch (error) {
    console.error('Error loading movements:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load stock movements'
    })
  } finally {
    loading.value = false
  }
}

function onPageChange(event) {
  const params = {
    page: event.page,
    size: event.rows,
    ...buildFilterParams()
  }
  loadMovements(params)
}

function buildFilterParams() {
  const params = {}
  
  if (filters.value.stockId) {
    params.stockId = filters.value.stockId
  }
  
  if (filters.value.movementType) {
    params.movementType = filters.value.movementType
  }
  
  if (filters.value.activationId) {
    params.activationId = filters.value.activationId
  }
  
  if (filters.value.startDate) {
    params.startDate = format(filters.value.startDate, 'yyyy-MM-dd')
  }
  
  if (filters.value.endDate) {
    params.endDate = format(filters.value.endDate, 'yyyy-MM-dd')
  }
  
  return params
}

function applyFilters() {
  loadMovements(buildFilterParams())
}

function clearFilters() {
  filters.value = {
    stockId: props.stockId,
    movementType: null,
    activationId: null,
    startDate: null,
    endDate: null
  }
  loadMovements()
}

function confirmDelete(movement) {
  movementToDelete.value = movement
  deleteDialog.value = true
}

async function deleteMovement() {
  if (!movementToDelete.value) return

  try {
    await stockMovementStore.deleteStockMovement(movementToDelete.value.id)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Stock movement deleted successfully'
    })
    deleteDialog.value = false
    movementToDelete.value = null
    loadMovements()
  } catch (error) {
    console.error('Error deleting movement:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete stock movement'
    })
  }
}

async function exportMovements() {
  try {
    await stockMovementStore.exportStockMovements({
      stockId: props.stockId,
      ...buildFilterParams()
    })
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Stock movements exported successfully'
    })
  } catch (error) {
    console.error('Error exporting movements:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to export stock movements'
    })
  }
}

watch(() => props.stockId, (newStockId) => {
  filters.value.stockId = newStockId
  loadMovements()
})

onMounted(() => {
  loadMovements()
})
</script>
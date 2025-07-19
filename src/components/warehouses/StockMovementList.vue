<template>
  <div class="stock-movement-list">
    <!-- Header with Title and Actions -->
    <div class="list-header">
      <h3>Stock Movements</h3>
      <div class="header-actions">
        <BaseButton
          v-if="canExport"
          variant="secondary"
          size="small"
          icon="pi pi-download"
          @click="handleExport"
        >
          Export
        </BaseButton>
        <BaseButton
          v-if="canRefresh"
          variant="secondary"
          size="small"
          icon="pi pi-refresh"
          :loading="loading"
          @click="refreshMovements"
        >
          Refresh
        </BaseButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="movement-filters">
      <div class="filter-row">
        <div class="filter-item">
          <label>Movement Type</label>
          <Dropdown
            v-model="filters.movementType"
            :options="movementTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="All Types"
            showClear
            @change="applyFilters"
          />
        </div>
        <div class="filter-item">
          <label>Date Range</label>
          <Calendar
            v-model="dateRange"
            selectionMode="range"
            dateFormat="dd/mm/yy"
            placeholder="Select date range"
            showIcon
            @date-select="handleDateChange"
          />
        </div>
        <div class="filter-item" v-if="showActivationFilter">
          <label>Activation</label>
          <Dropdown
            v-model="filters.activationId"
            :options="activationOptions"
            optionLabel="name"
            optionValue="id"
            placeholder="All Activations"
            showClear
            filter
            @change="applyFilters"
          />
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="movement-summary" v-if="showSummary">
      <Card class="summary-card">
        <template #content>
          <div class="summary-item">
            <span class="summary-label">Stock In</span>
            <span class="summary-value positive">+{{ summary.totalIn }}</span>
          </div>
        </template>
      </Card>
      <Card class="summary-card">
        <template #content>
          <div class="summary-item">
            <span class="summary-label">Sales</span>
            <span class="summary-value negative">-{{ summary.totalSales }}</span>
          </div>
        </template>
      </Card>
      <Card class="summary-card">
        <template #content>
          <div class="summary-item">
            <span class="summary-label">Samples</span>
            <span class="summary-value negative">-{{ summary.totalSamples }}</span>
          </div>
        </template>
      </Card>
      <Card class="summary-card">
        <template #content>
          <div class="summary-item">
            <span class="summary-label">Net Change</span>
            <span 
              class="summary-value"
              :class="summary.netChange >= 0 ? 'positive' : 'negative'"
            >
              {{ summary.netChange >= 0 ? '+' : '' }}{{ summary.netChange }}
            </span>
          </div>
        </template>
      </Card>
    </div>

    <!-- Movement List -->
    <div class="movement-list">
      <BaseLoader v-if="loading" />
      
      <div v-else-if="movements.length === 0" class="empty-state">
        <i class="pi pi-inbox"></i>
        <p>No stock movements found</p>
      </div>

      <DataTable
        v-else
        :value="movements"
        :paginator="true"
        :rows="20"
        :totalRecords="totalRecords"
        :lazy="true"
        @page="onPage"
        responsiveLayout="scroll"
        class="movement-table"
        :rowClass="getRowClass"
      >
        <Column field="dateCreated" header="Date & Time" :sortable="true">
          <template #body="slotProps">
            <div class="date-cell">
              <span class="date">{{ formatDate(slotProps.data.dateCreated) }}</span>
              <span class="time">{{ formatTime(slotProps.data.dateCreated) }}</span>
            </div>
          </template>
        </Column>

        <Column field="movementType" header="Type" :sortable="true">
          <template #body="slotProps">
            <Tag
              :value="getMovementTypeLabel(slotProps.data.movementType)"
              :severity="getMovementTypeSeverity(slotProps.data.movementType)"
            />
          </template>
        </Column>

        <Column field="stockProductName" header="Product" :sortable="true">
          <template #body="slotProps">
            <div class="product-cell">
              <span class="product-name">{{ slotProps.data.stockProductName }}</span>
              <span class="product-sku">SKU: {{ slotProps.data.stockSku }}</span>
            </div>
          </template>
        </Column>

        <Column field="quantity" header="Quantity" :sortable="true">
          <template #body="slotProps">
            <span 
              class="quantity"
              :class="getQuantityClass(slotProps.data.movementType)"
            >
              {{ formatQuantity(slotProps.data.movementType, slotProps.data.quantity) }}
            </span>
          </template>
        </Column>

        <Column field="closingStock" header="Stock Level">
          <template #body="slotProps">
            <div class="stock-level">
              <span class="opening">{{ slotProps.data.openingStock }}</span>
              <i class="pi pi-arrow-right"></i>
              <span class="closing">{{ slotProps.data.closingStock }}</span>
            </div>
          </template>
        </Column>

        <Column field="reason" header="Reason" v-if="showReasonColumn">
          <template #body="slotProps">
            <span class="reason">{{ slotProps.data.reason || '-' }}</span>
          </template>
        </Column>

        <Column field="activationName" header="Activation" v-if="!hideActivationColumn">
          <template #body="slotProps">
            <router-link
              v-if="slotProps.data.activationId"
              :to="`/activations/${slotProps.data.activationId}`"
              class="activation-link"
            >
              {{ slotProps.data.activationName }}
            </router-link>
            <span v-else>-</span>
          </template>
        </Column>

        <Column field="recordedByName" header="Recorded By">
          <template #body="slotProps">
            <span class="user-name">{{ slotProps.data.recordedByName }}</span>
          </template>
        </Column>

        <Column header="Actions" v-if="showActions">
          <template #body="slotProps">
            <Button
              icon="pi pi-eye"
              class="p-button-text p-button-sm"
              @click="viewDetails(slotProps.data)"
              v-tooltip="'View Details'"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Movement Details Dialog -->
    <Dialog
      v-model:visible="showDetailsDialog"
      :header="'Movement Details'"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="movement-details" v-if="selectedMovement">
        <div class="detail-row">
          <span class="detail-label">Date & Time:</span>
          <span class="detail-value">
            {{ formatDate(selectedMovement.dateCreated) }} 
            {{ formatTime(selectedMovement.dateCreated) }}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Type:</span>
          <Tag
            :value="getMovementTypeLabel(selectedMovement.movementType)"
            :severity="getMovementTypeSeverity(selectedMovement.movementType)"
          />
        </div>
        <div class="detail-row">
          <span class="detail-label">Product:</span>
          <span class="detail-value">
            {{ selectedMovement.stockProductName }}
            <br>
            <small>SKU: {{ selectedMovement.stockSku }}</small>
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Quantity:</span>
          <span 
            class="detail-value quantity"
            :class="getQuantityClass(selectedMovement.movementType)"
          >
            {{ formatQuantity(selectedMovement.movementType, selectedMovement.quantity) }}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Stock Level:</span>
          <span class="detail-value">
            {{ selectedMovement.openingStock }} → {{ selectedMovement.closingStock }}
          </span>
        </div>
        <div class="detail-row" v-if="selectedMovement.reason">
          <span class="detail-label">Reason:</span>
          <span class="detail-value">{{ selectedMovement.reason }}</span>
        </div>
        <div class="detail-row" v-if="selectedMovement.activationName">
          <span class="detail-label">Activation:</span>
          <span class="detail-value">{{ selectedMovement.activationName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Recorded By:</span>
          <span class="detail-value">{{ selectedMovement.recordedByName }}</span>
        </div>
        <div class="detail-row" v-if="selectedMovement.lastUpdated !== selectedMovement.dateCreated">
          <span class="detail-label">Last Updated:</span>
          <span class="detail-value">
            {{ formatDate(selectedMovement.lastUpdated) }}
          </span>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStockMovementStore } from '@/stores/stockMovement'
import { useActivationStore } from '@/stores/activation'
import { useAuthStore } from '@/stores/auth'
import { STOCK_MOVEMENT_TYPE, STOCK_MOVEMENT_TYPE_LABELS } from '@/utils/constants'
import { BaseButton, BaseLoader } from '@/components'
import { useToaster } from '@/composables/useToaster'
import moment from 'moment'

const props = defineProps({
  stockId: {
    type: Number,
    default: null
  },
  activationId: {
    type: Number,
    default: null
  },
  showSummary: {
    type: Boolean,
    default: true
  },
  showActions: {
    type: Boolean,
    default: true
  },
  showReasonColumn: {
    type: Boolean,
    default: true
  },
  hideActivationColumn: {
    type: Boolean,
    default: false
  },
  showActivationFilter: {
    type: Boolean,
    default: true
  },
  canExport: {
    type: Boolean,
    default: true
  },
  canRefresh: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['movement-selected', 'export', 'refresh'])

const stockMovementStore = useStockMovementStore()
const activationStore = useActivationStore()
const authStore = useAuthStore()
const toaster = useToaster()

const loading = ref(false)
const dateRange = ref(null)
const showDetailsDialog = ref(false)
const selectedMovement = ref(null)

const filters = ref({
  movementType: null,
  startDate: null,
  endDate: null,
  activationId: props.activationId
})

const movements = computed(() => stockMovementStore.movementsByDate)
const summary = computed(() => stockMovementStore.summary)
const totalRecords = computed(() => stockMovementStore.pagination.total)

const movementTypeOptions = computed(() => {
  return Object.keys(STOCK_MOVEMENT_TYPE).map(key => ({
    label: STOCK_MOVEMENT_TYPE_LABELS[STOCK_MOVEMENT_TYPE[key]],
    value: STOCK_MOVEMENT_TYPE[key]
  }))
})

const activationOptions = computed(() => {
  return activationStore.activations.filter(a => 
    a.status === 'active' || a.status === 'in-progress'
  )
})

const formatDate = (date) => {
  return moment(date).format('DD/MM/YYYY')
}

const formatTime = (date) => {
  return moment(date).format('HH:mm')
}

const getMovementTypeLabel = (type) => {
  return STOCK_MOVEMENT_TYPE_LABELS[type] || type
}

const getMovementTypeSeverity = (type) => {
  const severityMap = {
    [STOCK_MOVEMENT_TYPE.IN]: 'success',
    [STOCK_MOVEMENT_TYPE.SALE]: 'info',
    [STOCK_MOVEMENT_TYPE.SAMPLE]: 'warning',
    [STOCK_MOVEMENT_TYPE.ADJUSTMENT]: 'danger',
    [STOCK_MOVEMENT_TYPE.TRANSFER]: 'secondary',
    [STOCK_MOVEMENT_TYPE.ALLOCATION]: 'info',
    [STOCK_MOVEMENT_TYPE.RETURN]: 'warning'
  }
  return severityMap[type] || 'secondary'
}

const getQuantityClass = (type) => {
  if (type === STOCK_MOVEMENT_TYPE.IN) return 'positive'
  if ([STOCK_MOVEMENT_TYPE.SALE, STOCK_MOVEMENT_TYPE.SAMPLE, STOCK_MOVEMENT_TYPE.OUT].includes(type)) {
    return 'negative'
  }
  return ''
}

const formatQuantity = (type, quantity) => {
  const sign = type === STOCK_MOVEMENT_TYPE.IN ? '+' : '-'
  return `${sign}${quantity}`
}

const getRowClass = (data) => {
  return `movement-type-${data.movementType.toLowerCase()}`
}

const handleDateChange = () => {
  if (dateRange.value && dateRange.value.length === 2) {
    filters.value.startDate = moment(dateRange.value[0]).format('YYYY-MM-DD')
    filters.value.endDate = moment(dateRange.value[1]).format('YYYY-MM-DD')
    applyFilters()
  }
}

const applyFilters = async () => {
  stockMovementStore.setFilters(filters.value)
  await fetchMovements()
}

const fetchMovements = async () => {
  loading.value = true
  try {
    if (props.stockId) {
      await stockMovementStore.fetchMovements(props.stockId)
    } else if (props.activationId) {
      await stockMovementStore.fetchMovementsByActivation(props.activationId)
    }
  } catch (error) {
    toaster.error('Failed to fetch stock movements')
  } finally {
    loading.value = false
  }
}

const refreshMovements = async () => {
  emit('refresh')
  await fetchMovements()
}

const onPage = async (event) => {
  stockMovementStore.setPage(event.page + 1)
  await fetchMovements()
}

const viewDetails = (movement) => {
  selectedMovement.value = movement
  showDetailsDialog.value = true
  emit('movement-selected', movement)
}

const handleExport = async () => {
  try {
    await stockMovementStore.exportMovements(props.stockId || 'all')
    toaster.success('Export started')
    emit('export')
  } catch (error) {
    toaster.error('Failed to export movements')
  }
}

onMounted(() => {
  fetchMovements()
  if (props.showActivationFilter && activationStore.activations.length === 0) {
    activationStore.fetchActivations({ limit: 100 })
  }
})

watch(() => props.stockId, () => {
  if (props.stockId) {
    fetchMovements()
  }
})

watch(() => props.activationId, () => {
  filters.value.activationId = props.activationId
  if (props.activationId) {
    fetchMovements()
  }
})
</script>

<style lang="scss" scoped>
.stock-movement-list {
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
    }
  }

  .movement-filters {
    margin-bottom: 1.5rem;

    .filter-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .filter-item {
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        font-size: 0.875rem;
      }
    }
  }

  .movement-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;

    .summary-card {
      .summary-item {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .summary-label {
          font-size: 0.875rem;
          color: var(--text-color-secondary);
        }

        .summary-value {
          font-size: 1.5rem;
          font-weight: 600;

          &.positive {
            color: var(--green-500);
          }

          &.negative {
            color: var(--red-500);
          }
        }
      }
    }
  }

  .movement-list {
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--text-color-secondary);

      i {
        font-size: 3rem;
        margin-bottom: 1rem;
      }

      p {
        margin: 0;
      }
    }

    .movement-table {
      .date-cell {
        display: flex;
        flex-direction: column;

        .date {
          font-weight: 500;
        }

        .time {
          font-size: 0.75rem;
          color: var(--text-color-secondary);
        }
      }

      .product-cell {
        display: flex;
        flex-direction: column;

        .product-name {
          font-weight: 500;
        }

        .product-sku {
          font-size: 0.75rem;
          color: var(--text-color-secondary);
        }
      }

      .quantity {
        font-weight: 600;

        &.positive {
          color: var(--green-500);
        }

        &.negative {
          color: var(--red-500);
        }
      }

      .stock-level {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .opening {
          color: var(--text-color-secondary);
        }

        .closing {
          font-weight: 600;
        }

        i {
          font-size: 0.75rem;
          color: var(--text-color-secondary);
        }
      }

      .activation-link {
        color: var(--primary-color);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      .user-name {
        font-size: 0.875rem;
      }
    }
  }

  .movement-details {
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--surface-border);

      &:last-child {
        border-bottom: none;
      }

      .detail-label {
        font-weight: 500;
        color: var(--text-color-secondary);
        flex-shrink: 0;
        margin-right: 1rem;
      }

      .detail-value {
        text-align: right;
        flex: 1;

        &.quantity {
          font-weight: 600;

          &.positive {
            color: var(--green-500);
          }

          &.negative {
            color: var(--red-500);
          }
        }
      }
    }
  }
}
</style>
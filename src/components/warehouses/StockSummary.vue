<template>
  <div class="stock-summary">
    <BaseCard title="Product & Stock Tracking" class="summary-card">
      <template #header-actions>
        <div class="header-controls">
          <Dropdown
            v-model="selectedDateRange"
            :options="dateRangeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select period"
            @change="setDateRange($event.value)"
            class="date-range-selector"
          />
          <BaseButton
            variant="secondary"
            size="small"
            icon="pi pi-refresh"
            :loading="loading"
            @click="refreshData"
          >
            Refresh
          </BaseButton>
        </div>
      </template>

      <!-- Product Information -->
      <div class="product-header">
        <h3>{{ stockInfo.productName }}</h3>
        <div class="product-meta">
          <span class="sku">SKU: {{ stockInfo.sku }}</span>
          <StatusBadge
            :status="stockInfo.status"
            :variant="getStockStatusVariant(stockInfo.status)"
          />
        </div>
      </div>

      <!-- Stock Tracking Grid -->
      <div class="stock-grid">
        <div class="stock-item">
          <div class="stock-label">Opening Stock</div>
          <div class="stock-value primary">{{ stockMetrics.openingStock }}</div>
        </div>

        <div class="stock-item">
          <div class="stock-label">Stock Sold</div>
          <div class="stock-value success">{{ stockMetrics.stockSold }}</div>
        </div>

        <div class="stock-item">
          <div class="stock-label">Stock Sampled</div>
          <div class="stock-value info">{{ stockMetrics.stockSampled }}</div>
        </div>

        <div class="stock-item">
          <div class="stock-label">Current Stock</div>
          <div class="stock-value" :class="getStockLevelClass(stockMetrics.currentStock)">
            {{ stockMetrics.currentStock }}
          </div>
        </div>

        <div class="stock-item">
          <div class="stock-label">Replenishment Required</div>
          <div class="stock-value">
            <StatusBadge
              :status="replenishmentRequired ? 'required' : 'sufficient'"
              :variant="replenishmentRequired ? 'danger' : 'success'"
              :label="replenishmentRequired ? 'Yes' : 'No'"
            />
          </div>
        </div>

        <div class="stock-item">
          <div class="stock-label">Recommended Order</div>
          <div class="stock-value warning">
            {{ recommendedOrderQuantity }} units
          </div>
        </div>
      </div>

      <!-- Sales Data Section -->
      <div class="sales-section">
        <h4>Sales Data</h4>
        <div class="sales-grid">
          <div class="sales-item">
            <div class="sales-label">Total Units Sold</div>
            <div class="sales-value primary">{{ salesData.totalUnitsSold }}</div>
          </div>

          <div class="sales-item">
            <div class="sales-label">Revenue (USD)</div>
            <div class="sales-value success">{{ formatCurrency(salesData.revenueUSD, 'USD') }}</div>
          </div>

          <div class="sales-item">
            <div class="sales-label">Revenue (ZWL)</div>
            <div class="sales-value success">{{ formatCurrency(salesData.revenueZWL, 'ZWL') }}</div>
          </div>
        </div>

        <!-- Payment Methods Breakdown -->
        <div class="payment-methods">
          <h5>Sales by Payment Method</h5>
          <div class="payment-grid">
            <div
              v-for="method in paymentMethodBreakdown"
              :key="method.method"
              class="payment-item"
            >
              <div class="payment-label">{{ method.label }}</div>
              <div class="payment-details">
                <span class="payment-units">{{ method.units }} units</span>
                <span class="payment-amount">{{ formatCurrency(method.amount, method.currency) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Movements -->
      <div class="recent-movements">
        <h4>Recent Stock Movements</h4>
        <div class="movements-list">
          <div
            v-for="movement in recentMovements"
            :key="movement.id"
            class="movement-item"
          >
            <div class="movement-type">
              <StatusBadge
                :status="movement.movementType"
                :variant="getMovementTypeVariant(movement.movementType)"
                :label="getMovementTypeLabel(movement.movementType)"
              />
            </div>
            <div class="movement-details">
              <div class="movement-quantity">
                {{ movement.movementType === 'IN' ? '+' : '-' }}{{ movement.quantity }}
              </div>
              <div class="movement-date">{{ formatDate(movement.dateCreated) }}</div>
            </div>
            <div class="movement-reason">{{ movement.reason }}</div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <BaseButton
          variant="primary"
          icon="pi pi-shopping-cart"
          @click="$emit('record-sale')"
        >
          Record Sale
        </BaseButton>
        <BaseButton
          variant="secondary"
          icon="pi pi-gift"
          @click="$emit('record-sample')"
        >
          Record Sample
        </BaseButton>
        <BaseButton
          variant="secondary"
          icon="pi pi-cog"
          @click="$emit('adjust-stock')"
        >
          Adjust Stock
        </BaseButton>
        <BaseButton
          v-if="replenishmentRequired"
          variant="warning"
          icon="pi pi-plus"
          @click="$emit('request-replenishment')"
        >
          Request Replenishment
        </BaseButton>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStockMovementStore } from '@/stores/stockMovement'
import { useWarehouseStore } from '@/stores/warehouse'
import stockReportService from '@/services/stockReportService'
import {
  STOCK_MOVEMENT_TYPE,
  STOCK_MOVEMENT_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  STOCK_STATUS
} from '@/utils/constants'
import { BaseCard, BaseButton, StatusBadge } from '@/components'
import { useToaster } from '@/composables/useToaster'

const props = defineProps({
  stockId: {
    type: Number,
    required: true
  },
  activationId: {
    type: Number,
    required: true
  },
  stockInfo: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'record-sale',
  'record-sample',
  'adjust-stock',
  'request-replenishment'
])

const stockMovementStore = useStockMovementStore()
const warehouseStore = useWarehouseStore()
const toaster = useToaster()

const loading = ref(false)
const stockReport = ref(null)
const selectedDateRange = ref('current-month')
const dateRange = ref({
  startDate: null,
  endDate: null
})

const dateRangeOptions = [
  { label: 'Current Month', value: 'current-month' },
  { label: 'Last 30 Days', value: 'last-30-days' },
  { label: 'Last 7 Days', value: 'last-7-days' }
]

// Initialize date range to current month
const initializeDateRange = () => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  
  dateRange.value = {
    startDate: startOfMonth.toISOString(),
    endDate: endOfMonth.toISOString()
  }
}

const stockMetrics = computed(() => {
  if (!stockReport.value) {
    return {
      openingStock: 0,
      stockSold: 0,
      stockSampled: 0,
      currentStock: 0
    }
  }
  return {
    openingStock: stockReport.value.openingStock || 0,
    stockSold: stockReport.value.stockSold || 0,
    stockSampled: stockReport.value.stockSampled || 0,
    currentStock: stockReport.value.closingStock || 0
  }
})

const salesData = computed(() => {
  if (!stockReport.value?.salesData) {
    return {
      totalUnitsSold: 0,
      revenueUSD: 0,
      revenueZWL: 0
    }
  }
  return {
    totalUnitsSold: stockReport.value.salesData.totalUnitsSold || 0,
    revenueUSD: stockReport.value.salesData.revenueUSD || 0,
    revenueZWL: stockReport.value.salesData.revenueZWL || 0
  }
})

const paymentMethodBreakdown = computed(() => {
  if (!stockReport.value?.salesData?.paymentMethodBreakdown) {
    return []
  }
  return stockReport.value.salesData.paymentMethodBreakdown.map(method => ({
    method: method.paymentMethod,
    label: PAYMENT_METHOD_LABELS[method.paymentMethod] || method.paymentMethod,
    units: method.unitsSold,
    amount: method.totalAmount,
    currency: method.currency || 'USD'
  }))
})

const recentMovements = computed(() => {
  return stockReport.value?.recentMovements || []
})

const replenishmentRequired = computed(() => {
  return stockReport.value?.replenishmentRequired || false
})

const recommendedOrderQuantity = computed(() => {
  return stockReport.value?.recommendedOrderQuantity || 0
})

const getStockStatusVariant = (status) => {
  const variants = {
    [STOCK_STATUS.IN_STOCK]: 'success',
    [STOCK_STATUS.LOW_STOCK]: 'warning',
    [STOCK_STATUS.OUT_OF_STOCK]: 'danger',
    [STOCK_STATUS.ALLOCATED]: 'info'
  }
  return variants[status] || 'secondary'
}

const getStockLevelClass = (stock) => {
  const minLevel = props.stockInfo.minStockLevel || 10
  if (stock === 0) return 'danger'
  if (stock <= minLevel) return 'warning'
  return 'success'
}

const getMovementTypeVariant = (type) => {
  const variants = {
    [STOCK_MOVEMENT_TYPE.IN]: 'success',
    [STOCK_MOVEMENT_TYPE.OUT]: 'danger',
    [STOCK_MOVEMENT_TYPE.SALE]: 'info',
    [STOCK_MOVEMENT_TYPE.SAMPLE]: 'warning',
    [STOCK_MOVEMENT_TYPE.ADJUSTMENT]: 'secondary'
  }
  return variants[type] || 'secondary'
}

const getMovementTypeLabel = (type) => {
  return STOCK_MOVEMENT_TYPE_LABELS[type] || type
}

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadStockReport = async () => {
  loading.value = true
  try {
    const params = {
      startDate: dateRange.value.startDate,
      endDate: dateRange.value.endDate
    }
    
    stockReport.value = await stockReportService.getStockReport(props.stockId, params)
  } catch (error) {
    console.error('Error loading stock report:', error)
    toaster.error('Failed to load stock report')
  } finally {
    loading.value = false
  }
}

const refreshData = async () => {
  await loadStockReport()
}

const setDateRange = (range) => {
  switch (range) {
    case 'current-month':
      initializeDateRange()
      break
    case 'last-30-days':
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 30)
      dateRange.value = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
      break
    case 'last-7-days':
      const endDate7 = new Date()
      const startDate7 = new Date()
      startDate7.setDate(endDate7.getDate() - 7)
      dateRange.value = {
        startDate: startDate7.toISOString(),
        endDate: endDate7.toISOString()
      }
      break
  }
  loadStockReport()
}

watch(() => props.stockId, () => {
  initializeDateRange()
  refreshData()
}, { immediate: true })

onMounted(() => {
  initializeDateRange()
  refreshData()
})
</script>

<style lang="scss" scoped>
.stock-summary {
  .summary-card {
    .product-header {
      margin-bottom: 2rem;
      
      h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        color: var(--text-color);
      }
      
      .product-meta {
        display: flex;
        align-items: center;
        gap: 1rem;
        
        .sku {
          font-size: 0.875rem;
          color: var(--text-color-secondary);
        }
      }
    }

    .stock-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;

      .stock-item {
        background: var(--surface-ground);
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid var(--surface-border);

        .stock-label {
          font-size: 0.875rem;
          color: var(--text-color-secondary);
          margin-bottom: 0.5rem;
        }

        .stock-value {
          font-size: 1.5rem;
          font-weight: 600;

          &.primary { color: var(--primary-color); }
          &.success { color: var(--green-500); }
          &.warning { color: var(--yellow-500); }
          &.danger { color: var(--red-500); }
          &.info { color: var(--blue-500); }
        }
      }
    }

    .sales-section {
      margin-bottom: 2rem;

      h4 {
        margin: 0 0 1rem 0;
        font-size: 1.25rem;
        color: var(--text-color);
      }

      .sales-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;

        .sales-item {
          background: var(--surface-ground);
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid var(--surface-border);

          .sales-label {
            font-size: 0.875rem;
            color: var(--text-color-secondary);
            margin-bottom: 0.5rem;
          }

          .sales-value {
            font-size: 1.25rem;
            font-weight: 600;

            &.primary { color: var(--primary-color); }
            &.success { color: var(--green-500); }
          }
        }
      }

      .payment-methods {
        h5 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          color: var(--text-color);
        }

        .payment-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;

          .payment-item {
            background: var(--surface-50);
            padding: 0.75rem;
            border-radius: 6px;
            border: 1px solid var(--surface-border);

            .payment-label {
              font-size: 0.875rem;
              color: var(--text-color-secondary);
              margin-bottom: 0.25rem;
            }

            .payment-details {
              display: flex;
              justify-content: space-between;
              align-items: center;

              .payment-units {
                font-size: 0.875rem;
                color: var(--text-color);
              }

              .payment-amount {
                font-weight: 600;
                color: var(--green-500);
              }
            }
          }
        }
      }
    }

    .recent-movements {
      margin-bottom: 2rem;

      h4 {
        margin: 0 0 1rem 0;
        font-size: 1.25rem;
        color: var(--text-color);
      }

      .movements-list {
        .movement-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          border-bottom: 1px solid var(--surface-border);

          &:last-child {
            border-bottom: none;
          }

          .movement-details {
            display: flex;
            flex-direction: column;
            min-width: 80px;

            .movement-quantity {
              font-weight: 600;
              color: var(--text-color);
            }

            .movement-date {
              font-size: 0.75rem;
              color: var(--text-color-secondary);
            }
          }

          .movement-reason {
            flex: 1;
            font-size: 0.875rem;
            color: var(--text-color-secondary);
          }
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      padding-top: 1.5rem;
      border-top: 1px solid var(--surface-border);
    }
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .date-range-selector {
      min-width: 150px;
    }
  }
}
</style>
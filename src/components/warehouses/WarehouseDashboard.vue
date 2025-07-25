<template>
  <div class="warehouse-dashboard">
    <!-- Dashboard Header -->
    <div class="mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">{{ warehouse?.name }} Dashboard</h2>
          <p class="text-gray-600">{{ warehouse?.streetAddress }}, {{ warehouse?.city }}</p>
        </div>
        <div class="flex gap-3">
          <BaseButton
            icon="pi pi-refresh"
            variant="secondary"
            @click="refreshData"
            :loading="loading"
          >
            Refresh
          </BaseButton>
          <BaseButton
            icon="pi pi-file-pdf"
            @click="exportToPDF"
            :loading="exportingPDF"
          >
            Export PDF Report
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Key Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Total Stock Items"
        :value="totalItems"
        icon="pi pi-box"
        color="blue"
        :change="stockChange"
      />
      <StatsCard
        title="Total Stock Value"
        :value="`$${totalValue.toFixed(2)}`"
        icon="pi pi-dollar"
        color="green"
        :change="valueChange"
      />
      <StatsCard
        title="Low Stock Alerts"
        :value="lowStockCount"
        icon="pi pi-exclamation-triangle"
        color="red"
        :change="lowStockChange"
        :clickable="true"
        @click="scrollToLowStock"
      />
      <StatsCard
        title="Active Activations"
        :value="activeActivationsCount"
        icon="pi pi-calendar"
        color="purple"
        :change="activationsChange"
      />
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Stock Level Chart -->
      <StockLevelChart
        :stocks="stocks"
        ref="stockLevelChart"
      />
      
      <!-- Movement Trends Chart -->
      <MovementTrendsChart
        :movements="movements"
        ref="movementTrendsChart"
      />
    </div>

    <!-- Activation Usage Chart -->
    <div class="mb-8">
      <ActivationUsageChart
        :movements="movements"
        :activations="activations"
        ref="activationUsageChart"
      />
    </div>

    <!-- Low Stock Alerts -->
    <div ref="lowStockSection">
      <LowStockAlerts
        :stocks="stocks"
        ref="lowStockAlerts"
      />
    </div>

    <!-- Recent Activity Timeline -->
    <div class="mt-8">
      <BaseCard>
        <template #header>
          <h3 class="text-lg font-semibold">Recent Stock Movements</h3>
        </template>
        
        <div class="space-y-4">
          <div
            v-for="movement in recentMovements"
            :key="movement.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center"
                :class="{
                  'bg-green-100 text-green-600': ['IN', 'REPLENISHMENT'].includes(movement.movementType),
                  'bg-red-100 text-red-600': ['OUT', 'SALE'].includes(movement.movementType),
                  'bg-blue-100 text-blue-600': movement.movementType === 'ALLOCATION',
                  'bg-yellow-100 text-yellow-600': movement.movementType === 'ADJUSTMENT'
                }"
              >
                <i class="pi pi-arrow-up" v-if="['IN', 'REPLENISHMENT'].includes(movement.movementType)"></i>
                <i class="pi pi-arrow-down" v-else-if="['OUT', 'SALE'].includes(movement.movementType)"></i>
                <i class="pi pi-send" v-else-if="movement.movementType === 'ALLOCATION'"></i>
                <i class="pi pi-wrench" v-else></i>
              </div>
              <div>
                <div class="font-medium">{{ movement.stock?.productName || 'Unknown Product' }}</div>
                <div class="text-sm text-gray-600">
                  {{ formatMovementType(movement.movementType) }} • {{ movement.quantity }} units
                  <span v-if="movement.activation?.name" class="text-blue-600">
                    • {{ movement.activation.name }}
                  </span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500">{{ formatDate(movement.dateCreated) }}</div>
              <div class="text-sm text-gray-600">{{ movement.recordedBy?.name || 'System' }}</div>
            </div>
          </div>
        </div>
        
        <div v-if="recentMovements.length === 0" class="text-center py-8 text-gray-500">
          No recent movements found
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import StatsCard from '@/components/ui/StatsCard.vue'
import StockLevelChart from '@/components/charts/StockLevelChart.vue'
import MovementTrendsChart from '@/components/charts/MovementTrendsChart.vue'
import ActivationUsageChart from '@/components/charts/ActivationUsageChart.vue'
import LowStockAlerts from '@/components/charts/LowStockAlerts.vue'
import { exportWarehouseDashboard } from '@/utils/pdfExport'

const props = defineProps({
  warehouse: {
    type: Object,
    required: true
  },
  stocks: {
    type: Array,
    default: () => []
  },
  movements: {
    type: Array,
    default: () => []
  },
  activations: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['refresh'])

const toast = useToast()
const loading = ref(false)
const exportingPDF = ref(false)

// Refs for chart components
const stockLevelChart = ref(null)
const movementTrendsChart = ref(null)
const activationUsageChart = ref(null)
const lowStockAlerts = ref(null)
const lowStockSection = ref(null)

// Computed metrics
const totalItems = computed(() => props.stocks.length)

const totalValue = computed(() => {
  return props.stocks.reduce((sum, stock) => {
    const quantity = stock.quantityInWarehouse || 0
    const price = stock.unitPriceUSD || 0
    return sum + (quantity * price)
  }, 0)
})

const lowStockCount = computed(() => {
  return props.stocks.filter(stock => {
    const current = stock.quantityInWarehouse || 0
    const reorderLevel = stock.reorderLevel || 0
    return current <= reorderLevel
  }).length
})

const activeActivationsCount = computed(() => {
  return props.activations.filter(activation => 
    ['ACTIVE', 'ONGOING', 'PLANNED'].includes(activation.status)
  ).length
})

const recentMovements = computed(() => {
  return props.movements
    .slice()
    .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
    .slice(0, 10)
})

// Mock change calculations (you can implement actual logic based on historical data)
const stockChange = computed(() => ({ value: 5, trend: 'up' }))
const valueChange = computed(() => ({ value: 12.5, trend: 'up' }))
const lowStockChange = computed(() => ({ value: 2, trend: 'down' }))
const activationsChange = computed(() => ({ value: 3, trend: 'up' }))

const formatMovementType = (type) => {
  return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const refreshData = () => {
  loading.value = true
  emit('refresh')
  setTimeout(() => {
    loading.value = false
    toast.add({
      severity: 'success',
      summary: 'Data Refreshed',
      detail: 'Dashboard data has been updated'
    })
  }, 1000)
}

const scrollToLowStock = () => {
  lowStockSection.value?.scrollIntoView({ behavior: 'smooth' })
}

const exportToPDF = async () => {
  exportingPDF.value = true
  
  try {
    // Collect chart canvases
    const charts = []
    
    if (stockLevelChart.value?.$refs?.chartRef?.chart) {
      charts.push({
        canvas: stockLevelChart.value.$refs.chartRef.chart.toBase64Image(),
        title: 'Current Stock Levels'
      })
    }
    
    if (movementTrendsChart.value?.$refs?.chartRef?.chart) {
      charts.push({
        canvas: movementTrendsChart.value.$refs.chartRef.chart.toBase64Image(),
        title: 'Stock Movement Trends'
      })
    }
    
    if (activationUsageChart.value?.$refs?.chartRef?.chart) {
      charts.push({
        canvas: activationUsageChart.value.$refs.chartRef.chart.toBase64Image(),
        title: 'Stock Usage by Activation'
      })
    }
    
    // Prepare low stock table data
    const lowStockItems = props.stocks.filter(stock => {
      const current = stock.quantityInWarehouse || 0
      const reorderLevel = stock.reorderLevel || 0
      return current <= reorderLevel
    })
    
    const lowStockTable = lowStockItems.map(stock => [
      stock.productName || stock.sku,
      stock.sku,
      stock.quantityInWarehouse || 0,
      stock.reorderLevel || 0,
      (stock.quantityInWarehouse || 0) === 0 ? 'Critical' : 'Low'
    ])
    
    // Export data
    const exportData = {
      totalItems: totalItems.value,
      lowStockItems: lowStockCount.value,
      totalValue: totalValue.value,
      activeActivations: activeActivationsCount.value,
      charts,
      lowStockTable: lowStockTable.length > 0 ? lowStockTable : null
    }
    
    const exporter = await exportWarehouseDashboard(exportData)
    
    // Add recent movements section
    if (recentMovements.value.length > 0) {
      exporter.addSectionTitle('Recent Stock Movements')
      const movementsTable = recentMovements.value.slice(0, 15).map(movement => [
        formatDate(movement.dateCreated),
        movement.stock?.productName || 'Unknown',
        formatMovementType(movement.movementType),
        movement.quantity,
        movement.activation?.name || '-'
      ])
      exporter.addTable(
        ['Date', 'Product', 'Type', 'Quantity', 'Activation'],
        movementsTable
      )
    }
    
    exporter.save(`${props.warehouse.name}-dashboard-${new Date().toISOString().split('T')[0]}.pdf`)
    
    toast.add({
      severity: 'success',
      summary: 'Export Complete',
      detail: 'Dashboard report has been downloaded'
    })
    
  } catch (error) {
    console.error('Error exporting PDF:', error)
    toast.add({
      severity: 'error',
      summary: 'Export Failed',
      detail: 'Failed to generate PDF report'
    })
  } finally {
    exportingPDF.value = false
  }
}
</script>

<style scoped>
.warehouse-dashboard {
  padding: 1rem;
}

@media (max-width: 768px) {
  .warehouse-dashboard {
    padding: 0.5rem;
  }
}
</style>
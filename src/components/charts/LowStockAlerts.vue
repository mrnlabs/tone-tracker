<template>
  <BaseCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">Low Stock Alerts</h3>
        <div class="flex gap-2">
          <span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            {{ lowStockItems.length }} items
          </span>
          <BaseButton
            icon="pi pi-download"
            variant="secondary"
            size="small"
            @click="exportLowStockReport"
            v-tooltip.top="'Export Report'"
          />
        </div>
      </div>
    </template>
    
    <div v-if="lowStockItems.length === 0" class="text-center py-8">
      <div class="text-green-500 text-4xl mb-2">
        <i class="pi pi-check-circle"></i>
      </div>
      <h4 class="text-lg font-medium text-gray-900 mb-1">All Stock Levels Good</h4>
      <p class="text-gray-500">No items are currently below their reorder levels.</p>
    </div>
    
    <div v-else class="space-y-3">
      <div
        v-for="item in lowStockItems"
        :key="item.id"
        class="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50"
      >
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <i class="pi pi-exclamation-triangle text-red-600"></i>
              </div>
            </div>
            <div>
              <h4 class="font-medium text-gray-900">{{ item.productName || item.sku }}</h4>
              <p class="text-sm text-gray-600">SKU: {{ item.sku }}</p>
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-6">
          <!-- Current vs Reorder Level -->
          <div class="text-center">
            <div class="text-sm text-gray-500">Current</div>
            <div class="text-lg font-semibold text-red-600">{{ item.quantityInWarehouse || 0 }}</div>
          </div>
          
          <div class="text-center">
            <div class="text-sm text-gray-500">Reorder At</div>
            <div class="text-lg font-semibold text-gray-900">{{ item.reorderLevel || 0 }}</div>
          </div>
          
          <!-- Stock Level Bar -->
          <div class="w-24">
            <div class="text-xs text-gray-500 mb-1">Stock Level</div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="h-2 rounded-full transition-all duration-300"
                :class="getStockLevelColor(item)"
                :style="{ width: `${getStockPercentage(item)}%` }"
              ></div>
            </div>
          </div>
          
          <!-- Suggested Reorder Quantity -->
          <div class="text-center">
            <div class="text-sm text-gray-500">Suggested Order</div>
            <div class="text-lg font-semibold text-blue-600">{{ getSuggestedReorder(item) }}</div>
          </div>
          
          <!-- Value Impact -->
          <div class="text-center">
            <div class="text-sm text-gray-500">Value Impact</div>
            <div class="text-lg font-semibold text-gray-900">${{ getValueImpact(item).toFixed(2) }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Summary Stats -->
    <div v-if="lowStockItems.length > 0" class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-red-50 p-4 rounded-lg">
        <div class="text-sm text-red-600 font-medium">Critical (0 stock)</div>
        <div class="text-2xl font-bold text-red-700">{{ criticalItems }}</div>
      </div>
      <div class="bg-orange-50 p-4 rounded-lg">
        <div class="text-sm text-orange-600 font-medium">Low Stock Items</div>
        <div class="text-2xl font-bold text-orange-700">{{ lowStockItems.length }}</div>
      </div>
      <div class="bg-blue-50 p-4 rounded-lg">
        <div class="text-sm text-blue-600 font-medium">Total Reorder Value</div>
        <div class="text-2xl font-bold text-blue-700">${{ totalReorderValue.toFixed(2) }}</div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useToast } from 'primevue/usetoast'

const props = defineProps({
  stocks: {
    type: Array,
    default: () => []
  }
})

const toast = useToast()

const lowStockItems = computed(() => {
  return props.stocks.filter(stock => {
    const current = stock.quantityInWarehouse || 0
    const reorderLevel = stock.reorderLevel || 0
    return current <= reorderLevel
  }).sort((a, b) => {
    // Sort by urgency (lowest stock percentage first)
    const aPercentage = getStockPercentage(a)
    const bPercentage = getStockPercentage(b)
    return aPercentage - bPercentage
  })
})

const criticalItems = computed(() => {
  return lowStockItems.value.filter(item => (item.quantityInWarehouse || 0) === 0).length
})

const totalReorderValue = computed(() => {
  return lowStockItems.value.reduce((sum, item) => {
    const suggestedQty = getSuggestedReorder(item)
    const unitPrice = item.unitPriceUSD || 0
    return sum + (suggestedQty * unitPrice)
  }, 0)
})

const getStockPercentage = (item) => {
  const current = item.quantityInWarehouse || 0
  const reorderLevel = item.reorderLevel || 1
  const maxLevel = Math.max(reorderLevel * 2, 100) // Assume max is 2x reorder level or 100
  return Math.min((current / maxLevel) * 100, 100)
}

const getStockLevelColor = (item) => {
  const current = item.quantityInWarehouse || 0
  if (current === 0) return 'bg-red-600'
  if (current <= (item.reorderLevel || 0) * 0.5) return 'bg-red-500'
  if (current <= item.reorderLevel) return 'bg-orange-500'
  return 'bg-green-500'
}

const getSuggestedReorder = (item) => {
  const current = item.quantityInWarehouse || 0
  const reorderLevel = item.reorderLevel || 10
  // Suggest ordering enough to get to 2x reorder level
  const targetLevel = reorderLevel * 2
  return Math.max(targetLevel - current, reorderLevel)
}

const getValueImpact = (item) => {
  const suggestedQty = getSuggestedReorder(item)
  const unitPrice = item.unitPriceUSD || 0
  return suggestedQty * unitPrice
}

const exportLowStockReport = () => {
  // Create CSV content
  const headers = ['Product Name', 'SKU', 'Current Stock', 'Reorder Level', 'Suggested Order', 'Unit Price USD', 'Value Impact']
  const csvContent = [
    headers.join(','),
    ...lowStockItems.value.map(item => [
      `"${item.productName || ''}"`,
      `"${item.sku || ''}"`,
      item.quantityInWarehouse || 0,
      item.reorderLevel || 0,
      getSuggestedReorder(item),
      item.unitPriceUSD || 0,
      getValueImpact(item).toFixed(2)
    ].join(','))
  ].join('\n')
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `low-stock-report-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
  
  toast.add({
    severity: 'success',
    summary: 'Export Complete',
    detail: 'Low stock report downloaded successfully'
  })
}
</script>

<style scoped>
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
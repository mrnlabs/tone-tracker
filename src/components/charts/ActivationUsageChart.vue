<template>
  <BaseCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">Stock Usage by Activation</h3>
        <BaseButton
          icon="pi pi-download"
          variant="secondary"
          size="small"
          @click="downloadChart"
          v-tooltip.top="'Download Chart'"
        />
      </div>
    </template>
    
    <div class="chart-container">
      <Doughnut
        :data="chartData"
        :options="chartOptions"
        ref="chartRef"
      />
    </div>
    
    <!-- Legend with details -->
    <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="(activation, index) in activationStats" :key="activation.id" class="flex items-center justify-between p-2 rounded-md bg-gray-50">
        <div class="flex items-center gap-2">
          <div 
            class="w-4 h-4 rounded-full" 
            :style="{ backgroundColor: chartColors[index % chartColors.length] }"
          ></div>
          <span class="font-medium">{{ activation.name }}</span>
        </div>
        <div class="text-right">
          <div class="font-semibold">{{ activation.totalQuantity }} units</div>
          <div class="text-sm text-gray-500">${{ activation.totalValue.toFixed(2) }}</div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  movements: {
    type: Array,
    default: () => []
  },
  activations: {
    type: Array,
    default: () => []
  }
})

const chartRef = ref(null)

const chartColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
]

const activationStats = computed(() => {
  // Group movements by activation
  const activationGroups = {}
  
  props.movements
    .filter(movement => movement.activation?.id || movement.activationId)
    .forEach(movement => {
      const activationId = movement.activation?.id || movement.activationId
      const activationName = movement.activation?.name || 
        props.activations.find(a => a.id === activationId)?.name || 
        `Activation ${activationId}`
      
      if (!activationGroups[activationId]) {
        activationGroups[activationId] = {
          id: activationId,
          name: activationName,
          totalQuantity: 0,
          totalValue: 0,
          movements: []
        }
      }
      
      const quantity = movement.quantity || 0
      const unitPrice = movement.unitPrice || movement.stock?.unitPriceUSD || 0
      
      activationGroups[activationId].totalQuantity += quantity
      activationGroups[activationId].totalValue += quantity * unitPrice
      activationGroups[activationId].movements.push(movement)
    })
  
  return Object.values(activationGroups)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 10) // Top 10 activations
})

const chartData = computed(() => {
  if (activationStats.value.length === 0) {
    return {
      labels: ['No Data'],
      datasets: [{
        data: [1],
        backgroundColor: ['#E5E7EB'],
        borderWidth: 0
      }]
    }
  }
  
  return {
    labels: activationStats.value.map(activation => activation.name),
    datasets: [{
      data: activationStats.value.map(activation => activation.totalQuantity),
      backgroundColor: chartColors.slice(0, activationStats.value.length),
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false // We'll use custom legend
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const activation = activationStats.value[context.dataIndex]
          return [
            `${activation.name}: ${activation.totalQuantity} units`,
            `Value: $${activation.totalValue.toFixed(2)}`
          ]
        }
      }
    }
  },
  cutout: '50%'
}))

const downloadChart = () => {
  if (chartRef.value?.chart) {
    const url = chartRef.value.chart.toBase64Image()
    const link = document.createElement('a')
    link.download = `activation-usage-${new Date().toISOString().split('T')[0]}.png`
    link.href = url
    link.click()
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>
<template>
  <BaseCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">Stock Movement Trends</h3>
        <div class="flex gap-2">
          <BaseButton
            icon="pi pi-download"
            variant="secondary"
            size="small"
            @click="downloadChart"
            v-tooltip.top="'Download Chart'"
          />
        </div>
      </div>
    </template>
    
    <div class="mb-4">
      <div class="flex gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Time Period</label>
          <select v-model="selectedPeriod" @change="updateData" class="px-3 py-2 border rounded-md">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="chart-container">
      <Line
        :data="chartData"
        :options="chartOptions"
        ref="chartRef"
      />
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  movements: {
    type: Array,
    default: () => []
  }
})

const chartRef = ref(null)
const selectedPeriod = ref(30)

const processedData = computed(() => {
  const now = new Date()
  const periodStart = new Date(now.getTime() - (selectedPeriod.value * 24 * 60 * 60 * 1000))
  
  // Filter movements within the selected period
  const filteredMovements = props.movements.filter(movement => {
    const movementDate = new Date(movement.dateCreated)
    return movementDate >= periodStart && movementDate <= now
  })
  
  // Group by date and movement type
  const groupedData = {}
  
  for (let i = 0; i < selectedPeriod.value; i++) {
    const date = new Date(periodStart.getTime() + (i * 24 * 60 * 60 * 1000))
    const dateKey = date.toISOString().split('T')[0]
    groupedData[dateKey] = {
      date: dateKey,
      IN: 0,
      OUT: 0,
      ALLOCATION: 0,
      ADJUSTMENT: 0,
      SALE: 0
    }
  }
  
  // Populate with actual data
  filteredMovements.forEach(movement => {
    const dateKey = movement.dateCreated.split('T')[0]
    if (groupedData[dateKey]) {
      const type = movement.movementType
      if (groupedData[dateKey][type] !== undefined) {
        groupedData[dateKey][type] += movement.quantity || 0
      }
    }
  })
  
  return Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date))
})

const chartData = computed(() => {
  const dates = processedData.value.map(item => {
    const date = new Date(item.date)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })
  
  return {
    labels: dates,
    datasets: [
      {
        label: 'Stock In',
        data: processedData.value.map(item => item.IN),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Stock Out',
        data: processedData.value.map(item => item.OUT),
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Sales',
        data: processedData.value.map(item => item.SALE),
        borderColor: 'rgba(147, 51, 234, 1)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Allocations',
        data: processedData.value.map(item => item.ALLOCATION),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Date'
      }
    },
    y: {
      display: true,
      title: {
        display: true,
        text: 'Quantity'
      },
      beginAtZero: true
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  }
}))

const updateData = () => {
  // Trigger reactivity
  selectedPeriod.value = selectedPeriod.value
}

const downloadChart = () => {
  if (chartRef.value?.chart) {
    const url = chartRef.value.chart.toBase64Image()
    const link = document.createElement('a')
    link.download = `movement-trends-${selectedPeriod.value}days-${new Date().toISOString().split('T')[0]}.png`
    link.href = url
    link.click()
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}
</style>
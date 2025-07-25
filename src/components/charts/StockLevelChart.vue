<template>
  <BaseCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">Current Stock Levels</h3>
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
      <Bar
        :data="chartData"
        :options="chartOptions"
        ref="chartRef"
      />
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  stocks: {
    type: Array,
    default: () => []
  }
})

const chartRef = ref(null)

const chartData = computed(() => {
  const stocks = props.stocks.slice(0, 10) // Show top 10 items
  
  return {
    labels: stocks.map(stock => stock.productName || stock.sku || 'Unknown'),
    datasets: [
      {
        label: 'Current Stock',
        data: stocks.map(stock => stock.quantityInWarehouse || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      },
      {
        label: 'Reorder Level',
        data: stocks.map(stock => stock.reorderLevel || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.3)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        type: 'line'
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
    title: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        afterLabel: function(context) {
          const stock = props.stocks[context.dataIndex]
          if (stock && context.dataset.label === 'Current Stock') {
            const value = stock.unitPriceUSD || 0
            const total = (stock.quantityInWarehouse || 0) * value
            return `Value: $${total.toFixed(2)}`
          }
          return ''
        }
      }
    }
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Products'
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
  elements: {
    bar: {
      borderRadius: 4
    }
  }
}))

const downloadChart = () => {
  if (chartRef.value?.chart) {
    const url = chartRef.value.chart.toBase64Image()
    const link = document.createElement('a')
    link.download = `stock-levels-${new Date().toISOString().split('T')[0]}.png`
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
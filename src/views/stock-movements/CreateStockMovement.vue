<template>
  <div class="create-stock-movement">
    <div class="max-w-4xl mx-auto">
      <div class="mb-6">
        <nav class="flex mb-4" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
              <router-link 
                to="/stock-movements" 
                class="text-gray-700 hover:text-gray-900 inline-flex items-center"
              >
                <i class="pi pi-box mr-2"></i>
                Stock Movements
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <i class="pi pi-angle-right text-gray-400 mx-1"></i>
                <span class="text-gray-500">Record Movement</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <StockMovementForm
        :stocks="stocks"
        :users="users"
        :activations="activations"
        @success="onSuccess"
        @cancel="onCancel"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import StockMovementForm from '@/components/stock-movements/StockMovementForm.vue'

// Import services to fetch reference data
import warehouseService from '@/services/warehouseService'
import { userService } from '@/services/userService'
import { activationService } from '@/services/activationService'

const router = useRouter()
const toast = useToast()

const stocks = ref([])
const users = ref([])
const activations = ref([])
const loading = ref(false)

async function loadReferenceData() {
  loading.value = true
  try {
    // Load stocks, users, and activations in parallel
    const [stocksData, usersData, activationsData] = await Promise.all([
      warehouseService.getAllStocks(),
      userService.getAllUsers(),
      activationService.getAllActivations()
    ])

    stocks.value = stocksData.content || stocksData || []
    users.value = usersData.content || usersData || []
    activations.value = activationsData.content || activationsData || []
  } catch (error) {
    console.error('Error loading reference data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load reference data'
    })
  } finally {
    loading.value = false
  }
}

function onSuccess() {
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Stock movement recorded successfully'
  })
  router.push('/stock-movements')
}

function onCancel() {
  router.push('/stock-movements')
}

onMounted(() => {
  loadReferenceData()
})
</script>

<style scoped>
.create-stock-movement {
  padding: 2rem;
  min-height: 100vh;
  background-color: #f8fafc;
}

@media (max-width: 768px) {
  .create-stock-movement {
    padding: 1rem;
  }
}
</style>
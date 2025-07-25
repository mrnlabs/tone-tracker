<template>
  <div class="edit-stock-movement">
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
                <router-link 
                  :to="`/stock-movements/${$route.params.id}`"
                  class="text-gray-700 hover:text-gray-900"
                >
                  Movement #{{ $route.params.id }}
                </router-link>
              </div>
            </li>
            <li>
              <div class="flex items-center">
                <i class="pi pi-angle-right text-gray-400 mx-1"></i>
                <span class="text-gray-500">Edit</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div v-if="loading" class="text-center py-8">
        <i class="pi pi-spin pi-spinner text-4xl text-gray-400"></i>
        <p class="text-gray-500 mt-2">Loading movement details...</p>
      </div>

      <StockMovementForm
        v-else-if="movement"
        :movement="movement"
        :stocks="stocks"
        :users="users"
        :activations="activations"
        @success="onSuccess"
        @cancel="onCancel"
      />

      <div v-else class="text-center py-8">
        <i class="pi pi-exclamation-triangle text-4xl text-red-400"></i>
        <p class="text-red-500 mt-2">Movement not found</p>
        <router-link 
          to="/stock-movements"
          class="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <i class="pi pi-arrow-left mr-2"></i>
          Back to Stock Movements
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStockMovementStore } from '@/stores/stockMovement'
import { useToast } from 'primevue/usetoast'
import StockMovementForm from '@/components/stock-movements/StockMovementForm.vue'

// Import services to fetch reference data
import warehouseService from '@/services/warehouseService'
import { userService } from '@/services/userService'
import { activationService } from '@/services/activationService'

const route = useRoute()
const router = useRouter()
const stockMovementStore = useStockMovementStore()
const toast = useToast()

const movement = ref(null)
const stocks = ref([])
const users = ref([])
const activations = ref([])
const loading = ref(false)

async function loadMovement() {
  const movementId = route.params.id
  if (!movementId) return

  loading.value = true
  try {
    movement.value = await stockMovementStore.fetchStockMovementById(movementId)
  } catch (error) {
    console.error('Error loading movement:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load stock movement details'
    })
  } finally {
    loading.value = false
  }
}

async function loadReferenceData() {
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
  }
}

function onSuccess() {
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Stock movement updated successfully'
  })
  router.push(`/stock-movements/${route.params.id}`)
}

function onCancel() {
  router.push(`/stock-movements/${route.params.id}`)
}

onMounted(async () => {
  await Promise.all([
    loadMovement(),
    loadReferenceData()
  ])
})
</script>

<style scoped>
.edit-stock-movement {
  padding: 2rem;
  min-height: 100vh;
  background-color: #f8fafc;
}

@media (max-width: 768px) {
  .edit-stock-movement {
    padding: 1rem;
  }
}
</style>
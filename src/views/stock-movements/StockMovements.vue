<template>
  <div class="stock-movements-page">
    <StockMovementList
      :stocks="stocks"
      :activations="activations"
      @create="showCreateModal = true"
      @edit="editMovement"
      @view="viewMovement"
    />

    <!-- Create Movement Modal -->
    <Dialog 
      v-model:visible="showCreateModal"
      :style="{ width: '80vw', maxWidth: '800px' }"
      header="Record Stock Movement"
      :modal="true"
      class="p-fluid"
    >
      <StockMovementForm
        :stocks="stocks"
        :users="users"
        :activations="activations"
        @success="onMovementCreated"
        @cancel="showCreateModal = false"
      />
    </Dialog>

    <!-- Edit Movement Modal -->
    <Dialog 
      v-model:visible="showEditModal"
      :style="{ width: '80vw', maxWidth: '800px' }"
      header="Edit Stock Movement"
      :modal="true"
      class="p-fluid"
    >
      <StockMovementForm
        :movement="selectedMovement"
        :stocks="stocks"
        :users="users"
        :activations="activations"
        @success="onMovementUpdated"
        @cancel="showEditModal = false"
      />
    </Dialog>

    <!-- View Movement Modal -->
    <Dialog 
      v-model:visible="showViewModal"
      :style="{ width: '90vw', maxWidth: '1000px' }"
      header="Stock Movement Details"
      :modal="true"
      class="p-fluid"
    >
      <StockMovementDetails
        :movement="selectedMovement"
        @edit="editFromView"
        @close="showViewModal = false"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStockMovementStore } from '@/stores/stockMovement'
import { useToast } from 'primevue/usetoast'
import StockMovementList from '@/components/stock-movements/StockMovementList.vue'
import StockMovementForm from '@/components/stock-movements/StockMovementForm.vue'
import StockMovementDetails from '@/components/stock-movements/StockMovementDetails.vue'
import Dialog from 'primevue/dialog'

// Import services to fetch reference data
import { warehouseService, userService, activationService } from '@/services/api'

const stockMovementStore = useStockMovementStore()
const toast = useToast()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const selectedMovement = ref(null)

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

function editMovement(movement) {
  selectedMovement.value = movement
  showEditModal.value = true
}

function viewMovement(movement) {
  selectedMovement.value = movement
  showViewModal.value = true
}

function editFromView(movement) {
  showViewModal.value = false
  selectedMovement.value = movement
  showEditModal.value = true
}

function onMovementCreated() {
  showCreateModal.value = false
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Stock movement recorded successfully'
  })
  // The list component will automatically refresh
}

function onMovementUpdated() {
  showEditModal.value = false
  selectedMovement.value = null
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Stock movement updated successfully'
  })
  // The list component will automatically refresh
}

onMounted(() => {
  loadReferenceData()
})
</script>

<style scoped>
.stock-movements-page {
  padding: 1rem;
}

@media (max-width: 768px) {
  .stock-movements-page {
    padding: 0.5rem;
  }
}
</style>
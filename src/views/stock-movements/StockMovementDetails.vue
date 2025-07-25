<template>
  <div class="stock-movement-details">
    <div class="max-w-6xl mx-auto">
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
                <span class="text-gray-500">Movement #{{ $route.params.id }}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div v-if="loading" class="text-center py-12">
        <i class="pi pi-spin pi-spinner text-5xl text-gray-400 mb-4"></i>
        <p class="text-gray-500 text-lg">Loading movement details...</p>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <i class="pi pi-exclamation-triangle text-5xl text-red-400 mb-4"></i>
        <p class="text-red-500 text-lg mb-4">{{ error }}</p>
        <router-link 
          to="/stock-movements"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i class="pi pi-arrow-left mr-2"></i>
          Back to Stock Movements
        </router-link>
      </div>

      <StockMovementDetails
        v-else-if="movement"
        :movement="movement"
        @edit="goToEdit"
        @close="goBack"
      />

      <div v-else class="text-center py-12">
        <i class="pi pi-info-circle text-5xl text-gray-400 mb-4"></i>
        <p class="text-gray-500 text-lg mb-4">Movement not found</p>
        <router-link 
          to="/stock-movements"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i class="pi pi-arrow-left mr-2"></i>
          Back to Stock Movements
        </router-link>
      </div>
    </div>

    <!-- Quick Actions Floating Button -->
    <div class="fixed bottom-6 right-6 flex flex-col space-y-2">
      <BaseButton
        v-if="movement"
        icon="pi pi-pencil"
        class="p-button-rounded p-button-lg shadow-lg"
        @click="goToEdit"
        :disabled="loading"
        title="Edit Movement"
      />
      <BaseButton
        icon="pi pi-arrow-left"
        variant="secondary"
        class="p-button-rounded p-button-lg shadow-lg"
        @click="goBack"
        title="Back to List"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStockMovementStore } from '@/stores/stockMovement'
import { useToast } from 'primevue/usetoast'
import StockMovementDetails from '@/components/stock-movements/StockMovementDetails.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const stockMovementStore = useStockMovementStore()
const toast = useToast()

const loading = ref(false)
const movement = ref(null)

const error = computed(() => stockMovementStore.error)

async function loadMovement() {
  const movementId = route.params.id
  if (!movementId) {
    router.push('/stock-movements')
    return
  }

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

function goToEdit() {
  if (movement.value) {
    router.push(`/stock-movements/${movement.value.id}/edit`)
  }
}

function goBack() {
  router.push('/stock-movements')
}

onMounted(() => {
  loadMovement()
})
</script>

<style scoped>
.stock-movement-details {
  padding: 2rem;
  min-height: 100vh;
  background-color: #f8fafc;
}

@media (max-width: 768px) {
  .stock-movement-details {
    padding: 1rem;
  }
  
  .fixed.bottom-6.right-6 {
    bottom: 1rem;
    right: 1rem;
  }
}
</style>
<template>
  <div class="stock-movements-page">
    <div class="page-header">
      <div class="header-content">
        <h1>Stock Movements</h1>
        <p class="page-description">
          Track all stock movements including sales, adjustments, transfers and samples
        </p>
      </div>
      <div class="header-actions">
        <BaseButton
          v-if="canRecordMovement"
          variant="primary"
          icon="pi pi-plus"
          @click="showMovementDialog = true"
        >
          Record Movement
        </BaseButton>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="movement-stats">
      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <i class="pi pi-arrow-down stat-icon in"></i>
            <div>
              <p class="stat-label">Total In</p>
              <p class="stat-value">{{ formatNumber(totalIn) }}</p>
            </div>
          </div>
        </template>
      </Card>
      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <i class="pi pi-shopping-cart stat-icon sale"></i>
            <div>
              <p class="stat-label">Total Sales</p>
              <p class="stat-value">{{ formatNumber(totalSales) }}</p>
            </div>
          </div>
        </template>
      </Card>
      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <i class="pi pi-gift stat-icon sample"></i>
            <div>
              <p class="stat-label">Total Samples</p>
              <p class="stat-value">{{ formatNumber(totalSamples) }}</p>
            </div>
          </div>
        </template>
      </Card>
      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <i class="pi pi-sync stat-icon adjustment"></i>
            <div>
              <p class="stat-label">Adjustments</p>
              <p class="stat-value">{{ formatNumber(totalAdjustments) }}</p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Movement List Component -->
    <Card>
      <template #content>
        <StockMovementList
          :show-summary="false"
          :show-activation-filter="true"
          :can-export="canExport"
          :can-refresh="true"
          @movement-selected="handleMovementSelected"
          @export="handleExport"
        />
      </template>
    </Card>

    <!-- Record Movement Dialog -->
    <Dialog
      v-model:visible="showMovementDialog"
      header="Record Stock Movement"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="movement-type-selection">
        <p>Select the type of movement to record:</p>
        <div class="movement-options">
          <Button
            label="Stock In"
            icon="pi pi-arrow-down"
            class="p-button-success movement-option"
            @click="selectMovementType('IN')"
          />
          <Button
            label="Sale"
            icon="pi pi-shopping-cart"
            class="p-button-info movement-option"
            @click="selectMovementType('SALE')"
          />
          <Button
            label="Sample"
            icon="pi pi-gift"
            class="p-button-warning movement-option"
            @click="selectMovementType('SAMPLE')"
          />
          <Button
            label="Adjustment"
            icon="pi pi-sync"
            class="p-button-danger movement-option"
            @click="selectMovementType('ADJUSTMENT')"
          />
          <Button
            label="Transfer"
            icon="pi pi-arrow-right"
            class="p-button-secondary movement-option"
            @click="selectMovementType('TRANSFER')"
          />
        </div>
      </div>
    </Dialog>

    <!-- Record Sale Component -->
    <RecordSale
      v-if="selectedActivation"
      v-model:visible="showSaleDialog"
      :activation-id="selectedActivation.id"
      @sale-recorded="handleSaleRecorded"
    />

    <!-- Stock Adjustment Dialog -->
    <StockAdjustment
      v-model:visible="showAdjustmentDialog"
      @adjustment-recorded="handleAdjustmentRecorded"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStockMovementStore } from '@/stores/stockMovement'
import { useActivationStore } from '@/stores/activation'
import { useAuthStore } from '@/stores/auth'
import { BaseButton, StockMovementList, RecordSale } from '@/components'
import { useToaster } from '@/composables/useToaster'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

const router = useRouter()
const stockMovementStore = useStockMovementStore()
const activationStore = useActivationStore()
const authStore = useAuthStore()
const toaster = useToaster()

const showMovementDialog = ref(false)
const showSaleDialog = ref(false)
const showAdjustmentDialog = ref(false)
const selectedActivation = ref(null)

const totalIn = computed(() => stockMovementStore.summary.totalIn)
const totalSales = computed(() => stockMovementStore.summary.totalSales)
const totalSamples = computed(() => stockMovementStore.summary.totalSamples)
const totalAdjustments = computed(() => Math.abs(stockMovementStore.summary.totalAdjustments))

const canRecordMovement = computed(() => {
  return authStore.canManageWarehouse || authStore.isPromoter
})

const canExport = computed(() => {
  return authStore.canManageWarehouse || authStore.isAdmin
})

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num || 0)
}

const selectMovementType = async (type) => {
  showMovementDialog.value = false
  
  switch(type) {
    case 'SALE':
      // For sales, need to select activation first
      if (authStore.isPromoter) {
        // Get promoter's active activation
        const activeActivations = activationStore.activations.filter(
          a => a.status === 'active' && a.teamMembers?.some(m => m.id === authStore.user.id)
        )
        if (activeActivations.length === 1) {
          selectedActivation.value = activeActivations[0]
          showSaleDialog.value = true
        } else {
          // Show activation selection dialog
          toaster.info('Please select an activation')
        }
      } else {
        showSaleDialog.value = true
      }
      break
    case 'ADJUSTMENT':
      showAdjustmentDialog.value = true
      break
    case 'IN':
      router.push('/warehouse/stock-in')
      break
    case 'TRANSFER':
      router.push('/warehouse/transfers')
      break
    case 'SAMPLE':
      // Similar to sale, but for samples
      toaster.info('Sample recording coming soon')
      break
  }
}

const handleMovementSelected = (movement) => {
  // Handle movement selection if needed
}

const handleExport = () => {
  toaster.success('Export started')
}

const handleSaleRecorded = (sale) => {
  toaster.success('Sale recorded successfully')
  stockMovementStore.fetchMovements(sale.stockId)
}

const handleAdjustmentRecorded = (adjustment) => {
  toaster.success('Adjustment recorded successfully')
  stockMovementStore.fetchMovements(adjustment.stockId)
}

onMounted(() => {
  // Load activations for promoters
  if (authStore.isPromoter || authStore.canManageActivations) {
    activationStore.fetchActivations({ status: 'active' })
  }
})
</script>

<style lang="scss" scoped>
.stock-movements-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;

    .header-content {
      h1 {
        margin: 0 0 0.5rem 0;
        font-size: 1.75rem;
        font-weight: 600;
      }

      .page-description {
        margin: 0;
        color: var(--text-color-secondary);
      }
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }
  }

  .movement-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 1rem;

        .stat-icon {
          font-size: 2.5rem;
          opacity: 0.8;

          &.in {
            color: var(--green-500);
          }

          &.sale {
            color: var(--blue-500);
          }

          &.sample {
            color: var(--yellow-500);
          }

          &.adjustment {
            color: var(--orange-500);
          }
        }

        .stat-label {
          margin: 0 0 0.25rem 0;
          font-size: 0.875rem;
          color: var(--text-color-secondary);
        }

        .stat-value {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }
      }
    }
  }

  .movement-type-selection {
    p {
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .movement-options {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;

      .movement-option {
        width: 100%;
        height: 80px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;

        :deep(.p-button-icon) {
          font-size: 1.5rem;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .stock-movements-page {
    .page-header {
      flex-direction: column;
      gap: 1rem;

      .header-actions {
        width: 100%;

        .p-button {
          width: 100%;
        }
      }
    }

    .movement-type-selection {
      .movement-options {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
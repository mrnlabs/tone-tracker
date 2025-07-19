<template>
  <Dialog
    v-model:visible="isVisible"
    header="Stock Adjustment"
    :modal="true"
    :style="{ width: '500px' }"
    :closable="!loading"
    @hide="handleClose"
  >
    <form @submit.prevent="handleSubmit" class="adjustment-form">
      <!-- Product Selection -->
      <div class="form-group">
        <label for="product" class="required">Product</label>
        <Dropdown
          id="product"
          v-model="selectedStock"
          :options="availableStocks"
          optionLabel="productName"
          placeholder="Select product"
          :filter="true"
          :loading="stocksLoading"
          :disabled="loading"
          class="w-full"
        >
          <template #option="slotProps">
            <div class="product-option">
              <span class="product-name">{{ slotProps.option.productName }}</span>
              <span class="product-sku">SKU: {{ slotProps.option.sku }}</span>
              <span class="product-stock">Current: {{ slotProps.option.quantity }} units</span>
            </div>
          </template>
        </Dropdown>
        <small class="p-error" v-if="errors.product">{{ errors.product }}</small>
      </div>

      <!-- Adjustment Type -->
      <div class="form-group">
        <label class="required">Adjustment Type</label>
        <div class="adjustment-type-buttons">
          <Button
            :label="'Increase Stock'"
            icon="pi pi-plus"
            :class="{ 'p-button-success': adjustmentType === 'increase' }"
            @click="adjustmentType = 'increase'"
            type="button"
          />
          <Button
            :label="'Decrease Stock'"
            icon="pi pi-minus"
            :class="{ 'p-button-danger': adjustmentType === 'decrease' }"
            @click="adjustmentType = 'decrease'"
            type="button"
          />
        </div>
      </div>

      <!-- Quantity -->
      <div class="form-group">
        <label for="quantity" class="required">Quantity</label>
        <InputNumber
          id="quantity"
          v-model="formData.quantity"
          :min="1"
          :max="adjustmentType === 'decrease' ? maxQuantity : null"
          :disabled="loading || !selectedStock"
          placeholder="Enter quantity"
          class="w-full"
        />
        <small class="p-error" v-if="errors.quantity">{{ errors.quantity }}</small>
        <small class="help-text" v-if="adjustmentType === 'decrease' && selectedStock">
          Maximum available: {{ maxQuantity }}
        </small>
      </div>

      <!-- Reason -->
      <div class="form-group">
        <label for="reason" class="required">Reason for Adjustment</label>
        <Dropdown
          id="reason"
          v-model="formData.reason"
          :options="adjustmentReasons"
          optionLabel="label"
          optionValue="value"
          placeholder="Select reason"
          :disabled="loading"
          class="w-full"
        />
        <small class="p-error" v-if="errors.reason">{{ errors.reason }}</small>
      </div>

      <!-- Notes -->
      <div class="form-group">
        <label for="notes">Additional Notes</label>
        <Textarea
          id="notes"
          v-model="formData.notes"
          rows="3"
          :disabled="loading"
          placeholder="Add any additional notes..."
          class="w-full"
        />
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="loading"
          @click="handleClose"
        >
          Cancel
        </BaseButton>
        <BaseButton
          type="submit"
          variant="primary"
          :loading="loading"
          :disabled="!isFormValid"
        >
          Record Adjustment
        </BaseButton>
      </div>
    </form>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStockMovementStore } from '@/stores/stockMovement'
import { useWarehouseStore } from '@/stores/warehouse'
import { useAuthStore } from '@/stores/auth'
import { STOCK_MOVEMENT_REASON, STOCK_MOVEMENT_REASON_LABELS } from '@/utils/constants'
import { BaseButton } from '@/components'
import { useToaster } from '@/composables/useToaster'
import { useValidation } from '@/composables/useValidation'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  stockId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'adjustment-recorded', 'close'])

const stockMovementStore = useStockMovementStore()
const warehouseStore = useWarehouseStore()
const authStore = useAuthStore()
const toaster = useToaster()
const { validateRequired, validatePositive } = useValidation()

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const loading = ref(false)
const stocksLoading = ref(false)
const selectedStock = ref(null)
const adjustmentType = ref('decrease')

const formData = ref({
  quantity: null,
  reason: null,
  notes: ''
})

const errors = ref({})

const availableStocks = computed(() => warehouseStore.stocks)

const maxQuantity = computed(() => selectedStock.value?.quantity || 0)

const adjustmentReasons = computed(() => {
  const reasons = adjustmentType.value === 'increase' 
    ? [STOCK_MOVEMENT_REASON.INVENTORY_COUNT, STOCK_MOVEMENT_REASON.CUSTOMER_RETURN, STOCK_MOVEMENT_REASON.OTHER]
    : [STOCK_MOVEMENT_REASON.DAMAGE, STOCK_MOVEMENT_REASON.THEFT, STOCK_MOVEMENT_REASON.EXPIRY, 
       STOCK_MOVEMENT_REASON.QUALITY_ISSUE, STOCK_MOVEMENT_REASON.INVENTORY_COUNT, STOCK_MOVEMENT_REASON.OTHER]
  
  return reasons.map(reason => ({
    label: STOCK_MOVEMENT_REASON_LABELS[reason],
    value: reason
  }))
})

const isFormValid = computed(() => {
  return selectedStock.value &&
    formData.value.quantity > 0 &&
    formData.value.reason &&
    Object.keys(errors.value).length === 0
})

const validateForm = () => {
  errors.value = {}

  if (!selectedStock.value) {
    errors.value.product = 'Please select a product'
  }

  const quantityError = validateRequired(formData.value.quantity, 'Quantity') ||
    validatePositive(formData.value.quantity, 'Quantity')
  if (quantityError) {
    errors.value.quantity = quantityError
  } else if (adjustmentType.value === 'decrease' && formData.value.quantity > maxQuantity.value) {
    errors.value.quantity = `Maximum available quantity is ${maxQuantity.value}`
  }

  if (!formData.value.reason) {
    errors.value.reason = 'Please select a reason'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    const adjustmentData = {
      quantity: adjustmentType.value === 'increase' 
        ? formData.value.quantity 
        : -formData.value.quantity,
      reason: formData.value.reason,
      notes: formData.value.notes || null,
      recordedById: authStore.user?.id || null,
      activationId: null
    }

    await stockMovementStore.recordAdjustment(selectedStock.value.id, adjustmentData)
    
    // Update warehouse stock
    await warehouseStore.fetchStockById(selectedStock.value.id)
    
    toaster.success('Stock adjustment recorded successfully')
    
    emit('adjustment-recorded', {
      stockId: selectedStock.value.id,
      ...adjustmentData
    })
    
    isVisible.value = false
    resetForm()
  } catch (error) {
    toaster.error('Failed to record adjustment: ' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    quantity: null,
    reason: null,
    notes: ''
  }
  selectedStock.value = null
  adjustmentType.value = 'decrease'
  errors.value = {}
}

const handleClose = () => {
  if (!loading.value) {
    resetForm()
    emit('close')
  }
}

const loadStocks = async () => {
  stocksLoading.value = true
  try {
    await warehouseStore.fetchAllStocks()
  } catch (error) {
    toaster.error('Failed to load products')
  } finally {
    stocksLoading.value = false
  }
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    loadStocks()
    if (props.stockId) {
      selectedStock.value = warehouseStore.stocks.find(s => s.id === props.stockId)
    }
  }
})
</script>

<style lang="scss" scoped>
.adjustment-form {
  .form-group {
    margin-bottom: 1.25rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text-color);

      &.required::after {
        content: ' *';
        color: var(--red-500);
      }
    }

    .help-text {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }
  }

  .adjustment-type-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;

    .p-button {
      width: 100%;
    }
  }

  .product-option {
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0;

    .product-name {
      font-weight: 500;
    }

    .product-sku,
    .product-stock {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--surface-border);
  }
}
</style>
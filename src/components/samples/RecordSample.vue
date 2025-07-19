<template>
  <div class="record-sample">
    <Dialog
      v-model:visible="isVisible"
      :header="dialogTitle"
      :modal="true"
      :style="{ width: '450px' }"
      :closable="!loading"
      @hide="handleClose"
    >
      <form @submit.prevent="handleSubmit" class="sample-form">
        <!-- Product Selection -->
        <div class="form-group" v-if="!stockId">
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
                <span class="product-stock">Available: {{ slotProps.option.availableQuantity }}</span>
              </div>
            </template>
          </Dropdown>
          <small class="p-error" v-if="errors.product">{{ errors.product }}</small>
        </div>

        <!-- Product Info (when stockId is provided) -->
        <div class="product-info" v-else>
          <h4>{{ stockInfo?.productName }}</h4>
          <p>SKU: {{ stockInfo?.sku }}</p>
          <p>Available: {{ stockInfo?.availableQuantity }} units</p>
        </div>

        <!-- Quantity -->
        <div class="form-group">
          <label for="quantity" class="required">Quantity Given as Samples</label>
          <InputNumber
            id="quantity"
            v-model="formData.quantity"
            :min="1"
            :max="maxQuantity"
            :disabled="loading"
            placeholder="Enter quantity"
            class="w-full"
          />
          <small class="p-error" v-if="errors.quantity">{{ errors.quantity }}</small>
          <small class="help-text">Maximum available: {{ maxQuantity }}</small>
        </div>

        <!-- Sample Type -->
        <div class="form-group">
          <label for="sampleType" class="required">Sample Type</label>
          <Dropdown
            id="sampleType"
            v-model="formData.sampleType"
            :options="sampleTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select sample type"
            :disabled="loading"
            class="w-full"
          />
          <small class="p-error" v-if="errors.sampleType">{{ errors.sampleType }}</small>
        </div>

        <!-- Customer Information -->
        <div class="customer-section">
          <h5>Customer Information (Optional)</h5>
          
          <div class="form-group">
            <label for="customerName">Customer Name</label>
            <InputText
              id="customerName"
              v-model="formData.customerName"
              :disabled="loading"
              placeholder="Enter customer name"
              class="w-full"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="customerGender">Gender</label>
              <Dropdown
                id="customerGender"
                v-model="formData.customerGender"
                :options="genderOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select gender"
                :disabled="loading"
                class="w-full"
              />
            </div>

            <div class="form-group">
              <label for="customerAge">Age Group</label>
              <Dropdown
                id="customerAge"
                v-model="formData.customerAge"
                :options="ageGroupOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select age group"
                :disabled="loading"
                class="w-full"
              />
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="form-group">
          <label for="notes">Additional Notes</label>
          <Textarea
            id="notes"
            v-model="formData.notes"
            rows="3"
            :disabled="loading"
            placeholder="Add any additional notes about the sample distribution..."
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
            Record Sample
          </BaseButton>
        </div>
      </form>
    </Dialog>

    <!-- Success Dialog -->
    <Dialog
      v-model:visible="showSuccessDialog"
      :header="'Sample Recorded Successfully'"
      :modal="true"
      :style="{ width: '400px' }"
    >
      <div class="success-content">
        <i class="pi pi-check-circle success-icon"></i>
        <p>Sample has been recorded successfully!</p>
        <div class="success-details">
          <div class="detail-item">
            <span>Product:</span>
            <strong>{{ lastSampleDetails.productName }}</strong>
          </div>
          <div class="detail-item">
            <span>Quantity:</span>
            <strong>{{ lastSampleDetails.quantity }}</strong>
          </div>
          <div class="detail-item">
            <span>Type:</span>
            <strong>{{ lastSampleDetails.sampleType }}</strong>
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton @click="recordAnother">Record Another Sample</BaseButton>
        <BaseButton variant="secondary" @click="closeSuccessDialog">Close</BaseButton>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStockMovementStore } from '@/stores/stockMovement'
import { useWarehouseStore } from '@/stores/warehouse'
import { useActivationStore } from '@/stores/activation'
import { useAuthStore } from '@/stores/auth'
import stockMovementService from '@/services/stockMovementService'
import { STOCK_MOVEMENT_TYPE, CUSTOMER_GENDER, CUSTOMER_AGE_GROUPS, CUSTOMER_AGE_GROUP_LABELS } from '@/utils/constants'
import { BaseButton } from '@/components'
import { useToaster } from '@/composables/useToaster'
import { useValidation } from '@/composables/useValidation'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  stockId: {
    type: Number,
    default: null
  },
  activationId: {
    type: Number,
    required: true
  },
  stockInfo: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'sample-recorded', 'close'])

const stockMovementStore = useStockMovementStore()
const warehouseStore = useWarehouseStore()
const activationStore = useActivationStore()
const authStore = useAuthStore()
const toaster = useToaster()
const { validateRequired, validatePositive } = useValidation()

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const loading = ref(false)
const stocksLoading = ref(false)
const showSuccessDialog = ref(false)
const selectedStock = ref(null)
const lastSampleDetails = ref({})

const formData = ref({
  quantity: null,
  sampleType: null,
  customerName: '',
  customerGender: null,
  customerAge: null,
  notes: ''
})

const errors = ref({})

const dialogTitle = computed(() => {
  return props.stockInfo ? `Record Sample - ${props.stockInfo.productName}` : 'Record Sample'
})

const availableStocks = computed(() => {
  return warehouseStore.stocks.filter(stock => 
    stock.availableQuantity > 0 && 
    stock.allocations?.some(alloc => alloc.activationId === props.activationId)
  )
})

const maxQuantity = computed(() => {
  if (props.stockId && props.stockInfo) {
    return props.stockInfo.availableQuantity || 0
  }
  return selectedStock.value?.availableQuantity || 0
})

const sampleTypeOptions = [
  { label: 'Free Sample', value: 'FREE_SAMPLE' },
  { label: 'Demonstration', value: 'DEMONSTRATION' },
  { label: 'Trial Product', value: 'TRIAL' },
  { label: 'Promotional Giveaway', value: 'PROMOTIONAL' },
  { label: 'Quality Test', value: 'QUALITY_TEST' }
]

const genderOptions = [
  { label: 'Male', value: CUSTOMER_GENDER.MALE },
  { label: 'Female', value: CUSTOMER_GENDER.FEMALE },
  { label: 'Other', value: CUSTOMER_GENDER.OTHER },
  { label: 'Prefer not to say', value: CUSTOMER_GENDER.PREFER_NOT_TO_SAY }
]

const ageGroupOptions = Object.keys(CUSTOMER_AGE_GROUPS).map(key => ({
  label: CUSTOMER_AGE_GROUP_LABELS[CUSTOMER_AGE_GROUPS[key]],
  value: CUSTOMER_AGE_GROUPS[key]
}))

const isFormValid = computed(() => {
  return (props.stockId || selectedStock.value) &&
    formData.value.quantity > 0 &&
    formData.value.quantity <= maxQuantity.value &&
    formData.value.sampleType &&
    Object.keys(errors.value).length === 0
})

const validateForm = () => {
  errors.value = {}

  if (!props.stockId && !selectedStock.value) {
    errors.value.product = 'Please select a product'
  }

  const quantityError = validateRequired(formData.value.quantity, 'Quantity') ||
    validatePositive(formData.value.quantity, 'Quantity')
  if (quantityError) {
    errors.value.quantity = quantityError
  } else if (formData.value.quantity > maxQuantity.value) {
    errors.value.quantity = `Maximum available quantity is ${maxQuantity.value}`
  }

  if (!formData.value.sampleType) {
    errors.value.sampleType = 'Please select a sample type'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    const stockId = props.stockId || selectedStock.value.id
    const stockName = props.stockInfo?.productName || selectedStock.value.productName

    const sampleData = {
      stockId: stockId,
      activationId: props.activationId,
      movementType: STOCK_MOVEMENT_TYPE.SAMPLE,
      quantity: formData.value.quantity,
      reason: `Sample distribution - ${formData.value.sampleType} - ${stockName}`,
      notes: formData.value.notes || null,
      sampleType: formData.value.sampleType,
      recordedById: authStore.user?.id
    }

    // Add customer data if provided
    if (formData.value.customerName) {
      sampleData.customerData = {
        name: formData.value.customerName,
        gender: formData.value.customerGender,
        ageGroup: formData.value.customerAge
      }
    }

    await stockMovementService.recordStockMovement(sampleData)
    
    // Update warehouse stock
    await warehouseStore.fetchStockById(stockId)
    
    lastSampleDetails.value = {
      productName: stockName,
      quantity: formData.value.quantity,
      sampleType: sampleTypeOptions.find(opt => opt.value === formData.value.sampleType)?.label
    }
    
    showSuccessDialog.value = true
    isVisible.value = false
    
    emit('sample-recorded', {
      stockId,
      ...sampleData
    })
    
    resetForm()
  } catch (error) {
    toaster.error('Failed to record sample: ' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    quantity: null,
    sampleType: null,
    customerName: '',
    customerGender: null,
    customerAge: null,
    notes: ''
  }
  selectedStock.value = null
  errors.value = {}
}

const handleClose = () => {
  if (!loading.value) {
    resetForm()
    emit('close')
  }
}

const recordAnother = () => {
  showSuccessDialog.value = false
  isVisible.value = true
}

const closeSuccessDialog = () => {
  showSuccessDialog.value = false
}

const loadAvailableStocks = async () => {
  if (!props.stockId && props.activationId) {
    stocksLoading.value = true
    try {
      await warehouseStore.fetchStocksByActivation(props.activationId)
    } catch (error) {
      toaster.error('Failed to load available products')
    } finally {
      stocksLoading.value = false
    }
  }
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    loadAvailableStocks()
  }
})

onMounted(() => {
  if (props.visible) {
    loadAvailableStocks()
  }
})
</script>

<style lang="scss" scoped>
.record-sample {
  .sample-form {
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .product-info {
      background-color: var(--surface-50);
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1.25rem;

      h4 {
        margin: 0 0 0.5rem 0;
        font-size: 1.125rem;
      }

      p {
        margin: 0.25rem 0;
        font-size: 0.875rem;
        color: var(--text-color-secondary);
      }
    }

    .customer-section {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--surface-border);

      h5 {
        margin: 0 0 1rem 0;
        font-size: 1rem;
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

    .product-stock {
      color: var(--green-500);
    }
  }

  .success-content {
    text-align: center;

    .success-icon {
      font-size: 4rem;
      color: var(--green-500);
      margin-bottom: 1rem;
    }

    p {
      font-size: 1.125rem;
      margin-bottom: 1.5rem;
    }

    .success-details {
      background-color: var(--surface-50);
      padding: 1rem;
      border-radius: 6px;
      text-align: left;

      .detail-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;

        &:last-child {
          margin-bottom: 0;
        }

        span {
          color: var(--text-color-secondary);
        }

        strong {
          color: var(--text-color);
        }
      }
    }
  }
}

:deep(.p-dialog-footer) {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}
</style>
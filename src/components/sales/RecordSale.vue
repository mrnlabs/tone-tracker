<template>
  <div class="record-sale">
    <Dialog
      v-model:visible="isVisible"
      :header="dialogTitle"
      :modal="true"
      :style="{ width: '500px' }"
      :closable="!loading"
      @hide="handleClose"
    >
      <form @submit.prevent="handleSubmit" class="sale-form">
        <!-- Product Selection -->
        <div class="form-group" v-if="!stockId">
          <label for="product" class="required">Product</label>
          <Select
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
          </Select>
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
          <label for="quantity" class="required">Quantity</label>
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

        <!-- Unit Price -->
        <div class="form-group">
          <label for="unitPrice" class="required">Unit Price ({{ currency }})</label>
          <InputNumber
            id="unitPrice"
            v-model="formData.unitPrice"
            mode="currency"
            :currency="currency"
            :minFractionDigits="2"
            :disabled="loading"
            placeholder="0.00"
            class="w-full"
          />
          <small class="p-error" v-if="errors.unitPrice">{{ errors.unitPrice }}</small>
        </div>

        <!-- Total Amount (calculated) -->
        <div class="form-group">
          <label>Total Amount</label>
          <div class="total-amount">
            {{ formatCurrency(totalAmount) }}
          </div>
        </div>

        <!-- Payment Method -->
        <div class="form-group">
          <label for="paymentMethod" class="required">Payment Method</label>
          <Select
            id="paymentMethod"
            v-model="formData.paymentMethod"
            :options="paymentMethods"
            optionLabel="label"
            optionValue="value"
            placeholder="Select payment method"
            :disabled="loading"
            class="w-full"
            @change="handlePaymentMethodChange"
          />
          <small class="p-error" v-if="errors.paymentMethod">{{ errors.paymentMethod }}</small>
        </div>

        <!-- Currency Selection for specific payment methods -->
        <div class="form-group" v-if="showCurrencySelection">
          <label for="currency" class="required">Currency</label>
          <Select
            id="currency"
            v-model="formData.currency"
            :options="currencyOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select currency"
            :disabled="loading"
            class="w-full"
          />
          <small class="p-error" v-if="errors.currency">{{ errors.currency }}</small>
        </div>

        <!-- USD Equivalent (for non-USD transactions) -->
        <div class="form-group" v-if="showUSDEquivalent">
          <label for="usdEquivalent">USD Equivalent</label>
          <InputNumber
            id="usdEquivalent"
            v-model="formData.usdEquivalent"
            mode="currency"
            currency="USD"
            :minFractionDigits="2"
            :disabled="loading"
            placeholder="0.00"
            class="w-full"
          />
          <small class="help-text">Current exchange rate: 1 USD = {{ currentExchangeRate }} ZWL</small>
        </div>

        <!-- Customer Information (Optional) -->
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

          <div class="form-group">
            <label for="customerPhone">Phone Number</label>
            <InputMask
              id="customerPhone"
              v-model="formData.customerPhone"
              mask="9999999999?9"
              :disabled="loading"
              placeholder="0771234567"
              class="w-full"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="customerGender">Gender</label>
              <Select
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
              <Select
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
            Record Sale
          </BaseButton>
        </div>
      </form>
    </Dialog>

    <!-- Success Dialog -->
    <Dialog
      v-model:visible="showSuccessDialog"
      :header="'Sale Recorded Successfully'"
      :modal="true"
      :style="{ width: '400px' }"
    >
      <div class="success-content">
        <i class="pi pi-check-circle success-icon"></i>
        <p>Sale has been recorded successfully!</p>
        <div class="success-details">
          <div class="detail-item">
            <span>Product:</span>
            <strong>{{ lastSaleDetails.productName }}</strong>
          </div>
          <div class="detail-item">
            <span>Quantity:</span>
            <strong>{{ lastSaleDetails.quantity }}</strong>
          </div>
          <div class="detail-item">
            <span>Total:</span>
            <strong>{{ formatCurrency(lastSaleDetails.totalAmount) }}</strong>
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton @click="recordAnother">Record Another Sale</BaseButton>
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
import salesService from '@/services/salesService'
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, CUSTOMER_GENDER, CUSTOMER_AGE_GROUPS, CUSTOMER_AGE_GROUP_LABELS } from '@/utils/constants'
import { BaseButton } from '@/components'
import { useToaster } from '@/composables/useToaster'
import { useValidation } from '@/composables/useValidation'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import InputMask from 'primevue/inputmask'
import Calendar from 'primevue/calendar'

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

const emit = defineEmits(['update:visible', 'sale-recorded', 'close'])

const stockMovementStore = useStockMovementStore()
const warehouseStore = useWarehouseStore()
const activationStore = useActivationStore()
const authStore = useAuthStore()
const toaster = useToaster()
const { validators } = useValidation()

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const loading = ref(false)
const stocksLoading = ref(false)
const showSuccessDialog = ref(false)
const selectedStock = ref(null)
const lastSaleDetails = ref({})

const formData = ref({
  quantity: null,
  unitPrice: null,
  paymentMethod: null,
  currency: 'USD',
  usdEquivalent: null,
  customerName: '',
  customerPhone: '',
  customerGender: null,
  customerAge: null,
  notes: ''
})

const errors = ref({})

const dialogTitle = computed(() => {
  return props.stockInfo ? `Record Sale - ${props.stockInfo.productName}` : 'Record Sale'
})

const currency = computed(() => formData.value.currency || 'USD')
const currentExchangeRate = ref(25000) // This should come from an API or store

const showCurrencySelection = computed(() => {
  return ['SWIPE', 'BANK_TRANSFER'].includes(formData.value.paymentMethod)
})

const showUSDEquivalent = computed(() => {
  return formData.value.currency === 'ZWL' || formData.value.paymentMethod === 'ECOCASH'
})

const currencyOptions = [
  { label: 'USD', value: 'USD' },
  { label: 'ZWL', value: 'ZWL' }
]

const availableStocks = computed(() => {
  if (!warehouseStore.inventory || !Array.isArray(warehouseStore.inventory)) {
    return []
  }
  
  // For now, return all stocks with available quantity
  // TODO: Filter by activation allocations when allocation system is implemented
  return warehouseStore.inventory.filter(stock => 
    stock && 
    stock.availableQuantity > 0
  ).map(stock => ({
    ...stock,
    productName: stock.productName || stock.name || 'Unknown Product',
    sku: stock.sku || stock.code || 'N/A'
  }))
})

const maxQuantity = computed(() => {
  if (props.stockId && props.stockInfo) {
    return props.stockInfo.availableQuantity || 0
  }
  return selectedStock.value?.availableQuantity || 0
})

const totalAmount = computed(() => {
  return (formData.value.quantity || 0) * (formData.value.unitPrice || 0)
})

const paymentMethods = computed(() => {
  return Object.keys(PAYMENT_METHODS).map(key => ({
    label: PAYMENT_METHOD_LABELS[PAYMENT_METHODS[key]],
    value: PAYMENT_METHODS[key]
  }))
})

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
    formData.value.unitPrice > 0 &&
    formData.value.paymentMethod &&
    Object.keys(errors.value).length === 0
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.value
  }).format(amount)
}

const handlePaymentMethodChange = () => {
  // Set default currency based on payment method
  if (formData.value.paymentMethod === 'USD') {
    formData.value.currency = 'USD'
    formData.value.usdEquivalent = null
  } else if (formData.value.paymentMethod === 'ZWL') {
    formData.value.currency = 'ZWL'
    formData.value.usdEquivalent = totalAmount.value / currentExchangeRate.value
  } else if (formData.value.paymentMethod === 'ECOCASH') {
    formData.value.currency = 'ZWL'
    formData.value.usdEquivalent = totalAmount.value / currentExchangeRate.value
  }
}

const validateForm = () => {
  errors.value = {}

  if (!props.stockId && !selectedStock.value) {
    errors.value.product = 'Please select a product'
  }

  const quantityValidation = validators.required(formData.value.quantity, 'Quantity is required')
  if (quantityValidation !== true) {
    errors.value.quantity = quantityValidation
  } else {
    const positiveValidation = validators.positive(formData.value.quantity, 'Quantity must be positive')
    if (positiveValidation !== true) {
      errors.value.quantity = positiveValidation
    } else if (formData.value.quantity > maxQuantity.value) {
      errors.value.quantity = `Maximum available quantity is ${maxQuantity.value}`
    }
  }

  const priceValidation = validators.required(formData.value.unitPrice, 'Unit price is required')
  if (priceValidation !== true) {
    errors.value.unitPrice = priceValidation
  } else {
    const positivePriceValidation = validators.positive(formData.value.unitPrice, 'Unit price must be positive')
    if (positivePriceValidation !== true) {
      errors.value.unitPrice = positivePriceValidation
    }
  }

  if (!formData.value.paymentMethod) {
    errors.value.paymentMethod = 'Please select a payment method'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    const stockId = props.stockId || selectedStock.value.id
    const stockName = props.stockInfo?.productName || selectedStock.value.productName

    const saleData = {
      activationId: props.activationId,
      stockId: stockId,
      promoterId: authStore.user?.id, // Get promoter ID from auth store
      unitsSold: formData.value.quantity,
      paymentMethod: formData.value.paymentMethod,
      currency: formData.value.currency,
      amount: totalAmount.value,
      usdEquivalent: formData.value.usdEquivalent || (currency.value === 'USD' ? totalAmount.value : null),
      saleDateTime: new Date().toISOString().slice(0, 19), // Format: yyyy-MM-dd'T'HH:mm:ss
      notes: formData.value.notes || null,
      reason: `Sale of ${formData.value.quantity} units - ${stockName} (${formData.value.paymentMethod})`
    }

    // Add customer data if provided (this might need separate API call)
    if (formData.value.customerName) {
      saleData.customerId = null // This would be set if customer exists
      saleData.customerData = {
        name: formData.value.customerName,
        phone: formData.value.customerPhone,
        gender: formData.value.customerGender,
        ageGroup: formData.value.customerAge
      }
    }

    await salesService.createSale(saleData)
    
    // Refresh warehouse inventory
    await warehouseStore.fetchAllStocks()
    
    lastSaleDetails.value = {
      productName: stockName,
      quantity: formData.value.quantity,
      totalAmount: totalAmount.value
    }
    
    showSuccessDialog.value = true
    isVisible.value = false
    
    emit('sale-recorded', {
      stockId,
      ...saleData
    })
    
    resetForm()
  } catch (error) {
    toaster.error('Failed to record sale: ' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    quantity: null,
    unitPrice: null,
    paymentMethod: null,
    currency: 'USD',
    usdEquivalent: null,
    customerName: '',
    customerPhone: '',
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
      // Try to load stocks from warehouse store
      try {
        await warehouseStore.fetchAllStocks()
      } catch (storeError) {
        console.warn('Warehouse store fetchAllStocks failed:', storeError)
      }
      
      // If no inventory loaded, add some mock data for testing
      if (!warehouseStore.inventory || warehouseStore.inventory.length === 0) {
        console.warn('No inventory found in warehouse store, using mock data')
        // You can remove this mock data when real API is connected
        warehouseStore.inventory = [
          {
            id: 1,
            productName: 'Product A',
            sku: 'SKU001',
            availableQuantity: 50,
            unitPrice: 25.99
          },
          {
            id: 2,
            productName: 'Product B', 
            sku: 'SKU002',
            availableQuantity: 30,
            unitPrice: 15.50
          },
          {
            id: 3,
            productName: 'Product C',
            sku: 'SKU003', 
            availableQuantity: 100,
            unitPrice: 5.99
          }
        ]
      }
    } catch (error) {
      console.error('Failed to load available products:', error)
      toaster.error('Failed to load available products')
      
      // Add fallback mock data even on error
      warehouseStore.inventory = [
        {
          id: 1,
          productName: 'Sample Product',
          sku: 'SAMPLE001',
          availableQuantity: 10,
          unitPrice: 19.99
        }
      ]
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

// Auto-set unit price when a product is selected
watch(selectedStock, (newStock) => {
  if (newStock && newStock.unitPrice) {
    formData.value.unitPrice = newStock.unitPrice
  }
})

onMounted(() => {
  if (props.visible) {
    loadAvailableStocks()
  }
})
</script>

<style lang="scss" scoped>
.record-sale {
  .sale-form {
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

    .total-amount {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--primary-color);
      padding: 0.75rem;
      background-color: var(--surface-50);
      border-radius: 6px;
      text-align: center;
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
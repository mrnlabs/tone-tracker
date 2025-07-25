<template>
  <BaseCard>
    <template #header>
      <PageHeader 
        title="Allocate Stock"
        subtitle="Transfer stock to another warehouse or activation"
      />
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Stock Selection -->
        <div>
          <InputLabel for="stock" text="Stock Item" required />
          <Dropdown
            v-model="form.stockId"
            :options="stocks"
            optionLabel="name"
            optionValue="id"
            placeholder="Select stock item"
            filter
            showClear
            class="w-full"
            :class="{ 'p-invalid': errors.stockId }"
            @change="onStockChange"
          />
          <InputError :message="errors.stockId" />
        </div>

        <!-- Quantity -->
        <div>
          <InputLabel for="quantity" text="Quantity to Allocate" required />
          <InputNumber
            v-model="form.quantity"
            :min="1"
            :max="availableStock"
            placeholder="Enter quantity"
            class="w-full"
            :class="{ 'p-invalid': errors.quantity }"
          />
          <small class="text-gray-500" v-if="availableStock > 0">
            Available: {{ availableStock }} units
          </small>
          <InputError :message="errors.quantity" />
        </div>

        <!-- Destination Warehouse -->
        <div>
          <InputLabel for="toWarehouse" text="Destination Warehouse" required />
          <Dropdown
            v-model="form.toWarehouseId"
            :options="warehouses"
            optionLabel="name"
            optionValue="id"
            placeholder="Select destination warehouse"
            filter
            showClear
            class="w-full"
            :class="{ 'p-invalid': errors.toWarehouseId }"
          />
          <InputError :message="errors.toWarehouseId" />
        </div>

        <!-- Activation (optional) -->
        <div>
          <InputLabel for="activation" text="For Activation" />
          <Dropdown
            v-model="form.activationId"
            :options="activations"
            optionLabel="name"
            optionValue="id"
            placeholder="Select activation (optional)"
            filter
            showClear
            class="w-full"
          />
        </div>

        <!-- Reason -->
        <div class="md:col-span-2">
          <InputLabel for="reason" text="Reason for Allocation" />
          <Textarea
            v-model="form.reason"
            placeholder="Enter reason for stock allocation"
            rows="3"
            class="w-full"
          />
        </div>
      </div>

      <div class="flex justify-end space-x-3 pt-4 border-t">
        <BaseButton
          type="button"
          variant="secondary"
          @click="$emit('cancel')"
          :disabled="loading"
        >
          Cancel
        </BaseButton>
        <BaseButton
          type="submit"
          :loading="loading"
          :disabled="!isFormValid"
        >
          Allocate Stock
        </BaseButton>
      </div>
    </form>
  </BaseCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStockMovementStore } from '@/stores/stockMovement'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import stockService from '@/services/stockService'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import InputLabel from '@/components/form-components/InputLabel.vue'
import InputError from '@/components/form-components/InputError.vue'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'

const props = defineProps({
  stocks: {
    type: Array,
    default: () => []
  },
  warehouses: {
    type: Array,
    default: () => []
  },
  activations: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['success', 'cancel'])

const stockMovementStore = useStockMovementStore()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const errors = ref({})
const availableStock = ref(0)

const form = ref({
  stockId: null,
  quantity: null,
  toWarehouseId: null,
  activationId: null,
  reason: ''
})

const isFormValid = computed(() => {
  return form.value.stockId &&
         form.value.quantity &&
         form.value.quantity > 0 &&
         form.value.quantity <= availableStock.value &&
         form.value.toWarehouseId
})

async function onStockChange() {
  if (form.value.stockId) {
    try {
      const availability = await stockService.checkStockAvailability(form.value.stockId)
      availableStock.value = availability.availableQuantity || 0
    } catch (error) {
      console.error('Error checking stock availability:', error)
      availableStock.value = 0
    }
  } else {
    availableStock.value = 0
  }
}

async function handleSubmit() {
  errors.value = {}
  
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    const allocationData = {
      quantity: form.value.quantity,
      toWarehouseId: form.value.toWarehouseId,
      activationId: form.value.activationId,
      reason: form.value.reason || 'Stock allocation'
    }

    await stockMovementStore.recordAllocation(form.value.stockId, allocationData)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Stock allocated successfully'
    })

    emit('success')
  } catch (error) {
    console.error('Error allocating stock:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to allocate stock'
    })
  } finally {
    loading.value = false
  }
}

function validateForm() {
  const newErrors = {}

  if (!form.value.stockId) {
    newErrors.stockId = 'Stock item is required'
  }

  if (!form.value.quantity || form.value.quantity <= 0) {
    newErrors.quantity = 'Quantity must be greater than 0'
  }

  if (form.value.quantity > availableStock.value) {
    newErrors.quantity = 'Quantity exceeds available stock'
  }

  if (!form.value.toWarehouseId) {
    newErrors.toWarehouseId = 'Destination warehouse is required'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

onMounted(() => {
  // Any initialization logic
})
</script>
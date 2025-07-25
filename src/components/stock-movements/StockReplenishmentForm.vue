<template>
  <BaseCard>
    <template #header>
      <PageHeader 
        title="Replenish Stock"
        subtitle="Add new stock inventory from supplier"
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
          />
          <InputError :message="errors.stockId" />
        </div>

        <!-- Quantity -->
        <div>
          <InputLabel for="quantity" text="Quantity Received" required />
          <InputNumber
            v-model="form.quantity"
            :min="1"
            placeholder="Enter quantity received"
            class="w-full"
            :class="{ 'p-invalid': errors.quantity }"
          />
          <InputError :message="errors.quantity" />
        </div>

        <!-- Supplier -->
        <div>
          <InputLabel for="supplier" text="Supplier" />
          <Dropdown
            v-model="form.supplierId"
            :options="suppliers"
            optionLabel="name"
            optionValue="id"
            placeholder="Select supplier"
            filter
            showClear
            class="w-full"
          />
        </div>

        <!-- Purchase Order Number -->
        <div>
          <InputLabel for="purchaseOrder" text="Purchase Order Number" />
          <InputText
            v-model="form.purchaseOrderNumber"
            placeholder="Enter PO number"
            class="w-full"
          />
        </div>

        <!-- Unit Cost -->
        <div>
          <InputLabel for="unitCost" text="Unit Cost" />
          <InputNumber
            v-model="form.unitCost"
            :min="0"
            :minFractionDigits="2"
            :maxFractionDigits="2"
            placeholder="0.00"
            class="w-full"
            prefix="$"
          />
        </div>

        <!-- Expiry Date -->
        <div>
          <InputLabel for="expiryDate" text="Expiry Date" />
          <Calendar
            v-model="form.expiryDate"
            placeholder="Select expiry date"
            dateFormat="yy-mm-dd"
            showIcon
            class="w-full"
          />
        </div>

        <!-- Batch Number -->
        <div>
          <InputLabel for="batchNumber" text="Batch/Lot Number" />
          <InputText
            v-model="form.batchNumber"
            placeholder="Enter batch number"
            class="w-full"
          />
        </div>

        <!-- Quality Check -->
        <div>
          <InputLabel for="qualityCheck" text="Quality Check Status" />
          <Dropdown
            v-model="form.qualityStatus"
            :options="qualityOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select quality status"
            class="w-full"
          />
        </div>

        <!-- Reason/Notes -->
        <div class="md:col-span-2">
          <InputLabel for="notes" text="Notes" />
          <Textarea
            v-model="form.notes"
            placeholder="Enter any additional notes about the replenishment"
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
          Record Replenishment
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
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import InputLabel from '@/components/form-components/InputLabel.vue'
import InputError from '@/components/form-components/InputError.vue'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Calendar from 'primevue/calendar'

const props = defineProps({
  stocks: {
    type: Array,
    default: () => []
  },
  suppliers: {
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

const form = ref({
  stockId: null,
  quantity: null,
  supplierId: null,
  purchaseOrderNumber: '',
  unitCost: null,
  expiryDate: null,
  batchNumber: '',
  qualityStatus: 'APPROVED',
  notes: ''
})

const qualityOptions = [
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Pending Review', value: 'PENDING' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Conditional Approval', value: 'CONDITIONAL' }
]

const isFormValid = computed(() => {
  return form.value.stockId &&
         form.value.quantity &&
         form.value.quantity > 0
})

async function handleSubmit() {
  errors.value = {}
  
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    const replenishmentData = {
      quantity: form.value.quantity,
      supplierId: form.value.supplierId,
      purchaseOrderNumber: form.value.purchaseOrderNumber,
      unitCost: form.value.unitCost,
      expiryDate: form.value.expiryDate ? form.value.expiryDate.toISOString().split('T')[0] : null,
      batchNumber: form.value.batchNumber,
      qualityStatus: form.value.qualityStatus,
      notes: form.value.notes,
      reason: 'Stock replenishment'
    }

    await stockMovementStore.recordStockIn(form.value.stockId, replenishmentData)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Stock replenished successfully'
    })

    emit('success')
  } catch (error) {
    console.error('Error replenishing stock:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to replenish stock'
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

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

onMounted(() => {
  // Set default recorded by to current user
  // This might be handled in the API
})
</script>
<template>
  <BaseCard>
    <template #header>
      <PageHeader 
        :title="isEdit ? 'Edit Stock Movement' : 'Record Stock Movement'"
        :subtitle="isEdit ? 'Update stock movement details' : 'Record a new stock movement'"
      />
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Stock Selection -->
        <div>
          <InputLabel for="stock" text="Stock Item" required />
          <Dropdown
            v-model="form.stock"
            :options="stocks"
            optionLabel="name"
            optionValue="id"
            placeholder="Select stock item"
            filter
            showClear
            class="w-full"
            :class="{ 'p-invalid': errors.stock }"
          />
          <InputError :message="errors.stock" />
        </div>

        <!-- Movement Type -->
        <div>
          <InputLabel for="movementType" text="Movement Type" required />
          <Dropdown
            v-model="form.movementType"
            :options="movementTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select movement type"
            class="w-full"
            :class="{ 'p-invalid': errors.movementType }"
          />
          <InputError :message="errors.movementType" />
        </div>

        <!-- Quantity -->
        <div>
          <InputLabel for="quantity" text="Quantity" required />
          <InputNumber
            v-model="form.quantity"
            :min="1"
            placeholder="Enter quantity"
            class="w-full"
            :class="{ 'p-invalid': errors.quantity }"
          />
          <InputError :message="errors.quantity" />
        </div>

        <!-- Opening Stock -->
        <div>
          <InputLabel for="openingStock" text="Opening Stock" required />
          <InputNumber
            v-model="form.openingStock"
            :min="0"
            placeholder="Current stock level"
            class="w-full"
            :class="{ 'p-invalid': errors.openingStock }"
          />
          <InputError :message="errors.openingStock" />
        </div>

        <!-- Closing Stock (calculated) -->
        <div>
          <InputLabel for="closingStock" text="Closing Stock" />
          <InputNumber
            v-model="form.closingStock"
            :min="0"
            placeholder="Final stock level"
            class="w-full"
            :class="{ 'p-invalid': errors.closingStock }"
            :disabled="!allowManualClosingStock"
          />
          <small class="text-gray-500">
            {{ allowManualClosingStock ? 'Manual entry allowed' : 'Auto-calculated based on movement' }}
          </small>
          <InputError :message="errors.closingStock" />
        </div>

        <!-- Recorded By -->
        <div>
          <InputLabel for="recordedBy" text="Recorded By" required />
          <Dropdown
            v-model="form.recordedBy"
            :options="users"
            optionLabel="name"
            optionValue="id"
            placeholder="Select user"
            filter
            showClear
            class="w-full"
            :class="{ 'p-invalid': errors.recordedBy }"
          />
          <InputError :message="errors.recordedBy" />
        </div>

        <!-- Activation (optional) -->
        <div>
          <InputLabel for="activation" text="Activation" />
          <Dropdown
            v-model="form.activation"
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
          <InputLabel for="reason" text="Reason" />
          <Textarea
            v-model="form.reason"
            placeholder="Enter reason for movement"
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
          {{ isEdit ? 'Update Movement' : 'Record Movement' }}
        </BaseButton>
      </div>
    </form>
  </BaseCard>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
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
import Textarea from 'primevue/textarea'

const props = defineProps({
  movement: {
    type: Object,
    default: null
  },
  stocks: {
    type: Array,
    default: () => []
  },
  users: {
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

const form = ref({
  stock: null,
  movementType: null,
  quantity: null,
  openingStock: null,
  closingStock: null,
  recordedBy: null,
  activation: null,
  reason: ''
})

const isEdit = computed(() => !!props.movement)

const movementTypeOptions = computed(() => stockMovementStore.getMovementTypeOptions)

const allowManualClosingStock = computed(() => {
  return ['ADJUSTMENT'].includes(form.value.movementType)
})

const isFormValid = computed(() => {
  return form.value.stock &&
         form.value.movementType &&
         form.value.quantity &&
         form.value.openingStock !== null &&
         form.value.closingStock !== null &&
         form.value.recordedBy
})

watch(() => [form.value.movementType, form.value.quantity, form.value.openingStock], () => {
  calculateClosingStock()
}, { deep: true })

function calculateClosingStock() {
  if (form.value.quantity && form.value.openingStock !== null && !allowManualClosingStock.value) {
    const quantity = parseInt(form.value.quantity)
    const opening = parseInt(form.value.openingStock)
    
    switch (form.value.movementType) {
      case 'IN':
      case 'REPLENISHMENT':
      case 'RETURN':
        form.value.closingStock = opening + quantity
        break
      case 'OUT':
      case 'SALE':
      case 'SAMPLE':
      case 'DISTRIBUTION':
      case 'ALLOCATION':
        form.value.closingStock = opening - quantity
        break
      default:
        form.value.closingStock = opening
    }
  }
}

async function handleSubmit() {
  errors.value = {}
  
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    const movementData = {
      movementType: form.value.movementType,
      quantity: form.value.quantity,
      openingStock: form.value.openingStock,
      closingStock: form.value.closingStock,
      recordedBy: { id: form.value.recordedBy },
      activation: form.value.activation ? { id: form.value.activation } : null,
      reason: form.value.reason || null
    }

    if (isEdit.value) {
      await stockMovementStore.updateStockMovement(props.movement.id, movementData)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Stock movement updated successfully'
      })
    } else {
      await stockMovementStore.createStockMovement(form.value.stock, movementData)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Stock movement recorded successfully'
      })
    }

    emit('success')
  } catch (error) {
    console.error('Error saving stock movement:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to save stock movement'
    })
  } finally {
    loading.value = false
  }
}

function validateForm() {
  const newErrors = {}

  if (!form.value.stock) {
    newErrors.stock = 'Stock item is required'
  }

  if (!form.value.movementType) {
    newErrors.movementType = 'Movement type is required'
  }

  if (!form.value.quantity || form.value.quantity <= 0) {
    newErrors.quantity = 'Quantity must be greater than 0'
  }

  if (form.value.openingStock === null) {
    newErrors.openingStock = 'Opening stock is required'
  }

  if (form.value.closingStock === null) {
    newErrors.closingStock = 'Closing stock is required'
  }

  if (!form.value.recordedBy) {
    newErrors.recordedBy = 'Recorded by is required'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

onMounted(() => {
  if (isEdit.value && props.movement) {
    form.value = {
      stock: props.movement.stock?.id,
      movementType: props.movement.movementType,
      quantity: props.movement.quantity,
      openingStock: props.movement.openingStock,
      closingStock: props.movement.closingStock,
      recordedBy: props.movement.recordedBy?.id,
      activation: props.movement.activation?.id || null,
      reason: props.movement.reason || ''
    }
  } else {
    form.value.recordedBy = authStore.user?.id
  }
})
</script>
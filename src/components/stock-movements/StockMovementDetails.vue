<template>
  <BaseCard>
    <template #header>
      <div class="flex justify-between items-center">
        <PageHeader 
          title="Stock Movement Details"
          :subtitle="`Movement #${movement?.id}`"
        />
        <div class="flex space-x-2">
          <BaseButton
            icon="pi pi-pencil"
            variant="secondary"
            @click="$emit('edit', movement)"
            :disabled="!movement"
          >
            Edit
          </BaseButton>
          <BaseButton
            icon="pi pi-times"
            variant="secondary"
            @click="$emit('close')"
          >
            Close
          </BaseButton>
        </div>
      </div>
    </template>

    <div v-if="movement" class="space-y-6">
      <!-- Movement Summary -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="flex items-center">
            <i class="pi pi-box text-blue-600 text-2xl mr-3"></i>
            <div>
              <h3 class="text-lg font-semibold text-blue-800">Stock Item</h3>
              <p class="text-blue-600">{{ movement.stock?.name }}</p>
              <p class="text-sm text-blue-500">SKU: {{ movement.stock?.sku }}</p>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="flex items-center">
            <i class="pi pi-arrow-right-arrow-left text-purple-600 text-2xl mr-3"></i>
            <div>
              <h3 class="text-lg font-semibold text-purple-800">Movement Type</h3>
              <StatusBadge 
                :status="movement.movementType" 
                :variant="getMovementTypeVariant(movement.movementType)"
              />
            </div>
          </div>
        </div>

        <div class="bg-green-50 p-4 rounded-lg">
          <div class="flex items-center">
            <i class="pi pi-hashtag text-green-600 text-2xl mr-3"></i>
            <div>
              <h3 class="text-lg font-semibold text-green-800">Quantity</h3>
              <p class="text-2xl font-bold" :class="getQuantityClass(movement.movementType)">
                {{ getQuantityDisplay(movement.quantity, movement.movementType) }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-orange-50 p-4 rounded-lg">
          <div class="flex items-center">
            <i class="pi pi-calendar text-orange-600 text-2xl mr-3"></i>
            <div>
              <h3 class="text-lg font-semibold text-orange-800">Date Created</h3>
              <p class="text-orange-600">{{ formatDate(movement.dateCreated) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stock Balance Information -->
      <BaseCard class="bg-gray-50">
        <template #header>
          <h3 class="text-lg font-semibold">Stock Balance Changes</h3>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600 mb-2">{{ movement.openingStock }}</div>
            <div class="text-sm text-gray-600">Opening Stock</div>
          </div>

          <div class="text-center">
            <div class="flex items-center justify-center">
              <i class="pi pi-arrow-right text-2xl text-gray-400"></i>
            </div>
            <div class="text-sm text-gray-600 mt-2">
              {{ getMovementDescription(movement.movementType, movement.quantity) }}
            </div>
          </div>

          <div class="text-center">
            <div class="text-3xl font-bold text-green-600 mb-2">{{ movement.closingStock }}</div>
            <div class="text-sm text-gray-600">Closing Stock</div>
          </div>
        </div>
      </BaseCard>

      <!-- Movement Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BaseCard>
          <template #header>
            <h3 class="text-lg font-semibold">Movement Information</h3>
          </template>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Recorded By</label>
              <div class="flex items-center">
                <i class="pi pi-user text-gray-400 mr-2"></i>
                <span>{{ movement.recordedBy?.name }}</span>
              </div>
            </div>

            <div v-if="movement.activation">
              <label class="block text-sm font-medium text-gray-700 mb-1">Associated Activation</label>
              <div class="flex items-center">
                <i class="pi pi-flag text-gray-400 mr-2"></i>
                <span class="text-blue-600">{{ movement.activation.name }}</span>
              </div>
            </div>

            <div v-if="movement.reason">
              <label class="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <div class="bg-gray-50 p-3 rounded border">
                <p class="text-gray-700">{{ movement.reason }}</p>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <h3 class="text-lg font-semibold">Timestamps</h3>
          </template>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date Created</label>
              <div class="flex items-center">
                <i class="pi pi-calendar-plus text-gray-400 mr-2"></i>
                <span>{{ formatDateTime(movement.dateCreated) }}</span>
              </div>
            </div>

            <div v-if="movement.lastUpdated">
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
              <div class="flex items-center">
                <i class="pi pi-calendar text-gray-400 mr-2"></i>
                <span>{{ formatDateTime(movement.lastUpdated) }}</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Movement ID</label>
              <div class="flex items-center">
                <i class="pi pi-hashtag text-gray-400 mr-2"></i>
                <span class="font-mono text-sm">{{ movement.id }}</span>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Stock Item Details -->
      <BaseCard v-if="movement.stock">
        <template #header>
          <h3 class="text-lg font-semibold">Stock Item Information</h3>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <p class="text-gray-900 font-medium">{{ movement.stock.name }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
            <p class="text-gray-900 font-mono">{{ movement.stock.sku }}</p>
          </div>

          <div v-if="movement.stock.category">
            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <p class="text-gray-900">{{ movement.stock.category }}</p>
          </div>
        </div>
      </BaseCard>
    </div>

    <div v-else class="text-center py-8">
      <i class="pi pi-box text-4xl text-gray-400 mb-4"></i>
      <p class="text-gray-500">Movement details not available</p>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/form-components/StatusBadge.vue'

const props = defineProps({
  movement: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'close'])

function formatDate(date) {
  if (!date) return '-'
  return format(new Date(date), 'MMM dd, yyyy')
}

function formatDateTime(date) {
  if (!date) return '-'
  return format(new Date(date), 'MMM dd, yyyy HH:mm:ss')
}

function getMovementTypeVariant(type) {
  const variants = {
    'IN': 'success',
    'OUT': 'danger',
    'SALE': 'info',
    'SAMPLE': 'warning',
    'ADJUSTMENT': 'secondary',
    'ALLOCATION': 'info',
    'REPLENISHMENT': 'success',
    'DISTRIBUTION': 'info',
    'RETURN': 'warning'
  }
  return variants[type] || 'secondary'
}

function getQuantityClass(type) {
  if (['IN', 'REPLENISHMENT', 'RETURN'].includes(type)) {
    return 'text-green-600'
  } else if (['OUT', 'SALE', 'SAMPLE', 'DISTRIBUTION', 'ALLOCATION'].includes(type)) {
    return 'text-red-600'
  }
  return 'text-gray-600'
}

function getQuantityDisplay(quantity, type) {
  if (['IN', 'REPLENISHMENT', 'RETURN'].includes(type)) {
    return `+${quantity}`
  } else if (['OUT', 'SALE', 'SAMPLE', 'DISTRIBUTION', 'ALLOCATION'].includes(type)) {
    return `-${quantity}`
  }
  return quantity
}

function getMovementDescription(type, quantity) {
  const descriptions = {
    'IN': `Added ${quantity} units`,
    'OUT': `Removed ${quantity} units`,
    'SALE': `Sold ${quantity} units`,
    'SAMPLE': `Gave ${quantity} samples`,
    'ADJUSTMENT': `Adjusted by ${quantity} units`,
    'ALLOCATION': `Allocated ${quantity} units`,
    'REPLENISHMENT': `Replenished ${quantity} units`,
    'DISTRIBUTION': `Distributed ${quantity} units`,
    'RETURN': `Returned ${quantity} units`
  }
  return descriptions[type] || `Moved ${quantity} units`
}
</script>
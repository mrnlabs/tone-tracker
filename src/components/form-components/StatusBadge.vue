<!-- 4. StatusBadge.vue - Status indicator component -->
<template>
  <Tag
      :value="status"
      :class="[
      'status-badge',
      `status-${normalizedStatus}`
    ]"
      :icon="statusIcon"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const normalizedStatus = computed(() => {
  return props.status.toLowerCase().replace(/\s+/g, '-')
})

const statusIcon = computed(() => {
  const iconMap = {
    'active': 'pi-check-circle',
    'inactive': 'pi-times-circle',
    'pending': 'pi-clock',
    'completed': 'pi-check',
    'cancelled': 'pi-ban',
    'in-progress': 'pi-spinner',
    'planning': 'pi-calendar',
    'draft': 'pi-file-edit'
  }
  return iconMap[normalizedStatus.value] || 'pi-circle'
})
</script>

<style scoped>
.status-badge {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.status-active {
  background-color: #10b981;
  color: white;
}

.status-inactive {
  background-color: #6b7280;
  color: white;
}

.status-pending {
  background-color: #f59e0b;
  color: white;
}

.status-completed {
  background-color: #059669;
  color: white;
}

.status-cancelled {
  background-color: #dc2626;
  color: white;
}

.status-in-progress {
  background-color: #3b82f6;
  color: white;
}

.status-planning {
  background-color: #8b5cf6;
  color: white;
}

.status-draft {
  background-color: #9ca3af;
  color: white;
}
</style>
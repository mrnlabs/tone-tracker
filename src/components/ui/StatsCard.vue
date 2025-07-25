<template>
  <BaseCard 
    class="stats-card cursor-pointer transition-all duration-200 hover:shadow-lg"
    :class="{ 'hover:scale-105': clickable }"
    @click="handleClick"
  >
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-600 mb-1">{{ title }}</p>
        <p class="text-2xl font-bold" :class="colorClasses.text">{{ value }}</p>
        
        <!-- Change indicator -->
        <div v-if="change" class="flex items-center mt-2">
          <div 
            class="flex items-center px-2 py-1 rounded-full text-xs font-medium"
            :class="change.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
          >
            <i 
              class="pi text-xs mr-1" 
              :class="change.trend === 'up' ? 'pi-arrow-up' : 'pi-arrow-down'"
            ></i>
            {{ change.value }}{{ typeof change.value === 'number' ? '%' : '' }}
          </div>
          <span class="text-xs text-gray-500 ml-2">vs last period</span>
        </div>
      </div>
      
      <div class="flex-shrink-0">
        <div 
          class="w-12 h-12 rounded-full flex items-center justify-center"
          :class="colorClasses.background"
        >
          <i :class="[icon, 'text-xl', colorClasses.icon]"></i>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'red', 'yellow', 'purple', 'gray'].includes(value)
  },
  change: {
    type: Object,
    default: null
    // Expected format: { value: number|string, trend: 'up'|'down' }
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const colorClasses = computed(() => {
  const colorMap = {
    blue: {
      background: 'bg-blue-100',
      icon: 'text-blue-600',
      text: 'text-blue-600'
    },
    green: {
      background: 'bg-green-100',
      icon: 'text-green-600',
      text: 'text-green-600'
    },
    red: {
      background: 'bg-red-100',
      icon: 'text-red-600',
      text: 'text-red-600'
    },
    yellow: {
      background: 'bg-yellow-100',
      icon: 'text-yellow-600',
      text: 'text-yellow-600'
    },
    purple: {
      background: 'bg-purple-100',
      icon: 'text-purple-600',
      text: 'text-purple-600'
    },
    gray: {
      background: 'bg-gray-100',
      icon: 'text-gray-600',
      text: 'text-gray-600'
    }
  }
  
  return colorMap[props.color] || colorMap.blue
})

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style scoped>
.stats-card:hover {
  border-color: var(--primary-color);
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
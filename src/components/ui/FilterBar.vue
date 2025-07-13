<template>
  <Card class="filter-bar">
    <template #content>
      <div class="filters-row">
        <!-- Search Field -->
        <div v-if="showSearch" class="search-field">
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText
                :model-value="search"
                @update:model-value="handleSearchUpdate"
                :placeholder="searchPlaceholder"
                @input="debouncedSearch"
            />
          </span>
        </div>

        <!-- Dynamic Filters -->
        <div v-for="filter in filters" :key="filter.key" class="filter-field">
          <!-- Dropdown Filter -->
          <Dropdown
              v-if="filter.type === 'dropdown'"
              :model-value="filterValues[filter.key]"
              @update:model-value="(value) => updateFilter(filter.key, value)"
              :options="filter.options"
              :option-label="filter.optionLabel || 'label'"
              :option-value="filter.optionValue || 'value'"
              :placeholder="filter.placeholder"
              :show-clear="filter.showClear !== false"
              @change="handleFilterChange"
          />

          <!-- Multi-Select Filter -->
          <MultiSelect
              v-else-if="filter.type === 'multiselect'"
              :model-value="filterValues[filter.key]"
              @update:model-value="(value) => updateFilter(filter.key, value)"
              :options="filter.options"
              :option-label="filter.optionLabel || 'label'"
              :option-value="filter.optionValue || 'value'"
              :placeholder="filter.placeholder"
              :max-selected-labels="filter.maxSelectedLabels || 3"
              @change="handleFilterChange"
          />

          <!-- Date Range Filter -->
          <Calendar
              v-else-if="filter.type === 'daterange'"
              :model-value="filterValues[filter.key]"
              @update:model-value="(value) => updateFilter(filter.key, value)"
              selection-mode="range"
              :placeholder="filter.placeholder"
              date-format="mm/dd/yy"
              @date-select="handleFilterChange"
          />

          <!-- Checkbox Filter -->
          <div v-else-if="filter.type === 'checkbox'" class="checkbox-filter">
            <Checkbox
                :model-value="filterValues[filter.key]"
                @update:model-value="(value) => updateFilter(filter.key, value)"
                :binary="true"
                @change="handleFilterChange"
            />
            <label>{{ filter.label }}</label>
          </div>
        </div>

        <!-- Reset Button -->
        <Button
            @click="resetFilters"
            icon="pi pi-filter-slash"
            label="Reset"
            class="p-button-outlined"
            :disabled="!hasActiveFilters"
        />
      </div>
    </template>
  </Card>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, watch } from 'vue'

// Simple debounce function
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const props = defineProps({
  search: {
    type: String,
    default: ''
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...'
  },
  showSearch: {
    type: Boolean,
    default: true
  },
  filters: {
    type: Array,
    default: () => []
  },
  filterValues: {
    type: Object,
    default: () => ({})
  },
  debounceMs: {
    type: Number,
    default: 300
  }
})

const emit = defineEmits(['update:search', 'update:filterValues', 'search', 'filter', 'reset'])

const localFilterValues = ref({ ...props.filterValues })

// Watch for external changes to filterValues
watch(() => props.filterValues, (newValues) => {
  localFilterValues.value = { ...newValues }
}, { deep: true })

const hasActiveFilters = computed(() => {
  if (props.search) return true
  
  return Object.values(localFilterValues.value).some(value => {
    if (Array.isArray(value)) return value.length > 0
    return value !== null && value !== undefined && value !== ''
  })
})

const debouncedSearch = debounce((event) => {
  const value = event.target.value
  emit('update:search', value)
  emit('search', value)
}, props.debounceMs)

const handleSearchUpdate = (value) => {
  emit('update:search', value)
}

const updateFilter = (key, value) => {
  localFilterValues.value[key] = value
  emit('update:filterValues', { ...localFilterValues.value })
}

const handleFilterChange = () => {
  emit('filter', { ...localFilterValues.value })
}

const resetFilters = () => {
  localFilterValues.value = {}
  emit('update:search', '')
  emit('update:filterValues', {})
  emit('reset')
}
</script>

<style scoped>
.filter-bar {
  margin-bottom: 1.5rem;
}

.filters-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-field {
  flex: 1;
  min-width: 250px;
}

.filter-field {
  min-width: 200px;
}

.checkbox-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.checkbox-filter label {
  margin: 0;
  cursor: pointer;
  color: #374151;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-field,
  .filter-field {
    min-width: auto;
    width: 100%;
  }

  .checkbox-filter {
    justify-content: center;
  }
}
</style>
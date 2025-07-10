<template>
  <div class="base-table-wrapper">
    <!-- Table Header -->
    <div v-if="showHeader" class="table-header">
      <div class="header-left">
        <h3 v-if="title" class="table-title">{{ title }}</h3>
        <p v-if="subtitle" class="table-subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions || actions.length > 0" class="header-actions">
        <slot name="actions">
          <BaseButton
              v-for="action in actions"
              :key="action.id"
              :variant="action.variant || 'primary'"
              :size="action.size || 'medium'"
              :icon="action.icon"
              :label="action.label"
              :disabled="action.disabled"
              @click="$emit('action', action)"
          />
        </slot>
      </div>
    </div>

    <!-- Search and Filters -->
    <div v-if="showFilters" class="table-filters">
      <div class="filters-left">
        <BaseInput
            v-if="searchable"
            v-model="searchTerm"
            :placeholder="searchPlaceholder"
            icon="pi pi-search"
            size="medium"
            @input="handleSearch"
        />

        <BaseDropdown
            v-if="showPageSize"
            v-model="selectedPageSize"
            :options="pageSizeOptions"
            :placeholder="'Rows per page'"
            size="medium"
            style="min-width: 140px"
            @change="handlePageSizeChange"
        />
      </div>

      <div v-if="$slots.filters" class="filters-right">
        <slot name="filters" />
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-container" :class="tableContainerClasses">
      <DataTable
          :value="processedData"
          :class="tableClasses"
          :loading="loading"
          :paginator="paginator"
          :rows="currentPageSize"
          :total-records="totalRecords"
          :lazy="lazy"
          :first="first"
          :selection="selectedRows"
          :selection-mode="selectionMode"
          :meta-key-selection="metaKeySelection"
          :sort-field="sortField"
          :sort-order="sortOrder"
          :multi-sort-meta="multiSortMeta"
          :removable-sort="removableSort"
          :resizable-columns="resizableColumns"
          :column-resize-mode="columnResizeMode"
          :reorderable-columns="reorderableColumns"
          :scrollable="scrollable"
          :scroll-height="scrollHeight"
          :virtual-scroller="virtualScroller"
          :virtual-scroller-options="virtualScrollerOptions"
          :responsive-layout="responsiveLayout"
          :breakpoint="breakpoint"
          :show-gridlines="showGridlines"
          :striped-rows="stripedRows"
          :hover="hover"
          :size="tableSize"
          v-bind="$attrs"
          @page="handlePage"
          @sort="handleSort"
          @selection-change="handleSelectionChange"
          @row-click="handleRowClick"
          @row-dblclick="handleRowDblClick"
          @row-select="handleRowSelect"
          @row-unselect="handleRowUnselect"
          @select-all-change="handleSelectAllChange"
      >
        <!-- Dynamic columns -->
        <Column
            v-if="selectionMode && selectionMode !== 'single'"
            selection-mode="multiple"
            :style="{ width: '3rem' }"
            :exportable="false"
        />

        <Column
            v-for="col in processedColumns"
            :key="col.field || col.key"
            :field="col.field"
            :header="col.header"
            :sortable="col.sortable !== false && sortable"
            :filter="col.filter"
            :filter-placeholder="col.filterPlaceholder"
            :filter-match-mode="col.filterMatchMode"
            :show-filter-menu="col.showFilterMenu"
            :show-filter-operator="col.showFilterOperator"
            :show-clear-button="col.showClearButton"
            :show-apply-button="col.showApplyButton"
            :show-match-modes="col.showMatchModes"
            :style="col.style"
            :class="col.class"
            :body-style="col.bodyStyle"
            :body-class="col.bodyClass"
            :header-style="col.headerStyle"
            :header-class="col.headerClass"
            :frozen="col.frozen"
            :align-frozen="col.alignFrozen"
            :exportable="col.exportable !== false"
            :hidden="col.hidden"
        >
          <!-- Custom header template -->
          <template v-if="col.headerTemplate || $slots[`header-${col.field}`]" #header>
            <slot :name="`header-${col.field}`" :column="col">
              <component :is="col.headerTemplate" :column="col" />
            </slot>
          </template>

          <!-- Custom body template -->
          <template #body="slotProps">
            <slot :name="`body-${col.field}`" v-bind="slotProps" :column="col">
              <component
                  v-if="col.bodyTemplate"
                  :is="col.bodyTemplate"
                  v-bind="slotProps"
                  :column="col"
              />
              <span v-else>{{ getFieldValue(slotProps.data, col.field) }}</span>
            </slot>
          </template>

          <!-- Custom filter template -->
          <template v-if="col.filterTemplate || $slots[`filter-${col.field}`]" #filter="filterProps">
            <slot :name="`filter-${col.field}`" v-bind="filterProps" :column="col">
              <component :is="col.filterTemplate" v-bind="filterProps" :column="col" />
            </slot>
          </template>
        </Column>

        <!-- Actions column -->
        <Column
            v-if="showActions"
            :header="actionsHeader"
            :style="actionsStyle"
            :frozen="actionsFrozen"
            :align-frozen="actionsAlignFrozen"
            :exportable="false"
        >
          <template #body="slotProps">
            <slot name="actions" v-bind="slotProps">
              <div class="table-actions">
                <BaseButton
                    v-for="action in getRowActions(slotProps.data)"
                    :key="action.id"
                    :variant="action.variant || 'text'"
                    :size="action.size || 'small'"
                    :icon="action.icon"
                    :label="action.label"
                    :disabled="action.disabled"
                    :tooltip="action.tooltip"
                    @click="$emit('rowAction', { action, row: slotProps.data, index: slotProps.index })"
                />
              </div>
            </slot>
          </template>
        </Column>

        <!-- Empty state -->
        <template #empty>
          <slot name="empty">
            <div class="table-empty-state">
              <div class="empty-icon">
                <i class="pi pi-inbox" />
              </div>
              <h4>{{ emptyMessage }}</h4>
              <p v-if="emptyDescription">{{ emptyDescription }}</p>
              <BaseButton
                  v-if="emptyAction"
                  :variant="emptyAction.variant || 'primary'"
                  :icon="emptyAction.icon"
                  :label="emptyAction.label"
                  @click="$emit('emptyAction', emptyAction)"
              />
            </div>
          </slot>
        </template>

        <!-- Loading template -->
        <template #loading>
          <slot name="loading">
            <div class="table-loading">
              <ProgressSpinner />
              <p>{{ loadingMessage }}</p>
            </div>
          </slot>
        </template>
      </DataTable>
    </div>

    <!-- Table Footer -->
    <div v-if="showFooter" class="table-footer">
      <div class="footer-left">
        <slot name="footer-left">
          <span v-if="showInfo" class="table-info">
            {{ getTableInfo() }}
          </span>
        </slot>
      </div>
      <div class="footer-right">
        <slot name="footer-right" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import BaseButton from './BaseButton.vue'
import BaseInput from './BaseInput.vue'
import BaseDropdown from './BaseDropdown.vue'

const props = defineProps({
  // Data props
  data: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingMessage: {
    type: String,
    default: 'Loading data...'
  },

  // Header props
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  actions: {
    type: Array,
    default: () => []
  },
  showHeader: {
    type: Boolean,
    default: true
  },

  // Table behavior props
  selectionMode: {
    type: String,
    default: null,
    validator: (value) => [null, 'single', 'multiple'].includes(value)
  },
  selectedRows: {
    type: [Object, Array],
    default: null
  },
  metaKeySelection: {
    type: Boolean,
    default: true
  },

  // Pagination props
  paginator: {
    type: Boolean,
    default: true
  },
  rows: {
    type: Number,
    default: 10
  },
  totalRecords: {
    type: Number,
    default: 0
  },
  lazy: {
    type: Boolean,
    default: false
  },
  first: {
    type: Number,
    default: 0
  },
  pageSizeOptions: {
    type: Array,
    default: () => [
      { label: '5', value: 5 },
      { label: '10', value: 10 },
      { label: '25', value: 25 },
      { label: '50', value: 50 }
    ]
  },
  showPageSize: {
    type: Boolean,
    default: true
  },

  // Sorting props
  sortable: {
    type: Boolean,
    default: true
  },
  sortField: {
    type: String,
    default: null
  },
  sortOrder: {
    type: Number,
    default: null
  },
  multiSortMeta: {
    type: Array,
    default: null
  },
  removableSort: {
    type: Boolean,
    default: false
  },

  // Column props
  resizableColumns: {
    type: Boolean,
    default: false
  },
  columnResizeMode: {
    type: String,
    default: 'fit',
    validator: (value) => ['fit', 'expand'].includes(value)
  },
  reorderableColumns: {
    type: Boolean,
    default: false
  },

  // Display props
  size: {
    type: String,
    default: 'normal',
    validator: (value) => ['small', 'normal', 'large'].includes(value)
  },
  tableSize: {
    type: String,
    default: 'normal',
    validator: (value) => ['small', 'normal', 'large'].includes(value)
  },
  showGridlines: {
    type: Boolean,
    default: false
  },
  stripedRows: {
    type: Boolean,
    default: true
  },
  hover: {
    type: Boolean,
    default: true
  },
  responsiveLayout: {
    type: String,
    default: 'scroll',
    validator: (value) => ['stack', 'scroll'].includes(value)
  },
  breakpoint: {
    type: String,
    default: '960px'
  },

  // Scrolling props
  scrollable: {
    type: Boolean,
    default: false
  },
  scrollHeight: {
    type: String,
    default: '400px'
  },
  virtualScroller: {
    type: Boolean,
    default: false
  },
  virtualScrollerOptions: {
    type: Object,
    default: () => ({})
  },

  // Search props
  searchable: {
    type: Boolean,
    default: true
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...'
  },
  searchFields: {
    type: Array,
    default: () => []
  },
  showFilters: {
    type: Boolean,
    default: true
  },

  // Actions column props
  showActions: {
    type: Boolean,
    default: false
  },
  actionsHeader: {
    type: String,
    default: 'Actions'
  },
  actionsStyle: {
    type: Object,
    default: () => ({ width: '120px' })
  },
  actionsFrozen: {
    type: Boolean,
    default: false
  },
  actionsAlignFrozen: {
    type: String,
    default: 'right'
  },
  rowActions: {
    type: Array,
    default: () => []
  },

  // Empty state props
  emptyMessage: {
    type: String,
    default: 'No data found'
  },
  emptyDescription: {
    type: String,
    default: ''
  },
  emptyAction: {
    type: Object,
    default: null
  },

  // Footer props
  showFooter: {
    type: Boolean,
    default: true
  },
  showInfo: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'action',
  'rowAction',
  'emptyAction',
  'page',
  'sort',
  'selection-change',
  'row-click',
  'row-dblclick',
  'row-select',
  'row-unselect',
  'select-all-change',
  'search'
])

// Reactive state
const searchTerm = ref('')
const selectedPageSize = ref(props.rows)
const currentPageSize = ref(props.rows)

// Computed properties
const processedColumns = computed(() => {
  return props.columns.map(col => ({
    ...col,
    sortable: col.sortable !== false && props.sortable
  }))
})

const processedData = computed(() => {
  if (props.lazy) {
    return props.data
  }

  let filtered = [...props.data]

  // Apply search filter
  if (searchTerm.value && props.searchable) {
    const searchFields = props.searchFields.length > 0
        ? props.searchFields
        : props.columns.map(col => col.field).filter(Boolean)

    filtered = filtered.filter(item => {
      return searchFields.some(field => {
        const value = getFieldValue(item, field)
        return String(value).toLowerCase().includes(searchTerm.value.toLowerCase())
      })
    })
  }

  return filtered
})

const tableClasses = computed(() => {
  const classes = ['base-table']

  classes.push(`table-${props.size}`)

  if (props.showGridlines) classes.push('p-datatable-gridlines')
  if (props.stripedRows) classes.push('p-datatable-striped')
  if (props.hover) classes.push('p-datatable-hoverable-rows')

  return classes.join(' ')
})

const tableContainerClasses = computed(() => {
  const classes = []

  if (props.scrollable) classes.push('table-scrollable')

  return classes.join(' ')
})

// Methods
const getFieldValue = (object, field) => {
  if (!field) return ''

  return field.split('.').reduce((obj, key) => {
    return obj && obj[key] !== undefined ? obj[key] : ''
  }, object)
}

const getRowActions = (rowData) => {
  if (typeof props.rowActions === 'function') {
    return props.rowActions(rowData)
  }
  return props.rowActions
}

const getTableInfo = () => {
  const total = props.lazy ? props.totalRecords : processedData.value.length
  const start = props.first + 1
  const end = Math.min(props.first + currentPageSize.value, total)

  return `Showing ${start} to ${end} of ${total} entries`
}

// Event handlers
const handleSearch = () => {
  emit('search', searchTerm.value)
}

const handlePageSizeChange = () => {
  currentPageSize.value = selectedPageSize.value
}

const handlePage = (event) => {
  emit('page', event)
}

const handleSort = (event) => {
  emit('sort', event)
}

const handleSelectionChange = (event) => {
  emit('selection-change', event)
}

const handleRowClick = (event) => {
  emit('row-click', event)
}

const handleRowDblClick = (event) => {
  emit('row-dblclick', event)
}

const handleRowSelect = (event) => {
  emit('row-select', event)
}

const handleRowUnselect = (event) => {
  emit('row-unselect', event)
}

const handleSelectAllChange = (event) => {
  emit('select-all-change', event)
}

// Watch for changes
watch(() => props.rows, (newValue) => {
  selectedPageSize.value = newValue
  currentPageSize.value = newValue
})
</script>

<style scoped>
.base-table-wrapper {
  background: var(--bg-primary, #ffffff);
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

/* Header styles */
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-light, #e5e7eb);
  background: var(--bg-secondary, #f9fafb);
}

.header-left {
  flex: 1;
}

.table-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #111827);
}

.table-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

/* Filters styles */
.table-filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-light, #e5e7eb);
  background: var(--bg-primary, #ffffff);
  gap: 1rem;
}

.filters-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.filters-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Table container */
.table-container {
  position: relative;
}

.table-scrollable {
  overflow: auto;
}

/* Table actions */
.table-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Empty state */
.table-empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary, #6b7280);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.table-empty-state h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary, #374151);
}

.table-empty-state p {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
}

/* Loading state */
.table-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
}

.table-loading p {
  margin: 0;
  color: var(--text-secondary, #6b7280);
}

/* Footer styles */
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-light, #e5e7eb);
  background: var(--bg-secondary, #f9fafb);
}

.table-info {
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
}

/* DataTable customizations */
:deep(.base-table.p-datatable) {
  border: none;
  border-radius: 0;
}

:deep(.base-table .p-datatable-header) {
  border: none;
  padding: 0;
  background: transparent;
}

:deep(.base-table .p-datatable-thead > tr > th) {
  background: var(--bg-secondary, #f9fafb);
  border-bottom: 1px solid var(--border-light, #e5e7eb);
  border-right: none;
  border-left: none;
  color: var(--text-primary, #374151);
  font-weight: 600;
  padding: 1rem;
  font-size: 0.875rem;
}

:deep(.base-table .p-datatable-tbody > tr > td) {
  border-bottom: 1px solid var(--border-light, #e5e7eb);
  border-right: none;
  border-left: none;
  padding: 1rem;
  color: var(--text-primary, #374151);
}

:deep(.base-table .p-datatable-tbody > tr:last-child > td) {
  border-bottom: none;
}

:deep(.base-table.p-datatable-hoverable-rows .p-datatable-tbody > tr:hover) {
  background: var(--bg-secondary, #f9fafb);
}

:deep(.base-table.p-datatable-striped .p-datatable-tbody > tr:nth-child(even)) {
  background: var(--bg-secondary, #f9fafb);
}

:deep(.base-table .p-datatable-tbody > tr.p-highlight) {
  background: rgba(59, 130, 246, 0.1);
  color: var(--text-primary, #374151);
}

/* Table sizes */
:deep(.table-small .p-datatable-thead > tr > th),
:deep(.table-small .p-datatable-tbody > tr > td) {
  padding: 0.5rem;
  font-size: 0.8rem;
}

:deep(.table-large .p-datatable-thead > tr > th),
:deep(.table-large .p-datatable-tbody > tr > td) {
  padding: 1.5rem;
  font-size: 1rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .header-actions {
    justify-content: flex-end;
  }

  .table-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .filters-left {
    flex-direction: column;
    align-items: stretch;
  }

  .table-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    text-align: center;
  }
}

</style>
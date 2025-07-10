<template>
  <DashboardLayout>
    <div class="create-warehouse-page">
      <!-- Breadcrumb Navigation -->
      <div class="breadcrumb-section">
        <Breadcrumb :model="breadcrumbItems" />
      </div>

      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1 class="page-title">Create New Warehouse</h1>
            <p class="page-description">
              Add a new warehouse location to your inventory management system
            </p>
          </div>
        </div>
      </div>

      <!-- Form Container -->
      <div class="form-container">
        <Card class="form-card">
          <template #content>
            <form @submit.prevent="submitForm" class="warehouse-form">
              <!-- Basic Information Section -->
              <div class="form-section">
                <h3 class="section-title">Basic Information</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label for="name" class="form-label">Warehouse Name *</label>
                    <InputText
                        id="name"
                        v-model="form.name"
                        :class="{ 'p-invalid': errors.name }"
                        placeholder="Enter warehouse name"
                        class="form-input"
                    />
                    <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                  </div>

                  <div class="form-group">
                    <label for="code" class="form-label">Warehouse Code *</label>
                    <InputText
                        id="code"
                        v-model="form.code"
                        :class="{ 'p-invalid': errors.code }"
                        placeholder="e.g., WH-001"
                        class="form-input"
                    />
                    <small v-if="errors.code" class="p-error">{{ errors.code }}</small>
                  </div>

                  <div class="form-group">
                    <label for="type" class="form-label">Warehouse Type *</label>
                    <Dropdown
                        id="type"
                        v-model="form.type"
                        :options="warehouseTypes"
                        option-label="label"
                        option-value="value"
                        :class="{ 'p-invalid': errors.type }"
                        placeholder="Select warehouse type"
                        class="form-input"
                    />
                    <small v-if="errors.type" class="p-error">{{ errors.type }}</small>
                  </div>

                  <div class="form-group">
                    <label for="status" class="form-label">Status *</label>
                    <Dropdown
                        id="status"
                        v-model="form.status"
                        :options="statusOptions"
                        option-label="label"
                        option-value="value"
                        :class="{ 'p-invalid': errors.status }"
                        placeholder="Select status"
                        class="form-input"
                    />
                    <small v-if="errors.status" class="p-error">{{ errors.status }}</small>
                  </div>
                </div>
              </div>

              <!-- Location Information Section -->
              <div class="form-section">
                <h3 class="section-title">Location Information</h3>
                <div class="form-grid">
                  <div class="form-group full-width">
                    <label for="address" class="form-label">Address *</label>
                    <Textarea
                        id="address"
                        v-model="form.address"
                        :class="{ 'p-invalid': errors.address }"
                        placeholder="Enter complete address"
                        rows="3"
                        class="form-input"
                    />
                    <small v-if="errors.address" class="p-error">{{ errors.address }}</small>
                  </div>

                  <div class="form-group">
                    <label for="city" class="form-label">City *</label>
                    <InputText
                        id="city"
                        v-model="form.city"
                        :class="{ 'p-invalid': errors.city }"
                        placeholder="Enter city"
                        class="form-input"
                    />
                    <small v-if="errors.city" class="p-error">{{ errors.city }}</small>
                  </div>

                  <div class="form-group">
                    <label for="country" class="form-label">Country *</label>
                    <Dropdown
                        id="country"
                        v-model="form.country"
                        :options="countryOptions"
                        option-label="label"
                        option-value="value"
                        :class="{ 'p-invalid': errors.country }"
                        placeholder="Select country"
                        class="form-input"
                    />
                    <small v-if="errors.country" class="p-error">{{ errors.country }}</small>
                  </div>

                  <div class="form-group">
                    <label for="postalCode" class="form-label">Postal Code</label>
                    <InputText
                        id="postalCode"
                        v-model="form.postalCode"
                        placeholder="Enter postal code"
                        class="form-input"
                    />
                  </div>
                </div>
              </div>

              <!-- Capacity Information Section -->
              <div class="form-section">
                <h3 class="section-title">Capacity Information</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label for="totalCapacity" class="form-label">Total Capacity (units) *</label>
                    <InputNumber
                        id="totalCapacity"
                        v-model="form.totalCapacity"
                        :class="{ 'p-invalid': errors.totalCapacity }"
                        placeholder="Enter total capacity"
                        :min="1"
                        class="form-input"
                    />
                    <small v-if="errors.totalCapacity" class="p-error">{{ errors.totalCapacity }}</small>
                  </div>

                  <div class="form-group">
                    <label for="availableCapacity" class="form-label">Available Capacity (units) *</label>
                    <InputNumber
                        id="availableCapacity"
                        v-model="form.availableCapacity"
                        :class="{ 'p-invalid': errors.availableCapacity }"
                        placeholder="Enter available capacity"
                        :min="0"
                        :max="form.totalCapacity"
                        class="form-input"
                    />
                    <small v-if="errors.availableCapacity" class="p-error">{{ errors.availableCapacity }}</small>
                  </div>

                  <div class="form-group">
                    <label for="unit" class="form-label">Capacity Unit *</label>
                    <Dropdown
                        id="unit"
                        v-model="form.unit"
                        :options="unitOptions"
                        option-label="label"
                        option-value="value"
                        :class="{ 'p-invalid': errors.unit }"
                        placeholder="Select unit"
                        class="form-input"
                    />
                    <small v-if="errors.unit" class="p-error">{{ errors.unit }}</small>
                  </div>
                </div>
              </div>

              <!-- Manager Information Section -->
              <div class="form-section">
                <h3 class="section-title">Manager Information</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label for="managerId" class="form-label">Warehouse Manager *</label>
                    <Dropdown
                        id="managerId"
                        v-model="form.managerId"
                        :options="managerOptions"
                        option-label="name"
                        option-value="id"
                        :class="{ 'p-invalid': errors.managerId }"
                        placeholder="Select warehouse manager"
                        class="form-input"
                    />
                    <small v-if="errors.managerId" class="p-error">{{ errors.managerId }}</small>
                  </div>

                  <div class="form-group">
                    <label for="contactPhone" class="form-label">Contact Phone</label>
                    <InputText
                        id="contactPhone"
                        v-model="form.contactPhone"
                        placeholder="Enter contact phone"
                        class="form-input"
                    />
                  </div>

                  <div class="form-group">
                    <label for="contactEmail" class="form-label">Contact Email</label>
                    <InputText
                        id="contactEmail"
                        v-model="form.contactEmail"
                        type="email"
                        placeholder="Enter contact email"
                        class="form-input"
                    />
                  </div>
                </div>
              </div>

              <!-- Additional Information Section -->
              <div class="form-section">
                <h3 class="section-title">Additional Information</h3>
                <div class="form-grid">
                  <div class="form-group full-width">
                    <label for="description" class="form-label">Description</label>
                    <Textarea
                        id="description"
                        v-model="form.description"
                        placeholder="Enter warehouse description"
                        rows="3"
                        class="form-input"
                    />
                  </div>

                  <div class="form-group full-width">
                    <label for="notes" class="form-label">Notes</label>
                    <Textarea
                        id="notes"
                        v-model="form.notes"
                        placeholder="Enter any additional notes"
                        rows="3"
                        class="form-input"
                    />
                  </div>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="form-actions">
                <Button
                    type="button"
                    label="Cancel"
                    icon="pi pi-times"
                    class="p-button-text"
                    @click="cancelForm"
                />
                <Button
                    type="submit"
                    label="Create Warehouse"
                    icon="pi pi-check"
                    class="p-button-success"
                    :loading="loading"
                    :disabled="!isFormValid"
                />
              </div>
            </form>
          </template>
        </Card>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useWarehouseNavigation } from '@/utils/warehouseNavigation'
import { useAuthStore } from '@/stores/auth'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

// Composables
const router = useRouter()
const toast = useToast()
const { navigateToWarehouses } = useWarehouseNavigation()
const authStore = useAuthStore()

// State
const loading = ref(false)
const form = ref({
  name: '',
  code: '',
  type: '',
  status: 'ACTIVE',
  address: '',
  city: '',
  country: '',
  postalCode: '',
  totalCapacity: null,
  availableCapacity: null,
  unit: 'units',
  managerId: '',
  contactPhone: '',
  contactEmail: '',
  description: '',
  notes: ''
})

const errors = ref({})
const managerOptions = ref([])

// Options
const warehouseTypes = [
  { label: 'Distribution Center', value: 'DISTRIBUTION' },
  { label: 'Storage Facility', value: 'STORAGE' },
  { label: 'Transit Hub', value: 'TRANSIT' },
  { label: 'Cold Storage', value: 'COLD_STORAGE' }
]

const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Under Construction', value: 'UNDER_CONSTRUCTION' },
  { label: 'Maintenance', value: 'MAINTENANCE' }
]

const countryOptions = [
  { label: 'South Africa', value: 'ZA' },
  { label: 'Zimbabwe', value: 'ZW' },
  { label: 'Botswana', value: 'BW' },
  { label: 'Namibia', value: 'NA' }
]

const unitOptions = [
  { label: 'Units', value: 'units' },
  { label: 'Pallets', value: 'pallets' },
  { label: 'Cubic Meters', value: 'cubic_meters' },
  { label: 'Square Meters', value: 'square_meters' }
]

// Computed
const breadcrumbItems = computed(() => [
  { label: 'Dashboard', command: () => router.push('/dashboard') },
  { label: 'Warehouses', command: () => navigateToWarehouses() },
  { label: 'Create Warehouse' }
])

const isFormValid = computed(() => {
  return form.value.name &&
      form.value.code &&
      form.value.type &&
      form.value.status &&
      form.value.address &&
      form.value.city &&
      form.value.country &&
      form.value.totalCapacity &&
      form.value.availableCapacity !== null &&
      form.value.unit &&
      form.value.managerId
})

// Methods
const validateForm = () => {
  errors.value = {}

  if (!form.value.name) errors.value.name = 'Warehouse name is required'
  if (!form.value.code) errors.value.code = 'Warehouse code is required'
  if (!form.value.type) errors.value.type = 'Warehouse type is required'
  if (!form.value.status) errors.value.status = 'Status is required'
  if (!form.value.address) errors.value.address = 'Address is required'
  if (!form.value.city) errors.value.city = 'City is required'
  if (!form.value.country) errors.value.country = 'Country is required'
  if (!form.value.totalCapacity) errors.value.totalCapacity = 'Total capacity is required'
  if (form.value.availableCapacity === null) errors.value.availableCapacity = 'Available capacity is required'
  if (!form.value.unit) errors.value.unit = 'Capacity unit is required'
  if (!form.value.managerId) errors.value.managerId = 'Warehouse manager is required'

  if (form.value.availableCapacity > form.value.totalCapacity) {
    errors.value.availableCapacity = 'Available capacity cannot exceed total capacity'
  }

  return Object.keys(errors.value).length === 0
}

const submitForm = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    // API call to create warehouse
    const response = await fetch('/api/warehouses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(form.value)
    })

    if (!response.ok) throw new Error('Failed to create warehouse')

    const warehouse = await response.json()

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Warehouse created successfully',
      life: 3000
    })

    // Navigate to warehouse details
    router.push(`/warehouses/${warehouse.id}`)

  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to create warehouse',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const cancelForm = () => {
  navigateToWarehouses()
}

const loadManagers = async () => {
  try {
    const response = await fetch('/api/users?role=WAREHOUSE_MANAGER', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    })

    if (!response.ok) throw new Error('Failed to load managers')

    const managers = await response.json()
    managerOptions.value = managers.map(manager => ({
      id: manager.id,
      name: `${manager.firstName} ${manager.lastName}`
    }))
  } catch (error) {
    console.error('Failed to load managers:', error)
  }
}

onMounted(() => {
  loadManagers()
})
</script>

<style scoped>
.create-warehouse-page {
  padding: 1.5rem;
}

.breadcrumb-section {
  margin-bottom: 1rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.page-description {
  color: #6b7280;
  margin: 0;
}

.form-container {
  max-width: 900px;
  margin: 0 auto;
}

.form-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.warehouse-form {
  padding: 1rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .create-warehouse-page {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
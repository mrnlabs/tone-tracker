<template>
  <DashboardLayout>
    <div class="create-warehouse-page">
      <!-- Page Header -->
      <PageHeader 
        title="Create New Warehouse"
        description="Add a new warehouse location to your inventory management system"
        :actions="headerActions"
        :loading="loading"
      />

      <!-- Form Container -->
      <div class="form-container">
        <Card class="form-card">
          <template #content>
            <form @submit.prevent="submitForm" class="warehouse-form">
              <!-- Warehouse Information Section -->
              <div class="form-section">
                <h3 class="section-title">Warehouse Information</h3>
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

                  <div class="form-group full-width">
                    <label for="streetAddress" class="form-label">Street Address *</label>
                    <Textarea
                        id="streetAddress"
                        v-model="form.streetAddress"
                        :class="{ 'p-invalid': errors.streetAddress }"
                        placeholder="Enter complete street address"
                        rows="3"
                        class="form-input"
                    />
                    <small v-if="errors.streetAddress" class="p-error">{{ errors.streetAddress }}</small>
                  </div>

                  <div class="form-group">
                    <label for="city" class="form-label">City</label>
                    <InputText
                        id="city"
                        v-model="form.city"
                        placeholder="Enter city"
                        class="form-input"
                    />
                  </div>

                  <div class="form-group">
                    <label for="warehouseManagerId" class="form-label">Warehouse Manager</label>
                    <Select
                        id="warehouseManagerId"
                        v-model="form.warehouseManagerId"
                        :options="managerOptions"
                        option-label="name"
                        option-value="id"
                        placeholder="Select warehouse manager"
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
import { useAuthStore } from '@/stores/auth'
import { useWarehouseStore } from '@/stores/warehouse'
import { useUsersStore } from '@/stores/user'
import { useValidation } from '@/composables/useValidation'
import { useLoading } from '@/composables/useLoading'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'

// Composables
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const warehouseStore = useWarehouseStore()
const userStore = useUsersStore()
const { validators } = useValidation()
const { withLoading, isLoading } = useLoading()

// State
const loading = computed(() => warehouseStore.isCreating)
const form = ref({
  name: '',
  streetAddress: '',
  city: '',
  warehouseManagerId: ''
})

const errors = ref({})
const managerOptions = ref([])

// No additional options needed for simplified form

// Computed
const headerActions = computed(() => [
  {
    label: 'Cancel',
    icon: 'pi pi-times',
    handler: cancelForm,
    variant: 'outlined'
  },
  {
    label: 'Save Warehouse',
    icon: 'pi pi-check',
    handler: submitForm,
    variant: 'primary',
    loading: loading.value,
    disabled: !isFormValid.value
  }
])

const isFormValid = computed(() => {
  return form.value.name &&
      form.value.streetAddress
})

// Methods
const validateForm = () => {
  errors.value = {}

  if (!form.value.name) errors.value.name = 'Warehouse name is required'
  if (!form.value.streetAddress) errors.value.streetAddress = 'Street address is required'

  return Object.keys(errors.value).length === 0
}

const submitForm = async () => {
  if (!validateForm()) return

  try {
    // Create warehouse data object matching backend entity
    const warehouseData = {
      name: form.value.name,
      streetAddress: form.value.streetAddress,
      city: form.value.city || null,
      warehouseManager: form.value.warehouseManagerId ? { id: form.value.warehouseManagerId } : null
    }

    // Use warehouse store to create warehouse
    const warehouse = await warehouseStore.createWarehouse(warehouseData)

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Warehouse created successfully',
      life: 3000
    })

    // Navigate to warehouse list
    router.push('/warehouses')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to create warehouse',
      life: 3000
    })
  }
}

const cancelForm = () => {
  router.push('/warehouses')
}

const loadManagers = async () => {
  try {
    // Load staff members who can be warehouse managers
    await userStore.getPaginated({ role: 'WAREHOUSE_MANAGER' })
    
    managerOptions.value = userStore.users
      .filter(user => user.role === 'WAREHOUSE_MANAGER')
      .map(manager => ({
        id: manager.id,
        name: `${manager.firstName} ${manager.lastName}`,
        email: manager.email
      }))
  } catch (error) {
    console.error('Failed to load managers:', error)
    managerOptions.value = []
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
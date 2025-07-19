<template>
  <DashboardLayout>
    <div class="edit-warehouse-page">
      <!-- Page Header -->
      <PageHeader 
        :title="warehouse ? `Edit ${warehouse.name}` : 'Edit Warehouse'"
        description="Update warehouse information and settings"
        :actions="headerActions"
        :loading="saving"
      />

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <ProgressSpinner />
        <p>Loading warehouse data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <EmptyState
          type="error"
          title="Error Loading Warehouse"
          :message="error"
          :actions="[{ label: 'Back to Warehouses', action: 'back', icon: 'pi pi-arrow-left' }]"
          @action="handleEmptyStateAction"
        />
      </div>

      <!-- Not Found State -->
      <div v-else-if="!warehouse" class="not-found-container">
        <EmptyState
          type="error"
          title="Warehouse Not Found"
          message="The warehouse you're trying to edit could not be found."
          :actions="[{ label: 'Back to Warehouses', action: 'back', icon: 'pi pi-arrow-left' }]"
          @action="handleEmptyStateAction"
        />
      </div>

      <!-- Edit Form -->
      <div v-else class="form-container">
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
                    label="Update Warehouse"
                    icon="pi pi-check"
                    class="p-button-success"
                    :loading="saving"
                    :disabled="!isFormValid || saving"
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
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import { useWarehouseStore } from '@/stores/warehouse'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

// Composables
const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const warehouseStore = useWarehouseStore()

// State
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const warehouse = ref(null)
const form = ref({
  name: '',
  streetAddress: '',
  city: ''
})
const errors = ref({})

// Computed
const isFormValid = computed(() => {
  return form.value.name && form.value.streetAddress
})

const headerActions = computed(() => [
  {
    label: 'Cancel',
    icon: 'pi pi-times',
    handler: cancelForm,
    variant: 'outlined'
  },
  {
    label: 'Save Changes',
    icon: 'pi pi-check',
    handler: submitForm,
    variant: 'primary',
    loading: saving.value,
    disabled: !isFormValid.value || saving.value
  }
])

// Methods
const loadWarehouseData = async () => {
  try {
    loading.value = true
    error.value = null
    const warehouseId = route.params.id

    console.log('EditWarehouse: Loading warehouse with ID:', warehouseId)

    // Load warehouse from API
    warehouse.value = await warehouseStore.getWarehouse(warehouseId)

    console.log('EditWarehouse: Warehouse loaded:', warehouse.value)

    if (warehouse.value) {
      // Populate form with warehouse data
      form.value = {
        name: warehouse.value.name || '',
        streetAddress: warehouse.value.streetAddress || '',
        city: warehouse.value.city || ''
      }
      console.log('EditWarehouse: Form populated:', form.value)
    }
    
  } catch (err) {
    error.value = err.message || 'Failed to load warehouse data'
    console.error('EditWarehouse: Error loading warehouse:', err)
    console.error('EditWarehouse: Error details:', {
      message: err.message,
      status: err.status,
      response: err.response
    })
  } finally {
    loading.value = false
  }
}


const validateForm = () => {
  errors.value = {}

  if (!form.value.name) errors.value.name = 'Warehouse name is required'
  if (!form.value.streetAddress) errors.value.streetAddress = 'Street address is required'

  return Object.keys(errors.value).length === 0
}

const submitForm = async () => {
  if (!validateForm()) return

  try {
    saving.value = true

    // Create warehouse data object matching backend entity
    const warehouseData = {
      name: form.value.name,
      streetAddress: form.value.streetAddress,
      city: form.value.city || null
    }

    // Use warehouse store to update warehouse
    await warehouseStore.updateWarehouse(warehouse.value.id, warehouseData)

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Warehouse updated successfully',
      life: 3000
    })

    // Navigate back to warehouse details
    router.push(`/warehouses/${warehouse.value.id}`)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to update warehouse',
      life: 3000
    })
  } finally {
    saving.value = false
  }
}

const cancelForm = () => {
  if (warehouse.value) {
    router.push(`/warehouses/${warehouse.value.id}`)
  } else {
    router.push('/warehouses')
  }
}

const handleEmptyStateAction = (action) => {
  if (action === 'back') {
    router.push('/warehouses')
  }
}

onMounted(async () => {
  await loadWarehouseData()
})
</script>

<style scoped>
.edit-warehouse-page {
  padding: 1.5rem;
}

.loading-container,
.error-container,
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
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
  .edit-warehouse-page {
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
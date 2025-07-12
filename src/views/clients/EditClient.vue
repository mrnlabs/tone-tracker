<template>
  <DashboardLayout>
    <div class="edit-client-page">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <ProgressSpinner />
        <p>Loading client data...</p>
      </div>

      <!-- Edit Client Content -->
      <div v-else-if="formData" class="edit-content">
        <!-- Page Header -->
        <div class="page-header">
          <div class="header-content">
            <div class="header-nav">
              <Button
                  @click="$router.back()"
                  icon="pi pi-arrow-left"
                  class="p-button-text"
                  label="Back to Client"
              />
            </div>
            <div class="header-info">
              <h1 class="page-title">Edit Client</h1>
              <p class="page-description">
                Update {{ formData.companyName }} information and settings
              </p>
            </div>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="edit-form">
          <div class="form-grid">
            <!-- Company Information -->
            <Card class="form-section">
              <template #header>
                <h3>Company Information</h3>
              </template>
              <template #content>
                <div class="field-grid">
                  <div class="field">
                    <label for="companyName">Company Name *</label>
                    <InputText
                        id="companyName"
                        v-model="formData.companyName"
                        :class="{ 'p-invalid': errors.companyName }"
                        placeholder="Enter company name"
                    />
                    <small v-if="errors.companyName" class="p-error">{{ errors.companyName }}</small>
                  </div>

                  <div class="field">
                    <label for="brandName">Brand Name</label>
                    <InputText
                        id="brandName"
                        v-model="formData.brandName"
                        placeholder="Enter brand name"
                    />
                  </div>

                  <div class="field">
                    <label for="businessType">Business Type</label>
                    <InputText
                        id="businessType"
                        v-model="formData.businessType"
                        placeholder="Enter business type"
                    />
                  </div>

                  <div class="field">
                    <label for="website">Website</label>
                    <InputText
                        id="website"
                        v-model="formData.website"
                        placeholder="https://example.com"
                    />
                  </div>

                  <div class="field full-width">
                    <label for="description">Description</label>
                    <Textarea
                        id="description"
                        v-model="formData.description"
                        rows="3"
                        placeholder="Describe the company"
                    />
                  </div>
                </div>
              </template>
            </Card>

            <!-- Contact Information -->
            <Card class="form-section">
              <template #header>
                <h3>Primary Contact</h3>
              </template>
              <template #content>
                <div class="field-grid">
                  <div class="field">
                    <label for="contactName">Contact Name</label>
                    <InputText
                        id="contactName"
                        v-model="formData.primaryContactName"
                        placeholder="Enter contact name"
                    />
                  </div>

                  <div class="field">
                    <label for="contactEmail">Email</label>
                    <InputText
                        id="contactEmail"
                        v-model="formData.primaryContactEmail"
                        type="email"
                        placeholder="contact@company.com"
                    />
                  </div>

                  <div class="field">
                    <label for="contactPhone">Phone</label>
                    <InputText
                        id="contactPhone"
                        v-model="formData.primaryContactPhone"
                        placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div class="field">
                    <label for="contactJobTitle">Job Title</label>
                    <InputText
                        id="contactJobTitle"
                        v-model="formData.primaryContactJobTitle"
                        placeholder="Marketing Manager"
                    />
                  </div>
                </div>
              </template>
            </Card>

            <!-- Business Details -->
            <Card class="form-section">
              <template #header>
                <h3>Business Details</h3>
              </template>
              <template #content>
                <div class="field-grid">
                  <div class="field full-width">
                    <label for="streetAddress">Street Address</label>
                    <InputText
                        id="streetAddress"
                        v-model="formData.streetAddress"
                        placeholder="123 Business Street"
                    />
                  </div>

                  <div class="field">
                    <label for="city">City</label>
                    <InputText
                        id="city"
                        v-model="formData.city"
                        placeholder="City"
                    />
                  </div>

                  <div class="field">
                    <label for="zipCode">Zip Code</label>
                    <InputText
                        id="zipCode"
                        v-model="formData.zipCode"
                        placeholder="12345"
                    />
                  </div>

                  <div class="field">
                    <label for="country">Country</label>
                    <InputText
                        id="country"
                        v-model="formData.country"
                        placeholder="Country"
                    />
                  </div>

                  <div class="field">
                    <label for="registrationNumber">Registration Number</label>
                    <InputText
                        id="registrationNumber"
                        v-model="formData.registrationNumber"
                        placeholder="REG123456"
                    />
                  </div>

                  <div class="field">
                    <label for="taxNumber">Tax Number</label>
                    <InputText
                        id="taxNumber"
                        v-model="formData.taxNumber"
                        placeholder="TAX123456"
                    />
                  </div>

                  <div class="field">
                    <label for="status">Status</label>
                    <Dropdown
                        id="status"
                        v-model="formData.status"
                        :options="statusOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select status"
                    />
                  </div>
                </div>
              </template>
            </Card>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <Button
                type="button"
                @click="$router.back()"
                label="Cancel"
                icon="pi pi-times"
                class="p-button-outlined"
            />
            <Button
                type="submit"
                label="Update Client"
                icon="pi pi-check"
                :loading="submitting"
                class="p-button-success"
            />
          </div>
        </form>
      </div>

      <!-- Client Not Found -->
      <div v-else class="not-found-container">
        <div class="not-found-content">
          <i class="pi pi-exclamation-triangle not-found-icon"></i>
          <h2>Client Not Found</h2>
          <p>The requested client could not be found or may have been removed.</p>
          <Button
              @click="$router.push('/clients')"
              label="Back to Clients"
              icon="pi pi-arrow-left"
              class="p-button-outlined"
          />
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useClientsStore } from '@/stores/client'
import { useLoading } from '@/composables/useLoading'
import DashboardLayout from '@/components/general/DashboardLayout.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const clientsStore = useClientsStore()
const { withLoading, isLoading } = useLoading()

// State
const formData = ref(null)
const errors = ref({})
const submitting = ref(false)

// Computed
const loading = computed(() => isLoading('fetch-client') || clientsStore.isLoading)

// Options
const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Pending', value: 'PENDING' }
]

// Methods
const loadClient = async () => {
  try {
    const client = await withLoading('fetch-client', () => 
      clientsStore.getClient(route.params.id)
    )
    
    // Initialize form data with client data
    formData.value = {
      companyName: client.companyName || '',
      brandName: client.brandName || '',
      description: client.description || '',
      businessType: client.businessType || '',
      streetAddress: client.streetAddress || '',
      city: client.city || '',
      zipCode: client.zipCode || '',
      country: client.country || '',
      website: client.website || '',
      registrationNumber: client.registrationNumber || '',
      taxNumber: client.taxNumber || '',
      status: client.status || 'ACTIVE',
      primaryContactName: client.primaryContactName || '',
      primaryContactEmail: client.primaryContactEmail || '',
      primaryContactPhone: client.primaryContactPhone || '',
      primaryContactJobTitle: client.primaryContactJobTitle || ''
    }
  } catch (error) {
    console.error('Failed to load client:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: clientsStore.error || 'Failed to load client',
      life: 3000
    })
  }
}

const validateForm = () => {
  errors.value = {}
  let isValid = true

  if (!formData.value.companyName?.trim()) {
    errors.value.companyName = 'Company name is required'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  submitting.value = true

  try {
    await clientsStore.updateClient(route.params.id, formData.value)

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `${formData.value.companyName} has been updated successfully`,
      life: 3000
    })

    router.push(`/clients/${route.params.id}`)
  } catch (error) {
    console.error('Failed to update client:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: clientsStore.error || 'Failed to update client',
      life: 3000
    })
  } finally {
    submitting.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadClient()
})
</script>

<style scoped>
.edit-client-page {
  padding: 1.5rem;
}

.loading-container,
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
}

.not-found-content {
  max-width: 400px;
}

.not-found-icon {
  font-size: 4rem;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.page-description {
  color: #6b7280;
  margin: 0;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.form-section {
  height: fit-content;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.field.full-width {
  grid-column: 1 / -1;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.p-error {
  color: #ef4444;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .edit-client-page {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
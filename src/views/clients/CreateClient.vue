<template>
  <DashboardLayout>
    <div class="create-client-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-nav">
            <Button
                @click="$router.back()"
                icon="pi pi-arrow-left"
                class="p-button-text"
                label="Back to Clients"
            />
          </div>
          <div class="header-info">
            <h1 class="page-title">Add New Client</h1>
            <p class="page-description">
              Create a new client profile to start managing their activations
            </p>
          </div>
        </div>
      </div>

      <!-- Progress Steps -->
      <Card class="progress-card">
        <template #content>
          <div class="progress-steps">
            <div :class="['step', { active: currentStep >= 1, completed: currentStep > 1 }]">
              <div class="step-number">1</div>
              <span class="step-label">Company Info</span>
            </div>
            <div class="step-divider"></div>
            <div :class="['step', { active: currentStep >= 2, completed: currentStep > 2 }]">
              <div class="step-number">2</div>
              <span class="step-label">Contact Details</span>
            </div>
            <div class="step-divider"></div>
            <div :class="['step', { active: currentStep >= 3, completed: currentStep > 3 }]">
              <div class="step-number">3</div>
              <span class="step-label">Business Info</span>
            </div>
            <div class="step-divider"></div>
            <div :class="['step', { active: currentStep >= 4 }]">
              <div class="step-number">4</div>
              <span class="step-label">Review</span>
            </div>
          </div>
        </template>
      </Card>

      <!-- Form Content -->
      <form @submit.prevent="handleSubmit">
        <!-- Step 1: Company Information -->
        <Card v-if="currentStep === 1" class="form-card">
          <template #header>
            <h2>Company Information</h2>
          </template>
          <template #content>
            <div class="form-grid">
              <div class="form-group">
                <label for="companyName">Company Name *</label>
                <InputText
                    id="companyName"
                    v-model="formData.companyName"
                    :class="{ 'p-invalid': errors.companyName }"
                    placeholder="Enter company name"
                />
                <small v-if="errors.companyName" class="p-error">{{ errors.companyName }}</small>
              </div>

              <div class="form-group">
                <label for="industry">Industry *</label>
                <Dropdown
                    id="industry"
                    v-model="formData.industry"
                    :options="industryOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select industry"
                    :class="{ 'p-invalid': errors.industry }"
                />
                <small v-if="errors.industry" class="p-error">{{ errors.industry }}</small>
              </div>

              <div class="form-group">
                <label for="companySize">Company Size</label>
                <Dropdown
                    id="companySize"
                    v-model="formData.companySize"
                    :options="companySizeOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select company size"
                />
              </div>

              <div class="form-group">
                <label for="website">Website</label>
                <InputText
                    id="website"
                    v-model="formData.website"
                    placeholder="https://www.company.com"
                />
              </div>

              <div class="form-group full-width">
                <label for="description">Company Description</label>
                <Textarea
                    id="description"
                    v-model="formData.description"
                    :rows="4"
                    placeholder="Brief description of the company and their products/services"
                />
              </div>

              <div class="form-group">
                <label for="brandColor">Brand Color</label>
                <div class="color-picker-group">
                  <ColorPicker v-model="formData.brandColor" />
                  <InputText
                      v-model="formData.brandColor"
                      placeholder="#3b82f6"
                      class="color-input"
                  />
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Step 2: Contact Details -->
        <Card v-if="currentStep === 2" class="form-card">
          <template #header>
            <h2>Primary Contact Information</h2>
          </template>
          <template #content>
            <div class="form-grid">
              <div class="form-group">
                <label for="contactFirstName">First Name *</label>
                <InputText
                    id="contactFirstName"
                    v-model="formData.contactPerson.firstName"
                    :class="{ 'p-invalid': errors.contactFirstName }"
                    placeholder="Enter first name"
                />
                <small v-if="errors.contactFirstName" class="p-error">{{ errors.contactFirstName }}</small>
              </div>

              <div class="form-group">
                <label for="contactLastName">Last Name *</label>
                <InputText
                    id="contactLastName"
                    v-model="formData.contactPerson.lastName"
                    :class="{ 'p-invalid': errors.contactLastName }"
                    placeholder="Enter last name"
                />
                <small v-if="errors.contactLastName" class="p-error">{{ errors.contactLastName }}</small>
              </div>

              <div class="form-group">
                <label for="contactEmail">Email Address *</label>
                <InputText
                    id="contactEmail"
                    v-model="formData.contactPerson.email"
                    type="email"
                    :class="{ 'p-invalid': errors.contactEmail }"
                    placeholder="contact@company.com"
                />
                <small v-if="errors.contactEmail" class="p-error">{{ errors.contactEmail }}</small>
              </div>

              <div class="form-group">
                <label for="contactPhone">Phone Number *</label>
                <InputText
                    id="contactPhone"
                    v-model="formData.contactPerson.phone"
                    :class="{ 'p-invalid': errors.contactPhone }"
                    placeholder="+1 (555) 123-4567"
                />
                <small v-if="errors.contactPhone" class="p-error">{{ errors.contactPhone }}</small>
              </div>

              <div class="form-group">
                <label for="contactPosition">Position/Title</label>
                <InputText
                    id="contactPosition"
                    v-model="formData.contactPerson.position"
                    placeholder="Marketing Manager"
                />
              </div>

              <div class="form-group">
                <label for="contactDepartment">Department</label>
                <Dropdown
                    id="contactDepartment"
                    v-model="formData.contactPerson.department"
                    :options="departmentOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select department"
                />
              </div>

              <div class="form-group">
                <label for="alternatePhone">Alternate Phone</label>
                <InputText
                    id="alternatePhone"
                    v-model="formData.contactPerson.alternatePhone"
                    placeholder="+1 (555) 987-6543"
                />
              </div>

              <div class="form-group">
                <label for="preferredContact">Preferred Contact Method</label>
                <Dropdown
                    id="preferredContact"
                    v-model="formData.contactPerson.preferredContactMethod"
                    :options="contactMethodOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select contact method"
                />
              </div>
            </div>
          </template>
        </Card>

        <!-- Step 3: Business Information -->
        <Card v-if="currentStep === 3" class="form-card">
          <template #header>
            <h2>Business Information</h2>
          </template>
          <template #content>
            <div class="form-grid">
              <div class="form-group">
                <label for="businessAddress">Business Address *</label>
                <InputText
                    id="businessAddress"
                    v-model="formData.businessInfo.address"
                    :class="{ 'p-invalid': errors.businessAddress }"
                    placeholder="123 Business Street"
                />
                <small v-if="errors.businessAddress" class="p-error">{{ errors.businessAddress }}</small>
              </div>

              <div class="form-group">
                <label for="city">City *</label>
                <InputText
                    id="city"
                    v-model="formData.businessInfo.city"
                    :class="{ 'p-invalid': errors.city }"
                    placeholder="New York"
                />
                <small v-if="errors.city" class="p-error">{{ errors.city }}</small>
              </div>

              <div class="form-group">
                <label for="state">State/Province *</label>
                <InputText
                    id="state"
                    v-model="formData.businessInfo.state"
                    :class="{ 'p-invalid': errors.state }"
                    placeholder="NY"
                />
                <small v-if="errors.state" class="p-error">{{ errors.state }}</small>
              </div>

              <div class="form-group">
                <label for="zipCode">ZIP/Postal Code</label>
                <InputText
                    id="zipCode"
                    v-model="formData.businessInfo.zipCode"
                    placeholder="10001"
                />
              </div>

              <div class="form-group">
                <label for="country">Country *</label>
                <Dropdown
                    id="country"
                    v-model="formData.businessInfo.country"
                    :options="countryOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select country"
                    :class="{ 'p-invalid': errors.country }"
                    filter
                />
                <small v-if="errors.country" class="p-error">{{ errors.country }}</small>
              </div>

              <div class="form-group">
                <label for="timezone">Timezone</label>
                <Dropdown
                    id="timezone"
                    v-model="formData.businessInfo.timezone"
                    :options="timezoneOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select timezone"
                    filter
                />
              </div>

              <div class="form-group">
                <label for="taxId">Tax ID/Registration Number</label>
                <InputText
                    id="taxId"
                    v-model="formData.businessInfo.taxId"
                    placeholder="12-3456789"
                />
              </div>

              <div class="form-group">
                <label for="budget">Annual Marketing Budget</label>
                <InputNumber
                    id="budget"
                    v-model="formData.businessInfo.annualBudget"
                    mode="currency"
                    currency="USD"
                    locale="en-US"
                    placeholder="100000"
                />
              </div>

              <div class="form-group full-width">
                <label for="specialRequirements">Special Requirements/Notes</label>
                <Textarea
                    id="specialRequirements"
                    v-model="formData.businessInfo.specialRequirements"
                    :rows="3"
                    placeholder="Any special requirements, preferences, or important notes about this client"
                />
              </div>

              <div class="form-group full-width">
                <div class="checkbox-group">
                  <Checkbox
                      id="contractSigned"
                      v-model="formData.businessInfo.contractSigned"
                      :binary="true"
                  />
                  <label for="contractSigned">Master Service Agreement Signed</label>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Step 4: Review -->
        <Card v-if="currentStep === 4" class="form-card">
          <template #header>
            <h2>Review Client Information</h2>
          </template>
          <template #content>
            <div class="review-sections">
              <!-- Company Information Review -->
              <div class="review-section">
                <h3>Company Information</h3>
                <div class="review-grid">
                  <div class="review-item">
                    <label>Company Name:</label>
                    <span>{{ formData.companyName }}</span>
                  </div>
                  <div class="review-item">
                    <label>Industry:</label>
                    <span>{{ formData.industry }}</span>
                  </div>
                  <div class="review-item">
                    <label>Company Size:</label>
                    <span>{{ formData.companySize || 'Not specified' }}</span>
                  </div>
                  <div class="review-item">
                    <label>Website:</label>
                    <span>{{ formData.website || 'Not provided' }}</span>
                  </div>
                  <div class="review-item full-width" v-if="formData.description">
                    <label>Description:</label>
                    <span>{{ formData.description }}</span>
                  </div>
                </div>
              </div>

              <!-- Contact Information Review -->
              <div class="review-section">
                <h3>Primary Contact</h3>
                <div class="review-grid">
                  <div class="review-item">
                    <label>Name:</label>
                    <span>{{ formData.contactPerson.firstName }} {{ formData.contactPerson.lastName }}</span>
                  </div>
                  <div class="review-item">
                    <label>Email:</label>
                    <span>{{ formData.contactPerson.email }}</span>
                  </div>
                  <div class="review-item">
                    <label>Phone:</label>
                    <span>{{ formData.contactPerson.phone }}</span>
                  </div>
                  <div class="review-item">
                    <label>Position:</label>
                    <span>{{ formData.contactPerson.position || 'Not specified' }}</span>
                  </div>
                  <div class="review-item">
                    <label>Department:</label>
                    <span>{{ formData.contactPerson.department || 'Not specified' }}</span>
                  </div>
                  <div class="review-item">
                    <label>Preferred Contact:</label>
                    <span>{{ formData.contactPerson.preferredContactMethod || 'Not specified' }}</span>
                  </div>
                </div>
              </div>

              <!-- Business Information Review -->
              <div class="review-section">
                <h3>Business Information</h3>
                <div class="review-grid">
                  <div class="review-item full-width">
                    <label>Address:</label>
                    <span>
                      {{ formData.businessInfo.address }},
                      {{ formData.businessInfo.city }},
                      {{ formData.businessInfo.state }}
                      {{ formData.businessInfo.zipCode }},
                      {{ formData.businessInfo.country }}
                    </span>
                  </div>
                  <div class="review-item">
                    <label>Timezone:</label>
                    <span>{{ formData.businessInfo.timezone || 'Not specified' }}</span>
                  </div>
                  <div class="review-item">
                    <label>Annual Budget:</label>
                    <span>{{ formData.businessInfo.annualBudget ? `${formData.businessInfo.annualBudget.toLocaleString()}` : 'Not specified' }}</span>
                  </div>
                  <div class="review-item">
                    <label>Contract Status:</label>
                    <span>{{ formData.businessInfo.contractSigned ? 'Signed' : 'Pending' }}</span>
                  </div>
                  <div class="review-item full-width" v-if="formData.businessInfo.specialRequirements">
                    <label>Special Requirements:</label>
                    <span>{{ formData.businessInfo.specialRequirements }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Form Actions -->
        <Card class="actions-card">
          <template #content>
            <div class="form-actions">
              <div class="action-buttons-left">
                <Button
                    v-if="currentStep > 1"
                    @click="previousStep"
                    label="Previous"
                    icon="pi pi-arrow-left"
                    class="p-button-outlined"
                    :disabled="loading"
                />
              </div>

              <div class="action-buttons-right">
                <Button
                    @click="$router.push('/clients')"
                    label="Cancel"
                    class="p-button-text"
                    :disabled="loading"
                />
                <Button
                    v-if="currentStep < 4"
                    @click="nextStep"
                    label="Next"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    :disabled="!isCurrentStepValid"
                />
                <Button
                    v-if="currentStep === 4"
                    type="submit"
                    label="Create Client"
                    icon="pi pi-check"
                    class="p-button-success"
                    :loading="loading"
                />
              </div>
            </div>
          </template>
        </Card>
      </form>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import DashboardLayout from '@/components/general/DashboardLayout.vue'

const router = useRouter()
const toast = useToast()

// State
const currentStep = ref(1)
const loading = ref(false)
const errors = ref({})

// Form data
const formData = ref({
  companyName: '',
  industry: '',
  companySize: '',
  website: '',
  description: '',
  brandColor: '#3b82f6',
  contactPerson: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    alternatePhone: '',
    preferredContactMethod: ''
  },
  businessInfo: {
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    timezone: '',
    taxId: '',
    annualBudget: null,
    specialRequirements: '',
    contractSigned: false
  }
})

// Options
const industryOptions = [
  { label: 'Technology', value: 'Technology' },
  { label: 'Fashion & Beauty', value: 'Fashion & Beauty' },
  { label: 'Food & Beverage', value: 'Food & Beverage' },
  { label: 'Automotive', value: 'Automotive' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Retail', value: 'Retail' },
  { label: 'Entertainment', value: 'Entertainment' },
  { label: 'Education', value: 'Education' },
  { label: 'Real Estate', value: 'Real Estate' },
  { label: 'Travel & Tourism', value: 'Travel & Tourism' },
  { label: 'Sports & Fitness', value: 'Sports & Fitness' }
]

const companySizeOptions = [
  { label: 'Startup (1-10 employees)', value: 'Startup' },
  { label: 'Small (11-50 employees)', value: 'Small' },
  { label: 'Medium (51-200 employees)', value: 'Medium' },
  { label: 'Large (201-1000 employees)', value: 'Large' },
  { label: 'Enterprise (1000+ employees)', value: 'Enterprise' }
]

const departmentOptions = [
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Sales', value: 'Sales' },
  { label: 'Operations', value: 'Operations' },
  { label: 'Executive', value: 'Executive' },
  { label: 'Product', value: 'Product' },
  { label: 'Customer Success', value: 'Customer Success' },
  { label: 'Business Development', value: 'Business Development' }
]

const contactMethodOptions = [
  { label: 'Email', value: 'Email' },
  { label: 'Phone', value: 'Phone' },
  { label: 'WhatsApp', value: 'WhatsApp' },
  { label: 'Slack', value: 'Slack' }
]

const countryOptions = [
  { label: 'United States', value: 'United States' },
  { label: 'Canada', value: 'Canada' },
  { label: 'United Kingdom', value: 'United Kingdom' },
  { label: 'Australia', value: 'Australia' },
  { label: 'Germany', value: 'Germany' },
  { label: 'France', value: 'France' },
  { label: 'South Africa', value: 'South Africa' },
  { label: 'Zimbabwe', value: 'Zimbabwe' }
]

const timezoneOptions = [
  { label: 'Eastern Time (ET)', value: 'America/New_York' },
  { label: 'Central Time (CT)', value: 'America/Chicago' },
  { label: 'Mountain Time (MT)', value: 'America/Denver' },
  { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
  { label: 'Central Africa Time (CAT)', value: 'Africa/Harare' },
  { label: 'Greenwich Mean Time (GMT)', value: 'Europe/London' }
]

// Computed
const isCurrentStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      return formData.value.companyName && formData.value.industry
    case 2:
      return formData.value.contactPerson.firstName &&
          formData.value.contactPerson.lastName &&
          formData.value.contactPerson.email &&
          formData.value.contactPerson.phone
    case 3:
      return formData.value.businessInfo.address &&
          formData.value.businessInfo.city &&
          formData.value.businessInfo.state &&
          formData.value.businessInfo.country
    default:
      return true
  }
})

// Methods
const validateStep = (step) => {
  errors.value = {}
  let isValid = true

  if (step === 1) {
    if (!formData.value.companyName) {
      errors.value.companyName = 'Company name is required'
      isValid = false
    }
    if (!formData.value.industry) {
      errors.value.industry = 'Industry is required'
      isValid = false
    }
  }

  if (step === 2) {
    if (!formData.value.contactPerson.firstName) {
      errors.value.contactFirstName = 'First name is required'
      isValid = false
    }
    if (!formData.value.contactPerson.lastName) {
      errors.value.contactLastName = 'Last name is required'
      isValid = false
    }
    if (!formData.value.contactPerson.email) {
      errors.value.contactEmail = 'Email is required'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.contactPerson.email)) {
      errors.value.contactEmail = 'Please enter a valid email address'
      isValid = false
    }
    if (!formData.value.contactPerson.phone) {
      errors.value.contactPhone = 'Phone number is required'
      isValid = false
    }
  }

  if (step === 3) {
    if (!formData.value.businessInfo.address) {
      errors.value.businessAddress = 'Business address is required'
      isValid = false
    }
    if (!formData.value.businessInfo.city) {
      errors.value.city = 'City is required'
      isValid = false
    }
    if (!formData.value.businessInfo.state) {
      errors.value.state = 'State/Province is required'
      isValid = false
    }
    if (!formData.value.businessInfo.country) {
      errors.value.country = 'Country is required'
      isValid = false
    }
  }

  return isValid
}

const nextStep = () => {
  if (validateStep(currentStep.value)) {
    currentStep.value++
  }
}

const previousStep = () => {
  currentStep.value--
  errors.value = {}
}

const handleSubmit = async () => {
  if (!validateStep(currentStep.value)) {
    return
  }

  loading.value = true

  try {
    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 2000))

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `${formData.value.companyName} has been created successfully`,
      life: 3000
    })

    router.push('/clients')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create client',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-client-page {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 1.5rem;
}

.header-nav {
  margin-bottom: 1rem;
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

.progress-card {
  margin-bottom: 1.5rem;
}

.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.step-number {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: #3b82f6;
  color: white;
}

.step.completed .step-number {
  background: #10b981;
  color: white;
}

.step-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.step.active .step-label {
  color: #3b82f6;
}

.step.completed .step-label {
  color: #10b981;
}

.step-divider {
  width: 4rem;
  height: 2px;
  background: #e5e7eb;
  margin: 0 1rem;
}

.form-card {
  margin-bottom: 1.5rem;
}

.form-card h2 {
  color: #111827;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  align-items: start;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.color-picker-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.color-input {
  flex: 1;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.checkbox-group label {
  margin: 0;
  font-weight: normal;
}

.review-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.review-section h3 {
  color: #111827;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.review-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.review-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.review-item.full-width {
  grid-column: 1 / -1;
}

.review-item label {
  font-weight: 600;
  color: #6b7280;
  font-size: 0.875rem;
}

.review-item span {
  color: #111827;
}

.actions-card {
  margin-top: 1.5rem;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons-left,
.action-buttons-right {
  display: flex;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .create-client-page {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .progress-steps {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .step-divider {
    display: none;
  }

  .form-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .action-buttons-left,
  .action-buttons-right {
    justify-content: center;
  }

  .review-grid {
    grid-template-columns: 1fr;
  }
}
</style>
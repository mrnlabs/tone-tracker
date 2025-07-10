<template>
  <DashboardLayout>
    <div class="create-activation-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-nav">
            <Button
                @click="$router.back()"
                icon="pi pi-arrow-left"
                class="p-button-text"
                label="Back to Activations"
            />
          </div>
          <div class="header-info">
            <h1 class="page-title">Create New Activation</h1>
            <p class="page-description">
              Set up a new brand activation campaign with detailed planning and team assignment
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
              <span class="step-label">Basic Info</span>
            </div>
            <div class="step-divider"></div>
            <div :class="['step', { active: currentStep >= 2, completed: currentStep > 2 }]">
              <div class="step-number">2</div>
              <span class="step-label">Schedule & Location</span>
            </div>
            <div class="step-divider"></div>
            <div :class="['step', { active: currentStep >= 3, completed: currentStep > 3 }]">
              <div class="step-number">3</div>
              <span class="step-label">Team & Resources</span>
            </div>
            <div class="step-divider"></div>
            <div :class="['step', { active: currentStep >= 4, completed: currentStep > 4 }]">
              <div class="step-number">4</div>
              <span class="step-label">Budget & Goals</span>
            </div>
            <div class="step-divider"></div>
            <div :class="['step', { active: currentStep >= 5 }]">
              <div class="step-number">5</div>
              <span class="step-label">Review</span>
            </div>
          </div>
        </template>
      </Card>

      <!-- Form Content -->
      <form @submit.prevent="handleSubmit">
        <!-- Step 1: Basic Information -->
        <Card v-if="currentStep === 1" class="form-card">
          <template #header>
            <h2>Basic Information</h2>
          </template>
          <template #content>
            <div class="form-grid">
              <div class="form-group">
                <label for="activationName">Activation Name *</label>
                <InputText
                    id="activationName"
                    v-model="formData.name"
                    :class="{ 'p-invalid': errors.name }"
                    placeholder="Enter activation name"
                />
                <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
              </div>

              <div class="form-group">
                <label for="activationCode">Activation Code</label>
                <InputText
                    id="activationCode"
                    v-model="formData.code"
                    placeholder="Auto-generated if empty"
                    :disabled="true"
                />
                <small class="p-help">Code will be auto-generated based on the activation name</small>
              </div>

              <div class="form-group">
                <label for="client">Client *</label>
                <Dropdown
                    id="client"
                    v-model="formData.clientId"
                    :options="clientOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select client"
                    :class="{ 'p-invalid': errors.clientId }"
                    filter
                />
                <small v-if="errors.clientId" class="p-error">{{ errors.clientId }}</small>
              </div>

              <div class="form-group">
                <label for="activationType">Activation Type *</label>
                <Dropdown
                    id="activationType"
                    v-model="formData.type"
                    :options="activationTypeOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select activation type"
                    :class="{ 'p-invalid': errors.type }"
                />
                <small v-if="errors.type" class="p-error">{{ errors.type }}</small>
              </div>

              <div class="form-group">
                <label for="category">Category</label>
                <Dropdown
                    id="category"
                    v-model="formData.category"
                    :options="categoryOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select category"
                />
              </div>

              <div class="form-group">
                <label for="priority">Priority Level</label>
                <Dropdown
                    id="priority"
                    v-model="formData.priority"
                    :options="priorityOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select priority"
                />
              </div>

              <div class="form-group full-width">
                <label for="description">Description *</label>
                <Textarea
                    id="description"
                    v-model="formData.description"
                    :rows="4"
                    placeholder="Describe the activation goals, target audience, and key activities"
                    :class="{ 'p-invalid': errors.description }"
                />
                <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
              </div>

              <div class="form-group full-width">
                <label for="objectives">Key Objectives</label>
                <Textarea
                    id="objectives"
                    v-model="formData.objectives"
                    :rows="3"
                    placeholder="List the main objectives and success criteria for this activation"
                />
              </div>
            </div>
          </template>
        </Card>

        <!-- Step 2: Schedule & Location -->
        <Card v-if="currentStep === 2" class="form-card">
          <template #header>
            <h2>Schedule & Location</h2>
          </template>
          <template #content>
            <div class="form-grid">
              <div class="form-group">
                <label for="startDate">Start Date *</label>
                <Calendar
                    id="startDate"
                    v-model="formData.startDate"
                    :showIcon="true"
                    :class="{ 'p-invalid': errors.startDate }"
                    dateFormat="mm/dd/yy"
                    placeholder="Select start date"
                />
                <small v-if="errors.startDate" class="p-error">{{ errors.startDate }}</small>
              </div>

              <div class="form-group">
                <label for="endDate">End Date *</label>
                <Calendar
                    id="endDate"
                    v-model="formData.endDate"
                    :showIcon="true"
                    :class="{ 'p-invalid': errors.endDate }"
                    dateFormat="mm/dd/yy"
                    placeholder="Select end date"
                    :minDate="formData.startDate"
                />
                <small v-if="errors.endDate" class="p-error">{{ errors.endDate }}</small>
              </div>

              <div class="form-group">
                <label for="startTime">Start Time</label>
                <Calendar
                    id="startTime"
                    v-model="formData.startTime"
                    :timeOnly="true"
                    :showIcon="true"
                    placeholder="Select start time"
                />
              </div>

              <div class="form-group">
                <label for="endTime">End Time</label>
                <Calendar
                    id="endTime"
                    v-model="formData.endTime"
                    :timeOnly="true"
                    :showIcon="true"
                    placeholder="Select end time"
                />
              </div>

              <div class="form-group">
                <label for="timezone">Timezone</label>
                <Dropdown
                    id="timezone"
                    v-model="formData.timezone"
                    :options="timezoneOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select timezone"
                    filter
                />
              </div>

              <div class="form-group">
                <label for="setupTime">Setup Duration (hours)</label>
                <InputNumber
                    id="setupTime"
                    v-model="formData.setupDuration"
                    :step="0.5"
                    :min="0"
                    placeholder="Setup time needed"
                />
              </div>

              <div class="form-group full-width">
                <label for="venue">Venue/Location *</label>
                <InputText
                    id="venue"
                    v-model="formData.venue"
                    :class="{ 'p-invalid': errors.venue }"
                    placeholder="Enter venue name and address"
                />
                <small v-if="errors.venue" class="p-error">{{ errors.venue }}</small>
              </div>

              <div class="form-group">
                <label for="city">City *</label>
                <InputText
                    id="city"
                    v-model="formData.city"
                    :class="{ 'p-invalid': errors.city }"
                    placeholder="Enter city"
                />
                <small v-if="errors.city" class="p-error">{{ errors.city }}</small>
              </div>

              <div class="form-group">
                <label for="state">State/Province *</label>
                <InputText
                    id="state"
                    v-model="formData.state"
                    :class="{ 'p-invalid': errors.state }"
                    placeholder="Enter state"
                />
                <small v-if="errors.state" class="p-error">{{ errors.state }}</small>
              </div>

              <div class="form-group">
                <label for="country">Country</label>
                <Dropdown
                    id="country"
                    v-model="formData.country"
                    :options="countryOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select country"
                    filter
                />
              </div>

              <div class="form-group full-width">
                <label for="venueDetails">Venue Details</label>
                <Textarea
                    id="venueDetails"
                    v-model="formData.venueDetails"
                    :rows="3"
                    placeholder="Additional venue information, directions, contact details"
                />
              </div>

              <div class="form-group full-width">
                <div class="checkbox-group">
                  <Checkbox
                      id="weatherDependent"
                      v-model="formData.weatherDependent"
                      :binary="true"
                  />
                  <label for="weatherDependent">Weather Dependent Activation</label>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Step 3: Team & Resources -->
        <Card v-if="currentStep === 3" class="form-card">
          <template #header>
            <h2>Team Assignment & Resources</h2>
          </template>
          <template #content>
            <div class="form-grid">
              <div class="form-group">
                <label for="activationManager">Activation Manager *</label>
                <Dropdown
                    id="activationManager"
                    v-model="formData.managerId"
                    :options="managerOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select activation manager"
                    :class="{ 'p-invalid': errors.managerId }"
                    filter
                />
                <small v-if="errors.managerId" class="p-error">{{ errors.managerId }}</small>
              </div>

              <div class="form-group">
                <label for="teamSize">Required Team Size</label>
                <InputNumber
                    id="teamSize"
                    v-model="formData.requiredTeamSize"
                    :min="1"
                    :max="20"
                    placeholder="Number of promoters needed"
                />
              </div>

              <div class="form-group full-width">
                <label for="promoters">Assign Promoters</label>
                <MultiSelect
                    id="promoters"
                    v-model="formData.promoterIds"
                    :options="promoterOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select promoters"
                    filter
                    :maxSelectedLabels="3"
                />
                <small class="p-help">You can assign promoters now or later</small>
              </div>

              <div class="form-group">
                <label for="warehouse">Primary Warehouse</label>
                <Dropdown
                    id="warehouse"
                    v-model="formData.warehouseId"
                    :options="warehouseOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select warehouse"
                    filter
                />
              </div>

              <div class="form-group">
                <label for="transportRequired">Transport Required</label>
                <Dropdown
                    id="transportRequired"
                    v-model="formData.transportRequired"
                    :options="[
                      { label: 'Yes - Company Vehicle', value: 'company' },
                      { label: 'Yes - Rental Required', value: 'rental' },
                      { label: 'No - Team Arranges Own', value: 'none' }
                    ]"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select transport option"
                />
              </div>

              <div class="form-group">
                <label for="equipmentNeeded">Equipment Needed</label>
                <MultiSelect
                    id="equipmentNeeded"
                    v-model="formData.equipmentNeeded"
                    :options="equipmentOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select required equipment"
                    filter
                />
              </div>

              <div class="form-group full-width">
                <label for="specialRequirements">Special Requirements</label>
                <Textarea
                    id="specialRequirements"
                    v-model="formData.specialRequirements"
                    :rows="3"
                    placeholder="Any special requirements, certifications, or qualifications needed"
                />
              </div>

              <div class="form-group full-width">
                <label for="safetyRequirements">Safety & Compliance</label>
                <div class="checkbox-list">
                  <div class="checkbox-group">
                    <Checkbox
                        id="safetyBriefing"
                        v-model="formData.safetyBriefingRequired"
                        :binary="true"
                    />
                    <label for="safetyBriefing">Safety Briefing Required</label>
                  </div>
                  <div class="checkbox-group">
                    <Checkbox
                        id="permits"
                        v-model="formData.permitsRequired"
                        :binary="true"
                    />
                    <label for="permits">Permits/Licenses Required</label>
                  </div>
                  <div class="checkbox-group">
                    <Checkbox
                        id="insurance"
                        v-model="formData.insuranceRequired"
                        :binary="true"
                    />
                    <label for="insurance">Additional Insurance Required</label>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Step 4: Budget & Goals -->
        <Card v-if="currentStep === 4" class="form-card">
          <template #header>
            <h2>Budget & Performance Goals</h2>
          </template>
          <template #content>
            <div class="form-grid">
              <div class="form-group">
                <label for="totalBudget">Total Budget *</label>
                <InputNumber
                    id="totalBudget"
                    v-model="formData.totalBudget"
                    mode="currency"
                    currency="USD"
                    locale="en-US"
                    :class="{ 'p-invalid': errors.totalBudget }"
                    placeholder="Enter total budget"
                />
                <small v-if="errors.totalBudget" class="p-error">{{ errors.totalBudget }}</small>
              </div>

              <div class="form-group">
                <label for="staffCosts">Staff Costs</label>
                <InputNumber
                    id="staffCosts"
                    v-model="formData.staffCosts"
                    mode="currency"
                    currency="USD"
                    locale="en-US"
                    placeholder="Estimated staff costs"
                />
              </div>

              <div class="form-group">
                <label for="materialCosts">Material Costs</label>
                <InputNumber
                    id="materialCosts"
                    v-model="formData.materialCosts"
                    mode="currency"
                    currency="USD"
                    locale="en-US"
                    placeholder="Materials and supplies"
                />
              </div>

              <div class="form-group">
                <label for="venueCosts">Venue/Location Costs</label>
                <InputNumber
                    id="venueCosts"
                    v-model="formData.venueCosts"
                    mode="currency"
                    currency="USD"
                    locale="en-US"
                    placeholder="Venue rental and fees"
                />
              </div>

              <div class="form-group">
                <label for="transportCosts">Transport Costs</label>
                <InputNumber
                    id="transportCosts"
                    v-model="formData.transportCosts"
                    mode="currency"
                    currency="USD"
                    locale="en-US"
                    placeholder="Transportation expenses"
                />
              </div>

              <div class="form-group">
                <label for="otherCosts">Other Costs</label>
                <InputNumber
                    id="otherCosts"
                    v-model="formData.otherCosts"
                    mode="currency"
                    currency="USD"
                    locale="en-US"
                    placeholder="Miscellaneous expenses"
                />
              </div>

              <!-- Performance Goals -->
              <div class="form-group full-width">
                <h3 class="section-title">Performance Goals</h3>
              </div>

              <div class="form-group">
                <label for="targetCustomers">Target Customer Interactions</label>
                <InputNumber
                    id="targetCustomers"
                    v-model="formData.targetCustomerInteractions"
                    placeholder="Expected customer interactions"
                />
              </div>

              <div class="form-group">
                <label for="targetSales">Target Sales Units</label>
                <InputNumber
                    id="targetSales"
                    v-model="formData.targetSalesUnits"
                    placeholder="Expected sales volume"
                />
              </div>

              <div class="form-group">
                <label for="targetRevenue">Target Revenue</label>
                <InputNumber
                    id="targetRevenue"
                    v-model="formData.targetRevenue"
                    mode="currency"
                    currency="USD"
                    locale="en-US"
                    placeholder="Expected revenue"
                />
              </div>

              <div class="form-group">
                <label for="targetLeads">Target Lead Generation</label>
                <InputNumber
                    id="targetLeads"
                    v-model="formData.targetLeads"
                    placeholder="Expected leads collected"
                />
              </div>

              <div class="form-group">
                <label for="targetSamples">Samples to Distribute</label>
                <InputNumber
                    id="targetSamples"
                    v-model="formData.targetSamples"
                    placeholder="Number of samples to give"
                />
              </div>

              <div class="form-group">
                <label for="kpiMetrics">Key Performance Indicators</label>
                <MultiSelect
                    id="kpiMetrics"
                    v-model="formData.kpiMetrics"
                    :options="kpiOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select KPIs to track"
                    filter
                />
              </div>

              <div class="form-group full-width">
                <label for="successCriteria">Success Criteria</label>
                <Textarea
                    id="successCriteria"
                    v-model="formData.successCriteria"
                    :rows="3"
                    placeholder="Define what constitutes success for this activation"
                />
              </div>
            </div>
          </template>
        </Card>

        <!-- Step 5: Review -->
        <Card v-if="currentStep === 5" class="form-card">
          <template #header>
            <h2>Review Activation Details</h2>
          </template>
          <template #content>
            <div class="review-sections">
              <!-- Basic Information -->
              <div class="review-section">
                <h3>Basic Information</h3>
                <div class="review-grid">
                  <div class="review-item">
                    <label>Activation Name:</label>
                    <span>{{ formData.name }}</span>
                  </div>
                  <div class="review-item">
                    <label>Code:</label>
                    <span>{{ generateActivationCode() }}</span>
                  </div>
                  <div class="review-item">
                    <label>Client:</label>
                    <span>{{ getClientName(formData.clientId) }}</span>
                  </div>
                  <div class="review-item">
                    <label>Type:</label>
                    <span>{{ formData.type }}</span>
                  </div>
                  <div class="review-item">
                    <label>Category:</label>
                    <span>{{ formData.category || 'Not specified' }}</span>
                  </div>
                  <div class="review-item">
                    <label>Priority:</label>
                    <span>{{ formData.priority || 'Not specified' }}</span>
                  </div>
                  <div class="review-item full-width">
                    <label>Description:</label>
                    <span>{{ formData.description }}</span>
                  </div>
                </div>
              </div>

              <!-- Schedule & Location -->
              <div class="review-section">
                <h3>Schedule & Location</h3>
                <div class="review-grid">
                  <div class="review-item">
                    <label>Duration:</label>
                    <span>{{ formatDate(formData.startDate) }} - {{ formatDate(formData.endDate) }}</span>
                  </div>
                  <div class="review-item">
                    <label>Time:</label>
                    <span>{{ formatTime(formData.startTime) }} - {{ formatTime(formData.endTime) }}</span>
                  </div>
                  <div class="review-item">
                    <label>Timezone:</label>
                    <span>{{ formData.timezone || 'Not specified' }}</span>
                  </div>
                  <div class="review-item">
                    <label>Setup Duration:</label>
                    <span>{{ formData.setupDuration || 0 }} hours</span>
                  </div>
                  <div class="review-item full-width">
                    <label>Venue:</label>
                    <span>{{ formData.venue }}, {{ formData.city }}, {{ formData.state }}</span>
                  </div>
                </div>
              </div>

              <!-- Team & Resources -->
              <div class="review-section">
                <h3>Team & Resources</h3>
                <div class="review-grid">
                  <div class="review-item">
                    <label>Activation Manager:</label>
                    <span>{{ getManagerName(formData.managerId) }}</span>
                  </div>
                  <div class="review-item">
                    <label>Team Size:</label>
                    <span>{{ formData.requiredTeamSize || 'Not specified' }} members</span>
                  </div>
                  <div class="review-item">
                    <label>Assigned Promoters:</label>
                    <span>{{ formData.promoterIds?.length || 0 }} assigned</span>
                  </div>
                  <div class="review-item">
                    <label>Warehouse:</label>
                    <span>{{ getWarehouseName(formData.warehouseId) || 'Not specified' }}</span>
                  </div>
                  <div class="review-item">
                    <label>Transport:</label>
                    <span>{{ formatTransportOption(formData.transportRequired) }}</span>
                  </div>
                  <div class="review-item">
                    <label>Equipment:</label>
                    <span>{{ formData.equipmentNeeded?.length || 0 }} items</span>
                  </div>
                </div>
              </div>

              <!-- Budget & Goals -->
              <div class="review-section">
                <h3>Budget & Goals</h3>
                <div class="review-grid">
                  <div class="review-item">
                    <label>Total Budget:</label>
                    <span>${{ formData.totalBudget?.toLocaleString() || '0' }}</span>
                  </div>
                  <div class="review-item">
                    <label>Staff Costs:</label>
                    <span>${{ formData.staffCosts?.toLocaleString() || '0' }}</span>
                  </div>
                  <div class="review-item">
                    <label>Target Customer Interactions:</label>
                    <span>{{ formData.targetCustomerInteractions?.toLocaleString() || 'Not set' }}</span>
                  </div>
                  <div class="review-item">
                    <label>Target Sales Units:</label>
                    <span>{{ formData.targetSalesUnits?.toLocaleString() || 'Not set' }}</span>
                  </div>
                  <div class="review-item">
                    <label>Target Revenue:</label>
                    <span>${{ formData.targetRevenue?.toLocaleString() || '0' }}</span>
                  </div>
                  <div class="review-item">
                    <label>KPI Metrics:</label>
                    <span>{{ formData.kpiMetrics?.length || 0 }} selected</span>
                  </div>
                </div>
              </div>

              <!-- Budget Breakdown -->
              <div class="review-section" v-if="hasDetailedBudget">
                <h3>Budget Breakdown</h3>
                <div class="budget-breakdown">
                  <div class="budget-item" v-if="formData.staffCosts">
                    <span>Staff Costs</span>
                    <span>${{ formData.staffCosts.toLocaleString() }}</span>
                  </div>
                  <div class="budget-item" v-if="formData.materialCosts">
                    <span>Material Costs</span>
                    <span>${{ formData.materialCosts.toLocaleString() }}</span>
                  </div>
                  <div class="budget-item" v-if="formData.venueCosts">
                    <span>Venue Costs</span>
                    <span>${{ formData.venueCosts.toLocaleString() }}</span>
                  </div>
                  <div class="budget-item" v-if="formData.transportCosts">
                    <span>Transport Costs</span>
                    <span>${{ formData.transportCosts.toLocaleString() }}</span>
                  </div>
                  <div class="budget-item" v-if="formData.otherCosts">
                    <span>Other Costs</span>
                    <span>${{ formData.otherCosts.toLocaleString() }}</span>
                  </div>
                  <div class="budget-total">
                    <span>Total Allocated</span>
                    <span>${{ calculateTotalAllocated().toLocaleString() }}</span>
                  </div>
                  <div class="budget-remaining" :class="{ 'over-budget': getBudgetRemaining() < 0 }">
                    <span>{{ getBudgetRemaining() >= 0 ? 'Remaining' : 'Over Budget' }}</span>
                    <span>${{ Math.abs(getBudgetRemaining()).toLocaleString() }}</span>
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
                    @click="saveDraft"
                    label="Save Draft"
                    icon="pi pi-save"
                    class="p-button-secondary"
                    :disabled="loading"
                />
                <Button
                    @click="$router.push('/activations')"
                    label="Cancel"
                    class="p-button-text"
                    :disabled="loading"
                />
                <Button
                    v-if="currentStep < 5"
                    @click="nextStep"
                    label="Next"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    :disabled="!isCurrentStepValid"
                />
                <Button
                    v-if="currentStep === 5"
                    type="submit"
                    label="Create Activation"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import DashboardLayout from '@/components/general/DashboardLayout.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// State
const currentStep = ref(1)
const loading = ref(false)
const errors = ref({})

// Form data
const formData = ref({
  // Basic Info
  name: '',
  code: '',
  clientId: '',
  type: '',
  category: '',
  priority: '',
  description: '',
  objectives: '',

  // Schedule & Location
  startDate: null,
  endDate: null,
  startTime: null,
  endTime: null,
  timezone: '',
  setupDuration: 1,
  venue: '',
  city: '',
  state: '',
  country: 'United States',
  venueDetails: '',
  weatherDependent: false,

  // Team & Resources
  managerId: '',
  requiredTeamSize: 3,
  promoterIds: [],
  warehouseId: '',
  transportRequired: '',
  equipmentNeeded: [],
  specialRequirements: '',
  safetyBriefingRequired: false,
  permitsRequired: false,
  insuranceRequired: false,

  // Budget & Goals
  totalBudget: null,
  staffCosts: null,
  materialCosts: null,
  venueCosts: null,
  transportCosts: null,
  otherCosts: null,
  targetCustomerInteractions: null,
  targetSalesUnits: null,
  targetRevenue: null,
  targetLeads: null,
  targetSamples: null,
  kpiMetrics: [],
  successCriteria: ''
})

// Options
const clientOptions = ref([])
const managerOptions = ref([])
const promoterOptions = ref([])
const warehouseOptions = ref([])

const activationTypeOptions = [
  { label: 'Product Launch', value: 'Product Launch' },
  { label: 'Brand Awareness', value: 'Brand Awareness' },
  { label: 'Sampling Campaign', value: 'Sampling Campaign' },
  { label: 'Trade Show', value: 'Trade Show' },
  { label: 'Pop-up Store', value: 'Pop-up Store' },
  { label: 'Experiential Marketing', value: 'Experiential Marketing' },
  { label: 'Digital Campaign', value: 'Digital Campaign' },
  { label: 'Promotional Event', value: 'Promotional Event' }
]

const categoryOptions = [
  { label: 'Technology', value: 'Technology' },
  { label: 'Fashion & Beauty', value: 'Fashion & Beauty' },
  { label: 'Food & Beverage', value: 'Food & Beverage' },
  { label: 'Automotive', value: 'Automotive' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Retail', value: 'Retail' },
  { label: 'Entertainment', value: 'Entertainment' }
]

const priorityOptions = [
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
  { label: 'Critical', value: 'Critical' }
]

const timezoneOptions = [
  { label: 'Eastern Time (ET)', value: 'America/New_York' },
  { label: 'Central Time (CT)', value: 'America/Chicago' },
  { label: 'Mountain Time (MT)', value: 'America/Denver' },
  { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
  { label: 'Central Africa Time (CAT)', value: 'Africa/Harare' },
  { label: 'Greenwich Mean Time (GMT)', value: 'Europe/London' }
]

const countryOptions = [
  { label: 'United States', value: 'United States' },
  { label: 'Canada', value: 'Canada' },
  { label: 'United Kingdom', value: 'United Kingdom' },
  { label: 'South Africa', value: 'South Africa' },
  { label: 'Zimbabwe', value: 'Zimbabwe' }
]

const equipmentOptions = [
  { label: 'Display Stands', value: 'display_stands' },
  { label: 'Sound System', value: 'sound_system' },
  { label: 'Promotional Materials', value: 'promo_materials' },
  { label: 'Tablets/iPads', value: 'tablets' },
  { label: 'Uniforms', value: 'uniforms' },
  { label: 'Banners', value: 'banners' },
  { label: 'Product Samples', value: 'samples' },
  { label: 'Registration Desk', value: 'registration_desk' }
]

const kpiOptions = [
  { label: 'Customer Interactions', value: 'customer_interactions' },
  { label: 'Sales Volume', value: 'sales_volume' },
  { label: 'Revenue Generated', value: 'revenue' },
  { label: 'Lead Generation', value: 'leads' },
  { label: 'Brand Awareness', value: 'brand_awareness' },
  { label: 'Sample Distribution', value: 'samples_distributed' },
  { label: 'Social Media Engagement', value: 'social_engagement' },
  { label: 'Customer Satisfaction', value: 'satisfaction' }
]

// Computed
const isCurrentStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      return formData.value.name && formData.value.clientId && formData.value.type && formData.value.description
    case 2:
      return formData.value.startDate && formData.value.endDate && formData.value.venue && formData.value.city && formData.value.state
    case 3:
      return formData.value.managerId
    case 4:
      return formData.value.totalBudget && formData.value.totalBudget > 0
    default:
      return true
  }
})

const hasDetailedBudget = computed(() => {
  return formData.value.staffCosts || formData.value.materialCosts ||
      formData.value.venueCosts || formData.value.transportCosts ||
      formData.value.otherCosts
})

// Watch for form changes to generate code
watch(() => formData.value.name, (newName) => {
  if (newName) {
    formData.value.code = generateActivationCode()
  }
})

// Methods
const loadFormOptions = async () => {
  try {
    // Mock API calls - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 500))

    clientOptions.value = [
      { label: 'TechCorp Solutions', value: 1 },
      { label: 'Fashion Forward Inc', value: 2 },
      { label: 'Global Foods Ltd', value: 3 }
    ]

    managerOptions.value = [
      { label: 'Sarah Johnson', value: 1 },
      { label: 'Mike Chen', value: 2 },
      { label: 'Lisa Anderson', value: 3 }
    ]

    promoterOptions.value = [
      { label: 'John Doe', value: 1 },
      { label: 'Jane Smith', value: 2 },
      { label: 'Mike Johnson', value: 3 },
      { label: 'Lisa Brown', value: 4 },
      { label: 'Emma Wilson', value: 5 },
      { label: 'David Lee', value: 6 }
    ]

    warehouseOptions.value = [
      { label: 'Main Warehouse - New York', value: 1 },
      { label: 'West Coast Depot - LA', value: 2 },
      { label: 'Central Hub - Chicago', value: 3 }
    ]

    // Pre-select client if coming from query param
    if (route.query.client) {
      formData.value.clientId = parseInt(route.query.client)
    }

  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load form options',
      life: 3000
    })
  }
}

const generateActivationCode = () => {
  if (!formData.value.name) return ''

  const words = formData.value.name.split(' ')
  const initials = words.map(word => word.charAt(0).toUpperCase()).join('')
  const year = new Date().getFullYear()
  const sequence = Math.floor(Math.random() * 999) + 1

  return `${initials}-${year}-${sequence.toString().padStart(3, '0')}`
}

const validateStep = (step) => {
  errors.value = {}
  let isValid = true

  if (step === 1) {
    if (!formData.value.name) {
      errors.value.name = 'Activation name is required'
      isValid = false
    }
    if (!formData.value.clientId) {
      errors.value.clientId = 'Client selection is required'
      isValid = false
    }
    if (!formData.value.type) {
      errors.value.type = 'Activation type is required'
      isValid = false
    }
    if (!formData.value.description) {
      errors.value.description = 'Description is required'
      isValid = false
    }
  }

  if (step === 2) {
    if (!formData.value.startDate) {
      errors.value.startDate = 'Start date is required'
      isValid = false
    }
    if (!formData.value.endDate) {
      errors.value.endDate = 'End date is required'
      isValid = false
    }
    if (formData.value.startDate && formData.value.endDate && formData.value.startDate > formData.value.endDate) {
      errors.value.endDate = 'End date must be after start date'
      isValid = false
    }
    if (!formData.value.venue) {
      errors.value.venue = 'Venue is required'
      isValid = false
    }
    if (!formData.value.city) {
      errors.value.city = 'City is required'
      isValid = false
    }
    if (!formData.value.state) {
      errors.value.state = 'State is required'
      isValid = false
    }
  }

  if (step === 3) {
    if (!formData.value.managerId) {
      errors.value.managerId = 'Activation manager is required'
      isValid = false
    }
  }

  if (step === 4) {
    if (!formData.value.totalBudget || formData.value.totalBudget <= 0) {
      errors.value.totalBudget = 'Total budget is required and must be greater than 0'
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

const formatDate = (date) => {
  if (!date) return 'Not set'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (time) => {
  if (!time) return 'Not set'
  return new Date(time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getClientName = (clientId) => {
  const client = clientOptions.value.find(c => c.value === clientId)
  return client ? client.label : 'Not selected'
}

const getManagerName = (managerId) => {
  const manager = managerOptions.value.find(m => m.value === managerId)
  return manager ? manager.label : 'Not selected'
}

const getWarehouseName = (warehouseId) => {
  const warehouse = warehouseOptions.value.find(w => w.value === warehouseId)
  return warehouse ? warehouse.label : null
}

const formatTransportOption = (option) => {
  const options = {
    'company': 'Company Vehicle',
    'rental': 'Rental Required',
    'none': 'Team Arranges Own'
  }
  return options[option] || 'Not specified'
}

const calculateTotalAllocated = () => {
  return (formData.value.staffCosts || 0) +
      (formData.value.materialCosts || 0) +
      (formData.value.venueCosts || 0) +
      (formData.value.transportCosts || 0) +
      (formData.value.otherCosts || 0)
}

const getBudgetRemaining = () => {
  return (formData.value.totalBudget || 0) - calculateTotalAllocated()
}

const saveDraft = async () => {
  try {
    // Mock API call to save draft
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.add({
      severity: 'success',
      summary: 'Draft Saved',
      detail: 'Activation draft has been saved',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save draft',
      life: 3000
    })
  }
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
      detail: `${formData.value.name} has been created successfully`,
      life: 3000
    })

    router.push('/activations')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create activation',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFormOptions()
})
</script>

<style scoped>
.create-activation-page {
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
  flex-wrap: wrap;
  gap: 1rem;
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
  text-align: center;
}

.step.active .step-label {
  color: #3b82f6;
}

.step.completed .step-label {
  color: #10b981;
}

.step-divider {
  width: 3rem;
  height: 2px;
  background: #e5e7eb;
  display: none;
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

.section-title {
  color: #111827;
  font-size: 1.25rem;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
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

.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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

.budget-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
}

.budget-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.budget-item:last-child {
  border-bottom: none;
}

.budget-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  font-weight: 600;
  border-top: 2px solid #e5e7eb;
  margin-top: 0.5rem;
}

.budget-remaining {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  font-weight: 600;
  color: #10b981;
}

.budget-remaining.over-budget {
  color: #ef4444;
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

@media (min-width: 768px) {
  .step-divider {
    display: block;
  }

  .progress-steps {
    flex-wrap: nowrap;
    gap: 0;
  }
}

@media (max-width: 768px) {
  .create-activation-page {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
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
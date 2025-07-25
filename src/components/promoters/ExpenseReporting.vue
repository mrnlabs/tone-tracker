<template>
  <div class="expense-reporting">
    <!-- Expense Summary -->
    <Card class="expense-summary">
      <template #header>
        <h3>Expense Summary</h3>
      </template>
      <template #content>
        <div class="summary-stats">
          <div class="stat-item">
            <div class="stat-icon pending">
              <i class="pi pi-clock"></i>
            </div>
            <div class="stat-info">
              <span class="stat-number">${{ pendingExpensesTotal }}</span>
              <span class="stat-label">Pending Expenses</span>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon monthly">
              <i class="pi pi-calendar"></i>
            </div>
            <div class="stat-info">
              <span class="stat-number">${{ monthlyExpensesTotal }}</span>
              <span class="stat-label">This Month</span>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon count">
              <i class="pi pi-receipt"></i>
            </div>
            <div class="stat-info">
              <span class="stat-number">{{ thisMonthExpensesCount }}</span>
              <span class="stat-label">Receipts</span>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Add New Expense -->
    <Card class="new-expense">
      <template #header>
        <div class="header-content">
          <h3>Add New Expense</h3>
          <Button
            @click="showExpenseForm = !showExpenseForm"
            :icon="showExpenseForm ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
            class="p-button-text"
          />
        </div>
      </template>
      <template #content v-if="showExpenseForm">
        <form @submit.prevent="submitExpense" class="expense-form">
          <div class="form-row">
            <div class="form-group">
              <label for="category" class="required">Category</label>
              <Dropdown
                id="category"
                v-model="expenseData.category"
                :options="expenseCategories"
                optionLabel="label"
                optionValue="value"
                placeholder="Select category"
                class="w-full"
                :class="{ 'p-invalid': errors.category }"
              />
              <small class="p-error" v-if="errors.category">{{ errors.category }}</small>
            </div>

            <div class="form-group">
              <label for="amount" class="required">Amount ($)</label>
              <InputNumber
                id="amount"
                v-model="expenseData.amount"
                mode="currency"
                currency="USD"
                :minFractionDigits="2"
                placeholder="0.00"
                class="w-full"
                :class="{ 'p-invalid': errors.amount }"
              />
              <small class="p-error" v-if="errors.amount">{{ errors.amount }}</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="date" class="required">Date</label>
              <Calendar
                id="date"
                v-model="expenseData.date"
                dateFormat="mm/dd/yy"
                :maxDate="new Date()"
                placeholder="Select date"
                class="w-full"
                :class="{ 'p-invalid': errors.date }"
              />
              <small class="p-error" v-if="errors.date">{{ errors.date }}</small>
            </div>

            <div class="form-group">
              <label for="vendor">Vendor/Merchant</label>
              <InputText
                id="vendor"
                v-model="expenseData.vendor"
                placeholder="Vendor name"
                class="w-full"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="description" class="required">Description</label>
            <Textarea
              id="description"
              v-model="expenseData.description"
              rows="3"
              placeholder="Describe the expense"
              class="w-full"
              :class="{ 'p-invalid': errors.description }"
            />
            <small class="p-error" v-if="errors.description">{{ errors.description }}</small>
          </div>

          <div class="form-group">
            <label for="businessPurpose">Business Purpose</label>
            <Textarea
              id="businessPurpose"
              v-model="expenseData.businessPurpose"
              rows="2"
              placeholder="Business justification for this expense"
              class="w-full"
            />
          </div>

          <div class="form-group">
            <label>Receipt</label>
            <FileUpload
              mode="basic"
              accept="image/*,.pdf"
              :maxFileSize="5000000"
              @select="onReceiptSelect"
              :auto="false"
              chooseLabel="Upload Receipt"
              class="w-full"
            />
            <small class="help-text">
              Upload receipt image or PDF (max 5MB)
            </small>
          </div>

          <div class="form-group" v-if="activationId">
            <div class="checkbox-group">
              <Checkbox
                id="linkToActivation"
                v-model="expenseData.linkToActivation"
                :binary="true"
              />
              <label for="linkToActivation" class="checkbox-label">
                Link this expense to current activation
              </label>
            </div>
          </div>

          <div class="form-actions">
            <Button
              type="submit"
              :loading="loading"
              label="Submit Expense"
              icon="pi pi-check"
              class="p-button-primary"
            />
            <Button
              type="button"
              @click="resetExpenseForm"
              label="Reset"
              icon="pi pi-refresh"
              class="p-button-outlined"
            />
          </div>
        </form>
      </template>
    </Card>

    <!-- Recent Expenses -->
    <Card class="recent-expenses">
      <template #header>
        <div class="header-content">
          <h3>Recent Expenses</h3>
          <div class="header-actions">
            <Button
              @click="refreshExpenses"
              icon="pi pi-refresh"
              class="p-button-text"
              v-tooltip.top="'Refresh'"
            />
          </div>
        </div>
      </template>
      <template #content>
        <DataTable 
          :value="recentExpenses" 
          :paginator="true" 
          :rows="10"
          :loading="expensesLoading"
          responsiveLayout="scroll"
          :globalFilterFields="['description', 'category', 'vendor']"
        >
          <template #header>
            <div class="table-header">
              <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText 
                  v-model="globalFilter" 
                  placeholder="Search expenses..." 
                  class="search-input"
                />
              </span>
              <Button
                @click="exportExpenses"
                icon="pi pi-download"
                label="Export"
                class="p-button-outlined p-button-sm"
              />
            </div>
          </template>

          <Column field="date" header="Date" :sortable="true">
            <template #body="{ data }">
              {{ formatDate(data.date) }}
            </template>
          </Column>

          <Column field="category" header="Category" :sortable="true">
            <template #body="{ data }">
              <Tag 
                :value="getCategoryLabel(data.category)"
                :severity="getCategorySeverity(data.category)"
              />
            </template>
          </Column>

          <Column field="description" header="Description" />

          <Column field="amount" header="Amount" :sortable="true">
            <template #body="{ data }">
              ${{ data.amount?.toFixed(2) }}
            </template>
          </Column>

          <Column field="status" header="Status" :sortable="true">
            <template #body="{ data }">
              <Tag 
                :value="data.status"
                :severity="getStatusSeverity(data.status)"
              />
            </template>
          </Column>

          <Column field="vendor" header="Vendor" />

          <Column header="Receipt">
            <template #body="{ data }">
              <div class="receipt-actions">
                <Button
                  v-if="data.receiptUrl"
                  @click="viewReceipt(data.receiptUrl)"
                  icon="pi pi-eye"
                  class="p-button-text p-button-sm"
                  v-tooltip.top="'View Receipt'"
                />
                <Button
                  v-else
                  @click="uploadReceipt(data)"
                  icon="pi pi-upload"
                  class="p-button-text p-button-sm"
                  v-tooltip.top="'Upload Receipt'"
                />
              </div>
            </template>
          </Column>

          <Column header="Actions">
            <template #body="{ data }">
              <div class="action-buttons">
                <Button
                  @click="editExpense(data)"
                  icon="pi pi-pencil"
                  class="p-button-text p-button-sm"
                  v-tooltip.top="'Edit'"
                  :disabled="data.status === 'approved' || data.status === 'paid'"
                />
                <Button
                  @click="deleteExpense(data)"
                  icon="pi pi-trash"
                  class="p-button-text p-button-danger p-button-sm"
                  v-tooltip.top="'Delete'"
                  :disabled="data.status === 'approved' || data.status === 'paid'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Receipt Upload Dialog -->
    <Dialog
      v-model:visible="showReceiptDialog"
      header="Upload Receipt"
      :modal="true"
      :style="{ width: '400px' }"
    >
      <div class="receipt-upload">
        <p>Upload receipt for expense: <strong>{{ selectedExpense?.description }}</strong></p>
        
        <FileUpload
          mode="basic"
          accept="image/*,.pdf"
          :maxFileSize="5000000"
          @select="onReceiptUpload"
          :auto="false"
          chooseLabel="Choose Receipt"
          class="w-full"
        />
        
        <div class="upload-actions">
          <Button
            @click="submitReceiptUpload"
            :loading="receiptUploading"
            label="Upload"
            icon="pi pi-upload"
            class="p-button-primary"
            :disabled="!selectedReceiptFile"
          />
          <Button
            @click="closeReceiptDialog"
            label="Cancel"
            class="p-button-outlined"
          />
        </div>
      </div>
    </Dialog>

    <!-- Receipt Viewer Dialog -->
    <Dialog
      v-model:visible="showReceiptViewer"
      header="Receipt"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div class="receipt-viewer">
        <img 
          v-if="viewingReceiptUrl && isImageReceipt(viewingReceiptUrl)"
          :src="viewingReceiptUrl" 
          alt="Receipt"
          class="receipt-image"
        />
        <iframe
          v-else-if="viewingReceiptUrl"
          :src="viewingReceiptUrl"
          class="receipt-pdf"
        ></iframe>
      </div>
    </Dialog>

    <!-- Expense Categories Legend -->
    <Card class="expense-legend">
      <template #header>
        <h3>Expense Categories</h3>
      </template>
      <template #content>
        <div class="categories-grid">
          <div
            v-for="category in expenseCategories"
            :key="category.value"
            class="category-item"
          >
            <Tag 
              :value="category.label"
              :severity="getCategorySeverity(category.value)"
            />
            <small class="category-description">{{ category.description }}</small>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { usePromoterStore } from '@/stores/promoter'
import { format, startOfMonth, endOfMonth } from 'date-fns'

const props = defineProps({
  activationId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['expense-submitted'])

const toast = useToast()
const promoterStore = usePromoterStore()

// State
const loading = ref(false)
const expensesLoading = ref(false)
const receiptUploading = ref(false)
const showExpenseForm = ref(false)
const showReceiptDialog = ref(false)
const showReceiptViewer = ref(false)
const globalFilter = ref('')

const selectedExpense = ref(null)
const selectedReceiptFile = ref(null)
const viewingReceiptUrl = ref('')

const errors = ref({})

// Form data
const expenseData = ref({
  category: '',
  amount: 0,
  date: new Date(),
  vendor: '',
  description: '',
  businessPurpose: '',
  receipt: null,
  linkToActivation: false
})

// Expense categories with descriptions
const expenseCategories = ref([
  { 
    label: 'Transport', 
    value: 'transport',
    description: 'Travel costs, fuel, parking, public transport'
  },
  { 
    label: 'Meals', 
    value: 'meals',
    description: 'Food and beverages during work'
  },
  { 
    label: 'Accommodation', 
    value: 'accommodation',
    description: 'Hotels, lodging for overnight trips'
  },
  { 
    label: 'Communication', 
    value: 'communication',
    description: 'Phone calls, data, internet costs'
  },
  { 
    label: 'Materials', 
    value: 'materials',
    description: 'Work supplies, promotional materials'
  },
  { 
    label: 'Training', 
    value: 'training',
    description: 'Training courses, certification fees'
  },
  { 
    label: 'Other', 
    value: 'other',
    description: 'Other business-related expenses'
  }
])

// Computed
const recentExpenses = computed(() => promoterStore.expenses || [])

const pendingExpenses = computed(() => 
  recentExpenses.value.filter(expense => expense.status === 'pending')
)

const pendingExpensesTotal = computed(() =>
  pendingExpenses.value.reduce((total, expense) => total + (expense.amount || 0), 0).toFixed(2)
)

const thisMonthExpenses = computed(() => {
  const startDate = startOfMonth(new Date())
  const endDate = endOfMonth(new Date())
  
  return recentExpenses.value.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate >= startDate && expenseDate <= endDate
  })
})

const monthlyExpensesTotal = computed(() =>
  thisMonthExpenses.value.reduce((total, expense) => total + (expense.amount || 0), 0).toFixed(2)
)

const thisMonthExpensesCount = computed(() => thisMonthExpenses.value.length)

// Methods
const submitExpense = async () => {
  if (!validateExpenseForm()) return
  
  loading.value = true
  
  try {
    const expensePayload = {
      ...expenseData.value,
      activationId: expenseData.value.linkToActivation ? props.activationId : null
    }
    
    const result = await promoterStore.submitExpense(expensePayload)
    
    // Upload receipt if provided
    if (expenseData.value.receipt) {
      await promoterStore.uploadExpenseReceipt(result.id, expenseData.value.receipt)
    }
    
    toast.add({
      severity: 'success',
      summary: 'Expense Submitted',
      detail: `Expense of $${expenseData.value.amount.toFixed(2)} submitted successfully`,
      life: 3000
    })
    
    resetExpenseForm()
    showExpenseForm.value = false
    emit('expense-submitted', result)
    
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Submission Failed',
      detail: error.message || 'Failed to submit expense',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

const validateExpenseForm = () => {
  errors.value = {}
  
  if (!expenseData.value.category) {
    errors.value.category = 'Category is required'
  }
  
  if (!expenseData.value.amount || expenseData.value.amount <= 0) {
    errors.value.amount = 'Valid amount is required'
  }
  
  if (!expenseData.value.date) {
    errors.value.date = 'Date is required'
  }
  
  if (!expenseData.value.description?.trim()) {
    errors.value.description = 'Description is required'
  }
  
  return Object.keys(errors.value).length === 0
}

const resetExpenseForm = () => {
  expenseData.value = {
    category: '',
    amount: 0,
    date: new Date(),
    vendor: '',
    description: '',
    businessPurpose: '',
    receipt: null,
    linkToActivation: false
  }
  errors.value = {}
}

const onReceiptSelect = (event) => {
  expenseData.value.receipt = event.files[0]
}

const refreshExpenses = async () => {
  expensesLoading.value = true
  try {
    await promoterStore.fetchExpenses()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Refresh Failed',
      detail: 'Failed to refresh expenses',
      life: 3000
    })
  } finally {
    expensesLoading.value = false
  }
}

const exportExpenses = async () => {
  try {
    const data = await promoterStore.generateReport('expenses', {
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
      format: 'excel'
    })
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `expenses_${format(new Date(), 'yyyy-MM')}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    
    toast.add({
      severity: 'success',
      summary: 'Export Complete',
      detail: 'Expenses exported successfully',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Export Failed',
      detail: 'Failed to export expenses',
      life: 3000
    })
  }
}

const editExpense = (expense) => {
  // Implement edit functionality
  console.log('Edit expense:', expense)
}

const deleteExpense = async (expense) => {
  try {
    await promoterStore.deleteExpense(expense.id)
    
    toast.add({
      severity: 'success',
      summary: 'Expense Deleted',
      detail: 'Expense deleted successfully',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Delete Failed',
      detail: 'Failed to delete expense',
      life: 3000
    })
  }
}

const uploadReceipt = (expense) => {
  selectedExpense.value = expense
  showReceiptDialog.value = true
}

const closeReceiptDialog = () => {
  showReceiptDialog.value = false
  selectedExpense.value = null
  selectedReceiptFile.value = null
}

const onReceiptUpload = (event) => {
  selectedReceiptFile.value = event.files[0]
}

const submitReceiptUpload = async () => {
  if (!selectedReceiptFile.value || !selectedExpense.value) return
  
  receiptUploading.value = true
  
  try {
    await promoterStore.uploadExpenseReceipt(selectedExpense.value.id, selectedReceiptFile.value)
    
    toast.add({
      severity: 'success',
      summary: 'Receipt Uploaded',
      detail: 'Receipt uploaded successfully',
      life: 3000
    })
    
    closeReceiptDialog()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Upload Failed',
      detail: 'Failed to upload receipt',
      life: 3000
    })
  } finally {
    receiptUploading.value = false
  }
}

const viewReceipt = (receiptUrl) => {
  viewingReceiptUrl.value = receiptUrl
  showReceiptViewer.value = true
}

const isImageReceipt = (url) => {
  return /\.(jpg|jpeg|png|gif)$/i.test(url)
}

const formatDate = (date) => {
  return format(new Date(date), 'MMM dd, yyyy')
}

const getCategoryLabel = (category) => {
  const cat = expenseCategories.value.find(c => c.value === category)
  return cat?.label || category
}

const getCategorySeverity = (category) => {
  const severities = {
    transport: 'info',
    meals: 'success',
    accommodation: 'warning',
    communication: 'info',
    materials: 'help',
    training: 'secondary',
    other: 'contrast'
  }
  return severities[category] || 'info'
}

const getStatusSeverity = (status) => {
  const severities = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    paid: 'info'
  }
  return severities[status] || 'info'
}

// Lifecycle
onMounted(() => {
  if (promoterStore.expenses.length === 0) {
    promoterStore.fetchExpenses()
  }
})
</script>

<style scoped>
.expense-reporting {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-50);
  border-radius: 8px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-icon.monthly {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.count {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.expense-form .form-group {
  margin-bottom: 1.5rem;
}

.expense-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.expense-form label.required::after {
  content: ' *';
  color: var(--red-500);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-label {
  margin: 0 !important;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.help-text {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  width: 300px;
}

.receipt-actions,
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.receipt-upload {
  padding: 1rem;
}

.upload-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.receipt-viewer {
  text-align: center;
}

.receipt-image {
  max-width: 100%;
  max-height: 500px;
  border-radius: 8px;
}

.receipt-pdf {
  width: 100%;
  height: 500px;
  border: none;
  border-radius: 8px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.category-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--surface-50);
  border-radius: 8px;
}

.category-description {
  color: var(--text-color-secondary);
  line-height: 1.4;
}

@media (max-width: 768px) {
  .summary-stats {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .p-button {
    width: 100%;
  }
  
  .table-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
  }
}
</style>
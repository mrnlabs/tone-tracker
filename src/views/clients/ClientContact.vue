<template>
  <div class="client-contact">
    <!-- Header with Add Contact Button -->
    <div class="contact-header">
      <h3>Client Contacts</h3>
      <Button
        @click="showAddContactDialog = true"
        icon="pi pi-plus"
        label="Add Contact"
        class="p-button-success"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <p>Loading contacts...</p>
    </div>

    <!-- Contacts List -->
    <div v-else-if="contacts.length > 0" class="contacts-grid">
      <Card v-for="contact in contacts" :key="contact.id" class="contact-card">
        <template #content>
          <div class="contact-content">
            <!-- Contact Avatar and Info -->
            <div class="contact-header-info">
              <Avatar
                :label="getContactInitials(contact)"
                size="large"
                shape="circle"
                :style="{ backgroundColor: contact.avatarColor || '#3b82f6', color: 'white' }"
              />
              <div class="contact-details">
                <h4>{{ contact.firstName }} {{ contact.lastName }}</h4>
                <p v-if="contact.jobTitle" class="job-title">{{ contact.jobTitle }}</p>
                <Tag
                  v-if="contact.isPrimary"
                  value="Primary Contact"
                  severity="success"
                  class="primary-tag"
                />
              </div>
              <div class="contact-actions">
                <Button
                  @click="editContact(contact)"
                  icon="pi pi-pencil"
                  class="p-button-text p-button-sm"
                  v-tooltip="'Edit Contact'"
                />
                <Button
                  @click="confirmDeleteContact(contact)"
                  icon="pi pi-trash"
                  class="p-button-text p-button-danger p-button-sm"
                  v-tooltip="'Delete Contact'"
                  :disabled="contact.isPrimary"
                />
              </div>
            </div>

            <!-- Contact Methods -->
            <div class="contact-methods">
              <div v-if="contact.email" class="contact-method">
                <i class="pi pi-envelope"></i>
                <span>{{ contact.email }}</span>
                <Button
                  @click="sendEmail(contact.email)"
                  icon="pi pi-send"
                  class="p-button-text p-button-sm"
                  v-tooltip="'Send Email'"
                />
              </div>
              
              <div v-if="contact.phone" class="contact-method">
                <i class="pi pi-phone"></i>
                <span>{{ contact.phone }}</span>
                <Button
                  @click="callContact(contact.phone)"
                  icon="pi pi-phone"
                  class="p-button-text p-button-sm"
                  v-tooltip="'Call'"
                />
              </div>

              <div v-if="contact.department" class="contact-method">
                <i class="pi pi-building"></i>
                <span>{{ contact.department }}</span>
              </div>
            </div>

            <!-- Contact Notes -->
            <div v-if="contact.notes" class="contact-notes">
              <small>{{ contact.notes }}</small>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading" class="empty-state">
      <i class="pi pi-users empty-icon"></i>
      <h3>No contacts found</h3>
      <p>Add contacts to manage client communication more effectively.</p>
      <Button
        @click="showAddContactDialog = true"
        label="Add First Contact"
        icon="pi pi-plus"
        class="p-button-outlined"
      />
    </div>

    <!-- Add/Edit Contact Dialog -->
    <Dialog
      v-model:visible="showAddContactDialog"
      modal
      :header="editingContact ? 'Edit Contact' : 'Add New Contact'"
      :style="{ width: '600px' }"
      @hide="resetContactForm"
    >
      <form @submit.prevent="saveContact" class="contact-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="firstName" class="form-label">First Name *</label>
            <InputText
              id="firstName"
              v-model="contactForm.firstName"
              class="form-input"
              :class="{ 'p-invalid': errors.firstName }"
              required
            />
            <small v-if="errors.firstName" class="p-error">{{ errors.firstName }}</small>
          </div>

          <div class="form-group">
            <label for="lastName" class="form-label">Last Name *</label>
            <InputText
              id="lastName"
              v-model="contactForm.lastName"
              class="form-input"
              :class="{ 'p-invalid': errors.lastName }"
              required
            />
            <small v-if="errors.lastName" class="p-error">{{ errors.lastName }}</small>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Email *</label>
            <InputText
              id="email"
              v-model="contactForm.email"
              type="email"
              class="form-input"
              :class="{ 'p-invalid': errors.email }"
              required
            />
            <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password *</label>
            <Password
              id="password"
              v-model="contactForm.password"
              class="form-input"
              :class="{ 'p-invalid': errors.password }"
              :feedback="false"
              toggleMask
              placeholder="Enter password for user account"
            />
            <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
          </div>

          <div class="form-group">
            <label for="phone" class="form-label">Phone</label>
            <InputText
              id="phone"
              v-model="contactForm.phone"
              type="tel"
              class="form-input"
              :class="{ 'p-invalid': errors.phone }"
            />
            <small v-if="errors.phone" class="p-error">{{ errors.phone }}</small>
          </div>

          <div class="form-group">
            <label for="jobTitle" class="form-label">Job Title</label>
            <InputText
              id="jobTitle"
              v-model="contactForm.jobTitle"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="department" class="form-label">Department</label>
            <InputText
              id="department"
              v-model="contactForm.department"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="contactType" class="form-label">Contact Type</label>
            <Dropdown
              id="contactType"
              v-model="contactForm.contactType"
              :options="contactTypeOptions"
              optionLabel="label"
              optionValue="value"
              class="form-input"
              placeholder="Select contact type"
            />
          </div>

          <div class="form-group full-width">
            <label for="notes" class="form-label">Notes</label>
            <Textarea
              id="notes"
              v-model="contactForm.notes"
              class="form-input"
              rows="3"
              placeholder="Additional notes about this contact..."
            />
          </div>

          <div class="form-group full-width">
            <div class="checkbox-group">
              <Checkbox
                id="isPrimary"
                v-model="contactForm.isPrimary"
                :binary="true"
              />
              <label for="isPrimary" class="checkbox-label">Set as Primary Contact</label>
            </div>
            <small class="checkbox-help">Primary contact will be the main point of communication</small>
          </div>
        </div>

        <div class="dialog-actions">
          <Button
            type="button"
            label="Cancel"
            icon="pi pi-times"
            class="p-button-text"
            @click="showAddContactDialog = false"
          />
          <Button
            type="submit"
            :label="editingContact ? 'Update Contact' : 'Add Contact'"
            icon="pi pi-check"
            :loading="saving"
            :disabled="!isFormValid"
          />
        </div>
      </form>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="showDeleteDialog"
      modal
      header="Confirm Delete"
      :style="{ width: '450px' }"
    >
      <div class="delete-confirmation">
        <i class="pi pi-exclamation-triangle delete-icon"></i>
        <div class="delete-message">
          <h4>Delete Contact</h4>
          <p>Are you sure you want to delete <strong>{{ contactToDelete?.firstName }} {{ contactToDelete?.lastName }}</strong>?</p>
          <p class="delete-warning">This action cannot be undone.</p>
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          class="p-button-text"
          @click="showDeleteDialog = false"
        />
        <Button
          label="Delete"
          icon="pi pi-trash"
          class="p-button-danger"
          :loading="deleting"
          @click="deleteContact"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useClientsStore } from '@/stores/client'
import { contactService } from '@/services/contactService'

const route = useRoute()
const toast = useToast()
const clientsStore = useClientsStore()

// Props
const props = defineProps({
  clientId: {
    type: [String, Number],
    default: null
  }
})

// State
const contacts = ref([])
const showAddContactDialog = ref(false)
const showDeleteDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const loading = ref(false)
const editingContact = ref(null)
const contactToDelete = ref(null)

// Form data
const contactForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  jobTitle: '',
  department: '',
  notes: '',
  isPrimary: false,
  contactType: 'GENERAL' // Default contact type
})

// Form validation
const errors = ref({})

// Computed
const clientId = computed(() => props.clientId || route.params.id)

const contactTypeOptions = [
  { label: 'General Contact', value: 'GENERAL' },
  { label: 'Primary Contact', value: 'PRIMARY' },
  { label: 'Technical Contact', value: 'TECHNICAL' },
  { label: 'Billing Contact', value: 'BILLING' },
  { label: 'Marketing Contact', value: 'MARKETING' }
]

const isFormValid = computed(() => {
  return contactForm.value.firstName.trim() &&
         contactForm.value.lastName.trim() &&
         contactForm.value.email.trim() &&
         contactForm.value.password.trim() &&
         contactForm.value.contactType &&
         Object.keys(errors.value).length === 0
})

// Methods
const loadContacts = async () => {
  try {
    loading.value = true
    console.log('Loading contacts for client:', clientId.value)
    
    const response = await contactService.getClientContacts(clientId.value)
    console.log('Full contacts response:', response)
    console.log('Response status:', response.status)
    console.log('Response data:', response.data)
    
    // Handle both data structure possibilities
    contacts.value = response.data || response.content || response || []
    console.log('Final contacts array:', contacts.value)
    console.log('Number of contacts loaded:', contacts.value.length)
    
  } catch (error) {
    console.error('Failed to load contacts - Full error:', error)
    console.error('Error response:', error.response)
    console.error('Error status:', error.response?.status)
    console.error('Error data:', error.response?.data)
    
    // Show the actual error message if available
    const errorMessage = error.response?.data?.message || error.message || 'Failed to load client contacts'
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `${errorMessage} (Status: ${error.response?.status || 'Unknown'})`,
      life: 5000
    })
    
    // Set empty array on error
    contacts.value = []
  } finally {
    loading.value = false
  }
}

const getContactInitials = (contact) => {
  return `${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`.toUpperCase()
}

const validateForm = () => {
  errors.value = {}

  if (!contactForm.value.firstName.trim()) {
    errors.value.firstName = 'First name is required'
  }

  if (!contactForm.value.lastName.trim()) {
    errors.value.lastName = 'Last name is required'
  }

  if (!contactForm.value.email.trim()) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.value.email)) {
    errors.value.email = 'Please enter a valid email address'
  }

  if (!contactForm.value.password.trim()) {
    errors.value.password = 'Password is required'
  } else if (contactForm.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters long'
  }

  if (contactForm.value.phone && !/^\+?[\d\s\-()]+$/.test(contactForm.value.phone)) {
    errors.value.phone = 'Please enter a valid phone number'
  }

  if (!contactForm.value.contactType) {
    errors.value.contactType = 'Contact type is required'
  }

  return Object.keys(errors.value).length === 0
}

const saveContact = async () => {
  if (!validateForm()) return

  try {
    saving.value = true

    const contactData = {
      ...contactForm.value,
      clientId: parseInt(clientId.value), // Required field
      isPrimaryContact: contactForm.value.isPrimary, // Map to backend field name
      avatarColor: editingContact.value?.avatarColor || generateRandomColor()
    }

    // Remove the isPrimary field since we're using isPrimaryContact
    delete contactData.isPrimary

    console.log('Saving contact data:', contactData)
    console.log('Client ID:', clientId.value)
    console.log('Is editing:', !!editingContact.value)

    let savedContact
    if (editingContact.value) {
      // Update existing contact
      console.log('Updating contact ID:', editingContact.value.id)
      savedContact = await contactService.updateContact(editingContact.value.id, contactData)
      console.log('Updated contact:', savedContact)
    } else {
      // Add new contact
      console.log('Creating new contact')
      savedContact = await contactService.createContact(contactData)
      console.log('Created contact:', savedContact)
    }

    // If setting as primary, update via API
    if (contactForm.value.isPrimary && savedContact.id) {
      console.log('Setting as primary contact:', savedContact.id)
      await contactService.setPrimaryContact(savedContact.id)
    }

    // Refresh contacts to get updated data
    await loadContacts()

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Contact ${editingContact.value ? 'updated' : 'added'} successfully`,
      life: 3000
    })

    showAddContactDialog.value = false
    resetContactForm()

  } catch (error) {
    console.error('Failed to save contact:', error)
    const errorMessage = error.response?.data?.message || error.message || `Failed to ${editingContact.value ? 'update' : 'add'} contact`
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 5000
    })
  } finally {
    saving.value = false
  }
}

const editContact = (contact) => {
  editingContact.value = contact
  contactForm.value = {
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone || '',
    jobTitle: contact.jobTitle || '',
    department: contact.department || '',
    notes: contact.notes || '',
    isPrimary: contact.isPrimary || contact.isPrimaryContact || false,
    contactType: contact.contactType || 'GENERAL'
  }
  showAddContactDialog.value = true
}

const confirmDeleteContact = (contact) => {
  contactToDelete.value = contact
  showDeleteDialog.value = true
}

const deleteContact = async () => {
  try {
    deleting.value = true

    await contactService.deleteContact(contactToDelete.value.id)
    
    // Refresh contacts list
    await loadContacts()

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Contact deleted successfully',
      life: 3000
    })

    showDeleteDialog.value = false
    contactToDelete.value = null

  } catch (error) {
    console.error('Failed to delete contact:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete contact'
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 5000
    })
  } finally {
    deleting.value = false
  }
}

const resetContactForm = () => {
  editingContact.value = null
  contactForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    jobTitle: '',
    department: '',
    notes: '',
    isPrimary: false,
    contactType: 'GENERAL'
  }
  errors.value = {}
}

const generateRandomColor = () => {
  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16']
  return colors[Math.floor(Math.random() * colors.length)]
}

const sendEmail = (email) => {
  window.location.href = `mailto:${email}`
}

const callContact = (phone) => {
  window.location.href = `tel:${phone}`
}

// Lifecycle
onMounted(() => {
  console.log('ClientContact mounted, loading contacts for client:', clientId.value)
  loadContacts()
})
</script>

<style scoped>
.client-contact {
  padding: 1.5rem;
}

.contact-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.contact-header h3 {
  margin: 0;
  color: #111827;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-container p {
  margin-top: 1rem;
  color: #6b7280;
}

.contacts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.contact-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.contact-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
}

.contact-content {
  padding: 0;
}

.contact-header-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.contact-details {
  flex: 1;
}

.contact-details h4 {
  margin: 0 0 0.25rem 0;
  color: #111827;
  font-size: 1.1rem;
}

.job-title {
  margin: 0 0 0.5rem 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.primary-tag {
  font-size: 0.75rem;
}

.contact-actions {
  display: flex;
  gap: 0.25rem;
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.contact-method {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

.contact-method i {
  color: #6b7280;
  min-width: 1rem;
}

.contact-method span {
  flex: 1;
  color: #111827;
}

.contact-notes {
  padding: 0.75rem;
  background: #fef3c7;
  border-radius: 0.5rem;
  border-left: 4px solid #f59e0b;
}

.contact-notes small {
  color: #92400e;
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 2px dashed #d1d5db;
}

.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #111827;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.contact-form {
  padding: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-label {
  font-weight: 500;
  color: #374151;
  cursor: pointer;
}

.checkbox-help {
  color: #6b7280;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.delete-confirmation {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.delete-icon {
  color: #f59e0b;
  font-size: 2rem;
  margin-top: 0.25rem;
}

.delete-message h4 {
  margin: 0 0 0.5rem 0;
  color: #111827;
}

.delete-message p {
  margin: 0 0 0.5rem 0;
  color: #6b7280;
}

.delete-warning {
  color: #dc2626 !important;
  font-weight: 500;
}

@media (max-width: 768px) {
  .client-contact {
    padding: 1rem;
  }

  .contact-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .contacts-grid {
    grid-template-columns: 1fr;
  }

  .contact-header-info {
    flex-direction: column;
    text-align: center;
  }

  .contact-actions {
    justify-content: center;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .dialog-actions {
    flex-direction: column;
  }
}
</style>
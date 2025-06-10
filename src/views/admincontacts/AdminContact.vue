<script setup>
import Layout from '@/views/shared/Layout.vue';
import Checkbox from 'primevue/checkbox';
import BreadCrumb from '@/components/BreadCrumb.vue';
import InputMask from 'primevue/inputmask';
import InputText from 'primevue/inputtext';
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useRoute } from 'vue-router';
import { required, email } from '@vuelidate/validators';
import Dialog from 'primevue/dialog';
import { useUserStore } from '@/stores/userStore';
import { useClientStore } from '@/stores/useClient';
import { useAuth } from '@/stores/auth';
import Column from '@/components/general/Column.vue';
import InputLabel from '@/components/form-components/InputLabel.vue';
import Input from '@/components/form-components/Input.vue';
import InputError from '@/components/form-components/InputError.vue';
import debounce from 'lodash.debounce';
import InputNumber from '@/components/form-components/InputNumber.vue';
import Button from '@/components/buttons/Button.vue';
import useToaster from '@/composables/useToaster';
import Card from '@/components/general/Card.vue';
import CardBody from '@/components/general/CardBody.vue';
import Row from '@/components/general/Row.vue';
import Spinner from '@/components/buttons/Spinner.vue';

const toaster = useToaster();
const visible = ref(false);
const duty = ref(null);
const loading = ref(false);

const userStore = useUserStore();
const clientStore = useClientStore();

const auth = useAuth();
const route = useRoute();

const currentUser = JSON.parse(auth.user);
const contacts = ref([]);
const authoritativeContacts = ref([]);
const billingContacts = ref([]);
const owners = ref([]);
const clientObj = ref();

const form = reactive({
	id: 0,
	lastName: '',
	firstName: '',
	phone: '',
	email: '',
	role: 'CLIENT',
	password: 'TT_G',
	duty: '',
	client: currentUser.role === 'CLIENT' ? currentUser.activeUserId : route.query.client
});

const rules = {
	lastName: { required },
	firstName: { required },
	phone: { required },
	email: { required, email },
};

const v$ = useVuelidate(rules, form);

// Track selected checkboxes
const selectedOwnerContacts = ref([]);
const selectedAuthoritativeContacts = ref([]);
const selectedBillingContacts = ref([]);

onMounted(() => {
	if (currentUser.role === 'CLIENT') {
		getContacts(currentUser.activeUserId);
	} else {
		getContacts(route.query.client);
	}
});

const getContacts = (clientId) => {
	clientStore
		.getClientByClientId(clientId)
		.then((response) => {
			clientObj.value = response.data;
			contacts.value = response.data?.users;
			owners.value = contacts.value?.filter((contact) => contact.duty === 'OWNER');
			authoritativeContacts.value = contacts.value?.filter((contact) => contact.duty === 'AUTHORITATIVE');
			billingContacts.value = contacts.value?.filter((contact) => contact.duty === 'BILLING');
		})
		.catch((error) => {});
};


const canDeleteOwnerContacts = computed(() => selectedOwnerContacts.value.length > 0);
const canDeleteAuthoritativeContacts = computed(() => selectedAuthoritativeContacts.value.length > 0);
const canDeleteBillingContacts = computed(() => selectedBillingContacts.value.length > 0);

const showModal = (typeParam) => {
			v$.value.$errors = [];
	        v$.value.$reset();
			form.lastName = '';
			form.firstName = '';
			form.phone = '';
			form.id = 0;
			form.email = '';

			let selectedContacts;

				if (typeParam === 'BILLING') {
				   selectedContacts = 'Billing';
				} else if (typeParam === 'AUTHORITATIVE') {
				   selectedContacts = 'Authoritative';
				} else {
				  selectedContacts = 'Account Owner';
				}


	duty.value = selectedContacts;
	form.duty = typeParam;
	visible.value = true;
};


const handleUpdateContact = async (formObj) => {	
	console.log('formObj', formObj);
	
	const isFormCorrect = await v$.value.$validate();
	console.log('isFormCorrect', isFormCorrect);
	if (!isFormCorrect) return;
	// if(!form.client) return;
	loading.value = true;
	userStore
		.updateUser(formObj.id, formObj)
		.then(() => {
			if (currentUser.role === 'CLIENT') {
				getContacts(currentUser.activeUserId);
			} else {
				getContacts(route.query.client);
			}
			v$.value.$errors = [];
	        v$.value.$reset();
			form.lastName = '';
			form.firstName = '';
			form.phone = '';
			form.id = 0;
			form.email = '';
			loading.value = false;
			toaster.success('Contact added successfully');
			visible.value = false;
		})
		.catch((error) => {
			toaster.error('Error adding contact');
			console.error(error);
		})
		.finally(() => {
			loading.value = false;
		});
};
// Function to handle form submission
const handleSubmit = async () => {	
	form.client = parseInt(currentUser.role === 'CLIENT' ? currentUser.activeUserId : route.query.client);
	if(form.id !== 0){
		console.log('Testt')
		handleUpdateContact(form);
		return
	}
	const isFormCorrect = await v$.value.$validate();
	if (!isFormCorrect) return;
	// if(!form.client) return;
	loading.value = true;
	
	userStore
		.submitContact(form)
		.then(() => {
			if (currentUser.role === 'CLIENT') {
				getContacts(currentUser.activeUserId);
			} else {
				getContacts(route.query.client);
			}
			v$.value.$errors = [];
	        v$.value.$reset();
			form.lastName = '';
			form.firstName = '';
			form.phone = '';
			form.id = 0;
			form.email = '';
			loading.value = false;
			toaster.success('Contact added successfully');
			visible.value = false;
		})
		.catch((error) => {
			toaster.error('Error adding contact');
			console.error(error);
		})
		.finally(() => {
			loading.value = false;
		});
};



const deleteSelectedContacts = (duty) => {
	     if(!confirm("Are you sure you want to delete these contacts?")) return;
	     loading.value = true;
		console.log('Deleting selected authoritative contacts:', selectedAuthoritativeContacts.value);
		          let selectedContacts;

				if (duty === 'BILLING') {
				selectedContacts = selectedBillingContacts.value;
				} else if (duty === 'AUTHORITATIVE') {
				selectedContacts = selectedAuthoritativeContacts.value;
				} else {
				  selectedContacts = selectedOwnerContacts.value;
				}
		    userStore
			.deleteBulkContacts(selectedContacts)
			.then(() => {
				if (currentUser.role === 'CLIENT') {
				    getContacts(currentUser.activeUserId);
				} else {
				   getContacts(route.query.client);
			    }
				selectedAuthoritativeContacts.value = [];
				selectedBillingContacts.value = [];
				selectedOwnerContacts.value = [];
				toaster.success('Contact(s) deleted successfully');
			})
			.catch((error) => {
				toaster.error('Error deleting contact(s)');
				console.error(error);
			})
			.finally(() => {
				loading.value = false;
			})
};

const phoneValidationError = ref(false);
const emailValidationError = ref(false);

const isPhoneUnique = debounce(() => {
  userStore.isFieldUnique('phone', form.phone, form.id).then((response) => {
    phoneValidationError.value = response.data === true; // Set to true if the phone exists
  });
}, 500);


const isEmailUnique = debounce(() => {
  userStore.isFieldUnique('email', form.email, form.id).then((response) => {
    emailValidationError.value = response.data === true; // Set to true if the email exists
});
}, 500);


watch(
  () => form.phone,
  () => {
    if (form.phone) isPhoneUnique();
  }
);

watch(
  () => form.email,
  () => {
    if (form.email) isEmailUnique();
  }
);

// Form validation function
const isClientFormValid = () => {
  return !phoneValidationError.value && !emailValidationError.value || loading.value == true;
};

const showDetails = (contact, dutyParam) => {
	//reset form first
	form.lastName = '';								
	form.firstName = '';
	form.phone = '';
	form.email = '';
	form.duty = '';
	// form.role = '';
	// form.client = '';
	form.id = 0;
	if(contact){
		form.lastName = contact?.lastName;
		form.firstName = contact?.firstName;
		form.phone = contact?.phone;
		form.email = contact?.email;
		form.duty = contact?.duty;
		form.role = contact?.role;
		form.client = contact?.client;
		form.id = contact?.id;
	}
	visible.value = true;
	let selectedContacts;

				if (dutyParam === 'BILLING') {
				   selectedContacts = 'Billing';
				} else if (dutyParam === 'AUTHORITATIVE') {
				   selectedContacts = 'Authoritative';
				} else {
				  selectedContacts = 'Account Owner';
				}


	         duty.value = selectedContacts;
}
</script>

<template>
	<Layout>
		<div class="page-wrapper">
			<div class="page-content">
				<BreadCrumb title="Admin" icon="bx bxs-cog" />
				<p class="text-white">Manage Contacts</p>
				<Card class="card-color rounded-0 p-5">
					<div class="description">
						<p class="text-white">Below is contact information relating to the account owner, also known as
							the key
							account owner</p>
					</div>

					<Card class="border-card rounded-0">
						<div class="card-header">
							<h5 class="text-white">Account Owner</h5>
							<div class="btn-group gap-2 bulk-actions">
								<button v-if="!canDeleteOwnerContacts" :disabled="owners?.length > 0" @click="showModal('OWNER')" class="btn btn-secondary rounded-0 btn-sm maz-gradient-btn" type="button">Add</button>
								<button :disabled="loading" v-if="canDeleteOwnerContacts" @click="deleteSelectedContacts('OWNER')" type="button" class="btn btn-secondary rounded-0 btn- maz-gradient-btn">
								{{ loading ? '' : 'Delete' }}
								</button>
							</div>
						</div>
						<CardBody>
							<table class="table table-dark table-borderless">
								<thead>
									<tr>
										<th scope="col"></th>
										<th scope="col border-start-0">Name</th>
										<th scope="col">Phone number</th>
										<th scope="col">Email Address</th>
										<th scope="col" >Edit</th>
									</tr>
								</thead>
								<tbody>
									<tr v-if="owners?.length > 0" v-for="owner in owners" :key="owner.id">
										<td><Checkbox v-model="selectedOwnerContacts" :value="owner.id" /></td>
										<td>{{ owner?.firstName }} {{ owner?.lastName }}</td>
										<td>{{ owner?.phone }}</td>
										<td class="email"><a :href="`mailto:${owner?.email}`">{{ owner?.email }}</a></td>
										<td><i class="bx bx-edit fs-5 cursor-pointer" @click="showDetails(owner,'OWNER')"</i></td>
									</tr>
									<tr v-else>
										<td colspan="12" class="text-center text-danger">No acount owner found.</td>
									</tr>
								</tbody>
							</table>
						</CardBody>
					</Card>

					<div class="description">
						<p class="text-white">Below is a listing of additional contacts. You can edit these contacts by
							clicking
							on a contact's
							name</p>
					</div>

					<Card class="border-card rounded-0">
						<div class="card-header d-flex justify-content-between align-items-center">
							<h5 class="text-white">Authoritative Contacts</h5>
							<div class="btn-group gap-2 bulk-actions">
								<button v-if="!canDeleteAuthoritativeContacts" @click="showModal('AUTHORITATIVE')" class="btn btn-secondary rounded-0 btn-sm maz-gradient-btn" type="button">Add</button>
								<button :disabled="loading" v-if="canDeleteAuthoritativeContacts" @click="deleteSelectedContacts('AUTHORITATIVE')" type="button" class="btn btn-secondary rounded-0 btn- maz-gradient-btn">
								{{ loading ? '' : 'Delete' }}
								</button>
							</div>
						</div>
						<CardBody class="card-body">
							<table class="table table-dark table-borderless">
								<thead>
									<tr>
										<th scope="col"></th>
										<th scope="col">Name</th>
										<th scope="col">Phone number</th>
										<th scope="col">Email Address</th>
										<th scope="col">Edit</th>
									</tr>
								</thead>
								<tbody>
									<tr v-if="authoritativeContacts?.length > 0" v-for="contact in authoritativeContacts" :key="contact.id" >
										<td><Checkbox v-model="selectedAuthoritativeContacts" :value="contact.id" /></td>
										<td>{{ contact?.firstName }} {{ contact?.lastName }}</td>
										<td>{{ contact?.phone }}</td>
										<td class="email"><a :href="`mailto:${contact?.email}`">{{ contact?.email }}</a></td>
										<td><i class="bx bx-edit fs-5 cursor-pointer" @click="showDetails(contact,'AUTHORITATIVE')"</i></td>
									</tr>
									<tr v-else>
										<td colspan="12" class="text-center text-danger">No authoritative contacts found</td>
									</tr>
								</tbody>
							</table>
						</CardBody>
					</Card>

					<Card class="border-card rounded-0">
						<div class="card-header d-flex justify-content-between align-items-center">
							<h5 class="text-white">Billing Contacts</h5>
							<div class="btn-group gap-2">
								<button v-if="!canDeleteBillingContacts" @click="showModal('BILLING')" type="button" class="btn btn-secondary rounded-0 btn-sm maz-gradient-btn">Add</button>
								<button :disabled="loading" v-if="canDeleteBillingContacts" @click="deleteSelectedContacts('BILLING')" type="button" class="btn btn-secondary rounded-0 btn-sm maz-gradient-btn">
									{{ loading ? '' : 'Delete' }}
								</button>
							</div>
						</div>
						<CardBody>
							<table class="table table-dark table-borderless">
								<thead>
									<tr>
										<th scope="col"></th>
										<th scope="col">Name</th>
										<th scope="col">Phone number</th>
										<th scope="col">Email Address</th>
										<th scope="col">Edit</th>
									</tr>
								</thead>
								<tbody>
									<tr v-if="billingContacts?.length > 0" v-for="contact in billingContacts" :key="contact.id">
										<td><Checkbox v-model="selectedBillingContacts" :value="contact.id" /></td>
										<td>{{ contact?.firstName }} {{ contact?.lastName }}</td>
										<td>{{ contact?.phone }}</td>
										<td class="email"><a :href="`mailto:${contact?.email}`">{{ contact?.email }}</a></td>
										<td><i class="bx bx-edit fs-5 cursor-pointer" @click="showDetails(contact,'BILLING')"</i></td>
									</tr>
									<tr v-else>
										<td colspan="12" class="text-center text-danger">No billing contacts found</td>
									</tr>
								</tbody>
							</table>
						</CardBody>
					</Card>
				</Card>
			</div>
		</div>
		<Dialog v-model:visible="visible" position="top" modal :header="form.id ? `Edit ${duty} Contact` : `Add ${duty} Contact`" :style="{ width: '30rem' }">
			<Row class="g-3">
				  <Column classes="col-md-12">
					<InputLabel labelText="First Name" classes="form-label" htmlFor="firstName"/>
					<Input v-model="form.firstName" type="text" classes="form-control" id="firstName" placeholder="" />
					<InputError classes="input-errors" :errors="v$.firstName.$errors" message="First Name is required" />
				  </Column>

				  <Column classes="col-md-12">
					<InputLabel labelText="Last Name" classes="form-label" htmlFor="lastName"/>
					<Input v-model="form.lastName" type="text" classes="form-control" id="lastName" placeholder="" />
					<InputError classes="input-errors" :errors="v$.lastName.$errors" message="Last Name is required" />
				  </Column>
				 
				  <Column class="col-md-12">
						<InputLabel labelText="Phone" classes="form-label" htmlFor="phone"/>
						<InputNumber id="phone" v-model="form.phone" classes="form-control" placeholder="" />
						<span v-if="phoneValidationError" class="text-danger">Phone Number already exist.</span>
                        <InputError v-else-if="!phoneValidationError" classes="input-errors" :errors="v$.phone.$errors" message="Phone Number is required" />
				  </Column>
				

				  <Column classes="col-md-12">
					<InputLabel labelText="Email" classes="form-label" htmlFor="email"/>
					<Input v-model="form.email" type="text" classes="form-control" id="email" @blur="isEmailUnique"/>
					<span v-if="emailValidationError" class="text-danger">Email already exist.</span>
					<InputError v-else-if="!emailValidationError" classes="input-errors" :errors="v$.email.$errors" message="Email is required" />
				  </Column>
				 
				  <div class="col-12">
					<div class="ms-auto">
						<Button @click="handleSubmit" classes="w-100 btn maz-gradient-btn" type="button" 
                          :disabled="!isClientFormValid()" :showLoading="loading">
                          <template #content>
                          {{ loading ? '' : 'Submit' }}
                          </template>									  
                          <Spinner v-if="loading" :showLoading="loading" class="spinner-border spinner-border-sm" />
                        </Button>
					</div>
				  </div>
				</Row>
		</Dialog>
	</Layout>
</template>

<style scoped>
.container {
	margin-top: 50px;
}

.card {
	background-color: #1e1e1e;
	border: none;
	display: block;
	margin-bottom: 20px;
}

.card-header {
	border-bottom: 2px solid #555;
}

.card-body {
	padding: 0;
}

.btn-group {
	float: right;
}

.btn {
	color: #ffffff;
	background-color: #333;
	border: none;
}

.btn:hover {
	background-color: #555;
}

table {
	width: 100%;
}

.table-borderless>:not(caption)>*>* {
	border-bottom: 2px solid #555;
}

th {
	background-color: #141313 !important;
}

td {
	background-color: #555 !important;
}

th,
td {
	padding: 10px;
}



.section-title {
	font-weight: bold;
}

.add-delete-btn {
	text-align: right;
}

.description {
	margin-bottom: 20px;
}

.card-color {
	background-color: #161515;
}

.border-card {
	border-top: #555 2px solid;
	border-left: #555 2px solid;
	border-right: #555 2px solid;
}

.p-inputtext {
	width: 100%;
}
</style>
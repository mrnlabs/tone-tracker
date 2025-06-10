<script setup>
import { onMounted, ref, reactive, watch } from 'vue';
import Layout from '@/views/shared/Layout.vue';
import BreadCrumb from '@/components/BreadCrumb.vue';
import { useVuelidate } from '@vuelidate/core';
import { required, email, requiredIf } from '@vuelidate/validators';
import { useUserStore } from '@/stores/userStore';
import useToaster from '@/composables/useToaster';
import { useAuth } from '@/stores/auth';
import { useConfirm } from "primevue/useconfirm";
import router from '@/router';
import Paginator from '@/components/Paginator.vue';
import Dialog from 'primevue/dialog';
import InputLabel from '@/components/form-components/InputLabel.vue';
import Input from '@/components/form-components/Input.vue';
import InputError from '@/components/form-components/InputError.vue';
import Column from '@/components/general/Column.vue';
import InputNumber from '@/components/form-components/InputNumber.vue';
import SelectDropdown from '@/components/form-components/SelectDropdown.vue';
import Row from '@/components/general/Row.vue';
import {userRolesTransformer} from '@/utils';
import Spinner from '@/components/buttons/Spinner.vue';
import Button from '@/components/buttons/Button.vue';
import UserCard from '@/components/UserCard.vue';
import Card from '@/components/general/Card.vue';
import CardBody from '@/components/general/CardBody.vue';
import SearchInput from '@/components/form-components/SearchInput.vue';
import debounce from 'lodash.debounce';
import isMyProfile from '@/utils/isMyProfile';
import ProgressSpinner from 'primevue/progressspinner';

const userStore = useUserStore();
const toaster = useToaster();
const auth = useAuth();


const visible = ref(false);

let paginatedUsers = ref([]); // This will store the users to be displayed on the current page
let showLoading = ref(false);

const rowsPerPage = ref(10); // Rows per page
const totalRecords = ref(0); // Total number of records
const currentPage = ref(1); // Current page

const users = ref([...userStore.allUsers]);
let modalData = reactive({});
const allData = ref([]); //for pagination
const ROLES = ref([]);

const phoneValidationError = ref(false);
const emailValidationError = ref(false);

onMounted(() => {
getAllUsers();
  getRoles();
});

const getRoles = async () => {
  try {
    const response = await auth.getRoles();
	auth.setAllRoles(response.data);
    ROLES.value = auth.allRoles.filter(role => role !== 'CLIENT' && role !== 'SUPPLIER' && role !== 'TTG_TALENT');
  } catch (error) {
    console.error("Failed to fetch roles", error);
  }
};

const toggleModal = () => {
	form.id = 0;
	form.firstName = '';
	form.lastName = '';
	form.email = '';
	form.phone = '';
	form.role = '';
	form.bio = '';
	form.password = '';
	phoneValidationError.value = false
    emailValidationError.value = false

	isEdit.value = false;
	visible.value = true,
	modalData.value = {}
}

 const searchInput = ref('');
 watch(searchInput, () => {
    onInput();
 });

const onInput = debounce(() => {
	if(searchInput.value){ 
		userStore.getUsers(null,searchInput.value).then(function (response) {
			users.value = [...response.data.content];
            allData.value = response.data;			
		})
	 } else {
		users.value = [...userStore.allUsers];
		console.log(allData.value)
		allData.page = userStore.allUsers
	 }
}, 500);


  const isEdit = ref(false);
  const showDetails = (user) => {
	modalData.value = user;
	isEdit.value = true;
	visible.value = true
	Object.assign(form,user)
  }

  const deleteUser = (user) => {
	if(isMyProfile(user)) return
	if(!confirm("Are you sure you want to delete this staff member?")) return;
		userStore.deleteUser(user.id).then(function (response) {
		toaster.success("Staff member deleted successfully");
		//refetch data
		getAllUsers();
	   }).catch(function (error) {
		toaster.error("Error deleting staff member");
		console.log(error);
	   })	
}


const updatePaginatedUsers = () => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  paginatedUsers.value = userStore.allUsers?.slice(start, end);
};
const getAllUsers = async () => {
  showLoading.value = true;
  try {
    const response = await userStore.getUsers();
	userStore.setAllUsers(response.data.content);
	
	allData.value = response.data;
	users.value = userStore.allUsers;
   
    totalRecords.value =userStore.allUsers.length;
    updatePaginatedUsers();
  } catch (error) {
    toaster.error("Error fetching users");
    console.log(error);
  } finally {
    showLoading.value = false;
  }
};

const redirectToProfile = (user) => {
	if(!user?.staff) return
  router.push({ name: "staff-profile", params: { id: user?.staff, userId: user?.id } });
  // :to="{ path: `/staff-profile/${user?.staff}/${user?.id}` }"
};

const form = reactive({
   id: 0,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: "",
  bio: "",
});


const rules = {
  firstName: { required },
  email: { required, email },
  lastName: { required },
  phone: { required },
  role: { required },
};

const v$ = useVuelidate(rules, form);

const onSubmit = async () => {
	
  const isFormValid = await v$.value.$validate();
  
  if (!isFormValid) {
    return;
  }
  showLoading.value = true;
  if (modalData.value.id) {
    return userStore.updateUser(modalData.value.id, form)
      .then(function (response) {
        console.log(response);
        showLoading.value = false;
		Object.assign(form, {});
		v$.value.$reset();
		v$.value.$errors = [];
		
        visible.value = false;
		getAllUsers();
        toaster.success("User updated successfully");
      })
      .catch(function (error) {
        showLoading.value = false;
        toaster.error("Error updating user");
        console.log(error);
      });
  } else {
    userStore.submitUser(form)
      .then(function (response) {
        showLoading.value = false;
        visible.value = false;
		getAllUsers();
		Object.assign(form, {});
		v$.value.$reset();
		v$.value.$errors = [];
        toaster.success("User created successfully");
      })
      .catch(function (error) {
        showLoading.value = false;
        toaster.error("Error creating user");
        console.log(error);
      });
  }
};

const handlePageChange = (newPage) => {
  userStore.getUsers(newPage).then(function (response) {
	userStore.setAllUsers(response.data.content);
	users.value = userStore.allUsers;
  });
};
const isPhoneUnique = debounce(() => {
  userStore.isFieldUnique('phone', form.phone, form.id).then((response) => {
    phoneValidationError.value = response.data === true; // Set to true if the phone exists
  });
}, 500);


const isEmailUnique = debounce(() => {
  userStore.isFieldUnique('email', form.email,form.id).then((response) => {
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
const isStaffFormValid = () => {
  return !phoneValidationError.value && !emailValidationError.value || showLoading.value == true;
};
</script>
<template>
    <Layout>
        <div class="page-wrapper">
			<div class="page-content ">
                <BreadCrumb title="TTG Staff Members" icon="bx bxs-user-badge"/>
				<Card>
					<CardBody class="card-body">
						<div class="d-lg-flex align-items-center mb-4 gap-3">
							<div class="position-relative">
								<SearchInput 
								placeholder="Search" 
								id="searchInput"
								v-model="searchInput" @input="onInput" classes="form-control ps-5" type="search">
									<template #search>
										<span class="position-absolute top-50 product-show translate-middle-y">
											<i class="bx bx-search"></i>
										</span>
									</template>
								  </SearchInput>
								
							</div>

						  <div class="ms-auto">
							<Button @click="toggleModal" classes="btn maz-gradient-btn mt-2 mt-lg-0" type="button">
								<template #content>
									Add Staff
								</template>			
							  </Button>
						  </div>
						</div>
					

						<Row class="row-cols-1 row-cols-md-3 row-cols-lg-2 row-cols-xl-3 row-cols-xxl-4 "> 
							<Column class="col" v-if="users?.length > 0" v-for="user in users" :key="user.id">
								<Card classes="radius-15">
									<CardBody class="text-center  animate__animated animate__zoomIn">
							         <UserCard 
									 :isStaff="true"
									 :user="user" 
									 classes="p-4 border radius-15" 
									 @gotToProfile="redirectToProfile" 
									 @edit="showDetails" 
									 @delete="deleteUser"
									 />
							       </CardBody>
						       </Card>
							</Column>
							<ProgressSpinner v-if="showLoading" style="width: 30px; height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
							
						</Row>
						<Card class="card" v-if="!showLoading">
							<Paginator :page="allData?.page" @changePage="handlePageChange" />
						</Card>
					</CardBody>
				</Card>
				<Dialog v-model:visible="visible" position="top" modal :header="isEdit ? 'Edit Staff Member' : 'Add Staff Member'" :style="{ width: '45rem' }">
					<Row>
						<Column class="col-lg-12">
							<Row classes="g-3">
							  <Column classes="col-md-6">
								<InputLabel labelText="First Name" classes="form-label" htmlFor="firstName"/>
								<Input v-model="form.firstName" type="text" classes="form-control" id="firstName" placeholder="" />
								<InputError classes="input-errors" :errors="v$.firstName.$errors" message="First Name is required" />
							  </Column>

							  <Column classes="col-md-6">
								<InputLabel labelText="Last Name" classes="form-label" htmlFor="lastName"/>
								<Input v-model="form.lastName" type="text" classes="form-control" id="lastName" placeholder="" />
								<InputError classes="input-errors" :errors="v$.lastName.$errors" message="Last Name is required" />
							  </Column>

							  <Column classes="col-md-6">
								<InputLabel labelText="Email" classes="form-label" htmlFor="email"/>
								<Input v-model="form.email" type="email" classes="form-control" id="email" placeholder="" />
								<span v-if="emailValidationError" class="text-danger">Email already exist.</span>
								<InputError v-else-if="!emailValidationError" classes="input-errors" :errors="v$.email.$errors" message="Email is required" />
							  </Column>

							  <Column classes="col-md-6">
								<InputLabel labelText="Phone Number" classes="form-label" htmlFor="cell"/>
								<InputNumber v-model="form.phone" classes="form-control" id="phone" placeholder="" />
								<span v-if="phoneValidationError" class="text-danger">Phone Number already exist.</span>
								<InputError v-else-if="!phoneValidationError" classes="input-errors" :errors="v$.phone.$errors" message="Phone Number is required" />
							  </Column>

							  <Column classes="col-md-6">
								<InputLabel labelText="Role" classes="form-label" htmlFor="role"/>
								<SelectDropdown v-model="form.role" classes="form-control" id="role" :dataList="userRolesTransformer(ROLES)" placeholder="Select Role" />
								<InputError :errors="v$.role.$errors" classes="input-errors" message="Role is required" />
							  </Column>
							</Row>
		  
							<Column class="col-12 mt-3">
							  <div class="d-grid">
									<Button @click="onSubmit" classes="btn maz-gradient-btn" type="button" text="Submit" 
									:disabled="!isStaffFormValid()" >
									  <template #content>
										{{ modalData.value?.id ? showLoading ? '' : 'Update' : showLoading ? '' : 'Submit' }}
									  </template>									  
									  <Spinner v-if="showLoading" class="spinner-border spinner-border-sm" />
									</Button>
							  </div>
							</Column>
						</Column>
					  </Row>
				</Dialog>
			</div>
		</div>
    </Layout>
</template>
<script setup>
import { onMounted, ref, reactive } from 'vue';
import Layout from '@/views/shared/Layout.vue';
import BreadCrumb from '@/components/BreadCrumb.vue';
import AutoComplete from 'primevue/autocomplete';
import Textarea from 'primevue/textarea';
import Dialog from 'primevue/dialog';
import { useUserStore } from '@/stores/userStore';
import { useStaff } from '@/stores/staff';
import useToaster from '@/composables/useToaster';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useAuth } from '@/stores/auth';
import { useConfirm } from "primevue/useconfirm";

const userStore = useUserStore();
const toaster = useToaster();
const auth = useAuth();
const confirm = useConfirm();
const staff = useStaff();
const currentUser = JSON.parse(auth.user);

let users = ref([]);
let mappedUsers = ref([]);
const staffMembers = ref([]);
let showLoading = ref(false);
let position = ref('top');
const visible = ref(false);
let user = ref(null);
const isEdit = ref(false);

const form = reactive({
    user: '',
	bio: null
});

const rules = { 
    bio: { required },
	user: { required }
};
const v$ = useVuelidate(rules, form);

onMounted(() => {
	getAllUsers();
	getStaffMembers();
});

const getStaffMembers = async () => {
	staff.getStaff().then(function (response) {
		staffMembers.value = response.data.content;
	}).catch(function (error) {
		toaster.error("Error fetching staff members");
		console.log(error);
	})
}

const openModal = (pos,staff=null) => {
	if(staff) {
		isEdit.value = true;
		user.value = users.value.content.find(user => user.id == staff.user)?.firstName + ' ' + users.value.content.find(user => user.id == staff.user)?.lastName;
		form.bio = staff.bio;
		//form.user = staff.user;
		form.id = staff.id;
	}else{
		isEdit.value = false;
		form.user = null;
		form.bio = null;
	}
    position.value = pos;
    visible.value = true;
}

    const searchInput = ref('');

const onInput = () => {
	  console.log('searchInput',searchInput.value, users.value.content)
	 if(searchInput.value) {
		// return users.value = users.value.content.filter(user => user.firstName.toLowerCase().includes(searchInput.value.toLowerCase()) 
		// || user.lastName.toLowerCase().includes(searchInput.value.toLowerCase()))
	 }else{
		getAllUsers();
	 }
  };

  const onSubmit = async () => {
	const isFormValid = await v$.value.$validate();
	if (!isFormValid) {
		return;
	}

	if(isEdit.value) {
		return updateStaff(form)
	}
	staff.createStaff(form).then(function (response) {
		toaster.success("Staff member created successfully");
		visible.value = false;
		form.user = '';
		form.bio = null;
		//refetch data
		getStaffMembers();
	   }).catch(function (error) {
		toaster.error("Error creating staff member");
		console.log(error);
	   })
  }

  const updateStaff = async (form) => {
	console.log(form)
	staff.updateStaff(form.id,form).then(function (response) {
			toaster.success("Staff member updated successfully");
			visible.value = false;
			form.user = '';
			form.bio = null;
			//refetch data
			getStaffMembers();
		   }).catch(function (error) {
			toaster.error("Error updating staff member");
			console.log(error);
		   });
  }
  const getAllUsers = async () => {
	showLoading.value = true;
	userStore.getUsers().then(function (response) {
		showLoading.value = false;
		users.value = response.data;
		mappedUsers.value = users.value.content.map(user => {
			return {
				name: `${user.firstName} ${user.lastName}`,
				id: user.id
			}
		})
	}).catch(function (error) {
		toaster.error("Error fetching users");
		console.log(error);
	}).finally(function () {
		showLoading.value = false;
	})
  }


  const deleteStaff = (staffMember) => {
	   staff.deleteStaff(staffMember.id).then(function (response) {
		toaster.success("Staff member deleted successfully");
		//refetch data
		getStaffMembers();
	   }).catch(function (error) {
		toaster.error("Error deleting staff member");
		console.log(error);
	   })	
}


const onUserChange = (event) => {
    form.user = users.value.content.find(user => user.firstName + ' ' + user.lastName === event.value)?.id;
}

const search = (event) => {
    const query = event.query.toLowerCase();
	let myObj = users.value.content.filter(user => user.firstName.toLowerCase().includes(query))
    mappedUsers.value = myObj.map(u => u.firstName + ' ' + u.lastName);
};
const deleteRecord = (event, staff) => {
    confirm.require({
        target: event.currentTarget,
        message: 'Do you want to delete this staff?',
        // icon: 'bx bx-trash text-danger',
		icon: '',
        rejectProps: {
            label: 'Cancel',
            severity: '',
            outlined: true
        },
        acceptProps: {
            label: 'Delete',
            severity: 'danger'
        },
        accept: () => {
			deleteStaff(staff);
        },
        reject: () => {
            //do nothing
        }
    });
};

const getUserDetails = (user,dataType) => {
	// let userData = users.value.content.find(u => u.id === user.user)?.firstName + ' ' + users.value.content.find(u => u.id === user.user)?.lastName
	let userData = users.value.content.find(u => u.id === user.user)
	if(dataType === 'email') {
		return userData?.email
	}else if(dataType === 'phone') {
		return userData?.phone
	}else if(dataType === 'fullName') {
		return userData?.firstName + ' ' + userData?.lastName;
	}else if(dataType === 'role') {
		return userData?.role
	}else{
		return ''
	}
}
</script>
<template>
    <Layout>
        <div class="page-wrapper">
			<div class="page-content">
                <BreadCrumb title="Staff Members" icon="bx bxs-group"/>
				<div class="card">
					<div class="card-body">
						<div class="d-lg-flex align-items-center mb-4 gap-3">
							<div class="position-relative">
								<input v-model="searchInput" @input="onInput"
								type="text" class="form-control ps-5 radius-30" placeholder="Search"> <span class="position-absolute top-50 product-show translate-middle-y"><i class="bx bx-search"></i></span>
							</div>
						  <div class="ms-auto">
							<a @click="openModal('top')" class="btn maz-gradient-btn radius-30 mt-2 mt-lg-0">
							<i class="bx bxs-plus-square"></i>Add Staff Member</a></div>
						</div>
						<div class="table-responsive">
							<table class="table mb-0">
								<thead class="table-light">
									<tr>
										<th>Full Name</th>
										<th>Email</th>
										<th>Cell Number</th>
										<th>Role</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									<tr v-if="staffMembers?.length > 0" v-for="user in staffMembers" :key="user.id">
										<td>{{ getUserDetails(user,'fullName') }}</td>
										<td>{{ getUserDetails(user,'email')}}</td>
										<td>{{ getUserDetails(user,'phone')}}</td>
										<td>{{ getUserDetails(user,'role')}}</td>
										<td>
											<div class="d-flex order-actions">
												<a @click="openModal('top',user)" href="javascript:;" class="">
													<i class='bx bxs-edit'></i></a>
												<a @click="deleteRecord($event,user)" href="javascript:;" class="ms-3">
													<i class='bx bxs-trash text-danger'></i>
												</a>
												<ConfirmPopup></ConfirmPopup>
											</div>
										</td>
									</tr>
									<tr v-else>
										<td colspan="7" class="text-center text-danger">
											No staff members found.
										</td>
									</tr>
									
								
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
		<Dialog v-model:visible="visible" position="top" modal :header="isEdit ? 'Edit Staff' : 'Add Staff'" :style="{ width: '50rem' }">

			<form @submit.prevent="onSubmit" class="row g-3">
				<div class="col-md-12">
					<div class="card my-card flex justify-center">
						<label for="input1" class="form-label">User</label>
						<AutoComplete v-model="user" forceSelection dropdown :suggestions="mappedUsers" 
                              @item-select="onUserChange($event)" @complete="search" field="name" placeholder="Select User" />
						   <div class="input-errors" v-for="error of v$.user.$errors" :key="error.$uid">
						   <div class="text-danger">User is required</div>
						</div>
				</div>                        
				</div>
				<div class="col-md-12">
					<div class="card my-card flex justify-center">
						<label for="input1" class="form-label">Bio</label>
						<Textarea v-model="form.bio" autoResize rows="5" cols="30" />
						  
				</div>                        
				</div>

				<div class="modal-footer">
					<!-- <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button> -->
					<button type="submit" class="btn maz-gradient-btn w-100">{{ isEdit ? 'Update' : 'Submit' }}</button>
				</div>
				
			</form>
		</Dialog>
    </Layout>
</template>
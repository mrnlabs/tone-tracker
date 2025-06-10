<script setup>
import { onMounted, ref, reactive } from 'vue';
import Layout from '@/views/shared/Layout.vue';
import BreadCrumb from '@/components/BreadCrumb.vue';
import UsersModal from './UsersModal.vue';
import { useUserStore } from '@/stores/userStore';
import useToaster from '@/composables/useToaster';


const userStore = useUserStore();
const toaster = useToaster();
let users = ref([]);
let showLoading = ref(false);
let modalData = reactive({});

onMounted(() => {
	getAllUsers();
})

let showModal = ref(true);
const toggleModal = () => {
	showModal.value = true,
	modalData.value = {}
}

const hideModal = () => {
	showModal.value = false,
	getAllUsers();
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

  const getAllUsers = () => {
	showLoading.value = true;
	userStore.getUsers().then(function (response) {
		showLoading.value = false;
		users.value = response.data
	}).catch(function (error) {
		toaster.error("Error fetching users");
		console.log(error);
	}).finally(function () {
		showLoading.value = false;
	})
  }

  const showDetails = (user) => {
	modalData.value = user;
  }

  const deleteUser = (user) => {
	if(confirm("Are you sure you want to delete this user?")) {
		userStore.deleteUser(user.id).then(function (response) {
		toaster.success("User deleted successfully");
		//refetch data
		getAllUsers();
	   }).catch(function (error) {
		toaster.error("Error deleting user");
		console.log(error);
	   })	
  }
}

</script>
<template>
    <Layout>
        <div class="page-wrapper">
			<div class="page-content">
                <BreadCrumb title="All Users" icon="bx bxs-user-badge"/>
				<div class="card">
					<div class="card-body">
						<div class="d-lg-flex align-items-center mb-4 gap-3">
							<div class="position-relative">
								<input v-model="searchInput" @input="onInput"
								type="text" class="form-control ps-5 radius-30" placeholder="Search"> <span class="position-absolute top-50 product-show translate-middle-y"><i class="bx bx-search"></i></span>
							</div>
						  <div class="ms-auto">
							<a @click="toggleModal" href="javascript:;" data-bs-toggle="modal" data-bs-target="#create-user"  class="btn maz-gradient-btn radius-30 mt-2 mt-lg-0">
							<i class="bx bxs-plus-square"></i>Add User</a></div>
						</div>
						<div class="table-responsive">
							<table class="table mb-0">
								<thead class="table-dark">
									<tr>
										<th>Contact Name</th>
										<th>Contact Surname</th>
										<th>Email</th>
										<th>Cell Number</th>
										<th>Role</th>
										<th>Activation Area</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									<tr v-if="users?.content" v-for="user in users?.content" :key="user.id">
										<td>{{user.firstName}}</td>
										<td>{{user.lastName}}</td>
										<td>{{user.email}}</td>
										<td>{{user.phone}}</td>
										<td>
											{{user.role}}
										</td>
										<td>
												Johannesburg
										</td>
										<td>
											<div class="d-flex order-actions">
												<a @click="showDetails(user)" href="javascript:;" data-bs-toggle="modal" data-bs-target="#create-user" class="">
													<i class='bx bxs-edit'></i></a>
												<a @click="deleteUser(user)" href="javascript:;" class="ms-3"><i class='bx bxs-trash text-danger'></i></a>
											</div>
										</td>
									</tr>
									<tr v-else>
										<td colspan="7" class="text-center text-danger">
											No activations found.
										</td>
									</tr>
									
								
								</tbody>
							</table>
						</div>
					</div>
				</div>

				<UsersModal v-if="showModal"
				:showModal="showModal"
				:modalData="modalData"
				@closeModal="hideModal()"
				/>
			</div>
		</div>
    </Layout>
</template>
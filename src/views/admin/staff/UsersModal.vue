<script setup>
import { useUserStore } from '@/stores/userStore';
import { ref,reactive, watch, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
import useToaster from '@/composables/useToaster';
import { useAuth } from '@/stores/auth';

const emit = defineEmits(['closeModal']);	
const props = defineProps({
	showModal: Boolean,
	modalData: Object
})

const userStore = useUserStore();
const toaster = useToaster();
const auth = useAuth();

const ROLES = ref([]);

onMounted(() => {
	getRoles();
});
const getRoles = async () => {
	auth.getRoles().then(function (response) {
		ROLES.value = response.data;
		console.log(ROLES.value);
	})
}


let showLoading = ref(false);
let showModal = ref(props.showModal);
let modalData = reactive({...props.modalData});

const form = reactive({
	  firstName: '',
	  lastName: '',
      email: '',
	  phone: '',
      activationArea: '',
	  location: [],
	  role: "",
	  topSize: "",
          pantsSize: "",
          dressSize: "",
          bio: "",
    });

watch(() => props.modalData, (newVal) => {
	Object.assign(modalData, newVal);
	
	Object.assign(form, {
		firstName: modalData.value.firstName || '',
		lastName: modalData.value.lastName || '',
		email: modalData.value.email || '',
		phone: modalData.value.phone || '',
		activationArea: modalData.value.activationArea || '',
		location: modalData.value.location || [],
		topSize: modalData.value.topSize || 'X_LARGE',
		pantsSize: modalData.value.pantsSize || 30,
		dressSize: modalData.value.dressSize || 'X_LARGE',
		bio: modalData.value.bio || '',
		role: modalData.value.role || '',
	});
}, { deep: true });

	const rules = {
		firstName: { required },
        email: { required, email },
		lastName: { required },
		phone: { required },
		activationArea: { required },
		role: { required },
    }
	const v$ = useVuelidate(rules, form)

	const onSubmit = async () => {
		const isFormValid = await v$.value.$validate();
		if (!isFormValid) {
			return
		}
			showLoading.value = true;
			if(modalData.value.id){
				showLoading.value = true;
				return userStore.updateUser(modalData.value.id, form).then(function (response) {
					console.log(response)
				})
			}else{
		
			userStore.submitUser(form)
			.then(function (response) {
				showLoading.value = false;
				document.querySelector('.modal-backdrop').remove();
		        emit('closeModal');
				toaster.success("User created successfully");
				}).catch(function (error) {
					showLoading.value = false;
					toaster.error("Error creating user");
					console.log(error);
		    });
			}
		
	}

</script>
<template>
    <div v-if="showModal" class="modal fade" id="create-user" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Create User</h5>
                    <button type="button" class="btn-close maz-gradient-btn" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="form-body mt-4">
					    <div class="row">
						   <div class="col-lg-12">
							<div class="border border-3 p-4 rounded">
                              <div class="row g-3">
								<div class="col-md-6">
									<label for="firstName" class="form-label">First Name</label>
									<input v-model="form.firstName" type="text" class="form-control" id="firstName" >
									<div class="input-errors" v-for="error of v$.firstName.$errors" :key="error.$uid">
										<div class="text-danger">First Name is required</div>
									  </div>
								  </div>
								  <div class="col-md-6">
									<label for="lastName" class="form-label">Last Name</label>
									<input v-model="form.lastName" type="text" class="form-control" id="lastName" >
									<div class="input-errors" v-for="error of v$.lastName.$errors" :key="error.$uid">
										<div class="text-danger">Last Name is required</div>
									  </div>
								  </div>
								  <div class="col-md-6">
									<label for="email" class="form-label">Email</label>
									<input v-model="form.email" type="email" class="form-control" id="email" >
									<div class="input-errors" v-for="error of v$.email.$errors" :key="error.$uid">
										<div class="text-danger">Email is required</div>
									  </div>
								  </div>
								  <div class="col-md-6">
									<label for="cell" class="form-label">Cell Number</label>
									<input v-model="form.phone" type="text" class="form-control" id="cell" >
									<div class="input-errors" v-for="error of v$.phone.$errors" :key="error.$uid">
										<div class="text-danger">Cell Number is required</div>
									  </div>
								  </div>
                                  <div class="col-md-6">
									<label for="activation-area" class="form-label">Activation Area</label>
									<input v-model="form.activationArea" type="text" class="form-control" id="activation-area" >
									<div class="input-errors" v-for="error of v$.activationArea.$errors" :key="error.$uid">
										<div class="text-danger">Activation Area is required</div>
									  </div>
								  </div>

								  <div class="col-md-6">
									<label for="activation-area" class="form-label">Role</label>
									<select v-model="form.role" class="form-control" id="activation-area">
										<option :value="''" :selected="true">Select Role</option>
										<option v-for="role in ROLES" :key="role" :value="role">{{ role }}</option>
									</select>
									<div class="input-errors" v-for="error of v$.role.$errors" :key="error.$uid">
										<div class="text-danger">Role is required</div>
									  </div>
								  </div>
								 
								  <div class="col-12">
									  <div class="d-grid">
										<button @click="onSubmit" class="btn maz-gradient-btn" type="button" 
										   :disabled="v$.activationArea.$errors?.length > 0"> 
											<span v-if="showLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
											{{ modalData.value?.id ? 'Update' : 'Submit' }}
										</button>
									  </div>
								  </div>
							  </div> 
						  </div>
						  </div>
					   </div><!--end row-->
					</div> 
                </div>
            </div>
        </div>
    </div>
</template>
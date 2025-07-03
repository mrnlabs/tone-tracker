<script setup>
import { onMounted, reactive,ref, watch } from 'vue';
import Layout from '@/views/shared/Layout.vue';
import BreadCrumb from '@/components/BreadCrumb.vue';
import useToaster from '@/composables/useToaster';
import { useActivation } from '@/stores/activation';
import AutoComplete from 'primevue/autocomplete';
import InputText from 'primevue/inputtext';
import { useRegion } from '@/stores/useRegion';
import SplitButton from 'primevue/splitbutton';
import Dialog from 'primevue/dialog';
import { useCampaignStore } from '@/stores/useCampaign';
import { useRoute } from 'vue-router';
import URLrouter from '@/router';
import { useStaff } from '@/stores/staff';
import { useUserStore } from '@/stores/userStore';
import { useAuth } from '@/stores/auth';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import ViewActivation from './ViewActivation.vue';
import ViewActivationComponent from './ViewActivationComponent.vue';
import ProgressSpinner from 'primevue/progressspinner';
import CreateActivationModal from './CreateActivationModal.vue';



const route = useRoute();
const userStore = useUserStore();
const authStore = useAuth();
const staff = useStaff();
const campaignId = ref(route.query.campaign);
let campaignDetails = ref(null);
const regionId = ref(route.query.region);
let userRole = null;


watch(
  () => route.query.campaign,
  (newCampaignId) => {
    campaignId.value = newCampaignId;
  },
  () => route.query.region,
  (newRegionId) => {
	regionId.value = newRegionId;
  }
);

const activation = useActivation();
const toaster = useToaster();
const region = useRegion();
const campaignStore = useCampaignStore();

const searchInput = ref('');
const activations = ref([...activation.allActivations]);
let users = ref([]);
let mappedUsers = ref([]);
const createActivation = ref(false);
let showLoading = ref(false);
const regions = ref([]);

const user = JSON.parse(authStore.user);



onMounted(() => {
	if(user.role == 'TTG_SUPER_ADMIN' || user.role == 'TTG_HEAD_ADMIN' || user.role == 'CLIENT'){	
		getAllActivations(user.role, campaignId.value);
	} else if(user.role == 'TTG_ACTIVATION_MANAGER'){
		getAllActivations(user.role, user.activeUserId);
	} else if('TTG_REGIONAL_MANAGER'){
		getAllActivations(user.role, regionId.value);
	}
	getRegions();
	getAllUsers();
	//get campaign details
	getCampaignDetails();

	//get user role from store
	userRole = userStore.get

});


//get campaign details
const getCampaignDetails = () => {
	campaignStore.getCampaignName(campaignId.value).then(function (response) {
		campaignDetails.value = response.data;
	}).catch(function (error) {
		// toaster.error("Error fetching campaign details");
		console.log(error);
	})
}


const canCreateActivation = () => {
	return user.role == 'TTG_SUPER_ADMIN'  
	|| user.role == 'TTG_HEAD_ADMIN';
}

const getAllUsers = async () => {
	showLoading.value = true;
	userStore.getUserByRole('TTG_ACTIVATION_MANAGER').then(function (response) {
		users.value = response.data;
		// getStaffMembers();
		mappedUsers.value = response.data.content.map(user => {
			return {
				name: `${user.firstName} ${user.lastName}`,
				id: user.id
			}
		})
	}).catch(function (error) {
		// toaster.error("Error fetching users");
		console.log(error); 
	}).finally(function () {
		showLoading.value = false;
	})
  }

const getRegions = async () => {
	region.getRegions().then(function (response) {
		regions.value = response.data.content;
	})
}
const onInput = () => {
	 if(searchInput.value){ {
		activations.value = activations.value.filter((active) => {
			console.log('active',active.budget)
			return active.name?.toLowerCase().includes(searchInput.value.toLowerCase()) 
			|| active.budget?.toString().includes(searchInput.value.toLowerCase())
			|| active.brief?.toLowerCase().includes(searchInput.value.toLowerCase())
			|| active.startDate?.toLowerCase().includes(searchInput.value.toLowerCase())
			|| active.endDate?.toLowerCase().includes(searchInput.value.toLowerCase())
			|| active.painPoints?.toLowerCase().includes(searchInput.value.toLowerCase())
			|| active.targetGroup?.toLowerCase().includes(searchInput.value.toLowerCase())
		})
	 }
	
	 }else{
		if(user.role == 'TTG_SUPER_ADMIN' || user.role == 'TTG_HEAD_ADMIN' || user.role == 'TTG_CLIENT'){
			getAllActivations(user.role, campaignId.value);
		} else if(user.role == 'TTG_ACTIVATION_MANAGER'){
			getAllActivations(user.role, user.activeUserId);
		} else if('TTG_REGIONAL_MANAGER'){
			getAllActivations(user.role, regionId.value);
		}
	 }
  };


  const getAllActivations = async (userRole, id) => {
    try {
        showLoading.value = true;        
        if (!user || !user.activeUserId && user.role && user.role != "CLIENT") {
            throw new Error('User data or activeUserId not found');
        }
        const response = await activation.getAllActivations(userRole, id);
		activation.setAllActivations(response.data.content);
        activations.value = activation.allActivations;
		console.log("test", activations);
		if(activations.value.length > 0){
			campaignDetails = activations.value[0].campaignDTO
		}
    } catch (error) {
        console.error('Error fetching activations:', error);
    } finally {
        showLoading.value = false;
    }
};




 
  const deleteActivation = async (activ) => {
	if(!window.confirm("Are you sure you want to delete this activation?")){return}
		activation.deleteActivation(activ.id).then(function (response) {
		toaster.success("Activation deleted successfully");
		//refetch data
		if(user.role == 'TTG_SUPER_ADMIN' || user.role == 'TTG_HEAD_ADMIN' || user.role == 'TTG_CLIENT'){
			getAllActivations(user.role, campaignId.value);
		} else if(user.role == 'TTG_ACTIVATION_MANAGER'){
			getAllActivations(user.role, user.activeUserId);
		} else if('TTG_REGIONAL_MANAGER'){ 
			getAllActivations(user.role, regionId.value);
		}
		
	   }).catch(function (error) {
		toaster.error("Error deleting user");
		console.log(error);
	   })	
 
}

const viewActivationModal = ref(false);
const selectedActivation = ref(null);

const items = (activation) => [
    {
        label: 'View Activation',
        icon: 'bx bx-show fs-4 maz-gradient-txt',
        command: () => {
			selectedActivation.value = null//reset selected activation first
			selectedActivation.value = activation
			viewActivationModal.value = true;
        }
    }, 
    
	{
        label: 'Add Activation Manager',
        icon: 'bx bx-user-plus maz-gradient-txt fs-3',
        command: () => {
            // unitForm.warehouse = warehouse.id
            openModal('top',activation);
        }
    },
	{
        label: 'Delete',
        icon: 'bx bxs-trash fs-4 text-danger',
        command: () => {
            deleteActivation(activation);
        }
    },
];
const activationItems = (activation) => [
    {
        label: 'View Activation',
        icon: 'bx bx-show fs-4 maz-gradient-txt',

        command: () => {
            URLrouter.push(`/view-activation?activation=${activation.id}&campaign=${activation.campaignDTO.name}&name=${activation.name}`);
        }
    },
];

const visible = ref(false);
const position = ref('top');
const editForm = reactive({
	staff: null,
	activation: null
});

const rules = { 
    staff: { required },
	activation: { required }
};
const v$ = useVuelidate(rules, editForm);
const activationName = ref(null);
const activationEdit = reactive({});
const openModal = (pos,activation) => {   
	Object.assign(activationEdit, activation)
	activationName.value = activation.name
    position.value = pos;
    visible.value = true;
	editForm.activation = activation.id;
	activationId.value = activation.id;
}

let staffValue = ref(null);
const activationId = ref(null);
const onUserChange = (event) => {	
	// staffValue.value = event.value
    let selectedUser = users.value.content.find(user => user.firstName + ' ' + user.lastName === event.value)?.id;
	let staff = users.value.content.find(staff => staff.id === selectedUser)?.activeUserId;	
	if(!staff){
		toaster.error("Make sure this user is added as staff member.");
		return 
	}
	editForm.staff = staff;
	
}
	const addActivationManager = async () => {
		showLoading.value = true;
		const form = reactive({
		name:  activationEdit.name,
		budget: activationEdit.budget,
		campaign: activationEdit.campaign,
		region: activationEdit.region,
		startDate: activationEdit.startDate,
		endDate: activationEdit.endDate,
		brief: activationEdit.brief,
		targetGroup: activationEdit.targetGroup,
		painPoints: activationEdit.painPoints,
		staff: editForm.staff
	});

		if(activationId.value){
			try {
				try {
					const response = await activation.addActivationManager(activationId.value, form.staff);
					toaster.success("Activation Manager added successfully");
					visible.value = false;
					if (user.role == 'TTG_SUPER_ADMIN' || user.role == 'TTG_HEAD_ADMIN' || user.role == 'TTG_CLIENT') {
						getAllActivations(user.role, campaignId.value);
					} else if (user.role == 'TTG_ACTIVATION_MANAGER') {
						getAllActivations(user.role, user.activeUserId);
					} else if ('TTG_REGIONAL_MANAGER') {
						getAllActivations(user.role, regionId.value);
					}
				} catch (error) {
					toaster.error("Error updating activation");
					console.log(error);
				}
			} finally {
				showLoading.value = false;
			}
		}
	}


		const search = (event) => {
			const query = event.query.toLowerCase();			
			let myObj = users.value.content.filter(user => user.firstName.toLowerCase().includes(query))
			mappedUsers.value = myObj.map(u => u.firstName + ' ' + u.lastName);
		};

		const isAdmin = () => {
			return user.role == 'TTG_SUPER_ADMIN' 
			|| user.role == 'TTG_HEAD_ADMIN' 
			|| user.role == 'TTG_REGIONAL_MANAGER';
		}

		const isActivationManager = () => {
			return user.role == 'TTG_ACTIVATION_MANAGER';
		}

		const clientColor = JSON.parse(localStorage.getItem('clientColor'));
		const clientColorStyles = {
			color: `#${clientColor?.color} !important`, //clientColor?.color,
			background: `#${clientColor?.color} !important`, //clientColor?.color
			borderColor: `#${clientColor?.color} !important`,
		}
const isNotActivationManager = () => {
	return user.role != 'TTG_ACTIVATION_MANAGER';
}

const activationCreated = () => {
	getAllActivations(user.role, campaignId.value);
	createActivation.value = false;
}

</script>
<template>
    <Layout>
        <div class="page-wrapper">
			<div class="page-content">
                <BreadCrumb title="Activations" icon="bx bxs-user-badge" :style="{ color: clientColorStyles?.color }" />
				<div class="card">
					<div class="card-body">
						<div class="d-lg-flex align-items-center mb-4 gap-3">
							<div class="position-relative">
								<input v-model="searchInput" @input="onInput" 
								:style="{ borderColor: clientColorStyles?.borderColor }"
								type="text" class="form-control ps-5" placeholder="Search"> <span class="position-absolute top-50 product-show translate-middle-y"><i class="bx bx-search"></i></span>
							</div>
						  <div v-if="canCreateActivation()" class="ms-auto">
							<button @click="createActivation = true"
							:style="{ background: clientColorStyles?.background }"  class="btn maz-gradient-btn mt-2 mt-lg-0">
							<i class="bx bxs-plus-square"></i>Create Activation</button>
						</div>
						</div>
						<div class="table-responsive">
							<table class="table mb-0">
								<thead class="table-dark">
									<tr>
										<th>Name</th>
										<th>Campaign</th>
										<th>Region</th>
										<th v-if="isNotActivationManager()">Budget</th>
										<th>Start Date</th>
										<th>End Date</th>
										<th>Activation Manager</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody > 
									<tr v-if="activations?.length > 0" v-for="activation in activations" :key="activation.id">
										<td>{{activation.name}}</td>
										<td>{{ activation.campaignDTO.name }}</td>
										<td>{{ activation.regionName }}</td>  
										<td v-if="isNotActivationManager()">USD {{activation.budget}}</td>
										<td>{{activation.startDate}}</td>
										<td>{{activation.endDate}}</td>
										<td v-if="activation.firstName != null">
											{{ activation.firstName + ' ' + activation.lastName }}
										</td>
										<td v-else>
											No Manager
										</td>
										<td>
											<div class="d-flex order-actions">
												<template v-if="isAdmin()">
													<SplitButton class="text-white" label="" 
													icon="bx bx-cog fs-4" 
													dropdownIcon="text-white fs-4 bx bx-chevron-down" 
													:model="items(activation)"/>
												</template>
												<template v-if="isActivationManager()">
													<SplitButton class="text-white" label="" 
													icon="bx bx-cog fs-4" 
													dropdownIcon="text-white fs-4 bx bx-chevron-down" 
													:model="activationItems(activation)"/>
												</template>
											
											</div>
											
										</td>
									</tr>
									<tr v-else>
										<td v-if="showLoading" colspan="9" class="text-center text-danger">
											<ProgressSpinner style="width: 30px; height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
										 </td>
										<td v-else colspan="9" class="text-center text-danger">
											No activations found
										</td>
									</tr>
									
								
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>

		<Dialog v-model:visible="createActivation" modal header="Create Activation"  :style="{ width: '50rem', color: clientColorStyles?.color }">
			<CreateActivationModal 
			:campaignName="campaignDetails" 
			:campaignId="campaignId" 
			:activation="selectedActivation" 
			:regions="regions"
			@activationCreated="activationCreated"
			/>
	   </Dialog>
	   
	   <Dialog v-model:visible="viewActivationModal" modal header="View Activation" :class="{ 'p-dialog-maximized': true }">
			<ViewActivationComponent :activation="selectedActivation" :regions="regions"/>
	   </Dialog>

		<Dialog v-model:visible="visible" position="top" modal header="Add Activation Manager" :style="{ width: '30rem', color: clientColorStyles?.color }">             
              <form class="row g-3" @submit.prevent="addActivationManager">
				<div class="col-md-12">
					<div class="card my-card flex justify-center">
						<label for="input1" class="form-label">Activation Name</label>
						   <InputText type="text" v-model="activationName" :disabled="true" fluid :style="{ borderColor: clientColorStyles?.borderColor }" />
				</div>                        
				</div>
				<div class="col-md-12">
					<div class="card my-card flex justify-center">
						<label for="input1" class="form-label">Select Staff Member</label>
						<AutoComplete v-model="staffValue" forceSelection dropdown :suggestions="mappedUsers" :style="{ borderColor: clientColorStyles?.borderColor }" 
                              @item-select="onUserChange($event)" @complete="search" field="name" placeholder="Select Staff Member" />
						   <div class="input-errors" v-for="error of v$.staff.$errors" :key="error.$uid">
						   <div class="text-danger">Please select staff member</div>
						</div>
				</div>     
				</div>
				<div class="modal-footer">
					<button v-if="!showLoading" :style="{ background: clientColorStyles?.background }" :disabled="!staffValue" 
					type="submit" class="btn maz-gradient-btn w-100" style="color: #fff !important;">
					Submit
				</button>
				<ProgressSpinner v-if="showLoading" style="width: 30px; height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
				</div>			
			</form>		   
		</Dialog>
    </Layout>
</template>
<style scoped>
.p-splitbutton {
    height: 36px !important;
}

.p-button {
	background:  var();
	border: none !important;
	color: #fff !important;
}

</style>
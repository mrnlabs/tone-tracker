<script setup>
import { useUserStore } from '@/stores/userStore';
import AutoComplete from 'primevue/autocomplete';
import { ref,reactive, watch, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import useToaster from '@/composables/useToaster';
import { useRegion } from '@/stores/useRegion';
import { useCampaignStore } from '@/stores/useCampaign';

let campaign_id = ref(null);
const emit = defineEmits(['closeModal']);	
const props = defineProps({
	showModal: Boolean,
	modalData: Object
})



const userStore = useUserStore();
const toaster = useToaster();
const regionStore = useRegion();
const campaignStore = useCampaignStore();

let campaigns = ref([]);
let dropdownItems = ref([]);
const regions = ref([]);

onMounted(() => {
	getRegions();
	getCampaigns();
});
const getRegions = async () => {
	regionStore.getRegions().then(function (response) {
		regions.value = response.data.content;
	})
}
const getCampaigns = async () => {
	campaignStore.getCampaigns().then(function (response) {
		campaigns.value = response.data;
		dropdownItems.value = [...campaigns.value];
	})
}


let showLoading = ref(false);
let showModal = ref(props.showModal);
let modalData = reactive({...props.modalData});


const form = reactive({
	  name: '',
	  budget: '',
      campaign: '',
	  region: '',
      start_date: '',
	  end_date: '',
	  target_group: "",
	  pain_points: ""
    });

watch(() => props.modalData, (newVal) => {
	Object.assign(modalData, newVal);
	
	Object.assign(form, {
		name: modalData.value.name || '',
		budget: modalData.value.budget || '',
		campaign_id: modalData.value.campaign_id || '',
		region_id: modalData.value.region_id || '',
		start_date: modalData.value.start_date || '',
		end_date: modalData.value.end_date || '',
		target_group: modalData.value.target_group || '',
		pain_points: modalData.value.pain_points || ''
	});
}, { deep: true });

	const rules = {
		name: { required },
		budget: { required },
		campaign_id: { required },
		region_id: { required },
		start_date: { required },
		end_date: { required },
		target_group: { required },
		pain_points: { required }
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
	const search = (event) => {
    const query = event.query.toLowerCase();
	let myObj = campaigns.value.filter(client => client.name?.toLowerCase().includes(query));
	// make myObj an array of names instead of objects
	dropdownItems.value = myObj.map(client => client.name);

	console.log('dropdownItems',dropdownItems.value)
};

const onCampaignChange = (event) => {
	form.campaign_id = campaigns.value.find(campaign => campaign.name === event.value).id;
	console.log(form.campaign_id);
};


</script>
<template>
    <div v-if="showModal" class="modal fade" id="add-activation" tabindex="-1" aria-hidden="true">
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
									<label for="name" class="form-label">Activation Name</label>
									<input v-model="form.name" type="text" class="form-control" id="name" >
									<div class="input-errors" v-for="error of v$.name.$errors" :key="error.$uid">
										<div class="text-danger">First Name is required</div>
									  </div>
								  </div>
								  <div class="col-md-6">
									<label for="budget" class="form-label">Budget</label>
									<input v-model="form.budget" type="text" class="form-control" id="budget" >
									<div class="input-errors" v-for="error of v$.budget.$errors" :key="error.$uid">
										<div class="text-danger">Budget is required</div>
									  </div>
								  </div>

								  <div class="card flex justify-center">
									<label for="input1" class="form-label">Select Campaign</label>
									<AutoComplete  v-model="campaign_id" forceSelection dropdown :suggestions="dropdownItems" 
										@item-select="onCampaignChange" @complete="search" field="name" />
									<div class="input-errors" v-for="error of v$.campaign_id.$errors" :key="error.$uid">
										<div class="text-danger">Client is required</div>
									</div>
								</div>


								  <div class="col-md-6">
									<label for="region" class="form-label">Region</label>
									<select v-model="form.region_id" class="form-control" id="activation-area">
										<option :value="''" :selected="true">Select Region</option>
										<option v-for="region in regions" :key="region" :value="region.id">{{ region.name }}</option>
									</select>
									<div class="input-errors" v-for="error of v$.region_id.$errors" :key="error.$uid">
										<div class="text-danger">Region is required</div>
									  </div>
								  </div>
                                  <div class="col-md-6">
									<label for="activation-area" class="form-label">Start Date</label>
									<input v-model="form.start_date" type="text" class="form-control" id="activation-area" >
									<div class="input-errors" v-for="error of v$.start_date.$errors" :key="error.$uid">
										<div class="text-danger">Start Date is required</div>
									  </div>
								  </div>
								  <div class="col-md-6">
									<label for="activation-area" class="form-label">End Date</label>
									<input v-model="form.end_date" type="text" class="form-control" id="activation-area" >
									<div class="input-errors" v-for="error of v$.end_date.$errors" :key="error.$uid">
										<div class="text-danger">End Date is required</div>
									  </div>
								  </div>

								  <div class="col-md-6">
									<label for="target_group" class="form-label">Target Group</label>
									<input v-model="form.target_group" type="text" class="form-control" id="target_group" >
									<div class="input-errors" v-for="error of v$.target_group.$errors" :key="error.$uid">
										<div class="text-danger">Target Group is required</div>
									  </div>
								  </div>

								  <div class="col-md-6">
									<label for="campaign" class="form-label">Pin Points</label>
									<input v-model="form.pain_points" type="text" class="form-control" id="pain_points" >
									<div class="input-errors" v-for="error of v$.pain_points.$errors" :key="error.$uid">
										<div class="text-danger">Pin Points is required</div>
									  </div>
								  </div>

								  
								 
								  <div class="col-12">
									  <div class="d-grid">
										<button @click="onSubmit" class="btn maz-gradient-btn" type="button"> 
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
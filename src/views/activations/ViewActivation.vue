<script setup>
import { onMounted,ref,watch } from 'vue';
import { useActivation } from '@/stores/activation';
import { useRoute } from 'vue-router';
import Layout from '../shared/Layout.vue';
import TaskTable from '@/components/TaskTable.vue';
import { useTask } from '@/stores/task';
import Image from 'primevue/image';
import { useAuth } from '@/stores/auth';


const envPath = import.meta.env.VITE_AWS_S3_BUCKET;
const taskStore = useTask();
const route = useRoute();
const authStore = useAuth();
const activationStore = useActivation();

const user = JSON.parse(authStore.user);

const tasks = ref([]);
const activationId = ref(route.query.activation);
const activationName = ref(route.query.name);
const campaignName = ref(route.query.campaign);
const activation = ref({});

const statuses = ref([
    { name: 'Finished', code: 'FINISHED' },
    { name: 'Planned', code: 'PLANNED' },
    { name: 'On Track', code: 'ONTRACK' },
    { name: 'Delayed', code: 'DELAYED' },
    { name: 'At Risk', code: 'ATRISK' }
]);



watch(() => route.params.activation, (newId) => {
    activationId.value = newId;
});

onMounted(() => {
    console.log('activationId',activationId.value)
    if(activationId.value){
        getActivationById();
    }
    
    getTasks();
    
});
const activationImages = ref([]);
const getActivationById = async () => {
    activationStore.getActivationById(activationId.value).then(function (response) {
        activation.value = response.data;
		getActivationImages(response.data.id);
    })
}


const getActivationImages = async (id) => {
    activationStore.getActivationImages(id).then(function (response) {
		console.log('activationImages',response)
        activationImages.value = response.data.content;
    })   
}

const getTasks = async () => {
  taskStore.getTasksByActivationId(activationId.value).then(response => {
    tasks.value = response.data;
  }).catch(error => {
    toaster.error("Error fetching tasks");
    console.log(error);
  }).finally(() => {
    //
  });
};

const isNotActivationManager = () => {
	return user.role != 'TTG_ACTIVATION_MANAGER';
}

</script>
<template>
  
        <Layout>
			<div class="page-wrapper">
				<div class="page-content">
					<!--end breadcrumb-->
					<div class="container">
						<div class="main-body">
							<div class="row mx-4">
								<div class="col-lg-12">
									<div class="card">
										<div class="card-body">
											<div class="row mb-3">
												<div class="col-sm-3">
													<h6 class="mb-0">Name</h6>
												</div>
												<div class="col-sm-9 text-secondary">
													<input type="text" readonly class="form-control" :value="activation.name">
												</div>
											</div>
											<div class="row mb-3">
												<div class="col-sm-3">
													<h6 class="mb-0">Campaign</h6>
												</div>
												<div class="col-sm-9 text-secondary">
													<input type="text" readonly class="form-control" :value="campaignName ? campaignName : ''">
												</div>
											</div>
											<div class="row mb-3" v-if="isNotActivationManager()">
												<div class="col-sm-3">
													<h6 class="mb-0">Budget</h6>
												</div>
												<div class="col-sm-9 text-secondary">
													<input type="text" readonly class="form-control" :value="activation.budget">
												</div>
											</div>
											<div class="row mb-3">
												<div class="col-sm-3">
													<h6 class="mb-0">Start Date</h6>
												</div>
												<div class="col-sm-9 text-secondary">
													<input type="text" readonly class="form-control" :value="activation.startDate">
												</div>
											</div>
											<div class="row mb-3">
												<div class="col-sm-3">
													<h6 class="mb-0">End Date</h6>
												</div>
												<div class="col-sm-9 text-secondary">
													<input type="text" readonly class="form-control" :value="activation.endDate">
												</div>
											</div>
											<div class="row mb-3">
												<div class="col-sm-3">
													<h6 class="mb-0">Pain Points</h6>
												</div>
												<div class="col-sm-9 text-secondary">
													<input type="text" readonly class="form-control" :value="activation.painPoints">
												</div>
											</div>
											<div class="row mb-3">
												<div class="col-sm-3">
													<h6 class="mb-0">Brief</h6>
												</div>
												<div class="col-sm-9 text-secondary">
													<input type="text" readonly class="form-control" :value="activation.brief">
												</div>
											</div>
											<div class="row mb-3">
												<div class="col-sm-3">
													<h6 class="mb-0">Target Group</h6>
												</div>
												<div class="col-sm-9 text-secondary">
													<input type="text" readonly class="form-control" :value="activation.targetGroup">
												</div>
											</div>
											<!-- <div class="row">
												<div class="col-sm-3"></div>
												<div class="col-sm-9 text-secondary">
													<input type="button" class="btn btn-primary px-4" value="Save Changes">
												</div>
											</div> -->
										</div>
									</div>
									<div class="row">
										<div class="col-sm-12">
											<div class="card">
												<div class="card-body">
													<h5 class="d-flex align-items-center mb-3">Tasks</h5>
													<div class="col-xl-12 col-lg-12 col-md-12 col-sm-12">         
														<TaskTable :tasks="tasks" :statuses="statuses"/>  
													</div>
													
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
	
							<div class="row mt-2 row-cols-xl-9 gap-4">
								<div class="">
								  <h4 class="mb-2 ml-2">Activation Images</h4>
								</div>
								<div v-for="activationImage in activationImages" :key="activationImage.id" class="col-img ">
								  <div  class="gallery">	
									  <div class="card flex justify-center">
										<Image alt="Image" preview>
											<template #previewicon>
											  <i class='bx bx-search-alt-2' ></i>
											</template>
											<template #image>
												<img :src="`${envPath}${activationImage.path}`" alt="image"
												
												class="min-height-image" />
											</template>
											<template #preview="slotProps">
												<img :src="`${envPath}${activationImage.path}`" alt="preview" :style="slotProps.style" @click="slotProps.onClick" />
											</template>
										</Image>
										</div>
								   
									<!-- <div class="checkbox">
									  <input type="checkbox" id="select">
									  <span>&#x2713;</span>
									</div> -->
								  </div>
								</div>
						  
							   
							  </div>
						</div>
					</div>
				</div>
			</div>
		</Layout>

</template>


<style scoped>
div.gallery {
	margin: 5px;
	border: 1px solid #12181A;
	float: left;
	width: 180px;
  }
  .min-height-image{
	min-height: 130px;
  }
  .gap-4 {
    gap: 0px !important; 
}
  div.gallery:hover {
	border: 1px solid #777;
  }
  
  div.gallery img {
	width: 100%;
	height: auto;
  }
  
  .col-img {
	position: relative;
	display: inline-block;
	width: 200px;
	
  }
  
  .gallery {
	position: relative;
  }
  
  .gallery img {
	width: 100%;
	height: auto;
  }
  
  .desc {
	text-align: center;
	padding: 10px;
	font-size: 18px;
	background-color: rgba(0, 0, 0, 0.5);
	color: white;
  }
  
  .checkbox {
	position: absolute;
	top: 10px;
	right: 10px;
	width: 24px;
	height: 24px;
	background-color: white;
	border: 2px solid #000;
	display: flex;
	align-items: center;
	justify-content: center;
  }
  
  .checkbox input[type="checkbox"] {
	position: absolute;
	opacity: 0;
	cursor: pointer;
	width: 100%;
	height: 100%;
	margin: 0;
  }
  
  .checkbox input[type="checkbox"]:checked+span {
	background-color: white;
	font-weight: 1000;
	color: black;
	background-color: transparent;
  }
  
  div.desc {
	padding: 13px;
	text-align: center;
  }
  
  .col-img {
	flex: 0 0 0%;
  }
  
  .mt-6 {
	margin-top: 2rem !important;
  }
  
  .asc {
	text-align: center;
	background: #12181A;
	width: 180px;
	line-height: 1;
	/* font-size: 1.2rem; */
	font-weight: 600;
  }
</style>
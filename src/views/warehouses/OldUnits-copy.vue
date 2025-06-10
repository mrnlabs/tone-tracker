
<script setup>
import Layout from '../shared/Layout.vue';
import BreadCrumb from '../../components/BreadCrumb.vue';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useWarehouse } from '@/stores/warehouse';
import Popover from 'primevue/popover';
import InputText from 'primevue/inputtext';
import { reactive } from 'vue';
import InputNumber from 'primevue/inputnumber';
import useToaster from '@/composables/useToaster';
import { useStock } from '@/stores/stock';
import FileUploadGeneric from '../upload/FileUploadGeneric.vue';

const route = useRoute();
const warehouseStore = useWarehouse();
const toaster = useToaster();
const stock = useStock();
const warehouseName = ref(route.query.name);
const warehouse = ref(null);
const op = ref();
const unitId = ref();
const loading = ref(false);
const stockList = ref([]);
const searchInput = ref('');
const merchendiseList = ref([]);
const brandings = ref([]);


watch(searchInput, () => {
	merchendiseList.value = stockList.value?.filter((stock) => stock.type === 'MERCH' && stock.description.toLowerCase().includes(searchInput.value.toLowerCase()));
	brandings.value = stockList.value?.filter((stock) => stock.type === 'BRANDING' && stock.description.toLowerCase().includes(searchInput.value.toLowerCase()));
})


onMounted(() => {
	getWarehouse();
});

const getWarehouse = () => {
	warehouseStore.viewWarehouse(route.params.id).then((response) => {
		warehouse.value = response.data;
	});
}

const onUnitChange = (event) => {
	unitId.value = null;     // reset the unit
	unitId.value = event.target.value;
	stockForm.unit = event.target.value;
	getStock();
}

const getStock = () => {
	stock.getStockByUnit(unitId.value).then((response) => {
		console.log(response.data);
		stockList.value = response.data;
		merchendiseList.value = response.data?.filter((stock) => stock.type === 'MERCH');
		brandings.value = response.data?.filter((stock) => stock.type === 'BRANDING');
		console.log(brandings.value, merchendiseList.value);
	});
}

const toggle = (event) => {
    op.value.toggle(event);
}

const stockForm = reactive({
    description: '',
    quantity: null,
    type: '',
	unit: null
});

const stockRules = { 
    description: { required },
    quantity: { required },
    type: { required },
};
const stockV$ = useVuelidate(stockRules, stockForm);

const submitStock = async () => {
	const isFormValid = await stockV$.value.$validate();
    if (!isFormValid) {return;}
	loading.value = true;
    try {
        await stock.addStock(stockForm);
        toaster.success("Region created successfully");
        stockForm.description = ''; // Reset the form input
		stockForm.quantity = '';
		stockForm.type = '';
        stockV$.value.$reset(); // Reset the validatione();
		stockV$.$errors = [];
    } catch (error) {
        toaster.error("Error creating region");
        console.log(error);
    } finally {
        loading.value = false;
    }
}

</script>

<template>
    <Layout>
		<!--start page wrapper -->
		<div class="page-wrapper">
			<div class="page-content">

				<BreadCrumb title="Warehousing" icon="bx bxs-school"/>
				<div class="row">
					<div class="col-lg-1"></div>
					<div class="col-lg-8">
						<h4 class="mb-4">{{ warehouseName }}</h4>
					</div>
					
				</div>
				

                <div class="row">
					<div class="col-lg-1"></div>
                    <div class="col-lg-10 col-md-12">
						<div class="gradient-card">
						  <div class="content">
							<strong>Region:</strong> Gauteng Central<br>
							<strong>Number of storage units:</strong> {{ warehouse?.numberOfUnits }} unit(s)<br>
							<strong>Capacity:</strong> 50%<br>
							<strong>Number of items:</strong> 1500
						  </div>
						</div>
					  </div>
                  
                 </div>


				 <div class="row mt-4">
					<div class="col-lg-1"></div>
                    <div class="col-lg-3 col-md-6">
						<select @change="onUnitChange" class="form-select form-select-sm bg-maz-light" aria-label=".form-select-sm example">
							<option :value="''" selected="selected" disabled>Filter by unit</option>
							<option v-for="(unit,index) in warehouse?.unitsList" :key="unit + index" 
							:value="unit.id">
								{{ unit.name }}
							</option>
						</select>
					  </div>
					  <div class="col-lg-4 col-md-6">
						
					  </div>
					  <div class="col-lg-3 col-md-6">
						<div class="container ">
							<div class="search-container">
							  <input v-model="searchInput" type="text" class="form-control search-input" placeholder="Search for item">
							  <i class="bx bx-search search-icon"></i>
							</div>
						  </div>
					  </div>
					  <div class="col-lg-1"></div>
                 </div>
				
				

				 <div class="row mt-4 ">
					<div class="col-lg-1"></div>
					<div class="col-12 col-lg-3">
						<div class="card radius-10">
							 <div class="card-body">
								<div class="card card-custom">
									<h5>Stock check</h5>
									<p class="text-light"><strong>Storage Capacity:</strong> 50%</p>
									<p class="text-light"><strong>Days since last check:</strong> 15 Days</p>
									<p class="text-light"><strong>Checked by:</strong> Tumelo Moloka</p>
								  </div>
							
								  <div class="card card-custom">
									<h5>Inventory accuracy</h5>
									<div class="chart-container">
									  <canvas id="inventoryAccuracyChart"></canvas>
									</div>
								  </div>
							 </div>
						</div>
					</div>


					<div class="col-12 col-lg-6 d-flex">
						<div class="card radius-10 w-100">
						  <div class="card-header">
							  <div class="d-flex align-items-center">
								  <div>
									  <h6 class="mb-0">In Stock</h6>
								  </div>
								  <div class="dropdown ms-auto">
									 <button @click="toggle" 
									 :disabled="!unitId"
									 type="button" class="btn maz-gradient-btn">Add Stock</button>
									 <Popover ref="op">
										<div class="popover">
											<div class="d-flex flex-column">
												<form @submit.prevent="submitStock" class="row">
                
													<div class="col-md-12">
														<div class="card my-card flex justify-center">
															<label for="input1" class="form-label">Description</label>
															   <InputText type="text" v-model="stockForm.description" />
															   <div class="input-errors" v-for="error of stockV$.description.$errors" :key="error.$uid">
															   <div class="text-danger">Description is required</div>
														</div>
													</div>                        
													</div>
									
									
													<div class="col-md-12">
														<div class="card my-card flex justify-center">
															<label for="input1" class="d-flex form-label">Quantity
															</label>
															   <InputNumber inputId="minmax" :min="0" v-model="stockForm.quantity" />
															   <div class="input-errors" v-for="error of stockV$.quantity.$errors" :key="error.$uid">
															   <div class="text-danger">Quantity is required</div>
															</div>
													</div>                        
													</div>
													<div class="col-md-12">
														<div class="card my-card flex justify-center">
															<label for="input1" class="d-flex form-label">Stock type</label>
															   <select v-model="stockForm.type" class="form-control">
																   <option :value="''" disabled :selected="true" >Choose stock type</option>
																   <option value="BRANDING">Branding</option>
																   <option value="MERCH">Merchandising</option>
															   </select>
															   <div class="input-errors" v-for="error of stockV$.type.$errors" :key="error.$uid">
															   <div class="text-danger">Stock type is required</div>
															</div>
													</div>                        
													</div>
													<div class="col-md-12">
														<div class="card my-card flex justify-center">
															<FileUploadGeneric/>
													</div>                        
													</div>
													<div class="modal-footer">
														<button type="submit" class="btn maz-gradient-btn w-100" :disabled="loading">
														<div v-if="loading" class="spinner-border text-white" role="status">
															<span class="visually-hidden">Loading...</span>
														</div>
														Submit
													</button>
													</div>
													
												</form>
												
											</div>
										</div>
									</Popover>
								  </div>
							  </div>
						  </div>
						  <div class="card-body row  mx-2">
							<div class="table-responsive table table-dark table-striped w-50">
								<table class="table align-middle mb-0">
								 <thead class="table-light">
								  <tr style="background:#1D2126">
									<th>Description</th>
									<th>Number</th>
									<th>Action</th>
								  </tr>
								  </thead>
								  <tbody>
									<tr v-if="brandings?.length > 0" v-for="branding in brandings" class="maz-table-row-height">
								   <td>{{branding.description}}</td>
								   <td>{{branding.quantity}}</td>
								  </tr>
								  <tr v-else ><td colspan="7" class="text-center text-danger">No results found.</td></tr>
			   
								 </tbody>
							   </table>
							 </div>
							 <div class="table-responsive table table-dark table-striped w-50">
								<table class="table align-middle mb-0">
								 <thead class="table-light">
								  <tr style="background:#1D2126">
									<th>Description</th>
									<th>Number</th>
									<th>Action</th>
								  </tr>
								  </thead>
								  <tbody>
									<tr v-if="merchendiseList?.length > 0" v-for="merch in merchendiseList" class="maz-table-row-height">
								   <td>{{merch.description}}</td>
								   <td>{{merch.quantity}}</td>
								   <td></td>
								  </tr>
			   
								  <tr v-else ><td colspan="7" class="text-center text-danger">No results found.</td></tr>
								 </tbody>
							   </table>
							 </div>
						  </div>
						</div>
					 </div>
				</div>



			</div>
		</div>
	<!--start switcher-->
	
</Layout>
</template>


<style scoped>
.width-50{
	width: 50%;
}

.gradient-card {
	border-radius: 10px;
	padding: 20px;
	color: white;
	position: relative;
	overflow: hidden;
  }
  .gradient-card::before {
	content: '';
	position: absolute;
	top: -5px;
	left: -5px;
	right: -5px;
	bottom: -5px;
	z-index: -1;
	background: linear-gradient(135deg, #8e44ad, #3498db);
	border-radius: 15px;
  }
  .gradient-card .content {
	background: #0E0C19;
	border-radius: 10px;
	padding: 12px;
	z-index: 1;
  }

  .search-container {
	position: relative;
	display: inline-block;
  }

  .search-input {
	width: 100%;
	padding-right: 40px; /* Adjust padding to fit the icon */
	padding-left: 10px; /* Optional: adjust left padding for better appearance */
	border: 0;
	border-radius: 5px;
	height: 35px;
	background-color: #1e1e1e; /* Match the background color */
	color: white;
  }

  .search-input::placeholder {
	color: #bbb;
  }

  .search-icon {
	position: absolute;
	right: 10px;
	top: 50%;
	transform: translateY(-50%);
	color: #bbb;
	cursor: pointer;
  }

  .search-input:focus + .search-icon {
	display: none;
  }

  .search-input:focus {
	outline: none;
	border-color: #3498db; /* Change border color on focus */
  }

  .card-custom {
	background-color: #1e1e1e;
	color: #ffffff;
	border-radius: 10px;
	padding: 20px;
	margin: 20px 0;
  }

  .card-custom h5,
  .card-custom p {
	margin-bottom: 10px;
  }

  input::placeholder {
	color: #bbb;
  }

  .popover {
    --bs-popover-bg: none !important;
  }

  .my-card {
    margin-top: -12px !important;
}
</style>
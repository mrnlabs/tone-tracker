
<script setup>
import Layout from '../shared/Layout.vue';
import BreadCrumb from '../../components/BreadCrumb.vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useWarehouse } from '@/stores/warehouse';
import { useAuth } from '@/stores/auth';
import InputText from 'primevue/inputtext';
import { reactive } from 'vue';
import InputNumber from 'primevue/inputnumber';
import useToaster from '@/composables/useToaster';
import { useStock } from '@/stores/stock';
import FileUploadGeneric from '../upload/FileUploadGeneric.vue';
import Dialog from 'primevue/dialog';
import Avatar from 'primevue/avatar';
import Drawer from 'primevue/drawer';
import Image from 'primevue/image';
import SplitButton from 'primevue/splitbutton';
import CustomGauge from './CustomGauge.vue';
import { useUnit } from '@/stores/unit';
import Paginator from 'primevue/paginator';
import Column from '@/components/general/Column.vue';
import InputLabel from '@/components/form-components/InputLabel.vue';
import Input from '@/components/form-components/Input.vue';
import CardBody from '@/components/general/CardBody.vue';
import Button from '@/components/buttons/Button.vue';
import Spinner from '@/components/buttons/Spinner.vue';
import ExcelImport from '@/components/file-imports/ExcelImport.vue';
import ImportExcelModal from '@/components/file-imports/ImportExcelModal.vue';
import ProgressSpinner from 'primevue/progressspinner';

const envPath = import.meta.env.VITE_AWS_S3_BUCKET;
const authStore = useAuth();
const unitStore = useUnit();
const user = JSON.parse(authStore.user);

const route = useRoute();
const warehouseStore = useWarehouse();
const toaster = useToaster();
const stock = useStock();
const warehouseName = ref();
const warehouseId = ref(null);
const warehouse = ref(null);
const op = ref();
const unitId = ref();
const loading = ref(false);
const unitsLoading = ref(false);
const searchInput = ref('');
const merchendiseList = ref([]);
const brandings = ref([]);
const visible = ref(false);
const editVisible = ref(false);
const stockMovementVisible = ref(false);
const showFilePreview = ref(true);

const unitVisible = ref(false);
watch(searchInput, () => {
	paginatedMerch.value = warehouse.value?.stocksList?.filter((stock) => stock.type === 'MERCH' && stock.description.toLowerCase().includes(searchInput.value.toLowerCase()));
	paginatedBrandings.value = warehouse.value?.stocksList?.filter((stock) => stock.type === 'BRANDING' && stock.description.toLowerCase().includes(searchInput.value.toLowerCase()));
})

const props = defineProps({
	selectedWarehouse: Object
});

warehouseName.value = props.selectedWarehouse.name;
warehouseId.value = props.selectedWarehouse.id;

onMounted(() => {
	getWarehouse();
});

// Pagination variables
const rowsPerPage = ref(10); // Number of rows per page
const totalRecords = ref(0); // Total number of records
const currentPage = ref(1); // Current page
// Calculate the paginated data based on the current page and rows per page
let paginatedBrandings = ref([]);

const merchRowsPerPage = ref(10); // Number of rows per page
const totalMerchRecords = ref(0); // Total number of records
const merchCurrentPage = ref(1); 
let paginatedMerch = ref([]);

// Event handler for page change
const onPageChange = (event) => {
  currentPage.value = event.page + 1; // PrimeVue Paginator is zero-based, so we add 1
  rowsPerPage.value = event.rows;
  updatePaginatedBrandings();
};

const onMerchPageChange = (event) => {
	merchCurrentPage.value = event.page + 1; // PrimeVue Paginator is zero-based, so we add 1
	merchRowsPerPage.value = event.rows;
  	updatePaginatedMerch();
};

const updatePaginatedMerch = () => {
  const start = (merchCurrentPage.value - 1) * merchRowsPerPage.value;
  const end = start + merchRowsPerPage.value;
  paginatedMerch.value = merchendiseList.value?.slice(start, end);
};
const updatePaginatedBrandings = () => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  paginatedBrandings.value = brandings.value?.slice(start, end);
};

const getWarehouse = () => {
	unitsLoading.value = true;
	warehouseStore.viewWarehouse(props.selectedWarehouse.id).then((response) => {
		warehouse.value = response.data;
		merchendiseList.value = response.data?.stocksList?.filter((stock) => stock.type === 'MERCH');
		brandings.value = response.data?.stocksList?.filter((stock) => stock.type === 'BRANDING');
		totalRecords.value = brandings.value.length;
		totalMerchRecords.value = merchendiseList.value.length;
		paginatedBrandings.value = brandings.value;
		paginatedMerch.value = merchendiseList.value;
		unitsLoading.value = false;
		updatePaginatedBrandings();
		updatePaginatedMerch();
	}).catch((error) => {
		unitsLoading.value = false;
		console.log("Error fetching warehouse",error);
	})
}
const unitName = ref(null);
const viewedUnit = ref(null);
const onUnitChange = (event) => {
	// unitId.value = null;     // reset the unit
	unitId.value = event.target.value;
	stockForm.unit = event.target.value;
	unitName.value = warehouse.value?.unitsList?.find((unit) => unit.id == event.target.value)[0]?.name;
	viewedUnit.value= null;
	viewedUnit.value = warehouse.value?.unitsList?.find((unit) => unit.id == event.target.value);
	unitForm.name = viewedUnit.value?.name;
	unitForm.capacity = viewedUnit.value?.capacity;
	unitForm.warehouse = viewedUnit.value?.warehouse;
	unitForm.id = viewedUnit.value?.id;
	// getWarehouse()
}



const stockForm = reactive({
    description: '',
    quantity: null,
    type: '',
	warehouse: warehouseId
});

const stockRules = { 
    description: { required },
    quantity: { required },
    type: { required },
};
const stockV$ = useVuelidate(stockRules, stockForm);
const selectedFile = ref(null);
const config = {
      useMultipartFormData: true // Add this flag to the request config
    };
const submitStock = async () => {
	const isFormValid = await stockV$.value.$validate();
    if (!isFormValid) {return;}
	loading.value = true;
    try {
		const formData = new FormData();
		formData.append('stockImage', selectedFile.value);
		formData.append('description', stockForm.description);
		formData.append('quantity', stockForm.quantity);
		formData.append('type', stockForm.type);
		formData.append('warehouse', warehouse.value?.id);
		

        await stock.addStock(formData, config);
		visible.value = false;
		getWarehouse()
        toaster.success("Stock created successfully");
        stockForm.description = ''; // Reset the form input
		stockForm.quantity = '';
		stockForm.type = '';
        stockV$.value.$reset(); // Reset the validatione();
		stockV$.$errors = [];
		selectedFile.value = null;
    } catch (error) {
        toaster.error("Error creating stock");
        console.log(error);
    } finally {
        loading.value = false;
    }
}


const onFileChange = (uploadedFile) => {
    console.log('event', uploadedFile);
    selectedFile.value = uploadedFile;
}

const onfileDropped = (dropedFile) => {
   console.log('dropedFile', dropedFile);
      selectedFile.value = null

      // Get selected files
      const files = dropedFile;
      if (!files) return
      const file = files[0];
      selectedFile.value = file;
};
const showStockImage = ref(false);
const stockImagePreview = ref(null);
const viewStockImagePreview = (model) => {
	if(!model?.stockImage) {
		showStockImage.value = false;
		return;
	}
	showStockImage.value = true;
	stockImagePreview.value = envPath + model?.stockImage ;
}

const editedStock = ref(null);
const editForm = reactive({
    description: '',
    quantityInUnit: null,
    type: '',
	warehouse: warehouseId
});
const editStockRules = { 
    description: { required },
    quantityInUnit: { required },
    type: { required },
};
const editStockV$ = useVuelidate(editStockRules, editForm);
const openEditModal = (stock) => {
	console.log(stock);
	editedStock.value = null;//resetting the value just in case
	editedStock.value = stock;
	editForm.id = stock.id;
	editForm.description = stock.description;
	editForm.quantityInUnit = stock.quantityInUnit;
	editForm.type = stock.type;
	editVisible.value = true
}

const deleteStock = (stockParam) => {
	if(!confirm("Are you sure you want to delete this stock?")){ return }
	stock.deleteStock(stockParam.id).then(response => {
		toaster.success("Stock deleted successfully");
		getWarehouse()
	}).catch(error => {
		toaster.error("Error deleting stock");
		console.log(error);
	})
}

const items = (stock) => [
    {
        label: 'Edit',
        icon: 'bx bx-edit fs-4 text-white',
        command: () => {
			openEditModal( stock)
        }
    },
	{
        label: 'Take/Use Stock',
        icon: 'bx bx-minus-circle fs-4 text-white',
        command: () => {
            openStockMovementModal(stock);
        }
    },
    {
        label: 'Delete',
        icon: 'bx bx-trash text-danger fs-4 ',
        command: () => {
            deleteStock(stock)
        }
    }
];

const editBranding = (branding) => {
    brandings.value.forEach(c => c.isEditing = false);
    branding.isEditing = true;
};


const stockMovement = ref(null);
const stockMovementForm = reactive({
    movementType: '',
	stock: stockMovement?.id,
	staff: user?.activeUserId,
	quantity: 0,
	description: '',
	stockImage: null
});
const stockMovementRules = { 
    movementType: { required },
    quantity: { required },
};
const stockMvV$ = useVuelidate(stockMovementRules, stockMovementForm);
const openStockMovementModal = (stock) => {
	console.log(stock);
	stockMovement.value = stock
	stockMovementForm.stock = stock.id;
	stockMovementForm.quantityInWarehouse = stock.quantityInWarehouse;
	stockMovementForm.description = stock.description
	stockMovementForm.stockImage = stock.stockImage
	stockMovementVisible.value = true
}

const submitStockMovement = async () => {	
	const isFormValid = await stockMvV$.value.$validate();
    if (!isFormValid) {return;}
	stock.stockMovement(stockMovementForm).then(response => {
		toaster.success("Stock updated successfully");
		getWarehouse()
		stockMovementVisible.value = false;
	}).catch(error => {
		toaster.error("Error updating stock");
		console.log(error);
	})
};
const updateStock = () => {
	const formData = new FormData();
	formData.append('file', selectedFile.value);
	formData.append('description', editForm.description);
	formData.append('quantityInUnit', editForm.quantityInUnit);
	formData.append('type', editForm.type);
	formData.append('unit', editForm.unit);
loading.value = true;
	
	stock.updateStock(editForm.id,formData, config).then(response => {
		toaster.success("Stock updated successfully");
		getWarehouse()
		editVisible.value = false;
		loading.value = false;
	}).catch(error => {
		loading.value = false;
		toaster.error("Error updating stock");
		console.log(error);
	}).finally(() => {
		loading.value = false;
	})
};
//////////////modal icon/////////////
const unitForm = reactive({
    name: '',
    capacity: null,
	id: null
});

const showTakeoutError = ref(null);
const onStockTake = () => {
	//dont allow stockMovementForm.quantity take to be less than stockMovementForm.quantityInWarehouse and greater than 0

	if(stockMovementForm.quantity > stockMovementForm.quantityInWarehouse) {
		showTakeoutError.value = "Quantity cannot be greater than quantity in warehouse";
		return;
	}
	// stock.takeStock(stockMovementForm).then(response => {
	// 	toaster.success("Stock updated successfully");
	// 	getWarehouse()
	// })
	
}
function fnExcelReport() {
	if(!warehouseId.value) return;
	loading.value = true;
  warehouseStore.exportToExcel(warehouseId.value)
  .then((response) => {
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${warehouseName.value}.xlsx`);
    document.body.appendChild(link);
    link.click();
	loading.value = false;
  }).catch(error => {
	loading.value = false;
	console.log(error)
  })
}

const showImportModal = ref(false);
const excelHeaders = ref([
	"Description",
	"Quantity",
	"Stock Type"
]);

const onExcelSubmit = (data, rowCount) => {
	if(rowCount === 0) return;
	if(!warehouseId.value) return;
	loading.value = true;
	const formData = new FormData();
	formData.append('warehouseId', warehouseId.value);
	formData.append('csvFile', data);
	warehouseStore.importExcel(formData,config)
	.then((response) => {
		toaster.success("Stock imported successfully");
		getWarehouse()
		loading.value = false;
		showImportModal.value = false;
	}).catch(error => {
		loading.value = false;
		console.log(error)
	})
}

</script>

<template>

				<BreadCrumb title="Warehousing" icon="bx bxs-school"/>
				<div class="row justify-content-between">
					<!-- <div class="col-lg-1"></div> -->
					<div class="col-lg-8">
						<h4 class="mb-4">{{ warehouseName }}</h4>
					</div>
					  <div class="col-lg-1"></div>
					  <div class="col-lg-3 d-flex justify-content-end float-end ">

						<div class="me">
							<Button @click="showImportModal = true" classes="btn maz-gradient-btn-inverted align-items-center me-2" type="button" text="Submit" 
						     :disabled="warehouseId == null || loading" >
							<template #content>
								{{ loading ? 'Loading...' : 'Import Excel' }}
							</template>									  
							<Spinner v-if="loading" class="spinner-border spinner-border-sm" />
						</Button>
						</div>

						<div>
							<Button @click="fnExcelReport" classes="btn maz-gradient-btn align-items-center" type="button" text="Submit" 
						:disabled="warehouseId == null || loading" >
							<template #content>
								{{ loading ? 'Loading...' : 'Export to Excel' }}
							</template>									  
							<Spinner v-if="loading" class="spinner-border spinner-border-sm" />
						</Button>
						</div>
					  </div>
					  
					  
					
				</div>
				

                <div class="row">
					<!-- <div class="col-lg-1"></div> -->
                    <div class="col-lg-10 col-md-12 w-100">
						<div class="gradient-card">
						  <div class="content">
							<strong>Region:</strong> {{ warehouse?.regionName}}<br>
							<!-- <strong>Number of storage units:</strong> {{ warehouse?.numberOfUnits }} unit(s)<br> -->
							<strong>Campaign:</strong> {{ warehouse?.campaignName }}<br>
							<strong>Number of items:</strong> {{ warehouse?.numberOfStocks }}
						  </div>
						</div>

						<div class="row mt-4 d-flex justify-content-between align-items-center">
					<!-- <div class="col-lg-1"></div> -->
                    <div class="d-flex justify-content-between align-items-center gap-2 col-lg-3 col-md-6 d-none">
						<select @change="onUnitChange" class="form-select form-select-sm bg-maz-light w-100" aria-label=".form-select-sm example">
							<option :value="''" selected="selected" disabled>Filter by unit</option>
							<option v-for="(unit,index) in warehouse?.unitsList" :key="unit + index" 
							:value="unit.id">
								{{ unit.name }}
							</option>
						</select>
						<div v-if="unitId" class="cursor-pointer" @click="unitVisible = true">
							<i class="bx bx-edit fs-1" v-tooltip.right="'Edit unit'"></i>
						</div>
					</div>
					<!-- <div class="col-lg-4 col-md-6">
					
					</div> -->
					<div class="col-lg-3 col-md-6">
					<div class="container p-0">
						<div class="search-container w-100">
							<input v-model="searchInput" type="text" class="form-control search-input" placeholder="Search for item">
							<i class="bx bx-search search-icon"></i>
						</div>
						</div>
					</div>
					<!-- <div class="col-lg-1"></div> -->
                 </div>
					  </div>
                  
					  
                 </div>


				
				
				

				 <div class="row mt-4 ">
					<!-- <div class="col-lg-1"></div> -->
					<div class="col-12 d-flex">
					<div class="radius-10 w-100">
						  <div class="card-header">
							  <div class="d-flex align-items-center">
								  <div>
									  <!-- <h6 class="mb-0">In Stock(Branding)</h6> -->
								  </div>
								  <div class="dropdown ms-auto mb-2">
									 <button @click="visible=true" 
									 type="button" class="btn maz-gradient-btn">Add Stock</button>
								  </div>
							  </div>
						  </div>
						  <CardBody >


							<div class="row">
								<div class="col-md-6">
									<h6 class="mb-2 mt-2">In Stock(Branding)</h6>
									<div class=" table-responsive table table-dark table-striped  p-0">
										<table class="table align-middle mb-0">
										 <thead class="table-light">
										  <tr style="background:#1D2126">
											<th>#</th>
											<th>Description</th>
											<th>Number</th>
											<th>Action</th>
										  </tr>
										  </thead>
										  <tbody>
											<tr v-if="paginatedBrandings.length > 0" v-for="(branding, index) in paginatedBrandings" :key="index" class="maz-table-row-height">
												<td>
												  <Avatar @click="viewStockImagePreview(branding)" 
														  :image="branding.stockImage ? envPath + branding.stockImage : `https://ui-avatars.com/api/?name=${ branding.description }&background=4263C5`" 
														  class="mr-2 cursor-pointer" shape="circle" />
												</td>
												<td>{{ branding.description }}</td>
												<td>{{ branding.quantityInWarehouse }}</td>
												<td>
												  <SplitButton @click="editBranding(branding)" class="text-white" label="" 
															   icon="bx bx-cog fs-4" 
															   dropdownIcon="text-white fs-4 bx bx-chevron-down" 
															   :model="items(branding)" />
												</td>
											  </tr>
										  <tr v-else >
											<td v-if="unitsLoading" colspan="9" class="text-center text-danger">
												<ProgressSpinner style="width: 30px; height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
											 </td>
											<td v-else colspan="9" class="text-center text-danger">No results found.</td>
										</tr>
					   
										 </tbody>
									   </table>
									   <Paginator v-if="totalRecords > 0"
										:first="(currentPage - 1) * rowsPerPage"
										:rows="rowsPerPage"
										:totalRecords="totalRecords"
										:rowsPerPageOptions="[10, 20, 30]"
										@page="onPageChange"
									></Paginator>
									 </div>
								</div>
								
								
								<div class="col-md-6">
									<h6 class="mb-2 mt-2">In Stock(Merchandising)</h6>
									<div class=" table-responsive table table-dark table-striped  p-0">
										<table class="table align-middle mb-0">
										 <thead class="table-light">
										  <tr style="background:#1D2126">
											<th>
												#
											</th>
											<th>Description</th>
											<th>Number</th>
											<th>Action</th>
										  </tr>
										  </thead>
										  <tbody>
											<tr v-if="paginatedMerch?.length > 0" v-for="merch in paginatedMerch" class="maz-table-row-height">
												<td>
													<Avatar  @click="viewStockImagePreview(merch)" 
													:image="merch.stockImage ? envPath + merch.stockImage : `https://ui-avatars.com/api/?name=${ merch.description }&background=4263C5`" 
													 class="mr-2 cursor-pointer"  shape="circle" />
												  
												  </td>
										   <td>{{merch.description}}</td>
										   <td>{{merch.quantityInWarehouse}}</td>
										   <td>
											<SplitButton  @click="editBranding(merch)" class="text-white" label="" 
															icon="bx bx-cog fs-4" 
															dropdownIcon="text-white fs-4 bx bx-chevron-down" 
															:model="items(merch)"/>
										   </td>
										  </tr>
					   
										  <tr v-else >
											<td v-if="unitsLoading" colspan="9" class="text-center text-danger">
												<ProgressSpinner style="width: 30px; height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
											 </td>
											<td v-else colspan="9" class="text-center text-danger">No results found.</td>
										</tr>
										 </tbody>
									   </table>
									   <Paginator v-if="totalMerchRecords > 0"
										:first="(merchCurrentPage - 1) * merchRowsPerPage"
										:rows="merchRowsPerPage"
										:totalRecords="totalMerchRecords"
										:rowsPerPageOptions="[10, 20, 30]"
										@page="onMerchPageChange"
									></Paginator>
									 </div>
								</div>

								
								 
								 

							</div>


						  </CardBody>
						</div>
					 </div>



					<Column class="col-12 d-none">
						<div class=" radius-10">
							 <div class="card-body">
								<div class="card card-custom">
									<h5>Stock check</h5>
									<p class="text-light"><strong>Storage Capacity:</strong> {{ viewedUnit?.capacity }}%</p>
									<!-- <p class="text-light"><strong>Days since last check:</strong> 15 Days</p>
									<p class="text-light"><strong>Checked by:</strong> Tumelo Moloka</p> -->
								  </div>
								  
								  <div class=" card-custom">
									<h5 class="text-center">Inventory accuracy</h5>
									<div class="chart-container">
										<!-- <CustomGauge v-show="unitId" :viewedUnit="viewedUnit" /> -->
									</div>
								  </div>
							 </div>
						</div>
					</Column>

				</div>


		<Dialog v-model:visible="showImportModal" position="top" modal header="Import Stock" style="width: 35rem">
              <ImportExcelModal 
			      :excelHeaders="excelHeaders"
				  @submit="onExcelSubmit"
				  :loading="loading"
				  :modelId="warehouseId"
			  />
        </Dialog>

		<Dialog v-model:visible="stockMovementVisible" position="top" modal header="Move Stock" style="width: 35rem">
               
			<form @submit.prevent="submitStockMovement" class="row">
				<Column classes="col-md-12 mb-3">
					<InputLabel labelText="Description" classes="form-label" htmlFor="lastName"/>
					<Input v-model="stockMovementForm.description" type="text" classes="form-control" id="lastName" :readonly="true" />
				  </Column>
				  <Column classes="col-md-12 mb-4">
					<InputLabel labelText="Qty" classes="form-label" htmlFor="lastName"/>
					<Input v-model="stockMovementForm.quantityInWarehouse" type="text" classes="form-control" id="lastName" :readonly="true" />
				  </Column>
				<div class="col-md-12">
					<div class="card my-card flex justify-center">
						<label for="input1" class="d-flex form-label">Stock type</label>
						   <select v-model="stockMovementForm.movementType" class="form-control">
							   <option :value="''" disabled :selected="true" >Choose stock type</option>
							   <option value="IN">IN</option>
							   <option value="OUT">OUT</option>
						   </select>
						   <div class="input-errors" v-for="error of stockMvV$.movementType.$errors" :key="error.$uid">
						   <div class="text-danger">Stock type is required</div>
						</div>
				</div>                        
				</div>

				
				<div class="col-md-12">
					<div class="card my-card flex justify-center">
						<label for="input1" class="d-flex form-label">Quantity
						</label>
						   <InputNumber inputId="minmax" :min="0" v-model="stockMovementForm.quantity" @input="onStockTake" />
						   <div class="input-errors" v-for="error of stockMvV$.quantity.$errors" :key="error.$uid">
						   <div class="text-danger">Quantity is required</div>
						  </div>
						   <div v-if="showTakeoutError != ''" class="text-danger">{{showTakeoutError}}</div>
				</div>                        
				</div>
				
				<div class="col-md-12" v-if="stockMovementForm.stockImage">
					<Image :src="envPath + stockMovementForm.stockImage" alt="Image" width="100%" preview class="img-fluid"/>
				</div>
				<div class="modal-footer" :class="stockMovementForm.stockImage ? 'mt-3' : ''">
					<button type="submit" class="btn maz-gradient-btn w-100" :disabled="loading">
					<div v-if="loading" class="spinner-border text-white" role="status">
						<span class="visually-hidden">Loading...</span>
					</div>
					Update
				</button>
				</div>
				
			</form>
        </Dialog>

		<Dialog v-model:visible="editVisible" position="top" modal header="Update Stock" style="width: 30rem">
               
			<form @submit.prevent="updateStock" class="row mt-3">
				<div class="col-md-12">
					<div class="card my-card flex justify-center">
						<label for="input1" class="form-label">Description</label>
						   <InputText type="text" v-model="editForm.description" />
						   <div class="input-errors" v-for="error of editStockV$.description.$errors" :key="error.$uid">
						   <div class="text-danger">Description is required</div>
					</div>
				</div>                        
				</div>


				<div class="col-md-12">
					<div class="card my-card flex justify-center">
						<label for="input1" class="d-flex form-label">Stock type</label>
						   <select v-model="editForm.type" class="form-control">
							   <option :value="''" disabled :selected="true" >Choose stock type</option>
							   <option value="BRANDING">Branding</option>
							   <option value="MERCH">Merchandising</option>
						   </select>
						   <div class="input-errors" v-for="error of editStockV$.type.$errors" :key="error.$uid">
						   <div class="text-danger">Stock type is required</div>
						</div>
				</div>                        
				</div>
				 <div class="col-md-12">
					<div class="card my-card flex justify-center">
						<FileUploadGeneric 
						:showFilePreview="showFilePreview" 
						accept="image/*" 
						fileType="image" 
						docId="unit2"
						@fileUploaded="onFileChange"
							@fileDropped="onfileDropped"
						/>
				</div>                        
				</div>
				<div class="modal-footer">
					<button type="submit" class="btn maz-gradient-btn w-100" :disabled="loading">
					<div v-if="loading" class="spinner-border text-white" role="status">
						<span class="visually-hidden">Loading...</span>
					</div>
					Update
				</button>
				</div>
				
			</form>
        </Dialog>
		<Dialog v-model:visible="visible" position="top" modal :header="`Add Stock to ${warehouseName}`" style="width: 30rem">
			
			<form @submit.prevent="submitStock" class="row mt-3">
                
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
						<FileUploadGeneric 
						:showFilePreview="showFilePreview" 
						accept="image/*" 
						fileType="image" 
						docId="unit-file"
						@fileUploaded="onFileChange"
							@fileDropped="onfileDropped"
							/>
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
        </Dialog>
	
		<div class="card flex justify-center">
			<Drawer v-model:visible="showStockImage" position="right" :header="`View Stock Image`" class="w-100 md:!w-80 lg:!w-[40rem]" style="width: 30rem!important;">
				<!-- <img :src="stockImagePreview" style="width: 26rem!important;" /> -->
				<Image :src="stockImagePreview" alt="Image" width="450" preview style="max-height: 200px !important;"/>
			</Drawer>
		</div>

</template>


<style scoped>
.width-50{
	width: 50%;
}

.img-fluid {
    max-width: 100%;
    height: 341px;
    width: 100%;
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
	width: 435px;
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
.stock-image{
	border-radius: 50%;
	height: 50px;
	width: 50px;
}

.mx-custom-1 {
	margin-right: 0.04rem !important;
	margin-left: 0.04rem !important;
}

.mx-width {
	max-width: 524px !important;
	padding-left: 50px;
	padding-right: 50px;
}

@media only screen and (max-width: 768px) {
	.mx-custom-1 {
	flex-wrap: wrap

}
}
</style>

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
import { useUnit } from '@/stores/unit';
import Paginator from 'primevue/paginator';

const envPath = import.meta.env.VITE_AWS_S3_BUCKET;
const authStore = useAuth();
const unitStore = useUnit();
const user = JSON.parse(authStore.user);

const route = useRoute();
const warehouseStore = useWarehouse();
const toaster = useToaster();
const stock = useStock();
const warehouseName = ref(route.query.name);
const warehouseId = ref(route.params.id);
const warehouse = ref(null);
const op = ref();
const unitId = ref();
const loading = ref(false);
const stockList = ref([]);
const searchInput = ref('');
const merchendiseList = ref([]);
const brandings = ref([]);
const visible = ref(false);
const editVisible = ref(false);
const stockMovementVisible = ref(false);
const showFilePreview = ref(true);

//////////////units change modal////////////////
const unitVisible = ref(false);


//////////////units change modal////////////////



watch(searchInput, () => {
	merchendiseList.value = warehouse.value?.stocksList?.filter((stock) => stock.type === 'MERCH' && stock.description.toLowerCase().includes(searchInput.value.toLowerCase()));
	brandings.value = warehouse.value?.stocksList?.filter((stock) => stock.type === 'BRANDING' && stock.description.toLowerCase().includes(searchInput.value.toLowerCase()));
})


onMounted(() => {
	getWarehouse();
});

// Pagination variables
const rowsPerPage = ref(5); // Number of rows per page
const totalRecords = ref(0); // Total number of records
const currentPage = ref(1); // Current page
// Calculate the paginated data based on the current page and rows per page
let paginatedBrandings = ref([]);

// Event handler for page change
const onPageChange = (event) => {
  currentPage.value = event.page + 1; // PrimeVue Paginator is zero-based, so we add 1
  rowsPerPage.value = event.rows;
  updatePaginatedBrandings();
};

const updatePaginatedBrandings = () => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  paginatedBrandings.value = brandings.value?.slice(start, end);
};

const getWarehouse = () => {
	warehouseStore.viewWarehouse(route.params.id).then((response) => {
		warehouse.value = response.data;
		merchendiseList.value = response.data?.stocksList?.filter((stock) => stock.type === 'MERCH');
		brandings.value = response.data?.stocksList?.filter((stock) => stock.type === 'BRANDING');
		totalRecords.value = brandings.value.length;
		paginatedBrandings.value = brandings.value;
		updatePaginatedBrandings();
	});
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




const toggle = (event) => {
    op.value.toggle(event);
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
    // {
    //     label: 'Delete',
    //     icon: 'bx bx-trash text-danger fs-4 ',
    //     command: () => {
    //         deleteRecord(region)
    //     }
    // }
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
});
const stockMovementRules = { 
    movementType: { required },
    quantity: { required },
};
const stockMvV$ = useVuelidate(stockMovementRules, stockMovementForm);
const openStockMovementModal = (stock) => {
	stockMovement.value = stock
	stockMovementForm.stock = stock.id;
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



</script>

<template>
    <Layout>
		<div class="table-responsive table table-dark table-striped w-100 p-0">
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
				<tr v-if="merchendiseList?.length > 0" v-for="merch in merchendiseList" class="maz-table-row-height">
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

			  <tr v-else ><td colspan="7" class="text-center text-danger">No results found.</td></tr>
			 </tbody>
		   </table>
		 </div>
	
	
		<div class="card flex justify-center">
			<Drawer v-model:visible="showStockImage" position="right" :header="`View Stock Image`" class="w-100 md:!w-80 lg:!w-[40rem]" style="width: 30rem!important;">
				<!-- <img :src="stockImagePreview" style="width: 26rem!important;" /> -->
				<Image :src="stockImagePreview" alt="Image" width="450" preview />
			</Drawer>
		</div>
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
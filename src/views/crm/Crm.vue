<script setup>
import { onMounted, ref, reactive, watch } from 'vue';
import Layout from '@/views/shared/Layout.vue';
import BreadCrumb from '@/components/BreadCrumb.vue';
import useToaster from '@/composables/useToaster';
import { useCrmStore } from '@/stores/crm';
import CrmModal from './CrmModal.vue';
import CRMChart from './CRMChart.vue';
import { useRoute } from 'vue-router';

import { useRegion } from '@/stores/useRegion';
import Dialog from 'primevue/dialog';
import Checkbox from 'primevue/checkbox';
import Select from 'primevue/select';
import axios from 'axios';
import router from '@/router';
import { useAuth } from '@/stores/auth';
import { useActivation } from '@/stores/activation';
import Button from '@/components/buttons/Button.vue';
import ImportExcelModal from '@/components/file-imports/ImportExcelModal.vue';
import Spinner from '@/components/buttons/Spinner.vue';
import isTTGAdmin from '@/utils/isTTGAdmin';

const route = useRoute();
const auth = useAuth();
const activationStore = useActivation();


const user = JSON.parse(auth.user);


let showModal = ref(false);
const queryActivation = ref(route.query.activation);
let showLoading = ref(false);
let modalData = reactive({});
let users = ref([]);
let regions = ref([]);
const crmStore = useCrmStore();
const regionStore = useRegion();
const toaster = useToaster();
const allActivations = ref([]);
const tempActivations = ref([]);//stores unfltered activations. Must have been readonly in ts.
const uniqueActivations = ref([]);//for dropdown filter

  watch(
  () => route.query.activation,
  (newActivation) => {
    console.log('New activation from route:', newActivation);
    queryActivation.value = newActivation;
    if (route.query.activation) {
      queryActivation.value = route.query.activation;
      users.value.filter(user => user.activation === queryActivation.value)
    }
  },
  { immediate: true }
);


const actObj = reactive({
  id: '',
  name: '',
});
onMounted(() => {
  
  if(user?.role === 'CLIENT'){
    getClientActivations(user?.role,user?.id);
    console.log(user)
  }else{
    getAllActivations();
  }
  getAllUsers();
  getAllRegions();
  
});

let newUser = reactive({
  name: '',
  surname: '',
  email: '',
  phone: '',
  optIn: false,
  activation : ''
});

const getClientActivations = () => {
	activationStore.getAllActivations(user?.role, user?.activeUserId).then(function (response) {
    console.log('getClientActivations',response)
		allActivations.value = response.data?.map((activation) => ({
        id: activation.id,
        name: activation.name,
      }));
      tempActivations.value = [...allActivations.value];
      showLoading.value = false;
	}).catch(function (error) {
		// toaster.error("Error fetching campaign details");
		console.log(error);
	})
}

const getAllActivations = async () => {
  try {
    showLoading.value = true;
    const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/activations/admins`);
    allActivations.value = response.data?.map((activation) => ({
        id: activation.id,
        name: activation.name,
      }));
      tempActivations.value = [...allActivations.value];
      showLoading.value = false;
  } catch (error) {
    showLoading.value = false;
    console.error('Error fetching all activations:', error);
  }
};
const getAllUsers = async () => {
  showLoading.value = true;
  try {
    const response = await crmStore.getCrm();
    users.value = response.data.content;
    filteredUsers.value = queryActivation.value ? response.data.content.filter(user => user.activation == queryActivation.value) : [];
    uniqueActivations.value = [
  ...new Map(
    users.value.map((user) => [user.activationName, { id: user.activation, activationName: user.activationName }])
      ).values(),
    ];

  } catch (error) {
    toaster.error("Error fetching users");
    console.error(error);
  } finally {
    showLoading.value = false;
  }
};


const getAllRegions = async () => {
  showLoading.value = true;
  try {
    const response = await regionStore.getRegions();
    regions.value = response.data.content;
  } catch (error) {
    toaster.error("Error fetching regions");
    console.error(error);
  } finally {
    showLoading.value = false;
  }
};

const toggleModal = () => {
  showModal.value = true;
  modalData.value = {};
};

const hideModal = () => {
  showModal.value = false;
  getAllUsers();
};


const toggleDropdown = () => {
    showDropdown.value.classList.toggle('show');
};


const clearFilter = () => {
  //if there is a query param, remove it
  if(queryActivation.value){
   // router.push({ name: "crm", query: {} });
  }
  selectedActivation.value = '';
  allActivations.value = tempActivations.value;
}

const onValueChange = (newValue) => {
  if (newValue === null) {
   clearFilter();
  }
};


function fnExcelReport() {
  const payload = queryActivation.value ? queryActivation.value : selectedActivation.value;
  crmStore.exportToPDF('excel',payload)
  .then((response) => {
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'crm.xlsx');
    document.body.appendChild(link);
    link.click();
  })
}


const selectedActivation = ref();
const filteredUsers = ref([]);

const onActivationChange = (activation, isQueryParam = false) => {
  // if(!isQueryParam){
  //   router.push({ name: "crm", query: {} });
  // }
  router.push({ name: "crm", query: { activation: activation.id } });

  filteredUsers.value = [];
  filteredUsers.value = users.value.filter((user) => user.activation === activation?.id);
  
}

const assignActivationId = (actObjParam) => {
   actObj.id = actObjParam.id,
   actObj.name = actObjParam.name
  allActivations.value = [actObj]
  selectedActivation.value = actObj;
  console.log(actObj.id);
  router.push({ name: "crm", query: { activation: actObj.id } });
  // onActivationChange(actObj.id, true);
}

const exportToPDF = () => {
  crmStore.exportToPDF('pdf',filteredUsers.value)
  .then((response) => {
    console.log(response.data);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'crm.pdf');
    document.body.appendChild(link);
    link.click();
  })
}

const showImportModal = ref(false);
const excelHeaders = ref([
	"Name",
	"Surname",
	"Phone",
  "Email",
  "Address",
  "Ambassador Code",
  "Opt In"
]);

const config = {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
}

const onExcelSubmit = (data, rowCount) => {
	if(rowCount === 0) return;
	if(!queryActivation.value) return;
	showLoading.value = true;
	const formData = new FormData();
  formData.append('activationId', queryActivation.value);
	formData.append('csvFile', data);
	crmStore.importExcel(formData, config)
	.then((response) => {
		toaster.success("Leads imported successfully");
		getAllUsers();
		showLoading.value = false;
		showImportModal.value = false;
	}).catch(error => {
		showLoading.value = false;
		console.log(error)
	})
}

</script>

<template>
    <Layout>
      <div class="page-wrapper">
        <div class="page-content">
          <BreadCrumb title="CRM" icon="bx bxs-calculator" />
            <!-- Code here -->
            <div class="">
                <div class="table-container-colour pl-5">
                  <div class="mb-2 row">
                    <div class="col-md-8">
                      <Select  @change="onActivationChange(selectedActivation,'isQueryParam')" @clear="clearFilter" 
                     @update:modelValue="onValueChange"
                    showClear :loading="showLoading" v-model="selectedActivation" :options="allActivations" filter optionLabel="name" 
                    placeholder="Select activation" class="w-90">
                      <template #value="slotProps">
                          <div v-if="slotProps.value" class="flex items-center">
                              <div>{{ slotProps.value.name }}</div>
                          </div>
                          <span v-else>
                              {{ slotProps.placeholder }}
                          </span>
                      </template>
                      <template #option="slotProps">
                          <div class="flex items-center">
                              <div>{{ slotProps.option.name }}</div>
                          </div>
                      </template>
                  </Select>
                    </div>
                    <div class="col-md-4 d-flex justify-content-end">
                     <div class="me-2">
                      <Button v-if="isTTGAdmin(user)" @click="showImportModal = true" classes="btn btn-primary maz-gradient-btn" type="button" :disabled="!queryActivation || showLoading" >
                        <template #content>
                          Import Lead
                        </template>									  
                        <Spinner v-if="showLoading" :showLoading="showLoading" class="spinner-border spinner-border-sm" />
                      </Button>
                     </div>

                       <div>
                        <Button @click="toggleModal" classes="btn btn-primary maz-gradient-btn" type="button" >
                          <template #content>
                            Input Lead
                          </template>									  
                        </Button> 
                       </div>
                   
                    </div>
                  </div>
                    <div class="d-flex justify-content-between d-none">
                        <h5>Database</h5>
                        <div class="filter-dropdown">
                            <h5 style="display: inline;">Filter</h5>
                            <img src="https://img.icons8.com/ios-filled/20/ffffff/filter.png" alt="Filter Icon"
                                class="filter-icon" @click="toggleDropdown" />
                            <div ref="showDropdown" class="filter-dropdown-content">
                                <a class="cursor-pointer" v-for="activation in uniqueActivations" :key="activation.id" 
                                 @click="filterByActivation(activation?.id)">{{ activation.activationName }}</a>
                                <hr/>
                                <a class="cursor-pointer" @click="clearFilter">Clear Filter</a>
                            </div>
                        </div>

                    </div>
                    <table class="table table-striped table-bordered " id="my-invoice">
                      <thead>
                        <tr class="table-dark-color">
                          <th>Contact Name</th>
                          <th>Contact Surname</th>
                          <th>Email</th>
                          <th>Ambassador Code</th>
                          <th>Cell Number</th>
                          <th>Opt-in</th>
                          <th>Address</th>
                          <th>Region</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="filteredUsers?.length > 0" v-for="user in filteredUsers" :key="user.id">
                          <td>{{ user.name }}</td>
                          <td>{{ user.surname }}</td>
                          <td>{{ user.email }}</td>
                          <td>{{ user.ambassadorCode }}</td>
                          <td>{{ user.phone }}</td>
                          
                          <td>
                            <Checkbox v-model="user.optIn" :binary="true" />
                          </td>
                          <td>{{ user.address }}</td>
                          <td>{{ user.regionName }}</td>
                        </tr>
                        <tr v-else>
                          <td colspan="8" class="text-center text-danger">{{ showLoading ? 'Loading...' : 'No users found.'}}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div class="text-end">
                        <button :disabled="filteredUsers?.length <= 0" class="btn btn-secondary btn-export rounded-0 mb-0 mx-2" @click="fnExcelReport" type="button">Export</button>
                        <button :disabled="filteredUsers?.length <= 0" class="btn btn-primary btn-download rounded-0 mb-0" @click="exportToPDF" type="button">
                          Download PDF
                        </button>
                        <!-- <HTMLTableToPDF :headers="tableHeaders" :data="filteredUsers"/> -->
                    </div>
                    <iframe id="dummyFrame" style="display:none"></iframe>
                </div>
            </div>
            <CRMChart/>
        </div>
    </div>
    </Layout>

    <Dialog v-model:visible="showImportModal" position="top" modal header="Import Lead" style="width: 35rem">
      <ImportExcelModal 
           :excelHeaders="excelHeaders"
            @submit="onExcelSubmit"
            :loading="showLoading"
            :modelId="queryActivation"
          />
    </Dialog>
  
    <!-- Modal component -->
    <Dialog v-model:visible="showModal" position="top" modal header="Input Lead" :style="{ width: '35rem' }" >
    <CrmModal
      :showModal="showModal" 
      :modalData="modalData" 
      :regions="regions" 
      @closeModal="hideModal" 
      @activationChange="assignActivationId"
    />
  </Dialog>
  </template>
  
  <style scoped>

  .p-select{
    width: 30% !important;
  }
.mt-4 {
    margin-top: 1rem;
}
.no-border-input {
    border: none;
	color: #000;
    outline: none;
	background: #fff
}

.card {
    padding-top: 10px !important;
    padding: 0px
}
.p-button {
    width: 25rem !important;
}

.text-danger {
    color: red;
}
.filter-dropdown {
  position: relative;
  display: inline-block;
}

.filter-dropdown-content {
  display: none;
  position: absolute;
  background-color: #1e90ff;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  right: 0rem;
}

.filter-dropdown-content a {
  color: white;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

.filter-dropdown-content a:hover {
  background-color: #0056b3;
}

.filter-icon {
  width: 20px;
  margin-left: 10px;
  cursor: pointer;
}

.show {
  display: block;
}
</style>
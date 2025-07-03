<script setup>
import { useRoute } from "vue-router";
import { onMounted, ref, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Layout from '@/views/shared/Layout.vue';
import BreadCrumb from '@/components/BreadCrumb.vue';
import Dialog from 'primevue/dialog';
import useToaster from '@/composables/useToaster';
import { useRegion } from '@/stores/useRegion';
import { useUserStore } from '@/stores/userStore';
import { useWarehouse } from '@/stores/warehouse';
import { useStaff } from '@/stores/staff';
import SplitButton from 'primevue/splitbutton';
import InputText from 'primevue/inputtext';
import InputNumber from "primevue/inputnumber";
import { useUnit } from "@/stores/unit";
import Drawer from "primevue/drawer";
import { useCampaignStore } from "@/stores/useCampaign";
import ProgressSpinner from "primevue/progressspinner";
import Units from "./Units.vue";




const route = useRoute();
const unitStore = useUnit();

const toaster = useToaster();
const regionStore = useRegion();
const warehouseStore = useWarehouse();
const campaignStore = useCampaignStore();
const userStore = useUserStore();
const staff = useStaff();

const regionQueryName = ref(route.query.name);
const regionId = ref(route.params.id);
const warehouses = ref([...warehouseStore.allWarehouses]);
const campaigns = ref([...campaignStore.allCampaigns]);
let staffMembers = ref([]);
const visible = ref(false);
const position = ref('top');
const regionalManagers = ref([]);
const loading = ref(false);
const warehouseLoading = ref(false);
let searchInput = ref('');
const form = reactive({ name: '' });
const nameInput = ref(null); // Reference for the input field

onMounted(() => {
  getWarehouses();
  getRegionalManagers();
  getCampaigns();
  getStaff();
});

const rules = {
  name: { required }
};
const v$ = useVuelidate(rules, form);

const getStaff = async () => {
  try {
    const response = await staff.getStaff();
    staffMembers.value = response.data.content;
  } catch (error) {
    toaster.error("Error fetching staff members");
    console.log(error);
  }
};

const getRegionalManagers = async () => {
  try {
    const response = await userStore.getUserByRole('TTG_REGIONAL_MANAGER');
    let users = response.data.content.filter(user => user.role === 'TTG_REGIONAL_MANAGER');
    regionalManagers.value = users.map(user => ({
      name: user.firstName + ' ' + user.lastName,
      id: user.id
    }));
  } catch (error) {
    toaster.error("Error fetching regional managers");
    console.log(error);
  }
};



const getWarehouses = async () => {
  try {
    warehouseLoading.value = true;
    const response = await warehouseStore.getWarehousesByCampaignId(regionId.value);
    warehouseStore.setAllWarehouses(response.data);
    warehouses.value = [...warehouseStore.allWarehouses];
    warehouses.value = response.data;
    warehouseLoading.value = false;
  } catch (error) {
    warehouseLoading.value = false;
    toaster.error("Error fetching warehouses");
    console.log(error);
  }
};

const getCampaigns = async () => {
  try {
    const response = await campaignStore.getCampaigns();
    campaignStore.setCampaigns(response.data);
    campaigns.value = [...campaignStore.allCampaigns];
    campaigns.value = response.data;
    console.log(campaigns.value);
  } catch (error) {
    toaster.error("Error fetching campaigns");
    console.log(error);
  }
};
const deleteWarehouse = async (warehouse) => {
  try {
    await warehouseStore.deleteWarehouse(warehouse.id);
    toaster.success("Warehouse deleted successfully");
    await getWarehouses();
  } catch (error) {
    toaster.error("Error deleting warehouse");
    console.log(error);
  }
};



const deleteRecord = (warehouse) => {
  if(!window.confirm("Are you sure you want to delete this warehouse?")){ return}
  deleteWarehouse(warehouse);
};

const vFocus = {
  mounted: (el) => el.focus()
};

let regionName = ref('');
const warehouseForm = reactive({
  name: '',
  zipCode: null,
  streetAddress: null,
  region: null,
  campaign: ''
});
const warehouseRules = {
  name: { required },
  streetAddress: { required },
  zipCode: { required },
  campaign: { required },
};
const warehouseV$ = useVuelidate(warehouseRules, warehouseForm);
const clickedWarehouse = ref(null);
const openModal = (pos, warehouese, isEdit=false) => {
  console.log(warehouese,isEdit)
  if (isEdit) {
    isEdit = true;
    clickedWarehouse.value = warehouese;
    warehouseForm.name = warehouese.name;
    warehouseForm.zipCode = warehouese.zipCode;
    warehouseForm.streetAddress = warehouese.streetAddress;
    warehouseForm.region = warehouese.region;
    warehouseForm.campaign = warehouese.campaign;
    warehouseVisible.value = true;
    return;
  }
  if (warehouese) {
    regionName.value = warehouese.name;
  }
  position.value = pos;
  visible.value = true;
};

const onWarehouseSubmit = async () => {
  try {
    const isFormValid = await warehouseV$.value.$validate();
    if (!isFormValid) {
      loading.value = false;
      return;
    }
    loading.value = true;
    if(!clickedWarehouse.value) {
      warehouseForm.region = regionId.value
      await warehouseStore.submit(warehouseForm);
      toaster.success("Warehouse created successfully");
      warehouseForm.name = '';
      warehouseForm.streetAddress = null;
      warehouseForm.zipCode = null;
      warehouseForm.campaign = null;
      warehouseV$.value.$errors = [];
      warehouseV$.value.$reset();
      warehouseVisible.value = false;
      loading.value = false;
      await getWarehouses();
      return;
    }
    await warehouseStore.update(clickedWarehouse.value.id,warehouseForm);
    toaster.success("Warehouse updated successfully");
    clickedWarehouse.value = null;
    warehouseForm.name = '';
    warehouseForm.streetAddress = null;
    warehouseForm.zipCode = null;
    warehouseForm.campaign = null;
    warehouseV$.value.$errors = [];
    warehouseV$.value.$reset();
    warehouseVisible.value = false;
    loading.value = false;
    await getWarehouses();
  } catch (error) {
    loading.value = false;
    toaster.error("Error adding warehouse");
    console.log(error);
  }
};

const unitVisible = ref(false);
const warehouseVisible = ref(false);

const unitForm = reactive({
  name: '',
  capacity: null,
  warehouse: null

});

const unitRules = {
  name: { required },
  capacity: { required },
  warehouse: { required },
};
const unitV$ = useVuelidate(unitRules, unitForm);
const warehouseQueryName = ref(null);
const openWarehouseModal = (warehouse) => {
  if (warehouse) {
    warehouseQueryName.value = warehouse.name;
    unitForm.warehouse = warehouse.id;
  }
  unitVisible.value = true;
};


const onInput = () => {
  if (searchInput.value) {
    const searchTerm = searchInput.value.toLowerCase();
    warehouses.value = warehouses.value.filter((warehouse) => {

      const name = warehouse.name?.toLowerCase() || '';
      const address = warehouse.streetAddress?.toLowerCase() || '';
      const zipCode = warehouse.zipCode?.toLowerCase() || '';


      return (
          name.includes(searchTerm) ||
          address.includes(searchTerm) ||
          zipCode.includes(searchTerm)
      );
    });
  } else {
    warehouses.value = [...warehouseStore.allWarehouses];
  }
};



const onSubmitUnit = async () => {
  try {
    const isFormValid = await unitV$.value.$validate();
    if (!isFormValid) {
      loading.value = false;
      return;
    }

    await unitStore.addUnit(unitForm);
    toaster.success("Unit added successfully");
    unitForm.name = '';
    unitForm.capacity = null;
    unitForm.warehouse = null;
    unitV$.value.$errors = [];
    unitV$.value.$reset();
    unitVisible.value = false;
    await getWarehouses();
  } catch (error) {
    toaster.error("Error adding unit");
    console.log(error);
  }
};

const items = (warehouse) => [
  {
    label: 'Edit',
    icon: 'bx bx-edit fs-4 text-white',
    command: () => {
      openModal('top', warehouse, true)
    }
  },
  {
    label: 'Add Unit',
    icon: 'bx bx-building-house fs-4 text-white',
    command: () => {
      openWarehouseModal(warehouse)
    }
  },
  {
    label: 'Delete',
    icon: 'bx bx-trash text-danger fs-4 ',
    command: () => {
      deleteRecord(warehouse)
    }
  }
];

const selectedWarehouse = ref(null);
const viewStockModal = ref(false);

const viewWarehouse = (warehouse) => {
  viewStockModal.value = true;
  selectedWarehouse.value = warehouse;
}

</script>

<template>
  <Layout>
    <div class="page-wrapper">
      <div class="page-content">
        <BreadCrumb :title="regionQueryName + ' Region'" icon="bx bx-building-house" />

        <div class="card">
          <div class="mb-4 d-lg-flex align-items-center mb-4">

            <div class="position-relative me-4">
              <input
                  v-model="searchInput"
                  @input="onInput"
                  type="text"
                  class="form-control ps-5"
                  placeholder="Search"
              />
              <span class="position-absolute top-50 product-show translate-middle-y">
                            <i class="bx bx-search"></i>
              </span>

            </div>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-lg-12 col-xl-8 d-flex">
                <div class=" radius-10 w-100">
                  <div class="card-body">
                    <div class="table-responsive">
                      <table class="table mb-0">
                        <thead class="table-light">
                        <tr>
                          <th>Warehouse</th>
                          <th>Stock</th>
                          <th>Address</th>
                          <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-if="warehouses.length > 0" v-for="(region, index) in warehouses" :key="region.id">
                          <td>{{ region.name }}</td>
                          <td>
                            <button @click="viewWarehouse(region)"
                                    class="btn maz-gradient-btn position-relative me-lg-5">
                              <i class='bx bx-building-house align-middle'></i>
                              <span class="d-none d-xxl-inline">View</span> <!-- This will only show on screens larger than 1440px -->

                            </button >
                          </td>


                          <td>{{ region.streetAddress + ', ' + region.zipCode }}</td>
                          <td>
                            <SplitButton class="text-white"
                                         icon="bx bx-cog fs-4"
                                         dropdownIcon="text-white fs-4 bx bx-chevron-down"
                                         :model="items(region)">
                              <template v-slot:label>
                                <span class="d-inline d-xxl-none">Action</span> <!-- Show "Action" text only on screens from 0px to 1440px -->
                              </template>
                            </SplitButton>
                          </td>

                        </tr>
                        <tr v-else>
                          <td v-if="warehouseLoading" colspan="9" class="text-center text-danger">
                            <ProgressSpinner style="width: 30px; height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                          </td>
                          <td v-else colspan="9" class="text-center text-danger">No warehouses found.</td>
                        </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-lg-12 col-xl-4 d-flex">
                <div class=" w-100 radius-10">
                  <div class="card-body">
                    <div class="table-responsive">
                      <form @submit.prevent="onWarehouseSubmit" class="row">

                        <div class="col-md-12">
                          <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Brand Name</label>
                            <InputText type="text" v-model="warehouseForm.name" />
                            <div class="input-errors" v-for="error of warehouseV$.name.$errors" :key="error.$uid">
                              <div class="text-danger">Warehouse name is required</div>
                            </div>
                          </div>
                        </div>
                        <div class="col-md-12">
                          <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Street address</label>
                            <InputText type="text" v-model="warehouseForm.streetAddress" />
                            <div class="input-errors" v-for="error of warehouseV$.streetAddress.$errors" :key="error.$uid">
                              <div class="text-danger">Street address is required</div>
                            </div>
                          </div>
                        </div>

                        <div class="col-md-12">
                          <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Campaign</label>
                            <!-- select all campaign -->
                            <select class="form-select" v-model="warehouseForm.campaign">
                              <option :value="''" selected="selected">Select Campaign</option>
                              <option v-for="campaign in campaigns" :key="campaign" :value="campaign.id">{{ campaign.name }}</option>
                            </select>
                            <div class="input-errors" v-for="error of warehouseV$.campaign.$errors" :key="error.$uid">
                              <div class="text-danger">Campaign is required</div>
                            </div>
                          </div>
                        </div>


                        <div class="col-md-12">
                          <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Zip Code</label>
                            <InputText type="text" v-model="warehouseForm.zipCode" />
                            <div class="input-errors" v-for="error of warehouseV$.zipCode.$errors" :key="error.$uid">
                              <div class="text-danger">Zip Code is required</div>
                            </div>
                          </div>
                        </div>
                        <div class="modal-footer">
                          <button type="submit" class="btn maz-gradient-btn w-100 d-flex justify-content-center align-items-center" :disabled="loading">
                            <div v-if="loading && !isEdit" class="spinner-border text-white " role="status"> <span class="visually-hidden">Loading...</span>
                            </div>
                            {{ loading ?  '' : 'Add New Warehouse' }}
                          </button>
                        </div>

                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="card flex justify-center">
      <Drawer
          v-model:visible="showUnitDrawer"
          position="right"
          header="docName"
          class="!w-full md:!w-80 lg:!w-[40rem]"
          style="width: 30rem !important"
      >
        <div class="col-12 col-lg-12 d-flex">
          <div class="card radius-10 w-100">
            <div class="card-body">
              <div class="chart-container-2">
                <table class="table table-dark table-bordered">
                  <thead>
                  <tr class="table-dark-color">
                    <th>Brand Name</th>
                    <th>Capacity</th>
                    <th>Warehouse</th>
                    <th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-if="allUnits.length > 0" v-for="unit in allUnits" :key="unit.id" class="table-dark-black">
                    <td>{{unit.name}}</td>
                    <td>{{unit.capacity}}</td>
                    <td>WarehouseName</td>
                    <td>
                      <div class="d-flex order-actions">
                        <a @click="openModal('top','Unit',unit)" href="javascript:;" >
                          <i class='bx bxs-edit'></i>
                        </a>
                        <a @click="deleteRecord($event,unit)" href="javascript:;" class="ms-3">
                          <i class='bx bxs-trash text-danger'></i>
                        </a>
                        <ConfirmPopup></ConfirmPopup>
                      </div>

                    </td>
                  </tr>
                  <tr cols="7" v-else>
                    <td colspan="7" class="text-center text-danger">
                      <p class="text-danger">No units found</p>
                    </td>

                  </tr>

                  </tbody>

                </table>
              </div>
            </div>
          </div>
        </div>

      </Drawer>
    </div>

    <Dialog v-model:visible="viewStockModal" modal header="View Stock" :class="{ 'p-dialog-maximized': true }">
      <Units :selectedWarehouse="selectedWarehouse"/>
    </Dialog>

    <Dialog v-model:visible="warehouseVisible" position="top" modal header="Edit Warehouse" style="width: 26rem">

      <form @submit.prevent="onWarehouseSubmit" class="row">

        <div class="col-md-12">
          <div class="card my-card flex justify-center">
            <label for="input1" class="form-label">Brand Name</label>
            <InputText type="text" v-model="warehouseForm.name" />
            <div class="input-errors" v-for="error of warehouseV$.name.$errors" :key="error.$uid">
              <div class="text-danger">Warehouse name is required</div>
            </div>
          </div>
        </div>
        <div class="col-md-12">
          <div class="card my-card flex justify-center">
            <label for="input1" class="form-label">Street address</label>
            <InputText type="text" v-model="warehouseForm.streetAddress" />
            <div class="input-errors" v-for="error of warehouseV$.streetAddress.$errors" :key="error.$uid">
              <div class="text-danger">Street address is required</div>
            </div>
          </div>
        </div>



        <div class="col-md-12">
          <div class="card my-card flex justify-center">
            <label for="input1" class="form-label">Zip Code</label>
            <InputText type="text" v-model="warehouseForm.zipCode" />
            <div class="input-errors" v-for="error of warehouseV$.zipCode.$errors" :key="error.$uid">
              <div class="text-danger">Zip Code is required</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn maz-gradient-btn w-100 d-flex justify-content-center align-items-center" :disabled="loading">
            <div v-if="loading" class="spinner-border text-white " role="status"> <span class="visually-hidden">Loading...</span>
            </div>
            {{ loading ?  '' : 'Submit' }}
          </button>
        </div>

      </form>
    </Dialog>

    <Dialog v-model:visible="unitVisible" position="top" modal :header="`Add Unit to ${warehouseQueryName}`" style="width: 26rem">

      <form @submit.prevent="onSubmitUnit" class="row">

        <div class="col-md-12">
          <div class="card my-card flex justify-center">
            <label for="input1" class="form-label">Unit Name</label>
            <InputText type="text" v-model="unitForm.name" />
            <div class="input-errors" v-for="error of unitV$.name.$errors" :key="error.$uid">
              <div class="text-danger">Warehouse name is required</div>
            </div>
          </div>
        </div>


        <div class="col-md-12">
          <div class="card my-card flex justify-center">
            <label for="input1" class="d-flex form-label">Capacity <i
                v-tooltip.top="'Estimate the percentage capacity of the unit. e.g 100. For 100% capacity, enter 100'" class='bx bx-info-circle cursor-pointer ms-1 bx bx-info-circle  fs-6' ></i></label>
            <InputNumber inputId="minmax" :min="0" :max="100" v-model="unitForm.capacity" />
            <div class="input-errors" v-for="error of unitV$.capacity.$errors" :key="error.$uid">
              <div class="text-danger">Capacity estimate is required</div>
            </div>
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
  </Layout>
</template>

<style scoped>
.table td {
  vertical-align: middle;
}

</style>

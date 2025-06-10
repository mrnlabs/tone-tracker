<script setup>
import moment from 'moment';
import Layout from '@/views/shared/Layout.vue';
import BreadCrumb from '@/components/BreadCrumb.vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import ConfirmPopup from 'primevue/confirmpopup';
import SplitButton from 'primevue/splitbutton';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import { useVuelidate } from '@vuelidate/core';
import Badge from 'primevue/badge';
import { required } from '@vuelidate/validators';
import { useWarehouse } from '@/stores/warehouse';
import { useUnit } from '@/stores/unit';
import { onMounted, ref, reactive, computed } from 'vue';
import useToaster from '@/composables/useToaster';
import { useConfirm } from "primevue/useconfirm";
import { useRegion, } from '@/stores/useRegion';



const visible = ref(false);
const warehouses = ref([]);
const allUnits = ref([]);
const region = ref(null);
const position = ref('top');
const popupType = ref('Warehouse');
const regions = ref([]);
const loading = ref(false);

const warehouseStore = useWarehouse();
const unitStore = useUnit();
const toaster = useToaster();
const regionStore = useRegion();
const confirm = useConfirm();

onMounted(() => {
    getRegions();
    getWarehouses();
    getUnits();
})

const form = reactive({
    name: '',
    capacity: null,
    numberOfItems: null,
    numberOfUnits: null,
    streetAddress: null,
    zipCode: null,
    region: null

});

const unitForm = reactive({
    name: '',
    capacity: null,
    warehouse: null,

});

    const rules = { 
    name: { required },
    capacity: { required },
    numberOfItems: { required },
    numberOfUnits: { required },
    streetAddress: { required },
    zipCode: { required },
    region: { required },
};
const v$ = useVuelidate(rules, form);

const onSubmit = async () => {
   

    const isFormValid = await v$.value.$validate();
    if (!isFormValid) {
        loading.value = false; 
        return;
    }
    loading.value = true; 
    try {
        if (isEdit.value) {
            await warehouseStore.update(warehouseId.value, form);
            toaster.success("Warehouse updated successfully");
        } else {
            await warehouseStore.submit(form);
            toaster.success("Warehouse created successfully");
        }
        visible.value = false;
        getWarehouses();
    } catch (error) {
        toaster.error(`Error ${isEdit.value ? 'updating' : 'creating'} warehouse`);
        console.log(error);
    } finally {
        loading.value = false; 
    }
};


const onUnitSubmit = async () => {
    loading.value = true; 

  
    if (unitForm.name && unitForm.capacity && unitForm.warehouse) {
        try {
            if (isEditUnit.value) {
                await unitStore.updateUnit(warehouseId.value, unitForm);
                toaster.success("Unit updated successfully");
            } else {
                await unitStore.addUnit(unitForm);
                toaster.success("Unit created successfully");
                unitForm.name = null;
                unitForm.capacity = null;
                unitForm.warehouse = null;
            }
            visible.value = false;
            getUnits();
        } catch (error) {
            toaster.error(`Error ${isEditUnit.value ? 'updating' : 'creating'} unit`);
            console.log(error);
        } finally {
            loading.value = false; 
        }
    } else {
        loading.value = false; 
    }
};


const onRegionChange = (event) => {   
    form.region = event.value.id;
}

const getRegionName = (region) => {
    return regions.value.find(r => r.id === region).name
}


const getUnits = async () => {
  unitStore.getUnits().then(response => {
    allUnits.value = response.data.content;
  }).catch(error => {
    toaster.error("Error fetching units");
    console.log(error);
  }).finally(() => {
    //
  });
};
const getWarehouses = async () => {
  warehouseStore.getWarehouses().then(response => {
    warehouses.value = response.data.content;
  }).catch(error => {
    toaster.error("Error fetching warehouses");
    console.log(error);
  }).finally(() => {
    //
  });
};
const getRegions = async () => {
  regionStore.getRegions().then(response => {
    regions.value = response.data.content;
  }).catch(error => {
    toaster.error("Error fetching regions");
    console.log(error);
  }).finally(() => {
    //
  });
};



const clickedWarehouse = ref(null);
const isEdit = ref(false);
const isEditUnit = ref(false);
const warehouseId = ref(null);//for editing purposes
const fuckit = ref(null);
const openModal = (pos,type,warehouse=null) => {    
    if(type==='Warehouse' && warehouse?.id){
        //its edit
        isEdit.value = true;
        warehouseId.value = warehouse.id;
        form.name = warehouse.name;
        form.capacity = warehouse.capacity;
        form.numberOfItems = warehouse.numberOfItems;
        form.numberOfUnits = warehouse.numberOfUnits;
        form.streetAddress = warehouse.streetAddress;
        form.zipCode = warehouse.zipCode;
        region.value = regions.value.find(r => r.id === warehouse.region);
        form.region = warehouse.region;
        
    }else if(type==='Unit' && warehouse?.warehouse){
        //its unit edit
        isEditUnit.value = true;
        warehouseId.value = warehouse.id;
        unitForm.name = warehouse.name;
        unitForm.capacity = warehouse.capacity;
        unitForm.warehouse = warehouse.id;
        fuckit.value = getWarehouseName(warehouse.warehouse);
        
    }else{
        //its new
        isEdit.value = false;
        isEditUnit.value = false;
        warehouseId.value = null;
        form.name = null;
        form.capacity = null;
        form.numberOfItems = null;
        form.numberOfUnits = null;
        form.streetAddress = null;
        form.zipCode = null;
        region.value = null;
        form.region = null;
    }
    popupType.value = type;
    position.value = pos;
    visible.value = true;
    clickedWarehouse.value = warehouse;
}



  const dialogStyle = computed(() => {
    return {
        width: popupType.value === 'Warehouse' ? '50rem' : '20rem'
    };
});



const deleteWarehouse = (model) => {
    if(!window.confirm("Are you sure you want to delete this warehouse?")){return};
    warehouseStore.deleteWarehouse(model.id).then(function (response) {
        toaster.success("Warehouse deleted successfully");
        getWarehouses();
    }).catch(function (error) {
        toaster.error("Error deleting warehouse");
        console.log(error);
    });
}

const deleteUnit= (model) => {
  unitStore.deleteUnit(model.id).then(function (response) {
    toaster.success("Unit deleted successfully");
    getUnits();
  }).catch(function (error) {
    toaster.error("Error deleting unit");
    console.log(error);
  });
}


const deleteRecord = (event, model) => {
  confirm.require({
    target: event.currentTarget,
    message: 'Do you want to delete this unit?',
    icon: '',
    rejectProps: {
      label: 'Cancel',
      severity: '',
      outlined: true
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger'
    },
    accept: () => {
      deleteUnit(model);
    },
    reject: () => {
      // do nothing
    }
  });
};

const getWarehouseName = (warehouse) => {
    return warehouses.value.find(w => w.id === warehouse).name
}

const getUnitsByWarehouse = (warehouse) => {
    let filtered = allUnits.value.filter(u => u.warehouse === warehouse.id);
    console.log(filtered)
    return allUnits.value = [...filtered]
}


const items = (warehouse) => [
    {
        label: 'Edit',
        icon: 'bx bx-edit-alt fs-4',
        command: () => {
            openModal('top','Warehouse', warehouse);
        }
    },
    {
        label: 'Delete',
        icon: 'bx bxs-trash fs-4 text-danger text-success',
        command: () => {
            deleteWarehouse(warehouse);
        }
    },
    {
        label: 'Add Unit',
        icon: 'bx bx-plus-circle fs-3',
        command: () => {
            unitForm.warehouse = warehouse.id
            openModal('top','Unit', warehouse);
        }
    }
];


</script>
<template>
    <Layout>
        <div class="page-wrapper">
            <div class="page-content">
                <BreadCrumb title="Warehouses and units" icon="bx bxs-school" />
                <div class="row">
                    <div class="col-12 col-lg-8 d-flex">
                       <div class="card radius-10 w-100">
                           <div class="card-body">
                             <div class="chart-container-1">                            
                                    <div class="table-container-colour pt-2 p-1">
                                        <div class="d-flex justify-content-between align-items-center mb-4">
                                            <h5></h5>
                                            <button type="button" class="btn maz-gradient-btn" @click="openModal('top','Warehouse')">Add Warehouse</button>
                                        </div>
                                        <table class="table table-dark table-bordered">
                                            <thead>
                                                <tr class="table-dark-color">
                                                    <th>Name</th>
                                                    <th>Capacity</th>
                                                    <th>Region</th>
                                                    <th>No of Items</th>
                                                    <th>No Of Units</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-if="warehouses.length > 0" v-for="warehouse in warehouses" :key="warehouse.id" class="table-dark-black">
                                                    <td>{{warehouse.name}}</td>
                                                    <td>{{warehouse.capacity}}</td>
                                                    <td>{{ getRegionName(warehouse.region) }}</td>
                                               
                                                    <td>{{ warehouse.numberOfItems}}</td>
                                                    <td>{{warehouse.numberOfUnits}}</td>
                                                    <td>
                                                        <div class="d-flex order-actions">
                                                            <SplitButton @click="getUnitsByWarehouse(warehouse)"
                                                            class="text-white" label="Units" icon="bx bx-cog fs-4" dropdownIcon="text-white fs-4 bx bx-chevron-down" 
                                                            :model="items(warehouse)"
                                                             />
                                                        </div>
                                                        
                                                      </td>
                                                </tr>
                                                <tr v-else>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td class="text-danger">No warehouses found.</td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                
                                               
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                               </div>
                           </div>
                       </div>
                    
                    <div class="col-12 col-lg-4 d-flex">
                        <div class="card radius-10 w-100">
                         <div class="card-header">
                             <div class="d-flex align-items-center">
                                 <div>
                                     <h6 class="mb-0">All Units</h6>
                                 </div>
                             </div>
                         </div>
                            <div class="card-body">
                             <div class="chart-container-2">
                                <table class="table table-dark table-bordered">
                                    <thead>
                                        <tr class="table-dark-color">
                                            <th>Name</th>
                                            <th>Capacity</th>
                                            <th>Warehouse</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-if="allUnits.length > 0" v-for="unit in allUnits" :key="unit.id" class="table-dark-black">
                                            <td>{{unit.name}}</td>
                                            <td>{{unit.capacity}}</td>
                                            <td>{{ getWarehouseName(unit.warehouse) }}</td>
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
                                        <tr v-else>
                                            <td></td>
                                            <td></td>
                                            <td class="text-danger">No units found.</td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                       
                                    </tbody>
                                    
                                </table>
                                <nav class="float-end" aria-label="...">
                                    <ul class="pagination pagination-sm">
                                        <li class="page-item disabled"><a class="page-link" href="javascript:;" tabindex="-1" aria-disabled="true">Previous</a>
                                        </li>
                                        <li class="page-item"><a class="page-link" href="javascript:;">1</a>
                                        </li>
                                        <li class="page-item active" aria-current="page"><a class="page-link" href="javascript:;">2 <span class="visually-hidden">(current)</span></a>
                                        </li>
                                        <li class="page-item"><a class="page-link" href="javascript:;">3</a>
                                        </li>
                                        <li class="page-item"><a class="page-link" href="javascript:;">Next</a>
                                        </li>
                                    </ul>
                                </nav>
                               </div>
                            </div>
                        </div>
                    </div>
                 </div>


               
                </div>
            </div>
            <Dialog v-model:visible="visible" position="top" modal :header="isEdit ? `Edit ${popupType}` : `Add ${popupType}`" :style="dialogStyle">
               
                <form @submit.prevent="onSubmit" class="row g-3" v-if="popupType === 'Warehouse'" >
                    
                    <div class="col-md-6">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Name</label>
                               <InputText type="text" v-model="form.name" />
                               <div class="input-errors" v-for="error of v$.name.$errors" :key="error.$uid">
                               <div class="text-danger">Warehouse name is required</div>
                        </div>
                    </div>                        
                    </div>
                    <div class="col-md-6">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Capacity</label>
                            <InputNumber v-model="form.capacity" inputId="withoutgrouping" :useGrouping="false" fluid />
                               <div class="input-errors" v-for="error of v$.capacity.$errors" :key="error.$uid">
                               <div class="text-danger">Capacity is required</div>
                            </div>
                    </div>                        
                    </div>

                    <div class="col-md-6">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Number Of Units</label>
                            <InputNumber v-model="form.numberOfUnits" inputId="withoutgrouping" :useGrouping="false" fluid />
                               <div class="input-errors" v-for="error of v$.numberOfUnits.$errors" :key="error.$uid">
                               <div class="text-danger">Number Of Units is required</div>
                            </div>
                    </div>                        
                    </div>
                    <div class="col-md-6">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Number Of Items</label>
                            <InputNumber v-model="form.numberOfItems" inputId="withoutgrouping" :useGrouping="false" fluid />
                               <div class="input-errors" v-for="error of v$.numberOfItems.$errors" :key="error.$uid">
                               <div class="text-danger">Number Of Items is required</div>
                            </div>
                    </div>                        
                    </div>
                    <div class="col-md-6">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Street address</label>
                               <InputText type="text" v-model="form.streetAddress" />
                               <div class="input-errors" v-for="error of v$.streetAddress.$errors" :key="error.$uid">
                               <div class="text-danger">Street address is required</div>
                            </div>
                    </div>                        
                    </div>
                    


                    <div class="col-md-6">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Zip Code</label>
                               <InputText type="text" v-model="form.zipCode" />
                               <div class="input-errors" v-for="error of v$.zipCode.$errors" :key="error.$uid">
                               <div class="text-danger">Zip Code is required</div>
                            </div>
                    </div>                        
                    </div>

                    <div class="col-md-6">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Region</label>
                            <Select v-model="region" @change="onRegionChange($event)" :options="regions" showClear  optionLabel="name" placeholder="Select Region" class="w-full md:w-56" />
                               <div class="input-errors" v-for="error of v$.region.$errors" :key="error.$uid">
                               <div class="text-danger">Region is required</div>
                            </div>
                    </div>                        
                    </div>

                    <div class="modal-footer">
                        <button type="submit" class="btn maz-gradient-btn w-100" :disabled="loading">
            <div v-if="loading" class="spinner-border text-white" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            {{ isEdit ? 'Update' : 'Submit' }}
        </button>
                    </div>
                    
                </form>
                <form class="row g-3" v-if="popupType == 'Unit'">
                    
                    <div class="col-md-12">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Warehouse</label>
                               <InputText v-show="!isEditUnit" v-tooltip.top="'Warehouse cannot be changed.'" type="text" :disabled="true" v-model="clickedWarehouse.name" />
                               <InputText v-show="isEditUnit" v-tooltip.top="'Warehouse cannot be changed.'" type="text" :disabled="true" 
                               v-model="fuckit" />
                    </div>                        
                    </div>
                    <div class="col-md-12">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Unit Name</label>
                               <InputText type="text" v-model="unitForm.name" />
                    </div>                        
                    </div>
                    <div class="col-md-12">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Capacity</label>
                            <InputNumber v-model="unitForm.capacity" inputId="withoutgrouping" :useGrouping="false" fluid />
                    </div>                        
                    </div>
                    <div class="modal-footer">
                        <button v-show="!isEditUnit" @click="onUnitSubmit" type="button" class="btn maz-gradient-btn w-100">   <div v-if="loading" class="spinner-border text-white" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>{{ isEdit ? 'Update' : 'Submit' }}</button>
                        <button v-show="isEditUnit" @click="onUnitSubmit" type="button" class="btn maz-gradient-btn w-100"> <div v-if="loading" class="spinner-border text-white" role="status">
                <span class="visually-hidden">Loading...</span>
            </div> {{ isEditUnit ? 'Update' : 'Submit' }}</button>
                    </div>
                    
                </form>
               
            </Dialog>
    </Layout>
</template>
<style scoped>
.table-container-colour {
    background-color: #212020 !important;
}

.table-dark-color {
    background-color: #252525;
}

.table-dark-black {
    background-color: #1e1e1e;
}

.table-dark-light {
    background-color: #504f4f;
}

.table-dark td,
.table-dark th,
.table-dark thead th {
    padding: 10px !important;
    border: none !important;
}


.show {
    display: block;
}



.risk-at-risk {
    background-color: #ff0055;
    color: white;
}

.risk-on-track {
    background-color: #00d2ff;
    color: white;
}

.risk-planned {
    background-color: #ffa500;
    color: white;
}
.risk-finished {
    background-color: #15ca20 !important;
    color: white;
}

.risk-delayed {
    background-color: #b200ff;
    color: white;
}

.my-card {
    box-shadow: 0 0rem 0rem rgb(0 0 0 / 20%) !important;
    margin-bottom: -15px;
}

.p-splitbutton {
    height: 36px !important;
}
.p-button-label{
    color: #fff !important;
}
</style>

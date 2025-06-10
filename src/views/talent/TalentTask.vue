<script setup>
import moment from 'moment';
import Layout from '@/views/shared/Layout.vue';
import BreadCrumb from '@/components/BreadCrumb.vue';
import Dialog from 'primevue/dialog';
import { usePlacesAutocomplete } from 'vue-use-places-autocomplete'
import InputText from 'primevue/inputtext';
import URLrouter from '@/router';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import { useRoute } from 'vue-router';
import DatePicker from 'primevue/datepicker';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useUserStore } from '@/stores/userStore';
import { useTask } from '@/stores/task';
import { onMounted, ref, reactive } from 'vue';
import useToaster from '@/composables/useToaster';
import { useConfirm } from "primevue/useconfirm";
import AutoComplete from 'primevue/autocomplete';
import { watch } from 'vue';
import { geocodeByAddress, getLatLng,geocodeByLatLng,geocodeByPlaceId } from 'vue-use-places-autocomplete'
import { useAuth } from "@/stores/auth";
import SplitButton from 'primevue/splitbutton';


const route = useRoute();
const activationName = ref(route.query.name);
const activation = ref(route.query.activation);

const visible = ref(false);
const tasks = ref([]);
const promoters = ref([]);
const position = ref('top');
const showLoading = ref(false);

const toaster = useToaster();
const taskStore = useTask();
const confirm = useConfirm();
const userStore = useUserStore();
const authStore =  useAuth();
console.log(JSON.parse(authStore.user).activeUserId)

onMounted(() => {
    getTasksByPromoterId(JSON.parse(authStore.user).activeUserId);
   
})

const query = ref('');
const formattedSuggestions = ref([]);

const { suggestions,loading,sessionToken,refreshSessionToken } = usePlacesAutocomplete(query, {
  debounce: 500,
  minLengthAutocomplete: 3,
  refreshSessionToken: true
});

    const filteredLocations = ref([]);

    const filterCities = (event) => {
      const searchQuery = event.query.toLowerCase();
      filteredLocations.value = formattedSuggestions.value.filter(location => location.name.toLowerCase().includes(searchQuery));
    };

watch(suggestions, (newSuggestions) => {
      formattedSuggestions.value = newSuggestions.map(suggestion => ({
        name: suggestion.description,
        place_id: suggestion.place_id
      }));
    });

    const statuses = ref([
        { name: 'Finished', code: 'FINISHED' },
        { name: 'Planned', code: 'PLANNED' },
        { name: 'On Track', code: 'ONTRACK' },
        { name: 'Delayed', code: 'DELAYED' },
        { name: 'At Risk', code: 'ATRISK' }
    ]);

    const onSelectLocation = (event) => {
        console.log('event',event.value.name);
        getGeoCode(event.value);
       
    };

    const getGeoCode = async (event) => {
        const results =  await geocodeByAddress(event.name);
        const byPlacesId = await geocodeByPlaceId(event.place_id)
        const { lat, lng } =  getLatLng(results);
        form.address = results[0].formatted_address;
        form.longitude = results[0].geometry.viewport.Hh.lo;
        form.latitude = results[0].geometry.viewport.Yh.hi

    }

    const types = ref([
        { name: 'Third Party', code: 'THIRDPARTY' },
        { name: 'Inhouse', code: 'INHOUSE' }
    ]);

const status = ref(null);
const type = ref(null);
const form = reactive({
    status: '',
    type: '',
	plannedEndDate: null,
    startDate: null,
	timeRecord: null,
    completion: null,
    jobNumber: null,
    name: null,
    address: null,
    longitude: null,
    latitude: null,
    activation: activation.value
});

const rules = { 
    status: { required },
    type: {required},
    name: { required },
    startDate: {required},
    plannedEndDate: { 
        required,
        validator: (value, { parent }) => {
            if (new Date(value) < new Date(parent.startDate)) {
                return 'Planned end date must be on or after the start date';
            }
            return true;
        }
    },
	timeRecord: { required },
	jobNumber: { required },
	completion: { required },
    activation: { required }
};
const v$ = useVuelidate(rules, form);

const onSubmit = async () => {
    const isFormValid = await v$.value.$validate();
    if (!isFormValid) {return;}
    showLoading.value = true;
    if(isEdit.value){
        taskStore.update(taskId.value,form).then(function (response) {
            toaster.success("Task updated successfully");
            visible.value = false;
            getTasksByPromoterId();
        }).catch(function (error) {
            toaster.error("Error updating task");
            console.log(error);
        });
    } 
    else {
        taskStore.submit(form).then(function (response) {
        toaster.success("Task created successfully");
        
        form.status=null,
        form.address = null,
        form.type = null
        v$.value.$reset();
        v$.value.$errors = [];
        visible.value = false;
        getTasksByPromoterId();
        showLoading.value = false;
    }).catch(function (error) {
        toaster.error("Error creating task");
        console.log(error);
        showLoading.value = false;
    });
    }
    
};

const onStatusChange = (event) => {
    form.status = event.value.code;
}


const onTypeChange = (event) => {
    form.type = event.value.code;
}

const onPlannedEndDateChange = (event) => {
    form.plannedEndDate = moment(event).format('YYYY-MM-DD');
}

const onPlannedStartDateChange = (event) => {
    form.startDate = moment(event).format('YYYY-MM-DD');
}

const getTasksByPromoterId = async (promoterId) => {
  taskStore.getTasksByPromoterId(promoterId).then(response => {
  
    tasks.value = response.data;
  }).catch(error => {
    toaster.error("Error fetching tasks");
    console.log(error);
  }).finally(() => {
    //
  });
};
const getPromoters = async () => {
    userStore.getUserByRole("TTG_TALENT").then(response => {
  console.log("Promoters", response.data);
    promoters.value = response.data.content;
  }).catch(error => {
    toaster.error("Error fetching promoters");
    console.log(error);
  }).finally(() => {
    //
  });
};




const taskId = ref(null);
const isEdit = ref(false);




const openModal = (pos,task) => {
    if(task) {//edit
    isEdit.value = true;
    taskId.value=task.id;
    // form.activation = task.activation;
    status.value = statuses.value.find(stat => stat.code === task.status);
    form.status = form.status = statuses.value.find(stat => stat.code === task.status).code;
    form.address = task.address;
    type.value = types.value.find(stat => stat.code === task.type);
    form.type = form.type = types.value.find(stat => stat.code === task.type).code;
    Object.assign(form, {
    // status: task.status,
     startDate : task.startDate,
     plannedEndDate: task.plannedEndDate,
     timeRecord: task.timeRecord,
     completion: task.completion,
     jobNumber: Number(task.jobNumber),
     name: task.name,
    
    })
  }else{
    
    Object.assign(form, {
     status: null,
     type: null,
     startDate: null,
     plannedEndDate: null,
     timeRecord: null,
     completion: null,
     jobNumber: null,
     name:null,
    //  activation: null
    })
  }  
    position.value = pos;
    visible.value = true;
}

const getStatus = (status) => {
    return statuses.value.find(stat => stat.code === status).name;
   
 }

const getType = (type) => {
    return types.value.find(typ => typ.code === type).name;
}

const getClass = (status) => {
    if(status === 'FINISHED') {
        return 'risk-finished';
    } else if(status === 'PLANNED') {
        return 'risk-planned';
    } else if(status === 'ONTRACK') {
        return 'risk-on-track';
    } else if(status === 'DELAYED') {
        return 'risk-delayed';
    } else if(status === 'ATRISK') {
        return 'risk-at-risk';
    }
}

const deleteTask = (task) => {
  taskStore.deleteTask(task.id).then(function (response) {
    toaster.success("Task deleted successfully");
    getTasksByPromoterId();
  }).catch(function (error) {
    toaster.error("Error deleting task");
    console.log(error);
  });
}

const handlePlaceChanged = (place) => {
  console.log('Selected place:', place);
  // You can access more details about the place here
};


const deleteRecord = (event, task) => {
  confirm.require({
    target: event.currentTarget,
    message: 'Do you want to delete this task?',
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
      deleteTask(task);
    },
    reject: () => {
      // do nothing
    }
  });
};


const promoterItems = (task) => [    {
        label: 'View',
        icon: 'bx bx-show fs-4 maz-gradient-txt',
        command: () => {
            URLrouter.push(`/view-talent-task/${task.id}`);
        }
    },
	// {
    //     label: 'Add Images',
    //     icon: 'bx bx-image-add fs-4 maz-gradient-txt',
    //     command: () => {
    //         URLrouter.push(`/talent/images/${task.id}`);
    //     }
    // }
    
];



</script>
<template>
    <Layout>
        <div class="page-wrapper">
            <div class="page-content">
                <BreadCrumb title="Tasks" icon="bx bx-task" />
                <!-- <h4 class="mx-2">Activation: {{ activationName }}</h4> -->
                <div class="card">
                    <div class="card-body">
                            <div class="table-container-colour pt-2 p-5">
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <h5>Main tasks to set up</h5>
                                
                                </div>
                                <table class="table table-dark table-bordered">
                                    <thead>
                                        <tr class="table-dark-color">
                                            <!-- <th>Activation</th> -->
                                            <th>Task</th>
                                            <th>Job Number</th>
                                            <th>Risk</th>
                                            <th>End date</th>
                                            <th>Location</th>
                                            <th>Completion</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-if="tasks.length > 0" v-for="task in tasks" :key="task.id" class="table-dark-black">
                                            <!-- <td>{{ activationName }}</td> -->
                                            <td>{{ task.name }}</td>
                                            <td>{{ task.jobNumber }}</td>
                                            <td  :class="getClass(task.status)">
                                                {{ getStatus(task.status) }}
                                            </td> 
                                            <td>{{task.plannedEndDate}}</td>
                                            <td>{{task.address}}</td>
                                            <td>{{task.completion}}</td>
                                            <td>
                                                <div class="d-flex order-actions">
                                                    <SplitButton class="text-white" label="Actions" 
													icon="bx bx-cog fs-4" 
													dropdownIcon="text-white fs-4 bx bx-chevron-down" 
													:model="promoterItems(task)"/>
                                                </div>
                                                
                                              </td>
                                        </tr>
                                        <tr v-else>
                                            <td colspan="8" class="text-center text-danger">
                                                No tasks found.
                                            </td>
                                        </tr>
                                       
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Dialog v-model:visible="visible" position="top" modal :header="isEdit ? 'Edit Task' : 'Add Task'" :style="{ width: '50rem' }">
                
                <form @submit.prevent="onSubmit" class="row g-3">
                     <div class="col-md-6">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Activation</label>
                             <InputText v-model="activationName" disabled />
                        </div> 
                    </div>

                    <div class="col-md-6">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Name</label>
                            <InputText v-model="form.name" inputId="withoutgrouping"  :useGrouping="false" fluid />
                               <div class="input-errors" v-for="error of v$.name.$errors" :key="error.$uid">
                               <div class="text-danger">Name is required</div>
                            </div>
                    </div>                        
                    </div>
                    <div class="col-md-6">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Job Number</label>
                            <InputNumber v-model="form.jobNumber" inputId="withoutgrouping" :useGrouping="false" fluid />
                               <div class="input-errors" v-for="error of v$.jobNumber.$errors" :key="error.$uid">
                               <div class="text-danger">Job Number is required</div>
                            </div>
                    </div>                        
                    </div>

                    <div class="col-md-6">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Risk</label>
                            <Select v-model="status" @change="onStatusChange($event)" :options="statuses" showClear  optionLabel="name" placeholder="Select Risk" class="w-full md:w-56" />
                               <div class="input-errors" v-for="error of v$.status.$errors" :key="error.$uid">
                               <div class="text-danger">Risk is required</div>
                            </div>
                    </div>                        
                    </div>


                    <div class="col-md-6">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Type</label>
                            <Select v-model="type" @change="onTypeChange($event)" :options="types" showClear  optionLabel="name" placeholder="Select Type" class="w-full md:w-56" />
                               <div class="input-errors" v-for="error of v$.type.$errors" :key="error.$uid">
                               <div class="text-danger">Type is required</div>
                            </div>
                    </div>                        
                    </div>

                    <div class="col-md-6">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Planned Start Date</label>
                            <DatePicker v-model="form.plannedEndDate" @date-select="onPlannedEndDateChange($event)" showButtonBar showIcon fluid :showOnFocus="true" />
                               <div class="input-errors" v-for="error of v$.plannedEndDate.$errors" :key="error.$uid">
                               <div class="text-danger">End date is required</div>
                            </div>
                    </div>                        
                    </div>


                    <div class="col-md-6">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Planned End Date</label>
                            <DatePicker v-model="form.plannedEndDate" @date-select="onPlannedEndDateChange($event)" showButtonBar showIcon fluid :showOnFocus="true" />
                               <div class="input-errors" v-for="error of v$.plannedEndDate.$errors" :key="error.$uid">
                               <div class="text-danger">End date is required</div>
                            </div>
                    </div>                        
                    </div>
                    <div class="col-md-6">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Time Record</label>
                               <InputNumber v-model="form.timeRecord" inputId="withoutgrouping" fluid />
                               <div class="input-errors" v-for="error of v$.timeRecord.$errors" :key="error.$uid">
                               <div class="text-danger">Time Record is required</div>
                            </div>
                    </div>                        
                    </div>
                    <div class="col-md-6">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Completion</label>
                               <InputText type="text" v-model="form.completion" />
                               <div class="input-errors" v-for="error of v$.completion.$errors" :key="error.$uid">
                               <div class="text-danger">Completion is required</div>
                            </div>
                    </div>                        
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Location</label>
                            <AutoComplete v-model="query" :suggestions="formattedSuggestions" 
                            optionLabel="name" @complete="filterCities" @item-select="onSelectLocation($event)" id="autocomplete-input" class="row mx-1"/>
                        </div> 
                    </div>

                    <div class="col-md-6">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Assign Promoter</label>
                            <AutoComplete v-model="query" :suggestions="formattedSuggestions" 
                            optionLabel="name" @complete="filterCities" @item-select="onSelectLocation($event)" id="autocomplete-input" class="row mx-1"/>
                        </div> 
                    </div>

                   

                    <div class="modal-footer">
                        <!-- <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button> -->
                        <button type="submit" 
                        :disabled="showLoading"
                        class="btn maz-gradient-btn w-100"
                        
                        >
                            <div
                            v-if="showLoading"
                            class="spinner-border text-white"
                            role="status"
                          >
                            <span class="visually-hidden">Loading...</span>
                          </div>
                            
                            {{ isEdit ? 'Update' : 'Submit' }}
                        </button>
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

</style>

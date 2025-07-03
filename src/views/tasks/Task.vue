<script setup>
import moment from 'moment';
import { useUserStore } from '@/stores/userStore';
import { useSupplier } from '@/stores/supplier';
import Layout from '@/views/shared/Layout.vue';
import BreadCrumb from '@/components/BreadCrumb.vue';
import Dialog from 'primevue/dialog';
import { usePlacesAutocomplete } from 'vue-use-places-autocomplete'
import InputText from 'primevue/inputtext';
import ConfirmPopup from 'primevue/confirmpopup';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import { useRoute } from 'vue-router';
import URLrouter from '@/router';
import DatePicker from 'primevue/datepicker';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useTask } from '@/stores/task';
import { onMounted, ref, reactive } from 'vue';
import useToaster from '@/composables/useToaster';
import { useConfirm } from "primevue/useconfirm";
import Drawer from 'primevue/drawer';
import AutoComplete from 'primevue/autocomplete';
import { watch } from 'vue';
import { geocodeByAddress, getLatLng,geocodeByLatLng,geocodeByPlaceId } from 'vue-use-places-autocomplete'
import PDF from 'pdf-vue3';
import SplitButton from 'primevue/splitbutton';
import MultiSelect from 'primevue/multiselect';
import FileUploadGeneric from '../upload/FileUploadGeneric.vue';



const route = useRoute();
const userStore = useUserStore();
const supplierStore = useSupplier();
const activationName = ref(route.query.name);
const activation = ref(route.query.activation);
const envPath = import.meta.env.VITE_AWS_S3_BUCKET;

const visible = ref(false);
const showThirdPartyModal = ref(false);

const tasks = ref([]);
const thirdPartySuppliers = ref([]);
const position = ref('top');

const toaster = useToaster();
const taskStore = useTask();
const confirm = useConfirm();

onMounted(() => {
    getTasksByActivationId();
    getThirdPartySuppliers();
})

const query = ref('');
const formattedSuggestions = ref([]);

const { suggestions,loading,sessionToken,refreshSessionToken } = usePlacesAutocomplete(query, {
  debounce: 500,
  minLengthAutocomplete: 3,
  refreshSessionToken: true
});

    const filteredCities = ref([]);

    const filterCities = (event) => {
      const searchQuery = event.query.toLowerCase();
      filteredCities.value = formattedSuggestions.value.filter(city => city.name.toLowerCase().includes(searchQuery));

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
        // console.log('event',event);
        getGeoCode(event);
       
    };
    const getThirdPartySuppliers = async () => {
        supplierStore.getThirdParties().then(response => {
            supplierStore.setAllSuppliers(response.data.content);
            let result = supplierStore.allSuppliers;
            console.log('result',result);
            if(result.length > 0) {
                //map third party suppliers
                thirdPartySuppliers.value = result.map(supplier => {
                    return { name: supplier.userDetails.firstName + ' ' + supplier.userDetails.lastName, code: supplier.id }
                })
            }
        }).catch(error => {
            console.log(error);
        })
    }

    const getGeoCode = async (event) => {
  try {
    const results = await geocodeByAddress(event.value.name);
    const byPlacesId = await geocodeByPlaceId(event.value.place_id);

    // Await the result of getLatLng
    const { lat, lng } = await getLatLng(results[0]);

    // Now lat and lng are available
    form.longitude = lng;
    form.latitude = lat;
    form.address = results[0]?.formatted_address;

    // console.log({ lat, lng }); // Log the values to confirm

    // Optionally log the form to check the values are assigned correctly
    console.log(form);
  } catch (error) {
    console.error('Error fetching geocode:', error);
  }
};


    const types = ref([
        { name: 'Third Party', code: 'THIRDPARTY' },
        { name: 'Inhouse', code: 'INHOUSE' }
    ]);

const status = ref(null);
const type = ref(null);
const showLoading = ref(false);
const form = reactive({
    status: '',
    type: '',
    startDate: null,
	plannedEndDate: null,
	timeRecord: null,
    completion: null,
    name: null,
    address: null,
    longitude: null,
    latitude: null,
    briefFile: null,
    activation: activation.value
});

const rules = { 
    status: { required },
    type: {required},
    name: { required },
    startDate: { required },
    plannedEndDate: { required },
	timeRecord: { required },
	completion: { required },
    activation: { required },
    address :  {required}
};
const v$ = useVuelidate(rules, form);

const onSubmit = async () => {
   
    const isFormValid = await v$.value.$validate();
    if (!isFormValid) {return;}
    showLoading.value = true;

    const formData = new FormData();
        formData.append('briefFile', briefFile.value);
        formData.append('status', form.status);
        formData.append('type', form.type);
        formData.append('name', form.name);
        formData.append('startDate', form.startDate);
        formData.append('plannedEndDate', form.plannedEndDate);
        formData.append('timeRecord', form.timeRecord);
        formData.append('latitude', form.latitude);
        formData.append('longitude', form.longitude);
        formData.append('address', form.address);
        formData.append('completion', form.completion);
        formData.append('activation', form.activation);
        formData.append('address', form.address);
        formData.append('longitude', form.longitude);
        formData.append('latitude', form.latitude);

        const config = {
            useMultipartFormData: true // Add this flag to the request config
        };
    
    if(isEdit.value){
        
        taskStore.update(taskId.value,form, config).then(function (response) {
            toaster.success("Task updated successfully");
            visible.value = false;
            getTasksByActivationId();
        }).catch(function (error) {
            toaster.error("Error updating task");
            console.log(error);
        });
    } 
    else {
        taskStore.submit(formData,config).then(function (response) {
            showLoading.value = false;
        toaster.success("Task created successfully");
        visible.value = false;
        getTasksByActivationId();
    }).catch(function (error) {
        toaster.error("Error creating task");
        console.log(error);
    }).finally(() => {
        showLoading.value = false;
    });
    }

    v$.value.$errors = [];
    v$.value.$reset();

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

const getTasksByActivationId = async () => {
  taskStore.getTasksByActivationId(activation.value).then(response => {
    taskStore.setAlltasks(response.data);
    tasks.value = taskStore.allTasks;
  }).catch(error => {
    toaster.error("Error fetching tasks");
    console.log(error);
  }).finally(() => {
    //
  });
};




const taskId = ref(null);
const isEdit = ref(false);
const viewedTask = ref({});

const openModal = (pos,task) => {
    showLoading.value = false;
    viewedTask.value = task;
    if(task) {//edit
    isEdit.value = true;
    taskId.value=task.id;
    query.value = task.address;
    status.value = statuses.value.find(stat => stat.code === task.status);
    form.status = form.status = statuses.value.find(stat => stat.code === task.status).code;

    type.value = types.value.find(stat => stat.code === task.type);
    form.type = form.type = types.value.find(stat => stat.code === task.type).code;
    Object.assign(form, {
    // status: task.status,
     startDate: task.startDate,
     plannedEndDate: task.plannedEndDate,
     timeRecord: task.timeRecord,
     completion: task.completion,
     name: task.name,
     longitude: task.longitude,
     latitude: task.latitude,
     address: task.address
    })
  }else{
    
    Object.assign(form, {
     status: null,
     type: null,
     startDate: null,
     plannedEndDate: null,
     latitude: null,
     longitude: null,
     address: null,
     timeRecord: null,
     completion: null,
     name:null,
    //  activation: null
    })
  }  
    position.value = pos;
    visible.value = true;
}


const toggleModal = (pos,task) => {
    position.value = pos;
    showThirdPartyModal.value = true;
    taskId.value = task.id;
}

const getStatus = (status) => {
    return statuses.value.find(stat => stat.code === status).name;
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
    getTasksByActivationId();
  }).catch(function (error) {
    toaster.error("Error deleting task");
    console.log(error);
  });
}

const handlePlaceChanged = (place) => {
  console.log('Selected place:', place);
  // You can access more details about the place here
};


const deleteRecord = ( task) => {
  if(!window.confirm("Are you sure you want to delete this task?")) {
    return
  }
  deleteTask(task);
};

const briefFile = ref(null);
// const onFileChange = (event) => {
//     briefFile.value = null;
//     if (!event.target.files[0].name.includes(".pdf")) {
//         toaster.error("Please upload a pdf file");
//         briefFile.value = null;
//         return
//     }
//     briefFile.value = event.target.files[0];
//     form.briefFile = event.target.files[0];
// }


const onFileChange = (uploadedFile) => {
  
  if (!uploadedFile.name.includes(".pdf")) {
    toaster.error("Please select a pdf file");
    return;
  }
    console.log('event', uploadedFile);
    briefFile.value = uploadedFile;
}

const onfileDropped = (dropedFile) => {
  if (!dropedFile[0].name.includes(".pdf")) {
    toaster.error("Please select a pdf file");
    return;
  }
   console.log('dropedFile', dropedFile);
      briefFile.value = null

      // Get selected files
      const files = dropedFile;
      if (!files) return
      const file = files[0];
      briefFile.value = file;
};


const removeFile = () => {
    briefFile.value = null;  
}
const view_uploaded_file_visible = ref(false);
const base64PDF = ref(null);
const previewBase64PDF = () => {
    if(viewedTask.value.path) {
        view_uploaded_file_visible.value = true;
        return
    }
    //convert brief file to base64
    const reader = new FileReader();
    reader.readAsDataURL(briefFile.value);
    reader.onloadend = () => {
        base64PDF.value = reader.result;
        view_uploaded_file_visible.value = true;
    };
}




const taskItems = (task) => {
    const items = [
        {
            label: 'Edit',
            icon: 'bx bxs-edit fs-4 maz-gradient-txt',
            command: () => {
                openModal('top', task);
            }
        },
        ,
    
    {
        label: 'Add/View Images',
        icon: 'bx bx-images maz-gradient-txt fs-3',
        command: () => {
			URLrouter.push(`/activation-images?activation=${task?.activation}`);
        }
    },
        {
            label: 'View',
            icon: 'bx bx-show fs-4 maz-gradient-txt',
            command: () => {
                URLrouter.push(`/tasks/${task.id}?name=${task.name}`);
            }
        },
    ];

    // Conditionally add the "Add Third Party Suppliers" item
    if (task.type == 'THIRDPARTY') {
        items.push({
            label: 'Add Third Party Suppliers',
            icon: 'bx bx-user-plus fs-4 maz-gradient-txt',
            command: () => {
                toggleModal('top', task);
            }
        });
    }
    items.push({
        label: 'Delete',
        icon: 'bx bx-trash text-danger fs-3',
        command: () => {
            deleteRecord(task);
        }
    });

    return items;
};

const getTaskType = (type) => {
    if(type === 'INHOUSE') {
        return 'In House';
    } else if(type === 'THIRDPARTY') {
        return 'Third Party';
    }
}


const selectedThirdPaties = ref();

const submitThirdParty = () => {
    if(!selectedThirdPaties.value) {
        toaster.error("Please select a supplier");
        return
    }
    const supplierArray = [];
    selectedThirdPaties.value.forEach(supplier => {
        supplierArray.push(supplier.code)
    });
    let myObj = {
        "thirdParties": supplierArray,
        "task": taskId.value
    }
    showLoading.value = true;
   taskStore.addThirdPartiesToTask(myObj).then(response => {
       getTasksByActivationId();
       toaster.success("Third party suppliers added successfully");
       showThirdPartyModal.value = false;
       showLoading.value = false;
   }).catch(error => {
       toaster.error("Error adding third party suppliers");
       console.log(error);
   }).finally(() => {
       showLoading.value = false;
   })
}

const clientColor = JSON.parse(localStorage.getItem('clientColor'));

		const clientColorStyles = {
			color: `#${clientColor?.color} !important`, //clientColor?.color,
			background: `#${clientColor?.color} !important`, //clientColor?.color
			borderColor: `#${clientColor?.color} !important`,
		}
</script>
<template>
    <Layout>
        <div class="page-wrapper">
            <div class="page-content">
                <BreadCrumb title="Tasks" icon="bx bx-task" :style="{ color: clientColorStyles?.color }" />
                <h4 style="margin-left: 2.9rem" >{{activationName}}</h4>
                <div class="card">
                    <div class="card-body">
                            <div class=" pt-2 p-5">
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <h5>Main tasks to set up</h5>
                                    <button :style="{ background: clientColorStyles?.background }" type="button" class="btn maz-gradient-btn" @click="openModal('top')" >Add New Task</button>
                                </div>
                                <table class="table table-striped table-bordered">
                                    <thead>
                                        <tr class="table-dark-color">
                                            <th>Task</th>
                                            <th>Risk</th>
                                            <th>Start Date</th>
                                            <th>End Date</th>
                                            <th>Time Record</th>
                                            <th>Type</th>
                                            <th>Completion</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-if="taskStore.allTasks.length > 0" v-for="task in taskStore.allTasks" :key="task.id" class="table-dark-black">
                                            <td>{{ task.name }}</td>
                                            <td  :class="getClass(task.status)">
                                                {{ getStatus(task.status) }}
                                            </td>
                                            <td>{{task.startDate}}</td>
                                            <td>{{task.plannedEndDate}}</td>
                                            <td>{{task.timeRecord}}</td>
                                            <td>{{ getTaskType(task.type) }}</td>
                                            <td>{{task.completion}}%</td>
                                            <td>
                                                <div class="d-flex order-actions">
                                                    <SplitButton class="text-white" label="" 
													icon="bx bx-cog fs-4" 
													dropdownIcon="text-white fs-4 bx bx-chevron-down" 
													:model="taskItems(task)"/>
                                                  <ConfirmPopup></ConfirmPopup>
                                                </div>
                                                
                                              </td>
                                        </tr>
                                        <tr v-else>
                                            <td colspan="7" class="text-center text-danger">
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
            <Dialog v-model:visible="visible" position="top" modal :header="isEdit ? 'Edit Task' : 'Add Task'" :style="{ width: '50rem', color: clientColorStyles?.color }">
                
                <form @submit.prevent="onSubmit" class="row g-3">
                    <div class="col-md-6">
                        <div class="card my-card flex justify-center">
                            <label for="input1" class="form-label">Activation</label>
                             <InputText v-model="activationName" disabled />
                        </div> 
                    </div>

                    <div class="col-md-12">
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
                            <DatePicker v-model="form.startDate" @date-select="onPlannedStartDateChange($event)" showButtonBar showIcon fluid :showOnFocus="true" />
                               <div class="input-errors" v-for="error of v$.startDate.$errors" :key="error.$uid">
                               <div class="text-danger">Start date is required</div>
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
                            optionLabel="name" @complete="filterCities" @item-select="onSelectLocation($event)" class="row mx-1" />
                               <div class="input-errors" v-for="error of v$.completion.$errors" :key="error.$uid">
                               <div class="text-danger">Location is required</div>
                            </div>
                    </div>                        
                    </div>

                    <template v-if="form.type == 'THIRDPARTY'">
                        <div class="col-md-12 mt-4">
                            <label for="file-upload" class="form-label">Upload Brief File</label>
                            <FileUploadGeneric 
                              docId="task-file"
                              :showFilePreview="true" 
                              accept="application/pdf" 
                              fileType="pdf" 
                              @fileUploaded="onFileChange"
                              @fileDropped="onfileDropped"
                            />
                        </div>
                    </template>
                    <template v-if="isEdit && viewedTask?.path">
                        <div v-if="viewedTask?.path" id="file-preview" class="file-upload-preview mt-2">                                    
                            <img @click="previewBase64PDF" id="file-preview-image" src="/src/assets/images/pdf.png" alt="File Preview" class="cursor-pointer" />
                            <button type="button" class="file-remove-button" @click="removeFile()">×</button>
                        </div>
                    </template>
                    <div class="modal-footer" style="margin-top: 2rem">
                       
                        <button :style="{ background: clientColorStyles?.background }" :disabled="showLoading"
                        type="submit" class="btn  maz-gradient-btn w-100 text-white d-flex justify-content-center align-items-center">
                            <div
                            v-if="showLoading"
                            class="spinner-border text-white"
                            role="status"
                          >
                            <span class="visually-hidden">Loading...</span>
                          </div>
                          {{ isEdit ? 'Update' : 'Submit' }}</button>
                    </div>
                    
                </form>
            </Dialog>
            <div class="card flex justify-center">
                <Drawer v-model:visible="view_uploaded_file_visible" position="right" header="View Brief File" class="!w-full md:!w-80 lg:!w-[40rem]" style="width: 30rem!important;">
                    <PDF :src="viewedTask ? envPath + viewedTask?.path : base64PDF" />
                </Drawer>
            </div>

            <Dialog v-model:visible="showThirdPartyModal" position="top" modal header="Add Third Party" :style="{ width: '30rem', color: clientColorStyles?.color }">
                <div class="card flex justify-center">
                    <MultiSelect v-model="selectedThirdPaties" display="chip" :options="thirdPartySuppliers" optionLabel="name" filter placeholder="Select Third Party"
                        :maxSelectedLabels="3" class="w-full md:w-80" />
                        <div class="d-grid">
                            <button :style="{ background: clientColorStyles?.background }" @click="submitThirdParty" class="btn  maz-gradient-btn w-100 text-white d-flex justify-content-center align-items-center mt-3" type="button" 
                               :disabled="!selectedThirdPaties"> 
                                <span v-if="showLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                {{ showLoading ? '' : 'Submit' }}
                            </button>
                          </div>
                </div>
            </Dialog>
    </Layout>
</template>
<style scoped>
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

</style>

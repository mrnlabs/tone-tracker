<script setup>
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import DatePicker from 'primevue/datepicker';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import { onMounted, ref, reactive, watch } from 'vue';
import AutoComplete from 'primevue/autocomplete';
import { geocodeByAddress, geocodeByPlaceId, getLatLng, usePlacesAutocomplete } from 'vue-use-places-autocomplete';
import FileUploadGeneric from '../upload/FileUploadGeneric.vue';
import moment from 'moment';
import { useTask } from '@/stores/task';
import useToaster from '@/composables/useToaster';
import Drawer from 'primevue/drawer';
import PDF from 'pdf-vue3';
import InputError from '@/components/form-components/InputError.vue';
import debounce from 'lodash.debounce';

const props = defineProps({
    activation: Object,
    statuses: Array,
    viewedTask: Object,
    isEdit: Boolean
});

const taskStore = useTask();
const toaster = useToaster();

const envPath = import.meta.env.VITE_AWS_S3_BUCKET;

const emit = defineEmits(['closeTaskModal']);

const showLoading = ref(false);
const query = ref('');
const status = ref(null);
const briefFile = ref(null);
const type = ref(null);
const formattedSuggestions = ref([]);
const filteredCities = ref([]);

const { suggestions,loading,sessionToken,refreshSessionToken } = usePlacesAutocomplete(query, {
  debounce: 500,
  minLengthAutocomplete: 3,
  refreshSessionToken: true
});
const clientColor = JSON.parse(localStorage.getItem('clientColor'));

		const clientColorStyles = {
			color: `#${clientColor?.color} !important`, //clientColor?.color,
			background: `#${clientColor?.color} !important`, //clientColor?.color
			borderColor: `#${clientColor?.color} !important`,
		}
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

    const onSelectLocation = (event) => {
        // console.log('event',event);
        getGeoCode(event);
       
    };
 const getGeoCode = async (event) => {
  try {
    const results = await geocodeByAddress(event.value.name);
    const byPlacesId = await geocodeByPlaceId(event.value.place_id);

    // Await the result of getLatLng
    const { lat, lng } = await getLatLng(results[0]);
    form.longitude = lng;
    form.latitude = lat;
    form.address = results[0]?.formatted_address;
    query.value = results[0]?.formatted_address;
    console.log(form);
  } catch (error) {
    console.error('Error fetching geocode:', error);
  }
};
const types = ref([
        { name: 'Third Party', code: 'THIRDPARTY' },
        { name: 'Inhouse', code: 'INHOUSE' }
    ]);

const form = reactive({
    id: 0,
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
    activation: props.activation.id
});
const taskId = ref(null);
if(props.isEdit) {//edit
    taskId.value=props.viewedTask.id;
    query.value = props.viewedTask.address;
    status.value = props.statuses.find(stat => stat.code === props.viewedTask.status);
    form.status = form.status = props.statuses.find(stat => stat.code === props.viewedTask.status).code;

    type.value = types.value.find(stat => stat.code === props.viewedTask.type);
    form.type = form.type = types.value.find(stat => stat.code === props.viewedTask.type).code;
    Object.assign(form, {
    // status: props.viewedTask.status,
     startDate: props.viewedTask.startDate,
     plannedEndDate: props.viewedTask.plannedEndDate,
     timeRecord: props.viewedTask.timeRecord,
     completion: props.viewedTask.completion,
     name: props.viewedTask.name,
     longitude: props.viewedTask.longitude,
     latitude: props.viewedTask.latitude,
     address: props.viewedTask.address
    })
  }


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
   console.log(form);
    const isFormValid = await v$.value.$validate();
    console.log(v$.value);
    if (!isFormValid) {return;}
    if(!query.value){return;}
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
        formData.append('jobNumber', form.jobNumber);
        formData.append('completion', form.completion);
        formData.append('activation', form.activation);
        formData.append('address', form.address);
        formData.append('longitude', form.longitude);
        formData.append('latitude', form.latitude);

        const config = {
            useMultipartFormData: true // Add this flag to the request config
        };
    
    if(props.isEdit){
        
        taskStore.update(taskId.value,form, config).then(function (response) {
            toaster.success("Task updated successfully");
            emit('closeTaskModal');
        }).catch(function (error) {
            toaster.error("Error updating task");
            console.log(error);
        });
    } 
    else {
        taskStore.submit(formData,config).then(function (response) {
            showLoading.value = false;
            emit('closeTaskModal');
            v$.value.$errors = [];
            v$.value.$reset();
        toaster.success("Task created successfully");
    }).catch(function (error) {
        toaster.error("Error creating task");
        console.log(error);
    }).finally(() => {
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

const attemptFileChange = ref(false);
const removeFile = () => {
    attemptFileChange.value = true;
    briefFile.value = null;

}
const view_uploaded_file_visible = ref(false);
const base64PDF = ref(null);

const previewBase64PDF = () => {
    if(props.viewedTask?.path) {
        view_uploaded_file_visible.value = true;
        return
    }
    const reader = new FileReader();
    reader.readAsDataURL(briefFile.value);
    reader.onloadend = () => {
        base64PDF.value = reader.result;
        view_uploaded_file_visible.value = true;
    };
}



const isClientFormValid = () => {
  return showLoading.value == true;
};

</script>
<template>
    <form @submit.prevent="onSubmit" class="row ">

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
        

        <div class="col-md-12">
            <div class="card my-card flex justify-center">
                <label for="input1" class="form-label">Location</label>
                <AutoComplete v-model="query" :suggestions="formattedSuggestions" 
                optionLabel="name" @complete="filterCities" @item-select="onSelectLocation($event)" class="row mx-1" />
                   <div v-if="!query" class="text-danger">Location is required</div>
               
        </div>                        
        </div>

        <template v-if="form.type == 'THIRDPARTY' && !isEdit">
            <div class="col-md-12 mt-2">
                <label for="file-upload ml-2" class="form-label">Upload Brief File</label>
                <FileUploadGeneric 
                  :showFilePreview="true" 
                  docId="task-brief-file"
                  accept="application/pdf" 
                  fileType="pdf" 
                  @fileUploaded="onFileChange"
                  @fileDropped="onfileDropped"
                />
            </div>
        </template>
        <template v-if="form.type == 'THIRDPARTY' && attemptFileChange && isEdit">
            <div class="col-md-12 mt-2">
                <label for="file-upload ml-2" class="form-label">Update Brief File or <span class="text-primary cursor-pointer" @click="attemptFileChange = false">Cancel</span></label>
                <FileUploadGeneric 
                  docId="task-brief-file2"
                  :showFilePreview="true" 
                  accept="application/pdf" 
                  fileType="pdf" 
                  @fileUploaded="onFileChange"
                  @fileDropped="onfileDropped"
                />
            </div>
        </template>
        <template v-if="isEdit && viewedTask?.path && !attemptFileChange">
            <label>Uploaded Brief File</label>
            <div class="file-details mt-3 p-1 border rounded d-flex align-items-center">
                <div class="file-icon me-3">
                  <img @click="previewBase64PDF" 
                  src="/src/assets/images/pdf.png" 
                  alt="" class="img-fluid cursor-pointer" style=" width: 100px; height: 100px; border-radius: 6px;"/>
                </div>
               
                <div class="ms-auto">
                  <span class="cursor-pointer" @click="removeFile">
                      <i class='bx bx-trash fs-3 text-danger' ></i>
                  </span>
                </div>
              </div>

        </template>
        <div class="modal-footer" style="margin-top: 1rem">           
            <button :style="{ background: clientColorStyles?.background }" :disabled="isClientFormValid()"
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
    <Drawer v-model:visible="view_uploaded_file_visible" position="right" header="View Brief File" class="!w-full md:!w-80 lg:!w-[40rem]" style="width: 30rem!important;">
        <PDF :src="envPath + viewedTask?.path" />
    </Drawer>
</template>

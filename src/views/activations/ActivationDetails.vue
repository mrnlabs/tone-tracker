<script setup>
import Button from '@/components/buttons/Button.vue';
import Input from '@/components/form-components/Input.vue';
import InputLabel from '@/components/form-components/InputLabel.vue';
import Column from '@/components/general/Column.vue';
import { useTask } from '@/stores/task';
import { onMounted, reactive, ref } from 'vue';
import TaskModal from '../tasks/TaskModal.vue';
import Dialog from 'primevue/dialog';
import useToaster from '@/composables/useToaster';
import TaskComponentData from '../tasks/TaskComponentData.vue';
import FileUploadGeneric from '../upload/FileUploadGeneric.vue';
import ProgressSpinner from 'primevue/progressspinner';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import DatePicker from 'primevue/datepicker';
import InputError from '@/components/form-components/InputError.vue';
import AutoComplete from 'primevue/autocomplete';
import { useActivation } from '@/stores/activation';
import Drawer from 'primevue/drawer';
import PDF from 'pdf-vue3';

const envPath = import.meta.env.VITE_AWS_S3_BUCKET;
const showLoading = ref(false);
const showEditLoading = ref(false);
const selectedFile = ref(null);
const openModal = ref(false);
const isEdit = ref(false);
const taskStore = useTask();
const toaster = useToaster();
const activationStore = useActivation();

const props = defineProps({
    activation: Object,
    regions: Array
});

const allRegions = ref([...props.regions.map(reg => {
			return {
				name: reg.name,
				id: reg.id
			}
})]);

const clientColor = JSON.parse(localStorage.getItem('clientColor'));

		const clientColorStyles = {
			color: `#${clientColor?.color} !important`, //clientColor?.color,
			background: `#${clientColor?.color} !important`, //clientColor?.color
			borderColor: `#${clientColor?.color} !important`,
		}

const tasks = ref([]);
const statuses = ref([
    { name: 'Finished', code: 'FINISHED' },
    { name: 'Planned', code: 'PLANNED' },
    { name: 'On Track', code: 'ONTRACK' },
    { name: 'Delayed', code: 'DELAYED' },
    { name: 'At Risk', code: 'ATRISK' }
]);

const form = reactive({
    name: props.activation.name,
    campaignName: props.activation.campaignDTO.name,
    budget: props.activation.budget,
    startDate: props.activation.startDate,
    endDate: props.activation.endDate,
    painPoints: props.activation.painPoints,
    brief: props.activation.brief,
    targetGroup: props.activation.targetGroup,
    region: props.activation.region,
    campaign: props.activation.campaignDTO.id
});

const rules = {
    name: { required },
    budget: { required },
    startDate: { required },
    endDate: { required },
    targetGroup: { required },
    region: { required },
    painPoints: { required },
  };

const v$ = useVuelidate(rules, form);

onMounted(() => { 
    regionObj.value = allRegions.value.find(reg => reg.id == form.region)
    getTasks();
});


const getTasks = async () => {
    showLoading.value = true;
  taskStore.getTasksByActivationId(props.activation.id).then(response => {
    tasks.value = response.data;
    showLoading.value = false;
  }).catch(error => {
    showLoading.value = false;
    toaster.error("Error fetching tasks");
    console.log(error);
  }).finally(() => {
    //
  });
};

const closeTaskModal = () => {
    openModal.value = false;
    getTasks();
};

const viewedTask = ref(null);
const editTask = (task) => {
    viewedTask.value = task;
    openModal.value = true;
    isEdit.value = true;
};

const deleteTask = (task) => {
  taskStore.deleteTask(task.id).then(function (response) {
    toaster.success("Task deleted successfully");
    getTasks();
  }).catch(function (error) {
    toaster.error("Error deleting task");
    console.log(error);
  });
}

const doneAddingThirdPartySuppliers = () => {
    getTasks();
}

const onFileChange = (uploadedFile) => {  
  if (!uploadedFile.name.includes(".pdf")) {
    toaster.error("Please select a pdf file");
    return;
  }
    selectedFile.value = uploadedFile;
}

const onfileDropped = (dropedFile) => {
  if (!dropedFile[0].name.includes(".pdf")) {
    toaster.error("Please select a pdf file");
    return;
  }
      selectedFile.value = null;
      const files = dropedFile;
      if (!files) return
      const file = files[0];
      selectedFile.value = file;
};

const onActivationUpdate = async () => {
const isFormValid = await v$.value.$validate();
if (!isFormValid) {return}
showEditLoading.value = true;
const formData = new FormData();
formData.append('briefFile', selectedFile.value);
formData.append('type', "ACTIVATION");
formData.append('ActivationDTO', new Blob([JSON.stringify(form)], { type: 'application/json' }));

const config = {useMultipartFormData: true};

try {
    await activationStore.update(props.activation.id, formData, config);
    toaster.success("Activation updated successfully"); 
   
} catch (error) {
    toaster.error("Error updating activation");
    console.error(error);
 
} finally {
  showEditLoading.value = false;
}
};

const regionObj = ref(null);
const onRegionChange = (event) => {form.region = allRegions.value.find(reg => reg.name === event.value.name)?.id;}

const filteredRegions = ref([]);
const search = (event) => {filteredRegions.value = allRegions.value.filter(region => region.name.toLowerCase().includes(event.query.toLowerCase()))};

const showUpload = ref(true);
const showBriefPreview = ref(false);
const reUpload = () => {
    showUpload.value = false; 
  };
</script>
<template>
    <div class="card">
        <div class="card-body p-4">
            <h5 class="card-title ">Activation Details</h5>
            <hr>
             <div class="form-body mt-4">
              <div class="row">
                <div class="col-lg-4 animate__animated animate__slideInLeft">
                    <div class="border border-3 p-4 rounded">
                      <div class="row g-3">
                          <Column classes="col-lg-6">
                              <InputLabel labelText="Activation Nasssme" classes="form-label" htmlFor="name"/>
                              <Input v-model="form.name" type="text" classes="form-control" id="name" placeholder="" />
                              <InputError classes="input-errors" :errors="v$.name.$errors" message="Activation Name is required" />
                            </Column>
                            <Column classes="col-lg-6">
                            <InputLabel labelText="Region" classes="form-label" htmlFor="region"/>
                            <AutoComplete v-model="regionObj" optionLabel="name" dropdown :suggestions="filteredRegions" :style="{ borderColor: clientColorStyles?.borderColor }" 
                                    @item-select="onRegionChange($event)" @complete="search" field="region" placeholder="Select Region" />
                                <div class="input-errors" v-for="error of v$.region.$errors" :key="error.$uid">
                                <div class="text-danger">Please select region</div>
                            </div>
                            </Column>
  
                            <Column classes="col-lg-6">
                              <InputLabel labelText="Budget" classes="form-label" htmlFor="budget"/>
                              <Input v-model="form.budget" type="text" classes="form-control" id="budget" placeholder="" />
                              <InputError classes="input-errors" :errors="v$.budget.$errors" message="Budget is required" />
                            </Column>
                            <Column classes="col-lg-6">
                              <InputLabel labelText="Start Date" classes="form-label" htmlFor="startDate"/>
                              <DatePicker v-model="form.startDate" showButtonBar showIcon class="w-100" />
                                <InputError classes="input-errors" :errors="v$.startDate.$errors" message="Start date is required" />
                            </Column>
                            <Column classes="col-lg-6">
                              <InputLabel labelText="End Date" classes="form-label" htmlFor="endDate"/>
                              <DatePicker v-model="form.endDate" showButtonBar showIcon class="w-100" />
                                <InputError classes="input-errors" :errors="v$.endDate.$errors" message="End date is required" />
                            </Column>

                            <Column classes="col-lg-6">
                                <InputLabel labelText="Target Group" classes="form-label" htmlFor="targetGroup"/>
                                <Input v-model="form.targetGroup" type="text" classes="form-control" id="targetGroup" placeholder="" />
                                <InputError classes="input-errors" :errors="v$.targetGroup.$errors" message="Target group is required" />
                              </Column>
  
                            <Column classes="col-lg-6">
                              <InputLabel labelText="Pain Points" classes="form-label" htmlFor="painPoints"/>
                              <Input v-model="form.painPoints" type="text" classes="form-control" id="painPoints" placeholder="" />
                              <InputError classes="input-errors" :errors="v$.painPoints.$errors" message="Pain points is required" />
                            </Column>
  
                            <Column classes="col-lg-6">
                              <InputLabel labelText="Brief" classes="form-label" htmlFor="brief"/>
                              <Input v-model="form.brief" type="text" classes="form-control" id="brief" placeholder="" />
                            </Column>
                            <Column v-if="activation?.path && !showUpload" classes="col-lg-12  text-center mt-3">
                                    <InputLabel labelText="Update Brief File" classes="form-label" htmlFor="file-upload"/>
                                    <span @click="showUpload = !showUpload" class="mx-2 text-primary cursor-pointer text-decoration-underline">or Cancel</span>
                                    <FileUploadGeneric 
                                      docId="update-brief-file"
                                      :showFilePreview="true" 
                                      accept="application/pdf" 
                                      fileType="pdf" 
                                      @fileUploaded="onFileChange"
                                      @fileDropped="onfileDropped"
                                    />
                                  
                              </Column>
                              
                              <Column v-else classes="col-lg-12  text-center mt-3">
                                    <InputLabel labelText="Uploaded Brief File" classes="form-label" htmlFor="file-upload"/>
                                        <div class="file-details mt-3 p-1 border rounded d-flex align-items-center">
                                            <div class="file-icon me-3">
                                            <img @click="showBriefPreview = true" 
                                            src="/src/assets/images/pdf.png" 
                                            alt="" class="img-fluid cursor-pointer" style=" width: 100px; height: 100px; border-radius: 6px;"/>
                                            </div>
                                        
                                            <div class="ms-auto">
                                            <span class="cursor-pointer" @click="reUpload">
                                                <i class='bx bx-trash fs-1 text-danger' ></i>
                                            </span>
                                            </div>
                                        </div>
                                  
                              </Column>                          
  
                          <div class="col-12 ">
                              <div class="d-grid">
                                <ProgressSpinner v-if="showEditLoading" style="width: 30px; height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                                 <button v-if="!showEditLoading" @click="onActivationUpdate" type="button" class="btn maz-gradient-btn">Update</button>
                              </div>
                          </div>
                      </div> 
                  </div>
                  </div>
                 <div class="col-lg-8">
                 <div class="border border-3 p-4 rounded">
                    <Button @click="openModal = true" classes="float-end mb-2 w-20 btn maz-gradient-btn" type="button" 
                          :disabled="false" style="margin-top: -1rem;" :style="{ background: clientColorStyles?.background }">
                          <template #content>
                           Add Task
                          </template>
                        </Button>
                            <TaskComponentData 
                            :showLoading="showLoading"
                            :tasks="tasks" 
                            :statuses="statuses"
                            @editTask="editTask"
                            @delete="deleteTask"
                            @addtask="openModal = true"
                            @closeThirdPartyModal="doneAddingThirdPartySuppliers"
                            />  
                  </div>
                 </div>
                
             </div><!--end row-->
          </div>
        </div>
    </div>
    
    <Dialog v-model:visible="openModal" position="top" modal :header="isEdit ? 'Edit Task' : 'Add Task'" :style="{ width: '50rem', color: clientColorStyles?.color }">
       <TaskModal :activation="activation" :isEdit="isEdit" :viewedTask="viewedTask" :statuses="statuses" @closeTaskModal="closeTaskModal" />
    </Dialog>
    <Drawer
        v-model:visible="showBriefPreview"
        position="right"
        header="View Brief File"
        class="!w-full md:!w-80 lg:!w-[40rem]"
        style="width: 30rem !important"
      >
        <PDF :src="envPath + activation?.path" />
      </Drawer>
</template>
<script setup>
import { useActivation } from "@/stores/activation";
import { useRoute } from "vue-router";
import DatePicker from "primevue/datepicker";
import InputNumber from "primevue/inputnumber";
import { ref, reactive, watch, onMounted } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import useToaster from "@/composables/useToaster";
import { useRouter } from "vue-router";
import MultiSelect from "primevue/multiselect";
import FileUploadGeneric from "../upload/FileUploadGeneric.vue";
import InputError from "@/components/form-components/InputError.vue";
import Input from "@/components/form-components/Input.vue";
import InputLabel from "@/components/form-components/InputLabel.vue";
import Column from "@/components/general/Column.vue";
import Button from "@/components/buttons/Button.vue";
import ProgressSpinner from "primevue/progressspinner";
import BlockUI from "primevue/blockui";

const route = useRoute();
const emit = defineEmits(["activationCreated"]);
const activationId = ref(route.query.activation);

const loading = ref(false);
const fileError = ref(null);
const activation = useActivation();
const toaster = useToaster();
const selectedFile = ref(null);

const regions = ref([]);

const props = defineProps({
     campaignName: Object,
     campaignId: String,
     regions: Array
});
const campaignName = ref(props.campaignName.name);

onMounted(() => {  regions.value = props.regions });

const form = reactive({
  type: "ACTIVATION",
  name: "",
  budget: null,
  campaign: props.campaignId,
  regions: [],
  region22: "",
  startDate: "",
  endDate: "",
  brief: "",
  targetGroup: "",
  painPoints: "",
});

const rules = {
      name: { required },
      budget: { required },
      campaign: { required },
      region22: { required },
      startDate: { required },
      endDate: { required },
      targetGroup: { required },
      brief: { required },
      painPoints: { required },
    }; 


const v$ = useVuelidate(rules, form);

const onFileChange = (uploadedFile) => {  
    fileError.value = null;
  if (!uploadedFile.name.includes(".pdf")) {
    fileError.value = "Please select a pdf file";
    return;
  }
    console.log('event', uploadedFile);
    selectedFile.value = uploadedFile;
}

const onfileDropped = (dropedFile) => {
    fileError.value = null;
  if (!dropedFile[0].name.includes(".pdf")) {
    fileError.value = "Please select a pdf file";
    return;
  }
   
      selectedFile.value = null;
      const files = dropedFile;
      if (!files) return
      const file = files[0];
      selectedFile.value = file;
};

const onRegionChange = (e) => {
  form.region22 = e.value;
}

const onSubmit = async () => {
const isFormValid = await v$.value.$validate();
if (!isFormValid) {
 return
}
fileError.value = null;
if (!selectedFile.value) {
  fileError.value = "Please upload a brief file";
  return;
}

loading.value = true;
const REGIONIDs = form.region22.map((reg) => reg.id);
form.regions= REGIONIDs
const formData = new FormData();
formData.append('briefFile', selectedFile.value);
formData.append('type', "ACTIVATION");
formData.append('ActivationDTO', new Blob([JSON.stringify(form)], { type: 'application/json' }));

const config = {useMultipartFormData: true};
    try {
        await activation.submit(formData, config);
         loading.value = false;
         toaster.success("Activation created successfully");
         emit('activationCreated');
        } catch (error) {
         loading.value = false;
        } finally {
         loading.value = false;
        }

};

</script>
<template>
    <div class="row">
        <div class="col-lg-12">
          <div class="border border-3 p-4 rounded">
            <div class="row ">
              <Column classes="col-md-4 mb-3">
                <InputLabel labelText="Activation Name" classes="form-label" htmlFor="name"/>
                <Input v-model="form.name" type="text" classes="form-control" id="name" />
                <InputError classes="input-errors" :errors="v$.name.$errors" message="Activation Name is required" />
              </Column>

              <Column classes="col-md-4 mb-3">
                <InputLabel labelText="Budget" classes="form-label" htmlFor="name"/>
                <InputNumber v-model="form.budget" inputId="currency-us" mode="currency" currency="USD" locale="en-US" class="w-100"/>
                <InputError classes="input-errors" :errors="v$.budget.$errors" message="Budget is required" />
              </Column>

              <Column classes="col-md-4 mb-3">
                <InputLabel labelText="Campaign" classes="form-label" htmlFor="campaign"/>
                <BlockUI :blocked="true">
                    <Input v-model="campaignName" type="text" classes="form-control" id="campaign" />
                </BlockUI>
                
              </Column>

              <Column classes="col-md-4 mb-1">
                <InputLabel labelText="Start Date" classes="form-label" htmlFor="startDate"/>
                <DatePicker v-model="form.startDate" showButtonBar showIcon class="w-100" />
                <InputError classes="input-errors" :errors="v$.startDate.$errors" message="Start Date is required" />
              </Column>
              <Column classes="col-md-4 mb-1">
                <InputLabel labelText="End Date" classes="form-label" htmlFor="endDate"/>
                <DatePicker v-model="form.endDate" showButtonBar showIcon class="w-100"/>
                <InputError classes="input-errors" :errors="v$.endDate.$errors" message="End Date is required" />
              </Column>

              <Column classes="col-md-4 mb-1">
                <InputLabel labelText="Target Group" classes="form-label" htmlFor="targetGroup"/>
                <Input v-model="form.targetGroup" type="text" classes="form-control" id="targetGroup" />
                <InputError classes="input-errors" :errors="v$.targetGroup.$errors" message="Target Group is required" />
              </Column>

              <Column classes="col-md-12  mt-2">
                <InputLabel labelText="Region" classes="form-label" htmlFor="name"/>
                <div class="card flex justify-center">
                <MultiSelect v-model="form.region22" @change="onRegionChange" display="chip" :options="regions" optionLabel="name" filter placeholder="Select Regions"
                      :maxSelectedLabels="5" class="w-full md:w-80" />
                    </div>
                <InputError classes="input-errors" :errors="v$.region22.$errors" message="Region is required" />
              </Column>

              <Column classes="col-md-12 mb-1">
                <InputLabel labelText="Brief" classes="form-label" htmlFor="brief"/>
                <textarea v-model="form.brief" class="form-control" id="brief" rows="2"></textarea>
                <InputError classes="input-errors" :errors="v$.brief.$errors" message="Brief is required" />
              </Column>

              <Column classes="col-md-12 mb-1">
                <InputLabel labelText="Pain Points" classes="form-label" htmlFor="painPoints"/>
                <textarea v-model="form.painPoints" class="form-control" id="painPoints" rows="2"></textarea>
                <InputError classes="input-errors" :errors="v$.painPoints.$errors" message="Pain Points is required" />
              </Column>

              <Column classes="col-md-12 mb-0">
                <InputLabel labelText="Upload Brief File" classes="form-label text-center" htmlFor="briefFile"/>
                <FileUploadGeneric 
                docId="create-activation-file"
                :showFilePreview="true" 
                accept="application/pdf" 
                fileType="pdf" 
                @fileUploaded="onFileChange"
                @fileDropped="onfileDropped"
              />
              <div v-if="fileError" class="text-center text-danger">{{ fileError }}</div>
              </Column>
              
            <div class="d-grid">
                <Button v-if="!loading" @click="onSubmit" classes="w-100 btn maz-gradient-btn" type="button" :disabled="false">
                    <template #content>Submit</template>									  
                 </Button>
                 <div v-if="loading" colspan="9" class="text-center text-danger">
                    <ProgressSpinner style="width: 30px; height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                 </div>
            </div>
         
            </div>
          </div>
       
        </div>
      </div>
</template>

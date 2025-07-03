<script setup>
import { useActivation } from "@/stores/activation";
import { useRoute } from "vue-router";
import Layout from "@/views/shared/Layout.vue";
import DatePicker from "primevue/datepicker";
import BreadCrumb from "@/components/BreadCrumb.vue";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import { ref, reactive, watch, onMounted } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import useToaster from "@/composables/useToaster";
import { useRegion } from "@/stores/useRegion";
import { useRouter } from "vue-router";
import MultiSelect from "primevue/multiselect";
import FileUploadGeneric from "../upload/FileUploadGeneric.vue";

const route = useRoute();
const router = useRouter();
const campaignId = ref(route.query.campaign);
const campaignName = ref(route.query.name);
const activationManager = ref(route.query.manager);
const activationId = ref(route.query.activation);

const loading = ref(false);
const activation = useActivation();
const toaster = useToaster();
const selectedFile = ref(null);

const regionStore = useRegion();

const regions = ref([]);

onMounted(() => {
  
  getRegions();
  if (activationId.value) {
    //Its edit
    getActivationById();
  }
});

watch(
  () => route.params.id,
  (newId) => {
    activationId.value = newId;
  }
);

const getRegions = async () => {
  regionStore.getRegions().then(function (response) {
    regions.value = response.data.content;
    });
};

const form = reactive({
  type: "ACTIVATION",
  name: "",
  budget: null,
  campaign: campaignId.value,
  regions: [],
  region22: "",
  startDate: "",
  endDate: "",
  brief: "",
  targetGroup: "",
  painPoints: "",
});

const getActivationById = async () => {
  activation.getActivationById(activationId.value).then(function (response) {
    console.log(response.data);
    Object.assign(form, response.data);
    
    // form.regions = response.data.region;
    form.region22 = response.data.region;
  });
};

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
  
  if (!uploadedFile.name.includes(".pdf")) {
    toaster.error("Please select a pdf file");
    return;
  }
    console.log('event', uploadedFile);
    selectedFile.value = uploadedFile;
}

const onfileDropped = (dropedFile) => {
  if (!dropedFile[0].name.includes(".pdf")) {
    toaster.error("Please select a pdf file");
    return;
  }
   console.log('dropedFile', dropedFile);
      selectedFile.value = null

      // Get selected files
      const files = dropedFile;
      if (!files) return
      const file = files[0];
      selectedFile.value = file;
};

const regionsArray = ref([]);

const onRegionChange = (e) => {
  form.region22 = e.value;
}

const onSubmit = async () => {

const isFormValid = await v$.value.$validate();
if (!isFormValid) {
 return
}

if (!selectedFile.value && !activationId.value) {
  toaster.error("Please upload a brief file");
  return;
}

loading.value = true;

if(!activationId.value){
//   for (let i = 0; i < form.region22.length; i++) {
//     // if id already exist skip
//     if (form.regions.includes(form.region22[i].id)) {
//         continue;
//     }
//     form.regions.push(form.region22[i].id);
// }
}
const REGIONIDs = form.region22.map((reg) => reg.id);

form.regions= REGIONIDs
const formData = new FormData();
formData.append('briefFile', selectedFile.value);
formData.append('type', "ACTIVATION");
formData.append('ActivationDTO', new Blob([JSON.stringify(form)], { type: 'application/json' }));

const config = {
    useMultipartFormData: true // Add this flag to the request config
};

try {
  if (activationId.value) {
        await activation.update(activationId.value, form);
        toaster.success("Activation updated successfully");
    } else {
        await activation.submit(formData, config);
        loading.value = false;
        toaster.success("Activation created successfully");
    }
  setTimeout(() => {
    router.push({ path: '/admin-activations', query: { campaign: campaignId.value } });
  }, 2000);

} catch (error) {
  loading.value = false;
} finally {
  loading.value = false;
}

};

</script>
<template>
  <Layout>
    <div class="page-wrapper">
      <div class="page-content">
        <BreadCrumb
          :title="activationId ? 'Edit Activation' : 'Create Activation'"
          icon="bx bxs-user-badge"
        />
        <div class="d-flex">
          <h5 class="mx-2">Campaign: {{ campaignName }}</h5>
          <h5 v-if="activationManager" class="mx-2">
            Activation Manager:
            <span class="maz-gradient-txt">{{ activationManager }}</span>
          </h5>
        </div>
        <div class="mt-3 card w-80 m-auto">
          <div class="card-body">
            <div class="row">
              <div class="col-lg-12">
                <div class="border border-3 p-4 rounded">
                  <div class="row g-3">
                    <div class="col-md-4 mb-3">
                      <label for="name" class="form-label">Activation Name</label>
                      <input
                        v-model="form.name"
                        type="text"
                        class="form-control"
                        id="name"
                        style="height: 2.6rem !important"
                      />
                      <div
                        class="input-errors"
                        v-for="error of v$.name.$errors"
                        :key="error.$uid"
                      >
                        <div class="text-danger">
                          Activation Name is required
                        </div>
                      </div>
                    </div>
                    <div class="col-md-4 mb-3">
                      <label for="budget" class="form-label">Budget</label>
                      <InputNumber
                        v-model="form.budget"
                        inputId="currency-us"
                        mode="currency"
                        currency="USD"
                        locale="en-US"
                        class="w-100"
                      />
                      <div
                        class="input-errors"
                        v-for="error of v$.budget.$errors"
                        :key="error.$uid"
                      >
                        <div class="text-danger">Budget is required</div>
                      </div>
                    </div>
                    <div class="col-md-4 mb-3">
                      <label for="input1" class="form-label">Campaign</label>
                      <InputText
                        v-model="campaignName"
                        disabled="disabled"
                        class="form-control"
                        id="activation-area"
                      />
                    </div>
                    <div class="col-md-4 mb-3">
                      <label for="region" class="form-label">Region</label>
                      <div class="card flex justify-center">
                        <MultiSelect v-model="form.region22" @change="onRegionChange" display="chip" :options="regions" optionLabel="name" filter placeholder="Select Regions"
                            :maxSelectedLabels="5" class="w-full md:w-80" />
                    </div>
                      <div
                        class="input-errors"
                        v-for="error of v$.region22.$errors"
                        :key="error.$uid"
                      >
                        <div class="text-danger">Region is required</div>
                      </div>
                    </div>
                    <div class="col-md-4 mb-3">
                      <label for="input1" class="form-label">Start Date</label>
                      <DatePicker
                        v-model="form.startDate"
                        showButtonBar
                        showIcon
                        class="w-100"
                      />
                      <div
                        class="input-errors"
                        v-for="error of v$.startDate.$errors"
                        :key="error.$uid"
                      >
                        <div class="text-danger">Start Date is required</div>
                      </div>
                    </div>
                    <div class="col-md-4 mb-3">
                      <label for="input1" class="form-label">End Date</label>
                      <DatePicker
                        v-model="form.endDate"
                        showButtonBar
                        showIcon
                        class="w-100"
                      />
                      <div
                        class="input-errors"
                        v-for="error of v$.endDate.$errors"
                        :key="error.$uid"
                      >
                        <div class="text-danger">End Date is required</div>
                      </div>
                    </div>
                    <div class="col-md-4 mb-3">
                      <label for="targetGroup" class="form-label">Target Group</label>
                      <input
                        v-model="form.targetGroup"
                        type="text"
                        class="form-control"
                        id="targetGroup"
                      />
                      <div
                        class="input-errors"
                        v-for="error of v$.targetGroup.$errors"
                        :key="error.$uid"
                      >
                        <div class="text-danger">Target Group is required</div>
                      </div>
                    </div>
                    <div class="col-md-12 mb-3">
                      <label for="brief" class="form-label">Brief</label>
                      <textarea
                        v-model="form.brief"
                        class="form-control"
                        id="brief"
                        rows="4"
                      ></textarea>
                      <div
                        class="input-errors"
                        v-for="error of v$.brief.$errors"
                        :key="error.$uid"
                      >
                        <div class="text-danger">Brief is required</div>
                      </div>
                    </div>
                    <div class="col-md-12 mb-3">
                      <label for="campaign" class="form-label">Pain Points</label>
                      <textarea
                        v-model="form.painPoints"
                        class="form-control"
                        id="painPoints"
                        rows="4"
                      ></textarea>
                      <div
                        class="input-errors"
                        v-for="error of v$.painPoints.$errors"
                        :key="error.$uid"
                      >
                        <div class="text-danger">Pain Points are required</div>
                      </div>
                    </div>
                    <div class="col-md-12 mb-3 w-50 m-auto">
                      <label for="file-upload" class="form-label">Upload Brief File</label>
                      <FileUploadGeneric 
                      docId="create-act-file"
                      :showFilePreview="true" 
                        accept="application/pdf" 
                        fileType="pdf" 
                        @fileUploaded="onFileChange"
                        @fileDropped="onfileDropped"
                      />
                    </div>
                    <div class="col-12 mt-4">
                  <div class="d-grid">
                    <button
                      @click="onSubmit"
                      :disabled="loading"
                      class="btn maz-gradient-btn d-flex justify-content-center align-items-center"
                      type="button"
                    >
                      <div
                        v-if="loading"
                        class="spinner-border text-white me-2"
                        role="status"
                      >
                        <span class="visually-hidden">Loading...</span>
                      </div>
                      {{ activationId ? "Update" : "Submit" }}
                    </button>
                  </div>
                </div>
                  </div>
                </div>
             
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<style scoped>
.form-label {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.form-control,
.p-inputnumber,
.p-datepicker {
  width: 100%;
}

.upload-box {
  border: 2px dashed #ccc;
  border-radius: 5px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.upload-icon {
  font-size: 2em;
  margin-bottom: 10px;
}

.upload-text {
  font-size: 1em;
  color: #555;
}

.input-errors {
  margin-top: 0.25rem;
}

.maz-gradient-btn {
  margin-top: 1rem;
}
.w-80 {
  width: 90% !important;
}

.p-multiselect {
  background: #12181a !important;
  height: 2.6rem !important;
}
</style>
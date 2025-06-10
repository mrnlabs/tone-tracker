<script setup>
import Layout from "@/views/shared/Layout.vue";
import BreadCrumb from "@/components/BreadCrumb.vue";
import { onMounted, reactive, ref, watch } from "vue";
import { useBrief } from "@/stores/brief";
import { useRoute } from "vue-router";
import Drawer from "primevue/drawer";
import { useActivation } from "@/stores/activation";
import { useClipboard, useShare } from "@vueuse/core";
import PDF from "pdf-vue3";
import Dialog from "primevue/dialog";
import Select from "primevue/select";
import FileUploadGeneric from "../upload/FileUploadGeneric.vue";
import useToaster from "@/composables/useToaster";
import { required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { useAuth } from "@/stores/auth";
import { truncateText } from "@/helpers/helpers";

const route = useRoute();
const briefStore = useBrief();
const auth = useAuth();

const user = JSON.parse(auth.user);
const activationStore = useActivation();
const toaster = useToaster();

let briefs = ref([]);
const allActivations = ref([]);
let brief = ref({});
let searchInput = ref('');
const envPath = import.meta.env.VITE_AWS_S3_BUCKET;

const briefId = ref(route.query.brief?.id || null);
const showAddModal = ref(false);

watch(
  () => route.query.brief?.id,
  (newId) => {
    briefId.value = newId;
    if (briefId.value) {
      getBriefById();
    }
  }
);

onMounted(() => {
  getBriefs(user.role, user.activeUserId);
  if (briefId.value) {
    getBriefById();
  }
  fetchAllActivations();
});

const fetchAllActivations = async () => {
  activationStore.getAllActivationsForTemporal().then((res) => {
    allActivations.value = res.data;
  }).catch((error) => {
    console.log(error);
  })
}
const getBriefs = async (role, id) => {
  try {
    const response = await briefStore.getBriefs(role,id);
    briefs.value = response.data;
  } catch (error) {
    console.error("Error fetching briefs:", error);
  }
};
const onInput = () => {
  if (searchInput.value) {
    const searchTerm = searchInput.value.toLowerCase();

    briefs.value = briefs.value.filter((brief) => {
      // Extract and normalize the data to be searchable
      const entityName = brief.entityName?.toLowerCase() || '';
      // Filter based on searchTerm
      return (
        entityName.includes(searchTerm)
      );
    });
  } else {
    getBriefs(); // Reset the list to the full set of briefs when the search input is cleared
  }
};


const getBriefById = async () => {
  try {
    const response = await briefStore.getBriefById(briefId.value);
    brief.value = response.data;
  } catch (error) {
    console.error("Error fetching brief by ID:", error);
  }
};
const visible = ref(false);
const docName = ref(false);
const filePath = ref(null);

const downloadDocument = (brief) => {
  filePath.value = import.meta.env.VITE_AWS_S3_BUCKET + brief.path;
  visible.value = true;
  docName.value = brief.activationName;
};

const download = () => {
  try {
    const link = document.createElement("a");
    link.href = filePath.value;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading document:", error);
  }
};

const briefFile = ref(null);
const loading = ref(false);
const source = ref('Hello')
const { text, copy, copied, isSupported } = useClipboard({ source });

const form = reactive({
  selectedActivation: '',
  entity: "Activation",
  entityId: null,
});


const rules = { selectedActivation: { required }};
const v$ = useVuelidate(rules, form);


const onActivationChange = (e) => {
  form.selectedActivation = e.value;
  form.entityId = e.value?.id;
}

const onFileChange = (uploadedFile) => {
    if(!uploadedFile.name.includes(".pdf")){
        toaster.error("Please upload a pdf file");
        return;
    }
    briefFile.value = uploadedFile;
}

const onfileDropped = (dropedFile) => {
   console.log('dropedFile', dropedFile);
      briefFile.value = null

      // Get selected files
      const files = dropedFile;
      if (!files) return
      const file = files[0];
      briefFile.value = file;
};


const config = {
    useMultipartFormData: true // Add this flag to the request config
};
const submitBriefFile = async () => {
  const isFormValid = await v$.value.$validate();
	if (!isFormValid) {
		return;
	}
  if(!briefFile.value) {toaster.error("Please upload a brief file");return}
  const formData = new FormData();
  loading.value = true;
  formData.append('briefFile', briefFile.value);
  formData.append('entity', form.entity);
  formData.append('entityId', form.entityId);
  formData.append('entityName', 'Activation');
  // formData.append('activation', JSON.stringify(form.selectedActivation.id));
  // console.log('Formdata',form);return;
  briefStore.submit(formData, config).then(() => {
    getBriefs();
    showAddModal.value = false;
    loading.value = false;
    toaster.success("Brief uploaded successfully");
  }).catch((error) => {
    console.log(error);
  }).finally(() => {
    loading.value = false;
  })

}
</script>
<template>
  <Layout>
    <div class="page-wrapper">
      <div class="page-content">
        <BreadCrumb title="Briefs" icon="bx bx-file" />
        <p>View briefs</p>

        <div class="card">
          <div class="card-body">
            <div>
              <div class="mb-4 d-lg-flex align-items-center mb-4 gap-3">
                <!-- <button type="button" @click="showAddModal=true" class="btn rounded-0 btn-primary">+ New</button> -->

                <div class="position-relative">
                  <input
                    v-model="searchInput"
                    @input="onInput"
                    type="text"
                    class="form-control ps-5"
                    placeholder="Search"
                  />
                  <span
                    class="position-absolute top-50 product-show translate-middle-y"
                  >
                    <i class="bx bx-search"></i>
                  </span>
                </div>
              </div>
            </div>
            <div class="row">
              <div
                v-if="briefs?.length > 0"
                v-for="(briefItem, index) in briefs" 
                :key="briefItem.id"
                class="col-md-4 col-lg-3 mb-4"
              >
                <div class="brief-card">
                  <h5 v-tooltip.top="briefItem.entityName" class="py-1 px-4 mb-0 text-center bg-black">
                    {{  truncateText(briefItem.entityName, 20) }}
                    <!-- <span v-if="briefItem.entityName?.length > 20"  style="font-size: 12px;">See more</span> -->
                  </h5>
                  

                  <div class="text-center">
                    <img
                      src="https://www.iconpacks.net/icons/1/free-document-icon-901-thumb.png"
                      class="bg-white"
                    />
                  </div>
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <button
                      class="btn bg-black text-white w-100 rounded-0 btn-outline-light maz-gradient-btn"
                      @click="downloadDocument(briefItem)"
                    >
                      Read
                    </button>
                    <button
                      @click="copy(envPath + briefItem?.path)"
                      type="button"
                      class="btn text-white w-100 rounded-0 border border-primary bg-primary btn-outline-light maz-gradient-btn"
                    >
                      {{ copied ? 'Copied!' : 'Share' }}
                    </button>
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
        v-model:visible="visible"
        position="right"
        :header="docName"
        class="!w-full md:!w-80 lg:!w-[40rem]"
        style="width: 30rem !important"
      >
        <PDF :src="filePath" />
        <a
          @click="download"
          href="javascript:;"
          class="w-80 btn d-flex justify-content-center align-items-center maz-gradient-btn radius-30 mt-lg-0"
        >
     
          <i class="bx bxs-download"></i>
          Download
        </a>
      </Drawer>
    </div>


    <Dialog v-model:visible="showAddModal" position="top" modal header="Upload Brief File" :style="{ width: '30rem' }">
             
      <div class="card flex justify-center">
        <Select v-model="form.selectedActivation" :options="allActivations" @change="onActivationChange" filter optionLabel="name" placeholder="Select Activation" class="w-full md:w-56">
            
        </Select>
        
        <div class="input-errors" v-for="error of v$.selectedActivation.$errors" :key="error.$uid">
          <div class="text-danger">Activation is required</div>
      </div>
      <FileUploadGeneric 
      docId="Brief-file"
        :showFilePreview="true" 
        accept="application/pdf" 
        fileType="pdf" 
        @fileUploaded="onFileChange"
        @fileDropped="onfileDropped"
          />
    </div>
    <div class="ms-auto">
      <button @click="submitBriefFile" type="button" class="w-100 btn d-flex justify-content-center align-items-center maz-gradient-btn radius-30 mt-lg-0">
          <div v-if="loading" class="spinner-border text-white " role="status"> <span class="visually-hidden">Loading...</span>
          </div>
          <i v-if="!loading" class="bx bxs-plus-square"></i>
          {{ loading ?  '' : 'Upload' }}
      </button>
  </div>

   </Dialog>
  </Layout>
</template>

<style scoped>
.bg-white {
  background-color: #dedede;
}

.bg-black {
  background-color: black !important;
}

.brief-card {
  margin-bottom: 1rem;
}

.brief-card img {
  width: 100%;
  height: auto;
}

.new-badge {
  background-color: orange;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 0.3rem;
  font-size: 0.8rem;
}

.btn-save {
  background-color: #007bff;
  border: none;
}

.btn-save:hover {
  background-color: #0056b3;
}

.custom-checkbox input[type="checkbox"] {
  margin-right: 0.5rem;
}

.doc-icon {
  font-size: 5rem;
}
</style>
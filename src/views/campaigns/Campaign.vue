<script setup>
import { onMounted, ref,watch, reactive } from 'vue';
import FileUpload from 'primevue/fileupload';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Layout from '@/views/shared/Layout.vue';
import BreadCrumb from '@/components/BreadCrumb.vue';
import useToaster from '@/composables/useToaster';
import { useCampaignStore } from '@/stores/useCampaign';
import { useClientStore } from '@/stores/useClient';
import { useConfirm } from "primevue/useconfirm";
import { useRoute } from 'vue-router';
import FileUploadGeneric from '../upload/FileUploadGeneric.vue';
import Avatar from 'primevue/avatar';
import ProgressSpinner from 'primevue/progressspinner';
import InputLabel from '@/components/form-components/InputLabel.vue';
import Input from '@/components/form-components/Input.vue';
import InputError from '@/components/form-components/InputError.vue';
import Column from '@/components/general/Column.vue';

const route = useRoute();
const clientId = ref(route.query.client);

watch(
  () => route.query.client,
  (newClientId) => {
    clientId.value = newClientId;
  }
);


const toaster = useToaster();
const campaignStore = useCampaignStore();
const clientStore = useClientStore();
const confirm = useConfirm();
const selectedFile = ref(null);

let searchInput = ref('');
let clients = ref([]);
const showFilePreview = ref(true);
const clientName = ref('');
let campaigns = ref([...campaignStore.allCampaigns]);
const img = ref(null);
const loading = ref(false);
const isFecthing = ref(false);
const envPath = import.meta.env.VITE_AWS_S3_BUCKET;

const form = reactive({
	name: "",
	client: clientId.value
});

onMounted(() => {
//   getClientName();
  getCampaignsByClientId();
});



//get client color from local storage
const clientColor = JSON.parse(localStorage.getItem('clientColor'));

const clientColorStyles = {
    color: `#${clientColor?.color} !important`, //clientColor?.color,
    background: `#${clientColor?.color} !important`, //clientColor?.color
    borderColor: `#${clientColor?.color} !important`,
}


const rules = { 
	name: { required },
	client: { required }
};
const v$ = useVuelidate(rules, form);

const onFileChange = (uploadedFile) => {
    console.log('event', uploadedFile);
    selectedFile.value = uploadedFile;
}

const onfileDropped = (dropedFile) => {
   console.log('dropedFile', dropedFile);
      selectedFile.value = null

      // Get selected files
      const files = dropedFile;
      if (!files) return
      const file = files[0];
      selectedFile.value = file;
};

const createCampaign = async () => {
	const isFormValid = await v$.value.$validate();
	if (!isFormValid) {
		return;
	}

    loading.value = true;
   
    const formData = new FormData();
    formData.append('campaignImage', selectedFile.value);
    formData.append('name', form.name);
    formData.append('client', form.client);

    const config = {
      useMultipartFormData: true // Add this flag to the request config
    };


    campaignStore.submitCampaign(formData, config).then(function (response) {
        form.name = '';
        v$.value.$errors = [];
        v$.value.$reset();
        img.value = null;
        showFilePreview.value = false
        toaster.success("Campaign created successfully");
        getCampaignsByClientId();
        loading.value = false;
    }).catch(function (error) {
        loading.value = false;
        toaster.error("Error creating campaign");
        console.log(error);
    });
};

const getCampaignsByClientId = async () => {
    isFecthing.value = true;
    campaignStore.getCampaignsByClientId(clientId.value).then(function (response) {
        isFecthing.value = false;
        campaignStore.setCampaigns(response.data);
        campaigns.value = campaignStore.allCampaigns;
    }).catch(function (error) {
        isFecthing.value = false;
        toaster.error("Error fetching campaigns");
        console.log(error);
    }).finally(function () {
        isFecthing.value = false;
    });
};


const getClientName = async () => {
    clientStore.getClientByClientId(clientId.value).then(function (response) {
        clientName.value = response.data.name;
    }).catch(function (error) {
        console.log(error);
    }).finally(function () {
        
    });
};

const deleteCampaign = (campaign) => {
        campaignStore.deleteCampaign(campaign.id).then(function (response) {
            toaster.success("Campaign deleted successfully");
            getCampaignsByClientId();
        }).catch(function (error) {
            toaster.error("Error deleting campaign");
            console.log(error);
        });
  
};

const editClient = (client) => {
    clients.value.forEach(c => c.isEditing = false);
    client.isEditing = true;
};



const updateCampaign = (client) => {
    client.isEditing = false;
    campaignStore.updateCampaign(client).then(response => {
        toaster.success("Campaign updated successfully");
        getClientName();
    }).catch(error => {
        toaster.error("Error updating client");
        console.log(error);
    });
};

const fileName = ref('');
const fileSize = ref('');

const deleteRecord = (event, campaign) => {
    confirm.require({
        target: event.currentTarget,
        message: 'Do you wish to delete this campaign?',
        // icon: 'bx bx-trash text-danger',
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
			deleteCampaign(campaign);
        },
        reject: () => {
            //do nothing
        }
    });
};

const vFocus = {
    mounted: (el) => el.focus()
};

const onInput = () => {
    if (searchInput.value && searchInput.value.length >= 3) {
    const searchTerm = searchInput.value.toLowerCase();
    campaigns.value = campaigns.value.filter(campaign => campaign.name?.toLowerCase()?.includes(searchTerm));
    console.log('campaigns',campaigns.value)
    //    campaignStore.getCampaignsByClientId(clientId.value, searchTerm).then(function (response) {
    //     campaignStore.setCampaigns(response.data);
    //     campaigns.value = campaignStore.allCampaigns;
    // })
  } else {
    campaigns.value = [...campaignStore.allCampaigns];
  }
};
</script>

<template>
    <Layout>
        <div class="page-wrapper">
            <div class="page-content">
                <BreadCrumb title="Campaigns" icon="" :style="{ color: clientColorStyles?.color }" />
                <div class="card">
             <div class="mb-4 d-lg-flex align-items-center mb-4 gap-3">
              

                <div class="position-relative">
                  <input
                    :style="{ borderColor: clientColorStyles?.borderColor }"
                    v-model="searchInput"
                    @input="onInput"
                    type="search"
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
                    <div class="card-body">
                        <div class="row">
                            <div class="col-8 col-lg-8 col-xl-8 d-flex ">
                                <div class=" radius-10 w-100">
                                    <div class="card-body border border-3  rounded">
                                        <div class="table-responsive">
                                            <table class="table mb-0">
                                                <thead class="table-light">
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Campaign Name</th>
                                                        <th>Client Name</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr v-if="campaigns?.length > 0" v-for="(campaign, index) in campaigns" :key="campaign.id">
                                                        <td>
                                                            <Avatar v-if="campaign.path" :image="envPath + campaign.path" 
                                                            :style="{ background: clientColorStyles?.background }" 
                                                             class="mr-2"  shape="circle" 
                                                             />
                                                            <Avatar v-else :label="campaign.name[0]?.toUpperCase()" class="mr-2" 
                                                            :style="{ background: clientColorStyles?.background }" 
                                                             shape="circle" />
                                                        </td>
                                                        <td v-if="!campaign.isEditing" class="pt-4">{{ campaign.name }}</td>
                                                        <td v-else class="pt-4">
                                                            <input v-focus type="text" v-model="campaign.name" @blur="updateCampaign(campaign)" @keyup.enter="updateCampaign(campaign)" class="no-border-input form-control"/>
                                                        </td>
                                                        <td class="pt-4">{{ clientName }}</td>
                                                        <td class="pt-3">
                                                            <div class="d-flex order-actions">
                                                                <a v-if="!campaign.isEditing" @click="editClient(campaign)" href="javascript:;">
                                                                    <i class='bx bxs-edit ' v-tooltip.bottom="'Edit'"></i>
                                                                </a>
                                                                <a v-else @click="updateCampaign(campaign)" href="javascript:;" class="ms-3">
                                                                    <i class='bx bx-check ' 
                                                                    v-tooltip.bottom="'Edit'" ></i>
                                                                </a>
                                                                <router-link :to="`/admin-activations?campaign=${campaign.id}`" 
                                                                v-tooltip.bottom="'View Activations'" class="ms-3">
                                                                    <i class='bx bx-show '></i>
                                                                </router-link>
                                                                <a @click="deleteRecord($event,campaign)" href="javascript:;" class="ms-3">
                                                                    <i class='bx bxs-trash text-danger' v-tooltip.bottom="'Delete'"></i>
                                                                </a>
                                                                <ConfirmPopup></ConfirmPopup>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr v-else>
                                                        <td v-if="isFecthing" colspan="9" class="text-center text-danger">
                                                            <ProgressSpinner style="width: 30px; height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                                                           </td>
                                                          <td v-else colspan="9" class="text-center text-danger">
                                                            No campaigns found.
                                                          </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-4 col-lg-4 col-xl-4 d-flex ">
                                <div class="card w-100 radius-10">
                                    <div class="card-body ">

                                                <div class="row border border-3 p-4 rounded">
                                                    <Column classes="col-md-12">
                                                        <InputLabel labelText="Campaign Name" classes="form-label" htmlFor="name"/>
                                                        <Input v-model="form.name" type="text" classes="form-control" id="name" :style="{ borderColor: clientColorStyles?.borderColor }" />
                                                        <InputError classes="input-errors" :errors="v$.name.$errors" message="Campaign name is required" />
                                                      </Column>
                                                    <div class="col-md-12">
                                                            <FileUploadGeneric 
                                                            docId="campaign-file"
                                                            :showFilePreview="showFilePreview" 
                                                            accept="image/*" 
                                                            fileType="image" 
                                                            @fileUploaded="onFileChange"
                                                             @fileDropped="onfileDropped"
                                                            />
                                                            <p v-if="fileName" class="text-center text-success">{{ fileName }}({{ fileSize }}Kb)</p>
                                                        </div>
                                                  
                                                    <div class="ms-auto">
                                                        <button :style="{ background: clientColorStyles?.background }" @click="createCampaign" type="button" class="w-100 btn d-flex justify-content-center align-items-center maz-gradient-btn radius-30 mt-lg-0">
                                                            <div v-if="loading" class="spinner-border text-white " role="status"> <span class="visually-hidden">Loading...</span>
                                                            </div>
                                                            {{ loading ?  '' : 'Create Campaign' }}
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
.mt-4 {
    margin-top: 1rem;
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
.fuck{
    background: red !important;
}
</style>

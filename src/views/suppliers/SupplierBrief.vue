<script setup>
import Layout from '@/views/shared/Layout.vue';
import BreadCrumb from '@/components/BreadCrumb.vue';
import { onMounted, ref, watch } from 'vue';
import { useBrief } from '@/stores/brief';
import { useRoute } from 'vue-router';
import Drawer from 'primevue/drawer';
import PDF from 'pdf-vue3';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Button from 'primevue/button';
import Tab from 'primevue/tab';
import { useAuth } from '@/stores/auth';

const route = useRoute();
const briefStore = useBrief();
const authStore = useAuth();

const user = JSON.parse(authStore.user);

let briefs = ref([]);
let brief = ref({});
const briefId = ref(route.query.brief?.id || null);

watch(() => route.query.brief?.id, (newId) => {
    briefId.value = newId;
    if (briefId.value) {
        getBriefById();
    }
});

onMounted(() => {
//     if(user.role == 'TTG_SUPER_ADMIN' || user.role == 'TTG_HEAD_ADMIN'){	
//         getBriefs();
// } else if(user.role == 'TTG_ACTIVATION_MANAGER'){
//     getBriefs(user.role, user.activeUserId);
// } else if('TTG_REGIONAL_MANAGER'){
//     getAllActivations(user.role, regionId.value);
// }
    getBriefs();
    if (briefId.value) {
        getBriefById();
    }
});

const getBriefs = async () => {
    try {
        const response = await briefStore.getBriefs();
        briefs.value = response.data;

		console.log('Fetched briefs:', response.data);
    } catch (error) {
        console.error('Error fetching briefs:', error);
    }
};

const getBriefById = async () => {
    try {
        const response = await briefStore.getBriefById(briefId.value);
        brief.value = response.data;	
    } catch (error) {
        console.error('Error fetching brief by ID:', error);
    }
};
const visible = ref(false);
const docName = ref(false);
const filePath = ref(null);

const viewDocument = (brief) => {
    visible.value = true;
    filePath.value = import.meta.env.VITE_AWS_S3_BUCKET + brief.path;
    docName.value = brief.activationName;
};

const download = () => {
     try {
        const link = document.createElement('a');
        link.href = filePath.value;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error downloading document:', error);
    }
};

const downloadNow = (brief) => {
    filePath.value = import.meta.env.VITE_AWS_S3_BUCKET + brief.path;
    try {
        const link = document.createElement('a');
        link.href = filePath.value;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error downloading document:', error);
    }
}

const value = ref('0');
</script>
<template>
    <Layout>
        <div class="page-wrapper">
            <div class="page-content">
                <BreadCrumb title="Briefs" icon="" />
                <p>View briefs</p>

                <div class="card">
                    <div class="card-body">
                        <div class="card">
                            <div class="d-flex justify-content-end mb-2 gap-2">
                                <Button @click="value = '0'" rounded label="1" class="w-8 h-8 p-0" style="width: 32px; height: 32px;" :outlined="value !== '0'" />
                                <Button @click="value = '1'" rounded label="2" class="w-8 h-8 p-0" style="width: 32px; height: 32px;" :outlined="value !== '1'" />
                            </div>
                    
                            <Tabs v-model:value="value">
                                <TabList>
                                    <Tab  value="0">Bids</Tab>
                                    <Tab value="1">Awarded</Tab>
                                </TabList>
                                <TabPanels>
                                    <TabPanel value="0">
                                        <div class="row">
                                            <div v-if="briefs.length > 0" v-for="(briefItem, index) in briefs" :key="briefItem.id" class="col-md-3 col-lg-3 mb-4">
                                                <div class="brief-card">
                                                    <h5 class="py-1 px-4 mb-0 text-center bg-black">{{ briefItem.activationName }}</h5>
                                                    <div class="text-center">
                                                        <img src="https://www.iconpacks.net/icons/1/free-document-icon-901-thumb.png" class="bg-white" />
                                                    </div>
                                                    <div class="d-flex justify-content-between align-items-center">
                                                        <button class="btn bg-black text-white w-100 rounded-0 btn-outline-light" @click="viewDocument(briefItem)">View</button>
                                                        <button @click="downloadNow(briefItem)" type="button" class="btn text-white w-100 rounded-0 border border-primary bg-primary btn-outline-light">Download</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabPanel>
                                    <TabPanel value="1">
                                        <div class="row">
                                            <div v-if="briefs.length > 0" v-for="(briefItem, index) in briefs" :key="briefItem.id" class="col-md-3 col-lg-3 mb-4">
                                                <div class="brief-card">
                                                    <h5 class="py-1 px-4 mb-0 text-center bg-black">{{ briefItem.activationName }}</h5>
                                                    <div class="text-center">
                                                        <img src="https://www.iconpacks.net/icons/1/free-document-icon-901-thumb.png" class="bg-white" />
                                                    </div>
                                                    <div class="d-flex justify-content-between align-items-center">
                                                        <button class="btn bg-black text-white w-100 rounded-0 btn-outline-light" @click="viewDocument(briefItem)">View</button>
                                                        <button @click="downloadNow(briefItem)" type="button" class="btn text-white w-100 rounded-0 border border-primary bg-primary btn-outline-light">Download</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </div>
                        
                    </div>
                </div>

            </div>
        </div>
        <div class="card flex justify-center">
            <Drawer v-model:visible="visible" position="right" :header="docName" class="!w-full md:!w-80 lg:!w-[40rem]" style="width: 30rem!important;">
                <PDF :src="filePath" />
                <a @click="download" href="javascript:;" class="w-80 btn d-flex justify-content-center align-items-center maz-gradient-btn radius-30 mt-lg-0">
                    
                   <i class='bx bxs-download'></i>
                   Download
               </a>
            </Drawer>
        </div>
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
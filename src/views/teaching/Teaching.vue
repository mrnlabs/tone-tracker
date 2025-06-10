<script setup>
import Layout from '@/views/shared/Layout.vue';
import BreadCrumb from '@/components/BreadCrumb.vue';
import { onMounted, ref, watch } from "vue";
import { useActivation } from '@/stores/activation';
import { useAuth } from '@/stores/auth';
import useToaster from '@/composables/useToaster';
import { useRouter } from 'vue-router';


const activations = ref([]);
const authStore = useAuth();
const activationStore = useActivation();
const user = JSON.parse(authStore.user);
const toaster = useToaster();
let showLoading = ref(false);
const router = useRouter();

onMounted(() => {


    if(user.role == 'TTG_SUPER_ADMIN' || user.role == 'TTG_HEAD_ADMIN' || user.role == 'CLIENT'){
        getAllActivations(user.role, campaignId.value);
    } else if(user.role == 'TTG_ACTIVATION_MANAGER' || user.role == 'TTG_TALENT' || user.role == 'SUPPLIER'){
        getAllActivations(user.role, user.activeUserId);
    } else if('TTG_REGIONAL_MANAGER'){
        getAllActivations(user.role, regionId.value);
    }



});

const navigateToReadPage = (activationId) => {
  router.push({ name: 'ReadActivation', params: { id: activationId } });
};

const getAllActivations = async (userRole, id) => {
    
    try {
        showLoading.value = true;
        
        if (!user || !user.activeUserId && user.role && user.role != "CLIENT") {
            throw new Error('User data or activeUserId not found');
        }

        // Fetch activations
        const response = await activationStore.getAllActivations(userRole, id);
        if(response.data.content){
        activations.value = response.data.content;
        }else{
          activations.value = response.data;  
        }
		
            } catch (error) {
                console.error('Error fetching activations:', error);
                
                toaster.error("Error fetching activations");
            } finally {
                showLoading.value = false;
            }
};

</script>
<template>
    <Layout>
        <div class="page-wrapper">
            <div class="page-content">
                <BreadCrumb title="Teaching and Learning" icon="" />
                <p>Procedures when running an activation</p>
                <div>
                    <p>Duties for promoters</p>
                </div>


                <div class="card">
                    <div class="card-body">
                            <div>
                            </div>
                            <div class="row">
                                <div v-for="activation in activations" :key="activation.id" class="col-md-3 col-lg-2">
                                    <div class="brief-card mb-4">
                                        <h5 class="py-1 px-4 mb-0 text-center bg-black">{{ activation.name }}</h5>
                                        <img src="https://www.iconpacks.net/icons/1/free-document-icon-901-thumb.png" class="bg-white">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <button
                                                @click="navigateToReadPage(activation.id)"
                                                class="btn bg-black text-white w-100 rounded-0 btn-outline-light"
                                            >
                                                Read <span class="round-guest online"></span>
                                            </button>
                                            <button
                                                class="btn text-white w-100 rounded-0 border border-primary bg-primary btn-outline-light">Share<i class='bx bxs-share-alt'></i> 
                                            </button>
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
bg-white {
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
</style>
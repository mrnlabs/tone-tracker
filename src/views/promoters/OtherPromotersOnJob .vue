<script setup>
import Image from 'primevue/image';
import ProgressSpinner from 'primevue/progressspinner';
import { ref } from 'vue';

const props = defineProps({
    otherPromotersList: Array,
    showLoading: Boolean,
    userIdParam: String,
    promoterId: String
});

const otherPromotersList = ref(props.otherPromotersList);
const envPath= import.meta.env.VITE_AWS_S3_BUCKET;

const isNotSelf = (user) => {
        return (user.id != props.userIdParam && user.userDetails.id != props.promoterId);
    }


</script>
<template>

        <div class="row mt-2  row-cols-xl-9 ">
            <div  class="d-flex"> 
                <div v-if="otherPromotersList?.length > 0" v-for="promoter in otherPromotersList" :key="promoter.id">
                    <div v-if="isNotSelf(promoter)" class="col-img">
                        <div class="gallery">
                            <div class="card flex justify-center">
                                <Image :src="promoter?.userDetails?.path ? envPath + promoter?.userDetails?.path 
                                : 'https://tonetrackerfrontend.s3.af-south-1.amazonaws.com/do_not_delete/placeholder.png'" 
                                alt="Image" width="250" preview style="min-height: 250px;" class="animate__animated animate__zoomIn" />
                            </div>
                            <div class="desc">{{ promoter.userDetails.firstName + " " + promoter.userDetails.lastName }}</div>
                        </div>
                    </div>
                </div>
                <div v-else class=" text-danger">
                    <ProgressSpinner v-if="showLoading" style="width: 30px; height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                    <span v-else class="text-center">No promoters</span>
                    
                </div>
                
            </div>
        </div>
  
</template>
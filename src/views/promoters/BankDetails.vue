<script setup>
import useToaster from '@/composables/useToaster';
import { usePromoter } from '@/stores/promoter';
import PDF from 'pdf-vue3';
import ConfirmDialog from 'primevue/confirmdialog';
import Drawer from 'primevue/drawer';
import ProgressSpinner from 'primevue/progressspinner';
import { useConfirm } from 'primevue/useconfirm';
import { onMounted, ref, watch } from 'vue';

const emit = defineEmits(['bankDetailsUploaded','uploadBankDetails']);

const envPath = import.meta.env.VITE_AWS_S3_BUCKET;

const showLoading = ref(false);
const showBankDetails = ref(false);
const promoterStore = usePromoter();
const toaster = useToaster();

const promoterData = ref();
const userIdParam = ref();

const props = defineProps({
    canUpdate: Boolean,
    promoterData: Object,
    userIdParam: String
});

const localPromoterData = ref({});//Since promoterData will be empty here due to data being fetched async. Just use localPromoterData

watch(
    () => props.promoterData,
    (newVal) => {
        console.log('Updated promoterData:', newVal);
        localPromoterData.value = newVal;
    },
    { immediate: true }
);

onMounted(() => {
    console.log('mounted',props.promoterData);
})


 promoterData.value = props.promoterData;
 userIdParam.value = props.userIdParam;


const deleteBankingFile = () => {
    if(!confirm("Are you sure you want to delete this file?")) return;
    showLoading.value = true;
    promoterStore.deleteBankingFile(userIdParam.value).then(function (response) {
        emit("bankDetailsUploaded");
        toaster.success("Bank details deleted successfully");
        showLoading.value = false;
    }).catch(function (error) {
        showLoading.value = false;
        toaster.error("Error in deleting bank details");
        console.log(error);
    })
}

// const confirm = useConfirm();

// const confirmPosition = (position) => {
//     confirm.require({
//         group: 'positioned',
//         message: 'Are you sure you want to proceed?',
//         header: 'Confirmation',
//         icon: 'pi pi-info-circle',
//         position: 'top',
//         rejectProps: {
//             label: 'Cancel',
//             severity: 'secondary',
//             text: true
//         },
//         acceptProps: {
//             label: 'Save',
//             text: true
//         },
//         accept: () => {
//            alert('ccoll')
//         },
//         reject: () => {
//            alert('rejesct')
//         }
//     });
// };

</script>
<template>   
    <!-- <ConfirmDialog group="positioned"></ConfirmDialog> -->
    <div v-if="canUpdate" class="card-body p-4">                    
            <div class="row mb-3 mt-2">
                    <div v-if="localPromoterData.bankingDetails" class="file-details mt-1 p-1 border rounded d-flex align-items-center">
                    <div class="file-icon me-3">
                        <img @click="showBankDetails = true" 
                        src="/src/assets/images/pdf.png" 
                        alt="" class="img-fluid cursor-pointer" style=" width: 100px; height: 100px; border-radius: 6px;"/>
                    </div>
                    <div class="ms-auto">
                        <span class="cursor-pointer" @click="deleteBankingFile">
                            <i v-if="!showLoading" class='bx bx-trash fs-3 text-danger'></i>
                            <ProgressSpinner v-else style="width: 30px; height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                        </span>
                    </div>
                    </div>
                    <div v-else class="text-center text-danger">Bank details not uploaded <span @click="emit('uploadBankDetails')" class="ml-2 text-primary cursor-pointer text-decoration-underline">Upload?</span></div>
            </div>
    </div>                                           
    <Drawer v-model:visible="showBankDetails" position="right" :header="`View Bank Details`" class="!w-full md:!w-80 lg:!w-[40rem]" style="width: 30rem!important;">
        <PDF :src="envPath + localPromoterData?.bankingDetails" />
    </Drawer>
</template>
<script setup>
import { ref } from 'vue';
import useToaster from '@/composables/useToaster';
import { usePromoter } from '@/stores/promoter';
import FileUploadGeneric from '../upload/FileUploadGeneric.vue';
import Button from '@/components/buttons/Button.vue';
import ProgressSpinner from 'primevue/progressspinner';

const user = ref();
const promoterStore = usePromoter();
const toaster = useToaster();
const userIdParam = ref();
const uploaderId = ref();
const bankDetailsLoading = ref(false);

const emit = defineEmits(['bankDetailsUploaded']);

const props= defineProps({
    canUpdate: Boolean,
    images: Array,
    showModal: Boolean,
    user: Object,
    userIdParam: String,
    uploaderId: String,
    isMyProfile: Boolean
});

const bankDetailFile = ref(null);
user.value = props.user;

userIdParam.value = props.userIdParam;
uploaderId.value = props.uploaderId;


const uploadBankDetails = () => {
    if(!bankDetailFile.value){return}
    bankDetailsLoading.value = true;
    const formData = new FormData();
    formData.append('banking-document', bankDetailFile.value);
    const config = {useMultipartFormData: true};
    promoterStore.uploadBankDetails(formData, userIdParam.value, config).then(function (response) {
        bankDetailsLoading.value = false;
        bankDetailFile.value = null;
        emit("bankDetailsUploaded");
        toaster.success("Bank details uploaded successfully");
    }).catch(function (error) {
        bankDetailsLoading.value = false;
        toaster.error("Error in uploading bank details");
        console.log(error);
    }).finally(() => {
        bankDetailsLoading.value = false;
    })
}


const onBankDetailsChange = (fileParam) => {
    bankDetailFile.value= null;
    bankDetailFile.value = fileParam;
}
const onBankDetailsDropped = (dropedFile) => {
    bankDetailFile.value= null;
    bankDetailFile.value = dropedFile[0];
    console.log('dropedFile',dropedFile[0]);
    };

</script>
<template>                                            
        <div class="modal-body">
                  <FileUploadGeneric 
                    docId="bank-file"
                    :showFilePreview="true" 
                    accept="application/pdf" 
                    fileType="pdf" 
                    @fileUploaded="onBankDetailsChange"
                    @fileDropped="onBankDetailsDropped"
                    />
            <div class="ms-auto mt-6">
                <Button v-if="!bankDetailsLoading" @click="uploadBankDetails" classes="w-100 btn maz-gradient-btn" type="button" 
                    :disabled="false">
                    <template #content>
                    Submit
                    </template>		
                </Button>
                <div v-if="bankDetailsLoading" colspan="9" class="text-center text-danger">
                    <ProgressSpinner style="width: 30px; height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                 </div>
                </div>
        </div>
 
</template>
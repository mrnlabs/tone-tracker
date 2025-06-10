<script setup>
import { ref } from 'vue';
import MultipleFileUpload from '../upload/MultipleFileUpload.vue';
import useToaster from '@/composables/useToaster';
import { usePromoter } from '@/stores/promoter';

const user = ref();
const promoterStore = usePromoter();
const toaster = useToaster();
const showLoading = ref(false);
const userIdParam = ref();
const uploaderId = ref();
const files = ref([]);

const emit = defineEmits(['doneUploadingImages']);

const props= defineProps({
    canUpdate: Boolean,
    images: Array,
    showModal: Boolean,
    user: Object,
    userIdParam: String,
    uploaderId: String,
    isMyProfile: Boolean
});
user.value = props.user;
userIdParam.value = props.userIdParam;
uploaderId.value = props.uploaderId;

const onMultipleFilesDropped = (e) => {files.value = e};
const onFileChange = (filesArr) => {files.value = filesArr}


const onSubmit = () => {
    if(!files.value.length){
      toaster.error("Please select at least one image");
      return
    }
    showLoading.value = true;
    const formData = new FormData();

    for (let i = 0; i < files.value.length; i++) {
	  formData.append('imageFiles', files.value[i]);
    }
        formData.append('entity', "promoters");
        formData.append('entityId', props.isMyProfile ? user.id : userIdParam.value);//if its admin get promoter id from the url
        formData.append('uploaderId', props.isMyProfile ? user.id : uploaderId.value);//if its admin get uploader id from the url
    const config = {useMultipartFormData: true};
    promoterStore.uploadImages(formData, config).then(function (response) {
        showLoading.value = false;
        files.value = [];
        emit('doneUploadingImages');
        toaster.success("Image uploaded successfully");
    }).catch(function (error) {
        toaster.error("Error in uploading image");
        console.log(error);
    }).finally(() => {
        showLoading.value = false;
    })

}

</script>
<template>                                            
        <div class="modal-body">
            <MultipleFileUpload
            :showFilePreview="true" 
             accept="image/*" 
             fileType="image" 
             @fileUploaded="onFileChange"
             @fileDropped="onMultipleFilesDropped"
            />
        </div>

        <div class="modal-footer">
            <div class="col-12 mt-2">
                <div class="d-grid mt-2">
                    <button @click="onSubmit" class="btn maz-gradient-btn" type="button" 
                    :disabled="showLoading"> 
                        <span v-if="showLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Submit
                    </button>
                </div>
            </div>
        </div>
 
</template>
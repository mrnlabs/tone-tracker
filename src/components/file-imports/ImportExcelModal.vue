<template>
    <ExcelImport 
    @fileUploaded="onFileChange"
    @fileDropped="onfileDropped"
     />
     
     <div v-if="fileName && !errorMessage" class="d-flex align-items-center mt-3 border-bottom pb-2 pt-2 mx-2 border-top">
        <div class="fm-file-box bg-light-success text-success"><i class="bx bxs-file-doc"></i>
        </div>
        <div class="flex-grow-1 ms-2">
            <h6 class="mb-0">{{ fileName }}</h6>
            <p class="mb-0 text-secondary">{{ rowCount }} record(s).</p>
        </div>
        <h6 class="text-primary mb-0">{{ fileSize }}</h6>
    </div>
     <div class="text-danger text-center text-sm" v-if="errorMessage">{{ errorMessage }}</div>
   <div class="mx-2">
     <Button @click="sendToBackend" classes="btn maz-gradient-btn align-items-center w-100 mt-3" type="button" text="Submit" 
     :disabled="readyToUpload()" >
         <template #content>
             {{ loading ? 'Loading...' : 'Submit' }}
         </template>									  
         <Spinner v-if="loading" class="spinner-border spinner-border-sm" />
     </Button>
   </div>
</template>
<script setup>
import formatFileSize from '@/utils/formatFileSize';
import Button from '../buttons/Button.vue';
import Spinner from '../buttons/Spinner.vue';
import ExcelImport from './ExcelImport.vue';
import Papa from 'papaparse';
import { ref } from 'vue';


const fileName = ref(''); 
const fileSize = ref('');

const props = defineProps({
    excelHeaders: Array,
    modelId: String,
    loading: Boolean,
  });

const errorMessage = ref('');
const expectedHeaders = props.excelHeaders;
const rowCount = ref(0);
const allData = ref([]);
const selectedFile = ref(null);

const emit = defineEmits(['submit']);


  const handleValidator = (file) => {
    if (file) {
        selectedFile.value = null;// Clear the selected file
        errorMessage.value = '';// Clear the error message
        selectedFile.value = file;

        fileName.value = file.name;
        fileSize.value = formatFileSize(file.size);


    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target.result;
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = Object.keys(results.data[0] || {});
          
          // Check if headers match exactly
          const headersMatch = JSON.stringify(headers) === JSON.stringify(expectedHeaders);
          
          if (!headersMatch) {
            errorMessage.value = `CSV headers do not match expected format: ${expectedHeaders.join(', ')}`;
          } else {
            errorMessage.value = '';
            
            // Count rows
            rowCount.value = results.data.length;
            allData.value = results.data;
            // console.log(`Row count: ${rowCount}`);
          }
        },
      });
    };
    reader.readAsText(file);
  }
};

const sendToBackend = () => {
    emit('submit', selectedFile.value, rowCount.value);
  }

const onFileChange = (uploadedFile) => {
    const file = event.target.files[0];
    handleValidator(file);
}

const onfileDropped = (dropedFile) => {
     selectedFile.value = null
      const files = dropedFile;
      if (!files) return
      const file = files[0];
      handleValidator(file);
      selectedFile.value = file;
};

const readyToUpload = () => {
    return !selectedFile.value || errorMessage.value !== '' || props.loading || rowCount.value === 0 ;
}


</script>
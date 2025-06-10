<script setup>
import Layout from '@/views/shared/Layout.vue';
import BreadCrumb from '@/components/BreadCrumb.vue';
import { onMounted, ref } from 'vue';
import NDAFileUpload from './NDAFileUpload.vue';
import SLAFileUpload from './SLAFileUpload.vue';
import { useDocUpload } from '@/stores/docUpload';
import useToaster from '@/composables/useToaster';
import Drawer from 'primevue/drawer';
import PDF from 'pdf-vue3';


const uploadStore = useDocUpload();
const toaster = useToaster();
const files = ref([]);

const NDA = ref({});
const SLA = ref({});
const view_uploaded_file_visible = ref(false);
let base64PDFURL = ref(null);


const  getFiles = () => {
    uploadStore.getDocs().then(function (response) {
        console.log(response.data);
        files.value = response.data;

        for (let i = 0; i < files.value.length; i++) {
            if (files.value[i].title === "NDA") {
                NDA.value = files.value[i];
            } else if (files.value[i].title === "SLA") {
                SLA.value = files.value[i];
            }
        }
    }).catch(error => {
        console.log(error);
        toaster.error("Error fetching files");
    })
  };

  const envFile =  import.meta.env.VITE_AWS_S3_BUCKET;

  async function previewBase64PDF(file) {
    //open link in new tab
    // window.open(import.meta.env.VITE_AWS_S3_BUCKET + file.path, '_blank');
    base64PDFURL.value = import.meta.env.VITE_AWS_S3_BUCKET + file.path;
    console.log(envFile + file.path);
    view_uploaded_file_visible.value = true;
}

onMounted(() => {
    getFiles();
})
</script>
<template>
    <Layout>
        <div class="page-wrapper">
            <div class="page-content">
                <BreadCrumb title="Upload Documents" icon="" />
                <!-- <p>Upload supporting contract / documentation</p> -->
                <p>Upload NDA and SLA documents</p>


                <div class="card">
                    <div class="card-body row">
                            <template v-if="Object.keys(NDA).length > 0">
                                <div class="col-md-6">
                                    <div  class="file-details mt-3 p-1 border rounded d-flex align-items-center">
                                        <div  class="file-icon me-3">
                                            <img @click="previewBase64PDF(NDA)"  src="/src/assets/images/pdf.png" alt="pdf" class="img-fluid cursor-pointer" style="width: 100px; height: 100px; border-radius: 6px;"></div>
                                        <div  class="file-info">
                                          <p  class="m-0">{{NDA.title}} Document</p>
                                        </div>
                                        <div  class="ms-auto"><button  class="btn btn-danger"><i  class="bx bx-trash"></i></button></div>
                                      </div>
                                </div>
                            </template>
                            <template v-else>
                                <NDAFileUpload @done-uploading="getFiles" />
                            </template>

                            <template v-if="Object.keys(SLA).length > 0">
                                <div class="col-md-6">
                                    <div  class="file-details mt-3 p-1 border rounded d-flex align-items-center">
                                        <div  class="file-icon me-3">
                                            <img @click="previewBase64PDF(SLA)"  src="/src/assets/images/pdf.png" alt="pdf" class="img-fluid cursor-pointer" style="width: 100px; height: 100px; border-radius: 6px;"></div>
                                        <div  class="file-info">
                                          <p  class="m-0">{{SLA.title}} Document</p>
                                        </div>
                                        <div  class="ms-auto"><button  class="btn btn-danger"><i  class="bx bx-trash"></i></button></div>
                                      </div>
                                </div>
                            </template>
                            <template v-else>
                                <SLAFileUpload @done-uploading="getFiles" />
                            </template>

                            
                   
                </div>
            </div>
        </div>
        </div>
        <div class="card flex justify-center">
            <Drawer v-model:visible="view_uploaded_file_visible" position="right" header="View Brief File" class="!w-full md:!w-80 lg:!w-[40rem]" style="width: 30rem!important;">
                
                 <PDF :src="base64PDFURL" />
            </Drawer>
        </div>
    </Layout>
</template>



<script setup>
import BreadCrumb from "@/components/BreadCrumb.vue";
import Layout from "../shared/Layout.vue";
import { useAuth } from '@/stores/auth';
import { useTask } from "@/stores/task";
import { onMounted, ref } from "vue";
import { useRoute } from 'vue-router';
import Drawer from "primevue/drawer";
import PDF from "pdf-vue3";
import FileUpload from "primevue/fileupload";
import Button from "primevue/button";
import { usePrimeVue } from 'primevue/config';
import useToaster from '@/composables/useToaster';
import { usePromoter } from "@/stores/promoter";
import Badge from "primevue/badge";
import Image from "primevue/image";
import { useSupplier } from "@/stores/supplier";
import FileUploadGeneric from "../upload/FileUploadGeneric.vue";
import SignedNDAFileUpload from "./SignedNDAFileUpload.vue";
import SignedSLAFileUpload from "./SignedSLAFileUpload.vue";
import Dialog from "primevue/dialog";
import SplitButton from "primevue/splitbutton";


const taskStore = useTask();
const authStore = useAuth();
const supplierStore = useSupplier();
const route = useRoute();
const promoterStore = usePromoter();
const showLoading = ref(false);
const isBid = ref(route.query.isBid);

const envPath = import.meta.env.VITE_AWS_S3_BUCKET;
const toaster = useToaster();

const user = JSON.parse(authStore.user);
const taskId = ref(route.params.id);
const $primevue = usePrimeVue();
const singleTask = ref({});
const images = ref([]);

onMounted(() => {
  if(!user.activeUserId){
    return
  }
  getThirdPartyAwardedTasks();
});
const bid = ref(null)
const getThirdPartyAwardedTasks = async () => {
	supplierStore.getThirdPartyAwardedTasks(taskId.value).then(response => {
	console.log('singleTask',response.data)
    singleTask.value = response.data;
    // singleTask.value = response.data?.taskDTO;
	bid.value =response.data;
	getTaskImages();
  }).catch(error => {
    toaster.error("Error fetching task");
    console.log(error);
  }).finally(() => {
    //
  });
};

const getTaskImages = async () => {
  taskStore.getTaskImages(taskId.value, 'task', user.activeUserId).then(response => {
	images.value = response.data;
  }).catch(error => {
	toaster.error("Error fetching task");
	console.log(error);
  }).finally(() => {
	//
  });
};


const visible = ref(false);
const fullPath = ref(null);
const showImagesSheet = ref(false);
const showDocumentSheet = ref(false);

const previewBase64PDF = () => {
        visible.value = true;
		fullPath.value = import.meta.env.VITE_AWS_S3_BUCKET + singleTask.value.path;
        console.log(fullPath.value)
}
const download = () => {
     try {
        const link = document.createElement('a');
        link.href = import.meta.env.VITE_AWS_S3_BUCKET + singleTask.value.path;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error downloading document:', error);
    }
};

const files = ref([]);
const totalSize = ref(0);
const totalSizePercent = ref(0);

const onRemoveTemplatingFile = (file, removeFileCallback, index) => {
    removeFileCallback(index);
    totalSize.value -= parseInt(formatSize(file.size));
    totalSizePercent.value = totalSize.value / 10;
};


const onSelectedFiles = (event) => {
    files.value = event.files;
    files.value.forEach((file) => {
        totalSize.value += parseInt(formatSize(file.size));
    });
};

const uploadEvent = (callback) => {
    totalSizePercent.value = totalSize.value / 10;
    callback();
};


const formatSize = (bytes) => {
    const k = 1024;
    const dm = 3;
    const sizes = $primevue.config.locale.fileSizeTypes;

    if (bytes === 0) {
        return `0 ${sizes[0]}`;
    }

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${formattedSize} ${sizes[i]}`;
};

const onSubmit = () => {
  if(!files.value.length){
	  toaster.error("Please select at least one image");
	  return
  }
  const formData = new FormData();
showLoading.value = true;
  for (let i = 0; i < files.value.length; i++) {
	  formData.append('imageFiles', files.value[i]);
  }

  formData.append('entity', "task");
  formData.append('entityId', taskId.value);
  formData.append('uploaderId', user.activeUserId);

  const config = {
	  useMultipartFormData: true // Add this flag to the request config
	   };
  promoterStore.uploadImages(formData, config).then(function (response) {
	  getTaskImages();
	  toaster.success("Images uploaded successfully");
	  showImagesSheet.value = false;
	  showLoading.value = false;
	  files.value = [];

  }).catch(error => {
	  toaster.error("Error uploading images");
	  console.log(error);
  }).finally(() => {
	  showLoading.value = false;
  })
};

const NDAFile = ref(null)
const SLAFile = ref(null)
const onSubmitSLA = () => {
  if(!SLAFile.value){
	  toaster.error("Please upload SLA document");
	  return
  }
      const formData = new FormData();
      showLoading.value = true;
	  formData.append('documentFile', SLAFile.value); 
		formData.append('title ', 'SLA');
		// formData.append('signedAt ', new Date());
		formData.append('templateId', taskId.value);
		formData.append('signedById', user.activeUserId);

  const config = {
	  useMultipartFormData: true // Add this flag to the request config
	   };
	   supplierStore.uploadSignedDocuments(formData, config).then(function (response) {
	  getTaskImages();
	  showSLADocumentSheet.value = false;
	  toaster.success("Documents uploaded successfully");
	  showImagesSheet.value = false;
	  showLoading.value = false;
	  files.value = [];

  }).catch(error => {
	  toaster.error("Error uploading documents");
	  console.log(error);
  }).finally(() => {
	  showLoading.value = false;
  })
};
const onSubmitNDA = () => {
	if(!NDAFile.value){
		toaster.error("Please upload NDA document");
		return
	}
      const formData = new FormData();
      showLoading.value = true;
	  formData.append('documentFile', NDAFile.value);
		formData.append('title ', 'NDA');
		formData.append('templateId', taskId.value);
		formData.append('signedById', user.activeUserId);

  const config = {
	  useMultipartFormData: true // Add this flag to the request config
	   };
  supplierStore.uploadSignedDocuments(formData, config).then(function (response) {
	  getTaskImages();
	  showNDADocumentSheet.value = false;
	  toaster.success("NDA document uploaded successfully");
	  showImagesSheet.value = false;
	  showLoading.value = false;
	  files.value = [];

  }).catch(error => {
	  toaster.error("Error uploading documents");
	  console.log(error);
  }).finally(() => {
	  showLoading.value = false;
  })
};

const showFilePreview = ref(true);

const onSLAFileChange = (uploadedFile) => {
	SLAFile.value = null;
    SLAFile.value = uploadedFile;
}

const onNDAFileChange = (uploadedFile) => {
	NDAFile.value = null;
    NDAFile.value = uploadedFile;
}
const showSLADocumentSheet = ref(false);
const showNDADocumentSheet = ref(false);
const items = [
    // {
    //     label: 'Signed NDA Document',
    //     icon: 'bx bxs-file-doc fs-4 text-white',
    //     command: () => {
    //         showNDADocumentSheet.value = true;
    //     }
    // },
	// {
    //     label: 'Signed SLA Document',
    //     icon: 'bx bxs-file-doc fs-4 text-white',
    //     command: () => {
    //         showSLADocumentSheet.value = true;
    //     }
    // },
	{
        label: 'Images',
        icon: 'bx bx-image-add fs-4 text-white',
        command: () => {
            showImagesSheet.value = true;
        }
    }
];
</script>

<template>
    <Layout>
        <div class="page-wrapper">
			<div class="page-content">
				<!--breadcrumb-->
				<div class="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
					<div class="breadcrumb-title pe-3">View Task</div>
					
					<div class="ms-auto">
						<div class="btn-group ms-auto">
							<SplitButton class="text-white" label="Upload" 
							icon="bx bx-cloud-upload fs-4" 
							dropdownIcon="text-white fs-4 bx bx-chevron-down" 
							:model="items"
							/>
							<!-- <button  @click="showDocumentSheet = true" type="button" class="btn btn maz-gradient-btn mx-2">Upload Signed NDA and SLA</button>
							<button @click="showImagesSheet = true" type="button" class="btn btn maz-gradient-btn mx-2">Add Images</button> -->
						</div>
					</div>
				</div>
				<!--end breadcrumb-->
				<div class="row">
					<div class="col-xl-8">
				
						<div class="card">
							<div class="card-body p-4">
								<div class="row g-3">
									<div class="col-md-6">
										<label for="input1" class="form-label">Name</label>
										<input type="text" class="form-control" id="input1" :value="singleTask?.taskDetails?.name">
									</div>

									<div class="col-md-6">
										<label for="input3" class="form-label">Status</label>
										<input type="text" class="form-control" id="input3" :value="singleTask?.taskDetails?.status">
									</div>
									<div class="col-md-6">
										<label for="input4" class="form-label">Address</label>
										<input type="email" class="form-control" id="input4" :value="singleTask?.taskDetails?.address">
									</div>
									<div class="col-md-6">
										<label for="input5" class="form-label">Start Date</label>
										<input type="text" class="form-control" id="input5" :value="singleTask?.taskDetails?.startDate">
									</div>
									<div class="col-md-6">
										<label for="input6" class="form-label">End Date</label>
										<input type="text" class="form-control" id="input6" :value="singleTask?.taskDetails?.plannedEndDate">
									</div>

									<div class="col-md-6">
										<label for="input6" class="form-label">Time Record</label>
										<input type="text" class="form-control" id="input6" :value="singleTask?.taskDetails?.timeRecord">
									</div>
									
								</div>
							</div>
						</div>
					</div>


                    <div class="col-xl-4 ">
						<h4>PO Documents</h4>
						<div class="card">
							<div class="card-body p-4">
								<form class="row g-3" v-if="singleTask?.path">
									<div class="col-md-12">
                                        <div  class="file-details mt-3 p-1 border rounded d-flex align-items-center">
                                            <div class="file-icon me-3" v-tooltip.bottom="'View File'">
                                              <img @click="previewBase64PDF"  src="/src/assets/images/pdf.png" alt="pdf" class="img-fluid cursor-pointer" style=" width: 100px; height: 100px; border-radius: 6px;"/>
                                            </div>
                                            <div class="file-info">
                                              <!-- <p class="m-0 text-white">Brief.pdf</p> -->
                                            </div>
                                            <div class="ms-auto">
                                                <i @click="download" class='bx bxs-download maz-gradient-txt fs-2 cursor-pointer' v-tooltip="'Download'" ></i>
                                             
                                            </div>
                                          </div>
									</div>
								</form>
								<div v-else class="text-danger">No brief document uploaded.</div>
							</div>
						</div>
						
					</div>
				</div>
				

				<div class="prmoters-jobs d-none">
					<!-- <h5 class="text-white">Others promoters jobs</h5> -->
					<div class="row mt-6  row-cols-xl-9 ">
						<div class="">
							<h4 class="mb-2 mt-5 ml-2">Task Images</h4>
						</div>

						<div  class="d-flex"> 
							<div v-if="images?.length > 0" v-for="taskImage in images" :key="taskImage.id">
								<div class="col-img">
									<div class="gallery">
										<div class="card flex justify-center">
											<Image alt="Image" preview>
												<template #previewicon>
													<i class='bx bx-search-alt-2'></i>
												</template>
												<template #image>
													<img 
														:src="envPath + taskImage.path"
														:alt="singleTask?.name" 
														width="250" 
													/>
												</template>
												<template #preview="slotProps">
													<img 
														:src="envPath + taskImage.path"
														:alt="singleTask?.name" 
														:style="slotProps.style" 
														@click="slotProps.onClick" 
													/>
												</template>
											</Image>
										</div>
									</div>
								</div>
							</div>
							<div v-else class="text-danger">No images uploaded.</div>
							
						</div>
					</div>
				</div>


				<div class="card flex justify-center">
					<Drawer v-model:visible="visible" position="right" header="View PO Document" class="!w-full md:!w-80 lg:!w-[40rem]" style="width: 30rem!important;">
						<button @click="download" class="btn w-100 maz-gradient-btn mb-2" type="button">
							<i class='bx bxs-download'></i>
							Download</button>
						<PDF :src="fullPath" />
					</Drawer>

					<Drawer v-model:visible="showImagesSheet" position="right" header="Add Images" class="!w-full md:!w-80 lg:!w-[40rem]" style="width: 30rem!important;">
						<div class="card">            
							<FileUpload name="demo[]" url="/api/upload" :multiple="true" accept="image/*" @select="onSelectedFiles">
								<template #header="{ chooseCallback, uploadCallback, clearCallback, files }">
									<div class="d-flex flex-wrap justify-content-between align-items-center flex-grow-1 gap-4">
										<div class="d-flex gap-2">
											<Button @click="chooseCallback()" icon="bx bx-images" class="btn btn-outline-secondary text-white rounded"></Button>
											<Button @click="clearCallback()" icon="bx bx-x" class="btn btn-outline-danger rounded" :disabled="!files || files.length === 0"></Button>
										</div>
									</div>
								</template>
								<template #content="{ files, uploadedFiles, removeUploadedFileCallback, removeFileCallback }">
									<div class="d-flex flex-column gap-4 pt-4">
										<div v-if="files.length > 0">
											<div class="d-flex flex-wrap gap-4">
												<div v-for="(file, index) of files" :key="file.name + file.type + file.size" class="p-4 rounded border d-flex flex-column border-secondary align-items-center gap-2">
													<div>
														<img role="presentation" :alt="file.name" :src="file.objectURL" width="100" height="50" />
													</div>
													<span class="font-weight-bold text-truncate w-75">{{ file.name }}</span>
													<div>{{ formatSize(file.size) }}</div>
													<Button icon="bx bx-x" @click="onRemoveTemplatingFile(file, removeFileCallback, index)" class="btn btn-outline-danger rounded" />
												</div>
											</div>
										</div>
					
										<div v-if="uploadedFiles.length > 0">
											<div class="d-flex flex-wrap gap-4">
												<div v-for="(file, index) of uploadedFiles" :key="file.name + file.type + file.size" class="p-4 rounded border d-flex flex-column border-secondary align-items-center gap-2">
													<div>
														<img role="presentation" :alt="file.name" :src="file.objectURL" width="100" height="50" />
													</div>
													<span class="font-weight-bold text-truncate w-75">{{ file.name }}</span>
													<div>{{ formatSize(file.size) }}</div>
													<Badge value="Completed" class="mt-4 badge bg-success" />
													<Button icon="bx bx-x" @click="removeUploadedFileCallback(index)" class="btn btn-outline-danger rounded" />
												</div>
											</div>
										</div>
									</div>
								</template>
								<template #empty>
									<div class="d-flex align-items-center justify-content-center flex-column">
										<i class="bx bx-cloud-upload border border-2 rounded-circle p-4 fs-6 text-muted" />
										<p class="mt-3 mb-0">Drag and drop files to here to upload.</p>
									</div>
								</template>
							</FileUpload>

							  <div class="d-grid mt-3">
								<button @click="onSubmit" class="btn maz-gradient-btn" type="button" 
								   :disabled="showLoading"> 
									<span v-if="showLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
									Submit
								</button>
							  </div>
						</div>
					</Drawer>

					<Dialog v-model:visible="showNDADocumentSheet" position="top" header="Upload Signed NDA Document" class="!w-full md:!w-80 lg:!w-[40rem]" style="width: 30rem!important;">
						<div>
								<SignedNDAFileUpload
								:showFilePreview="showFilePreview" 
								accept="application/pdf" 
								fileType="pdf" 
								@fileUploaded="onNDAFileChange"
								/>
					    </div>
						<div class="ms-auto">
							<a @click="onSubmitNDA" href="javascript:;" class="w-100 btn d-flex justify-content-center align-items-center maz-gradient-btn radius-30 mt-lg-0">
								<div v-if="showLoading" class="spinner-border text-white " role="status"> <span class="visually-hidden">Loading...</span>
								</div>
								{{ showLoading ?  '' : 'Submit' }}
							</a>
						</div>
					</Dialog>

					<Dialog v-model:visible="showSLADocumentSheet" position="top" header="Upload Signed SLA Document" class="!w-full md:!w-80 lg:!w-[40rem]" style="width: 30rem!important;">
						
						<div>
								<SignedSLAFileUpload
								:showFilePreview="showFilePreview" 
								accept="application/pdf" 
								fileType="pdf" 
								@SLAFileUploaded="onSLAFileChange"
								/>
					    </div>
						<div class="ms-auto">
							<a @click="onSubmitSLA" href="javascript:;" class="w-100 btn d-flex justify-content-center align-items-center maz-gradient-btn radius-30 mt-lg-0">
								<div v-if="showLoading" class="spinner-border text-white " role="status"> <span class="visually-hidden">Loading...</span>
								</div>
								{{ showLoading ?  '' : 'Submit' }}
							</a>
						</div>
					</Dialog>
						
					
				</div>

			</div>
		</div>
    </Layout>
  </template>
  
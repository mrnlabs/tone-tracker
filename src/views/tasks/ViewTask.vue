<script setup>
import Layout from '../shared/Layout.vue';
import BreadCrumb from '../../components/BreadCrumb.vue';
import { computed, onMounted, reactive, ref } from 'vue';
import { usePromoter } from '@/stores/promoter';
import { useTask } from '@/stores/task';
import { useRoute, useRouter } from 'vue-router';
import Image from 'primevue/image';
import avatarGenerator from '@/helpers/avatarGenerator';
import useToaster from '@/composables/useToaster';
import SplitButton from 'primevue/splitbutton';
import Drawer from 'primevue/drawer';
import html2pdf from "html2pdf.js";
import URLrouter from '@/router';
import Dialog from 'primevue/dialog';
import FileUploadGeneric from '../upload/FileUploadGeneric.vue';
import PDF from 'pdf-vue3';

const route = useRoute();
const router = useRouter();
const toaster = useToaster();
const envPath = import.meta.env.VITE_AWS_S3_BUCKET;

const isLoading = ref(false);
const availablePromotersLoading = ref(false);

const taskName = ref(route.query.name);

const singleTask = ref({});
const bids = ref([]);
const availablePromoters = ref([]);
const checkins = ref([]);
const taskStore = useTask();
const taskId = ref(route.params.id);

onMounted(() => {
    getAvailablePromoters();
    getTask();
    getBids(); 
    getCheckins();   
});

const statuses = ref([
    { name: 'Finished', code: 'FINISHED' },
    { name: 'Planned', code: 'PLANNED' },
    { name: 'On Track', code: 'ONTRACK' },
    { name: 'Delayed', code: 'DELAYED' },
    { name: 'At Risk', code: 'ATRISK' }
]);

const getStatus = (status) => {
    let myStatus = statuses.value.find((s) => s.code === status);
    return myStatus ? myStatus.name : '';
};

const form = reactive({
    status: '',
    type: '',
    address: '',
    startDate: null,
	plannedEndDate: null,
	timeRecord: null,
    completion: null,
    name: null
});

const getTask = async () => {
  isLoading.value = true;
  taskStore.getTask(taskId.value).then(response => {
    isLoading.value = false;
    singleTask.value = response.data;
    Object.assign(form, response.data);
  }).catch(error => {
    isLoading.value = false;
    toaster.error("Error fetching task");
    console.log(error);
  }).finally(() => {
    isLoading.value = false;
  });
};

const getBids = async () => {
  taskStore.getBids(taskId.value).then(response => {
    console.log("bids", response.data);
    bids.value = response.data
    Object.assign(form, response.data);
  }).catch(error => {
    toaster.error("Error fetching task");
    console.log(error);
  }).finally(() => {
    //
  });
};



  const getAvailablePromoters = async () => {  
  taskStore.getAvailablePromotersByTaskId(taskId.value).then(response => {
    availablePromotersLoading.value = false;
    availablePromoters.value = response.data;
  }).catch(error => {
    //toaster.error("Error fetching users");
    availablePromotersLoading.value = false;
    console.log(error);
  }).finally(() => {
    availablePromotersLoading.value = false;
  });
};


const getCheckins = async () => {  
  taskStore.getCheckins(taskId.value).then(response => {
    console.log("tasks", response.data);
    checkins.value = response.data;
  }).catch(error => {
    
  }).finally(() => {
    
  });
};

const getDate = (actualDate) => {
  // Check if actualDate is null or undefined
  if (actualDate == null) {
    console.error('Date is null or undefined');
    return null;
  }

  // Ensure actualDate is a string
  const dateString = String(actualDate);

  // Replace the space with 'T' if it exists
  const formattedDate = dateString.replace(' ', 'T');
  const date = new Date(formattedDate);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.error('Invalid date');
    return null;
  }
  
  return date.toISOString().split('T')[0];
}

const getTime = (actualDate) => {
  // Check if actualDate is null or undefined
  if (actualDate == null) {
    console.error('Date is null or undefined');
    return null;
  }

  // Ensure actualDate is a string
  const dateString = String(actualDate);

  // Replace the space with 'T' if it exists
  const formattedDate = dateString.replace(' ', 'T');
  const date = new Date(formattedDate);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.error('Invalid date');
    return null;
  }
  
  return date.toTimeString().split(' ')[0];
}

const getFullName = (firstName, lastName) => {
  return `${firstName} ${lastName}`;
}

const redirectToProfile = (user) => {
  console.log("user", user);
	router.push({ path: `/profile/${user?.user}/${user?.id}/?taskId=${taskId.value}` });
}

const selectedPromoterIds = ref([]);
const togglePromoterSelection = (promoterId) => {
    const index = selectedPromoterIds.value.indexOf(promoterId);
    if (index > -1) {
        selectedPromoterIds.value.splice(index, 1); // Unselect (remove from array)
    } else {
        selectedPromoterIds.value.push(promoterId); // Select (add to array)
    }
    console.log('selectedPromoterIds',selectedPromoterIds.value);
    
};

const saveSelectedPromoters = () => {
  isLoading.value = true;
  
  // Ensure selectedPromoterIds.value is an array before sending it
  const promoterIdsArray = Array.isArray(selectedPromoterIds.value) ? selectedPromoterIds.value : [selectedPromoterIds.value];

  taskStore.addPromotersToTask(taskId.value, promoterIdsArray)
    .then(response => {
      console.log("response", response);
      toaster.success("Promoters added successfully");
      getTask();
      getAvailablePromoters();
    })
    .catch(error => {
      toaster.error("Error adding promoters");
      console.log(error);
    })
    .finally(() => {
      isLoading.value = false;
    });
}

const items = (bid) => [    {
  
        label: 'View Costing',
        icon: 'bx bx-show fs-4 maz-gradient-txt',
        command: () => {
          previewCosting(bid);
        }
    },
	// {
  //       label: 'Award Job',
  //       icon: 'bx bxs-user-check fs-4 maz-gradient-txt',
  //       command: () => {
  //           awardJob();
  //       }
  //   },
    {
        label: 'View Supplier',
        icon: 'bx bxs-user-pin fs-4 maz-gradient-txt',
        command: () => {
            URLrouter.push(`/supplier-profile/${bid.thirdPartyDTO?.id}/${bid.thirdPartyDTO?.user}`);
        }
    }
];

const costVisible = ref(false)
const viewBid = ref(false)
const previewCosting = (bid) => {
  costVisible.value = true;
  viewBid.value = bid
}

const totalAmount = computed(() => {
  if(!viewBid.value?.costs) return 0
  return viewBid.value.costs.reduce((sum, row) => sum + row.amount, 0);
});

const exportToPDF = () => {
      html2pdf(document.getElementById("my-invoice"), {
        margin: 1,
       filename: `${viewBid.value.thirdPartyDTO?.userDetails.firstName} ${viewBid.value.thirdPartyDTO?.userDetails.lastName}_Costs.pdf`,
      });
    }
    const showPoDocModal = ref(false)
    const awardJob = () => {
      costVisible.value = false;
      showPoDocModal.value = true
    }

    const selectedFile = ref(null);
    const showFilePreview = ref(true);
 const onFileChange = (uploadedFile) => {
    console.log('event', uploadedFile);
    selectedFile.value = uploadedFile;
}

const showPreviewBriefSheet = ref(false) 
const viewBriefFile = () => {
  if(!singleTask.value?.path) return toaster.error("Brief file not uploaded");
  
  showPreviewBriefSheet.value = true
}
const onSubmitPO = () => {
  if(!selectedFile.value) return toaster.error("Please select a file");
  const awardFormData = new FormData();
  awardFormData.append("poDocument", selectedFile.value);
  awardFormData.append("taskId", taskId.value);
  awardFormData.append("thirdPartyId", viewBid.value.thirdPartyDTO?.id);
  awardFormData.append("awardDate", "2024-08-24");
  awardFormData.append("jobStatus", "Planned");

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }
  taskStore.submitPODocument(awardFormData,config).then(response => {
    toaster.success("PO Document submitted successfully");
    console.log("response", response);
    getTask();
    showPoDocModal.value = false
  }).catch(error => {
    toaster.error("Error submitting PO Document");
    console.log(error);
  })
}
</script>
<template>
  <Layout>
    <!--start page wrapper -->
    <div class="page-wrapper">
      <div class="page-content">
        <div class="d-flex">
          <BreadCrumb :title="taskName" icon="bx bx-task" />
          <div  class="ms-auto" v-if="singleTask?.type  == 'THIRDPARTY'">
							<button @click="viewBriefFile" type="button" class="btn mt-3 btn maz-gradient-btn" data-bs-toggle="dropdown">
                View Brief File
							</button>
						</div>
				
        </div>
        <div class="row">
            <div class="col-lg-12">
                <div class="card">
                    <div class="card-body">
                        <div class="row g-2">
                            <div class="col-md-4">
                                <label for="input1" class="form-label">Task Name</label>
                                <input v-model="taskName" type="text" readonly class="form-control" id="input1" >
                            </div>
                            <div class="col-md-4">
                                <label for="input1" class="form-label">Activation Name</label>
                                <input v-model="taskName" type="text" readonly class="form-control" id="input1" >
                            </div>

                            <div class="col-md-4">
                                <label for="input3" class="form-label">Risk</label>
                                <input :value="getStatus(form.status)" type="text" readonly class="form-control" id="input3">
                            </div>

                            <div class="col-md-4">
                                <label for="input1" class="form-label">Type</label>
                                <input v-model="form.type" type="text" readonly class="form-control" id="input1" >
                            </div>
                            <div class="col-md-4">
                                <label for="input2" class="form-label">Start Date</label>
                                <input v-model="form.startDate" type="text" readonly class="form-control" id="input2" >
                            </div>
                            <div class="col-md-4">
                                <label for="input2" class="form-label">Planned End Date</label>
                                <input v-model="form.plannedEndDate" type="text" readonly class="form-control" id="input2" >
                            </div>
                            <div class="col-md-4">
                                <label for="input3" class="form-label">Time Record</label>
                                <input v-model="form.timeRecord" type="text" readonly class="form-control" id="input3">
                            </div>


                            <div class="col-md-4">
                                <label for="input1" class="form-label">Completion</label>
                                <input v-model="form.completion" type="text" readonly class="form-control" id="input1" >
                            </div>
                            <div class="col-md-4">
                                <label for="input2" class="form-label">Location</label>
                                <input v-model="form.address" type="text" readonly class="form-control" id="input2" >
                            </div>
                            

                        </div>
                    </div>
                </div>
            </div>
         
        </div>
      

        <!-- show promoters -->
        <div v-if="singleTask && singleTask.type === 'INHOUSE'">
          <div class="row mt-6 row-cols-xl-9 gap-4">
            <div>
              <h4 class="mb-2 ml-2">Promoters on job</h4>
            </div>
            <template v-if="singleTask.promoterDetails?.length > 0">
              <div v-for="promoter in singleTask.promoterDetails" :key="promoter.id" class="col-img">
                <div class="gallery">
                  <div class="card flex justify-center">
                    <Image alt="Image" preview>
                      <template #previewicon>
                        <i class='bx bx-search-alt-2'></i>
                      </template>
                      <template #image>
                          <img 
                          :src="promoter.userDetails.path ? envPath + promoter.userDetails.path : avatarGenerator(promoter.userDetails.firstName, promoter.userDetails.lastName)" 
                          alt="image" width="250" />
                      </template>
                      <template #preview="slotProps">
                        <img 
                          :src="promoter.userDetails.path ? envPath + promoter.userDetails.path : avatarGenerator(promoter.userDetails.firstName, promoter.userDetails.lastName)" 
                          alt="preview" :style="slotProps.style" @click="slotProps.onClick" />
                      </template>
                    </Image>
                  </div>
                  <div>
                    <RouterLink :to="`/profile/${promoter?.userDetails?.id}/${promoter?.id}?taskId=${taskId}`">
                    <div class="desc cursor-pointer" >
                      {{ promoter.userDetails.firstName }} {{ promoter.userDetails.lastName }}
                    </div>
                  </RouterLink>
                  </div>
                </div>
              </div>  
            </template>  
            <template v-else>
              <div class="text-center mt-2 text-danger">{{ isLoading ? 'Loading...' : 'No available Promoters on the job.' }} </div>
            </template> 
          </div>        
          <div class="row mt-6 gap-4">
            <div>
              <h4 class="mb-2 ml-2">Available Promoters</h4>
            </div>
            <template v-if="availablePromoters?.length > 0">
              <div v-for="availablePromoter in availablePromoters" :key="availablePromoter.id" class="col-img">
                <div class="gallery">
                  <div class="card flex justify-center">
                    <KeepAlive>
                      <Image alt="Image" preview>
                        <template #previewicon>
                          <i class='bx bx-search-alt-2'></i>
                        </template>
                        <template #image>
                          <img
                            :src="availablePromoter.userDetails.path ? envPath + availablePromoter.userDetails.path : avatarGenerator(availablePromoter.userDetails.firstName, availablePromoter.userDetails.lastName)" 
                            alt="image" width="250" />
                        </template>
                        <template #preview="slotProps">
                          <img 
                            :src="availablePromoter.userDetails.path ? envPath + availablePromoter.userDetails.path : avatarGenerator(availablePromoter.userDetails.firstName, availablePromoter.userDetails.lastName)" 
                            alt="preview" :style="slotProps.style" @click="slotProps.onClick" />
                        </template>
                      </Image>
                    </KeepAlive>
                  </div>
                  <div class="checkbox">
                    <input type="checkbox" id="select" @change="togglePromoterSelection(availablePromoter.id)">
                    <span>&#x2713;</span>
                  </div>
                  <div>
                    <div class="desc cursor-pointer" @click="redirectToProfile(availablePromoter)">
                      {{ availablePromoter.userDetails.firstName }} {{ availablePromoter.userDetails.lastName }}
                    </div>
                  </div>
                </div>
              </div>  
            </template>
            <template v-else>
              <div class="text-center mt-2 text-danger">{{ availablePromotersLoading ? 'Loading...' : 'No available Promoters.' }}</div>
            </template> 
            <div class="ms-auto" v-if="selectedPromoterIds.length > 0">
              <button @click="saveSelectedPromoters" type="button" class="w-100 btn d-flex justify-content-center align-items-center maz-gradient-btn radius-30 mt-lg-0">
                <div v-if="isLoading" class="spinner-border text-white" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                {{ isLoading ? '' : 'Save' }}
              </button>
            </div>
          </div>
        </div>



      <!-- end show promoters -->
       <!-- show a table of bids -->
        <div v-if="singleTask && singleTask.type === 'THIRDPARTY'">
          <table class="table table-dark table-bordered">
            <thead>
              <tr class="table-dark-color">
                <th>Activation</th>
                <th>Task</th>
                <th>Risk</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Time Record</th>
                <th>Completion</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="bids?.length > 0" v-for="bid in bids" :key="bid.id">
                <td>{{ bid.taskDTO?.activationDetails?.name }}</td>
                <td>{{ bid.taskDTO?.name }}</td>
                <td>{{ bid.taskDTO?.status }}</td>
                <td>{{ bid.taskDTO?.startDate }}</td>
                <td>{{ bid.taskDTO?.plannedEndDate }}</td>
                <td>{{ bid.taskDTO?.timeRecord }}</td>
                <td>{{ bid.taskDTO?.completion }}</td>
                <td>
                  <SplitButton class="text-white" label="" 
													icon="bx bx-cog fs-4" 
													dropdownIcon="text-white fs-4 bx bx-chevron-down" 
													:model="items(bid)"/>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
       <!-- end show here -->
                <!-- checkins  -->
          <div class="row col-lg-12 card card-bod gap-4" v-if="checkins.length > 0" >
          <div>
              <h4 class="mb-2 ml-2">Promoter Checkins</h4>
          </div>
          <table class="table table-dark table-bordered">
              <thead>
                    <tr class="table-dark-color">
                      <th>Promoter</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Latitude</th>
                      <th>Longitude</th>                  
                    </tr>
              </thead>
              <tbody v-if="checkins.length > 0">
                <tr v-for="checkin in checkins" :key="checkin.id" class="table-dark-black">
                   <td>{{getFullName(checkin.firstName, checkin.lastName)}}</td>
                   <td>{{ getDate(checkin.datetime)}}</td>
                   <td>{{ getTime(checkin.datetime)}}</td>
                   <td>{{ checkin.latitude }}</td>
                   <td>{{checkin.longitude}}</td>
                </tr>
                                                                               
               </tbody>
            </table>
        </div>
        <!-- end of checkin -->

      </div>
    </div>
    <div class="card flex justify-center">
      <Drawer v-model:visible="costVisible" position="right" 
      :header="viewBid?.thirdPartyDTO?.userDetails.firstName + ' ' + viewBid?.thirdPartyDTO?.userDetails.lastName + ' Costs'" style="width: 40%">
        <div class="card">
					<div class="card-body">
						<div id="invoice">
							<div class="toolbar hidden-print">
                
								<div class="d-flex gap-3 justify-content-end">
                  <button @click="awardJob" :disabled="totalAmount == '00'" type="button" class="d-flex  justify-content-center align-items-center btn maz-gradient-btn">
                    <i class='bx bxs-user-check' ></i><span>Award Job</span></button>
                  <button @click="exportToPDF" type="button" class="d-flex  justify-content-center align-items-center btn maz-gradient-btn">
                    <i class='bx bxs-download' ></i>
                    <span>Download</span>
                  </button>
								</div>
								<hr>
							</div>
							<div class="invoice overflow-auto" id="my-invoice" style="background-color: #fff; color: black" >
								<div style="min-width: 600px">
									<header>
										<div class="row">
											<div class="col">
												<a href="javascript:;">
													<!-- <img src="assets/images/logo-icon.png" width="80" alt=""> -->
												</a>
											</div>
											<div class="col company-details">
												<h2 class="name" >
									<a target="_blank" href="javascript:;">
									{{ viewBid?.thirdPartyDTO?.userDetails.firstName + ' ' + viewBid?.thirdPartyDTO?.userDetails.lastName }}
									</a>
								</h2>
												<!-- <div>110 Caldon Drive, Kempton Park</div> -->
												<div>{{ viewBid?.thirdPartyDTO?.userDetails.phone }}</div>
												<div>{{ viewBid?.thirdPartyDTO?.userDetails.email }}</div>
											</div>
										</div>
									</header>
									<main>
										<table class="table table-hover table-striped">
											<thead>
												<tr>
													<th class="text-primary">#</th>
													<th class="text-left text-dark">Item</th>
													<th class="text-right text-dark">Rate</th>
													<th class="text-right text-dark">Quantity</th>
													<th class="text-right text-dark">TOTAL</th>
												</tr>
											</thead>
											<tbody>
												<tr v-if="viewBid.costs?.length > 0" v-for="(row, index) in viewBid.costs" :key="row + index">
													<td class="text-dark">{{ index + 1 }}</td>
													<td class="text-left text-dark">
														<h3>
										      </h3>
											<a target="_blank" href="javascript:;">
                              {{ row.item }}
									   </a>
                    </td>
													<td class="text-dark">{{ row.rate }}</td>
													<td class="text-dark">{{ row.quantity }}</td>
													<td class="text-dark fw-bold">{{ row.amount }}</td>
												</tr>
                        <tr v-else>
                          <td colspan="7" class="text-danger text-center">No Cost Added</td>
                        </tr>
											</tbody>
											<tfoot>
												<tr>
													<td colspan="2 text-dark"></td>
													<td colspan="2 text-dark ">TOTAL</td>
                          <!-- calculate total amount here -->                           
													<td>R {{ viewBid.costs?.length > 0 ? totalAmount : '00' }}</td>
												</tr>
											</tfoot>
										</table>
									
                    
									</main>
								</div>
								<!--DO NOT DELETE THIS div. IT is responsible for showing footer always at the bottom-->
								<div>

                </div>
							</div>
						</div>
					</div>
				</div>
      </Drawer>

      <Dialog v-model:visible="showPoDocModal" position="top" modal header="Upload PO Document" :style="{ width: '30rem' }">
        <div class="card flex justify-center">
          <FileUploadGeneric 
          docId="view-task-file"
          :showFilePreview="showFilePreview" 
          accept="application/pdf" 
          fileType="pdf" 
          @fileUploaded="onFileChange"
          />
          <button @click="onSubmitPO" type="button" class="btn w-100 maz-gradient-btn">Submit</button>
        </div>
    </Dialog>

    <Drawer v-model:visible="showPreviewBriefSheet" position="right" header="Preview Brief File" class="!w-full md:!w-80 lg:!w-[40rem]" style="width: 30rem!important;">
      <PDF :src="envPath + singleTask?.path" />
  </Drawer>
  </div>
  </Layout>
</template>



<style scoped>

.main-dashboard-head {
  display: flex;
  align-items: center;
}

.page-icon {
  max-width: 4rem !important;
  fill: linear-gradient(to right, #9A3AB1, #117A);
  margin-right: 1rem
}

.maz-height {
  font-size: 3rem;
  height: 7rem;
}

html.dark-theme .widgets-icons {
  color: #fff;
}

.maz-table-row-height {
  height: 55px;
}

.col-width-30 {
  width: 4.5%;
}

.col-width-10 {
  width: 10%;
}

div.gallery {
  margin: 5px;
  border: 1px solid #12181A;
  float: left;
  width: 180px;
}

div.gallery:hover {
  border: 1px solid #777;
}

div.gallery img {
  width: 100%;
  height: auto;
}

.col-img {
  position: relative;
  display: inline-block;
  width: 200px;
  
}

.gallery {
  position: relative;
}

.gallery img {
  width: 100%;
  height: auto;
}

.desc {
  text-align: center;
  padding: 10px;
  font-size: 18px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
}

.checkbox {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background-color: white;
  border: 2px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
  margin: 0;
}

.checkbox input[type="checkbox"]:checked+span {
  background-color: white;
  font-weight: 1000;
  color: black;
  background-color: transparent;
}

div.desc {
  padding: 13px;
  text-align: center;
}

.col-img {
  flex: 0 0 0%;
}

.mt-6 {
  margin-top: 2rem !important;
}

.asc {
  text-align: center;
  background: #12181A;
  width: 180px;
  line-height: 1;
  /* font-size: 1.2rem; */
  font-weight: 600;
}

.maz-table {
  background: #575757;
}

html.dark-theme .table td,
html.dark-theme .table th {
  border-color: #141414;
}

html.dark-theme a {
  color: black;
  text-decoration: none;
}

@media (max-width: 768px) {
  .main-dashboard-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .col-img {
    width: 100%;
  }

  .gallery {
    width: 100%;
  }

  .table-responsive {
    overflow-x: auto;
  }

  .my-table {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* ///////////// */
.img-fluid {
            /* border-radius: 8px; */
            transition: transform 0.2s;
        }

        .img-fluid:hover {
            transform: scale(1.05);
        }

        .container {
            text-align: center;
        }

        @media (max-width: 576px) {
            .col-sm-6 {
                flex: 0 0 100%;
                max-width: 100%;
            }
        }
</style>

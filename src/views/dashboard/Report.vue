<script setup>
import Layout from '../shared/Layout.vue';
import BreadCrumb from '../../components/BreadCrumb.vue';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Image from 'primevue/image';
import { useActivation } from '@/stores/activation';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import ReportTaskTable from '@/components/ReportTaskTable.vue';

const envPath = import.meta.env.VITE_AWS_S3_BUCKET;
const route = useRoute();
const router = useRouter();
const promoters = ref([]);
const timeSheetData = ref([]);
const activationStore = useActivation();
const activationId = ref(route.query.activation);
const activation = ref(null);
const loading = ref(false);
console.log('activationId', activationId.value)
onMounted(() => {
  getActivation();
  });

  watch(() => route.query.activation, () => {
  activationId.value = route.query.activation;
  if (activationId.value) {
    getActivation();
  }
})

const statuses = ref([
    { name: 'Finished', code: 'FINISHED' },
    { name: 'Planned', code: 'PLANNED' },
    { name: 'On Track', code: 'ONTRACK' },
    { name: 'Delayed', code: 'DELAYED' },
    { name: 'At Risk', code: 'ATRISK' }
]);

const getActivation = async () => {
  console.log('activationId', activationId.value)
  loading.value = true;
  activationStore.getActivationReport(activationId.value).then(response => {
    activation.value = response.data;
    loading.value = false;
    
      mountDoghunrt();
      getTimeSheets();
    
  }).catch(error => {
    console.log(error);
  }).finally(() => {
    loading.value = false;
  });
};

const getTimeSheets = async () => {
  activationStore.getTimeSheetReport(activationId.value).then(response => {
    timeSheetData.value = response.data;
      lineChart();    
  }).catch(error => {
    console.log(error);
  }).finally(() => {
    
  });
};


Chart.register(DoughnutController, ArcElement, Tooltip, Legend);
const chartCanvas = ref(null);

const mountDoghunrt = () => {
      const ctx = chartCanvas.value.getContext('2d');

      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Finished', 'Planned', 'On track', 'Delayed', 'At risk'],
          datasets: [
            {
              data: [
              activation.value?.taskStatusCounts.FINISHED,
              activation.value?.taskStatusCounts.PLANNED,
              activation.value?.taskStatusCounts.ONTRACK,
              activation.value?.taskStatusCounts.DELAYED,
              activation.value?.taskStatusCounts.ATRISK,
            ],
              backgroundColor: ['#28a745', '#fd7e14', '#007bff', '#6f42c1', '#dc3545'],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'left',
              color: 'white',
              labels: {
                color: 'white', // Text color
                font: {
                  size: 14, // Text size
                },
              },
            },
            title: {
              display: true,
              text: 'Task by status',
              color: 'white',
            },
          },
        },
      });
    };


    const lineChart = () => {
      const labels = timeSheetData.value?.map(item => item.jobNumber);
    const plannedData = timeSheetData.value?.map(item => item.plannedHours);
    const actualData = timeSheetData.value?.map(item => item.actualHours);
    
    var ctx = document.getElementById('lineChart').getContext('2d');
        new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Planned',
                data: plannedData,
                backgroundColor: [
                    '#FE9947'
                ],
                lineTension: 0,
                borderColor: [
                    '#FE9947'
                ],
                borderWidth: 3
            },
            {
                label: 'Actual',
                data: actualData,
                backgroundColor: [
                    '#A93ABA'
                ],
                tension: 0,
                borderColor: [
                    '#A93ABA'
                ],
                borderWidth: 3
            },]
        },
        options: {
            maintainAspectRatio: false,
            barPercentage: 0.6,
            categoryPercentage: 0.5,
            plugins: {
				legend: {
					position:'bottom',
					display: true,
				}
			},
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
const exporting = ref(false);
const exportToPDF = () => {
  exporting.value = true;
  activationStore.exportToPDF('pdf',activation.value).then(response => {
    exporting.value = false;
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'report.pdf');
    document.body.appendChild(link);
    link.click();
  }).catch(error => {
    exporting.value = false;
    console.log(error);
  }).finally(() => {
    exporting.value = false;
  });
}

</script>
<template>
  <Layout>
    <!--start page wrapper -->
    <div class="page-wrapper">
      <div class="page-content">
        <BreadCrumb title="Report" icon="bx bx-line-chart" />
        <div class="row row-cols-xl-9">
          <div class="d-flex align-items-center justify-content-between ms-2">
            <h4 class="mb-2 ml-2">{{ activation?.name }}</h4>
            <div class="align-self-end mb-4">
              <button type="button" :disabled="exporting"
              @click="exportToPDF" class="btn rounded-0 btn-primary">{{ exporting ? 'Downloading...' : 'Download report' }}</button></div>
          </div>
          <div class="ms-2">
            <h4 class="mb-2 ml-2">Team</h4>
          </div>

          <div class="row row-cols-auto g-3">
            <div class="col" v-if="activation?.team?.length > 0" v-for="team in activation?.team" :key="team.id">
              <div class="gallery">
                <div class="asc py-3">{{ team.firstName }} {{ team.lastName }}</div>
                <router-link :to="`${ team.staff ? '/staff-profile/' + team.staff + '/' + team?.id : '#!' }`">
                  <img :src="team.path ? envPath + team.path : `https://ui-avatars.com/api/?name=${ team.firstName + ' ' + team.lastName }&background=random`" alt="Cinque Terre" class="img-fluid">
                </router-link>
              </div>
            </div>
            
            <div class="col-12" v-else>
              <div class="text-center" :class="loading ? 'text-success' : 'text-danger'" >{{ loading ? 'Loading...' : 'No data found.'}}</div>
            </div>
           
          </div>
       
        </div>

        <div class="row mt-6 row-cols-xl-9 gap-4 d-none">
          <div class="">
            <h4 class="mb-2 ml-2">Available Promoters</h4>
          </div>
          <div v-for="user in promoters" :key="user.id" class="col-img">
            <div  class="gallery">
            
                <div class="card flex justify-center">
                  <Image alt="Image" preview>
                      <template #previewicon>
                        <i class='bx bx-search-alt-2' ></i>
                      </template>
                      <template #image>
                          <img src="https://primefaces.org/cdn/primevue/images/galleria/galleria11.jpg" alt="image" width="250" />
                      </template>
                      <template #preview="slotProps">
                          <img src="https://primefaces.org/cdn/primevue/images/galleria/galleria11.jpg" alt="preview" :style="slotProps.style" @click="slotProps.onClick" />
                      </template>
                  </Image>
                  </div>
             
              <div class="checkbox">
                <input type="checkbox" id="select">
                <span>&#x2713;</span>
              </div>
              <div>
                <div class="desc cursor-pointer" >
                  {{ user.firstName }} {{ user.lastName }}</div>
                <div>
                  <!-- <button class="btn btn-primary rounded-0 w-100">Add</button> -->
                </div>
              </div>
            </div>
          </div>
    
         
        </div>

        <h4 v-if="activation?.promoters?.length > 0" class="ml-2 mt-6">Promoters on job</h4>
        <div v-if="activation?.promoters?.length > 0" class="row row-cols-auto g-3 ">
          <div class="col" v-for="prom in activation?.promoters" :key="prom.id">
            <div class="gallery">
              <router-link :to="`/profile/${ prom?.id }/${ prom.userDetails?.id }`">
                <img :src="prom.userDetails?.path ? envPath + prom.userDetails?.path : `https://ui-avatars.com/api/?name=${ prom.userDetails?.firstName + ' ' + prom.userDetails?.lastName }&background=random`" alt="Cinque Terre" class="img-fluid">
              </router-link>
              <div>
                <div class="desc">{{ prom.userDetails?.firstName + ' ' + prom.userDetails?.lastName }}</div>
              </div>
            </div>
          </div>
          <!-- <div class="col-12" v-else>
            <div class="text-center" :class="loading ? 'text-success' : 'text-danger'" >{{ loading ? 'Loading...' : 'No promoters found.'}}</div>
          </div> -->
        </div>

     
      </div>

      <div v-if="activation?.tasks?.length > 0" class="col-12 col-lg-12 mt-4 mb-6 ps-3" style="margin-left: 300px;">
        <h2 class="mb-4"><i class='bx bx-check-circle text-primary'></i> Completed:</h2>
      </div>

      <div v-if="activation?.tasks?.length > 0" class="row" style="margin-left: 300px;">
        <div class="col-xl-4 col-lg-12 col-md-12 col-sm-12">
          <div class="card radius-10">
            <div class="card-body" >
                <canvas ref="chartCanvas"></canvas>
            </div>
          </div>
        </div>

        <div class="col-xl-8 col-lg-12 col-md-12 col-sm-12" >
         
          <ReportTaskTable :activation="activation?.name" :tasks="activation?.tasks" :statuses="statuses"/>  
        </div>

        <div class="col-12 col-lg-12">
          <div class="card radius-10">
              <div class="card-header">
                  <div class="d-flex align-items-center">
                      <div>
                          <h6 class="mb-0">Total Time vs actual hours spent</h6>
                      </div>
                      <div class="dropdown ms-auto"></div>
                  </div>
              </div>
              <div class="card-body">
                  <div class="chart-container1">
                  <canvas id="lineChart" width="1301" height="380" style="display: block; box-sizing: border-box; height: 380px; width: 1301px;"></canvas>
                </div>
              </div>
           </div>
      </div>


      </div>

      <div class="card bg-primary p-5 d-none">
        <div class="card-body">
          <div class="my-table" style="padding-left: 7rem;padding-right: 7rem;">
            <div class="col-12">
              <h3 class="text-center fs-2 bg-gray">Post campaign analysis</h3>
            </div>
            <table class="table table-bordered mb-0 maz-table">
              <thead>
                <tr>
                  <th scope="col">JOBS</th>
                  <th scope="col">COMMENT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Reported By</td>
                  <td>Mazisi Msebele</td>
                </tr>
                <tr>
                  <td>What worked</td>
                  <td>
                    <ol>
                      <li style="list-style:disc;">MC shoutouts, drive interest and sales</li>
                      <li style="list-style:disc;">Price point packages to be reconsidered for some venues - As seen
                        with Milano, it produces good results - All venues that have price points & specials that accommodate the affordability of the crowd always have good sales</li>
                      <li style="list-style:disc;">Good sales reps and venue relationships (Drama, Nostra, Milano, Liv Sandton, Groove</li>
                      <li style="list-style:disc;">Tales</li>
                    </ol>
                  </td>
                </tr>
                <tr>
                  <td>What didn't work</td>
                  <td>
                    <ol>
                      <li style="list-style:disc;">Club refused to play AV as they were promoting their content</li>
                      <li style="list-style:disc;">Club manager bought 12 bottles to win the 3L bottles and did not
                        consume the purchased 12 bottles throughout the night</li>
                      <li style="list-style:disc;">Insisted on full kit to be used for set up (Delayed set up by an
                        hour)</li>
                    </ol>
                  </td>
                </tr>

                <tr>
                  <td>Suggestions</td>
                  <td>
                    <ol>
                      <li style="list-style:disc;">Clear comms and expectations between venue and sales reps</li>
                      <li style="list-style:disc;">Review venue selections for next activation round</li>
                    </ol>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="mt-2 text-center cursor-pointer d-flex justify-content-center align-items-center">
              <span>Load More</span>
              <i class='bx bx-chevron-down fs-2'></i>
            </div>
          </div>
        </div>
      </div>

      <div class="card radius-10 w-100 d-none">
        <div class="card-header">
          <div class="d-flex align-items-center justify-content-center">
            <h6 class="mb-0 text-center fs-2">Overall Summary</h6>
          </div>
        </div>
        <div class="card-body">
          <div class="chart-container1">
            <canvas id="chart8" width="1301" height="380" style="display: block; box-sizing: border-box; height: 380px; width: 1301px;"></canvas>
          </div>
        </div>
      </div>

      <h4  v-if="activation?.images?.length > 0" class="mb-2 my-6 ml-2" style="margin-left: 300px;">Gallery</h4>
      <div  v-if="activation?.images?.length > 0" class="row  row-cols-auto g-3" style="margin-left: 300px;">
        <div class="col" v-for="image in activation?.images" :key="image.id">
          <div class="card">
            <Image :src="envPath+image.path" alt="Image" width="250" preview  />
          </div>
        </div>
      </div>

      <div class="row my-6 row-cols-xl-9 d-none">
      
        <div class="mt-2 text-center cursor-pointer d-flex justify-content-center align-items-center">
          <span>Load More</span>
          <i class='bx bx-chevron-down fs-2'></i>
        </div>
      </div>

      
       <!-- <div class="row mt-6 row-cols-xl-9 row ms-3 me-3">
            <div class="my-4">
              <h4 class="">Gallery</h4>
            </div>
            <div v-for="i in 12" class="col-lg-4 col-md-3 col-sm-6">
                <img src="../../assets/images/avatars/avatar-1.png" class="img-fluid" alt="Image 1">
            </div>
      </div> -->
    </div>
    <!--start switcher-->
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

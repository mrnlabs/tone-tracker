<template>
	<Layout>
		<!--start page wrapper -->
		<div class="page-wrapper">
			<div class="page-content">

				<!-- <BreadCrumb title="Status" icon="bx bx-notepad"/> -->
				<div class="status mb-3 d-flex justify-content-flex-start align-items-center gap-3">
					<svg class="status-icon" width="53" height="71" viewBox="0 0 53 71" fill="none"
						xmlns="http://www.w3.org/2000/svg">
						<path
							d="M46.039 9.45831H35.1536C35.1536 4.65513 31.2484 0.75 26.4453 0.75C21.6421 0.75 17.7369 4.65513 17.7369 9.45831H6.85155C3.24576 9.45831 0.320312 12.3838 0.320312 15.9895V63.8853C0.320312 67.4911 3.24576 70.4165 6.85155 70.4165H46.039C49.6447 70.4165 52.5702 67.4911 52.5702 63.8853V15.9895C52.5702 12.3838 49.6447 9.45831 46.039 9.45831ZM13.3828 58.4426C11.5731 58.4426 10.1172 56.9867 10.1172 55.177C10.1172 53.3673 11.5731 51.9113 13.3828 51.9113C15.1925 51.9113 16.6484 53.3673 16.6484 55.177C16.6484 56.9867 15.1925 58.4426 13.3828 58.4426ZM13.3828 45.3801C11.5731 45.3801 10.1172 43.9242 10.1172 42.1145C10.1172 40.3048 11.5731 38.8489 13.3828 38.8489C15.1925 38.8489 16.6484 40.3048 16.6484 42.1145C16.6484 43.9242 15.1925 45.3801 13.3828 45.3801ZM13.3828 32.3176C11.5731 32.3176 10.1172 30.8617 10.1172 29.052C10.1172 27.2423 11.5731 25.7864 13.3828 25.7864C15.1925 25.7864 16.6484 27.2423 16.6484 29.052C16.6484 30.8617 15.1925 32.3176 13.3828 32.3176ZM26.4453 6.1927C28.255 6.1927 29.7109 7.64862 29.7109 9.45831C29.7109 11.268 28.255 12.7239 26.4453 12.7239C24.6356 12.7239 23.1796 11.268 23.1796 9.45831C23.1796 7.64862 24.6356 6.1927 26.4453 6.1927ZM43.8619 56.2655C43.8619 56.8642 43.372 57.354 42.7733 57.354H23.1796C22.5809 57.354 22.0911 56.8642 22.0911 56.2655V54.0884C22.0911 53.4897 22.5809 52.9999 23.1796 52.9999H42.7733C43.372 52.9999 43.8619 53.4897 43.8619 54.0884V56.2655ZM43.8619 43.203C43.8619 43.8017 43.372 44.2916 42.7733 44.2916H23.1796C22.5809 44.2916 22.0911 43.8017 22.0911 43.203V41.026C22.0911 40.4273 22.5809 39.9374 23.1796 39.9374H42.7733C43.372 39.9374 43.8619 40.4273 43.8619 41.026V43.203ZM43.8619 30.1406C43.8619 30.7393 43.372 31.2291 42.7733 31.2291H23.1796C22.5809 31.2291 22.0911 30.7393 22.0911 30.1406V27.9635C22.0911 27.3648 22.5809 26.8749 23.1796 26.8749H42.7733C43.372 26.8749 43.8619 27.3648 43.8619 27.9635V30.1406Z"
							fill="url(#paint0_linear_56_20234)" />
						<defs>
							<linearGradient id="paint0_linear_56_20234" x1="0.320312" y1="70.4165" x2="52.5705"
								y2="70.4165" gradientUnits="userSpaceOnUse">
								<stop offset="1" stop-color="#0480D4" />
								<stop stop-color="#A83BBA" />
							</linearGradient>
						</defs>
					</svg>
					<h5 class="Status-title">Status</h5>
				</div>


				<div class="row">

					<div class="col-12 col-lg-12 d-flex">
						<div class="card p-0 radius-10 w-100">
							<div class="card-header p-0 mb-0 card-background">
								<div class="d-flex  align-items-center">
									<div>
										<h5 class="mb-0">View Live status</h5>
									</div>
									<div class="dropdown ms-auto">
										<button type="button" :disabled="exporting"
                                        @click="exportToPDF" class="btn rounded-0 btn-primary">
										{{ exporting ? 'Downloading...' : 'Download report' }}
									   </button>
									</div>
								</div>
							</div>
							<div class="card-body">
								<div class="table-responsive table table-hover table-dark table-striped">
									<table class="table align-middle mb-0">
										<thead class="table-dark-custom">
											<tr>
												<th class="col-width-30">Regions Activated</th>
												<th class="col-width-10 text-center">Status</th>
												<th class="col-width-10 text-center">Progress</th>
											</tr>
										</thead>
										<tbody>
											<tr v-if="campaignData?.activations?.length > 0" v-for="activation in campaignData?.activations" :key="activation.id" class="maz-table-row-height">
												<td class="table-dark-custom-2">{{activation?.name}}</td>
												<td style="background-color: #A639B6;" class="text-center" 
												:class="{ 'bg-activated': activation?.status === 'To Be Activated', 
												 'bg-to-be-activated': activation?.status === 'Activated' }">
													{{ activation?.status }}
												</td>
												<td class="text-center table-dark-custom-2">{{ activation?.progress }}%</td>
											</tr>
											<tr v-else>
												<td colspan="3" class="text-center text-danger">{{ loading ? 'Loading...' : 'No activations found' }}</td>
											</tr>

											
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="row mx-auto" v-if="campaignData?.activations?.length > 0">
                    <div class="col-12 col-lg-12">
                        <div class="card radius-10">
                            <div class="card-header">
                                    <div class="row">
										<div class="col-4">
											<h6 class="mb-0 ">Activation Progress</h6>
										</div>
                                        
                                    </div>
                            </div>
                            <div class="card-body row">
                                <div class="col-12">
                                    <canvas id="horizontalChart" width="1301" height="380" style="display: block; box-sizing: border-box; height: 380px; width: 1301px;"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
				<div v-if="campaignData?.activations?.length > 0">
					<h5 class="mb-3">Campaign report</h5>
				</div>

				<div class="row row-cols-1 row-cols-md-2 row-cols-xl-4">
					<div class="col" v-if="campaignData?.activations?.length > 0" v-for="activation in campaignData?.activations" :key="activation.id">
						<div class="card card-radius radius-10 maz-gradient-btn">
							<div class="card-body">
								<div class="d-flex align-items-center">
									<div>
										<router-link :to="`/report?activation=${activation?.id}`">
											<h4 class="my-1 text-white text-center">Report For {{activation?.name}}</h4>
										</router-link>
									</div>
									<div class="text-white ms-auto font-35">
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

			</div>
		</div>
		<!--start switcher-->

	</Layout>
</template>
<script setup>
import Layout from '../shared/Layout.vue';
import BreadCrumb from '../../components/BreadCrumb.vue';
import { onMounted, ref, watch } from 'vue';
import { useCampaignStore } from '@/stores/useCampaign';
import { useRoute } from 'vue-router';

const route = useRoute();
const campaignId = ref(route.query.campaign);
const campaign = useCampaignStore();
const loading = ref(false);
const campaignData = ref(null);

watch(() => route.query.campaign, () => {
	campaignId.value = route.query.campaign;
	if (campaignId.value) {
		getReport();
	}
})
onMounted(() => {
	getReport();
})

const getReport = () => {
	loading.value = true;
	campaign.getStatusReport(campaignId.value).then(function (response) {
		campaignData.value = response.data;
		loading.value = false;
		horizontalChart();
	})
}


const horizontalChart = () => {
    const labels = campaignData.value?.activations.map(activation => activation.name);
    const progressData = campaignData.value?.activations.map(activation => Math.floor(activation.progress));

    var ctx = document.getElementById('horizontalChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,  
            datasets: [{
                label: 'Activation Progress',
                data: progressData,  
                backgroundColor: '#8D40B4',
                borderColor: '#8D40B4',
                borderWidth: 0
            }]
        },
        options: {
            maintainAspectRatio: false,
            barPercentage: 0.5,
            categoryPercentage: 0.7,
            indexAxis: 'y',  // Horizontal bar chart
            plugins: {
                legend: {
                    position: 'bottom',
                    display: true,
                }
            },
			scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'white',
                    }
                },
                x: {
					min: 0,   // Force x-axis to start at 0
                    max: 100,
                    ticks: {
                        color: 'white',
						// stepSize: 10
                    }
                }
            }
        }
    });
};
const exporting = ref(false);
const exportToPDF = () => {
  exporting.value = true;
  campaign.exportToPDF('pdf',campaignData.value).then(response => {
    exporting.value = false;
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Status_Report.pdf');
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
<style scoped>
.status-icon {
	max-width: 6rem !important;
	/* margin-bottom: 20px; */

}



.status h5 {
	/* font-family: poppins !important; */
	font-size: 6rem !important;
}

.dark-theme p {
	font-size: 90px !important;
	font-weight: 300 !important;

}

.maz-height {
	font-size: 3rem;
	height: 7rem;
}

.widgets-icons {
	width: 60px;
	height: 60px;
	background-color: #12181A;
	font-size: 56px;
	color: green;
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

/* ////////////////// */
.card-radius {
	border-radius: 10px !important;
}

.p-0 {
	padding: 0 !important;
}

.card-background {
	background-color: #0F0F0F !important;
	padding-bottom: 15px !important;
}

.table-dark-custom {
	background-color: #222222 !important;
}

.table-dark-custom-1 {
	background-color: #0F0F0F !important;
}

.table-dark-custom-2 {
	background-color: #575757 !important;
}

.table,
.table th,
.table td {
	border: none;
	border-color: transparent;
}

.bg-activated{
	background-color: #1E90D9 !important;
}

.bg-to-be-activated{
	background-color: #A639B6 !important;
}
</style>

<template>
    <Layout>
		<!--start page wrapper -->
		<div class="page-wrapper">
			<div class="page-content">

				<BreadCrumb title="Budget" icon="bx bx-calculator"/>
                <div>
                    <!-- <h5>Date: July - August 2024</h5>
                    <h6>(16 Week Period)</h6> -->
                </div>

                <div class="row mt-4">
                    <div class="col-12 col-lg-12 d-flex">
                       <div class="card radius-10 w-100">
                         <div class="card-header mb-3">
                             <div class="d-flex align-items-center">
                                 <div>
                                    <select class="form-select form-select-sm bg-maz-light" aria-label=".form-select-sm example">
										<option selected="selected">July</option>
										<option value="1">August</option>
										<option value="2">September</option>
									</select>
                                 </div>

								 <div class="dropdown ms-auto">
                                    
                                 </div>
                                 <div class="dropdown ms-auto">
                                    <div>
                                        <h6 class="mb-0">Revenue (In Rands)</h6>
                                    </div>
                                 </div>
								 <div class="dropdown ms-auto">
                                    
                                 </div>
								 <div class="dropdown ms-auto">
                                    <!-- <select class="form-select form-select-sm bg-maz-light" aria-label=".form-select-sm example">
										<option selected="selected">Daily</option>
										<option value="1">Weekly</option>
									</select> -->
                                 </div>
                             </div>
                         </div>
                           <div class="card-body">
                            <div class="chart-container1">
                                <canvas id="timesheet-graph" width="1301" height="380" style="display: block; box-sizing: border-box; height: 380px; width: 1301px;"></canvas>
                            </div>
                           </div>
                           
                       </div>
                    </div>
                  
                 </div>




                <div class="row mt-4 d-none">
                    <div class="col-12 col-lg-12 d-flex">
                       <div class="card radius-10 w-50">                      
                           <div class="card-body">
                            <div class="chart-container1">
                                <canvas id="itemsSold" width="1301" height="380" style="display: block; box-sizing: border-box; height: 380px; width: 1301px;"></canvas>
                            </div>
                           </div>                           
                       </div>
                       <div class="card radius-10 w-50">  
							<div class="card-body">
								<div class="chart-container1">
									<canvas id="costPerElement" width="1301" height="380" style="display: block; box-sizing: border-box; height: 380px; width: 1301px;"></canvas>
								</div>
							</div>
					                        
                    </div>
                    </div>
                  
                 </div>


                 <div class="row mt-4 d-none">
                    <div class="col-12 col-lg-12 d-flex">
                       <div class="card radius-10">                      
                           <div class="card-body">
                            <div class="chart-container1">
                                <canvas id="numberOfActivations" width="1301" height="380" style="display: block; box-sizing: border-box; height: 380px; width: 1301px;"></canvas>
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
import { onMounted, ref } from 'vue';
import { useCampaignStore } from '@/stores/useCampaign';

const campaignStore = useCampaignStore();
const timeSheetData = ref(null);

    onMounted(() => {
        getTimeSheets();
    });

    const getTimeSheets = async () => {
  campaignStore.getTimeSheetReport(2).then(response => {
    timeSheetData.value = response.data;
    budgetChart();    
  }).catch(error => {
    console.log(error);
  }).finally(() => {
    
  });
};

const getMonthName = (monthNumber) => {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return monthNames[monthNumber - 1];
};


const budgetChart = () => {
    
    const labels = timeSheetData.value?.map(item => getMonthName(item[0])); 
    const budgetData = timeSheetData.value?.map(item => item[1]); 

    var ctx = document.getElementById('timesheet-graph').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,  
            datasets: [{
                label: 'Budget',
                data: budgetData, 
                backgroundColor: '#0d6efd',
                borderColor: '#0d6efd',
                borderWidth: 3,
                backgroundColor: 'rgb(154,58,177)',
            }]
        },
        options: {
            maintainAspectRatio: false,
            barPercentage: 0.6,
            categoryPercentage: 0.5,
            plugins: {
                legend: {
                    position: 'bottom',
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
};


</script>
<style>
.maz-height{
	font-size: 3rem;
}
.activation-list-item {
    font-size: 13px;
}

.legend {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .legend-item {
    display: flex;
    align-items: center;
  }
  .legend-color {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }
  .non-billable {
    background-color: #8e44ad; /* Purple color */
  }
  .billable {
    background-color: #3498db; /* Blue color */
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
.maz-table-row-height{
	height: 55px;
}
.bg-maz-light{
	background: #6F7070 !important;
	color: #fff !important;
	width: 150px;
	border: 0;
	border-radius: 0;
	font-weight: 600;
}

.card-header {
    padding: 0px !important;
}
</style>
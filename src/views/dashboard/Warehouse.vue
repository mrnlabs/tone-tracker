<template>
    <Layout>
		<!--start page wrapper -->
		<div class="page-wrapper">
			<div class="page-content">

				<BreadCrumb title="Warehousing" icon="bx bxs-school"/>
				<h4 class="mb-4">Chivas Grade Africa Collection</h4>

                <div class="row">
					<div class="col-lg-1"></div>
                    <div class="col-lg-3 col-md-6">
						<div class="gradient-card">
						  <div class="content">
							<strong>Region:</strong> Gauteng Central<br>
							<strong>Number of storage units:</strong> 100 units<br>
							<strong>Capacity:</strong> 50%<br>
							<strong>Number of items:</strong> 1500
						  </div>
						</div>
					  </div>
					  <div class="col-lg-3 col-md-6">
						<div class="gradient-card">
						  <div class="content">
							<strong>Region:</strong> Western Region<br>
							<strong>Number of storage units:</strong> 200 units<br>
							<strong>Capacity:</strong> 40%<br>
							<strong>Number of items:</strong> 2000
						  </div>
						</div>
					  </div>
					  <div class="col-lg-3 col-md-6">
						<div class="gradient-card">
						  <div class="content">
							<strong>Region:</strong> Eastern Region<br>
							<strong>Number of storage units:</strong> 100 units<br>
							<strong>Capacity:</strong> 85%<br>
							<strong>Number of items:</strong> 4000
						  </div>
						</div>
					  </div>
                  
                 </div>


				 <div class="row mt-4">
					<div class="col-lg-1"></div>
                    <div class="col-lg-3 col-md-6">
						<select class="form-select form-select-sm bg-maz-light" aria-label=".form-select-sm example">
							<option value="1" selected="selected">Unit 1</option>
							<option value="2">Unit 2</option>
							<option value="3">Unit 3</option>
						</select>
					  </div>
					  <div class="col-lg-4 col-md-6">
						
					  </div>
					  <div class="col-lg-3 col-md-6">
						<div class="container ">
							<div class="search-container">
							  <input type="text" class="form-control search-input" placeholder="Search for item">
							  <i class="bx bx-search search-icon"></i>
							</div>
						  </div>
					  </div>
					  <div class="col-lg-1"></div>
                 </div>
				
				

				 <div class="row mt-4 ">
					<div class="col-lg-1"></div>
					<div class="col-12 col-lg-3">
						<div class="card radius-10">
							 <div class="card-body">
								<div class="card card-custom">
									<h5>Stock check</h5>
									<p class="text-light"><strong>Storage Capacity:</strong> 50%</p>
									<p class="text-light"><strong>Days since last check:</strong> 15 Days</p>
									<p class="text-light"><strong>Checked by:</strong> Tumelo Moloka</p>
								  </div>
							
								  <div class="card card-custom">
									<h5>Inventory accuracy</h5>
									<div class="chart-container">
									  <canvas id="inventoryAccuracyChart"></canvas>
									</div>
								  </div>
							 </div>
						</div>
					</div>


					<div class="col-12 col-lg-6 d-flex">
						<div class="card radius-10 w-100">
						  <div class="card-header">
							  <div class="d-flex align-items-center">
								  <div>
									  <h6 class="mb-0">In Stock</h6>
								  </div>
								  <div class="dropdown ms-auto">
									 
								  </div>
							  </div>
						  </div>
						  <div class="card-body row  mx-2">
							<div class="table-responsive table table-dark table-striped w-50">
								<table class="table align-middle mb-0">
								 <thead class="table-light">
								  <tr style="background:#1D2126">
									<th>Description</th>
									<th>Number</th>
								  </tr>
								  </thead>
								  <tbody>
									<tr class="maz-table-row-height">
								   <td>Green T-shirts</td>
								   <td>58</td>
								  </tr>
			   
								  <tr class="maz-table-row-height">
								   <td>Green Golfer</td>
								   <td>20</td>
								  </tr>
			   
								  <tr class="maz-table-row-height">
								   <td>Black Cardigans</td>
								   <td>68</td>
								  </tr>
			   
								  <tr class="maz-table-row-height">
								   <td>Project 4</td>
								   <td>37</td>
								  </tr>
								  <tr class="maz-table-row-height">
								   <td>Green Cardigans</td>
								   <td>92</td>
								  </tr>
								 </tbody>
							   </table>
							 </div>
							 <div class="table-responsive table table-dark table-striped w-50">
								<table class="table align-middle mb-0">
								 <thead class="table-light">
								  <tr style="background:#1D2126">
									<th>Description</th>
									<th>Number</th>
								  </tr>
								  </thead>
								  <tbody>
									<tr class="maz-table-row-height">
								   <td>Bottles</td>
								   <td>52</td>
								  </tr>
			   
								  <tr class="maz-table-row-height">
								   <td>Ice Buckets</td>
								   <td>20</td>
								  </tr>
			   
								  <tr class="maz-table-row-height">
								   <td>Wall Banners</td>
								   <td>68</td>
								  </tr>
			   
								  <tr class="maz-table-row-height">
								   <td>Cushions</td>
								   <td>72</td>
								  </tr>
								  <tr class="maz-table-row-height">
								   <td>Flute</td>
								   <td>24</td>
								  </tr>
								  <tr class="maz-table-row-height">
									<td>Uniforms</td>
									<td>39</td>
								   </tr>
								   <tr class="maz-table-row-height">
									<td>Ring Lights</td>
									<td>54</td>
								   </tr>
								 </tbody>
							   </table>
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
import { onMounted } from 'vue';

onMounted(() => {
	
})
</script>

<style scoped>
.width-50{
	width: 50%;
}

.gradient-card {
	border-radius: 10px;
	padding: 20px;
	color: white;
	position: relative;
	overflow: hidden;
  }
  .gradient-card::before {
	content: '';
	position: absolute;
	top: -5px;
	left: -5px;
	right: -5px;
	bottom: -5px;
	z-index: -1;
	background: linear-gradient(135deg, #8e44ad, #3498db);
	border-radius: 15px;
  }
  .gradient-card .content {
	background: #0E0C19;
	border-radius: 10px;
	padding: 12px;
	z-index: 1;
  }

  .search-container {
	position: relative;
	display: inline-block;
  }

  .search-input {
	width: 100%;
	padding-right: 40px; /* Adjust padding to fit the icon */
	padding-left: 10px; /* Optional: adjust left padding for better appearance */
	border: 0;
	border-radius: 5px;
	height: 35px;
	background-color: #1e1e1e; /* Match the background color */
	color: white;
  }

  .search-input::placeholder {
	color: #bbb;
  }

  .search-icon {
	position: absolute;
	right: 10px;
	top: 50%;
	transform: translateY(-50%);
	color: #bbb;
	cursor: pointer;
  }

  .search-input:focus + .search-icon {
	display: none;
  }

  .search-input:focus {
	outline: none;
	border-color: #3498db; /* Change border color on focus */
  }

  .card-custom {
	background-color: #1e1e1e;
	color: #ffffff;
	border-radius: 10px;
	padding: 20px;
	margin: 20px 0;
  }

  .card-custom h5,
  .card-custom p {
	margin-bottom: 10px;
  }

  input::placeholder {
	color: #bbb;
  }

</style>
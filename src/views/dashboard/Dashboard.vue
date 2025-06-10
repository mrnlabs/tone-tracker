<script setup>
import Layout from '../shared/Layout.vue';
import BreadCrumb from '../../components/BreadCrumb.vue';
import { onMounted, ref } from 'vue';
import { useClientStore } from '@/stores/useClient';
import { useActivation } from '@/stores/activation';
import { useTask } from '@/stores/task';
import { useRoute, useRouter } from 'vue-router';
import TaskTable from '@/components/TaskTable.vue';

const route = useRoute();
const router = useRouter();


const selectedClient = ref('');

const tasks = ref([]);
const activations = ref([]);
const clients = ref([]);


const clientStore = useClientStore();
const taskStore = useTask();
const activation = useActivation();
onMounted(() => {
    getActivations();
    getTasks();
	getAllClients();
});

const statuses = ref([
    { name: 'Finished', code: 'FINISHED' },
    { name: 'Planned', code: 'PLANNED' },
    { name: 'On Track', code: 'ONTRACK' },
    { name: 'Delayed', code: 'DELAYED' },
    { name: 'At Risk', code: 'ATRISK' }
]);

const getTasks = async () => {
  taskStore.getTasks().then(response => {
    tasks.value = response.data.content;
  }).catch(error => {
    toaster.error("Error fetching tasks");
    console.log(error);
  }).finally(() => {
    //
  });
};

const getActivations = async () => {
	activation.getActivations().then(function (response) {
		activations.value = response.data.content
	}).catch(function (error) {
		toaster.error("Error fetching activations");
		console.log(error);
	}).finally(function () {
		//
	})
  }

const getAllClients = () => {
  clientStore.getClients().then(function (response) {
    clients.value = response.data.content;
  }).catch(function (error) {
    toaster.error("Error fetching users");
    console.log(error);
  }).finally(function () {
    ///
  })
}


const onClientChange = (event) => {
	let client = selectedClient.value;
	const currentPath = route.path;
	router.push({ path: currentPath, query: { client } });
}

</script>
<template>
	<Layout>
		<!--start page wrapper -->
		<div class="page-wrapper">
			<div class="page-content">

				<!-- <BreadCrumb title="Welcome" icon="bx bx-user-pin"/> -->
				<div class="main-dashboard-head">
					<span>
						<svg class="welcome-icon" width="73" height="107" viewBox="0 0 73 107" fill="none"
							xmlns="http://www.w3.org/2000/svg">
							<path
								d="M17.4627 58.6497C17.4469 59.031 17.452 59.4144 17.4121 59.7931C16.3844 69.5839 15.3563 79.3747 14.3017 89.4136C12.6707 104.938 41.3017 108.051 42.9565 92.2809C44.2057 80.3764 45.481 68.1992 46.7517 56.0215C46.8379 55.194 47.1247 54.7203 47.8652 54.296C53.8559 50.864 57.9977 45.8055 60.6264 39.4731C63.0791 33.5651 63.8636 27.3699 63.5551 21.0275C63.4289 18.4302 63.1622 15.8309 62.7924 13.2569C62.484 11.1099 60.3762 9.60832 58.317 9.83717C56.0492 10.0888 54.3695 11.893 54.4749 14.1382C54.5619 15.994 54.8712 17.8381 54.9923 19.6937C55.438 26.5276 54.768 33.1688 51.2531 39.2361C49.352 42.5172 46.7871 45.1737 43.4447 47.0405C42.7651 47.4202 42.1073 47.5795 41.3211 47.4934C35.7918 46.8869 30.241 46.4466 24.7318 45.6988C19.4171 44.977 15.4139 47.0156 12.1626 50.9871C9.71635 53.9749 8.11578 57.423 6.90012 61.0533C3.90404 70.0015 2.89231 79.2812 2.38696 88.6391C2.32871 89.7176 2.24419 90.835 2.45157 91.8787C2.85207 93.8939 4.7177 95.1046 6.89251 94.9662C8.82105 94.8432 10.485 93.317 10.671 91.3596C11.0917 86.9346 11.344 82.4909 11.8666 78.0791C12.4676 73.0067 13.4347 67.9894 15.192 63.1685C15.7626 61.6036 16.5041 60.1011 17.1675 58.5702C17.2659 58.5968 17.3643 58.6231 17.4627 58.6497Z"
								fill="url(#paint0_linear_56_4773)" />
							<path
								d="M33.5678 43.6028C40.1543 44.3172 46.0606 39.5661 46.7562 32.9942C47.4513 26.4264 42.6713 20.5251 36.0955 19.8329C29.5243 19.1412 23.5951 23.9516 22.9413 30.5057C22.286 37.0729 27.0069 42.891 33.5678 43.6028Z"
								fill="url(#paint1_linear_56_4773)" />
							<path
								d="M68.7971 20.7601C68.6043 20.874 68.3567 20.9481 68.3511 21.0373C68.3349 21.2972 68.3623 21.5873 68.4678 21.823C68.7913 22.5466 69.2804 23.2172 69.4839 23.9687C69.8665 25.3798 69.3154 26.6037 68.4084 27.6835C68.2614 27.8583 68.0302 27.9947 67.9591 28.1924C67.8647 28.4549 67.8891 28.7603 67.8624 29.0472C68.1384 29.0152 68.4875 29.0803 68.679 28.9362C70.3808 27.6534 71.1199 25.1813 70.3823 23.1428C70.1429 22.4821 69.7388 21.8765 69.3712 21.2689C69.2489 21.0675 69.0056 20.9394 68.7971 20.7601Z"
								fill="url(#paint2_linear_56_4773)" />
							<path
								d="M48.8152 10.0229C48.821 10.509 48.7705 11.0058 48.8586 11.4763C48.8982 11.687 49.2166 11.8456 49.4082 12.0276C49.5787 11.8029 49.8594 11.5947 49.8959 11.3501C49.9755 10.8199 49.8488 10.2553 49.9502 9.73229C50.286 7.99474 51.349 6.89813 53.0572 6.43174C53.333 6.35607 53.6449 6.33896 53.8749 6.19229C54.0813 6.06082 54.1984 5.78828 54.3546 5.57772C54.1098 5.44041 53.8547 5.16791 53.622 5.18607C51.1087 5.38246 49.0953 7.44372 48.8152 10.0229Z"
								fill="url(#paint3_linear_56_4773)" />
							<path
								d="M51.2796 10.8601C51.3063 11.0614 51.3268 11.5227 51.4439 11.9578C51.4898 12.1283 51.7999 12.3826 51.9061 12.3474C52.1 12.2832 52.2692 12.0511 52.3762 11.8506C52.4483 11.7158 52.3953 11.5144 52.3991 11.343C52.4363 9.68319 52.8526 9.12814 54.3742 8.50595C54.6663 8.38661 54.8533 8.00948 55.0886 7.75145C54.7336 7.67082 54.3496 7.46032 54.0285 7.53191C52.5577 7.859 51.4604 9.14364 51.2796 10.8601Z"
								fill="url(#paint4_linear_56_4773)" />
							<path
								d="M68.1476 25.2698C68.123 24.0197 67.7127 23.0642 66.9532 22.2618C66.791 22.0909 66.4259 22.1125 66.154 22.0455C66.142 22.3273 66.005 22.7111 66.1382 22.8751C67.2144 24.2014 67.1976 25.4562 66.0764 26.7466C65.9321 26.9127 66.0327 27.2913 66.0199 27.5713C66.2981 27.5226 66.7122 27.5716 66.8303 27.4077C67.3183 26.7302 67.7165 25.9882 68.1476 25.2698Z"
								fill="url(#paint5_linear_56_4773)" />
							<defs>
								<linearGradient id="paint0_linear_56_4773" x1="3.10522" y1="99.9133" x2="60.2347"
									y2="105.918" gradientUnits="userSpaceOnUse">
									<stop offset="1" stop-color="#0080D4" />
									<stop stop-color="#A739BA" />
								</linearGradient>
								<linearGradient id="paint1_linear_56_4773" x1="3.4327" y1="100.343" x2="58.3199"
									y2="106.112" gradientUnits="userSpaceOnUse">
									<stop offset="1" stop-color="#097ED3" />
									<stop offset="0.029557" stop-color="#A53CBA" />
									<stop stop-color="#1A1818" />
								</linearGradient>
								<linearGradient id="paint2_linear_56_4773" x1="35.8223" y1="132.535" x2="68.7729"
									y2="135.998" gradientUnits="userSpaceOnUse">
									<stop offset="1" stop-color="#097CD2" />
									<stop stop-color="#9B41BC" />
								</linearGradient>
								<linearGradient id="paint3_linear_56_4773" x1="0.866779" y1="99.8143" x2="61.8455"
									y2="106.223" gradientUnits="userSpaceOnUse">
									<stop offset="1" stop-color="#097CD2" />
									<stop stop-color="#9B41BC" />
								</linearGradient>
								<linearGradient id="paint4_linear_56_4773" x1="18.2526" y1="73.5346" x2="60.1174"
									y2="77.9347" gradientUnits="userSpaceOnUse">
									<stop offset="1" stop-color="#097CD2" />
									<stop stop-color="#9B41BC" />
								</linearGradient>
								<linearGradient id="paint5_linear_56_4773" x1="40.5997" y1="95.4961" x2="68.8158"
									y2="98.4618" gradientUnits="userSpaceOnUse">
									<stop offset="1" stop-color="#097CD2" />
									<stop stop-color="#9B41BC" />
								</linearGradient>
							</defs>
						</svg>
					</span>
					<span class="font-welcome">Welcome</span>
				</div>
				<p class="text-white">View live data</p>
				<div class="card-header">
					<div class="d-flex align-items-center justify-content-between">
						<div>
							<h6 class="mb-0">Project Controlling Dashboard</h6>
						</div>

						<div class="d-flex align-items-center justify-content-space-between gap-3">
							<div class="dropdown ms-auto">
								<select v-model="selectedClient" @change="onClientChange($event)" class="form-select form-select-sm bg-maz-light"
									aria-label=".form-select-sm example">
									<option :selected="true" :value="''">Client:</option>
									<option v-for="client in clients" :key="client.id" :value="client.id">{{ client.name }}</option>
								</select>
							</div>
							<div class="dropdown ms-auto">
								<select class="form-select form-select-sm bg-maz-light"
									aria-label=".form-select-sm example">
									<option selected="">Project Status:</option>
									<option value="1">To Be Activated</option>
									<option value="2">Activated</option>
								</select>
							</div>
							<div class="dropdown ms-auto">
								<select class="form-select form-select-sm bg-maz-light"
									aria-label=".form-select-sm example">
									<option selected="">Time Period:</option>
									<option value="1">One</option>
									<option value="2">Two</option>
									<option value="3">Three</option>
								</select>
							</div>
						</div>


					</div>
				</div>
				<div class="row">
					<div class="col-12 col-lg-12 d-flex">
						<div class="card p-0 radius-10 w-100">

							<div class="card-body">
								<div class="chart-container-1">
									<iframe
										src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3580.2966141401544!2d28.30907767631748!3d-26.187027763276376!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e953d778f6d80b7%3A0x79a4aac8b50eb2c2!2s49%20Newlands%20Ave%2C%20Benoni%2C%201500!5e0!3m2!1sen!2sza!4v1717522328846!5m2!1sen!2sza"
										width="1589" height="270" style="border:0;" allowfullscreen="" loading="lazy"
										referrerpolicy="no-referrer-when-downgrade"></iframe>
								</div>
							</div>

						</div>
					</div>

				</div>


				<div class="row row-cols-1 row-cols-md-3 row-cols-xl-4">
					<div class="col">
						<div class="card">
							<div class="card-body">
								<div class="text-center">
									<div class="widgets-icons mx-auto  mb-3"><svg width="59" height="59"
											viewBox="0 0 59 59" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path
												d="M56.108 53.9638H51.2335V51.5192H48.7889V53.9638H43.9217V51.5192H41.4772V53.9638H36.6027V51.5192H34.1581V53.9638H29.2836V51.5192H26.8391V53.9638H21.9646V51.5192H19.52V53.9638H8.78283L21.64 46.2373L28.0027 27.642L37.4541 44.2538L55.769 13.7381L51.5873 11.2252L37.5664 34.5877L26.8903 15.824L17.5976 42.973L4.87451 50.6189V0.285645H0V58.8383H58.5526V51.5192H56.108L56.108 53.9638ZM56.108 0.285645H58.5526V2.73022H56.108V0.285645ZM48.7889 0.285645H51.2335V2.73022H48.7889V0.285645ZM41.4772 0.285645H43.9217V2.73022H41.4772L41.4772 0.285645ZM34.1581 0.285645H36.6026V2.73022H34.1581L34.1581 0.285645ZM26.839 0.285645H29.2836V2.73022H26.8391L26.839 0.285645ZM19.5199 0.285645H21.9645V2.73022H19.52L19.5199 0.285645ZM12.2008 0.285645H14.6454V2.73022H12.2009L12.2008 0.285645ZM4.88176 0.285645H7.32633V2.73022H4.88182L4.88176 0.285645ZM56.108 7.60472H58.5526V10.0493H56.108V7.60472ZM48.7889 7.60472H51.2335V10.0493H48.7889V7.60472ZM41.4772 7.60472H43.9217V10.0493H41.4772L41.4772 7.60472ZM34.1581 7.60472H36.6026V10.0493H34.1581L34.1581 7.60472ZM26.839 7.60472H29.2836V10.0493H26.8391L26.839 7.60472ZM19.5199 7.60472H21.9645V10.0493H19.52L19.5199 7.60472ZM12.2008 7.60472H14.6454V10.0493H12.2009L12.2008 7.60472ZM4.88176 7.60472H7.32633V10.0493H4.88182L4.88176 7.60472ZM56.108 14.9165H58.5526V17.3611H56.108V14.9165ZM41.4772 14.9165H43.9217V17.3611H41.4772L41.4772 14.9165ZM34.1581 14.9165H36.6026V17.3611H34.1581L34.1581 14.9165ZM19.5199 14.9165H21.9645V17.3611H19.52L19.5199 14.9165ZM12.2008 14.9165H14.6454V17.3611H12.2009L12.2008 14.9165ZM4.88176 14.9165H7.32633V17.3611H4.88182L4.88176 14.9165ZM56.108 22.2356H58.5526V24.6801H56.108V22.2356ZM34.1581 22.2356H36.6026V24.6801H34.1581L34.1581 22.2356ZM19.5199 22.2356H21.9645V24.6801H19.52L19.5199 22.2356ZM12.2008 22.2356H14.6454V24.6801H12.2009L12.2008 22.2356ZM4.88177 22.2356H7.32634V24.6801H4.88182L4.88177 22.2356ZM56.108 29.5595H58.5526V32.0041H56.108V29.5595ZM48.7889 29.5595H51.2335V32.0041H48.7889V29.5595ZM12.2008 29.5595H14.6454V32.0041H12.2009L12.2008 29.5595ZM4.88177 29.5595H7.32634V32.0041H4.88182L4.88177 29.5595ZM56.108 36.8786H58.5526V39.3231H56.108V36.8786ZM48.7889 36.8786H51.2335V39.3231H48.7889V36.8786ZM26.839 36.8786H29.2836V39.3231H26.8391L26.839 36.8786ZM12.2008 36.8786H14.6454V39.3231H12.2009L12.2008 36.8786ZM4.88177 36.8786H7.32634V39.3231H4.88182L4.88177 36.8786ZM56.108 44.1903H58.5526V46.6349H56.108V44.1903ZM48.7889 44.1903H51.2335V46.6349H48.7889V44.1903ZM41.4772 44.1903H43.9217V46.6349H41.4772L41.4772 44.1903ZM26.839 44.1903H29.2836V46.6349H26.8391L26.839 44.1903ZM4.88176 44.1903H7.32633V46.6349H4.88182L4.88176 44.1903Z"
												fill="#019BFE" />
										</svg>


									</div>
									<p class="mb-0 text-secondary">Activation Process</p>
									<h4 class="my-1 maz-height">84%</h4>

								</div>
							</div>
						</div>
					</div>
					<div class="col">
						<div class="card radius-10">
							<div class="card-body">
								<div class="text-center">
									<div class="widgets-icons mx-auto mb-3"><svg width="44" height="59"
											viewBox="0 0 44 59" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path
												d="M38.4251 7.6052H29.2763C29.2763 3.56828 25.9941 0.286133 21.9572 0.286133C17.9203 0.286133 14.6381 3.56828 14.6381 7.6052H5.4893C2.45875 7.6052 0 10.0639 0 13.0945V53.3494C0 56.3799 2.45875 58.8387 5.4893 58.8387H38.4251C41.4556 58.8387 43.9144 56.3799 43.9144 53.3494V13.0945C43.9144 10.0639 41.4556 7.6052 38.4251 7.6052ZM10.9786 48.7749C9.4576 48.7749 8.23395 47.5513 8.23395 46.0303C8.23395 44.5093 9.4576 43.2856 10.9786 43.2856C12.4996 43.2856 13.7232 44.5093 13.7232 46.0303C13.7232 47.5513 12.4996 48.7749 10.9786 48.7749ZM10.9786 37.7963C9.4576 37.7963 8.23395 36.5727 8.23395 35.0517C8.23395 33.5307 9.4576 32.307 10.9786 32.307C12.4996 32.307 13.7232 33.5307 13.7232 35.0517C13.7232 36.5727 12.4996 37.7963 10.9786 37.7963ZM10.9786 26.8177C9.4576 26.8177 8.23395 25.5941 8.23395 24.0731C8.23395 22.5521 9.4576 21.3284 10.9786 21.3284C12.4996 21.3284 13.7232 22.5521 13.7232 24.0731C13.7232 25.5941 12.4996 26.8177 10.9786 26.8177ZM21.9572 4.86055C23.4782 4.86055 24.7018 6.0842 24.7018 7.6052C24.7018 9.12619 23.4782 10.3498 21.9572 10.3498C20.4362 10.3498 19.2125 9.12619 19.2125 7.6052C19.2125 6.0842 20.4362 4.86055 21.9572 4.86055ZM36.5953 46.9452C36.5953 47.4484 36.1836 47.8601 35.6804 47.8601H19.2125C18.7094 47.8601 18.2977 47.4484 18.2977 46.9452V45.1154C18.2977 44.6122 18.7094 44.2005 19.2125 44.2005H35.6804C36.1836 44.2005 36.5953 44.6122 36.5953 45.1154V46.9452ZM36.5953 35.9666C36.5953 36.4698 36.1836 36.8815 35.6804 36.8815H19.2125C18.7094 36.8815 18.2977 36.4698 18.2977 35.9666V34.1368C18.2977 33.6336 18.7094 33.2219 19.2125 33.2219H35.6804C36.1836 33.2219 36.5953 33.6336 36.5953 34.1368V35.9666ZM36.5953 24.988C36.5953 25.4912 36.1836 25.9029 35.6804 25.9029H19.2125C18.7094 25.9029 18.2977 25.4912 18.2977 24.988V23.1582C18.2977 22.655 18.7094 22.2433 19.2125 22.2433H35.6804C36.1836 22.2433 36.5953 22.655 36.5953 23.1582V24.988Z"
												fill="#019BFE" />
										</svg>

									</div>
									<p class="mb-0 text-secondary">Leads</p>
									<h4 class="my-1 maz-height">34</h4>

								</div>
							</div>
						</div>
					</div>
					<div class="col">
						<div class="card radius-10">
							<div class="card-body">
								<div class="text-center">
									<div class="widgets-icons  mx-auto  mb-3">
										<svg width="62" height="62" viewBox="0 0 62 62" fill="none"
											xmlns="http://www.w3.org/2000/svg">
											<path
												d="M58.7134 28.4333V30.9961C58.7064 43.3329 50.5857 54.1957 38.7551 57.6936C26.9246 61.1915 14.2024 56.4913 7.48773 46.1419C0.773067 35.7925 1.66544 22.2592 9.68094 12.8811C17.6964 3.50299 30.9256 0.514021 42.1944 5.53511"
												stroke="#019BFE" stroke-width="5" stroke-linecap="round"
												stroke-linejoin="round" />
											<path d="M58.7136 8.71094L30.857 36.5954L22.5 28.2384" stroke="#019BFE"
												stroke-width="5" stroke-linecap="round" />
										</svg>

									</div>
									<p class="mb-0 text-secondary">Activations Completed</p>
									<h4 class="my-1 maz-height">56</h4>

								</div>
							</div>
						</div>
					</div>
					<div class="col">
						<div class="card radius-10">
							<div class="card-body">
								<div class="text-center">
									<div class="widgets-icons mx-auto  mb-3"><svg width="73" height="54"
											viewBox="0 0 73 54" fill="none" xmlns="http://www.w3.org/2000/svg">
											<line x1="2.5" y1="2.8252" x2="2.5" y2="46.3389" stroke="#019BFE"
												stroke-width="5" stroke-linecap="round" />
											<line x1="58.0176" y1="51.3389" x2="2.50045" y2="51.3389" stroke="#019BFE"
												stroke-width="5" stroke-linecap="round" />
											<path d="M13.2227 27.7891L23.168 17.8457L35.1484 29.8262L48.4414 16.5352"
												stroke="#019BFE" stroke-width="5" stroke-linecap="round" />
											<path d="M63.9758 36.2019L64.6543 49.6119L50.5658 35.5234L63.9758 36.2019Z"
												fill="#019BFE" />
										</svg>

									</div>
									<p class="mb-0 text-secondary">Ongoing Activations</p>
									<h4 class="my-1 maz-height">38</h4>

								</div>
							</div>
						</div>
					</div>

				</div>

				<div class="row row-cols-1 row-cols-md-3 row-cols-xl-3">

					<div class="col">
						<div class="card radius-10 overflow-hidden">
							<div class="card-body">
								<div class="d-flex align-items-center">
									<div>
										<p class="mb-0">Total Revenue</p>
										<h5 class="mb-0 invisible">Actual: R0.00</h5>
										<h5 class="mb-0 text-success">86%</h5>
									</div>
									<div class="ms-auto">
										<h5 class="mb-0">Actual: R0.00</h5>
										<h5 class="mb-0 mt-4 float-end">Plan: R0.00</h5>
									</div>
								</div>
								<div class="progress radius-10 mt-4" style="height:25px;">
									<div class="progress-bar bg-success" role="progressbar" style="width: 76%"></div>
								</div>
							</div>
						</div>
					</div>


					<div class="col">
						<div class="card radius-10 overflow-hidden">
							<div class="card-body">
								<div class="d-flex align-items-center">
									<div>
										<p class="mb-0">Total Cost</p>
										<h5 class="mb-0 invisible">Actual: R0.00</h5>
										<h5 class="mb-0 text-danger">86%</h5>
									</div>
									<div class="ms-auto">
										<h5 class="mb-0">Actual: R0.00</h5>
										<h5 class="mb-0 mt-4 float-end">Plan: R0.00</h5>
									</div>
								</div>
								<div class="progress radius-10 mt-4" style="height:25px;">
									<div class="progress-bar bg-danger" role="progressbar" style="width: 76%"></div>
								</div>
							</div>
						</div>
					</div>


					<div class="col">
						<div class="card radius-10 overflow-hidden">
							<div class="card-body">
								<div class="d-flex align-items-center">
									<div>
										<p class="mb-0">Total Margin</p>
										<h5 class="mb-0 invisible">Actual: R0.00</h5>
										<h5 class="mb-0 text-primary">86%</h5>
									</div>
									<div class="ms-auto">
										<h5 class="mb-0">Actual: R0.00</h5>
										<h5 class="mb-0 mt-4 float-end">Plan: R0.00</h5>
									</div>
								</div>
								<div class="progress radius-10 mt-4" style="height:25px;">
									<div class="progress-bar bg-primary" role="progressbar" style="width: 76%"></div>
								</div>
							</div>
						</div>
					</div>

				</div>






				<div class="row">
					<div class="col-12 col-lg-4">
						<div class="card radius-10">
							<div class="card-body">
								<div class="">
									<div id="chart3" style="height:250px;"><svg height="250" version="1.1"
											width="665.328" xmlns="http://www.w3.org/2000/svg"
											xmlns:xlink="http://www.w3.org/1999/xlink"
											style="overflow: hidden; position: relative;">
											<desc style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);">Created with
												Raphaël 2.2.0</desc>
											<defs style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"></defs>
											<path fill="none" stroke="#008cff"
												d="M332.664,201.66666666666669A76.66666666666667,76.66666666666667,0,0,0,408.94122662266636,132.71767299982181"
												stroke-width="2" opacity="0"
												style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 0;">
											</path>
											<path fill="#008cff" stroke="#ffffff"
												d="M332.664,204.66666666666669A79.66666666666667,79.66666666666667,0,0,0,411.92598766442285,133.01966889981483L442.1052381977387,136.07318299974432A110,110,0,0,1,332.664,235Z"
												stroke-width="3" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);">
											</path>
											<path fill="none" stroke="#15ca20"
												d="M408.94122662266636,132.71767299982181A76.66666666666667,76.66666666666667,0,0,0,261.12270210661495,97.4387867918025"
												stroke-width="2" opacity="1"
												style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 1;">
											</path>
											<path fill="#15ca20" stroke="#ffffff"
												d="M411.92598766442285,133.01966889981483A79.66666666666667,79.66666666666667,0,0,0,258.3232600151347,96.36030453582956L225.35205315992243,83.65818018770375A115,115,0,0,1,447.0798399339995,136.5765094997327Z"
												stroke-width="3" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);">
											</path>
											<path fill="none" stroke="#fd3550"
												d="M261.12270210661495,97.4387867918025A76.66666666666667,76.66666666666667,0,0,0,332.6399144567186,201.66666288331834"
												stroke-width="2" opacity="0"
												style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 0;">
											</path>
											<path fill="#fd3550" stroke="#ffffff"
												d="M258.3232600151347,96.36030453582956A79.66666666666667,79.66666666666667,0,0,0,332.638971978938,204.6666627352743L332.6294424813789,234.99999457171762A110,110,0,0,1,230.01778997905626,85.45565061432532Z"
												stroke-width="3" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);">
											</path><text x="332.664" y="115" text-anchor="middle"
												font-family="&quot;Arial&quot;" font-size="15px" stroke="none"
												fill="#000000"
												style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); text-anchor: middle; font-family: Arial; font-size: 15px; font-weight: 800;"
												font-weight="800"
												transform="matrix(1.7424,0,0,1.7424,-246.9778,-93.5455)"
												stroke-width="0.5739130434782609">
												<tspan dy="6" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);">
												</tspan>
											</text><text x="332.664" y="135" text-anchor="middle"
												font-family="&quot;Arial&quot;" font-size="14px" stroke="none"
												fill="#000000"
												style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); text-anchor: middle; font-family: Arial; font-size: 14px;"
												transform="matrix(1.5972,0,0,1.5972,-198.6743,-75.8472)"
												stroke-width="0.6260869565217391">
												<tspan dy="5" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);">
												</tspan>
											</text>
										</svg></div>
								</div>
							</div>
							<ul class="list-group list-group-flush">
								<li
									class="list-group-item d-flex bg-transparent justify-content-between align-items-center border-top">
									Apple <span class="badge bg-danger rounded-pill">20</span>
								</li>
								<li
									class="list-group-item d-flex bg-transparent justify-content-between align-items-center">
									Samsung <span class="badge bg-primary rounded-pill">15</span>
								</li>
								<li
									class="list-group-item d-flex bg-transparent justify-content-between align-items-center">
									Nokia <span class="badge bg-success rounded-pill">30</span>
								</li>
							</ul>
						</div>
					</div>






					<div class="col-12 col-lg-8 d-flex">
						<div class="card radius-10 w-100">
							<div class="card-header">
								<div class="d-flex align-items-center">
									<div>
										<h6 class="mb-0">Main Tasks To Set Up</h6>
									</div>
									<div class="dropdown ms-auto">

									</div>
								</div>
							</div>
							<TaskTable :statuses="statuses" :tasks="tasks"/>
						</div>
					</div>




				</div>



				<div class="card radius-10 d-none">
					<div class="card-header">
						<div class="d-flex align-items-center">
							<div>
								<h6 class="mb-0">Recent Orders</h6>
							</div>
							<div class="dropdown ms-auto">
								<a class="dropdown-toggle dropdown-toggle-nocaret" href="#" data-bs-toggle="dropdown"><i
										class='bx bx-dots-horizontal-rounded font-22 text-option'></i>
								</a>
								<ul class="dropdown-menu">
									<li><a class="dropdown-item" href="javascript:;">Action</a>
									</li>
									<li><a class="dropdown-item" href="javascript:;">Another action</a>
									</li>
									<li>
										<hr class="dropdown-divider">
									</li>
									<li><a class="dropdown-item" href="javascript:;">Something else here</a>
									</li>
								</ul>
							</div>
						</div>
					</div>
					<div class="card-body">
						<div class="table-responsive">
							<table class="table align-middle mb-0">
								<thead class="table-light">
									<tr>
										<th>Product</th>
										<th>Photo</th>
										<th>Product ID</th>
										<th>Status</th>
										<th>Amount</th>
										<th>Date</th>
										<th>Shipping</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>Iphone 5</td>
										<td>
											i
										</td>
										<td>#9405822</td>
										<td><span
												class="badge bg-gradient-quepal text-white shadow-sm w-100">Paid</span>
										</td>
										<td>$1250.00</td>
										<td>03 Feb 2020</td>
										<td>
											<div class="progress" style="height: 6px;">
												<div class="progress-bar bg-gradient-quepal" role="progressbar"
													style="width: 100%"></div>
											</div>
										</td>
									</tr>

									<tr>
										<td>Earphone GL</td>
										<td>
											2
										</td>
										<td>#8304620</td>
										<td><span
												class="badge bg-gradient-blooker text-white shadow-sm w-100">Pending</span>
										</td>
										<td>$1500.00</td>
										<td>05 Feb 2020</td>
										<td>
											<div class="progress" style="height: 6px;">
												<div class="progress-bar bg-gradient-blooker" role="progressbar"
													style="width: 60%"></div>
											</div>
										</td>
									</tr>

									<tr>
										<td>HD Hand Camera</td>
										<td>3
											</td>
										<td>#4736890</td>
										<td><span
												class="badge bg-gradient-bloody text-white shadow-sm w-100">Failed</span>
										</td>
										<td>$1400.00</td>
										<td>06 Feb 2020</td>
										<td>
											<div class="progress" style="height: 6px;">
												<div class="progress-bar bg-gradient-bloody" role="progressbar"
													style="width: 70%"></div>
											</div>
										</td>
									</tr>

									<tr>
										<td>Clasic Shoes</td>
										<td>4</td>
										<td>#8543765</td>
										<td><span
												class="badge bg-gradient-quepal text-white shadow-sm w-100">Paid</span>
										</td>
										<td>$1200.00</td>
										<td>14 Feb 2020</td>
										<td>
											<div class="progress" style="height: 6px;">
												<div class="progress-bar bg-gradient-quepal" role="progressbar"
													style="width: 100%"></div>
											</div>
										</td>
									</tr>
									<tr>
										<td>Sitting Chair</td>
										<td>5
											</td>
										<td>#9629240</td>
										<td><span
												class="badge bg-gradient-blooker text-white shadow-sm w-100">Pending</span>
										</td>
										<td>$1500.00</td>
										<td>18 Feb 2020</td>
										<td>
											<div class="progress" style="height: 6px;">
												<div class="progress-bar bg-gradient-blooker" role="progressbar"
													style="width: 60%"></div>
											</div>
										</td>
									</tr>
									<tr>
										<td>Hand Watch</td>
										<td>6
											</td>
										<td>#8506790</td>
										<td><span
												class="badge bg-gradient-bloody text-white shadow-sm w-100">Failed</span>
										</td>
										<td>$1800.00</td>
										<td>21 Feb 2020</td>
										<td>
											<div class="progress" style="height: 6px;">
												<div class="progress-bar bg-gradient-bloody" role="progressbar"
													style="width: 40%"></div>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>


				<div class="row d-none">
					<div class="col-12 col-lg-7 col-xl-8 d-flex">
						<div class="card radius-10 w-100">
							<div class="card-header bg-transparent">
								<div class="d-flex align-items-center">
									<div>
										<h6 class="mb-0">Recent Orders</h6>
									</div>
									<div class="dropdown ms-auto">
										<a class="dropdown-toggle dropdown-toggle-nocaret" href="#"
											data-bs-toggle="dropdown"><i
												class='bx bx-dots-horizontal-rounded font-22 text-option'></i>
										</a>
										<ul class="dropdown-menu">
											<li><a class="dropdown-item" href="javascript:;">Action</a>
											</li>
											<li><a class="dropdown-item" href="javascript:;">Another action</a>
											</li>
											<li>
												<hr class="dropdown-divider">
											</li>
											<li><a class="dropdown-item" href="javascript:;">Something else here</a>
											</li>
										</ul>
									</div>
								</div>
							</div>
							<div class="card-body">
								<div class="row">
									<div class="col-lg-7 col-xl-8 border-end">
										<div id="geographic-map-2"></div>
									</div>
									<div class="col-lg-5 col-xl-4">

										<div class="mb-4">
											<p class="mb-2"><i class="flag-icon flag-icon-us me-1"></i> USA <span
													class="float-end">70%</span></p>
											<div class="progress" style="height: 7px;">
												<div class="progress-bar bg-primary progress-bar-striped"
													role="progressbar" style="width: 70%"></div>
											</div>
										</div>

										<div class="mb-4">
											<p class="mb-2"><i class="flag-icon flag-icon-ca me-1"></i> Canada <span
													class="float-end">65%</span></p>
											<div class="progress" style="height: 7px;">
												<div class="progress-bar bg-danger progress-bar-striped"
													role="progressbar" style="width: 65%"></div>
											</div>
										</div>

										<div class="mb-4">
											<p class="mb-2"><i class="flag-icon flag-icon-gb me-1"></i> England <span
													class="float-end">60%</span></p>
											<div class="progress" style="height: 7px;">
												<div class="progress-bar bg-success progress-bar-striped"
													role="progressbar" style="width: 60%"></div>
											</div>
										</div>

										<div class="mb-4">
											<p class="mb-2"><i class="flag-icon flag-icon-au me-1"></i> Australia <span
													class="float-end">55%</span></p>
											<div class="progress" style="height: 7px;">
												<div class="progress-bar bg-warning progress-bar-striped"
													role="progressbar" style="width: 55%"></div>
											</div>
										</div>

										<div class="mb-4">
											<p class="mb-2"><i class="flag-icon flag-icon-in me-1"></i> India <span
													class="float-end">50%</span></p>
											<div class="progress" style="height: 7px;">
												<div class="progress-bar bg-info progress-bar-striped"
													role="progressbar" style="width: 50%"></div>
											</div>
										</div>

										<div class="mb-0">
											<p class="mb-2"><i class="flag-icon flag-icon-cn me-1"></i> China <span
													class="float-end">45%</span></p>
											<div class="progress" style="height: 7px;">
												<div class="progress-bar bg-dark progress-bar-striped"
													role="progressbar" style="width: 45%"></div>
											</div>
										</div>

									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="col-12 col-lg-5 col-xl-4 d-flex">
						<div class="card w-100 radius-10">
							<div class="card-body">
								<div class="card radius-10 border shadow-none">
									<div class="card-body">
										<div class="d-flex align-items-center">
											<div>
												<p class="mb-0 text-secondary">Total Likes</p>
												<h4 class="my-1">45.6M</h4>
												<p class="mb-0 font-13">+6.2% from last week</p>
											</div>
											<div class="widgets-icons-2 bg-gradient-cosmic text-white ms-auto"><i
													class='bx bxs-heart-circle'></i>
											</div>
										</div>
									</div>
								</div>
								<div class="card radius-10 border shadow-none">
									<div class="card-body">
										<div class="d-flex align-items-center">
											<div>
												<p class="mb-0 text-secondary">Comments</p>
												<h4 class="my-1">25.6K</h4>
												<p class="mb-0 font-13">+3.7% from last week</p>
											</div>
											<div class="widgets-icons-2 bg-gradient-ibiza text-white ms-auto"><i
													class='bx bxs-comment-detail'></i>
											</div>
										</div>
									</div>
								</div>
								<div class="card radius-10 mb-0 border shadow-none">
									<div class="card-body">
										<div class="d-flex align-items-center">
											<div>
												<p class="mb-0 text-secondary">Total Shares</p>
												<h4 class="my-1">85.4M</h4>
												<p class="mb-0 font-13">+4.6% from last week</p>
											</div>
											<div class="widgets-icons-2 bg-gradient-kyoto text-dark ms-auto"><i
													class='bx bxs-share-alt'></i>
											</div>
										</div>
									</div>
								</div>
							</div>

						</div>

					</div>
				</div><!--end row-->

				<div class="row row-cols-1 row-cols-lg-3 d-none">
					<div class="col d-flex">
						<div class="card radius-10 w-100">
							<div class="card-body">
								<p class="font-weight-bold mb-1 text-secondary">Weekly Revenue</p>
								<div class="d-flex align-items-center mb-4">
									<div>
										<h4 class="mb-0">$89,540</h4>
									</div>
									<div class="">
										<p class="mb-0 align-self-center font-weight-bold text-success ms-2">4.4% <i
												class="bx bxs-up-arrow-alt mr-2"></i>
										</p>
									</div>
								</div>
								<div class="chart-container-0 mt-5">
									<canvas id="chart3"></canvas>
								</div>
							</div>
						</div>
					</div>
					<div class="col d-flex">
						<div class="card radius-10 w-100">
							<div class="card-header bg-transparent">
								<div class="d-flex align-items-center">
									<div>
										<h6 class="mb-0">Orders Summary</h6>
									</div>
									<div class="dropdown ms-auto">
										<a class="dropdown-toggle dropdown-toggle-nocaret" href="#"
											data-bs-toggle="dropdown"><i
												class='bx bx-dots-horizontal-rounded font-22 text-option'></i>
										</a>
										<ul class="dropdown-menu">
											<li><a class="dropdown-item" href="javascript:;">Action</a>
											</li>
											<li><a class="dropdown-item" href="javascript:;">Another action</a>
											</li>
											<li>
												<hr class="dropdown-divider">
											</li>
											<li><a class="dropdown-item" href="javascript:;">Something else here</a>
											</li>
										</ul>
									</div>
								</div>
							</div>
							<div class="card-body">
								<div class="chart-container-1 mt-3">
									<canvas id="chart4"></canvas>
								</div>
							</div>
							<ul class="list-group list-group-flush">
								<li
									class="list-group-item d-flex bg-transparent justify-content-between align-items-center border-top">
									Completed <span class="badge bg-gradient-quepal rounded-pill">25</span>
								</li>
								<li
									class="list-group-item d-flex bg-transparent justify-content-between align-items-center">
									Pending <span class="badge bg-gradient-ibiza rounded-pill">10</span>
								</li>
								<li
									class="list-group-item d-flex bg-transparent justify-content-between align-items-center">
									Process <span class="badge bg-gradient-deepblue rounded-pill">65</span>
								</li>
							</ul>
						</div>
					</div>
					<div class="col d-flex">
						<div class="card radius-10 w-100">
							<div class="card-header bg-transparent">
								<div class="d-flex align-items-center">
									<div>
										<h6 class="mb-0">Top Selling Categories</h6>
									</div>
									<div class="dropdown ms-auto">
										<a class="dropdown-toggle dropdown-toggle-nocaret" href="#"
											data-bs-toggle="dropdown"><i
												class='bx bx-dots-horizontal-rounded font-22 text-option'></i>
										</a>
										<ul class="dropdown-menu">
											<li><a class="dropdown-item" href="javascript:;">Action</a>
											</li>
											<li><a class="dropdown-item" href="javascript:;">Another action</a>
											</li>
											<li>
												<hr class="dropdown-divider">
											</li>
											<li><a class="dropdown-item" href="javascript:;">Something else here</a>
											</li>
										</ul>
									</div>
								</div>
							</div>
							<div class="card-body">
								<div class="chart-container-0">
									<canvas id="chart5"></canvas>
								</div>
							</div>
							<div class="row row-group border-top g-0">
								<div class="col">
									<div class="p-3 text-center">
										<h4 class="mb-0 text-danger">$45,216</h4>
										<p class="mb-0">Clothing</p>
									</div>
								</div>
								<div class="col">
									<div class="p-3 text-center">
										<h4 class="mb-0 text-success">$68,154</h4>
										<p class="mb-0">Electronic</p>
									</div>
								</div>
							</div><!--end row-->
						</div>
					</div>
				</div><!--end row-->

			</div>
		</div>
		<!--start switcher-->

	</Layout>
</template>
<style scoped>
.maz-height {
	font-size: 3rem;
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

.bg-maz-light {
	background: #6F7070 !important;
	color: #fff !important;
	width: 150px;
	border: 0;
	border-radius: 0;
	font-weight: 600;
}

/* ////////////// */
.main-dashboard-head {
	/* display: inline; */
	display: flex;
	align-items: center;

}

.welcome-icon {
	max-width: 4rem !important;
	fill: linear-gradient(to right, #9A3AB1, #117A);
	margin-right: 1rem
}

.font-welcome {
	font-size: 95px;
	font-weight: 200;
}

/* /////////// */
.card-header {
	background-color: #141414;
	border: none !important;
	margin-bottom: 20px;
	padding: 7px;
}

.card-body {
	padding: 0px !important;
}

.form-select {
	border: none !important;
}

.bg-maz-light {
	background: #6F7070 !important;
	color: #DBDBDB !important;
	color: #fff !important;
	width: 168px;
	font-weight: 10;
}

/* ////////////////// */
.card {
	border-radius: 0 !important;
	padding: 10px;
}

svg {
	max-width: 2.8rem;
}
</style>
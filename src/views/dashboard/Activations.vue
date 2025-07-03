<template>
  <Layout>
    <div class="page-wrapper">
      <div class="page-content">
        <div class="row">
          <div class="col-12 col-lg-12 d-flex">
            <div class="card p-0 radius-10 w-100">
              <div class="card-body">
                <div class="chart-container-1">
                  <GoogleMap 
                    api-key="YOUR_API_KEY"
                    style="width: 100%; height: 800px"
                    :center="center"
                    :zoom="7"
                    :options="{ styles: mapStyles }"
                  >
                    <Marker 
                      v-for="(location, i) in locations" 
                      :key="i" 
                      :options="{ position: location }" 
                      @click="openInfoWindow(i)"
                    >
                      <InfoWindow v-if="location.showInfoWindow">
                        <div class="popup">
                          <div class="text-danger fs-3 text-end">
                            <i @click="location.showInfoWindow = false" class='cursor-pointer bx bx-x'></i>
                          </div>
                          <div class="inner-container">
                            <h2>{{ location.title }}</h2>
                            <p>CPC: R{{ parseFloat(location.costPerContact).toFixed(2) }}</p>
                            <p>Start / End date: {{ location.startDate }} - {{ location.endDate }}</p>
                            <!-- <p>Current Cost: R 25,000.00</p> -->
                            <p>Leads generated: {{location.leads}}</p>
                            <h3>{{ location.regionName }} Activation</h3>
                          </div>
                        </div>
                      </InfoWindow>
                    </Marker>
                  </GoogleMap>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import Layout from '../shared/Layout.vue';
import { GoogleMap, Marker, InfoWindow } from 'vue3-google-map';
import { useActivation } from '@/stores/activation';
import { useAuth } from '@/stores/auth';

const center = { lat: -19.0154, lng: 28.112268};
const activationStore = useActivation();
const authStore = useAuth();

const locations = ref([]);

const getAllActivations = () => {
  const user = JSON.parse(authStore.user);

  if (user.role === 'TTG_SUPER_ADMIN' || user.role === 'TTG_HEAD_ADMIN') {  console.log("test admin");
    activationStore.getAllActivationsAdmins().then(response => { console.log(response.data);
      locations.value = response.data.map(activation => ({
        lat: activation.centralLatitude,
        lng: activation.centralLongitude,
        startDate: activation.startDate,
        endDate: activation.endDate,
        costPerContact: activation.costPerContact,
        regionName: activation.regionName,
        title: activation.name,
        leads: activation.numberOfLeads,
        showInfoWindow: false // Initialize with false
      }));
    });
   } else if(user.role === 'CLIENT'){ 
    activationStore.getAllActivations(user.role, user.activeUserId).then(response => {
      // Ensure response.content exists before calling map
      if (response && response.data && response.data) {
        locations.value = response.data.map(activation => ({
          lat: activation.centralLatitude,
          lng: activation.centralLongitude,
          startDate: activation.startDate,
          endDate: activation.endDate,
          costPerContact: activation.costPerContact || 0, // Default to 0 if null
          regionName: activation.regionName || 'Unknown', // Default to 'Unknown' if null
          title: activation.name || 'Untitled Activation', // Default to 'Untitled Activation' if null
          leads: activation.numberOfLeads || 0, // Default to 0 if null
          showInfoWindow: false // Initialize with false
        }));
      } else {
        console.log("Response content is undefined or empty", response);
        locations.value = []; // Fallback in case of no activations
      }
    }).catch(error => {
      console.error("Error fetching activations", error);
    });

   } else  {
    activationStore.getAllActivations(user.role, user.id).then(response => {
     
  
      // Ensure response.content exists before calling map
      if (response && response.data && response.data.content) {
        locations.value = response.data.content.map(activation => ({
          lat: activation.centralLatitude,
          lng: activation.centralLongitude,
          startDate: activation.startDate,
          endDate: activation.endDate,
          costPerContact: activation.costPerContact || 0, // Default to 0 if null
          regionName: activation.regionName || 'Unknown', // Default to 'Unknown' if null
          title: activation.name || 'Untitled Activation', // Default to 'Untitled Activation' if null
          leads: activation.numberOfLeads || 0, // Default to 0 if null
          showInfoWindow: false // Initialize with false
        }));
      } else {
        console.error("Response content is undefined or empty", response);
        locations.value = []; // Fallback in case of no activations
      }
    }).catch(error => {
      console.error("Error fetching activations", error);
    });
     
  }

  // Handle other roles similarly...
};

const openInfoWindow = (index) => {
  // Close all info windows
  locations.value.forEach(location => {
    location.showInfoWindow = false;
  });
  // Open the clicked one
  locations.value[index].showInfoWindow = true;
};

const mapStyles = [
  // Your map styles here
];

onMounted(() => {
  getAllActivations();
});
</script>


<style>
/* Global styles to target Google Maps InfoWindow */
.gm-style .gm-style-iw-c {
  padding: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.gm-style .gm-style-iw-d {
  overflow: visible !important;
  background-color: transparent !important;
}

.gm-style-iw-tc::after {
  display: none !important;
}

/* Remove the default close button */
.gm-ui-hover-effect {
  display: none !important;
}
</style>


<style scoped>
.popup {
  width: 300px;
  background: linear-gradient(135deg, #00a2ff, #7000ff);
  color: white;
  font-family: Arial, sans-serif;
  clip-path: 
    polygon(
      20px 0%, 
      calc(100% - 20px) 0%, 
      100% 20px, 
      100% calc(100% - 40px), 
      calc(100% - 20px) calc(100% - 20px),
      calc(50% + 10px) calc(100% - 20px),
      50% 100%,
      calc(50% - 10px) calc(100% - 20px),
      20px calc(100% - 20px),
      0% calc(100% - 40px),
      0% 20px
    );
  padding: 20px;
  padding-bottom: 40px;
  border-radius: 20px;
}

.inner-container {
  background-color: black;
  padding: 20px 15px 15px 15px;
  border-radius: 10px;
}

h2 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

p {
  margin: 5px 0;
  font-size: 14px;
}

h3 {
  margin: 15px 0 5px 0;
  font-size: 16px;
}
</style>

<style scoped>

/* /////////////// */

.gm-style-iw-d{
    color:red !important;
}
.maz-height {
    font-size: 3rem;
}

/* set the default transition time */
:root {
    --delay-time: .5s;
  }
  
  #map {
    height: 100%;
  }

  
</style>

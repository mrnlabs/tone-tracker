<script setup>
import { onMounted, ref, watch } from 'vue';
import Activation from '../svgs/Activation.vue';
import Budget from '../svgs/Budget.vue';
import CRM from '../svgs/CRM.vue';
import Report from '../svgs/Report.vue';
import Status from '../svgs/Status.vue';
import Warehouse from '../svgs/Warehouse.vue';
import Popover from 'primevue/popover';
import { useActivation } from '@/stores/activation';
import { useCampaignStore } from '@/stores/useCampaign';


import { useAuth } from '@/stores/auth';

const auth = useAuth();
const logout = () => {
    auth.logout();
}

onMounted(() => {
  getAllActivations();
  getAllCampaigns();
})

const props = defineProps({
  user: Object
});

const activationStore = useActivation();
const campaignStore = useCampaignStore();
const pop = ref();
const campaignPop = ref();
const searchInput = ref('');
const searchCampaignInput = ref('');
const activations = ref([]);
const campaigns = ref([]);



const onSearch = () => {
  if (searchInput.value === '') {
    getAllActivations();
  }else{
    
  activations.value = activations.value.filter((activation) => {
    return activation.name.toLowerCase().includes(searchInput.value.toLowerCase())
  })
  }
}
const onCampaignSearch = () => {
  if (searchCampaignInput.value === '') {
    getAllCampaigns();
  }else{
    
  campaigns.value = campaigns.value.filter((camp) => {
    return camp.name.toLowerCase().includes(searchCampaignInput.value.toLowerCase())
  })
  }
}

const getAllCampaigns = () => {
  campaignStore.getCampaigns().then((res) => {
    campaigns.value = res.data
  });
}

const getAllActivations = () => {
  activationStore.getAllActivationsForTemporal().then((res) => {
    activations.value = res.data
  });
}
const toggle = (event) => {
    pop.value.toggle(event);
}

const toggleCampaignSearch = (event) => {
  campaignPop.value.toggle(event);
}
</script>

<template>
  <div class="accordion" id="accordionPanelsStayOpenExample">
    <ul class="side-nav list-unstyled ps-0">

      <li @click="toggleCampaignSearch" v-tooltip="'Status'" class="side-nav__item">
          <div class="side-nav__link">
            <Status />
          </div>
      </li>

      <Popover ref="campaignPop">
        <div class="popover">
          <div class="popover-body">
            <div class="d-flex flex-column gap-2">
              <div>
                <span class="fw-medium d-block mb-2">Search Campaign</span>
                <div class="input-group">
                  <input v-model="searchCampaignInput" @input="onCampaignSearch" type="text" class="form-control" style="width: 13rem;" />
                </div>
              </div>
              <div>
                <ul class="list-unstyled mb-0 d-flex flex-column gap-4">
                  <li v-if="searchCampaignInput && campaigns?.length > 0" v-for="campaign in campaigns" class="d-flex align-items-center gap-2">
                     <router-link :to="`/status?campaign=${campaign.id}`">
                    <div class="w-100 cursor-pointer">
                      <span class="fw-medium">{{campaign.name}}</span>
                    </div>
                  </router-link>
                  </li>
                 
                </ul>
              </div>
            </div>
          </div>
          
        </div>
      </Popover>

      <li @click="toggle" v-tooltip="'Report'" class="side-nav__item cursor-pointer" :class="{ 'active': $route.path === '/report' }">
          <div class="side-nav__link">
            <Report />
          </div>
      </li>
      <Popover ref="pop">
        <div class="popover">
          <div class="popover-body">
            <div class="d-flex flex-column gap-2">
              <div>
                <span class="fw-medium d-block mb-2">Search Activation</span>
                <div class="input-group">
                  <input autofocus v-model="searchInput" @input="onSearch" type="text" class="form-control" style="width: 13rem;" />
                </div>
              </div>
              <div>
                <ul class="list-unstyled mb-0 d-flex flex-column gap-4">
                  <li v-if="activations?.length > 0" v-for="activation in activations" class="d-flex align-items-center gap-2">
                    <!-- <img src="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" class="rounded-circle" style="width: 32px;"> -->
                     <router-link :to="`/report?activation=${activation.id}`">
                    <div class="w-100 cursor-pointer">
                      <span class="fw-medium">{{activation.name}}</span>
                      <!-- <div class="text-muted small">Dell Campaign</div> -->
                    </div>
                  </router-link>
                    <!-- <div class="d-flex align-items-center gap-2 text-muted ms-auto small">
                      <span>Owner</span>
                      <i class="pi pi-angle-down"></i>
                    </div> -->
                  </li>
                 
                </ul>
              </div>
            </div>
          </div>
          
        </div>
      </Popover>
     

      <li v-tooltip="'Budget'" class="side-nav__item" v-if="user?.role !== 'TTG_ACTIVATION_MANAGER'">
        <router-link to="/budget">
          <div class="side-nav__link">
            <Budget />
          </div>
        </router-link>
      </li>

      <li v-tooltip="'CRM'" class="side-nav__item">
        <router-link to="/crm">
          <div class="side-nav__link">
            <CRM />
          </div>
        </router-link>
      </li>

      <li v-tooltip="'Warehouse'" class="side-nav__item d-none">
        <router-link to="/warehouse">
          <div class="side-nav__link">
            <Warehouse />
          </div>
        </router-link>
      </li>

      <li v-tooltip="'Chat'" class="side-nav__item d-none">
        <router-link to="/chat">
          <div class="side-nav__link">
            <i class='bx bxs-chat fs-3'></i>
          </div>
        </router-link>
      </li>
      <li @click="logout" v-tooltip="'Logout'" class="side-nav__item cursor-pointer">
          <div class="side-nav__link">
           <!-- <Logout /> -->
           <i class='bx bx-log-out fs-2'></i>

          </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.side-nav {
  width: 45px;
  background-color: #1C1C1C;
}

.side-nav__item {
  background-color: #1C1C1C !important;
}

.side-nav__link {
  border: none !important;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
}

.side-nav__item a {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #fff;
}

svg {
  max-width: 1.8rem;
}

.accordion-button::after {
  margin: 0 !important;
}

.accordion-button {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0px;
}

.accordion-button:not(.collapsed) {
  margin-bottom: 0px;
}

.side-nav__item.active,
.side-nav__item:hover {
  background-color: #333333 !important;
}

/* Additional styles for the submenu */
#activationMenu {
  position: absolute;
  left: 60px;
  top: 0;
  width: 200px;
}

.accordion-item {
  background-color: #1C1C1C;
  color: #fff;
}

.accordion-button {
  background-color: #1C1C1C;
  color: #fff;
}

.accordion-button:not(.collapsed) {
  background-color: #333333;
  color: #fff;
}

.nav-list {
  list-style-type: none;
  padding: 0;
}

.nav-link-inside {
  color: #fff;
  text-decoration: none;
}
.popover {
  --bs-popover-bg: inherit !important;
}
.p-component{
  left: 8px !important;
}
</style>
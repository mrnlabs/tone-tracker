import './assets/css/bootstrap.min.css';
import './assets/css/bootstrap-extended.css';
import './assets/css/dark-theme.css';
import './assets/css/header-colors.css';
import './assets/css/icons.css';
import './assets/css/pace.min.css';
import './assets/css/semi-dark.css';
import $ from 'jquery';

import './assets/css/app.css';

import VueApexCharts from "vue3-apexcharts";


// import './assets/plugins/simplebar/css/simplebar.css';
// import './assets/plugins/perfect-scrollbar/css/perfect-scrollbar.css'



import './assets/js/app.js';
import './assets/js/bootstrap.bundle.min.js';
import './assets/plugins/chartjs/js/chart.js';
import './assets/plugins/chartjs/js/chartjs-custom.js';
// import './assets/js/index3.js';
import './assets/js/pace.min.js';

import ConfirmationService from 'primevue/confirmationservice';
import ConfirmPopup from 'primevue/confirmpopup';
import Tooltip from 'primevue/tooltip';
import 'animate.css';


import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import router from './router'
import { VueFire, VueFireAuth } from 'vuefire'
import { firebaseApp } from '@/firebase.js';
import ToastService from 'primevue/toastservice';

const app = createApp(App)

app.use(VueFire, {
    // imported above but could also just be created here
    firebaseApp,
    modules: [VueFireAuth()],
  })
app.use(createPinia())
app.use(router)
app.use(VueApexCharts)
app.use(PrimeVue, {
  theme: {
      preset: Aura,
      options: {
         darkModeSelector: '.dark-theme'
      }
  }
},);
app.directive('tooltip', Tooltip);
app.use(ConfirmationService);
app.use(ToastService);
app.config.globalProperties.$ = $
app.component('ConfirmPopup', ConfirmPopup);
app.mount('#app')

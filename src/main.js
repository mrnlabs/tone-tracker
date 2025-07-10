import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Global styles
import './assets/styles/globals.scss'

// PrimeIcons
import 'primeicons/primeicons.css'

// PrimeVue
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'

// PrimeVue Components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Card from 'primevue/card'
import Toast from 'primevue/toast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import ProgressBar from 'primevue/progressbar'
import Badge from 'primevue/badge'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import ColorPicker from 'primevue/colorpicker'
import InputNumber from 'primevue/inputnumber'
import ProgressSpinner from 'primevue/progressspinner'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Timeline from 'primevue/timeline'
import Calendar from 'primevue/calendar'
import MultiSelect from 'primevue/multiselect'

// Create app
const app = createApp(App)
const pinia = createPinia()

// Configure PrimeVue
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
})

app.use(ToastService)
app.use(pinia)
app.use(router)

// Register directives
app.directive('tooltip', Tooltip)

// Register components
app.component('Button', Button)
app.component('InputText', InputText)
app.component('Password', Password)
app.component('Checkbox', Checkbox)
app.component('Card', Card)
app.component('Toast', Toast)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Tag', Tag)
app.component('Avatar', Avatar)
app.component('ProgressBar', ProgressBar)
app.component('Badge', Badge)
app.component('Dropdown', Dropdown)
app.component('Dialog', Dialog)
app.component('Textarea', Textarea)
app.component('ColorPicker', ColorPicker)
app.component('InputNumber', InputNumber)
app.component('ProgressSpinner', ProgressSpinner)
app.component('TabView', TabView)
app.component('TabPanel', TabPanel)
app.component('Timeline', Timeline)
app.component('Calendar', Calendar)
app.component('MultiSelect', MultiSelect)

// Mount app
app.mount('#app')
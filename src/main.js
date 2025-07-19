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
import InputIcon from 'primevue/inputicon'
import IconField from 'primevue/iconfield'
import RadioButton from 'primevue/radiobutton'
import Message from 'primevue/message'

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
app.component('InputIcon', InputIcon)
app.component('IconField', IconField)
app.component('RadioButton', RadioButton)
app.component('Message', Message)

// Global error handler
app.config.errorHandler = (err, instance, info) => {
    console.error('Vue error:', err, info)
    
    // In production, you might want to send errors to a logging service
    if (import.meta.env.PROD) {
        // Example: Send to error tracking service
        // errorTrackingService.captureException(err, { extra: { info } })
    }
    
    // Show user-friendly error message
    if (instance && instance.$toast) {
        instance.$toast.add({
            severity: 'error',
            summary: 'Application Error',
            detail: 'An unexpected error occurred. Please try again.',
            life: 5000
        })
    }
}

// Global warning handler for development
if (import.meta.env.DEV) {
    app.config.warnHandler = (msg, instance, trace) => {
        console.warn('Vue warning:', msg, trace)
    }
}

// Initialize PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            await navigator.serviceWorker.register('/sw.js')
            console.log('Service Worker registered successfully')
        } catch (error) {
            console.error('Service Worker registration failed:', error)
        }
    })
}

// Mount app
app.mount('#app')
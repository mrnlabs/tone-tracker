// src/components/index.js
// Centralized component exports for the Activation Tracking System

// === BASE UI COMPONENTS ===
export { default as BaseButton } from './ui/BaseButton.vue'
export { default as BaseInput } from './ui/BaseInput.vue'
export { default as BaseDropdown } from './ui/BaseDropdown.vue'
export { default as BaseCard } from './ui/BaseCard.vue'
export { default as BaseModal } from './ui/BaseModal.vue'
export { default as BaseTable } from './ui/BaseTable.vue'
export { default as StatusBadge } from './ui/StatusBadge.vue'
export { default as LoadingSpinner } from './ui/LoadingSpinner.vue'
export { default as InputError } from './form-components/InputError.vue'
export { default as BaseLoader } from './ui/BaseLoader.vue'

// === WAREHOUSE COMPONENTS ===
export { default as StockMovementList } from './warehouses/StockMovementList.vue'
export { default as StockSummary } from './warehouses/StockSummary.vue'

// === MAP COMPONENTS ===
export { default as ActivationMap } from './maps/ActivationMap.vue'

// === SALES COMPONENTS ===
export { default as RecordSale } from './sales/RecordSale.vue'

// === PROMOTER COMPONENTS ===
export { default as PromoterCheckInOut } from './promoters/CheckInOut.vue'
export { default as ActivityLogger } from './promoters/ActivityLogger.vue'
export { default as PromoterSales } from './promoters/PromoterSales.vue'
export { default as CustomerInteraction } from './promoters/CustomerInteraction.vue'
export { default as ExpenseReporting } from './promoters/ExpenseReporting.vue'
export { default as PromoterImageGallery } from './promoters/PromoterImageGallery.vue'

// === ACTIVATION COMPONENTS ===
export { default as CheckInOut } from './activations/CheckInOut.vue'
export { default as ActivationImageGallery } from './activations/ActivationImageGallery.vue'

// === LEAD COMPONENTS ===
export { default as LeadCommentForm } from './leads/LeadCommentForm.vue'
export { default as FollowUpLeads } from './leads/FollowUpLeads.vue'
export { default as LeadAnalytics } from './leads/LeadAnalytics.vue'

// === REPORT COMPONENTS ===
export { default as DailyReportForm } from './reports/DailyReportForm.vue'
export { default as ConsumerBehaviorSection } from './reports/ConsumerBehaviorSection.vue'
export { default as ConsumerBehaviorDisplay } from './reports/ConsumerBehaviorDisplay.vue'

// === SAMPLE COMPONENTS ===
export { default as RecordSample } from './samples/RecordSample.vue'

// === SERVICES ===
export { default as salesService } from '../services/salesService.js'
export { default as stockMovementService } from '../services/stockMovementService.js'
export { default as stockReportService } from '../services/stockReportService.js'



/**
 * Component registration helper for bulk registration
 * Use this to register all base components globally in your Vue app
 *
 * @param {Vue App} app - Vue application instance
 */
export function registerBaseComponents(app) {
    // Base UI Components
    import('./ui/BaseButton.vue').then(module => {
        app.component('BaseButton', module.default)
    }).catch(() => {})

    import('./ui/BaseInput.vue').then(module => {
        app.component('BaseInput', module.default)
    }).catch(() => {})

    import('./ui/BaseDropdown.vue').then(module => {
        app.component('BaseDropdown', module.default)
    }).catch(() => {})

    import('./ui/BaseCard.vue').then(module => {
        app.component('BaseCard', module.default)
    }).catch(() => {})

    import('./ui/BaseModal.vue').then(module => {
        app.component('BaseModal', module.default)
    }).catch(() => {})

    import('./ui/BaseTable.vue').then(module => {
        app.component('BaseTable', module.default)
    }).catch(() => {})

    import('./ui/StatusBadge.vue').then(module => {
        app.component('StatusBadge', module.default)
    }).catch(() => {})

    import('./ui/LoadingSpinner.vue').then(module => {
        app.component('LoadingSpinner', module.default)
    }).catch(() => {})

    import('./form-components/InputError.vue').then(module => {
        app.component('InputError', module.default)
    }).catch(() => {})

    // Form Components
    // import('./forms/BaseForm.vue').then(module => {
    //     app.component('BaseForm', module.default)
    // }).catch(() => {})
    //
    // import('./forms/FileUploadGeneric.vue').then(module => {
    //     app.component('FileUploadGeneric', module.default)
    // }).catch(() => {})

    console.log('Base components registered globally')
}

/**
 * Component configuration and defaults
 * Centralized configuration for consistent component behavior
 */
export const componentDefaults = {
    button: {
        variant: 'primary',
        size: 'medium',
        rounded: false
    },
    input: {
        size: 'medium',
        required: false,
        passwordFeedback: true
    },
    dropdown: {
        size: 'medium',
        filter: false,
        showClear: false
    },
    card: {
        variant: 'default',
        size: 'medium',
        padding: 'normal',
        shadow: 'medium',
        hoverable: false
    },
    modal: {
        size: 'medium',
        variant: 'default',
        closable: true,
        modal: true
    },
    table: {
        size: 'normal',
        paginator: true,
        rows: 10,
        sortable: true,
        searchable: true,
        stripedRows: true,
        hover: true
    },
    statusBadge: {
        size: 'medium',
        showDot: true,
        rounded: true,
        outlined: false
    },
    loadingSpinner: {
        type: 'spinner',
        size: 'medium',
        color: 'primary',
        centered: false
    }
}

/**
 * Theme configuration for consistent styling
 */
export const themeConfig = {
    colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#06b6d4',
        light: '#f8fafc',
        dark: '#1e293b'
    },
    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem'
    },
    borderRadius: {
        none: '0',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px'
    },
    shadows: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    fonts: {
        sans: 'Inter, system-ui, sans-serif',
        mono: 'Monaco, Consolas, monospace'
    }
}

/**
 * Activation tracking specific component configurations
 */
export const activationConfig = {
    statusColors: {
        active: '#10b981',
        pending: '#f59e0b',
        completed: '#059669',
        cancelled: '#dc2626',
        draft: '#6b7280',
        scheduled: '#06b6d4'
    },
    priorityColors: {
        low: '#10b981',
        medium: '#f59e0b',
        high: '#ef4444',
        urgent: '#dc2626'
    },
    defaultMapOptions: {
        zoom: 15,
        center: { lat: -17.8292, lng: 31.0522 }, // Harare, Zimbabwe
        mapTypeId: 'roadmap'
    }
}

/**
 * Usage examples and documentation
 */
export const componentUsageExamples = {
    baseButton: `
    <BaseButton 
      label="Click Me" 
      variant="primary" 
      size="medium"
      @click="handleClick"
    />
    `,
    baseCard: `
    <BaseCard 
      title="Card Title"
      subtitle="Card Subtitle"
      icon="pi pi-home"
      variant="primary"
    >
      <p>Card content goes here</p>
    </BaseCard>
    `,
    statusBadge: `
    <StatusBadge 
      status="active"
      variant="auto"
      size="medium"
      :showDot="true"
    />
    `,
    baseModal: `
    <BaseModal
      v-model:visible="showModal"
      title="Modal Title"
      size="medium"
      :showDefaultButtons="true"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    >
      <p>Modal content</p>
    </BaseModal>
    `
}

export default {
    registerBaseComponents,
    componentDefaults,
    themeConfig,
    activationConfig,
    componentUsageExamples
}
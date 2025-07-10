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

// // Additional UI Components (to be created)
// export { default as BaseAlert } from './ui/BaseAlert.vue'
// export { default as BaseBadge } from './ui/BaseBadge.vue'
// export { default as BaseAvatar } from './ui/BaseAvatar.vue'
// export { default as BaseProgressBar } from './ui/BaseProgressBar.vue'
// export { default as BaseTabs } from './ui/BaseTabs.vue'
// export { default as BaseAccordion } from './ui/BaseAccordion.vue'
// export { default as BaseTooltip } from './ui/BaseTooltip.vue'
// export { default as BaseBreadcrumb } from './ui/BaseBreadcrumb.vue'
// export { default as BasePagination } from './ui/BasePagination.vue'
//
// // === FORM COMPONENTS ===
// export { default as BaseForm } from './forms/BaseForm.vue'
// export { default as BaseFormGroup } from './forms/BaseFormGroup.vue'
// export { default as BaseCheckbox } from './forms/BaseCheckbox.vue'
// export { default as BaseRadio } from './forms/BaseRadio.vue'
// export { default as BaseSwitch } from './forms/BaseSwitch.vue'
// export { default as BaseSlider } from './forms/BaseSlider.vue'
// export { default as BaseFileUpload } from './forms/BaseFileUpload.vue'
// export { default as BaseDatePicker } from './forms/BaseDatePicker.vue'
// export { default as BaseTimePicker } from './forms/BaseTimePicker.vue'
// export { default as BaseColorPicker } from './forms/BaseColorPicker.vue'
// export { default as FileUploadGeneric } from './forms/FileUploadGeneric.vue'
//
// // === LAYOUT COMPONENTS ===
// export { default as BaseContainer } from './layout/BaseContainer.vue'
// export { default as BaseGrid } from './layout/BaseGrid.vue'
// export { default as BaseColumn } from './layout/BaseColumn.vue'
// export { default as BaseSidebar } from './layout/BaseSidebar.vue'
// export { default as BaseNavbar } from './layout/BaseNavbar.vue'
// export { default as BaseFooter } from './layout/BaseFooter.vue'
//
// // === GENERAL/LAYOUT COMPONENTS ===
// export { default as DashboardLayout } from './layout/DashboardLayout.vue'
// export { default as Sidebar } from './layout/Sidebar.vue'
// export { default as TopBar } from './layout/TopBar.vue'
//
// // === DASHBOARD COMPONENTS ===
// export { default as DashboardStats } from './dashboard/DashboardStats.vue'
// export { default as StatsCard } from './dashboard/StatsCard.vue'
// export { default as ChartCard } from './dashboard/ChartCard.vue'
// export { default as MetricCard } from './dashboard/MetricCard.vue'
// export { default as TrendIndicator } from './dashboard/TrendIndicator.vue'
//
// // === ACTIVATION TRACKING SPECIFIC COMPONENTS ===
// export { default as ActivationCard } from './activations/ActivationCard.vue'
// export { default as ActivationForm } from './activations/ActivationForm.vue'
// export { default as ActivationList } from './activations/ActivationList.vue'
// export { default as ActivationMap } from './activations/ActivationMap.vue'
// export { default as ActivationStats } from './activations/ActivationStats.vue'
// export { default as ActivationTimeline } from './activations/ActivationTimeline.vue'
// export { default as ActivationTeam } from './activations/ActivationTeam.vue'
//
// // === CLIENT COMPONENTS ===
// export { default as ClientCard } from './clients/ClientCard.vue'
// export { default as ClientForm } from './clients/ClientForm.vue'
// export { default as ClientList } from './clients/ClientList.vue'
// export { default as ClientProfile } from './clients/ClientProfile.vue'
//
// // === PROMOTER/USER COMPONENTS ===
// export { default as PromoterCard } from './promoters/PromoterCard.vue'
// export { default as PromoterForm } from './promoters/PromoterForm.vue'
// export { default as PromoterList } from './promoters/PromoterList.vue'
// export { default as PromoterProfile } from './promoters/PromoterProfile.vue'
// export { default as AttendanceTracker } from './promoters/AttendanceTracker.vue'
// export { default as TeamMemberCard } from './promoters/TeamMemberCard.vue'
//
// // === WAREHOUSE/INVENTORY COMPONENTS ===
// export { default as InventoryCard } from './warehouse/InventoryCard.vue'
// export { default as InventoryForm } from './warehouse/InventoryForm.vue'
// export { default as InventoryList } from './warehouse/InventoryList.vue'
// export { default as StockTracker } from './warehouse/StockTracker.vue'
// export { default as ReplenishmentAlert } from './warehouse/ReplenishmentAlert.vue'
// export { default as StockAllocation } from './warehouse/StockAllocation.vue'
//
// // === REPORT COMPONENTS ===
// export { default as ReportCard } from './reports/ReportCard.vue'
// export { default as ReportGenerator } from './reports/ReportGenerator.vue'
// export { default as ReportViewer } from './reports/ReportViewer.vue'
// export { default as ChartComponent } from './reports/ChartComponent.vue'
// export { default as DataVisualization } from './reports/DataVisualization.vue'
// export { default as ExportOptions } from './reports/ExportOptions.vue'
//
// // === AUTH COMPONENTS ===
// export { default as LoginForm } from './auth/LoginForm.vue'
// export { default as RegisterForm } from './auth/RegisterForm.vue'
// export { default as ForgotPasswordForm } from './auth/ForgotPasswordForm.vue'
// export { default as ResetPasswordForm } from './auth/ResetPasswordForm.vue'
// export { default as UserProfile } from './auth/UserProfile.vue'
//
// // === SPECIALIZED COMPONENTS ===
// export { default as GoogleMapsIntegration } from './maps/GoogleMapsIntegration.vue'
// export { default as LocationPicker } from './maps/LocationPicker.vue'
// export { default as RouteTracker } from './maps/RouteTracker.vue'
// export { default as NotificationCenter } from './notifications/NotificationCenter.vue'
// export { default as NotificationItem } from './notifications/NotificationItem.vue'
// export { default as SearchBox } from './common/SearchBox.vue'
// export { default as FilterPanel } from './common/FilterPanel.vue'
// export { default as DataExporter } from './common/DataExporter.vue'
// export { default as ImageUploader } from './common/ImageUploader.vue'

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
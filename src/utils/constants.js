// src/utils/constants.js
// Application-wide constants for the Activation Tracking System

// User Roles and Permissions
export const USER_ROLES = {
    ADMIN: 'ADMIN',
    ACTIVATION_MANAGER: 'ACTIVATION_MANAGER',
    WAREHOUSE_MANAGER: 'WAREHOUSE_MANAGER',
    PROMOTER: 'PROMOTER',
    CLIENT: 'CLIENT'
}

export const ROLE_PERMISSIONS = {
    [USER_ROLES.ADMIN]: [
        'manage_users',
        'manage_clients',
        'manage_activations',
        'manage_warehouse',
        'view_all_reports',
        'system_settings'
    ],
    [USER_ROLES.ACTIVATION_MANAGER]: [
        'manage_activations',
        'assign_promoters',
        'view_activation_reports',
        'upload_briefs'
    ],
    [USER_ROLES.WAREHOUSE_MANAGER]: [
        'manage_inventory',
        'allocate_stock',
        'view_warehouse_reports',
        'track_distribution'
    ],
    [USER_ROLES.PROMOTER]: [
        'view_assigned_activations',
        'checkin_checkout',
        'record_sales',
        'collect_customer_data'
    ],
    [USER_ROLES.CLIENT]: [
        'view_own_activations',
        'view_own_reports',
        'download_reports'
    ]
}

// Activation Statuses
export const ACTIVATION_STATUS = {
    DRAFT: 'draft',
    SCHEDULED: 'scheduled',
    ACTIVE: 'active',
    IN_PROGRESS: 'in-progress',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    OVERDUE: 'overdue'
}

export const ACTIVATION_STATUS_LABELS = {
    [ACTIVATION_STATUS.DRAFT]: 'Draft',
    [ACTIVATION_STATUS.SCHEDULED]: 'Scheduled',
    [ACTIVATION_STATUS.ACTIVE]: 'Active',
    [ACTIVATION_STATUS.IN_PROGRESS]: 'In Progress',
    [ACTIVATION_STATUS.PAUSED]: 'Paused',
    [ACTIVATION_STATUS.COMPLETED]: 'Completed',
    [ACTIVATION_STATUS.CANCELLED]: 'Cancelled',
    [ACTIVATION_STATUS.OVERDUE]: 'Overdue'
}

// Priority Levels
export const PRIORITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
}

export const PRIORITY_LABELS = {
    [PRIORITY_LEVELS.LOW]: 'Low',
    [PRIORITY_LEVELS.MEDIUM]: 'Medium',
    [PRIORITY_LEVELS.HIGH]: 'High',
    [PRIORITY_LEVELS.URGENT]: 'Urgent'
}

// Activation Types
export const ACTIVATION_TYPES = {
    PRODUCT_LAUNCH: 'product_launch',
    SAMPLING: 'sampling',
    BRAND_AWARENESS: 'brand_awareness',
    PROMOTIONAL: 'promotional',
    ROADSHOW: 'roadshow',
    EVENT_ACTIVATION: 'event_activation',
    RETAIL_ACTIVATION: 'retail_activation'
}

export const ACTIVATION_TYPE_LABELS = {
    [ACTIVATION_TYPES.PRODUCT_LAUNCH]: 'Product Launch',
    [ACTIVATION_TYPES.SAMPLING]: 'Product Sampling',
    [ACTIVATION_TYPES.BRAND_AWARENESS]: 'Brand Awareness',
    [ACTIVATION_TYPES.PROMOTIONAL]: 'Promotional Campaign',
    [ACTIVATION_TYPES.ROADSHOW]: 'Roadshow',
    [ACTIVATION_TYPES.EVENT_ACTIVATION]: 'Event Activation',
    [ACTIVATION_TYPES.RETAIL_ACTIVATION]: 'Retail Activation'
}

// User/Promoter Statuses
export const USER_STATUS = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    CHECKED_IN: 'checked-in',
    CHECKED_OUT: 'checked-out',
    ON_BREAK: 'on-break',
    ABSENT: 'absent'
}

export const USER_STATUS_LABELS = {
    [USER_STATUS.ONLINE]: 'Online',
    [USER_STATUS.OFFLINE]: 'Offline',
    [USER_STATUS.CHECKED_IN]: 'Checked In',
    [USER_STATUS.CHECKED_OUT]: 'Checked Out',
    [USER_STATUS.ON_BREAK]: 'On Break',
    [USER_STATUS.ABSENT]: 'Absent'
}

// Stock/Inventory Statuses
export const STOCK_STATUS = {
    IN_STOCK: 'in-stock',
    LOW_STOCK: 'low-stock',
    OUT_OF_STOCK: 'out-of-stock',
    ALLOCATED: 'allocated',
    DELIVERED: 'delivered',
    RETURNED: 'returned'
}

export const STOCK_STATUS_LABELS = {
    [STOCK_STATUS.IN_STOCK]: 'In Stock',
    [STOCK_STATUS.LOW_STOCK]: 'Low Stock',
    [STOCK_STATUS.OUT_OF_STOCK]: 'Out of Stock',
    [STOCK_STATUS.ALLOCATED]: 'Allocated',
    [STOCK_STATUS.DELIVERED]: 'Delivered',
    [STOCK_STATUS.RETURNED]: 'Returned'
}

// Stock Movement Types - Must match API specification exactly
export const STOCK_MOVEMENT_TYPE = {
    SALE: 'SALE',
    ALLOCATION: 'ALLOCATION',
    REPLENISHMENT: 'REPLENISHMENT',
    ADJUSTMENT: 'ADJUSTMENT',
    DISTRIBUTION: 'DISTRIBUTION',
    RETURN: 'RETURN',
    SAMPLE: 'SAMPLE',
    IN: 'IN',
    OUT: 'OUT'
}

export const STOCK_MOVEMENT_TYPE_LABELS = {
    [STOCK_MOVEMENT_TYPE.SALE]: 'Sale',
    [STOCK_MOVEMENT_TYPE.ALLOCATION]: 'Allocation',
    [STOCK_MOVEMENT_TYPE.REPLENISHMENT]: 'Replenishment',
    [STOCK_MOVEMENT_TYPE.ADJUSTMENT]: 'Adjustment',
    [STOCK_MOVEMENT_TYPE.DISTRIBUTION]: 'Distribution',
    [STOCK_MOVEMENT_TYPE.RETURN]: 'Return',
    [STOCK_MOVEMENT_TYPE.SAMPLE]: 'Sample',
    [STOCK_MOVEMENT_TYPE.IN]: 'Stock In',
    [STOCK_MOVEMENT_TYPE.OUT]: 'Stock Out'
}

// Stock Movement Reasons
export const STOCK_MOVEMENT_REASON = {
    PURCHASE: 'purchase',
    SALE: 'sale',
    DAMAGE: 'damage',
    THEFT: 'theft',
    EXPIRY: 'expiry',
    QUALITY_ISSUE: 'quality_issue',
    INVENTORY_COUNT: 'inventory_count',
    PROMOTION: 'promotion',
    TRANSFER_IN: 'transfer_in',
    TRANSFER_OUT: 'transfer_out',
    CUSTOMER_RETURN: 'customer_return',
    SUPPLIER_RETURN: 'supplier_return',
    OTHER: 'other'
}

export const STOCK_MOVEMENT_REASON_LABELS = {
    [STOCK_MOVEMENT_REASON.PURCHASE]: 'Purchase',
    [STOCK_MOVEMENT_REASON.SALE]: 'Sale',
    [STOCK_MOVEMENT_REASON.DAMAGE]: 'Damage',
    [STOCK_MOVEMENT_REASON.THEFT]: 'Theft',
    [STOCK_MOVEMENT_REASON.EXPIRY]: 'Expiry',
    [STOCK_MOVEMENT_REASON.QUALITY_ISSUE]: 'Quality Issue',
    [STOCK_MOVEMENT_REASON.INVENTORY_COUNT]: 'Inventory Count',
    [STOCK_MOVEMENT_REASON.PROMOTION]: 'Promotional Activity',
    [STOCK_MOVEMENT_REASON.TRANSFER_IN]: 'Transfer In',
    [STOCK_MOVEMENT_REASON.TRANSFER_OUT]: 'Transfer Out',
    [STOCK_MOVEMENT_REASON.CUSTOMER_RETURN]: 'Customer Return',
    [STOCK_MOVEMENT_REASON.SUPPLIER_RETURN]: 'Supplier Return',
    [STOCK_MOVEMENT_REASON.OTHER]: 'Other'
}

// Client Statuses
export const CLIENT_STATUS = {
    NEW: 'NEW',
    ACTIVE: 'ACTIVE',
    VERIFIED: 'VERIFIED',
    INACTIVE: 'INACTIVE',
    SUSPENDED: 'SUSPENDED'
}

export const CLIENT_STATUS_LABELS = {
    [CLIENT_STATUS.NEW]: 'New',
    [CLIENT_STATUS.ACTIVE]: 'Active',
    [CLIENT_STATUS.VERIFIED]: 'Verified',
    [CLIENT_STATUS.INACTIVE]: 'Inactive',
    [CLIENT_STATUS.SUSPENDED]: 'Suspended'
}

// Payment Methods
export const PAYMENT_METHODS = {
    USD: 'USD',
    ZWL: 'ZWL',
    ECOCASH: 'Ecocash',
    SWIPE: 'Swipe',
    CREDIT_CARD: 'Credit Card',
    BANK_TRANSFER: 'Bank Transfer'
}

export const PAYMENT_METHOD_LABELS = {
    [PAYMENT_METHODS.USD]: 'USD Cash',
    [PAYMENT_METHODS.ZWL]: 'ZWL Cash',
    [PAYMENT_METHODS.ECOCASH]: 'Ecocash',
    [PAYMENT_METHODS.SWIPE]: 'Card Swipe',
    [PAYMENT_METHODS.CREDIT_CARD]: 'Credit Card',
    [PAYMENT_METHODS.BANK_TRANSFER]: 'Bank Transfer'
}

// Customer Demographics
export const CUSTOMER_GENDER = {
    MALE: 'male',
    FEMALE: 'female',
    OTHER: 'other',
    PREFER_NOT_TO_SAY: 'prefer_not_to_say'
}

export const CUSTOMER_AGE_GROUPS = {
    UNDER_18: 'under_18',
    AGE_18_24: '18_24',
    AGE_25_34: '25_34',
    AGE_35_44: '35_44',
    AGE_45_54: '45_54',
    AGE_55_64: '55_64',
    OVER_65: 'over_65'
}

export const CUSTOMER_AGE_GROUP_LABELS = {
    [CUSTOMER_AGE_GROUPS.UNDER_18]: 'Under 18',
    [CUSTOMER_AGE_GROUPS.AGE_18_24]: '18-24',
    [CUSTOMER_AGE_GROUPS.AGE_25_34]: '25-34',
    [CUSTOMER_AGE_GROUPS.AGE_35_44]: '35-44',
    [CUSTOMER_AGE_GROUPS.AGE_45_54]: '45-54',
    [CUSTOMER_AGE_GROUPS.AGE_55_64]: '55-64',
    [CUSTOMER_AGE_GROUPS.OVER_65]: '65+'
}

export const CUSTOMER_TYPES = {
    SHOPPER: 'shopper',
    RETAILER: 'retailer',
    WHOLESALER: 'wholesaler',
    DISTRIBUTOR: 'distributor',
    END_USER: 'end_user'
}

export const CUSTOMER_TYPE_LABELS = {
    [CUSTOMER_TYPES.SHOPPER]: 'Shopper',
    [CUSTOMER_TYPES.RETAILER]: 'Retailer',
    [CUSTOMER_TYPES.WHOLESALER]: 'Wholesaler',
    [CUSTOMER_TYPES.DISTRIBUTOR]: 'Distributor',
    [CUSTOMER_TYPES.END_USER]: 'End User'
}

// Purchase Drivers
export const PURCHASE_DRIVERS = {
    PRICE: 'price',
    QUALITY: 'quality',
    BRAND: 'brand',
    PROMOTION: 'promotion',
    RECOMMENDATION: 'recommendation',
    CONVENIENCE: 'convenience',
    PACKAGING: 'packaging'
}

export const PURCHASE_DRIVER_LABELS = {
    [PURCHASE_DRIVERS.PRICE]: 'Price',
    [PURCHASE_DRIVERS.QUALITY]: 'Quality',
    [PURCHASE_DRIVERS.BRAND]: 'Brand',
    [PURCHASE_DRIVERS.PROMOTION]: 'Promotion',
    [PURCHASE_DRIVERS.RECOMMENDATION]: 'Recommendation',
    [PURCHASE_DRIVERS.CONVENIENCE]: 'Convenience',
    [PURCHASE_DRIVERS.PACKAGING]: 'Packaging'
}

// Non-Purchase Reasons
export const NON_PURCHASE_REASONS = {
    TOO_EXPENSIVE: 'too_expensive',
    NOT_INTERESTED: 'not_interested',
    ALREADY_HAVE: 'already_have',
    WRONG_SIZE: 'wrong_size',
    POOR_QUALITY: 'poor_quality',
    NO_BUDGET: 'no_budget',
    NEED_MORE_INFO: 'need_more_info'
}

export const NON_PURCHASE_REASON_LABELS = {
    [NON_PURCHASE_REASONS.TOO_EXPENSIVE]: 'Too Expensive',
    [NON_PURCHASE_REASONS.NOT_INTERESTED]: 'Not Interested',
    [NON_PURCHASE_REASONS.ALREADY_HAVE]: 'Already Have Product',
    [NON_PURCHASE_REASONS.WRONG_SIZE]: 'Wrong Size/Variant',
    [NON_PURCHASE_REASONS.POOR_QUALITY]: 'Poor Quality Perception',
    [NON_PURCHASE_REASONS.NO_BUDGET]: 'No Budget',
    [NON_PURCHASE_REASONS.NEED_MORE_INFO]: 'Need More Information'
}

// Report Types
export const REPORT_TYPES = {
    ACTIVATION_SUMMARY: 'activation_summary',
    DAILY_REPORT: 'daily_report',
    SALES_REPORT: 'sales_report',
    ATTENDANCE_REPORT: 'attendance_report',
    INVENTORY_REPORT: 'inventory_report',
    CUSTOMER_INSIGHTS: 'customer_insights',
    PERFORMANCE_METRICS: 'performance_metrics'
}

export const REPORT_TYPE_LABELS = {
    [REPORT_TYPES.ACTIVATION_SUMMARY]: 'Activation Summary',
    [REPORT_TYPES.DAILY_REPORT]: 'Daily Report',
    [REPORT_TYPES.SALES_REPORT]: 'Sales Report',
    [REPORT_TYPES.ATTENDANCE_REPORT]: 'Attendance Report',
    [REPORT_TYPES.INVENTORY_REPORT]: 'Inventory Report',
    [REPORT_TYPES.CUSTOMER_INSIGHTS]: 'Customer Insights',
    [REPORT_TYPES.PERFORMANCE_METRICS]: 'Performance Metrics'
}

// File Types
export const ALLOWED_FILE_TYPES = {
    PDF: '.pdf',
    DOC: '.doc',
    DOCX: '.docx',
    JPG: '.jpg',
    JPEG: '.jpeg',
    PNG: '.png',
    GIF: '.gif',
    XLSX: '.xlsx',
    XLS: '.xls',
    CSV: '.csv'
}

export const FILE_TYPE_LABELS = {
    [ALLOWED_FILE_TYPES.PDF]: 'PDF Document',
    [ALLOWED_FILE_TYPES.DOC]: 'Word Document',
    [ALLOWED_FILE_TYPES.DOCX]: 'Word Document',
    [ALLOWED_FILE_TYPES.JPG]: 'JPEG Image',
    [ALLOWED_FILE_TYPES.JPEG]: 'JPEG Image',
    [ALLOWED_FILE_TYPES.PNG]: 'PNG Image',
    [ALLOWED_FILE_TYPES.GIF]: 'GIF Image',
    [ALLOWED_FILE_TYPES.XLSX]: 'Excel Spreadsheet',
    [ALLOWED_FILE_TYPES.XLS]: 'Excel Spreadsheet',
    [ALLOWED_FILE_TYPES.CSV]: 'CSV File'
}

// File Size Limits (in bytes)
export const FILE_SIZE_LIMITS = {
    DOCUMENT: 10 * 1024 * 1024, // 10MB
    IMAGE: 5 * 1024 * 1024,     // 5MB
    SPREADSHEET: 15 * 1024 * 1024, // 15MB
    DEFAULT: 5 * 1024 * 1024     // 5MB
}

// API Endpoints
export const API_ENDPOINTS = {
    // Authentication
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',

    // Users
    USERS: '/users',
    USER_PROFILE: '/users/current',
    UPDATE_PROFILE: '/users/current',

    // Clients
    CLIENTS: '/clients',
    CLIENT_ACTIVATIONS: '/clients/:id/activations',
    
    // Contacts
    CONTACTS: '/contacts',
    CONTACTS_BY_CLIENT: '/contacts/by-client/:clientId',
    CONTACT_PRIMARY: '/contacts/primary/:clientId',
    CONTACT_SET_PRIMARY: '/contacts/:id/set-primary',
    CONTACT_SEARCH: '/contacts/search/:clientId',

    // Activations
    ACTIVATIONS: '/activations',
    ACTIVATION_DETAILS: '/activations/:id',
    ACTIVATION_BRIEF: '/activations/:id/brief',
    ACTIVATION_TEAM: '/activations/:id/team',
    ACTIVATION_REPORTS: '/activations/:id/reports',

    // Warehouse/Inventory
    WAREHOUSES: '/warehouses',
    WAREHOUSE_INVENTORY: '/warehouses/:id/inventory',
    WAREHOUSE_STATS: '/warehouses/:id/stats',
    WAREHOUSE_REPORTS: '/warehouses/:id/reports',
    INVENTORY: '/inventory',
    STOCK_ALLOCATION: '/inventory/allocate',
    STOCK_MOVEMENTS: '/inventory/movements',
    STOCK_TRANSFERS: '/warehouses/transfers',
    
    // Stock Management
    STOCKS: '/stocks',
    STOCK_DETAILS: '/stocks/:id',
    STOCK_MOVEMENT_HISTORY: '/stocks/:id/movements',
    
    // Sales
    SALES: '/api/sales',
    CREATE_SALE: '/api/sales',

    // Reports
    REPORTS: '/reports',
    GENERATE_REPORT: '/reports/generate',
    DOWNLOAD_REPORT: '/reports/:id/download',

    // File Upload
    UPLOAD_FILE: '/files/upload',
    DELETE_FILE: '/files/:id'
}

// Validation Rules
export const VALIDATION_RULES = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\+]?[1-9][\d]{0,15}$/,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    USERNAME_PATTERN: /^[a-zA-Z0-9_-]{3,20}$/,
    ACTIVATION_CODE_PATTERN: /^[A-Z]{2,4}-\d{4}-\d{3}$/
}

// Date/Time Formats
export const DATE_FORMATS = {
    DISPLAY: 'DD/MM/YYYY',
    API: 'YYYY-MM-DD',
    DATETIME: 'DD/MM/YYYY HH:mm',
    TIME: 'HH:mm'
}

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
    MAX_PAGE_SIZE: 100
}

// Charts/Analytics
export const CHART_COLORS = {
    PRIMARY: '#3b82f6',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    DANGER: '#ef4444',
    INFO: '#06b6d4',
    SECONDARY: '#6b7280'
}

export const CHART_TYPES = {
    LINE: 'line',
    BAR: 'bar',
    PIE: 'pie',
    DOUGHNUT: 'doughnut',
    AREA: 'area'
}

// Notification Types
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
}

// Local Storage Keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'activation_auth_token',
    REFRESH_TOKEN: 'activation_refresh_token',
    USER_PREFERENCES: 'activation_user_preferences',
    THEME: 'activation_theme',
    LANGUAGE: 'activation_language'
}

// Theme Configuration
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto'
}

// Languages
export const LANGUAGES = {
    EN: 'en'
}

export const LANGUAGE_LABELS = {
    [LANGUAGES.EN]: 'English'
}

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your internet connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    FORBIDDEN: 'Access denied.',
    FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
    INVALID_FILE_TYPE: 'Invalid file type.',
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_PHONE: 'Please enter a valid phone number.',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
    PASSWORD_WEAK: 'Password must contain uppercase, lowercase, number and special character.'
}

// Success Messages
export const SUCCESS_MESSAGES = {
    SAVE_SUCCESS: 'Successfully saved.',
    UPDATE_SUCCESS: 'Successfully updated.',
    DELETE_SUCCESS: 'Successfully deleted.',
    UPLOAD_SUCCESS: 'File uploaded successfully.',
    EMAIL_SENT: 'Email sent successfully.',
    LOGIN_SUCCESS: 'Login successful.',
    LOGOUT_SUCCESS: 'Logout successful.',
    REGISTRATION_SUCCESS: 'Registration successful.'
}

// Equipment/Materials commonly used in activations
export const EQUIPMENT_TYPES = {
    TABLES: 'tables',
    CHAIRS: 'chairs',
    TENTS: 'tents',
    BANNERS: 'banners',
    SOUND_SYSTEM: 'sound_system',
    PROJECTOR: 'projector',
    TABLETS: 'tablets',
    UNIFORMS: 'uniforms',
    BRANDED_MATERIALS: 'branded_materials'
}

export const EQUIPMENT_TYPE_LABELS = {
    [EQUIPMENT_TYPES.TABLES]: 'Tables',
    [EQUIPMENT_TYPES.CHAIRS]: 'Chairs',
    [EQUIPMENT_TYPES.TENTS]: 'Tents/Gazebos',
    [EQUIPMENT_TYPES.BANNERS]: 'Banners/Signage',
    [EQUIPMENT_TYPES.SOUND_SYSTEM]: 'Sound System',
    [EQUIPMENT_TYPES.PROJECTOR]: 'Projector/Screen',
    [EQUIPMENT_TYPES.TABLETS]: 'Tablets/iPads',
    [EQUIPMENT_TYPES.UNIFORMS]: 'Uniforms/T-shirts',
    [EQUIPMENT_TYPES.BRANDED_MATERIALS]: 'Branded Materials'
}

// Venue Categories
export const VENUE_CATEGORIES = {
    MALL: 'mall',
    RETAIL_STORE: 'retail_store',
    SUPERMARKET: 'supermarket',
    EVENT_CENTER: 'event_center',
    OUTDOOR: 'outdoor',
    OFFICE_BUILDING: 'office_building',
    UNIVERSITY: 'university',
    STREET: 'street'
}

export const VENUE_CATEGORY_LABELS = {
    [VENUE_CATEGORIES.MALL]: 'Shopping Mall',
    [VENUE_CATEGORIES.RETAIL_STORE]: 'Retail Store',
    [VENUE_CATEGORIES.SUPERMARKET]: 'Supermarket',
    [VENUE_CATEGORIES.EVENT_CENTER]: 'Event Center',
    [VENUE_CATEGORIES.OUTDOOR]: 'Outdoor Location',
    [VENUE_CATEGORIES.OFFICE_BUILDING]: 'Office Building',
    [VENUE_CATEGORIES.UNIVERSITY]: 'University/School',
    [VENUE_CATEGORIES.STREET]: 'Street/Public Space'
}

// Default Application Settings
export const APP_SETTINGS = {
    APP_NAME: 'Activation Tracking System',
    APP_VERSION: '1.0.0',
    COMPANY_NAME: 'Your Company Name',
    SUPPORT_EMAIL: 'support@example.com',
    // GOOGLE_MAPS_API_KEY: process.env.VUE_APP_GOOGLE_MAPS_API_KEY || '',
    DEFAULT_TIMEZONE: 'Africa/Harare',
    DEFAULT_CURRENCY: 'USD',
    DEFAULT_LANGUAGE: LANGUAGES.EN,
    DEFAULT_THEME: THEMES.LIGHT
}

// Lead Management Constants
export const LEAD_GENDERS = {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
    OTHER: 'OTHER'
}

export const LEAD_GENDER_LABELS = {
    [LEAD_GENDERS.MALE]: 'Male',
    [LEAD_GENDERS.FEMALE]: 'Female',
    [LEAD_GENDERS.OTHER]: 'Other'
}

export const LEAD_AGE_GROUPS = {
    UNDER_18: 'UNDER_18',
    BETWEEN_18_25: 'BETWEEN_18_25',
    BETWEEN_26_35: 'BETWEEN_26_35',
    BETWEEN_36_45: 'BETWEEN_36_45',
    BETWEEN_46_55: 'BETWEEN_46_55',
    OVER_55: 'OVER_55'
}

export const LEAD_AGE_GROUP_LABELS = {
    [LEAD_AGE_GROUPS.UNDER_18]: 'Under 18',
    [LEAD_AGE_GROUPS.BETWEEN_18_25]: '18-25',
    [LEAD_AGE_GROUPS.BETWEEN_26_35]: '26-35',
    [LEAD_AGE_GROUPS.BETWEEN_36_45]: '36-45',
    [LEAD_AGE_GROUPS.BETWEEN_46_55]: '46-55',
    [LEAD_AGE_GROUPS.OVER_55]: 'Over 55'
}

export const LEAD_CUSTOMER_TYPES = {
    SHOPPER: 'SHOPPER',
    RETAILER: 'RETAILER',
    DISTRIBUTOR: 'DISTRIBUTOR'
}

export const LEAD_CUSTOMER_TYPE_LABELS = {
    [LEAD_CUSTOMER_TYPES.SHOPPER]: 'Shopper',
    [LEAD_CUSTOMER_TYPES.RETAILER]: 'Retailer',
    [LEAD_CUSTOMER_TYPES.DISTRIBUTOR]: 'Distributor'
}

export const LEAD_REPEAT_PURCHASE_INTENT = {
    YES: 'YES',
    NO: 'NO',
    MAYBE: 'MAYBE'
}

export const LEAD_REPEAT_PURCHASE_LABELS = {
    [LEAD_REPEAT_PURCHASE_INTENT.YES]: 'Yes',
    [LEAD_REPEAT_PURCHASE_INTENT.NO]: 'No',
    [LEAD_REPEAT_PURCHASE_INTENT.MAYBE]: 'Maybe'
}

export const LEAD_BRAND_AWARENESS_LEVELS = {
    NOT_AWARE: 1,
    SLIGHTLY_AWARE: 2,
    SOMEWHAT_AWARE: 3,
    AWARE: 4,
    VERY_AWARE: 5
}

export const LEAD_BRAND_AWARENESS_LABELS = {
    [LEAD_BRAND_AWARENESS_LEVELS.NOT_AWARE]: 'Never heard of it',
    [LEAD_BRAND_AWARENESS_LEVELS.SLIGHTLY_AWARE]: 'Heard of it',
    [LEAD_BRAND_AWARENESS_LEVELS.SOMEWHAT_AWARE]: 'Somewhat familiar',
    [LEAD_BRAND_AWARENESS_LEVELS.AWARE]: 'Familiar',
    [LEAD_BRAND_AWARENESS_LEVELS.VERY_AWARE]: 'Very familiar'
}

export const LEAD_PURCHASE_INTENT_LEVELS = {
    NO_INTENT: 1,
    UNLIKELY: 2,
    MAYBE: 3,
    LIKELY: 4,
    DEFINITELY: 5
}

export const LEAD_PURCHASE_INTENT_LABELS = {
    [LEAD_PURCHASE_INTENT_LEVELS.NO_INTENT]: 'No intent to buy',
    [LEAD_PURCHASE_INTENT_LEVELS.UNLIKELY]: 'Unlikely to buy',
    [LEAD_PURCHASE_INTENT_LEVELS.MAYBE]: 'Maybe will buy',
    [LEAD_PURCHASE_INTENT_LEVELS.LIKELY]: 'Likely to buy',
    [LEAD_PURCHASE_INTENT_LEVELS.DEFINITELY]: 'Will definitely buy'
}

export const LEAD_ENGAGEMENT_QUALITY_LEVELS = {
    POOR: 1,
    FAIR: 2,
    GOOD: 3,
    VERY_GOOD: 4,
    EXCELLENT: 5
}

export const LEAD_ENGAGEMENT_QUALITY_LABELS = {
    [LEAD_ENGAGEMENT_QUALITY_LEVELS.POOR]: 'Poor',
    [LEAD_ENGAGEMENT_QUALITY_LEVELS.FAIR]: 'Fair',
    [LEAD_ENGAGEMENT_QUALITY_LEVELS.GOOD]: 'Good',
    [LEAD_ENGAGEMENT_QUALITY_LEVELS.VERY_GOOD]: 'Very Good',
    [LEAD_ENGAGEMENT_QUALITY_LEVELS.EXCELLENT]: 'Excellent'
}

export const LEAD_STATUSES = {
    NEW: 'NEW',
    CONTACTED: 'CONTACTED',
    QUALIFIED: 'QUALIFIED',
    CONVERTED: 'CONVERTED',
    UNQUALIFIED: 'UNQUALIFIED'
}

export const LEAD_STATUS_LABELS = {
    [LEAD_STATUSES.NEW]: 'New Lead',
    [LEAD_STATUSES.CONTACTED]: 'Contacted',
    [LEAD_STATUSES.QUALIFIED]: 'Qualified',
    [LEAD_STATUSES.CONVERTED]: 'Converted',
    [LEAD_STATUSES.UNQUALIFIED]: 'Unqualified'
}

export const LEAD_SOURCES = {
    ACTIVATION: 'ACTIVATION',
    WEBSITE: 'WEBSITE',
    REFERRAL: 'REFERRAL',
    SOCIAL_MEDIA: 'SOCIAL_MEDIA',
    EMAIL: 'EMAIL',
    PHONE: 'PHONE',
    OTHER: 'OTHER'
}

export const LEAD_SOURCE_LABELS = {
    [LEAD_SOURCES.ACTIVATION]: 'Activation Campaign',
    [LEAD_SOURCES.WEBSITE]: 'Website',
    [LEAD_SOURCES.REFERRAL]: 'Referral',
    [LEAD_SOURCES.SOCIAL_MEDIA]: 'Social Media',
    [LEAD_SOURCES.EMAIL]: 'Email',
    [LEAD_SOURCES.PHONE]: 'Phone',
    [LEAD_SOURCES.OTHER]: 'Other'
}

// Lead API Endpoints
export const LEAD_ENDPOINTS = {
    LEADS: '/leads',
    LEAD_SEARCH: '/leads/search',
    LEADS_BY_ACTIVATION: '/leads/activation/:activationId',
    OPTED_IN_LEADS: '/leads/opted-in',
    WHATSAPP_OPTED_IN: '/leads/whatsapp-opted-in',
    LEAD_STATISTICS: '/leads/statistics',
    LEAD_EXPORT: '/leads/export'
}

// Export helper functions
export const getStatusLabel = (status, type = 'activation') => {
    const labelMaps = {
        activation: ACTIVATION_STATUS_LABELS,
        user: USER_STATUS_LABELS,
        stock: STOCK_STATUS_LABELS,
        client: CLIENT_STATUS_LABELS,
        lead: LEAD_STATUS_LABELS
    }
    return labelMaps[type]?.[status] || status
}

export const getStatusVariant = (status) => {
    const variantMap = {
        [ACTIVATION_STATUS.ACTIVE]: 'success',
        [ACTIVATION_STATUS.COMPLETED]: 'success',
        [ACTIVATION_STATUS.PENDING]: 'warning',
        [ACTIVATION_STATUS.SCHEDULED]: 'info',
        [ACTIVATION_STATUS.CANCELLED]: 'danger',
        [ACTIVATION_STATUS.OVERDUE]: 'danger',
        [ACTIVATION_STATUS.DRAFT]: 'secondary',
        [ACTIVATION_STATUS.PAUSED]: 'warning'
    }
    return variantMap[status] || 'secondary'
}

export const getPriorityVariant = (priority) => {
    const variantMap = {
        [PRIORITY_LEVELS.LOW]: 'success',
        [PRIORITY_LEVELS.MEDIUM]: 'warning',
        [PRIORITY_LEVELS.HIGH]: 'danger',
        [PRIORITY_LEVELS.URGENT]: 'danger'
    }
    return variantMap[priority] || 'secondary'
}

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const hasPermission = (userRole, permission) => {
    return ROLE_PERMISSIONS[userRole]?.includes(permission) || false
}

export const canAccessRoute = (userRole, routePermissions = []) => {
    if (!routePermissions.length) return true
    return routePermissions.some(permission => hasPermission(userRole, permission))
}
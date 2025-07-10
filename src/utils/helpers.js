// src/utils/helpers.js

/**
 * Generate a unique ID with optional prefix
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} Unique ID
 */
export function generateId(prefix = 'id') {
    const timestamp = Date.now().toString(36)
    const randomPart = Math.random().toString(36).substr(2, 5)
    return `${prefix}-${timestamp}-${randomPart}`
}

/**
 * Debounce function to limit the rate of function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @param {boolean} immediate - Execute immediately on first call
 * @returns {Function} Debounced function
 */
export function debounce(func, wait, immediate = false) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            timeout = null
            if (!immediate) func(...args)
        }
        const callNow = immediate && !timeout
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
        if (callNow) func(...args)
    }
}

/**
 * Throttle function to limit function execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
}

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (obj instanceof Array) return obj.map(item => deepClone(item))
    if (typeof obj === 'object') {
        const clonedObj = {}
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key])
            }
        }
        return clonedObj
    }
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
export function isEmpty(value) {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') return value.trim() === ''
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    return false
}

/**
 * Get nested object property safely
 * @param {Object} obj - Object to traverse
 * @param {string} path - Dot notation path (e.g., 'user.profile.name')
 * @param {any} defaultValue - Default value if path not found
 * @returns {any} Property value or default
 */
export function getNestedProperty(obj, path, defaultValue = null) {
    if (!obj || !path) return defaultValue

    const keys = path.split('.')
    let result = obj

    for (const key of keys) {
        if (result === null || result === undefined || !(key in result)) {
            return defaultValue
        }
        result = result[key]
    }

    return result
}

/**
 * Set nested object property safely
 * @param {Object} obj - Object to modify
 * @param {string} path - Dot notation path
 * @param {any} value - Value to set
 * @returns {Object} Modified object
 */
export function setNestedProperty(obj, path, value) {
    if (!obj || !path) return obj

    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        if (!(key in current) || typeof current[key] !== 'object') {
            current[key] = {}
        }
        current = current[key]
    }

    current[keys[keys.length - 1]] = value
    return obj
}

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @param {string} locale - Locale for formatting (default: en-US)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
    if (typeof amount !== 'number') return '0.00'

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount)
}

/**
 * Format date
 * @param {Date|string|number} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @param {string} locale - Locale for formatting (default: en-US)
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}, locale = 'en-US') {
    if (!date) return ''

    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return ''

    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }

    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj)
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|string|number} date - Date to format
 * @param {string} locale - Locale for formatting (default: en-US)
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date, locale = 'en-US') {
    if (!date) return ''

    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return ''

    const now = new Date()
    const diffInSeconds = Math.floor((now - dateObj) / 1000)

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

    const intervals = [
        { unit: 'year', seconds: 31536000 },
        { unit: 'month', seconds: 2592000 },
        { unit: 'week', seconds: 604800 },
        { unit: 'day', seconds: 86400 },
        { unit: 'hour', seconds: 3600 },
        { unit: 'minute', seconds: 60 },
        { unit: 'second', seconds: 1 }
    ]

    for (const interval of intervals) {
        const count = Math.floor(diffInSeconds / interval.seconds)
        if (count !== 0) {
            return rtf.format(-count, interval.unit)
        }
    }

    return rtf.format(0, 'second')
}

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
    if (typeof str !== 'string' || str.length === 0) return str
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Convert camelCase to Title Case
 * @param {string} str - CamelCase string
 * @returns {string} Title Case string
 */
export function camelToTitle(str) {
    if (typeof str !== 'string') return str

    return str
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, match => match.toUpperCase())
        .trim()
}

/**
 * Convert string to slug (URL-friendly)
 * @param {string} str - String to convert
 * @returns {string} Slug string
 */
export function slugify(str) {
    if (typeof str !== 'string') return ''

    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

/**
 * Truncate string to specified length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated string
 */
export function truncate(str, length, suffix = '...') {
    if (typeof str !== 'string' || str.length <= length) return str
    return str.slice(0, length) + suffix
}

/**
 * Parse error message from various error formats
 * @param {any} error - Error object, string, or response
 * @returns {string} Parsed error message
 */
export function parseErrorMessage(error) {
    if (typeof error === 'string') return error

    if (error?.response?.data?.message) return error.response.data.message
    if (error?.response?.data?.error) return error.response.data.error
    if (error?.message) return error.message
    if (error?.error) return error.error

    return 'An unexpected error occurred'
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function isValidEmail(email) {
    if (typeof email !== 'string') return false

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Validate phone number format (basic)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone
 */
export function isValidPhone(phone) {
    if (typeof phone !== 'string') return false

    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

/**
 * Generate random color
 * @param {string} format - Color format ('hex', 'rgb', 'hsl')
 * @returns {string} Random color
 */
export function randomColor(format = 'hex') {
    switch (format) {
        case 'hex':
            return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
        case 'rgb':
            const r = Math.floor(Math.random() * 256)
            const g = Math.floor(Math.random() * 256)
            const b = Math.floor(Math.random() * 256)
            return `rgb(${r}, ${g}, ${b})`
        case 'hsl':
            const h = Math.floor(Math.random() * 360)
            const s = Math.floor(Math.random() * 100)
            const l = Math.floor(Math.random() * 100)
            return `hsl(${h}, ${s}%, ${l}%)`
        default:
            return '#000000'
    }
}

/**
 * Generate initials from name
 * @param {string} name - Full name
 * @param {number} maxLength - Maximum number of initials (default: 2)
 * @returns {string} Initials
 */
export function getInitials(name, maxLength = 2) {
    if (typeof name !== 'string') return ''

    return name
        .split(' ')
        .filter(word => word.length > 0)
        .slice(0, maxLength)
        .map(word => word.charAt(0).toUpperCase())
        .join('')
}

/**
 * Download data as file
 * @param {string} data - Data to download
 * @param {string} filename - File name
 * @param {string} type - MIME type (default: 'text/plain')
 */
export function downloadFile(data, filename, type = 'text/plain') {
    const blob = new Blob([data], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text)
            return true
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea')
            textArea.value = text
            textArea.style.position = 'fixed'
            textArea.style.left = '-999999px'
            textArea.style.top = '-999999px'
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            const success = document.execCommand('copy')
            document.body.removeChild(textArea)
            return success
        }
    } catch (error) {
        console.error('Failed to copy text to clipboard:', error)
        return false
    }
}

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Sort array of objects by multiple criteria
 * @param {Array} array - Array to sort
 * @param {Array} sortBy - Array of sort criteria { field, direction }
 * @returns {Array} Sorted array
 */
export function multiSort(array, sortBy) {
    if (!Array.isArray(array) || !Array.isArray(sortBy)) return array

    return [...array].sort((a, b) => {
        for (const { field, direction = 'asc' } of sortBy) {
            const aVal = getNestedProperty(a, field)
            const bVal = getNestedProperty(b, field)

            let comparison = 0

            if (aVal < bVal) comparison = -1
            else if (aVal > bVal) comparison = 1

            if (comparison !== 0) {
                return direction === 'desc' ? -comparison : comparison
            }
        }
        return 0
    })
}

/**
 * Group array of objects by property
 * @param {Array} array - Array to group
 * @param {string} key - Property to group by
 * @returns {Object} Grouped object
 */
export function groupBy(array, key) {
    if (!Array.isArray(array)) return {}

    return array.reduce((groups, item) => {
        const group = getNestedProperty(item, key)
        const groupKey = group || 'Other'

        if (!groups[groupKey]) {
            groups[groupKey] = []
        }

        groups[groupKey].push(item)
        return groups
    }, {})
}

/**
 * Remove duplicates from array
 * @param {Array} array - Array to deduplicate
 * @param {string} key - Optional key for object arrays
 * @returns {Array} Array without duplicates
 */
export function removeDuplicates(array, key = null) {
    if (!Array.isArray(array)) return []

    if (key) {
        const seen = new Set()
        return array.filter(item => {
            const value = getNestedProperty(item, key)
            if (seen.has(value)) {
                return false
            }
            seen.add(value)
            return true
        })
    }

    return [...new Set(array)]
}

/**
 * Retry async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Result of the function
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError

    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error

            if (i === maxRetries) {
                throw lastError
            }

            const delay = baseDelay * Math.pow(2, i)
            await new Promise(resolve => setTimeout(resolve, delay))
        }
    }
}

/**
 * Create a promise that resolves after specified time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after delay
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check if user prefers dark mode
 * @returns {boolean} True if dark mode preferred
 */
export function prefersDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Get browser information
 * @returns {Object} Browser info object
 */
export function getBrowserInfo() {
    const userAgent = navigator.userAgent
    const platform = navigator.platform

    const browsers = [
        { name: 'Chrome', regex: /Chrome\/([0-9.]+)/ },
        { name: 'Firefox', regex: /Firefox\/([0-9.]+)/ },
        { name: 'Safari', regex: /Safari\/([0-9.]+)/ },
        { name: 'Edge', regex: /Edge\/([0-9.]+)/ },
        { name: 'IE', regex: /MSIE ([0-9.]+)/ }
    ]

    let browser = { name: 'Unknown', version: 'Unknown' }

    for (const b of browsers) {
        const match = userAgent.match(b.regex)
        if (match) {
            browser = { name: b.name, version: match[1] }
            break
        }
    }

    return {
        ...browser,
        platform,
        userAgent,
        isMobile: /Mobi|Android/i.test(userAgent),
        isTablet: /Tablet|iPad/i.test(userAgent)
    }
}
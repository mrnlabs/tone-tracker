// src/utils/validators.js
// Comprehensive validation utilities for the Activation Tracking System

import { VALIDATION_RULES, ERROR_MESSAGES } from './constants.js'

/**
 * Base validation function
 * @param {*} value - Value to validate
 * @param {Function} validator - Validation function
 * @param {string} errorMessage - Error message if validation fails
 * @returns {string|null} - Error message or null if valid
 */
const validate = (value, validator, errorMessage) => {
    if (!validator(value)) {
        return errorMessage
    }
    return null
}

/**
 * Required field validator
 * @param {*} value - Value to check
 * @returns {string|null} - Error message or null if valid
 */
export const required = (value) => {
    const isValid = value !== null &&
        value !== undefined &&
        value !== '' &&
        (Array.isArray(value) ? value.length > 0 : true)

    return validate(value, () => isValid, ERROR_MESSAGES.REQUIRED_FIELD)
}

/**
 * Email validator
 * @param {string} value - Email to validate
 * @returns {string|null} - Error message or null if valid
 */
export const email = (value) => {
    if (!value) return null // Allow empty for optional fields

    return validate(
        value,
        (val) => VALIDATION_RULES.EMAIL.test(val),
        ERROR_MESSAGES.INVALID_EMAIL
    )
}

/**
 * Phone number validator
 * @param {string} value - Phone number to validate
 * @returns {string|null} - Error message or null if valid
 */
export const phone = (value) => {
    if (!value) return null // Allow empty for optional fields

    return validate(
        value,
        (val) => VALIDATION_RULES.PHONE.test(val),
        ERROR_MESSAGES.INVALID_PHONE
    )
}

/**
 * Password validator
 * @param {string} value - Password to validate
 * @returns {string|null} - Error message or null if valid
 */
export const password = (value) => {
    if (!value) return null

    if (value.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
        return ERROR_MESSAGES.PASSWORD_TOO_SHORT
    }

    if (!VALIDATION_RULES.PASSWORD_PATTERN.test(value)) {
        return ERROR_MESSAGES.PASSWORD_WEAK
    }

    return null
}

/**
 * Password confirmation validator
 * @param {string} password - Original password
 * @param {string} confirmation - Password confirmation
 * @returns {string|null} - Error message or null if valid
 */
export const passwordConfirmation = (password, confirmation) => {
    if (!confirmation) return ERROR_MESSAGES.REQUIRED_FIELD

    return validate(
        confirmation,
        (val) => val === password,
        'Passwords do not match'
    )
}

/**
 * Username validator
 * @param {string} value - Username to validate
 * @returns {string|null} - Error message or null if valid
 */
export const username = (value) => {
    if (!value) return null

    return validate(
        value,
        (val) => VALIDATION_RULES.USERNAME_PATTERN.test(val),
        'Username must be 3-20 characters and contain only letters, numbers, hyphens, and underscores'
    )
}

/**
 * Minimum length validator
 * @param {number} minLength - Minimum required length
 * @returns {Function} - Validator function
 */
export const minLength = (minLength) => (value) => {
    if (!value) return null

    return validate(
        value,
        (val) => val.length >= minLength,
        `Must be at least ${minLength} characters long`
    )
}

/**
 * Maximum length validator
 * @param {number} maxLength - Maximum allowed length
 * @returns {Function} - Validator function
 */
export const maxLength = (maxLength) => (value) => {
    if (!value) return null

    return validate(
        value,
        (val) => val.length <= maxLength,
        `Must be no more than ${maxLength} characters long`
    )
}

/**
 * Minimum value validator
 * @param {number} minValue - Minimum required value
 * @returns {Function} - Validator function
 */
export const minValue = (minValue) => (value) => {
    if (value === null || value === undefined || value === '') return null

    const numValue = Number(value)
    return validate(
        numValue,
        (val) => !isNaN(val) && val >= minValue,
        `Must be at least ${minValue}`
    )
}

/**
 * Maximum value validator
 * @param {number} maxValue - Maximum allowed value
 * @returns {Function} - Validator function
 */
export const maxValue = (maxValue) => (value) => {
    if (value === null || value === undefined || value === '') return null

    const numValue = Number(value)
    return validate(
        numValue,
        (val) => !isNaN(val) && val <= maxValue,
        `Must be no more than ${maxValue}`
    )
}

/**
 * Number validator
 * @param {*} value - Value to validate as number
 * @returns {string|null} - Error message or null if valid
 */
export const number = (value) => {
    if (!value && value !== 0) return null

    return validate(
        value,
        (val) => !isNaN(Number(val)) && isFinite(Number(val)),
        'Must be a valid number'
    )
}

/**
 * Integer validator
 * @param {*} value - Value to validate as integer
 * @returns {string|null} - Error message or null if valid
 */
export const integer = (value) => {
    if (!value && value !== 0) return null

    return validate(
        value,
        (val) => Number.isInteger(Number(val)),
        'Must be a whole number'
    )
}

/**
 * Positive number validator
 * @param {*} value - Value to validate
 * @returns {string|null} - Error message or null if valid
 */
export const positive = (value) => {
    if (!value && value !== 0) return null

    const numValue = Number(value)
    return validate(
        numValue,
        (val) => !isNaN(val) && val > 0,
        'Must be a positive number'
    )
}

/**
 * URL validator
 * @param {string} value - URL to validate
 * @returns {string|null} - Error message or null if valid
 */
export const url = (value) => {
    if (!value) return null

    try {
        new URL(value)
        return null
    } catch {
        return 'Must be a valid URL'
    }
}

/**
 * Date validator
 * @param {*} value - Date to validate
 * @returns {string|null} - Error message or null if valid
 */
export const date = (value) => {
    if (!value) return null

    const dateObj = new Date(value)
    return validate(
        dateObj,
        (val) => !isNaN(val.getTime()),
        'Must be a valid date'
    )
}

/**
 * Future date validator
 * @param {*} value - Date to validate
 * @returns {string|null} - Error message or null if valid
 */
export const futureDate = (value) => {
    if (!value) return null

    const dateError = date(value)
    if (dateError) return dateError

    const dateObj = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day

    return validate(
        dateObj,
        (val) => val >= today,
        'Date must be today or in the future'
    )
}

/**
 * Past date validator
 * @param {*} value - Date to validate
 * @returns {string|null} - Error message or null if valid
 */
export const pastDate = (value) => {
    if (!value) return null

    const dateError = date(value)
    if (dateError) return dateError

    const dateObj = new Date(value)
    const today = new Date()
    today.setHours(23, 59, 59, 999) // Reset time to end of day

    return validate(
        dateObj,
        (val) => val <= today,
        'Date must be today or in the past'
    )
}

/**
 * Date range validator
 * @param {*} startDate - Start date
 * @param {*} endDate - End date
 * @returns {string|null} - Error message or null if valid
 */
export const dateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return null

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 'Both dates must be valid'
    }

    return validate(
        { start, end },
        ({ start, end }) => start <= end,
        'End date must be after start date'
    )
}

/**
 * File type validator
 * @param {Array} allowedTypes - Array of allowed file extensions
 * @returns {Function} - Validator function
 */
export const fileType = (allowedTypes) => (file) => {
    if (!file) return null

    const fileName = file.name || ''
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))

    return validate(
        extension,
        (ext) => allowedTypes.includes(ext),
        `File must be one of: ${allowedTypes.join(', ')}`
    )
}

/**
 * File size validator
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {Function} - Validator function
 */
export const fileSize = (maxSize) => (file) => {
    if (!file) return null

    return validate(
        file.size,
        (size) => size <= maxSize,
        `File size must be less than ${formatFileSize(maxSize)}`
    )
}

/**
 * Activation code validator
 * @param {string} value - Activation code to validate
 * @returns {string|null} - Error message or null if valid
 */
export const activationCode = (value) => {
    if (!value) return null

    return validate(
        value,
        (val) => VALIDATION_RULES.ACTIVATION_CODE_PATTERN.test(val),
        'Activation code must be in format: XX-YYYY-ZZZ (e.g., AC-2024-001)'
    )
}

/**
 * Array validator - checks if value is non-empty array
 * @param {*} value - Value to validate
 * @returns {string|null} - Error message or null if valid
 */
export const arrayRequired = (value) => {
    return validate(
        value,
        (val) => Array.isArray(val) && val.length > 0,
        'At least one item must be selected'
    )
}

/**
 * Custom pattern validator
 * @param {RegExp} pattern - Regular expression pattern
 * @param {string} message - Error message
 * @returns {Function} - Validator function
 */
export const pattern = (pattern, message) => (value) => {
    if (!value) return null

    return validate(value, (val) => pattern.test(val), message)
}

/**
 * Equals validator - checks if value equals another value
 * @param {*} compareValue - Value to compare against
 * @param {string} message - Error message
 * @returns {Function} - Validator function
 */
export const equals = (compareValue, message = 'Values do not match') => (value) => {
    return validate(value, (val) => val === compareValue, message)
}

/**
 * Conditional validator - only validates if condition is met
 * @param {Function} condition - Condition function
 * @param {Function} validator - Validator to run if condition is true
 * @returns {Function} - Validator function
 */
export const when = (condition, validator) => (value, formData) => {
    if (condition(formData)) {
        return validator(value)
    }
    return null
}

/**
 * Combine multiple validators
 * @param {...Function} validators - Validator functions to combine
 * @returns {Function} - Combined validator function
 */
export const combine = (...validators) => (value, formData) => {
    for (const validator of validators) {
        const error = validator(value, formData)
        if (error) return error
    }
    return null
}

/**
 * Validate entire form object
 * @param {Object} formData - Form data to validate
 * @param {Object} rules - Validation rules object
 * @returns {Object} - Object with field errors
 */
export const validateForm = (formData, rules) => {
    const errors = {}

    for (const [field, fieldRules] of Object.entries(rules)) {
        const value = formData[field]

        if (Array.isArray(fieldRules)) {
            // Multiple validators for this field
            for (const rule of fieldRules) {
                const error = typeof rule === 'function' ? rule(value, formData) : null
                if (error) {
                    errors[field] = error
                    break // Stop at first error
                }
            }
        } else if (typeof fieldRules === 'function') {
            // Single validator for this field
            const error = fieldRules(value, formData)
            if (error) {
                errors[field] = error
            }
        }
    }

    return errors
}

/**
 * Check if form has any errors
 * @param {Object} errors - Errors object from validateForm
 * @returns {boolean} - True if form has errors
 */
export const hasFormErrors = (errors) => {
    return Object.keys(errors).length > 0
}

/**
 * Get first error message from errors object
 * @param {Object} errors - Errors object
 * @returns {string|null} - First error message or null
 */
export const getFirstError = (errors) => {
    const errorKeys = Object.keys(errors)
    return errorKeys.length > 0 ? errors[errorKeys[0]] : null
}

/**
 * Format file size helper
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Activation tracking specific validators
export const activationValidators = {
    name: [required, minLength(3), maxLength(100)],
    code: [required, activationCode],
    client: [required],
    location: [required],
    startDate: [required, date, futureDate],
    endDate: [required, date],
    startTime: [required],
    endTime: [required],
    type: [required],
    priority: [required],
    budget: [positive],
    teamMembers: [arrayRequired],
    brief: [fileType(['.pdf', '.doc', '.docx']), fileSize(10 * 1024 * 1024)], // 10MB limit
    description: [maxLength(1000)]
}

export const clientValidators = {
    name: [required, minLength(2), maxLength(100)],
    email: [required, email],
    phone: [phone],
    company: [required, minLength(2), maxLength(100)],
    address: [maxLength(500)],
    contactPerson: [required, minLength(2), maxLength(100)],
    industry: [required]
}

export const userValidators = {
    firstName: [required, minLength(2), maxLength(50)],
    lastName: [required, minLength(2), maxLength(50)],
    email: [required, email],
    phone: [phone],
    username: [required, username],
    password: [required, password],
    passwordConfirmation: (formData) => passwordConfirmation(formData.password, formData.passwordConfirmation),
    role: [required],
    department: [maxLength(100)]
}

export const inventoryValidators = {
    sku: [required, minLength(3), maxLength(50)],
    name: [required, minLength(2), maxLength(100)],
    description: [maxLength(500)],
    quantity: [required, integer, minValue(0)],
    unitPrice: [positive],
    category: [required],
    supplier: [maxLength(100)],
    reorderLevel: [integer, minValue(0)]
}

export const reportValidators = {
    title: [required, minLength(3), maxLength(100)],
    type: [required],
    dateRange: (formData) => dateRange(formData.startDate, formData.endDate),
    activations: [arrayRequired],
    format: [required]
}

// Real-time validation helper
export const createRealTimeValidator = (rules) => {
    return (field, value, formData = {}) => {
        const fieldRules = rules[field]
        if (!fieldRules) return null

        const currentFormData = { ...formData, [field]: value }

        if (Array.isArray(fieldRules)) {
            for (const rule of fieldRules) {
                const error = typeof rule === 'function' ? rule(value, currentFormData) : null
                if (error) return error
            }
        } else if (typeof fieldRules === 'function') {
            return fieldRules(value, currentFormData)
        }

        return null
    }
}

// Debounced validation for better UX
export const createDebouncedValidator = (validator, delay = 300) => {
    let timeout
    return (...args) => {
        return new Promise((resolve) => {
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                resolve(validator(...args))
            }, delay)
        })
    }
}

// Async validator for server-side validation
export const createAsyncValidator = (apiCall) => {
    return async (value) => {
        if (!value) return null

        try {
            const result = await apiCall(value)
            return result.isValid ? null : result.message
        } catch (error) {
            return 'Validation failed. Please try again.'
        }
    }
}

// Export commonly used validation rule sets
export const commonRules = {
    required,
    email,
    phone,
    password,
    number,
    positive,
    date,
    futureDate,
    pastDate,
    minLength,
    maxLength,
    minValue,
    maxValue,
    fileType,
    fileSize,
    pattern,
    combine,
    when
}

export default {
    ...commonRules,
    activationValidators,
    clientValidators,
    userValidators,
    inventoryValidators,
    reportValidators,
    validateForm,
    hasFormErrors,
    getFirstError,
    createRealTimeValidator,
    createDebouncedValidator,
    createAsyncValidator
}
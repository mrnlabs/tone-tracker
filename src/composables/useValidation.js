import { reactive, computed } from 'vue'
import { VALIDATION_RULES, ERROR_MESSAGES } from '@/utils/constants'

export function useValidation() {
  const errors = reactive({})
  const touched = reactive({})

  // Validation rules
  const validators = {
    required: (value, message = ERROR_MESSAGES.REQUIRED_FIELD) => {
      if (Array.isArray(value)) {
        return value.length > 0 || message
      }
      return (value !== null && value !== undefined && value !== '') || message
    },

    email: (value, message = ERROR_MESSAGES.INVALID_EMAIL) => {
      if (!value) return true
      return VALIDATION_RULES.EMAIL.test(value) || message
    },

    phone: (value, message = 'Please enter a valid phone number (e.g., +263 772 999 9999, +263 650 987 726, or 072 999 9999)') => {
      if (!value) return true
      
      // Remove all spaces and dashes, keep + for international prefix
      const cleanPhone = value.replace(/[\s-]/g, '')
      
      // Zimbabwean phone number patterns
      const phonePatterns = [
        /^\+263\s?[67][0-9]{2}\s?[0-9]{3}\s?[0-9]{4}$/,  // International: +263 772 999 9999 or +263 650 987 726
        /^\+263[67][0-9]{8}$/,                            // International without spaces: +263772999999 or +263650987726
        /^0[67][0-9]\s?[0-9]{3}\s?[0-9]{4}$/,            // Local: 072 999 9999 or 065 098 7726
        /^0[67][0-9][0-9]{7}$/                            // Local without spaces: 0729999999 or 0650987726
      ]
      
      const isValid = phonePatterns.some(pattern => pattern.test(value)) || 
                     phonePatterns.some(pattern => pattern.test(cleanPhone))
      
      return isValid || message
    },

    minLength: (min, message) => (value) => {
      if (!value) return true
      return value.length >= min || message || `Minimum ${min} characters required`
    },

    maxLength: (max, message) => (value) => {
      if (!value) return true
      return value.length <= max || message || `Maximum ${max} characters allowed`
    },

    password: (value, message = ERROR_MESSAGES.PASSWORD_WEAK) => {
      if (!value) return true
      return (
        value.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH &&
        VALIDATION_RULES.PASSWORD_PATTERN.test(value)
      ) || message
    },

    confirmPassword: (originalPassword, message = 'Passwords do not match') => (value) => {
      if (!value) return true
      return value === originalPassword || message
    },

    fileSize: (maxSize, message) => (file) => {
      if (!file) return true
      return file.size <= maxSize || message || `File size must be less than ${formatFileSize(maxSize)}`
    },

    fileType: (allowedTypes, message) => (file) => {
      if (!file) return true
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
      return allowedTypes.includes(fileExtension) || message || `File type not allowed`
    },

    numeric: (value, message = 'Must be a valid number') => {
      if (!value) return true
      return !isNaN(value) || message
    },

    positive: (value, message = 'Must be a positive number') => {
      if (!value) return true
      return parseFloat(value) > 0 || message
    },

    range: (min, max, message) => (value) => {
      if (!value) return true
      const num = parseFloat(value)
      return (num >= min && num <= max) || message || `Value must be between ${min} and ${max}`
    },

    url: (value, message = 'Must be a valid URL') => {
      if (!value) return true
      try {
        new URL(value)
        return true
      } catch {
        return message
      }
    }
  }

  // Validate single field
  const validateField = (fieldName, value, rules) => {
    touched[fieldName] = true
    const fieldErrors = []

    for (const rule of rules) {
      const result = rule(value)
      if (result !== true) {
        fieldErrors.push(result)
      }
    }

    errors[fieldName] = fieldErrors
    return fieldErrors.length === 0
  }

  // Validate multiple fields
  const validateFields = (fields) => {
    let isValid = true
    
    Object.entries(fields).forEach(([fieldName, { value, rules }]) => {
      const fieldIsValid = validateField(fieldName, value, rules)
      if (!fieldIsValid) {
        isValid = false
      }
    })

    return isValid
  }

  // Clear validation for a field
  const clearFieldValidation = (fieldName) => {
    delete errors[fieldName]
    delete touched[fieldName]
  }

  // Clear all validations
  const clearAllValidations = () => {
    Object.keys(errors).forEach(key => delete errors[key])
    Object.keys(touched).forEach(key => delete touched[key])
  }

  // Check if field has errors
  const hasError = (fieldName) => {
    return touched[fieldName] && errors[fieldName] && errors[fieldName].length > 0
  }

  // Get error message for field
  const getError = (fieldName) => {
    return hasError(fieldName) ? errors[fieldName][0] : null
  }

  // Check if form is valid
  const isFormValid = computed(() => {
    return Object.values(errors).every(fieldErrors => !fieldErrors || fieldErrors.length === 0)
  })

  // Get all error messages
  const getAllErrors = computed(() => {
    const allErrors = []
    Object.entries(errors).forEach(([field, fieldErrors]) => {
      if (fieldErrors && fieldErrors.length > 0) {
        allErrors.push(...fieldErrors.map(error => ({ field, message: error })))
      }
    })
    return allErrors
  })

  // Form validation composable
  const useForm = (initialValues = {}) => {
    const form = reactive({ ...initialValues })
    const formRules = reactive({})

    const setFieldRules = (fieldName, rules) => {
      formRules[fieldName] = rules
    }

    const validateForm = () => {
      const fields = {}
      Object.keys(formRules).forEach(fieldName => {
        fields[fieldName] = {
          value: form[fieldName],
          rules: formRules[fieldName]
        }
      })
      return validateFields(fields)
    }

    const resetForm = () => {
      Object.keys(form).forEach(key => {
        form[key] = initialValues[key] || null
      })
      clearAllValidations()
    }

    return {
      form,
      setFieldRules,
      validateForm,
      resetForm,
      hasError,
      getError,
      isFormValid
    }
  }

  // Utility function for file size formatting
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    errors,
    touched,
    validators,
    validateField,
    validateFields,
    clearFieldValidation,
    clearAllValidations,
    hasError,
    getError,
    isFormValid,
    getAllErrors,
    useForm
  }
}

// Pre-configured validation rules for common use cases
export const commonValidations = {
  email: [
    (value) => validators.required(value),
    (value) => validators.email(value)
  ],
  
  password: [
    (value) => validators.required(value),
    (value) => validators.password(value)
  ],
  
  phone: [
    (value) => validators.phone(value)
  ],
  
  requiredText: [
    (value) => validators.required(value),
    (value) => validators.minLength(2, 'Minimum 2 characters required')(value)
  ],
  
  requiredNumber: [
    (value) => validators.required(value),
    (value) => validators.numeric(value)
  ]
}
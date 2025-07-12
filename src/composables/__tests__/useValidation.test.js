import { describe, it, expect, beforeEach } from 'vitest'
import { useValidation } from '../useValidation'
import { ERROR_MESSAGES } from '@/utils/constants'

describe('useValidation', () => {
  let validation

  beforeEach(() => {
    validation = useValidation()
  })

  describe('validators', () => {
    it('should validate required fields', () => {
      const { validators } = validation
      
      expect(validators.required('')).toBe(ERROR_MESSAGES.REQUIRED_FIELD)
      expect(validators.required(null)).toBe(ERROR_MESSAGES.REQUIRED_FIELD)
      expect(validators.required(undefined)).toBe(ERROR_MESSAGES.REQUIRED_FIELD)
      expect(validators.required('test')).toBe(true)
      expect(validators.required(0)).toBe(true)
      expect(validators.required(false)).toBe(true)
    })

    it('should validate email format', () => {
      const { validators } = validation
      
      expect(validators.email('invalid-email')).toBe(ERROR_MESSAGES.INVALID_EMAIL)
      expect(validators.email('test@')).toBe(ERROR_MESSAGES.INVALID_EMAIL)
      expect(validators.email('@example.com')).toBe(ERROR_MESSAGES.INVALID_EMAIL)
      expect(validators.email('test@example.com')).toBe(true)
      expect(validators.email('user.name+tag@example.co.uk')).toBe(true)
      expect(validators.email('')).toBe(true) // Empty is valid (not required)
    })

    it('should validate password strength', () => {
      const { validators } = validation
      
      expect(validators.password('weak')).toBe(ERROR_MESSAGES.PASSWORD_WEAK)
      expect(validators.password('12345678')).toBe(ERROR_MESSAGES.PASSWORD_WEAK)
      expect(validators.password('Password1!')).toBe(true)
      expect(validators.password('MySecure123@')).toBe(true)
    })

    it('should validate minimum length', () => {
      const { validators } = validation
      const minLength5 = validators.minLength(5, 'Too short')
      
      expect(minLength5('abc')).toBe('Too short')
      expect(minLength5('abcde')).toBe(true)
      expect(minLength5('abcdef')).toBe(true)
      expect(minLength5('')).toBe(true) // Empty is valid
    })

    it('should validate phone numbers', () => {
      const { validators } = validation
      
      expect(validators.phone('invalid')).toBe(ERROR_MESSAGES.INVALID_PHONE)
      expect(validators.phone('123')).toBe(ERROR_MESSAGES.INVALID_PHONE)
      expect(validators.phone('+1234567890')).toBe(true)
      expect(validators.phone('1234567890')).toBe(true)
      expect(validators.phone('')).toBe(true) // Empty is valid
    })
  })

  describe('field validation', () => {
    it('should validate single field with multiple rules', () => {
      const { validateField, validators, hasError, getError } = validation
      
      const rules = [
        validators.required,
        validators.email
      ]
      
      // Test invalid email
      const isValid1 = validateField('email', 'invalid-email', rules)
      expect(isValid1).toBe(false)
      expect(hasError('email')).toBe(true)
      expect(getError('email')).toBe(ERROR_MESSAGES.INVALID_EMAIL)
      
      // Test empty required field
      const isValid2 = validateField('email', '', rules)
      expect(isValid2).toBe(false)
      expect(hasError('email')).toBe(true)
      expect(getError('email')).toBe(ERROR_MESSAGES.REQUIRED_FIELD)
      
      // Test valid email
      const isValid3 = validateField('email', 'test@example.com', rules)
      expect(isValid3).toBe(true)
      expect(hasError('email')).toBe(false)
      expect(getError('email')).toBe(null)
    })

    it('should validate multiple fields', () => {
      const { validateFields, validators, getAllErrors } = validation
      
      const fields = {
        email: {
          value: 'invalid-email',
          rules: [validators.required, validators.email]
        },
        password: {
          value: 'weak',
          rules: [validators.required, validators.password]
        }
      }
      
      const isValid = validateFields(fields)
      expect(isValid).toBe(false)
      
      const allErrors = getAllErrors.value
      expect(allErrors).toHaveLength(2)
      expect(allErrors[0].field).toBe('email')
      expect(allErrors[1].field).toBe('password')
    })
  })

  describe('form validation', () => {
    it('should create and validate a form', () => {
      const { useForm, validators } = validation
      
      const { form, setFieldRules, validateForm, hasError, getError, isFormValid } = useForm({
        email: '',
        password: ''
      })
      
      // Set up validation rules
      setFieldRules('email', [validators.required, validators.email])
      setFieldRules('password', [validators.required, validators.password])
      
      // Test initial state
      expect(isFormValid.value).toBe(true) // No validation run yet
      
      // Test invalid form
      form.email = 'invalid-email'
      form.password = 'weak'
      
      const isValid1 = validateForm()
      expect(isValid1).toBe(false)
      expect(isFormValid.value).toBe(false)
      expect(hasError('email')).toBe(true)
      expect(hasError('password')).toBe(true)
      
      // Test valid form
      form.email = 'test@example.com'
      form.password = 'StrongPass123!'
      
      const isValid2 = validateForm()
      expect(isValid2).toBe(true)
      expect(isFormValid.value).toBe(true)
      expect(hasError('email')).toBe(false)
      expect(hasError('password')).toBe(false)
    })

    it('should reset form to initial values', () => {
      const { useForm } = validation
      
      const initialValues = { email: '', name: 'Initial' }
      const { form, resetForm } = useForm(initialValues)
      
      // Modify form
      form.email = 'changed@example.com'
      form.name = 'Changed'
      
      expect(form.email).toBe('changed@example.com')
      expect(form.name).toBe('Changed')
      
      // Reset form
      resetForm()
      
      expect(form.email).toBe('')
      expect(form.name).toBe('Initial')
    })
  })

  describe('validation state management', () => {
    it('should clear field validation', () => {
      const { validateField, validators, clearFieldValidation, hasError } = validation
      
      // Create an error
      validateField('test', '', [validators.required])
      expect(hasError('test')).toBe(true)
      
      // Clear the error
      clearFieldValidation('test')
      expect(hasError('test')).toBe(false)
    })

    it('should clear all validations', () => {
      const { validateField, validators, clearAllValidations, hasError } = validation
      
      // Create multiple errors
      validateField('field1', '', [validators.required])
      validateField('field2', '', [validators.required])
      
      expect(hasError('field1')).toBe(true)
      expect(hasError('field2')).toBe(true)
      
      // Clear all errors
      clearAllValidations()
      
      expect(hasError('field1')).toBe(false)
      expect(hasError('field2')).toBe(false)
    })
  })

  describe('custom validators', () => {
    it('should validate confirm password', () => {
      const { validators } = validation
      
      const confirmPassword = validators.confirmPassword('password123')
      
      expect(confirmPassword('different')).toBe('Passwords do not match')
      expect(confirmPassword('password123')).toBe(true)
      expect(confirmPassword('')).toBe(true) // Empty is valid
    })

    it('should validate numeric values', () => {
      const { validators } = validation
      
      expect(validators.numeric('abc')).toBe('Must be a valid number')
      expect(validators.numeric('123')).toBe(true)
      expect(validators.numeric('123.45')).toBe(true)
      expect(validators.numeric('-123')).toBe(true)
      expect(validators.numeric('')).toBe(true) // Empty is valid
    })

    it('should validate positive numbers', () => {
      const { validators } = validation
      
      expect(validators.positive('-1')).toBe('Must be a positive number')
      expect(validators.positive('0')).toBe('Must be a positive number')
      expect(validators.positive('1')).toBe(true)
      expect(validators.positive('123.45')).toBe(true)
      expect(validators.positive('')).toBe(true) // Empty is valid
    })

    it('should validate number ranges', () => {
      const { validators } = validation
      const range1to10 = validators.range(1, 10, 'Must be between 1 and 10')
      
      expect(range1to10('0')).toBe('Must be between 1 and 10')
      expect(range1to10('11')).toBe('Must be between 1 and 10')
      expect(range1to10('5')).toBe(true)
      expect(range1to10('1')).toBe(true)
      expect(range1to10('10')).toBe(true)
      expect(range1to10('')).toBe(true) // Empty is valid
    })
  })
})
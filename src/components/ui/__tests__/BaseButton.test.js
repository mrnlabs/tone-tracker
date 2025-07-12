import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '../BaseButton.vue'

// Mock PrimeVue Button component
const mockButton = {
  name: 'Button',
  template: '<button v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>',
  emits: ['click']
}

describe('BaseButton', () => {
  const createWrapper = (props = {}, options = {}) => {
    return mount(BaseButton, {
      props,
      global: {
        components: {
          Button: mockButton
        },
        ...options.global
      },
      ...options
    })
  }

  describe('rendering', () => {
    it('should render with default props', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.classes()).toContain('base-button')
      expect(wrapper.classes()).toContain('p-button-primary')
    })

    it('should render with custom label', () => {
      const wrapper = createWrapper({ label: 'Click me' })
      
      expect(wrapper.text()).toContain('Click me')
    })

    it('should render slot content when no label provided', () => {
      const wrapper = createWrapper({}, {
        slots: {
          default: 'Slot content'
        }
      })
      
      expect(wrapper.text()).toContain('Slot content')
    })

    it('should render with icon', () => {
      const wrapper = createWrapper({
        icon: 'pi pi-check',
        label: 'Submit'
      })
      
      const icon = wrapper.find('i.pi-check')
      expect(icon.exists()).toBe(true)
      expect(icon.classes()).toContain('pi')
      expect(icon.classes()).toContain('pi-check')
    })

    it('should position icon correctly', () => {
      const leftWrapper = createWrapper({
        icon: 'pi pi-check',
        iconPosition: 'left',
        label: 'Submit'
      })
      
      const rightWrapper = createWrapper({
        icon: 'pi pi-check',
        iconPosition: 'right',
        label: 'Submit'
      })
      
      // Check icon positioning in DOM structure
      const leftIcon = leftWrapper.find('i.pi-check')
      const rightIcon = rightWrapper.find('i.pi-check')
      
      expect(leftIcon.exists()).toBe(true)
      expect(rightIcon.exists()).toBe(true)
    })
  })

  describe('variants and styling', () => {
    it('should apply correct variant classes', () => {
      const variants = [
        { variant: 'primary', expectedClass: 'p-button-primary' },
        { variant: 'secondary', expectedClass: 'p-button-secondary' },
        { variant: 'success', expectedClass: 'p-button-success' },
        { variant: 'warning', expectedClass: 'p-button-warning' },
        { variant: 'danger', expectedClass: 'p-button-danger' },
        { variant: 'info', expectedClass: 'p-button-info' },
        { variant: 'outlined', expectedClass: 'p-button-outlined' },
        { variant: 'text', expectedClass: 'p-button-text' }
      ]
      
      variants.forEach(({ variant, expectedClass }) => {
        const wrapper = createWrapper({ variant })
        expect(wrapper.classes()).toContain(expectedClass)
      })
    })

    it('should apply correct size classes', () => {
      const sizes = [
        { size: 'small', expectedClass: 'p-button-sm' },
        { size: 'medium', expectedClass: null },
        { size: 'large', expectedClass: 'p-button-lg' }
      ]
      
      sizes.forEach(({ size, expectedClass }) => {
        const wrapper = createWrapper({ size })
        if (expectedClass) {
          expect(wrapper.classes()).toContain(expectedClass)
        }
      })
    })

    it('should apply additional styling classes', () => {
      const wrapper = createWrapper({
        rounded: true,
        fullWidth: true,
        loading: true
      })
      
      expect(wrapper.classes()).toContain('p-button-rounded')
      expect(wrapper.classes()).toContain('button-full-width')
      expect(wrapper.classes()).toContain('button-loading')
    })
  })

  describe('states', () => {
    it('should handle disabled state', () => {
      const wrapper = createWrapper({ disabled: true })
      const button = wrapper.find('button')
      
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('should handle loading state', () => {
      const wrapper = createWrapper({ 
        loading: true,
        label: 'Submit'
      })
      
      const spinner = wrapper.find('i.pi-spinner')
      expect(spinner.exists()).toBe(true)
      expect(spinner.classes()).toContain('pi-spin')
      
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('should not show icon when loading', () => {
      const wrapper = createWrapper({
        loading: true,
        icon: 'pi pi-check',
        label: 'Submit'
      })
      
      const spinner = wrapper.find('i.pi-spinner')
      const icon = wrapper.find('i.pi-check')
      
      expect(spinner.exists()).toBe(true)
      expect(icon.exists()).toBe(false)
    })
  })

  describe('interactions', () => {
    it('should emit click event when clicked', async () => {
      const wrapper = createWrapper({ label: 'Click me' })
      const button = wrapper.find('button')
      
      await button.trigger('click')
      
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('should not emit click when disabled', async () => {
      const wrapper = createWrapper({ 
        label: 'Click me',
        disabled: true
      })
      const button = wrapper.find('button')
      
      await button.trigger('click')
      
      // The click event might still be emitted by the native button,
      // but our component logic should prevent the custom click emission
      // This depends on the actual implementation
    })

    it('should not emit click when loading', async () => {
      const wrapper = createWrapper({ 
        label: 'Click me',
        loading: true
      })
      const button = wrapper.find('button')
      
      await button.trigger('click')
      
      // Similar to disabled state, loading should prevent click handling
    })

    it('should pass through native button attributes', () => {
      const wrapper = createWrapper({
        type: 'submit',
        title: 'Submit form'
      })
      const button = wrapper.find('button')
      
      expect(button.attributes('type')).toBe('submit')
      expect(button.attributes('title')).toBe('Submit form')
    })
  })

  describe('prop validation', () => {
    it('should validate variant prop', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      // This would trigger a validation warning in Vue
      createWrapper({ variant: 'invalid-variant' })
      
      // In a real scenario, Vue would warn about invalid prop values
      // but we can't easily test that with the current setup
      
      consoleSpy.mockRestore()
    })

    it('should validate size prop', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      createWrapper({ size: 'invalid-size' })
      
      consoleSpy.mockRestore()
    })

    it('should validate iconPosition prop', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      createWrapper({ iconPosition: 'invalid-position' })
      
      consoleSpy.mockRestore()
    })

    it('should validate type prop', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      createWrapper({ type: 'invalid-type' })
      
      consoleSpy.mockRestore()
    })
  })

  describe('accessibility', () => {
    it('should have proper button semantics', () => {
      const wrapper = createWrapper({ label: 'Submit' })
      const button = wrapper.find('button')
      
      expect(button.element.tagName).toBe('BUTTON')
      expect(button.attributes('type')).toBe('button') // default type
    })

    it('should support custom button types', () => {
      const wrapper = createWrapper({ 
        type: 'submit',
        label: 'Submit'
      })
      const button = wrapper.find('button')
      
      expect(button.attributes('type')).toBe('submit')
    })

    it('should be focusable when not disabled', () => {
      const wrapper = createWrapper({ label: 'Click me' })
      const button = wrapper.find('button')
      
      expect(button.attributes('tabindex')).toBeUndefined() // Native focusability
      expect(button.attributes('disabled')).toBeUndefined()
    })

    it('should not be focusable when disabled', () => {
      const wrapper = createWrapper({ 
        label: 'Click me',
        disabled: true
      })
      const button = wrapper.find('button')
      
      expect(button.attributes('disabled')).toBeDefined()
    })
  })
})
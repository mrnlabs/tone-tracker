import DOMPurify from 'dompurify'

/**
 * Sanitization utility for preventing XSS attacks
 */

// Configure DOMPurify with safe defaults
const config = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'a',
    'span', 'div', 'b', 'i', 'code', 'pre', 'table', 'thead',
    'tbody', 'tr', 'td', 'th'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'style'],
  ALLOW_DATA_ATTR: false,
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  RETURN_TRUSTED_TYPE: false,
  SANITIZE_DOM: true
}

// Strict config for user input (no HTML allowed)
const strictConfig = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true
}

/**
 * Sanitize HTML content with default safe configuration
 * @param {string} dirty - The untrusted HTML string
 * @returns {string} - The sanitized HTML string
 */
export function sanitizeHTML(dirty) {
  if (!dirty) return ''
  return DOMPurify.sanitize(dirty, config)
}

/**
 * Strictly sanitize user input (removes all HTML)
 * @param {string} dirty - The untrusted input string
 * @returns {string} - The sanitized plain text string
 */
export function sanitizeText(dirty) {
  if (!dirty) return ''
  return DOMPurify.sanitize(dirty, strictConfig)
}

/**
 * Sanitize URL to prevent javascript: and data: URIs
 * @param {string} url - The URL to sanitize
 * @returns {string} - The sanitized URL or empty string if invalid
 */
export function sanitizeURL(url) {
  if (!url) return ''
  
  const sanitized = DOMPurify.sanitize(url, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    RETURN_DOM: false
  })
  
  // Additional URL validation
  const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']
  try {
    const urlObj = new URL(sanitized)
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return ''
    }
    return sanitized
  } catch {
    // If not a valid URL, treat as relative path
    if (sanitized.startsWith('/') || sanitized.startsWith('#')) {
      return sanitized
    }
    return ''
  }
}

/**
 * Create a Vue directive for sanitized HTML
 */
export const vSanitizeHtml = {
  mounted(el, binding) {
    el.innerHTML = sanitizeHTML(binding.value)
  },
  updated(el, binding) {
    el.innerHTML = sanitizeHTML(binding.value)
  }
}

/**
 * Sanitize object properties recursively
 * @param {object} obj - Object to sanitize
 * @param {array} htmlFields - Fields that contain HTML to sanitize
 * @returns {object} - Sanitized object
 */
export function sanitizeObject(obj, htmlFields = []) {
  if (!obj || typeof obj !== 'object') return obj
  
  const sanitized = Array.isArray(obj) ? [] : {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = htmlFields.includes(key) 
        ? sanitizeHTML(value)
        : sanitizeText(value)
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, htmlFields)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

export default {
  sanitizeHTML,
  sanitizeText,
  sanitizeURL,
  sanitizeObject,
  vSanitizeHtml
}
/**
 * Production-safe logger utility
 * Automatically removes sensitive logging in production builds
 */

const isDevelopment = import.meta.env.DEV
const isDebugMode = import.meta.env.VITE_DEBUG === 'true'

// Sensitive patterns to filter out
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /api[_-]?key/i,
  /secret/i,
  /credential/i,
  /auth/i,
  /bearer/i,
  /private/i,
  /ssn/i,
  /credit[_-]?card/i
]

/**
 * Check if data contains sensitive information
 */
function containsSensitiveData(data) {
  if (!data) return false
  
  const str = typeof data === 'string' ? data : JSON.stringify(data)
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(str))
}

/**
 * Sanitize sensitive data from objects
 */
function sanitizeData(data) {
  if (!data || typeof data !== 'object') return data
  
  const sanitized = Array.isArray(data) ? [] : {}
  
  for (const [key, value] of Object.entries(data)) {
    // Check if key name suggests sensitive data
    const isSensitiveKey = SENSITIVE_PATTERNS.some(pattern => pattern.test(key))
    
    if (isSensitiveKey) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value)
    } else if (typeof value === 'string' && containsSensitiveData(value)) {
      sanitized[key] = '[REDACTED]'
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

/**
 * Logger class with environment-aware logging
 */
class Logger {
  constructor(namespace = 'App') {
    this.namespace = namespace
    this.enabled = isDevelopment || isDebugMode
  }

  /**
   * Format log message with namespace and timestamp
   */
  formatMessage(level, ...args) {
    const timestamp = new Date().toISOString()
    return [`[${timestamp}] [${this.namespace}] [${level}]`, ...args]
  }

  /**
   * Log debug messages (only in development)
   */
  debug(...args) {
    if (!this.enabled) return
    
    const sanitizedArgs = args.map(arg => 
      typeof arg === 'object' ? sanitizeData(arg) : arg
    )
    
    console.debug(...this.formatMessage('DEBUG', ...sanitizedArgs))
  }

  /**
   * Log info messages
   */
  info(...args) {
    if (!this.enabled) return
    
    const sanitizedArgs = args.map(arg => 
      typeof arg === 'object' ? sanitizeData(arg) : arg
    )
    
    console.info(...this.formatMessage('INFO', ...sanitizedArgs))
  }

  /**
   * Log warning messages (always enabled)
   */
  warn(...args) {
    const sanitizedArgs = args.map(arg => 
      typeof arg === 'object' ? sanitizeData(arg) : arg
    )
    
    console.warn(...this.formatMessage('WARN', ...sanitizedArgs))
  }

  /**
   * Log error messages (always enabled)
   */
  error(...args) {
    const sanitizedArgs = args.map(arg => {
      if (arg instanceof Error) {
        // Preserve error stack but sanitize message
        return {
          message: containsSensitiveData(arg.message) ? '[REDACTED ERROR]' : arg.message,
          stack: isDevelopment ? arg.stack : undefined
        }
      }
      return typeof arg === 'object' ? sanitizeData(arg) : arg
    })
    
    console.error(...this.formatMessage('ERROR', ...sanitizedArgs))
  }

  /**
   * Create a child logger with a sub-namespace
   */
  child(subNamespace) {
    return new Logger(`${this.namespace}:${subNamespace}`)
  }

  /**
   * Group related logs
   */
  group(label, fn) {
    if (!this.enabled) {
      fn()
      return
    }
    
    console.group(`[${this.namespace}] ${label}`)
    fn()
    console.groupEnd()
  }

  /**
   * Time operations
   */
  time(label) {
    if (!this.enabled) return
    console.time(`[${this.namespace}] ${label}`)
  }

  timeEnd(label) {
    if (!this.enabled) return
    console.timeEnd(`[${this.namespace}] ${label}`)
  }

  /**
   * Table display for structured data
   */
  table(data, columns) {
    if (!this.enabled) return
    
    const sanitized = Array.isArray(data) 
      ? data.map(item => sanitizeData(item))
      : sanitizeData(data)
    
    console.table(sanitized, columns)
  }
}

// Create default logger instance
const logger = new Logger()

// Export logger factory for creating namespaced loggers
export function createLogger(namespace) {
  return new Logger(namespace)
}

// Export default logger
export default logger

// Replace global console in production to prevent accidental logging
if (!isDevelopment && !isDebugMode) {
  const noop = () => {}
  
  // Override console methods in production
  window.console = {
    ...window.console,
    log: noop,
    debug: noop,
    info: noop,
    trace: noop,
    // Keep warn and error for critical issues
    warn: window.console.warn,
    error: window.console.error,
    // Keep other utility methods
    group: window.console.group,
    groupEnd: window.console.groupEnd,
    time: window.console.time,
    timeEnd: window.console.timeEnd,
    table: window.console.table
  }
}
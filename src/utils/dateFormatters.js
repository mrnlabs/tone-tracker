// src/utils/dateFormatters.js
// Date and time formatting utilities for handling backend OffsetDateTime

/**
 * Formats a date string to a readable date format
 * @param {string} dateString - ISO date string or OffsetDateTime from backend
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  try {
    // Handle OffsetDateTime format from backend
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    console.warn('Invalid date format:', dateString)
    return 'Invalid Date'
  }
}

/**
 * Formats a datetime string to a readable datetime format
 * @param {string} dateTimeString - ISO datetime string or OffsetDateTime from backend
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A'
  
  try {
    // Handle OffsetDateTime format from backend
    const date = new Date(dateTimeString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    console.warn('Invalid datetime format:', dateTimeString)
    return 'Invalid DateTime'
  }
}

/**
 * Formats a datetime string to relative time (e.g., "2 hours ago")
 * @param {string} dateTimeString - ISO datetime string or OffsetDateTime from backend
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A'
  
  try {
    const date = new Date(dateTimeString)
    const now = new Date()
    const diffInMs = now - date
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    
    if (diffInDays > 7) {
      return formatDate(dateTimeString)
    } else if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  } catch (error) {
    console.warn('Invalid datetime format for relative time:', dateTimeString)
    return 'Unknown'
  }
}

/**
 * Formats a time string to a readable time format
 * @param {string} timeString - ISO time string
 * @returns {string} Formatted time string
 */
export const formatTime = (timeString) => {
  if (!timeString) return 'N/A'
  
  try {
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    console.warn('Invalid time format:', timeString)
    return 'Invalid Time'
  }
}

/**
 * Calculates duration between two dates in days
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {number} Number of days
 */
export const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0
  
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  } catch (error) {
    console.warn('Invalid date format for duration calculation:', { startDate, endDate })
    return 0
  }
}

/**
 * Formats a date range to a readable string
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return 'No dates set'
  if (!startDate) return `Until ${formatDate(endDate)}`
  if (!endDate) return `From ${formatDate(startDate)}`
  
  const start = formatDate(startDate)
  const end = formatDate(endDate)
  
  if (start === end) return start
  return `${start} - ${end}`
}

/**
 * Checks if a date is in the past
 * @param {string} dateString - Date string to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (dateString) => {
  if (!dateString) return false
  
  try {
    const date = new Date(dateString)
    return date < new Date()
  } catch (error) {
    return false
  }
}

/**
 * Checks if a date is today
 * @param {string} dateString - Date string to check
 * @returns {boolean} True if date is today
 */
export const isToday = (dateString) => {
  if (!dateString) return false
  
  try {
    const date = new Date(dateString)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  } catch (error) {
    return false
  }
}

/**
 * Gets a human-readable status for a date range
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {string} Status description
 */
export const getDateRangeStatus = (startDate, endDate) => {
  if (!startDate || !endDate) return 'No dates'
  
  try {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (now < start) return 'Upcoming'
    if (now > end) return 'Past'
    if (now >= start && now <= end) return 'Active'
    
    return 'Unknown'
  } catch (error) {
    return 'Invalid dates'
  }
}
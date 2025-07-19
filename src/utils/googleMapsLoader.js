// Google Maps API loader singleton
// This prevents multiple instances of the Google Maps API from being loaded

import { Loader } from '@googlemaps/js-api-loader'

let loaderInstance = null
let loadPromise = null

/**
 * Get or create the Google Maps loader instance
 * @param {string} apiKey - Google Maps API key
 * @returns {Loader} Google Maps loader instance
 */
export const getGoogleMapsLoader = (apiKey) => {
  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey: apiKey,
      version: 'weekly',
      libraries: ['marker', 'places'] // Add places library for future use
    })
  }
  return loaderInstance
}

/**
 * Load Google Maps API (singleton pattern)
 * @param {string} apiKey - Google Maps API key
 * @returns {Promise} Promise that resolves when Google Maps is loaded
 */
export const loadGoogleMaps = (apiKey) => {
  if (!loadPromise) {
    const loader = getGoogleMapsLoader(apiKey)
    loadPromise = loader.load().catch(error => {
      // Reset on error so it can be retried
      loadPromise = null
      loaderInstance = null
      throw error
    })
  }
  return loadPromise
}

/**
 * Check if Google Maps is already loaded
 * @returns {boolean} True if Google Maps is loaded
 */
export const isGoogleMapsLoaded = () => {
  return typeof window !== 'undefined' && !!window.google?.maps
}

/**
 * Reset the loader (useful for testing or API key changes)
 */
export const resetGoogleMapsLoader = () => {
  loaderInstance = null
  loadPromise = null
}
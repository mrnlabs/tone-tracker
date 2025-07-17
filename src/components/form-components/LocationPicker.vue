<template>
  <div class="location-picker">
    <div class="location-input-section">
      <InputLabel
          :label="label"
          :required="required"
          :has-error="!!error"
      />

      <div class="location-input-group">
        <div class="autocomplete-container">
          <InputText
              ref="autocompleteInput"
              v-model="searchQuery"
              :placeholder="placeholder"
              @input="handleManualInput"
              class="location-search"
              :class="{ 'has-suggestions': showSuggestions }"
          />
          
          <!-- Manual Suggestions Dropdown -->
          <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
            <div 
                v-for="(suggestion, index) in suggestions" 
                :key="suggestion.place_id"
                @click="selectSuggestion(suggestion)"
                class="suggestion-item"
                :class="{ 'highlighted': index === highlightedIndex }"
            >
              <i class="pi pi-map-marker suggestion-icon"></i>
              <div class="suggestion-content">
                <div class="suggestion-main">{{ suggestion.structured_formatting.main_text }}</div>
                <div class="suggestion-secondary">{{ suggestion.structured_formatting.secondary_text }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <Button
            @click="getCurrentLocation"
            icon="pi pi-map-marker"
            class="p-button-outlined"
            v-tooltip.top="'Use current location'"
            :loading="gettingLocation"
        />
      </div>

      <InputError :error="error" />
    </div>

    <div v-if="showMap" class="map-container">
      <div ref="mapElement" class="google-map"></div>
    </div>

    <div v-if="selectedLocation" class="selected-location">
      <Card>
        <template #content>
          <div class="location-details">
            <div class="location-header">
              <i class="pi pi-map-marker location-icon"></i>
              <h4>Selected Location</h4>
            </div>
            <p class="location-address">{{ selectedLocation.address }}</p>
            <div class="location-coordinates">
              <span>Lat: {{ selectedLocation.lat.toFixed(6) }}</span>
              <span>Lng: {{ selectedLocation.lng.toFixed(6) }}</span>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  },
  label: {
    type: String,
    default: 'Location'
  },
  placeholder: {
    type: String,
    default: 'Search for a location...'
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  showMap: {
    type: Boolean,
    default: true
  },
  autocompleteOptions: {
    type: Object,
    default: () => ({
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: ['us', 'zw', 'za'] }, // US, Zimbabwe, South Africa
      fields: ['place_id', 'formatted_address', 'geometry', 'name', 'address_components']
    })
  }
})

const emit = defineEmits(['update:modelValue', 'location-selected'])

const autocompleteInput = ref(null)
const mapElement = ref(null)
const searchQuery = ref('')
const selectedLocation = ref(props.modelValue)
const gettingLocation = ref(false)
const suggestions = ref([])
const showSuggestions = ref(false)
const highlightedIndex = ref(-1)

let map = null
let marker = null
let geocoder = null
let autocompleteService = null
let placesService = null
let debounceTimer = null

const initializeMap = () => {
  if (!window.google || !mapElement.value) return

  const defaultCenter = { lat: -17.8216, lng: 31.0492 } // Harare, Zimbabwe

  map = new window.google.maps.Map(mapElement.value, {
    center: selectedLocation.value ?
        { lat: selectedLocation.value.lat, lng: selectedLocation.value.lng } :
        defaultCenter,
    zoom: 13
  })

  geocoder = new window.google.maps.Geocoder()
  
  // Initialize Places services
  autocompleteService = new window.google.maps.places.AutocompleteService()
  placesService = new window.google.maps.places.PlacesService(map)

  // Add click listener to map
  map.addListener('click', (event) => {
    setMarker(event.latLng)
    reverseGeocode(event.latLng)
  })

  // Set initial marker if location is selected
  if (selectedLocation.value) {
    setMarker(new window.google.maps.LatLng(
        selectedLocation.value.lat,
        selectedLocation.value.lng
    ))
  }
}

const setMarker = (latLng) => {
  if (marker) {
    marker.setMap(null)
  }

  marker = new window.google.maps.Marker({
    position: latLng,
    map: map,
    title: 'Selected Location'
  })
}

const reverseGeocode = (latLng) => {
  if (!geocoder) return

  geocoder.geocode({ location: latLng }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const location = {
        lat: latLng.lat(),
        lng: latLng.lng(),
        address: results[0].formatted_address
      }
      updateLocation(location)
    }
  })
}

// Places Autocomplete functions
const handleManualInput = (event) => {
  const query = event.target.value
  searchQuery.value = query
  
  if (query.trim().length < 3) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }
  
  // Debounce the autocomplete search
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    getPlaceSuggestions(query)
  }, 300)
}

const getPlaceSuggestions = (query) => {
  if (!autocompleteService || !query.trim()) return
  
  const request = {
    input: query,
    ...props.autocompleteOptions
  }
  
  autocompleteService.getPlacePredictions(request, (predictions, status) => {
    if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
      suggestions.value = predictions.slice(0, 5) // Limit to 5 suggestions
      showSuggestions.value = true
      highlightedIndex.value = -1
    } else {
      suggestions.value = []
      showSuggestions.value = false
    }
  })
}

const selectSuggestion = (suggestion) => {
  if (!placesService) return
  
  showSuggestions.value = false
  searchQuery.value = suggestion.description
  
  // Get place details
  placesService.getDetails({
    placeId: suggestion.place_id,
    fields: props.autocompleteOptions.fields
  }, (place, status) => {
    if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address,
        name: place.name,
        placeId: place.place_id,
        addressComponents: place.address_components
      }
      
      if (map) {
        const latLng = new window.google.maps.LatLng(location.lat, location.lng)
        map.setCenter(latLng)
        setMarker(latLng)
      }
      
      updateLocation(location)
    }
  })
}

// Handle keyboard navigation in suggestions
const handleKeydown = (event) => {
  if (!showSuggestions.value || suggestions.value.length === 0) return
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, suggestions.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value >= 0) {
        selectSuggestion(suggestions.value[highlightedIndex.value])
      }
      break
    case 'Escape':
      showSuggestions.value = false
      highlightedIndex.value = -1
      break
  }
}

const getCurrentLocation = () => {
  if (!navigator.geolocation) return

  gettingLocation.value = true

  navigator.geolocation.getCurrentPosition(
      (position) => {
        const latLng = new window.google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
        )

        map.setCenter(latLng)
        setMarker(latLng)
        reverseGeocode(latLng)
        gettingLocation.value = false
      },
      () => {
        gettingLocation.value = false
      }
  )
}

const updateLocation = (location) => {
  selectedLocation.value = location
  searchQuery.value = location.address
  
  // Extract additional address information for the activation form
  const addressInfo = extractAddressComponents(location.addressComponents)
  const enhancedLocation = {
    ...location,
    ...addressInfo
  }
  
  emit('update:modelValue', enhancedLocation)
  emit('location-selected', enhancedLocation)
}

// Extract structured address components for form fields
const extractAddressComponents = (components) => {
  if (!components) return {}
  
  const addressInfo = {
    streetNumber: '',
    route: '',
    city: '',
    state: '',
    country: '',
    postalCode: ''
  }
  
  components.forEach(component => {
    const types = component.types
    
    if (types.includes('street_number')) {
      addressInfo.streetNumber = component.long_name
    } else if (types.includes('route')) {
      addressInfo.route = component.long_name
    } else if (types.includes('locality')) {
      addressInfo.city = component.long_name
    } else if (types.includes('administrative_area_level_1')) {
      addressInfo.state = component.short_name
    } else if (types.includes('country')) {
      addressInfo.country = component.short_name
    } else if (types.includes('postal_code')) {
      addressInfo.postalCode = component.long_name
    }
  })
  
  // Combine street number and route for streetAddress
  const streetAddress = `${addressInfo.streetNumber} ${addressInfo.route}`.trim()
  
  return {
    streetAddress,
    city: addressInfo.city,
    state: addressInfo.state,
    country: addressInfo.country,
    zipCode: addressInfo.postalCode
  }
}

// Click outside to close suggestions
const handleClickOutside = (event) => {
  if (!autocompleteInput.value?.contains(event.target)) {
    showSuggestions.value = false
  }
}

watch(() => props.modelValue, (newValue) => {
  selectedLocation.value = newValue
  if (newValue && map) {
    const latLng = new window.google.maps.LatLng(newValue.lat, newValue.lng)
    map.setCenter(latLng)
    setMarker(latLng)
    searchQuery.value = newValue.address
  }
})

onMounted(() => {
  // Initialize map when Google Maps is loaded
  if (window.google) {
    initializeMap()
  } else {
    // Wait for Google Maps to load
    const checkGoogleMaps = setInterval(() => {
      if (window.google) {
        clearInterval(checkGoogleMaps)
        initializeMap()
      }
    }, 100)
  }
  
  // Add keyboard event listener
  nextTick(() => {
    if (autocompleteInput.value) {
      autocompleteInput.value.addEventListener('keydown', handleKeydown)
    }
  })
  
  // Add click outside listener
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // Clean up event listeners
  if (autocompleteInput.value) {
    autocompleteInput.value.removeEventListener('keydown', handleKeydown)
  }
  document.removeEventListener('click', handleClickOutside)
  
  // Clear any pending timers
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>

<style scoped>
.location-picker {
  width: 100%;
}

.location-input-section {
  margin-bottom: 1rem;
}

.location-input-group {
  display: flex;
  gap: 0.5rem;
}

.autocomplete-container {
  position: relative;
  flex: 1;
}

.location-search {
  width: 100%;
}

.location-search.has-suggestions {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
}

.suggestion-item:hover,
.suggestion-item.highlighted {
  background-color: #f8fafc;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-icon {
  color: #6b7280;
  margin-right: 0.75rem;
  font-size: 0.875rem;
}

.suggestion-content {
  flex: 1;
  min-width: 0;
}

.suggestion-main {
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.125rem;
}

.suggestion-secondary {
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.map-container {
  margin: 1rem 0;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.google-map {
  width: 100%;
  height: 300px;
}

.selected-location {
  margin-top: 1rem;
}

.location-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.location-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.location-icon {
  color: #3b82f6;
}

.location-header h4 {
  margin: 0;
  color: #111827;
}

.location-address {
  margin: 0;
  color: #374151;
  font-weight: 500;
}

.location-coordinates {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-family: monospace;
}
</style>
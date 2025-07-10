<template>
  <div class="location-picker">
    <div class="location-input-section">
      <InputLabel
          :label="label"
          :required="required"
          :has-error="!!error"
      />

      <div class="location-input-group">
        <InputText
            v-model="searchQuery"
            :placeholder="placeholder"
            @input="handleSearch"
            @keyup.enter="searchLocation"
            class="location-search"
        />
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
import { ref, onMounted, watch } from 'vue'

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
  }
})

const emit = defineEmits(['update:modelValue', 'location-selected'])

const mapElement = ref(null)
const searchQuery = ref('')
const selectedLocation = ref(props.modelValue)
const gettingLocation = ref(false)

let map = null
let marker = null
let geocoder = null

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

const handleSearch = () => {
  // Debounce search
  clearTimeout(handleSearch.timer)
  handleSearch.timer = setTimeout(searchLocation, 500)
}

const searchLocation = () => {
  if (!geocoder || !searchQuery.value.trim()) return

  geocoder.geocode({ address: searchQuery.value }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const latLng = results[0].geometry.location
      const location = {
        lat: latLng.lat(),
        lng: latLng.lng(),
        address: results[0].formatted_address
      }

      map.setCenter(latLng)
      setMarker(latLng)
      updateLocation(location)
    }
  })
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
  emit('update:modelValue', location)
  emit('location-selected', location)
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

.location-search {
  flex: 1;
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
<template>
  <div class="activation-map-container">
    <div ref="mapContainer" class="map-container" :style="{ height: mapHeight }">
      <div v-show="loading" class="map-loading">
        <ProgressSpinner size="large" />
        <p>Loading map...</p>
      </div>
      <div v-show="error && !loading" class="map-error">
        <Message severity="error" :closable="false">
          {{ error }}
        </Message>
      </div>
    </div>

    <!-- Map Controls -->
    <div class="map-controls">
      <div class="control-group">
        <Button 
          @click="refreshActivations" 
          icon="pi pi-refresh" 
          label="Refresh" 
          size="small"
          outlined
          :loading="refreshing"
        />
        <Button 
          @click="fitAllActivations" 
          icon="pi pi-eye" 
          label="Fit All" 
          size="small"
          outlined
          :disabled="markers.length === 0"
        />
        <Dropdown 
          v-model="selectedFilter"
          @change="filterActivations"
          :options="filterOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Filter Activations"
          class="filter-dropdown"
        />
      </div>
      <div class="legend">
        <div class="legend-item" v-for="status in activationStatuses" :key="status.value">
          <div class="legend-marker" :style="{ backgroundColor: status.color }"></div>
          <span>{{ status.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { activationService } from '@/services/api'
import { useRouter } from 'vue-router'
import { loadGoogleMaps, isGoogleMapsLoaded } from '@/utils/googleMapsLoader'

const props = defineProps({
  height: {
    type: String,
    default: '500px'
  },
  apiKey: {
    type: String,
    required: true
  },
  center: {
    type: Object,
    default: () => ({ lat: -17.8292, lng: 31.0522 }) // Harare, Zimbabwe
  },
  zoom: {
    type: Number,
    default: 7
  },
  useAdvancedMarkers: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['activation-selected', 'map-ready'])

const router = useRouter()

// Reactive data
const mapContainer = ref(null)
const loading = ref(true)
const error = ref(null)
const refreshing = ref(false)
const map = ref(null)
const markers = ref([])
const activations = ref([])
const filteredActivations = ref([])
const selectedFilter = ref('all')

// Computed
const mapHeight = computed(() => props.height)

// Filter options
const filterOptions = ref([
  { label: 'All Activations', value: 'all' },
  { label: 'Active Only', value: 'ACTIVE' },
  { label: 'Planned', value: 'PLANNED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' }
])

// Activation status colors
const activationStatuses = ref([
  { value: 'ACTIVE', label: 'Active', color: '#22c55e' },
  { value: 'PLANNED', label: 'Planned', color: '#3b82f6' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: '#f59e0b' },
  { value: 'COMPLETED', label: 'Completed', color: '#6b7280' },
  { value: 'CANCELLED', label: 'Cancelled', color: '#ef4444' }
])

// Google Maps is now loaded via singleton utility

// Methods
const initializeMap = async () => {
  try {
    loading.value = true
    error.value = null

    // Wait for container to be available
    let retries = 0
    while (!mapContainer.value && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      retries++
    }

    if (!mapContainer.value) {
      throw new Error('Map container not found after waiting')
    }

    // Check if Google Maps is already loaded to avoid multiple loads
    if (!isGoogleMapsLoaded()) {
      await loadGoogleMaps(props.apiKey)
    }

    // Map configuration - mapId is required for Advanced Markers
    const mapConfig = {
      center: props.center,
      zoom: props.zoom,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true
    }

    // Add mapId only if using Advanced Markers
    // Note: When mapId is present, custom styles must be configured in Google Cloud Console
    if (props.useAdvancedMarkers) {
      mapConfig.mapId = 'ACTIVATION_MAP'
    } else {
      // Add basic styling for legacy markers
      mapConfig.styles = [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    }

    map.value = new google.maps.Map(mapContainer.value, mapConfig)

    // Load activations data
    await loadActivations()
    
    emit('map-ready', map.value)
    loading.value = false
  } catch (err) {
    console.error('Error initializing map:', err)
    error.value = 'Failed to load map. Please check your internet connection and try again.'
    loading.value = false
  }
}

const loadActivations = async () => {
  try {
    refreshing.value = true
    
    // Get active activations with location data
    const response = await activationService.getActivations({
      status: 'ACTIVE,PLANNED,IN_PROGRESS',
      includeLocation: true,
      size: 100 // Get more activations for map display
    })
    
    let activationData = response.data || []
    
    // Add mock location data for testing if no real data exists
    if (activationData.length === 0) {
      activationData = [
        {
          id: 1,
          name: 'Summer Campaign 2024',
          clientName: 'ABC Corp',
          location: 'Eastgate Shopping Centre, Harare',
          latitude: -17.8627,
          longitude: 31.0775,
          status: 'ACTIVE',
          startDate: '2024-01-15',
          endDate: '2024-01-30',
          briefDescription: 'Summer product launch campaign at premier shopping center in Harare'
        },
        {
          id: 2,
          name: 'Winter Promotion',
          clientName: 'XYZ Ltd',
          location: 'Ascot Shopping Centre, Bulawayo',
          latitude: -20.1491,
          longitude: 28.5796,
          status: 'IN_PROGRESS',
          startDate: '2024-01-20',
          endDate: '2024-02-10',
          briefDescription: 'Winter clothing promotion campaign in Bulawayo'
        },
        {
          id: 3,
          name: 'Health & Wellness Fair',
          clientName: 'Health Plus',
          location: 'Mutare Shopping Centre, Mutare',
          latitude: -18.9707,
          longitude: 32.6703,
          status: 'PLANNED',
          startDate: '2024-02-01',
          endDate: '2024-02-15',
          briefDescription: 'Health and wellness product showcase in Mutare'
        },
        {
          id: 4,
          name: 'Back to School Campaign',
          clientName: 'EduTech Solutions',
          location: 'Sam Levy Village, Harare',
          latitude: -17.7849,
          longitude: 31.0789,
          status: 'ACTIVE',
          startDate: '2024-01-10',
          endDate: '2024-02-28',
          briefDescription: 'Educational technology promotion for back to school season'
        }
      ]
    }
    
    activations.value = activationData
    filteredActivations.value = [...activations.value]
    
    // Clear existing markers
    clearMarkers()
    
    // Add new markers
    await addMarkersToMap()
    
    refreshing.value = false
  } catch (err) {
    console.error('Error loading activations:', err)
    
    // Fallback to mock data on API error
    const mockData = [
      {
        id: 1,
        name: 'Demo Activation',
        clientName: 'Demo Client',
        location: 'Harare CBD, Zimbabwe',
        latitude: -17.8292,
        longitude: 31.0522,
        status: 'ACTIVE',
        startDate: '2024-01-15',
        endDate: '2024-01-30',
        briefDescription: 'Demo activation for testing map functionality in Zimbabwe'
      }
    ]
    
    activations.value = mockData
    filteredActivations.value = [...activations.value]
    clearMarkers()
    await addMarkersToMap()
    
    error.value = 'Using demo data - API connection failed'
    refreshing.value = false
  }
}

const addMarkersToMap = async () => {
  if (!map.value) return

  try {
    // Use Advanced Markers or Legacy Markers based on prop
    if (props.useAdvancedMarkers) {
      await createAdvancedMarkers()
    } else {
      await createLegacyMarkers()
    }

    // Adjust map bounds to show all markers
    if (markers.value.length > 0) {
      adjustMapBounds()
    }
  } catch (error) {
    console.error('Error adding markers to map:', error)
    error.value = 'Failed to load map markers'
  }
}

const createAdvancedMarkers = async () => {
  // Import AdvancedMarkerElement
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker")

  filteredActivations.value.forEach(activation => {
    // Skip if no location data
    if (!activation.latitude || !activation.longitude) {
      console.warn(`Activation ${activation.id} has no location data`)
      return
    }

    const position = {
      lat: parseFloat(activation.latitude),
      lng: parseFloat(activation.longitude)
    }

    // Get status color
    const statusInfo = activationStatuses.value.find(s => s.value === activation.status)
    const markerColor = statusInfo ? statusInfo.color : '#6b7280'

    try {
      // Create PinElement with custom styling
      const pinElement = new PinElement({
        background: markerColor,
        borderColor: '#ffffff',
        scale: 1.2,
        glyph: '',
      })

      // Create AdvancedMarkerElement
      const marker = new AdvancedMarkerElement({
        position: position,
        map: map.value,
        content: pinElement.element,
        title: activation.name,
      })

      // Create info window and add listeners
      addMarkerListeners(marker, activation, false)
    } catch (markerError) {
      console.warn('Failed to create advanced marker, falling back to standard marker for activation:', activation.id, markerError)
      createLegacyMarker(activation)
    }
  })
}

const createLegacyMarkers = () => {
  filteredActivations.value.forEach(activation => {
    createLegacyMarker(activation)
  })
}

const createLegacyMarker = (activation) => {
  // Skip if no location data
  if (!activation.latitude || !activation.longitude) {
    console.warn(`Activation ${activation.id} has no location data`)
    return
  }

  const position = {
    lat: parseFloat(activation.latitude),
    lng: parseFloat(activation.longitude)
  }

  // Get status color
  const statusInfo = activationStatuses.value.find(s => s.value === activation.status)
  const markerColor = statusInfo ? statusInfo.color : '#6b7280'

  // Create legacy marker with custom icon
  const markerIcon = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: markerColor,
    fillOpacity: 0.8,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: 8
  }

  const marker = new google.maps.Marker({
    position: position,
    map: map.value,
    icon: markerIcon,
    title: activation.name,
  })

  // Create info window and add listeners
  addMarkerListeners(marker, activation, true)
}

const addMarkerListeners = (marker, activation, isLegacyMarker) => {
  // Create info window content
  const infoWindowContent = createInfoWindowContent(activation)
  
  const infoWindow = new google.maps.InfoWindow({
    content: infoWindowContent
  })

  // Add click listener
  marker.addListener('click', () => {
    // Close other info windows
    markers.value.forEach(m => {
      if (m.infoWindow && m.infoWindow !== infoWindow) {
        m.infoWindow.close()
      }
    })
    
    infoWindow.open(map.value, marker)
    emit('activation-selected', activation)
  })

  // Store marker with info window
  markers.value.push({
    marker,
    infoWindow,
    activation,
    isLegacyMarker
  })
}

const createInfoWindowContent = (activation) => {
  const statusInfo = activationStatuses.value.find(s => s.value === activation.status)
  const statusBadge = statusInfo 
    ? `<span style="background-color: ${statusInfo.color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${statusInfo.label}</span>`
    : ''

  return `
    <div style="max-width: 300px; font-family: Arial, sans-serif;">
      <div style="border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 8px;">
        <h3 style="margin: 0; font-size: 16px; color: #333;">${activation.name}</h3>
        ${statusBadge}
      </div>
      
      <div style="margin-bottom: 8px;">
        <strong>Client:</strong> ${activation.clientName || 'N/A'}<br>
        <strong>Location:</strong> ${activation.location || 'N/A'}<br>
        <strong>Start Date:</strong> ${formatDate(activation.startDate)}<br>
        <strong>End Date:</strong> ${formatDate(activation.endDate)}
      </div>
      
      ${activation.briefDescription ? `
        <div style="margin-bottom: 8px;">
          <strong>Description:</strong><br>
          <span style="color: #666; font-size: 14px;">${truncateText(activation.briefDescription, 100)}</span>
        </div>
      ` : ''}
      
      <div style="text-align: center; margin-top: 12px;">
        <button 
          onclick="window.parent.postMessage({type: 'view-activation', id: ${activation.id}}, '*')" 
          style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 14px;"
        >
          View Details
        </button>
      </div>
    </div>
  `
}

const clearMarkers = () => {
  markers.value.forEach(({ marker, infoWindow, isLegacyMarker }) => {
    if (infoWindow) infoWindow.close()
    
    if (isLegacyMarker) {
      // Legacy marker
      marker.setMap(null)
    } else {
      // Advanced marker
      marker.map = null
    }
  })
  markers.value = []
}

const adjustMapBounds = () => {
  if (!map.value || markers.value.length === 0) {
    // If no markers, center on Zimbabwe with default zoom
    map.value.setCenter(props.center)
    map.value.setZoom(props.zoom)
    return
  }

  if (markers.value.length === 1) {
    // If only one marker, center on it with good zoom level
    const { marker, isLegacyMarker } = markers.value[0]
    const position = isLegacyMarker ? marker.getPosition() : marker.position
    map.value.setCenter(position)
    map.value.setZoom(10) // Good zoom for single location
    return
  }

  // Multiple markers - fit bounds with padding
  const bounds = new google.maps.LatLngBounds()
  markers.value.forEach(({ marker, isLegacyMarker }) => {
    if (isLegacyMarker) {
      bounds.extend(marker.getPosition())
    } else {
      bounds.extend(marker.position)
    }
  })

  // Add padding around the bounds
  const padding = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  }

  map.value.fitBounds(bounds, padding)
  
  // Ensure reasonable zoom levels after bounds are set
  google.maps.event.addListenerOnce(map.value, 'bounds_changed', () => {
    const currentZoom = map.value.getZoom()
    
    // Don't zoom in too much for local areas
    if (currentZoom > 12) {
      map.value.setZoom(12)
    }
    
    // Don't zoom out too much for country view
    if (currentZoom < 6) {
      map.value.setZoom(6)
    }
  })
}

const filterActivations = async () => {
  if (selectedFilter.value === 'all') {
    filteredActivations.value = [...activations.value]
  } else {
    filteredActivations.value = activations.value.filter(
      activation => activation.status === selectedFilter.value
    )
  }
  
  // Clear existing markers and add filtered ones
  clearMarkers()
  await addMarkersToMap()
}

const refreshActivations = async () => {
  await loadActivations()
}

const fitAllActivations = () => {
  adjustMapBounds()
}

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// Handle message from info window
const handleMessage = (event) => {
  if (event.data.type === 'view-activation') {
    router.push(`/activations/${event.data.id}`)
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await nextTick()
    
    // Ensure the map container is available
    if (!mapContainer.value) {
      console.error('Map container not found during mount')
      return
    }
    
    await initializeMap()
    
    // Listen for messages from info windows
    window.addEventListener('message', handleMessage)
  } catch (error) {
    console.error('Error during map initialization:', error)
    error.value = 'Failed to initialize map'
  }
})

onUnmounted(() => {
  try {
    clearMarkers()
    window.removeEventListener('message', handleMessage)
    
    // Clean up map instance
    if (map.value) {
      map.value = null
    }
  } catch (error) {
    console.error('Error during component cleanup:', error)
  }
})

// Watch for prop changes
watch(() => props.center, (newCenter) => {
  if (map.value) {
    map.value.setCenter(newCenter)
  }
})

watch(() => props.zoom, (newZoom) => {
  if (map.value) {
    map.value.setZoom(newZoom)
  }
})

// Watch for loading state changes to ensure map stays visible
watch(loading, (isLoading) => {
  if (!isLoading && mapContainer.value) {
    nextTick(() => {
      if (mapContainer.value) {
        mapContainer.value.style.display = 'block'
        mapContainer.value.style.visibility = 'visible'
        
        // Trigger resize if map exists
        if (map.value) {
          setTimeout(() => {
            google.maps.event.trigger(map.value, 'resize')
          }, 100)
        }
      }
    })
  }
})
</script>

<style scoped>
.activation-map-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.map-container {
  width: 100%;
  position: relative;
  background-color: #f3f4f6;
  display: block;
  visibility: visible;
}

.map-loading, .map-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
}

.map-loading p {
  margin-top: 16px;
  color: #6b7280;
  font-size: 14px;
}

.map-controls {
  background: white;
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-dropdown {
  min-width: 180px;
}

.legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.legend-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #ffffff;
}

@media (max-width: 768px) {
  .map-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group {
    justify-content: center;
  }
  
  .legend {
    justify-content: center;
  }
  
  .filter-dropdown {
    min-width: auto;
    width: 100%;
  }
}

/* Global styles for info windows */
:global(.gm-style-iw) {
  padding: 0 !important;
}

:global(.gm-style-iw-d) {
  overflow: hidden !important;
}
</style>
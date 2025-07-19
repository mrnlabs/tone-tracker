<template>
  <div class="leaflet-map-container">
    <!-- Debug info -->
    <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 5px; z-index: 1000; font-size: 12px;">
      Loading: {{ loading }} | Error: {{ !!error }}
    </div>
    
    <div ref="mapContainer" class="map-container" :style="{ height: mapHeight }">
      <div v-if="loading" class="map-loading">
        <ProgressSpinner size="large" />
        <p>Loading map...</p>
      </div>
      <div v-if="error && !loading" class="map-error">
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
import L from 'leaflet'

// Fix for default markers in Leaflet with Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const props = defineProps({
  height: {
    type: String,
    default: '500px'
  },
  center: {
    type: Object,
    default: () => ({ lat: -17.8292, lng: 31.0522 }) // Harare, Zimbabwe
  },
  zoom: {
    type: Number,
    default: 7
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

// Watch loading state changes
watch(loading, (newValue, oldValue) => {
  console.log(`🔄 Loading state changed: ${oldValue} -> ${newValue}`)
})

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

// Methods
const initializeMap = async () => {
  try {
    loading.value = true
    error.value = null
    console.log('🚀 Starting map initialization...')

    // Wait for container to be available
    let retries = 0
    while (!mapContainer.value && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      retries++
    }

    if (!mapContainer.value) {
      throw new Error('Map container not found after waiting')
    }

    console.log('📍 Map container found:', mapContainer.value)
    console.log('📍 Container dimensions:', mapContainer.value.offsetWidth, 'x', mapContainer.value.offsetHeight)

    // Ensure container has dimensions before creating map
    if (mapContainer.value.offsetWidth === 0 || mapContainer.value.offsetHeight === 0) {
      console.warn('⚠️ Container has no dimensions, waiting for layout...')
      await new Promise(resolve => setTimeout(resolve, 200))
      console.log('📍 Container dimensions after wait:', mapContainer.value.offsetWidth, 'x', mapContainer.value.offsetHeight)
    }

    // Create Leaflet map with preferCanvas to avoid some rendering issues
    map.value = L.map(mapContainer.value, {
      center: [props.center.lat, props.center.lng],
      zoom: props.zoom,
      zoomControl: true,
      attributionControl: true,
      preferCanvas: false, // Use SVG renderer which is more stable
      zoomAnimation: false // Disable zoom animation to prevent errors
    })

    console.log('🗺️ Leaflet map created successfully')

    // Add OpenStreetMap tiles
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    })

    // Add tiles immediately
    tileLayer.addTo(map.value)
    console.log('🎯 Tiles added to map')

    // Set loading to false immediately after map is created
    console.log('🎯 About to hide loading spinner...')
    loading.value = false
    
    // Force reactivity update
    await nextTick()
    console.log('🎯 Loading spinner should be hidden now, loading state:', loading.value)

    // Force map resize to ensure proper rendering
    setTimeout(() => {
      if (map.value) {
        try {
          map.value.invalidateSize()
          console.log('🔄 Map size invalidated/refreshed')
        } catch (err) {
          console.warn('⚠️ Error invalidating map size:', err)
        }
      }
    }, 300)

    console.log('📊 Loading activations data...')
    
    // Load activations data (async, don't block map display)
    loadActivations().then(() => {
      console.log('✅ Activations loaded successfully')
    }).catch(err => {
      console.warn('⚠️ Activations failed to load, using fallback data:', err)
    })
    
    emit('map-ready', map.value)
    console.log('✅ Map initialization complete!')
    
  } catch (err) {
    console.error('❌ Error initializing map:', err)
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
      size: 100
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
    addMarkersToMap()
    
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
    addMarkersToMap()
    
    error.value = 'Using demo data - API connection failed'
    refreshing.value = false
  }
}

const addMarkersToMap = () => {
  if (!map.value) return

  try {
    filteredActivations.value.forEach(activation => {
      // Skip if no location data
      if (!activation.latitude || !activation.longitude) {
        console.warn(`Activation ${activation.id} has no location data`)
        return
      }

      const position = [parseFloat(activation.latitude), parseFloat(activation.longitude)]

      // Get status color
      const statusInfo = activationStatuses.value.find(s => s.value === activation.status)
      const markerColor = statusInfo ? statusInfo.color : '#6b7280'

      // Create custom colored icon
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background-color: ${markerColor};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })

      // Create marker
      const marker = L.marker(position, { icon: customIcon }).addTo(map.value)

      // Create popup content
      const popupContent = createPopupContent(activation)
      
      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'activation-popup'
      })

      // Add click listener
      marker.on('click', () => {
        emit('activation-selected', activation)
      })

      // Store marker
      markers.value.push({
        marker,
        activation
      })
    })

    // Adjust map bounds to show all markers (with delay to ensure markers are rendered)
    if (markers.value.length > 0) {
      setTimeout(() => {
        fitAllActivations()
      }, 500)
    }
  } catch (error) {
    console.error('Error adding markers to map:', error)
    error.value = 'Failed to load map markers'
  }
}

const createPopupContent = (activation) => {
  const statusInfo = activationStatuses.value.find(s => s.value === activation.status)
  const statusBadge = statusInfo 
    ? `<span style="background-color: ${statusInfo.color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${statusInfo.label}</span>`
    : ''

  return `
    <div style="max-width: 280px; font-family: Arial, sans-serif;">
      <div style="border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 8px;">
        <h3 style="margin: 0 0 4px 0; font-size: 16px; color: #333;">${activation.name}</h3>
        ${statusBadge}
      </div>
      
      <div style="margin-bottom: 8px; font-size: 14px;">
        <strong>Client:</strong> ${activation.clientName || 'N/A'}<br>
        <strong>Location:</strong> ${activation.location || 'N/A'}<br>
        <strong>Start Date:</strong> ${formatDate(activation.startDate)}<br>
        <strong>End Date:</strong> ${formatDate(activation.endDate)}
      </div>
      
      ${activation.briefDescription ? `
        <div style="margin-bottom: 8px;">
          <strong>Description:</strong><br>
          <span style="color: #666; font-size: 13px;">${truncateText(activation.briefDescription, 100)}</span>
        </div>
      ` : ''}
      
      <div style="text-align: center; margin-top: 12px;">
        <button 
          onclick="window.open('/activations/${activation.id}', '_self')" 
          style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 14px;"
        >
          View Details
        </button>
      </div>
    </div>
  `
}

const clearMarkers = () => {
  markers.value.forEach(({ marker }) => {
    if (map.value) {
      map.value.removeLayer(marker)
    }
  })
  markers.value = []
}

const fitAllActivations = () => {
  if (!map.value) {
    console.warn('⚠️ Map not ready for fitAllActivations')
    return
  }

  try {
    if (markers.value.length === 0) {
      // If no markers, center on Zimbabwe with default zoom
      map.value.setView([props.center.lat, props.center.lng], props.zoom)
      return
    }

    if (markers.value.length === 1) {
      // If only one marker, center on it with good zoom level
      const { marker } = markers.value[0]
      if (marker && marker.getLatLng) {
        map.value.setView(marker.getLatLng(), 10)
      }
      return
    }

    // Multiple markers - fit bounds
    const validMarkers = markers.value.filter(m => m.marker && m.marker.getLatLng)
    if (validMarkers.length > 0) {
      const group = new L.featureGroup(validMarkers.map(m => m.marker))
      map.value.fitBounds(group.getBounds().pad(0.1))
    }
  } catch (err) {
    console.warn('⚠️ Error in fitAllActivations:', err)
  }
}

const filterActivations = () => {
  if (selectedFilter.value === 'all') {
    filteredActivations.value = [...activations.value]
  } else {
    filteredActivations.value = activations.value.filter(
      activation => activation.status === selectedFilter.value
    )
  }
  
  // Clear existing markers and add filtered ones
  clearMarkers()
  addMarkersToMap()
}

const refreshActivations = async () => {
  await loadActivations()
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
  } catch (error) {
    console.error('Error during map initialization:', error)
    error.value = 'Failed to initialize map'
  }
})

onUnmounted(() => {
  try {
    clearMarkers()
    
    // Clean up map instance
    if (map.value) {
      map.value.remove()
      map.value = null
    }
  } catch (error) {
    console.error('Error during component cleanup:', error)
  }
})

// Watch for prop changes
watch(() => props.center, (newCenter) => {
  if (map.value) {
    map.value.setView([newCenter.lat, newCenter.lng])
  }
})

watch(() => props.zoom, (newZoom) => {
  if (map.value) {
    map.value.setZoom(newZoom)
  }
})
</script>

<style scoped>
.leaflet-map-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.map-container {
  width: 100%;
  min-height: 600px;
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

/* Custom popup styling */
:global(.activation-popup .leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

:global(.activation-popup .leaflet-popup-content) {
  margin: 12px;
}

:global(.custom-marker) {
  background: transparent !important;
  border: none !important;
}
</style>
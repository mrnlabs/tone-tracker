// src/composables/useResponsive.js
import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useResponsive() {
    const windowWidth = ref(window.innerWidth)
    const windowHeight = ref(window.innerHeight)

    const updateDimensions = () => {
        windowWidth.value = window.innerWidth
        windowHeight.value = window.innerHeight
    }

    onMounted(() => {
        window.addEventListener('resize', updateDimensions)
    })

    onUnmounted(() => {
        window.removeEventListener('resize', updateDimensions)
    })

    const isMobile = computed(() => windowWidth.value < 768)
    const isTablet = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024)
    const isDesktop = computed(() => windowWidth.value >= 1024)
    const isSmallScreen = computed(() => windowWidth.value < 640)

    return {
        windowWidth,
        windowHeight,
        isMobile,
        isTablet,
        isDesktop,
        isSmallScreen
    }
}

// src/composables/useSidebar.js
import { ref, computed } from 'vue'

const isOpen = ref(false)
const expandedMenus = ref({})

export function useSidebar() {
    const toggleSidebar = () => {
        isOpen.value = !isOpen.value
    }

    const openSidebar = () => {
        isOpen.value = true
    }

    const closeSidebar = () => {
        isOpen.value = false
    }

    const toggleMenu = (menuId) => {
        expandedMenus.value[menuId] = !expandedMenus.value[menuId]
    }

    const isMenuExpanded = (menuId) => {
        return expandedMenus.value[menuId] || false
    }

    const collapseAllMenus = () => {
        expandedMenus.value = {}
    }

    return {
        isOpen: computed(() => isOpen.value),
        expandedMenus: computed(() => expandedMenus.value),
        toggleSidebar,
        openSidebar,
        closeSidebar,
        toggleMenu,
        isMenuExpanded,
        collapseAllMenus
    }
}

// src/composables/useAuth.js (if you don't have it in stores)
import { computed } from 'vue'
import { useAuth as useAuthStore } from '@/stores/auth'

export function useAuth() {
    const authStore = useAuthStore()

    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const user = computed(() => authStore.user)
    const userRole = computed(() => authStore.userRole)
    const loading = computed(() => authStore.loading)

    const hasRole = (roles) => {
        if (!roles || roles.length === 0) return true
        return roles.includes(userRole.value)
    }

    const hasAnyRole = (roles) => {
        return authStore.hasAnyRole(roles)
    }

    const login = async (credentials) => {
        return await authStore.login(credentials)
    }

    const logout = async () => {
        return await authStore.logout()
    }

    return {
        isAuthenticated,
        user,
        userRole,
        loading,
        hasRole,
        hasAnyRole,
        login,
        logout
    }
}
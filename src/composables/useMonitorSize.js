import { onMounted, onUnmounted, reactive, toRefs } from "vue";

/**
 * Author: Mazisi Msebele
 * Date: 26 Jun 2024
 * 
 */

  /**
 * Returns an object with reactive properties for the browser width, device width, and mobile status.
 * The function adds an event listener to the window's resize event to update these properties whenever the window is resized.
 * The function also removes the event listener when the component is unmounted.
 *
 * @return {Object} An object with reactive properties for the browser width, device width, and mobile status.
 */
export function useMonitorSize() {
    const sizes = reactive({
        browserWidth: window.innerWidth,
        deviceWidth: screen.width,
        isMobile: false
    })

    
    const browserResized = () => {
        sizes.browserWidth = window.innerWidth
        sizes.deviceWidth = screen.width
        sizes.isMobile = isMobile()
    }

    const isMobile = () => {
        return window.innerWidth <= 600 ? true : false
    }

    onMounted(() => {
        window.addEventListener('resize', browserResized)
    })

    onUnmounted(() => {
        window.removeEventListener('resize', browserResized)
    })

    return {
        ...toRefs(sizes)
    }
}
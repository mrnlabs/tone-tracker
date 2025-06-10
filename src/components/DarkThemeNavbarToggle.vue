// DarkThemeNavbarToggle.vue
<template>
  <button
    class="navbar-toggler d-lg-none dark-toggler"
    type="button"
    @click="toggleSideNav"
    aria-controls="navbarSupportedContent"
    aria-expanded="false"
    aria-label="Toggle navigation"
  >
    <span class="navbar-toggler-icon"></span>
  </button>
</template>

<script setup>
import { useNavStore } from '@/stores/ToggleNav';

    const navStore = useNavStore();

      const toggleSideNav = () => {
        navStore.setIsNavVisible();  // Toggle the navigation visibility
      };























</script>

<style scoped>
.navbar-toggler.dark-toggler {
  border-color: rgba(255, 255, 255, 0.1);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.navbar-toggler.dark-toggler .navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255, 255, 255, 0.8)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}

.navbar-toggler.dark-toggler:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
}

.navbar-toggler.dark-toggler:focus .navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255, 255, 255, 0.8)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}
</style>
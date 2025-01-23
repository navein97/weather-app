<script setup lang="ts">
import { onMounted } from 'vue'
import { useLocationStore } from './store/locations'
import { useUserPreferencesStore } from './store/userPreferences'
import { RouterView } from 'vue-router'

const locationsStore = useLocationStore()
const preferencesStore = useUserPreferencesStore()

onMounted(() => {
  locationsStore.loadSavedLocations()
  preferencesStore.loadPreferences()
})
</script>

<template>
    <router-view></router-view>
</template>

<style>
/* Base styles for consistent page width */
body, html {
  margin: 0;
  padding: 0;
  width: 100%;
}

#app {
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
}
</style>

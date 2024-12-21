<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { weatherApi } from '../utils/weatherApi'
import { useLocationStore } from '../store/locations'

const router = useRouter()
const locationStore = useLocationStore()
const searchQuery = ref('')
const loading = ref(false)
const error = ref('')
const currentLocationWeather = ref(null)
const savedLocationsWeather = ref([])
const searchSuggestions = ref([])
const showSuggestions = ref(false)

const handleSearch = async () => {
  if (searchQuery.value.length < 2) {
    searchSuggestions.value = []
    showSuggestions.value = false
    return
  }

  try {
    const response = await weatherApi.searchCities(searchQuery.value)
    searchSuggestions.value = response
    showSuggestions.value = true
  } catch (error) {
    console.error('Search error:', error)
    searchSuggestions.value = []
  }
}

const selectCity = async (city) => {
  try {
    // Clear search state
    searchQuery.value = ''
    showSuggestions.value = false

    // Navigate to weather detail page
    router.push({
      name: 'weatherDetail',
      params: { cityName: city.name },
    })
  } catch (error) {
    console.error('Error selecting city:', error)
  }
}

const navigateToWeatherDetail = (cityName: string) => {
  router.push({
    name: 'weatherDetail',
    params: { cityName: cityName },
  })
}

// Close search results when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const searchContainer = document.querySelector('.search-container')
  if (searchContainer && !searchContainer.contains(event.target as Node)) {
    showSearchResults.value = false
  }
}

const getWeatherIcon = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'rain':
    case 'drizzle':
      return '/src/assets/images/rain.png'
    case 'clear':
      return '/src/assets/images/sun.png'
    default:
      return '/src/assets/images/sun.png'
  }
}

const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation is not supported')
    }
    navigator.geolocation.getCurrentPosition(resolve, reject)
  })
}

const loadCurrentLocationWeather = async () => {
  try {
    loading.value = true
    const position = await getCurrentLocation()
    const weather = await weatherApi.getWeatherByCoords(
      position.coords.latitude,
      position.coords.longitude,
    )
    currentLocationWeather.value = weather
  } catch (err) {
    error.value = 'Unable to fetch weather data'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const loadSavedLocationsWeather = async () => {
  try {
    const weatherPromises = locationStore.savedLocations.map((city) =>
      weatherApi.getWeatherByCity(city),
    )
    savedLocationsWeather.value = await Promise.all(weatherPromises)
  } catch (err) {
    console.error('Error loading saved locations:', err)
  }
}

const navigateToProfile = () => {
  router.push('/profile')
}

const formatLocation = (suggestion) => {
  if (suggestion.sys.country === 'US') {
    return `${suggestion.state || ''} United States`
  }
  return suggestion.sys.country
}

const clearSearch = () => {
  searchQuery.value = ''
  showSuggestions.value = false
  searchSuggestions.value = []
}

onMounted(() => {
  locationStore.loadSavedLocations()
  loadCurrentLocationWeather()
  loadSavedLocationsWeather()
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="home">
    <header class="header">
      <h1 v-if="!showSuggestions">Weather</h1>
      <img
        v-if="!showSuggestions"
        :src="'/src/assets/images/profile-icon.svg'"
        alt="Profile"
        class="profile-icon"
        @click="navigateToProfile"
      />
    </header>

    <div class="search-container">
      <div class="search-wrapper">
        <img :src="'/src/assets/icons/search-icon.svg'" alt="Search" class="search-icon" />
        <input
          type="text"
          placeholder="Search for a city or airport"
          v-model="searchQuery"
          @input="handleSearch"
        />
        <button v-if="searchQuery" class="clear-button" @click="clearSearch">✕</button>
      </div>

      <div v-if="showSuggestions && searchSuggestions.length > 0" class="search-suggestions">
        <div
          v-for="suggestion in searchSuggestions"
          :key="suggestion.id"
          class="suggestion-item"
          @click="selectCity(suggestion)"
        >
          <div class="suggestion-name">{{ suggestion.name }}</div>
          <div class="suggestion-location">{{ formatLocation(suggestion) }}</div>
        </div>
      </div>
    </div>

    <div class="weather-list" v-if="!showSuggestions">
      <!-- My Location Weather -->
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <template v-else>
        <div
          class="weather-card my-location"
          v-if="currentLocationWeather"
          @click="navigateToWeatherDetail(currentLocationWeather.name)"
        >
          <div class="location-info">
            <h2>My Location</h2>
            <p>{{ currentLocationWeather.name }}</p>
          </div>
          <div class="weather-info">
            <div class="left-info">
              <span class="temperature">{{ Math.round(currentLocationWeather.main.temp) }}°</span>
              <span class="condition">{{ currentLocationWeather.weather[0].main }}</span>
            </div>
            <img
              :src="getWeatherIcon(currentLocationWeather.weather[0].main)"
              alt="Weather"
              class="weather-icon"
            />
          </div>
          <div class="temp-range">
            <span
              >H:{{ Math.round(currentLocationWeather.main.temp_max) }}° L:{{
                Math.round(currentLocationWeather.main.temp_min)
              }}°</span
            >
          </div>
        </div>

        <!-- Saved Locations Weather -->
        <div
          v-for="weather in savedLocationsWeather"
          :key="weather.name"
          class="weather-card"
          @click="navigateToWeatherDetail(weather.name)"
        >
          <div class="location-info">
            <h2>{{ weather.name }}</h2>
            <p>
              {{ new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }}
            </p>
          </div>
          <div class="weather-info">
            <div class="left-info">
              <span class="temperature">{{ Math.round(weather.main.temp) }}°</span>
              <span class="condition">{{ weather.weather[0].main }}</span>
            </div>
            <img
              :src="getWeatherIcon(weather.weather[0].main)"
              alt="Weather"
              class="weather-icon"
            />
          </div>
          <div class="temp-range">
            <span
              >H:{{ Math.round(weather.main.temp_max) }}° L:{{
                Math.round(weather.main.temp_min)
              }}°</span
            >
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-size: 32px;
  font-weight: 700;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #000000;
  margin: 0;
}

.search-container {
  position: relative;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 8px 16px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
}

.search-container input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  padding: 8px 0;
  outline: none;
}

.clear-button {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px 8px;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  margin-top: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.suggestion-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-name {
  font-size: 16px;
  color: #333;
}

.suggestion-location {
  font-size: 14px;
  color: #666;
  margin-top: 2px;
}

.home {
  padding: 16px;
  background: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  color: #666;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.profile-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.weather-card {
  background-image: url('/src/assets/images/day.png');
  background-size: cover;
  background-position: center;
  color: white;
  padding: 20px;
  border-radius: 24px;
  margin-bottom: 16px;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.weather-info-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.left-side {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.location-name {
  font-size: 24px;
  font-weight: 500;
}

.time {
  font-size: 14px;
  opacity: 0.9;
}

.condition {
  font-size: 16px;
  margin-top: 8px;
}

.right-side .temperature {
  font-size: 48px;
  font-weight: 400;
}

.high-low {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 8px;
}

.location-info h2 {
  margin: 0;
  font-size: 18px;
}

.location-info p {
  margin: 4px 0;
  opacity: 0.8;
}

.weather-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
}

.temperature {
  font-size: 32px;
  font-weight: bold;
  display: block;
}

.condition {
  font-size: 14px;
  opacity: 0.8;
}

.weather-icon {
  width: 100px; /* Increased from 40px */
  height: 100px; /* Make it same as width for perfect circle */
  border-radius: 50%;
  object-fit: cover; /* Ensures the image maintains proportions */
}

.temp-range {
  font-size: 14px;
  opacity: 0.8;
}

.loading {
  text-align: center;
  padding: 20px;
}

.error {
  color: red;
  text-align: center;
  padding: 20px;
}
</style>

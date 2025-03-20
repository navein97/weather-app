<template>
  <div class="weather-detail">
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">Loading weather data...</div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <NotificationToast
      :show="showNotification"
      :message="notificationMessage"
      :type="notificationType"
      @close="showNotification = false"
    />

    <!-- Header -->
    <header class="header">
      <div class="back-button" @click="goBack">
        <img src="/src/assets/icons/back-icon.svg" alt="Back" />
      </div>
      <h1>{{ cityName }}</h1>
      <button class="action-button" @click="handleActionButton" :disabled="loading">
        <svg
          v-if="isLocationSaved"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
            fill="currentColor"
          />
        </svg>
        <svg
          v-else
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
        </svg>
      </button>
    </header>

    <!-- Current Weather Section -->
    <div class="current-weather">
      <div class="date">{{ currentDate }}</div>
      <div class="weather-icon">
        <img :src="getWeatherIcon(currentWeather?.weather[0].main)" alt="Weather" />
      </div>
      <div class="temperature">{{ Math.round(currentWeather?.main.temp || 0) }}°C</div>
      <div class="condition">{{ currentWeather?.weather[0].main }}</div>
      <div class="last-updated">Last Update {{ lastUpdateTime }}</div>
    </div>

    <!-- Hourly Forecast -->
    <section class="forecast-section">
      <h2>Hourly Forecast</h2>
      <div class="hourly-forecast">
        <div v-for="hour in hourlyForecast" :key="hour.dt" class="forecast-item">
          <div class="time">{{ formatTime(hour.dt) }}</div>
          <img :src="getWeatherIcon(hour.weather[0].main)" alt="Weather" class="small-icon" />
          <div class="temp">{{ Math.round(hour.temp) }}°</div>
        </div>
      </div>
    </section>

    <!-- Weekly Forecast -->
    <section class="forecast-section">
      <h2>Weekly Forecast</h2>
      <div class="weekly-forecast">
        <div v-for="day in weeklyForecast" :key="day.dt" class="forecast-item">
          <div class="day">{{ formatDay(day.dt) }}</div>
          <img :src="getWeatherIcon(day.weather[0].main)" alt="Weather" class="small-icon" />
          <div class="temp">{{ Math.round(day.temp.day) }}°</div>
          <div class="condition">{{ day.weather[0].main }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import { weatherApi } from '../utils/weatherApi'
import { useLocationStore } from '../store/locations'
import NotificationToast from '../components/atoms/NotificationToast.vue'

interface CurrentWeather {
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  main: {
    temp: number
    temp_min: number
    temp_max: number
    humidity: number
  }
  name: string
  sys: {
    country: string
  }
}

const route = useRoute()
const router = useRouter()
const locationStore = useLocationStore()
const cityName = ref('')
const currentWeather = ref<CurrentWeather | null>(null)
const hourlyForecast = ref([])
const weeklyForecast = ref([])
const lastUpdateTime = ref('')
const loading = ref(true)
const error = ref('')
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref<'success' | 'error'>('success')
const currentDate = format(new Date(), 'EEEE, dd MMMM yyyy')

const formatHourlyTemp = (forecast) => {
  return {
    dt: forecast.dt,
    temp: forecast.main.temp,
    weather: forecast.weather,
  }
}

const loadWeatherData = async () => {
  try {
    loading.value = true
    const cityParam = route.params.cityName as string
    cityName.value = cityParam

    const weatherData = await weatherApi.getDetailedWeather(cityParam)

    currentWeather.value = weatherData.current
    hourlyForecast.value = weatherData.hourly.map(formatHourlyTemp)
    weeklyForecast.value = weatherData.daily

    lastUpdateTime.value = format(new Date(), 'HH:mm')
  } catch (err) {
    error.value = 'Failed to load weather data'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

const getWeatherIcon = (condition: string) => {
  if (!condition) return '/src/assets/images/sun.png'

  switch (condition.toLowerCase()) {
    case 'rain':
    case 'drizzle':
      return '/images/rain.png'
    case 'clear':
      return '/images/sun.png'
    case 'clouds':
      return '/images/sun.png'
    default:
      return '/images/sun.png'
  }
}

const formatTime = (timestamp: number) => {
  return format(new Date(timestamp * 1000), 'h:mm a')
}

const formatDay = (timestamp: number) => {
  return format(new Date(timestamp * 1000), 'EEEE')
}

const goBack = () => {
  router.go(-1)
}

const isLocationSaved = computed(() => {
  return locationStore.isLocationSaved(cityName.value)
})

const handleActionButton = async () => {
  try {
    loading.value = true
    if (isLocationSaved.value) {
      await locationStore.removeLocation(cityName.value)
      notificationMessage.value = `${cityName.value} removed from saved locations`
      notificationType.value = 'success'
    } else {
      await locationStore.addLocation(cityName.value)
      notificationMessage.value = `${cityName.value} added to saved locations`
      notificationType.value = 'success'
    }
    showNotification.value = true
  } catch (error) {
    console.error('Action failed:', error)
    notificationMessage.value = 'Failed to update saved locations'
    notificationType.value = 'error'
    showNotification.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadWeatherData()
})
</script>

<style scoped>
.loading-state,
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  text-align: center;
  padding: 20px;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-state {
  color: #ef4444;
}

.weather-detail {
  padding: 16px;
  min-height: 100vh;
  background: linear-gradient(to bottom, #1e3a8a, #60a5fa);
  color: white;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.back-button img {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.action-button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
}

.action-button img {
  width: 24px;
  height: 24px;
}

.current-weather {
  text-align: center;
  margin: 32px 0;
}

.weather-icon img {
  width: 64px;
  height: 64px;
  margin: 16px 0;
}

.temperature {
  font-size: 48px;
  font-weight: bold;
  margin: 16px 0;
}

.condition {
  font-size: 24px;
  margin-bottom: 8px;
}

.last-updated {
  font-size: 14px;
  opacity: 0.8;
}

.forecast-section {
  margin: 32px 0;
}

.forecast-section h2 {
  margin-bottom: 16px;
}

.hourly-forecast,
.weekly-forecast {
  display: flex;
  overflow-x: auto;
  gap: 16px;
  padding: 8px 0;
}

.forecast-item {
  text-align: center;
  min-width: 80px;
}

.small-icon {
  width: 32px;
  height: 32px;
  margin: 8px 0;
}

.time,
.day {
  font-size: 14px;
  margin-bottom: 4px;
}
</style>

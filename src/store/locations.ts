import { ref } from 'vue'
import { defineStore } from 'pinia'
import { weatherApi } from '../utils/weatherApi'
import { handleError, type ErrorResponse } from '../utils/errorHandler'

export const useLocationStore = defineStore('locations', () => {
  const savedLocations = ref<string[]>([])
  const loading = ref(false)
  const error = ref<ErrorResponse | null>(null)

  const loadSavedLocations = () => {
    try {
      const stored = localStorage.getItem('savedLocations')
      if (stored) {
        savedLocations.value = JSON.parse(stored)
      }
    } catch (err) {
      error.value = handleError(err)
    }
  }

  const addLocation = async (cityName: string) => {
    try {
      loading.value = true
      await weatherApi.getWeatherByCity(cityName)

      if (!savedLocations.value.includes(cityName)) {
        savedLocations.value.push(cityName)
        localStorage.setItem('savedLocations', JSON.stringify(savedLocations.value))
      }
      error.value = null
    } catch (err) {
      error.value = handleError(err)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const removeLocation = (cityName: string) => {
    try {
      savedLocations.value = savedLocations.value.filter(city => city !== cityName)
      localStorage.setItem('savedLocations', JSON.stringify(savedLocations.value))
      error.value = null
    } catch (err) {
      error.value = handleError(err)
      throw error.value
    }
  }

  const isLocationSaved = (cityName: string) => {
    return savedLocations.value.includes(cityName)
  }

  return {
    savedLocations,
    loading,
    error,
    loadSavedLocations,
    addLocation,
    removeLocation,
    isLocationSaved
  }
})

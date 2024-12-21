import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserPreferencesStore = defineStore('userPreferences', () => {
  const preferences = ref({
    userName: '',
    email: '',
    phone: '',
    temperatureUnit: 'celsius', // or 'fahrenheit'
  })

  // Load preferences from localStorage
  const loadPreferences = () => {
    const stored = localStorage.getItem('userPreferences')
    if (stored) {
      preferences.value = JSON.parse(stored)
    }
  }

  // Save preferences to localStorage
  const savePreferences = (newPreferences: typeof preferences.value) => {
    preferences.value = newPreferences
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences))
  }

  return {
    preferences,
    loadPreferences,
    savePreferences
  }
})

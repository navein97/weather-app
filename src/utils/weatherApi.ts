const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'

interface WeatherData {
  name: string
  main: {
    temp: number
    temp_max: number
    temp_min: number
  }
  weather: Array<{
    main: string
    description: string
  }>
  coord: {
    lat: number
    lon: number
  }
}

interface ForecastData {
  list: Array<{
    dt: number
    main: {
      temp: number
      temp_max: number
      temp_min: number
    }
    weather: Array<{
      main: string
      description: string
    }>
  }>
}

interface SearchResult {
  id: number
  name: string
  sys: {
    country: string
  }
  main: {
    temp: number
  }
  weather: Array<{
    main: string
    description: string
  }>
}

interface SearchResponse {
  list: SearchResult[]
  count: number
}

export const weatherApi = {
  async getWeatherByCity(city: string): Promise<WeatherData> {
    try {
      const response = await fetch(`${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`)
      if (!response.ok) {
        throw new Error('Weather data not found')
      }
      return response.json()
    } catch (error) {
      console.error('Error fetching weather:', error)
      throw error
    }
  },

  async getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`,
      )
      if (!response.ok) {
        throw new Error('Weather data not found')
      }
      return response.json()
    } catch (error) {
      console.error('Error fetching weather:', error)
      throw error
    }
  },

  async searchCities(query: string): Promise<SearchResult[]> {
    try {
      // Only search if query is at least 3 characters
      if (query.length < 3) {
        return []
      }

      const response = await fetch(
        `${BASE_URL}/find?q=${query}&type=like&units=metric&appid=${API_KEY}`
      )

      const data = await response.json()

      // Handle various API response cases
      if (data.cod === '400' || data.cod === '404') {
        return []
      }

      return data.list || []
    } catch (error) {
      console.error('Error searching cities:', error)
      return []
    }
  },

  async getDetailedWeather(city: string) {
    try {
      // Get current weather
      const currentResponse = await fetch(
        `${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`,
      )

      if (!currentResponse.ok) {
        throw new Error('City not found')
      }

      const currentWeather: WeatherData = await currentResponse.json()

      // Get 5 day forecast
      const forecastResponse = await fetch(
        `${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`,
      )

      if (!forecastResponse.ok) {
        throw new Error('Failed to fetch forecast')
      }

      const forecastData: ForecastData = await forecastResponse.json()

      // Process forecast data
      const hourlyForecast = forecastData.list.slice(0, 8) // Next 24 hours (3-hour steps)

      // Group forecast by day
      const dailyForecast = this.processDailyForecast(forecastData.list)

      return {
        current: currentWeather,
        hourly: hourlyForecast,
        daily: dailyForecast,
      }
    } catch (error) {
      console.error('Error fetching detailed weather:', error)
      throw error
    }
  },

  processDailyForecast(forecastList: ForecastData['list']) {
    const dailyMap = new Map()

    forecastList.forEach((item) => {
      const date = new Date(item.dt * 1000).toDateString()

      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          dt: item.dt,
          temp: {
            day: item.main.temp,
            min: item.main.temp_min,
            max: item.main.temp_max,
          },
          weather: item.weather,
        })
      } else {
        const existing = dailyMap.get(date)
        existing.temp.min = Math.min(existing.temp.min, item.main.temp_min)
        existing.temp.max = Math.max(existing.temp.max, item.main.temp_max)
      }
    })

    return Array.from(dailyMap.values())
  },
}

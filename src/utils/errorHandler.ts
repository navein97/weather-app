// In src/utils/errorHandler.ts
interface ErrorResponse {
  message: string
  type: 'error' | 'warning'
  duration?: number
}

const handleError = (error: any): ErrorResponse => {
  // API specific errors
  if (error.response) {
    switch (error.response.status) {
      case 404:
        return {
          message: 'City not found',
          type: 'error'
        }
      case 401:
        return {
          message: 'API key invalid',
          type: 'error'
        }
      default:
        return {
          message: 'Something went wrong',
          type: 'error'
        }
    }
  }

  // Network errors
  if (error.message === 'Network Error') {
    return {
      message: 'Please check your internet connection',
      type: 'warning'
    }
  }

  // Default error
  return {
    message: 'An unexpected error occurred',
    type: 'error'
  }
}

export { type ErrorResponse, handleError }

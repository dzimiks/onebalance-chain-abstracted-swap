/**
 * Simple error handling utilities for OneBalance API responses
 */

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp?: string;
  path?: string;
}

export interface ProcessedError {
  title: string;
  message: string;
  retryable: boolean;
}

/**
 * Process API errors to provide user-friendly messages
 */
export function processApiError(error: any): ProcessedError {
  // Handle Axios error format
  if (error.response?.data) {
    return categorizeApiError(error.response.data);
  }

  // Handle direct API error format
  if (error.error && error.message && error.statusCode) {
    return categorizeApiError(error as ApiError);
  }

  // Handle generic Error instances
  if (error instanceof Error) {
    return {
      title: 'Error',
      message: error.message,
      retryable: true,
    };
  }

  // Fallback
  return {
    title: 'Error',
    message: 'An unexpected error occurred. Please try again.',
    retryable: true,
  };
}

/**
 * Categorize API errors based on common patterns
 */
function categorizeApiError(apiError: ApiError): ProcessedError {
  const { message, statusCode } = apiError;
  const lowerMessage = message.toLowerCase();

  // Unsupported swap routes
  if (
    lowerMessage.includes('no suitable destination asset types found') ||
    lowerMessage.includes('unsupported route') ||
    lowerMessage.includes('no route found')
  ) {
    return {
      title: 'Swap Not Available',
      message: 'This token pair is not currently supported. Try a different pair.',
      retryable: false,
    };
  }

  // Insufficient balance
  if (
    lowerMessage.includes('insufficient balance') ||
    lowerMessage.includes('insufficient funds')
  ) {
    return {
      title: 'Insufficient Balance',
      message: 'Not enough balance to complete this transaction.',
      retryable: false,
    };
  }

  // Server errors
  if (statusCode >= 500) {
    return {
      title: 'Service Unavailable',
      message: 'Service is temporarily unavailable. Please try again.',
      retryable: true,
    };
  }

  // Client errors
  if (statusCode >= 400) {
    return {
      title: 'Request Error',
      message: message || 'Please check your input and try again.',
      retryable: false,
    };
  }

  // Default
  return {
    title: 'Error',
    message: message || 'An error occurred. Please try again.',
    retryable: true,
  };
}

/**
 * Format error for display in UI components
 */
export function formatErrorForDisplay(error: ProcessedError): {
  title: string;
  message: string;
  variant: 'destructive' | 'default';
} {
  return {
    title: error.title,
    message: error.message,
    variant: error.retryable ? 'destructive' : 'default',
  };
}

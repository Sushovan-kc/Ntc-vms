import axios from 'axios';

/**
 * Extracts, unpacks, and structures clean strings from complex 
 * Django REST Framework (DRF) response objects.
 */
export const parseBackendError = (error) => {
  // Scenario 1: DRF server returned a structural HTTP error code status
  if (error.response) {
    const status = error.response.status;
    const backendData = error.response.data;

    // Handle structural DRF errors (dictionaries or strings)
    if (backendData && typeof backendData === 'object' && !Array.isArray(backendData)) {
      
      // If DRF sends a simple explicit global description string
      if (backendData.detail && typeof backendData.detail === 'string') {
        return backendData.detail;
      }
      
      // Extract, map, and flatten multi-field validator structures
      const errorEntries = Object.entries(backendData).map(([fieldName, messages]) => {
        // Clean up internal tags (e.g., 'non_field_errors' looks better as 'Error')
        const friendlyName = fieldName === 'non_field_errors' 
          ? 'Error' 
          : fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace('_', ' ');
          
        const messageText = Array.isArray(messages) ? messages.join(' ') : messages;
        return `${friendlyName}: ${messageText}`;
      });

      if (errorEntries.length > 0) {
        return errorEntries.join(' | ');
      }
    }

    // Default fallbacks mapped directly to common API HTTP Status codes
    switch (status) {
      case 400: return 'Bad Request. Validation parameters failed schema requirements.';
      case 401: return 'Authentication required. Missing valid DRF Session or Token validation.';
      case 403: return 'Permission Denied. Your profile lacks permissions to create records.';
      case 404: return 'Resource Endpoint Not Found. Invalid API target mapping context.';
      case 500: return 'Internal Django Exception. Please monitor backend container terminal output logs.';
      default: return `Server error intercepted (Status: ${status})`;
    }
  }

  // Scenario 2: Network made but connection dropped (Docker backend service offline)
  if (error.request) {
    return 'Unable to establish contact. Verify that your "backend" Django container is healthy.';
  }

  // Scenario 3: Local script setup exception caught
  return error.message || 'An unexpected execution engine crash was recorded.';
};

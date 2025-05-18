import { useState, useCallback } from 'react';
import { useToast } from '../components/ToastProvider';
import { useDialog } from '../components/DialogProvider';

export const useErrorHandler = () => {
  const [errors, setErrors] = useState({});
  const toast = useToast();
  const dialog = useDialog();

  const handleApiError = useCallback((error, context = 'operation', options = {}) => {
    const errorMessage = error?.message || 'An unexpected error occurred';
    const errorId = Math.random().toString(36).substring(2, 9);
    
    setErrors(prev => ({
      ...prev,
      [errorId]: {
        message: errorMessage,
        context,
        timestamp: new Date(),
        stack: error?.stack
      }
    }));

    if (options.showToast !== false) {
      toast.showError(`Failed to ${context}: ${errorMessage}`);
    }

    if (options.showDialog) {
      dialog.alert(
        `An error occurred while ${context}. ${errorMessage}`, 
        'Error',
        {
          type: 'error',
          confirmText: 'OK'
        }
      );
    }

    console.error(`Error in ${context}:`, error);

    return errorId;
  }, [toast, dialog]);

  const clearError = useCallback((errorId) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[errorId];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const withErrorHandling = useCallback((fn, context, options) => {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        handleApiError(error, context, options);
        throw error;
      }
    };
  }, [handleApiError]);

  return {
    errors,
    handleApiError,
    clearError,
    clearAllErrors,
    withErrorHandling
  };
};

import { Alert } from 'react-native';
import { Environment } from '../../config/environment';

// Single Responsibility: Only handles error processing and display
// Interface Segregation: Different error handling interfaces for different contexts
class ErrorHandlerService {
  
  // Error types enum (Open/Closed Principle)
  static ErrorTypes = {
    NETWORK: 'network',
    AUTH: 'auth',
    VALIDATION: 'validation',
    PERMISSION: 'permission',
    SERVER: 'server',
    CLIENT: 'client',
    UNKNOWN: 'unknown'
  };

  // Error severity levels
  static Severity = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  };

  // Error categorization (Single Responsibility)
  static categorizeError(error) {
    if (!error) return this.ErrorTypes.UNKNOWN;
    
    const errorCode = error.code || error.message || '';
    
    // Network errors
    if (errorCode.includes('network') || errorCode.includes('timeout') || 
        errorCode.includes('connection') || error.name === 'NetworkError') {
      return this.ErrorTypes.NETWORK;
    }
    
    // Authentication errors
    if (errorCode.includes('auth/') || errorCode.includes('unauthorized') ||
        errorCode.includes('invalid-credential') || errorCode.includes('user-not-found')) {
      return this.ErrorTypes.AUTH;
    }
    
    // Permission errors
    if (errorCode.includes('permission') || errorCode.includes('forbidden') ||
        errorCode.includes('access-denied')) {
      return this.ErrorTypes.PERMISSION;
    }
    
    // Validation errors
    if (errorCode.includes('validation') || errorCode.includes('invalid') ||
        errorCode.includes('required') || error.name === 'ValidationError') {
      return this.ErrorTypes.VALIDATION;
    }
    
    // Server errors
    if (errorCode.includes('internal') || errorCode.includes('server') ||
        errorCode.includes('unavailable') || errorCode.includes('5')) {
      return this.ErrorTypes.SERVER;
    }
    
    return this.ErrorTypes.CLIENT;
  }

  // Error severity assessment (Single Responsibility)
  static assessSeverity(error, context = '') {
    const errorType = this.categorizeError(error);
    
    switch (errorType) {
      case this.ErrorTypes.NETWORK:
        return this.Severity.MEDIUM;
      case this.ErrorTypes.AUTH:
        return context.includes('login') ? this.Severity.MEDIUM : this.Severity.HIGH;
      case this.ErrorTypes.PERMISSION:
        return this.Severity.HIGH;
      case this.ErrorTypes.VALIDATION:
        return this.Severity.LOW;
      case this.ErrorTypes.SERVER:
        return this.Severity.HIGH;
      default:
        return this.Severity.MEDIUM;
    }
  }

  // Error message factory (Factory Pattern)
  static createUserMessage(error, context = '') {
    const errorType = this.categorizeError(error);
    
    const messages = {
      [this.ErrorTypes.NETWORK]: {
        title: 'Connection Error',
        message: 'Please check your internet connection and try again.',
        actionText: 'Retry'
      },
      [this.ErrorTypes.AUTH]: {
        title: 'Authentication Error',
        message: 'Please check your credentials and try again.',
        actionText: 'Try Again'
      },
      [this.ErrorTypes.PERMISSION]: {
        title: 'Access Denied',
        message: 'You don\'t have permission to perform this action.',
        actionText: 'OK'
      },
      [this.ErrorTypes.VALIDATION]: {
        title: 'Invalid Input',
        message: error.message || 'Please check your input and try again.',
        actionText: 'OK'
      },
      [this.ErrorTypes.SERVER]: {
        title: 'Service Unavailable',
        message: 'Our servers are temporarily unavailable. Please try again later.',
        actionText: 'Try Again'
      },
      [this.ErrorTypes.CLIENT]: {
        title: 'Error',
        message: 'Something went wrong. Please try again.',
        actionText: 'Try Again'
      },
      [this.ErrorTypes.UNKNOWN]: {
        title: 'Unexpected Error',
        message: 'An unexpected error occurred. Please try again.',
        actionText: 'Try Again'
      }
    };

    // Context-specific customizations (Open/Closed Principle)
    const contextualizations = {
      login: {
        [this.ErrorTypes.AUTH]: {
          title: 'Login Failed',
          message: 'Invalid email or password. Please try again.'
        }
      },
      signup: {
        [this.ErrorTypes.AUTH]: {
          title: 'Registration Failed',
          message: 'Unable to create account. Please try again.'
        }
      },
      upload: {
        [this.ErrorTypes.NETWORK]: {
          title: 'Upload Failed',
          message: 'Failed to upload file. Please check your connection.'
        }
      }
    };

    const baseMessage = messages[errorType];
    const contextMessage = contextualizations[context]?.[errorType];
    
    return { ...baseMessage, ...contextMessage };
  }

  // Centralized error logging (Single Responsibility)
  static logError(error, context = '', additionalData = {}) {
    if (!Environment.ENABLE_LOGS) return;

    const errorType = this.categorizeError(error);
    const severity = this.assessSeverity(error, context);
    
    const logData = {
      timestamp: new Date().toISOString(),
      context,
      errorType,
      severity,
      message: error.message,
      stack: error.stack,
      code: error.code,
      ...additionalData
    };

    // Development logging
    if (__DEV__) {
      console.group(`🚨 Error [${severity.toUpperCase()}] - ${context}`);
      console.error('Error:', error);
      console.table(logData);
      console.groupEnd();
    }

    // Production logging (could integrate with crash reporting service)
    if (!__DEV__ && severity === this.Severity.CRITICAL) {
      // Here you would integrate with services like Sentry, Crashlytics, etc.
      console.error('CRITICAL ERROR:', logData);
    }
  }

  // Enhanced alert display (Interface Segregation)
  static showUserFriendlyAlert(error, context = '', options = {}) {
    this.logError(error, context, options.additionalData);

    const userMessage = this.createUserMessage(error, context);
    const {
      onRetry,
      onCancel,
      showRetry = true,
      customTitle,
      customMessage,
      customActionText
    } = options;

    const title = customTitle || userMessage.title;
    const message = customMessage || userMessage.message;
    const actionText = customActionText || userMessage.actionText;

    const buttons = [];

    // Cancel button (if provided)
    if (onCancel || !showRetry) {
      buttons.push({
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel
      });
    }

    // Retry/Action button
    buttons.push({
      text: actionText,
      onPress: onRetry || (() => {}),
      style: showRetry ? 'default' : 'destructive'
    });

    Alert.alert(title, message, buttons);
  }

  // Specific error handlers (Interface Segregation)
  static handleNetworkError(error, onRetry) {
    this.showUserFriendlyAlert(error, 'network', {
      onRetry,
      showRetry: true
    });
  }

  static handleAuthError(error, context = 'auth', options = {}) {
    this.showUserFriendlyAlert(error, context, {
      showRetry: false,
      ...options
    });
  }

  static handleValidationError(error, field = '') {
    this.showUserFriendlyAlert(error, 'validation', {
      showRetry: false,
      customMessage: field ? `${field}: ${error.message}` : error.message
    });
  }

  static handleCriticalError(error, context = 'critical') {
    this.logError(error, context);
    
    Alert.alert(
      'Critical Error',
      'A critical error occurred. The app may need to restart.',
      [
        {
          text: 'Restart App',
          onPress: () => {
            // Could trigger app restart logic
            console.log('App restart requested');
          }
        }
      ]
    );
  }

  // Async operation wrapper (Decorator Pattern)
  static async handleAsyncOperation(
    operation,
    context = '',
    options = {}
  ) {
    const {
      showLoading = false,
      showError = true,
      retryCount = 0,
      retryDelay = 1000,
      onSuccess,
      onError,
      onFinally
    } = options;

    let attempts = 0;
    let lastError;

    while (attempts <= retryCount) {
      try {
        const result = await operation();
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return { success: true, data: result };
      } catch (error) {
        lastError = error;
        attempts++;
        
        this.logError(error, context, { attempt: attempts });
        
        if (attempts <= retryCount) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
        }
      }
    }

    if (onError) {
      onError(lastError);
    }

    if (showError) {
      this.showUserFriendlyAlert(lastError, context, {
        onRetry: retryCount > 0 ? () => this.handleAsyncOperation(operation, context, options) : undefined
      });
    }

    if (onFinally) {
      onFinally();
    }

    return { success: false, error: lastError };
  }

  // Form validation error handler (Specialized Interface)
  static handleFormErrors(errors, showAlert = true) {
    if (!errors || typeof errors !== 'object') return;

    const errorMessages = Object.entries(errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join('\n');

    this.logError(new Error(errorMessages), 'form-validation');

    if (showAlert) {
      Alert.alert(
        'Form Validation Error',
        errorMessages,
        [{ text: 'OK', style: 'default' }]
      );
    }

    return errorMessages;
  }

  // Service-specific error handlers (Open/Closed Principle)
  static handleFirebaseError(error, context = 'firebase') {
    const firebaseMessages = {
      'auth/network-request-failed': 'Network connection failed. Please check your internet.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
      'permission-denied': 'You don\'t have permission to access this data.',
      'unavailable': 'Service is temporarily unavailable.'
    };

    const customMessage = firebaseMessages[error.code];
    
    this.showUserFriendlyAlert(error, context, {
      customMessage,
      showRetry: !error.code?.includes('auth/')
    });
  }

  static handleAPIError(error, endpoint = '', options = {}) {
    const statusCode = error.status || error.statusCode;
    
    const statusMessages = {
      400: 'Bad request. Please check your input.',
      401: 'Authentication required. Please log in.',
      403: 'Access forbidden. You don\'t have permission.',
      404: 'Resource not found.',
      429: 'Too many requests. Please try again later.',
      500: 'Server error. Please try again later.',
      502: 'Service unavailable. Please try again later.',
      503: 'Service temporarily unavailable.',
      504: 'Request timeout. Please try again.'
    };

    const customMessage = statusMessages[statusCode] || `API Error: ${error.message}`;
    
    this.showUserFriendlyAlert(error, `api-${endpoint}`, {
      customMessage,
      ...options
    });
  }
}

export default ErrorHandlerService; 
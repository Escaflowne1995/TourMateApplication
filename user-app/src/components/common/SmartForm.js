import React, { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import FormBuilder from './FormBuilder';
import ValidationFactory from '../../utils/factories/ValidationFactory';
import ErrorHandlerService from '../../services/common/ErrorHandlerService';
import { useServices } from '../../utils/ServiceLocator';

// Single Responsibility: Combines form rendering with smart business logic
// Open/Closed: Easy to extend with new form types and behaviors
const SmartForm = ({
  formType,
  onSuccess,
  onCancel,
  customValidation,
  customTransformation,
  submitService,
  submitMethod = 'create',
  initialData = {},
  title,
  subtitle,
  customSchema,
  enableAutoSave = false,
  autoSaveInterval = 30000, // 30 seconds
  showProgressIndicator = false,
  confirmBeforeSubmit = false,
  confirmMessage = 'Are you sure you want to submit this form?'
}) => {
  
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Dependency Injection (Dependency Inversion Principle)
  const errorHandler = useServices('ErrorHandlerService');

  // Factory Pattern: Get schema based on form type
  const schema = useMemo(() => {
    if (customSchema) return customSchema;
    
    try {
      return ValidationFactory.getSchema(formType);
    } catch (error) {
      errorHandler.logError(error, 'schema-creation');
      throw new Error(`Invalid form type: ${formType}`);
    }
  }, [formType, customSchema, errorHandler]);

  // Enhanced schema with initial data (Open/Closed Principle)
  const enhancedSchema = useMemo(() => {
    if (!initialData || Object.keys(initialData).length === 0) {
      return schema;
    }

    return {
      ...schema,
      fields: schema.fields.map(field => ({
        ...field,
        defaultValue: initialData[field.name] || field.defaultValue || ''
      }))
    };
  }, [schema, initialData]);

  // Auto-save functionality (Single Responsibility)
  const handleAutoSave = useCallback(async (formData) => {
    if (!enableAutoSave || !isDirty) return;

    try {
      // Here you could save to local storage or send to server
      console.log('Auto-saving form data:', formData);
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (error) {
      errorHandler.logError(error, 'auto-save');
    }
  }, [enableAutoSave, isDirty, errorHandler]);

  // Enhanced data transformation (Open/Closed Principle)
  const transformData = useCallback((formData) => {
    let transformed = { ...formData };

    // Apply schema transformations
    schema.fields.forEach(field => {
      if (field.transform && transformed[field.name]) {
        transformed[field.name] = field.transform(transformed[field.name]);
      }
    });

    // Apply custom transformation if provided
    if (customTransformation) {
      transformed = customTransformation(transformed);
    }

    return transformed;
  }, [schema, customTransformation]);

  // Enhanced validation (Single Responsibility)
  const validateData = useCallback(async (formData) => {
    const errors = {};
    let isValid = true;

    // Schema-based validation
    for (const field of schema.fields) {
      if (field.required && !formData[field.name]?.trim()) {
        errors[field.name] = `${field.label} is required`;
        isValid = false;
        continue;
      }

      if (field.validation && formData[field.name]) {
        const validationResult = field.validation(formData[field.name], formData);
        if (!validationResult.isValid) {
          errors[field.name] = validationResult.message;
          isValid = false;
        }
      }
    }

    // Custom validation if provided
    if (customValidation && isValid) {
      try {
        const customResult = await customValidation(formData);
        if (!customResult.isValid) {
          Object.assign(errors, customResult.errors);
          isValid = false;
        }
      } catch (error) {
        errorHandler.logError(error, 'custom-validation');
        isValid = false;
        errors.general = 'Validation failed. Please try again.';
      }
    }

    return { isValid, errors };
  }, [schema, customValidation, errorHandler]);

  // Smart form submission (Single Responsibility)
  const handleSubmit = useCallback(async (formData) => {
    try {
      // Show confirmation if required
      if (confirmBeforeSubmit) {
        const confirmed = await new Promise((resolve) => {
          Alert.alert(
            'Confirm Submission',
            confirmMessage,
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Submit', onPress: () => resolve(true) }
            ]
          );
        });

        if (!confirmed) return { success: false, cancelled: true };
      }

      // Validate data
      const validation = await validateData(formData);
      if (!validation.isValid) {
        errorHandler.handleFormErrors(validation.errors);
        return { success: false, errors: validation.errors };
      }

      // Transform data
      const transformedData = transformData(formData);

      // Submit using service (Dependency Inversion)
      let result;
      if (submitService && submitMethod) {
        result = await submitService[submitMethod](transformedData);
      } else {
        throw new Error('No submit service or method provided');
      }

      // Handle success
      if (result.success) {
        setIsDirty(false);
        if (onSuccess) {
          onSuccess(result);
        }
      }

      return result;
    } catch (error) {
      errorHandler.handleAsyncOperation(
        () => Promise.reject(error),
        `form-submit-${formType}`,
        { showError: true }
      );
      return { success: false, error };
    }
  }, [
    confirmBeforeSubmit,
    confirmMessage,
    validateData,
    transformData,
    submitService,
    submitMethod,
    onSuccess,
    errorHandler,
    formType
  ]);

  // Handle form data changes (for auto-save and dirty tracking)
  const handleDataChange = useCallback((fieldName, value) => {
    setIsDirty(true);

    if (enableAutoSave) {
      // Clear existing timer
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }

      // Set new timer
      const timer = setTimeout(() => {
        handleAutoSave({ [fieldName]: value });
      }, autoSaveInterval);

      setAutoSaveTimer(timer);
    }
  }, [enableAutoSave, autoSaveTimer, autoSaveInterval, handleAutoSave]);

  // Enhanced FormBuilder with smart features
  return (
    <FormBuilder
      schema={enhancedSchema}
      onSubmit={handleSubmit}
      onSuccess={onSuccess}
      onDataChange={handleDataChange}
      showProgressIndicator={showProgressIndicator}
      lastSaved={lastSaved}
      isDirty={isDirty}
    />
  );
};

// Factory function for common form types (Factory Pattern)
export const FormFactory = {
  createAttractionForm: (props) => (
    <SmartForm
      formType="attraction"
      submitMethod="addAttraction"
      confirmBeforeSubmit={true}
      confirmMessage="Are you sure you want to add this attraction?"
      {...props}
    />
  ),

  createRestaurantForm: (props) => (
    <SmartForm
      formType="restaurant"
      submitMethod="addRestaurant"
      confirmBeforeSubmit={true}
      confirmMessage="Are you sure you want to add this restaurant?"
      {...props}
    />
  ),

  createBeachForm: (props) => (
    <SmartForm
      formType="beach"
      submitMethod="addBeach"
      confirmBeforeSubmit={true}
      confirmMessage="Are you sure you want to add this beach?"
      {...props}
    />
  ),

  createLoginForm: (props) => (
    <SmartForm
      formType="login"
      submitMethod="login"
      enableAutoSave={false}
      confirmBeforeSubmit={false}
      {...props}
    />
  ),

  createSignupForm: (props) => (
    <SmartForm
      formType="signup"
      submitMethod="signup"
      enableAutoSave={true}
      confirmBeforeSubmit={true}
      confirmMessage="Create your account with these details?"
      {...props}
    />
  )
};

export default SmartForm; 
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/theme';

// Single Responsibility: FormBuilder only handles form rendering and state management
class FormBuilder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: this.initializeFormData(),
      loading: false,
      errors: {}
    };
  }

  // Initialize form data from schema
  initializeFormData() {
    const { schema } = this.props;
    const data = {};
    schema.fields.forEach(field => {
      data[field.name] = field.defaultValue || '';
    });
    return data;
  }

  // Single Responsibility: Only handles input changes
  handleInputChange = (fieldName, value) => {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [fieldName]: value
      },
      errors: {
        ...prevState.errors,
        [fieldName]: null // Clear error when user types
      }
    }));
  };

  // Single Responsibility: Only handles validation
  validateForm = () => {
    const { schema } = this.props;
    const { formData } = this.state;
    const errors = {};
    let isValid = true;

    schema.fields.forEach(field => {
      if (field.required && !formData[field.name]?.trim()) {
        errors[field.name] = `${field.label} is required`;
        isValid = false;
      }

      if (field.validation && formData[field.name]) {
        const validationResult = field.validation(formData[field.name]);
        if (!validationResult.isValid) {
          errors[field.name] = validationResult.message;
          isValid = false;
        }
      }
    });

    this.setState({ errors });
    return { isValid, errors };
  };

  // Single Responsibility: Only handles form submission
  handleSubmit = async () => {
    const { onSubmit, schema } = this.props;
    const { formData } = this.state;

    const validation = this.validateForm();
    if (!validation.isValid) {
      const firstError = Object.keys(validation.errors)[0];
      Alert.alert('Validation Error', validation.errors[firstError]);
      return;
    }

    this.setState({ loading: true });

    try {
      // Transform data according to schema
      const transformedData = this.transformFormData(formData);
      const result = await onSubmit(transformedData);
      
      if (result.success) {
        this.handleSuccess(result);
      } else {
        Alert.alert('Error', result.error || 'Operation failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      this.setState({ loading: false });
    }
  };

  // Open/Closed Principle: Easy to extend data transformation
  transformFormData = (formData) => {
    const { schema } = this.props;
    const transformed = { ...formData };

    schema.fields.forEach(field => {
      if (field.transform) {
        transformed[field.name] = field.transform(formData[field.name]);
      }
    });

    return transformed;
  };

  // Single Responsibility: Only handles success scenarios
  handleSuccess = (result) => {
    const { onSuccess, schema } = this.props;
    
    Alert.alert(
      'Success!',
      result.message,
      [
        {
          text: 'Add Another',
          onPress: () => {
            this.setState({ formData: this.initializeFormData() });
          }
        },
        {
          text: 'Go Back',
          onPress: onSuccess
        }
      ]
    );
  };

  // Single Responsibility: Only renders individual fields
  renderField = (field) => {
    const { formData, errors } = this.state;
    const colors = getThemeColors(this.props.isDarkMode);
    const styles = this.getStyles(colors);

    return (
      <View key={field.name} style={styles.formGroup}>
        <Text style={[
          styles.label,
          field.required && styles.requiredLabel
        ]}>
          {field.label} {field.required && '*'}
        </Text>
        
        <TextInput
          style={[
            styles.input,
            field.multiline && styles.multilineInput,
            errors[field.name] && styles.inputError
          ]}
          value={formData[field.name]}
          onChangeText={(value) => this.handleInputChange(field.name, value)}
          placeholder={field.placeholder}
          placeholderTextColor={colors.textSecondary}
          multiline={field.multiline}
          textAlignVertical={field.multiline ? 'top' : 'center'}
          keyboardType={field.keyboardType || 'default'}
          autoCapitalize={field.autoCapitalize || 'sentences'}
        />
        
        {field.helper && (
          <Text style={styles.helper}>{field.helper}</Text>
        )}
        
        {errors[field.name] && (
          <Text style={styles.errorText}>{errors[field.name]}</Text>
        )}
      </View>
    );
  };

  // Dependency Inversion: Styles injected rather than hardcoded
  getStyles = (colors) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    formGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    requiredLabel: {
      color: colors.primary,
    },
    input: {
      backgroundColor: colors.cardBackground,
      borderRadius: 10,
      padding: 15,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border || '#E0E0E0',
    },
    inputError: {
      borderColor: colors.error || '#FF6B6B',
      borderWidth: 2,
    },
    multilineInput: {
      height: 100,
      textAlignVertical: 'top',
    },
    submitButton: {
      backgroundColor: colors.primary,
      padding: 18,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 30,
      marginBottom: 40,
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    disabledButton: {
      opacity: 0.6,
    },
    helper: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 5,
      fontStyle: 'italic',
    },
    errorText: {
      fontSize: 12,
      color: colors.error || '#FF6B6B',
      marginTop: 5,
    },
  });

  render() {
    const { schema, isDarkMode } = this.props;
    const { loading } = this.state;
    const colors = getThemeColors(isDarkMode);
    const styles = this.getStyles(colors);

    return (
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{schema.title}</Text>
          
          {schema.fields.map(this.renderField)}

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.disabledButton
            ]}
            onPress={this.handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {schema.submitLabel || 'Submit'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

// Higher-Order Component for theme injection (Dependency Inversion)
export default function FormBuilderWithTheme(props) {
  const { isDarkMode } = useTheme();
  return <FormBuilder {...props} isDarkMode={isDarkMode} />;
} 
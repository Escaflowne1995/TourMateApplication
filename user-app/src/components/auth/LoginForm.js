// LoginForm.js - Premium tourism login form with gradient button
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import EmailInputWithHistory from '../common/EmailInputWithHistory';
import Logo from '../common/Logo';

const LoginForm = ({ 
  validationSchema,
  onSubmit,
  isLoading,
  canSubmit,
  colors,
  styles,
  navigation,
  showPassword,
  setShowPassword,
  initialEmail = ''
}) => {
  return (
    <Formik
      initialValues={{ email: initialEmail, password: '' }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize={true}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <View style={styles.formContainer}>
          {/* Logo above email input */}
          <View style={{ alignItems: 'center', marginBottom: 60 }}>
            <Logo size="normal" />
          </View>
          {/* Email Input */}
          <View style={styles.firstInputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <EmailInputWithHistory
              style={[styles.input, { 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                borderColor: 'rgba(255, 255, 255, 0.3)', 
                color: '#2C3E50'
              }]}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              colors={colors}
              editable={!isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {touched.email && errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                secureTextEntry={!showPassword}
                autoComplete="password"
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Log In Button with Gradient */}
          <TouchableOpacity 
            style={[
              styles.loginButton,
              (!canSubmit || isLoading) && styles.disabledButton
            ]} 
            onPress={() => handleSubmit()}
            disabled={!canSubmit || isLoading}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Create Account Link */}
          <TouchableOpacity 
            style={styles.createAccountLink}
            onPress={() => navigation.navigate('Signup')}
            disabled={isLoading}
          >
            <Text style={styles.createAccountText}>
              Don't have an account? <Text style={styles.createAccountLinkText}>Create Account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Formik>
  );
};

export default LoginForm; 
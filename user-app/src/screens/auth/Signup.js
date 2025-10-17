import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import LocalAuthService from '../../services/auth/LocalAuthService';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/theme';
import AuthScreenLayout from '../../components/layout/AuthScreenLayout';
import EmailHistoryService from '../../services/storage/EmailHistoryService';
import { registerUser } from '../../services/supabase';
import { handleSignupEmailConfirmation } from '../../services/supabase/emailConfirmationHelper';

const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^\d{11}$/, 'Phone number must be exactly 11 digits')
    .nullable(),
  password: Yup.string()
    .min(9, 'Password must be at least 9 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/, 'Password must contain at least one special character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords do not match')
    .required('Please confirm your password'),
});

// Country codes data
const COUNTRY_CODES = [
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
];

const Signup = ({ navigation, route }) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const styles = getStyles(colors, isDarkMode);
  
  // Debug logging
  console.log('Signup Screen - isDarkMode:', isDarkMode);
  console.log('Signup Screen - colors.cardBackground:', colors.cardBackground);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]); // Default to Philippines
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const handleSignup = async (values) => {
    setIsLoading(true);
    try {
      console.log('Creating user with email:', values.email);
      console.log('Registration data:', values);
      
      const fullName = `${values.firstName} ${values.lastName}`;
      
      // Prepare profile data from registration form
      const profileData = {
        phone: values.phone ? `${selectedCountry.code}${values.phone}` : '',
        location: 'Cebu City, Philippines', // Default location
        country: selectedCountry.country || 'Philippines',
        zipCode: '',
        birthDate: '',
        gender: '',
        avatar: ''
      };
      
      console.log('Profile data for registration:', profileData);
      
      // Create user with Supabase Auth and profile data
      const result = await registerUser(fullName, values.email, values.password, profileData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      console.log('User created successfully:', result.data.user.id);
      console.log('Profile created:', result.data.profileCreated);
      
      if (result.data.profileCreated) {
        console.log('✅ Registration profile saved to Supabase - data will appear in Edit Profile');
      } else {
        console.log('⚠️ Profile creation failed - user will need to fill profile manually');
      }
      
      // Save email to history for future login suggestions
      await EmailHistoryService.saveEmail(values.email);
      
      // Handle email confirmation flow
      if (result.data.needsEmailConfirmation) {
        // Use the email confirmation helper
        await handleSignupEmailConfirmation(values.email, navigation);
      } else {
        Alert.alert(
          'Account Created Successfully!',
          'Your account has been created. You can now log in with your new credentials.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('Login', { 
                  email: values.email,
                  signupSuccess: true 
                });
              }
            }
          ]
        );
      }
      
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'Failed to create account. Please try again.';
      
      // Handle specific Supabase errors
      if (error.message) {
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          errorMessage = 'This email address is already registered. Please try logging in instead.';
        } else if (error.message.includes('Password should be')) {
          errorMessage = 'Password should be at least 6 characters.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Signup Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthScreenLayout colors={colors} backgroundIndex={1} showIcons={false}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>Create your account to get started</Text>
      </View>

      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: route?.params?.email || '',
          phone: '',
          password: '',
          confirmPassword: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSignup}
        enableReinitialize={true}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.formContainer}>
            {/* First Name and Last Name Row */}
            <View style={styles.nameRowContainer}>
              <View style={styles.nameInputContainer}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your first name"
                  placeholderTextColor="#9CA3AF"
                  value={values.firstName}
                  onChangeText={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  editable={!isLoading}
                />
                {touched.firstName && errors.firstName && (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                )}
              </View>

              <View style={styles.nameInputContainer}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your last name"
                  placeholderTextColor="#9CA3AF"
                  value={values.lastName}
                  onChangeText={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  editable={!isLoading}
                />
                {touched.lastName && errors.lastName && (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                )}
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            {touched.email && errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            {/* Phone Input with Country Code */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.phoneContainer}>
                <TouchableOpacity 
                  style={styles.countrySelector}
                  onPress={() => setShowCountryPicker(true)}
                  disabled={isLoading}
                >
                  <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                  <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                  <Ionicons name="chevron-down" size={16} color="#6B7280" />
                </TouchableOpacity>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9CA3AF"
                  value={values.phone}
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              </View>
            </View>
            {touched.phone && errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}

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
            </View>
            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>
            {touched.confirmPassword && errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

            {/* Create Button with Gradient */}
            <TouchableOpacity 
              style={[styles.createButton, isLoading && styles.disabledButton]} 
              onPress={() => handleSubmit()}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.buttonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Sign In Link */}
            <TouchableOpacity 
              style={styles.signInLink}
              onPress={() => navigation.navigate('Login')}
              disabled={isLoading}
            >
              <Text style={styles.signInText}>
                Already have an account? <Text style={styles.signInLinkText}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity
                onPress={() => setShowCountryPicker(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    selectedCountry.code === item.code && styles.selectedCountryItem
                  ]}
                  onPress={() => {
                    setSelectedCountry(item);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={styles.countryItemFlag}>{item.flag}</Text>
                  <Text style={styles.countryItemName}>{item.country}</Text>
                  <Text style={styles.countryItemCode}>{item.code}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </AuthScreenLayout>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  formContainer: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  nameRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  nameInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2C3E50',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  createButton: {
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    overflow: 'hidden',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  signInLink: {
    alignItems: 'center',
    marginTop: 10,
  },
  signInText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  signInLinkText: {
    color: colors.primary,
    fontWeight: '700',
  },
  errorText: {
    color: '#FFCACA',
    fontSize: 13,
    marginTop: 5,
    marginLeft: 4,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    width: '100%',
  },
  // Phone input with country code styles
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 0, 0, 0.1)',
    minWidth: 90,
  },
  countryFlag: {
    fontSize: 18,
    marginRight: 4,
  },
  countryCode: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2C3E50',
    backgroundColor: 'transparent',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedCountryItem: {
    backgroundColor: '#f0f8ff',
  },
  countryItemFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  countryItemName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  countryItemCode: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});

export default Signup;

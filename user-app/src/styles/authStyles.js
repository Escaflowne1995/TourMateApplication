// authStyles.js - Centralized auth screen styles (SRP)
import { StyleSheet } from 'react-native';

export const getLoginStyles = (colors, isDarkMode) => StyleSheet.create({
  formContainer: {
    width: '100%',
    paddingHorizontal: 0,
    zIndex: 1,
    marginTop: 60,
  },
  inputContainer: {
    marginBottom: 0,
    zIndex: 1,
  },
  firstInputContainer: {
    marginBottom: 16,
    zIndex: 1,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loginButton: {
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    width: '100%',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  createAccountLink: {
    alignItems: 'center',
  },
  createAccountText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  createAccountLinkText: {
    color: colors.primary,
    fontWeight: '700',
  },
  errorText: {
    color: '#FFCACA',
    fontSize: 13,
    marginTop: 8,
    marginLeft: 4,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export const getSignupStyles = (colors, isDarkMode) => StyleSheet.create({
  // Signup-specific styles can be added here
  ...getLoginStyles(colors, isDarkMode),
  // Add any signup-specific overrides
}); 
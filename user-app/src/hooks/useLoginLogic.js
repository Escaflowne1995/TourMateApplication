import { useState, useMemo } from 'react';
import { Alert } from 'react-native';
import * as Yup from 'yup';

import EmailHistoryService from '../services/storage/EmailHistoryService';
import LoginController from '../controllers/LoginController';
import SecurityService from '../services/security/SecurityService';

const useLoginLogic = (navigation) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const securityService = useMemo(() => new SecurityService(5), []);
  const loginController = useMemo(() => new LoginController(securityService), [securityService]);

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'Password too short').required('Password is required'),
  });

  const handleLogin = async (values) => {
    const { email, password } = values;

    if (!email || !password) {
      Alert.alert("Input Error", "Email and password must not be empty.");
      return;
    }

    setIsLoading(true);

    try {
      await loginController.handleLogin(email.trim(), password, navigation);

      try {
        await EmailHistoryService.saveEmail(email);
      } catch {
        // Email save failed silently
      }

    } catch (error) {
      if (error.code === 'auth/invalid-credential') {
        Alert.alert("Login Failed", "Invalid email or password.");
      } else {
        Alert.alert("Login Error", "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = securityService.canAttemptLogin();

  return {
    handleLogin,
    showPassword,
    setShowPassword,
    isLoading,
    validationSchema,
    canSubmit,
  };
};

export default useLoginLogic;

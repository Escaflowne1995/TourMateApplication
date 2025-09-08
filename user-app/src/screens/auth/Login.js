import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/theme';
import AuthScreenLayout from '../../components/layout/AuthScreenLayout';
import LoginForm from '../../components/auth/LoginForm';
import useLoginLogic from '../../hooks/useLoginLogic';
import { getLoginStyles } from '../../styles/authStyles';
// Firebase debug removed

const Login = ({ navigation, route }) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const styles = getLoginStyles(colors, isDarkMode);

  // Get initial email from route params (from signup redirect)
  const initialEmail = route?.params?.email || '';
  const signupSuccess = route?.params?.signupSuccess || false;

  // ✅ All login logic is here via custom hook
  const {
    showPassword,
    setShowPassword,
    isLoading,
    validationSchema,
    handleLogin,
    canSubmit,
  } = useLoginLogic(navigation);

  React.useEffect(() => {
    // Uncomment for debugging Firebase
    // FirebaseDebug.runFullDiagnostic();
  }, []);

  return (
    <AuthScreenLayout colors={colors} backgroundIndex={0} extraPaddingBottom={80} showLogo={false}>
      <LoginForm
        validationSchema={validationSchema}
        onSubmit={handleLogin}
        isLoading={isLoading}
        canSubmit={canSubmit}
        colors={colors}
        styles={styles}
        navigation={navigation}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        initialEmail={initialEmail}
      />
    </AuthScreenLayout>
  );
};

export default Login;

import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/theme';
import NotificationTester from '../../components/notifications/NotificationTester';
import { BaseScreen } from '../../components/common/BaseScreen';

const NotificationTesterScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);

  return (
    <BaseScreen
      title="Notification Tester"
      navigation={navigation}
      showBackButton={true}
      colors={colors}
    >
      <NotificationTester isDarkMode={isDarkMode} />
    </BaseScreen>
  );
};

export default NotificationTesterScreen;
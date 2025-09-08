import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../utils/theme';

const ThemeAwareComponent = () => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Theme Aware Component</Text>
        <Text style={styles.subtitle}>
          This component automatically adapts to the current theme.
          Current theme: {isDarkMode ? 'Dark' : 'Light'}
        </Text>
      </View>
    </View>
  );
};

export default ThemeAwareComponent; 
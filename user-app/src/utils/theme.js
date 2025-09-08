import { LightColors, DarkColors } from '../styles/colors';

export const getThemeColors = (isDarkMode) => {
  return isDarkMode ? DarkColors : LightColors;
};

export const getThemeStyles = (isDarkMode) => {
  const colors = getThemeColors(isDarkMode);
  
  return {
    container: {
      backgroundColor: colors.background,
    },
    card: {
      backgroundColor: colors.cardBackground,
    },
    text: {
      color: colors.text,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
    surface: {
      backgroundColor: colors.surface,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderColor: colors.border,
      color: colors.text,
    },
    border: {
      borderColor: colors.border,
    },
  };
}; 
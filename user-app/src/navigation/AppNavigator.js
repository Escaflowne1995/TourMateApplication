import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import AttractionDetails from '../screens/main/AttractionDetails';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import FavoriteSpotsScreen from '../screens/profile/FavoriteSpotsScreen';
import MyReviewsScreen from '../screens/profile/MyReviewsScreen';
import TravelHistoryScreen from '../screens/profile/TravelHistoryScreen';
import LanguageScreen from '../screens/settings/LanguageScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import HelpSupportScreen from '../screens/settings/HelpSupportScreen';

import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../utils/theme';

const Stack = createStackNavigator();

function AppNavigatorContent() {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);

  // Common header options that adapt to theme
  const getHeaderOptions = (title) => ({
    headerShown: true,
    title: title,
    headerStyle: {
      backgroundColor: colors.cardBackground,
    },
    headerTintColor: colors.primary,
    headerTitleStyle: {
      color: colors.text,
      fontWeight: '600',
    },
  });

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.cardBackground,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '600',
        },
      }}
    >
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="MainApp" component={MainNavigator} />
        <Stack.Screen
          name="AttractionDetails"
          component={AttractionDetails}
          options={getHeaderOptions('Details')}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={getHeaderOptions('Edit Profile')}
        />
        <Stack.Screen
          name="FavoriteSpots"
          component={FavoriteSpotsScreen}
          options={getHeaderOptions('Favorite Cebu Spots')}
        />
        <Stack.Screen
          name="MyReviews"
          component={MyReviewsScreen}
          options={getHeaderOptions('My Reviews')}
        />
        <Stack.Screen
          name="TravelHistory"
          component={TravelHistoryScreen}
          options={getHeaderOptions('Travel History')}
        />
        <Stack.Screen
          name="Language"
          component={LanguageScreen}
          options={getHeaderOptions('Language')}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={getHeaderOptions('Settings')}
        />

        <Stack.Screen
          name="HelpSupport"
          component={HelpSupportScreen}
          options={getHeaderOptions('Help & Support')}
        />
      </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);

  // Create custom navigation theme based on our app's theme
  const customTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.cardBackground,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={customTheme}>
      <AppNavigatorContent />
    </NavigationContainer>
  );
} 
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../utils/theme';

const Tab = createBottomTabNavigator();

export default function MainNavigator({ route }) {
  const userData = route.params?.userData || {};
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          // Premium active state with background
          if (focused) {
            return (
              <View style={{
                backgroundColor: colors.primary + '20',
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 3,
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 35,
              }}>
                <Ionicons 
                  name={iconName} 
                  size={size - 2} 
                  color={colors.primary} 
                />
              </View>
            );
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDarkMode ? '#B0BEC5' : colors.textSecondary,
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1E293B' : colors.cardBackground,
          borderTopColor: colors.primary + '40',
          borderTopWidth: 2,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          height: 58 + Math.max(insets.bottom, 8),
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 15,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '600',
          marginTop: -1,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
        },
        headerStyle: {
          backgroundColor: colors.background,
          shadowColor: 'transparent',
          elevation: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '700',
          fontSize: 20,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        options={{
          title: (userData.fullName || userData.displayName || userData.name) ? 
            `Welcome, ${(userData.fullName || userData.displayName || userData.name).split(' ')[0]}!` : 
            'Discover Cebu',
          tabBarLabel: 'Home',
        }}
      >
        {(props) => <HomeScreen {...props} userData={userData} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Search" 
        options={{
          title: 'Explore Destinations',
          tabBarLabel: 'Search',
        }}
      >
        {(props) => <SearchScreen {...props} userData={userData} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Profile" 
        options={{
          title: 'My Profile',
          tabBarLabel: 'Profile',
        }}
      >
        {(props) => <ProfileScreen {...props} userData={userData} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
} 
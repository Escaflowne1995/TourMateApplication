import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar, LogBox } from 'react-native';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import LocalAuthService from './src/services/auth/LocalAuthService';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Sending `onAnimatedValueUpdate` with no listeners registered.',
  'Non-serializable values were found in the navigation state',
]);

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize authentication service
      await LocalAuthService.initialize();
      
      // Add any other initialization logic here
      console.log('🚀 App initialized successfully');
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setIsInitialized(true);
    }
  };

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar 
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar 
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
}); 
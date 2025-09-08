import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AuthScreenLayout from '../../components/layout/AuthScreenLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/theme';

const LandingScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  
  // Memoize styles to prevent recreation on every render
  const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

  return (
    <AuthScreenLayout colors={colors} backgroundIndex={2} showLogo={true}>
      <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Discover Cebu</Text>
          <Text style={styles.subtitle}>
            Experience the Queen City of the South
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="map-outline" size={28} color={colors.primary} />
            <Text style={styles.featureText}>Discover Amazing Places</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="water-outline" size={28} color={colors.primary} />
            <Text style={styles.featureText}>Beautiful Destinations</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="restaurant-outline" size={28} color={colors.primary} />
            <Text style={styles.featureText}>Local Experiences</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
          >
                    <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.buttonGradient}
          useAngle={false}
        >
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your gateway to Cebu's finest destinations
          </Text>
        </View>
      </View>
    </AuthScreenLayout>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuresContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    // Simplified shadow for better performance
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  featureText: {
    color: '#2C3E50',
    fontSize: 16,
    marginLeft: 15,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  button: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 15,
    // Reduced shadow for better performance
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default LandingScreen; 
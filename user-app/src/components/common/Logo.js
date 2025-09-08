import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Logo = ({ size = 'normal' }) => {
  // Calculate dimensions based on size - making them bigger
  const iconSize = size === 'large' ? 55 : size === 'small' ? 35 : 45;
  const titleSize = size === 'large' ? 42 : size === 'small' ? 26 : 34;
  const subtitleSize = size === 'large' ? 18 : size === 'small' ? 12 : 16;

  const styles = getStyles();

  return (
    <View style={styles.container}>
      {/* Globe Icon to represent travel */}
      <View style={styles.iconContainer}>
        <Ionicons 
          name="earth" 
          size={iconSize} 
          color="#ff8c42" 
          style={styles.globeIcon}
        />
        <Ionicons 
          name="airplane" 
          size={iconSize * 0.6} 
          color="#ff6b1a" 
          style={styles.airplaneIcon}
        />
      </View>
      
      {/* TourMate Text */}
      <Text style={[styles.title, { fontSize: titleSize }]}>TourMate</Text>
      <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>Your Travel Companion</Text>
    </View>
  );
};

const getStyles = () => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  globeIcon: {
    // Globe in the center
  },
  airplaneIcon: {
    position: 'absolute',
    top: -10,
    right: -18,
    transform: [{ rotate: '45deg' }],
  },
  title: {
    fontWeight: 'bold',
    color: '#ff8c42',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    color: '#ff6b1a',
    letterSpacing: 1,
    marginTop: 3,
    fontWeight: '500',
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

export default Logo; 
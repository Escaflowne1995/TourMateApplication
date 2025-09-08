import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/theme';

const { width } = Dimensions.get('window');

const RestaurantCard = ({ restaurant, onPress }) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const styles = getStyles(colors, isDarkMode);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress && onPress(restaurant)}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image source={restaurant.image} style={styles.image} />
        
        {/* Premium gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.gradientOverlay}
        />
        
        {/* Floating rating badge */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{restaurant.rating || '0'}</Text>
        </View>
        
        {/* Price range badge */}
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{restaurant.priceRange || 'N/A'}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {restaurant.name || 'Restaurant'}
        </Text>
        
        <View style={styles.cuisineContainer}>
          <Ionicons name="restaurant" size={14} color={colors.primary} />
          <Text style={styles.cuisine} numberOfLines={1}>
            {restaurant.cuisine || 'Cuisine'}
          </Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {restaurant.description || 'No description available'}
        </Text>
        
        <View style={styles.infoRow}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={12} color={colors.secondary} />
            <Text style={styles.location} numberOfLines={1}>
              {restaurant.location || 'Location'}
            </Text>
          </View>
        </View>
        
        <View style={styles.hoursContainer}>
          <Ionicons name="time" size={12} color={colors.accent} />
          <Text style={styles.hours} numberOfLines={1}>
            {restaurant.openHours || 'Hours not available'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 18,
    marginRight: 16,
    width: width * 0.72,
    borderWidth: 1,
    borderColor: colors.border,
    ...(isDarkMode ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 8,
      overflow: 'hidden',
    } : {}),
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: colors.cardBackground,
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 4,
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    lineHeight: 22,
  },
  cuisineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cuisine: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  location: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hours: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
});

export default RestaurantCard; 
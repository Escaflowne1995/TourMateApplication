// AttractionCard.js - Premium tourism card component
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const AttractionCard = ({ 
  attraction, 
  onPress, 
  colors, 
  showRating = false,
  cardStyle = 'default'
}) => {
  const styles = getStyles(colors, cardStyle);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(attraction)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={attraction.image} style={styles.image} />
        
        {/* Premium gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradientOverlay}
        />
        
        {/* Floating rating badge */}
        {showRating && attraction.rating && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>
              {attraction.rating}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {attraction.name}
        </Text>
        
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={16} color={colors.primary} />
          <Text style={styles.location} numberOfLines={1}>
            {attraction.location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (colors, cardStyle) => {
  const baseStyles = {
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      marginBottom: 20,
      overflow: 'hidden',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    imageContainer: {
      position: 'relative',
    },
    image: {
      width: '100%',
      height: 200,
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
      fontWeight: '600',
      color: '#FFF',
      marginLeft: 4,
    },
    content: {
      padding: 16,
    },
    name: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      lineHeight: 24,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    location: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 6,
      flex: 1,
      fontWeight: '500',
    },
  };

  // Style variations based on cardStyle prop (OCP)
  if (cardStyle === 'compact') {
    return StyleSheet.create({
      ...baseStyles,
      card: {
        ...baseStyles.card,
        flexDirection: 'row',
        height: 120,
        borderWidth: 1,
        borderColor: colors.border,
      },
      image: {
        ...baseStyles.image,
        width: 120,
        height: '100%',
        borderRadius: 0,
      },
      content: {
        ...baseStyles.content,
        flex: 1,
        padding: 12,
        justifyContent: 'center',
      },
      name: {
        ...baseStyles.name,
        fontSize: 15,
        marginBottom: 4,
      },
      location: {
        ...baseStyles.location,
        fontSize: 13,
      },
    });
  }

  return StyleSheet.create(baseStyles);
};

export default AttractionCard; 
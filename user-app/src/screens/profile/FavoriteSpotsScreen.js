import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/theme';
import favoritesService from '../../services/api/favoritesService';

const FavoriteSpotsScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const styles = getStyles(colors, isDarkMode);
  
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
    const unsubscribe = navigation.addListener('focus', () => {
      // Reload favorites when screen comes into focus
      loadFavorites();
    });
    return unsubscribe;
  }, [navigation]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favoritesList = await favoritesService.getFavorites();
      console.log(`FavoriteSpotsScreen: Loaded ${favoritesList.length} favorites`);
      setFavorites(favoritesList);
    } catch (error) {
      console.error('FavoriteSpotsScreen: Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const removeFavorite = async (id, name) => {
    Alert.alert(
      'Remove from Favorites',
      `Are you sure you want to remove ${name} from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await favoritesService.removeFromFavorites(id);
              if (success) {
                setFavorites(favorites.filter(item => item.id !== id));
              }
            } catch (error) {
              console.error('Error removing favorite:', error);
              Alert.alert('Error', 'Failed to remove from favorites');
            }
          }
        }
      ]
    );
  };

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.favoriteCard}
      onPress={() => navigation.navigate('AttractionDetails', { attraction: item })}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${item.name || 'Spot'} in ${item.location || 'Unknown location'}, rated ${item.rating || 0} stars`}
      accessibilityHint="Tap to view details about this favorite spot"
    >
      <Image 
        source={item.image} 
        style={styles.image}
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel={`Photo of ${item.name || 'this place'}`}
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.spotName}>{item.name || 'Unknown Spot'}</Text>
            <View style={styles.locationContainer}>
              <Ionicons 
                name="location-outline" 
                size={16} 
                color={colors.textSecondary}
                accessible={false}
              />
              <Text style={styles.location}>{item.location || 'Unknown location'}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFavorite(item.id, item.name)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Remove from favorites"
            accessibilityHint={`Remove ${item.name} from your favorites`}
          >
            <Ionicons 
              name="heart" 
              size={24} 
              color="#FF6B35"
              accessible={false}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.ratingContainer}>
            <Ionicons 
              name="star" 
              size={16} 
              color="#FF6B35"
              accessible={false}
            />
            <Text style={styles.rating}>{item.rating || '0.0'}</Text>
          </View>
          <Text style={styles.category}>{item.category || 'Uncategorized'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="heart-outline" 
        size={80} 
        color={colors.textSecondary}
        accessible={false}
      />
      <Text 
        style={styles.emptyTitle}
        accessible={true}
        accessibilityRole="text"
      >
        No Favorite Spots Yet
      </Text>
      <Text 
        style={styles.emptySubtitle}
        accessible={true}
        accessibilityRole="text"
      >
        Start exploring Cebu and add places to your favorites!
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Home')}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Start Exploring"
        accessibilityHint="Navigate to home screen to discover places"
      >
        <Text style={styles.exploreButtonText}>Start Exploring</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View 
        style={styles.content}
        accessible={true}
        accessibilityLabel="Favorite Cebu Spots Screen"
      >
      <View style={styles.header}>
        <Text 
          style={styles.headerTitle}
          accessible={true}
          accessibilityRole="text"
        >
          Your Favorite Spots
        </Text>
        <Text 
          style={styles.headerSubtitle}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`You have ${favorites.length} favorite spots`}
        >
          {favorites.length} {favorites.length === 1 ? 'spot' : 'spots'}
        </Text>
      </View>

      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={favorites.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
        accessible={false}
        accessibilityLabel="List of favorite spots"
      />
    </View>
    </View>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: 20,
    marginHorizontal: 15,
    marginTop: 20,
    borderRadius: 15,
    backgroundColor: colors.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 5,
  },
  list: {
    padding: 15,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  favoriteCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  spotName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 5,
  },
  removeButton: {
    padding: 5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 5,
  },
  category: {
    fontSize: 12,
    color: colors.textSecondary,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  exploreButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FavoriteSpotsScreen; 
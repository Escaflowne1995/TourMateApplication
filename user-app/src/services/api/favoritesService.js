import AsyncStorage from '@react-native-async-storage/async-storage';
import LocalAuthService from '../auth/LocalAuthService';

const FAVORITES_STORAGE_KEY = '@tourist_app_favorites';

class FavoritesService {
  constructor() {
    this.favorites = [];
    this.loadFavorites();
  }

  // Get user-specific storage key
  getUserStorageKey() {
    const user = LocalAuthService.getCurrentUser();
    if (user) {
      return `${FAVORITES_STORAGE_KEY}_${user.uid}`;
    }
    return `${FAVORITES_STORAGE_KEY}_guest`;
  }

  // Load favorites from AsyncStorage
  async loadFavorites() {
    try {
      const storageKey = this.getUserStorageKey();
      console.log(`FavoritesService: Loading data with key: ${storageKey}`);
      
      const favoritesString = await AsyncStorage.getItem(storageKey);
      if (favoritesString) {
        this.favorites = JSON.parse(favoritesString);
        console.log(`FavoritesService: Loaded ${this.favorites.length} favorites for current user`);
      } else {
        this.favorites = [];
        console.log('FavoritesService: No existing favorites found for current user');
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      this.favorites = [];
    }
  }

  // Save favorites to AsyncStorage
  async saveFavorites() {
    try {
      const storageKey = this.getUserStorageKey();
      await AsyncStorage.setItem(storageKey, JSON.stringify(this.favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  // Get all favorites
  async getFavorites() {
    await this.loadFavorites();
    return this.favorites;
  }

  // Check if attraction is favorite
  async isFavorite(attractionId) {
    await this.loadFavorites();
    return this.favorites.some(fav => fav.id === attractionId);
  }

  // Add to favorites
  async addToFavorites(attraction) {
    await this.loadFavorites();
    
    // Check if already exists
    if (this.favorites.some(fav => fav.id === attraction.id)) {
      return false; // Already exists
    }

    const favoriteItem = {
      ...attraction,
      dateAdded: new Date().toISOString(),
    };

    this.favorites.push(favoriteItem);
    await this.saveFavorites();
    return true;
  }

  // Remove from favorites
  async removeFromFavorites(attractionId) {
    await this.loadFavorites();
    const initialLength = this.favorites.length;
    this.favorites = this.favorites.filter(fav => fav.id !== attractionId);
    
    if (this.favorites.length < initialLength) {
      await this.saveFavorites();
      return true;
    }
    return false; // Not found
  }

  // Get favorites count
  async getFavoritesCount() {
    await this.loadFavorites();
    return this.favorites.length;
  }

  // Clear all favorites (for testing or reset)
  async clearFavorites() {
    this.favorites = [];
    await this.saveFavorites();
  }

  // Clear current user's favorites data (for testing/reset purposes)
  async clearUserFavorites() {
    try {
      this.favorites = [];
      await this.saveFavorites();
      console.log('FavoritesService: Current user favorites cleared');
    } catch (error) {
      console.error('Error clearing user favorites:', error);
    }
  }

  // Reset in-memory state (called when user logs out or switches)
  resetState() {
    this.favorites = [];
    console.log('FavoritesService: In-memory state reset');
  }

  // Force reload data from storage (called when user logs in)
  async reloadData() {
    console.log('FavoritesService: Forcing data reload for current user');
    await this.loadFavorites();
  }
}

export default new FavoritesService(); 
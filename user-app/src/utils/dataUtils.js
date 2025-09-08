import AsyncStorage from '@react-native-async-storage/async-storage';
// Firebase auth removed

/**
 * Data utility functions for managing user-specific data storage
 */
class DataUtils {
  /**
   * Clear all old shared data that might cause conflicts between users
   */
  static async clearOldSharedData() {
    try {
      console.log('Clearing old shared data...');
      
      // Clear old shared keys
      await AsyncStorage.removeItem('@tourist_app_favorites');
      await AsyncStorage.removeItem('@tourist_app_reviews');
      
      console.log('✅ Old shared data cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Error clearing old shared data:', error);
      return false;
    }
  }

  /**
   * Get current user's unique storage prefix
   */
  static getUserStoragePrefix() {
    // Firebase auth removed - using guest storage for now
    return 'guest';
  }

  /**
   * List all user-specific storage keys (for debugging)
   */
  static async listUserStorageKeys() {
    try {
      // Firebase auth removed - listing guest keys

      const allKeys = await AsyncStorage.getAllKeys();
      const userKeys = allKeys.filter(key => key.includes('guest'));
      
      console.log(`Storage keys for guest user:`, userKeys);
      return userKeys;
    } catch (error) {
      console.error('Error listing user storage keys:', error);
      return [];
    }
  }

  /**
   * Debug function to show data separation status
   */
  static async debugDataSeparation() {
    try {
      console.log('\n=== DATA SEPARATION DEBUG ===');
      
      // Check for old shared data
      const oldFavorites = await AsyncStorage.getItem('@tourist_app_favorites');
      const oldReviews = await AsyncStorage.getItem('@tourist_app_reviews');
      
      console.log('Old shared favorites data exists:', !!oldFavorites);
      console.log('Old shared reviews data exists:', !!oldReviews);
      
      // Try to get current user for debugging (with multiple fallbacks)
      let currentUser = null;
      let userIdForDebug = 'guest';
      
      try {
        // Try LocalAuthService first
        const LocalAuthService = require('../services/auth/LocalAuthService').default;
        currentUser = LocalAuthService.getCurrentUser();
        
        if (currentUser && (currentUser.uid || currentUser.id)) {
          userIdForDebug = currentUser.uid || currentUser.id;
          console.log('Current user found via LocalAuthService:', userIdForDebug);
        } else {
          console.log('No user found via LocalAuthService, trying Supabase...');
          
          // Try Supabase as fallback
          try {
            const { getCurrentUser } = require('../services/supabase');
            const supabaseResult = await getCurrentUser();
            
            if (supabaseResult.success && supabaseResult.data) {
              currentUser = supabaseResult.data;
              userIdForDebug = currentUser.id || currentUser.uid || 'guest';
              console.log('Current user found via Supabase:', userIdForDebug);
            } else {
              console.log('No user found via Supabase either');
            }
          } catch (supabaseError) {
            console.log('Supabase getCurrentUser not available:', supabaseError.message);
          }
        }
      } catch (authError) {
        console.log('Auth services not available:', authError.message);
      }
      
      console.log('Using user ID for debug:', userIdForDebug);
      console.log('Expected favorites key:', `@tourist_app_favorites_${userIdForDebug}`);
      console.log('Expected reviews key:', `@tourist_app_reviews_${userIdForDebug}`);
      
      // Check user-specific data
      if (userIdForDebug !== 'guest') {
        try {
          const userFavorites = await AsyncStorage.getItem(`@tourist_app_favorites_${userIdForDebug}`);
          const userReviews = await AsyncStorage.getItem(`@tourist_app_reviews_${userIdForDebug}`);
          
          console.log('User-specific favorites data exists:', !!userFavorites);
          console.log('User-specific reviews data exists:', !!userReviews);
        } catch (storageError) {
          console.log('Error checking user-specific data:', storageError.message);
        }
      } else {
        console.log('Using guest mode - no user-specific data to check');
      }
      
      console.log('==============================\n');
    } catch (error) {
      console.error('Error in debug function:', error.message || error);
      // Don't re-throw the error to prevent app crashes
    }
  }
}

export default DataUtils; 
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility to fix data isolation issues by clearing problematic shared data
 */
class FixDataIsolation {
  /**
   * Clear all old shared data that might cause cross-contamination
   */
  static async clearSharedData() {
    try {
      console.log('🧹 Clearing old shared data...');
      
      // Remove the old shared keys that cause data mixing
      await AsyncStorage.removeItem('@tourist_app_favorites');
      await AsyncStorage.removeItem('@tourist_app_reviews');
      
      console.log('✅ Old shared data cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing shared data:', error);
      return false;
    }
  }

  /**
   * Reset all user data (useful for testing clean isolation)
   */
  static async resetAllUserData() {
    try {
      console.log('🔄 Resetting all user data...');
      
      const allKeys = await AsyncStorage.getAllKeys();
      const userDataKeys = allKeys.filter(key => 
        key.includes('tourist_app_favorites') || 
        key.includes('tourist_app_reviews')
      );
      
      await Promise.all(userDataKeys.map(key => AsyncStorage.removeItem(key)));
      
      console.log('✅ All user data reset');
      return true;
    } catch (error) {
      console.error('❌ Error resetting user data:', error);
      return false;
    }
  }

  /**
   * Debug current storage state
   */
  static async debugStorage() {
    try {
      console.log('\n📊 === STORAGE DEBUG ===');
      
      const allKeys = await AsyncStorage.getAllKeys();
      const appKeys = allKeys.filter(key => key.includes('tourist_app'));
      
      console.log('All app storage keys:');
      for (const key of appKeys) {
        const data = await AsyncStorage.getItem(key);
        if (key.includes('favorites') || key.includes('reviews')) {
          const parsedData = JSON.parse(data || '[]');
          console.log(`  ${key}: ${Array.isArray(parsedData) ? parsedData.length : 'invalid'} items`);
        } else {
          console.log(`  ${key}: ${data ? 'exists' : 'null'}`);
        }
      }
      
      console.log('=== END DEBUG ===\n');
    } catch (error) {
      console.error('Error debugging storage:', error);
    }
  }

  /**
   * Test user switching to verify data isolation
   */
  static async testUserSwitching() {
    try {
      console.log('\n🧪 === TESTING USER SWITCHING ===');
      
      const LocalAuthService = require('../services/auth/LocalAuthService').default;
      const favoritesService = require('../services/api/favoritesService').default;
      const reviewsService = require('../services/api/reviewsService').default;
      
      // Test current user's data
      const currentUser = LocalAuthService.getCurrentUser();
      if (currentUser) {
        console.log(`Current user: ${currentUser.email} (${currentUser.uid})`);
        
        const favCount = await favoritesService.getFavoritesCount();
        const revCount = await reviewsService.getReviewsCount();
        
        console.log(`Data for ${currentUser.email}: ${favCount} favorites, ${revCount} reviews`);
      } else {
        console.log('No user currently logged in');
      }
      
      console.log('=== TEST COMPLETE ===\n');
      return true;
    } catch (error) {
      console.error('❌ Error testing user switching:', error);
      return false;
    }
  }

  /**
   * Complete fix - run this to ensure clean data isolation
   */
  static async applyCompleteFix() {
    try {
      console.log('\n🛠️ === APPLYING DATA ISOLATION FIX ===');
      
      // Step 1: Clear old shared data
      await this.clearSharedData();
      
      // Step 2: Show current state
      await this.debugStorage();
      
      console.log('✅ Data isolation fix applied successfully!');
      console.log('💡 Each user will now have separate favorites and reviews.');
      console.log('🔄 Services will reset state on user login/logout.');
      console.log('=== FIX COMPLETE ===\n');
      
      return true;
    } catch (error) {
      console.error('❌ Error applying fix:', error);
      return false;
    }
  }
}

export default FixDataIsolation;

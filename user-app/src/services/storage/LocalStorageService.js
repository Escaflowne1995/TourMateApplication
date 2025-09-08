import AsyncStorage from '@react-native-async-storage/async-storage';
import LocalAuthService from '../auth/LocalAuthService';

// Local storage service to replace Firebase Firestore functionality
class LocalStorageService {
  
  // Generic storage methods
  static async setItem(key, value, userSpecific = true) {
    try {
      const storageKey = userSpecific ? this.getUserStorageKey(key) : key;
      await AsyncStorage.setItem(storageKey, JSON.stringify(value));
      return { success: true };
    } catch (error) {
      console.error('LocalStorageService: Error setting item:', error);
      return { success: false, error };
    }
  }

  static async getItem(key, userSpecific = true) {
    try {
      const storageKey = userSpecific ? this.getUserStorageKey(key) : key;
      const value = await AsyncStorage.getItem(storageKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('LocalStorageService: Error getting item:', error);
      return null;
    }
  }

  static async removeItem(key, userSpecific = true) {
    try {
      const storageKey = userSpecific ? this.getUserStorageKey(key) : key;
      await AsyncStorage.removeItem(storageKey);
      return { success: true };
    } catch (error) {
      console.error('LocalStorageService: Error removing item:', error);
      return { success: false, error };
    }
  }

  // Get user-specific storage key
  static getUserStorageKey(key) {
    const user = LocalAuthService.getCurrentUser();
    if (user) {
      return `${key}_${user.uid}`;
    }
    return `${key}_guest`;
  }

  // Settings management
  static async saveUserSettings(settings) {
    return await this.setItem('@tourist_app_settings', settings);
  }

  static async getUserSettings() {
    const defaultSettings = {
      language: 'English',
      locationPermission: false,
      theme: 'auto',
      notifications: {
        enabled: true,
        marketing: false,
        updates: true
      }
    };
    
    const settings = await this.getItem('@tourist_app_settings');
    return settings || defaultSettings;
  }

  // User profile management
  static async saveUserProfile(profile) {
    return await this.setItem('@tourist_app_profile', profile);
  }

  static async getUserProfile() {
    return await this.getItem('@tourist_app_profile');
  }

  // Email history (replacing Firebase email history)
  static async saveEmailHistory(emails) {
    return await this.setItem('@tourist_app_email_history', emails);
  }

  static async getEmailHistory() {
    const history = await this.getItem('@tourist_app_email_history');
    return history || [];
  }

  static async addEmailToHistory(email) {
    const history = await this.getEmailHistory();
    
    // Remove if already exists to avoid duplicates
    const filteredHistory = history.filter(item => item.email !== email);
    
    // Add to beginning
    const newHistory = [{ email, timestamp: new Date().toISOString() }, ...filteredHistory];
    
    // Keep only last 10 emails
    const limitedHistory = newHistory.slice(0, 10);
    
    return await this.saveEmailHistory(limitedHistory);
  }

  // Clear all user data
  static async clearUserData() {
    try {
      const user = LocalAuthService.getCurrentUser();
      if (!user) return { success: true };

      const keys = [
        '@tourist_app_settings',
        '@tourist_app_profile', 
        '@tourist_app_email_history',
        '@tourist_app_favorites',
        '@tourist_app_reviews'
      ];

      for (const key of keys) {
        await this.removeItem(key);
      }

      return { success: true };
    } catch (error) {
      console.error('LocalStorageService: Error clearing user data:', error);
      return { success: false, error };
    }
  }
}

export default LocalStorageService;

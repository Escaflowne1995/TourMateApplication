import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

import UserSettingsService, { DEFAULT_SETTINGS } from './UserSettingsService';
import LanguageService, { SUPPORTED_LANGUAGES } from './LanguageService';
import CacheManagementService from './CacheManagementService';

// Reset categories
export const RESET_CATEGORIES = {
  ALL: 'all',
  SETTINGS_ONLY: 'settingsOnly',
  LANGUAGE_ONLY: 'languageOnly',
  CACHE_ONLY: 'cacheOnly',
  PREFERENCES: 'preferences',
  USER_DATA: 'userData',
  PRIVACY: 'privacy'
};

// Reset options with descriptions
export const RESET_OPTIONS = [
  {
    id: RESET_CATEGORIES.ALL,
    title: 'Reset Everything',
    description: 'Reset all settings, preferences, and clear cache',
    icon: 'refresh-outline',
    severity: 'destructive',
    includes: ['settings', 'language', 'cache', 'preferences', 'history']
  },
  {
    id: RESET_CATEGORIES.SETTINGS_ONLY,
    title: 'Reset Settings Only',
    description: 'Reset app settings to defaults, keep user data',
    icon: 'settings-outline',
    severity: 'moderate',
    includes: ['settings', 'preferences']
  },
  {
    id: RESET_CATEGORIES.LANGUAGE_ONLY,
    title: 'Reset Language',
    description: 'Reset language preference to English',
    icon: 'language-outline',
    severity: 'mild',
    includes: ['language']
  },
  {
    id: RESET_CATEGORIES.CACHE_ONLY,
    title: 'Clear Cache Only',
    description: 'Clear cached data, keep all settings',
    icon: 'trash-outline',
    severity: 'mild',
    includes: ['cache']
  },
  {
    id: RESET_CATEGORIES.PREFERENCES,
    title: 'Reset Preferences',
    description: 'Reset notification and privacy preferences',
    icon: 'options-outline',
    severity: 'moderate',
    includes: ['notifications', 'privacy', 'location']
  },
  {
    id: RESET_CATEGORIES.USER_DATA,
    title: 'Clear User Data',
    description: 'Clear favorites, reviews, and search history',
    icon: 'person-outline',
    severity: 'destructive',
    includes: ['favorites', 'reviews', 'history']
  },
  {
    id: RESET_CATEGORIES.PRIVACY,
    title: 'Reset Privacy Settings',
    description: 'Reset analytics, tracking, and data sharing settings',
    icon: 'shield-outline',
    severity: 'moderate',
    includes: ['analytics', 'tracking', 'sharing']
  }
];

class SettingsResetService {
  
  // Main reset function with confirmation
  static async resetSettings(resetCategory = RESET_CATEGORIES.ALL, showConfirmation = true) {
    try {
      const resetOption = RESET_OPTIONS.find(option => option.id === resetCategory);
      
      if (!resetOption) {
        throw new Error(`Invalid reset category: ${resetCategory}`);
      }

      if (showConfirmation) {
        return new Promise((resolve) => {
          const alertTitle = resetOption.severity === 'destructive' ? 
            '⚠️ Warning' : 'Reset Settings';
          
          const alertMessage = `${resetOption.description}\n\nThis action cannot be undone. Continue?`;
          
          Alert.alert(
            alertTitle,
            alertMessage,
            [
              { 
                text: 'Cancel', 
                style: 'cancel',
                onPress: () => resolve({ success: false, cancelled: true })
              },
              {
                text: resetOption.severity === 'destructive' ? 'Reset All' : 'Reset',
                style: resetOption.severity === 'destructive' ? 'destructive' : 'default',
                onPress: async () => {
                  const result = await this.performReset(resetCategory);
                  resolve(result);
                }
              }
            ]
          );
        });
      } else {
        return await this.performReset(resetCategory);
      }
    } catch (error) {
      console.error('Error in resetSettings:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Perform the actual reset operation
  static async performReset(resetCategory) {
    try {
      let resetResults = {
        success: true,
        category: resetCategory,
        actions: [],
        errors: []
      };

      const resetOption = RESET_OPTIONS.find(option => option.id === resetCategory);

      switch (resetCategory) {
        case RESET_CATEGORIES.ALL:
          resetResults = await this.resetEverything();
          break;
          
        case RESET_CATEGORIES.SETTINGS_ONLY:
          resetResults = await this.resetSettingsOnly();
          break;
          
        case RESET_CATEGORIES.LANGUAGE_ONLY:
          resetResults = await this.resetLanguageOnly();
          break;
          
        case RESET_CATEGORIES.CACHE_ONLY:
          resetResults = await this.resetCacheOnly();
          break;
          
        case RESET_CATEGORIES.PREFERENCES:
          resetResults = await this.resetPreferences();
          break;
          
        case RESET_CATEGORIES.USER_DATA:
          resetResults = await this.resetUserData();
          break;
          
        case RESET_CATEGORIES.PRIVACY:
          resetResults = await this.resetPrivacySettings();
          break;
          
        default:
          throw new Error(`Unsupported reset category: ${resetCategory}`);
      }

      // Log the reset action
      await this.logResetAction(resetCategory, resetResults);

      if (resetResults.success) {
        const successMessage = `${resetOption.title} completed successfully.`;
        Alert.alert('Reset Complete', successMessage);
      }

      return resetResults;
    } catch (error) {
      console.error('Error performing reset:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Reset everything
  static async resetEverything() {
    try {
      const results = {
        success: true,
        actions: [],
        errors: []
      };

      // Reset user settings
      const settingsResult = await UserSettingsService.resetToDefaults();
      if (settingsResult.success) {
        results.actions.push('Settings reset to defaults');
      } else {
        results.errors.push(`Settings reset failed: ${settingsResult.error}`);
      }

      // Reset language
      const languageResult = await LanguageService.clearLanguagePreference();
      if (languageResult.success) {
        results.actions.push('Language reset to English');
      } else {
        results.errors.push(`Language reset failed: ${languageResult.error}`);
      }

      // Clear cache
      const cacheResult = await CacheManagementService.clearAllCache(false);
      if (cacheResult.success) {
        results.actions.push(`Cache cleared (${cacheResult.clearedItems} items)`);
      } else {
        results.errors.push(`Cache clear failed: ${cacheResult.error}`);
      }

      // Clear additional user data
      await this.clearUserDataStorage();
      results.actions.push('User data cleared');

      // Firebase preferences removed
      results.actions.push('Local data cleared');

      results.success = results.errors.length === 0;
      return results;
    } catch (error) {
      console.error('Error in resetEverything:', error);
      return {
        success: false,
        error: error.message,
        actions: [],
        errors: [error.message]
      };
    }
  }

  // Reset settings only
  static async resetSettingsOnly() {
    try {
      const results = {
        success: true,
        actions: [],
        errors: []
      };

      const settingsResult = await UserSettingsService.resetToDefaults();
      if (settingsResult.success) {
        results.actions.push('All settings reset to defaults');
      } else {
        results.errors.push(`Settings reset failed: ${settingsResult.error}`);
        results.success = false;
      }

      return results;
    } catch (error) {
      console.error('Error in resetSettingsOnly:', error);
      return {
        success: false,
        error: error.message,
        actions: [],
        errors: [error.message]
      };
    }
  }

  // Reset language only
  static async resetLanguageOnly() {
    try {
      const results = {
        success: true,
        actions: [],
        errors: []
      };

      const languageResult = await LanguageService.clearLanguagePreference();
      if (languageResult.success) {
        results.actions.push('Language reset to English');
      } else {
        results.errors.push(`Language reset failed: ${languageResult.error}`);
        results.success = false;
      }

      return results;
    } catch (error) {
      console.error('Error in resetLanguageOnly:', error);
      return {
        success: false,
        error: error.message,
        actions: [],
        errors: [error.message]
      };
    }
  }

  // Reset cache only
  static async resetCacheOnly() {
    try {
      const results = {
        success: true,
        actions: [],
        errors: []
      };

      const cacheResult = await CacheManagementService.clearAllCache(false);
      if (cacheResult.success) {
        results.actions.push(`Cache cleared (${cacheResult.clearedItems} items, ${CacheManagementService.formatBytes(cacheResult.clearedSize)} freed)`);
      } else {
        results.errors.push(`Cache clear failed: ${cacheResult.error}`);
        results.success = false;
      }

      return results;
    } catch (error) {
      console.error('Error in resetCacheOnly:', error);
      return {
        success: false,
        error: error.message,
        actions: [],
        errors: [error.message]
      };
    }
  }

  // Reset preferences (notifications, privacy, etc.)
  static async resetPreferences() {
    try {
      const results = {
        success: true,
        actions: [],
        errors: []
      };

      const currentSettings = UserSettingsService.getCurrentSettings();
      const preferencesToReset = {
        notifications: DEFAULT_SETTINGS.notifications,
        pushNotifications: DEFAULT_SETTINGS.pushNotifications,
        emailNotifications: DEFAULT_SETTINGS.emailNotifications,
        locationServices: DEFAULT_SETTINGS.locationServices,
        analytics: DEFAULT_SETTINGS.analytics,
        shareAnalytics: DEFAULT_SETTINGS.shareAnalytics,
        shareLocation: DEFAULT_SETTINGS.shareLocation,
        marketingEmails: DEFAULT_SETTINGS.marketingEmails
      };

      const settingsResult = await UserSettingsService.saveSettings(preferencesToReset);
      if (settingsResult.success) {
        results.actions.push('Notification and privacy preferences reset');
      } else {
        results.errors.push(`Preferences reset failed: ${settingsResult.error}`);
        results.success = false;
      }

      return results;
    } catch (error) {
      console.error('Error in resetPreferences:', error);
      return {
        success: false,
        error: error.message,
        actions: [],
        errors: [error.message]
      };
    }
  }

  // Reset user data (favorites, reviews, history)
  static async resetUserData() {
    try {
      const results = {
        success: true,
        actions: [],
        errors: []
      };

      // Clear user data from AsyncStorage
      const userData = await this.clearUserDataStorage();
      results.actions.push(`User data cleared (${userData.clearedItems} items)`);

      return results;
    } catch (error) {
      console.error('Error in resetUserData:', error);
      return {
        success: false,
        error: error.message,
        actions: [],
        errors: [error.message]
      };
    }
  }

  // Reset privacy settings
  static async resetPrivacySettings() {
    try {
      const results = {
        success: true,
        actions: [],
        errors: []
      };

      const privacySettings = {
        analytics: DEFAULT_SETTINGS.analytics,
        crashReports: DEFAULT_SETTINGS.crashReports,
        shareAnalytics: DEFAULT_SETTINGS.shareAnalytics,
        shareLocation: DEFAULT_SETTINGS.shareLocation,
        shareReviews: DEFAULT_SETTINGS.shareReviews,
        locationBasedRecommendations: DEFAULT_SETTINGS.locationBasedRecommendations
      };

      const settingsResult = await UserSettingsService.saveSettings(privacySettings);
      if (settingsResult.success) {
        results.actions.push('Privacy settings reset to defaults');
      } else {
        results.errors.push(`Privacy settings reset failed: ${settingsResult.error}`);
        results.success = false;
      }

      return results;
    } catch (error) {
      console.error('Error in resetPrivacySettings:', error);
      return {
        success: false,
        error: error.message,
        actions: [],
        errors: [error.message]
      };
    }
  }

  // Clear user data from AsyncStorage
  static async clearUserDataStorage(userId = null) {
    try {
      const userSuffix = userId ? `_${userId}` : '_guest';
      
      const userDataKeys = [
        `@tourist_app_favorites${userSuffix}`,
        `@tourist_app_reviews${userSuffix}`,
        `@tourist_app_support_history${userSuffix}`,
        '@tourist_app_search_history',
        'emailHistory'
      ];

      let clearedItems = 0;
      
      for (const key of userDataKeys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            await AsyncStorage.removeItem(key);
            clearedItems++;
          }
        } catch (error) {
          console.warn(`Error clearing user data key ${key}:`, error.message);
        }
      }

      console.log(`Cleared ${clearedItems} user data items`);
      return { clearedItems };
    } catch (error) {
      console.error('Error clearing user data storage:', error);
      return { clearedItems: 0 };
    }
  }

  // Firebase user preferences removed - using local storage only

  // Log reset action for analytics
  static async logResetAction(resetCategory, resetResults) {
    try {
      const resetLog = {
        category: resetCategory,
        timestamp: new Date().toISOString(),
        success: resetResults.success,
        actions: resetResults.actions,
        errors: resetResults.errors,
        userId: 'guest'
      };

      // Save locally
      const logKey = `@tourist_app_reset_log_${Date.now()}`;
      await AsyncStorage.setItem(logKey, JSON.stringify(resetLog));

      console.log('Reset action logged:', resetLog);
    } catch (error) {
      console.error('Error logging reset action:', error);
    }
  }

  // Get reset history
  static async getResetHistory() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const resetLogKeys = allKeys.filter(key => key.startsWith('@tourist_app_reset_log_'));
      
      const resetHistory = [];
      for (const key of resetLogKeys) {
        try {
          const logString = await AsyncStorage.getItem(key);
          if (logString) {
            const log = JSON.parse(logString);
            resetHistory.push(log);
          }
        } catch (error) {
          console.warn(`Error reading reset log ${key}:`, error.message);
        }
      }

      // Sort by timestamp (newest first)
      resetHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return resetHistory;
    } catch (error) {
      console.error('Error getting reset history:', error);
      return [];
    }
  }

  // Clear reset history
  static async clearResetHistory() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const resetLogKeys = allKeys.filter(key => key.startsWith('@tourist_app_reset_log_'));
      
      for (const key of resetLogKeys) {
        await AsyncStorage.removeItem(key);
      }

      console.log(`Cleared ${resetLogKeys.length} reset history entries`);
      return {
        success: true,
        clearedEntries: resetLogKeys.length
      };
    } catch (error) {
      console.error('Error clearing reset history:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get reset options for UI
  static getResetOptions() {
    return RESET_OPTIONS;
  }

  // Validate reset category
  static isValidResetCategory(category) {
    return Object.values(RESET_CATEGORIES).includes(category);
  }

  // Get reset category by id
  static getResetOptionById(id) {
    return RESET_OPTIONS.find(option => option.id === id);
  }

  // Check if reset is needed (based on app state)
  static async isResetRecommended() {
    try {
      // Check various factors that might indicate reset is needed
      const factors = {
        cacheSize: false,
        settingsCorrupted: false,
        performanceIssues: false,
        storageIssues: false
      };

      // Check cache size
      const cacheCleanupInfo = await CacheManagementService.isCacheCleanupNeeded();
      factors.cacheSize = cacheCleanupInfo.recommendation === 'urgent';

      // Check settings integrity
      try {
        const currentSettings = UserSettingsService.getCurrentSettings();
        factors.settingsCorrupted = Object.keys(currentSettings).length < Object.keys(DEFAULT_SETTINGS).length / 2;
      } catch (error) {
        factors.settingsCorrupted = true;
      }

      const recommendationLevel = Object.values(factors).filter(Boolean).length;
      
      return {
        recommended: recommendationLevel >= 2,
        factors,
        recommendationLevel,
        suggestedAction: recommendationLevel >= 3 ? 
          RESET_CATEGORIES.ALL : 
          recommendationLevel >= 2 ? 
          RESET_CATEGORIES.SETTINGS_ONLY : 
          RESET_CATEGORIES.CACHE_ONLY
      };
    } catch (error) {
      console.error('Error checking if reset is recommended:', error);
      return {
        recommended: false,
        factors: {},
        recommendationLevel: 0,
        suggestedAction: null
      };
    }
  }
}

export default SettingsResetService; 
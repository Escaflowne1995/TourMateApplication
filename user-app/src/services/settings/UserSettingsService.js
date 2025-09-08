import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import NotificationService from '../notifications/NotificationService';

const SETTINGS_STORAGE_KEY = '@tourist_app_settings';

// Default settings configuration
export const DEFAULT_SETTINGS = {
  notifications: true,
  locationServices: true,
  offlineMode: false,
  autoSync: true,
  analytics: true,
  crashReports: true,
  darkMode: false,
  pushNotifications: true,
  emailNotifications: true,
  locationBasedRecommendations: true,
  dataCompression: true,
  automaticDownloads: false,
  highQualityImages: true,
  batteryOptimization: false,
  cellularDataUsage: true,
  backgroundAppRefresh: true,
  vibration: true,
  soundEffects: true,
  shareAnalytics: true,
  shareLocation: false,
  shareReviews: true,
  marketingEmails: false,
  newsUpdates: true,
  systemNotifications: true
};

// Settings categories for organization
export const SETTINGS_CATEGORIES = {
  GENERAL: 'general',
  DATA_STORAGE: 'dataStorage',
  PRIVACY: 'privacy',
  NOTIFICATIONS: 'notifications',
  APPEARANCE: 'appearance',
  ADVANCED: 'advanced'
};

class UserSettingsService {
  static currentSettings = { ...DEFAULT_SETTINGS };

  // Get user-specific storage key
  static getUserStorageKey(userId = null) {
    if (userId) {
      return `${SETTINGS_STORAGE_KEY}_${userId}`;
    }
    return `${SETTINGS_STORAGE_KEY}_guest`;
  }

  // Load all settings from AsyncStorage
  static async loadSettings(userId = null) {
    try {
      let settings = { ...DEFAULT_SETTINGS };

      const storageKey = this.getUserStorageKey(userId);
      const savedSettings = await AsyncStorage.getItem(storageKey);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        settings = { ...DEFAULT_SETTINGS, ...parsedSettings };
        console.log('Settings loaded from AsyncStorage');
      }

      this.currentSettings = settings;
      return settings;
    } catch (error) {
      console.error('Error loading settings:', error);
      this.currentSettings = { ...DEFAULT_SETTINGS };
      return { ...DEFAULT_SETTINGS };
    }
  }

  // Save all settings to AsyncStorage
  static async saveSettings(newSettings, userId = null) {
    try {
      const mergedSettings = { ...this.currentSettings, ...newSettings };

      // Save to AsyncStorage
      const storageKey = this.getUserStorageKey(userId);
      await AsyncStorage.setItem(storageKey, JSON.stringify(mergedSettings));
      console.log('Settings saved to AsyncStorage');

      this.currentSettings = mergedSettings;
      return {
        success: true,
        settings: mergedSettings
      };
    } catch (error) {
      console.error('Error saving settings:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Toggle a specific setting
  static async toggleSetting(settingKey) {
    try {
      if (!(settingKey in DEFAULT_SETTINGS)) {
        throw new Error(`Unknown setting: ${settingKey}`);
      }

      const currentValue = this.currentSettings[settingKey];
      const newValue = !currentValue;

      // Handle special cases that require system permissions
      if (settingKey === 'notifications' || settingKey === 'pushNotifications') {
        const permissionResult = await this.handleNotificationPermission(newValue);
        if (!permissionResult.success && newValue) {
          return permissionResult;
        }
      }

      if (settingKey === 'locationServices') {
        const permissionResult = await this.handleLocationPermission(newValue);
        if (!permissionResult.success && newValue) {
          return permissionResult;
        }
      }

      const result = await this.saveSettings({ [settingKey]: newValue });
      if (result.success) {
        console.log(`Setting ${settingKey} toggled to:`, newValue);
      }
      
      return result;
    } catch (error) {
      console.error(`Error toggling setting ${settingKey}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Handle notification permission
  static async handleNotificationPermission(enable) {
    try {
      if (enable) {
        // Request notification permissions
        const permissionResult = await NotificationService.requestPermissions();
        
        if (!permissionResult.success) {
          return {
            success: false,
            error: permissionResult.error || 'Failed to get notification permission'
          };
        }
        
        if (!permissionResult.granted) {
          return {
            success: false,
            error: 'Notification permission denied. Please enable notifications in your device settings.',
            requiresPermission: true
          };
        }
        
        // Initialize notification service if permissions granted
        const initResult = await NotificationService.initialize();
        if (!initResult.success) {
          console.warn('Failed to initialize notification service:', initResult.error);
          // Don't fail the setting toggle, just log warning
        }
        
        return { success: true };
      } else {
        // Disable notifications - cancel all scheduled notifications
        await NotificationService.cancelAllNotifications();
        return { success: true };
      }
    } catch (error) {
      console.error('Error handling notification permission:', error);
      return {
        success: false,
        error: 'Failed to handle notification permission'
      };
    }
  }

  // Handle location permission
  static async handleLocationPermission(enable) {
    try {
      if (enable) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return {
            success: false,
            error: 'Location permission denied',
            requiresPermission: true
          };
        }
      }
      return { success: true };
    } catch (error) {
      console.error('Error handling location permission:', error);
      return {
        success: false,
        error: 'Failed to handle location permission'
      };
    }
  }

  // Get current settings
  static getCurrentSettings() {
    return { ...this.currentSettings };
  }

  // Get a specific setting value
  static getSetting(settingKey) {
    return this.currentSettings[settingKey];
  }

  // Reset all settings to defaults
  static async resetToDefaults() {
    try {
      const result = await this.saveSettings(DEFAULT_SETTINGS);
      if (result.success) {
        console.log('All settings reset to defaults');
        return {
          success: true,
          message: 'All settings have been reset to default values'
        };
      }
      return result;
    } catch (error) {
      console.error('Error resetting settings:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get settings by category
  static getSettingsByCategory(category) {
    const categoryMap = {
      [SETTINGS_CATEGORIES.GENERAL]: [
        'notifications', 'locationServices', 'vibration', 'soundEffects'
      ],
      [SETTINGS_CATEGORIES.DATA_STORAGE]: [
        'offlineMode', 'autoSync', 'dataCompression', 'automaticDownloads',
        'highQualityImages', 'cellularDataUsage', 'backgroundAppRefresh'
      ],
      [SETTINGS_CATEGORIES.PRIVACY]: [
        'analytics', 'crashReports', 'shareAnalytics', 'shareLocation',
        'shareReviews', 'locationBasedRecommendations'
      ],
      [SETTINGS_CATEGORIES.NOTIFICATIONS]: [
        'pushNotifications', 'emailNotifications', 'marketingEmails',
        'newsUpdates', 'systemNotifications'
      ],
      [SETTINGS_CATEGORIES.APPEARANCE]: [
        'darkMode'
      ],
      [SETTINGS_CATEGORIES.ADVANCED]: [
        'batteryOptimization'
      ]
    };

    const keys = categoryMap[category] || [];
    const categorySettings = {};
    keys.forEach(key => {
      categorySettings[key] = this.currentSettings[key];
    });

    return categorySettings;
  }

  // Initialize settings service
  static async initialize(userId = null) {
    await this.migrateOldData(userId);
    const settings = await this.loadSettings(userId);
    console.log('UserSettingsService initialized with settings:', Object.keys(settings));
    return settings;
  }

  // Migrate old settings data
  static async migrateOldData(userId = null) {
    try {
      if (!userId) return;

      const userSpecificKey = this.getUserStorageKey(userId);
      const existingUserData = await AsyncStorage.getItem(userSpecificKey);
      
      if (existingUserData) {
        return; // User already has their own data
      }

      // Check for old shared settings
      const oldSharedData = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (oldSharedData) {
        await AsyncStorage.setItem(userSpecificKey, oldSharedData);
        console.log('Migrated settings for user:', userId);
        
        // Clear old shared data
        await AsyncStorage.removeItem(SETTINGS_STORAGE_KEY);
        console.log('Cleared old shared settings data');
      }
    } catch (error) {
      console.error('Error migrating settings data:', error);
    }
  }

  // Clear all settings
  static async clearSettings(userId = null) {
    try {
      const storageKey = this.getUserStorageKey(userId);
      await AsyncStorage.removeItem(storageKey);
      
      this.currentSettings = { ...DEFAULT_SETTINGS };
      console.log('All settings cleared and reset to defaults');
      
      return {
        success: true,
        message: 'All settings cleared successfully'
      };
    } catch (error) {
      console.error('Error clearing settings:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Export settings (for backup)
  static async exportSettings() {
    try {
      const settings = this.getCurrentSettings();
      const exportData = {
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      return {
        success: true,
        data: JSON.stringify(exportData, null, 2)
      };
    } catch (error) {
      console.error('Error exporting settings:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Import settings (from backup)
  static async importSettings(settingsData) {
    try {
      const parsedData = JSON.parse(settingsData);
      if (!parsedData.settings) {
        throw new Error('Invalid settings data format');
      }

      // Validate settings against defaults
      const validSettings = {};
      Object.keys(DEFAULT_SETTINGS).forEach(key => {
        if (key in parsedData.settings) {
          validSettings[key] = parsedData.settings[key];
        } else {
          validSettings[key] = DEFAULT_SETTINGS[key];
        }
      });

      const result = await this.saveSettings(validSettings);
      if (result.success) {
        return {
          success: true,
          message: 'Settings imported successfully'
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error importing settings:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default UserSettingsService; 
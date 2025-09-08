import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Cache categories for selective clearing
export const CACHE_CATEGORIES = {
  USER_DATA: 'userData',
  IMAGES: 'images',
  MAPS: 'maps',
  ATTRACTIONS: 'attractions',
  REVIEWS: 'reviews',
  FAVORITES: 'favorites',
  SEARCH_HISTORY: 'searchHistory',
  OFFLINE_CONTENT: 'offlineContent',
  SETTINGS: 'settings',
  EMAIL_HISTORY: 'emailHistory',
  SUPPORT_HISTORY: 'supportHistory',
  TEMPORARY: 'temporary'
};

// Storage keys to cache size mapping
export const STORAGE_KEYS = {
  [CACHE_CATEGORIES.USER_DATA]: [
    '@tourist_app_user_data',
    '@tourist_app_profile_'
  ],
  [CACHE_CATEGORIES.IMAGES]: [
    '@tourist_app_images_',
    '@tourist_app_cached_images'
  ],
  [CACHE_CATEGORIES.MAPS]: [
    '@tourist_app_maps_',
    '@tourist_app_offline_maps'
  ],
  [CACHE_CATEGORIES.ATTRACTIONS]: [
    '@tourist_app_attractions_',
    '@tourist_app_cached_attractions'
  ],
  [CACHE_CATEGORIES.REVIEWS]: [
    '@tourist_app_reviews_'
  ],
  [CACHE_CATEGORIES.FAVORITES]: [
    '@tourist_app_favorites_'
  ],
  [CACHE_CATEGORIES.SEARCH_HISTORY]: [
    '@tourist_app_search_history',
    '@tourist_app_recent_searches'
  ],
  [CACHE_CATEGORIES.OFFLINE_CONTENT]: [
    '@tourist_app_offline_',
    '@tourist_app_downloaded_'
  ],
  [CACHE_CATEGORIES.SETTINGS]: [
    '@tourist_app_settings_',
    '@tourist_app_preferences_'
  ],
  [CACHE_CATEGORIES.EMAIL_HISTORY]: [
    'emailHistory'
  ],
  [CACHE_CATEGORIES.SUPPORT_HISTORY]: [
    '@tourist_app_support_history_'
  ],
  [CACHE_CATEGORIES.TEMPORARY]: [
    '@tourist_app_temp_',
    '@tourist_app_cache_'
  ]
};

class CacheManagementService {
  
  // Calculate total cache size
  static async calculateCacheSize() {
    try {
      const cacheInfo = {
        totalSize: 0,
        categories: {},
        breakdown: {
          asyncStorage: 0,
          fileSystem: 0,
          images: 0,
          documents: 0
        }
      };

      // Calculate AsyncStorage size
      const asyncStorageSize = await this.calculateAsyncStorageSize();
      cacheInfo.breakdown.asyncStorage = asyncStorageSize.totalSize;
      cacheInfo.categories = asyncStorageSize.categories;

      // File system cache calculation not available without expo-file-system
      cacheInfo.breakdown.fileSystem = 0;
      cacheInfo.breakdown.images = 0;
      cacheInfo.breakdown.documents = 0;

      // Total size (only AsyncStorage for now)
      cacheInfo.totalSize = cacheInfo.breakdown.asyncStorage;

      console.log('Cache size calculated:', this.formatBytes(cacheInfo.totalSize));
      return cacheInfo;
    } catch (error) {
      console.error('Error calculating cache size:', error);
      return {
        totalSize: 0,
        categories: {},
        breakdown: { asyncStorage: 0, fileSystem: 0, images: 0, documents: 0 },
        error: error.message
      };
    }
  }

  // Calculate AsyncStorage size by category
  static async calculateAsyncStorageSize() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const categories = {};
      let totalSize = 0;

      for (const [category, keyPatterns] of Object.entries(STORAGE_KEYS)) {
        categories[category] = 0;
        
        for (const key of allKeys) {
          const matchesPattern = keyPatterns.some(pattern => 
            key.startsWith(pattern) || key.includes(pattern)
          );
          
          if (matchesPattern) {
            try {
              const value = await AsyncStorage.getItem(key);
              if (value) {
                const size = new Blob([value]).size;
                categories[category] += size;
                totalSize += size;
              }
            } catch (error) {
              console.warn(`Error reading key ${key}:`, error.message);
            }
          }
        }
      }

      return { totalSize, categories };
    } catch (error) {
      console.error('Error calculating AsyncStorage size:', error);
      return { totalSize: 0, categories: {} };
    }
  }

  // File system cache calculation - Placeholder for future implementation
  // Note: Requires expo-file-system package to be installed
  static async calculateFileSystemSize() {
    console.log('File system cache calculation not available - expo-file-system not installed');
    return { totalSize: 0, images: 0, documents: 0 };
  }

  // Directory size calculation - Placeholder for future implementation
  // Note: Requires expo-file-system package to be installed
  static async getDirectorySize(directoryPath) {
    console.log('Directory size calculation not available - expo-file-system not installed');
    return { size: 0, images: 0, documents: 0 };
  }

  // Clear cache by category
  static async clearCacheByCategory(category, showConfirmation = true) {
    try {
      const categoryName = this.getCategoryDisplayName(category);
      
      if (showConfirmation) {
        return new Promise((resolve) => {
          Alert.alert(
            'Clear Cache',
            `This will clear all ${categoryName} data. Continue?`,
            [
              { 
                text: 'Cancel', 
                style: 'cancel',
                onPress: () => resolve({ success: false, cancelled: true })
              },
              {
                text: 'Clear',
                style: 'destructive',
                onPress: async () => {
                  const result = await this.performCacheClear(category);
                  resolve(result);
                }
              }
            ]
          );
        });
      } else {
        return await this.performCacheClear(category);
      }
    } catch (error) {
      console.error(`Error clearing cache for category ${category}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Perform actual cache clearing
  static async performCacheClear(category) {
    try {
      let clearedItems = 0;
      let clearedSize = 0;

      // Clear AsyncStorage items for this category
      const keyPatterns = STORAGE_KEYS[category] || [];
      const allKeys = await AsyncStorage.getAllKeys();
      
      for (const key of allKeys) {
        const matchesPattern = keyPatterns.some(pattern => 
          key.startsWith(pattern) || key.includes(pattern)
        );
        
        if (matchesPattern) {
          try {
            const value = await AsyncStorage.getItem(key);
            if (value) {
              clearedSize += new Blob([value]).size;
            }
            await AsyncStorage.removeItem(key);
            clearedItems++;
          } catch (error) {
            console.warn(`Error clearing key ${key}:`, error.message);
          }
        }
      }

      // File system clearing not available without expo-file-system
      // Only AsyncStorage items are cleared for now

      console.log(`Cleared ${clearedItems} items, ${this.formatBytes(clearedSize)} freed`);
      
      return {
        success: true,
        clearedItems,
        clearedSize,
        message: `${this.getCategoryDisplayName(category)} cleared successfully. ${this.formatBytes(clearedSize)} freed.`
      };
    } catch (error) {
      console.error('Error performing cache clear:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Clear all cache
  static async clearAllCache(showConfirmation = true) {
    try {
      if (showConfirmation) {
        return new Promise((resolve) => {
          Alert.alert(
            'Clear All Cache',
            'This will clear all cached data including offline maps and images. Continue?',
            [
              { 
                text: 'Cancel', 
                style: 'cancel',
                onPress: () => resolve({ success: false, cancelled: true })
              },
              {
                text: 'Clear All',
                style: 'destructive',
                onPress: async () => {
                  const result = await this.performFullCacheClear();
                  resolve(result);
                }
              }
            ]
          );
        });
      } else {
        return await this.performFullCacheClear();
      }
    } catch (error) {
      console.error('Error clearing all cache:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Perform full cache clear
  static async performFullCacheClear() {
    try {
      let totalClearedSize = 0;
      let totalClearedItems = 0;

      // Clear all AsyncStorage except critical user data
      const criticalKeys = [
        '@tourist_app_language_',
        '@tourist_app_settings_',
        'emailHistory'
      ];

      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(key => {
        return !criticalKeys.some(criticalPattern => 
          key.startsWith(criticalPattern)
        );
      });

      for (const key of keysToRemove) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            totalClearedSize += new Blob([value]).size;
          }
          await AsyncStorage.removeItem(key);
          totalClearedItems++;
        } catch (error) {
          console.warn(`Error clearing key ${key}:`, error.message);
        }
      }

      // File system cache clearing not available without expo-file-system

      console.log(`Full cache clear: ${totalClearedItems} items, ${this.formatBytes(totalClearedSize)} freed`);

      return {
        success: true,
        clearedItems: totalClearedItems,
        clearedSize: totalClearedSize,
        message: `All cache cleared successfully. ${this.formatBytes(totalClearedSize)} freed.`
      };
    } catch (error) {
      console.error('Error performing full cache clear:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Clear image cache - Placeholder for future implementation
  // Note: Requires expo-file-system package to be installed
  static async clearImageCache() {
    console.log('Image cache clearing not available - expo-file-system not installed');
    return 0;
  }

  // Clear temporary files - Placeholder for future implementation  
  // Note: Requires expo-file-system package to be installed
  static async clearTemporaryFiles() {
    console.log('Temporary files clearing not available - expo-file-system not installed');
    return 0;
  }

  // Clear file system cache - Placeholder for future implementation
  // Note: Requires expo-file-system package to be installed
  static async clearFileSystemCache() {
    console.log('File system cache clearing not available - expo-file-system not installed');
    return 0;
  }

  // Get cache categories with sizes
  static async getCacheCategoriesWithSizes() {
    try {
      const cacheInfo = await this.calculateCacheSize();
      const categoriesWithSizes = Object.entries(cacheInfo.categories).map(([category, size]) => ({
        category,
        displayName: this.getCategoryDisplayName(category),
        size,
        formattedSize: this.formatBytes(size)
      })).sort((a, b) => b.size - a.size);

      return categoriesWithSizes;
    } catch (error) {
      console.error('Error getting cache categories with sizes:', error);
      return [];
    }
  }

  // Get category display name
  static getCategoryDisplayName(category) {
    const displayNames = {
      [CACHE_CATEGORIES.USER_DATA]: 'User Data',
      [CACHE_CATEGORIES.IMAGES]: 'Images',
      [CACHE_CATEGORIES.MAPS]: 'Maps',
      [CACHE_CATEGORIES.ATTRACTIONS]: 'Attractions',
      [CACHE_CATEGORIES.REVIEWS]: 'Reviews',
      [CACHE_CATEGORIES.FAVORITES]: 'Favorites',
      [CACHE_CATEGORIES.SEARCH_HISTORY]: 'Search History',
      [CACHE_CATEGORIES.OFFLINE_CONTENT]: 'Offline Content',
      [CACHE_CATEGORIES.SETTINGS]: 'Settings',
      [CACHE_CATEGORIES.EMAIL_HISTORY]: 'Email History',
      [CACHE_CATEGORIES.SUPPORT_HISTORY]: 'Support History',
      [CACHE_CATEGORIES.TEMPORARY]: 'Temporary Files'
    };

    return displayNames[category] || category;
  }

  // Format bytes to human readable format
  static formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Check if cache cleanup is needed
  static async isCacheCleanupNeeded() {
    try {
      const cacheInfo = await this.calculateCacheSize();
      const totalSizeMB = cacheInfo.totalSize / (1024 * 1024);
      
      // Recommend cleanup if cache is over 100MB
      return {
        needed: totalSizeMB > 100,
        totalSize: cacheInfo.totalSize,
        totalSizeMB: totalSizeMB,
        recommendation: totalSizeMB > 500 ? 'urgent' : totalSizeMB > 200 ? 'recommended' : 'optional'
      };
    } catch (error) {
      console.error('Error checking cache cleanup need:', error);
      return { needed: false, totalSize: 0, totalSizeMB: 0, recommendation: 'unknown' };
    }
  }

  // Schedule automatic cache cleanup
  static async scheduleAutomaticCleanup() {
    try {
      const cleanupInfo = await this.isCacheCleanupNeeded();
      
      if (cleanupInfo.needed && cleanupInfo.recommendation === 'urgent') {
        Alert.alert(
          'Storage Warning',
          `Your app cache is using ${this.formatBytes(cleanupInfo.totalSize)}. Would you like to clear some cache to free up space?`,
          [
            { text: 'Not Now', style: 'cancel' },
            { 
              text: 'Clear Cache', 
              onPress: () => this.clearAllCache(false)
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error in automatic cleanup check:', error);
    }
  }
}

export default CacheManagementService; 
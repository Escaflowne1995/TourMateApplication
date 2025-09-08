import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const LANGUAGE_STORAGE_KEY = '@tourist_app_language';
const DEFAULT_LANGUAGE = 'en';

export const SUPPORTED_LANGUAGES = [
  { id: '1', name: 'English', nativeName: 'English', code: 'en' },
  { id: '2', name: 'Filipino', nativeName: 'Filipino', code: 'fil' },
  { id: '3', name: 'Cebuano', nativeName: 'Bisaya', code: 'ceb' },
  { id: '4', name: 'Spanish', nativeName: 'Español', code: 'es' },
  { id: '5', name: 'Chinese (Simplified)', nativeName: '中文(简体)', code: 'zh-CN' },
  { id: '6', name: 'Japanese', nativeName: '日本語', code: 'ja' },
  { id: '7', name: 'Korean', nativeName: '한국어', code: 'ko' },
];

class LanguageService {
  static currentLanguage = DEFAULT_LANGUAGE;

  // Get user-specific storage key
  static getUserStorageKey() {
    // Use guest storage for now (can be enhanced with user ID from local auth later)
    return `${LANGUAGE_STORAGE_KEY}_guest`;
  }

  // Load language preference from AsyncStorage (local only)
  static async loadLanguagePreference() {
    try {
      let languageCode = DEFAULT_LANGUAGE;

      // Load from AsyncStorage
      const storageKey = this.getUserStorageKey();
      const savedLanguage = await AsyncStorage.getItem(storageKey);
      if (savedLanguage) {
        languageCode = savedLanguage;
        console.log('Language loaded from AsyncStorage:', languageCode);
      }

      // Validate that the language is supported
      const isSupported = SUPPORTED_LANGUAGES.some(lang => lang.code === languageCode);
      if (!isSupported) {
        languageCode = DEFAULT_LANGUAGE;
        console.warn('Unsupported language code, falling back to default:', languageCode);
      }

      this.currentLanguage = languageCode;
      return languageCode;
    } catch (error) {
      console.error('Error loading language preference:', error);
      this.currentLanguage = DEFAULT_LANGUAGE;
      return DEFAULT_LANGUAGE;
    }
  }

  // Save language preference to AsyncStorage
  static async saveLanguagePreference(languageCode) {
    try {
      // Validate language code
      const language = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
      if (!language) {
        throw new Error(`Unsupported language code: ${languageCode}`);
      }

      // Save to AsyncStorage (always works, even offline)
      const storageKey = this.getUserStorageKey();
      await AsyncStorage.setItem(storageKey, languageCode);
      console.log('Language saved to AsyncStorage:', languageCode);

      // Firebase removed - using local storage only

      this.currentLanguage = languageCode;
      return {
        success: true,
        language: language,
        message: `Language changed to ${language.name}`
      };
    } catch (error) {
      console.error('Error saving language preference:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get current language preference
  static getCurrentLanguage() {
    return this.currentLanguage;
  }

  // Get language object by code
  static getLanguageByCode(code) {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code) || SUPPORTED_LANGUAGES[0];
  }

  // Get all supported languages
  static getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }

  // Change language with user confirmation
  static async changeLanguage(languageCode, languageName, navigation, showConfirmation = true) {
    const currentLang = this.getCurrentLanguage();
    
    // If it's the same language, no need to change
    if (languageCode === currentLang) {
      return {
        success: false,
        message: `${languageName} is already selected`
      };
    }

    const handleLanguageChange = async () => {
      const result = await this.saveLanguagePreference(languageCode);
      if (result.success) {
        // Show restart notification
        Alert.alert(
          'Language Changed',
          'The app will restart after changing the language to apply the new settings.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                // In a real app, you might use a library like expo-updates for restart
                // For now, just navigate back
                if (navigation) {
                  navigation.goBack();
                }
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Error', `Failed to change language: ${result.error}`);
      }
      return result;
    };

    if (showConfirmation) {
      return new Promise((resolve) => {
        Alert.alert(
          'Change Language',
          `Change language to ${languageName}?`,
          [
            { 
              text: 'Cancel', 
              style: 'cancel',
              onPress: () => resolve({ success: false, cancelled: true })
            },
            {
              text: 'Change',
              onPress: async () => {
                const result = await handleLanguageChange();
                resolve(result);
              }
            }
          ]
        );
      });
    } else {
      return await handleLanguageChange();
    }
  }

  // Initialize language service (call this on app startup)
  static async initialize() {
    const language = await this.loadLanguagePreference();
    console.log('LanguageService initialized with language:', language);
    return language;
  }

  // Migrate old language data (if needed)
  static async migrateOldData() {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userSpecificKey = this.getUserStorageKey();
      const existingUserData = await AsyncStorage.getItem(userSpecificKey);
      
      if (existingUserData) {
        return; // User already has their own data
      }

      // Check for old shared language preference
      const oldSharedData = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (oldSharedData) {
        await AsyncStorage.setItem(userSpecificKey, oldSharedData);
        console.log('Migrated language preference for user:', user.email);
        
        // Clear old shared data
        await AsyncStorage.removeItem(LANGUAGE_STORAGE_KEY);
        console.log('Cleared old shared language data');
      }
    } catch (error) {
      console.error('Error migrating language data:', error);
    }
  }

  // Clear language preference (reset to default)
  static async clearLanguagePreference() {
    try {
      const storageKey = this.getUserStorageKey();
      await AsyncStorage.removeItem(storageKey);
      
      // Firebase removed - cleared from local storage only
      
      this.currentLanguage = DEFAULT_LANGUAGE;
      console.log('Language preference cleared, reset to default');
      
      return {
        success: true,
        message: 'Language preference reset to default'
      };
    } catch (error) {
      console.error('Error clearing language preference:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default LanguageService; 
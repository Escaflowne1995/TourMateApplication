import LanguageService from '../settings/LanguageService';
import UserSettingsService from '../settings/UserSettingsService';
import HelpSupportService from '../settings/HelpSupportService';
import CacheManagementService from '../settings/CacheManagementService';
import NotificationService from '../notifications/NotificationService';

class AppInitializationService {
  static isInitialized = false;
  static initializationPromise = null;

  // Main initialization method
  static async initialize() {
    // Prevent multiple simultaneous initializations
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.isInitialized) {
      console.log('App services already initialized');
      return { success: true, message: 'Already initialized' };
    }

    this.initializationPromise = this.performInitialization();
    const result = await this.initializationPromise;
    
    // Clear the promise after completion
    this.initializationPromise = null;
    
    return result;
  }

  // Perform the actual initialization
  static async performInitialization() {
    try {
      console.log('🚀 Starting app services initialization...');
      const startTime = Date.now();
      
      const initResults = {
        language: null,
        settings: null,
        helpSupport: null,
        cache: null,
        notifications: null,
        errors: []
      };

      // Initialize Language Service
      try {
        console.log('📱 Initializing Language Service...');
        const language = await LanguageService.initialize();
        initResults.language = language;
        console.log(`✅ Language Service initialized (${language})`);
      } catch (error) {
        console.error('❌ Language Service initialization failed:', error);
        initResults.errors.push({
          service: 'LanguageService',
          error: error.message
        });
      }

      // Initialize User Settings Service
      try {
        console.log('⚙️ Initializing User Settings Service...');
        const settings = await UserSettingsService.initialize();
        initResults.settings = settings;
        console.log('✅ User Settings Service initialized');
      } catch (error) {
        console.error('❌ User Settings Service initialization failed:', error);
        initResults.errors.push({
          service: 'UserSettingsService',
          error: error.message
        });
      }

      // Initialize Help Support Service
      try {
        console.log('🆘 Initializing Help Support Service...');
        await HelpSupportService.initialize();
        initResults.helpSupport = true;
        console.log('✅ Help Support Service initialized');
      } catch (error) {
        console.error('❌ Help Support Service initialization failed:', error);
        initResults.errors.push({
          service: 'HelpSupportService',
          error: error.message
        });
      }

      // Initialize Cache Management (check if cleanup is needed)
      try {
        console.log('🗄️ Checking cache status...');
        const cacheCleanupInfo = await CacheManagementService.isCacheCleanupNeeded();
        initResults.cache = cacheCleanupInfo;
        
        if (cacheCleanupInfo.needed && cacheCleanupInfo.recommendation === 'urgent') {
          console.log('⚠️ Cache cleanup urgently needed');
          // Schedule automatic cleanup check
          setTimeout(() => {
            CacheManagementService.scheduleAutomaticCleanup();
          }, 5000); // Wait 5 seconds after app start
        }
        
        console.log('✅ Cache Management Service initialized');
      } catch (error) {
        console.error('❌ Cache Management Service initialization failed:', error);
        initResults.errors.push({
          service: 'CacheManagementService',
          error: error.message
        });
      }

      // Initialize Notification Service (only if notifications are enabled)
      try {
        console.log('🔔 Initializing Notification Service...');
        const settings = UserSettingsService.getCurrentSettings();
        
        if (settings.notifications || settings.pushNotifications) {
          const notificationResult = await NotificationService.initialize();
          initResults.notifications = notificationResult;
          console.log('✅ Notification Service initialized');
        } else {
          console.log('📴 Notifications disabled, skipping Notification Service initialization');
          initResults.notifications = { success: true, skipped: true };
        }
      } catch (error) {
        console.error('❌ Notification Service initialization failed:', error);
        initResults.errors.push({
          service: 'NotificationService',
          error: error.message
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      this.isInitialized = true;
      
      const successCount = Object.values(initResults).filter(Boolean).length - 1; // -1 for errors array
      const totalServices = 5;
      
      console.log(`🎉 App initialization completed in ${duration}ms`);
      console.log(`📊 Success: ${successCount}/${totalServices} services initialized`);
      
      if (initResults.errors.length > 0) {
        console.warn('⚠️ Some services failed to initialize:', initResults.errors);
      }

      return {
        success: initResults.errors.length === 0,
        duration,
        results: initResults,
        message: `Initialized ${successCount}/${totalServices} services successfully`
      };
    } catch (error) {
      console.error('💥 App initialization failed:', error);
      this.isInitialized = false;
      
      return {
        success: false,
        error: error.message,
        message: 'App initialization failed'
      };
    }
  }

  // Reinitialize services (useful after user login/logout)
  static async reinitialize() {
    console.log('🔄 Reinitializing app services...');
    this.isInitialized = false;
    this.initializationPromise = null;
    
    return await this.initialize();
  }

  // Initialize services for a specific user (after login)
  static async initializeForUser(userData) {
    try {
      console.log(`👤 Initializing services for user: ${userData.email}`);
      
      // Migrate any old data to user-specific storage
      await Promise.all([
        LanguageService.migrateOldData(),
        UserSettingsService.migrateOldData()
      ]);

      // Reload user-specific settings
      await Promise.all([
        LanguageService.loadLanguagePreference(),
        UserSettingsService.loadSettings()
      ]);

      console.log('✅ User-specific initialization completed');
      
      return {
        success: true,
        message: `Services initialized for user: ${userData.email}`
      };
    } catch (error) {
      console.error('❌ User-specific initialization failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Clean up services (useful before app shutdown or logout)
  static async cleanup() {
    try {
      console.log('🧹 Cleaning up app services...');
      
      // No specific cleanup needed for current services
      // but this method can be extended in the future
      
      this.isInitialized = false;
      this.initializationPromise = null;
      
      console.log('✅ App services cleanup completed');
      
      return {
        success: true,
        message: 'Services cleaned up successfully'
      };
    } catch (error) {
      console.error('❌ App services cleanup failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get initialization status
  static getInitializationStatus() {
    return {
      isInitialized: this.isInitialized,
      isInitializing: this.initializationPromise !== null
    };
  }

  // Health check for all services
  static async healthCheck() {
    try {
      const healthResults = {
        timestamp: new Date().toISOString(),
        services: {}
      };

      // Check Language Service
      try {
        const currentLang = LanguageService.getCurrentLanguage();
        healthResults.services.language = {
          status: 'healthy',
          currentLanguage: currentLang
        };
      } catch (error) {
        healthResults.services.language = {
          status: 'error',
          error: error.message
        };
      }

      // Check User Settings Service
      try {
        const currentSettings = UserSettingsService.getCurrentSettings();
        healthResults.services.settings = {
          status: 'healthy',
          settingsCount: Object.keys(currentSettings).length
        };
      } catch (error) {
        healthResults.services.settings = {
          status: 'error',
          error: error.message
        };
      }

      // Check Cache Management Service
      try {
        const cacheInfo = await CacheManagementService.calculateCacheSize();
        healthResults.services.cache = {
          status: 'healthy',
          totalSize: CacheManagementService.formatBytes(cacheInfo.totalSize)
        };
      } catch (error) {
        healthResults.services.cache = {
          status: 'error',
          error: error.message
        };
      }

      // Check Help Support Service
      try {
        const contactOptions = HelpSupportService.getContactOptions();
        const faqData = HelpSupportService.getFAQData();
        healthResults.services.helpSupport = {
          status: 'healthy',
          contactOptionsCount: contactOptions.length,
          faqCount: faqData.length
        };
      } catch (error) {
        healthResults.services.helpSupport = {
          status: 'error',
          error: error.message
        };
      }

      // Check Notification Service
      try {
        const notificationToken = NotificationService.getNotificationToken();
        const permissionStatus = await NotificationService.getPermissionStatus();
        healthResults.services.notifications = {
          status: 'healthy',
          hasToken: !!notificationToken,
          permissionStatus: permissionStatus.status
        };
      } catch (error) {
        healthResults.services.notifications = {
          status: 'error',
          error: error.message
        };
      }

      const healthyServices = Object.values(healthResults.services)
        .filter(service => service.status === 'healthy').length;
      const totalServices = Object.keys(healthResults.services).length;

      healthResults.overall = {
        status: healthyServices === totalServices ? 'healthy' : 'degraded',
        healthyServices,
        totalServices
      };

      return healthResults;
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        timestamp: new Date().toISOString(),
        overall: {
          status: 'error',
          error: error.message
        },
        services: {}
      };
    }
  }

  // Quick performance test
  static async performanceTest() {
    const startTime = Date.now();
    
    try {
      await Promise.all([
        LanguageService.getCurrentLanguage(),
        UserSettingsService.getCurrentSettings(),
        HelpSupportService.getFAQData(),
        CacheManagementService.calculateCacheSize()
      ]);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      return {
        success: true,
        duration,
        performance: duration < 1000 ? 'excellent' : 
                    duration < 2000 ? 'good' : 
                    duration < 5000 ? 'acceptable' : 'poor'
      };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      return {
        success: false,
        duration,
        error: error.message
      };
    }
  }
}

export default AppInitializationService; 
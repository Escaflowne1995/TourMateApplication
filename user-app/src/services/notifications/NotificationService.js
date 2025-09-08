import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_TOKEN_KEY = '@tourist_app_notification_token';
const NOTIFICATION_SETTINGS_KEY = '@tourist_app_notification_settings';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NOTIFICATION_TYPES = {
  NEW_ATTRACTION: 'new_attraction',
  TRAVEL_REMINDER: 'travel_reminder',
  REVIEW_RESPONSE: 'review_response',
  RECOMMENDATION: 'recommendation',
  UPDATE: 'app_update',
  MARKETING: 'marketing',
  SYSTEM: 'system'
};

export const NOTIFICATION_CATEGORIES = {
  ATTRACTIONS: 'attractions',
  TRAVEL: 'travel',
  SOCIAL: 'social',
  SYSTEM: 'system',
  MARKETING: 'marketing'
};

class NotificationService {
  static notificationToken = null;
  static notificationListener = null;
  static responseListener = null;

  /**
   * Initialize notification service
   */
  static async initialize() {
    try {
      // Register for push notifications
      await this.registerForPushNotifications();
      
      // Set up notification categories
      await this.setupNotificationCategories();
      
      // Set up listeners
      this.setupNotificationListeners();
      
      console.log('NotificationService initialized successfully');
      return { success: true };
    } catch (error) {
      console.error('Error initializing NotificationService:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Request notification permissions and get token
   */
  static async registerForPushNotifications() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        throw new Error('Failed to get push token for push notification!');
      }
      
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      } catch (e) {
        token = `${Platform.OS}-${Math.random().toString(36).substring(7)}`;
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    if (token) {
      this.notificationToken = token;
      await AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, token);
      console.log('Push notification token:', token);
    }

    return token;
  }

  /**
   * Setup notification categories for different types
   */
  static async setupNotificationCategories() {
    await Notifications.setNotificationCategoryAsync('ATTRACTION_CATEGORY', [
      {
        identifier: 'VIEW_ATTRACTION',
        buttonTitle: 'View Details',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'SAVE_FOR_LATER',
        buttonTitle: 'Save',
        options: { opensAppToForeground: false },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('TRAVEL_CATEGORY', [
      {
        identifier: 'PLAN_TRIP',
        buttonTitle: 'Plan Trip',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'DISMISS',
        buttonTitle: 'Dismiss',
        options: { opensAppToForeground: false },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('REVIEW_CATEGORY', [
      {
        identifier: 'REPLY',
        buttonTitle: 'Reply',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'VIEW_REVIEWS',
        buttonTitle: 'View Reviews',
        options: { opensAppToForeground: true },
      },
    ]);
  }

  /**
   * Setup notification listeners
   */
  static setupNotificationListeners() {
    // Listener for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listener for when user taps notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  /**
   * Handle notification received while app is active
   */
  static handleNotificationReceived(notification) {
    const { title, body, data } = notification.request.content;
    
    // You can customize behavior based on notification type
    if (data?.type === NOTIFICATION_TYPES.NEW_ATTRACTION) {
      // Handle new attraction notification
      console.log('New attraction notification received');
    }
    
    // Update badge count
    this.updateBadgeCount();
  }

  /**
   * Handle notification tap/response
   */
  static handleNotificationResponse(response) {
    const { notification } = response;
    const { data } = notification.request.content;
    
    // Navigate based on notification type
    if (data?.type === NOTIFICATION_TYPES.NEW_ATTRACTION && data?.attractionId) {
      // Navigate to attraction details
      // NavigationService.navigate('AttractionDetails', { id: data.attractionId });
    } else if (data?.type === NOTIFICATION_TYPES.TRAVEL_REMINDER) {
      // Navigate to travel planning
      // NavigationService.navigate('TravelPlan');
    }
    
    // Mark notification as read
    this.markNotificationAsRead(notification.request.identifier);
  }

  /**
   * Schedule a local notification
   */
  static async scheduleNotification(notificationData) {
    try {
      const {
        title,
        body,
        data = {},
        trigger = null,
        categoryIdentifier = null
      } = notificationData;

      const content = {
        title,
        body,
        data: {
          timestamp: Date.now(),
          ...data
        },
        sound: 'default',
      };

      if (categoryIdentifier) {
        content.categoryIdentifier = categoryIdentifier;
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content,
        trigger,
      });

      console.log('Notification scheduled:', identifier);
      return { success: true, identifier };
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Schedule attraction recommendation
   */
  static async scheduleAttractionRecommendation(attraction, delay = 0) {
    return await this.scheduleNotification({
      title: 'New Place to Explore!',
      body: `Check out ${attraction.name} - a must-visit spot in Cebu!`,
      data: {
        type: NOTIFICATION_TYPES.NEW_ATTRACTION,
        attractionId: attraction.id,
        category: NOTIFICATION_CATEGORIES.ATTRACTIONS
      },
      trigger: delay > 0 ? { seconds: delay } : null,
      categoryIdentifier: 'ATTRACTION_CATEGORY'
    });
  }

  /**
   * Schedule travel reminder
   */
  static async scheduleTravelReminder(destination, date) {
    const triggerDate = new Date(date);
    triggerDate.setHours(triggerDate.getHours() - 2); // 2 hours before

    return await this.scheduleNotification({
      title: 'Travel Reminder',
      body: `Don't forget your trip to ${destination} today!`,
      data: {
        type: NOTIFICATION_TYPES.TRAVEL_REMINDER,
        destination,
        category: NOTIFICATION_CATEGORIES.TRAVEL
      },
      trigger: { date: triggerDate },
      categoryIdentifier: 'TRAVEL_CATEGORY'
    });
  }

  /**
   * Send review response notification
   */
  static async notifyReviewResponse(reviewData) {
    return await this.scheduleNotification({
      title: 'New Response to Your Review',
      body: `Someone responded to your review of ${reviewData.attractionName}`,
      data: {
        type: NOTIFICATION_TYPES.REVIEW_RESPONSE,
        reviewId: reviewData.id,
        attractionId: reviewData.attractionId,
        category: NOTIFICATION_CATEGORIES.SOCIAL
      },
      categoryIdentifier: 'REVIEW_CATEGORY'
    });
  }

  /**
   * Send system notification
   */
  static async sendSystemNotification(message, data = {}) {
    return await this.scheduleNotification({
      title: 'TouristApp',
      body: message,
      data: {
        type: NOTIFICATION_TYPES.SYSTEM,
        category: NOTIFICATION_CATEGORIES.SYSTEM,
        ...data
      }
    });
  }

  /**
   * Cancel a scheduled notification
   */
  static async cancelNotification(identifier) {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log('Notification cancelled:', identifier);
      return { success: true };
    } catch (error) {
      console.error('Error cancelling notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
      return { success: true };
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current permission status
   */
  static async getPermissionStatus() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return { success: true, status };
    } catch (error) {
      console.error('Error getting permission status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Request notification permissions
   */
  static async requestPermissions() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return { success: true, status, granted: status === 'granted' };
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update badge count
   */
  static async updateBadgeCount(count = null) {
    try {
      if (count === null) {
        // Get current notification count
        const notifications = await Notifications.getPresentedNotificationsAsync();
        count = notifications.length;
      }
      
      await Notifications.setBadgeCountAsync(count);
      return { success: true, count };
    } catch (error) {
      console.error('Error updating badge count:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear all notifications
   */
  static async clearAllNotifications() {
    try {
      await Notifications.dismissAllNotificationsAsync();
      await this.updateBadgeCount(0);
      console.log('All notifications cleared');
      return { success: true };
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(identifier) {
    try {
      await Notifications.dismissNotificationAsync(identifier);
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get notification token
   */
  static getNotificationToken() {
    return this.notificationToken;
  }

  /**
   * Get stored notification token
   */
  static async getStoredNotificationToken() {
    try {
      return await AsyncStorage.getItem(NOTIFICATION_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting stored notification token:', error);
      return null;
    }
  }

  /**
   * Cleanup listeners
   */
  static cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default NotificationService;
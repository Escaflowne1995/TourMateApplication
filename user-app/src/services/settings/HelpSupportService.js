import { Linking, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPPORT_HISTORY_KEY = '@tourist_app_support_history';

export const CONTACT_OPTIONS = [
  {
    id: 'email',
    title: 'Email Support',
    subtitle: 'Get help via email within 24 hours',
    icon: 'mail-outline',
    contact: 'support@cebutouristapp.com',
    type: 'email',
    availability: '24/7',
    responseTime: '24 hours'
  },
  {
    id: 'phone',
    title: 'Phone Support',
    subtitle: 'Call us for immediate assistance',
    icon: 'call-outline',
    contact: '+639123456789',
    type: 'phone',
    availability: 'Mon-Fri 8AM-6PM PST',
    responseTime: 'Immediate'
  },
  {
    id: 'chat',
    title: 'Live Chat',
    subtitle: 'Chat with our support team',
    icon: 'chatbubble-outline',
    contact: 'https://cebutouristapp.com/chat',
    type: 'chat',
    availability: 'Mon-Fri 9AM-5PM PST',
    responseTime: '2-5 minutes'
  },
  {
    id: 'website',
    title: 'Visit Website',
    subtitle: 'Browse our help center online',
    icon: 'globe-outline',
    contact: 'https://cebutouristapp.com/help',
    type: 'website',
    availability: '24/7',
    responseTime: 'Self-service'
  },
  {
    id: 'facebook',
    title: 'Facebook Page',
    subtitle: 'Message us on Facebook',
    icon: 'logo-facebook',
    contact: 'https://facebook.com/cebutouristapp',
    type: 'social',
    availability: 'Mon-Fri 9AM-5PM PST',
    responseTime: '1-4 hours'
  },
  {
    id: 'emergency',
    title: 'Emergency Assistance',
    subtitle: 'For urgent travel emergencies',
    icon: 'warning-outline',
    contact: '+639123456789',
    type: 'emergency',
    availability: '24/7',
    responseTime: 'Immediate'
  }
];

export const FAQ_DATA = [
  {
    id: 'favorites',
    category: 'Features',
    question: 'How do I add places to my favorites?',
    answer: 'To add a place to your favorites, simply tap the heart icon on any attraction card or details page. You can view all your favorites in the "Favorite Cebu Spots" section of your profile.',
    tags: ['favorites', 'heart', 'save', 'bookmark'],
    priority: 1
  },
  {
    id: 'reviews',
    category: 'Features',
    question: 'How do I write a review?',
    answer: 'After visiting a place, go to the attraction\'s detail page and tap "Write Review". Rate your experience and share your thoughts to help other travelers.',
    tags: ['review', 'rating', 'write', 'experience'],
    priority: 2
  },
  {
    id: 'offline',
    category: 'Technical',
    question: 'Can I use the app offline?',
    answer: 'Yes! You can download maps and attraction information for offline use. Go to Settings > Offline Mode to manage your offline content.',
    tags: ['offline', 'download', 'maps', 'no internet'],
    priority: 3
  },
  {
    id: 'language',
    category: 'Settings',
    question: 'How do I change the app language?',
    answer: 'Go to Profile > Language to select your preferred language. The app supports English, Filipino, Cebuano, Spanish, Chinese, Japanese, and Korean.',
    tags: ['language', 'translate', 'multilingual', 'change'],
    priority: 4
  },
  {
    id: 'privacy',
    category: 'Privacy',
    question: 'Is my location data safe?',
    answer: 'Yes, your privacy is important to us. Location data is only used to provide personalized recommendations and is never shared with third parties without your consent.',
    tags: ['privacy', 'location', 'data', 'safety', 'secure'],
    priority: 5
  },
  {
    id: 'report',
    category: 'Features',
    question: 'How do I report a problem with a place listing?',
    answer: 'If you find incorrect information about a place, tap the "Report Issue" button on the attraction\'s detail page, or contact our support team directly.',
    tags: ['report', 'issue', 'problem', 'incorrect'],
    priority: 6
  },
  {
    id: 'account',
    category: 'Account',
    question: 'How do I create an account?',
    answer: 'You can create an account by tapping "Sign Up" on the welcome screen. You can register with your email or sign in with Google.',
    tags: ['account', 'signup', 'register', 'email'],
    priority: 7
  },
  {
    id: 'password',
    category: 'Account',
    question: 'I forgot my password. How do I reset it?',
    answer: 'On the login screen, tap "Forgot Password?" and enter your email address. We\'ll send you a link to reset your password.',
    tags: ['password', 'reset', 'forgot', 'email'],
    priority: 8
  },
  {
    id: 'notifications',
    category: 'Settings',
    question: 'How do I manage notifications?',
    answer: 'Go to Settings > Notifications to control what notifications you receive. You can enable/disable push notifications, email updates, and more.',
    tags: ['notifications', 'push', 'email', 'settings'],
    priority: 9
  },
  {
    id: 'sync',
    category: 'Technical',
    question: 'Why isn\'t my data syncing across devices?',
    answer: 'Make sure you\'re logged into the same account on all devices and have Auto Sync enabled in Settings. Check your internet connection as well.',
    tags: ['sync', 'devices', 'account', 'internet'],
    priority: 10
  },
  {
    id: 'storage',
    category: 'Technical',
    question: 'The app is taking up too much storage. What can I do?',
    answer: 'Go to Settings > Data & Storage > Clear Cache to free up space. You can also disable offline downloads or remove offline content.',
    tags: ['storage', 'cache', 'space', 'memory'],
    priority: 11
  },
  {
    id: 'directions',
    category: 'Features',
    question: 'How do I get directions to a place?',
    answer: 'On any attraction\'s detail page, tap the "Get Directions" button. This will open your default maps app with directions to the location.',
    tags: ['directions', 'navigation', 'maps', 'location'],
    priority: 12
  }
];

class HelpSupportService {
  static supportHistory = [];

  // Initialize service
  static async initialize() {
    await this.loadSupportHistory();
    console.log('HelpSupportService initialized');
  }

  // Get all FAQ data
  static getFAQData() {
    return FAQ_DATA.sort((a, b) => a.priority - b.priority);
  }

  // Get FAQ by category
  static getFAQByCategory(category) {
    return FAQ_DATA.filter(faq => 
      faq.category.toLowerCase() === category.toLowerCase()
    ).sort((a, b) => a.priority - b.priority);
  }

  // Search FAQ
  static searchFAQ(searchTerm) {
    const term = searchTerm.toLowerCase();
    return FAQ_DATA.filter(faq => 
      faq.question.toLowerCase().includes(term) ||
      faq.answer.toLowerCase().includes(term) ||
      faq.tags.some(tag => tag.toLowerCase().includes(term))
    ).sort((a, b) => a.priority - b.priority);
  }

  // Get FAQ categories
  static getFAQCategories() {
    const categories = [...new Set(FAQ_DATA.map(faq => faq.category))];
    return categories.sort();
  }

  // Get contact options
  static getContactOptions() {
    return CONTACT_OPTIONS;
  }

  // Get contact option by type
  static getContactOptionByType(type) {
    return CONTACT_OPTIONS.find(option => option.type === type);
  }

  // Handle contact action
  static async handleContactAction(contactOption) {
    try {
      let result = { success: false, action: 'unknown' };

      switch (contactOption.type) {
        case 'email':
          const emailUrl = `mailto:${contactOption.contact}?subject=Cebu Tourist App Support`;
          const emailSupported = await Linking.canOpenURL(emailUrl);
          if (emailSupported) {
            await Linking.openURL(emailUrl);
            result = { success: true, action: 'email_opened' };
          } else {
            Alert.alert(
              'Email Support',
              `Please send an email to: ${contactOption.contact}`,
              [{ text: 'OK' }]
            );
            result = { success: true, action: 'email_shown' };
          }
          break;

        case 'phone':
        case 'emergency':
          const phoneUrl = `tel:${contactOption.contact}`;
          const phoneSupported = await Linking.canOpenURL(phoneUrl);
          if (phoneSupported) {
            Alert.alert(
              'Call Support',
              `Call ${contactOption.contact}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Call', 
                  onPress: async () => {
                    await Linking.openURL(phoneUrl);
                  }
                }
              ]
            );
            result = { success: true, action: 'phone_prompted' };
          } else {
            Alert.alert(
              'Phone Support',
              `Please call: ${contactOption.contact}`,
              [{ text: 'OK' }]
            );
            result = { success: true, action: 'phone_shown' };
          }
          break;

        case 'chat':
          Alert.alert(
            'Live Chat',
            'Live chat feature is coming soon! Please use email or phone support for now.',
            [{ text: 'OK' }]
          );
          result = { success: true, action: 'chat_coming_soon' };
          break;

        case 'website':
        case 'social':
          const webSupported = await Linking.canOpenURL(contactOption.contact);
          if (webSupported) {
            await Linking.openURL(contactOption.contact);
            result = { success: true, action: 'website_opened' };
          } else {
            Alert.alert(
              'Website',
              `Please visit: ${contactOption.contact}`,
              [{ text: 'OK' }]
            );
            result = { success: true, action: 'website_shown' };
          }
          break;

        default:
          Alert.alert(
            'Contact Support',
            `Contact: ${contactOption.contact}`,
            [{ text: 'OK' }]
          );
          result = { success: true, action: 'info_shown' };
      }

      // Log the support action
      await this.logSupportAction(contactOption, result);
      
      return result;
    } catch (error) {
      console.error('Error handling contact action:', error);
      Alert.alert(
        'Error',
        'Failed to open contact option. Please try again.',
        [{ text: 'OK' }]
      );
      return { success: false, error: error.message };
    }
  }

  // Log support action for analytics
  static async logSupportAction(contactOption, result) {
    try {
      const actionLog = {
        type: contactOption.type,
        contact: contactOption.contact,
        result: result,
        timestamp: new Date().toISOString(),
        userId: 'guest'
      };

      // Save to local history
      this.supportHistory.unshift(actionLog);
      
      // Keep only last 50 actions
      if (this.supportHistory.length > 50) {
        this.supportHistory = this.supportHistory.slice(0, 50);
      }

      await this.saveSupportHistory();

      // Firebase logging removed - using local storage only

      console.log('Support action logged:', actionLog);
    } catch (error) {
      console.error('Error logging support action:', error);
    }
  }

  // Get support history
  static getSupportHistory() {
    return this.supportHistory;
  }

  // Load support history from AsyncStorage
  static async loadSupportHistory() {
    try {
      const storageKey = `${SUPPORT_HISTORY_KEY}_guest`;
      
      const historyString = await AsyncStorage.getItem(storageKey);
      if (historyString) {
        this.supportHistory = JSON.parse(historyString);
      }
    } catch (error) {
      console.error('Error loading support history:', error);
      this.supportHistory = [];
    }
  }

  // Save support history to AsyncStorage
  static async saveSupportHistory() {
    try {
      const storageKey = `${SUPPORT_HISTORY_KEY}_guest`;
      
      await AsyncStorage.setItem(storageKey, JSON.stringify(this.supportHistory));
    } catch (error) {
      console.error('Error saving support history:', error);
    }
  }

  // Submit feedback or bug report
  static async submitFeedback(feedbackData) {
    try {
      const feedback = {
        ...feedbackData,
        timestamp: new Date().toISOString(),
        userId: 'guest',
        userEmail: 'anonymous',
        appVersion: '1.0.0',
        platform: Platform.OS
      };

      // Firebase feedback removed - using local storage only

      // Log locally
      await this.logSupportAction(
        { type: 'feedback', contact: 'feedback_submission' },
        { success: true, action: 'feedback_submitted' }
      );

      return {
        success: true,
        message: 'Thank you for your feedback! We\'ll review it and get back to you if needed.'
      };
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return {
        success: false,
        error: 'Failed to submit feedback. Please try again or contact support directly.'
      };
    }
  }

  // Get app version and system info for support
  static getSystemInfo() {
    return {
      appVersion: '1.0.0',
      platform: Platform.OS,
      platformVersion: Platform.Version,
      timestamp: new Date().toISOString()
    };
  }

  // Clear support history
  static async clearSupportHistory() {
    try {
      this.supportHistory = [];
      
      const storageKey = `${SUPPORT_HISTORY_KEY}_guest`;
      
      await AsyncStorage.removeItem(storageKey);
      
      return {
        success: true,
        message: 'Support history cleared successfully'
      };
    } catch (error) {
      console.error('Error clearing support history:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Firebase FAQ loading removed - using static data only
}

export default HelpSupportService; 
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NotificationService, { NOTIFICATION_TYPES } from '../../services/notifications/NotificationService';

const NotificationTester = ({ isDarkMode = false }) => {
  const [isLoading, setIsLoading] = useState(false);

  const showResult = (result, title) => {
    if (result.success) {
      Alert.alert('✅ Success', title);
    } else {
      Alert.alert('❌ Error', result.error || title);
    }
  };

  const testBasicNotification = async () => {
    setIsLoading(true);
    try {
      const result = await NotificationService.scheduleNotification({
        title: 'Test Notification',
        body: 'This is a test notification from TouristApp!',
        data: { type: NOTIFICATION_TYPES.SYSTEM }
      });
      showResult(result, 'Basic notification scheduled successfully!');
    } catch (error) {
      showResult({ success: false, error: error.message }, 'Failed to schedule notification');
    }
    setIsLoading(false);
  };

  const testAttractionNotification = async () => {
    setIsLoading(true);
    try {
      const mockAttraction = {
        id: 'test-attraction',
        name: 'Magellan\'s Cross'
      };
      const result = await NotificationService.scheduleAttractionRecommendation(mockAttraction, 5);
      showResult(result, 'Attraction notification will appear in 5 seconds!');
    } catch (error) {
      showResult({ success: false, error: error.message }, 'Failed to schedule attraction notification');
    }
    setIsLoading(false);
  };

  const testTravelReminder = async () => {
    setIsLoading(true);
    try {
      const reminderDate = new Date();
      reminderDate.setSeconds(reminderDate.getSeconds() + 10); // 10 seconds from now
      
      const result = await NotificationService.scheduleTravelReminder('Temple of Leah', reminderDate);
      showResult(result, 'Travel reminder scheduled for 10 seconds from now!');
    } catch (error) {
      showResult({ success: false, error: error.message }, 'Failed to schedule travel reminder');
    }
    setIsLoading(false);
  };

  const testReviewNotification = async () => {
    setIsLoading(true);
    try {
      const mockReviewData = {
        id: 'test-review',
        attractionId: 'temple-of-leah',
        attractionName: 'Temple of Leah'
      };
      const result = await NotificationService.notifyReviewResponse(mockReviewData);
      showResult(result, 'Review response notification sent!');
    } catch (error) {
      showResult({ success: false, error: error.message }, 'Failed to send review notification');
    }
    setIsLoading(false);
  };

  const testSystemNotification = async () => {
    setIsLoading(true);
    try {
      const result = await NotificationService.sendSystemNotification(
        'Welcome to TouristApp! Explore the beautiful attractions of Cebu.',
        { category: 'welcome' }
      );
      showResult(result, 'System notification sent!');
    } catch (error) {
      showResult({ success: false, error: error.message }, 'Failed to send system notification');
    }
    setIsLoading(false);
  };

  const clearAllNotifications = async () => {
    setIsLoading(true);
    try {
      const result = await NotificationService.clearAllNotifications();
      showResult(result, 'All notifications cleared!');
    } catch (error) {
      showResult({ success: false, error: error.message }, 'Failed to clear notifications');
    }
    setIsLoading(false);
  };

  const checkPermissions = async () => {
    setIsLoading(true);
    try {
      const result = await NotificationService.getPermissionStatus();
      Alert.alert(
        'Permission Status',
        `Current status: ${result.status || 'Unknown'}\nToken: ${NotificationService.getNotificationToken() ? 'Available' : 'Not available'}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to check permissions');
    }
    setIsLoading(false);
  };

  const styles = getStyles(isDarkMode);

  const testButtons = [
    {
      title: 'Test Basic Notification',
      subtitle: 'Simple notification test',
      icon: 'notifications-outline',
      action: testBasicNotification,
      color: '#0066CC'
    },
    {
      title: 'Test Attraction Notification',
      subtitle: 'Recommendation notification (5s delay)',
      icon: 'location-outline',
      action: testAttractionNotification,
      color: '#28A745'
    },
    {
      title: 'Test Travel Reminder',
      subtitle: 'Scheduled reminder (10s delay)',
      icon: 'time-outline',
      action: testTravelReminder,
      color: '#FFC107'
    },
    {
      title: 'Test Review Response',
      subtitle: 'Review interaction notification',
      icon: 'chatbubble-outline',
      action: testReviewNotification,
      color: '#17A2B8'
    },
    {
      title: 'Test System Message',
      subtitle: 'App system notification',
      icon: 'information-circle-outline',
      action: testSystemNotification,
      color: '#6F42C1'
    }
  ];

  const utilityButtons = [
    {
      title: 'Check Permissions',
      icon: 'shield-checkmark-outline',
      action: checkPermissions,
      color: '#FD7E14'
    },
    {
      title: 'Clear All Notifications',
      icon: 'trash-outline',
      action: clearAllNotifications,
      color: '#DC3545'
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons 
          name="flask-outline" 
          size={24} 
          color={isDarkMode ? '#FFFFFF' : '#333333'} 
        />
        <Text style={styles.headerTitle}>Notification Tester</Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Test Notifications</Text>
        
        {testButtons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.testButton, { borderLeftColor: button.color }]}
            onPress={button.action}
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonIcon}>
                <Ionicons 
                  name={button.icon} 
                  size={20} 
                  color={button.color} 
                />
              </View>
              <View style={styles.buttonText}>
                <Text style={styles.buttonTitle}>{button.title}</Text>
                <Text style={styles.buttonSubtitle}>{button.subtitle}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Utilities</Text>
        
        {utilityButtons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.testButton, { borderLeftColor: button.color }]}
            onPress={button.action}
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonIcon}>
                <Ionicons 
                  name={button.icon} 
                  size={20} 
                  color={button.color} 
                />
              </View>
              <View style={styles.buttonText}>
                <Text style={styles.buttonTitle}>{button.title}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.infoBox}>
          <Ionicons 
            name="information-circle-outline" 
            size={16} 
            color={isDarkMode ? '#B0B0B0' : '#666666'} 
          />
          <Text style={styles.infoText}>
            Note: Make sure notifications are enabled in your device settings to see the notifications.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#1A1A1A' : '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#333333' : '#E9ECEF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: isDarkMode ? '#FFFFFF' : '#333333',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isDarkMode ? '#FFFFFF' : '#333333',
    marginBottom: 12,
    marginTop: 8,
  },
  testButton: {
    backgroundColor: isDarkMode ? '#2A2A2A' : '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: isDarkMode ? '#FFFFFF' : '#333333',
    marginBottom: 2,
  },
  buttonSubtitle: {
    fontSize: 12,
    color: isDarkMode ? '#B0B0B0' : '#666666',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: isDarkMode ? '#2A2A2A' : '#E9ECEF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    fontSize: 12,
    color: isDarkMode ? '#B0B0B0' : '#666666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});

export default NotificationTester;
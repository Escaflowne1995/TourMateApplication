import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/theme';

const HelpSupportScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const styles = getStyles(colors, isDarkMode);
  
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const contactOptions = [
    {
      id: '1',
      title: 'Email Support',
      subtitle: 'Get help via email within 24 hours',
      icon: 'mail-outline',
      action: () => {
        Linking.openURL('mailto:support@cebutouristapp.com');
      },
    },
    {
      id: '2',
      title: 'Phone Support',
      subtitle: 'Call us for immediate assistance',
      icon: 'call-outline',
      action: () => {
        Linking.openURL('tel:+639123456789');
      },
    },
    {
      id: '3',
      title: 'Live Chat',
      subtitle: 'Chat with our support team',
      icon: 'chatbubble-outline',
      action: () => {
        Alert.alert('Live Chat', 'Live chat feature coming soon!');
      },
    },
    {
      id: '4',
      title: 'Visit Website',
      subtitle: 'Browse our help center online',
      icon: 'globe-outline',
      action: () => {
        Linking.openURL('https://cebutouristapp.com/help');
      },
    },
  ];

  const faqData = [
    {
      id: '1',
      question: 'How do I add places to my favorites?',
      answer: 'To add a place to your favorites, simply tap the heart icon on any attraction card or details page. You can view all your favorites in the "Favorite Cebu Spots" section of your profile.',
    },
    {
      id: '2',
      question: 'How do I write a review?',
      answer: 'After visiting a place, go to the attraction\'s detail page and tap "Write Review". Rate your experience and share your thoughts to help other travelers.',
    },
    {
      id: '3',
      question: 'Can I use the app offline?',
      answer: 'Yes! You can download maps and attraction information for offline use. Go to Settings > Offline Mode to manage your offline content.',
    },
    {
      id: '4',
      question: 'How do I change the app language?',
      answer: 'Go to Profile > Language to select your preferred language. The app supports English, Filipino, Cebuano, Spanish, Chinese, Japanese, and Korean.',
    },
    {
      id: '5',
      question: 'Is my location data safe?',
      answer: 'Yes, your privacy is important to us. Location data is only used to provide personalized recommendations and is never shared with third parties without your consent.',
    },
    {
      id: '6',
      question: 'How do I report a problem with a place listing?',
      answer: 'If you find incorrect information about a place, tap the "Report Issue" button on the attraction\'s detail page, or contact our support team directly.',
    },
  ];

  const handleContactPress = (option) => {
    option.action();
  };

  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const renderContactOption = (option) => (
    <TouchableOpacity
      key={option.id}
      style={styles.contactItem}
      onPress={() => handleContactPress(option)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={option.title}
      accessibilityHint={option.subtitle}
    >
      <View style={styles.contactContent}>
        <Ionicons 
          name={option.icon} 
          size={24} 
          color="#A855F7" 
          style={styles.contactIcon}
          accessible={false}
        />
        <View style={styles.contactText}>
          <Text style={styles.contactTitle}>{option.title}</Text>
          <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={colors.textSecondary}
          accessible={false}
        />
      </View>
    </TouchableOpacity>
  );

  const renderFAQItem = (faq) => (
    <TouchableOpacity
      key={faq.id}
      style={styles.faqItem}
      onPress={() => toggleFAQ(faq.id)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={faq.question}
      accessibilityHint={expandedFAQ === faq.id ? 'Tap to collapse answer' : 'Tap to expand answer'}
      accessibilityState={{ expanded: expandedFAQ === faq.id }}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{faq.question}</Text>
        <Ionicons 
          name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={colors.textSecondary}
          accessible={false}
        />
      </View>
      {expandedFAQ === faq.id && (
        <Text 
          style={styles.faqAnswer}
          accessible={true}
          accessibilityRole="text"
        >
          {faq.answer}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        accessible={true}
        accessibilityLabel="Help and Support Screen"
      >
        <View style={styles.header}>
          <Text 
            style={styles.headerTitle}
            accessible={true}
            accessibilityRole="text"
          >
            Help & Support
          </Text>
          <Text 
            style={styles.headerSubtitle}
            accessible={true}
            accessibilityRole="text"
          >
            We're here to help you
          </Text>
        </View>

        <View style={styles.section}>
          <Text 
            style={styles.sectionTitle}
            accessible={true}
            accessibilityRole="text"
          >
            Contact Us
          </Text>
          <View style={styles.contactContainer}>
            {contactOptions.map(renderContactOption)}
          </View>
        </View>

        <View style={styles.section}>
          <Text 
            style={styles.sectionTitle}
            accessible={true}
            accessibilityRole="text"
          >
            Frequently Asked Questions
          </Text>
          <View style={styles.faqContainer}>
            {faqData.map(renderFAQItem)}
          </View>
        </View>

        <View style={styles.section}>
          <Text 
            style={styles.sectionTitle}
            accessible={true}
            accessibilityRole="text"
          >
            App Information
          </Text>
          <View style={styles.appInfoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>January 2024</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Developer</Text>
              <Text style={styles.infoValue}>Cebu Tourism Board</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text 
            style={styles.footerText}
            accessible={true}
            accessibilityRole="text"
          >
            Thank you for using Cebu Tourist App!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    marginHorizontal: 15,
    marginTop: 20,
    borderRadius: 15,
    backgroundColor: colors.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 5,
  },
  section: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  contactContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  contactIcon: {
    marginRight: 15,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  faqContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: 20,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 15,
    lineHeight: 20,
  },
  appInfoContainer: {
    borderRadius: 15,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  infoLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  footer: {
    padding: 20,
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  footerText: {
    fontSize: 16,
    color: '#A855F7',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default HelpSupportScreen; 
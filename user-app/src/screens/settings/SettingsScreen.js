import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/theme';

const SettingsScreen = ({ navigation }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const styles = getStyles(colors, isDarkMode);
  
  const [settings, setSettings] = useState({
    notifications: true,
    locationServices: true,
  });

  const toggleSetting = (key) => {
    if (key === 'darkMode') {
      toggleTheme();
    } else {
      setSettings(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };


  const settingsData = [
    {
      title: 'General',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Receive notifications about new places and updates',
          type: 'toggle',
          value: settings.notifications,
          icon: 'notifications-outline',
        },
        {
          id: 'locationServices',
          title: 'Location Services',
          subtitle: 'Allow app to access your location for better recommendations',
          type: 'toggle',
          value: settings.locationServices,
          icon: 'location-outline',
        },
      ],
    },
    {
      title: 'App',
      items: [
        {
          id: 'darkMode',
          title: 'Dark Mode',
          subtitle: 'Switch to dark theme',
          type: 'toggle',
          value: isDarkMode,
          icon: 'moon-outline',
        },
      ],
    },
  ];

  const renderSettingItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.type === 'action' ? item.action : () => toggleSetting(item.id)}
      accessible={true}
      accessibilityRole={item.type === 'toggle' ? 'switch' : 'button'}
      accessibilityLabel={item.title}
      accessibilityHint={item.subtitle}
      accessibilityState={item.type === 'toggle' ? { selected: item.value } : undefined}
    >
      <View style={styles.settingContent}>
        <Ionicons 
          name={item.icon} 
          size={24} 
          color={colors.primary} 
          style={styles.settingIcon}
          accessible={false}
        />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      {item.type === 'toggle' ? (
        <Switch
          value={item.value}
          onValueChange={() => toggleSetting(item.id)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={item.value ? '#fff' : colors.textSecondary}
          accessible={false}
        />
      ) : (
        <Ionicons 
          name="chevron-forward" 
          size={24} 
          color={colors.textSecondary}
          accessible={false}
        />
      )}
    </TouchableOpacity>
  );

  const renderSection = (section) => (
    <View key={section.title} style={styles.section}>
      <Text 
        style={styles.sectionTitle}
        accessible={true}
        accessibilityRole="text"
      >
        {section.title}
      </Text>
      <View style={styles.sectionContent}>
        {section.items.map(renderSettingItem)}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        accessible={true}
        accessibilityLabel="Settings Screen"
      >
      <View style={styles.header}>
        <Text 
          style={styles.headerTitle}
          accessible={true}
          accessibilityRole="text"
        >
          Settings
        </Text>
        <Text 
          style={styles.headerSubtitle}
          accessible={true}
          accessibilityRole="text"
        >
          Customize your app experience
        </Text>
      </View>

      {settingsData.map(renderSection)}

      <View style={styles.footer}>
        <Text 
          style={styles.footerText}
          accessible={true}
          accessibilityRole="text"
        >
          Cebu Tourist App v1.0.0
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
    backgroundColor: 'transparent',
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
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    marginLeft: 20,
  },
  sectionContent: {
    marginHorizontal: 15,
    borderRadius: 15,
    backgroundColor: colors.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    minHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 15,
  },
  settingIcon: {
    marginRight: 15,
    width: 24,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    padding: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default SettingsScreen; 
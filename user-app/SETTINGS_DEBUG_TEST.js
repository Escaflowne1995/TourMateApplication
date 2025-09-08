import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import UserSettingsService from './src/services/settings/UserSettingsService';
import LanguageService from './src/services/settings/LanguageService';
import CacheManagementService from './src/services/settings/CacheManagementService';

const SettingsDebugTest = () => {
  const [currentSettings, setCurrentSettings] = useState({});
  const [currentLanguage, setCurrentLanguage] = useState('');
  const [cacheSize, setCacheSize] = useState('');
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    try {
      // Load current settings
      const settings = await UserSettingsService.loadSettings();
      setCurrentSettings(settings);

      // Load current language
      const language = await LanguageService.loadLanguagePreference();
      setCurrentLanguage(language);

      // Load cache size
      const cache = await CacheManagementService.calculateCacheSize();
      setCacheSize(CacheManagementService.formatBytes(cache.totalSize));

      console.log('DEBUG INFO LOADED:', { settings, language, cache: cache.totalSize });
    } catch (error) {
      console.error('Error loading debug info:', error);
    }
  };

  const runTest = async (testName, testFunction) => {
    try {
      console.log(`Running test: ${testName}`);
      const result = await testFunction();
      const newResult = {
        test: testName,
        status: result.success ? 'PASS' : 'FAIL',
        message: result.message || 'No message',
        timestamp: new Date().toLocaleTimeString()
      };
      setTestResults(prev => [newResult, ...prev]);
      await loadDebugInfo(); // Refresh data after test
    } catch (error) {
      const errorResult = {
        test: testName,
        status: 'ERROR',
        message: error.message,
        timestamp: new Date().toLocaleTimeString()
      };
      setTestResults(prev => [errorResult, ...prev]);
    }
  };

  const testSettings = [
    {
      name: 'Toggle Dark Mode',
      test: () => UserSettingsService.toggleSetting('darkMode')
    },
    {
      name: 'Toggle Notifications',
      test: () => UserSettingsService.toggleSetting('notifications')
    },
    {
      name: 'Toggle Location Services',
      test: () => UserSettingsService.toggleSetting('locationServices')
    },
    {
      name: 'Reset All Settings',
      test: () => UserSettingsService.resetToDefaults()
    },
    {
      name: 'Change Language to Filipino',
      test: () => LanguageService.saveLanguagePreference('fil')
    },
    {
      name: 'Change Language to English',
      test: () => LanguageService.saveLanguagePreference('en')
    },
    {
      name: 'Clear All Cache',
      test: () => CacheManagementService.clearAllCache(false)
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings Debug Test</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Status</Text>
        <Text style={styles.infoText}>Language: {currentLanguage}</Text>
        <Text style={styles.infoText}>Cache Size: {cacheSize}</Text>
        <Text style={styles.infoText}>Settings Count: {Object.keys(currentSettings).length}</Text>
        
        <Text style={styles.subsectionTitle}>Active Settings:</Text>
        {Object.entries(currentSettings).map(([key, value]) => (
          <Text key={key} style={styles.settingText}>
            {key}: {value.toString()}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Run Tests</Text>
        {testSettings.map((test, index) => (
          <TouchableOpacity
            key={index}
            style={styles.testButton}
            onPress={() => runTest(test.name, test.test)}
          >
            <Text style={styles.testButtonText}>{test.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Results</Text>
        {testResults.map((result, index) => (
          <View key={index} style={[styles.resultItem, styles[result.status.toLowerCase()]]}>
            <Text style={styles.resultTest}>{result.test}</Text>
            <Text style={styles.resultStatus}>{result.status}</Text>
            <Text style={styles.resultMessage}>{result.message}</Text>
            <Text style={styles.resultTime}>{result.timestamp}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#555',
  },
  infoText: {
    fontSize: 14,
    marginVertical: 2,
    color: '#666',
  },
  settingText: {
    fontSize: 12,
    marginVertical: 1,
    color: '#777',
    paddingLeft: 10,
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
  },
  testButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  resultItem: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  pass: {
    backgroundColor: '#e8f5e8',
    borderLeftColor: '#4caf50',
  },
  fail: {
    backgroundColor: '#ffebee',
    borderLeftColor: '#f44336',
  },
  error: {
    backgroundColor: '#fff3e0',
    borderLeftColor: '#ff9800',
  },
  resultTest: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  resultStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultMessage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  resultTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
});

export default SettingsDebugTest; 
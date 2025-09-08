import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { quickTest } from './connectionTest';

const ConnectionTestComponent = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const runTest = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      const testResult = await quickTest();
      setResult(testResult);
      
      if (testResult.success) {
        Alert.alert('✅ Connection Success', testResult.message);
      } else {
        Alert.alert('❌ Connection Failed', testResult.error);
      }
    } catch (error) {
      Alert.alert('❌ Test Failed', error.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Connection Test</Text>
      
      <TouchableOpacity 
        style={styles.testButton} 
        onPress={runTest}
        disabled={testing}
      >
        <Text style={styles.buttonText}>
          {testing ? 'Testing...' : 'Test Connection'}
        </Text>
      </TouchableOpacity>
      
      {result && (
        <View style={[
          styles.resultContainer, 
          result.success ? styles.successContainer : styles.errorContainer
        ]}>
          <Text style={styles.resultTitle}>
            {result.success ? '✅ Success' : '❌ Failed'}
          </Text>
          <Text style={styles.resultMessage}>
            {result.message || result.error}
          </Text>
          {result.needsMigrations && (
            <Text style={styles.migrationNote}>
              📝 Run the SQL migrations in your Supabase dashboard to create tables
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  successContainer: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultMessage: {
    fontSize: 14,
    marginBottom: 10,
  },
  migrationNote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666',
  },
});

export default ConnectionTestComponent;

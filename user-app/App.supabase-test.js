import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { LogBox } from 'react-native';

// Test Supabase connectivity
import { supabase } from './src/services/supabase/supabaseClient';

LogBox.ignoreLogs([
  'Sending `onAnimatedValueUpdate` with no listeners registered.',
]);

export default function App() {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [destinations, setDestinations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      console.log('🔄 Testing Supabase connection...');
      setConnectionStatus('Connecting to Supabase...');

      // Test basic connection
      const { data, error } = await supabase
        .from('destinations')
        .select('id, name, description, location, category, is_active')
        .eq('is_active', true)
        .limit(5);

      if (error) {
        console.error('❌ Supabase connection failed:', error);
        setConnectionStatus('❌ Connection Failed');
        setError(error.message);
        return;
      }

      console.log('✅ Supabase connection successful!');
      console.log('Fetched destinations:', data);
      
      setConnectionStatus('✅ Connected to Supabase');
      setDestinations(data || []);
      setError(null);

    } catch (err) {
      console.error('❌ Test failed:', err);
      setConnectionStatus('❌ Test Failed');
      setError(err.message);
    }
  };

  const retryConnection = () => {
    setDestinations([]);
    setError(null);
    testSupabaseConnection();
  };

  return (
    <>
      <StatusBar 
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>🏛️ TouristApp</Text>
        <Text style={styles.subtitle}>Supabase Connectivity Test</Text>
        
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Connection Status:</Text>
          <Text style={[styles.status, error ? styles.errorText : styles.successText]}>
            {connectionStatus}
          </Text>
        </View>

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Error Details:</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={retryConnection}>
              <Text style={styles.retryButtonText}>🔄 Retry Connection</Text>
            </TouchableOpacity>
          </View>
        )}

        {destinations.length > 0 && (
          <View style={styles.destinationsCard}>
            <Text style={styles.destinationsTitle}>
              📍 Found {destinations.length} Destinations:
            </Text>
            {destinations.map((destination, index) => (
              <View key={destination.id} style={styles.destinationItem}>
                <Text style={styles.destinationName}>{destination.name}</Text>
                <Text style={styles.destinationLocation}>📍 {destination.location}</Text>
                <Text style={styles.destinationCategory}>🏷️ {destination.category}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🧪 Test Results:</Text>
          <Text style={styles.infoText}>
            ✅ App bundling: SUCCESS{'\n'}
            ✅ React Native: WORKING{'\n'}
            {destinations.length > 0 ? '✅' : '❌'} Supabase: {destinations.length > 0 ? 'CONNECTED' : 'FAILED'}{'\n'}
            {destinations.length > 0 ? '✅' : '❌'} Data fetch: {destinations.length > 0 ? 'SUCCESS' : 'FAILED'}
          </Text>
        </View>

        <TouchableOpacity style={styles.testButton} onPress={retryConnection}>
          <Text style={styles.testButtonText}>🔄 Test Again</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 30,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
  },
  successText: {
    color: '#059669',
  },
  errorText: {
    color: '#dc2626',
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 12,
    color: '#7f1d1d',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  destinationsCard: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  destinationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 12,
  },
  destinationItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  destinationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  destinationLocation: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  destinationCategory: {
    fontSize: 12,
    color: '#059669',
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d97706',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
  },
  testButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AttractionsDataServiceSupabase from '../../services/data/AttractionsDataServiceSupabase';
import destinationsService from '../../services/supabase/destinationsService';

/**
 * Real-time Sync Test Screen
 * Use this to test if destinations added in admin panel appear in mobile app
 */
const RealtimeSyncTest = ({ navigation }) => {
  const [destinations, setDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [realtimeEvents, setRealtimeEvents] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const realtimeListenerRef = useRef(null);

  useEffect(() => {
    loadDestinations();
    setupRealtimeListener();
    
    return () => {
      if (realtimeListenerRef.current) {
        AttractionsDataServiceSupabase.removeRealtimeListener(realtimeListenerRef.current);
      }
    };
  }, []);

  const loadDestinations = async () => {
    setIsLoading(true);
    try {
      const result = await destinationsService.getDestinations(false); // Force fresh data
      setDestinations(result.data || []);
      setLastUpdate(new Date());
      console.log('✅ Loaded destinations for sync test:', result.data?.length);
    } catch (error) {
      console.error('❌ Error loading destinations:', error);
      Alert.alert('Error', `Failed to load destinations: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeListener = () => {
    try {
      setConnectionStatus('Connecting...');
      
      realtimeListenerRef.current = AttractionsDataServiceSupabase.setupRealtimeListener(
        (update) => {
          setConnectionStatus('Connected');
          
          const event = {
            timestamp: new Date(),
            type: update.type,
            destinationName: update.destination?.name || 'Unknown',
            destinationId: update.destination?.id,
            totalDestinations: update.allDestinations?.length || 0
          };
          
          setRealtimeEvents(prev => [event, ...prev.slice(0, 9)]); // Keep last 10 events
          
          // Update destinations list
          if (update.allDestinations) {
            setDestinations(update.allDestinations);
            setLastUpdate(new Date());
          }
          
          // Show notification
          const eventTypeMap = {
            'INSERT': 'New destination added',
            'UPDATE': 'Destination updated',
            'DELETE': 'Destination deleted'
          };
          
          Alert.alert(
            'Real-time Update!',
            `${eventTypeMap[update.type] || 'Destination changed'}: ${event.destinationName}`,
            [{ text: 'OK' }]
          );
        }
      );
      
      // Simulate connection success after a delay
      setTimeout(() => {
        if (realtimeListenerRef.current) {
          setConnectionStatus('Connected');
        }
      }, 2000);
      
    } catch (error) {
      console.error('Failed to setup real-time listener:', error);
      setConnectionStatus('Error');
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'Connected': return '#22c55e';
      case 'Connecting...': return '#f59e0b';
      case 'Error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={loadDestinations} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Real-time Sync Test</Text>
      </View>

      {/* Connection Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Connection Status:</Text>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {connectionStatus}
          </Text>
        </View>
        {lastUpdate && (
          <Text style={styles.lastUpdateText}>
            Last Update: {lastUpdate.toLocaleTimeString()}
          </Text>
        )}
      </View>

      {/* Instructions */}
      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>📋 Test Instructions</Text>
        <Text style={styles.instructionsText}>
          1. Keep this screen open{'\n'}
          2. Go to admin panel and add a new destination{'\n'}
          3. Watch for real-time update notification{'\n'}
          4. Check if new destination appears in list below{'\n'}
          5. Try deleting a destination in admin panel
        </Text>
      </View>

      {/* Real-time Events */}
      <View style={styles.eventsCard}>
        <Text style={styles.cardTitle}>📡 Real-time Events</Text>
        {realtimeEvents.length === 0 ? (
          <Text style={styles.noEventsText}>
            No real-time events yet. Try adding/deleting destinations in admin panel.
          </Text>
        ) : (
          realtimeEvents.map((event, index) => (
            <View key={index} style={styles.eventItem}>
              <Text style={styles.eventTime}>
                {event.timestamp.toLocaleTimeString()}
              </Text>
              <Text style={styles.eventType}>{event.type}</Text>
              <Text style={styles.eventDetails}>
                {event.destinationName} (Total: {event.totalDestinations})
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Current Destinations */}
      <View style={styles.destinationsCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🏛️ Current Destinations ({destinations.length})</Text>
          <TouchableOpacity onPress={loadDestinations} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>
        
        {destinations.length === 0 ? (
          <Text style={styles.noDestinationsText}>
            No destinations found. Add some in the admin panel!
          </Text>
        ) : (
          destinations.slice(0, 10).map((destination, index) => (
            <View key={destination.id} style={styles.destinationItem}>
              <View style={styles.destinationHeader}>
                <Text style={styles.destinationName}>{destination.name}</Text>
                {destination.featured && (
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredText}>Featured</Text>
                  </View>
                )}
              </View>
              <Text style={styles.destinationLocation}>📍 {destination.location}</Text>
              <Text style={styles.destinationCategory}>🏷️ {destination.category}</Text>
              <Text style={styles.destinationMeta}>
                ⭐ {destination.rating} • 👥 {destination.review_count} reviews
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Debug Info */}
      <View style={styles.debugCard}>
        <Text style={styles.cardTitle}>🐛 Debug Info</Text>
        <Text style={styles.debugText}>
          Cache Status: {destinationsService.isCacheValid() ? 'Valid' : 'Invalid'}{'\n'}
          Listener ID: {realtimeListenerRef.current ? 'Active' : 'None'}{'\n'}
          Total Events: {realtimeEvents.length}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginRight: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  instructionsCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  eventsCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  destinationsCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  debugCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  refreshButton: {
    padding: 4,
  },
  noEventsText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  noDestinationsText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  eventItem: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  eventType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 2,
  },
  eventDetails: {
    fontSize: 14,
    color: '#374151',
    marginTop: 2,
  },
  destinationItem: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    marginBottom: 8,
  },
  destinationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  featuredBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  featuredText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  destinationLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  destinationCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  destinationMeta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  debugText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
});

export default RealtimeSyncTest;

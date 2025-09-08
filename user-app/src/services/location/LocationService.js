import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';

class LocationService {
  static async requestLocationPermission() {
    try {
      console.log('Requesting location permission...');
      
      // Check if location services are enabled first
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services in your device settings to use this feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Settings', 
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }
            }
          ]
        );
        return false;
      }
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permissions to get directions and calculate distances to attractions.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Settings', 
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }
            }
          ]
        );
        return false;
      }
      
      console.log('Location permission granted');
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert(
        'Permission Error',
        'Unable to request location permission. Please check your device settings.',
        [{ text: 'OK' }]
      );
      return false;
    }
  }

  static async getCurrentLocation() {
    try {
      console.log('Checking location services and permissions...');
      
      // Check if location services are enabled
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        console.log('Location services are disabled on device');
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services in your device settings to get your current location.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }
            }
          ]
        );
        return null;
      }

      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        return null;
      }

      console.log('Getting current location...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000, // Increased timeout to 15 seconds
        maximumAge: 60000, // Accept cached location up to 1 minute old
      });

      console.log('Current location obtained:', location.coords);
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      
      // More specific error handling
      let errorMessage = 'Unable to get your current location.';
      let actionButtons = [{ text: 'OK' }];
      
      if (error.code === 'E_LOCATION_UNAVAILABLE') {
        errorMessage = 'Location is currently unavailable. Please check that location services are enabled and try again.';
        actionButtons = [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }
          }
        ];
      } else if (error.code === 'E_LOCATION_TIMEOUT') {
        errorMessage = 'Location request timed out. Please make sure you have a clear view of the sky and try again.';
      } else if (error.code === 'E_LOCATION_SERVICES_DISABLED') {
        errorMessage = 'Location services are disabled. Please enable them in your device settings.';
        actionButtons = [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }
          }
        ];
      }
      
      Alert.alert(
        'Location Error',
        errorMessage,
        actionButtons
      );
      return null;
    }
  }

  // Add a method to get location without showing alerts (for background operations)
  static async getCurrentLocationSilent() {
    try {
      console.log('Getting current location silently...');
      
      // Check if location services are enabled
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        console.log('Location services are disabled - skipping location');
        return null;
      }

      // Check permission without requesting
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission not granted - skipping location');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
        maximumAge: 60000,
      });

      console.log('Current location obtained silently:', location.coords);
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.log('Silent location fetch failed:', error.message);
      return null;
    }
  }

  static calculateDistance(userLocation, destinationLocation) {
    if (!userLocation || !destinationLocation) {
      return null;
    }

    const { latitude: lat1, longitude: lon1 } = userLocation;
    const { latitude: lat2, longitude: lon2 } = destinationLocation;

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  static degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  static formatDistance(distance) {
    if (distance === null || distance === undefined) {
      return 'Distance unknown';
    }
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    } else {
      return `${distance}km away`;
    }
  }

  static async openInMaps(destination) {
    try {
      const { latitude, longitude } = destination.coordinates;
      const destinationName = encodeURIComponent(destination.name);
      const address = encodeURIComponent(destination.address || destination.name);

      let mapUrl;
      
      if (Platform.OS === 'ios') {
        // Try to open in Apple Maps first
        mapUrl = `maps://app?daddr=${latitude},${longitude}&q=${destinationName}`;
        
        const supported = await Linking.canOpenURL(mapUrl);
        if (!supported) {
          // Fallback to Google Maps in browser
          mapUrl = `https://maps.google.com/maps?daddr=${latitude},${longitude}&q=${address}`;
        }
      } else {
        // Android - try Google Maps app first
        mapUrl = `google.navigation:q=${latitude},${longitude}&mode=d`;
        
        const supported = await Linking.canOpenURL(mapUrl);
        if (!supported) {
          // Fallback to Google Maps in browser
          mapUrl = `https://maps.google.com/maps?daddr=${latitude},${longitude}&q=${address}`;
        }
      }

      console.log('Opening maps with URL:', mapUrl);
      await Linking.openURL(mapUrl);
      
      return true;
    } catch (error) {
      console.error('Error opening maps:', error);
      
      // Final fallback - open Google Maps in browser
      try {
        const { latitude, longitude } = destination.coordinates;
        const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        await Linking.openURL(fallbackUrl);
        return true;
      } catch (fallbackError) {
        console.error('Error with fallback maps:', fallbackError);
        Alert.alert(
          'Error',
          'Unable to open maps application. Please check if you have a maps app installed.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
  }

  static async shareLocation(destination) {
    try {
      const { latitude, longitude } = destination.coordinates;
      const shareUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      
      // For now, we'll just copy to clipboard or show the URL
      // In a full implementation, you'd use the Share API
      Alert.alert(
        'Share Location',
        `Share this location: ${destination.name}\n\n${shareUrl}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Copy Link', onPress: () => {
            // In a real app, you'd copy to clipboard here
            console.log('Location link copied:', shareUrl);
          }}
        ]
      );
      
      return shareUrl;
    } catch (error) {
      console.error('Error sharing location:', error);
      return null;
    }
  }

  // Get estimated travel time (basic calculation)
  static getEstimatedTravelTime(distance) {
    if (!distance) return null;
    
    // Rough estimates based on distance
    if (distance < 5) {
      return '15-30 minutes by car';
    } else if (distance < 20) {
      return '30-60 minutes by car';
    } else if (distance < 50) {
      return '1-2 hours by car';
    } else {
      return '2+ hours by car';
    }
  }
}

export default LocationService; 
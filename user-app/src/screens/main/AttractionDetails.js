import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RatingModal from '../../components/modals/RatingModal';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import favoritesService from '../../services/api/favoritesService';
import reviewsService from '../../services/api/reviewsService';
import RestaurantsDataService from '../../services/data/RestaurantsDataService';
import LocationService from '../../services/location/LocationService';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/theme';

const { height } = Dimensions.get('window');

const AttractionDetails = ({ route, navigation }) => {
  const { attraction } = route.params;
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [averageRating, setAverageRating] = useState(attraction.rating || 0);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);

  const styles = getStyles(colors, isDarkMode);

  useEffect(() => {
    loadAttractionData();
    loadUserLocation();
    loadNearbyRestaurants();
  }, [attraction.id]);

  const loadAttractionData = async () => {
    try {
      // Check if attraction is favorite
      const favorite = await favoritesService.isFavorite(attraction.id);
      setIsFavorite(favorite);

      // Load user's review for this attraction
      const review = await reviewsService.getUserReviewForAttraction(attraction.id);
      if (review) {
        setUserRating(review.rating);
        setUserReview(review);
      }

      // Load reviews count and average rating
      const attractionReviews = await reviewsService.getReviewsForAttraction(attraction.id);
      setReviewsCount(attractionReviews.length);
      
      const avgRating = await reviewsService.getAverageRating(attraction.id);
      if (avgRating > 0) {
        setAverageRating(parseFloat(avgRating));
      }
    } catch (error) {
      console.error('Error loading attraction data:', error);
    }
  };

  const loadUserLocation = async () => {
    if (!attraction.coordinates) {
      console.log('No coordinates available for this attraction');
      return;
    }

    setIsLoadingLocation(true);
    try {
      // Try silent location first (doesn't show alerts)
      let location = await LocationService.getCurrentLocationSilent();
      
      // If silent method fails, try the regular method (shows alerts)
      if (!location) {
        console.log('Silent location failed, trying with user interaction...');
        location = await LocationService.getCurrentLocation();
      }
      
      if (location) {
        setUserLocation(location);
        const calculatedDistance = LocationService.calculateDistance(
          location,
          attraction.coordinates
        );
        setDistance(calculatedDistance);
        console.log(`Distance to ${attraction.name}: ${calculatedDistance}km`);
      } else {
        console.log('Unable to get location for distance calculation');
      }
    } catch (error) {
      console.log('Location loading failed gracefully:', error.message);
      // Don't show error to user - location is optional feature
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const loadNearbyRestaurants = () => {
    try {
      // Get restaurants based on the attraction's location
      console.log(`Loading restaurants for attraction: ${attraction.name} at ${attraction.location}`);
      
      // Use attraction name or location as fallback, ensure we have a valid string
      const searchLocation = attraction.name || attraction.location || 'Cebu City';
      
      const restaurants = RestaurantsDataService.getNearByRestaurants(searchLocation, 5);
      setNearbyRestaurants(restaurants);
      console.log(`Found ${restaurants.length} nearby restaurants for ${attraction.name || 'Unknown Attraction'}:`, restaurants.map(r => r.name));
    } catch (error) {
      console.error('Error loading nearby restaurants:', error);
      setNearbyRestaurants([]);
    }
  };

  const handleRestaurantPress = (restaurant) => {
    Alert.alert(
      restaurant.name,
      `${restaurant.description}\n\n📍 ${restaurant.location}\n⏰ ${restaurant.openHours}\n💰 ${restaurant.priceRange}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Get Directions', 
          onPress: () => {
            if (restaurant.coordinates) {
              LocationService.openInMaps(restaurant);
            } else {
              Alert.alert('Location Not Available', 'GPS coordinates are not available for this restaurant.');
            }
          }
        }
      ]
    );
  };

  const handleGetDirections = async () => {
    if (!attraction.coordinates) {
      Alert.alert(
        'Location Not Available',
        'GPS coordinates are not available for this attraction.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await LocationService.openInMaps(attraction);
    } catch (error) {
      console.error('Error getting directions:', error);
    }
  };

  const handleShareLocation = async () => {
    if (!attraction.coordinates) {
      Alert.alert(
        'Location Not Available',
        'GPS coordinates are not available for this attraction.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await LocationService.shareLocation(attraction);
    } catch (error) {
      console.error('Error sharing location:', error);
    }
  };

  const getAttractionDescription = (name) => {
    const descriptions = {
      'Basilica del Santo Niño': 'The Basilica del Santo Niño is a 16th-century minor basilica in Cebu City, Philippines. It is the oldest Roman Catholic church in the country, built on the spot where the image of the Santo Niño de Cebu was found during the expedition of Miguel López de Legazpi.',
      'Magellan\'s Cross': 'Magellan\'s Cross is a Christian cross planted by Portuguese and Spanish explorers as ordered by Ferdinand Magellan upon arriving in Cebu in 1521. The cross is housed in a chapel next to the Basilica del Santo Niño.',
      'Temple of Leah': 'Often called the "Taj Mahal of Cebu," the Temple of Leah is a Roman-inspired temple built as a symbol of undying love. It features a grand staircase, statues, and a stunning view of the city.',
      'Kawasan Falls': 'Located in Badian, Kawasan Falls is a three-layered waterfall known for its turquoise water. It\'s a popular spot for canyoneering and swimming.',
      'Moalboal': 'Famous for its sardine run and vibrant marine life, Moalboal is a must-visit for diving and snorkeling enthusiasts. You can also spot sea turtles and colorful coral reefs.',
      'Oslob': 'Known for whale shark watching, Oslob offers a unique opportunity to see these gentle giants up close. The area also features beautiful beaches and historical sites.',
      // Native Filipino Delicacies
      'Lechon Cebu': 'The crown jewel of Filipino cuisine, Cebu\'s lechon is renowned worldwide for its perfectly crispy skin and flavorful meat. Roasted over charcoal with native herbs and spices, it represents the pinnacle of Filipino culinary tradition.',
      'Puso (Hanging Rice)': 'An ancient Filipino tradition of cooking rice wrapped in intricately woven coconut leaves. This method creates a unique diamond-shaped rice perfect for pairing with lechon and other Filipino dishes.',
      'Pochero Cebuano': 'A traditional Filipino comfort food consisting of tender beef, vegetables, and plantains in a rich tomato-based broth. This hearty stew reflects the Filipino way of creating satisfying meals with simple, local ingredients.',
      'Rosquillos': 'Century-old Filipino cookies with a delicate, crispy texture. Created by Margarita "Titay" Frasco in Liloan, these ring-shaped delicacies represent generations of Filipino baking tradition.',
      'Danggit (Dried Fish)': 'A traditional Filipino preservation method creating intensely flavorful dried fish. Bantayan Island\'s danggit is considered the finest in the Philippines, showcasing the country\'s rich maritime culinary heritage.',
      'Masareal': 'A beloved Filipino peanut candy that combines sweet and nutty flavors. This traditional confection from Mandaue represents the Filipino love for simple, satisfying sweets made from local ingredients.',
      'Budbud Kabog': 'An ancient Filipino delicacy made from native millet grain, wrapped in banana leaves. This traditional rice cake from Dalaguete showcases the Philippines\' indigenous grains and cooking techniques.',
      'Dried Sweet Mangoes': 'The Philippines\' most famous fruit export, featuring the world\'s sweetest mangoes dried to perfection. This delicacy represents Filipino excellence in tropical fruit processing.',
      // New tourist destinations across Cebu
      'Malapascua Island': 'A tropical paradise in northern Cebu famous for thresher shark diving, pristine white sand beaches, and stunning sunrises. This small island offers world-class diving and beautiful coral reefs.',
      'Camotes Islands': 'A group of four islands offering pristine beaches, crystal-clear waters, and peaceful island life. Perfect for island hopping, cave exploration, and experiencing authentic Filipino island culture.',
      'Alegria Canyoneering': 'An exciting adventure through scenic canyons, waterfalls, and natural pools. Experience cliff jumping, swimming, and trekking through some of Cebu\'s most beautiful natural landscapes.',
      'Tuburan Hot Springs': 'Natural hot springs nestled in the mountains of northern Cebu. These therapeutic waters are perfect for relaxation and are believed to have healing properties.',
      'Argao Church & Heritage': 'One of the Philippines\' most beautiful Spanish colonial churches, featuring stunning baroque architecture and rich historical significance dating back to the 1700s.',
      'Carcar Heritage Monument': 'A historic city known for its well-preserved Spanish colonial architecture, traditional crafts, and famous local delicacies including chicharon and ampao.',
      'Samboan Waterfalls': 'Hidden waterfalls in southern Cebu offering pristine natural pools perfect for swimming and relaxation in a peaceful, untouched environment.',
      'Dalaguete Highlands': 'Cool mountain highlands known for flower gardens, strawberry farms, and chocolate production. A perfect escape from the tropical heat with stunning mountain views.',
      'Sogod Waterfalls': 'Beautiful multi-tiered waterfalls surrounded by lush tropical vegetation. A great spot for nature lovers and those seeking adventure off the beaten path.',
      'Badian Canyoneering': 'The original and most famous canyoneering destination in Cebu, featuring dramatic cliff jumps, natural slides, and ending at the spectacular Kawasan Falls.',
      // New delicacies from various Cebu municipalities  
      'Carcar Chicharon': 'The most famous pork rinds in the Philippines, known for their perfect crispiness and flavor. Made using traditional methods passed down through generations in Carcar City.',
      'Argao Torta': 'A light and fluffy sponge cake that has been a specialty of Argao for over a century. This sweet delicacy is perfect with coffee and represents traditional Filipino baking.',
      'Cebu Longganisa': 'Sweet and garlicky Filipino sausage that\'s a breakfast staple throughout Cebu. Known for its distinctive sweet flavor and perfect balance of spices.',
      'Sutukil Seafood': 'A unique Cebuano way of preparing fresh seafood - Sugba (grilled), Tuwa (soup), and Kilaw (ceviche). Originating from Lapu-Lapu City\'s fishing communities.',
      'Ngohiong': 'Cebu\'s version of spring rolls, filled with vegetables and meat, served with a special spicy sauce. A popular street food found throughout Cebu City.',
      'Puto Maya': 'Purple sticky rice cake traditionally served with latik (coconut curd) and brown sugar. A beloved Cebuano breakfast dish especially popular in Talisay City.',
      'Chocolate Tableya': 'Pure cacao tablets made from locally grown cacao beans in Cebu\'s highlands. Used to make traditional Filipino hot chocolate and represents Cebu\'s rich agricultural heritage.',
      'Ampao': 'Carcar\'s famous rice crispies treat, light and crunchy with a sweet coating. A beloved pasalubong (souvenir) that represents the ingenuity of Carcar\'s confectioners.',
    };
    return descriptions[name] || 'Description not available.';
  };

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        // Remove from favorites
        const success = await favoritesService.removeFromFavorites(attraction.id);
        if (success) {
          setIsFavorite(false);
          Alert.alert('Removed', 'Removed from your favorites');
        }
      } else {
        // Add to favorites
        const success = await favoritesService.addToFavorites(attraction);
        if (success) {
          setIsFavorite(true);
          Alert.alert('Added', 'Added to your favorites!');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const handleRatingSubmit = async ({ rating, review }) => {
    try {
      const newReview = await reviewsService.addReview(attraction, rating, review);
      setUserRating(rating);
      setUserReview(newReview);
      
      // Reload reviews data
      await loadAttractionData();
      
      Alert.alert(
        'Thank You!',
        'Your rating has been submitted successfully.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating');
    }
  };

  return (
    <>
      <LinearGradient
        colors={[colors.background, colors.cardBackground]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.imageContainer}>
            <Image source={attraction.image} style={styles.image} />
                          <TouchableOpacity
                style={styles.favoriteButton}
                onPress={handleFavoriteToggle}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFavorite ? colors.primary : colors.text}
                />
              </TouchableOpacity>
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.name}>{attraction.name}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.location}>{attraction.location}</Text>
              {distance && (
                <View style={styles.distanceContainer}>
                  <Ionicons name="navigate-outline" size={16} color={colors.primary} />
                  <Text style={styles.distanceText}>
                    {LocationService.formatDistance(distance)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.ratingContainer}>
              <View style={styles.ratingInfo}>
                <Ionicons name="star" size={20} color={colors.primary} />
                <Text style={styles.rating}>{averageRating}</Text>
                <Text style={styles.reviews}>({reviewsCount} reviews)</Text>
              </View>
              <TouchableOpacity
                style={styles.rateButton}
                onPress={() => setShowRatingModal(true)}
              >
                <Text style={styles.rateButtonText}>
                  {userReview ? 'Update Rating' : 
                    (attraction.id && attraction.id.startsWith('d') ? 'Rate this delicacy' : 'Rate this place')}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.description}>
              {getAttractionDescription(attraction.name)}
            </Text>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Highlights</Text>
              <View style={styles.highlightsList}>
                <View style={styles.highlightItem}>
                  <Ionicons name="camera-outline" size={24} color={colors.textSecondary} />
                  <Text style={styles.highlightText}>Perfect for photography</Text>
                </View>
                <View style={styles.highlightItem}>
                  <Ionicons name="time-outline" size={24} color={colors.textSecondary} />
                  <Text style={styles.highlightText}>Best time: Early morning</Text>
                </View>
                <View style={styles.highlightItem}>
                  <Ionicons name="people-outline" size={24} color={colors.textSecondary} />
                  <Text style={styles.highlightText}>Family-friendly</Text>
                </View>
                {distance && (
                  <View style={styles.highlightItem}>
                    <Ionicons name="car-outline" size={24} color={colors.textSecondary} />
                    <Text style={styles.highlightText}>
                      {LocationService.getEstimatedTravelTime(distance)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* GPS Navigation Section */}
            {attraction.coordinates && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Location & Navigation</Text>
                <View style={styles.locationActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleGetDirections}
                  >
                    <Ionicons name="navigate" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Get Directions</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryButton]}
                    onPress={handleShareLocation}
                  >
                    <Ionicons name="share-outline" size={20} color={colors.primary} />
                    <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                      Share Location
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {attraction.address && (
                  <View style={styles.addressContainer}>
                    <Ionicons name="pin-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.addressText}>{attraction.address}</Text>
                  </View>
                )}
                
                {attraction.coordinates && (
                  <View style={styles.coordinatesContainer}>
                    <Text style={styles.coordinatesText}>
                      📍 {attraction.coordinates.latitude.toFixed(6)}, {attraction.coordinates.longitude.toFixed(6)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {userRating && (
              <View style={styles.userRatingContainer}>
                <Text style={styles.userRatingTitle}>Your Rating</Text>
                <View style={styles.userRatingStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name="star"
                      size={20}
                      color={star <= userRating ? colors.primary : (isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)')}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Near Restaurants Section */}
            {nearbyRestaurants.length > 0 && (
              <View style={styles.infoSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="restaurant-outline" size={24} color={colors.primary} />
                  <Text style={[styles.sectionTitle, styles.sectionTitleWithIcon]}>Near Restaurants</Text>
                </View>
                <Text style={styles.sectionSubtitle}>
                  Great dining options near {attraction.name}
                </Text>
                <FlatList
                  data={nearbyRestaurants}
                  renderItem={({ item }) => (
                    <RestaurantCard 
                      restaurant={item} 
                      onPress={handleRestaurantPress}
                    />
                  )}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.restaurantsList}
                />
              </View>
            )}

            <View style={styles.promotionalMessage}>
              <Text style={styles.promotionalText}>
                Visit this amazing destination and create unforgettable memories in Cebu!
              </Text>
              <Text style={styles.promotionalSubtext}>
                Contact local tourism offices for visiting information.
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>

      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        attractionName={attraction.name}
        existingReview={userReview}
      />
    </>
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
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 300,
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
  detailsContainer: {
    padding: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  location: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 5,
    flex: 1,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  distanceText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: 5,
    marginRight: 10,
    fontWeight: '600',
  },
  reviews: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  rateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginTop: 20,
  },
  infoSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  sectionTitleWithIcon: {
    marginBottom: 0,
    marginLeft: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
    marginLeft: 5,
  },
  restaurantsList: {
    paddingLeft: 5,
    paddingRight: 20,
  },
  highlightsList: {
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  highlightText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 10,
  },
  userRatingContainer: {
    marginTop: 30,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
  },
  userRatingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  userRatingStars: {
    flexDirection: 'row',
    gap: 5,
  },
  promotionalMessage: {
    marginTop: 30,
    padding: 20,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    alignItems: 'center',
  },
  promotionalText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  promotionalSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },
  // GPS and Location Styles
  locationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  addressText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  coordinatesContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  coordinatesText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    opacity: 0.7,
  },
});

export default AttractionDetails; 
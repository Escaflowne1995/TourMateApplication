import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/theme';
import reviewsService from '../../services/api/reviewsService';

const MyReviewsScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const styles = getStyles(colors, isDarkMode);
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
    const unsubscribe = navigation.addListener('focus', () => {
      // Reload reviews when screen comes into focus
      loadReviews();
    });
    return unsubscribe;
  }, [navigation]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const reviewsList = await reviewsService.getReviews();
      console.log(`MyReviewsScreen: Loaded ${reviewsList.length} reviews`);
      setReviews(reviewsList);
    } catch (error) {
      console.error('MyReviewsScreen: Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const deleteReview = (id, spotName) => {
    Alert.alert(
      'Delete Review',
      `Are you sure you want to delete your review for ${spotName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await reviewsService.deleteReview(id);
              if (success) {
                setReviews(reviews.filter(item => item.id !== id));
              }
            } catch (error) {
              console.error('Error deleting review:', error);
              Alert.alert('Error', 'Failed to delete review');
            }
          }
        }
      ]
    );
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? 'star' : 'star-outline'}
        size={16}
        color="#ffd700"
        accessible={false}
      />
    ));
  };

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => navigation.navigate('AttractionDetails', { attraction: item })}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${item.spotName || 'Spot'} in ${item.location || 'Unknown location'}`}
        accessibilityHint="Tap to view attraction details"
      >
        <Image 
          source={item.image} 
          style={styles.image}
          accessible={true}
          accessibilityRole="image"
          accessibilityLabel={`Photo of ${item.spotName || 'this place'}`}
        />
        <View style={styles.spotInfo}>
          <Text style={styles.spotName}>{item.spotName || 'Unknown Spot'}</Text>
          <View style={styles.locationContainer}>
            <Ionicons 
              name="location-outline" 
              size={14} 
              color={colors.textSecondary}
              accessible={false}
            />
            <Text style={styles.location}>{item.location || 'Unknown location'}</Text>
          </View>
          <Text style={styles.reviewDate}>{formatDate(item.date)}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.reviewContent}>
        <View style={styles.ratingContainer}>
          <View 
            style={styles.starsContainer}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`Your rating: ${item.rating || 0} out of 5 stars`}
          >
            {renderStars(item.rating)}
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteReview(item.id, item.spotName)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Delete review"
            accessibilityHint={`Delete your review for ${item.spotName}`}
          >
            <Ionicons 
              name="trash-outline" 
              size={20} 
              color="#dc3545"
              accessible={false}
            />
          </TouchableOpacity>
        </View>

        <Text 
          style={styles.reviewText}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`Your review: ${item.review || 'No review text'}`}
        >
          {item.review || 'No review text available'}
        </Text>

        <View style={styles.reviewStats}>
          <View style={styles.statItem}>
            <Ionicons 
              name="heart-outline" 
              size={16} 
              color="#FF6B35"
              accessible={false}
            />
            <Text 
              style={styles.statText}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={`${item.likes || 0} likes`}
            >
              {item.likes || 0} likes
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons 
              name="thumbs-up-outline" 
              size={16} 
              color="#28a745"
              accessible={false}
            />
            <Text 
              style={styles.statText}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={`${item.helpful || 0} people found this helpful`}
            >
              {item.helpful || 0} helpful
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="chatbubble-outline" 
        size={80} 
        color={colors.textSecondary}
        accessible={false}
      />
      <Text 
        style={styles.emptyTitle}
        accessible={true}
        accessibilityRole="text"
      >
        No Reviews Yet
      </Text>
      <Text 
        style={styles.emptySubtitle}
        accessible={true}
        accessibilityRole="text"
      >
        Share your experiences by writing reviews for places you've visited!
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Home')}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Start Exploring"
        accessibilityHint="Navigate to home screen to find places to review"
      >
        <Text style={styles.exploreButtonText}>Start Exploring</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View 
        style={styles.content}
        accessible={true}
        accessibilityLabel="My Reviews Screen"
      >
        <View style={styles.header}>
          <Text 
            style={styles.headerTitle}
            accessible={true}
            accessibilityRole="text"
          >
            My Reviews
          </Text>
          <Text 
            style={styles.headerSubtitle}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`You have written ${reviews.length} reviews`}
          >
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </Text>
        </View>

        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={reviews.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={renderEmptyList}
          showsVerticalScrollIndicator={false}
          accessible={false}
          accessibilityLabel="List of your reviews"
        />
      </View>
    </View>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
  list: {
    padding: 15,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  reviewCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  spotInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  spotName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 5,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  reviewContent: {
    padding: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  deleteButton: {
    padding: 5,
  },
  reviewText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 15,
  },
  reviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  exploreButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyReviewsScreen; 
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RatingModal = ({ visible, onClose, onSubmit, attractionName, existingReview = null }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [review, setReview] = useState(existingReview?.review || '');

  // Update state when existingReview changes
  React.useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setReview(existingReview.review || '');
    } else {
      setRating(0);
      setReview('');
    }
  }, [existingReview, visible]);

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    onSubmit({ rating, review });
    setRating(0);
    setReview('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title}>Rate your experience</Text>
          <Text style={styles.subtitle}>{attractionName}</Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={rating >= star ? 'star' : 'star-outline'}
                  size={40}
                  color={rating >= star ? '#A855F7' : 'rgba(255,255,255,0.3)'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.ratingText}>
            {rating > 0 ? `${rating} out of 5 stars` : 'Tap a star to rate'}
          </Text>

          <TextInput
            style={styles.reviewInput}
            placeholder="Share your experience (optional)"
            placeholderTextColor="rgba(255,255,255,0.6)"
            multiline
            numberOfLines={4}
            value={review}
            onChangeText={setReview}
          />

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: '#A855F7' }]}
            onPress={handleSubmit}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Submit Rating"
            accessibilityHint="Submit your rating and review"
          >
            <Text style={styles.submitButtonText}>Submit Rating</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  starButton: {
    padding: 5,
  },
  ratingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  reviewInput: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    color: '#fff',
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#A855F7',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    width: '100%',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default RatingModal; 
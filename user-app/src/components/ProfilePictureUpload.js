import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SimpleImageService from '../services/image/SimpleImageService';
import UserService from '../services/user/UserService';

const ProfilePictureUpload = ({ userId, currentAvatar, onAvatarUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState(currentAvatar);

  const showImageOptions = () => {
    Alert.alert(
      'Profile Picture',
      'Choose how you want to update your profile picture',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickFromGallery },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const takePhoto = async () => {
    const result = await SimpleImageService.takePhoto();
    if (result.success) {
      uploadImage(result.uri);
    } else if (!result.canceled) {
      Alert.alert('Error', result.error || 'Failed to take photo');
    }
  };

  const pickFromGallery = async () => {
    const result = await SimpleImageService.pickImage();
    if (result.success) {
      uploadImage(result.uri);
    } else if (!result.canceled) {
      Alert.alert('Error', result.error || 'Failed to pick image');
    }
  };

  const uploadImage = async (imageUri) => {
    setUploading(true);
    
    try {
      // Convert to base64 for local storage
      const uploadResult = await SimpleImageService.convertToBase64(imageUri);
      
              if (uploadResult.success) {
          setAvatar(uploadResult.base64);
          
          // Update user profile in local storage
          const updateResult = await UserService.saveUserData(userId, {
            avatar: uploadResult.base64
          });
          
          if (updateResult.success) {
            if (onAvatarUpdate) {
              onAvatarUpdate(uploadResult.base64);
            }
            Alert.alert('Success!', 'Profile picture updated');
          } else {
            throw new Error(updateResult.error);
          }
        } else {
          throw new Error(uploadResult.error);
        }
      
    } catch (error) {
      Alert.alert('Upload Failed', error.message || 'Please try again');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.avatarContainer} 
        onPress={showImageOptions} 
        disabled={uploading}
      >
        <View style={styles.avatarWrapper}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Ionicons name="person" size={50} color="#ccc" />
            </View>
          )}
          
          {uploading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="white" />
            </View>
          )}
          
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={16} color="white" />
          </View>
        </View>
      </TouchableOpacity>
      
      <Text style={styles.instructionText}>
        Tap to change profile picture
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    margin: 20,
  },
  avatarContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  instructionText: {
    marginTop: 15,
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ProfilePictureUpload; 
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

// Multiple FREE options for profile picture uploads
class ImageUploadService {
  
  // Method 1: Firebase Storage (REMOVED - using alternative methods)
  static async uploadToFirebaseStorage(userId, imageUri) {
    throw new Error('Firebase storage has been removed. Use uploadToCloudinary or uploadLocally instead.');
  }

  // Method 2: Cloudinary (FREE TIER - 25GB storage, 25GB transfer/month)
  static async uploadToCloudinary(imageUri, cloudName, uploadPreset) {
    try {
      const compressedImage = await this.compressImage(imageUri);
      
      const formData = new FormData();
      formData.append('file', {
        uri: compressedImage.uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });
      formData.append('upload_preset', uploadPreset);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      const data = await response.json();
      
      if (data.secure_url) {
        return {
          success: true,
          url: data.secure_url,
          publicId: data.public_id,
          method: 'cloudinary'
        };
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        method: 'cloudinary'
      };
    }
  }

  // Method 3: ImgBB (FREE - 32MB per image)
  static async uploadToImgBB(imageUri, apiKey) {
    try {
      const compressedImage = await this.compressImage(imageUri);
      const base64 = await this.imageToBase64(compressedImage.uri);
      
      const formData = new FormData();
      formData.append('image', base64);
      
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          url: data.data.url,
          deleteUrl: data.data.delete_url,
          method: 'imgbb'
        };
      } else {
        throw new Error(data.error.message);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        method: 'imgbb'
      };
    }
  }

  // Method 4: Base64 in Firestore (FREE but limited)
  static async convertToBase64(imageUri) {
    try {
      const compressedImage = await this.compressImage(imageUri, 0.3, 200);
      const base64 = await this.imageToBase64(compressedImage.uri);
      
      return {
        success: true,
        base64: `data:image/jpeg;base64,${base64}`,
        method: 'base64'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        method: 'base64'
      };
    }
  }

  // Pick image from gallery
  static async pickImage() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Gallery permission required');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        return {
          success: true,
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height
        };
      } else {
        return { success: false, canceled: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Take photo with camera
  static async takePhoto() {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Camera permission required');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        return {
          success: true,
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height
        };
      } else {
        return { success: false, canceled: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Compress image to save space
  static async compressImage(uri, quality = 0.7, maxSize = 800) {
    try {
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxSize, height: maxSize } }],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return compressedImage;
    } catch (error) {
      console.error('Compression failed:', error);
      return { uri };
    }
  }

  // Convert image to base64
  static async imageToBase64(uri) {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error('Base64 conversion failed');
    }
  }

  // Utility: Delete from Firebase Storage (REMOVED)
  static async deleteFromFirebaseStorage(imagePath) {
    throw new Error('Firebase storage has been removed.');
  }
}

export default ImageUploadService; 
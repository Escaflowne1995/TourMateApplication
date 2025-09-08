import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

// Simplified image service without Firebase dependencies
class SimpleImageService {
  
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

  // Compress image
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

  // Convert to base64 for Firestore storage
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
}

export default SimpleImageService; 
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import LocalAuthService from '../../services/auth/LocalAuthService';
import { getCurrentUser } from '../../services/supabase/authService';
import UserService from '../../services/user/UserService';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/theme';

const EditProfileScreen = ({ navigation, route }) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const styles = getStyles(colors, isDarkMode);
  
  const userData = route.params?.userData || {};
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: userData.fullName || userData.displayName || userData.name || 'Guest User',
    email: userData.email || 'guest@example.com',
    phone: userData.phone || '',
    location: userData.location || 'Cebu City, Philippines',
    avatar: userData.avatar || '',
    birthDate: userData.birthDate || '',
    gender: userData.gender || '',
    country: userData.country || '',
    zipCode: userData.zipCode || ''
  });

  // Check if birthdate is already set (to make it non-editable)
  const isBirthDateSet = userData.birthDate && userData.birthDate.trim() !== '';
  const isGenderSet = userData.gender && userData.gender.trim() !== '';

  // Gender options
  const genderOptions = [
    { id: 'male', label: 'Male', icon: '♂️' },
    { id: 'female', label: 'Female', icon: '♀️' },
  ];

  // State for gender dropdown
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // Load fresh user data when screen mounts
  useEffect(() => {
    const loadFreshUserData = async () => {
      try {
        console.log('EditProfile: Loading fresh user data...');
        const result = await UserService.getCurrentUserData();
        
        if (result.success && result.userData) {
          const freshData = result.userData;
          console.log('EditProfile: Fresh user data loaded:', freshData);
          
          // Update profile data with fresh data
          setProfileData({
            name: freshData.fullName || freshData.displayName || freshData.name || 'Guest User',
            email: freshData.email || 'guest@example.com',
            phone: freshData.phone || '',
            location: freshData.location || 'Cebu City, Philippines',
            avatar: freshData.avatar || '',
            birthDate: freshData.birthDate || '',
            gender: freshData.gender || '',
            country: freshData.country || '',
            zipCode: freshData.zipCode || ''
          });
        } else {
          console.log('EditProfile: Could not load fresh user data, using route params');
        }
      } catch (error) {
        console.error('EditProfile: Error loading fresh user data:', error);
      }
    };

    loadFreshUserData();
  }, []); // Run once when component mounts

  const handleSave = async () => {
    console.log('=== PROFILE SAVE DEBUG START ===');
    console.log('Profile data to save:', profileData);
    
    // Check authentication with both Supabase and local auth
    try {
      // First try Supabase authentication
      const supabaseResult = await getCurrentUser();
      let currentUser = null;
      
      if (supabaseResult.success && supabaseResult.data) {
        currentUser = supabaseResult.data;
        console.log('Authenticated via Supabase:', currentUser.id);
      } else {
        // Fallback to local authentication
        currentUser = await LocalAuthService.getCurrentUser();
        console.log('Authenticated via Local Auth:', currentUser ? 'Yes' : 'No');
      }

      if (!currentUser) {
        console.log('ERROR: No current user found');
        Alert.alert('Error', 'You must be logged in to update your profile.');
        return;
      }
    } catch (error) {
      console.error('Authentication check error:', error);
      Alert.alert('Error', 'Authentication error. Please log in again.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Update user profile
      const updatedUserData = {
        fullName: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        avatar: profileData.avatar,
        birthDate: profileData.birthDate,
        gender: profileData.gender,
        country: profileData.country,
        zipCode: profileData.zipCode,
        updatedAt: new Date().toISOString()
      };
      
      // First try Supabase authentication and update
      const supabaseResult = await getCurrentUser();
      if (supabaseResult.success && supabaseResult.data) {
        console.log('=== SUPABASE SAVE ATTEMPT ===');
        // User is authenticated with Supabase, update Supabase profile
        const { supabase } = require('../../services/supabase/supabaseClient');
        
        // Start with basic fields that exist in current schema
        const profileUpdateData = {
          id: supabaseResult.data.id,
          name: profileData.name, // Keep old column for backward compatibility
          updated_at: new Date().toISOString()
        };

        // Try to update with extended data first, fallback to basic if needed
        let updateData = {
          ...profileUpdateData,
          full_name: profileData.name,
          phone: profileData.phone,
          location: profileData.location,
          avatar_url: profileData.avatar,
          birth_date: profileData.birthDate,
          gender: profileData.gender,
          country: profileData.country,
          zip_code: profileData.zipCode
        };

        console.log('Attempting Supabase update with data:', updateData);

        const { error } = await supabase
          .from('profiles')
          .upsert(updateData);
          
        if (error) {
          console.error('=== SUPABASE UPDATE ERROR ===');
          console.error('Error details:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          
          // If the error is about missing columns, try with basic fields only
          if (error.message.includes('column') || error.message.includes('avatar_url') || error.code === 'PGRST204') {
            console.log('=== TRYING BASIC FIELDS FALLBACK ===');
            console.log('Basic update data:', profileUpdateData);
            
            const { error: basicError } = await supabase
              .from('profiles')
              .upsert(profileUpdateData);
              
            if (basicError) {
              console.error('=== BASIC UPDATE ALSO FAILED ===');
              console.error('Basic error:', basicError);
              // Fallback to local storage if Supabase fails completely
              console.log('=== FALLING BACK TO LOCAL STORAGE ===');
              console.log('Local storage data:', updatedUserData);
              await LocalAuthService.updateUserProfile(updatedUserData);
              console.log('=== LOCAL STORAGE SAVE COMPLETED ===');
            } else {
              console.log('=== BASIC SUPABASE UPDATE SUCCESS ===');
              console.log('Profile updated with basic fields. Database schema needs to be updated for full profile features.');
            }
          } else {
            console.error('=== UNEXPECTED SUPABASE ERROR ===');
            console.error('Error:', error);
            // Fallback to local storage for any other errors
            console.log('=== FALLING BACK TO LOCAL STORAGE ===');
            console.log('Local storage data:', updatedUserData);
            await LocalAuthService.updateUserProfile(updatedUserData);
            console.log('=== LOCAL STORAGE SAVE COMPLETED ===');
          }
        } else {
          console.log('=== SUPABASE UPDATE SUCCESS ===');
          console.log('Full profile data saved to Supabase successfully!');
        }
      } else {
        console.log('=== NO SUPABASE AUTH - USING LOCAL STORAGE ===');
        console.log('Local storage data:', updatedUserData);
        await LocalAuthService.updateUserProfile(updatedUserData);
        console.log('=== LOCAL STORAGE SAVE COMPLETED ===');
      }

      console.log('=== PROFILE SAVE DEBUG END ===');

      Alert.alert(
        'Profile Updated',
        'Your profile has been successfully updated!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back and trigger a refresh of the profile screen
              navigation.navigate('Profile', { 
                refresh: true,
                userData: {
                  ...userData,
                  fullName: profileData.name,
                  email: profileData.email,
                  phone: profileData.phone,
                  location: profileData.location,
                  avatar: profileData.avatar
                }
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Profile save error:', error);
      Alert.alert(
        'Error', 
        'Failed to update profile. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const convertImageToBase64 = async (uri) => {
    try {
      console.log('Converting image to base64 for current user');
      
      // Import the simple image service
      const SimpleImageService = require('../../services/image/SimpleImageService').default;
      
      // Convert to base64 using our simple service
      const result = await SimpleImageService.convertToBase64(uri);
      
      if (result.success) {
        console.log('Base64 conversion successful');
        return result.base64;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Base64 conversion error:', error);
      throw new Error(`Image processing failed: ${error.message}`);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access gallery is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Reduced quality to avoid size issues
        base64: false,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        setIsLoading(true);
        try {
          const base64Avatar = await convertImageToBase64(result.assets[0].uri);
          setProfileData({...profileData, avatar: base64Avatar});
          Alert.alert('Success', 'Profile picture updated!');
        } catch (error) {
          Alert.alert('Error', 'Failed to process image. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery.');
    }
  };

  const pickImageFromCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Reduced quality to avoid size issues
        base64: false,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        setIsLoading(true);
        try {
          const base64Avatar = await convertImageToBase64(result.assets[0].uri);
          setProfileData({...profileData, avatar: base64Avatar});
          Alert.alert('Success', 'Profile picture updated!');
        } catch (error) {
          Alert.alert('Error', 'Failed to process image. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera.');
    }
  };

  const handleChangeAvatar = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        { text: 'Camera', onPress: pickImageFromCamera },
        { text: 'Gallery', onPress: pickImageFromGallery },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} accessible={true} accessibilityLabel="Edit Profile Screen">
        <View style={styles.profileImageSection}>
          <TouchableOpacity onPress={handleChangeAvatar} style={styles.avatarContainer}>
            {profileData.avatar ? (
              <Image
                source={{ uri: profileData.avatar }}
                style={styles.avatar}
                accessible={true}
                accessibilityRole="image"
                accessibilityLabel={`Current profile picture of ${profileData.name}`}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={40} color="#ccc" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleChangeAvatar}>
            <Text style={styles.uploadPhotoText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.formFlat}>
          <Text style={styles.labelFlat}>Name</Text>
          <TextInput
            style={styles.inputFlat}
            value={profileData.name}
            onChangeText={(text) => setProfileData({...profileData, name: text})}
            placeholder="Enter your full name"
          />
          <View style={styles.row2col}>
            <View style={styles.col2}>
              <Text style={styles.labelFlat}>Birth Date</Text>
              <TextInput
                style={[styles.inputFlat, isBirthDateSet && styles.inputDisabled]}
                value={profileData.birthDate || ''}
                onChangeText={isBirthDateSet ? undefined : (text) => setProfileData({...profileData, birthDate: text})}
                placeholder="MM/DD/YYYY"
                editable={!isBirthDateSet}
                selectTextOnFocus={!isBirthDateSet}
              />
              {isBirthDateSet && (
                <Text style={styles.disabledNote}>Birth date cannot be changed</Text>
              )}
            </View>
            <View style={styles.col2}>
              <Text style={styles.labelFlat}>Gender</Text>
              {isGenderSet ? (
                <>
                  <TextInput
                    style={[styles.inputFlat, styles.inputDisabled]}
                    value={profileData.gender || ''}
                    placeholder="Gender"
                    editable={false}
                    selectTextOnFocus={false}
                  />
                  <Text style={styles.disabledNote}>Gender cannot be changed</Text>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.genderSelector}
                  onPress={() => setShowGenderPicker(true)}
                >
                  <Text style={[styles.genderText, !profileData.gender && styles.genderPlaceholder]}>
                    {profileData.gender ? 
                      genderOptions.find(option => option.id === profileData.gender.toLowerCase())?.label || profileData.gender
                      : 'Select Gender'
                    }
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Text style={styles.labelFlat}>Email</Text>
          <TextInput
            style={[styles.inputFlat, styles.inputDisabled]}
            value={profileData.email}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
            selectTextOnFocus={false}
          />
          <Text style={styles.disabledNote}>Email cannot be changed</Text>
          <Text style={styles.labelFlat}>Mobile</Text>
          <TextInput
            style={styles.inputFlat}
            value={profileData.phone}
            onChangeText={(text) => setProfileData({...profileData, phone: text})}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
          <View style={styles.row2col}>
            <View style={styles.col2}>
              <Text style={styles.labelFlat}>Country</Text>
              <TextInput
                style={styles.inputFlat}
                value={profileData.country || ''}
                onChangeText={(text) => setProfileData({...profileData, country: text})}
                placeholder="Country"
              />
            </View>
            <View style={styles.col2}>
              <Text style={styles.labelFlat}>Zip Code</Text>
              <TextInput
                style={styles.inputFlat}
                value={profileData.zipCode || ''}
                onChangeText={(text) => setProfileData({...profileData, zipCode: text})}
                placeholder="Zip Code"
                keyboardType="numeric"
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isLoading}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Save Changes"
            accessibilityHint="Save your profile changes"
            accessibilityState={{ disabled: isLoading }}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Gender Picker Modal */}
      <Modal
        visible={showGenderPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              <TouchableOpacity
                onPress={() => setShowGenderPicker(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={genderOptions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.genderItem,
                    profileData.gender?.toLowerCase() === item.id && styles.selectedGenderItem
                  ]}
                  onPress={() => {
                    setProfileData({...profileData, gender: item.label});
                    setShowGenderPicker(false);
                  }}
                >
                  <Text style={styles.genderItemIcon}>{item.icon}</Text>
                  <Text style={styles.genderItemLabel}>{item.label}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  topBarSaveOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 40,
    paddingHorizontal: 18,
    paddingBottom: 10,
    backgroundColor: colors.cardBackground,
  },
  saveButtonTop: {
    padding: 4,
  },
  saveButtonTopText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  profileImageSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#eee',
  },
  avatarPlaceholder: {
    backgroundColor: isDarkMode ? '#374151' : '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPhotoText: {
    color: '#FF6B35',
    fontWeight: '600',
    fontSize: 16,
    marginTop: 10,
  },
  formFlat: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },
  labelFlat: {
    fontSize: 15,
    color: isDarkMode ? colors.textSecondary : '#888',
    marginBottom: 2,
    marginTop: 18,
    fontWeight: '500',
  },
  inputFlat: {
    fontSize: 18,
    color: isDarkMode ? '#9CA3AF' : '#666',
    fontWeight: '700',
    backgroundColor: isDarkMode ? '#374151' : '#f5f5f5', // Match email field background
    borderWidth: 0,
    borderBottomWidth: 1.5,
    borderColor: isDarkMode ? '#4B5563' : '#ddd',
    borderRadius: 0,
    paddingVertical: 8,
    marginBottom: 2,
  },
  inputDisabled: {
    backgroundColor: isDarkMode ? '#374151' : '#f5f5f5',
    color: isDarkMode ? '#9CA3AF' : '#666',
    borderColor: isDarkMode ? '#4B5563' : '#ddd',
  },
  disabledNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
    marginBottom: 8,
  },
  row2col: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  col2: {
    flex: 1,
    marginRight: 10,
  },
  saveButton: {
    padding: 16,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Gender selector styles
  genderSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: isDarkMode ? '#374151' : '#f5f5f5', // Match email field background
    borderBottomWidth: 1.5,
    borderColor: isDarkMode ? '#4B5563' : '#ddd',
    marginBottom: 2,
  },
  genderText: {
    fontSize: 18,
    color: isDarkMode ? '#9CA3AF' : '#666',
    fontWeight: '700',
  },
  genderPlaceholder: {
    color: isDarkMode ? '#6B7280' : '#999',
    fontWeight: '400',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    width: '80%',
    maxHeight: '40%',
    shadowColor: isDarkMode ? '#000' : '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDarkMode ? 0.5 : 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  genderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedGenderItem: {
    backgroundColor: isDarkMode ? '#1E3A8A' : '#f0f8ff',
  },
  genderItemIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  genderItemLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default EditProfileScreen; 
import AsyncStorage from '@react-native-async-storage/async-storage';

// Single Responsibility: Only handles user data operations
class UserService {
  static async getUserData(user) {
    try {
      // Check if user object exists and has required properties
      if (!user) {
        return {
          success: false,
          userData: null,
          error: 'No user provided'
        };
      }

      if (!user.uid && !user.id) {
        return {
          success: false,
          userData: null,
          error: 'User object missing uid/id property'
        };
      }

      // Use uid or id (Supabase uses id, Firebase uses uid)
      const userId = user.uid || user.id;
      const userEmail = user.email || '';
      const userDisplayName = user.displayName || user.user_metadata?.name || 'User';
      const userPhotoURL = user.photoURL || user.avatar || ''; // Empty for new users

      // Try to get user data from AsyncStorage first
      const userStorageKey = `@user_data_${userId}`;
      const storedUserData = await AsyncStorage.getItem(userStorageKey);
      
      let userData = {
        uid: userId,
        email: userEmail,
        fullName: userDisplayName,
        avatar: userPhotoURL,
      };
      
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        userData = {
          ...userData,
          fullName: parsedData.fullName || userData.fullName,
          phone: parsedData.phone || '',
          avatar: parsedData.avatar || userData.avatar,
          location: parsedData.location || '',
        };
      }
      
      return {
        success: true,
        userData,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        userData: null,
        error: error
      };
    }
  }

  static async saveUserData(userId, userData) {
    try {
      const userStorageKey = `@user_data_${userId}`;
      await AsyncStorage.setItem(userStorageKey, JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get current user data (checks both Supabase and local storage)
  static async getCurrentUserData() {
    console.log('=== USER SERVICE GET CURRENT DATA START ===');
    try {
      // First try to get current user from Supabase
      try {
        const { getCurrentUser } = require('../supabase/authService');
        const supabaseResult = await getCurrentUser();
        
        if (supabaseResult.success && supabaseResult.data) {
          const supabaseUser = supabaseResult.data;
          console.log('UserService: Found Supabase user:', supabaseUser.id);
          
          // Get profile data from Supabase profiles table
          const { supabase } = require('../supabase/supabaseClient');
          console.log('UserService: Querying profiles table for user:', supabaseUser.id);
          
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();
          
          if (!error && profile) {
            console.log('UserService: Profile found in Supabase:', profile);
            // Return Supabase profile data with proper mapping
            const userData = {
              uid: supabaseUser.id,
              id: supabaseUser.id,
              email: supabaseUser.email,
              fullName: profile.full_name || profile.name || supabaseUser.user_metadata?.name || 'User',
              name: profile.full_name || profile.name || supabaseUser.user_metadata?.name || 'User',
              phone: profile.phone || '',
              location: profile.location || '',
              avatar: profile.avatar_url || '',
              birthDate: profile.birth_date || '',
              gender: profile.gender || '',
              country: profile.country || '',
              zipCode: profile.zip_code || '',
              updatedAt: profile.updated_at
            };
            console.log('UserService: Returning Supabase profile data:', userData);
            return {
              success: true,
              userData,
              error: null
            };
          } else {
            console.log('UserService: No profile found in Supabase, error:', error);
            console.log('UserService: Returning basic user data from auth');
            // User exists but no profile yet, return basic data
            const basicUserData = {
              uid: supabaseUser.id,
              id: supabaseUser.id,
              email: supabaseUser.email,
              fullName: supabaseUser.user_metadata?.name || 'User',
              name: supabaseUser.user_metadata?.name || 'User',
              phone: '',
              location: '',
              avatar: '',
              birthDate: '',
              gender: '',
              country: '',
              zipCode: ''
            };
            console.log('UserService: Basic user data:', basicUserData);
            return {
              success: true,
              userData: basicUserData,
              error: null
            };
          }
        }
      } catch (supabaseError) {
        console.log('UserService: Supabase not available, trying local auth:', supabaseError.message);
      }
      
      // Fallback to LocalAuthService
      console.log('UserService: Trying LocalAuthService fallback');
      const LocalAuthService = require('../auth/LocalAuthService').default;
      const currentUser = await LocalAuthService.getCurrentUser();
      
      if (currentUser) {
        console.log('UserService: Found local user, getting data');
        const result = await this.getUserData(currentUser);
        console.log('UserService: Local user data result:', result);
        return result;
      }

      console.log('UserService: No current user found anywhere');
      return {
        success: false,
        userData: null,
        error: 'No current user found'
      };
    } catch (error) {
      return {
        success: false,
        userData: null,
        error: error.message
      };
    }
  }
}

export default UserService; 
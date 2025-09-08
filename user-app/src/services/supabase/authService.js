import { supabase } from './supabaseClient';

/**
 * Register a new user using Supabase Auth and create profile
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {Object} profileData - Additional profile data (phone, etc.)
 * @returns {Object} - Result object with success status and data/error
 */
export const registerUser = async (name, email, password, profileData = {}) => {
  try {
    // Use Supabase Auth for user registration
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        }
      }
    });

    if (authError) {
      return {
        success: false,
        error: authError.message
      };
    }

    // If auth signup was successful, create user profile in profiles table
    if (authData.user) {
      console.log('Creating user profile for:', authData.user.id);
      
      // Create profile record with registration data
      const profileRecord = {
        id: authData.user.id,
        name: name,
        full_name: name,
        email: email, // Add email field for admin panel compatibility
        phone: profileData.phone || '',
        location: profileData.location || '',
        country: profileData.country || 'Philippines',
        zip_code: profileData.zipCode || '',
        birth_date: profileData.birthDate || null,
        gender: profileData.gender || '',
        avatar_url: profileData.avatar || '',
        is_active: true,
        favorite_spots: [],
        total_reviews: 0,
        registration_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Attempting to create profile record:', profileRecord);

      // Try to create the profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileRecord);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail the whole registration if profile creation fails
        // The user can fill in profile data later
        console.log('Profile creation failed, but user auth succeeded. User can complete profile later.');
      } else {
        console.log('Profile created successfully for user:', authData.user.id);
      }

      return {
        success: true,
        data: {
          user: authData.user,
          needsEmailConfirmation: !authData.user.email_confirmed_at,
          profileCreated: !profileError
        }
      };
    }

    return {
      success: false,
      error: 'User registration failed'
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Login user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Object} - Result object with success status and data/error
 */
export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.warn('Could not fetch user profile:', profileError.message);
    }

    return {
      success: true,
      data: {
        user: data.user,
        session: data.session,
        profile: profile || null
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Logout current user
 * @returns {Object} - Result object with success status
 */
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get current user session
 * @returns {Object} - Current session or null
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: session
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get current user
 * @returns {Object} - Current user or null
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: user
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

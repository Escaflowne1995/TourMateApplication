import LocalAuthService from './LocalAuthService';
import { loginUser } from '../supabase';

// Single Responsibility: Only handles authentication
class AuthService {
  static async login(email, password) {
    try {
      console.log('AuthService: Attempting to sign in with email:', email);
      
      // Try Supabase authentication first
      const supabaseResult = await loginUser(email, password);
      
      if (supabaseResult.success) {
        console.log('AuthService: Supabase sign in successful');
        return {
          success: true,
          user: {
            uid: supabaseResult.data.user.id,
            email: supabaseResult.data.user.email,
            displayName: supabaseResult.data.user.user_metadata?.name || email.split('@')[0],
            emailVerified: supabaseResult.data.user.email_confirmed_at ? true : false,
          },
          error: null
        };
      }
      
      // Fallback to local auth if Supabase fails
      console.log('AuthService: Trying local auth as fallback');
      const result = await LocalAuthService.login(email, password);
      console.log('AuthService: Local auth result:', result.success ? 'successful' : 'failed');
      return result;
    } catch (error) {
      console.log('AuthService: Sign in failed with error:', error.message);
      return {
        success: false,
        user: null,
        error: error
      };
    }
  }

  static async resetPassword(email) {
    try {
      console.log('AuthService: Sending password reset email to:', email);
      const result = await LocalAuthService.resetPassword(email);
      return result;
    } catch (error) {
      console.log('AuthService: Password reset failed:', error.message);
      return { success: false, error: error };
    }
  }

  static async createAccount(email, password) {
    try {
      console.log('AuthService: Creating new account for email:', email);
      const result = await LocalAuthService.createAccount(email, password);
      console.log('AuthService: Account creation result:', result.success ? 'successful' : 'failed');
      return result;
    } catch (error) {
      console.log('AuthService: Account creation failed:', error.message);
      return {
        success: false,
        user: null,
        error: error
      };
    }
  }

  static getErrorMessage(errorCode) {
    return LocalAuthService.getErrorMessage(errorCode);
  }

  static getCurrentUser() {
    return LocalAuthService.getCurrentUser();
  }

  static async signOut() {
    return await LocalAuthService.signOut();
  }

  static isSignedIn() {
    return LocalAuthService.isSignedIn();
  }
}

export default AuthService; 
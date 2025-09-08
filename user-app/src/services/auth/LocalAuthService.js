import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_STORAGE_KEY = '@tourist_app_users';
const CURRENT_USER_STORAGE_KEY = '@tourist_app_current_user';

// Local authentication service without Firebase
class LocalAuthService {
  static currentUser = null;

  // Initialize the service by loading current user
  static async initialize() {
    try {
      const currentUserString = await AsyncStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (currentUserString) {
        this.currentUser = JSON.parse(currentUserString);
      }
    } catch (error) {
      console.error('LocalAuthService: Error initializing:', error);
    }
  }

  // Get all registered users
  static async getUsers() {
    try {
      const usersString = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      return usersString ? JSON.parse(usersString) : [];
    } catch (error) {
      console.error('LocalAuthService: Error getting users:', error);
      return [];
    }
  }

  // Save users to storage
  static async saveUsers(users) {
    try {
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('LocalAuthService: Error saving users:', error);
    }
  }

  // Generate a simple user ID
  static generateUserId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Create a new account
  static async createAccount(email, password) {
    try {
      const users = await this.getUsers();
      
      // Check if user already exists
      const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return {
          success: false,
          user: null,
          error: { code: 'auth/email-already-in-use', message: 'Email already in use' }
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          user: null,
          error: { code: 'auth/invalid-email', message: 'Invalid email format' }
        };
      }

      // Validate password length
      if (password.length < 6) {
        return {
          success: false,
          user: null,
          error: { code: 'auth/weak-password', message: 'Password should be at least 6 characters' }
        };
      }

      // Create new user
      const newUser = {
        uid: this.generateUserId(),
        email: email.toLowerCase(),
        password: password, // In a real app, this should be hashed
        createdAt: new Date().toISOString(),
        displayName: email.split('@')[0],
      };

      users.push(newUser);
      await this.saveUsers(users);

      // Set as current user
      this.currentUser = { ...newUser };
      delete this.currentUser.password; // Don't keep password in memory
      await AsyncStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(this.currentUser));

      // Reset services state for new user
      this.resetUserServices();

      console.log('LocalAuthService: Account created successfully for:', email);
      return {
        success: true,
        user: this.currentUser,
        error: null
      };
    } catch (error) {
      console.error('LocalAuthService: Account creation failed:', error);
      return {
        success: false,
        user: null,
        error: { code: 'auth/unknown', message: 'Account creation failed' }
      };
    }
  }

  // Login with email and password
  static async login(email, password) {
    try {
      const users = await this.getUsers();
      
      // Find user by email
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return {
          success: false,
          user: null,
          error: { code: 'auth/user-not-found', message: 'Account not found' }
        };
      }

      // Check password
      if (user.password !== password) {
        return {
          success: false,
          user: null,
          error: { code: 'auth/wrong-password', message: 'Invalid password' }
        };
      }

      // Set as current user
      this.currentUser = { ...user };
      delete this.currentUser.password; // Don't keep password in memory
      await AsyncStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(this.currentUser));

      // Reset services state for new user
      this.resetUserServices();

      console.log('LocalAuthService: Login successful for:', email);
      return {
        success: true,
        user: this.currentUser,
        error: null
      };
    } catch (error) {
      console.error('LocalAuthService: Login failed:', error);
      return {
        success: false,
        user: null,
        error: { code: 'auth/unknown', message: 'Login failed' }
      };
    }
  }

  // Reset password (simulated - in real app would send email)
  static async resetPassword(email) {
    try {
      const users = await this.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return {
          success: false,
          error: { code: 'auth/user-not-found', message: 'Account not found' }
        };
      }

      // In a real app, this would send an email
      console.log('LocalAuthService: Password reset would be sent to:', email);
      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('LocalAuthService: Password reset failed:', error);
      return {
        success: false,
        error: { code: 'auth/unknown', message: 'Password reset failed' }
      };
    }
  }

  // Get current user
  static getCurrentUser() {
    return this.currentUser;
  }

  // Sign out
  static async signOut() {
    try {
      // Reset services state before logout
      this.resetUserServices();
      
      this.currentUser = null;
      await AsyncStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      console.log('LocalAuthService: Sign out successful');
      return { success: true };
    } catch (error) {
      console.error('LocalAuthService: Sign out failed:', error);
      return { success: false, error };
    }
  }

  // Check if user is signed in
  static isSignedIn() {
    return this.currentUser !== null;
  }

  // Get error message for display
  static getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'Account not found',
      'auth/invalid-credential': 'Invalid credentials. Try resetting your password or creating a new account.',
      'auth/wrong-password': 'Invalid password',
      'auth/email-already-in-use': 'Email already in use',
      'auth/invalid-email': 'Invalid email format',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'default': 'Authentication failed. Please try again.'
    };
    return errorMessages[errorCode] || errorMessages.default;
  }

  // Reset user services state (prevents data leakage between users)
  static resetUserServices() {
    try {
      console.log('LocalAuthService: Resetting user services state');
      
      // Import services and reset their state
      const favoritesService = require('../api/favoritesService').default;
      const reviewsService = require('../api/reviewsService').default;
      
      favoritesService.resetState();
      reviewsService.resetState();
      
      console.log('LocalAuthService: User services state reset complete');
    } catch (error) {
      console.error('LocalAuthService: Error resetting services:', error);
    }
  }

  // Clear all user data (for testing)
  static async clearAllData() {
    try {
      await AsyncStorage.removeItem(USERS_STORAGE_KEY);
      await AsyncStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      this.currentUser = null;
      this.resetUserServices();
      console.log('LocalAuthService: All data cleared');
    } catch (error) {
      console.error('LocalAuthService: Error clearing data:', error);
    }
  }
}

// Initialize the service
LocalAuthService.initialize();

export default LocalAuthService;

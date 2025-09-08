import AsyncStorage from '@react-native-async-storage/async-storage';

const EMAIL_HISTORY_KEY = 'emailHistory';
const MAX_EMAILS = 5; // Maximum number of emails to store

class EmailHistoryService {
  static async getEmailHistory() {
    try {
      if (!AsyncStorage) {
        console.warn('AsyncStorage not available, returning empty email history');
        return [];
      }
      const emailHistoryString = await AsyncStorage.getItem(EMAIL_HISTORY_KEY);
      if (emailHistoryString) {
        return JSON.parse(emailHistoryString);
      }
      return [];
    } catch (error) {
      console.error('Error loading email history:', error);
      return [];
    }
  }

  static async saveEmail(email) {
    try {
      if (!AsyncStorage) {
        console.warn('AsyncStorage not available, cannot save email');
        return;
      }
      if (!email || !email.trim()) return;
      
      const currentHistory = await this.getEmailHistory();
      
      // Remove email if it already exists to avoid duplicates
      const filteredHistory = currentHistory.filter(
        savedEmail => savedEmail.toLowerCase() !== email.toLowerCase()
      );
      
      // Add the new email at the beginning
      const newHistory = [email, ...filteredHistory];
      
      // Keep only the most recent MAX_EMAILS
      const limitedHistory = newHistory.slice(0, MAX_EMAILS);
      
      await AsyncStorage.setItem(EMAIL_HISTORY_KEY, JSON.stringify(limitedHistory));
      console.log('Email saved to history:', email);
    } catch (error) {
      console.error('Error saving email to history:', error);
    }
  }

  static async removeEmail(email) {
    try {
      if (!AsyncStorage) {
        console.warn('AsyncStorage not available, cannot remove email');
        return;
      }
      const currentHistory = await this.getEmailHistory();
      const filteredHistory = currentHistory.filter(
        savedEmail => savedEmail.toLowerCase() !== email.toLowerCase()
      );
      
      await AsyncStorage.setItem(EMAIL_HISTORY_KEY, JSON.stringify(filteredHistory));
      console.log('Email removed from history:', email);
    } catch (error) {
      console.error('Error removing email from history:', error);
    }
  }

  static async clearEmailHistory() {
    try {
      if (!AsyncStorage) {
        console.warn('AsyncStorage not available, cannot clear email history');
        return;
      }
      await AsyncStorage.removeItem(EMAIL_HISTORY_KEY);
      console.log('Email history cleared');
    } catch (error) {
      console.error('Error clearing email history:', error);
    }
  }
}

export default EmailHistoryService; 
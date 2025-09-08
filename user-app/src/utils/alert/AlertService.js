import { Alert } from 'react-native';

// Interface Segregation: Focused on alert operations only
// Open/Closed: Easy to extend with new alert types
class AlertService {
  static showError(title, message) {
    Alert.alert(title, message);
  }

  static showConfirmation(title, message, onConfirm, onCancel) {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: onCancel },
        { text: 'OK', onPress: onConfirm }
      ]
    );
  }

  static showAccountNotFound(email, onSignup) {
    console.log('AlertService: Showing account not found alert');
    Alert.alert(
      'Account Not Found',
      'We couldn\'t find an account with those credentials. Would you like to create a new account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Up', onPress: () => {
          console.log('User chose to sign up with email:', email);
          onSignup(email);
        }}
      ]
    );
  }

  static showInvalidCredentials(email, onResetPassword, onSignup) {
    console.log('AlertService: Showing invalid credentials alert');
    Alert.alert(
      'Login Failed',
      'Invalid credentials. This might be due to a previous account issue. What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset Password', onPress: () => {
          console.log('User chose to reset password for:', email);
          onResetPassword(email);
        }},
        { text: 'Create New Account', onPress: () => {
          console.log('User chose to create new account with email:', email);
          onSignup(email);
        }}
      ]
    );
  }

  static showCorruptedAccountRecovery(email, onResetPassword, onRecreateAccount) {
    console.log('AlertService: Showing corrupted account recovery alert');
    Alert.alert(
      'Account Recovery',
      'Your account appears to be corrupted from a previous error. We can help you recover it:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset Password', onPress: () => {
          console.log('User chose to reset password for corrupted account:', email);
          onResetPassword(email);
        }},
        { text: 'Recreate Account', onPress: () => {
          console.log('User chose to recreate account:', email);
          onRecreateAccount(email);
        }}
      ]
    );
  }

  static showTooManyAttempts() {
    Alert.alert('Too Many Attempts', 'Please try again later.');
  }

  static showInvalidPassword() {
    Alert.alert('Invalid Password', 'The password you entered is incorrect.');
  }
}

export default AlertService; 
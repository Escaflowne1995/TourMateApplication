import { supabase } from './supabaseClient';
import { Alert } from 'react-native';

/**
 * Helper functions for handling email confirmation in mobile apps
 */

/**
 * Resend confirmation email
 * @param {string} email - User's email address
 * @returns {Object} - Result object with success status
 */
export const resendConfirmationEmail = async (email) => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      message: 'Confirmation email sent successfully!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check if user's email is confirmed
 * @returns {Object} - Result object with confirmation status
 */
export const checkEmailConfirmation = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return {
        success: false,
        error: error.message,
        isConfirmed: false
      };
    }

    if (!user) {
      return {
        success: false,
        error: 'No user found',
        isConfirmed: false
      };
    }

    const isConfirmed = !!user.email_confirmed_at;

    return {
      success: true,
      isConfirmed,
      user,
      message: isConfirmed ? 'Email is confirmed' : 'Email not confirmed'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      isConfirmed: false
    };
  }
};

/**
 * Show email confirmation dialog with options
 * @param {string} email - User's email address
 * @param {Function} onResend - Callback when user wants to resend
 * @param {Function} onSkip - Callback when user wants to skip
 */
export const showEmailConfirmationDialog = (email, onResend, onSkip) => {
  Alert.alert(
    'Email Confirmation Required',
    `Please check your email (${email}) and click the confirmation link. You can also resend the confirmation email or skip for now.`,
    [
      {
        text: 'Resend Email',
        onPress: onResend
      },
      {
        text: 'Skip for Now',
        style: 'cancel',
        onPress: onSkip
      },
      {
        text: 'I Confirmed',
        onPress: () => {
          Alert.alert(
            'Great!',
            'Please try logging in now with your credentials.',
            [{ text: 'OK', onPress: onSkip }]
          );
        }
      }
    ]
  );
};

/**
 * Handle the email confirmation flow for signup
 * @param {string} email - User's email address
 * @param {Function} navigation - Navigation object
 */
export const handleSignupEmailConfirmation = async (email, navigation) => {
  const confirmationResult = await checkEmailConfirmation();
  
  if (confirmationResult.isConfirmed) {
    Alert.alert(
      'Email Confirmed!',
      'Your email has been confirmed. You can now log in.',
      [
        {
          text: 'Go to Login',
          onPress: () => navigation.navigate('Login', { email })
        }
      ]
    );
    return;
  }

  showEmailConfirmationDialog(
    email,
    // On resend
    async () => {
      const resendResult = await resendConfirmationEmail(email);
      if (resendResult.success) {
        Alert.alert('Success', resendResult.message);
      } else {
        Alert.alert('Error', `Failed to resend email: ${resendResult.error}`);
      }
    },
    // On skip
    () => {
      navigation.navigate('Login', { 
        email, 
        needsConfirmation: true 
      });
    }
  );
};

/**
 * Create a simple web page for email confirmation (for development)
 * This can be used as a temporary redirect URL
 */
export const getConfirmationPageHTML = () => {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Email Confirmed</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: #f0f0f0;
        }
        .container { 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 400px;
            margin: 0 auto;
        }
        .success { color: #4CAF50; }
        .button { 
            background: #007AFF; 
            color: white; 
            padding: 10px 20px; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer; 
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="success">✅ Email Confirmed!</h1>
        <p>Your email has been successfully confirmed.</p>
        <p>You can now close this page and return to the app to log in.</p>
        <button class="button" onclick="window.close()">Close</button>
    </div>
</body>
</html>
  `;
};

export default {
  resendConfirmationEmail,
  checkEmailConfirmation,
  showEmailConfirmationDialog,
  handleSignupEmailConfirmation,
  getConfirmationPageHTML
};

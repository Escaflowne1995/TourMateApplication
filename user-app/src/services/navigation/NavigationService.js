// Single Responsibility: Only handles navigation logic
class NavigationService {
  static navigateToMainApp(navigation, userData) {
    navigation.reset({
      index: 0,
      routes: [{ 
        name: 'MainApp', 
        params: { 
          userEmail: userData.email,
          userName: userData.fullName,
          userPhone: userData.phone || '',
          userAvatar: userData.avatar,
          userData: userData
        } 
      }],
    });
  }

  static navigateToSignup(navigation, email = '') {
    navigation.navigate('Signup', { email });
  }
}

export default NavigationService; 
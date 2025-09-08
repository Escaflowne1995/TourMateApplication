import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LocalAuthService from '../../services/auth/LocalAuthService';
import UserService from '../../services/user/UserService';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/theme';
import favoritesService from '../../services/api/favoritesService';
import reviewsService from '../../services/api/reviewsService';

const ProfileScreen = ({ navigation, route, userData: userDataProp }) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const styles = getStyles(colors, isDarkMode);
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(userDataProp || route.params?.userData || {});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);

  // Load favorites and reviews counts
  const loadCounts = async () => {
    try {
      console.log('ProfileScreen: Loading counts...');
      
      // Force reload data for current user to ensure fresh data
      await favoritesService.reloadData();
      await reviewsService.reloadData();
      
      const [favCount, revCount] = await Promise.all([
        favoritesService.getFavoritesCount(),
        reviewsService.getReviewsCount()
      ]);
      
      console.log(`ProfileScreen: Loaded counts - Favorites: ${favCount}, Reviews: ${revCount}`);
      
      setFavoritesCount(favCount || 0);
      setReviewsCount(revCount || 0);
    } catch (error) {
      console.error('ProfileScreen: Error loading counts:', error);
      // Set defaults if there's an error
      setFavoritesCount(0);
      setReviewsCount(0);
    }
  };


  // Refresh user data when screen focuses or user changes
  useEffect(() => {
    const refreshUserData = async () => {
      // Using local storage instead of Firebase auth
      try {
        setIsRefreshing(true);
        const result = await UserService.getCurrentUserData();
        if (result.success) {
          setCurrentUserData(result.userData);
          console.log('ProfileScreen: User data refreshed for:', result.userData.email);
        }
      } catch (error) {
        console.error('ProfileScreen: Failed to refresh user data:', error);
      } finally {
        setIsRefreshing(false);
      }
      
      // Load counts after user data
      await loadCounts();
    };

    // Refresh data when screen loads
    refreshUserData();

    // Set up navigation focus listener to refresh when returning to screen
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('ProfileScreen: Screen focused, refreshing data...');
      refreshUserData();
    });
    
    return unsubscribe;
  }, [navigation]);

  const userProfile = {
    name: currentUserData.fullName || currentUserData.displayName || currentUserData.name || 'Guest User',
    email: currentUserData.email || 'guest@example.com',
    avatar: currentUserData.avatar || '', // Empty for new users
    favoriteSpots: favoritesCount,
    reviews: reviewsCount,
    language: 'English',
    currency: 'PHP',
  };

  const menuItems = [
    {
      id: '1',
      title: 'Edit Profile',
      icon: 'person-outline',
      action: () => navigation.navigate('EditProfile', { userData: currentUserData }),
      accessibilityLabel: 'Edit Profile',
      accessibilityHint: 'Opens profile editing screen',
    },
    {
      id: '2',
      title: 'Favorite Cebu Spots',
      icon: 'heart-outline',
      action: () => navigation.navigate('FavoriteSpots'),
      accessibilityLabel: 'Favorite Cebu Spots',
      accessibilityHint: 'View your favorite tourist spots in Cebu',
    },
    {
      id: '3',
      title: 'My Reviews',
      icon: 'star-outline',
      action: () => navigation.navigate('MyReviews'),
      accessibilityLabel: 'My Reviews',
      accessibilityHint: 'View and manage your reviews',
    },
    {
      id: '4',
      title: 'Travel History',
      icon: 'map-outline',
      action: () => navigation.navigate('TravelHistory'),
      accessibilityLabel: 'Travel History',
      accessibilityHint: 'View your travel history and past trips',
    },
    {
      id: '6',
      title: 'Language',
      icon: 'language-outline',
      value: userProfile.language,
      action: () => navigation.navigate('Language'),
      accessibilityLabel: 'Language Settings',
      accessibilityHint: `Currently set to ${userProfile.language}. Tap to change language`,
    },
    {
      id: '8',
      title: 'Settings',
      icon: 'settings-outline',
      action: () => navigation.navigate('Settings'),
      accessibilityLabel: 'Settings',
      accessibilityHint: 'Open app settings and preferences',
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            setIsLoading(true);
            try {
              // Local auth logout
              await LocalAuthService.signOut();
              navigation.reset({
                index: 0,
                routes: [{ 
                  name: 'Auth',
                  params: {
                    screen: 'Landing'
                  }
                }],
              });
              setIsLoading(false);
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
              setIsLoading(false);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={loadCounts}
      >
        {/* Profile Header with Background Image */}
        <View style={styles.headerWrapper}>
          <ImageBackground
            source={require('../../../assets/images/profile-background.jpg')}
            style={styles.headerBg}
            imageStyle={styles.headerBgImage}
          >
            <View style={styles.profileInfo}>
              {userProfile.avatar ? (
                <Image
                  source={{ 
                    uri: currentUserData.avatar && currentUserData.avatar.startsWith('data:image') 
                      ? currentUserData.avatar 
                      : userProfile.avatar 
                  }}
                  style={styles.profilePic}
                />
              ) : (
                <View style={[styles.profilePic, styles.profilePicPlaceholder]}>
                  <Ionicons name="person" size={60} color="#ffffff" />
                </View>
              )}
              <Text style={styles.profileName}>{userProfile.name}</Text>
              <View style={styles.statsContainer}>
                <View style={[styles.statCard, isDarkMode && styles.statCardDark]}>
                  <Text style={[styles.statNumber, isDarkMode && styles.statNumberDark]}>{userProfile.favoriteSpots}</Text>
                  <Text style={[styles.statLabel, isDarkMode && styles.statLabelDark]}>Favorite Spots</Text>
                </View>
                <View style={[styles.statCard, isDarkMode && styles.statCardDark]}>
                  <Text style={[styles.statNumber, isDarkMode && styles.statNumberDark]}>{userProfile.reviews}</Text>
                  <Text style={[styles.statLabel, isDarkMode && styles.statLabelDark]}>Reviews</Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Card Section for Menu Items */}
        <View style={[styles.card, isDarkMode && styles.cardDark]}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.row,
                isDarkMode && styles.rowDark,
                idx === menuItems.length - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={item.action}
              activeOpacity={0.8}
              accessible={true}
              accessibilityLabel={item.accessibilityLabel}
              accessibilityHint={item.accessibilityHint}
            >
              <Ionicons name={item.icon} size={22} color={isDarkMode ? colors.primary : '#888'} style={styles.rowIcon} />
              <Text style={[styles.rowLabel, isDarkMode && styles.rowLabelDark]}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={isDarkMode ? colors.primary : '#bbb'} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={22} color="#FFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerWrapper: {
    marginBottom: 10,
  },
  headerBg: {
    height: 300,
    justifyContent: 'flex-end',
  },
  headerBgImage: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileInfo: {
    alignItems: 'center',
    paddingTop: 40,
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 10,
  },
  profilePicPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 30,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    alignSelf: 'stretch',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statCardDark: {
    backgroundColor: colors.cardBackground,
    shadowColor: 'rgba(0,0,0,0.7)',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  statNumberDark: {
    color: colors.text,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  statLabelDark: {
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 18,
    marginHorizontal: 18,
    marginTop: 24,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: colors.cardBackground,
    shadowColor: 'rgba(0,0,0,0.7)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowDark: {
    borderBottomColor: colors.border,
  },
  rowIcon: { marginRight: 16 },
  rowLabel: { flex: 1, fontSize: 16, color: '#222' },
  rowLabelDark: {
    color: colors.text,
  },
  logoutButton: {
    backgroundColor: colors.error,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default ProfileScreen;
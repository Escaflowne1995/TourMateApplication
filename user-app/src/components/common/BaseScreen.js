import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/theme';
import StyleFactory from '../../utils/factories/StyleFactory';
import { ErrorBoundary } from './ErrorBoundary';

// Single Responsibility: Only handles common screen layout and structure
// Open/Closed: Easy to extend with new screen types
const BaseScreen = ({
  children,
  title,
  subtitle,
  showHeader = true,
  showBackButton = false,
  showStatusBar = true,
  statusBarStyle = 'light-content',
  backgroundColor,
  gradientColors,
  headerActions,
  isLoading = false,
  loadingText = 'Loading...',
  error = null,
  onRetry,
  onBack,
  scrollable = true,
  paddingHorizontal = true,
  safeArea = true,
  testID,
  accessibilityLabel,
  customStyles = {},
  headerHeight = 'normal', // 'small', 'normal', 'large'
  centerContent = false,
  refreshing = false,
  onRefresh,
  showShadow = true
}) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  
  // Get base styles using StyleFactory (DRY principle)
  const baseStyles = StyleFactory.createScreenStyles(colors, isDarkMode);
  const styles = StyleFactory.mergeStyles(baseStyles, customStyles);

  // Handle back button press (Single Responsibility)
  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else {
      // Default back behavior could be navigation.goBack()
      console.warn('BaseScreen: No onBack handler provided');
    }
  };

  // Error state renderer (Single Responsibility)
  const renderError = () => (
    <View style={styles.centered}>
      <Ionicons name="warning-outline" size={48} color={colors.error || '#FF6B6B'} />
      <Text style={[styles.loadingText, { color: colors.error || '#FF6B6B', marginTop: 16 }]}>
        {error.message || 'Something went wrong'}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={[styles.button, { marginTop: 16 }]}
          onPress={onRetry}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Loading state renderer (Single Responsibility)
  const renderLoading = () => (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>{loadingText}</Text>
    </View>
  );

  // Header renderer (Single Responsibility)
  const renderHeader = () => {
    if (!showHeader) return null;

    const headerHeights = {
      small: 80,
      normal: 120,
      large: 160
    };

    const headerStyle = {
      ...styles.header,
      height: headerHeights[headerHeight],
      paddingTop: safeArea ? (StatusBar.currentHeight || 44) + 10 : 20,
    };

    const content = (
      <View style={headerStyle}>
        <View style={styles.headerRow}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          
          <View style={styles.headerContent}>
            {title && (
              <Text 
                style={styles.headerTitle}
                numberOfLines={1}
                accessibilityRole="header"
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={styles.headerSubtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            )}
          </View>

          {headerActions && (
            <View style={styles.headerActions}>
              {headerActions}
            </View>
          )}
        </View>
      </View>
    );

    // Apply gradient if provided (Open/Closed Principle)
    if (gradientColors) {
      return (
        <LinearGradient colors={gradientColors} style={headerStyle}>
          {content}
        </LinearGradient>
      );
    }

    return content;
  };

  // Content renderer (Single Responsibility)
  const renderContent = () => {
    if (error) return renderError();
    if (isLoading) return renderLoading();

    const contentStyle = [
      { flex: 1 },
      paddingHorizontal && { paddingHorizontal: StyleFactory.spacing.md },
      centerContent && styles.centered
    ];

    if (scrollable) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          testID={`${testID}-scroll`}
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <View style={contentStyle}>
        {children}
      </View>
    );
  };

  // Container component (Dependency Inversion)
  const Container = safeArea ? SafeAreaView : View;

  return (
    <ErrorBoundary>
      <Container 
        style={[
          styles.container,
          backgroundColor && { backgroundColor },
          showShadow && StyleFactory.shadows.small
        ]}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
      >
        {showStatusBar && (
          <StatusBar
            barStyle={statusBarStyle}
            backgroundColor="transparent"
            translucent
          />
        )}
        
        {renderHeader()}
        {renderContent()}
      </Container>
    </ErrorBoundary>
  );
};

// Higher-Order Component for common screen patterns (Factory Pattern)
export const ScreenFactory = {
  // Create a standard form screen
  createFormScreen: (props) => (
    <BaseScreen
      showHeader={true}
      showBackButton={true}
      scrollable={true}
      paddingHorizontal={true}
      headerHeight="normal"
      {...props}
    />
  ),

  // Create a list screen
  createListScreen: (props) => (
    <BaseScreen
      showHeader={true}
      showBackButton={false}
      scrollable={false} // List handles its own scrolling
      paddingHorizontal={false}
      headerHeight="normal"
      {...props}
    />
  ),

  // Create a dashboard screen
  createDashboardScreen: (props) => (
    <BaseScreen
      showHeader={true}
      showBackButton={false}
      scrollable={true}
      paddingHorizontal={false}
      headerHeight="large"
      gradientColors={['#A855F7', '#8B5CF6']}
      {...props}
    />
  ),

  // Create a modal screen
  createModalScreen: (props) => (
    <BaseScreen
      showHeader={true}
      showBackButton={true}
      scrollable={true}
      paddingHorizontal={true}
      headerHeight="small"
      safeArea={false}
      {...props}
    />
  ),

  // Create a detail screen
  createDetailScreen: (props) => (
    <BaseScreen
      showHeader={false}
      scrollable={true}
      paddingHorizontal={false}
      statusBarStyle="light-content"
      {...props}
    />
  ),

  // Create a settings screen
  createSettingsScreen: (props) => (
    <BaseScreen
      showHeader={true}
      showBackButton={true}
      scrollable={true}
      paddingHorizontal={false}
      headerHeight="normal"
      {...props}
    />
  )
};

export default BaseScreen; 
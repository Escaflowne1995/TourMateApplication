import { StyleSheet, Platform } from 'react-native';

// Single Responsibility: Only handles style creation and common patterns
// Open/Closed: Easy to extend with new style patterns
class StyleFactory {
  
  // Common style generators (DRY principle)
  static shadows = {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
      elevation: 2,
    },
    
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    }
  };

  static spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40
  };

  static borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 25,
    round: 50
  };

  static fontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    title: 32
  };

  // Factory methods for common components (Factory Pattern)
  static createCard(colors, size = 'medium') {
    return {
      backgroundColor: colors.cardBackground,
      borderRadius: this.borderRadius.lg,
      padding: this.spacing.lg,
      marginVertical: this.spacing.sm,
      ...this.shadows[size],
      borderWidth: Platform.OS === 'android' ? 0.5 : 0,
      borderColor: colors.border || 'rgba(0,0,0,0.1)'
    };
  }

  static createButton(colors, variant = 'primary', size = 'medium') {
    const baseButton = {
      borderRadius: this.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      ...this.shadows.small,
    };

    const sizes = {
      small: { paddingVertical: 8, paddingHorizontal: 16 },
      medium: { paddingVertical: 12, paddingHorizontal: 20 },
      large: { paddingVertical: 16, paddingHorizontal: 24 }
    };

    const variants = {
      primary: {
        backgroundColor: colors.primary,
      },
      secondary: {
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.primary,
      },
      danger: {
        backgroundColor: colors.error || '#FF6B6B',
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
      }
    };

    return {
      ...baseButton,
      ...sizes[size],
      ...variants[variant],
    };
  }

  static createButtonText(colors, variant = 'primary', size = 'medium') {
    const sizes = {
      small: { fontSize: this.fontSize.sm },
      medium: { fontSize: this.fontSize.md },
      large: { fontSize: this.fontSize.lg }
    };

    const variants = {
      primary: { color: '#FFFFFF', fontWeight: '600' },
      secondary: { color: colors.primary, fontWeight: '600' },
      danger: { color: '#FFFFFF', fontWeight: '600' },
      ghost: { color: colors.text, fontWeight: '500' }
    };

    return {
      ...sizes[size],
      ...variants[variant],
    };
  }

  static createInput(colors, hasError = false) {
    return {
      backgroundColor: colors.cardBackground || '#FFFFFF',
      borderRadius: this.borderRadius.md,
      padding: this.spacing.md,
      fontSize: this.fontSize.md,
      color: colors.text,
      borderWidth: 1,
      borderColor: hasError ? (colors.error || '#FF6B6B') : (colors.border || '#E0E0E0'),
      ...this.shadows.small,
    };
  }

  static createHeader(colors, isDarkMode = false) {
    return {
      paddingTop: Platform.OS === 'ios' ? 50 : 30,
      paddingBottom: this.spacing.lg,
      paddingHorizontal: this.spacing.lg,
      backgroundColor: colors.primary,
      borderBottomLeftRadius: this.borderRadius.xl,
      borderBottomRightRadius: this.borderRadius.xl,
    };
  }

  static createHeaderTitle(colors, size = 'large') {
    const sizes = {
      small: this.fontSize.lg,
      medium: this.fontSize.xl,
      large: this.fontSize.xxxl,
      xlarge: this.fontSize.title
    };

    return {
      fontSize: sizes[size],
      fontWeight: '800',
      color: '#FFFFFF',
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    };
  }

  static createHeaderSubtitle(colors) {
    return {
      fontSize: this.fontSize.md,
      color: '#FFFFFF',
      opacity: 0.9,
      textAlign: 'center',
      marginTop: this.spacing.xs,
    };
  }

  static createSection(colors) {
    return {
      marginHorizontal: this.spacing.md,
      marginVertical: this.spacing.sm,
      borderRadius: this.borderRadius.lg,
      backgroundColor: colors.cardBackground,
      ...this.shadows.medium,
    };
  }

  static createSectionTitle(colors) {
    return {
      fontSize: this.fontSize.lg,
      fontWeight: '700',
      color: colors.text,
      marginBottom: this.spacing.md,
      marginLeft: this.spacing.lg,
      marginTop: this.spacing.lg,
    };
  }

  static createListItem(colors, isLast = false) {
    return {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: this.spacing.md,
      paddingHorizontal: this.spacing.lg,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: colors.border,
      minHeight: 60,
    };
  }

  static createIcon(size = 'medium') {
    const sizes = {
      small: 16,
      medium: 24,
      large: 32,
      xlarge: 40
    };

    return {
      width: sizes[size],
      height: sizes[size],
    };
  }

  static createModalContainer(colors) {
    return {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: this.spacing.lg,
    };
  }

  static createModalContent(colors) {
    return {
      backgroundColor: colors.cardBackground,
      borderRadius: this.borderRadius.xl,
      padding: this.spacing.xl,
      width: '100%',
      maxWidth: 400,
      ...this.shadows.large,
    };
  }

  // Screen-specific style factories
  static createScreenContainer(colors) {
    return {
      flex: 1,
      backgroundColor: colors.background,
    };
  }

  static createScrollView() {
    return {
      flex: 1,
      backgroundColor: 'transparent',
    };
  }

  static createCenteredContent() {
    return {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: this.spacing.lg,
    };
  }

  static createLoadingText(colors) {
    return {
      marginTop: this.spacing.md,
      fontSize: this.fontSize.md,
      color: colors.textSecondary,
      fontWeight: '600',
    };
  }

  // Error states
  static createErrorContainer(colors) {
    return {
      backgroundColor: colors.error || '#FF6B6B',
      borderRadius: this.borderRadius.md,
      padding: this.spacing.md,
      marginVertical: this.spacing.sm,
    };
  }

  static createErrorText() {
    return {
      color: '#FFFFFF',
      fontSize: this.fontSize.sm,
      fontWeight: '500',
    };
  }

  // Success states
  static createSuccessContainer(colors) {
    return {
      backgroundColor: colors.success || '#4CAF50',
      borderRadius: this.borderRadius.md,
      padding: this.spacing.md,
      marginVertical: this.spacing.sm,
    };
  }

  static createSuccessText() {
    return {
      color: '#FFFFFF',
      fontSize: this.fontSize.sm,
      fontWeight: '500',
    };
  }

  // Form-specific styles
  static createFormContainer() {
    return {
      padding: this.spacing.lg,
    };
  }

  static createFormGroup() {
    return {
      marginBottom: this.spacing.lg,
    };
  }

  static createFormLabel(colors, isRequired = false) {
    return {
      fontSize: this.fontSize.md,
      fontWeight: '600',
      color: isRequired ? colors.primary : colors.text,
      marginBottom: this.spacing.sm,
    };
  }

  static createFormHelper(colors) {
    return {
      fontSize: this.fontSize.xs,
      color: colors.textSecondary,
      marginTop: this.spacing.xs,
      fontStyle: 'italic',
    };
  }

  // Factory method for complete style sheets (Factory Pattern)
  static createFormStyles(colors, isDarkMode = false) {
    return StyleSheet.create({
      container: this.createScreenContainer(colors),
      scrollContainer: { ...this.createScrollView(), padding: this.spacing.lg },
      header: this.createHeader(colors, isDarkMode),
      headerTitle: this.createHeaderTitle(colors),
      headerSubtitle: this.createHeaderSubtitle(colors),
      formContainer: this.createFormContainer(),
      formGroup: this.createFormGroup(),
      label: this.createFormLabel(colors),
      requiredLabel: this.createFormLabel(colors, true),
      input: this.createInput(colors),
      inputError: this.createInput(colors, true),
      helper: this.createFormHelper(colors),
      errorText: this.createErrorText(),
      submitButton: this.createButton(colors, 'primary', 'large'),
      submitButtonText: this.createButtonText(colors, 'primary', 'large'),
      disabledButton: { opacity: 0.6 },
    });
  }

  static createScreenStyles(colors, isDarkMode = false) {
    return StyleSheet.create({
      container: this.createScreenContainer(colors),
      scrollView: this.createScrollView(),
      header: this.createSection(colors),
      headerTitle: this.createHeaderTitle(colors, 'large'),
      headerSubtitle: this.createHeaderSubtitle(colors),
      section: this.createSection(colors),
      sectionTitle: this.createSectionTitle(colors),
      card: this.createCard(colors),
      button: this.createButton(colors),
      buttonText: this.createButtonText(colors),
      centered: this.createCenteredContent(),
      loadingText: this.createLoadingText(colors),
    });
  }

  static createListStyles(colors, isDarkMode = false) {
    return StyleSheet.create({
      container: this.createScreenContainer(colors),
      list: { padding: this.spacing.md },
      listItem: this.createListItem(colors),
      listItemLast: this.createListItem(colors, true),
      card: this.createCard(colors),
      emptyState: this.createCenteredContent(),
      emptyText: this.createLoadingText(colors),
    });
  }

  // Utility method to merge custom styles (Open/Closed Principle)
  static mergeStyles(baseStyles, customStyles = {}) {
    const merged = { ...baseStyles };
    
    Object.keys(customStyles).forEach(key => {
      if (merged[key]) {
        merged[key] = { ...merged[key], ...customStyles[key] };
      } else {
        merged[key] = customStyles[key];
      }
    });
    
    return merged;
  }

  // Responsive utility methods
  static createResponsiveSpacing(screenWidth) {
    const isTablet = screenWidth > 768;
    const isPhone = screenWidth <= 480;
    
    return {
      xs: isPhone ? 2 : isTablet ? 6 : 4,
      sm: isPhone ? 4 : isTablet ? 12 : 8,
      md: isPhone ? 8 : isTablet ? 24 : 16,
      lg: isPhone ? 12 : isTablet ? 32 : 24,
      xl: isPhone ? 16 : isTablet ? 40 : 32,
      xxl: isPhone ? 20 : isTablet ? 48 : 40
    };
  }

  static createResponsiveFontSize(screenWidth) {
    const isTablet = screenWidth > 768;
    const isPhone = screenWidth <= 480;
    
    return {
      xs: isPhone ? 10 : isTablet ? 14 : 12,
      sm: isPhone ? 12 : isTablet ? 16 : 14,
      md: isPhone ? 14 : isTablet ? 18 : 16,
      lg: isPhone ? 16 : isTablet ? 20 : 18,
      xl: isPhone ? 18 : isTablet ? 22 : 20,
      xxl: isPhone ? 20 : isTablet ? 26 : 24,
      title: isPhone ? 24 : isTablet ? 36 : 32
    };
  }
}

export default StyleFactory; 
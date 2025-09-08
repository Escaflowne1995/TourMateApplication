// AuthScreenLayout.js - Premium tourism auth layout with travel imagery
import React from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../common/Logo';

const { height } = Dimensions.get('window');

// Beautiful Cebu tourism images for auth backgrounds
const authBackgrounds = [
  require('../../../assets/images/kawasan-falls.jpg'),
  require('../../../assets/images/moalboal.jpg'),
  require('../../../assets/images/bantayan.jpg'),
];

const AuthScreenLayout = ({ 
  colors, 
  children, 
  showLogo = true,
  extraPaddingBottom = 120,
  backgroundIndex = 0
}) => {
  // Memoize styles to prevent recreation
  const styles = React.useMemo(() => getStyles(colors, extraPaddingBottom), [colors, extraPaddingBottom]);
  
  // Memoize background image selection
  const backgroundImage = React.useMemo(() => 
    authBackgrounds[backgroundIndex % authBackgrounds.length], 
    [backgroundIndex]
  );

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={backgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover"
        fadeDuration={0}
        loadingIndicatorSource={null}
      >
        {/* Premium gradient overlay for readability */}
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0.4)',
            'rgba(0, 0, 0, 0.6)',
            'rgba(0, 0, 0, 0.8)'
          ]}
          style={styles.gradientOverlay}
        />
        
        <KeyboardAvoidingView 
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {showLogo && (
              <View style={styles.header}>
                <Logo size="normal" />
              </View>
            )}
            
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

const getStyles = (colors, extraPaddingBottom) => StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 60,
    minHeight: height,
    paddingBottom: extraPaddingBottom,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 15,
  },
});

export default AuthScreenLayout; 
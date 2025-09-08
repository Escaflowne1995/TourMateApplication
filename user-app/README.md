# TouristApp User Application

🏖️ **Mobile Tourist Application for Exploring Destinations**

This is the main user-facing mobile application built with React Native and Expo for tourists to discover attractions, restaurants, and local experiences.

## 📁 **User App Structure**

```
user-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── auth/           # Authentication components
│   │   ├── common/         # Common UI elements
│   │   ├── home/          # Home screen components
│   │   ├── restaurant/    # Restaurant components
│   │   └── modals/        # Modal components
│   ├── screens/            # Application screens
│   │   ├── auth/          # Login, signup screens
│   │   ├── main/          # Home, search, details
│   │   ├── profile/       # User profile screens
│   │   └── settings/      # Settings screens
│   ├── services/           # Business logic services
│   │   ├── api/           # API services
│   │   ├── auth/          # Authentication services
│   │   ├── data/          # Data management
│   │   ├── location/      # Location services
│   │   └── supabase/      # Supabase integration
│   ├── navigation/         # Navigation configuration
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── styles/            # Styling and themes
│   └── utils/             # Utility functions
├── assets/                # Static assets (images, icons)
├── App.js                 # Main application entry
├── package.json           # Dependencies
└── app.json              # Expo configuration
```

## 🚀 **Features**

### 🔐 **User Authentication**
- Secure user registration and login
- Profile management
- Email verification
- Password recovery

### 🏖️ **Tourism Features**
- Attraction discovery and details
- Restaurant listings and reviews
- Local experiences and activities
- Interactive maps and directions

### 👤 **User Profile**
- Personal information management
- Travel history tracking
- Favorite spots collection
- Review and rating system

### 🔍 **Search & Discovery**
- Advanced search filters
- Category-based browsing
- Location-based recommendations
- Real-time availability

## 🛠️ **Development Setup**

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run web
```

## 📱 **Platform Support**

- ✅ iOS (React Native)
- ✅ Android (React Native)
- ✅ Web (React Native Web)

## 🔗 **Integration**

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **Maps**: Expo Location & Maps
- **Navigation**: React Navigation

## 🎨 **Design System**

- **Colors**: Defined in `src/styles/colors.js`
- **Typography**: Global styles in `src/styles/globalStyles.js`
- **Themes**: Light/dark theme support via `src/contexts/ThemeContext.js`
- **Components**: Reusable UI components with consistent styling

## 🔒 **Security**

- Secure authentication flow
- Input validation and sanitization
- Protected routes and screens
- Secure API communication
- User data privacy compliance

## 📊 **Analytics**

User actions and app usage are tracked for:
- Feature usage analytics
- Performance monitoring
- User behavior insights
- Crash reporting

All analytics respect user privacy and follow data protection guidelines.

## 🌍 **Localization**

Support for multiple languages:
- English (default)
- Spanish
- French
- German
- Additional languages via `src/services/settings/LanguageService.js`

## 🚀 **Deployment**

### **Development Build**
```bash
expo build:android --type apk
expo build:ios --type simulator
```

### **Production Build**
```bash
expo build:android --type app-bundle
expo build:ios --type archive
```

### **Web Deployment**
```bash
expo build:web
# Deploy to hosting service (Netlify, Vercel, etc.)
```

## 📱 **App Store Distribution**

- **Google Play Store**: Android APK/AAB
- **Apple App Store**: iOS IPA
- **Expo Go**: Development testing
- **Web**: Progressive Web App (PWA)

For detailed setup and development instructions, see individual component documentation.

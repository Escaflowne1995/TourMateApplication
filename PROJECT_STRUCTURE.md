# TouristApp Project Structure

📁 **Mobile Tourist Application**

This document outlines the project structure for the Cebu Tourist App.

## 🏗️ **Project Overview**

```
TouristApp/
├── user-app/                     # 📱 User Mobile Application
│   ├── src/                    # User app source code
│   │   ├── components/        # UI components for users
│   │   ├── screens/          # User application screens
│   │   ├── services/         # User business logic
│   │   ├── navigation/       # User app navigation
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   ├── styles/          # User app styling
│   │   └── utils/           # Utility functions
│   ├── assets/              # User app assets
│   ├── App.js              # User app entry point
│   ├── package.json        # User app dependencies
│   └── README.md           # User app documentation
└── PROJECT_STRUCTURE.md         # This file
```

## 📱 **User App Structure**

### **Source Code** (`user-app/src/`)
- **components/**: Reusable UI components for tourists
- **screens/**: Main application screens (auth, home, profile, etc.)
- **services/**: Business logic and API integrations
- **navigation/**: Navigation configuration
- **contexts/**: React Context providers
- **hooks/**: Custom React hooks
- **styles/**: Application styling
- **utils/**: Helper functions and utilities

### **Components** (`user-app/src/components/`)
- **auth/**: Authentication-related components
- **common/**: Shared/reusable components
- **home/**: Home screen specific components
- **layout/**: Layout components
- **modals/**: Modal components
- **restaurant/**: Restaurant-related components

### **Screens** (`user-app/src/screens/`)
- **auth/**: Authentication screens (Login, Signup, Landing)
- **main/**: Main app screens (Home, Search, Attraction Details)
- **profile/**: User profile related screens
- **settings/**: App settings screens

### **Services** (`user-app/src/services/`)
- **api/**: API service integrations
- **auth/**: Authentication services
- **data/**: Data management services
- **firebase/**: Firebase integrations
- **location/**: Location services
- **notifications/**: Push notification services
- **storage/**: Local storage management
- **supabase/**: Supabase database services

## 🎯 **Key Features**

- User authentication and profile management
- Browse Cebu attractions and destinations
- Search and filter functionality
- User reviews and ratings
- Favorite spots management
- Travel history tracking
- Multi-language support
- Offline capabilities

## 🛠️ **Technology Stack**

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Navigation**: React Navigation
- **Forms**: Formik & Yup
- **Styling**: React Native StyleSheet
- **Images**: Expo ImagePicker
- **Gradients**: Expo LinearGradient

## 📝 **Development Notes**

- All components use the theme system from `src/contexts/ThemeContext.js`
- Database services are centralized in `src/services/supabase/`
- Image assets are managed through `src/utils/imageMap.js`
- Global styling constants are available in `src/styles/`
- Service locator pattern is used for dependency injection
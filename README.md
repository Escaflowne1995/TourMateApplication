# Cebu Tourist App

A comprehensive mobile tourism platform for exploring Cebu's attractions, local delicacies, and travel experiences.

## 📁 Project Structure

This project contains a mobile tourist application:

```
TouristApp/
├── user-app/                # 📱 Mobile Tourist Application
│   ├── src/               # React Native source code
│   │   ├── components/    # UI components
│   │   ├── screens/       # App screens
│   │   ├── services/      # Business logic
│   │   ├── navigation/    # Navigation setup
│   │   └── utils/         # Helper functions
│   ├── assets/           # Mobile app assets
│   ├── App.js           # Mobile app entry point
│   └── package.json     # Mobile app dependencies
│
└── PROJECT_STRUCTURE.md    # Detailed structure documentation
```

## 🚀 Getting Started

### For Mobile App Development:
```bash
cd user-app
npm install
npm start
```

### Platform Support:
- **Mobile App**: iOS, Android, Web (React Native/Expo)

## 🏗️ Architecture Benefits

- **Scalability**: Easy to add new features without cluttering
- **Maintainability**: Related files are grouped together
- **Collaboration**: Team members can easily find and work on specific parts
- **Testing**: Clear separation makes testing easier
- **Reusability**: Components and utilities are organized for reuse

## 📱 Features

- User authentication (Login/Signup)
- Browse Cebu attractions and destinations
- Search functionality
- User profiles and reviews
- Travel history
- Favorite spots
- Multi-language support
- Accessibility features

## 🛠️ Tech Stack

- React Native with Expo
- Firebase (Authentication, Firestore, Storage)
- React Navigation
- Formik & Yup (Form handling)
- Expo LinearGradient
- Expo ImagePicker

## 📝 Notes

- Firebase configuration is located in `src/services/firebase/`
- All screen components now import Firebase from the services directory
- Image assets are managed through `src/utils/imageMap.js`
- Global styling constants are available in `src/styles/` 
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LandingScreen from '../screens/auth/LandingScreen';
import Login from '../screens/auth/Login';
import Signup from '../screens/auth/Signup';
import AuthTest from '../components/forms/AuthTest';

const AuthStack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Landing" component={LandingScreen} />
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="Signup" component={Signup} />
      <AuthStack.Screen name="AuthTest" component={AuthTest} />
    </AuthStack.Navigator>
  );
} 
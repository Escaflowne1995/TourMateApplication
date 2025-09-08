import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from '../../services/supabase';
import LoginDebugger from '../debug/LoginDebugger';

const AuthTest = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Test User');

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    const result = await getCurrentUser();
    if (result.success && result.data) {
      setUser(result.data);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await registerUser(name, email, password);
    setLoading(false);
    
    if (result.success) {
      Alert.alert('Success', 'User registered successfully!');
      setUser(result.data.user);
    } else {
      Alert.alert('Registration Failed', result.error);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    const result = await loginUser(email, password);
    setLoading(false);
    
    if (result.success) {
      Alert.alert('Success', 'Logged in successfully!');
      setUser(result.data.user);
    } else {
      Alert.alert('Login Failed', result.error);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    const result = await logoutUser();
    setLoading(false);
    
    if (result.success) {
      setUser(null);
      Alert.alert('Success', 'Logged out successfully!');
    } else {
      Alert.alert('Logout Failed', result.error);
    }
  };

  const goToMainApp = () => {
    // Navigate to main app (you can customize this)
    Alert.alert('Success', 'Ready to navigate to main app!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Supabase Auth Test</Text>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {!user ? (
        <View style={styles.authSection}>
          <Text style={styles.sectionTitle}>Authentication Test</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.registerButton]} 
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.loginButton]} 
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.button, styles.backButton]} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>← Back</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.debugButton]} 
            onPress={() => setShowDebugger(!showDebugger)}
          >
            <Text style={styles.buttonText}>
              {showDebugger ? 'Hide Debugger' : 'Show Login Debugger'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.userSection}>
          <Text style={styles.sectionTitle}>Welcome!</Text>
          <Text style={styles.userInfo}>Email: {user.email}</Text>
          <Text style={styles.userInfo}>ID: {user.id}</Text>
          <Text style={styles.userInfo}>Created: {new Date(user.created_at).toLocaleDateString()}</Text>
          
          <View style={styles.buttonColumn}>
            <TouchableOpacity 
              style={[styles.button, styles.mainAppButton]} 
              onPress={goToMainApp}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Continue to App</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.logoutButton]} 
              onPress={handleLogout}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.backButton]} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>← Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showDebugger && (
        <View style={styles.debuggerSection}>
          <LoginDebugger />
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Test Instructions:</Text>
        <Text style={styles.infoText}>1. Try registering a new user</Text>
        <Text style={styles.infoText}>2. Test login with the same credentials</Text>
        <Text style={styles.infoText}>3. Check logout functionality</Text>
        <Text style={styles.infoText}>4. Verify user persistence after app restart</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 20,
    color: '#333',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  authSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  userInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 15,
  },
  buttonColumn: {
    gap: 10,
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  registerButton: {
    backgroundColor: '#34C759',
  },
  loginButton: {
    backgroundColor: '#007AFF',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
  },
  mainAppButton: {
    backgroundColor: '#30D158',
  },
  backButton: {
    backgroundColor: '#8E8E93',
    flex: 0,
  },
  debugButton: {
    backgroundColor: '#FF9500',
    flex: 0,
    marginTop: 10,
  },
  debuggerSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default AuthTest;

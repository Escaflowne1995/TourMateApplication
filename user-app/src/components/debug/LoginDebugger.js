import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { getCurrentUser, loginUser } from '../../services/supabase';
import SecurityService from '../../services/security/SecurityService';

const LoginDebugger = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [securityService] = useState(new SecurityService(5));

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const result = await getCurrentUser();
      if (result.success && result.data) {
        setCurrentUser(result.data);
        const email = result.data.email || result.data.user?.email || 'Unknown';
        addDebugInfo(`✅ Current user found: ${email}`);
      } else {
        addDebugInfo('❌ No current user found');
      }
    } catch (error) {
      addDebugInfo(`❌ Error checking current user: ${error.message}`);
    }
  };

  const addDebugInfo = (info) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => `${prev}\n[${timestamp}] ${info}`);
  };

  const testSupabaseLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    addDebugInfo(`🔍 Testing Supabase login for: ${email}`);
    
    try {
      const result = await loginUser(email, password);
      
      if (result.success) {
        addDebugInfo('✅ Supabase login successful!');
        
        // Handle different result structures
        const user = result.data?.user || result.data;
        if (user) {
          addDebugInfo(`User ID: ${user.id || user.uid || 'N/A'}`);
          addDebugInfo(`Email: ${user.email || 'N/A'}`);
          addDebugInfo(`Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
          setCurrentUser(user);
        } else {
          addDebugInfo('⚠️ Login successful but user data structure unexpected');
          addDebugInfo(`Full result: ${JSON.stringify(result.data)}`);
        }
      } else {
        addDebugInfo(`❌ Supabase login failed: ${result.error}`);
      }
    } catch (error) {
      addDebugInfo(`❌ Supabase login error: ${error.message}`);
    }
  };

  const checkSecurityStatus = () => {
    const canAttempt = securityService.canAttemptLogin();
    const attempts = securityService.getAttempts();
    const remaining = securityService.getRemainingAttempts();
    
    addDebugInfo(`🔒 Security Status:`);
    addDebugInfo(`   Can attempt login: ${canAttempt ? 'Yes' : 'No'}`);
    addDebugInfo(`   Current attempts: ${attempts}`);
    addDebugInfo(`   Remaining attempts: ${remaining}`);
  };

  const resetSecurity = () => {
    securityService.resetAttempts();
    addDebugInfo('🔄 Security attempts reset');
    checkSecurityStatus();
  };

  const clearDebugInfo = () => {
    setDebugInfo('');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Login Debugger</Text>
      
      {currentUser && (
        <View style={styles.userInfo}>
          <Text style={styles.userTitle}>Current User:</Text>
          <Text style={styles.userText}>Email: {currentUser.email}</Text>
          <Text style={styles.userText}>ID: {currentUser.id}</Text>
        </View>
      )}

      <View style={styles.inputSection}>
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
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.button} onPress={testSupabaseLogin}>
          <Text style={styles.buttonText}>Test Supabase Login</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={checkSecurityStatus}>
          <Text style={styles.buttonText}>Check Security Status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={resetSecurity}>
          <Text style={styles.buttonText}>Reset Security Attempts</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={checkCurrentUser}>
          <Text style={styles.buttonText}>Check Current User</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.clearButton} onPress={clearDebugInfo}>
          <Text style={styles.buttonText}>Clear Debug Info</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.debugSection}>
        <Text style={styles.debugTitle}>Debug Information:</Text>
        <ScrollView style={styles.debugScroll}>
          <Text style={styles.debugText}>{debugInfo || 'No debug information yet...'}</Text>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  userInfo: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  userTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5a2d',
    marginBottom: 5,
  },
  userText: {
    fontSize: 14,
    color: '#2d5a2d',
  },
  inputSection: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  buttonSection: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    maxHeight: 300,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  debugScroll: {
    maxHeight: 250,
  },
  debugText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});

export default LoginDebugger;

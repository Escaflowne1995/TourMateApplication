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
  getUserData,
  addRecord,
  deleteRecord,
} from '../services/supabase';

const SupabaseTestScreen = () => {
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Test User');
  const [recordTitle, setRecordTitle] = useState('');
  const [recordDescription, setRecordDescription] = useState('');

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    const result = await getCurrentUser();
    if (result.success && result.data) {
      setUser(result.data);
      loadRecords();
    }
  };

  const loadRecords = async () => {
    const result = await getUserData();
    if (result.success) {
      setRecords(result.data);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    const result = await registerUser(name, email, password);
    setLoading(false);
    
    if (result.success) {
      Alert.alert('Success', 'User registered successfully!');
      setUser(result.data.user);
      loadRecords();
    } else {
      Alert.alert('Registration Failed', result.error);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    const result = await loginUser(email, password);
    setLoading(false);
    
    if (result.success) {
      Alert.alert('Success', 'Logged in successfully!');
      setUser(result.data.user);
      loadRecords();
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
      setRecords([]);
      Alert.alert('Success', 'Logged out successfully!');
    } else {
      Alert.alert('Logout Failed', result.error);
    }
  };

  const handleAddRecord = async () => {
    if (!recordTitle.trim()) {
      Alert.alert('Error', 'Please enter a record title');
      return;
    }

    setLoading(true);
    const result = await addRecord(user?.id, recordTitle, recordDescription);
    setLoading(false);
    
    if (result.success) {
      Alert.alert('Success', 'Record added successfully!');
      setRecordTitle('');
      setRecordDescription('');
      loadRecords();
    } else {
      Alert.alert('Failed to Add Record', result.error);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteRecord(recordId);
            if (result.success) {
              Alert.alert('Success', 'Record deleted successfully!');
              loadRecords();
            } else {
              Alert.alert('Delete Failed', result.error);
            }
          },
        },
      ]
    );
  };

  const insertSampleRecord = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in first');
      return;
    }

    const result = await addRecord(
      user.id,
      'Sample Tourist Spot',
      'This is a sample record for testing Supabase integration. It represents a beautiful tourist destination in Cebu.'
    );

    if (result.success) {
      Alert.alert('Success', 'Sample record inserted successfully!');
      loadRecords();
    } else {
      Alert.alert('Error', `Failed to insert sample record: ${result.error}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Supabase Integration Test</Text>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {!user ? (
        <View style={styles.authSection}>
          <Text style={styles.sectionTitle}>Authentication</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Name"
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
              style={[styles.button, styles.primaryButton]} 
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.userSection}>
          <Text style={styles.sectionTitle}>Welcome, {user.email}!</Text>
          <Text style={styles.userInfo}>User ID: {user.id}</Text>
          
          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]} 
            onPress={handleLogout}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>

          {/* Records Section */}
          <View style={styles.recordsSection}>
            <Text style={styles.sectionTitle}>Records Management</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Record Title"
              value={recordTitle}
              onChangeText={setRecordTitle}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Record Description (optional)"
              value={recordDescription}
              onChangeText={setRecordDescription}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={handleAddRecord}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Add Record</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.sampleButton]} 
                onPress={insertSampleRecord}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Add Sample</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Records List */}
          <View style={styles.recordsList}>
            <Text style={styles.sectionTitle}>Your Records ({records.length})</Text>
            
            {records.length === 0 ? (
              <Text style={styles.emptyText}>No records found. Add your first record!</Text>
            ) : (
              records.map((record) => (
                <View key={record.id} style={styles.recordItem}>
                  <Text style={styles.recordTitle}>{record.title}</Text>
                  <Text style={styles.recordDescription}>{record.description}</Text>
                  <Text style={styles.recordDate}>
                    Created: {new Date(record.created_at).toLocaleDateString()}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteRecord(record.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>
      )}
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
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  userInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginBottom: 20,
  },
  sampleButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordsSection: {
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
  recordsList: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  recordDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  recordDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    fontStyle: 'italic',
    padding: 20,
  },
});

export default SupabaseTestScreen;

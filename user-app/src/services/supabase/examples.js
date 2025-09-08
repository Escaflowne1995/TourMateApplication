/**
 * Example usage of Supabase functions in your React Native app
 * These examples show how to integrate Supabase authentication and records management
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getUserData,
  addRecord,
  updateRecord,
  deleteRecord,
} from './index';

// Example 1: Authentication Component
export const AuthExample = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

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
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await registerUser(name, email, password);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Account created successfully!');
      setUser(result.data.user);
    } else {
      Alert.alert('Registration Failed', result.error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
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

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome, {user.email}!</Text>
        <TouchableOpacity style={styles.button} onPress={handleLogout} disabled={loading}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Authentication Example</Text>
      
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
      
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

// Example 2: Records Management Component
export const RecordsExample = () => {
  const [records, setRecords] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    initializeComponent();
  }, []);

  const initializeComponent = async () => {
    // Check if user is logged in
    const userResult = await getCurrentUser();
    if (userResult.success && userResult.data) {
      setUser(userResult.data);
      loadRecords();
    } else {
      Alert.alert('Error', 'Please log in first');
    }
  };

  const loadRecords = async () => {
    setLoading(true);
    const result = await getUserData();
    setLoading(false);

    if (result.success) {
      setRecords(result.data);
    } else {
      Alert.alert('Error', `Failed to load records: ${result.error}`);
    }
  };

  const handleAddRecord = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    setLoading(true);
    const result = await addRecord(user.id, title, description);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Record added successfully!');
      setTitle('');
      setDescription('');
      loadRecords(); // Refresh the list
    } else {
      Alert.alert('Error', `Failed to add record: ${result.error}`);
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
              loadRecords(); // Refresh the list
            } else {
              Alert.alert('Error', `Failed to delete record: ${result.error}`);
            }
          },
        },
      ]
    );
  };

  const renderRecord = ({ item }) => (
    <View style={styles.recordItem}>
      <Text style={styles.recordTitle}>{item.title}</Text>
      <Text style={styles.recordDescription}>{item.description}</Text>
      <Text style={styles.recordDate}>
        Created: {new Date(item.created_at).toLocaleDateString()}
      </Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteRecord(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Please log in to view records</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Records</Text>
      
      <View style={styles.addRecordForm}>
        <TextInput
          style={styles.input}
          placeholder="Record Title"
          value={title}
          onChangeText={setTitle}
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleAddRecord} 
          disabled={loading}
        >
          <Text style={styles.buttonText}>Add Record</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={records}
        renderItem={renderRecord}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadRecords}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No records found. Add your first record!</Text>
        }
      />
    </View>
  );
};

// Example 3: Simple function to insert sample data
export const insertSampleRecord = async () => {
  try {
    // Check if user is logged in
    const userResult = await getCurrentUser();
    if (!userResult.success || !userResult.data) {
      Alert.alert('Error', 'Please log in first');
      return;
    }

    const user = userResult.data;
    
    // Insert a sample record
    const result = await addRecord(
      user.id,
      'Sample Tourist Spot',
      'This is a sample record created for testing purposes. It contains information about a beautiful tourist destination.'
    );

    if (result.success) {
      Alert.alert('Success', 'Sample record inserted successfully!', [
        { text: 'OK', onPress: () => console.log('Sample record:', result.data) }
      ]);
      return result.data;
    } else {
      Alert.alert('Error', `Failed to insert sample record: ${result.error}`);
      return null;
    }
  } catch (error) {
    Alert.alert('Error', `Unexpected error: ${error.message}`);
    return null;
  }
};

// Example 4: Function to display all records for logged-in user
export const displayUserRecords = async () => {
  try {
    // Check if user is logged in
    const userResult = await getCurrentUser();
    if (!userResult.success || !userResult.data) {
      Alert.alert('Error', 'Please log in first');
      return [];
    }

    // Fetch user's records
    const result = await getUserData();
    
    if (result.success) {
      console.log('User Records:', result.data);
      
      // Display records in an alert (for testing purposes)
      if (result.data.length > 0) {
        const recordTitles = result.data.map(record => record.title).join('\n');
        Alert.alert(
          'Your Records',
          `You have ${result.data.length} record(s):\n\n${recordTitles}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Info', 'You have no records yet. Add your first record!');
      }
      
      return result.data;
    } else {
      Alert.alert('Error', `Failed to fetch records: ${result.error}`);
      return [];
    }
  } catch (error) {
    Alert.alert('Error', `Unexpected error: ${error.message}`);
    return [];
  }
};

// Styles for the example components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
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
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addRecordForm: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 50,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🚀 Tourist App</Text>
      <Text style={styles.subText}>Mobile app is loading...</Text>
      <Text style={styles.statusText}>✅ Basic bundling works!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
});

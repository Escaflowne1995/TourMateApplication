// SimpleEmailInputWithHistory.js - Simple email input with local storage
import React, { useEffect, useState } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import EmailHistoryService from '../../services/storage/EmailHistoryService';

const SimpleEmailInputWithHistory = ({ value, onChangeText, style, colors, ...props }) => {
  const [emails, setEmails] = useState([]);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const emailHistory = await EmailHistoryService.getEmailHistory();
        const recentEmails = emailHistory.slice(0, 5); // Get 5 most recent
        setEmails(recentEmails);
      } catch (error) {
        console.error('Error fetching emails:', error);
        setEmails([]);
      }
    };

    fetchEmails();
  }, []);

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <TextInput
        {...props}
        style={[styles.input, style]}
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          setShowList(true);
        }}
        onFocus={() => setShowList(true)}
        onBlur={() => setTimeout(() => setShowList(false), 200)}
      />
      {showList && emails.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={emails.filter(e => e.toLowerCase().includes(value?.toLowerCase() || ''))}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.emailItem}
                onPress={() => {
                  onChangeText(item);
                  setShowList(false);
                }}
              >
                <Text style={[styles.emailText, { color: colors?.text || '#000' }]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            style={styles.list}
          />
        </View>
      )}
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  input: {
    borderWidth: 1,
    borderColor: colors?.border || '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: colors?.inputBackground || '#fff',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors?.cardBackground || '#fff',
    borderWidth: 1,
    borderColor: colors?.border || '#ccc',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  list: {
    maxHeight: 200,
  },
  emailItem: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors?.border || '#eee',
  },
  emailText: {
    fontSize: 14,
  },
});

export default SimpleEmailInputWithHistory; 
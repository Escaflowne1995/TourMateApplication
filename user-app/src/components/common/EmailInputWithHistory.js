import React, { useState, useRef, useMemo } from 'react';
import { View, TextInput, StyleSheet, Animated } from 'react-native';
import EmailDropdown from '../email/EmailDropdown';
import EmailSelectionService from '../../services/email/EmailSelectionService';
import useEmailHistory from '../../hooks/useEmailHistory';

const EmailInputWithHistory = ({
  value,
  onChangeText,
  onBlur,
  placeholder = "Enter your email",
  style,
  colors,
  editable = true,
  ...props
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownAnimation = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);
  
  // Dependency Injection - inject dependencies through hooks/services
  const { filteredEmails, removeEmail } = useEmailHistory(value);
  
  // Single Responsibility - dedicated service for email selection
  const emailSelectionService = useMemo(
    () => new EmailSelectionService(
      (email) => {
        onChangeText(email);
        hideDropdown();
      },
      onBlur
    ),
    [onChangeText, onBlur]
  );

  // Open/Closed Principle - easy to extend animation behavior
  const animateDropdown = (show) => {
    Animated.timing(dropdownAnimation, {
      toValue: show ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const showDropdownIfNeeded = () => {
    if (filteredEmails.length > 0) {
      setShowDropdown(true);
      animateDropdown(true);
    }
  };

  const hideDropdown = () => {
    setShowDropdown(false);
    animateDropdown(false);
  };

  // Interface Segregation - clean, focused handlers
  const handleFocus = () => showDropdownIfNeeded();
  const handleBlur = () => emailSelectionService.handleBlur(value);
  const handleEmailSelect = (email) => emailSelectionService.selectEmail(email, inputRef);

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={[styles.input, style]}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={editable}
        {...props}
      />
      
      <EmailDropdown
        emails={filteredEmails}
        colors={colors}
        animation={dropdownAnimation}
        onEmailSelect={handleEmailSelect}
        onEmailRemove={removeEmail}
        visible={showDropdown}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
});

export default EmailInputWithHistory; 
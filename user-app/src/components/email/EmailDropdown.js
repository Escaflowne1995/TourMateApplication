// EmailDropdown.js - Handles dropdown rendering (SRP)
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EmailDropdown = ({ 
  emails, 
  colors, 
  animation, 
  onEmailSelect, 
  onEmailRemove,
  visible 
}) => {
  if (!visible || emails.length === 0) return null;

  return (
    <Animated.View
      style={[
        styles.dropdown,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          opacity: animation,
          transform: [{
            translateY: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [-10, 0],
            }),
          }],
        },
      ]}
    >
      <View style={styles.dropdownList}>
        {emails.slice(0, 5).map((item, index) => (
          <TouchableOpacity 
            key={`${item}_${index}`} 
            style={styles.emailItem}
            onPress={() => onEmailSelect(item)}
            activeOpacity={0.7}
          >
            <View style={styles.emailButton}>
              <Ionicons 
                name="mail-outline" 
                size={16} 
                color={colors.textSecondary} 
                style={styles.emailIcon}
              />
              <Text style={[styles.emailText, { color: colors.text }]} numberOfLines={1}>
                {item}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={(e) => {
                e.stopPropagation();
                onEmailRemove(item);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close-outline" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxHeight: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownList: {
    maxHeight: 200,
  },
  emailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
    minHeight: 44,
  },
  emailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailIcon: {
    marginRight: 12,
  },
  emailText: {
    fontSize: 14,
    flex: 1,
  },
  removeButton: {
    padding: 12,
    marginLeft: 4,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EmailDropdown; 
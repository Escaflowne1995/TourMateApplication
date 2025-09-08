import React from 'react';
import { View } from 'react-native';
import SimpleProfilePicture from '../components/SimpleProfilePicture'; // ← Use this one!

const YourProfileScreen = ({ userId, userAvatar }) => {
  
  const handleAvatarUpdate = (newAvatar) => {
    console.log('Avatar updated successfully!', newAvatar);
    // Update your user state here
  };

  return (
    <View>
      {/* This component works WITHOUT Firebase Storage */}
      <SimpleProfilePicture 
        userId={userId}
        currentAvatar={userAvatar}
        onAvatarUpdate={handleAvatarUpdate}
      />
    </View>
  );
};

export default YourProfileScreen;

// ✅ What this does:
// - Uses base64 storage (FREE!)
// - No Firebase Storage dependencies
// - Works immediately
// - Saves to Firestore user document 
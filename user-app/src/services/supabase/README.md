# Supabase Integration Guide

This guide explains how to set up and use Supabase in your React Native Tourist App.

## Setup Steps

### 1. Install Dependencies
```bash
npm install @supabase/supabase-js
npm install react-native-bcrypt  # For password hashing
```

### 2. Configure Supabase Client
1. Go to your Supabase Dashboard → Settings → API
2. Copy your `Project URL` and `anon/public key`
3. Update `src/services/supabase/supabaseClient.js` with your credentials:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 3. Set Up Database
1. Go to Supabase Dashboard → SQL Editor
2. Copy and run the SQL from `src/services/supabase/migrations.sql`
3. This will create the `users` and `records` tables with proper RLS policies

### 4. Enable Authentication (Optional)
If you want to use Supabase Auth instead of custom auth:
1. Go to Authentication → Settings in Supabase Dashboard
2. Configure your authentication providers
3. Update the auth functions to use Supabase Auth fully

## Usage Examples

### Import Services
```javascript
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserData,
  addRecord,
  updateRecord,
  deleteRecord,
} from '../services/supabase';
```

### Authentication
```javascript
// Register new user
const result = await registerUser('John Doe', 'john@example.com', 'password123');

// Login user
const loginResult = await loginUser('john@example.com', 'password123');

// Logout
const logoutResult = await logoutUser();
```

### Records Management
```javascript
// Add a record
const record = await addRecord(userId, 'Cebu Temple of Leah', 'Beautiful temple with great views');

// Get user's records
const userRecords = await getUserData();

// Update a record
const updated = await updateRecord(recordId, 'Updated Title', 'Updated description');

// Delete a record
const deleted = await deleteRecord(recordId);
```

## Security Features

### Row Level Security (RLS)
- Users can only access their own records
- Automatic user_id assignment via database triggers
- Secure authentication with Supabase Auth

### Password Security
- Passwords are hashed using bcrypt
- Secure session management
- Automatic token refresh

## Testing

### Quick Test Functions
Use these functions to test your integration:

```javascript
import { insertSampleRecord, displayUserRecords } from '../services/supabase/examples';

// Insert a sample record
await insertSampleRecord();

// Display all user records
await displayUserRecords();
```

### Example Components
Check `src/services/supabase/examples.js` for complete React Native components that demonstrate:
- User authentication (register/login/logout)
- Records management (create/read/update/delete)
- Error handling
- Loading states

## Integration with Existing App

### 1. Replace Existing Auth
You can replace your existing authentication system with Supabase:

```javascript
// In your login screen
import { loginUser } from '../services/supabase';

const handleLogin = async (email, password) => {
  const result = await loginUser(email, password);
  if (result.success) {
    // Navigate to main app
    navigation.navigate('Home');
  } else {
    // Show error
    Alert.alert('Login Failed', result.error);
  }
};
```

### 2. Add Records to Tourist Spots
You can use the records system for user-generated content:

```javascript
// When user saves a favorite spot
const saveFavoriteSpot = async (spotName, description) => {
  const result = await addRecord(currentUser.id, spotName, description);
  if (result.success) {
    Alert.alert('Success', 'Spot saved to favorites!');
  }
};
```

### 3. User Reviews and Ratings
Extend the records table to include ratings:

```sql
ALTER TABLE records ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE records ADD COLUMN spot_type TEXT;
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check your Supabase URL and API key
   - Ensure RLS policies are set up correctly
   - Verify user is logged in before making requests

2. **Database Errors**
   - Check if tables exist and have proper structure
   - Verify RLS policies allow the operation
   - Check network connectivity

3. **React Native Specific**
   - Ensure all required packages are installed
   - Check if bcrypt works on your target platforms
   - Test on both iOS and Android

### Debug Mode
Enable debug logging:

```javascript
// In supabaseClient.js
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    debug: true, // Enable auth debugging
  },
});
```

## Next Steps

1. **Extend Database Schema**: Add more tables for reviews, favorites, etc.
2. **Real-time Updates**: Use Supabase real-time subscriptions
3. **File Storage**: Use Supabase Storage for user photos
4. **Advanced Auth**: Add social login providers
5. **Offline Support**: Implement local caching with sync

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-react-native)
- [Supabase Community](https://github.com/supabase/supabase/discussions)

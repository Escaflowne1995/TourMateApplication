# 📱 Mobile App Real-time Sync Setup

## 🎯 Overview
This guide enables real-time synchronization between your admin panel and mobile app. When destinations are added/updated/deleted in the admin panel, they will immediately appear/update/disappear in the mobile app.

## 🔧 Setup Steps

### Step 1: Enable Supabase Real-time
Run this in your **Supabase SQL Editor**:
```sql
-- Copy contents from: admin/enable-realtime-subscriptions.sql
ALTER PUBLICATION supabase_realtime ADD TABLE destinations;
GRANT SELECT ON destinations TO anon;
GRANT SELECT ON destinations TO authenticated;
ALTER TABLE destinations DISABLE ROW LEVEL SECURITY;
```

### Step 2: Update Mobile App Code

#### Option A: Update Existing Files (Recommended)
Update your existing `useHomeData.js` to use the new Supabase service:

1. **Replace import** in `user-app/src/hooks/useHomeData.js`:
   ```javascript
   // Change this:
   import AttractionsDataService from '../services/data/AttractionsDataService';
   
   // To this:
   import AttractionsDataServiceSupabase from '../services/data/AttractionsDataServiceSupabase';
   ```

2. **Update function calls** to be async:
   ```javascript
   // Change this:
   const featured = AttractionsDataService.getFeaturedAttractions();
   
   // To this:
   const featured = await AttractionsDataServiceSupabase.getFeaturedAttractions(5);
   ```

#### Option B: Use New Files (Already Created)
The following files have been created with real-time functionality:
- `user-app/src/services/supabase/destinationsService.js`
- `user-app/src/services/data/AttractionsDataServiceSupabase.js`
- `user-app/src/hooks/useHomeData.js` (updated)
- `user-app/src/screens/debug/RealtimeSyncTest.js` (test screen)

### Step 3: Add Test Screen (Optional)
Add the real-time sync test screen to your navigation to verify everything works:

1. **Import the test screen** in your navigator:
   ```javascript
   import RealtimeSyncTest from '../screens/debug/RealtimeSyncTest';
   ```

2. **Add as a screen** (temporary for testing):
   ```javascript
   <Stack.Screen name="RealtimeSyncTest" component={RealtimeSyncTest} />
   ```

## 🧪 Testing Real-time Sync

### Manual Testing
1. **Open mobile app** on home screen
2. **Open admin panel** in browser
3. **Add a new destination** in admin panel
4. **Check mobile app** - new destination should appear immediately
5. **Delete a destination** in admin panel
6. **Check mobile app** - destination should disappear immediately

### Using Test Screen
1. **Navigate to RealtimeSyncTest screen** in mobile app
2. **Keep screen open** and follow on-screen instructions
3. **Add/delete destinations** in admin panel
4. **Watch for real-time notifications** in mobile app

## 🔍 Troubleshooting

### Real-time Not Working?

#### Check Supabase Setup
```sql
-- Verify real-time is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- Should show: public | destinations
```

#### Check Console Logs
Look for these logs in mobile app:
- `✅ Loaded X destinations from Supabase`
- `📡 Real-time subscription status: SUBSCRIBED`
- `📡 Real-time destination change detected`

#### Common Issues
1. **No real-time updates**: Run the Supabase setup SQL script
2. **Permission errors**: Ensure RLS is disabled on destinations table
3. **Cache issues**: Use force refresh or invalidate cache
4. **Connection issues**: Check Supabase credentials in mobile app

### Debug Information
```javascript
// Check connection status
console.log('Supabase URL:', supabase.supabaseUrl);
console.log('Real-time status:', subscription.state);

// Check cache status
console.log('Cache status:', destinationsService.getCacheStatus());
```

## 📊 Real-time Events

### Supported Events
- **INSERT**: New destination added in admin → Appears in mobile
- **UPDATE**: Destination modified in admin → Updates in mobile  
- **DELETE**: Destination deleted in admin → Disappears from mobile

### Event Flow
```
Admin Panel Action → Supabase Database → Real-time Channel → Mobile App Update
```

## 🔒 Security Notes

### Permissions
- **Mobile app**: Read-only access to destinations
- **Admin panel**: Full CRUD access to destinations
- **Real-time**: Only sends public data (no sensitive info)

### RLS (Row Level Security)
- **Disabled for development** - all destinations visible
- **Production**: Enable RLS with proper policies for multi-tenancy

## 🚀 Production Considerations

### Performance
- **Caching**: 5-minute cache timeout for better performance
- **Batching**: Real-time updates trigger cache invalidation
- **Limits**: Consider pagination for large datasets

### Monitoring
- **Real-time connection status**: Monitor subscription health
- **Error handling**: Graceful degradation if real-time fails
- **Fallback**: Manual refresh always available

### Scaling
- **Connection limits**: Supabase has real-time connection limits
- **Regional deployment**: Consider CDN for global users
- **Database optimization**: Index frequently queried columns

## ✅ Success Criteria

After setup, you should see:
- ✅ **Immediate updates**: Destinations appear/disappear instantly
- ✅ **No manual refresh needed**: Real-time sync handles updates
- ✅ **Console logs**: Proper logging of real-time events
- ✅ **Error handling**: Graceful fallback if real-time fails
- ✅ **Cache management**: Smart caching with auto-invalidation

## 🆘 Support

If you encounter issues:
1. **Check console logs** for error messages
2. **Verify Supabase setup** with the SQL queries above
3. **Test with RealtimeSyncTest screen** for detailed debugging
4. **Check network connectivity** between app and Supabase
5. **Verify Supabase credentials** are correctly configured

---

**🎉 Once setup is complete, your mobile app will receive real-time updates from the admin panel automatically!**

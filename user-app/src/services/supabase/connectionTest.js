import { supabase } from './supabaseClient';

/**
 * Test Supabase connection
 * This function tests if your Supabase configuration is working correctly
 */
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test 1: Check if client is initialized
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase client not initialized'
      };
    }
    
    // Test 2: Try to fetch from a system table (this should work even without custom tables)
    const { data, error } = await supabase
      .from('users') // This will fail if table doesn't exist, which is expected initially
      .select('count')
      .limit(1);
    
    if (error) {
      // If it's a "relation does not exist" error, it means connection works but tables aren't created
      if (error.message.includes('relation "users" does not exist')) {
        return {
          success: true,
          message: 'Connection successful! But you need to run the database migrations.',
          needsMigrations: true
        };
      }
      
      // Other errors might indicate connection issues
      return {
        success: false,
        error: `Database error: ${error.message}`,
        details: error
      };
    }
    
    // Test 3: If we get here, everything is working
    return {
      success: true,
      message: 'Supabase connection and database tables are working correctly!',
      needsMigrations: false
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Connection failed: ${error.message}`,
      details: error
    };
  }
};

/**
 * Quick test function that you can call from anywhere
 * Usage: import { quickTest } from './src/services/supabase/connectionTest';
 */
export const quickTest = async () => {
  const result = await testSupabaseConnection();
  
  if (result.success) {
    console.log('✅ Success:', result.message);
    if (result.needsMigrations) {
      console.log('📝 Next step: Run the SQL migrations in your Supabase dashboard');
    }
  } else {
    console.error('❌ Error:', result.error);
    console.log('🔧 Check your SUPABASE_URL and SUPABASE_ANON_KEY in supabaseClient.js');
  }
  
  return result;
};

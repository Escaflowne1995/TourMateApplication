/**
 * Supabase Client Configuration for Admin Panel
 * This connects the admin panel to the same Supabase instance as the user app
 */

// Use the same Supabase configuration as the user app
const SUPABASE_URL = 'https://huzmuglxzkaztzxjerym.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1em11Z2x4emthenR6eGplcnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTAwOTUsImV4cCI6MjA3MjYyNjA5NX0.Z4kYsI4OIOvMo1o8uKg6ckBpu2LDAA7q6iKReJUftHw';

// Import Supabase from CDN (for web environment)
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
});

// Helper functions for admin operations
window.SupabaseHelper = {
  // Generic query function with error handling
  async query(tableName, options = {}) {
    try {
      let query = window.supabase.from(tableName);
      
      if (options.select) query = query.select(options.select);
      if (options.eq) query = query.eq(options.eq.column, options.eq.value);
      if (options.order) query = query.order(options.order.column, { ascending: options.order.ascending !== false });
      if (options.limit) query = query.limit(options.limit);
      if (options.range) query = query.range(options.range.from, options.range.to);
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error(`Supabase query error for ${tableName}:`, error);
        return { success: false, error: error.message, data: null };
      }
      
      return { success: true, data, count, error: null };
    } catch (error) {
      console.error(`Unexpected error querying ${tableName}:`, error);
      return { success: false, error: error.message, data: null };
    }
  },

  // Insert data
  async insert(tableName, data) {
    try {
      const { data: result, error } = await window.supabase
        .from(tableName)
        .insert(data)
        .select();
      
      if (error) {
        console.error(`Insert error for ${tableName}:`, error);
        return { success: false, error: error.message, data: null };
      }
      
      return { success: true, data: result, error: null };
    } catch (error) {
      console.error(`Unexpected insert error for ${tableName}:`, error);
      return { success: false, error: error.message, data: null };
    }
  },

  // Update data
  async update(tableName, updates, conditions) {
    try {
      let query = window.supabase.from(tableName).update(updates);
      
      Object.keys(conditions).forEach(key => {
        query = query.eq(key, conditions[key]);
      });
      
      const { data, error } = await query.select();
      
      if (error) {
        console.error(`Update error for ${tableName}:`, error);
        return { success: false, error: error.message, data: null };
      }
      
      return { success: true, data, error: null };
    } catch (error) {
      console.error(`Unexpected update error for ${tableName}:`, error);
      return { success: false, error: error.message, data: null };
    }
  },

  // Delete data
  async delete(tableName, conditions) {
    try {
      let query = window.supabase.from(tableName).delete();
      
      Object.keys(conditions).forEach(key => {
        query = query.eq(key, conditions[key]);
      });
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Delete error for ${tableName}:`, error);
        return { success: false, error: error.message, data: null };
      }
      
      return { success: true, data, error: null };
    } catch (error) {
      console.error(`Unexpected delete error for ${tableName}:`, error);
      return { success: false, error: error.message, data: null };
    }
  },

  // Test connection
  async testConnection() {
    try {
      const { data, error } = await window.supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        if (error.message.includes('relation "users" does not exist')) {
          return {
            success: true,
            message: 'Connection successful! Database tables are accessible.',
            needsSetup: true
          };
        }
        return { success: false, error: error.message };
      }
      
      return {
        success: true,
        message: 'Supabase connection working perfectly!',
        needsSetup: false
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

console.log('✅ Supabase Admin Client Loaded');

import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project credentials
// You can find these in your Supabase Dashboard > Settings > API
const SUPABASE_URL = 'https://huzmuglxzkaztzxjerym.supabase.co'; // Replace with your Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1em11Z2x4emthenR6eGplcnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTAwOTUsImV4cCI6MjA3MjYyNjA5NX0.Z4kYsI4OIOvMo1o8uKg6ckBpu2LDAA7q6iKReJUftHw'; // Replace with your anon/public key

// Create and export the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Enable automatic token refresh
    autoRefreshToken: true,
    // Persist session in local storage
    persistSession: true,
    // Detect session from URL (useful for web, but won't hurt mobile)
    detectSessionInUrl: false,
    // Mobile-friendly configuration
    flowType: 'pkce',
    // Set a custom redirect URL for mobile
    redirectTo: undefined, // Let Supabase handle mobile redirects
  },
});

// Export default for convenience
export default supabase;

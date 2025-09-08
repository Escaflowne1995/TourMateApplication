// Export Supabase client
export { supabase, default as supabaseClient } from './supabaseClient';

// Export authentication functions
export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentSession,
  getCurrentUser,
} from './authService';

// Export records functions
export {
  getUserData,
  addRecord,
  updateRecord,
  deleteRecord,
  getRecord,
  searchRecords,
} from './recordsService';

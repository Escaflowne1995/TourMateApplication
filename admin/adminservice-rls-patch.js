/**
 * AdminService RLS Error Patch
 * This patch modifies the logActivity function to handle RLS errors gracefully
 * Copy and paste this code into your browser console, or add it to your admin service
 */

// Patch the existing AdminService logActivity function
if (window.AdminService && typeof window.AdminService.logActivity === 'function') {
  // Store the original function
  const originalLogActivity = window.AdminService.logActivity;
  
  // Replace with a patched version
  window.AdminService.logActivity = async function(action, details = {}) {
    try {
      if (!window.supabase || !this.getCurrentAdmin()) {
        console.log('📝 Activity logged locally (no database):', action, details);
        return;
      }

      const currentAdmin = this.getCurrentAdmin();
      const logEntry = {
        admin_id: currentAdmin.id,
        admin_email: currentAdmin.email,
        action,
        table_name: details.table_name || null,
        record_id: details.record_id || null,
        old_data: details.old_data || null,
        new_data: details.new_data || null,
        ip_address: null,
        user_agent: navigator.userAgent
      };

      // Try multiple audit table names in case of confusion
      const auditTables = ['admin_audit_log', 'destination_audit', 'audit_log'];
      
      for (const tableName of auditTables) {
        try {
          await window.supabase
            .from(tableName)
            .insert(logEntry);
          
          console.log(`📝 Admin Activity Logged to ${tableName}:`, logEntry);
          return; // Success, exit function
          
        } catch (tableError) {
          console.warn(`Failed to log to ${tableName}:`, tableError.message);
          continue; // Try next table
        }
      }
      
      // If all tables failed, just log locally
      console.log('📝 Activity logged locally (database failed):', logEntry);
      
    } catch (error) {
      // Graceful error handling - don't break the main operation
      console.warn('Failed to log activity (continuing operation):', error.message);
      console.log('📝 Activity logged locally only:', action, details);
    }
  };
  
  console.log('✅ AdminService RLS patch applied successfully');
  console.log('📝 Activity logging will now handle RLS errors gracefully');
} else {
  console.error('❌ AdminService not found or logActivity function missing');
}

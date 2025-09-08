/**
 * Core Admin Service
 * Handles authentication, session management, and admin operations
 */

window.AdminService = (function() {
  'use strict';

  let currentAdmin = null;
  let sessionTimeout = null;

  // Password hashing utilities (simple bcrypt-like for demo)
  const hashPassword = async (password) => {
    // In production, use proper bcrypt hashing
    // For demo, we'll use a simple hash
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'cebu_tourist_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const verifyPassword = async (password, hash) => {
    const inputHash = await hashPassword(password);
    return inputHash === hash;
  };

  // Session management
  const startSession = (admin) => {
    currentAdmin = { ...admin };
    delete currentAdmin.password; // Never store password in session
    
    localStorage.setItem('admin_session', JSON.stringify({
      admin: currentAdmin,
      timestamp: Date.now()
    }));

    // Set session timeout
    const timeoutDuration = window.AdminConfig.auth.sessionTimeout;
    sessionTimeout = setTimeout(() => {
      logout();
      showToast('Session expired. Please login again.', 'warning');
    }, timeoutDuration);
  };

  const clearSession = () => {
    currentAdmin = null;
    localStorage.removeItem('admin_session');
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      sessionTimeout = null;
    }
  };

  const restoreSession = () => {
    try {
      const stored = localStorage.getItem('admin_session');
      if (!stored) return false;

      const session = JSON.parse(stored);
      const age = Date.now() - session.timestamp;
      
      if (age > window.AdminConfig.auth.sessionTimeout) {
        clearSession();
        return false;
      }

      currentAdmin = session.admin;
      
      // Restart session timeout
      const remaining = window.AdminConfig.auth.sessionTimeout - age;
      sessionTimeout = setTimeout(() => {
        logout();
        showToast('Session expired. Please login again.', 'warning');
      }, remaining);

      return true;
    } catch (error) {
      console.error('Error restoring session:', error);
      clearSession();
      return false;
    }
  };

  // Toast notification helper
  const showToast = (message, type = 'info') => {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas ${getToastIcon(type)}"></i>
        <span>${message}</span>
      </div>
    `;

    // Add to document
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove toast
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, window.AdminConfig.ui.toastDuration);
  };

  const getToastIcon = (type) => {
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
  };

  // Public API
  return {
    // Authentication
    async login(email, password) {
      try {
        if (!window.supabase) {
          throw new Error('Supabase not initialized');
        }

        // Query admin user from Supabase
        const { data: adminUsers, error } = await window.supabase
          .from('admin_users')
          .select('*')
          .eq('email', email)
          .eq('is_active', true)
          .single();

        if (error || !adminUsers) {
          throw new Error('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, adminUsers.password_hash);
        if (!isValidPassword) {
          throw new Error('Invalid credentials');
        }

        // Update last login
        await window.supabase
          .from('admin_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', adminUsers.id);

        // Remove sensitive data
        delete adminUsers.password_hash;

        startSession(adminUsers);
        
        // Log the login activity
        this.logActivity('admin_login', { admin_id: adminUsers.id });
        
        showToast('Login successful!', 'success');
        return { success: true, admin: currentAdmin };
      } catch (error) {
        showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    logout() {
      clearSession();
      showToast('Logged out successfully', 'info');
      
      // Trigger app re-render
      if (window.location.reload) {
        window.location.reload();
      }
    },

    // Session management
    getCurrentAdmin() {
      return currentAdmin;
    },

    isLoggedIn() {
      return currentAdmin !== null;
    },

    hasRole(role) {
      if (!currentAdmin) return false;
      if (role === 'admin') return ['admin', 'super_admin'].includes(currentAdmin.role);
      return currentAdmin.role === role;
    },

    restoreSession,

    // Admin user management
    async createAdmin(adminData) {
      try {
        if (!this.hasRole('super_admin')) {
          throw new Error('Unauthorized: Super admin access required');
        }

        // Validate required fields
        if (!adminData.email || !adminData.password || !adminData.name) {
          throw new Error('Email, password, and name are required');
        }

        // Check if admin already exists
        if (adminUsers.find(admin => admin.email === adminData.email)) {
          throw new Error('Admin with this email already exists');
        }

        const newAdmin = {
          id: window.AdminConfig.utils.generateId(),
          email: adminData.email,
          password: adminData.password, // In production, hash this
          role: adminData.role || 'admin',
          name: adminData.name,
          created_at: new Date(),
          last_login: null,
          is_active: true
        };

        adminUsers.push(newAdmin);
        showToast('Admin user created successfully', 'success');
        
        return { success: true, admin: { ...newAdmin, password: undefined } };
      } catch (error) {
        showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    async updateAdmin(adminId, updates) {
      try {
        if (!this.hasRole('super_admin')) {
          throw new Error('Unauthorized: Super admin access required');
        }

        const adminIndex = adminUsers.findIndex(admin => admin.id === adminId);
        if (adminIndex === -1) {
          throw new Error('Admin not found');
        }

        // Don't allow updating password through this method
        delete updates.password;
        delete updates.id;

        adminUsers[adminIndex] = { ...adminUsers[adminIndex], ...updates };
        showToast('Admin updated successfully', 'success');
        
        return { success: true, admin: { ...adminUsers[adminIndex], password: undefined } };
      } catch (error) {
        showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    async getAllAdmins() {
      try {
        if (!this.hasRole('super_admin')) {
          throw new Error('Unauthorized: Super admin access required');
        }

        const admins = adminUsers.map(admin => ({ ...admin, password: undefined }));
        return { success: true, data: admins };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Utility methods
    showToast,

    // Activity logging (robust version that handles foreign key constraints)
    async logActivity(action, details = {}) {
      try {
        if (!window.supabase || !currentAdmin) {
          console.log('📝 Activity logged locally (no database):', action, details);
          return;
        }

        const logEntry = {
          admin_id: currentAdmin.id,
          admin_email: currentAdmin.email,
          action,
          table_name: details.table_name || null,
          record_id: details.record_id ? details.record_id.toString() : null, // Convert to string to avoid FK issues
          old_data: details.old_data || null,
          new_data: details.new_data || null,
          ip_address: null, // Would get real IP in production
          user_agent: navigator.userAgent
        };

        // Try multiple audit tables in order of preference
        const auditAttempts = [
          { table: 'admin_audit_log', entry: logEntry },
          { 
            table: 'destination_audit', 
            entry: {
              destination_id: logEntry.record_id,
              action: logEntry.action,
              admin_id: logEntry.admin_id,
              admin_email: logEntry.admin_email,
              old_data: logEntry.old_data,
              new_data: logEntry.new_data
            }
          }
        ];

        let logged = false;
        for (const attempt of auditAttempts) {
          try {
            await window.supabase
              .from(attempt.table)
              .insert(attempt.entry);
            
            console.log(`📝 Admin Activity Logged to ${attempt.table}:`, logEntry);
            logged = true;
            break;
          } catch (tableError) {
            console.warn(`Failed to log to ${attempt.table}:`, tableError.message);
            continue;
          }
        }

        if (!logged) {
          console.log('📝 Activity logged locally only (all database attempts failed):', logEntry);
        }

      } catch (error) {
        // Never let audit logging break the main operation
        console.warn('Activity logging failed (operation continues):', error.message);
        console.log('📝 Activity logged locally only:', action, details);
      }
    }
  };
})();

// Initialize session restoration on load
document.addEventListener('DOMContentLoaded', () => {
  window.AdminService.restoreSession();
});

console.log('✅ Admin Service Loaded');

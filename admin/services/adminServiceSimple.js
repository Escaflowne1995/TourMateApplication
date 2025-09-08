/**
 * Simplified Admin Service for Testing
 * Uses plain text passwords temporarily to debug login issues
 */

window.AdminService = (function() {
  'use strict';

  let currentAdmin = null;
  let sessionTimeout = null;

  // Session management
  const startSession = (admin) => {
    currentAdmin = { ...admin };
    delete currentAdmin.password_hash; // Never store password in session
    
    localStorage.setItem('admin_session', JSON.stringify({
      admin: currentAdmin,
      timestamp: Date.now()
    }));

    // Set session timeout
    const timeoutDuration = 3600000; // 1 hour
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
      
      if (age > 3600000) { // 1 hour
        clearSession();
        return false;
      }

      currentAdmin = session.admin;
      
      // Restart session timeout
      const remaining = 3600000 - age;
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
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 4000);
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
        console.log('Attempting login:', email);
        
        if (!window.supabase) {
          throw new Error('Supabase not initialized');
        }

        // Query admin user from Supabase - using simple password comparison
        const { data: adminUsers, error } = await window.supabase
          .from('admin_users')
          .select('*')
          .eq('email', email)
          .eq('is_active', true);

        console.log('Query result:', { adminUsers, error });

        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Database error: ${error.message}`);
        }

        if (!adminUsers || adminUsers.length === 0) {
          throw new Error('No admin user found with this email');
        }

        const admin = adminUsers[0];
        console.log('Found admin:', admin);

        // Simple password comparison for testing
        if (admin.password_hash !== password) {
          throw new Error('Incorrect password');
        }

        // Update last login
        await window.supabase
          .from('admin_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', admin.id);

        // Remove sensitive data
        delete admin.password_hash;

        startSession(admin);
        
        showToast('Login successful!', 'success');
        return { success: true, admin: currentAdmin };
      } catch (error) {
        console.error('Login error:', error);
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

    // Utility methods
    showToast,

    // Activity logging
    async logActivity(action, details = {}) {
      try {
        if (!window.supabase || !currentAdmin) return;

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

        await window.supabase
          .from('admin_audit_log')
          .insert(logEntry);

        console.log('Admin Activity Logged:', logEntry);
      } catch (error) {
        console.error('Failed to log activity:', error);
      }
    }
  };
})();

// Initialize session restoration on load
document.addEventListener('DOMContentLoaded', () => {
  window.AdminService.restoreSession();
});

console.log('✅ Simplified Admin Service Loaded');

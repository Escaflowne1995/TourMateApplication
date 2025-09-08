/**
 * User Management Service with Supabase Integration
 * Handles CRUD operations for regular app users using Supabase
 */

window.UserManagementService = (function() {
  'use strict';

  // Helper function to check admin access
  const requireAdminAccess = () => {
    if (!window.AdminService.isLoggedIn()) {
      throw new Error('Admin access required');
    }
  };

  // Helper function to format user data
  const formatUserData = (user) => ({
    ...user,
    registration_date: new Date(user.created_at || user.registration_date),
    last_login: user.last_login ? new Date(user.last_login) : null,
    favorite_spots: user.favorite_spots || [],
    total_reviews: user.total_reviews || 0
  });

  // Public API
  return {
    // Get all users with filtering and pagination
    async getAllUsers(filters = {}, pagination = { page: 1, limit: 20 }) {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        console.log('🔍 Fetching users from profiles table with filters:', filters);
        
        // First, try to determine which table to use
        let tableName = 'profiles';
        
        // Check if admin_managed_profiles exists and has data
        try {
          const { data: adminProfiles, error: adminError } = await window.supabase
            .from('admin_managed_profiles')
            .select('id')
            .limit(1);
          
          if (!adminError && adminProfiles && adminProfiles.length > 0) {
            tableName = 'admin_managed_profiles';
            console.log('✅ Using admin_managed_profiles table');
          } else {
            console.log('✅ Using profiles table');
          }
        } catch (e) {
          console.log('✅ Using profiles table (admin_managed_profiles not available)');
        }
        
        let query = window.supabase.from(tableName).select('*', { count: 'exact' });

        // Apply filters
        if (filters.searchTerm) {
          const searchTerm = `%${filters.searchTerm}%`;
          query = query.or(`name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm},address.ilike.${searchTerm}`);
        }

        if (filters.gender && filters.gender !== 'all') {
          query = query.eq('gender', filters.gender);
        }

        if (filters.isActive !== undefined && filters.isActive !== null) {
          query = query.eq('is_active', filters.isActive);
        }

        if (filters.dateFrom) {
          query = query.gte('created_at', filters.dateFrom);
        }

        if (filters.dateTo) {
          query = query.lte('created_at', filters.dateTo);
        }

        // Apply sorting
        query = query.order('created_at', { ascending: false });

        // Apply pagination
        const from = (pagination.page - 1) * pagination.limit;
        const to = from + pagination.limit - 1;
        query = query.range(from, to);

        const { data: users, error, count } = await query;

        if (error) {
          console.error('Error fetching users:', error);
          throw new Error(error.message);
        }

        const formattedUsers = users.map(formatUserData);

        const result = {
          data: formattedUsers,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / pagination.limit)
          }
        };

        await window.AdminService.logActivity('view_users', { 
          table_name: 'profiles',
          filters, 
          pagination, 
          result_count: result.data.length 
        });

        return { success: true, ...result };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Get user by ID
    async getUserById(userId) {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        const { data: user, error } = await window.supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error || !user) {
          throw new Error('User not found');
        }

        const formattedUser = formatUserData(user);

        await window.AdminService.logActivity('view_user', { 
          table_name: 'profiles',
          record_id: userId 
        });

        return { success: true, data: formattedUser };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Create new user
    async createUser(userData) {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        // Validate required fields
        if (!userData.name || !userData.email) {
          throw new Error('Name and email are required');
        }

        // Check if user already exists
        const { data: existingUser } = await window.supabase
          .from('profiles')
          .select('id')
          .eq('email', userData.email)
          .single();

        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        // Prepare user data
        const newUser = {
          name: userData.name,
          email: userData.email,
          full_name: userData.full_name || userData.name,
          phone: userData.phone || null,
          address: userData.address || null,
          gender: userData.gender || null,
          location: userData.location || null,
          country: userData.country || 'Philippines',
          zip_code: userData.zip_code || null,
          birth_date: userData.birth_date || null,
          avatar_url: userData.avatar_url || null,
          is_active: userData.is_active !== undefined ? userData.is_active : true,
          favorite_spots: userData.favorite_spots || [],
          total_reviews: 0,
          registration_date: new Date().toISOString()
        };

        const { data: createdUser, error } = await window.supabase
          .from('profiles')
          .insert(newUser)
          .select()
          .single();

        if (error) {
          console.error('Error creating user:', error);
          throw new Error(error.message);
        }

        const formattedUser = formatUserData(createdUser);

        await window.AdminService.logActivity('create_user', {
          table_name: 'profiles',
          record_id: createdUser.id,
          new_data: formattedUser
        });

        window.AdminService.showToast('User created successfully', 'success');
        return { success: true, data: formattedUser };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Update user
    async updateUser(userId, updates) {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        // Get current user data for logging
        const { data: oldUser, error: fetchError } = await window.supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (fetchError || !oldUser) {
          throw new Error('User not found');
        }

        // Prepare update data
        const updateData = {
          ...updates,
          updated_at: new Date().toISOString()
        };

        // Remove read-only fields
        delete updateData.id;
        delete updateData.created_at;

        const { data: updatedUser, error } = await window.supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId)
          .select()
          .single();

        if (error) {
          console.error('Error updating user:', error);
          throw new Error(error.message);
        }

        const formattedUser = formatUserData(updatedUser);

        await window.AdminService.logActivity('update_user', {
          table_name: 'profiles',
          record_id: userId,
          old_data: formatUserData(oldUser),
          new_data: formattedUser
        });

        window.AdminService.showToast('User updated successfully', 'success');
        return { success: true, data: formattedUser };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Delete user (soft delete - deactivate)
    async deleteUser(userId) {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        // Get current user data for logging
        const { data: user, error: fetchError } = await window.supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (fetchError || !user) {
          throw new Error('User not found');
        }

        // Soft delete by setting is_active to false
        const { data: updatedUser, error } = await window.supabase
          .from('profiles')
          .update({ 
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single();

        if (error) {
          console.error('Error deleting user:', error);
          throw new Error(error.message);
        }

        await window.AdminService.logActivity('delete_user', {
          table_name: 'profiles',
          record_id: userId,
          old_data: formatUserData(user)
        });

        window.AdminService.showToast('User deactivated successfully', 'success');
        return { success: true, data: formatUserData(updatedUser) };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Activate user
    async activateUser(userId) {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        const { data: updatedUser, error } = await window.supabase
          .from('profiles')
          .update({ 
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single();

        if (error) {
          console.error('Error activating user:', error);
          throw new Error(error.message);
        }

        await window.AdminService.logActivity('activate_user', {
          table_name: 'profiles',
          record_id: userId
        });

        window.AdminService.showToast('User activated successfully', 'success');
        return { success: true, data: formatUserData(updatedUser) };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Get user statistics
    async getUserStats() {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        // Get total users
        const { count: totalUsers, error: totalError } = await window.supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (totalError) {
          throw new Error(totalError.message);
        }

        // Get active users
        const { count: activeUsers, error: activeError } = await window.supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        if (activeError) {
          throw new Error(activeError.message);
        }

        // Get new users this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: newUsersThisMonth, error: newError } = await window.supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth.toISOString());

        if (newError) {
          throw new Error(newError.message);
        }

        return {
          success: true,
          data: {
            total: totalUsers || 0,
            active: activeUsers || 0,
            inactive: (totalUsers || 0) - (activeUsers || 0),
            newThisMonth: newUsersThisMonth || 0
          }
        };
      } catch (error) {
        console.error('Error fetching user stats:', error);
        return { success: false, error: error.message };
      }
    },

    // Export users data
    async exportUsers(format = 'json') {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        const { data: users, error } = await window.supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        const formattedUsers = users.map(formatUserData);

        await window.AdminService.logActivity('export_users', {
          table_name: 'profiles',
          format,
          count: formattedUsers.length
        });

        if (format === 'csv') {
          // Convert to CSV
          const headers = ['ID', 'Name', 'Email', 'Phone', 'Gender', 'Location', 'Registration Date', 'Active'];
          const csvData = [
            headers.join(','),
            ...formattedUsers.map(user => [
              user.id,
              `"${user.name}"`,
              user.email,
              user.phone || '',
              user.gender || '',
              `"${user.location || ''}"`,
              user.registration_date.toISOString(),
              user.is_active
            ].join(','))
          ].join('\n');

          return { success: true, data: csvData, format: 'csv' };
        }

        return { success: true, data: formattedUsers, format: 'json' };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Alias for getUserStats (for compatibility)  
    getUserStatistics: async function() {
      return await this.getUserStats();
    },

    // Additional compatibility functions that might be called
    async getAllUserStats() {
      return await this.getUserStats();
    },

    async getStatistics() {
      return await this.getUserStats();
    }
  };
})();

console.log('✅ User Management Service with Supabase Loaded');

// Debug: Verify the service is properly exposed
console.log('UserManagementService functions:', Object.getOwnPropertyNames(window.UserManagementService));
console.log('getUserStatistics function exists:', typeof window.UserManagementService.getUserStatistics);

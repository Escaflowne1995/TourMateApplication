/**
 * User Management Service
 * Handles CRUD operations for regular app users
 */

window.UserManagementService = (function() {
  'use strict';

  // Helper function to format user data
  const formatUserData = (user) => ({
    ...user,
    registration_date: new Date(user.created_at || user.registration_date),
    last_login: user.last_login ? new Date(user.last_login) : null,
    favorite_spots: user.favorite_spots || [],
    total_reviews: user.total_reviews || 0
  });

  // Mock user data for fallback (replace with real database integration)
  let mockUsers = [
    {
      id: 'user_1',
      email: 'john.doe@email.com',
      name: 'John Doe',
      full_name: 'John Patrick Doe',
      phone: '+63 912 345 6789',
      address: 'Lahug, Cebu City',
      gender: 'male',
      location: 'Cebu City',
      country: 'Philippines',
      zip_code: '6000',
      birth_date: '1995-03-15',
      avatar_url: null,
      registration_date: new Date('2024-01-15'),
      last_login: new Date('2024-03-01'),
      is_active: true,
      favorite_spots: ['temple-of-leah', 'sirao-garden'],
      total_reviews: 5
    },
    {
      id: 'user_2',
      email: 'maria.santos@email.com',
      name: 'Maria Santos',
      full_name: 'Maria Isabella Santos',
      phone: '+63 917 123 4567',
      address: 'Banilad, Cebu City',
      gender: 'female',
      location: 'Cebu City',
      country: 'Philippines',
      zip_code: '6000',
      birth_date: '1988-07-22',
      avatar_url: null,
      registration_date: new Date('2024-02-01'),
      last_login: new Date('2024-03-02'),
      is_active: true,
      favorite_spots: ['magellan-cross', 'basilica'],
      total_reviews: 3
    },
    {
      id: 'user_3',
      email: 'carlos.reyes@email.com',
      name: 'Carlos Reyes',
      full_name: 'Carlos Miguel Reyes',
      phone: '+63 905 987 6543',
      address: 'Talamban, Cebu City',
      gender: 'male',
      location: 'Cebu City',
      country: 'Philippines',
      zip_code: '6000',
      birth_date: '1992-11-08',
      avatar_url: null,
      registration_date: new Date('2024-01-20'),
      last_login: new Date('2024-02-28'),
      is_active: false,
      favorite_spots: ['kawasan-falls'],
      total_reviews: 1
    }
  ];

  // Helper function to validate admin access
  const requireAdminAccess = () => {
    if (!window.AdminService.isLoggedIn()) {
      throw new Error('Authentication required');
    }
    if (!window.AdminService.hasRole('admin')) {
      throw new Error('Admin access required');
    }
  };

  // Helper function to apply filters
  const applyFilters = (userList, filters) => {
    let filtered = [...userList];

    if (filters.gender && filters.gender !== 'all') {
      filtered = filtered.filter(user => user.gender === filters.gender);
    }

    if (filters.isActive !== undefined) {
      filtered = filtered.filter(user => user.is_active === filters.isActive);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.full_name?.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.phone?.includes(term) ||
        user.address?.toLowerCase().includes(term)
      );
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(user => new Date(user.registration_date) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(user => new Date(user.registration_date) <= toDate);
    }

    return filtered;
  };

  // Helper function to apply pagination
  const applyPagination = (userList, pagination) => {
    const { page = 1, limit = 20 } = pagination;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      data: userList.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: userList.length,
        totalPages: Math.ceil(userList.length / limit)
      }
    };
  };

  // Public API
  return {
    // Get all users with filtering and pagination
    async getAllUsers(filters = {}, pagination = { page: 1, limit: 20 }) {
      try {
        requireAdminAccess();

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Apply filters
        const filteredUsers = applyFilters(mockUsers, filters);

        // Sort by registration date (newest first)
        filteredUsers.sort((a, b) => new Date(b.registration_date) - new Date(a.registration_date));

        // Apply pagination
        const result = applyPagination(filteredUsers, pagination);

        window.AdminService.logActivity('view_users', { 
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

        const user = mockUsers.find(u => u.id === userId);
        if (!user) {
          throw new Error('User not found');
        }

        window.AdminService.logActivity('view_user', { user_id: userId });
        return { success: true, data: user };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Update user
    async updateUser(userId, updates) {
      try {
        requireAdminAccess();

        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex === -1) {
          throw new Error('User not found');
        }

        // Validate updates
        const allowedFields = [
          'name', 'full_name', 'phone', 'address', 'gender', 
          'location', 'country', 'zip_code', 'birth_date', 
          'avatar_url', 'is_active'
        ];

        const sanitizedUpdates = {};
        Object.keys(updates).forEach(key => {
          if (allowedFields.includes(key)) {
            sanitizedUpdates[key] = updates[key];
          }
        });

        // Add updated timestamp
        sanitizedUpdates.updated_at = new Date();

        // Apply updates
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...sanitizedUpdates };

        window.AdminService.logActivity('update_user', { 
          user_id: userId, 
          updates: sanitizedUpdates 
        });
        
        window.AdminService.showToast('User updated successfully', 'success');
        return { success: true, data: mockUsers[userIndex] };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Soft delete user (deactivate)
    async deleteUser(userId) {
      try {
        requireAdminAccess();

        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex === -1) {
          throw new Error('User not found');
        }

        mockUsers[userIndex].is_active = false;
        mockUsers[userIndex].deactivated_at = new Date();

        window.AdminService.logActivity('delete_user', { user_id: userId });
        window.AdminService.showToast('User deactivated successfully', 'success');
        
        return { success: true, data: mockUsers[userIndex] };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Activate user (alias for restore)
    async activateUser(userId) {
      return await this.restoreUser(userId);
    },

    // Restore user (reactivate)
    async restoreUser(userId) {
      try {
        requireAdminAccess();

        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex === -1) {
          throw new Error('User not found');
        }

        mockUsers[userIndex].is_active = true;
        delete mockUsers[userIndex].deactivated_at;
        mockUsers[userIndex].reactivated_at = new Date();

        window.AdminService.logActivity('restore_user', { user_id: userId });
        window.AdminService.showToast('User restored successfully', 'success');
        
        return { success: true, data: mockUsers[userIndex] };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Create new user
    async createUser(userData) {
      try {
        requireAdminAccess();

        // Validate required fields
        if (!userData.email || !userData.name) {
          throw new Error('Email and name are required');
        }

        // Check if user already exists
        if (mockUsers.find(u => u.email === userData.email)) {
          throw new Error('User with this email already exists');
        }

        const newUser = {
          id: window.AdminConfig.utils.generateId(),
          email: userData.email,
          name: userData.name,
          full_name: userData.full_name || userData.name,
          phone: userData.phone || null,
          address: userData.address || null,
          gender: userData.gender || null,
          location: userData.location || null,
          country: userData.country || 'Philippines',
          zip_code: userData.zip_code || null,
          birth_date: userData.birth_date || null,
          avatar_url: userData.avatar_url || null,
          registration_date: new Date(),
          last_login: null,
          is_active: true,
          favorite_spots: [],
          total_reviews: 0
        };

        mockUsers.push(newUser);

        window.AdminService.logActivity('create_user', { user_id: newUser.id, email: newUser.email });
        window.AdminService.showToast('User created successfully', 'success');
        
        return { success: true, data: newUser };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Get user statistics
    async getUserStatistics() {
      try {
        requireAdminAccess();

        const stats = {
          total_users: mockUsers.length,
          active_users: mockUsers.filter(u => u.is_active).length,
          inactive_users: mockUsers.filter(u => !u.is_active).length,
          male_users: mockUsers.filter(u => u.gender === 'male' && u.is_active).length,
          female_users: mockUsers.filter(u => u.gender === 'female' && u.is_active).length,
          other_gender: mockUsers.filter(u => ['other', 'prefer_not_to_say'].includes(u.gender) && u.is_active).length,
          new_users_last_30_days: mockUsers.filter(u => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return new Date(u.registration_date) >= thirtyDaysAgo && u.is_active;
          }).length,
          active_users_last_7_days: mockUsers.filter(u => {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return u.last_login && new Date(u.last_login) >= sevenDaysAgo && u.is_active;
          }).length
        };

        return { success: true, data: stats };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Get registration data by month
    async getUserRegistrationByMonth(months = 12) {
      try {
        requireAdminAccess();

        const monthsAgo = new Date();
        monthsAgo.setMonth(monthsAgo.getMonth() - months);

        const recentUsers = mockUsers.filter(u => 
          new Date(u.registration_date) >= monthsAgo && u.is_active
        );

        const monthlyData = {};
        recentUsers.forEach(user => {
          const month = new Date(user.registration_date).toISOString().slice(0, 7);
          monthlyData[month] = (monthlyData[month] || 0) + 1;
        });

        return { success: true, data: monthlyData };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    }
  };
})();

console.log('✅ User Management Service Loaded');

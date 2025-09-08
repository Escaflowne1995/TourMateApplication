/**
 * Delicacies Management Service with Supabase Integration
 * Handles CRUD operations for local delicacies using Supabase
 */

window.DelicaciesService = (function() {
  'use strict';

  // Helper function to check admin access
  const requireAdminAccess = () => {
    if (!window.AdminService.isLoggedIn()) {
      throw new Error('Admin access required');
    }
  };

  // Helper function to format delicacy data
  const formatDelicacyData = (delicacy) => ({
    ...delicacy,
    created_at: new Date(delicacy.created_at),
    updated_at: new Date(delicacy.updated_at),
    ingredients: delicacy.ingredients || [],
    allergens: delicacy.allergens || [],
    dietary_info: delicacy.dietary_info || [],
    images: delicacy.images || [],
    rating: parseFloat(delicacy.rating) || 0,
    review_count: parseInt(delicacy.review_count) || 0
  });

  // Public API
  return {
    // Get all delicacies with filtering and pagination
    async getAllDelicacies(filters = {}, pagination = { page: 1, limit: 20 }) {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        let query = window.supabase.from('delicacies').select('*', { count: 'exact' });

        // Apply filters
        if (filters.search) {
          const searchTerm = `%${filters.search}%`;
          query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm},restaurant.ilike.${searchTerm},location.ilike.${searchTerm}`);
        }

        if (filters.category && filters.category !== 'all') {
          query = query.eq('category', filters.category);
        }

        if (filters.featured !== undefined && filters.featured !== null) {
          query = query.eq('featured', filters.featured);
        }

        if (filters.active !== undefined && filters.active !== null) {
          query = query.eq('is_active', filters.active);
        }

        if (filters.priceRange && filters.priceRange !== 'all') {
          query = query.eq('price_range', filters.priceRange);
        }

        if (filters.dateFrom) {
          query = query.gte('created_at', filters.dateFrom);
        }

        if (filters.dateTo) {
          query = query.lte('created_at', filters.dateTo);
        }

        // Apply sorting
        const sortBy = filters.sortBy || 'created_at';
        const sortOrder = filters.sortOrder || 'desc';
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        // Apply pagination
        const from = (pagination.page - 1) * pagination.limit;
        const to = from + pagination.limit - 1;
        query = query.range(from, to);

        const { data: delicacies, error, count } = await query;

        if (error) {
          console.error('Error fetching delicacies:', error);
          throw new Error(error.message);
        }

        const formattedDelicacies = delicacies.map(formatDelicacyData);

        const result = {
          data: formattedDelicacies,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / pagination.limit)
          }
        };

        await window.AdminService.logActivity('view_delicacies', {
          table_name: 'delicacies',
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

    // Get delicacy by ID
    async getDelicacyById(delicacyId) {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        const { data: delicacy, error } = await window.supabase
          .from('delicacies')
          .select('*')
          .eq('id', delicacyId)
          .single();

        if (error || !delicacy) {
          throw new Error('Delicacy not found');
        }

        const formattedDelicacy = formatDelicacyData(delicacy);

        await window.AdminService.logActivity('view_delicacy', {
          table_name: 'delicacies',
          record_id: delicacyId
        });

        return { success: true, data: formattedDelicacy };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Create new delicacy
    async createDelicacy(delicacyData) {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        // Validate required fields
        if (!delicacyData.name || !delicacyData.description || !delicacyData.restaurant || !delicacyData.price_range) {
          throw new Error('Name, description, restaurant, and price range are required');
        }

        // Prepare delicacy data
        const newDelicacy = {
          name: delicacyData.name,
          description: delicacyData.description,
          category: delicacyData.category || 'Main Dishes',
          restaurant: delicacyData.restaurant,
          location: delicacyData.location || null,
          price_range: delicacyData.price_range,
          ingredients: delicacyData.ingredients || [],
          allergens: delicacyData.allergens || [],
          dietary_info: delicacyData.dietary_info || [],
          cultural_significance: delicacyData.cultural_significance || null,
          preparation_time: delicacyData.preparation_time || null,
          images: delicacyData.images || [],
          rating: parseFloat(delicacyData.rating) || 0,
          review_count: parseInt(delicacyData.review_count) || 0,
          is_active: delicacyData.is_active !== undefined ? delicacyData.is_active : true,
          featured: delicacyData.featured !== undefined ? delicacyData.featured : false
        };

        const { data: createdDelicacy, error } = await window.supabase
          .from('delicacies')
          .insert(newDelicacy)
          .select()
          .single();

        if (error) {
          console.error('Error creating delicacy:', error);
          throw new Error(error.message);
        }

        const formattedDelicacy = formatDelicacyData(createdDelicacy);

        await window.AdminService.logActivity('create_delicacy', {
          table_name: 'delicacies',
          record_id: createdDelicacy.id,
          new_data: formattedDelicacy
        });

        window.AdminService.showToast('Delicacy created successfully', 'success');
        return { success: true, data: formattedDelicacy };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Update delicacy
    async updateDelicacy(delicacyId, updates) {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        // Get current delicacy data for logging
        const { data: oldDelicacy, error: fetchError } = await window.supabase
          .from('delicacies')
          .select('*')
          .eq('id', delicacyId)
          .single();

        if (fetchError || !oldDelicacy) {
          throw new Error('Delicacy not found');
        }

        // Prepare update data
        const updateData = {
          ...updates,
          updated_at: new Date().toISOString()
        };

        // Remove read-only fields
        delete updateData.id;
        delete updateData.created_at;

        const { data: updatedDelicacy, error } = await window.supabase
          .from('delicacies')
          .update(updateData)
          .eq('id', delicacyId)
          .select()
          .single();

        if (error) {
          console.error('Error updating delicacy:', error);
          throw new Error(error.message);
        }

        const formattedDelicacy = formatDelicacyData(updatedDelicacy);

        await window.AdminService.logActivity('update_delicacy', {
          table_name: 'delicacies',
          record_id: delicacyId,
          old_data: formatDelicacyData(oldDelicacy),
          new_data: formattedDelicacy
        });

        window.AdminService.showToast('Delicacy updated successfully', 'success');
        return { success: true, data: formattedDelicacy };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Delete delicacy (soft delete)
    async deleteDelicacy(delicacyId) {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        // Get current delicacy data for logging
        const { data: delicacy, error: fetchError } = await window.supabase
          .from('delicacies')
          .select('*')
          .eq('id', delicacyId)
          .single();

        if (fetchError || !delicacy) {
          throw new Error('Delicacy not found');
        }

        // Soft delete by setting is_active to false
        const { data: updatedDelicacy, error } = await window.supabase
          .from('delicacies')
          .update({
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', delicacyId)
          .select()
          .single();

        if (error) {
          console.error('Error deleting delicacy:', error);
          throw new Error(error.message);
        }

        await window.AdminService.logActivity('delete_delicacy', {
          table_name: 'delicacies',
          record_id: delicacyId,
          old_data: formatDelicacyData(delicacy)
        });

        window.AdminService.showToast('Delicacy deactivated successfully', 'success');
        return { success: true, data: formatDelicacyData(updatedDelicacy) };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Restore delicacy
    async restoreDelicacy(delicacyId) {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        const { data: updatedDelicacy, error } = await window.supabase
          .from('delicacies')
          .update({
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', delicacyId)
          .select()
          .single();

        if (error) {
          console.error('Error restoring delicacy:', error);
          throw new Error(error.message);
        }

        await window.AdminService.logActivity('restore_delicacy', {
          table_name: 'delicacies',
          record_id: delicacyId
        });

        window.AdminService.showToast('Delicacy restored successfully', 'success');
        return { success: true, data: formatDelicacyData(updatedDelicacy) };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Toggle featured status
    async toggleFeatured(delicacyId) {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        // Get current delicacy
        const { data: delicacy, error: fetchError } = await window.supabase
          .from('delicacies')
          .select('featured')
          .eq('id', delicacyId)
          .single();

        if (fetchError || !delicacy) {
          throw new Error('Delicacy not found');
        }

        // Toggle featured status
        const { data: updatedDelicacy, error } = await window.supabase
          .from('delicacies')
          .update({
            featured: !delicacy.featured,
            updated_at: new Date().toISOString()
          })
          .eq('id', delicacyId)
          .select()
          .single();

        if (error) {
          console.error('Error toggling featured status:', error);
          throw new Error(error.message);
        }

        await window.AdminService.logActivity('toggle_delicacy_featured', {
          table_name: 'delicacies',
          record_id: delicacyId,
          new_data: { featured: updatedDelicacy.featured }
        });

        const message = updatedDelicacy.featured ? 'Delicacy featured' : 'Delicacy unfeatured';
        window.AdminService.showToast(message, 'success');
        return { success: true, data: formatDelicacyData(updatedDelicacy) };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Get delicacy statistics
    async getDelicacyStats() {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        // Get total delicacies
        const { count: totalDelicacies, error: totalError } = await window.supabase
          .from('delicacies')
          .select('*', { count: 'exact', head: true });

        if (totalError) {
          throw new Error(totalError.message);
        }

        // Get active delicacies
        const { count: activeDelicacies, error: activeError } = await window.supabase
          .from('delicacies')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        if (activeError) {
          throw new Error(activeError.message);
        }

        // Get featured delicacies
        const { count: featuredDelicacies, error: featuredError } = await window.supabase
          .from('delicacies')
          .select('*', { count: 'exact', head: true })
          .eq('featured', true)
          .eq('is_active', true);

        if (featuredError) {
          throw new Error(featuredError.message);
        }

        // Get delicacies by category
        const { data: categories, error: categoriesError } = await window.supabase
          .from('delicacies')
          .select('category')
          .eq('is_active', true);

        if (categoriesError) {
          throw new Error(categoriesError.message);
        }

        const categoryCounts = categories.reduce((acc, delicacy) => {
          acc[delicacy.category] = (acc[delicacy.category] || 0) + 1;
          return acc;
        }, {});

        // Get delicacies by price range
        const { data: priceRanges, error: priceError } = await window.supabase
          .from('delicacies')
          .select('price_range')
          .eq('is_active', true);

        if (priceError) {
          throw new Error(priceError.message);
        }

        const priceCounts = priceRanges.reduce((acc, delicacy) => {
          acc[delicacy.price_range] = (acc[delicacy.price_range] || 0) + 1;
          return acc;
        }, {});

        return {
          success: true,
          data: {
            total: totalDelicacies || 0,
            active: activeDelicacies || 0,
            inactive: (totalDelicacies || 0) - (activeDelicacies || 0),
            featured: featuredDelicacies || 0,
            byCategory: categoryCounts,
            byPriceRange: priceCounts
          }
        };
      } catch (error) {
        console.error('Error fetching delicacy stats:', error);
        return { success: false, error: error.message };
      }
    },

    // Export delicacies data
    async exportDelicacies(format = 'json') {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        const { data: delicacies, error } = await window.supabase
          .from('delicacies')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        const formattedDelicacies = delicacies.map(formatDelicacyData);

        await window.AdminService.logActivity('export_delicacies', {
          table_name: 'delicacies',
          format,
          count: formattedDelicacies.length
        });

        if (format === 'csv') {
          // Convert to CSV
          const headers = ['ID', 'Name', 'Restaurant', 'Category', 'Price Range', 'Rating', 'Reviews', 'Featured', 'Active', 'Created'];
          const csvData = [
            headers.join(','),
            ...formattedDelicacies.map(delicacy => [
              delicacy.id,
              `"${delicacy.name}"`,
              `"${delicacy.restaurant}"`,
              delicacy.category,
              delicacy.price_range,
              delicacy.rating,
              delicacy.review_count,
              delicacy.featured,
              delicacy.is_active,
              delicacy.created_at.toISOString()
            ].join(','))
          ].join('\n');

          return { success: true, data: csvData, format: 'csv' };
        }

        return { success: true, data: formattedDelicacies, format: 'json' };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Get available categories
    getCategories() {
      return window.AdminConfig.categories.delicacies;
    },

    // Get available price ranges
    getPriceRanges() {
      return ['₱ (Budget)', '₱₱ (Moderate)', '₱₱₱ (Expensive)', '₱₱₱₱ (Fine Dining)'];
    },

    // Alias for getDelicacyStats (for compatibility)
    async getDelicacyStatistics() {
      return await this.getDelicacyStats();
    }
  };
})();

console.log('✅ Delicacies Service with Supabase Loaded');

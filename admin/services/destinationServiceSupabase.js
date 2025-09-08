/**
 * Destination Management Service with Supabase Integration
 * Handles CRUD operations for tourist destinations using Supabase
 */

window.DestinationService = (function() {
  'use strict';

  // Helper function to check admin access
  const requireAdminAccess = () => {
    if (!window.AdminService.isLoggedIn()) {
      throw new Error('Admin access required');
    }
  };

  // Helper function to format destination data
  const formatDestinationData = (destination) => ({
    id: destination.id,
    name: destination.name || 'Unnamed Destination',
    description: destination.description || 'No description available',
    location: destination.location || 'Unknown location',
    category: destination.category || 'Uncategorized',
    created_at: destination.created_at ? new Date(destination.created_at) : new Date(),
    updated_at: destination.updated_at ? new Date(destination.updated_at) : new Date(),
    is_active: destination.is_active !== undefined ? destination.is_active : true,
    featured: destination.featured !== undefined ? destination.featured : false,
    // Optional fields - handle gracefully if missing
    coordinates: destination.coordinates || { latitude: 0, longitude: 0 },
    images: destination.images || [],
    entrance_fee: destination.entrance_fee || null,
    opening_hours: destination.opening_hours || null,
    contact_number: destination.contact_number || null,
    website: destination.website || null,
    amenities: destination.amenities || [],
    accessibility_features: destination.accessibility_features || [],
    best_time_to_visit: destination.best_time_to_visit || null,
    estimated_duration: destination.estimated_duration || null,
    difficulty_level: destination.difficulty_level || 'Easy',
    rating: parseFloat(destination.rating) || 0,
    review_count: parseInt(destination.review_count) || 0
  });

  // Public API
  return {
    // Get all destinations with filtering and pagination
    async getAllDestinations(filters = {}, pagination = { page: 1, limit: 20 }) {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        let query = window.supabase.from('destinations').select('*', { count: 'exact' });

        // Apply filters
        if (filters.search) {
          const searchTerm = `%${filters.search}%`;
          query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm}`);
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

        const { data: destinations, error, count } = await query;

        if (error) {
          console.error('Error fetching destinations:', error);
          throw new Error(error.message);
        }

        const formattedDestinations = destinations.map(formatDestinationData);

        const result = {
          data: formattedDestinations,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / pagination.limit)
          }
        };

        await window.AdminService.logActivity('view_destinations', {
          table_name: 'destinations',
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

    // Get destination by ID
    async getDestinationById(destinationId) {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        const { data: destination, error } = await window.supabase
          .from('destinations')
          .select('*')
          .eq('id', destinationId)
          .single();

        if (error || !destination) {
          throw new Error('Destination not found');
        }

        const formattedDestination = formatDestinationData(destination);

        await window.AdminService.logActivity('view_destination', {
          table_name: 'destinations',
          record_id: destinationId
        });

        return { success: true, data: formattedDestination };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Create new destination
    async createDestination(destinationData) {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        // Validate required fields
        if (!destinationData.name || !destinationData.description || !destinationData.location || !destinationData.category) {
          throw new Error('Name, description, location, and category are required');
        }

        // Prepare destination data
        const newDestination = {
          name: destinationData.name,
          description: destinationData.description,
          location: destinationData.location,
          category: destinationData.category,
          coordinates: destinationData.coordinates || { latitude: 0, longitude: 0 },
          images: destinationData.images || [],
          entrance_fee: destinationData.entrance_fee || null,
          opening_hours: destinationData.opening_hours || null,
          contact_number: destinationData.contact_number || null,
          website: destinationData.website || null,
          amenities: destinationData.amenities || [],
          accessibility_features: destinationData.accessibility_features || [],
          best_time_to_visit: destinationData.best_time_to_visit || null,
          estimated_duration: destinationData.estimated_duration || null,
          difficulty_level: destinationData.difficulty_level || 'Easy',
          rating: parseFloat(destinationData.rating) || 0,
          review_count: parseInt(destinationData.review_count) || 0,
          is_active: destinationData.is_active !== undefined ? destinationData.is_active : true,
          featured: destinationData.featured !== undefined ? destinationData.featured : false
        };

        const { data: createdDestination, error } = await window.supabase
          .from('destinations')
          .insert(newDestination)
          .select()
          .single();

        if (error) {
          console.error('Error creating destination:', error);
          throw new Error(error.message);
        }

        const formattedDestination = formatDestinationData(createdDestination);

        await window.AdminService.logActivity('create_destination', {
          table_name: 'destinations',
          record_id: createdDestination.id,
          new_data: formattedDestination
        });

        window.AdminService.showToast('Destination created successfully', 'success');
        return { success: true, data: formattedDestination };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Update destination
    async updateDestination(destinationId, updates) {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        // Get current destination data for logging
        const { data: oldDestination, error: fetchError } = await window.supabase
          .from('destinations')
          .select('*')
          .eq('id', destinationId)
          .single();

        if (fetchError || !oldDestination) {
          throw new Error('Destination not found');
        }

        // Prepare update data
        const updateData = {
          ...updates,
          updated_at: new Date().toISOString()
        };

        // Remove read-only fields
        delete updateData.id;
        delete updateData.created_at;

        const { data: updatedDestination, error } = await window.supabase
          .from('destinations')
          .update(updateData)
          .eq('id', destinationId)
          .select()
          .single();

        if (error) {
          console.error('Error updating destination:', error);
          throw new Error(error.message);
        }

        const formattedDestination = formatDestinationData(updatedDestination);

        await window.AdminService.logActivity('update_destination', {
          table_name: 'destinations',
          record_id: destinationId,
          old_data: formatDestinationData(oldDestination),
          new_data: formattedDestination
        });

        window.AdminService.showToast('Destination updated successfully', 'success');
        return { success: true, data: formattedDestination };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Delete destination (permanent delete)
    async deleteDestination(destinationId) {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        // Get current destination data for logging before deletion
        const { data: destination, error: fetchError } = await window.supabase
          .from('destinations')
          .select('*')
          .eq('id', destinationId)
          .single();

        if (fetchError || !destination) {
          throw new Error('Destination not found');
        }

        // Permanently delete the destination from database
        const { error } = await window.supabase
          .from('destinations')
          .delete()
          .eq('id', destinationId);

        if (error) {
          console.error('Error permanently deleting destination:', error);
          throw new Error(error.message);
        }

        // Log the permanent deletion
        await window.AdminService.logActivity('permanent_delete_destination', {
          table_name: 'destinations',
          record_id: destinationId,
          old_data: formatDestinationData(destination),
          action_type: 'PERMANENT_DELETE'
        });

        window.AdminService.showToast('Destination permanently deleted successfully', 'success');
        return { success: true, data: formatDestinationData(destination) };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Restore destination (NOT APPLICABLE - destinations are permanently deleted)
    async restoreDestination(destinationId) {
      // This function is no longer applicable since destinations are permanently deleted
      // Kept for compatibility but will always return an error
      window.AdminService.showToast('Cannot restore: destinations are permanently deleted', 'error');
      return { 
        success: false, 
        error: 'Restore not available - destinations are permanently deleted from database' 
      };
    },

    // Toggle featured status
    async toggleFeatured(destinationId) {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        // Get current destination
        const { data: destination, error: fetchError } = await window.supabase
          .from('destinations')
          .select('featured')
          .eq('id', destinationId)
          .single();

        if (fetchError || !destination) {
          throw new Error('Destination not found');
        }

        // Toggle featured status
        const { data: updatedDestination, error } = await window.supabase
          .from('destinations')
          .update({
            featured: !destination.featured,
            updated_at: new Date().toISOString()
          })
          .eq('id', destinationId)
          .select()
          .single();

        if (error) {
          console.error('Error toggling featured status:', error);
          throw new Error(error.message);
        }

        await window.AdminService.logActivity('toggle_destination_featured', {
          table_name: 'destinations',
          record_id: destinationId,
          new_data: { featured: updatedDestination.featured }
        });

        const message = updatedDestination.featured ? 'Destination featured' : 'Destination unfeatured';
        window.AdminService.showToast(message, 'success');
        return { success: true, data: formatDestinationData(updatedDestination) };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Get destination statistics
    async getDestinationStats() {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        // Get total destinations
        const { count: totalDestinations, error: totalError } = await window.supabase
          .from('destinations')
          .select('*', { count: 'exact', head: true });

        if (totalError) {
          throw new Error(totalError.message);
        }

        // Get active destinations
        const { count: activeDestinations, error: activeError } = await window.supabase
          .from('destinations')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        if (activeError) {
          throw new Error(activeError.message);
        }

        // Get featured destinations
        const { count: featuredDestinations, error: featuredError } = await window.supabase
          .from('destinations')
          .select('*', { count: 'exact', head: true })
          .eq('featured', true)
          .eq('is_active', true);

        if (featuredError) {
          throw new Error(featuredError.message);
        }

        // Get destinations by category
        const { data: categories, error: categoriesError } = await window.supabase
          .from('destinations')
          .select('category')
          .eq('is_active', true);

        if (categoriesError) {
          throw new Error(categoriesError.message);
        }

        const categoryCounts = categories.reduce((acc, dest) => {
          acc[dest.category] = (acc[dest.category] || 0) + 1;
          return acc;
        }, {});

        return {
          success: true,
          data: {
            total: totalDestinations || 0,
            active: activeDestinations || 0,
            inactive: (totalDestinations || 0) - (activeDestinations || 0),
            featured: featuredDestinations || 0,
            byCategory: categoryCounts
          }
        };
      } catch (error) {
        console.error('Error fetching destination stats:', error);
        return { success: false, error: error.message };
      }
    },

    // Export destinations data
    async exportDestinations(format = 'json') {
      try {
        requireAdminAccess();

        if (!window.supabase) {
          throw new Error('Database connection not available');
        }

        const { data: destinations, error } = await window.supabase
          .from('destinations')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        const formattedDestinations = destinations.map(formatDestinationData);

        await window.AdminService.logActivity('export_destinations', {
          table_name: 'destinations',
          format,
          count: formattedDestinations.length
        });

        if (format === 'csv') {
          // Convert to CSV
          const headers = ['ID', 'Name', 'Location', 'Category', 'Rating', 'Reviews', 'Featured', 'Active', 'Created'];
          const csvData = [
            headers.join(','),
            ...formattedDestinations.map(dest => [
              dest.id,
              `"${dest.name}"`,
              `"${dest.location}"`,
              dest.category,
              dest.rating,
              dest.review_count,
              dest.featured,
              dest.is_active,
              dest.created_at.toISOString()
            ].join(','))
          ].join('\n');

          return { success: true, data: csvData, format: 'csv' };
        }

        return { success: true, data: formattedDestinations, format: 'json' };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Get available categories
    getCategories() {
      return window.AdminConfig.categories.destinations;
    },

    // Alias for getDestinationStats (for compatibility)
    async getDestinationStatistics() {
      return await this.getDestinationStats();
    }
  };
})();

console.log('✅ Destination Service with Supabase Loaded');

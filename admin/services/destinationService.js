/**
 * Destination Management Service
 * Handles CRUD operations for tourist destinations in Cebu
 */

window.DestinationService = (function() {
  'use strict';

  // Mock destination data for demo (replace with real database integration)
  let destinations = [
    {
      id: 'dest_1',
      name: 'Temple of Leah',
      description: 'A beautiful Roman-inspired temple built as a symbol of undying love. The temple offers stunning views of Cebu City and houses a collection of art and antiques.',
      location: 'Busay, Cebu City',
      category: 'Cultural Sites',
      coordinates: {
        latitude: 10.3677,
        longitude: 123.9345
      },
      images: [
        'https://example.com/temple-of-leah-1.jpg',
        'https://example.com/temple-of-leah-2.jpg'
      ],
      entrance_fee: 'PHP 100',
      opening_hours: '6:00 AM - 11:00 PM',
      contact_number: '+63 32 520 2680',
      website: 'https://templeofleah.com',
      amenities: ['Parking', 'Restrooms', 'Gift Shop', 'Restaurant'],
      accessibility_features: ['Wheelchair Accessible', 'Elevator'],
      best_time_to_visit: 'Early morning or late afternoon',
      estimated_duration: '2-3 hours',
      difficulty_level: 'Easy',
      rating: 4.5,
      review_count: 245,
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-02-01'),
      is_active: true,
      featured: true
    },
    {
      id: 'dest_2',
      name: 'Kawasan Falls',
      description: 'A stunning multi-tiered waterfall perfect for swimming and canyoneering adventures. The turquoise blue waters and lush surroundings make it a must-visit destination.',
      location: 'Badian, Cebu',
      category: 'Natural Attractions',
      coordinates: {
        latitude: 9.8139,
        longitude: 123.3745
      },
      images: [
        'https://example.com/kawasan-falls-1.jpg',
        'https://example.com/kawasan-falls-2.jpg'
      ],
      entrance_fee: 'PHP 30',
      opening_hours: '6:00 AM - 5:00 PM',
      contact_number: '+63 917 123 4567',
      website: null,
      amenities: ['Parking', 'Restrooms', 'Food Stalls', 'Changing Rooms'],
      accessibility_features: ['Stairs Required'],
      best_time_to_visit: 'Dry season (December to May)',
      estimated_duration: '4-6 hours',
      difficulty_level: 'Moderate',
      rating: 4.7,
      review_count: 189,
      created_at: new Date('2024-01-10'),
      updated_at: new Date('2024-01-25'),
      is_active: true,
      featured: true
    },
    {
      id: 'dest_3',
      name: 'Magellan\'s Cross',
      description: 'Historical landmark marking the spot where Ferdinand Magellan planted the cross that introduced Christianity to the Philippines in 1521.',
      location: 'Cebu City',
      category: 'Historical Sites',
      coordinates: {
        latitude: 10.2936,
        longitude: 123.9015
      },
      images: [
        'https://example.com/magellan-cross-1.jpg'
      ],
      entrance_fee: 'Free',
      opening_hours: '8:00 AM - 7:00 PM',
      contact_number: null,
      website: null,
      amenities: ['Nearby Parking', 'Souvenir Shops'],
      accessibility_features: ['Ground Level Access'],
      best_time_to_visit: 'Any time',
      estimated_duration: '30 minutes',
      difficulty_level: 'Easy',
      rating: 4.2,
      review_count: 156,
      created_at: new Date('2024-01-05'),
      updated_at: new Date('2024-01-20'),
      is_active: true,
      featured: false
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

  // Helper function to validate destination data
  const validateDestination = (data) => {
    const config = window.AdminConfig.validation.destination;
    const errors = [];

    // Check required fields
    config.requiredFields.forEach(field => {
      if (!data[field] || data[field].toString().trim() === '') {
        errors.push(`${field} is required`);
      }
    });

    // Check field lengths
    if (data.name && data.name.length > config.nameMaxLength) {
      errors.push(`Name must be ${config.nameMaxLength} characters or less`);
    }

    if (data.description && data.description.length > config.descriptionMaxLength) {
      errors.push(`Description must be ${config.descriptionMaxLength} characters or less`);
    }

    // Check category
    if (data.category && !window.AdminConfig.categories.destinations.includes(data.category)) {
      errors.push('Invalid category');
    }

    // Check coordinates if provided
    if (data.coordinates) {
      if (typeof data.coordinates.latitude !== 'number' || 
          typeof data.coordinates.longitude !== 'number') {
        errors.push('Invalid coordinates format');
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  };

  // Helper function to apply filters
  const applyFilters = (destinationList, filters) => {
    let filtered = [...destinationList];

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(dest => dest.category === filters.category);
    }

    if (filters.isActive !== undefined) {
      filtered = filtered.filter(dest => dest.is_active === filters.isActive);
    }

    if (filters.featured !== undefined) {
      filtered = filtered.filter(dest => dest.featured === filters.featured);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(dest => 
        dest.name.toLowerCase().includes(term) ||
        dest.description.toLowerCase().includes(term) ||
        dest.location.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  // Helper function to apply pagination
  const applyPagination = (destinationList, pagination) => {
    const { page = 1, limit = 20 } = pagination;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      data: destinationList.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: destinationList.length,
        totalPages: Math.ceil(destinationList.length / limit)
      }
    };
  };

  // Public API
  return {
    // Get all destinations with filtering and pagination
    async getAllDestinations(filters = {}, pagination = { page: 1, limit: 20 }) {
      try {
        requireAdminAccess();

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Apply filters
        const filteredDestinations = applyFilters(destinations, filters);

        // Sort by created date (newest first)
        filteredDestinations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Apply pagination
        const result = applyPagination(filteredDestinations, pagination);

        window.AdminService.logActivity('view_destinations', { 
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

        const destination = destinations.find(d => d.id === destinationId);
        if (!destination) {
          throw new Error('Destination not found');
        }

        window.AdminService.logActivity('view_destination', { destination_id: destinationId });
        return { success: true, data: destination };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Create new destination
    async createDestination(destinationData) {
      try {
        requireAdminAccess();
        validateDestination(destinationData);

        const newDestination = {
          id: window.AdminConfig.utils.generateId(),
          ...destinationData,
          created_at: new Date(),
          updated_at: new Date(),
          is_active: destinationData.is_active !== false,
          featured: destinationData.featured || false,
          rating: 0,
          review_count: 0,
          images: destinationData.images || [],
          amenities: destinationData.amenities || [],
          accessibility_features: destinationData.accessibility_features || []
        };

        destinations.push(newDestination);

        window.AdminService.logActivity('create_destination', { 
          destination_id: newDestination.id,
          name: newDestination.name 
        });
        
        window.AdminService.showToast('Destination created successfully', 'success');
        return { success: true, data: newDestination };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Update destination
    async updateDestination(destinationId, updates) {
      try {
        requireAdminAccess();

        const destinationIndex = destinations.findIndex(d => d.id === destinationId);
        if (destinationIndex === -1) {
          throw new Error('Destination not found');
        }

        // Merge updates with existing data for validation
        const updatedData = { ...destinations[destinationIndex], ...updates };
        validateDestination(updatedData);

        // Apply updates
        updates.updated_at = new Date();
        destinations[destinationIndex] = { ...destinations[destinationIndex], ...updates };

        window.AdminService.logActivity('update_destination', { 
          destination_id: destinationId,
          updates: Object.keys(updates)
        });
        
        window.AdminService.showToast('Destination updated successfully', 'success');
        return { success: true, data: destinations[destinationIndex] };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Delete destination (soft delete)
    async deleteDestination(destinationId) {
      try {
        requireAdminAccess();

        const destinationIndex = destinations.findIndex(d => d.id === destinationId);
        if (destinationIndex === -1) {
          throw new Error('Destination not found');
        }

        destinations[destinationIndex].is_active = false;
        destinations[destinationIndex].deleted_at = new Date();

        window.AdminService.logActivity('delete_destination', { destination_id: destinationId });
        window.AdminService.showToast('Destination deleted successfully', 'success');
        
        return { success: true, data: destinations[destinationIndex] };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Restore destination
    async restoreDestination(destinationId) {
      try {
        requireAdminAccess();

        const destinationIndex = destinations.findIndex(d => d.id === destinationId);
        if (destinationIndex === -1) {
          throw new Error('Destination not found');
        }

        destinations[destinationIndex].is_active = true;
        delete destinations[destinationIndex].deleted_at;
        destinations[destinationIndex].restored_at = new Date();

        window.AdminService.logActivity('restore_destination', { destination_id: destinationId });
        window.AdminService.showToast('Destination restored successfully', 'success');
        
        return { success: true, data: destinations[destinationIndex] };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Get destination statistics
    async getDestinationStatistics() {
      try {
        requireAdminAccess();

        const stats = {
          total_destinations: destinations.length,
          active_destinations: destinations.filter(d => d.is_active).length,
          inactive_destinations: destinations.filter(d => !d.is_active).length,
          featured_destinations: destinations.filter(d => d.featured && d.is_active).length,
          by_category: {}
        };

        // Count by category
        window.AdminConfig.categories.destinations.forEach(category => {
          stats.by_category[category] = destinations.filter(d => 
            d.category === category && d.is_active
          ).length;
        });

        return { success: true, data: stats };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Get available categories
    getCategories() {
      return window.AdminConfig.categories.destinations;
    },

    // Bulk operations
    async bulkUpdateDestinations(destinationIds, updates) {
      try {
        requireAdminAccess();

        if (!Array.isArray(destinationIds) || destinationIds.length === 0) {
          throw new Error('No destinations selected');
        }

        const updatedDestinations = [];
        
        for (const id of destinationIds) {
          const result = await this.updateDestination(id, updates);
          if (result.success) {
            updatedDestinations.push(result.data);
          }
        }

        window.AdminService.logActivity('bulk_update_destinations', { 
          destination_ids: destinationIds,
          updates: Object.keys(updates),
          success_count: updatedDestinations.length
        });

        window.AdminService.showToast(
          `${updatedDestinations.length} destinations updated successfully`, 
          'success'
        );
        
        return { success: true, data: updatedDestinations };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    }
  };
})();

console.log('✅ Destination Service Loaded');

/**
 * Delicacies Management Service
 * Handles CRUD operations for Cebu's local delicacies and food items
 */

window.DelicaciesService = (function() {
  'use strict';

  // Mock delicacies data for demo (replace with real database integration)
  let delicacies = [
    {
      id: 'delicacy_1',
      name: 'Lechon',
      description: 'The most famous Cebu delicacy - roasted whole pig with crispy skin and tender meat, seasoned with local herbs and spices.',
      category: 'Main Dishes',
      restaurant: 'Zubuchon',
      restaurant_location: 'IT Park, Cebu City',
      price: 'PHP 150-300 per serving',
      price_range: {
        min: 150,
        max: 300,
        currency: 'PHP'
      },
      images: [
        'https://example.com/lechon-1.jpg',
        'https://example.com/lechon-2.jpg'
      ],
      ingredients: ['Whole pig', 'Lemongrass', 'Salt', 'Garlic', 'Bay leaves'],
      allergens: ['None commonly reported'],
      spice_level: 'Mild',
      cooking_method: 'Roasted',
      preparation_time: '6-8 hours',
      serving_size: '200-300g',
      calories_per_serving: 450,
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: true,
      is_halal: false,
      availability: 'Year-round',
      best_time_to_eat: 'Lunch, Dinner',
      cultural_significance: 'Traditional centerpiece for celebrations and festivals',
      rating: 4.8,
      review_count: 324,
      created_at: new Date('2024-01-10'),
      updated_at: new Date('2024-02-15'),
      is_active: true,
      featured: true
    },
    {
      id: 'delicacy_2',
      name: 'Siomai sa Tisa',
      description: 'Cebu-style steamed dumplings filled with ground pork and shrimp, served with special sauce and chili oil.',
      category: 'Appetizers',
      restaurant: 'Tisa Siomai House',
      restaurant_location: 'Tisa, Cebu City',
      price: 'PHP 5-8 per piece',
      price_range: {
        min: 5,
        max: 8,
        currency: 'PHP'
      },
      images: [
        'https://example.com/siomai-1.jpg'
      ],
      ingredients: ['Ground pork', 'Shrimp', 'Wonton wrapper', 'Green onions', 'Sesame oil'],
      allergens: ['Shellfish', 'Gluten'],
      spice_level: 'Mild to Medium',
      cooking_method: 'Steamed',
      preparation_time: '30 minutes',
      serving_size: '4-6 pieces',
      calories_per_serving: 180,
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      is_halal: false,
      availability: 'Year-round',
      best_time_to_eat: 'Afternoon snack, Dinner',
      cultural_significance: 'Popular street food and affordable meal option',
      rating: 4.5,
      review_count: 156,
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-30'),
      is_active: true,
      featured: false
    },
    {
      id: 'delicacy_3',
      name: 'Puso (Hanging Rice)',
      description: 'Traditional rice wrapped and cooked in coconut leaves, creating a diamond-shaped portable rice serving.',
      category: 'Main Dishes',
      restaurant: 'Various local vendors',
      restaurant_location: 'Throughout Cebu',
      price: 'PHP 10-15 per piece',
      price_range: {
        min: 10,
        max: 15,
        currency: 'PHP'
      },
      images: [
        'https://example.com/puso-1.jpg'
      ],
      ingredients: ['Jasmine rice', 'Coconut leaves', 'Water', 'Salt'],
      allergens: ['None'],
      spice_level: 'None',
      cooking_method: 'Boiled',
      preparation_time: '45 minutes',
      serving_size: '1 piece (150g rice)',
      calories_per_serving: 220,
      is_vegetarian: true,
      is_vegan: true,
      is_gluten_free: true,
      is_halal: true,
      availability: 'Year-round',
      best_time_to_eat: 'Lunch, Dinner',
      cultural_significance: 'Traditional way to serve rice, symbol of Cebuano culture',
      rating: 4.3,
      review_count: 89,
      created_at: new Date('2024-01-08'),
      updated_at: new Date('2024-01-22'),
      is_active: true,
      featured: true
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

  // Helper function to validate delicacy data
  const validateDelicacy = (data) => {
    const config = window.AdminConfig.validation.delicacy;
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
    if (data.category && !window.AdminConfig.categories.delicacies.includes(data.category)) {
      errors.push('Invalid category');
    }

    // Check price range if provided
    if (data.price_range) {
      if (typeof data.price_range.min !== 'number' || 
          typeof data.price_range.max !== 'number' ||
          data.price_range.min < 0 || 
          data.price_range.max < data.price_range.min) {
        errors.push('Invalid price range');
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  };

  // Helper function to apply filters
  const applyFilters = (delicaciesList, filters) => {
    let filtered = [...delicaciesList];

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(del => del.category === filters.category);
    }

    if (filters.isActive !== undefined) {
      filtered = filtered.filter(del => del.is_active === filters.isActive);
    }

    if (filters.featured !== undefined) {
      filtered = filtered.filter(del => del.featured === filters.featured);
    }

    if (filters.isVegetarian !== undefined) {
      filtered = filtered.filter(del => del.is_vegetarian === filters.isVegetarian);
    }

    if (filters.isVegan !== undefined) {
      filtered = filtered.filter(del => del.is_vegan === filters.isVegan);
    }

    if (filters.isGlutenFree !== undefined) {
      filtered = filtered.filter(del => del.is_gluten_free === filters.isGlutenFree);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(del => 
        del.name.toLowerCase().includes(term) ||
        del.description.toLowerCase().includes(term) ||
        del.restaurant.toLowerCase().includes(term) ||
        del.ingredients.some(ing => ing.toLowerCase().includes(term))
      );
    }

    if (filters.priceMin !== undefined) {
      filtered = filtered.filter(del => 
        del.price_range && del.price_range.min >= filters.priceMin
      );
    }

    if (filters.priceMax !== undefined) {
      filtered = filtered.filter(del => 
        del.price_range && del.price_range.max <= filters.priceMax
      );
    }

    return filtered;
  };

  // Helper function to apply pagination
  const applyPagination = (delicaciesList, pagination) => {
    const { page = 1, limit = 20 } = pagination;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      data: delicaciesList.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: delicaciesList.length,
        totalPages: Math.ceil(delicaciesList.length / limit)
      }
    };
  };

  // Public API
  return {
    // Get all delicacies with filtering and pagination
    async getAllDelicacies(filters = {}, pagination = { page: 1, limit: 20 }) {
      try {
        requireAdminAccess();

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Apply filters
        const filteredDelicacies = applyFilters(delicacies, filters);

        // Sort by created date (newest first)
        filteredDelicacies.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Apply pagination
        const result = applyPagination(filteredDelicacies, pagination);

        window.AdminService.logActivity('view_delicacies', { 
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

        const delicacy = delicacies.find(d => d.id === delicacyId);
        if (!delicacy) {
          throw new Error('Delicacy not found');
        }

        window.AdminService.logActivity('view_delicacy', { delicacy_id: delicacyId });
        return { success: true, data: delicacy };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Create new delicacy
    async createDelicacy(delicacyData) {
      try {
        requireAdminAccess();
        validateDelicacy(delicacyData);

        const newDelicacy = {
          id: window.AdminConfig.utils.generateId(),
          ...delicacyData,
          created_at: new Date(),
          updated_at: new Date(),
          is_active: delicacyData.is_active !== false,
          featured: delicacyData.featured || false,
          rating: 0,
          review_count: 0,
          images: delicacyData.images || [],
          ingredients: delicacyData.ingredients || [],
          allergens: delicacyData.allergens || [],
          is_vegetarian: delicacyData.is_vegetarian || false,
          is_vegan: delicacyData.is_vegan || false,
          is_gluten_free: delicacyData.is_gluten_free || false,
          is_halal: delicacyData.is_halal || false
        };

        delicacies.push(newDelicacy);

        window.AdminService.logActivity('create_delicacy', { 
          delicacy_id: newDelicacy.id,
          name: newDelicacy.name 
        });
        
        window.AdminService.showToast('Delicacy created successfully', 'success');
        return { success: true, data: newDelicacy };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Update delicacy
    async updateDelicacy(delicacyId, updates) {
      try {
        requireAdminAccess();

        const delicacyIndex = delicacies.findIndex(d => d.id === delicacyId);
        if (delicacyIndex === -1) {
          throw new Error('Delicacy not found');
        }

        // Merge updates with existing data for validation
        const updatedData = { ...delicacies[delicacyIndex], ...updates };
        validateDelicacy(updatedData);

        // Apply updates
        updates.updated_at = new Date();
        delicacies[delicacyIndex] = { ...delicacies[delicacyIndex], ...updates };

        window.AdminService.logActivity('update_delicacy', { 
          delicacy_id: delicacyId,
          updates: Object.keys(updates)
        });
        
        window.AdminService.showToast('Delicacy updated successfully', 'success');
        return { success: true, data: delicacies[delicacyIndex] };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Delete delicacy (soft delete)
    async deleteDelicacy(delicacyId) {
      try {
        requireAdminAccess();

        const delicacyIndex = delicacies.findIndex(d => d.id === delicacyId);
        if (delicacyIndex === -1) {
          throw new Error('Delicacy not found');
        }

        delicacies[delicacyIndex].is_active = false;
        delicacies[delicacyIndex].deleted_at = new Date();

        window.AdminService.logActivity('delete_delicacy', { delicacy_id: delicacyId });
        window.AdminService.showToast('Delicacy deleted successfully', 'success');
        
        return { success: true, data: delicacies[delicacyIndex] };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Restore delicacy
    async restoreDelicacy(delicacyId) {
      try {
        requireAdminAccess();

        const delicacyIndex = delicacies.findIndex(d => d.id === delicacyId);
        if (delicacyIndex === -1) {
          throw new Error('Delicacy not found');
        }

        delicacies[delicacyIndex].is_active = true;
        delete delicacies[delicacyIndex].deleted_at;
        delicacies[delicacyIndex].restored_at = new Date();

        window.AdminService.logActivity('restore_delicacy', { delicacy_id: delicacyId });
        window.AdminService.showToast('Delicacy restored successfully', 'success');
        
        return { success: true, data: delicacies[delicacyIndex] };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Get delicacy statistics
    async getDelicacyStatistics() {
      try {
        requireAdminAccess();

        const stats = {
          total_delicacies: delicacies.length,
          active_delicacies: delicacies.filter(d => d.is_active).length,
          inactive_delicacies: delicacies.filter(d => !d.is_active).length,
          featured_delicacies: delicacies.filter(d => d.featured && d.is_active).length,
          vegetarian_options: delicacies.filter(d => d.is_vegetarian && d.is_active).length,
          vegan_options: delicacies.filter(d => d.is_vegan && d.is_active).length,
          gluten_free_options: delicacies.filter(d => d.is_gluten_free && d.is_active).length,
          by_category: {},
          price_ranges: {
            budget: delicacies.filter(d => d.price_range && d.price_range.max <= 50 && d.is_active).length,
            moderate: delicacies.filter(d => d.price_range && d.price_range.max > 50 && d.price_range.max <= 200 && d.is_active).length,
            premium: delicacies.filter(d => d.price_range && d.price_range.max > 200 && d.is_active).length
          }
        };

        // Count by category
        window.AdminConfig.categories.delicacies.forEach(category => {
          stats.by_category[category] = delicacies.filter(d => 
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
      return window.AdminConfig.categories.delicacies;
    },

    // Bulk operations
    async bulkUpdateDelicacies(delicacyIds, updates) {
      try {
        requireAdminAccess();

        if (!Array.isArray(delicacyIds) || delicacyIds.length === 0) {
          throw new Error('No delicacies selected');
        }

        const updatedDelicacies = [];
        
        for (const id of delicacyIds) {
          const result = await this.updateDelicacy(id, updates);
          if (result.success) {
            updatedDelicacies.push(result.data);
          }
        }

        window.AdminService.logActivity('bulk_update_delicacies', { 
          delicacy_ids: delicacyIds,
          updates: Object.keys(updates),
          success_count: updatedDelicacies.length
        });

        window.AdminService.showToast(
          `${updatedDelicacies.length} delicacies updated successfully`, 
          'success'
        );
        
        return { success: true, data: updatedDelicacies };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    }
  };
})();

console.log('✅ Delicacies Service Loaded');

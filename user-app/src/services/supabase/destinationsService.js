import { supabase } from './supabaseClient';

/**
 * Destinations Service for Mobile App
 * Fetches real-time destination data from Supabase database
 * Syncs with admin panel changes automatically
 */

class DestinationsService {
  constructor() {
    this.listeners = new Map();
    this.destinationsCache = [];
    this.lastFetch = null;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get all active destinations from Supabase
   * @param {boolean} useCache - Whether to use cached data if available
   * @returns {Promise<Array>} Array of destination objects
   */
  async getDestinations(useCache = true) {
    try {
      // Use cache if it's still valid
      if (useCache && this.isCacheValid()) {
        console.log('📄 Using cached destinations data');
        return { success: true, data: this.destinationsCache };
      }

      console.log('🔄 Fetching destinations from Supabase...');
      
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('is_active', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching destinations:', error);
        throw new Error(error.message);
      }

      // Format destinations for mobile app compatibility
      const formattedDestinations = data.map(destination => this.formatDestinationForMobile(destination));
      
      // Update cache
      this.destinationsCache = formattedDestinations;
      this.lastFetch = Date.now();

      console.log(`✅ Loaded ${formattedDestinations.length} destinations from Supabase`);
      return { success: true, data: formattedDestinations };

    } catch (error) {
      console.error('❌ Failed to fetch destinations:', error);
      // Return cached data if available, otherwise empty array
      return { 
        success: false, 
        error: error.message,
        data: this.destinationsCache || [] 
      };
    }
  }

  /**
   * Get featured destinations
   * @param {number} limit - Maximum number of destinations to return
   * @returns {Promise<Array>} Array of featured destinations
   */
  async getFeaturedDestinations(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('is_active', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      const formatted = data.map(destination => this.formatDestinationForMobile(destination));
      console.log(`✅ Loaded ${formatted.length} featured destinations`);
      return { success: true, data: formatted };

    } catch (error) {
      console.error('❌ Failed to fetch featured destinations:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Get destinations by category
   * @param {string} category - Category to filter by
   * @returns {Promise<Array>} Array of destinations in the category
   */
  async getDestinationsByCategory(category) {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('is_active', true)
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      const formatted = data.map(destination => this.formatDestinationForMobile(destination));
      return { success: true, data: formatted };

    } catch (error) {
      console.error(`❌ Failed to fetch destinations for category ${category}:`, error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Setup real-time listener for destination changes
   * @param {Function} callback - Callback function to handle updates
   * @returns {string} Listener ID for unsubscribing
   */
  setupRealtimeListener(callback) {
    const listenerId = `destinations_${Date.now()}_${Math.random()}`;
    
    console.log('🔄 Setting up real-time listener for destinations...');
    
    const subscription = supabase
      .channel(`destinations_changes_${listenerId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'destinations'
        },
        async (payload) => {
          console.log('📡 Real-time destination change detected:', payload);
          
          try {
            // Invalidate cache on any change
            this.invalidateCache();
            
            // Fetch fresh data
            const result = await this.getDestinations(false);
            
            if (result.success) {
              // Notify callback with fresh data
              callback({
                type: payload.eventType,
                destination: payload.new || payload.old,
                allDestinations: result.data
              });
            }
          } catch (error) {
            console.error('❌ Error handling real-time update:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 Real-time subscription status: ${status}`);
      });

    // Store the subscription for cleanup
    this.listeners.set(listenerId, subscription);
    
    return listenerId;
  }

  /**
   * Remove real-time listener
   * @param {string} listenerId - Listener ID returned from setupRealtimeListener
   */
  removeRealtimeListener(listenerId) {
    const subscription = this.listeners.get(listenerId);
    if (subscription) {
      console.log(`🔄 Removing real-time listener: ${listenerId}`);
      supabase.removeChannel(subscription);
      this.listeners.delete(listenerId);
    }
  }

  /**
   * Format destination data for mobile app compatibility
   * @param {Object} destination - Raw destination data from Supabase
   * @returns {Object} Formatted destination for mobile app
   */
  formatDestinationForMobile(destination) {
    return {
      id: destination.id,
      name: destination.name || 'Unnamed Destination',
      location: destination.location || 'Unknown Location',
      description: destination.description || 'No description available',
      category: destination.category || 'Uncategorized',
      image: DestinationsService.getDestinationImage(destination),
      rating: parseFloat(destination.rating) || 0,
      coordinates: destination.coordinates || {
        latitude: 10.3157, // Default to Cebu City coordinates
        longitude: 123.8854
      },
      address: destination.location || 'Cebu, Philippines',
      // Additional fields for mobile app
      entrance_fee: destination.entrance_fee,
      opening_hours: destination.opening_hours,
      contact_number: destination.contact_number,
      website: destination.website,
      amenities: destination.amenities || [],
      accessibility_features: destination.accessibility_features || [],
      best_time_to_visit: destination.best_time_to_visit,
      estimated_duration: destination.estimated_duration,
      difficulty_level: destination.difficulty_level || 'Easy',
      review_count: parseInt(destination.review_count) || 0,
      featured: destination.featured || false,
      is_active: destination.is_active,
      created_at: destination.created_at,
      updated_at: destination.updated_at
    };
  }

  /**
   * Get appropriate image for destination
   * @param {Object} destination - Destination data
   * @returns {any} Image source (could be require() or URL)
   */
  static getDestinationImage(destination) {
    // If destination has images array and it's not empty
    if (destination.images && Array.isArray(destination.images) && destination.images.length > 0) {
      return { uri: destination.images[0] };
    }

    // Fallback to local images based on destination name
    const name = destination.name?.toLowerCase() || '';
    
    if (name.includes('basilica') || name.includes('santo niño')) {
      return require('../../../assets/images/basilica.jpg');
    }
    if (name.includes('magellan') || name.includes('cross')) {
      return require('../../../assets/images/magellan-cross.jpg');
    }
    if (name.includes('temple') || name.includes('leah')) {
      return require('../../../assets/images/temple-of-leah.jpg');
    }
    if (name.includes('kawasan') || name.includes('falls')) {
      return require('../../../assets/images/kawasan-falls.jpg');
    }
    if (name.includes('moalboal')) {
      return require('../../../assets/images/moalboal.jpg');
    }
    if (name.includes('oslob')) {
      return require('../../../assets/images/oslob.jpg');
    }
    if (name.includes('bantayan') || name.includes('camotes')) {
      return require('../../../assets/images/bantayan.jpg');
    }

    // Default fallback image
    return require('../../../assets/images/temple-of-leah.jpg');
  }

  /**
   * Check if cached data is still valid
   * @returns {boolean} True if cache is valid
   */
  isCacheValid() {
    return this.lastFetch && 
           this.destinationsCache.length > 0 && 
           (Date.now() - this.lastFetch) < this.cacheTimeout;
  }

  /**
   * Invalidate the cache
   */
  invalidateCache() {
    console.log('🗑️ Invalidating destinations cache');
    this.lastFetch = null;
    this.destinationsCache = [];
  }
}

// Create and export singleton instance
const destinationsService = new DestinationsService();
export default destinationsService;

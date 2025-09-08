import { supabase } from './supabaseClient';

/**
 * Simple Destinations Service for Mobile App
 * Fetches destinations from Supabase with minimal complexity
 * Fallback service if the main one has issues
 */

// Static function to get destination image
const getDestinationImage = (destination) => {
  try {
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
  } catch (error) {
    console.warn('Error getting destination image:', error);
    return require('../../../assets/images/temple-of-leah.jpg');
  }
};

// Static function to format destination data
const formatDestinationForMobile = (destination) => {
  try {
    return {
      id: destination.id,
      name: destination.name || 'Unnamed Destination',
      location: destination.location || 'Unknown Location',
      description: destination.description || 'No description available',
      category: destination.category || 'Uncategorized',
      image: getDestinationImage(destination),
      rating: parseFloat(destination.rating) || 0,
      coordinates: destination.coordinates || {
        latitude: 10.3157, // Default to Cebu City coordinates
        longitude: 123.8854
      },
      address: destination.location || 'Cebu, Philippines',
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
  } catch (error) {
    console.error('Error formatting destination:', error);
    return {
      id: destination.id || 'unknown',
      name: destination.name || 'Unknown Destination',
      location: 'Unknown Location',
      description: 'No description available',
      category: 'Uncategorized',
      image: require('../../../assets/images/temple-of-leah.jpg'),
      rating: 0,
      coordinates: { latitude: 10.3157, longitude: 123.8854 },
      address: 'Cebu, Philippines',
      featured: false,
      is_active: true
    };
  }
};

/**
 * Get all active destinations from Supabase
 */
export const getDestinations = async () => {
  try {
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
    const formattedDestinations = data.map(formatDestinationForMobile);
    
    console.log(`✅ Loaded ${formattedDestinations.length} destinations from Supabase`);
    return { success: true, data: formattedDestinations };

  } catch (error) {
    console.error('❌ Failed to fetch destinations:', error);
    return { 
      success: false, 
      error: error.message,
      data: [] 
    };
  }
};

/**
 * Get featured destinations
 */
export const getFeaturedDestinations = async (limit = 10) => {
  try {
    console.log('🔄 Fetching featured destinations...');
    
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

    const formatted = data.map(formatDestinationForMobile);
    console.log(`✅ Loaded ${formatted.length} featured destinations`);
    return { success: true, data: formatted };

  } catch (error) {
    console.error('❌ Failed to fetch featured destinations:', error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Get popular destinations (sorted by rating and reviews)
 */
export const getPopularDestinations = async (limit = 20) => {
  try {
    const result = await getDestinations();
    const destinations = result.data || [];
    
    // Return destinations sorted by rating and review count
    const popular = destinations
      .sort((a, b) => {
        // Sort by featured first, then by rating and review count
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        
        const aScore = (a.rating * 0.7) + (Math.min(a.review_count, 100) * 0.3);
        const bScore = (b.rating * 0.7) + (Math.min(b.review_count, 100) * 0.3);
        
        return bScore - aScore;
      })
      .slice(0, limit);
      
    return { success: true, data: popular };
  } catch (error) {
    console.error('Error fetching popular destinations:', error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Setup real-time listener for destination changes
 */
export const setupRealtimeListener = (callback) => {
  try {
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
            // Fetch fresh data
            const result = await getDestinations();
            
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

    return { listenerId, subscription };
  } catch (error) {
    console.error('Failed to setup real-time listener:', error);
    return null;
  }
};

/**
 * Remove real-time listener
 */
export const removeRealtimeListener = (subscription) => {
  try {
    if (subscription) {
      console.log('🔄 Removing real-time listener');
      supabase.removeChannel(subscription);
    }
  } catch (error) {
    console.error('Error removing real-time listener:', error);
  }
};

export default {
  getDestinations,
  getFeaturedDestinations,
  getPopularDestinations,
  setupRealtimeListener,
  removeRealtimeListener
};

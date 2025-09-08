// DynamicAttractionsService.js - Dynamic attractions data service that fetches from database
// This service replaces the static data with dynamic data from Supabase

import { supabase } from '../supabase/supabaseClient.js';

class DynamicAttractionsService {
    /**
     * Get featured attractions from database
     */
    static async getFeaturedAttractions() {
        try {
            const { data, error } = await supabase
                .from('destinations')
                .select(`
                    id,
                    name,
                    location,
                    image_url,
                    rating,
                    coordinates,
                    address,
                    category
                `)
                .eq('is_featured', true)
                .eq('is_active', true)
                .order('rating', { ascending: false });

            if (error) {
                console.error('Error fetching featured attractions:', error);
                // Fallback to static data if database fails
                return this.getFallbackFeaturedAttractions();
            }

            // Transform data to match expected format
            return data.map(item => ({
                id: item.id,
                name: item.name,
                location: item.location,
                image: item.image_url ? { uri: item.image_url } : require('../../../assets/images/basilica.jpg'), // Fallback image
                rating: item.rating,
                coordinates: item.coordinates || { latitude: 0, longitude: 0 },
                address: item.address
            }));
        } catch (error) {
            console.error('Error in getFeaturedAttractions:', error);
            return this.getFallbackFeaturedAttractions();
        }
    }

    /**
     * Get popular destinations from database
     */
    static async getPopularDestinations() {
        try {
            const { data, error } = await supabase
                .from('destinations')
                .select(`
                    id,
                    name,
                    location,
                    image_url,
                    rating,
                    coordinates,
                    address,
                    category
                `)
                .eq('is_popular', true)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching popular destinations:', error);
                return this.getFallbackPopularDestinations();
            }

            // Transform data to match expected format
            return data.map(item => ({
                id: item.id,
                name: item.name,
                location: item.location,
                image: item.image_url ? { uri: item.image_url } : require('../../../assets/images/moalboal.jpg'), // Fallback image
                rating: item.rating,
                coordinates: item.coordinates || { latitude: 0, longitude: 0 },
                address: item.address
            }));
        } catch (error) {
            console.error('Error in getPopularDestinations:', error);
            return this.getFallbackPopularDestinations();
        }
    }

    /**
     * Get all attractions (featured + popular)
     */
    static async getAllAttractions() {
        try {
            const [featured, popular] = await Promise.all([
                this.getFeaturedAttractions(),
                this.getPopularDestinations()
            ]);
            return [...featured, ...popular];
        } catch (error) {
            console.error('Error in getAllAttractions:', error);
            return [...this.getFallbackFeaturedAttractions(), ...this.getFallbackPopularDestinations()];
        }
    }

    /**
     * Get attraction by ID
     */
    static async getAttractionById(id) {
        try {
            const { data, error } = await supabase
                .from('destinations')
                .select(`
                    id,
                    name,
                    location,
                    image_url,
                    rating,
                    coordinates,
                    address,
                    description,
                    category
                `)
                .eq('id', id)
                .eq('is_active', true)
                .single();

            if (error) {
                console.error('Error fetching attraction by ID:', error);
                // Fallback to static method
                const allAttractions = [...this.getFallbackFeaturedAttractions(), ...this.getFallbackPopularDestinations()];
                return allAttractions.find(attraction => attraction.id === id);
            }

            // Transform data to match expected format
            return {
                id: data.id,
                name: data.name,
                location: data.location,
                image: data.image_url ? { uri: data.image_url } : require('../../../assets/images/basilica.jpg'),
                rating: data.rating,
                coordinates: data.coordinates || { latitude: 0, longitude: 0 },
                address: data.address,
                description: data.description
            };
        } catch (error) {
            console.error('Error in getAttractionById:', error);
            const allAttractions = [...this.getFallbackFeaturedAttractions(), ...this.getFallbackPopularDestinations()];
            return allAttractions.find(attraction => attraction.id === id);
        }
    }

    /**
     * Get attractions by location
     */
    static async getAttractionsByLocation(location) {
        try {
            const allAttractions = await this.getAllAttractions();
            return allAttractions.filter(attraction => 
                attraction.location.toLowerCase().includes(location.toLowerCase())
            );
        } catch (error) {
            console.error('Error in getAttractionsByLocation:', error);
            const allAttractions = [...this.getFallbackFeaturedAttractions(), ...this.getFallbackPopularDestinations()];
            return allAttractions.filter(attraction => 
                attraction.location.toLowerCase().includes(location.toLowerCase())
            );
        }
    }

    /**
     * Get top rated attractions
     */
    static async getTopRatedAttractions(limit = 5) {
        try {
            const allAttractions = await this.getAllAttractions();
            return allAttractions
                .filter(attraction => attraction.rating)
                .sort((a, b) => b.rating - a.rating)
                .slice(0, limit);
        } catch (error) {
            console.error('Error in getTopRatedAttractions:', error);
            return this.getFallbackFeaturedAttractions()
                .filter(attraction => attraction.rating)
                .sort((a, b) => b.rating - a.rating)
                .slice(0, limit);
        }
    }

    /**
     * Search attractions by name, location, or description
     */
    static async searchAttractions(searchTerm) {
        try {
            const { data, error } = await supabase
                .from('destinations')
                .select(`
                    id,
                    name,
                    location,
                    image_url,
                    rating,
                    coordinates,
                    address,
                    description,
                    category
                `)
                .eq('is_active', true)
                .or(`name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

            if (error) {
                console.error('Error searching attractions:', error);
                // Fallback to local search
                const allAttractions = await this.getAllAttractions();
                return allAttractions.filter(attraction =>
                    attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    attraction.location.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            // Transform data to match expected format
            return data.map(item => ({
                id: item.id,
                name: item.name,
                location: item.location,
                image: item.image_url ? { uri: item.image_url } : require('../../../assets/images/basilica.jpg'),
                rating: item.rating,
                coordinates: item.coordinates || { latitude: 0, longitude: 0 },
                address: item.address,
                description: item.description
            }));
        } catch (error) {
            console.error('Error in searchAttractions:', error);
            const allAttractions = await this.getAllAttractions();
            return allAttractions.filter(attraction =>
                attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                attraction.location.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
    }

    // Fallback methods using static data
    static getFallbackFeaturedAttractions() {
        return [
            {
                id: '1',
                name: 'Basilica del Santo Niño',
                location: 'Cebu City',
                image: require('../../../assets/images/basilica.jpg'),
                rating: 4.8,
                coordinates: {
                    latitude: 10.2934,
                    longitude: 123.9012,
                },
                address: 'Osmeña Boulevard, Cebu City, 6000 Cebu, Philippines',
            },
            {
                id: '2',
                name: 'Magellan\'s Cross',
                location: 'Cebu City',
                image: require('../../../assets/images/magellan-cross.jpg'),
                rating: 4.7,
                coordinates: {
                    latitude: 10.2930,
                    longitude: 123.9014,
                },
                address: 'Magallanes Street, Cebu City, 6000 Cebu, Philippines',
            },
            {
                id: '3',
                name: 'Temple of Leah',
                location: 'Cebu City',
                image: require('../../../assets/images/temple-of-leah.jpg'),
                rating: 4.6,
                coordinates: {
                    latitude: 10.3157,
                    longitude: 123.8854,
                },
                address: 'Cebu Transcentral Highway, Cebu City, Cebu, Philippines',
            },
        ];
    }

    static getFallbackPopularDestinations() {
        return [
            {
                id: '4',
                name: 'Kawasan Falls',
                location: 'Badian',
                image: require('../../../assets/images/kawasan-falls.jpg'),
                coordinates: {
                    latitude: 9.8167,
                    longitude: 123.3833,
                },
                address: 'Kawasan Falls, Badian, Cebu, Philippines',
            },
            {
                id: '5',
                name: 'Moalboal',
                location: 'Cebu',
                image: require('../../../assets/images/moalboal.jpg'),
                coordinates: {
                    latitude: 9.9397,
                    longitude: 123.3923,
                },
                address: 'Moalboal, Cebu, Philippines',
            },
            {
                id: '6',
                name: 'Oslob',
                location: 'Cebu',
                image: require('../../../assets/images/oslob.jpg'),
                coordinates: {
                    latitude: 9.3590,
                    longitude: 123.3894,
                },
                address: 'Oslob, Cebu, Philippines',
            },
        ];
    }

    /**
     * Check if dynamic data is available
     */
    static async isDynamicDataAvailable() {
        try {
            const { data, error } = await supabase
                .from('destinations')
                .select('id')
                .limit(1);
            
            return !error && data && data.length > 0;
        } catch (error) {
            return false;
        }
    }
}

export default DynamicAttractionsService;


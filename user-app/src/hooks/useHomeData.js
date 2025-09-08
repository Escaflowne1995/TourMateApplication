// useHomeData.js - Custom hook for home screen data with real-time updates (SRP + DIP)
import { useState, useEffect, useRef } from 'react';
import AttractionsDataServiceSupabase from '../services/data/AttractionsDataServiceSupabase';
import DelicaciesDataService from '../services/data/DelicaciesDataService';

const useHomeData = () => {
  const [featuredAttractions, setFeaturedAttractions] = useState([]);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [localDelicacies, setLocalDelicacies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const realtimeListenerRef = useRef(null);

  useEffect(() => {
    loadHomeData();
    setupRealtimeListener();
    
    // Cleanup function
    return () => {
      if (realtimeListenerRef.current) {
        AttractionsDataServiceSupabase.removeRealtimeListener(realtimeListenerRef.current);
      }
    };
  }, []);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Loading home data from Supabase...');
      
      // Use Supabase service for real-time data
      const [featured, popular, delicacies] = await Promise.all([
        AttractionsDataServiceSupabase.getFeaturedAttractions(5),
        AttractionsDataServiceSupabase.getPopularDestinations(10),
        Promise.resolve(DelicaciesDataService.getFeaturedDelicacies(3))
      ]);
      
      setFeaturedAttractions(featured);
      setPopularDestinations(popular);
      setLocalDelicacies(delicacies);
      setLastUpdated(new Date());
      
      console.log(`✅ Home data loaded: ${featured.length} featured, ${popular.length} popular`);
    } catch (error) {
      console.error('Error loading home data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeListener = () => {
    try {
      // Setup real-time listener for destination changes
      const listener = AttractionsDataServiceSupabase.setupRealtimeListener(
        (update) => {
          console.log('📡 Real-time update received in home screen:', update.type);
          
          // Refresh data when destinations change
          loadHomeData();
        }
      );
      
      realtimeListenerRef.current = listener;
      console.log('📡 Real-time listener setup for home data');
    } catch (error) {
      console.error('Failed to setup real-time listener:', error);
    }
  };

  const navigateToAttraction = (navigation, attraction) => {
    navigation.navigate('AttractionDetails', { 
      attraction,
      userData: null 
    });
  };

  const navigateToDelicacy = (navigation, delicacy) => {
    navigation.navigate('AttractionDetails', { 
      attraction: delicacy,
      userData: null 
    });
  };

  const refreshData = async () => {
    console.log('🔄 Manual refresh triggered');
    await loadHomeData();
  };

  const forceRefresh = async () => {
    console.log('🔄 Force refresh triggered (bypassing cache)');
    try {
      setIsLoading(true);
      setError(null);
      
      // Force refresh attractions data
      const [featured, popular] = await Promise.all([
        AttractionsDataServiceSupabase.refreshAttractions().then(all => 
          all.filter(attr => attr.featured).slice(0, 5)
        ),
        AttractionsDataServiceSupabase.refreshAttractions().then(all => 
          all.slice(0, 10)
        )
      ]);
      
      setFeaturedAttractions(featured);
      setPopularDestinations(popular);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error force refreshing data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    featuredAttractions,
    popularDestinations,
    localDelicacies,
    isLoading,
    error,
    lastUpdated,
    navigateToAttraction,
    navigateToDelicacy,
    refreshData,
    forceRefresh
  };
};

export default useHomeData; 
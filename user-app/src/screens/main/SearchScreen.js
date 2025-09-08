import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/theme';

const allAttractions = [
  {
    id: '1',
    name: 'Basilica del Santo Niño',
    location: 'Cebu City',
    image: require('../../../assets/images/basilica.jpg'),
    rating: 4.8,
    category: 'Historical',
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
    category: 'Historical',
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
    category: 'Cultural',
    coordinates: {
      latitude: 10.3157,
      longitude: 123.8854,
    },
    address: 'Cebu Transcentral Highway, Cebu City, Cebu, Philippines',
  },
  {
    id: '4',
    name: 'Kawasan Falls',
    location: 'Badian, Cebu',
    image: require('../../../assets/images/kawasan-falls.jpg'),
    rating: 4.9,
    category: 'Nature',
    coordinates: {
      latitude: 9.8167,
      longitude: 123.3833,
    },
    address: 'Kawasan Falls, Badian, Cebu, Philippines',
  },
  {
    id: '5',
    name: 'Moalboal',
    location: 'Moalboal, Cebu',
    image: require('../../../assets/images/moalboal.jpg'),
    rating: 4.8,
    category: 'Beach',
    coordinates: {
      latitude: 9.9397,
      longitude: 123.3923,
    },
    address: 'Moalboal, Cebu, Philippines',
  },
  {
    id: '6',
    name: 'Oslob Whale Sharks',
    location: 'Oslob, Cebu',
    image: require('../../../assets/images/oslob.jpg'),
    rating: 4.7,
    category: 'Adventure',
    coordinates: {
      latitude: 9.3590,
      longitude: 123.3894,
    },
    address: 'Oslob, Cebu, Philippines',
  },
  {
    id: '7',
    name: 'Fort San Pedro',
    location: 'Cebu City',
    image: require('../../../assets/images/fort-san-pedro.jpg'),
    rating: 4.5,
    category: 'Historical',
    coordinates: {
      latitude: 10.2933,
      longitude: 123.9013,
    },
    address: 'Plaza Independencia, Cebu City, Cebu, Philippines',
  },
  {
    id: '8',
    name: 'Bantayan Island',
    location: 'Bantayan, Cebu',
    image: require('../../../assets/images/bantayan.jpg'),
    rating: 4.8,
    category: 'Beach',
    coordinates: {
      latitude: 11.1674,
      longitude: 123.7269,
    },
    address: 'Bantayan Island, Cebu, Philippines',
  },
  {
    id: '9',
    name: 'Sirao Flower Garden',
    location: 'Cebu City',
    image: require('../../../assets/images/sirao-garden.jpg'),
    rating: 4.4,
    category: 'Nature',
    coordinates: {
      latitude: 10.3374,
      longitude: 123.8781,
    },
    address: 'Sirao Flower Garden, Cebu City, Cebu, Philippines',
  },
  {
    id: '10',
    name: 'Tops Lookout',
    location: 'Cebu City',
    image: require('../../../assets/images/tops-lookout.jpg'),
    rating: 4.6,
    category: 'Viewpoint',
    coordinates: {
      latitude: 10.3219,
      longitude: 123.8823,
    },
    address: 'Temple of Leah Access Rd, Cebu City, Cebu, Philippines',
  },
  {
    id: '11',
    name: 'Malapascua Island',
    location: 'Daanbantayan',
    image: require('../../../assets/images/moalboal.jpg'), // Using existing beach image as placeholder
    rating: 4.9,
    category: 'Beach',
    coordinates: {
      latitude: 11.3167,
      longitude: 124.1167,
    },
    address: 'Malapascua Island, Daanbantayan, Cebu, Philippines',
  },
  {
    id: '12',
    name: 'Camotes Islands',
    location: 'Poro, Tudela, Pilar, San Francisco',
    image: require('../../../assets/images/bantayan.jpg'), // Using existing island image as placeholder
    rating: 4.7,
    category: 'Beach',
    coordinates: {
      latitude: 10.8333,
      longitude: 124.3167,
    },
    address: 'Camotes Islands, Cebu, Philippines',
  },
  {
    id: '13',
    name: 'Alegria Canyoneering',
    location: 'Alegria',
    image: require('../../../assets/images/kawasan-falls.jpg'), // Using existing adventure image as placeholder
    rating: 4.8,
    category: 'Adventure',
    coordinates: {
      latitude: 9.7667,
      longitude: 123.3500,
    },
    address: 'Alegria, Cebu, Philippines',
  },
  {
    id: '14',
    name: 'Tuburan Hot Springs',
    location: 'Tuburan',
    image: require('../../../assets/images/sirao-garden.jpg'), // Using existing nature image as placeholder
    rating: 4.4,
    category: 'Nature',
    coordinates: {
      latitude: 10.7333,
      longitude: 123.8167,
    },
    address: 'Tuburan, Cebu, Philippines',
  },
  {
    id: '15',
    name: 'Argao Church & Heritage',
    location: 'Argao',
    image: require('../../../assets/images/basilica.jpg'), // Using existing church image as placeholder
    rating: 4.5,
    category: 'Historical',
    coordinates: {
      latitude: 9.8833,
      longitude: 123.6167,
    },
    address: 'San Miguel Arcangel Church, Argao, Cebu, Philippines',
  },
  {
    id: '16',
    name: 'Carcar Heritage Monument',
    location: 'Carcar City',
    image: require('../../../assets/images/fort-san-pedro.jpg'), // Using existing heritage image as placeholder
    rating: 4.3,
    category: 'Historical',
    coordinates: {
      latitude: 10.1067,
      longitude: 123.6428,
    },
    address: 'Carcar City Heritage Monument, Carcar City, Cebu, Philippines',
  },
  {
    id: '17',
    name: 'Samboan Waterfalls',
    location: 'Samboan',
    image: require('../../../assets/images/kawasan-falls.jpg'), // Using existing waterfall image as placeholder
    rating: 4.6,
    category: 'Nature',
    coordinates: {
      latitude: 9.5333,
      longitude: 123.3000,
    },
    address: 'Samboan, Cebu, Philippines',
  },
  {
    id: '18',
    name: 'Dalaguete Highlands',
    location: 'Dalaguete',
    image: require('../../../assets/images/sirao-garden.jpg'), // Using existing nature image as placeholder
    rating: 4.7,
    category: 'Nature',
    coordinates: {
      latitude: 9.7667,
      longitude: 123.5333,
    },
    address: 'Dalaguete, Cebu, Philippines',
  },
  {
    id: '19',
    name: 'Sogod Waterfalls',
    location: 'Sogod',
    image: require('../../../assets/images/kawasan-falls.jpg'), // Using existing waterfall image as placeholder
    rating: 4.5,
    category: 'Nature',
    coordinates: {
      latitude: 10.7500,
      longitude: 124.0167,
    },
    address: 'Sogod, Cebu, Philippines',
  },
  {
    id: '20',
    name: 'Badian Canyoneering',
    location: 'Badian',
    image: require('../../../assets/images/kawasan-falls.jpg'), // Using existing adventure image as placeholder
    rating: 4.9,
    category: 'Adventure',
    coordinates: {
      latitude: 9.8167,
      longitude: 123.3833,
    },
    address: 'Badian Canyoneering, Badian, Cebu, Philippines',
  },
];

const categories = ['All', 'Historical', 'Cultural', 'Nature', 'Beach', 'Adventure', 'Viewpoint'];

const SearchScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const styles = getStyles(colors, isDarkMode);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredAttractions = allAttractions.filter((attraction) => {
    const matchesSearch =
      attraction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attraction.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || attraction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item && styles.selectedCategory,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item && styles.selectedCategoryText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderAttractionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.attractionCard}
      onPress={() => navigation.navigate('AttractionDetails', { attraction: item })}
    >
      <Image source={item.image} style={styles.attractionImage} />
      <View style={styles.attractionInfo}>
        <Text style={styles.attractionName}>{item.name}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.attractionLocation}>{item.location}</Text>
        </View>
        <View style={styles.ratingPrice}>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search destinations..."
          placeholderTextColor={colors.textPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <FlatList
        data={filteredAttractions}
        renderItem={renderAttractionItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.attractionsList}
      />
    </View>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 3,
    height: 28,
  },
  categoriesContainer: {
    marginBottom: 15,
  },
  categoryItem: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectedCategoryText: {
    color: '#fff',
  },
  attractionsList: {
    padding: 15,
  },
  attractionCard: {
    flexDirection: 'row',
    borderRadius: 15,
    marginBottom: 15,
    backgroundColor: colors.cardBackground,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  attractionImage: {
    width: 120,
    height: 120,
  },
  attractionInfo: {
    flex: 1,
    padding: 15,
  },
  attractionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  attractionLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 5,
  },
  ratingPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  rating: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SearchScreen; 
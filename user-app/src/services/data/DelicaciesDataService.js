// DelicaciesDataService.js - Manages local delicacies data (SRP)
import { imageMap } from '../../utils/imageMap';

const localDelicacies = [
  {
    id: 'd1',
    name: 'Lechon Cebu',
    description: 'World-famous roasted pig, Cebu\'s signature dish with crispy skin and flavorful meat',
    location: 'Carcar City, Cebu',
    image: imageMap.lechon,
    price: '₱350-500/kilo',
    coordinates: {
      latitude: 10.1067,
      longitude: 123.6428,
    },
    address: 'Carcar City Public Market, Carcar City, Cebu, Philippines',
  },
  {
    id: 'd2',
    name: 'Puso (Hanging Rice)',
    description: 'Traditional Filipino rice wrapped in woven coconut leaves, perfect with lechon',
    location: 'Carbon Market, Cebu City',
    image: imageMap.puso,
    price: '₱10-15/piece',
    coordinates: {
      latitude: 10.2934,
      longitude: 123.9012,
    },
    address: 'Carbon Market, Cebu City, Philippines',
  },
  {
    id: 'd3',
    name: 'Pochero Cebuano',
    description: 'Traditional Filipino beef stew with vegetables, a hearty Cebuano comfort food',
    location: 'Ramos Public Market, Cebu City',
    image: imageMap.pochero,
    price: '₱80-120/bowl',
    coordinates: {
      latitude: 10.3157,
      longitude: 123.8854,
    },
    address: 'Ramos Public Market, Lahug, Cebu City, Philippines',
  },
  {
    id: 'd4',
    name: 'Rosquillos',
    description: 'Famous ring-shaped cookies from Liloan, a century-old Filipino delicacy',
    location: 'Liloan, Cebu',
    image: imageMap.rosquillos,
    price: '₱150-200/pack',
    coordinates: {
      latitude: 10.3919,
      longitude: 123.9847,
    },
    address: 'Liloan, Cebu, Philippines',
  },
  {
    id: 'd5',
    name: 'Danggit (Dried Fish)',
    description: 'Premium dried rabbitfish, a traditional Filipino preserved seafood delicacy',
    location: 'Bantayan Island, Cebu',
    image: imageMap.danggit,
    price: '₱180-250/pack',
    coordinates: {
      latitude: 11.1674,
      longitude: 123.7269,
    },
    address: 'Bantayan Island, Cebu, Philippines',
  },
  {
    id: 'd6',
    name: 'Masareal',
    description: 'Traditional Filipino peanut candy, sweet and crunchy Mandaue specialty',
    location: 'Mandaue City, Cebu',
    image: imageMap.masareal,
    price: '₱100-150/pack',
    coordinates: {
      latitude: 10.3457,
      longitude: 123.9327,
    },
    address: 'Mandaue City Public Market, Mandaue City, Cebu, Philippines',
  },
];

class DelicaciesDataService {
  static getLocalDelicacies() {
    return localDelicacies;
  }

  static getDelicacyById(id) {
    return localDelicacies.find(delicacy => delicacy.id === id);
  }

  static getDelicaciesByLocation(location) {
    return localDelicacies.filter(delicacy => 
      delicacy.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  static getDelicaciesByPriceRange(minPrice, maxPrice) {
    return localDelicacies.filter(delicacy => {
      const priceMatch = delicacy.price.match(/₱(\d+)/);
      if (priceMatch) {
        const price = parseInt(priceMatch[1]);
        return price >= minPrice && price <= maxPrice;
      }
      return false;
    });
  }

  static getFeaturedDelicacies(limit = 3) {
    // Return most popular/traditional ones
    return localDelicacies.slice(0, limit);
  }
}

export default DelicaciesDataService; 
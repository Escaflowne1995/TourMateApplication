// AttractionsDataService.js - Manages attractions data (SRP)

const featuredAttractions = [
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

const popularDestinations = [
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
  {
    id: '11',
    name: 'Malapascua Island',
    location: 'Daanbantayan',
    image: require('../../../assets/images/moalboal.jpg'),
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
    image: require('../../../assets/images/bantayan.jpg'),
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
    image: require('../../../assets/images/kawasan-falls.jpg'),
    coordinates: {
      latitude: 9.7667,
      longitude: 123.3500,
    },
    address: 'Alegria, Cebu, Philippines',
  },
];

class AttractionsDataService {
  static getFeaturedAttractions() {
    return featuredAttractions;
  }

  static getPopularDestinations() {
    return popularDestinations;
  }

  static getAttractionById(id) {
    const allAttractions = [...featuredAttractions, ...popularDestinations];
    return allAttractions.find(attraction => attraction.id === id);
  }

  static getAttractionsByLocation(location) {
    const allAttractions = [...featuredAttractions, ...popularDestinations];
    return allAttractions.filter(attraction => 
      attraction.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  static getTopRatedAttractions(limit = 5) {
    return featuredAttractions
      .filter(attraction => attraction.rating)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }
}

export default AttractionsDataService; 
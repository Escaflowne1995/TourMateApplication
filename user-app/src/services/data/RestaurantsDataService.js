// RestaurantsDataService.js - Manages restaurant data for nearby dining options
import { imageMap } from '../../utils/imageMap';

const restaurants = [
  // Cebu City Restaurants - Real Establishments
  {
    id: 'r1',
    name: 'Jollibee - IT Park',
    description: 'Philippines\' favorite fastfood chain with Chickenjoy and burgers',
    cuisine: 'Fast Food',
    location: 'IT Park, Cebu City',
    municipality: 'Cebu City',
    image: imageMap.sutukil,
    rating: 4.2,
    priceRange: '₱100-250',
    coordinates: {
      latitude: 10.3267,
      longitude: 123.9056,
    },
    address: 'Asiatown IT Park, Lahug, Cebu City',
    openHours: '24 Hours',
    specialties: ['Chickenjoy', 'Yumburger', 'Jolly Spaghetti', 'Peach Mango Pie'],
  },
  {
    id: 'r2',
    name: 'Larsian BBQ',
    description: 'Famous street food barbecue destination in Cebu City',
    cuisine: 'Street Food BBQ',
    location: 'Fuente Circle, Cebu City',
    municipality: 'Cebu City',
    image: imageMap.larsian,
    rating: 4.3,
    priceRange: '₱50-150',
    coordinates: {
      latitude: 10.3157,
      longitude: 123.8854,
    },
    address: 'Fuente Circle, Lahug, Cebu City',
    openHours: '6:00 PM - 3:00 AM',
    specialties: ['Pork BBQ', 'Chicken BBQ', 'Pusô', 'Chorizo'],
  },
  {
    id: 'r3',
    name: 'Zubuchon',
    description: 'Award-winning lechon restaurant, home of the best lechon in Cebu',
    cuisine: 'Filipino Specialty',
    location: 'Multiple Locations, Cebu City',
    municipality: 'Cebu City',
    image: imageMap.zubuchon,
    rating: 4.7,
    priceRange: '₱300-600',
    coordinates: {
      latitude: 10.3267,
      longitude: 123.9056,
    },
    address: 'IT Park, SM City Cebu, Robinson\'s Galleria',
    openHours: '11:00 AM - 9:00 PM',
    specialties: ['Lechon Cebu', 'Crispy Pata', 'Dinuguan', 'Chicharon'],
  },
  {
    id: 'r4',
    name: 'McDonald\'s - Ayala Center',
    description: 'World-famous burger chain with drive-thru service',
    cuisine: 'Fast Food',
    location: 'Ayala Center, Cebu City',
    municipality: 'Cebu City',
    image: imageMap.goldenCowrie,
    rating: 4.1,
    priceRange: '₱120-300',
    coordinates: {
      latitude: 10.3181,
      longitude: 123.9061,
    },
    address: 'Ayala Center Cebu, Cebu Business Park',
    openHours: '24 Hours (Drive-Thru)',
    specialties: ['Big Mac', 'McNuggets', 'McFlurry', 'French Fries'],
  },
  
  // Moalboal Restaurants - Real Beach Establishments
  {
    id: 'r5',
    name: 'Chili Bar',
    description: 'Popular beachfront bar and restaurant with international cuisine',
    cuisine: 'International/Bar',
    location: 'Panagsama Beach, Moalboal',
    municipality: 'Moalboal',
    image: imageMap.chiliBar,
    rating: 4.2,
    priceRange: '₱250-500',
    coordinates: {
      latitude: 9.9460,
      longitude: 123.3969,
    },
    address: 'Panagsama Beach, Moalboal, Cebu',
    openHours: '7:00 AM - 11:00 PM',
    specialties: ['Fish & Chips', 'Pasta', 'Fresh Seafood', 'Cocktails'],
  },
  {
    id: 'r6',
    name: 'Shaka Bohol',
    description: 'Trendy beach cafe with healthy bowls and smoothies',
    cuisine: 'Healthy/Cafe',
    location: 'White Beach, Moalboal',
    municipality: 'Moalboal',
    image: imageMap.lantaw,
    rating: 4.5,
    priceRange: '₱200-400',
    coordinates: {
      latitude: 9.9380,
      longitude: 123.3880,
    },
    address: 'White Beach, Moalboal, Cebu',
    openHours: '7:00 AM - 9:00 PM',
    specialties: ['Acai Bowls', 'Smoothies', 'Avocado Toast', 'Fresh Juices'],
  },

  // More Real Restaurants Across Cebu
  {
    id: 'r7',
    name: 'KFC - SM City Cebu',
    description: 'Kentucky Fried Chicken with drive-thru and dine-in options',
    cuisine: 'Fast Food',
    location: 'SM City Cebu',
    municipality: 'Cebu City',
    image: imageMap.kawasanRestaurant,
    rating: 4.1,
    priceRange: '₱150-300',
    coordinates: {
      latitude: 10.3181,
      longitude: 123.9061,
    },
    address: 'SM City Cebu, North Reclamation Area',
    openHours: '10:00 AM - 10:00 PM (Drive-Thru until 11:00 PM)',
    specialties: ['Original Recipe Chicken', 'Zinger Burger', 'Gravy', 'Krushers'],
  },

  // Pizza and Casual Dining
  {
    id: 'r8',
    name: 'Pizza Hut - Ayala Center',
    description: 'World-famous pizza chain with dine-in and delivery',
    cuisine: 'Pizza/Italian',
    location: 'Ayala Center, Cebu City',
    municipality: 'Cebu City',
    image: imageMap.oslobRestaurant,
    rating: 4.0,
    priceRange: '₱200-500',
    coordinates: {
      latitude: 10.3181,
      longitude: 123.9061,
    },
    address: 'Ayala Center Cebu, Cebu Business Park',
    openHours: '10:00 AM - 11:00 PM',
    specialties: ['Pan Pizza', 'Stuffed Crust', 'Pasta', 'Wings'],
  },

  // Local Cebu Favorites
  {
    id: 'r9',
    name: 'Lays Carcar Lechon',
    description: 'Famous Carcar lechon restaurant with multiple branches',
    cuisine: 'Filipino Specialty',
    location: 'Multiple Locations, Cebu',
    municipality: 'Carcar City',
    image: imageMap.carcarLechon,
    rating: 4.8,
    priceRange: '₱300-600',
    coordinates: {
      latitude: 10.1067,
      longitude: 123.6428,
    },
    address: 'Carcar City & Metro Cebu Branches',
    openHours: '10:00 AM - 9:00 PM',
    specialties: ['Carcar Lechon', 'Chicharon', 'Dinuguan', 'Rice Meals'],
  },

  // Coffee and Quick Bites
  {
    id: 'r10',
    name: 'Starbucks - IT Park',
    description: 'International coffee chain with WiFi and comfortable seating',
    cuisine: 'Coffee/Cafe',
    location: 'IT Park, Cebu City',
    municipality: 'Cebu City',
    image: imageMap.gingging,
    rating: 4.4,
    priceRange: '₱150-400',
    coordinates: {
      latitude: 10.3267,
      longitude: 123.9056,
    },
    address: 'Asiatown IT Park, Lahug, Cebu City',
    openHours: '6:00 AM - 12:00 AM',
    specialties: ['Frappuccino', 'Coffee', 'Pastries', 'Sandwiches'],
  },

  // More Fast Food Options
  {
    id: 'r11',
    name: 'Chowking - Robinson\'s Galleria',
    description: 'Chinese-Filipino fast food chain with lauriat meals',
    cuisine: 'Chinese Fast Food',
    location: 'Robinson\'s Galleria, Cebu City',
    municipality: 'Cebu City',
    image: imageMap.sutukil,
    rating: 4.0,
    priceRange: '₱100-250',
    coordinates: {
      latitude: 10.3181,
      longitude: 123.9061,
    },
    address: 'Robinson\'s Galleria Cebu, General Maxilom Avenue',
    openHours: '10:00 AM - 10:00 PM',
    specialties: ['Beef Wonton Noodles', 'Lauriat', 'Dim Sum', 'Chao Fan'],
  },

  // Local Seafood Favorites
  {
    id: 'r12',
    name: 'STK ta Bay! (Sutukil)',
    description: 'Authentic Mactan seafood restaurant with fresh catch daily',
    cuisine: 'Filipino Seafood',
    location: 'Mactan Island, Lapu-Lapu City',
    municipality: 'Lapu-Lapu City',
    image: imageMap.larsian,
    rating: 4.5,
    priceRange: '₱250-500',
    coordinates: {
      latitude: 10.3103,
      longitude: 123.9494,
    },
         address: 'Mactan Island, Lapu-Lapu City, Cebu',
     openHours: '11:00 AM - 10:00 PM',
     specialties: ['Sugba (Grilled)', 'Tuwa (Soup)', 'Kilaw (Ceviche)', 'Fresh Fish'],
   },

   // Karenderyas and Local Eateries Near Tourist Destinations

   // Near Basilica del Santo Niño & Magellan's Cross
   {
     id: 'r13',
     name: 'Karenderya ni Aling Rosa',
     description: 'Traditional Filipino karenderya serving home-cooked meals near Basilica',
     cuisine: 'Filipino Karenderya',
     location: 'Colon Street, Cebu City',
     municipality: 'Cebu City',
     image: imageMap.sutukil,
     rating: 4.3,
     priceRange: '₱50-120',
     coordinates: {
       latitude: 10.2934,
       longitude: 123.9012,
     },
     address: 'Colon Street, near Basilica del Santo Niño',
     openHours: '6:00 AM - 8:00 PM',
     specialties: ['Adobo', 'Sinigang', 'Tinola', 'Rice Toppings'],
   },

   // Near Temple of Leah (Busay Area)
   {
     id: 'r14',
     name: 'Busay Drive-In Restaurant',
     description: 'Mountain view restaurant with parking, popular with families',
     cuisine: 'Filipino Family Dining',
     location: 'Busay Hills, Cebu City',
     municipality: 'Cebu City',
     image: imageMap.lantaw,
     rating: 4.2,
     priceRange: '₱150-350',
     coordinates: {
       latitude: 10.3500,
       longitude: 123.8800,
     },
     address: 'Temple of Leah Road, Busay, Cebu City',
     openHours: '11:00 AM - 10:00 PM',
     specialties: ['Lechon Kawali', 'Grilled Chicken', 'Kare-Kare', 'Mountain View'],
   },

   // Near Kawasan Falls (Badian)
   {
     id: 'r15',
     name: 'Kawasan Falls Karenderya',
     description: 'Local eatery serving affordable Filipino meals for tourists and locals',
     cuisine: 'Filipino Karenderya',
     location: 'Kawasan Falls, Badian',
     municipality: 'Badian',
     image: imageMap.kawasanRestaurant,
     rating: 4.0,
     priceRange: '₱60-150',
     coordinates: {
       latitude: 9.8167,
       longitude: 123.3833,
     },
     address: 'Kawasan Falls Entrance, Badian, Cebu',
     openHours: '7:00 AM - 7:00 PM',
     specialties: ['Pork Adobo', 'Fried Fish', 'Vegetable Soup', 'Energy Meals'],
   },

   // Near Oslob (Whale Shark Area)
   {
     id: 'r16',
     name: 'Tan-awan Seafood Karenderya',
     description: 'Fresh seafood karenderya near whale shark watching area',
     cuisine: 'Seafood Karenderya',
     location: 'Tan-awan, Oslob',
     municipality: 'Oslob',
     image: imageMap.oslobRestaurant,
     rating: 4.1,
     priceRange: '₱80-200',
     coordinates: {
       latitude: 9.4833,
       longitude: 123.3833,
     },
     address: 'Tan-awan Barangay, Oslob, Cebu',
     openHours: '5:00 AM - 7:00 PM',
     specialties: ['Grilled Fish', 'Fish Soup', 'Kinilaw', 'Bangus'],
   },

   // Near Moalboal (White Beach/Panagsama)
   {
     id: 'r17',
     name: 'Panagsama Beach Karenderya',
     description: 'Beachside local eatery with fresh seafood and Filipino favorites',
     cuisine: 'Beach Karenderya',
     location: 'Panagsama Beach, Moalboal',
     municipality: 'Moalboal',
     image: imageMap.chiliBar,
     rating: 4.2,
     priceRange: '₱70-180',
     coordinates: {
       latitude: 9.9460,
       longitude: 123.3969,
     },
     address: 'Panagsama Beach Road, Moalboal, Cebu',
     openHours: '6:00 AM - 9:00 PM',
     specialties: ['Grilled Bangus', 'Adobong Pusit', 'Pancit', 'Fresh Fruits'],
   },

   // Near Malapascua Island
   {
     id: 'r18',
     name: 'Logon Beach Karenderya',
     description: 'Island karenderya serving fresh catch and local island dishes',
     cuisine: 'Island Karenderya',
     location: 'Logon Beach, Malapascua',
     municipality: 'Daanbantayan',
     image: imageMap.gingging,
     rating: 4.3,
     priceRange: '₱90-250',
     coordinates: {
       latitude: 11.3167,
       longitude: 124.1167,
     },
     address: 'Logon Beach, Malapascua Island, Daanbantayan',
     openHours: '6:00 AM - 8:00 PM',
     specialties: ['Fresh Fish', 'Coconut Crab', 'Island Vegetables', 'Tropical Fruits'],
   },

   // Drive-Thru Near Tourist Areas
   {
     id: 'r19',
     name: 'Jollibee - Lahug (Drive-Thru)',
     description: 'Convenient drive-thru near Temple of Leah and mountain resorts',
     cuisine: 'Fast Food Drive-Thru',
     location: 'Lahug, Cebu City',
     municipality: 'Cebu City',
     image: imageMap.sutukil,
     rating: 4.1,
     priceRange: '₱100-250',
     coordinates: {
       latitude: 10.3269,
       longitude: 123.9019,
     },
     address: 'Lahug District, near Temple of Leah access road',
     openHours: '24 Hours (Drive-Thru)',
     specialties: ['Chickenjoy', 'Burgers', 'Spaghetti', 'Quick Service'],
   },

   // Near Carcar Heritage Sites
   {
     id: 'r20',
     name: 'Carcar Heritage Karenderya',
     description: 'Traditional karenderya in historic Carcar serving local specialties',
     cuisine: 'Heritage Karenderya',
     location: 'Carcar City Center',
     municipality: 'Carcar City',
     image: imageMap.carcarLechon,
     rating: 4.4,
     priceRange: '₱60-180',
     coordinates: {
       latitude: 10.1067,
       longitude: 123.6428,
     },
     address: 'Carcar City Public Market Area',
     openHours: '7:00 AM - 8:00 PM',
     specialties: ['Carcar Chicharon', 'Local Lechon', 'Ampao', 'Traditional Sweets'],
   },

   // Near Bantayan Island
   {
     id: 'r21',
     name: 'Santa Fe Beach Karenderya',
     description: 'Beachfront local eatery with fresh seafood and island vibes',
     cuisine: 'Island Karenderya',
     location: 'Santa Fe, Bantayan Island',
     municipality: 'Bantayan',
     image: imageMap.chiliBar,
     rating: 4.0,
     priceRange: '₱80-200',
     coordinates: {
       latitude: 11.1674,
       longitude: 123.7269,
     },
     address: 'Santa Fe Beach, Bantayan Island',
     openHours: '6:00 AM - 9:00 PM',
     specialties: ['Grilled Squid', 'Fresh Fish', 'Coconut Water', 'Island Specialties'],
   },

   // Food Courts in Malls (Tourist-Friendly)
   {
     id: 'r22',
     name: 'SM City Cebu Food Court',
     description: 'Multiple dining options under one roof, tourist-friendly',
     cuisine: 'Food Court',
     location: 'SM City Cebu',
     municipality: 'Cebu City',
     image: imageMap.goldenCowrie,
     rating: 4.1,
     priceRange: '₱80-300',
     coordinates: {
       latitude: 10.3181,
       longitude: 123.9061,
     },
     address: 'SM City Cebu, North Reclamation Area',
     openHours: '10:00 AM - 10:00 PM',
     specialties: ['Various Cuisines', 'Clean Environment', 'Air Conditioning', 'Tourist Friendly'],
   },

   // BASILICA DEL SANTO NIÑO & COLON AREA SPECIFIC
   {
     id: 'r23',
     name: '7-Eleven Colon Street',
     description: 'Convenience store near Basilica, snacks and drinks available 24/7',
     cuisine: 'Convenience Store',
     location: 'Colon Street, Cebu City',
     municipality: 'Cebu City',
     image: imageMap.sutukil,
     rating: 4.0,
     priceRange: '₱20-150',
     coordinates: {
       latitude: 10.2934,
       longitude: 123.9012,
     },
     address: 'Colon Street, near Heritage Monument',
     openHours: '24 Hours',
     specialties: ['Snacks', 'Cold Drinks', 'Coffee', 'Quick Bites'],
   },
   {
     id: 'r24',
     name: 'Colon Heritage Karenderya',
     description: 'Historic karenderya serving traditional Cebuano breakfast and lunch',
     cuisine: 'Heritage Karenderya',
     location: 'Colon Street, Cebu City',
     municipality: 'Cebu City',
     image: imageMap.larsian,
     rating: 4.2,
     priceRange: '₱40-100',
     coordinates: {
       latitude: 10.2940,
       longitude: 123.9015,
     },
     address: 'Near Basilica del Santo Niño, Colon Street',
     openHours: '5:00 AM - 3:00 PM',
     specialties: ['Lugaw', 'Tapsilog', 'Longsilog', 'Bangsilog'],
   },
   {
     id: 'r25',
     name: 'Gaisano Main Downtown',
     description: 'Department store with grocery, snacks, and quick food options',
     cuisine: 'Department Store/Grocery',
     location: 'Downtown Cebu City',
     municipality: 'Cebu City',
     image: imageMap.goldenCowrie,
     rating: 4.1,
     priceRange: '₱30-200',
     coordinates: {
       latitude: 10.2950,
       longitude: 123.9020,
     },
     address: 'Colon Street, Downtown Cebu City',
     openHours: '8:00 AM - 9:00 PM',
     specialties: ['Groceries', 'Baked Goods', 'Food Court', 'Local Products'],
   },

   // TEMPLE OF LEAH / BUSAY AREA SPECIFIC
   {
     id: 'r26',
     name: 'Temple View Karenderya',
     description: 'Mountain karenderya with Temple of Leah view, serving Filipino comfort food',
     cuisine: 'Mountain Karenderya',
     location: 'Temple of Leah Road, Busay',
     municipality: 'Cebu City',
     image: imageMap.lantaw,
     rating: 4.3,
     priceRange: '₱80-180',
     coordinates: {
       latitude: 10.3510,
       longitude: 123.8810,
     },
     address: 'Temple of Leah Access Road, Busay Hills',
     openHours: '7:00 AM - 8:00 PM',
     specialties: ['Mountain View Dining', 'Bulalo', 'Grilled Liempo', 'Fresh Vegetables'],
   },
   {
     id: 'r27',
     name: 'Busay Mini Mart',
     description: 'Local convenience store serving tourists and residents in Busay area',
     cuisine: 'Mini Mart',
     location: 'Busay Hills, Cebu City',
     municipality: 'Cebu City',
     image: imageMap.sutukil,
     rating: 3.9,
     priceRange: '₱25-120',
     coordinates: {
       latitude: 10.3505,
       longitude: 123.8805,
     },
     address: 'Busay Road, near Temple area',
     openHours: '6:00 AM - 10:00 PM',
     specialties: ['Cold Drinks', 'Snacks', 'Ice Cream', 'Emergency Supplies'],
   },

   // KAWASAN FALLS / BADIAN AREA SPECIFIC
   {
     id: 'r28',
     name: 'Kawasan Adventure Karenderya',
     description: 'Energy-boosting meals for canyoneering adventurers and tourists',
     cuisine: 'Adventure Karenderya',
     location: 'Kawasan Falls, Badian',
     municipality: 'Badian',
     image: imageMap.kawasanRestaurant,
     rating: 4.1,
     priceRange: '₱70-200',
     coordinates: {
       latitude: 9.8170,
       longitude: 123.3835,
     },
     address: 'Kawasan Falls Entrance Area, Badian',
     openHours: '6:00 AM - 8:00 PM',
     specialties: ['Power Meals', 'Energy Drinks', 'Protein-Rich Food', 'Local Fish'],
   },
   {
     id: 'r29',
     name: 'Badian Public Market Karenderya',
     description: 'Local market eatery serving fresh seafood and traditional dishes',
     cuisine: 'Market Karenderya',
     location: 'Badian Public Market',
     municipality: 'Badian',
     image: imageMap.oslobRestaurant,
     rating: 4.0,
     priceRange: '₱50-150',
     coordinates: {
       latitude: 9.8160,
       longitude: 123.3830,
     },
     address: 'Badian Public Market, Badian Town',
     openHours: '5:00 AM - 7:00 PM',
     specialties: ['Fresh Fish', 'Market Vegetables', 'Local Delicacies', 'Rice Meals'],
   },

   // OSLOB WHALE SHARK AREA SPECIFIC
   {
     id: 'r30',
     name: 'Whale Shark Village Karenderya',
     description: 'Early morning karenderya for whale shark watchers, opens at dawn',
     cuisine: 'Village Karenderya',
     location: 'Tan-awan Village, Oslob',
     municipality: 'Oslob',
     image: imageMap.oslobRestaurant,
     rating: 4.2,
     priceRange: '₱60-180',
     coordinates: {
       latitude: 9.4835,
       longitude: 123.3835,
     },
     address: 'Tan-awan Whale Shark Area, Oslob',
     openHours: '4:00 AM - 8:00 PM',
     specialties: ['Early Breakfast', 'Fresh Seafood', 'Energy Meals', 'Local Coffee'],
   },
   {
     id: 'r31',
     name: 'Oslob Sari-Sari Store',
     description: 'Local convenience store with snacks, drinks, and whale shark tour essentials',
     cuisine: 'Sari-Sari Store',
     location: 'Tan-awan, Oslob',
     municipality: 'Oslob',
     image: imageMap.chiliBar,
     rating: 3.8,
     priceRange: '₱15-100',
     coordinates: {
       latitude: 9.4830,
       longitude: 123.3830,
     },
     address: 'Near Whale Shark Registration Area',
     openHours: '4:00 AM - 9:00 PM',
     specialties: ['Snacks', 'Water', 'Sunscreen', 'Underwater Camera'],
   },

   // MOALBOAL BEACH AREA SPECIFIC
   {
     id: 'r32',
     name: 'White Beach Karenderya',
     description: 'Beachfront local eatery with fresh seafood and island atmosphere',
     cuisine: 'Beach Karenderya',
     location: 'White Beach, Moalboal',
     municipality: 'Moalboal',
     image: imageMap.chiliBar,
     rating: 4.3,
     priceRange: '₱80-220',
     coordinates: {
       latitude: 9.9465,
       longitude: 123.3975,
     },
     address: 'White Beach Road, Moalboal',
     openHours: '6:00 AM - 10:00 PM',
     specialties: ['Grilled Seafood', 'Beach BBQ', 'Fresh Fruits', 'Cold Drinks'],
   },
   {
     id: 'r33',
     name: 'Moalboal Mini Mart',
     description: 'Beach convenience store with diving gear, snacks, and cold drinks',
     cuisine: 'Beach Mini Mart',
     location: 'Panagsama Beach, Moalboal',
     municipality: 'Moalboal',
     image: imageMap.sutukil,
     rating: 4.0,
     priceRange: '₱20-150',
     coordinates: {
       latitude: 9.9455,
       longitude: 123.3965,
     },
     address: 'Panagsama Beach Road, Moalboal',
     openHours: '6:00 AM - 11:00 PM',
     specialties: ['Cold Beer', 'Snacks', 'Beach Supplies', 'Diving Gear'],
   },

   // CARCAR HERITAGE AREA SPECIFIC
   {
     id: 'r34',
     name: 'Carcar Public Market Food Court',
     description: 'Traditional market food court famous for Carcar specialties',
     cuisine: 'Market Food Court',
     location: 'Carcar Public Market',
     municipality: 'Carcar City',
     image: imageMap.carcarLechon,
     rating: 4.5,
     priceRange: '₱40-150',
     coordinates: {
       latitude: 10.1070,
       longitude: 123.6430,
     },
     address: 'Carcar Public Market, Carcar City',
     openHours: '6:00 AM - 7:00 PM',
     specialties: ['Carcar Chicharon', 'Ampao', 'Local Lechon', 'Traditional Sweets'],
   },
   {
     id: 'r35',
     name: 'Heritage Bakery Carcar',
     description: 'Traditional bakery famous for Carcar bread and local pastries',
     cuisine: 'Traditional Bakery',
     location: 'Carcar City Center',
     municipality: 'Carcar City',
     image: imageMap.goldenCowrie,
     rating: 4.4,
     priceRange: '₱20-80',
     coordinates: {
       latitude: 10.1065,
       longitude: 123.6425,
     },
     address: 'Carcar Heritage District',
     openHours: '5:00 AM - 8:00 PM',
     specialties: ['Carcar Bread', 'Local Pastries', 'Traditional Baking', 'Coffee'],
   },

   // MALAPASCUA ISLAND SPECIFIC
   {
     id: 'r36',
     name: 'Island Sari-Sari Store',
     description: 'Essential island convenience store with supplies and snacks',
     cuisine: 'Island Store',
     location: 'Malapascua Island',
     municipality: 'Daanbantayan',
     image: imageMap.gingging,
     rating: 3.9,
     priceRange: '₱25-120',
     coordinates: {
       latitude: 11.3170,
       longitude: 124.1170,
     },
     address: 'Main Beach Area, Malapascua Island',
     openHours: '6:00 AM - 9:00 PM',
     specialties: ['Island Supplies', 'Cold Drinks', 'Snacks', 'Beach Essentials'],
   },
   {
     id: 'r37',
     name: 'Sunrise Beach Karenderya',
     description: 'Early morning karenderya for thresher shark diving tourists',
     cuisine: 'Diving Karenderya',
     location: 'Malapascua Island',
     municipality: 'Daanbantayan',
     image: imageMap.lantaw,
     rating: 4.2,
     priceRange: '₱90-250',
     coordinates: {
       latitude: 11.3165,
       longitude: 124.1165,
     },
     address: 'Near Diving Centers, Malapascua Island',
     openHours: '4:00 AM - 9:00 PM',
     specialties: ['Pre-Dive Meals', 'Fresh Island Fish', 'Energy Food', 'Early Coffee'],
   },

   // BANTAYAN ISLAND SPECIFIC
   {
     id: 'r38',
     name: 'Santa Fe Beach Food Court',
     description: 'Island food court with multiple local vendors and fresh seafood',
     cuisine: 'Island Food Court',
     location: 'Santa Fe Beach, Bantayan',
     municipality: 'Bantayan',
     image: imageMap.chiliBar,
     rating: 4.1,
     priceRange: '₱70-200',
     coordinates: {
       latitude: 11.1675,
       longitude: 123.7270,
     },
     address: 'Santa Fe Beach Front, Bantayan Island',
     openHours: '6:00 AM - 9:00 PM',
     specialties: ['Island Seafood', 'Coconut Dishes', 'Beach BBQ', 'Tropical Fruits'],
   },

   // LAPU-LAPU / MACTAN ISLAND SPECIFIC
   {
     id: 'r39',
     name: 'Mactan Island Market',
     description: 'Local wet market with fresh seafood and traditional Filipino food',
     cuisine: 'Island Market',
     location: 'Mactan Island, Lapu-Lapu',
     municipality: 'Lapu-Lapu City',
     image: imageMap.oslobRestaurant,
     rating: 4.0,
     priceRange: '₱50-180',
     coordinates: {
       latitude: 10.3105,
       longitude: 123.9495,
     },
     address: 'Mactan Public Market, Lapu-Lapu City',
     openHours: '5:00 AM - 8:00 PM',
     specialties: ['Fresh Seafood', 'Sutukil Style', 'Market Vegetables', 'Island Delicacies'],
   },
   {
     id: 'r40',
     name: 'Airport Road 7-Eleven',
     description: 'Convenient store near airport for travelers, open 24 hours',
     cuisine: 'Convenience Store',
     location: 'Airport Road, Lapu-Lapu',
     municipality: 'Lapu-Lapu City',
     image: imageMap.sutukil,
     rating: 4.0,
     priceRange: '₱20-150',
     coordinates: {
       latitude: 10.3100,
       longitude: 123.9490,
     },
     address: 'Near Mactan-Cebu International Airport',
     openHours: '24 Hours',
     specialties: ['Travel Snacks', 'Cold Drinks', 'Coffee', 'Quick Meals'],
   },

   // ADDITIONAL GENERAL CONVENIENCE STORES & KARENDERYAS
   {
     id: 'r41',
     name: 'Talisay Mini Stop',
     description: 'Convenience store with hot meals and snacks for tourists heading south',
     cuisine: 'Convenience Store',
     location: 'South Road, Talisay',
     municipality: 'Talisay City',
     image: imageMap.sutukil,
     rating: 4.0,
     priceRange: '₱25-180',
     coordinates: {
       latitude: 10.2447,
       longitude: 123.8492,
     },
     address: 'South Coastal Road, Talisay City',
     openHours: '24 Hours',
     specialties: ['Hot Meals', 'Fried Chicken', 'Coffee', 'Travel Snacks'],
   },
   {
     id: 'r42',
     name: 'Provincial Roadside Karenderya',
     description: 'Traditional roadside eatery serving authentic Filipino provincial dishes',
     cuisine: 'Roadside Karenderya',
     location: 'Various Provincial Roads',
     municipality: 'Cebu Province',
     image: imageMap.larsian,
     rating: 4.1,
     priceRange: '₱35-120',
     coordinates: {
       latitude: 10.2000,
       longitude: 123.8000,
     },
     address: 'Along major provincial highways',
     openHours: '6:00 AM - 7:00 PM',
     specialties: ['Rice Meals', 'Grilled Fish', 'Vegetable Dishes', 'Local Specialties'],
   },
   {
     id: 'r43',
     name: 'Balamban Highway Stop',
     description: 'Truck stop and tourist rest area with affordable meals',
     cuisine: 'Highway Stop',
     location: 'Balamban Highway',
     municipality: 'Balamban',
     image: imageMap.kawasanRestaurant,
     rating: 3.8,
     priceRange: '₱40-150',
     coordinates: {
       latitude: 10.4892,
       longitude: 123.7194,
     },
     address: 'Transcentral Highway, Balamban',
     openHours: '5:00 AM - 9:00 PM',
     specialties: ['Trucker Meals', 'Energy Food', 'Cold Drinks', 'Local Fruits'],
   },

   // ADDITIONAL UNIQUE RESTAURANTS FOR SPECIFIC LOCATIONS
   {
     id: 'r44',
     name: 'Downtown Cebu Bakery',
     description: 'Traditional Filipino bakery near historical sites',
     cuisine: 'Local Bakery',
     location: 'Downtown Cebu City',
     municipality: 'Cebu City',
     image: imageMap.goldenCowrie,
     rating: 4.2,
     priceRange: '₱15-80',
     coordinates: {
       latitude: 10.2945,
       longitude: 123.9018,
     },
     address: 'Near Basilica del Santo Niño',
     openHours: '5:00 AM - 8:00 PM',
     specialties: ['Pan de Sal', 'Ensaymada', 'Local Pastries', 'Coffee'],
   },
   {
     id: 'r45',
     name: 'Busay Mountain Cafe',
     description: 'Scenic mountain cafe with panoramic city views',
     cuisine: 'Mountain Cafe',
     location: 'Busay Hills, Cebu City',
     municipality: 'Cebu City',
     image: imageMap.lantaw,
     rating: 4.4,
     priceRange: '₱120-300',
     coordinates: {
       latitude: 10.3515,
       longitude: 123.8815,
     },
     address: 'Temple of Leah vicinity, Busay Hills',
     openHours: '8:00 AM - 10:00 PM',
     specialties: ['Mountain Coffee', 'Scenic Dining', 'Filipino Fusion', 'City Views'],
   },
   {
     id: 'r46',
     name: 'Badian Adventure Grill',
     description: 'Outdoor grilling station for adventure tourists',
     cuisine: 'Adventure Grill',
     location: 'Kawasan Falls Area, Badian',
     municipality: 'Badian',
     image: imageMap.kawasanRestaurant,
     rating: 4.0,
     priceRange: '₱90-250',
     coordinates: {
       latitude: 9.8175,
       longitude: 123.3840,
     },
     address: 'Kawasan Falls Adventure Area',
     openHours: '7:00 AM - 9:00 PM',
     specialties: ['Grilled Meats', 'Adventure Meals', 'BBQ', 'Energy Drinks'],
   },
   {
     id: 'r47',
     name: 'Oslob Sunrise Eatery',
     description: 'Early morning eatery for whale shark tour participants',
     cuisine: 'Sunrise Eatery',
     location: 'Tan-awan, Oslob',
     municipality: 'Oslob',
     image: imageMap.oslobRestaurant,
     rating: 4.1,
     priceRange: '₱50-160',
     coordinates: {
       latitude: 9.4840,
       longitude: 123.3840,
     },
     address: 'Whale Shark Interaction Area, Tan-awan',
     openHours: '3:30 AM - 9:00 PM',
     specialties: ['Pre-Dawn Meals', 'Quick Breakfast', 'Local Fish', 'Hot Coffee'],
   },
   {
     id: 'r48',
     name: 'Moalboal Dive Shop Cafe',
     description: 'Diver-friendly cafe with equipment rental and food',
     cuisine: 'Dive Cafe',
     location: 'Panagsama Beach, Moalboal',
     municipality: 'Moalboal',
     image: imageMap.chiliBar,
     rating: 4.3,
     priceRange: '₱100-280',
     coordinates: {
       latitude: 9.9460,
       longitude: 123.3970,
     },
     address: 'Panagsama Beach Dive Area',
     openHours: '6:00 AM - 11:00 PM',
     specialties: ['Diver Meals', 'Equipment Rental', 'Beach Food', 'Cold Beer'],
   },
 ];

class RestaurantsDataService {
  static getAllRestaurants() {
    return restaurants;
  }

  static getRestaurantById(id) {
    return restaurants.find(restaurant => restaurant.id === id);
  }

  static getRestaurantsByMunicipality(municipality) {
    if (!municipality || typeof municipality !== 'string') {
      return [];
    }
    return restaurants.filter(restaurant => 
      restaurant.municipality && restaurant.municipality.toLowerCase().includes(municipality.toLowerCase())
    );
  }

  static getRestaurantsByLocation(location) {
    if (!location || typeof location !== 'string') {
      return [];
    }
    return restaurants.filter(restaurant => 
      (restaurant.location && restaurant.location.toLowerCase().includes(location.toLowerCase())) ||
      (restaurant.municipality && restaurant.municipality.toLowerCase().includes(location.toLowerCase()))
    );
  }

  static getNearByRestaurants(attractionLocation, limit = 5) {
    console.log('🔍 Finding restaurants near:', attractionLocation);
    
    // Check if attractionLocation is valid
    if (!attractionLocation || typeof attractionLocation !== 'string') {
      console.warn('⚠️ Invalid attraction location provided:', attractionLocation);
      return this.getFeaturedRestaurants(limit);
    }
    
    // Create specific mappings for popular tourist destinations
    const destinationMappings = {
      // DOWNTOWN CEBU CITY & RELIGIOUS SITES - Group A
      'basilica del santo niño': ['r23', 'r24', 'r44'], // 7-Eleven Colon, Heritage Karenderya, Downtown Bakery
      'basilica': ['r23', 'r24', 'r44'],
      'santo niño': ['r23', 'r24', 'r44'],
      'santo nino': ['r23', 'r24', 'r44'],
      'magellan\'s cross': ['r23', 'r24', 'r44'],
      'magellan': ['r23', 'r24', 'r44'],
      'magellans cross': ['r23', 'r24', 'r44'],
      'heritage monument': ['r23', 'r24', 'r44'],
      'fort san pedro': ['r23', 'r24', 'r44'],
      'colon street': ['r23', 'r24', 'r44'],
      'colon': ['r23', 'r24', 'r44'],
      'yap-sandiego ancestral house': ['r25', 'r23', 'r44'], // Gaisano, 7-Eleven, Bakery
      'yap sandiego': ['r25', 'r23', 'r44'],
      
      // TEMPLE OF LEAH & BUSAY AREA - Group B
      'temple of leah': ['r26', 'r27', 'r45'], // Temple View Karenderya, Busay Mini Mart, Mountain Cafe
      'temple': ['r26', 'r27', 'r45'],
      'leah': ['r26', 'r27', 'r45'],
      'sirao flower garden': ['r26', 'r45', 'r19'], // Temple View, Mountain Cafe, Jollibee Lahug
      'sirao': ['r26', 'r45', 'r19'],
      'busay': ['r26', 'r27', 'r45'],
      'la vie parisienne': ['r45', 'r27', 'r10'], // Mountain Cafe, Mini Mart, Starbucks
      
      // KAWASAN FALLS & BADIAN - Group C
      'kawasan falls': ['r28', 'r29', 'r46'], // Adventure Karenderya, Market Karenderya, Adventure Grill
      'kawasan': ['r28', 'r29', 'r46'],
      'badian': ['r28', 'r46', 'r42'], // Adventure Karenderya, Adventure Grill, Provincial Roadside
      'canyoneering': ['r28', 'r46'],
      
      // OSLOB WHALE SHARK AREA - Group D
      'oslob': ['r30', 'r31', 'r47'], // Village Karenderya, Sari-Sari Store, Sunrise Eatery
      'whale shark': ['r30', 'r31', 'r47'],
      'whale': ['r30', 'r31', 'r47'],
      'whale shark watching': ['r30', 'r31', 'r47'],
      'tan-awan': ['r30', 'r47'],
      'tumalog falls': ['r47', 'r31', 'r8'], // Sunrise Eatery, Sari-Sari, Zubuchon
      
      // MOALBOAL BEACH AREA - Group E
      'moalboal': ['r32', 'r33', 'r48'], // White Beach Karenderya, Beach Mini Mart, Dive Shop Cafe
      'white beach': ['r32', 'r48'],
      'panagsama beach': ['r32', 'r48', 'r5'], // White Beach, Dive Cafe, Chili Bar
      'panagsama': ['r32', 'r48', 'r5'],
      'sardine run': ['r32', 'r48'],
      'turtle spotting': ['r32', 'r48'],
      
      // CARCAR HERITAGE - Group F
      'carcar': ['r34', 'r35', 'r9'], // Market Food Court, Heritage Bakery, Lays Carcar Lechon
      'carcar city': ['r34', 'r35', 'r9'],
      'carcar heritage': ['r34', 'r35', 'r20'], // Add Heritage Karenderya
      
      // MALAPASCUA ISLAND - Group G
      'malapascua': ['r36', 'r37', 'r18'], // Island Store, Sunrise Karenderya, Logon Beach Karenderya
      'malapascua island': ['r36', 'r37', 'r18'],
      'daanbantayan': ['r36', 'r37'],
      'thresher shark': ['r36', 'r37', 'r18'],
      
      // BANTAYAN ISLAND - Group H
      'bantayan': ['r38', 'r21'], // Santa Fe Food Court, Santa Fe Karenderya
      'bantayan island': ['r38', 'r21'],
      'santa fe': ['r38'],
      'santa fe beach': ['r38'],
      
      // LAPU-LAPU / MACTAN ISLAND - Group I
      'lapu-lapu': ['r39', 'r40', 'r12'], // Market, Airport Store, STK ta Bay
      'lapu': ['r39', 'r40', 'r12'],
      'mactan': ['r39', 'r40', 'r12'],
      'mactan island': ['r39', 'r40', 'r12'],
      'mactan airport': ['r40', 'r1'], // Airport Store, Jollibee
      'airport': ['r40', 'r1'],
      'lapu-lapu monument': ['r39', 'r40', 'r12'],
      
      // ADDITIONAL SPECIFIC LOCATIONS - Group J
      'tops lookout': ['r43', 'r42', 'r11'], // Highway Stop, Provincial Karenderya, Pizza Hut
      'tops': ['r43', 'r42', 'r11'],
      'cebu taoist temple': ['r2', 'r3', 'r4'], // KFC, Chowking, McDonald's
      'taoist temple': ['r2', 'r3', 'r4'],
      'cebu it park': ['r6', 'r7', 'r22'], // Golden Cowrie, Larsian, SM Food Court
      'it park': ['r6', 'r7', 'r22'],
      'ayala center cebu': ['r6', 'r7', 'r22'],
      'ayala': ['r6', 'r7', 'r22'],
      'sm city cebu': ['r22', 'r1', 'r4'], // SM Food Court, Jollibee, McDonald's
      'sm cebu': ['r22', 'r1', 'r4'],
    };

    // Check for specific destination mappings first
    const attractionLower = attractionLocation.toLowerCase();
    console.log('🎯 Checking attraction:', attractionLower);
    
    // Sort destination mappings by length (longest first) to match more specific terms first
    const sortedMappings = Object.entries(destinationMappings).sort((a, b) => b[0].length - a[0].length);
    
    for (const [destination, restaurantIds] of sortedMappings) {
      if (attractionLower.includes(destination)) {
        console.log(`✅ Found mapping for "${destination}" with IDs:`, restaurantIds);
        
        const mappedRestaurants = restaurantIds
          .map(id => {
            const restaurant = restaurants.find(r => r.id === id);
            if (!restaurant) {
              console.log(`❌ Restaurant with ID ${id} not found`);
            }
            return restaurant;
          })
          .filter(r => r !== undefined);
        
        if (mappedRestaurants.length > 0) {
          console.log(`🍽️ Returning ${mappedRestaurants.length} mapped restaurants for ${destination}:`);
          mappedRestaurants.forEach(r => console.log(`   - ${r.name} (${r.cuisine})`));
          return mappedRestaurants.slice(0, limit);
        }
      }
    }
    
    console.log('⚠️ No specific mapping found, using fallback strategies...');
    
    // Improved location-based filtering with multiple matching strategies
    const locationKeywords = attractionLocation.toLowerCase().split(/[\s,]+/);
    
    // Strategy 1: Direct keyword matching
    let matchedRestaurants = restaurants.filter(restaurant => {
      if (!restaurant.location || !restaurant.municipality) {
        return false;
      }
      const restaurantLocation = `${restaurant.location} ${restaurant.municipality}`.toLowerCase();
      return locationKeywords.some(keyword => 
        keyword.length > 2 && restaurantLocation.includes(keyword)
      );
    });

    // Strategy 2: If no matches, try municipality matching only
    if (matchedRestaurants.length === 0) {
      matchedRestaurants = restaurants.filter(restaurant => 
        restaurant.municipality && locationKeywords.some(keyword => 
          restaurant.municipality.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    // Strategy 3: If still no matches, use general Cebu City restaurants
    if (matchedRestaurants.length === 0) {
      matchedRestaurants = restaurants.filter(restaurant => 
        restaurant.municipality && restaurant.municipality.toLowerCase().includes('cebu city')
      );
    }

    // Strategy 4: Last resort - return featured restaurants
    if (matchedRestaurants.length === 0) {
      matchedRestaurants = this.getFeaturedRestaurants(limit);
    }

    console.log(`🔄 Fallback found ${matchedRestaurants.length} restaurants for ${attractionLocation}`);
    return matchedRestaurants.slice(0, limit);
  }

  static getRestaurantsByPriceRange(minPrice, maxPrice) {
    return restaurants.filter(restaurant => {
      const priceMatch = restaurant.priceRange.match(/₱(\d+)/);
      if (priceMatch) {
        const price = parseInt(priceMatch[1]);
        return price >= minPrice && price <= maxPrice;
      }
      return false;
    });
  }

  static getRestaurantsByCuisine(cuisine) {
    if (!cuisine || typeof cuisine !== 'string') {
      return [];
    }
    return restaurants.filter(restaurant => 
      restaurant.cuisine && restaurant.cuisine.toLowerCase().includes(cuisine.toLowerCase())
    );
  }

  static getFeaturedRestaurants(limit = 6) {
    // Return highest-rated restaurants
    return restaurants
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  static searchRestaurants(query) {
    if (!query || typeof query !== 'string') {
      return [];
    }
    const searchTerm = query.toLowerCase();
    return restaurants.filter(restaurant => 
      (restaurant.name && restaurant.name.toLowerCase().includes(searchTerm)) ||
      (restaurant.description && restaurant.description.toLowerCase().includes(searchTerm)) ||
      (restaurant.cuisine && restaurant.cuisine.toLowerCase().includes(searchTerm)) ||
      (restaurant.location && restaurant.location.toLowerCase().includes(searchTerm)) ||
      (restaurant.specialties && restaurant.specialties.some(specialty => 
        specialty && specialty.toLowerCase().includes(searchTerm)
      ))
    );
  }
}

export default RestaurantsDataService;
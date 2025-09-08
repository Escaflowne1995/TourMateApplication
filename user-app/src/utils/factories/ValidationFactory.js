import * as Yup from 'yup';

// Single Responsibility: Only handles validation schema creation
// Open/Closed: Easy to extend with new validation types
class ValidationFactory {
  
  // Common validation functions (DRY principle)
  static validators = {
    email: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        isValid: emailRegex.test(value),
        message: 'Please enter a valid email address'
      };
    },

    latitude: (value) => {
      const lat = parseFloat(value);
      return {
        isValid: !isNaN(lat) && lat >= -90 && lat <= 90,
        message: 'Please enter a valid latitude (-90 to 90)'
      };
    },

    longitude: (value) => {
      const lng = parseFloat(value);
      return {
        isValid: !isNaN(lng) && lng >= -180 && lng <= 180,
        message: 'Please enter a valid longitude (-180 to 180)'
      };
    },

    phone: (value) => {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      return {
        isValid: phoneRegex.test(value),
        message: 'Please enter a valid phone number'
      };
    },

    url: (value) => {
      try {
        new URL(value);
        return { isValid: true };
      } catch {
        return {
          isValid: false,
          message: 'Please enter a valid URL'
        };
      }
    },

    minLength: (min) => (value) => ({
      isValid: value.length >= min,
      message: `Must be at least ${min} characters long`
    }),

    maxLength: (max) => (value) => ({
      isValid: value.length <= max,
      message: `Must be no more than ${max} characters long`
    }),

    positiveNumber: (value) => {
      const num = parseFloat(value);
      return {
        isValid: !isNaN(num) && num > 0,
        message: 'Please enter a positive number'
      };
    }
  };

  // Transform functions for data processing (Open/Closed Principle)
  static transformers = {
    toArray: (separator = ',') => (value) => 
      value ? value.split(separator).map(item => item.trim()).filter(Boolean) : [],
    
    toCoordinates: (latitude, longitude) => 
      latitude && longitude ? {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      } : null,
    
    toNumber: (value) => value ? parseFloat(value) : 0,
    
    toLowerCase: (value) => value.toLowerCase().trim(),
    
    toTitleCase: (value) => value.replace(/\w\S*/g, 
      txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
  };

  // Factory method for login validation
  static createLoginSchema() {
    return {
      title: 'Login',
      submitLabel: 'Sign In',
      fields: [
        {
          name: 'email',
          label: 'Email',
          placeholder: 'Enter your email address',
          required: true,
          keyboardType: 'email-address',
          autoCapitalize: 'none',
          validation: this.validators.email
        },
        {
          name: 'password',
          label: 'Password',
          placeholder: 'Enter your password',
          required: true,
          secureTextEntry: true,
          validation: this.validators.minLength(6)
        }
      ]
    };
  }

  // Factory method for signup validation
  static createSignupSchema() {
    return {
      title: 'Create Account',
      submitLabel: 'Create Account',
      fields: [
        {
          name: 'firstName',
          label: 'First Name',
          placeholder: 'Enter your first name',
          required: true,
          validation: this.validators.minLength(2),
          transform: this.transformers.toTitleCase
        },
        {
          name: 'lastName',
          label: 'Last Name',
          placeholder: 'Enter your last name',
          required: true,
          validation: this.validators.minLength(2),
          transform: this.transformers.toTitleCase
        },
        {
          name: 'email',
          label: 'Email',
          placeholder: 'Enter your email address',
          required: true,
          keyboardType: 'email-address',
          autoCapitalize: 'none',
          validation: this.validators.email,
          transform: this.transformers.toLowerCase
        },
        {
          name: 'phone',
          label: 'Phone Number',
          placeholder: 'Enter your phone number (optional)',
          required: false,
          keyboardType: 'phone-pad',
          validation: this.validators.phone
        },
        {
          name: 'password',
          label: 'Password',
          placeholder: 'Enter your password',
          required: true,
          secureTextEntry: true,
          validation: this.validators.minLength(6)
        },
        {
          name: 'confirmPassword',
          label: 'Confirm Password',
          placeholder: 'Confirm your password',
          required: true,
          secureTextEntry: true,
          validation: (value, formData) => ({
            isValid: value === formData.password,
            message: 'Passwords do not match'
          })
        }
      ]
    };
  }

  // Factory method for attraction form
  static createAttractionSchema() {
    return {
      title: 'Add New Attraction',
      submitLabel: 'Add Attraction',
      fields: [
        {
          name: 'name',
          label: 'Attraction Name',
          placeholder: 'e.g., Magellan\'s Cross',
          required: true,
          validation: this.validators.minLength(3),
          transform: this.transformers.toTitleCase
        },
        {
          name: 'location',
          label: 'Location',
          placeholder: 'e.g., Cebu City',
          required: true,
          validation: this.validators.minLength(3),
          transform: this.transformers.toTitleCase
        },
        {
          name: 'description',
          label: 'Description',
          placeholder: 'Describe the attraction, its history, and what makes it special...',
          required: true,
          multiline: true,
          validation: this.validators.minLength(20)
        },
        {
          name: 'address',
          label: 'Address',
          placeholder: 'Complete address of the attraction',
          required: true,
          validation: this.validators.minLength(10)
        },
        {
          name: 'openHours',
          label: 'Opening Hours',
          placeholder: 'e.g., 6:00 AM - 6:00 PM daily',
          required: false
        },
        {
          name: 'entranceFee',
          label: 'Entrance Fee',
          placeholder: 'e.g., ₱30 per person',
          required: false
        },
        {
          name: 'latitude',
          label: 'Latitude',
          placeholder: 'e.g., 10.3157',
          required: false,
          keyboardType: 'numeric',
          validation: this.validators.latitude,
          helper: 'Optional: GPS coordinate for map location'
        },
        {
          name: 'longitude',
          label: 'Longitude',
          placeholder: 'e.g., 123.8854',
          required: false,
          keyboardType: 'numeric',
          validation: this.validators.longitude,
          helper: 'Optional: GPS coordinate for map location'
        },
        {
          name: 'category',
          label: 'Category',
          placeholder: 'e.g., Historical, Religious, Natural',
          required: false
        },
        {
          name: 'highlights',
          label: 'Highlights',
          placeholder: 'Main attractions, separated by commas',
          required: false,
          helper: 'Separate multiple highlights with commas',
          transform: this.transformers.toArray()
        },
        {
          name: 'tips',
          label: 'Visitor Tips',
          placeholder: 'Helpful tips for visitors',
          required: false,
          multiline: true
        }
      ]
    };
  }

  // Factory method for restaurant form
  static createRestaurantSchema() {
    return {
      title: 'Add New Restaurant',
      submitLabel: 'Add Restaurant',
      fields: [
        {
          name: 'name',
          label: 'Restaurant Name',
          placeholder: 'e.g., Zubuchon',
          required: true,
          validation: this.validators.minLength(3),
          transform: this.transformers.toTitleCase
        },
        {
          name: 'description',
          label: 'Description',
          placeholder: 'Describe the restaurant, ambiance, and what makes it special...',
          required: true,
          multiline: true,
          validation: this.validators.minLength(20)
        },
        {
          name: 'cuisine',
          label: 'Cuisine Type',
          placeholder: 'e.g., Filipino, International, Fast Food, Seafood',
          required: true,
          validation: this.validators.minLength(3)
        },
        {
          name: 'location',
          label: 'Location',
          placeholder: 'e.g., IT Park, Cebu City',
          required: true,
          validation: this.validators.minLength(3)
        },
        {
          name: 'address',
          label: 'Address',
          placeholder: 'Complete address of the restaurant',
          required: true,
          validation: this.validators.minLength(10)
        },
        {
          name: 'openHours',
          label: 'Operating Hours',
          placeholder: 'e.g., 10:00 AM - 10:00 PM daily',
          required: false
        },
        {
          name: 'priceRange',
          label: 'Price Range',
          placeholder: 'e.g., ₱200-500 per person',
          required: false
        },
        {
          name: 'specialties',
          label: 'Specialties',
          placeholder: 'Signature dishes, separated by commas',
          required: false,
          helper: 'Separate multiple specialties with commas',
          transform: this.transformers.toArray()
        },
        {
          name: 'contactNumber',
          label: 'Contact Number',
          placeholder: 'Restaurant phone number',
          required: false,
          keyboardType: 'phone-pad',
          validation: this.validators.phone
        },
        {
          name: 'features',
          label: 'Features',
          placeholder: 'WiFi, Air-conditioned, Parking, etc.',
          required: false,
          helper: 'Separate multiple features with commas',
          transform: this.transformers.toArray()
        }
      ]
    };
  }

  // Factory method for beach form
  static createBeachSchema() {
    return {
      title: 'Add New Beach',
      submitLabel: 'Add Beach',
      fields: [
        {
          name: 'name',
          label: 'Beach Name',
          placeholder: 'e.g., White Beach Moalboal',
          required: true,
          validation: this.validators.minLength(3),
          transform: this.transformers.toTitleCase
        },
        {
          name: 'location',
          label: 'Location',
          placeholder: 'e.g., Moalboal, Cebu',
          required: true,
          validation: this.validators.minLength(3)
        },
        {
          name: 'description',
          label: 'Description',
          placeholder: 'Describe the beach, its features, and attractions...',
          required: true,
          multiline: true,
          validation: this.validators.minLength(20)
        },
        {
          name: 'address',
          label: 'Address',
          placeholder: 'Complete address or directions to the beach',
          required: true,
          validation: this.validators.minLength(10)
        },
        {
          name: 'beachType',
          label: 'Beach Type',
          placeholder: 'e.g., White Sand, Black Sand, Rocky',
          required: false
        },
        {
          name: 'activities',
          label: 'Activities',
          placeholder: 'Swimming, Snorkeling, Diving, etc.',
          required: false,
          helper: 'Separate multiple activities with commas',
          transform: this.transformers.toArray()
        },
        {
          name: 'facilities',
          label: 'Facilities',
          placeholder: 'Restrooms, Restaurants, Parking, etc.',
          required: false,
          helper: 'Separate multiple facilities with commas',
          transform: this.transformers.toArray()
        },
        {
          name: 'entranceFee',
          label: 'Entrance Fee',
          placeholder: 'e.g., ₱50 per person',
          required: false
        },
        {
          name: 'bestTime',
          label: 'Best Time to Visit',
          placeholder: 'e.g., Morning, Sunset, December-May',
          required: false
        },
        {
          name: 'safety',
          label: 'Safety Information',
          placeholder: 'Important safety tips and warnings',
          required: false,
          multiline: true
        },
        {
          name: 'transportation',
          label: 'Transportation',
          placeholder: 'How to get there',
          required: false,
          multiline: true
        }
      ]
    };
  }

  // Static method to get schema by type (Factory Pattern)
  static getSchema(type) {
    const schemas = {
      login: this.createLoginSchema,
      signup: this.createSignupSchema,
      attraction: this.createAttractionSchema,
      restaurant: this.createRestaurantSchema,
      beach: this.createBeachSchema
    };

    const schemaCreator = schemas[type];
    if (!schemaCreator) {
      throw new Error(`Unknown schema type: ${type}`);
    }

    return schemaCreator();
  }

  // Get Yup validation schema (for Formik compatibility)
  static getYupSchema(type) {
    const schema = this.getSchema(type);
    const yupFields = {};

    schema.fields.forEach(field => {
      let yupField = Yup.string();

      if (field.required) {
        yupField = yupField.required(`${field.label} is required`);
      }

      if (field.validation === this.validators.email) {
        yupField = yupField.email('Invalid email address');
      }

      if (field.validation === this.validators.minLength(6)) {
        yupField = yupField.min(6, 'Must be at least 6 characters');
      }

      yupFields[field.name] = yupField;
    });

    return Yup.object().shape(yupFields);
  }
}

export default ValidationFactory; 
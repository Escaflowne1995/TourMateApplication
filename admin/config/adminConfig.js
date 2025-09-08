/**
 * Admin Panel Configuration
 * Central configuration for admin functionality
 */

window.AdminConfig = {
  // API Configuration
  api: {
    baseUrl: 'http://localhost:3000/api', // Update this to your API endpoint
    timeout: 10000,
    retries: 3
  },

  // Authentication Settings
  auth: {
    sessionTimeout: 3600000, // 1 hour in milliseconds
    maxLoginAttempts: 5,
    lockoutDuration: 900000, // 15 minutes in milliseconds
    requiredPasswordLength: 8
  },

  // Pagination Settings
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
    pageSizeOptions: [10, 20, 50, 100]
  },

  // Feature Flags
  features: {
    enableUserDeletion: true,
    enableDataExport: true,
    enableBulkOperations: true,
    enableAuditLog: true,
    enableImageUpload: true
  },

  // UI Settings
  ui: {
    theme: 'light', // 'light' or 'dark'
    animationDuration: 300,
    toastDuration: 4000,
    autoRefreshInterval: 30000 // 30 seconds
  },

  // Validation Rules
  validation: {
    destination: {
      nameMaxLength: 100,
      descriptionMaxLength: 1000,
      requiredFields: ['name', 'description', 'location', 'category']
    },
    delicacy: {
      nameMaxLength: 100,
      descriptionMaxLength: 500,
      requiredFields: ['name', 'description', 'restaurant', 'price']
    },
    user: {
      nameMaxLength: 50,
      phonePattern: /^[\+]?[1-9][\d]{0,15}$/,
      requiredFields: ['name', 'email']
    }
  },

  // File Upload Settings
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    imageQuality: 0.8,
    maxImageDimension: 1920
  },

  // Categories for destinations and delicacies
  categories: {
    destinations: [
      'Historical Sites',
      'Natural Attractions',
      'Beaches',
      'Mountains',
      'Cultural Sites',
      'Adventure Parks',
      'Museums',
      'Churches',
      'Gardens',
      'Viewpoints'
    ],
    delicacies: [
      'Main Dishes',
      'Appetizers',
      'Desserts',
      'Beverages',
      'Street Food',
      'Seafood',
      'Pork Dishes',
      'Chicken Dishes',
      'Vegetarian',
      'Traditional'
    ]
  },

  // Chart Colors for Analytics
  chartColors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    tertiary: '#F59E0B',
    danger: '#EF4444',
    warning: '#F97316',
    info: '#06B6D4',
    success: '#22C55E',
    muted: '#6B7280'
  },

  // Default Admin User (for initial setup)
  defaultAdmin: {
    email: 'admin@cebutourist.com',
    password: 'admin123', // Change this in production!
    role: 'super_admin'
  }
};

// Utility functions
window.AdminConfig.utils = {
  // Format currency for Philippines
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  },

  // Format date for Philippines timezone
  formatDate: (date) => {
    return new Intl.DateTimeFormat('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Manila'
    }).format(new Date(date));
  },

  // Validate image file
  validateImageFile: (file) => {
    const config = window.AdminConfig.upload;
    
    if (!config.allowedImageTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.' };
    }
    
    if (file.size > config.maxFileSize) {
      return { valid: false, error: `File size too large. Maximum size is ${config.maxFileSize / 1024 / 1024}MB.` };
    }
    
    return { valid: true };
  },

  // Generate random ID
  generateId: () => {
    return 'admin_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  },

  // Debounce function for search
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

console.log('✅ Admin Configuration Loaded');

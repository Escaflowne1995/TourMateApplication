# Cebu Tourist App - Admin Panel

A comprehensive web-based administration panel for managing the Cebu Tourist App. This admin panel provides full CRUD operations for users, destinations, delicacies, and includes powerful analytics and reporting features.

## 🚀 Features

### 🔐 Authentication & Authorization
- Secure admin login system
- Role-based access control (Super Admin, Admin, Manager)
- Session management with automatic timeout
- Activity logging and audit trails

### 👥 User Management
- View, edit, create, and manage app users
- Advanced filtering and search capabilities
- User statistics and analytics
- Bulk operations support
- User activation/deactivation

### 🗺️ Destination Management
- Complete CRUD operations for tourist destinations
- Category management
- Image upload and management
- Featured destination controls
- Location and coordinate management
- Amenities and accessibility features

### 🍽️ Delicacies Management
- Full CRUD operations for local delicacies
- Restaurant and pricing information
- Dietary restrictions and allergen management
- Ingredient tracking
- Cultural significance documentation

### 📊 Analytics & Reporting
- Real-time dashboard with key metrics
- User activity trends
- Content engagement analytics
- Popular destinations and delicacies
- Geographic distribution of users
- Device and platform analytics
- Data export capabilities (JSON, CSV)

## 🛠️ Technology Stack

- **Frontend**: React (via CDN), Vanilla JavaScript
- **Styling**: Custom CSS with CSS Variables
- **Charts**: Chart.js
- **Icons**: Font Awesome
- **Backend**: PostgreSQL (for production)
- **Mock Data**: JavaScript objects (for demo)

## 📁 Project Structure

```
admin/
├── web-interface/           # Frontend application
│   ├── index.html          # Main entry point
│   ├── components/         # React components
│   │   ├── AdminApp.js     # Main app component
│   │   ├── AdminLogin.js   # Login interface
│   │   ├── AdminDashboard.js # Analytics dashboard
│   │   ├── UserManagement.js # User CRUD operations
│   │   ├── DestinationManagement.js # Destination CRUD
│   │   ├── DelicaciesManagement.js # Delicacies CRUD
│   │   └── *.js           # Modal and utility components
│   └── styles/
│       └── AdminApp.css    # Complete styling
├── services/               # Business logic
│   ├── adminService.js     # Core admin operations
│   ├── userManagement.js   # User CRUD services
│   ├── destinationService.js # Destination operations
│   ├── delicaciesService.js # Delicacies operations
│   └── analyticsService.js # Analytics and reporting
├── config/                 # Configuration
│   └── adminConfig.js      # Admin settings and constants
├── database/              # Database setup
│   ├── migrations/        # Database schema
│   │   └── admin-setup.sql # Complete database setup
│   └── seeds/            # Sample data
│       └── sample-data.sql # Demo data
└── README.md              # This file
```

## 🚀 Quick Start

### 1. Setup Database (Production)

```sql
-- Run the database migration
\i admin/database/migrations/admin-setup.sql

-- Insert sample data (optional)
\i admin/database/seeds/sample-data.sql
```

### 2. Start Local Server

```bash
# Navigate to web interface directory
cd admin/web-interface

# Start a simple HTTP server
python -m http.server 8080
# or
npx serve .
# or
php -S localhost:8080
```

### 3. Access Admin Panel

Open your browser and navigate to: `http://localhost:8080`

### 4. Login with Demo Credentials

**Super Admin:**
- Email: `admin@cebutourist.com`
- Password: `admin123`

**Manager:**
- Email: `manager@cebutourist.com`
- Password: `manager123`

## 📊 Dashboard Overview

The admin dashboard provides:

- **User Statistics**: Total users, active users, new registrations
- **Content Metrics**: Destinations, delicacies, reviews, favorites
- **Popular Content**: Top-rated destinations and delicacies
- **Quick Actions**: Rapid access to common operations
- **Activity Trends**: Visual charts and graphs

## 👥 User Management Features

### User Operations
- ✅ View all users with pagination
- ✅ Search and filter users
- ✅ Create new users
- ✅ Edit user profiles
- ✅ Activate/deactivate users
- ✅ Export user data

### Filtering Options
- Search by name, email, phone, address
- Filter by gender
- Filter by active/inactive status
- Date range filtering

## 🗺️ Destination Management Features

### Destination Operations
- ✅ Add new destinations
- ✅ Edit existing destinations
- ✅ Delete/restore destinations
- ✅ Featured destination management
- ✅ Category organization
- ✅ Image management

### Destination Data
- Basic information (name, description, location)
- Categorization and tagging
- Coordinates and mapping
- Entrance fees and hours
- Amenities and accessibility
- Difficulty levels and duration

## 🍽️ Delicacies Management Features

### Delicacy Operations
- ✅ Add new delicacies
- ✅ Edit existing delicacies
- ✅ Delete/restore delicacies
- ✅ Restaurant information
- ✅ Pricing management

### Delicacy Data
- Basic information (name, description, category)
- Restaurant and location details
- Pricing and price ranges
- Ingredients and allergens
- Dietary information (vegetarian, vegan, etc.)
- Cultural significance

## 📈 Analytics Features

### Available Reports
- User registration trends
- Content engagement metrics
- Popular destinations ranking
- Popular delicacies ranking
- Geographic user distribution
- Device and platform analytics

### Export Options
- JSON format
- CSV format
- Date range filtering
- Multiple data types

## 🔧 Configuration

### Admin Settings (adminConfig.js)
- API endpoints and timeouts
- Authentication settings
- Pagination options
- Feature flags
- UI preferences
- Validation rules
- File upload settings

### Categories
- Destination categories (Historical Sites, Natural Attractions, etc.)
- Delicacy categories (Main Dishes, Appetizers, etc.)
- Customizable via configuration

## 🔒 Security Features

### Authentication
- Secure login with session management
- Role-based access control
- Session timeout protection
- Password requirements

### Activity Logging
- All admin actions are logged
- IP address and user agent tracking
- Detailed action history
- Audit trail maintenance

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Secure data handling

## 🎨 UI/UX Features

### Design
- Modern, responsive design
- Mobile-friendly interface
- Professional color scheme
- Consistent typography

### User Experience
- Intuitive navigation
- Real-time feedback
- Loading states
- Error handling
- Toast notifications

## 🔄 Data Management

### Mock Data (Development)
The admin panel includes comprehensive mock data for demonstration:
- Sample users with realistic profiles
- Tourist destinations with detailed information
- Local delicacies with cultural context
- Realistic analytics data

### Production Integration
For production use:
1. Replace mock services with real API calls
2. Configure database connections
3. Implement proper authentication
4. Set up file upload handling
5. Configure email notifications

## 📱 Responsive Design

The admin panel is fully responsive and works on:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile devices (320px - 767px)

## 🔮 Future Enhancements

### Planned Features
- [ ] Advanced chart visualizations
- [ ] Email notification system
- [ ] Content moderation tools
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Advanced permissions system
- [ ] API documentation
- [ ] Automated testing

### Integration Opportunities
- Real-time notifications
- Image optimization
- Content caching
- Search engine optimization
- Social media integration

## 🤝 Contributing

To contribute to the admin panel:

1. Follow the existing code structure
2. Maintain consistent styling
3. Add proper error handling
4. Include loading states
5. Test responsiveness
6. Document new features

## 📞 Support

For support or questions about the admin panel:
- Review the code documentation
- Check the configuration files
- Test with sample data
- Verify database setup

## 📄 License

This admin panel is part of the Cebu Tourist App project and follows the same licensing terms.

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Compatibility**: Modern web browsers (Chrome 80+, Firefox 75+, Safari 13+)

/**
 * Analytics Service
 * Handles dashboard analytics and reporting
 */

window.AnalyticsService = (function() {
  'use strict';

  // Helper function to validate admin access
  const requireAdminAccess = () => {
    if (!window.AdminService.isLoggedIn()) {
      throw new Error('Authentication required');
    }
    if (!window.AdminService.hasRole('admin')) {
      throw new Error('Admin access required');
    }
  };

  // Helper function to generate date range
  const generateDateRange = (days) => {
    const dates = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  // Helper function to generate mock analytics data
  const generateMockData = (length, min = 0, max = 100) => {
    return Array.from({ length }, () => 
      Math.floor(Math.random() * (max - min + 1)) + min
    );
  };

  // Public API
  return {
    // Get overall dashboard statistics
    async getDashboardStats() {
      try {
        requireAdminAccess();

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Get data from other services
        const [userStats, destinationStats, delicacyStats] = await Promise.all([
          window.UserManagementService.getUserStatistics(),
          window.DestinationService.getDestinationStatistics(),
          window.DelicaciesService.getDelicacyStatistics()
        ]);

        const stats = {
          overview: {
            total_users: userStats.success ? userStats.data.total_users : 0,
            active_users: userStats.success ? userStats.data.active_users : 0,
            total_destinations: destinationStats.success ? destinationStats.data.total_destinations : 0,
            active_destinations: destinationStats.success ? destinationStats.data.active_destinations : 0,
            total_delicacies: delicacyStats.success ? delicacyStats.data.total_delicacies : 0,
            active_delicacies: delicacyStats.success ? delicacyStats.data.active_delicacies : 0,
            new_users_last_30_days: userStats.success ? userStats.data.new_users_last_30_days : 0,
            active_users_last_7_days: userStats.success ? userStats.data.active_users_last_7_days : 0
          },
          users: userStats.success ? userStats.data : {},
          destinations: destinationStats.success ? destinationStats.data : {},
          delicacies: delicacyStats.success ? delicacyStats.data : {}
        };

        window.AdminService.logActivity('view_dashboard_stats');
        return { success: true, data: stats };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Get user activity trends
    async getUserActivityTrends(days = 30) {
      try {
        requireAdminAccess();

        await new Promise(resolve => setTimeout(resolve, 200));

        const dates = generateDateRange(days);
        const registrations = generateMockData(days, 0, 15);
        const logins = generateMockData(days, 10, 50);
        const activeUsers = generateMockData(days, 20, 80);

        const trends = {
          dates,
          metrics: {
            new_registrations: registrations,
            daily_logins: logins,
            active_users: activeUsers
          },
          totals: {
            total_registrations: registrations.reduce((a, b) => a + b, 0),
            total_logins: logins.reduce((a, b) => a + b, 0),
            avg_active_users: Math.round(activeUsers.reduce((a, b) => a + b, 0) / activeUsers.length)
          }
        };

        return { success: true, data: trends };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Get content engagement analytics
    async getContentEngagement(days = 30) {
      try {
        requireAdminAccess();

        await new Promise(resolve => setTimeout(resolve, 200));

        const dates = generateDateRange(days);
        const destinationViews = generateMockData(days, 50, 200);
        const delicacyViews = generateMockData(days, 30, 150);
        const reviews = generateMockData(days, 5, 25);
        const favorites = generateMockData(days, 10, 40);

        const engagement = {
          dates,
          metrics: {
            destination_views: destinationViews,
            delicacy_views: delicacyViews,
            new_reviews: reviews,
            new_favorites: favorites
          },
          totals: {
            total_destination_views: destinationViews.reduce((a, b) => a + b, 0),
            total_delicacy_views: delicacyViews.reduce((a, b) => a + b, 0),
            total_reviews: reviews.reduce((a, b) => a + b, 0),
            total_favorites: favorites.reduce((a, b) => a + b, 0)
          }
        };

        return { success: true, data: engagement };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Get popular destinations
    async getPopularDestinations(limit = 10) {
      try {
        requireAdminAccess();

        const destinationsResult = await window.DestinationService.getAllDestinations(
          { isActive: true },
          { page: 1, limit: 100 }
        );

        if (!destinationsResult.success) {
          throw new Error('Failed to fetch destinations');
        }

        // Sort by rating and review count
        const popular = destinationsResult.data
          .sort((a, b) => {
            // Primary sort by rating
            if (b.rating !== a.rating) {
              return b.rating - a.rating;
            }
            // Secondary sort by review count
            return b.review_count - a.review_count;
          })
          .slice(0, limit)
          .map(dest => ({
            id: dest.id,
            name: dest.name,
            category: dest.category,
            location: dest.location,
            rating: dest.rating,
            review_count: dest.review_count,
            views: Math.floor(Math.random() * 1000) + 100, // Mock view count
            favorites: Math.floor(Math.random() * 200) + 20 // Mock favorite count
          }));

        return { success: true, data: popular };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Get popular delicacies
    async getPopularDelicacies(limit = 10) {
      try {
        requireAdminAccess();

        const delicaciesResult = await window.DelicaciesService.getAllDelicacies(
          { isActive: true },
          { page: 1, limit: 100 }
        );

        if (!delicaciesResult.success) {
          throw new Error('Failed to fetch delicacies');
        }

        // Sort by rating and review count
        const popular = delicaciesResult.data
          .sort((a, b) => {
            // Primary sort by rating
            if (b.rating !== a.rating) {
              return b.rating - a.rating;
            }
            // Secondary sort by review count
            return b.review_count - a.review_count;
          })
          .slice(0, limit)
          .map(delicacy => ({
            id: delicacy.id,
            name: delicacy.name,
            category: delicacy.category,
            restaurant: delicacy.restaurant,
            rating: delicacy.rating,
            review_count: delicacy.review_count,
            orders: Math.floor(Math.random() * 500) + 50, // Mock order count
            favorites: Math.floor(Math.random() * 150) + 15 // Mock favorite count
          }));

        return { success: true, data: popular };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Get geographic distribution of users
    async getGeographicDistribution() {
      try {
        requireAdminAccess();

        await new Promise(resolve => setTimeout(resolve, 200));

        // Mock geographic data for Cebu areas
        const distribution = [
          { location: 'Cebu City', users: 245, percentage: 35.2 },
          { location: 'Mandaue City', users: 156, percentage: 22.4 },
          { location: 'Lapu-Lapu City', users: 98, percentage: 14.1 },
          { location: 'Talisay City', users: 76, percentage: 10.9 },
          { location: 'Toledo City', users: 45, percentage: 6.5 },
          { location: 'Danao City', users: 34, percentage: 4.9 },
          { location: 'Carcar City', users: 28, percentage: 4.0 },
          { location: 'Others', users: 16, percentage: 2.0 }
        ];

        return { success: true, data: distribution };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Get device and platform analytics
    async getDeviceAnalytics() {
      try {
        requireAdminAccess();

        await new Promise(resolve => setTimeout(resolve, 200));

        const analytics = {
          devices: [
            { type: 'Mobile', users: 420, percentage: 78.5 },
            { type: 'Tablet', users: 78, percentage: 14.6 },
            { type: 'Desktop', users: 37, percentage: 6.9 }
          ],
          platforms: [
            { platform: 'Android', users: 312, percentage: 58.3 },
            { platform: 'iOS', users: 186, percentage: 34.8 },
            { platform: 'Web', users: 37, percentage: 6.9 }
          ],
          browsers: [
            { browser: 'Chrome Mobile', users: 245, percentage: 45.8 },
            { browser: 'Safari Mobile', users: 167, percentage: 31.2 },
            { browser: 'Samsung Internet', users: 67, percentage: 12.5 },
            { browser: 'Firefox Mobile', users: 34, percentage: 6.4 },
            { browser: 'Others', users: 22, percentage: 4.1 }
          ]
        };

        return { success: true, data: analytics };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Get revenue analytics (if applicable)
    async getRevenueAnalytics(days = 30) {
      try {
        requireAdminAccess();

        await new Promise(resolve => setTimeout(resolve, 200));

        const dates = generateDateRange(days);
        const premiumSubscriptions = generateMockData(days, 0, 5);
        const adRevenue = generateMockData(days, 50, 300);
        const partnerCommissions = generateMockData(days, 100, 500);

        const revenue = {
          dates,
          metrics: {
            premium_subscriptions: premiumSubscriptions,
            ad_revenue: adRevenue,
            partner_commissions: partnerCommissions
          },
          totals: {
            total_premium: premiumSubscriptions.reduce((a, b) => a + b, 0) * 99, // PHP 99 per subscription
            total_ads: adRevenue.reduce((a, b) => a + b, 0),
            total_commissions: partnerCommissions.reduce((a, b) => a + b, 0),
            total_revenue: function() {
              return this.total_premium + this.total_ads + this.total_commissions;
            }()
          }
        };

        return { success: true, data: revenue };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Export analytics data
    async exportData(type, format = 'json', dateRange = null) {
      try {
        requireAdminAccess();

        let data;
        let filename;

        switch (type) {
          case 'users':
            const userResult = await window.UserManagementService.getAllUsers({}, { page: 1, limit: 1000 });
            data = userResult.data;
            filename = `users_export_${new Date().toISOString().split('T')[0]}`;
            break;

          case 'destinations':
            const destResult = await window.DestinationService.getAllDestinations({}, { page: 1, limit: 1000 });
            data = destResult.data;
            filename = `destinations_export_${new Date().toISOString().split('T')[0]}`;
            break;

          case 'delicacies':
            const delicacyResult = await window.DelicaciesService.getAllDelicacies({}, { page: 1, limit: 1000 });
            data = delicacyResult.data;
            filename = `delicacies_export_${new Date().toISOString().split('T')[0]}`;
            break;

          case 'analytics':
            const statsResult = await this.getDashboardStats();
            data = statsResult.data;
            filename = `analytics_export_${new Date().toISOString().split('T')[0]}`;
            break;

          default:
            throw new Error('Invalid export type');
        }

        // Create downloadable file
        let content;
        let mimeType;

        if (format === 'csv') {
          content = this.convertToCSV(data);
          mimeType = 'text/csv';
          filename += '.csv';
        } else {
          content = JSON.stringify(data, null, 2);
          mimeType = 'application/json';
          filename += '.json';
        }

        // Create download link
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        window.AdminService.logActivity('export_data', { type, format, filename });
        window.AdminService.showToast('Data exported successfully', 'success');

        return { success: true, filename };
      } catch (error) {
        window.AdminService.showToast(error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    // Helper function to convert JSON to CSV
    convertToCSV(data) {
      if (!Array.isArray(data) || data.length === 0) {
        return '';
      }

      const headers = Object.keys(data[0]);
      const csvHeaders = headers.join(',');
      
      const csvRows = data.map(row => {
        return headers.map(header => {
          const value = row[header];
          // Handle nested objects and arrays
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          // Escape commas and quotes in strings
          if (typeof value === 'string') {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',');
      });

      return [csvHeaders, ...csvRows].join('\n');
    }
  };
})();

console.log('✅ Analytics Service Loaded');

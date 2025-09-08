/**
 * Admin Dashboard Component
 * Displays analytics, statistics, and overview information
 */

const { useState, useEffect } = React;

const AdminDashboard = ({ currentAdmin }) => {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [popularDelicacies, setPopularDelicacies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      try {
        const [statsResult, trendsResult, destResult, delicacyResult] = await Promise.all([
          window.AnalyticsService.getDashboardStats(),
          window.AnalyticsService.getUserActivityTrends(30),
          window.AnalyticsService.getPopularDestinations(5),
          window.AnalyticsService.getPopularDelicacies(5)
        ]);

        if (statsResult.success) setStats(statsResult.data);
        if (trendsResult.success) setTrends(trendsResult.data);
        if (destResult.success) setPopularDestinations(destResult.data);
        if (delicacyResult.success) setPopularDelicacies(delicacyResult.data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        window.AdminService.showToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Loading Dashboard...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Welcome back, {currentAdmin.name}!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Here's what's happening with your tourist app today.
        </p>
      </div>

      {/* Statistics Grid */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon primary">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.overview.total_users}</h3>
              <p>Total Users</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon secondary">
              <i className="fas fa-user-check"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.overview.active_users}</h3>
              <p>Active Users</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.overview.total_destinations}</h3>
              <p>Destinations</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon danger">
              <i className="fas fa-utensils"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.overview.total_delicacies}</h3>
              <p>Delicacies</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts and Lists */}
      <div className="dashboard-grid">
        {/* Popular Destinations */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-star"></i>
              Popular Destinations
            </h3>
          </div>
          <div className="card-body">
            {popularDestinations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {popularDestinations.map((dest, index) => (
                  <div key={dest.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {index + 1}. {dest.name}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {dest.location} • {dest.category}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                        ⭐ {dest.rating}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {dest.review_count} reviews
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <i className="fas fa-map-marker-alt"></i>
                <p>No destinations found</p>
              </div>
            )}
          </div>
        </div>

        {/* Popular Delicacies */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-utensils"></i>
              Popular Delicacies
            </h3>
          </div>
          <div className="card-body">
            {popularDelicacies.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {popularDelicacies.map((delicacy, index) => (
                  <div key={delicacy.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {index + 1}. {delicacy.name}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {delicacy.restaurant} • {delicacy.category}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                        ⭐ {delicacy.rating}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {delicacy.review_count} reviews
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <i className="fas fa-utensils"></i>
                <p>No delicacies found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-bolt"></i>
            Quick Actions
          </h3>
        </div>
        <div className="card-body">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem' 
          }}>
            <button className="btn btn-primary" style={{ padding: '1rem' }}>
              <i className="fas fa-plus"></i>
              Add Destination
            </button>
            <button className="btn btn-secondary" style={{ padding: '1rem' }}>
              <i className="fas fa-utensils"></i>
              Add Delicacy
            </button>
            <button className="btn btn-success" style={{ padding: '1rem' }}>
              <i className="fas fa-download"></i>
              Export Data
            </button>
            <button className="btn btn-warning" style={{ padding: '1rem' }}>
              <i className="fas fa-chart-bar"></i>
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export for use in other files
window.AdminDashboard = AdminDashboard;

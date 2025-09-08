/**
 * Main Admin Application Component
 * Handles routing, authentication, and overall app state
 */

const { useState, useEffect } = React;

const AdminApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      
      // Try to restore session
      const sessionRestored = window.AdminService.restoreSession();
      
      if (sessionRestored) {
        const admin = window.AdminService.getCurrentAdmin();
        setCurrentAdmin(admin);
        setIsLoggedIn(true);
      }
      
      setLoading(false);
    };

    initializeApp();
  }, []);

  // Handle login
  const handleLogin = async (credentials) => {
    const result = await window.AdminService.login(credentials.email, credentials.password);
    
    if (result.success) {
      setCurrentAdmin(result.admin);
      setIsLoggedIn(true);
      setCurrentView('dashboard');
    }
    
    return result;
  };

  // Handle logout
  const handleLogout = () => {
    window.AdminService.logout();
    setCurrentAdmin(null);
    setIsLoggedIn(false);
    setCurrentView('dashboard');
  };

  // Handle view change
  const handleViewChange = (view) => {
    setCurrentView(view);
    window.AdminService.logActivity('navigate', { view });
  };

  // Loading screen
  if (loading) {
    return (
      <div className="admin-app">
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading Admin Panel...</span>
        </div>
      </div>
    );
  }

  // Login screen
  if (!isLoggedIn) {
    return React.createElement(AdminLogin, { onLogin: handleLogin });
  }

  // Main admin interface
  return (
    <div className="admin-app">
      <AdminHeader 
        currentAdmin={currentAdmin}
        currentView={currentView}
        onViewChange={handleViewChange}
        onLogout={handleLogout}
      />
      
      <main className="admin-main">
        <AdminContent 
          currentView={currentView}
          currentAdmin={currentAdmin}
        />
      </main>
    </div>
  );
};

// Admin Header Component
const AdminHeader = ({ currentAdmin, currentView, onViewChange, onLogout }) => {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
    { key: 'users', label: 'Users', icon: 'fa-users' },
    { key: 'destinations', label: 'Destinations', icon: 'fa-map-marker-alt' },
    { key: 'delicacies', label: 'Delicacies', icon: 'fa-utensils' },
  ];

  return (
    <header className="admin-header">
      <div className="admin-logo">
        <i className="fas fa-crown"></i>
        <span>Cebu Tourist Admin</span>
      </div>
      
      <nav className="admin-nav">
        <div className="nav-tabs">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`nav-tab ${currentView === item.key ? 'active' : ''}`}
              onClick={() => onViewChange(item.key)}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        
        <div className="admin-user">
          <div className="user-info">
            <div className="user-name">{currentAdmin.name}</div>
            <div className="user-role">{currentAdmin.role}</div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
};

// Admin Content Router
const AdminContent = ({ currentView, currentAdmin }) => {
  switch (currentView) {
    case 'dashboard':
      return React.createElement(AdminDashboard, { currentAdmin });
    case 'users':
      return React.createElement(UserManagement, { currentAdmin });
    case 'destinations':
      return React.createElement(DestinationManagement, { currentAdmin });
    case 'delicacies':
      return React.createElement(DelicaciesManagement, { currentAdmin });
    default:
      return (
        <div className="empty-state">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Page Not Found</h3>
          <p>The requested page could not be found.</p>
        </div>
      );
  }
};

// Export for use in other files
window.AdminApp = AdminApp;

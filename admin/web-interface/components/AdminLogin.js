/**
 * Admin Login Component
 * Handles authentication for admin users
 */

const { useState } = React;

const AdminLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await onLogin(formData);
      
      if (!result.success) {
        setErrors({ general: result.error || 'Login failed' });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle demo login
  const handleDemoLogin = async (role = 'admin') => {
    const demoCredentials = {
      admin: { email: 'admin@cebutourist.com', password: 'admin123' },
      manager: { email: 'manager@cebutourist.com', password: 'manager123' }
    };
    
    const credentials = demoCredentials[role];
    setFormData(credentials);
    
    // Auto-submit after a short delay
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 500);
  };

  return (
    <div className="modern-login-container">
      <div className="login-background">
        <div className="login-pattern"></div>
      </div>
      
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <i className="fas fa-shield-alt"></i>
              <span>TourMate</span>
            </div>
            <h1 className="login-title">Admin Portal</h1>
            <p className="login-subtitle">Sign in to access the administration panel</p>
          </div>
          
          <form className="login-form" onSubmit={handleSubmit}>

            {errors.general && (
              <div className="alert alert-danger modern-alert">
                <i className="fas fa-exclamation-circle"></i>
                {errors.general}
              </div>
            )}

              <div className="input-group">
                <label className="form-label modern-label" htmlFor="email">
                  Email Address
                </label>
                <div className="input-wrapper">
                  <i className="fas fa-envelope input-icon"></i>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`modern-input ${errors.email ? 'error' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@cebutourist.com"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <div className="error-message">{errors.email}</div>
                )}
              </div>

              <div className="input-group">
                <label className="form-label modern-label" htmlFor="password">
                  Password
                </label>
                <div className="input-wrapper">
                  <i className="fas fa-lock input-icon"></i>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className={`modern-input ${errors.password ? 'error' : ''}`}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                </div>
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
              </div>

              <button 
                type="submit" 
                className="modern-login-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i>
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Demo Access Section */}
            <div className="demo-section">
              <div className="demo-divider">
                <span>Quick Demo Access</span>
              </div>
              
              <div className="demo-buttons">
                <button
                  type="button"
                  className="demo-btn admin-demo"
                  onClick={() => handleDemoLogin('admin')}
                  disabled={loading}
                >
                  <i className="fas fa-user-shield"></i>
                  <span>Super Admin</span>
                </button>
                
                <button
                  type="button"
                  className="demo-btn manager-demo"
                  onClick={() => handleDemoLogin('manager')}
                  disabled={loading}
                >
                  <i className="fas fa-user-tie"></i>
                  <span>Manager</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

// Export for use in other files
window.AdminLogin = AdminLogin;

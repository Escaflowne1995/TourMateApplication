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
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-title">
          <i className="fas fa-crown" style={{ color: 'var(--primary-color)', marginRight: '0.5rem' }}></i>
          Admin Login
        </div>
        
        <div className="login-subtitle">
          Access the Cebu Tourist App administration panel
        </div>

        {errors.general && (
          <div className="alert alert-danger" style={{ 
            padding: '0.75rem 1rem', 
            backgroundColor: '#FEE2E2', 
            color: '#991B1B', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            <i className="fas fa-exclamation-circle" style={{ marginRight: '0.5rem' }}></i>
            {errors.general}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            disabled={loading}
            style={errors.email ? { borderColor: 'var(--danger-color)' } : {}}
          />
          {errors.email && (
            <div style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.email}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className={`form-input ${errors.password ? 'error' : ''}`}
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            disabled={loading}
            style={errors.password ? { borderColor: 'var(--danger-color)' } : {}}
          />
          {errors.password && (
            <div style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.password}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ width: '100%', marginBottom: '1rem' }}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: '1rem', height: '1rem', margin: 0 }}></div>
              Signing In...
            </>
          ) : (
            <>
              <i className="fas fa-sign-in-alt"></i>
              Sign In
            </>
          )}
        </button>

        {/* Demo Login Buttons */}
        <div style={{ 
          borderTop: '1px solid var(--border-color)', 
          paddingTop: '1rem', 
          marginTop: '1rem' 
        }}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '1rem', 
            fontSize: '0.875rem', 
            color: 'var(--text-secondary)' 
          }}>
            Demo Access
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
            >
              <i className="fas fa-user-shield"></i>
              Super Admin
            </button>
            
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleDemoLogin('manager')}
              disabled={loading}
            >
              <i className="fas fa-user-tie"></i>
              Manager
            </button>
          </div>
          
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)', 
            textAlign: 'center', 
            marginTop: '0.5rem' 
          }}>
            Click above for quick demo access
          </div>
        </div>

        {/* Credentials Help */}
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          backgroundColor: 'var(--bg-secondary)', 
          borderRadius: 'var(--radius-md)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Default Credentials:</div>
          <div><strong>Super Admin:</strong> admin@cebutourist.com / admin123</div>
          <div><strong>Manager:</strong> manager@cebutourist.com / manager123</div>
        </div>
      </form>
    </div>
  );
};

// Export for use in other files
window.AdminLogin = AdminLogin;

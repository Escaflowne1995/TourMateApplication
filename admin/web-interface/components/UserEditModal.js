/**
 * User Edit Modal Component
 * Modal for viewing, adding, and editing user information
 */

const { useState, useEffect } = React;

const UserEditModal = ({ user, mode = 'edit', isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    full_name: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    location: '',
    country: 'Philippines',
    zip_code: '',
    birth_date: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize form data when user changes
  useEffect(() => {
    if (user && mode !== 'add') {
      setFormData({
        name: user.name || '',
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || '',
        location: user.location || '',
        country: user.country || 'Philippines',
        zip_code: user.zip_code || '',
        birth_date: user.birth_date || '',
        is_active: user.is_active !== undefined ? user.is_active : true
      });
    } else if (mode === 'add') {
      setFormData({
        name: '',
        full_name: '',
        email: '',
        phone: '',
        address: '',
        gender: '',
        location: '',
        country: 'Philippines',
        zip_code: '',
        birth_date: '',
        is_active: true
      });
    }
    setErrors({});
  }, [user, mode]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.birth_date) {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birth_date = 'Birth date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'add': return 'Add New User';
      case 'edit': return 'Edit User';
      case 'view': return 'User Details';
      default: return 'User Information';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3 className="modal-title">
            <i className={`fas ${mode === 'add' ? 'fa-user-plus' : mode === 'edit' ? 'fa-user-edit' : 'fa-user'}`}></i>
            {getModalTitle()}
          </h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            {/* Basic Information */}
            <div className="form-section">
              <h4 className="form-section-title">Basic Information</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="Enter user's name"
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="Enter email address"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="+63 912 345 6789"
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    disabled={mode === 'view'}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Birth Date</label>
                  <input
                    type="date"
                    className={`form-input ${errors.birth_date ? 'error' : ''}`}
                    value={formData.birth_date}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                    disabled={mode === 'view'}
                  />
                  {errors.birth_date && <span className="error-message">{errors.birth_date}</span>}
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="form-section">
              <h4 className="form-section-title">Location Information</h4>
              
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={mode === 'view'}
                  placeholder="Enter complete address"
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City/Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="Enter city or location"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <select
                    className="form-select"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    disabled={mode === 'view'}
                  >
                    <option value="Philippines">Philippines</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Japan">Japan</option>
                    <option value="South Korea">South Korea</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">ZIP Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.zip_code}
                    onChange={(e) => handleInputChange('zip_code', e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="Enter ZIP code"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.value === 'true')}
                    disabled={mode === 'view'}
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* User Statistics (View Mode Only) */}
            {mode === 'view' && user && (
              <div className="form-section">
                <h4 className="form-section-title">User Statistics</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Member Since:</span>
                    <span className="stat-value">
                      {window.AdminConfig.utils.formatDate(user.registration_date)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Last Login:</span>
                    <span className="stat-value">
                      {user.last_login ? window.AdminConfig.utils.formatDate(user.last_login) : 'Never'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Reviews:</span>
                    <span className="stat-value">{user.total_reviews || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Favorite Spots:</span>
                    <span className="stat-value">{user.favorite_spots?.length || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            {mode === 'view' ? 'Close' : 'Cancel'}
          </button>
          {mode !== 'view' && (
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  {mode === 'add' ? 'Create User' : 'Save Changes'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

window.UserEditModal = UserEditModal;

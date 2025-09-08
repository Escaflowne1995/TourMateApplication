/**
 * Destination Modal Component
 * Modal for adding/editing destinations
 */

const { useState, useEffect } = React;

const DestinationModal = ({ destination, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    category: '',
    entrance_fee: '',
    opening_hours: '',
    contact_number: '',
    website: '',
    difficulty_level: 'Easy',
    best_time_to_visit: '',
    estimated_duration: '',
    is_active: true,
    featured: false
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (destination) {
      setFormData({
        name: destination.name || '',
        description: destination.description || '',
        location: destination.location || '',
        category: destination.category || '',
        entrance_fee: destination.entrance_fee || '',
        opening_hours: destination.opening_hours || '',
        contact_number: destination.contact_number || '',
        website: destination.website || '',
        difficulty_level: destination.difficulty_level || 'Easy',
        best_time_to_visit: destination.best_time_to_visit || '',
        estimated_duration: destination.estimated_duration || '',
        is_active: destination.is_active !== undefined ? destination.is_active : true,
        featured: destination.featured !== undefined ? destination.featured : false
      });
    } else {
      setFormData({
        name: '',
        description: '',
        location: '',
        category: '',
        entrance_fee: '',
        opening_hours: '',
        contact_number: '',
        website: '',
        difficulty_level: 'Easy',
        best_time_to_visit: '',
        estimated_duration: '',
        is_active: true,
        featured: false
      });
    }
    setErrors({});
  }, [destination, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving destination:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  const categories = [
    'Beach', 'Mountain', 'Historical', 'Cultural', 'Adventure', 
    'Nature', 'Religious', 'Entertainment', 'Food & Dining', 'Shopping'
  ];

  const difficultyLevels = ['Easy', 'Moderate', 'Challenging', 'Extreme'];

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3 className="modal-title">
            {destination ? 'Edit Destination' : 'Add Destination'}
          </h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="form-grid" style={{ display: 'grid', gap: '1rem' }}>
              {/* Name */}
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter destination name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className={`form-input ${errors.category ? 'error' : ''}`}
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <span className="error-text">{errors.category}</span>}
              </div>

              {/* Location */}
              <div className="form-group">
                <label className="form-label">Location *</label>
                <input
                  type="text"
                  className={`form-input ${errors.location ? 'error' : ''}`}
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter location"
                />
                {errors.location && <span className="error-text">{errors.location}</span>}
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className={`form-input ${errors.description ? 'error' : ''}`}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter description"
                  rows="4"
                ></textarea>
                {errors.description && <span className="error-text">{errors.description}</span>}
              </div>

              {/* Entrance Fee */}
              <div className="form-group">
                <label className="form-label">Entrance Fee</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.entrance_fee}
                  onChange={(e) => handleInputChange('entrance_fee', e.target.value)}
                  placeholder="e.g., ₱50, Free"
                />
              </div>

              {/* Opening Hours */}
              <div className="form-group">
                <label className="form-label">Opening Hours</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.opening_hours}
                  onChange={(e) => handleInputChange('opening_hours', e.target.value)}
                  placeholder="e.g., 8:00 AM - 5:00 PM"
                />
              </div>

              {/* Contact Number */}
              <div className="form-group">
                <label className="form-label">Contact Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.contact_number}
                  onChange={(e) => handleInputChange('contact_number', e.target.value)}
                  placeholder="e.g., +63 123 456 7890"
                />
              </div>

              {/* Website */}
              <div className="form-group">
                <label className="form-label">Website</label>
                <input
                  type="url"
                  className="form-input"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              {/* Difficulty Level */}
              <div className="form-group">
                <label className="form-label">Difficulty Level</label>
                <select
                  className="form-input"
                  value={formData.difficulty_level}
                  onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
                >
                  {difficultyLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Best Time to Visit */}
              <div className="form-group">
                <label className="form-label">Best Time to Visit</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.best_time_to_visit}
                  onChange={(e) => handleInputChange('best_time_to_visit', e.target.value)}
                  placeholder="e.g., December to February"
                />
              </div>

              {/* Estimated Duration */}
              <div className="form-group">
                <label className="form-label">Estimated Duration</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.estimated_duration}
                  onChange={(e) => handleInputChange('estimated_duration', e.target.value)}
                  placeholder="e.g., 2-3 hours, Half day"
                />
              </div>

              {/* Checkboxes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    />
                    <span>Active</span>
                  </label>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => handleInputChange('featured', e.target.checked)}
                    />
                    <span>Featured</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  {destination ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {destination ? 'Update' : 'Create'} Destination
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

window.DestinationModal = DestinationModal;

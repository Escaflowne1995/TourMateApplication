/**
 * User Management Component
 * Handles CRUD operations for app users
 */

const { useState, useEffect } = React;

const UserManagement = ({ currentAdmin }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    gender: 'all',
    isActive: undefined
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Load users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await window.UserManagementService.getAllUsers(filters, pagination);
      if (result.success) {
        setUsers(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filters, pagination.page]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle user actions
  const handleAddUser = () => {
    setSelectedUser(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleRestoreUser = async (user) => {
    try {
      const result = await window.UserManagementService.activateUser(user.id);
      if (result.success) {
        loadUsers();
        window.AdminService.showToast('User restored successfully!', 'success');
      }
    } catch (error) {
      window.AdminService.showToast('Failed to restore user', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      const result = await window.UserManagementService.deleteUser(userToDelete.id);
      if (result.success) {
        loadUsers();
        setShowDeleteModal(false);
        setUserToDelete(null);
        window.AdminService.showToast('User deactivated successfully!', 'success');
      }
    } catch (error) {
      window.AdminService.showToast('Failed to deactivate user', 'error');
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      let result;
      if (modalMode === 'add') {
        result = await window.UserManagementService.createUser(userData);
      } else if (modalMode === 'edit') {
        result = await window.UserManagementService.updateUser(selectedUser.id, userData);
      }
      
      if (result && result.success) {
        loadUsers();
        setShowModal(false);
        setSelectedUser(null);
        window.AdminService.showToast(
          modalMode === 'add' ? 'User created successfully!' : 'User updated successfully!', 
          'success'
        );
      }
    } catch (error) {
      window.AdminService.showToast('Failed to save user', 'error');
    }
  };

  const handleExportUsers = async () => {
    try {
      const result = await window.UserManagementService.exportUsers('csv');
      if (result.success) {
        // Create download link
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        window.AdminService.showToast('Users exported successfully!', 'success');
      }
    } catch (error) {
      window.AdminService.showToast('Failed to export users', 'error');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Loading Users...</span>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>
        User Management
      </h1>

      {/* Filters */}
      <div className="filters">
        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">Search Users</label>
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search by name, email, phone..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select
              className="form-select"
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={filters.isActive === undefined ? 'all' : filters.isActive}
              onChange={(e) => {
                const value = e.target.value;
                handleFilterChange('isActive', value === 'all' ? undefined : value === 'true');
              }}
            >
              <option value="all">All Users</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">Users ({pagination.total})</h3>
          <div className="table-actions">
            <button className="btn btn-primary" onClick={handleAddUser}>
              <i className="fas fa-plus"></i>
              Add User
            </button>
            <button className="btn btn-secondary" onClick={handleExportUsers}>
              <i className="fas fa-download"></i>
              Export
            </button>
          </div>
        </div>
        
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Status</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div>
                    <div style={{ fontWeight: '600' }}>{user.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'N/A'}
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.phone || 'N/A'}</td>
                <td>{user.location || 'N/A'}</td>
                <td>
                  <span className={`badge ${user.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{window.AdminConfig.utils.formatDate(user.registration_date)}</td>
                <td>
                  <div className="table-actions-cell">
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleViewUser(user)}
                      title="View User"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => handleEditUser(user)}
                      title="Edit User"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    {user.is_active ? (
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteUser(user)}
                        title="Deactivate User"
                      >
                        <i className="fas fa-user-slash"></i>
                      </button>
                    ) : (
                      <button 
                        className="btn btn-sm btn-success"
                        onClick={() => handleRestoreUser(user)}
                        title="Restore User"
                      >
                        <i className="fas fa-user-check"></i>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button 
              className="pagination-btn"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </button>
            
            <span className="pagination-info">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <button 
              className="pagination-btn"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showModal && (
        <window.UserEditModal
          user={selectedUser}
          mode={modalMode}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedUser(null);
          }}
          onSave={handleSaveUser}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Confirm Deactivation</h3>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: 'var(--color-warning)', marginBottom: '1rem' }}></i>
                <h4>Are you sure you want to deactivate this user?</h4>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  User: <strong>{userToDelete?.name}</strong> ({userToDelete?.email})
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  This action will deactivate the user but won't permanently delete their data. 
                  You can restore them later if needed.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={confirmDelete}
              >
                <i className="fas fa-user-slash"></i>
                Deactivate User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

window.UserManagement = UserManagement;

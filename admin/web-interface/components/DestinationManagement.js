/**
 * Destination Management Component
 * Handles CRUD operations for tourist destinations
 */

const { useState, useEffect } = React;

const DestinationManagement = ({ currentAdmin }) => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading destinations...');
      console.log('🔍 DestinationService available:', !!window.DestinationService);
      console.log('🔍 Admin logged in:', window.AdminService?.isLoggedIn());
      
      // Test direct database access first to identify RLS issues
      if (window.supabase) {
        console.log('🔍 Testing direct database access...');
        const { data: testData, error: testError } = await window.supabase
          .from('destinations')
          .select('id')
          .limit(1);
        
        console.log('🔍 Direct access result:', { testData, testError });
        
        if (testError) {
          console.error('❌ Direct database access failed:', testError);
          
          if (testError.message.includes('policy') || testError.message.includes('RLS') || testError.message.includes('insufficient privilege')) {
            throw new Error(`RLS (Row Level Security) is blocking access to destinations table.

To fix this, run this SQL command in your Supabase dashboard:
ALTER TABLE destinations DISABLE ROW LEVEL SECURITY;

Technical details: ${testError.message}`);
          }
        }
      }

      if (!window.DestinationService) {
        throw new Error('DestinationService is not loaded. Check the console for script loading errors.');
      }

      console.log('🔍 Calling DestinationService.getAllDestinations...');
      const result = await window.DestinationService.getAllDestinations();
      console.log('🔍 Service result:', result);
      
      if (result.success) {
        setDestinations(result.data || []);
        console.log('✅ Destinations loaded successfully:', (result.data || []).length, 'items');
      } else {
        throw new Error(result.error || 'Failed to load destinations - unknown error');
      }
    } catch (error) {
      console.error('❌ Error loading destinations:', error);
      setError(error.message);
      if (window.AdminService?.showToast) {
        window.AdminService.showToast(`Failed to load destinations: ${error.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddDestination = () => {
    setSelectedDestination(null);
    setShowModal(true);
  };

  const handleEditDestination = (destination) => {
    setSelectedDestination(destination);
    setShowModal(true);
  };

  const handleDeleteDestination = async (destinationId) => {
    if (!confirm('⚠️ PERMANENT DELETE: Are you sure you want to permanently delete this destination?\n\nThis action CANNOT be undone and will:\n• Remove the destination completely from the database\n• Remove it from the mobile app immediately\n• Delete all associated data\n\nClick OK to permanently delete, or Cancel to abort.')) {
      return;
    }

    try {
      const result = await window.DestinationService.deleteDestination(destinationId);
      if (result.success) {
        await loadDestinations(); // Reload destinations
        
        // Show real-time sync notification
        if (window.AdminService?.showToast) {
          window.AdminService.showToast(
            '✅ Destination permanently deleted! Changes synced to mobile app in real-time.', 
            'success'
          );
        }
      }
    } catch (error) {
      console.error('Error deleting destination:', error);
    }
  };

  const handleSaveDestination = async (destinationData) => {
    try {
      let result;
      if (selectedDestination) {
        result = await window.DestinationService.updateDestination(selectedDestination.id, destinationData);
      } else {
        result = await window.DestinationService.createDestination(destinationData);
      }

      if (result.success) {
        setShowModal(false);
        setSelectedDestination(null);
        await loadDestinations(); // Reload destinations
      }
    } catch (error) {
      console.error('Error saving destination:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Loading Destinations...</span>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>
        Destination Management
      </h1>

      {error && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="card-header" style={{ backgroundColor: '#fee2e2', borderColor: '#f87171' }}>
            <h3 className="card-title" style={{ color: '#dc2626' }}>
              <i className="fas fa-exclamation-triangle"></i>
              Error Loading Destinations
            </h3>
            <button className="btn btn-primary" onClick={loadDestinations}>
              <i className="fas fa-refresh"></i>
              Retry
            </button>
          </div>
          <div className="card-body">
            <pre style={{ 
              background: '#fef2f2', 
              padding: '1rem', 
              borderRadius: '4px', 
              fontSize: '0.875rem', 
              color: '#dc2626',
              whiteSpace: 'pre-wrap',
              margin: 0
            }}>
              {error}
            </pre>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Destinations ({destinations.length})</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={loadDestinations}>
              <i className="fas fa-refresh"></i>
              Refresh
            </button>
            <button className="btn btn-primary" onClick={handleAddDestination}>
              <i className="fas fa-plus"></i>
              Add Destination
            </button>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {destinations.map(dest => (
              <div key={dest.id} className="card">
                <div className="card-body">
                  <h4 style={{ marginBottom: '0.5rem' }}>{dest.name}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {(dest.description || 'No description available').substring(0, 100)}...
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge ${dest.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {dest.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-sm btn-primary" 
                        onClick={() => handleEditDestination(dest)}
                        title="Edit destination"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => handleDeleteDestination(dest.id)}
                        title="Permanently delete destination (cannot be undone)"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Destination Modal */}
      {window.DestinationModal && (
        <window.DestinationModal
          destination={selectedDestination}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedDestination(null);
          }}
          onSave={handleSaveDestination}
        />
      )}
    </div>
  );
};

window.DestinationManagement = DestinationManagement;

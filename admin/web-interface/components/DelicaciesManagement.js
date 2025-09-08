/**
 * Delicacies Management Component
 * Handles CRUD operations for local delicacies
 */

const { useState, useEffect } = React;

const DelicaciesManagement = ({ currentAdmin }) => {
  const [delicacies, setDelicacies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDelicacies();
  }, []);

  const loadDelicacies = async () => {
    setLoading(true);
    try {
      const result = await window.DelicaciesService.getAllDelicacies();
      if (result.success) {
        setDelicacies(result.data);
      }
    } catch (error) {
      console.error('Error loading delicacies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Loading Delicacies...</span>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>
        Delicacies Management
      </h1>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Delicacies ({delicacies.length})</h3>
          <button className="btn btn-primary">
            <i className="fas fa-plus"></i>
            Add Delicacy
          </button>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {delicacies.map(delicacy => (
              <div key={delicacy.id} className="card">
                <div className="card-body">
                  <h4 style={{ marginBottom: '0.5rem' }}>{delicacy.name}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    {delicacy.restaurant}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {delicacy.description.substring(0, 100)}...
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-info">
                      {delicacy.price}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-sm btn-primary">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn btn-sm btn-danger">
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
    </div>
  );
};

window.DelicaciesManagement = DelicaciesManagement;

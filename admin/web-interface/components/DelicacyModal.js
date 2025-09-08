/**
 * Delicacy Modal Component
 * Modal for adding/editing delicacies
 */

const DelicacyModal = ({ delicacy, isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">
            {delicacy ? 'Edit Delicacy' : 'Add Delicacy'}
          </h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <p>Delicacy form will be implemented here.</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary">
            {delicacy ? 'Update' : 'Create'} Delicacy
          </button>
        </div>
      </div>
    </div>
  );
};

window.DelicacyModal = DelicacyModal;

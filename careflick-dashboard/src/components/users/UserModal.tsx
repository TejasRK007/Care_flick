import React, { useMemo } from 'react';
import type { User } from '../../types/user';
import { useAppContext } from '../../context/AppContext';

interface UserModalProps {
  user: User;
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose }) => {
  const { formSubmissions } = useAppContext();

  // Filter linked submissions directly out of Context utilizing the mapping rule
  const linkedSubmissions = useMemo(() => {
    return formSubmissions.filter(sub => sub.userId === user.id);
  }, [formSubmissions, user.id]);

  // Handle escape key closing mapped recursively in generic ways implicitly
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleModalClick}>
        <div className="modal-header">
          <h2>User Details</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          
          <div className="user-profile-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
             <div className="user-avatar" style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>
                {user.name.charAt(0).toUpperCase()}
             </div>
             <div>
               <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-color)' }}>{user.name}</h3>
               <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)' }}>@{user.username}</p>
             </div>
          </div>

          <div className="dynamic-fields-grid" style={{ marginBottom: '2rem' }}>
            <div className="detail-group">
              <span className="detail-label">Email</span>
              <span className="detail-value">{user.email}</span>
            </div>
            <div className="detail-group">
              <span className="detail-label">Phone</span>
              <span className="detail-value">{user.phone}</span>
            </div>
            <div className="detail-group">
              <span className="detail-label">Website</span>
              <span className="detail-value">
                <a href={`http://${user.website}`} target="_blank" rel="noreferrer">
                  {user.website}
                </a>
              </span>
            </div>
            <div className="detail-group">
              <span className="detail-label">Company Name</span>
              <span className="detail-value">{user.company.name}</span>
            </div>
          </div>

          <div className="linked-submissions-section">
            <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', color: 'var(--text-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Submitted Care Forms
            </h4>
            
            {linkedSubmissions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                No care forms submitted by this user.
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {linkedSubmissions.map(sub => (
                  <li key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-color)' }}>
                        {sub.formName} - {new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <span className="badge badge-form" style={{ backgroundColor: 'white' }}>Viewed</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default UserModal;

import React from 'react';
import { Mail, Phone, Edit2, Trash2, Globe } from 'lucide-react';
import type { User } from '../../types/user';
import './UserCard.css';

interface UserCardProps {
  user: User;
  onClick: (user: User) => void;
  onEdit: (e: React.MouseEvent, user: User) => void;
  onDelete: (e: React.MouseEvent, id: number) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onClick, onEdit, onDelete }) => {
  return (
    <div className="user-card" onClick={() => onClick(user)}>
      <div className="user-card-header">
        <div className="user-avatar-container">
          <div className="user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-status-indicator"></div>
        </div>
        <div className="user-info">
          <h3 className="user-name">{user.name}</h3>
          <p className="user-username">@{user.username}</p>
        </div>
      </div>
      
      <div className="user-card-body">
        <div className="user-contact-info">
          <div className="contact-item">
            <Mail size={16} className="contact-icon" />
            <span>{user.email}</span>
          </div>
          <div className="contact-item">
            <Phone size={16} className="contact-icon" />
            <span>{user.phone}</span>
          </div>
          <div className="contact-item">
            <Globe size={16} className="contact-icon" />
            <span className="truncate">{user.website}</span>
          </div>
        </div>
        
        <div className="user-company">
          <span className="badge company-badge">{user.company.name}</span>
        </div>
      </div>

      <div className="user-card-actions">
        <button 
          className="action-btn edit-btn" 
          onClick={(e) => onEdit(e, user)}
          aria-label="Edit user"
        >
          <Edit2 size={16} />
        </button>
        <button 
          className="action-btn delete-btn" 
          onClick={(e) => onDelete(e, user.id)}
          aria-label="Delete user"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default UserCard;

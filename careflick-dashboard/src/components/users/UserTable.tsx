import React from 'react';
import type { User } from '../../types/user';

interface UserTableProps {
  users: User[];
  onUserClick: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onUserClick }) => {
  if (users.length === 0) {
    return (
      <div className="empty-state">
        <p>No users found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Website</th>
            <th>Company</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr 
              key={user.id} 
              onClick={() => onUserClick(user)}
              className="clickable-row"
            >
              <td className="fw-medium">{user.name}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>
                <a 
                  href={`http://${user.website}`} 
                  target="_blank" 
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {user.website}
                </a>
              </td>
              <td>{user.company.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;

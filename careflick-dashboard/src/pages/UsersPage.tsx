import React, { useState, useMemo, useEffect } from 'react';
import type { User } from '../types/user';
import { useAppContext } from '../context/AppContext';
import UserCard from '../components/users/UserCard';
import UserSearch from '../components/users/UserSearch';
import UserModal from '../components/users/UserModal';
import UserForm from '../components/users/UserForm';
import SkeletonCard from '../components/ui/SkeletonCard';
import './UsersPage.css';

const usersPerPage = 8;

const UsersPage: React.FC = () => {
  const { users, isLoadingUsers, usersError, addUser, editUser, deleteUser } = useAppContext();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Modal tracking
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Pagination bounds natively mapping Page slices
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Evaluate total matching properties overriding core arrays accurately
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    
    const lowercasedSearch = searchQuery.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(lowercasedSearch) ||
      user.email.toLowerCase().includes(lowercasedSearch)
    );
  }, [users, searchQuery]);

  // Derived Pagination Data 
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const currentUsers = useMemo(() => {
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    return filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  }, [filteredUsers, currentPage]);

  // Handlers
  const handleEditClick = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this user? This cannot be undone.")) {
      deleteUser(id);
    }
  };

  const handleFormSubmit = (user: User) => {
    if (editingUser) {
      editUser(user);
    } else {
      addUser(user);
    }
    setIsFormOpen(false);
    setEditingUser(null);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="page-container">
      <header className="page-header header-with-actions" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>User Directory</h1>
          <p>Manage all users and their relational data profiles natively.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%', maxWidth: '450px' }}>
          <UserSearch 
            searchTerm={searchQuery} 
            onSearchChange={(value) => {
              setSearchQuery(value);
            }} 
          />
          <button 
            className="btn-primary" 
            style={{ flexShrink: 0 }}
            onClick={() => setIsFormOpen(true)}
          >
            Add User
          </button>
        </div>
      </header>
      
      {isLoadingUsers ? (
        <div className="users-grid">
          {Array.from({ length: 6 }).map((_, index) => (
             <SkeletonCard key={index} />
          ))}
        </div>
      ) : usersError ? (
        <div className="error-state card">
          <p>Failed to load users</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state card">
          <p>{searchQuery ? "No users found matching your search. Please adjust your filters." : "No users available. Add a user to get started."}</p>
        </div>
      ) : (
        <>
          <div className="users-grid" style={{ marginBottom: '2rem' }}>
            {currentUsers.map(user => (
              <UserCard 
                key={user.id} 
                user={user} 
                onClick={setSelectedUser}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>

          {/* Clean Pagination Control Native Mappings */}
          {totalPages > 1 && (
            <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
              <button 
                className="btn-secondary" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Page <strong style={{ color: 'var(--text-color)' }}>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>
              <button 
                className="btn-secondary" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {selectedUser && (
        <UserModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}

      {isFormOpen && (
        <UserForm 
          initialData={editingUser}
          onSubmitSuccess={handleFormSubmit}
          onCancel={closeForm}
        />
      )}
    </div>
  );
};

export default UsersPage;

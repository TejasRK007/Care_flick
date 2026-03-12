import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import type { User } from '../types/user';
import type { FormSubmission } from '../types/form';
import { useUsers } from '../hooks/useUsers';

interface AppContextType {
  users: User[];
  formSubmissions: FormSubmission[];
  isLoadingUsers: boolean;
  usersError: string | null;
  addUser: (user: User) => void;
  editUser: (user: User) => void;
  deleteUser: (id: number) => void;
  addFormSubmission: (submission: FormSubmission) => void;
  updateSubmission: (submission: FormSubmission) => void;
  deleteSubmission: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Phase 10 Custom Hook Abstraction tracking API Fetch Limits safely decoupled!
  const { users, setUsers, loading: isLoadingUsers, error: usersError } = useUsers();
  
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>(() => {
    const saved = localStorage.getItem('careflick_submissions');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Sync to LocalStorage on Mutation strictly tracking Form payloads only since Hook handles User array
  useEffect(() => {
    localStorage.setItem('careflick_submissions', JSON.stringify(formSubmissions));
  }, [formSubmissions]);



  // User Methods
  const addUser = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
    toast.success('User added successfully');
  };

  const editUser = (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    toast.success('User updated successfully');
  };

  const deleteUser = (id: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success('User deleted successfully');
  };

  // Submission Methods
  const addFormSubmission = (newSubmission: FormSubmission) => {
    setFormSubmissions((prev) => [newSubmission, ...prev]);
    toast.success('Form submitted successfully!');
  };

  const updateSubmission = (updatedSubmission: FormSubmission) => {
    setFormSubmissions((prev) => prev.map((s) => (s.id === updatedSubmission.id ? updatedSubmission : s)));
    toast.success('Form properly updated!');
  };

  const deleteSubmission = (id: string) => {
    setFormSubmissions((prev) => prev.filter((s) => s.id !== id));
    toast.success('Form deleted successfully');
  };

  return (
    <AppContext.Provider 
      value={{ 
        users, formSubmissions, isLoadingUsers, usersError, 
        addUser, editUser, deleteUser, 
        addFormSubmission, updateSubmission, deleteSubmission 
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

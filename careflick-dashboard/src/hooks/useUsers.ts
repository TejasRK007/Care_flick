import { useState, useEffect } from 'react';
import type { User } from '../types/user';
import { getUsers } from '../services/api';

/**
 * A custom hook abstracting user API fetching logic cleanly mapping natively.
 * Supports localStorage state hydration and continuously manages error boundaries and loading states safely decoupled.
 */
export function useUsers() {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('careflick_users');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('careflick_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    const fetchUsers = async () => {
      // Safely skip iteration constraints if data is strictly present in localStorage limiting bounds
      if (users.length > 0) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        setError('Failed to load users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run on mount safely hydrating memory mappings once.

  return { users, setUsers, loading, error };
}

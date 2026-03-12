import React, { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import './UserSearch.css';

interface UserSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ searchTerm, onSearchChange }) => {
  const [localValue, setLocalValue] = useState(searchTerm);
  const debouncedSearchTerm = useDebounce(localValue, 300);

  // Only broadcast exact filtered values upstream when the generic debounce hook maps resolutions smoothly!
  useEffect(() => {
    onSearchChange(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearchChange]);

  return (
    <div className="search-container">
      <div className="search-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
        <input
          type="text"
          placeholder="Filter users by name or email..."
          className="search-input"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
        />
      </div>
    </div>
  );
};

export default UserSearch;

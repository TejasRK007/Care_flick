import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <div className="navbar-brand-group">
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <div className="navbar-brand">
          <strong>Careflick Dashboard</strong>
        </div>
      </div>
      <ul className="navbar-nav">
        <li>
          <NavLink 
            to="/users" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            Users
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/care-forms" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            Care Forms
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;

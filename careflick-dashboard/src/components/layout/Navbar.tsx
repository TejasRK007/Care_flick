import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <strong>Careflick Dashboard</strong>
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

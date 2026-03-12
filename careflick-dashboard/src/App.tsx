import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import UsersPage from './pages/UsersPage';
import CareFormsPage from './pages/CareFormsPage';
import { AppProvider } from './context/AppContext';
import './components/forms/CareForm.css';

const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Toaster position="top-right" />
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/users" replace />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/care-forms" element={<CareFormsPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;

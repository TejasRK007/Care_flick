import React, { useMemo } from 'react';
import type { FormSubmission } from '../../types/form';
import './FormStats.css';

interface FormStatsProps {
  submissions: FormSubmission[];
}

const FormStats: React.FC<FormStatsProps> = ({ submissions }) => {
  const stats = useMemo(() => {
    const totalForms = submissions.length;
    
    // Calculate today's submissions
    const today = new Date().toDateString();
    const todaysSubmissions = submissions.filter(
      (sub) => new Date(sub.submittedAt).toDateString() === today
    ).length;

    // Calculate unique patients
    // Extract patientName across varying arbitrary schemas gracefully if it exists
    const uniquePatients = new Set();
    submissions.forEach(sub => {
      const patientName = sub.formData?.patientName;
      if (patientName && typeof patientName === 'string') {
        uniquePatients.add(patientName.trim().toLowerCase());
      }
    });

    return {
      totalForms,
      todaysSubmissions,
      totalPatients: uniquePatients.size
    };
  }, [submissions]);

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-card-body">
          <div className="stat-icon bg-primary-light">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-title">Total Forms Submitted</p>
            <h4 className="stat-value">{stats.totalForms}</h4>
          </div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-card-body">
          <div className="stat-icon bg-success-light">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-title">Today's Submissions</p>
            <h4 className="stat-value">{stats.todaysSubmissions}</h4>
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card-body">
          <div className="stat-icon bg-purple-light">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-title">Total Patients</p>
            <h4 className="stat-value">{stats.totalPatients}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormStats;

import React from 'react';
import type { FormSubmission } from '../../types/form';

interface SubmittedFormsTableProps {
  forms: FormSubmission[];
  onEdit: (form: FormSubmission) => void;
  onDelete: (id: string) => void;
}

const SubmittedFormsTable: React.FC<SubmittedFormsTableProps> = ({ forms, onEdit, onDelete }) => {
  if (forms.length === 0) {
    return (
      <div className="empty-state">
        <p>No care forms submitted yet.</p>
      </div>
    );
  }

  // Helper to format unstructured JSON elegantly without crashing
  const renderSubmittedData = (data: Record<string, any>) => {
    const entries = Object.entries(data).filter(([_, val]) => val !== '' && val !== null && val !== undefined);
    
    if (entries.length === 0) return <span className="text-muted">No data</span>;

    return (
      <div className="submitted-data-summary">
        {entries.map(([key, value]) => {
          // Format keys: "patientName" -> "Patient Name"
          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          return (
            <div key={key} className="data-item truncate">
              <span className="data-key">{formattedKey}:</span> 
              <span className="data-value">{String(value)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this submission?")) {
      onDelete(id);
    }
  };

  return (
    <div className="table-responsive">
      <table className="dashboard-table actions-table">
        <thead>
          <tr>
            <th>Form Name</th>
            <th>Date Submitted</th>
            <th>Submitted Data</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {forms.map((form) => (
            <tr key={form.id}>
              <td className="fw-medium">
                <span className="badge badge-form">
                  {form.formName}
                </span>
              </td>
              <td>
                <div className="date-time-cell">
                  <span>{new Date(form.submittedAt).toLocaleDateString()}</span>
                  <span className="text-muted text-sm">{new Date(form.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </td>
              <td className="data-cell">
                 {renderSubmittedData(form.formData)}
              </td>
              <td className="actions-cell">
                <button 
                  className="btn-icon btn-edit" 
                  onClick={() => onEdit(form)}
                  aria-label="Edit Submission"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button 
                  className="btn-icon btn-delete" 
                  onClick={() => handleDelete(form.id)}
                  aria-label="Delete Submission"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubmittedFormsTable;

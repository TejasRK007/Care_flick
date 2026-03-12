import React, { useState } from 'react';
import type { FormSubmission } from '../../types/form';

interface SubmittedFormsTableProps {
  forms: FormSubmission[];
  onEdit: (form: FormSubmission) => void;
  onDelete: (id: string) => void;
}

const SKIP_KEYS = new Set(['rawText', 'formName']);

const SubmittedFormsTable: React.FC<SubmittedFormsTableProps> = ({ forms, onEdit, onDelete }) => {
  const [viewingForm, setViewingForm] = useState<FormSubmission | null>(null);

  if (forms.length === 0) {
    return (
      <div className="empty-state">
        <p>No care forms submitted yet.</p>
      </div>
    );
  }

  const formatKey = (key: string) =>
    key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

  const renderSubmittedData = (data: Record<string, any>) => {
    const entries = Object.entries(data).filter(
      ([key, val]) => !SKIP_KEYS.has(key) && val !== '' && val !== null && val !== undefined
    );
    if (entries.length === 0) return <span className="text-muted">No data</span>;

    return (
      <div className="submitted-data-summary">
        {entries.slice(0, 2).map(([key, value]) => (
          <div key={key} className="data-item truncate">
            <span className="data-key">{formatKey(key)}:</span>{' '}
            <span className="data-value">
              {Array.isArray(value) ? value.join(', ') : String(value).substring(0, 40)}
            </span>
          </div>
        ))}
        {entries.length > 2 && (
          <span className="text-muted text-sm">+{entries.length - 2} more</span>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="table-responsive">
        <table className="dashboard-table actions-table" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Form Name</th>
              <th style={{ width: '20%' }}>Date Submitted</th>
              <th style={{ width: '35%' }}>Submitted Data</th>
              <th style={{ width: '20%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form) => (
              <tr key={form.id}>
                <td className="fw-medium">
                  <span
                    className="badge badge-form clickable-badge"
                    onClick={() => setViewingForm(form)}
                    title="Click to view details"
                  >
                    {form.formName}
                  </span>
                </td>
                <td>
                  <div className="date-time-cell">
                    <span>{new Date(form.submittedAt).toLocaleDateString()}</span>
                    <span className="text-muted text-sm">{new Date(form.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </td>
                <td style={{ overflow: 'hidden' }}>
                   {renderSubmittedData(form.formData)}
                </td>
                <td>
                  <div className="actions-cell">
                    <button 
                      className="btn-icon btn-edit" 
                      onClick={() => onEdit(form)}
                      aria-label="Edit Submission"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button 
                      className="btn-icon btn-delete" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(form.id);
                      }}
                      aria-label="Delete Submission"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Detail Modal */}
      {viewingForm && (
        <div className="modal-overlay" onClick={() => setViewingForm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h2>{viewingForm.formName}</h2>
              <button className="close-btn" onClick={() => setViewingForm(null)} aria-label="Close">&times;</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Submitted on {new Date(viewingForm.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(viewingForm.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {Object.entries(viewingForm.formData)
                  .filter(([key, val]) => {
                    if (key === 'rawText' || key === 'symptoms') return false;
                    if (val === '' || val === null || val === undefined) return false;
                    if (Array.isArray(val) && val.length === 0) return false;
                    return true;
                  })
                  .map(([key, value]) => {
                    const isWide = key === 'incidentDescription' || key === 'formName';
                    return (
                      <div
                        key={key}
                        className="detail-group"
                        style={isWide ? { gridColumn: '1 / -1' } : {}}
                      >
                        <span className="detail-label">{formatKey(key)}</span>
                        <span className="detail-value" style={{ wordBreak: 'break-word' }}>
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {/* Symptoms rendered as tags */}
              {viewingForm.formData.symptoms && Array.isArray(viewingForm.formData.symptoms) && viewingForm.formData.symptoms.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <span className="detail-label">Symptoms</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.25rem' }}>
                    {viewingForm.formData.symptoms.map((s: string) => (
                      <span key={s} className="pdf-symptom-tag">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {viewingForm.formData.rawText && (
                <details style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Raw Extracted Text
                  </summary>
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.8125rem', color: 'var(--text-color)', backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', maxHeight: '200px', overflowY: 'auto', margin: 0 }}>
                    {viewingForm.formData.rawText}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubmittedFormsTable;

import React, { useState } from 'react';
import CareForm from '../components/forms/CareForm';
import SubmittedFormsTable from '../components/forms/SubmittedFormsTable';
import FormStats from '../components/forms/FormStats';
import PdfUploader from '../components/forms/PdfUploader';
import type { FormSubmission } from '../types/form';
import { careFormSchemas } from '../data/forms';
import { useAppContext } from '../context/AppContext';

const CareFormsPage: React.FC = () => {
  const { formSubmissions, addFormSubmission, updateSubmission, deleteSubmission, users } = useAppContext();
  
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>(careFormSchemas[0].id);
  // Phase 8 explicitly forces user bounding prior to context submissions natively
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  
  const [editingSubmission, setEditingSubmission] = useState<FormSubmission | null>(null);

  const activeSchema = careFormSchemas.find(s => s.id === selectedSchemaId) || careFormSchemas[0];

  const handleFormSubmit = (submission: Omit<FormSubmission, 'userId'> & { userId?: number }) => {
    if (!selectedUserId && !editingSubmission) {
      alert("Please select a User before submitting the form.");
      return;
    }

    // Force strict mappings explicitly linking Phase 8 targets
    const finalSubmission: FormSubmission = {
      ...submission,
      userId: editingSubmission ? editingSubmission.userId : parseInt(selectedUserId, 10),
    } as FormSubmission;

    if (editingSubmission) {
      updateSubmission(finalSubmission);
      setEditingSubmission(null);
    } else {
      addFormSubmission(finalSubmission);
    }
  };

  const handleEdit = (submission: FormSubmission) => {
    const originalSchemaForForm = careFormSchemas.find(s => s.title === submission.formName);
    if (originalSchemaForForm) {
      setSelectedSchemaId(originalSchemaForForm.id);
    }
    // Reflect local bound variables mapping backwards natively
    setSelectedUserId(submission.userId.toString());
    setEditingSubmission(submission);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleDelete = (id: string) => {
    deleteSubmission(id);
    if (editingSubmission?.id === id) {
      setEditingSubmission(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingSubmission(null);
    setSelectedUserId(''); // Reset target on exit bounds safely
  };

  const onSchemaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (editingSubmission) setEditingSubmission(null);
    setSelectedSchemaId(e.target.value);
  };

  return (
    <div className="page-container">
      <header className="page-header header-with-actions">
        <div>
          <h1>Care Forms Dashboard</h1>
          <p>Manage, track, and process dynamic patient care arrays.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
           <div className="schema-selector">
            <label htmlFor="userTargetSelect" className="schema-label" style={{ color: 'var(--primary-color)' }}>Select User:</label>
            <select 
              id="userTargetSelect"
              className="schema-select form-control"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={!!editingSubmission} // Lock mapping safely during edits explicitly overriding loops
            >
              <option value="">[ Choose User ▼ ]</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="schema-selector">
            <label htmlFor="formTypeSelect" className="schema-label">Care Form Type:</label>
            <select 
              id="formTypeSelect"
              className="schema-select form-control"
              value={selectedSchemaId}
              onChange={onSchemaChange}
            >
              {careFormSchemas.map(schema => (
                <option key={schema.id} value={schema.id}>
                  {schema.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>
      
      <FormStats submissions={formSubmissions} />
      
      <div className="forms-layout">
        <div className="form-section">
          <div className="card">
            <div className="card-header highlight-header">
              <h3>{editingSubmission ? `Editing ${activeSchema.title}` : `New ${activeSchema.title}`}</h3>
            </div>
            <div className="card-body">
              {!selectedUserId && !editingSubmission ? (
                <div className="empty-state">
                  <p>Please select a user above to fill out or upload a Care Form.</p>
                </div>
              ) : (
                <>
                  {!editingSubmission && (
                    <PdfUploader 
                      onUploadSuccess={(parsedData) => {
                        const finalSubmission: FormSubmission = {
                          id: crypto.randomUUID(),
                          userId: parseInt(selectedUserId, 10),
                          formName: parsedData.formName,
                          formData: parsedData,
                          submittedAt: new Date().toISOString()
                        };
                        addFormSubmission(finalSubmission);
                      }} 
                    />
                  )}
                  
                  <div className="form-divider" style={{ margin: '1.5rem 0', textAlign: 'center', position: 'relative' }}>
                    <span style={{ backgroundColor: 'var(--surface-color)', padding: '0 1rem', color: 'var(--text-muted)', fontSize: '0.875rem', position: 'relative', zIndex: 1 }}>OR MANUAL ENTRY</span>
                    <hr style={{ position: 'absolute', top: '50%', left: 0, right: 0, margin: 0, transform: 'translateY(-50%)', borderTop: '1px solid var(--border-color)', zIndex: 0 }} />
                  </div>
                  
                  <CareForm 
                    schema={activeSchema} 
                    onSubmitSuccess={handleFormSubmit} 
                    initialData={editingSubmission}
                    onCancelEdit={handleCancelEdit}
                  />
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="table-section">
          <div className="card">
            <div className="card-header">
              <h3>Recent Submissions</h3>
            </div>
            <div className="card-body p-0">
              <SubmittedFormsTable 
                forms={formSubmissions} 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareFormsPage;

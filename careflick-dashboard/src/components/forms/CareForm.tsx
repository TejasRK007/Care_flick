import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import FormField from './FormField';
import type { FormSchema, FormSubmission } from '../../types/form';
import './CareForm.css';

interface CareFormProps {
  schema: FormSchema;
  // Use Omit to bypass strict strict userId constraints until upstream wrapper assigns it contextually
  onSubmitSuccess: (submission: Omit<FormSubmission, 'userId'> & { userId?: number }) => void;
  initialData?: FormSubmission | null;
  onCancelEdit?: () => void;
}

const CareForm: React.FC<CareFormProps> = ({ schema, onSubmitSuccess, initialData, onCancelEdit }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, any>>();

  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      reset(initialData.formData);
    } else {
      reset();
    }
  }, [schema.id, initialData, reset]);

  const onSubmit: SubmitHandler<Record<string, any>> = (data) => {
    const submission: Omit<FormSubmission, 'userId'> & { userId?: number } = {
      id: isEditMode ? initialData.id : crypto.randomUUID(),
      formName: schema.title,
      // Strictly alias payload and timing variables reflecting explicit specifications natively using ISO
      submittedAt: new Date().toISOString(),
      formData: data,
    };
    
    onSubmitSuccess(submission);
    if (!isEditMode) reset(); 
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="care-form">
      <div className="dynamic-fields-grid">
        {schema.fields.map((field) => (
          <div 
            key={field.id} 
            className={`form-field-wrapper ${field.type === 'textarea' ? 'full-width' : ''}`}
          >
            <FormField
              label={field.label}
              type={field.type}
              options={field.options}
              error={errors[field.id]?.message as string}
              {...register(field.id, { 
                required: field.required ? `${field.label} is required` : false,
                ...(field.type === 'number' && field.required ? {
                  min: { value: 0, message: `${field.label} cannot be negative` }
                } : {}),
                // Incorporate strict standard generic pattern matching natively if properties request matching rules safely
                ...(field.id.toLowerCase().includes('email') ? {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                } : {}),
                ...(field.id.toLowerCase().includes('phone') ? {
                  pattern: {
                    value: /^\+?[0-9\s\-()]{7,15}$/,
                    message: 'Invalid phone format'
                  }
                } : {})
              })}
            />
          </div>
        ))}
      </div>

      <div className="form-actions">
        {isEditMode && (
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onCancelEdit}
          >
            Cancel Edit
          </button>
        )}
        <button 
          type="submit" 
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : isEditMode ? `Update ${schema.title}` : `Submit ${schema.title}`}
        </button>
      </div>
    </form>
  );
};

export default CareForm;

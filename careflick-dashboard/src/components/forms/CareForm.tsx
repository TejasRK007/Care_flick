import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import FormField from './FormField';
import CalendarPicker from './CalendarPicker';
import type { FormSchema, FormSubmission } from '../../types/form';
import './CareForm.css';

interface CareFormProps {
  schema: FormSchema;
  onSubmitSuccess: (submission: Omit<FormSubmission, 'userId'> & { userId?: number }) => void;
  initialData?: FormSubmission | null;
  onCancelEdit?: () => void;
}

const CareForm: React.FC<CareFormProps> = ({ schema, onSubmitSuccess, initialData, onCancelEdit }) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
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
      submittedAt: new Date().toISOString(),
      formData: data,
    };
    
    onSubmitSuccess(submission);
    if (!isEditMode) reset(); 
  };

  // Build validation rules per field
  const getValidationRules = (field: { id: string; label: string; type: string; required: boolean }) => {
    const rules: Record<string, any> = {};

    if (field.required) {
      rules.required = `${field.label} is required`;
    }

    // Temperature-specific validation (supports both °F and °C ranges)
    if (field.id.toLowerCase().includes('temperature')) {
      rules.min = { value: 60, message: 'Temperature must be at least 60 (°F)' };
      rules.max = { value: 115, message: 'Temperature cannot exceed 115 (°F)' };
      rules.validate = (value: string) => {
        const num = parseFloat(value);
        if (isNaN(num)) return 'Please enter a valid number';
        if (num > 115) return `${num}°F is not a realistic temperature. Range: 60–115°F`;
        return true;
      };
    } else if (field.type === 'number' && field.required) {
      rules.min = { value: 0, message: `${field.label} cannot be negative` };
    }

    // Age validation
    if (field.id.toLowerCase() === 'age') {
      rules.min = { value: 0, message: 'Age cannot be negative' };
      rules.max = { value: 150, message: 'Please enter a valid age (0–150)' };
    }

    // Email pattern
    if (field.id.toLowerCase().includes('email')) {
      rules.pattern = {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Invalid email address'
      };
    }

    // Phone pattern
    if (field.id.toLowerCase().includes('phone')) {
      rules.pattern = {
        value: /^\+?[0-9\s\-()]{7,15}$/,
        message: 'Invalid phone format'
      };
    }

    // Blood Pressure validation (format: systolic/diastolic, e.g. 120/80)
    if (field.id.toLowerCase().includes('bloodpressure') || field.id.toLowerCase().includes('blood_pressure')) {
      rules.pattern = {
        value: /^\d{2,3}\/\d{2,3}$/,
        message: 'Use format: systolic/diastolic (e.g. 120/80)'
      };
      rules.validate = (value: string) => {
        if (!value) return true;
        const match = value.match(/^(\d{2,3})\/(\d{2,3})$/);
        if (!match) return 'Use format: systolic/diastolic (e.g. 120/80)';
        const systolic = parseInt(match[1], 10);
        const diastolic = parseInt(match[2], 10);
        if (systolic < 60 || systolic > 250) return `Systolic (${systolic}) must be between 60–250 mmHg`;
        if (diastolic < 30 || diastolic > 150) return `Diastolic (${diastolic}) must be between 30–150 mmHg`;
        if (diastolic >= systolic) return 'Diastolic must be lower than systolic';
        return true;
      };
    }

    return rules;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="care-form">
      <div className="dynamic-fields-grid">
        {schema.fields.map((field) => (
          <div 
            key={field.id} 
            className={`form-field-wrapper ${field.type === 'textarea' ? 'full-width' : ''}`}
          >
            {field.type === 'date' ? (
              <Controller
                name={field.id}
                control={control}
                rules={{ required: field.required ? `${field.label} is required` : false }}
                render={({ field: controllerField }) => (
                  <CalendarPicker
                    label={field.label}
                    value={controllerField.value || ''}
                    onChange={controllerField.onChange}
                    error={errors[field.id]?.message as string}
                    ref={controllerField.ref}
                    name={controllerField.name}
                  />
                )}
              />
            ) : (
              <FormField
                label={field.label}
                type={field.type}
                options={field.options}
                error={errors[field.id]?.message as string}
                {...register(field.id, getValidationRules(field))}
              />
            )}
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

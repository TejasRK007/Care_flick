import React from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label: string;
  error?: string;
  type?: string;
  options?: string[];
}

const FormField = React.forwardRef<any, FormFieldProps>(
  ({ label, error, type = 'text', options, ...props }, ref) => {
    return (
      <div className="form-group">
        <label className="form-label">{label}</label>
        
        {type === 'textarea' ? (
          <textarea
            className={`form-control ${error ? 'is-invalid' : ''}`}
            ref={ref}
            rows={4}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : type === 'select' ? (
          <select
            className={`form-control ${error ? 'is-invalid' : ''}`}
            ref={ref}
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            <option value="">Select an option...</option>
            {options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            className={`form-control ${error ? 'is-invalid' : ''}`}
            ref={ref}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        
        {error && <span className="invalid-feedback">{error}</span>}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;

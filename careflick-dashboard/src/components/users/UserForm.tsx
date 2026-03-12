import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import FormField from '../forms/FormField';
import type { User } from '../../types/user';

interface UserFormProps {
  initialData?: User | null;
  onSubmitSuccess: (user: User) => void;
  onCancel: () => void;
}

// Minimal internal type to satisfy the form mapping locally
interface UserFormData {
  name: string;
  email: string;
  phone: string;
}

const UserForm: React.FC<UserFormProps> = ({ initialData, onSubmitSuccess, onCancel }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>();

  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone,
      });
    } else {
      reset();
    }
  }, [initialData, reset]);

  const onSubmit: SubmitHandler<UserFormData> = (data) => {
    const userPayload: User = {
      // Create random integer ID if not editing
      id: isEditMode ? initialData.id : Math.floor(Math.random() * 1000000),
      name: data.name,
      email: data.email,
      phone: data.phone,
      // Create defaults for properties not managed by this simple form
      username: isEditMode ? initialData.username : data.name.toLowerCase().replace(/\s/g, ''),
      website: isEditMode ? initialData.website : 'careflick.example.com',
      company: isEditMode ? initialData.company : { name: 'Careflick Network' },
    };
    
    onSubmitSuccess(userPayload);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Edit User' : 'Add New User'}</h2>
          <button className="close-btn" onClick={onCancel} aria-label="Close modal">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit(onSubmit)} className="care-form">
            <FormField
              label="Full Name"
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />
            
            <FormField
              label="Email Address"
              type="email"
              error={errors.email?.message}
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            
            <FormField
              label="Phone Number"
              error={errors.phone?.message}
              {...register('phone', { required: 'Phone number is required' })}
            />
            
            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update User' : 'Add User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserForm;

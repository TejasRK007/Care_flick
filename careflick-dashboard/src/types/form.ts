export interface FormFieldSchema {
  id: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'date';
  required: boolean;
  options?: string[]; // Used strictly when type === 'select'
}

export interface FormSchema {
  id: string;
  title: string;
  fields: FormFieldSchema[];
}

export interface FormSubmission {
  id: string;
  userId: number; // Required relational link
  formName: string;
  submittedAt: string; // ISO date string matching Phase 8
  formData: Record<string, any>;
}

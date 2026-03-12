import type { FormSchema } from '../types/form';

export const careFormSchemas: FormSchema[] = [
  {
    id: 'patient-admission',
    title: 'Patient Admission Form',
    fields: [
      { id: 'patientName', label: 'Patient Name', type: 'text', required: true },
      { id: 'age', label: 'Age', type: 'number', required: true },
      { id: 'admissionDate', label: 'Admission Date', type: 'date', required: true },
      { 
        id: 'careType', 
        label: 'Care Type', 
        type: 'select', 
        required: true, 
        options: ['Home Care', 'Hospital Care'] 
      },
      { id: 'notes', label: 'Notes', type: 'textarea', required: false },
    ],
  },
  {
    id: 'daily-care-report',
    title: 'Daily Care Report',
    fields: [
      { id: 'patientName', label: 'Patient Name', type: 'text', required: true },
      { id: 'temperature', label: 'Temperature (°F or °C)', type: 'number', required: true },
      { id: 'bloodPressure', label: 'Blood Pressure', type: 'text', required: true },
      { id: 'visitDate', label: 'Visit Date', type: 'date', required: true },
      { id: 'careNotes', label: 'Care Notes', type: 'textarea', required: true },
    ],
  }
];

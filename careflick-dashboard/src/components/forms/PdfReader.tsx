import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Upload, AlertCircle, X, Check, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './PdfUploader.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface ParsedHealthData {
  residentName?: string;
  date?: string;
  caregiverName?: string;
  age?: string;
  gender?: string;
  roomNo?: string;
  temperature?: string;
  bloodPressure?: string;
  heartRate?: string;
  oxygenLevel?: string;
  respiratoryRate?: string;
  symptoms: string[];
  [key: string]: any;
}

interface PdfReaderProps {
  onSubmit: (formData: ParsedHealthData) => void;
}

const PdfReader: React.FC<PdfReaderProps> = ({ onSubmit }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedHealthData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };

  const parseHealthAssessment = (text: string): ParsedHealthData => {
    const residentName = text.match(/Resident\s*Name\s+([A-Za-z ]+)/i)?.[1]?.trim();
    const date = text.match(/Date\s+([0-9\-\/]+)/i)?.[1]?.trim();
    const caregiverName = text.match(/Caregiver\s*Name\s+([A-Za-z ]+)/i)?.[1]?.trim();
    const age = text.match(/Age\s+(\d+)/i)?.[1]?.trim();
    const gender = text.match(/Gender\s+([A-Za-z]+)/i)?.[1]?.trim();
    const roomNo = text.match(/Room\s*(?:No|Number|#)\s+([A-Za-z0-9\-]+)/i)?.[1]?.trim();
    const temperature = text.match(/Temperature.*?(\d+\.?\d*)\s*(?:°?[CF])?/i)?.[1]?.trim();
    const bloodPressure = text.match(/Blood\s*Pressure\s+([\d\/]+)/i)?.[1]?.trim();
    const heartRate = text.match(/Heart\s*Rate.*?(\d{2,3})\s*(?:bpm)?/i)?.[1]?.trim();
    const oxygenLevel = text.match(/Oxygen\s*(?:Level|Saturation|SpO2)?\s+(\d{2,3})\s*%?/i)?.[1]?.trim();
    const respiratoryRate = text.match(/Respiratory\s*Rate.*?(\d{1,3})/i)?.[1]?.trim();

    // Detect symptoms with checkmarks
    const symptomList = [
      'Fever', 'Fatigue', 'Headache', 'Cough', 'Nausea',
      'Dizziness', 'Chest Pain', 'Shortness of Breath',
      'Body Ache', 'Sore Throat', 'Vomiting', 'Diarrhea',
      'Chills', 'Loss of Appetite', 'Weakness'
    ];
    const symptoms: string[] = [];
    for (const symptom of symptomList) {
      // Match: "Symptom ✓", "Symptom ✔", "Symptom: Yes", "[x] Symptom", "☑ Symptom"
      const pattern = new RegExp(
        `${symptom}\\s*[✓✔☑]|\\[x\\]\\s*${symptom}|${symptom}\\s*:\\s*Yes`,
        'i'
      );
      if (pattern.test(text)) {
        symptoms.push(symptom);
      }
    }

    return {
      residentName,
      date,
      caregiverName,
      age,
      gender,
      roomNo,
      temperature,
      bloodPressure,
      heartRate,
      oxygenLevel,
      respiratoryRate,
      symptoms,
    };
  };

  const processPDF = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Invalid file type. Please upload a PDF file.');
      toast.error('Only PDF files are accepted.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setParsedData(null);

    try {
      const extractedText = await extractTextFromPdf(file);
      const data = parseHealthAssessment(extractedText);
      setParsedData(data);
      toast.success('PDF data extracted! Review below and confirm.');
    } catch (err) {
      console.error('PDF parsing error:', err);
      setError('Failed to parse PDF. The file may be corrupted or password-protected.');
      toast.error('Failed to read PDF file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSubmit = () => {
    if (parsedData) {
      onSubmit(parsedData);
      setParsedData(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Form submitted successfully!');
    }
  };

  const handleCancel = () => {
    setParsedData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processPDF(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processPDF(e.target.files[0]);
  };

  const formatLabel = (key: string) =>
    key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

  // Fields to display in the preview card
  const fieldOrder = [
    'residentName', 'date', 'caregiverName', 'age',
    'gender', 'roomNo', 'temperature', 'bloodPressure',
    'heartRate', 'oxygenLevel', 'respiratoryRate'
  ];

  return (
    <div className="pdf-uploader-container">
      {/* Upload area - shown when no data is parsed yet */}
      {!parsedData && (
        <div
          className={`dropzone ${isDragging ? 'dragging' : ''} ${error ? 'has-error' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,application/pdf"
            hidden
          />

          {isProcessing ? (
            <div className="processing-state">
              <div className="spinner"></div>
              <p>Reading PDF...</p>
            </div>
          ) : (
            <div className="upload-prompt">
              <div className="upload-icon-wrapper">
                <Upload size={32} className="upload-icon" />
              </div>
              <h4>Upload Health Assessment PDF</h4>
              <p>Drag and drop or click to extract patient data.</p>
              <span className="file-hint">PDF files only</span>
            </div>
          )}
        </div>
      )}

      {/* Preview card - shown after PDF is parsed */}
      {parsedData && (
        <div className="pdf-preview-card">
          <div className="pdf-preview-header">
            <FileText size={20} />
            <h4>Extracted Data — Review & Confirm</h4>
          </div>

          <div className="pdf-preview-grid">
            {fieldOrder.map(key => {
              const value = parsedData[key];
              if (!value) return null;
              return (
                <div key={key} className="pdf-preview-field">
                  <span className="pdf-preview-label">{formatLabel(key)}</span>
                  <span className="pdf-preview-value">{String(value)}</span>
                </div>
              );
            })}
          </div>

          {parsedData.symptoms.length > 0 && (
            <div className="pdf-preview-symptoms">
              <span className="pdf-preview-label">Symptoms</span>
              <div className="pdf-symptom-tags">
                {parsedData.symptoms.map(s => (
                  <span key={s} className="pdf-symptom-tag">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* No fields extracted warning */}
          {fieldOrder.every(k => !parsedData[k]) && parsedData.symptoms.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>
              No matching fields found. The PDF may use a different format.
            </p>
          )}

          <div className="pdf-preview-actions">
            <button className="btn-cancel" onClick={handleCancel}>
              <X size={16} /> Cancel
            </button>
            <button className="btn-confirm" onClick={handleConfirmSubmit}>
              <Check size={16} /> Confirm & Submit
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="upload-error">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button className="clear-error" onClick={() => setError(null)}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfReader;

import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Upload, AlertCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './PdfUploader.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface ParsedFormData {
  formName: string;
  residentName?: string;
  caregiverName?: string;
  age?: string;
  temperature?: string;
  bloodPressure?: string;
  heartRate?: string;
  oxygenLevel?: string;
  respiratoryRate?: string;
  symptoms?: string[];
  incidentType?: string;
  incidentDescription?: string;
  [key: string]: any;
}

interface PdfUploadReaderProps {
  onUploadSuccess: (parsedData: ParsedFormData) => void;
}

const PdfUploadReader: React.FC<PdfUploadReaderProps> = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract all text from every page of the PDF
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

  // Parse extracted text into structured form data
  const parseFormData = (text: string): ParsedFormData => {
    const clean = text.replace(/\s+/g, ' ');

    const extract = (regex: RegExp): string | undefined => {
      const match = clean.match(regex);
      return match ? match[1].trim() : undefined;
    };

    const result: ParsedFormData = {
      formName: 'Health Assessment Form',
    };

    // Core patient fields
    result.residentName = extract(/(?:Resident\s*Name|Patient\s*Name)\s*[:\-]\s*([^,.\n\r]{2,40})/i);
    result.age = extract(/(?:Age)\s*[:\-]\s*(\d{1,3})/i);
    result.caregiverName = extract(/(?:Caregiver(?:\s*Name)?|Staff\s*Name|Nurse)\s*[:\-]\s*([^,.\n\r]{2,40})/i);

    // Vital signs
    result.temperature = extract(/(?:Temperature|Temp)\s*[:\-]\s*([\d.]+\s*(?:°?[CF])?)/i);
    result.bloodPressure = extract(/(?:Blood\s*Pressure|BP)\s*[:\-]\s*(\d{2,3}\/\d{2,3})/i);
    result.heartRate = extract(/(?:Heart\s*Rate|Pulse|HR)\s*[:\-]\s*(\d{2,3}\s*(?:bpm)?)/i);
    result.oxygenLevel = extract(/(?:Oxygen\s*(?:Level|Saturation)?|O2|SpO2)\s*[:\-]\s*(\d{2,3}\s*%?)/i);
    result.respiratoryRate = extract(/(?:Respiratory\s*Rate|Resp(?:\.\s*)?Rate|RR)\s*[:\-]\s*(\d{1,3}\s*(?:breaths?\/?min)?)/i);

    // Incident fields
    result.incidentType = extract(/(?:Incident\s*Type|Event\s*Type)\s*[:\-]\s*([^,.\n\r]{2,40})/i);
    result.incidentDescription = extract(/(?:Incident\s*Description|Description)\s*[:\-]\s*(.+?)(?=\s*(?:Signature|Date|Caregiver|Resident|$))/i);

    // Symptoms (comma-separated list)
    const symptomsRaw = extract(/(?:Symptoms|Complaints)\s*[:\-]\s*([^.]+)/i);
    if (symptomsRaw) {
      result.symptoms = symptomsRaw.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Capture any generic "Label: Value" pairs not already matched
    const genericPairs = clean.matchAll(/([A-Z][a-zA-Z\s]{2,25})\s*[:\-]\s*([^:\n]{2,60})/g);
    const knownKeys = new Set(['formName', 'residentName', 'age', 'caregiverName', 'temperature', 'bloodPressure', 'heartRate', 'oxygenLevel', 'respiratoryRate', 'incidentType', 'incidentDescription', 'symptoms', 'rawText']);
    for (const match of genericPairs) {
      const key = match[1].trim().replace(/\s+/g, '').replace(/^./, s => s.toLowerCase());
      if (!knownKeys.has(key) && !result[key]) {
        result[key] = match[2].trim();
      }
    }

    // Always store the raw extracted text
    result.rawText = clean.trim();

    // Auto-detect form name from content
    const lower = clean.toLowerCase();
    if (lower.includes('incident report')) {
      result.formName = 'Incident Report';
    } else if (lower.includes('daily care')) {
      result.formName = 'Daily Care Log';
    } else if (lower.includes('admission')) {
      result.formName = 'Patient Admission Form';
    } else if (lower.includes('vitals') || lower.includes('vital signs')) {
      result.formName = 'Vitals Assessment';
    }

    return result;
  };

  const processPDF = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Invalid file type. Please upload a PDF file.');
      toast.error('Only PDF files are accepted.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const extractedText = await extractTextFromPdf(file);
      const parsedData = parseFormData(extractedText);

      toast.success('PDF parsed successfully!');
      onUploadSuccess(parsedData);

      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('PDF parsing error:', err);
      setError('Failed to parse PDF. The file may be corrupted or password-protected.');
      toast.error('Failed to read PDF file.');
    } finally {
      setIsProcessing(false);
    }
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

  return (
    <div className="pdf-uploader-container">
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
            <p>Extracting data from PDF...</p>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon-wrapper">
              <Upload size={32} className="upload-icon" />
            </div>
            <h4>Upload Care Form PDF</h4>
            <p>Drag and drop or click to extract patient data automatically.</p>
            <span className="file-hint">Supports: Assessments, Vitals Logs, Incident Reports</span>
          </div>
        )}
      </div>

      {error && (
        <div className="upload-error">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button className="clear-error" onClick={(e) => { e.stopPropagation(); setError(null); }}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfUploadReader;

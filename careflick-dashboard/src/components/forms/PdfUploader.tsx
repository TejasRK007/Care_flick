import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Upload, AlertCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './PdfUploader.css';

// Use the local Vite-resolved worker URL instead of CDN
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
  symptoms?: string[];
  incidentType?: string;
  incidentDescription?: string;
  [key: string]: any; // Allow dynamic fallback keys
}

interface PdfUploaderProps {
  onUploadSuccess: (parsedData: ParsedFormData) => void;
}

const PdfUploader: React.FC<PdfUploaderProps> = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processPDF = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Invalid file type. Please upload a PDF file.');
      toast.error('Only PDF files are supported.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extract sequential string mappings natively spanning all PDF pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' ';
      }

      const parsedData = parseMedicalData(fullText);
      
      if (!parsedData.formName) {
        parsedData.formName = "Uploaded PDF Form";
      }

      toast.success('PDF parsed successfully!');
      onUploadSuccess(parsedData);
      
      // Reset input mapping
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      console.error("PDF Parsing Error:", err);
      setError('Failed to parse PDF. The file may be corrupted or securely locked.');
      toast.error('Failed to read PDF file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseMedicalData = (text: string): ParsedFormData => {
    // Clean string by collapsing multiline and excess spacing mappings
    const cleanText = text.replace(/\s+/g, ' ');
    
    const result: ParsedFormData = {
      formName: "Health Assessment" // Default fallback, override if matched
    };

    // Regex boundaries targeting common structured formats gracefully (Key: Value)
    const extractField = (regex: RegExp): string | undefined => {
      const match = cleanText.match(regex);
      return match ? match[1].trim() : undefined;
    };

    // Parse Core Medical Properties
    result.residentName = extractField(/(?:Resident Name|Patient Name):\s*([^,.\n\r]{2,30})/i);
    result.caregiverName = extractField(/(?:Caregiver|Staff Name):\s*([^,.\n\r]{2,30})/i);
    result.age = extractField(/(?:Age):\s*(\d{1,3})/i);
    result.temperature = extractField(/(?:Temperature|Temp):\s*([\d.]+\s*(?:C|F|°C|°F)?)/i);
    result.bloodPressure = extractField(/(?:Blood Pressure|BP):\s*(\d{2,3}\/\d{2,3})/i);
    result.heartRate = extractField(/(?:Heart Rate|Pulse|HR):\s*(\d{2,3}\s*(?:bpm)?)/i);
    result.oxygenLevel = extractField(/(?:Oxygen|O2|SpO2):\s*(\d{2,3}\s*(?:%)?)/i);
    result.incidentType = extractField(/(?:Incident Type|Event Type):\s*([^,.\n\r]{2,30})/i);
    result.incidentDescription = extractField(/(?:Incident Description|Description):\s*([^]+?)(?=(?:\b(?:signature|date|caregiver|resident)\b|$))/i);

    // Symptoms extraction dynamically mapping comma separation natively
    const symptomsMatch = extractField(/(?:Symptoms|Complaints):\s*([^.]+)/i);
    if (symptomsMatch) {
      result.symptoms = symptomsMatch.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Determine Form Name based on context string mappings safely
    if (cleanText.toLowerCase().includes('incident report')) {
      result.formName = "Incident Report";
    } else if (cleanText.toLowerCase().includes('daily care')) {
      result.formName = "Daily Care Log";
    } else if (cleanText.toLowerCase().includes('admission')) {
      result.formName = "Patient Admission";
    }

    return result;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processPDF(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processPDF(e.target.files[0]);
    }
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
            <p>Analyzing PDF Document...</p>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon-wrapper">
              <Upload size={32} className="upload-icon" />
            </div>
            <h4>Upload Care Form PDF</h4>
            <p>Drag and drop or click to intelligently extract patient metrics and details.</p>
            <span className="file-hint">PDF formats only (e.g. Assessment, Vitals Log, Incident Report)</span>
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

export default PdfUploader;

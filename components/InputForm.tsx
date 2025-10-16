import React, { useState, useRef } from 'react';
import { KARNATAKA_CITIES } from '../constants';
import type { FormData } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { FileIcon } from './icons/FileIcon';
import { CloseIcon } from './icons/CloseIcon';

interface InputFormProps {
  initialData: FormData;
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

const Label: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-300 mb-2">
    {children}
  </label>
);

const inputBaseClasses = "block w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-colors duration-200";

export const InputForm: React.FC<InputFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<FormData>(initialData);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'years_of_experience' ? (value === '' ? 0 : parseInt(value, 10)) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type !== 'application/pdf') {
        alert('Please select a PDF file.');
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        return;
    }
    setFormData(prev => ({ ...prev, resume_file: file }));
  };
  
  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, resume_file: null }));
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.resume_file) {
      alert("Please upload your resume in PDF format.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg border border-slate-700">
      <h2 className="text-xl font-semibold mb-4 text-cyan-300">Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="job_position">Job Position</Label>
            <input
              type="text"
              name="job_position"
              id="job_position"
              value={formData.job_position}
              onChange={handleChange}
              className={inputBaseClasses}
              placeholder="e.g., Software Engineer"
              required
            />
          </div>
          <div>
            <Label htmlFor="years_of_experience">Years of Experience</Label>
            <input
              type="number"
              name="years_of_experience"
              id="years_of_experience"
              value={formData.years_of_experience}
              onChange={handleChange}
              className={inputBaseClasses}
              placeholder="e.g., 5"
              min="0"
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="city">City in Karnataka</Label>
          <select
            name="city"
            id="city"
            value={formData.city}
            onChange={handleChange}
            className={inputBaseClasses}
            required
          >
            {KARNATAKA_CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="resume_file">Upload Resume (PDF)</Label>
          <div 
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md cursor-pointer hover:border-cyan-500 transition-colors"
            onClick={triggerFileInput}
            onDrop={(e) => { e.preventDefault(); handleFileChange({ target: { files: e.dataTransfer.files } } as any); }}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="space-y-1 text-center">
              {formData.resume_file ? (
                <div className="flex items-center text-slate-300">
                  <FileIcon />
                  <span className="ml-2 font-medium">{formData.resume_file.name}</span>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                    className="ml-4 text-slate-400 hover:text-red-400 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label="Remove file"
                  >
                    <CloseIcon />
                  </button>
                </div>
              ) : (
                <>
                  <UploadIcon />
                  <div className="flex text-sm text-slate-400">
                    <p className="pl-1">Click or drag to upload a file</p>
                  </div>
                  <p className="text-xs text-slate-500">PDF format required</p>
                </>
              )}
            </div>
            <input
              id="resume_file"
              name="resume_file"
              type="file"
              className="sr-only"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
            />
          </div>
        </div>


        <div>
          <button
            type="submit"
            disabled={isLoading || !formData.resume_file}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : 'Generate Prompt'}
          </button>
        </div>
      </form>
    </div>
  );
};

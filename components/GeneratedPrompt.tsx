
import React, { useState, useEffect } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

interface GeneratedPromptProps {
  prompt: string;
  isLoading: boolean;
  error: string | null;
}

export const GeneratedPrompt: React.FC<GeneratedPromptProps> = ({ prompt, isLoading, error }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  
  const handleCopy = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      setCopied(true);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
           <svg className="animate-spin h-8 w-8 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          <p className="text-lg">Extracting skills and building prompt...</p>
          <p className="text-sm">This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-400 bg-red-900/20 p-4 rounded-md">
          <p className="font-semibold">An Error Occurred</p>
          <p className="text-sm text-center mt-2">{error}</p>
        </div>
      );
    }

    if (!prompt) {
       return (
        <div className="flex items-center justify-center h-full text-slate-500">
          <p>Your generated prompt will appear here.</p>
        </div>
      );
    }

    return (
      <pre className="whitespace-pre-wrap break-words text-sm text-slate-200">
        <code>{prompt}</code>
      </pre>
    );
  };
  
  return (
    <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg border border-slate-700 relative h-full min-h-[500px] lg:min-h-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-cyan-300">Generated Prompt</h2>
        {prompt && !isLoading && !error && (
            <button
                onClick={handleCopy}
                className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold py-1 px-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
            {copied ? <CheckIcon /> : <ClipboardIcon />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
        )}
      </div>
      <div className="bg-slate-900/70 p-4 rounded-md h-[calc(100%-48px)] overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

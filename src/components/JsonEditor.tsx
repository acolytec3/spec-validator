import React, { useMemo } from 'react';
import { Wand2 } from 'lucide-react';

interface JsonEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  highlightedLines?: number[];
}

function prettifyJSON(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return jsonString;
  }
}

export default function JsonEditor({ label, value, onChange, placeholder, error, className = '', highlightedLines = [] }: JsonEditorProps) {
  const handlePrettify = () => {
    const prettified = prettifyJSON(value);
    onChange(prettified);
  };

  const canPrettify = value.trim() && !error;

  const lineNumbers = useMemo(() => {
    const lines = value.split('\n');
    return lines.map((_, index) => {
      const lineNumber = index + 1;
      const isHighlighted = highlightedLines.includes(lineNumber);
      return (
        <div
          key={lineNumber}
          className={`text-right pr-2 text-xs leading-5 select-none ${
            isHighlighted 
              ? 'bg-red-200 text-red-800 font-bold' 
              : 'text-gray-400'
          }`}
          style={{ minWidth: '2rem' }}
        >
          {lineNumber}
        </div>
      );
    });
  }, [value, highlightedLines]);

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <button
          onClick={handlePrettify}
          disabled={!canPrettify}
          className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-md transition-colors ${
            canPrettify
              ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200'
              : 'text-gray-400 cursor-not-allowed border border-gray-200'
          }`}
          title="Format JSON"
        >
          <Wand2 className="h-3 w-3" />
          <span>Prettify</span>
        </button>
      </div>
      <div className="relative">
        <div className={`flex border rounded-lg overflow-hidden ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}>
          {/* Line numbers */}
          <div className="bg-gray-50 border-r border-gray-200 py-4 flex flex-col">
            {lineNumbers}
          </div>
          
          {/* Text area */}
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`flex-1 min-h-96 p-4 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'bg-red-50' : 'bg-white'
            }`}
            style={{ 
              lineHeight: '1.25rem',
              outline: 'none',
              border: 'none'
            }}
            spellCheck={false}
          />
        </div>
        {error && (
          <div className="absolute top-2 right-2 bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
            Invalid JSON
          </div>
        )}
      </div>
    </div>
  );
}
import React from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { ValidationResult } from '../utils/validator';

interface ValidationResultsProps {
  title: string;
  result: ValidationResult | null;
  isValidating: boolean;
  onErrorClick?: (lineNumber: number) => void;
}

export default function ValidationResults({ title, result, isValidating, onErrorClick }: ValidationResultsProps) {
  if (isValidating) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-blue-800 font-medium">Validating...</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">No validation results yet</span>
        </div>
      </div>
    );
  }

  if (result.valid) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">{title} is valid ✓</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <XCircle className="h-5 w-5 text-red-600" />
        <span className="text-red-800 font-medium">{title} validation failed</span>
      </div>
      
      <div className="space-y-3">
        {result.errors.map((error, index) => (
          <div 
            key={index} 
            className={`bg-white border border-red-200 rounded p-3 ${
              error.lineNumber && onErrorClick ? 'cursor-pointer hover:bg-red-25 hover:border-red-300 transition-colors' : ''
            }`}
            onClick={() => error.lineNumber && onErrorClick && onErrorClick(error.lineNumber)}
          >
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-mono">
                  {error.keyword}
                </span>
                <span className="text-sm font-medium text-red-800">
                  Path: {error.path || 'root'}
                </span>
                {error.lineNumber && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Line {error.lineNumber}
                  </span>
                )}
              </div>
              <p className="text-sm text-red-700">{error.message}</p>
              {error.lineNumber && onErrorClick && (
                <p className="text-xs text-blue-600 italic">
                  Click to highlight line in editor
                </p>
              )}
              {error.schemaPath && (
                <p className="text-xs text-red-600">
                  Schema path: {error.schemaPath}
                </p>
              )}
              {error.params && Object.keys(error.params).length > 0 && (
                <div className="text-xs text-red-600">
                  <span className="font-medium">Details: </span>
                  {JSON.stringify(error.params, null, 2)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
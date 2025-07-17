import React, { useState, useCallback, useEffect } from 'react';
import { Shield, FileText, CheckCircle2 } from 'lucide-react';
import JsonEditor from './components/JsonEditor';
import ValidationResults from './components/ValidationResults';
import ExampleSchemas from './components/ExampleSchemas';
import ShareButton from './components/ShareButton';
import { validateSchema, validateData, parseJSON, ValidationResult, ValidationError } from './utils/validator';
import { findLineForPath } from './utils/jsonLineMapper';
import { parseUrlParams, updateUrlParams } from './utils/urlParams';

function App() {
  const [schema, setSchema] = useState('');
  const [data, setData] = useState('');
  const [schemaParseError, setSchemaParseError] = useState<string | undefined>();
  const [dataParseError, setDataParseError] = useState<string | undefined>();
  const [schemaValidation, setSchemaValidation] = useState<ValidationResult | null>(null);
  const [dataValidation, setDataValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [highlightedLines, setHighlightedLines] = useState<number[]>([]);

  // Initialize from URL parameters on component mount
  useEffect(() => {
    const urlParams = parseUrlParams();
    if (urlParams.schema) {
      setSchema(urlParams.schema);
    }
    if (urlParams.data) {
      setData(urlParams.data);
    }
  }, []);

  // Update URL when schema or data changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateUrlParams(schema, data);
    }, 1000); // 1 second debounce
    
    return () => clearTimeout(timeoutId);
  }, [schema, data]);

  const validateAll = useCallback(async () => {
    if (!schema.trim()) {
      setSchemaValidation(null);
      setDataValidation(null);
      return;
    }

    setIsValidating(true);
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 100));

    // Parse and validate schema
    const schemaParse = parseJSON(schema);
    if (!schemaParse.success) {
      setSchemaParseError(schemaParse.error);
      setSchemaValidation(null);
      setDataValidation(null);
      setIsValidating(false);
      return;
    }
    
    setSchemaParseError(undefined);
    const schemaResult = validateSchema(schemaParse.data);
    setSchemaValidation(schemaResult);

    // Parse and validate data if provided
    if (data.trim()) {
      const dataParse = parseJSON(data);
      if (!dataParse.success) {
        setDataParseError(dataParse.error);
        setDataValidation(null);
        setIsValidating(false);
        return;
      }
      
      setDataParseError(undefined);
      const dataResult = validateData(schemaParse.data, dataParse.data);
      
      // Add line numbers to validation errors
      if (!dataResult.valid) {
        const errorsWithLines: ValidationError[] = dataResult.errors.map(error => {
          const lineNumber = findLineForPath(data, error.path);
          return { ...error, lineNumber };
        });
        setDataValidation({ ...dataResult, errors: errorsWithLines });
      } else {
        setDataValidation(dataResult);
      }
    } else {
      setDataValidation(null);
    }

    setIsValidating(false);
  }, [schema, data]);

  const handleErrorClick = (lineNumber: number) => {
    setHighlightedLines([lineNumber]);
    // Clear highlight after 3 seconds
    setTimeout(() => setHighlightedLines([]), 3000);
  };
  useEffect(() => {
    const timeoutId = setTimeout(validateAll, 300);
    return () => clearTimeout(timeoutId);
  }, [validateAll]);

  const handleSchemaSelect = (exampleSchema: string) => {
    // Prettify the example schema when loading
    try {
      const parsed = JSON.parse(exampleSchema);
      setSchema(JSON.stringify(parsed, null, 2));
    } catch {
      setSchema(exampleSchema);
    }
  };

  const handleDataSelect = (exampleData: string) => {
    // Prettify the example data when loading
    try {
      const parsed = JSON.parse(exampleData);
      setData(JSON.stringify(parsed, null, 2));
    } catch {
      setData(exampleData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">JSON Schema Validator</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Validate JSON schemas against Draft 7 specification and test your data against custom schemas. 
            Get detailed error messages with exact locations for debugging.
          </p>
          <div className="mt-4 flex justify-center">
            <ShareButton schema={schema} data={data} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Examples Sidebar */}
          <div className="lg:col-span-1">
            <ExampleSchemas 
              onSelectSchema={handleSchemaSelect}
              onSelectData={handleDataSelect}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Schema Input */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">JSON Schema</h2>
              </div>
              
              <JsonEditor
                label="Enter your JSON Schema (Draft 7)"
                value={schema}
                onChange={setSchema}
                placeholder={`{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "name": { "type": "string" }
  },
  "required": ["name"]
}`}
                error={schemaParseError}
              />

              <div className="mt-4">
                <ValidationResults 
                  title="Schema"
                  result={schemaValidation}
                  isValidating={isValidating}
                />
              </div>
            </div>

            {/* Data Input */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">JSON Data</h2>
              </div>
              
              <JsonEditor
                label="Enter JSON data to validate against the schema"
                value={data}
                onChange={setData}
                highlightedLines={highlightedLines}
                placeholder={`{
  "name": "John Doe"
}`}
                error={dataParseError}
              />

              <div className="mt-4">
                <ValidationResults 
                  title="Data"
                  result={dataValidation}
                  isValidating={isValidating}
                  onErrorClick={handleErrorClick}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Built with AJV validator • Supports JSON Schema Draft 7 • 
            <a href="https://json-schema.org/draft-07/schema" className="text-blue-600 hover:text-blue-800 ml-1">
              View Draft 7 Specification
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
import { useCallback, useEffect, useState } from 'react';
import { findLineForPath } from './utils/jsonLineMapper';
import { generateShareableUrl, parseUrlParams, updateUrlParams } from './utils/urlParams';
import { parseJSON, validateData, validateSchema, ValidationError, ValidationResult } from './utils/validator';
import JsonEditor from './components/JsonEditor';

function App() {
  console.log('App: Component rendering...');
  
  const [schema, setSchema] = useState('');
  const [data, setData] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [schemaParseError, setSchemaParseError] = useState<string | undefined>();
  const [dataParseError, setDataParseError] = useState<string | undefined>();
  const [schemaValidation, setSchemaValidation] = useState<ValidationResult | null>(null);
  const [dataValidation, setDataValidation] = useState<ValidationResult | null>(null);
  const [highlightedLines, setHighlightedLines] = useState<number[]>([]);
  const [schemaHighlightedLines, setSchemaHighlightedLines] = useState<number[]>([]);

  console.log('App: State initialized');

  // Example schemas data
  const examples = [
    {
      name: 'eth_chainId',
      schema: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "jsonrpc": {
      "type": "string",
      "const": "2.0"
    },
    "id": {
      "type": "integer"
    },
    "result": {
      "type": "string",
      "pattern": "^0x[a-fA-F0-9]+$",
      "description": "Hex encoded chain ID"
    }
  },
  "required": ["jsonrpc", "id", "result"]
}`,
      data: `{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x1"
}`
    }
  ];

  // Initialize from URL parameters on component mount
  useEffect(() => {
    console.log('App: URL params effect running');
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
    console.log('App: URL update effect running, schema:', schema.length, 'data:', data.length);
    const timeoutId = setTimeout(() => {
      console.log('App: Updating URL params');
      updateUrlParams(schema, data);
    }, 1000); // 1 second debounce
    
    return () => clearTimeout(timeoutId);
  }, [schema, data]);

  // Manual validation function - accepts current values as parameters
  const validateAll = useCallback(async (currentSchema: string, currentData: string) => {
    console.log('App: validateAll called');
    if (!currentSchema.trim()) {
      console.log('App: No schema, clearing validation');
      setSchemaValidation(null);
      setDataValidation(null);
      return;
    }

    console.log('App: Starting validation');
    setIsValidating(true);
    
    try {
      // Parse and validate schema
      const schemaParse = parseJSON(currentSchema);
      if (!schemaParse.success) {
        setSchemaParseError(schemaParse.error);
        setSchemaValidation(null);
        setDataValidation(null);
        setIsValidating(false);
        return;
      }
      
      setSchemaParseError(undefined);
      const schemaResult = validateSchema(schemaParse.data as Record<string, unknown>);
      
      // Add line numbers to schema validation errors
      if (!schemaResult.valid) {
        console.log('App: Adding line numbers to schema errors');
        const errorsWithLines: ValidationError[] = schemaResult.errors.map(error => {
          const lineNumber = findLineForPath(currentSchema, error.path);
          return { ...error, lineNumber };
        });
        setSchemaValidation({ ...schemaResult, errors: errorsWithLines });
      } else {
        setSchemaValidation(schemaResult);
      }

      // Parse and validate data if provided
      if (currentData.trim()) {
        console.log('App: Parsing data');
        const dataParse = parseJSON(currentData);
        if (!dataParse.success) {
          setDataParseError(dataParse.error);
          setDataValidation(null);
          setIsValidating(false);
          return;
        }
        
        setDataParseError(undefined);
        const dataResult = validateData(schemaParse.data as Record<string, unknown>, dataParse.data);
        
        // Add line numbers to validation errors
        if (!dataResult.valid) {
          console.log('App: Adding line numbers to errors');
          const errorsWithLines: ValidationError[] = dataResult.errors.map(error => {
            const lineNumber = findLineForPath(currentData, error.path);
            return { ...error, lineNumber };
          });
          setDataValidation({ ...dataResult, errors: errorsWithLines });
        } else {
          setDataValidation(dataResult);
        }
        console.log('App: Data validation result:', dataResult.valid);
      } else {
        setDataValidation(null);
      }
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      console.log('App: Validation complete');
      setIsValidating(false);
    }
  }, []); // No dependencies - validation is now manual

  // Manual validation triggers
  const handleSchemaBlur = () => {
    console.log('App: Schema editor lost focus, triggering validation');
    validateAll(schema, data);
  };

  const handleDataBlur = () => {
    console.log('App: Data editor lost focus, triggering validation');
    validateAll(schema, data);
  };

  const handleShare = async () => {
    const shareableUrl = generateShareableUrl(schema, data);
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: show the URL for manual copying
      alert(`Copy this URL: ${shareableUrl}`);
    }
  };

  const handleSchemaSelect = (exampleSchema: string) => {
    try {
      const parsed = JSON.parse(exampleSchema);
      setSchema(JSON.stringify(parsed, null, 2));
    } catch {
      setSchema(exampleSchema);
    }
  };

  const handleDataSelect = (exampleData: string) => {
    try {
      const parsed = JSON.parse(exampleData);
      setData(JSON.stringify(parsed, null, 2));
    } catch {
      setData(exampleData);
    }
  };

  const handleErrorClick = (lineNumber: number) => {
    setHighlightedLines([lineNumber]);
    setTimeout(() => setHighlightedLines([]), 3000);
  };

  const handleSchemaErrorClick = (lineNumber: number) => {
    setSchemaHighlightedLines([lineNumber]);
    setTimeout(() => setSchemaHighlightedLines([]), 3000);
  };

  const hasContent = schema.trim() || data.trim();

  console.log('App: About to render');

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
            JSON Schema Validator
          </h1>
          <p style={{ color: '#6b7280', maxWidth: '600px', margin: '0 auto', marginBottom: '16px' }}>
            Validate JSON schemas against Draft 7 specification and test your data against custom schemas. 
            Get detailed error messages with exact locations for debugging.
          </p>
          {hasContent && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleShare}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: copied ? '#059669' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                title="Share current schema and data"
              >
                {copied ? '✓ Copied!' : '📤 Share'}
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '24px' }}>
          {/* Examples Sidebar */}
          <div>
            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '16px' }}>💻</span>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>Example Schemas</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleSchemaSelect(example.schema);
                      handleDataSelect(example.data);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#93c5fd';
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{example.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      Click to load this example
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Schema Input */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', padding: '24px' }}>
              <JsonEditor
                label="JSON Schema"
                value={schema}
                onChange={setSchema}
                onBlur={handleSchemaBlur}
                error={schemaParseError}
                highlightedLines={schemaHighlightedLines}
                placeholder={`{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "name": { "type": "string" }
  },
  "required": ["name"]
}`}
              />
              
              {/* Schema Validation Results */}
              <div style={{ marginTop: '16px' }}>
                {isValidating ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px' }}>
                    <div style={{ width: '16px', height: '16px', border: '2px solid #3b82f6', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <span style={{ fontSize: '14px', color: '#1e40af', fontWeight: '500' }}>Validating schema...</span>
                  </div>
                ) : schemaValidation ? (
                  <div style={{ 
                    padding: '12px', 
                    borderRadius: '6px', 
                    fontSize: '14px',
                    ...(schemaValidation.valid ? {
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      color: '#166534'
                    } : {
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626'
                    })
                  }}>
                    {schemaValidation.valid ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>✅</span>
                        <span style={{ fontWeight: '500' }}>Schema is valid ✓</span>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span>❌</span>
                          <span style={{ fontWeight: '500' }}>Schema validation failed</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {schemaValidation.errors.map((error, index) => (
                            <div 
                              key={index} 
                              style={{ 
                                padding: '8px', 
                                backgroundColor: 'white', 
                                border: '1px solid #fecaca', 
                                borderRadius: '4px',
                                cursor: error.lineNumber ? 'pointer' : 'default'
                              }}
                              onClick={() => error.lineNumber && handleSchemaErrorClick(error.lineNumber)}
                            >
                              <div style={{ fontSize: '12px', color: '#dc2626', marginBottom: '4px' }}>
                                <span style={{ backgroundColor: '#fef2f2', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                                  {error.keyword}
                                </span>
                                <span style={{ marginLeft: '8px' }}>Path: {error.path || 'root'}</span>
                                {error.lineNumber && (
                                  <span style={{ marginLeft: '8px', backgroundColor: '#dbeafe', padding: '2px 6px', borderRadius: '4px', color: '#1e40af' }}>
                                    Line {error.lineNumber}
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize: '13px', color: '#dc2626', margin: '4px 0' }}>{error.message}</p>
                              {error.lineNumber && (
                                <p style={{ fontSize: '11px', color: '#3b82f6', fontStyle: 'italic', margin: '4px 0 0 0' }}>
                                  Click to highlight line in editor
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Data Input */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', padding: '24px' }}>
              <JsonEditor
                label="JSON Data"
                value={data}
                onChange={setData}
                onBlur={handleDataBlur}
                error={dataParseError}
                highlightedLines={highlightedLines}
                placeholder={`{
  "name": "John Doe"
}`}
              />
              
              {/* Data Validation Results */}
              <div style={{ marginTop: '16px' }}>
                {isValidating ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px' }}>
                    <div style={{ width: '16px', height: '16px', border: '2px solid #3b82f6', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <span style={{ fontSize: '14px', color: '#1e40af', fontWeight: '500' }}>Validating data...</span>
                  </div>
                ) : dataValidation ? (
                  <div style={{ 
                    padding: '12px', 
                    borderRadius: '6px', 
                    fontSize: '14px',
                    ...(dataValidation.valid ? {
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      color: '#166534'
                    } : {
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626'
                    })
                  }}>
                    {dataValidation.valid ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>✅</span>
                        <span style={{ fontWeight: '500' }}>Data is valid ✓</span>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span>❌</span>
                          <span style={{ fontWeight: '500' }}>Data validation failed</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {dataValidation.errors.map((error, index) => (
                            <div 
                              key={index} 
                              style={{ 
                                padding: '8px', 
                                backgroundColor: 'white', 
                                border: '1px solid #fecaca', 
                                borderRadius: '4px',
                                cursor: error.lineNumber ? 'pointer' : 'default'
                              }}
                              onClick={() => error.lineNumber && handleErrorClick(error.lineNumber)}
                            >
                              <div style={{ fontSize: '12px', color: '#dc2626', marginBottom: '4px' }}>
                                <span style={{ backgroundColor: '#fef2f2', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                                  {error.keyword}
                                </span>
                                <span style={{ marginLeft: '8px' }}>Path: {error.path || 'root'}</span>
                                {error.lineNumber && (
                                  <span style={{ marginLeft: '8px', backgroundColor: '#dbeafe', padding: '2px 6px', borderRadius: '4px', color: '#1e40af' }}>
                                    Line {error.lineNumber}
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize: '13px', color: '#dc2626', margin: '4px 0' }}>{error.message}</p>
                              {error.lineNumber && (
                                <p style={{ fontSize: '11px', color: '#3b82f6', fontStyle: 'italic', margin: '4px 0 0 0' }}>
                                  Click to highlight line in editor
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
          <p>Built with AJV validator • Supports JSON Schema Draft 7 • 
            <a href="https://json-schema.org/draft-07/schema" style={{ color: '#2563eb', textDecoration: 'none', marginLeft: '4px' }}>
              View Draft 7 Specification
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
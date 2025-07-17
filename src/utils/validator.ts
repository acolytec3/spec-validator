import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Create AJV instance with Draft 7 support
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false,
  validateFormats: true,
  schemaId: '$id',
  loadSchema: undefined,
  addUsedSchema: false,
  validateSchema: true,
  inlineRefs: true,
  passContext: false,
  loopRequired: 100,
  ownProperties: false,
  multipleOfPrecision: 2,
  discriminator: false,
  unicodeRegExp: false,
  int32range: false,
  messages: true
});

// Add format validators
addFormats(ajv);

// Memory management: clear cache periodically to prevent memory leaks
let validationCount = 0;
const CACHE_CLEAR_THRESHOLD = 100; // Clear cache every 100 validations

function clearCacheIfNeeded() {
  validationCount++;
  if (validationCount >= CACHE_CLEAR_THRESHOLD) {
    ajv.removeSchema();
    validationCount = 0;
  }
}

export interface ValidationError {
  path: string;
  message: string;
  keyword: string;
  params?: Record<string, unknown>;
  schemaPath: string;
  data?: unknown;
  lineNumber?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateSchema(schema: Record<string, unknown>): ValidationResult {
  try {
    clearCacheIfNeeded(); // Clear cache if needed

    // Validate against JSON Schema Draft 7
    const isValid = ajv.validateSchema(schema);

    if (!isValid && ajv.errors) {
      const errors: ValidationError[] = ajv.errors.map(error => ({
        path: error.instancePath || error.schemaPath || 'root',
        message: error.message || 'Unknown error',
        keyword: error.keyword || 'unknown',
        params: error.params,
        schemaPath: error.schemaPath || '',
        data: error.data
      }));

      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  } catch (error) {
    return {
      valid: false,
      errors: [{
        path: 'root',
        message: error instanceof Error ? error.message : 'Failed to validate schema',
        keyword: 'schema',
        schemaPath: ''
      }]
    };
  }
}

export function validateData(schema: Record<string, unknown>, data: unknown): ValidationResult {
  try {
    clearCacheIfNeeded(); // Clear cache if needed

    // First validate the schema
    const schemaValidation = validateSchema(schema);
    if (!schemaValidation.valid) {
      return {
        valid: false,
        errors: schemaValidation.errors.map(error => ({
          ...error,
          message: `Schema error: ${error.message}`
        }))
      };
    }

    // Compile the schema
    const validate = ajv.compile(schema);

    // Validate the data
    const isValid = validate(data);

    if (!isValid && validate.errors) {
      const errors: ValidationError[] = validate.errors.map(error => ({
        path: error.instancePath || 'root',
        message: error.message || 'Unknown error',
        keyword: error.keyword || 'unknown',
        params: error.params,
        schemaPath: error.schemaPath || '',
        data: error.data
      }));

      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  } catch (error) {
    return {
      valid: false,
      errors: [{
        path: 'root',
        message: error instanceof Error ? error.message : 'Failed to validate data',
        keyword: 'validation',
        schemaPath: ''
      }]
    };
  }
}

export function parseJSON(jsonString: string): { success: boolean; data?: unknown; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid JSON'
    };
  }
}
export interface UrlParams {
  schema?: string;
  data?: string;
}

export function parseUrlParams(): UrlParams {
  const params: UrlParams = {};

  // Get the hash fragment (remove the # symbol)
  const hash = window.location.hash.substring(1);

  if (!hash) {
    return params;
  }

  try {
    // Parse the hash as URLSearchParams
    const urlParams = new URLSearchParams(hash);

    const schema = urlParams.get('schema');
    const data = urlParams.get('data');

    if (schema) {
      try {
        // Decode and parse the schema parameter
        params.schema = decodeURIComponent(schema);
      } catch (error) {
        console.warn('Failed to decode schema parameter:', error);
      }
    }

    if (data) {
      try {
        // Decode and parse the data parameter
        params.data = decodeURIComponent(data);
      } catch (error) {
        console.warn('Failed to decode data parameter:', error);
      }
    }
  } catch (error) {
    console.warn('Failed to parse hash parameters:', error);
  }

  return params;
}

export function updateUrlParams(schema: string, data: string) {
  const urlParams = new URLSearchParams();

  if (schema.trim()) {
    urlParams.set('schema', encodeURIComponent(schema));
  }

  if (data.trim()) {
    urlParams.set('data', encodeURIComponent(data));
  }

  // Create the hash fragment
  const hash = urlParams.toString();
  const newHash = hash ? `#${hash}` : '';

  // Update URL hash without page reload
  window.history.replaceState({}, '', window.location.pathname + newHash);
}

export function generateShareableUrl(schema: string, data: string): string {
  const urlParams = new URLSearchParams();

  if (schema.trim()) {
    urlParams.set('schema', encodeURIComponent(schema));
  }

  if (data.trim()) {
    urlParams.set('data', encodeURIComponent(data));
  }

  const hash = urlParams.toString();
  const baseUrl = window.location.origin + window.location.pathname;

  return hash ? `${baseUrl}#${hash}` : baseUrl;
}
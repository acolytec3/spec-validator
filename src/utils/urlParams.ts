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
        // Parse the compact JSON and pretty-print it
        const parsed = JSON.parse(schema);
        params.schema = JSON.stringify(parsed, null, 2);
      } catch (error) {
        console.warn('Failed to parse schema parameter:', error);
      }
    }

    if (data) {
      try {
        // Parse the compact JSON and pretty-print it
        const parsed = JSON.parse(data);
        params.data = JSON.stringify(parsed, null, 2);
      } catch (error) {
        console.warn('Failed to parse data parameter:', error);
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
    try {
      // Parse the pretty-printed JSON and compact it for storage
      const parsed = JSON.parse(schema);
      urlParams.set('schema', JSON.stringify(parsed));
    } catch (error) {
      console.warn('Failed to parse schema for URL storage:', error);
    }
  }

  if (data.trim()) {
    try {
      // Parse the pretty-printed JSON and compact it for storage
      const parsed = JSON.parse(data);
      urlParams.set('data', JSON.stringify(parsed));
    } catch (error) {
      console.warn('Failed to parse data for URL storage:', error);
    }
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
    try {
      // Parse the pretty-printed JSON and compact it for storage
      const parsed = JSON.parse(schema);
      urlParams.set('schema', JSON.stringify(parsed));
    } catch (error) {
      console.warn('Failed to parse schema for URL generation:', error);
    }
  }

  if (data.trim()) {
    try {
      // Parse the pretty-printed JSON and compact it for storage
      const parsed = JSON.parse(data);
      urlParams.set('data', JSON.stringify(parsed));
    } catch (error) {
      console.warn('Failed to parse data for URL generation:', error);
    }
  }

  const hash = urlParams.toString();
  const baseUrl = window.location.origin + window.location.pathname;

  return hash ? `${baseUrl}#${hash}` : baseUrl;
}
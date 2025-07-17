export interface UrlParams {
  schema?: string;
  data?: string;
}

export function parseUrlParams(): UrlParams {
  const urlParams = new URLSearchParams(window.location.search);
  const params: UrlParams = {};

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

  return params;
}

export function updateUrlParams(schema: string, data: string) {
  const url = new URL(window.location.href);
  
  if (schema.trim()) {
    url.searchParams.set('schema', encodeURIComponent(schema));
  } else {
    url.searchParams.delete('schema');
  }

  if (data.trim()) {
    url.searchParams.set('data', encodeURIComponent(data));
  } else {
    url.searchParams.delete('data');
  }

  // Update URL without page reload
  window.history.replaceState({}, '', url.toString());
}

export function generateShareableUrl(schema: string, data: string): string {
  const url = new URL(window.location.origin + window.location.pathname);
  
  if (schema.trim()) {
    url.searchParams.set('schema', encodeURIComponent(schema));
  }

  if (data.trim()) {
    url.searchParams.set('data', encodeURIComponent(data));
  }

  return url.toString();
}
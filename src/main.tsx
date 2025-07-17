import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('main.tsx: Starting React app...');

const rootElement = document.getElementById('root');
console.log('main.tsx: Root element:', rootElement);

if (!rootElement) {
  throw new Error('Root element not found');
}

try {
  const root = createRoot(rootElement);
  console.log('main.tsx: React root created');
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('main.tsx: React app rendered');
} catch (error) {
  console.error('main.tsx: Error rendering React app:', error);
}

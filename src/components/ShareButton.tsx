import React, { useState, useEffect, useRef } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { generateShareableUrl } from '../utils/urlParams';

interface ShareButtonProps {
  schema: string;
  data: string;
}

export default function ShareButton({ schema, data }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const copiedTimeoutRef = useRef<number | null>(null);
  const showUrlTimeoutRef = useRef<number | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
      if (showUrlTimeoutRef.current) {
        clearTimeout(showUrlTimeoutRef.current);
      }
    };
  }, []);

  const handleShare = async () => {
    const shareableUrl = generateShareableUrl(schema, data);
    
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      // Clear any existing timeout
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: show the URL for manual copying
      setShowUrl(true);
      // Clear any existing timeout
      if (showUrlTimeoutRef.current) {
        clearTimeout(showUrlTimeoutRef.current);
      }
      showUrlTimeoutRef.current = setTimeout(() => setShowUrl(false), 5000);
    }
  };

  const shareableUrl = generateShareableUrl(schema, data);
  const hasContent = schema.trim() || data.trim();

  if (!hasContent) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        title="Share current schema and data"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </>
        )}
      </button>

      {showUrl && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-10">
          <div className="flex items-center space-x-2 mb-2">
            <Copy className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Copy this URL:</span>
          </div>
          <div className="bg-gray-50 p-2 rounded border text-xs font-mono break-all select-all">
            {shareableUrl}
          </div>
        </div>
      )}
    </div>
  );
}
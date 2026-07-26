// components/ShareBar.tsx
//
// Generic share buttons — X, WhatsApp, Facebook, and copy-link. If your
// existing WordPress-powered pages already have a share bar component you'd
// rather match the look of, send me that file and I'll restyle this one to match.
'use client';

import { useState } from 'react';

export default function ShareBar({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="my-6 flex items-center gap-3 border-y border-gray-200 py-3">
      <span className="text-sm font-medium text-gray-500">Share:</span>
      
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium hover:bg-gray-200"
      >
        X
      </a>
      
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium hover:bg-gray-200"
      >
        WhatsApp
      </a>
      
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium hover:bg-gray-200"
      >
        Facebook
      </a>
      <button
        onClick={copyLink}
        className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium hover:bg-gray-200"
      >
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  );
}

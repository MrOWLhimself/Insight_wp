// components/Gallery.tsx
//
// Renders a grid of images; clicking one opens it full-size in a lightbox
// overlay. Needs 'use client' since it uses onClick and state — the page
// that renders this can stay a server component.
'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((imgUrl, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer"
          >
            <Image src={imgUrl} alt={`${title} — photo ${i + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            className="absolute right-4 top-4 text-3xl text-white"
            aria-label="Close"
          >
            ×
          </button>

          {openIndex > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpenIndex(openIndex - 1); }}
              className="absolute left-4 text-4xl text-white"
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          <div className="relative h-[80vh] w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[openIndex]}
              alt={`${title} — photo ${openIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {openIndex < images.length - 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpenIndex(openIndex + 1); }}
              className="absolute right-4 text-4xl text-white"
              aria-label="Next image"
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}

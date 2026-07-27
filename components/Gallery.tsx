// components/Gallery.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

type GalleryItem = string | { url: string; caption?: string };

function normalize(item: GalleryItem): { url: string; caption?: string } {
  return typeof item === 'string' ? { url: item } : item;
}

export default function Gallery({ images, title }: { images: GalleryItem[]; title: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = images.map(normalize);

  return (
    <>
      <div className="flex flex-col gap-8">
        {items.map((item, i) => (
          <figure key={i} className="w-full">
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              className="relative block w-full overflow-hidden rounded-lg bg-gray-100 cursor-pointer"
              style={{ aspectRatio: '4 / 5' }}
            >
              <Image src={item.url} alt={item.caption || `${title} - photo ${i + 1}`} fill className="object-cover" />
            </button>
            {item.caption && (
              <figcaption className="mt-2 text-xs text-gray-500 italic">{item.caption}</figcaption>
            )}
          </figure>
        ))}
      </div>

      {openIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setOpenIndex(null)}>
          <button type="button" onClick={() => setOpenIndex(null)} className="absolute right-4 top-4 text-3xl text-white" aria-label="Close">&times;</button>

          {openIndex > 0 && (
            <button type="button" onClick={(e) => { e.stopPropagation(); setOpenIndex(openIndex - 1); }} className="absolute left-4 text-4xl text-white" aria-label="Previous image">&lsaquo;</button>
          )}

          <div className="relative h-[80vh] w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <Image src={items[openIndex].url} alt={items[openIndex].caption || `${title} - photo ${openIndex + 1}`} fill className="object-contain" />
          </div>

          {openIndex < items.length - 1 && (
            <button type="button" onClick={(e) => { e.stopPropagation(); setOpenIndex(openIndex + 1); }} className="absolute right-4 text-4xl text-white" aria-label="Next image">&rsaquo;</button>
          )}
        </div>
      )}
    </>
  );
}
